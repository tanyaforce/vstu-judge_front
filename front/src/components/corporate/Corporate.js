import React, { useState, useEffect, useRef } from 'react';
import 'date-fns';
import EnhancedTable from '../DashboardComponents/Table';
import Loader from '../Loader';
import ruLocale from "date-fns/locale/ru";
import { corporatePoolTableHeads, corporateTransactionsTableHeads } from './const'
import DateFnsUtils from '@date-io/date-fns';
import Grid from '@material-ui/core/Grid';
import SingleValue from '../DashboardComponents/SingleValue';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import ChartStackedBar from '../DashboardComponents/ChartStackedBar'
import { makeStyles } from '@material-ui/core/styles';

function Corporate(props) {
    const [isLoadingPool, setIsLoadingPool] = useState(true)
    const [dataPool, setDataPool] = useState([])
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
    const [dataTransactions, setDataTransactions] = useState([])

    let defaultStartTime = new Date();
    defaultStartTime.setHours(0, 0, 1, 0)
    defaultStartTime.setDate(defaultStartTime.getDate() - 7)
    const [selectedDateStart, setSelectedDateStart] = React.useState((defaultStartTime - 7));
    const [selectedDateEnd, setSelectedDateEnd] = React.useState(new Date().getTime());

    const [isLoadingPointByPromocodeChart, setIsLoadingPointByPromocodeChart] = useState(true)
    const [pointsByPromocodeBarChart, setPointsByPromocodeBarChart] = useState([])

    const [isLoadingCntByPromocodeChart, setIsLoadingCntByPromocodeChart] = useState(true)
    const [cntByPromocodeBarChart, setCntByPromocodeBarChart] = useState([])

    const [isLoadingCntTrans, setIsLoadingCntTrans] = useState(true)
    const [dataCntTrans, setDataCntTrans] = useState()

    const makeAuthorizedRequest = props.makeAuthorizedRequest;

    const isMounted = useRef(null);

    const handleDateChangeStart = date => {
        setSelectedDateStart(date.getTime());
    };
    const handleDateChangeEnd = date => {
        setSelectedDateEnd(Math.min(date.getTime(), new Date().getTime()));
    };

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        }
    }, [])

    useEffect(() => {
        const fetchDataPointByPromocodeChart = async () => {
            setIsLoadingPointByPromocodeChart(true)
            await makeAuthorizedRequest(() => {
                const query = `SELECT Promocode, Reason, sum(Points) as sumPoints FROM YourHelper.CorporateTransactions LEFT JOIN (SELECT ID as PromocodeID, Promocode FROM YourHelper.Promocodes) USING PromocodeID WHERE DueDate BETWEEN ${selectedDateStart.toString().slice(0, 10)} AND ${selectedDateEnd.toString().slice(0, 10)} GROUP BY Promocode, Reason`
                return fetch(`/api/v1.0/getClick?q=${query}`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    },
                });
            }).then(
                result => {
                    if (isMounted.current) {
                        let newRes = []
                        for (let it of result) {
                            it.sumPoints = it.sumPoints.toFixed(1);
                            const { Promocode, Reason, sumPoints } = it
                            const dict = {
                                Promocode,
                                [Reason]: Number(sumPoints),
                            }
                            newRes.push(dict)
                        }
                        setPointsByPromocodeBarChart(newRes);
                        setIsLoadingPointByPromocodeChart(false);
                    }
                },
                (result) => {
                    if (isMounted.current) {
                        setIsLoadingPointByPromocodeChart(false);
                    }
                }
            )
        };

        const fetchDataCntByPromocodeChart = async () => {
            setIsLoadingCntByPromocodeChart(true)
            await makeAuthorizedRequest(() => {
                const query = `SELECT Promocode, count() as cntTrans FROM YourHelper.CorporateTransactions LEFT JOIN (SELECT ID as PromocodeID, Promocode FROM YourHelper.Promocodes) USING PromocodeID WHERE DueDate BETWEEN ${selectedDateStart.toString().slice(0, 10)} AND ${selectedDateEnd.toString().slice(0, 10)} AND Reason='guest percent' GROUP BY Promocode`
                return fetch(`/api/v1.0/getClick?q=${query}`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    },
                });
            }).then(
                result => {
                    if (isMounted.current) {
                        let newRes = []
                        for (let it of result) {
                            // it.cntTrans = it.cntTrans.toFixed(1);
                            const { Promocode, cntTrans } = it
                            const dict = {
                                Promocode,
                                'cntTrans': Number(cntTrans),
                            }
                            newRes.push(dict)
                        }
                        setCntByPromocodeBarChart(newRes);
                        setIsLoadingCntByPromocodeChart(false);
                    }
                },
                (result) => {
                    if (isMounted.current) {
                        setIsLoadingCntByPromocodeChart(false);
                    }
                }
            )
        };


        const fetchDataPool = async () => {
            await makeAuthorizedRequest(() => {
                return fetch(`/api/v1.0/corporate`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    },
                });
            }).then(
                result => {
                    if (isMounted.current) {
                        for (let it in result) {
                            result[it]['CreateDate'] = result[it]['CreateDate'].slice(0, 10)
                            result[it]['Promocode'] = result[it]['Promocode'].toUpperCase()
                            result[it]['Active'] = (result[it]['Active'] === 1) ? 'Да' : 'Нет'
                            result[it]['OwnerPercent'] = result[it]['OwnerPercent'] + '%'
                            result[it]['GuestPercent'] = result[it]['GuestPercent'] + '%'
                            result[it]['expandingElement'] =
                                <ul>
                                    <li><b>Идентификатор карты владельца:</b> <i>{result[it]['RestartCardID']}</i></li>
                                    <li><b>Идентификатор товара:</b> <i>{result[it]['RestartID']}</i></li>
                                </ul>
                        }
                        setDataPool(result);
                        setIsLoadingPool(false);
                    }
                },
                (result) => {
                    if (isMounted.current) {
                        setIsLoadingPool(false);
                    }
                }
            )
        };
        const fetchDataTransactions = async () => {
            setIsLoadingTransactions(true);
            await makeAuthorizedRequest(() => {
                return fetch(`/api/v1.0/corporate/transactions?time_start=${selectedDateStart.toString().slice(0, 10)}&time_end=${selectedDateEnd.toString().slice(0, 10)}`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    },
                });
            }).then(
                result => {
                    if (isMounted.current) {
                        for (let it in result) {
                            result[it]['DueDate'] = result[it]['DueDate'].slice(0, 10)
                            result[it]['Reason'] = result[it]['Reason'].includes('guest') ? 'Начисление клиенту' : 'Начисление владельцу'
                            result[it]['Promocode'] = result[it]['Promocode'].toUpperCase()

                            result[it]['expandingElement'] =
                                <ul>
                                    <li><b>CardFromID:</b> <i>{result[it]['CardFromID']}</i></li>
                                    <li><b>CardToID:</b> <i>{result[it]['CardToID']}</i></li>
                                </ul>
                        }
                        setDataTransactions(result);
                        setIsLoadingTransactions(false);
                    }
                },
                (result) => {
                    if (isMounted.current) {
                        setIsLoadingTransactions(false);
                    }
                }
            )
        };
        const fetchDataCntTrans = async () => {
            setIsLoadingCntTrans(true)
            await makeAuthorizedRequest(() => {
                const query = `SELECT count() as cnt FROM YourHelper.CorporateTransactions  WHERE Reason='guest percent' AND DueDate BETWEEN ${selectedDateStart.toString().slice(0, 10)} AND ${selectedDateEnd.toString().slice(0, 10)}`
                
                return fetch(`/api/v1.0/getClick?q=${query}`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    }
                });
            }).then(
                result => {
                    if (isMounted.current) {
                        setDataCntTrans(result);
                        setIsLoadingCntTrans(false);
                    }
                },
                (result) => {
                    if (isMounted.current) {
                        setIsLoadingCntTrans(false);
                    }
                }
            )
        };

        fetchDataCntTrans();
        fetchDataPool();
        fetchDataTransactions();
        fetchDataPointByPromocodeChart();
        fetchDataCntByPromocodeChart();

    }, [selectedDateStart, selectedDateEnd])

    const useStyles = makeStyles(theme => ({
        root: {
            padding: '0px 10px',
        }
    }));
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <div style={{ paddingBottom: '100px' }}>
                <h1>Тариф корпоративный</h1>
                <h2 style={{ textAlign: 'center' }}>Перечень кодовых слов</h2>
                {
                    !isLoadingPool
                        ? (<EnhancedTable order='desc' orderBy='PhoneNumber' headCells={corporatePoolTableHeads} rows={dataPool} isRowsExpandable={true} />)
                        : (<Loader color="#b21b22" text="Загрузка перечня кодовых слов" />)
                }

                <h2 style={{ textAlign: 'center' }}>Тариф корпоративный</h2>
                <div>
                    <MuiPickersUtilsProvider locale={ruLocale} utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            variant="inline"
                            format="dd MMMM yyyy"
                            margin="dense"
                            id="dateStart"
                            label="Начало интервала"
                            value={selectedDateStart}
                            onChange={handleDateChangeStart}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                            style={{ marginRight: '20px' }}
                        />
                        <KeyboardDatePicker
                            disableToolbar
                            variant="inline"
                            format="dd MMMM yyyy"
                            margin="dense"
                            id="dateEnd"
                            label="Конец интервала"
                            value={selectedDateEnd}
                            onChange={handleDateChangeEnd}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </div>
                <br />
                {!isLoadingCntTrans ?
                    (<SingleValue color='#006D9C' value={dataCntTrans[0].cnt} subscription='Всего использований тарифа корпоративного' />)
                    : (<Loader color='#b21b22' text='Загрузка данных' />)
                }
                <br />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <h3 style={{ textAlign: 'center' }}>Распределение начислений по промокодам</h3>
                        {
                            !isLoadingPointByPromocodeChart ? (
                                <ChartStackedBar
                                    title=''

                                    data={pointsByPromocodeBarChart}
                                    groupBy='Promocode'
                                    values={[
                                        { label: 'Начисление владельцу', id: 'owner percent', },
                                        { label: 'Начисление клиенту', id: 'guest percent', },
                                    ]} />
                            )
                                : (<div style={{ marginTop: '25px' }}><Loader color="#b21b22" text="Загрузка транзакций" /></div>)
                        }
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <h3 style={{ textAlign: 'center' }}>Количество использований по промокодам</h3>
                        {
                            !isLoadingCntByPromocodeChart ? (
                                <ChartStackedBar
                                    title=''

                                    data={cntByPromocodeBarChart}
                                    groupBy='Promocode'
                                    values={[
                                        { label: 'Количество использований корпоративного тарифа по промокодам', id: 'cntTrans', },
                                    ]} />
                            )
                                : (<div style={{ marginTop: '25px' }}><Loader color="#b21b22" text="Загрузка транзакций" /></div>)
                        }
                    </Grid>
                </Grid>
                <h3 style={{ textAlign: 'center' }}>Таблица транзакций</h3>
                {
                    !isLoadingTransactions
                        ? (<div style={{ marginTop: '25px' }}><EnhancedTable order='desc' orderBy='DueDate' headCells={corporateTransactionsTableHeads} rows={dataTransactions} isRowsExpandable={true} /></div>)
                        : (<div style={{ marginTop: '25px' }}><Loader color="#b21b22" text="Загрузка транзакций" /></div>)
                }
            </div>
        </div>
    )
}
export default Corporate