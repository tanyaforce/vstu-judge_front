import React, { useState, useEffect } from "react"
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';
import {
    Done,
  } from '@material-ui/icons';

const useStyles = makeStyles({
    card: {
        minWidth: '250px',
        overflow: 'unset',
        margin: '5px',
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    buttonsWrapper: {
        width: '100%'
    },
    button: {
        boxSizing: 'border-box',
        width: '100%',
        background: '#ffffff',
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'start',
        marginBottom: 15,
        textTransform: "none"
    },
    buttonSelected: {
        border: '2px solid #b21b22',
        '& .MuiButton-startIcon': {
            color: '#b21b22',
        }
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
        marginBottom: '10px',
        '& .MuiButton-label': {
            display: 'none',
        },
        backgroundSize: 'cover',
        backgroundOrigin: 'border-box',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },
});

const SingleAnswerQuestion = (props) => {
    const classes = useStyles();
    const [selectedButtons, setSelectedButtons] = useState(new Set(props.selectedAnswers));
    const {question, idx:questionIdx, updateResults, questionKey } = props;
    const type = question.correct_answers.length > 1 ? 'multi' : 'single';
    const answers = question.answers;

    useEffect(() => {
        updateResults(questionKey, Array.from(selectedButtons));
    }, [selectedButtons]);
    return (
        <Card className={classes.card} raised={true}>
            <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Вопрос {questionIdx}
            </Typography>
                <Typography variant="h5" component="h2">
                    {question.text}
            </Typography>
                <Typography className={classes.pos} color="textSecondary">
                    {
                        type==='single' ?
                        'Выберите один вариант ответа' :
                        'Выберите несколько вариантов ответа'
                    }
            </Typography>
            {question.img ?
                <CardMedia
                    className={classes.media}
                    image={question.img}
                /> :
                null
            }
                <div className={classes.buttonsWrapper}>
                    {
                        Object.entries(answers).map(el => {
                            const [key, value] = el;
                            const isSelected = selectedButtons.has(key);
                            var className = isSelected ? classes.button + ' ' + classes.buttonSelected : classes.button;
                            className = value.img ? className + ' ' + classes.media : className;
                            return (<Button key={key} className={className} onClick={() => {
                                setSelectedButtons((prevSet) => {
                                    if (prevSet.has(key)) {
                                        prevSet.delete(key);
                                    } else {
                                        prevSet.add(key);
                                    }
                                    return new Set(prevSet.values());
                                })
                            }} 
                            variant="contained"
                            startIcon={isSelected ? <Done /> : null}
                            disabled={!isSelected && selectedButtons.size===question.correct_answers.length}
                            style={
                                value.img ?
                                {
                                    backgroundImage: `url(${value.img})`,
                                } :
                                {}
                            }
                            >
                                {value.text}
                            </Button>);
                        })

                    }
                </div>

            </CardContent>

        </Card>
    );
}


export default SingleAnswerQuestion