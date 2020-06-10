from config import *
import helpers
from auth import *
import datetime
import json
from flask_restful import reqparse
from flask import Flask, jsonify, make_response, request
from flask_httpauth import HTTPBasicAuth
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity, get_raw_jwt, get_jti)
from requests import post, get


from simplech import ClickHouse

app = Flask(__name__)
app.config['DEBUG'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(10)
jwt = JWTManager(app)
auth = HTTPBasicAuth()
clickhouse_client = ClickHouse(host=CLICKHOUSE_server, user=CLICKHOUSE_username,
                               password=CLICKHOUSE_password, port=CLICKHOUSE_port, db=CLICKHOUSE_database)


@auth.verify_password
def verify_password(username, password):
    return check_password_hash(get_password(username), password)


@jwt.user_claims_loader
def add_claims_to_access_token(identity):
    return {
        'role': get_user_role(identity),
    }


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found', 'message': 'Page wasnt found'}), 404)


@app.route('/api/v1.0/corporate/transactions', methods=['GET'])
@jwt_required
@permissions_required('corporate')
def get_promocode_transactions():
    time_start, time_end = helpers.get_time_arguments(reqparse.RequestParser())
    if(time_start != None and time_end != None):
        transactions = list(clickhouse_client.objects_stream(
            "SELECT PromocodeID, * FROM YourHelper.CorporateTransactions LEFT JOIN (SELECT ID as PromocodeID, Promocode FROM YourHelper.Promocodes) USING PromocodeID WHERE DueDate BETWEEN '{}' AND '{}'".format(time_start, time_end)))
        return jsonify(transactions)
    else:
        return make_response(jsonify({'error': 'Incorrect arguments'}), 404)


@app.route('/api/v1.0/corporate', methods=['GET'])
@jwt_required
@permissions_required('corporate')
def get_promocodes():
    time_start, time_end = helpers.get_time_arguments(reqparse.RequestParser())
    if(time_start != None and time_end != None):
        promocodes = list(clickhouse_client.objects_stream(
            "SELECT * FROM YourHelper.Promocodes WHERE CreateDate BETWEEN '{}' AND '{}'".format(time_start, time_end)))
        return jsonify(promocodes)
    else:
        return make_response(jsonify({'error': 'Incorrect arguments'}), 404)


@app.route('/api/v1.0/corporate/<int:corporate_id>', methods=['GET'])
@jwt_required
@permissions_required('corporate')
def get_promocode(corporate_id):
    promocode = list(clickhouse_client.objects_stream(
        'SELECT * FROM YourHelper.Promocodes WHERE ID={}'.format(corporate_id)))
    return jsonify(promocode)


@app.route('/api/v1.0/cardspool', methods=['GET'])
@jwt_required
@permissions_required('cardspool')
def get_cardspool():
    parser = reqparse.RequestParser()
    parser.add_argument('phonenumber', type=int)
    phonenumber = str(parser.parse_args()['phonenumber']) if parser.parse_args()[
        'phonenumber'] else ''
    cardspool = list(clickhouse_client.objects_stream(
        "SELECT * FROM YourHelper.Exchange WHERE like(lowerUTF8(PhoneNumber), '%{}%')".format(phonenumber)))
    return jsonify(cardspool)


@app.route('/api/v1.0/login', methods=['POST'])
def login():
    _json = request.json
    if(_json):
        _username = _json['username']
        _password = _json['password']
    else:
        _username = None
        _password = None
    if _username and _password:
        if not is_user_active(_username):
            resp = jsonify({
                'status': 'bad',
                'message': 'Bad Request - user is not active'
            })
            resp.status_code = 401
            return resp
        if verify_password(_username, _password):
            revoke_old_refresh_tokens(_username)
            access_token = create_access_token(identity=_username)
            refresh_token = create_refresh_token(identity=_username)
            add_refresh_token(_username, get_jti(refresh_token))
            return jsonify({
                'status': 'ok',
                'message': 'You are logged in successfully',
                'access_token': access_token,
                'refresh_token': refresh_token,
                'username': _username,
                'full_name': get_user_full_name(_username),
                'modules': get_allowed_modules(get_user_role(_username))
            })
        else:
            resp = jsonify({
                'status': 'bad',
                'message': 'Bad Request - invalid password'
            })
            resp.status_code = 400
            return resp
    else:
        resp = jsonify({
            'status': 'bad',
            'message': 'Bad Request - invalid credendtials'
        })
        resp.status_code = 400
        return resp


@app.route('/api/v1.0/profile', methods=['GET'])
@jwt_required
def getUserByJWT():
    user = get_jwt_identity()
    if not is_user_active(user):
        resp = jsonify({
            'status': 'bad',
            'message': 'Bad Request - user is not active'
        })
        resp.status_code = 401
        return resp
    try:
        return jsonify({
            'username': user,
            'full_name': get_user_full_name(user),
            'modules': get_allowed_modules(get_user_role(user))
        })
    except:
        return {'message': 'Something went wrong'}, 500


@app.route('/api/v1.0/logout/access', methods=['POST'])
@jwt_required
def tokenRevokeAccess():
    jti = get_raw_jwt()['jti']
    try:
        add_jti_to_blacklist(jti)
        return {'message': 'Access token has been revoked'}
    except:
        return {'message': 'Something went wrong'}, 500


@app.route('/api/v1.0/logout/refresh', methods=['POST'])
@jwt_refresh_token_required
def tokenRevokeRefresh():
    jti = get_raw_jwt()['jti']
    try:
        add_jti_to_blacklist(jti)
        return {'message': 'Refresh token has been revoked'}
    except:
        return {'message': 'Something went wrong'}, 500


@app.route('/api/v1.0/token/refresh', methods=['POST'])
@jwt_refresh_token_required
def tokenRefresh():
    current_user = get_jwt_identity()
    revoke_old_refresh_tokens(current_user)
    if not is_user_active(current_user):
        resp = jsonify({
            'status': 'bad',
            'message': 'Bad Request - user is not active'
        })
        resp.status_code = 401
        return resp
    access_token = create_access_token(identity=current_user)
    refresh_token = create_refresh_token(identity=current_user)
    add_refresh_token(current_user, get_jti(refresh_token))
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
    }


@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    jti = decrypted_token['jti']
    return is_jti_blacklisted(jti)


@app.route('/api/v1.0/getClick', methods=['GET'])
def getClick():
    parser = reqparse.RequestParser()
    parser.add_argument('q', type=str)
    query = str(parser.parse_args()['q'])
    qResult = list(clickhouse_client.objects_stream(
        query))
    return jsonify(qResult)

# ----------------------------------COURIER-MAP--------------------------------------


@app.route('/api/v1.0/courier-map/orders', methods=['GET'])
@jwt_required
def getCourierMapOrders():
    try:
        orders = get_orders()
        return jsonify([{
            'id': it['id'],
            'number': it['number'],
            'address': it['address'],
            'district': it['district'],
            'price': it['price'],
            'latitude': it['latitude'],
            'longitude': it['longitude'],
            'delivery_date': it['delivery_date'],
            'visibility': bool(it['visibility']),
            'has_address': bool(it['has_address'])
        } for it in orders])
    except:
        return {'message': 'Something went wrong'}, 500


@app.route('/api/v1.0/courier-map/order-visibility', methods=['POST'])
@jwt_required
def changeOrderVisibility():
    _json = request.json
    if(_json):
        _id = _json['id']
        _visibility = _json['visibility']
    else:
        _id = None
        _visibility = None
    if _id != None and _visibility != None:
        try:
            change_order_visibility(_id, _visibility)
            return jsonify({
                'status': 'ok',
            })
        except:
            resp = jsonify({
                'status': 'bad',
                'message': 'Bad Request - cant change visibility'
            })
            resp.status_code = 400
            return resp
    else:
        resp = jsonify({
            'status': 'bad',
            'message': 'Bad Request - invalid parameters'
        })
        resp.status_code = 400
        return resp


# ----------------------------------QUIZ---------------------------------------

@app.route('/api/v1.0/quiz/', methods=['GET'])
@jwt_required
def get_tests():
    try:
        return jsonify(get_tests_list())
    except:
        return {'message': 'Something went wrong'}, 500


@app.route('/api/v1.0/quiz/start', methods=['POST'])
@jwt_required
def startTest():
    user = get_jwt_identity()
    _json = request.json
    if(_json):
        _test_id = _json['test_id']
    else:
        _test_id = None
    if _test_id != None:
        try:
            return jsonify(beginTestForUser(user, _test_id))
        except:
            resp = jsonify({
                'status': 'bad',
                'message': 'Bad Request - cant start test'
            })
            resp.status_code = 400
            return resp
    else:
        resp = jsonify({
            'status': 'bad',
            'message': 'Bad Request - invalid parameters'
        })
        resp.status_code = 400
        return resp


@app.route('/api/v1.0/quiz/update-results', methods=['POST'])
@jwt_required
def updateUserResults():
    user = get_jwt_identity()
    _json = request.json
    if(_json):
        _results = _json['results']
        _test_id = _json['test_id']
    else:
        _results = None
        _test_id = None
    if _results != None and _test_id != None:
        try:
            updateUserResultsForTest(user, _test_id, _results)
            return jsonify({
                'status': 'ok',
            })
        except:
            resp = jsonify({
                'status': 'bad',
                'message': 'Bad Request - cant update results'
            })
            resp.status_code = 400
            return resp
    else:
        resp = jsonify({
            'status': 'bad',
            'message': 'Bad Request - invalid parameters'
        })
        resp.status_code = 400
        return resp


@app.route('/api/v1.0/quiz/finish', methods=['POST'])
@jwt_required
def endTest():
    user = get_jwt_identity()
    _json = request.json
    if(_json):
        _results = _json['results']
        _test_id = _json['test_id']
    else:
        _results = None
        _test_id = None
    if _results != None and _test_id != None:
        try:
            endTestForUser(user, _test_id, _results)
            return jsonify({
                'status': 'ok',
            })
        except:
            resp = jsonify({
                'status': 'bad',
                'message': 'Bad Request - cant end test'
            })
            resp.status_code = 400
            return resp
    else:
        resp = jsonify({
            'status': 'bad',
            'message': 'Bad Request - invalid parameters'
        })
        resp.status_code = 400
        return resp


@app.route('/api/v1.0/quiz/results', methods=['GET'])
@jwt_required
def get_quiz_results():
    try:
        return jsonify(get_results_list())
    except:
        return {'message': 'Something went wrong'}, 500


@app.route('/api/v1.0/quiz/results/<int:result_id>', methods=['GET'])
@jwt_required
def get_result(result_id):
    try:
        return jsonify(get_result_details(result_id))
    except:
        return {'message': 'Something went wrong'}, 500


# ----------------------------------ADMIN-PANEL--------------------------------------

@app.route('/api/v1.0/adminpanel/roles', methods=['GET'])
@jwt_required
def get_all_roles():
    try:
        return jsonify(get_roles())
    except:
        return {'message': 'Something went wrong'}, 500


@app.route('/api/v1.0/adminpanel/createuser', methods=['POST'])
@jwt_required
def create_new_user():
    _json = request.json
    if(_json):
        _username = _json['username']
        _password = _json['password']
        _role_id = _json['role_id']
        _full_name = _json['full_name']
        _group = _json['group']
    else:
        _username = None
        _password = None
        _role_id = None
        _full_name = None
        _group = None
    if _username != None and _password != None and _role_id != None:
        try:
            create_user(_username, generate_password_hash(
                _password), _role_id, _full_name, _group)
            return jsonify({
                'status': 'ok',
            })
        except:
            resp = jsonify({
                'status': 'bad',
                'message': 'Bad Request - cant create user with this username'
            })
            resp.status_code = 400
            return resp
    else:
        resp = jsonify({
            'status': 'bad',
            'message': 'Bad Request - invalid parameters'
        })
        resp.status_code = 400
        return resp


@app.route('/api/v1.0/adminpanel/changepassword', methods=['POST'])
@jwt_required
def change_user_password():
    _json = request.json
    if(_json):
        _username = _json['username']
        _password = _json['password']
    else:
        _username = None
        _password = None
    if _username != None and _password != None:
        try:
            change_password(_username, generate_password_hash(_password))
            return jsonify({
                'status': 'ok',
            })
        except:
            resp = jsonify({
                'status': 'bad',
                'message': 'Bad Request - cant change password for this user'
            })
            resp.status_code = 400
            return resp
    else:
        resp = jsonify({
            'status': 'bad',
            'message': 'Bad Request - invalid parameters'
        })
        resp.status_code = 400
        return resp


# NEW
@app.route('/api/v1.0/tasks', methods=['GET'])
@jwt_required
@permissions_required('tasks')
def get_all_tasks():
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT * FROM Tasks")
    res = cur.fetchall()
    session.close()

    print(res)
    return json.dumps(res)


@app.route('/api/v1.0/task/<int:task_id>', methods=['GET'])
@jwt_required
@permissions_required('tasks')
def get_task(task_id):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT * FROM Tasks WHERE id={}".format(task_id))
    res = cur.fetchone()
    session.close()
    print(res)
    return json.dumps(res)


@app.route('/api/v1.0/sendsubmission', methods=['POST'])
@jwt_required
@permissions_required('tasks')
def sendSubmisson():
    body = request.json
    print(body)
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    username = body['username']
    code = body['code']
    taskId = body['idTask']
    lang = body['language']
    task_judge_id = body['task_judge_id']
    # task_judge_id='1'
    cur.execute("INSERT INTO `Submissons` (`id`, `username`, `status`, `time`, `code`, `taskId`, `language`, `task_judge_id`) VALUES (NULL, '{}', '1', CURRENT_TIMESTAMP, '{}', '{}', '{}', '{}');".format(
        username, code, taskId, lang, task_judge_id))
    session.commit()
    cur.execute("SELECT * FROM `Submissons` ORDER BY id DESC")
    res = cur.fetchone()
    idSub = res['id']

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    resTest = post('http://localhost:7070/submit', headers=headers, data={
                   'id': task_judge_id, 'submission': code, 'submission_id': idSub})
    print(resTest)

    return {'ok': 'true'}


def checkStatusSubmission(res):
    print(res)
    if(res == None):
        return 1
    status = 'Тестирование'
    if('results' not in res and res['status'] == 'failed'):
        return 'Ошибка запуска'
    cnt = 0
    print(res)
    for idx, it in enumerate(res['results']):
        if(it == 'failed'):
            return 'Неправильный ответ на тесте ' + str(idx + 1)
        if(it == 'passed'):
            cnt += 1

    if(cnt == len(res['results']) and res['status'] == 'finished'):
        return 'Успешное тестирование'

    return 'Тестирование'


@app.route('/api/v1.0/mysubmissions', methods=['GET'])
@jwt_required
@permissions_required('mysubmissions')
def get_user_submissions():
    parser = reqparse.RequestParser()
    parser.add_argument('user', type=str)
    args = parser.parse_args()
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute(
        "SELECT Submissons.id,Submissons.time,Submissons.username,Submissons.status,Submissons.code,Submissons.taskId, Tasks.title  FROM `Submissons`,`Tasks` WHERE Submissons.taskId=Tasks.id AND Submissons.username='{}'  ORDER BY time DESC ".format(args['user']))
    res = cur.fetchall()

    print(res)
    for it in res:
        it['time'] = datetime.datetime.strftime(it['time'], "%Y-%m-%d %H:%M")
        response = get('http://localhost:7070/submissions/{}'.format(it['id']))
        tmp = it['status']
        it['status'] = checkStatusSubmission(response.json())
        if(it['status'] == 1):
            it['status'] = tmp
        if(it['status'] != 1):
            cur.execute("UPDATE `Submissons` SET `status` = '{}' WHERE `Submissons`.`id` = '{}';".format(
                it['status'], it['id']))
            session.commit()
    session.close()

    return json.dumps(res)

@app.route('/api/v1.0/userinfo', methods=['GET'])
@jwt_required
@permissions_required('mysubmissions')
def get_user_info():
    parser = reqparse.RequestParser()
    parser.add_argument('user', type=str)
    args = parser.parse_args()
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute(
        "SELECT * FROM `User` WHERE `name`='{}'".format(args['user']))
    res = cur.fetchall()

    print(res)

    return json.dumps(res)


@app.route('/api/v1.0/submission', methods=['GET'])
@jwt_required
@permissions_required('mysubmissions')
def get_submission_code():
    parser = reqparse.RequestParser()
    parser.add_argument('id', type=str)
    args = parser.parse_args()
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute(
        "SELECT Submissons.id,Submissons.time,Submissons.username,Submissons.status,Submissons.code,Submissons.taskId, Tasks.title  FROM `Submissons`,`Tasks` WHERE Submissons.taskId=Tasks.id AND Submissons.id='{}'  ORDER BY time DESC ".format(args['id']))
    res = cur.fetchone()

    session.close()
    print(res)

    res['time'] = datetime.datetime.strftime(res['time'], "%Y-%m-%d %H:%M")

    response = get('http://localhost:7070/submissions/{}'.format(res['id']))
    tmp = res['status']
    res['status'] = checkStatusSubmission(response.json())
    if(res['status'] == 1):
        res['status'] = tmp

    return json.dumps(res)


@app.route('/api/v1.0/submissions', methods=['GET'])
@jwt_required
@permissions_required('allsubmissions')
def get_all_submission():
    parser = reqparse.RequestParser()
    parser.add_argument('user', type=str)
    args = parser.parse_args()
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute(
        "SELECT Submissons.id,Submissons.time,Submissons.username,Submissons.status,Submissons.code,Submissons.taskId, Tasks.title  FROM `Submissons`,`Tasks` WHERE Submissons.taskId=Tasks.id ORDER BY time DESC ")
    res = cur.fetchall()
    session.close()
    print(res)
    for it in res:
        it['time'] = datetime.datetime.strftime(it['time'], "%Y-%m-%d %H:%M")
    return json.dumps(res)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
