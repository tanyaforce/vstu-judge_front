import React, { useState, useEffect, useRef } from 'react';
import EnhancedTable from '../DashboardComponents/Table';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Loader from '../Loader';
import SingleValue from '../DashboardComponents/SingleValue';
import { makeStyles } from '@material-ui/core/styles';

function CardsPool(props) {
    const [data, setData] = useState();
    const [dataFilters, setDataFilters] = useState();
    const [dataCntCards, setDataCntCards] = useState()
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFilters, setIsLoadingFilters] = useState(true)
    const [isLoadingCntCards, setIsLoadingCntCards] = useState(true)
    const [phonenumberFilterValue, setphoneNumberFilterValue] = useState('')
    const makeAuthorizedRequest = props.makeAuthorizedRequest;

    const isMounted = useRef(null);

    function onChange(event, newValue) {
        setphoneNumberFilterValue(newValue);
    }
    useEffect(() => {
        isMounted.current = true;
        const fetchDataFilters = async () => {
            setIsLoadingFilters(true);
            await makeAuthorizedRequest(() => {
                return fetch(`/api/v1.0/cardspool`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    }
                });
            }).then(
                result => {
                    if (isMounted.current) {
                        setDataFilters(result);
                        setIsLoadingFilters(false);
                    }
                },
                (result) => {
                    if (isMounted.current) {
                        setIsLoadingFilters(false);
                    }
                }
            )
        };

        const fetchDataCntCards = async () => {
            setIsLoadingCntCards(true)
            await makeAuthorizedRequest(() => {
                const query = `SELECT count(CardNumber) as cnt FROM Exchange`
                return fetch(`/api/v1.0/getClick?q=${query}`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    }
                });
            }).then(
                result => {
                    if (isMounted.current) {
                        setDataCntCards(result);
                        setIsLoadingCntCards(false);
                    }
                },
                (result) => {
                    if (isMounted.current) {
                        setIsLoadingCntCards(false);
                    }
                }
            )
        };
        fetchDataCntCards();
        fetchDataFilters();
        return () => {
            isMounted.current = false;
        }
    }, [])
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await makeAuthorizedRequest(() => {
                let phonenumberfilter = phonenumberFilterValue && phonenumberFilterValue.PhoneNumber ? 'phonenumber=' + phonenumberFilterValue.PhoneNumber : ''
                return fetch(`/api/v1.0/cardspool?${phonenumberfilter}`, {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${localStorage.access_token}`
                    }
                });
            }).then(
                result => {
                    if (isMounted.current) {
                        setData(result);
                        setIsLoading(false);
                    }
                },
                (result) => {
                    if (isMounted.current) {
                        setIsLoading(false);
                    }
                }
            )
        };
        fetchData();
    }, [phonenumberFilterValue]);

    const cardsPoolTableHeads = [
        { id: 'FullName', numeric: false, disablePadding: false, label: 'ФИО' },
        { id: 'PhoneNumber', numeric: false, disablePadding: false, label: 'Номер телефона' },
        { id: 'Balance', numeric: false, disablePadding: false, label: 'Баланс' },
        { id: 'CardNumber', numeric: false, disablePadding: false, label: 'Номер карты' },
    ];

    let phonenumberFilterValues = []
    phonenumberFilterValues.push({
        'PhoneNumber': null,
        'phoneFilterLabel': 'Все'
    })
    for (let it in dataFilters) {
        dataFilters[it]['phoneFilterLabel'] = dataFilters[it]['PhoneNumber']
        phonenumberFilterValues.push(dataFilters[it])
    }
    for (let it in data) {
        data[it]['expandingElement'] = <ul><li><b>Идентификатор карты:</b> <i>{data[it]['CardID']}</i></li></ul>
    }

    const useStyles = makeStyles(theme => ({
        root: {
            padding: '0px 10px',
        }
    }));
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <h1>Информация по картам</h1>

            {!isLoadingCntCards ?
                (<SingleValue color='#006D9C' value={dataCntCards[0].cnt} subscription='Всего карт' />)
                : (<Loader color='#b21b22' text='Загрузка данных' />)
            }
            <br /> <br />
            {!isLoadingFilters ? (
                <Autocomplete
                    id="filter-phonenumber"
                    defaultValue={{
                        'PhoneNumber': null,
                        'phoneFilterLabel': 'Все'
                    }}
                    loading={true}
                    loadingText='Загрузка...'
                    options={phonenumberFilterValues}
                    getOptionLabel={option => option.phoneFilterLabel}
                    style={{ width: 300 }}
                    renderInput={params => (
                        <TextField {...params} label="Выберите телефон" variant="outlined" fullWidth />
                    )}
                    onChange={onChange}
                />) :
                (<Loader color='#b21b22' text='Загрузка фильтров' />)
            }
            <br />
            <br />
            {isLoading ? (
                <Loader color='#b21b22' text='Загрузка данных' />
            ) : (
                    <>

                        <EnhancedTable order='desc' orderBy='Balance' headCells={cardsPoolTableHeads} rows={data} isRowsExpandable={true} />
                    </>
                )}
        </div>
    );
}
export default CardsPool;