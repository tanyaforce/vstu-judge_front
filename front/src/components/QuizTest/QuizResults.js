import React, { useState, useEffect, useRef } from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
import {
    Box,
    Paper,
    List,
    ListItem,
    Grid,
    Divider,
    Typography,
    TablePagination,
    Toolbar,
    InputBase,
    IconButton,
    useMediaQuery,
} from '@material-ui/core';
import {
    Schedule,
    AccountCircle,
    Search,
    FirstPage,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    LastPage,
} from '@material-ui/icons';
import Loader from '../Loader';
import QuizResultDetails from './QuizResultDetails';

const useStyles = makeStyles(theme => ({
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: '-58px',
        marginTop: '-45px',
    },
    root: {
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'scroll',
        height: '100vh',
        padding: '30px 5px',
        boxSizing: 'border-box',
    },
    body:{
        display: 'flex',
        boxSizing: 'border-box',
        flexDirection: 'column',
        // justifyContent: 'space-around',
        alignItems: 'center',
        flexGrow: 1,
    },
    rootPaper: {
        minWidth: '90%',
    },
    title: {
        marginRight: '10px',
    },
    toolbar: {
        backgroundColor: '#b21b22',
        color: '#ffffff',
    },
    search: {
        width: '30%',
        position: 'relative',
        borderRadius: '5px',
        backgroundColor: fade('#ffffff', 0.20),
        '&:hover': {
            backgroundColor: fade('#ffffff', 0.35),
        },
        marginRight: '0px',
        marginLeft: 'auto',
        paddingLeft: '7px',
        
    },
    searchIcon: {
        width: 'fit-content',
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
      },
      inputInput: {
        paddingLeft: '25px',
        width: '100%',
      },
    icon: {
        verticalAlign: 'bottom',
        fontSize: '1.5em',
    },
    score: {
        fontSize: '20px',
        padding: '15px',
        borderRadius: '5px',
        color: '#fff',
        minWidth: '50px',
        textAlign: 'center',
    },
    scoreGood: {
        backgroundColor: '#28a745',
    },
    scoreNormal: {
        backgroundColor: 'yellow',
    },
    scoreBad: {
        backgroundColor: '#b21b22',
    },
    paginationSpacer: {
        display: 'none',
    },
    paginationToolbar: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
    }
}));

const useStylesPagination = makeStyles(theme => ({
    root: {
        flexShrink: 0,
        marginLeft: theme.spacing(2.5),
    },
}));

function PaginationActions(props) {
    const classes = useStylesPagination();
    const { count, page, rowsPerPage, onChangePage } = props;
  
    const handleFirstPageButtonClick = event => {
      onChangePage(event, 0);
    };
  
    const handleBackButtonClick = event => {
      onChangePage(event, page - 1);
    };
  
    const handleNextButtonClick = event => {
      onChangePage(event, page + 1);
    };
  
    const handleLastPageButtonClick = event => {
      onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
  
    return (
      <div className={classes.root}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="Первая страница"
        >
            <FirstPage />
        </IconButton>
        <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="Предыдущая страница">
            <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Следующая страница"
        >
            <KeyboardArrowRight />
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Последняя страница"
        >
            <LastPage />
        </IconButton>
      </div>
    );
  }

const QuizResults = (props) => {
    const classes = useStyles();
    const mxw600 = useMediaQuery('(max-width:600px)');

    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [resultsShow, setResultsShow] = useState(null);
    const [showDetails, setShowDetails] = useState(null);
    const [resultDetails, setResultDetails] = useState(null);
    const makeAuthorizedRequest = props.user.makeAuthorizedRequest;

    const isMounted = useRef(null);

    useEffect(()=>{
        isMounted.current = true;
        (async (id) => {
        setIsLoading(true);
        await makeAuthorizedRequest(() => {
            return fetch(`/api/v1.0/quiz/results`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${localStorage.access_token}`
            },
            });
        }).then(
            result => {
            if (isMounted.current){
                setResults(result);
                setResultsShow(Object.keys(result));
                setIsLoading(false);
            }
            },
            (result) => {
            if (isMounted.current){
                setIsLoading(false);
            }
            }
        )
        }).call();
        return () => {
        isMounted.current = false;
        }
    }, []);

    const loadResultDetails = async (id) => {
        setIsLoading(true);
        await makeAuthorizedRequest(() => {
          return fetch(`/api/v1.0/quiz/results/${id}`, {
            method: 'get',
            headers: {
              'Authorization': `Bearer ${localStorage.access_token}`
            },
          });
        }).then(
          result => {
            if (isMounted.current){
                setResultDetails(result);
                setIsLoading(false);
            }
          },
          (result) => {
            if (isMounted.current){
                setIsLoading(false);
            }
          }
        )
      }
    

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = event => {
        const input = event.target.value.toLowerCase();
        var answer = [];
        Object.entries(results).map( el => {
            const [key, value] = el;
            if (value.test.toLowerCase().includes(input) || value.user.toLowerCase().includes(input)){
                answer.push(key);
            }
            return null;
        });
        setResultsShow(answer);
    };

    const handleShowDetails = key => {
        setShowDetails(key);
        loadResultDetails(key);
    };

    const handleBackToList = () => {
        setShowDetails(null);
    };

    return (<>
        {isLoading ? <div className={classes.loader}><Loader color="#b21b22" text="Загрузка результатов" /></div> : null}
        {!isLoading &&
        (showDetails ? 
        <QuizResultDetails
            data={resultDetails} 
            title={results[showDetails].test}
            user={results[showDetails].full_name || results[showDetails].user}
            time={results[showDetails].time}
            handleBackToList={handleBackToList}
        /> :
        <Box className={classes.root}>
        <Box className={classes.body}>
        <Paper className={classes.rootPaper}>
            <Toolbar className={classes.toolbar}>
                <Typography className={classes.title} variant={mxw600? "h6" : "h5"}>
                    Результаты тестирования
            </Typography>
                <div className={classes.search}>
                    <div className={classes.searchIcon}>
                        <Search />
                    </div>
                    <InputBase
                        placeholder="Поиск…"
                        classes={{
                            root: classes.inputRoot,
                            input: classes.inputInput,
                        }}
                        inputProps={{ 'aria-label': 'search' }}
                        onChange={handleSearch}
                    />
                </div>
            </Toolbar>
            <List>
                {
                    resultsShow.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((el, idx) => {
                        const key = el;
                        const value = results[key];
                        return (<React.Fragment key={key} >
                            < ListItem alignItems="flex-start" button={true} onClick={() => {handleShowDetails(key)}}>
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="center"
                                >
                                    <Grid item xs={10}>
                                        <Grid
                                            container
                                            direction="column"
                                            justify="flex-start"
                                            alignItems="flex-start"
                                        >
                                            <Typography
                                                component="p"
                                                variant="h5"
                                                color="textPrimary"
                                            >
                                                {value.test}
                                            </Typography>
                                            <Typography
                                                component="p"
                                                variant="body1"
                                                color="textPrimary"
                                            >
                                                <AccountCircle className={classes.icon} />
                                                {'  ' + (value.full_name || value.user)}
                                            </Typography>
                                            <Typography
                                                component="p"
                                                variant="body1"
                                                color="textPrimary"
                                            >
                                                <Schedule className={classes.icon} />
                                                {'  Дата прохождения и время: ' + new Date(Date.parse(value.time + "+0400")).toLocaleString('ru-RU',{ timeZone: 'Europe/Samara', hour: '2-digit', minute:'2-digit', month: '2-digit', day: '2-digit' })}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Grid
                                            container
                                            direction="row"
                                            justify="center"
                                            alignItems="center"
                                        >
                                            <Typography
                                                component="div"
                                                variant={mxw600?"h4":"h3"}
                                                className={classes.score + ' ' + (value.score > 89 ? classes.scoreGood : value.score > 75 ? classes.scoreNormal : classes.scoreBad)}
                                            >
                                                {value.score}%
                                            </Typography>

                                        </Grid>
                                    </Grid>
                                </Grid>
                            </ListItem>
                            {idx !== Object.keys(results).length - 1 ?
                                <Divider variant="middle" /> :
                                null}
                        </React.Fragment>);
                    })
                }
            </List>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={Object.entries(results).length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={PaginationActions}
                classes={{
                    spacer: classes.paginationSpacer,
                    toolbar: classes.paginationToolbar,
                }}
                labelRowsPerPage='Кол-во строк'
                labelDisplayedRows={({ from, to, count }) =>{
                    return `${from}-${to === -1 ? count : to} из ${count}`;
                }}
            />
        </Paper>
        </Box>
        </Box>)}
    </>);
}

export default QuizResults;