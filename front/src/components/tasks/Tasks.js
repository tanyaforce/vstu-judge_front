import React, { Link } from 'react'



export default class Tasks extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tasks: [],

        }
    }
    componentDidMount() {
        const makeAuthorizedRequest = this.props.makeAuthorizedRequest;
        const fetchData = async () => {
            await makeAuthorizedRequest(() => {
                return fetch(`/api/v1.0/tasks`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    }
                });
            }).then(result => {
                this.setState({
                    tasks: result
                })
            },
            )
        };
        fetchData();
    }
    render() {
        console.log(this.state.tasks)
        return (
            <div>
                <h1>Все задачи</h1>

                <table id="submissions">
                    <thead>
                        <tr>
                            <td> Идентификатор задачи </td>
                            <td> Наименование задачи </td>
                            <td> Сложность </td>
                            <td> Ссылка на решение </td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.tasks.map(val => {

                            return (
                                <tr>
                                    <td>{val.id}</td>
                                    <td>{val.title}</td>
                            <td>{val.diff}</td>
                                    <td><a href={`../task/${val.id}`}>Решить задачу!</a></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}