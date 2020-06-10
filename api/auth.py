from config import *
from simplech import ClickHouse
import mysql.connector

from functools import wraps
from flask_jwt_extended import get_jwt_claims


#clickhouse_client = ClickHouse(host=CLICKHOUSE_server, user=CLICKHOUSE_username,
#                               password=CLICKHOUSE_password, port=CLICKHOUSE_port, db=CLICKHOUSE_database)


def get_password(username):
    
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT * FROM User WHERE name=%(name)s", {'name':username})
    userinfo = cur.fetchone()
    session.close()

    if userinfo:
        return userinfo['password']
    return 'none'

def is_user_active(identity):
    print(identity)
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT * FROM `User` WHERE name='{}'".format(str(identity)))
    res = cur.fetchone()
    print(res)
    session.close()
    if(res == None):
        return False
    return bool(res['active'])

def add_jti_to_blacklist(jti):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("INSERT INTO RevokedTokens SET jti=%(jti)s", {'jti':jti})
    session.commit()
    session.close()

def is_jti_blacklisted(jti):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT * FROM RevokedTokens WHERE jti=%(jti)s", {'jti':jti})
    res = cur.fetchone()
    session.close()

    if res:
        return True
    return False

def revoke_old_refresh_tokens(identity):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT * FROM RefreshTokens WHERE identity=%(identity)s", {'identity':identity})
    for result in cur.fetchall():
        cur.execute("DELETE FROM RefreshTokens WHERE id=%(id)s", {'id':result['id']})
        cur.execute("INSERT INTO RevokedTokens SET jti=%(jti)s", {'jti':result['jti']})
    session.commit()
    session.close()

def add_refresh_token(identity, jti):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("INSERT INTO RefreshTokens SET jti=%(jti)s, identity=%(identity)s", {'jti':jti, 'identity':identity})
    session.commit()
    session.close()

def get_user_role(identity):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT * FROM User WHERE name=%(name)s", {'name':identity})
    res = cur.fetchone()
    session.close()
    return res['id_role']

def get_user_full_name(identity):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT * FROM User WHERE name=%(name)s", {'name':identity})
    res = cur.fetchone()
    session.close()
    return res['full_name']

def check_permissions_for_module(role_id, module):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT * FROM ModuleByRole INNER JOIN Module on Module.id=ModuleByRole.id_module "
        "WHERE id_role=%(role_id)s AND Module.name=%(module)s", {'role_id':role_id, 'module':module})
    res = cur.fetchone()
    session.close()
    if res:
        return True
    return False

def get_allowed_modules(role_id):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT Module.name FROM ModuleByRole INNER JOIN Module on Module.id=ModuleByRole.id_module "
        "WHERE id_role=%(role_id)s", {'role_id':role_id})
    res = cur.fetchall()
    session.close()
    return [it['name'] for it in res]


def create_user(username, password, id_role, full_name = None, group = None):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("INSERT INTO User SET name=%(name)s, password=%(password)s, id_role=%(id_role)s, full_name=%(full_name)s, groupname=%(group)s", {'name':username, 'password':password, 'id_role': id_role, 'full_name': full_name, 'group': group})
    session.commit()
    session.close()

def get_roles():
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("SELECT * FROM Role WHERE 1")
    res = cur.fetchall()
    session.close()
    return(res)

def change_password(username, password):
    session = mysql.connector.connect(**MYSQL_SESSION, database="YourHelper")
    cur = session.cursor(dictionary=True)
    cur.execute("UPDATE User SET password=%(password)s WHERE name=%(username)s", {'username':username, 'password':password})
    session.commit()
    session.close()




#-----------------------------DECORATORS------------------------------

def permissions_required(module_name):
    def actual_decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            claims = get_jwt_claims()
            role = claims['role']
            if check_permissions_for_module(role, module_name):
                return func(*args, **kwargs)
            else:
                return make_response(jsonify({'error': 'Not enough permissions'}), 403)
        return wrapper
    return actual_decorator
