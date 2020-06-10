import React from 'react';
import SingleValue from './SingleValue';
import ChartStackedBar from './ChartStackedBar';

function Test(props) {
    return (
    <>
    <h1>Тестовый дашборд</h1>
    <SingleValue color='green' value='90' subscription='Отмазки Дениса'/>
    <br/>
    <ChartStackedBar 
        title="Начисление баллов"
        legendTitle="Начисления"
        data={[
            { ownerName: 'Ахмадова', owner: 2.525 },
            { ownerName: 'Бизнес', owner: 3.018 },
            { ownerName: 'Бизнес', users: 2.15 },
            { ownerName: 'Ахмадова', users: 1.75 },
        ]}
        groupBy='ownerName'
        values={[{label: 'Владельцу', id:'owner'},
            {label: 'Пользователям', id:'users'}
        ]}

        />
    </>
    )
}

export default Test;