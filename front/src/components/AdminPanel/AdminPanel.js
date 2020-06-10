import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import {
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@material-ui/core';
import Loader from '../Loader';

const useStyles = makeStyles(theme => ({
    rootContent: {
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
    },
    root: {
        padding: '0px 10px',
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '800px',
        padding: '20px 15px'
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
    },
    answer: {
        color: 'green',
    },
    roleSelect:{
        marginTop: '15px',
        '& label':{
            marginTop: '-10px',
        }
    },
    radioChecked: {
        '& span': {
            color: '#b21b22',
        },
    }
}));
function HomePage(props) {
    const classes = useStyles();
    const [action, setAction] = useState("create_user");
    const [username, setUsername] = useState("");
    const [group, setGroup] = useState("");
    const [fullName, setFullName] = useState(null);
    const [password, setPassword] = useState("");
    const [role_id, setRole_id] = useState(1);
    const [roles, setRoles] = useState(null);
    const [isShowError, setShowError] = useState(false);
    const [isShowAnswer, setShowAnswer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const makeAuthorizedRequest = props.user.makeAuthorizedRequest;
    const isMounted = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        (async (id) => {
          setIsLoading(true);
          await makeAuthorizedRequest(() => {
            return fetch(`/api/v1.0/adminpanel/roles`, {
              method: 'get',
              headers: {
                'Authorization': `Bearer ${localStorage.access_token}`
              },
            });
          }).then(
            result => {
              if (isMounted.current){
                setRoles(result);
                setIsLoading(false);
              }
            },
            (result) => {
              if (isMounted.current){
                setShowError(true);
                setIsLoading(false);
              }
            }
          )
        }).call();
        return () => {
          isMounted.current = false;
        }
      }, [])

    const handleCreateUser = (event) => {
        event.preventDefault();
        if(username.length < 1 || password.length < 1) {
          setShowError(true)
          return
        }
        (async (id) => {
            setIsLoading(true);
            await makeAuthorizedRequest(() => {
              return fetch(`/api/v1.0/adminpanel/createuser`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': `Bearer ${localStorage.access_token}`
                },
                body: JSON.stringify({
                    username: username,
                    full_name: fullName,
                    password: password,
                    role_id: role_id,
                    group: group.toLowerCase()
                })
              });
            }).then(
              result => {
                if (isMounted.current){
                    setShowAnswer(true);
                    setIsLoading(false);
                }
              },
              (result) => {
                if (isMounted.current){
                  setShowError(true);
                  setIsLoading(false);
                }
              }
            )
          }).call();
    }

    const handleChangePassword = (event) => {
        event.preventDefault();
        (async (id) => {
            setIsLoading(true);
            await makeAuthorizedRequest(() => {
              return fetch(`/api/v1.0/adminpanel/changepassword`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': `Bearer ${localStorage.access_token}`
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                })
              });
            }).then(
              result => {
                if (isMounted.current){
                    setShowAnswer(true);
                    setIsLoading(false);
                }
              },
              (result) => {
                if (isMounted.current){
                  setShowError(true);
                  setIsLoading(false);
                }
              }
            )
          }).call();
    }

    return (
        <div className={classes.root}>
            <h1>Админ панель</h1>
            <div className={classes.rootContent}>
                <Paper className={classes.paper}>
                {isLoading && <Loader color='#b21b22' text='Загрузка' />}
                {isShowAnswer && <p className={classes.answer}>{action==='create_user' ? "Пользователь успешно создан" : action==='change_password' ? "Пароль успешно изменен" : null}</p>}
                {isShowError && <p className={classes.error}>{action==='create_user' ? "Не удалось создать пользователя" : action==='change_password' ? "Не удалось изменить пароль" : null}</p>}
                <FormControl component="fieldset" fullWidth>
                    <FormLabel component="label">Действие</FormLabel>
                    <RadioGroup aria-label="action" name="action" value={action} onChange={event => {setAction(event.target.value)} }>
                    <FormControlLabel value="create_user" control={<Radio classes={{checked: classes.radioChecked}}/>} label="Создать пользователя" />
                    <FormControlLabel value="change_password" control={<Radio classes={{checked: classes.radioChecked}}/>} label="Изменить пароль" />
                    </RadioGroup>
                </FormControl>
                <form className={classes.form} noValidate onSubmit={event => {
                    if ( action==='create_user' ){
                        handleCreateUser(event);
                    } else if (action==='change_password') {
                        handleChangePassword(event) 
                    }
                    }}>
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
                        onChange={event => { setUsername(event.target.value) }}
                    />
                    {(action==='create_user') && 
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="full_name"
                        label="ФИО пользователя"
                        name="full_name"
                        autoComplete="full_name"
                        onChange={event => {
                          if (event.target.value.length > 0){
                            setFullName(event.target.value);
                          } else {
                            setFullName(null);
                          }
                        }}
                    />}
                    {(action==='create_user') && 
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="group"
                        label="Группа"
                        name="group"
                        autoComplete="group"
                        onChange={event => {
                          if (event.target.value.length > 0){
                            setGroup(event.target.value);
                          } else {
                            setGroup(null);
                          }
                        }}
                    />}
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
                        onChange={event => { setPassword(event.target.value) }}
                    />
                    {roles && action === 'create_user' && <FormControl variant="outlined" fullWidth className={classes.roleSelect}>
                        <InputLabel id="role_label">
                            Роль
                        </InputLabel>
                        <Select
                            labelId="role_label"
                            id="role_id"
                            required
                            value={role_id}
                            onChange={event => {setRole_id(event.target.value) }}
                        >
                            {
                                roles.map((el) => {
                                    return(
                                        <MenuItem value={el.id} key={el.id}>
                                            {el.name}
                                        </MenuItem>
                                    );
                                })
                            }
                            
                        </Select>
                    </FormControl>}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        {action==='create_user' ? "Создать" : action==='change_password' ? "Изменить" : null}
                    </Button>
                </form>
                </Paper>
            </div>
        </div>
    )
}

export default HomePage