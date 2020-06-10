import React from 'react'
import './style.css'

export default class AllSubmissions extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            submissions: []
        }
    }

    componentDidMount() {
        const makeAuthorizedRequest = this.props.makeAuthorizedRequest;
        const fetchData = async () => {
            await makeAuthorizedRequest(() => {
                return fetch(`/api/v1.0/submissions`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    }
                });
            }).then(result => {
                console.log(result)
                this.setState({
                    submissions: result
                })
            },
            )
        };
        fetchData();
    }
    statusCodeToText = (code) => {
        if (code === '1') {
            return 'В очереди'
        }
        else if (code === '2') {
            return 'Выполняется тестирование'
        }
        else if (code === '3') {
            return 'Неправильный ответ'
        }
        else if (code === '4') {
            return 'Успешное тестирование'
        }
        else {
            return code
        }
    }
    render() {
        return (
            <div>
                <h1>Все посылки</h1>
                <table id="submissions">
                    <thead>
                        <tr>
                            <td> Идентификатор посылки </td>
                            <td> Время посылки </td>
                            <td> Задача </td>
                            <td> Имя пользователя </td>
                            <td> Статус посылки </td>
                            <td> Решение </td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.submissions.map(val => {

                            return (
                                <tr>
                                    <td>{val.id}</td>
                                    <td>{val.time}</td>
                                    <td>{val.taskId} - {val.title}</td>
                                    <td>{val.username}</td>
                                    <td>{this.statusCodeToText(val.status)}</td>
                                    <td><a href={`../submission/${val.id}`}>Просмотр</a></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}