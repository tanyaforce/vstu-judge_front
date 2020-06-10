import React from 'react'

export default class Task extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            task: [],
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
    render() {
        console.log(this.state)
        const { sample_input, sample_output, id, name, timelimit, memorylimit, statement, input, output } = this.state.task
        console.log(name)
        return (
            <div style={{ width: '90%', margin: '0 auto' }}>
                <h1 align="center">Задача {name} </h1>
                <p style={{ fontSize: '13px' }} align="center">Ограничение по времени на тест: {timelimit} с</p>
                <p style={{ fontSize: '13px' }} align="center">Ограничение по памяти на тест: {memorylimit} МБ</p>
                <p style={{ fontSize: '13px' }} align="center">ввод: стандартный ввод</p>
                <p style={{ fontSize: '13px' }} align="center">вывод: стандартный вывод</p>
                <p> {statement} </p>
                <h4 > Входные данные </h4>
                <p > {input} </p>
                <h4 > Выходные данные </h4>
                <p > {output} </p>
                <h4> Пример </h4>
                <table border="1">
                    <tr>
                        <td>Входные данные</td>
                    </tr>
                    <tr>
                        <td>{sample_input}</td>

                    </tr>
                    <tr>
                        <td>Выходные данные</td>
                    </tr>
                    <tr><td>{sample_output}</td></tr>
                </table>
                <a style={{
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
                    marginBottom: '20px'
                }} href={`../../submit/${id}`}>Отправить решение</a>
            </div>
        )
    }
}