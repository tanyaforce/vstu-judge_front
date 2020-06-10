import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Box,
    Paper,
    List,
    ListItem,
    ListSubheader,
    ListItemText,
    Typography,
    Divider,
    Fab,
    useMediaQuery,
} from '@material-ui/core';
import {
    HelpOutline,
    Cancel,
    Check,
    Schedule,
    AccountCircle,
    ArrowForwardIos,
} from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
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
    backButton: {
        position: 'fixed',
        top: '10px',
        color: '#b21b22',
        right: '10px',
        transform: 'rotate(180deg)',
        zIndex: 990,
        opacity: 0.7,
        backgroundColor: '#ffffff',
        '&:hover': {
            backgroundColor: '#ffffff',
            opacity: 0.8,
        }
    },
    rootPaper: {
        minWidth: '80%',
        maxWidth: '90%',
    },
    title: {
        color: '#ffffff',
        backgroundColor: '#b21b22',
    },
    titleSubdata: {
        display: 'flex',
        flexDirection:'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'normal',
    },
    icon: {
        verticalAlign: 'bottom',
        fontSize: '1.5em',
    },
    answerWright: {
        backgroundColor: 'green',
    },
    answerWrong: {
        backgroundColor: 'red',
    }
}));

const QuizResultDetails = (props) => {
    const mxw600 = useMediaQuery('(max-width:600px)');
    const classes = useStyles();

    const {data, user, title, handleBackToList} = props;
    const time = new Date(Date.parse(props.time + "+0400")).toLocaleString('ru-RU',{ timeZone: 'Europe/Samara', hour: '2-digit', minute:'2-digit', month: '2-digit', day: '2-digit' })

    return (
        <>
            <Fab color="primary" aria-label="backToList" className={classes.backButton} onClick={handleBackToList}>
                <ArrowForwardIos />
            </Fab>
            <Box className={classes.root}>
                <Box className={classes.body} >
                <Paper className={classes.rootPaper}>
                    <List subheader={
                        <ListSubheader component="div" disableSticky={true} className={classes.title}>
                        <Typography
                            component="p"
                            variant={ mxw600? "h5" : "h4"}
                            color="inherit"
                        >
                            {title}
                        </Typography>
                        <Box className={classes.titleSubdata}>
                        <Typography
                            component="p"
                            variant={ mxw600? "body2" : "body1"}
                            color="inherit"
                        >
                            <AccountCircle className={classes.icon} />
                            {' Пользователь: ' + user}
                        </Typography>
                        <Typography
                            component="p"
                            variant={ mxw600? "body2" : "body1"}
                            color="inherit"
                        >
                            <Schedule className={classes.icon} />
                            {' Дата прохождения ' + time}
                        </Typography>
                        </Box>
                        </ListSubheader>
                    }>
                        {data.map((el, idx)=>{
                        return (<React.Fragment key={idx}>
                        <ListItem className={classes.flexColumn}>
                            <ListItemText
                                primary={
                                    <Typography
                                        component="p"
                                        variant={ mxw600? "h6" : "h5"}
                                        color="textPrimary"
                                    >
                                        <HelpOutline className={classes.icon} />
                                        {el.question}
                                    </Typography>
                                }
                            />
                            {
                                el.answers.length > 0 ? 
                                el.answers.map((answer, idx)=>{
                                    return(
                                    <Typography
                                        key={idx}
                                        component="p"
                                        variant={ mxw600? "body2" : "body1"}
                                        color="textPrimary"
                                        className={answer.is_correct ? classes.answerWright : classes.answerWrong}
                                    >
                                        {answer.is_correct ? 
                                            <Check className={classes.icon} /> :
                                            <Cancel className={classes.icon} />
                                        }
                                        {answer.text}
                                    </Typography>)
                                }) :
                                (<Typography
                                    component="p"
                                    variant={ mxw600? "body2" : "body1"}
                                    color="textPrimary"
                                    className={classes.answerWrong}
                                >
                                    <Cancel className={classes.icon} />
                                    Нет ответа
                                </Typography>)
                            }
                        </ListItem>
                        {idx !== data.length - 1 ?
                                <Divider variant="middle" /> :
                                null}
                        </React.Fragment>)
                        })}
                    </List>
                </Paper>
            </Box>
            </Box>
        </>
    )
}

export default QuizResultDetails;