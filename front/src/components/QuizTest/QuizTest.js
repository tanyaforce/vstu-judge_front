import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Typography,
  Box,
  MobileStepper,
  IconButton,
  CircularProgress,
  useMediaQuery,
} from '@material-ui/core';
import {
  KeyboardArrowRight,
  KeyboardArrowLeft,
  Done,
} from '@material-ui/icons';
import SingleAnswer from './SingleAnswerQuestion';
import QuizFinish from './QuizFinish';
import QuizList from './QuizList';
import Loader from '../Loader';

const useStyles = makeStyles(theme => ({
  rootContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  main: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    padding: '25px 25px',
    flexGrow: 1,
    paddingBottom: '105px',
    overflowY: 'hidden',
  },
  header: {
    padding: "15px 15px",
    height: 'fit-content',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // justifyContent: 'space-around',
    overflowY: 'scroll',
  },
  footer: {
    padding: "15px 15px",
    borderTop: "1px solid rgba(0,0,0,0.3)",
    height: 'fit-content',
    display: 'flex',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: '#ffffff',
  },
  rootStepper: {
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  rootProgress: {
    width: '80%',
    backgroundColor: '#aaaaaa',
    height: '15px',
    borderRadius: '7px',
  },
  bar1: {
    backgroundColor: '#b21b22',
  },
  finishButton: {
    backgroundColor: '#28a745',
    color: '#ffffff',
    marginLeft: '10px',
    minWidth: '130px',
    '&:hover': {
      backgroundColor: '#4bb543',
    }
  },
  nextButton: {
    backgroundColor: '#dddddd',
    color: '#000000',
    minWidth: '100px',
    marginLeft: '10px',
  },
  backButton: {
    marginRight: '10px',
  },
  loadingButtonWrapper: {
    position: 'relative',
    fontSize: '0.875',
    lineHeight: '0.875',
  },
  buttonBackProgress: {
    color: '#b21b22',
    position: 'absolute',
    top: '-12px',
    left: '-12px',
    zIndex: 1,
  },
  buttonNextProgress: {
    color: '#b21b22',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
}));

const QuizTest = (props) => {
  const classes = useStyles();
  const mxw600 = useMediaQuery('(max-width:600px)');

  const [tests, setTests] = useState(null);
  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [results, setResults] = useState(null);
  const [stepsCount, setStepsCount] = useState(100);
  const [activeStep, setActiveStep] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const [timeLost, setTimeLost] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isUpdatingResults, setIsUpdatingResults] = useState(false);
  const [directionClicked, setDirectionClicked] = useState(null);
  const makeAuthorizedRequest = props.user.makeAuthorizedRequest;

  const intervalId = useRef(null);
  const isMounted = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    (async (id) => {
      setIsLoading(true);
      await makeAuthorizedRequest(() => {
        return fetch(`/api/v1.0/quiz/`, {
          method: 'get',
          headers: {
            'Authorization': `Bearer ${localStorage.access_token}`
          },
        });
      }).then(
        result => {
          if (isMounted.current){
            setTests(result);
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
  }, [])

  useEffect(() => {
    const startTest = async (id) => {
      setIsLoadingQuestions(true);
      await makeAuthorizedRequest(() => {
        return fetch(`/api/v1.0/quiz/start`, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Authorization': `Bearer ${localStorage.access_token}`
          },
          body: JSON.stringify({
            test_id: testId,
          })
        });
      }).then(
        result => {
          if (isMounted.current){
            setEndTime(result['end_time']);
            setResults(result['results']);
            setQuestions(result['questions']);
            setStepsCount(Object.keys(result['questions']).length);
            setIsLoadingQuestions(false);
            setIsStarted(true);
          }
        }, 
        result => {
          if (isMounted.current){
            setTestId(null);
            setIsLoadingQuestions(false);
          }
        }
      )
    }
    if(testId){
      startTest(testId);
    }
  }, [testId]);

  useEffect(() => {
    if(endTime){
      clearInterval(intervalId.current);
      let timerId = setInterval(()=>{
        if (isMounted.current){
          const time = new Date(new Date(Date.parse(endTime + "+0400")) - new Date()).toLocaleString('ru-RU',{ minute:'2-digit', second:'2-digit' });
          setTimeLost(time);
          intervalId.current = timerId;
        }
      },1000)
    }
    return clearInterval(intervalId.current);
  }, [endTime])

  const updateServerResults = async (isFinish, action) => {
    setIsUpdatingResults(true);
      await makeAuthorizedRequest(() => {
        return fetch('/api/v1.0/quiz/' + (isFinish ? 'finish' : 'update-results'), {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Authorization': `Bearer ${localStorage.access_token}`
          },
          body: JSON.stringify({
            results,
            test_id: testId,
          })
        });
      }).then(
        result => {
          if (isMounted.current){
            setIsUpdatingResults(false);
            action();
          }
        },
        (result) => {
          if (isMounted.current){
            setIsUpdatingResults(false);
          }
        }
      )
  }

  const handleNext = () => {
    setDirectionClicked('next');
    updateServerResults(false, () => {setActiveStep(prev => (prev + 1))})
  }
  const handlePrev = () => {
    setDirectionClicked('prev');
    updateServerResults(false, () => {setActiveStep(prev => (prev - 1))})
  }
  const handleFinish = () => {
    setDirectionClicked('finish');
    updateServerResults(true, () => {
      setIsFinished(true);
      setIsStarted(false);
    })
    clearInterval(intervalId.current);
  }
  const handleBackToList = () => {
    setDirectionClicked('backToList');
    setTestId(null);
    setQuestions(null);
    setResults(null);
    setStepsCount(100);
    setActiveStep(0);
    setEndTime(null);
    setTimeLost(null);
    setIsFinished(false);
  }
  const updateResults = (idx, answers) => {
    setResults(prev => {
      Object.assign(prev, { [idx]: answers });
      return Object.assign({}, prev);
    })
  }

  const finishButton = (<Button
    variant="contained"
    className={classes.finishButton}
    size='medium'
    startIcon={
      <Box className={classes.loadingButtonWrapper}>
        <Done />
        { directionClicked === 'finish' &&  isUpdatingResults && 
        <CircularProgress size={24} className={classes.buttonNextProgress} />}
      </Box>
    }
    disabled={isUpdatingResults || isFinished}
    onClick={handleFinish}>
    Закончить
  </Button>);
  const nextButton = (
  <Button
    variant="contained"
    className={classes.nextButton}
    size='medium'
    endIcon={
      <Box className={classes.loadingButtonWrapper}>
        <KeyboardArrowRight />
        { directionClicked === 'next' &&  isUpdatingResults &&
        <CircularProgress size={24} className={classes.buttonNextProgress} />}
      </Box>
    }
    disabled={isUpdatingResults || !isStarted}
    onClick={handleNext}
  >
    Дальше
  </Button>);

  const backButton = (
  <IconButton
    className={classes.backButton}
    disabled={activeStep === 0 || isUpdatingResults || isFinished}
    onClick={handlePrev}>
      <Box className={classes.loadingButtonWrapper}>
        <KeyboardArrowLeft />
      { directionClicked === 'prev' && 
      isUpdatingResults && <CircularProgress size={48} className={classes.buttonBackProgress} />}
    </Box>
    </IconButton>
  );

  return (
    <div className={classes.rootContainer}>
      <Box className={classes.header}>
        <Typography variant={mxw600 ? "h5" : "h4"} component="h2">
          {isStarted ?
          tests[testId]['name'] :
          "Тестирование"
          }
        </Typography>
        <Typography variant="h6" component="p">
          {isStarted && timeLost ?
          "Времени осталось: " + timeLost :
          null
          }
        </Typography>
      </Box>
      <Box className={classes.main}>
        <Box className={classes.body}>
          {isLoading ? <Loader color="#b21b22" text="Загрузка тестов" /> :
          !testId || (!isStarted && !isFinished)  ? <QuizList
            isLoading={isLoadingQuestions}
            tests={tests}
            selectTest={(id)=>{setTestId(id)}}
          /> :
          isFinished ? <QuizFinish handleBackToList={handleBackToList}/> :
          !isLoadingQuestions && isStarted && (() => {
            const el = Object.entries(questions)[activeStep]
            const [key, value] = el;
            return (<SingleAnswer
              key={key}
              question={value}
              idx={activeStep + 1}
              updateResults={updateResults}
              questionKey={key}
              selectedAnswers={results[key]}
            />);
          }).call()}
        </Box>
      </Box>
      <Box className={classes.footer}>
        <MobileStepper
          variant="progress"
          steps={stepsCount}
          position="static"
          activeStep={activeStep}
          nextButton={activeStep === stepsCount - 1 ? finishButton : nextButton}
          backButton={ backButton }
          classes={{
            root: classes.rootStepper,
          }}
          LinearProgressProps={{
            classes: {
              root: classes.rootProgress,
              bar1Determinate: classes.bar1,
            }
          }}
        />
      </Box>
    </div>
  )
}

export default QuizTest