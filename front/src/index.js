import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto';
import './index.css';
import './styles/courier-map.scss';
import {UserContextProvider, UserContextConsumer} from './contexts/UserContext';
import App from './components/App';
import Login from './components/Login';
import Registration from './components/registration'
import Loader from './components/Loader';
import Grid from '@material-ui/core/Grid';
import * as serviceWorker from './serviceWorker';
import {Router, Switch, Route, Redirect} from 'react-router';
import {history} from './utils/routes';

const initialState = {
    user: {
        isLoading: true,
        isAuthenticated:false,
        name: '',
        modules: [],
      }
};

function RootRouter (props) {
    const user = props.user;
    return (
        <>{
            user.isLoading?
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ minHeight: '100vh' }}
            >
                <Grid item xs={3}>
                    <Loader color="#b21b22" text="Загрузка" />
                </Grid>   
            </Grid> :
            <Router history={history}>
                <Switch>
                    <Route path="/login" render={()=>{ return user.isAuthenticated ? <Redirect to="/" /> : <Login history={history} handleLogin={user.handleLogin}/> }} />
                    <Route path="/register" render={()=>{ return user.isAuthenticated ? <Redirect to="/" /> : <Registration history={history} handleLogin={user.handleLogin}/> }} />
                    <Route path="/" render={()=>{ return user.isAuthenticated ? <App history={history} user={props.user}/> : <Redirect to="/login" /> }}/>
                </Switch>
            </Router>
        }</>
    );
}

ReactDOM.render(
    <UserContextProvider value={initialState.user}>
        <UserContextConsumer>
            {user => <RootRouter user={user}/>}
        </UserContextConsumer>
    </UserContextProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
