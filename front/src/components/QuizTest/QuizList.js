import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    List,
    ListItem,
    ListItemText,
    Typography,
    Divider,
    Paper,
    ListItemSecondaryAction,
    IconButton,
    CircularProgress,
    Box,
} from '@material-ui/core';
import {
    PlayArrow,
} from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 500,
    },
    block: {
        display: 'block',
    },
    action: {
        color: '#28a745',
        '&:hover': {
            color: '#4bb543',
        }
    },
    loadingButtonWrapper: {
        position: 'relative',
        fontSize: '0.875',
        lineHeight: '0.875',
    },
    buttonStartProgress: {
        color: '#b21b22',
        position: 'absolute',
        top: -12,
        left: -12,
        zIndex: 1,
    },
}));

const QuizList = (props) => {
    const classes = useStyles();
    const [clickedItem, setClickedItem] = useState(null);
    const isLoading = props.isLoading;
    const tests = props.tests;
    const selectTest = props.selectTest;

    const startButton = (key, loading) => {
        return (
            <IconButton
                disabled={loading}
                edge="end"
                aria-label="start"
                className={classes.action}
                onClick={() => {
                    setClickedItem(key);
                    selectTest(key);
                }}>

                <Box className={classes.loadingButtonWrapper}>
                    <PlayArrow fontSize="large" />
                    {loading && <CircularProgress size={60} className={classes.buttonStartProgress} />}
                </Box>
            </IconButton>);
    }

    return (
        <Paper className={classes.root}>
            <List>
                {
                    Object.entries(tests).map((el, idx) => {
                        const [key, value] = el;
                        return (<React.Fragment key={key} >
                            < ListItem alignItems="flex-start" >
                                <ListItemText
                                    primary={value.name}
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                className={classes.block}
                                                component="span"
                                                variant="body2"
                                                color="textPrimary"
                                            >
                                                Длительность: {value.duration / 60} мин
                                        </Typography>
                                            {value.description}
                                        </React.Fragment>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    {startButton(key, isLoading && clickedItem === key)}
                                </ListItemSecondaryAction>
                            </ListItem>
                            {idx !== Object.keys(tests).length - 1 ?
                            <Divider variant="middle" /> :
                            null}
                        </React.Fragment>);
                    })
                }
            </List>
        </Paper >
    );
}

export default QuizList;