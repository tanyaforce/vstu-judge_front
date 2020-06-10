import React from 'react'
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';

export default class Submit extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            task: {},
            code: "",
            submitting: false,
            userinfo: {}
        }
    }
    componentDidMount() {
        const makeAuthorizedRequest = this.props.makeAuthorizedRequest;
        const { taskId } = this.props.props.match.params
        const fetchData = async () => {
            await makeAuthorizedRequest(() => {
                return fetch(`/api/v1.0/task/${taskId}`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    }
                });
            }).then(result => {
                this.setState({
                    task: result
                })
            },
            )
        };
        
       

        
        fetchData();
    }
    submit = async () => {
        const { taskId } = this.props.props.match.params
        let task_judge_id = taskId === '1' ? '572709f8d12a816dfbde7a8b' : '58d6cf227d4e5c53dd820d11' 


        const { name } = this.props.user
        const makeAuthorizedRequest = this.props.makeAuthorizedRequest;
        const submitThis = async () => {
            await makeAuthorizedRequest(() => {
                return fetch(`/api/v1.0/sendsubmission`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`,
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({ "idTask": taskId, "username": name, "code": this.state.code, "language": 'GNU GCC C11 5.1.0', "task_judge_id": task_judge_id})
                });
            }).then(result => {

            },
            )
        };
        if (this.state.code.length !== 0) {
            this.setState({
                submitting: true,
            })
            submitThis();
        }
    }

    onChange = (newValue) => {
        this.setState({
            code: newValue,
        })
    }

    render() {
        console.log(this.state)
        const { name } = this.state.task
        return (
            <div>
                <h1>Отправить задачу {name}</h1>
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column'
                }}>
                    <label style={{margin: '5px 0px'}} for="sel">Выбрать язык</label>
                    <select style={{margin: '10px 0px'}} id="sel">
                    <option value="GNU GCC C11 5.1.0">GNU GCC C11 5.1.0</option>
                </select>
                    <AceEditor
                        mode="c_cpp"
                        theme="monokai"
                        name="UNIQUE_ID_OF_DIV"
                        editorProps={{ $blockScrolling: true }}
                        onChange={this.onChange}
                        value={this.state.code}
                        width="900px"
                        height="500px"
                        fontSize="14px"
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true
                        }}
                    />
                </div>
                {!this.state.code.length &&
                    <p align="center">Введите код!</p>
                }
                {!this.state.submitting &&
                    <button
                        onClick={this.submit}
                        style={{

                            display: 'block',
                            padding: '20px',
                            textDecoration: 'none',
                            color: '#fff',
                            backgroundColor: '#b21b22',
                            width: '200px',
                            margin: '0 auto',
                            position: 'relative',
                            top: '30px',
                            textAlign: 'center',
                            cursor: 'pointer'
                        }} href="../../submit/1">Отправить решение</button>
                }
                {this.state.submitting &&
                    <p align="center">Решение отправлено на проверку!</p>
                }
            </div>

        )
    }
}