import React, { useState } from 'react';
import { Avatar, Button, CssBaseline, TextField, Link, Box, Typography, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import logo from "../../assets/images/logo.png";

function Copyright() {
  return (
    <></>
  );
}

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: '#b21b22',
    width: '85px',
    height: '85px',
  },
  loading: {
    animation: '0.75s linear 0s normal none infinite running $rotating',
  },
  "@keyframes rotating": {
    "0%": {
      transform: 'rotate(0deg)',
    },
    "100%": {
      transform: 'rotate(360deg)',
    }
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    backgroundColor: '#b21b22',
    '&:hover': {
        backgroundColor: '#b21b22',
    }
  },
  error: {
      color: 'red',
  }
}));

function Login(props) {
  
  const classes = useStyles();
  var [username, setUsername] = useState('');
  var [password, setPassword] = useState('');
  var [isShowError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {history} = props;
  const showError = () => {
      setShowError(true);
  };
  const handleSubmit = (event, history, showError) => {
    event.preventDefault();
    props.handleLogin({username, password}, showError, setIsLoading);
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        {/* <Avatar className={ isLoading ? classes.avatar + ' ' + classes.loading : classes.avatar} src={logo}>
          {/* <FontAwesomeIcon icon={faDoorOpen} size='2x'/> */}
        {/* </Avatar> */}
        <Typography component="h1" variant="h5">
          Авторизация
        </Typography>
        {isShowError && <p className={classes.error}>Неверное имя пользователя или пароль</p>}
        <form className={classes.form} noValidate onSubmit={event => {handleSubmit(event, history, showError)}}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Имя пользователя"
            name="username"
            autoComplete="username"
            autoFocus
            onChange={event => {setUsername(event.target.value)}}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={event => {setPassword(event.target.value)}}
          />
        <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
        >
            Войти
        </Button>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

export default Login;