import React from 'react'
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';

export default class Submission extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            submission: {}
        }
    }
    componentDidMount() {
        const makeAuthorizedRequest = this.props.makeAuthorizedRequest;
        const { id } = this.props.props.match.params
        const fetchData = async () => {
            await makeAuthorizedRequest(() => {
                return fetch(`/api/v1.0/submission?id=${id}`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    }
                });
            }).then(result => {
                console.log(result)
                this.setState({
                    submission: result
                })
            },
            )
        };
        const fetchInfo = async () => {
            await makeAuthorizedRequest(() => {
                return fetch(`/api/v1.0/userinfo?user=${this.props.user.name}`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    }
                });
            }).then(result => {
                this.setState({
                    userinfo: result
                })
            },
            )
        };

        fetchData().then(() => {
            fetchInfo();
        })
    }
    statusCodeToText = (code) => {
        if (code === 1) {
            return 'В очереди'
        }
        else if (code === 2) {
            return 'Выполняется тестирование'
        }
        else if (code === 3) {
            return 'Неправильный ответ'
        }
        else if (code === 4) {
            return 'Успешное тестирование'
        }
        else {
            return code
        }
    }
    render() {

        console.log(this.props)
        console.log(this.state)
        return (

            < div >
                {this.state.userinfo && !(this.state.userinfo[0].id_role === 2 || this.state.userinfo[0].id_role === 3 || this.state.submission.username === this.props.user.name) &&
                    <p>Нет доступа</p>
                }
                {this.state.userinfo && (this.state.userinfo[0].id_role === 2 || this.state.userinfo[0].id_role === 3 || this.state.submission.username === this.props.user.name) &&
                    <div>
                        <h1>Посылка № {this.state.submission.id} от {this.state.submission.time}</h1>
                        <p>Задача: {this.state.submission.taskId} - {this.state.submission.title}</p>
                        <p>Пользователь: {this.state.submission.username}</p>
                        <p>Статус тестирования: {this.statusCodeToText(this.state.submission.status)}</p>
                        <p align="center">
                            Исходный код:
                </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',

                        }}>

                            <AceEditor
                                mode="c_cpp"
                                theme="monokai"
                                name="UNIQUE_ID_OF_DIV"
                                editorProps={{ $blockScrolling: true }}
                                value={this.state.submission.code}
                                width="900px"
                                height="500px"
                                fontSize="14px"
                                readOnly='true'
                                setOptions={{
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                    enableSnippets: true
                                }}
                            />
                        </div>
                    </div>
                }

            </div >

        )
    }
}