import React, { useState } from 'react';
import { Switch, Route } from 'react-router';
import styled from 'styled-components';
import routes, { routesOrder, history } from '../utils/routes';
import SideNavigation from './SideNavigation';
import Task from './task'
import Submit from './submit'
import Submissions from './submission'

import { UserContextConsumer } from '../contexts/UserContext';

const navWidthCollapsed = 64;
const navWidthExpanded = 240;

const Main = styled.main`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: ${props => (props.expanded ? navWidthExpanded : navWidthCollapsed)}px;
    overflowY: hidden;
    transition: all .15s;
    padding: 0 0;
    transition: background-color .35s cubic-bezier(.4, 0, .2, 1);
    &&>#expanded-shadow {
        position: fixed;
        top: 0px;
        left: 0px;
        background: rgba(0, 0, 0, .6);
        display: ${props => (props.expanded ? 'block' : 'none')};
        height: 100%;
        width: 100%;
        z-index: 999;
    }
`;



function App(props) {
    var [expanded, setExpanded] = useState(false);
    var [selected, setSelected] = useState('homepage');
    return (
        <>
            <Main expanded={expanded}>
                <div id="expanded-shadow"></div>
                <Switch>
                    <Route key='submission' exact path='/submission/:id' component={(props) =>
                        <>
                            <UserContextConsumer>
                                {(user) => <Submissions props={props} user={user} makeAuthorizedRequest={user.makeAuthorizedRequest} />}
                            </UserContextConsumer>
                        </>
                    } render={() => { setSelected('submission'); }}>


                    </Route>
                    <Route key='task' exact path='/task/:taskId' component={(props) =>
                        <>
                            <UserContextConsumer>
                                {(user) => <Task props={props} makeAuthorizedRequest={user.makeAuthorizedRequest} />}
                            </UserContextConsumer>
                        </>
                    } render={() => { setSelected('task'); }}>


                    </Route>
                    <Route key='submit' exact path='/submit/:taskId' component={(props) =>
                        <>
                            <UserContextConsumer>
                                {(user) => <Submit props={props} user={user} makeAuthorizedRequest={user.makeAuthorizedRequest} />}
                            </UserContextConsumer>
                        </>
                    } render={() => { setSelected('submit'); }}>
                    </Route>
                    {
                        routesOrder.map(curRoute => {
                            console.log(props)
                            if (props.user.modules.includes(curRoute)) {
                                const route = routes[curRoute];
                                
                                return <Route key={route['name']} path={route['path']} render={() => { setSelected(route['name']); return route['JSX'] }} />
                            } else {
                                return null;
                            }
                        })
                    }

                </Switch>
            </Main>
            <SideNavigation
                onSelect={(selected) => {
                    const to = '/' + selected;
                    if (window.location.pathname !== to) {
                        history.push(to);
                    }
                }}
                onToggle={() => {
                    setExpanded(!expanded);
                }} selected={selected}
                modules={props.user.modules}
                handleLogout={props.user.handleLogout} />
        </>
    );
}

export default App;