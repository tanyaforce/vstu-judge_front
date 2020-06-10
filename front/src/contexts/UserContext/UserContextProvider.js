import React, { useEffect } from 'react';
import UserContext from './UserContext';

const reducer = (state, action) => {
    switch (action.type) {

        case 'loginUser':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: action.payload.authenticated,
                name: action.payload.user.username,
                fullName: action.payload.user.full_name,
                modules: action.payload.user.modules,
            };
        case 'logoutUser':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                name: '',
                fullName: '',
                modules: [],
            };
        default:
            return state;
    }
};

export default function UserContextProvider(props) {
    const [state, dispatch] = React.useReducer(reducer, props.value);

    const userLoginFetch = (user, showError, setIsLoading) => {
        setIsLoading(true);
        fetch("/api/v1.0/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)
        })
            .then(resp => resp.json())
            .then(data => {
                if (data.status === 'bad') {
                    showError();
                    setIsLoading(false);
                } else if (data.status === 'ok') {
                    localStorage.setItem("access_token", data.access_token)
                    localStorage.setItem("refresh_token", data.refresh_token)
                    dispatch({
                        type: 'loginUser',
                        payload: {
                            authenticated: true,
                            user: data
                        }
                    });
                }
            })
    }

    const userExpired = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        dispatch({
            type: 'logoutUser',
            payload: {}
        });
    }

    const refreshToken = () => {
        return new Promise((resolve, reject) => {
            const refresh_token = localStorage.refresh_token;
            fetch("/api/v1.0/token/refresh", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': `Bearer ${refresh_token}`
                }
            })
                .then(resp => resp.json())
                .then(data => {
                    if (data.message) {
                        userExpired();
                    } else {
                        localStorage.setItem("access_token", data.access_token)
                        localStorage.setItem("refresh_token", data.refresh_token)
                        const token = localStorage.access_token;
                        fetch("/api/v1.0/profile", {
                            method: "GET",
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        })
                            .then(resp => resp.json())
                            .then(data => {
                                if (data.message) {
                                    userExpired();
                                    reject(null);
                                } else {
                                    dispatch({
                                        type: 'loginUser',
                                        payload: {
                                            authenticated: true,
                                            user: data
                                        }
                                    });
                                    resolve(true);
                                }
                            })
                    }
                })
        })
    }

    const makeAuthorizedRequest = (request) => {
        return new Promise((resolve, reject) => {
            request()
                .then(resp => resp.json())
                .then(data => {
                    if (data.message) {
                        if (data.message === 'Token has expired') {
                            refreshToken()
                                .then(
                                    res => {
                                        request()
                                            .then(resp => resp.json())
                                            .then(data => { resolve(data); });
                                    },
                                    () => {
                                        userExpired();
                                        reject(null);
                                    }
                                );
                        } else {
                            reject(null);
                        }
                    } else {
                        resolve(data);
                    }
                })
        });
    }

    const userLogoutFetch = () => {

        fetch("/api/v1.0/logout/access", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Authorization': `Bearer ${localStorage.access_token}`
            }
        });
        fetch("/api/v1.0/logout/refresh", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Authorization': `Bearer ${localStorage.refresh_token}`
            }
        });
        userExpired();
    }

    // eslint-disable-next-line
    useEffect(() => {
        const token = localStorage.access_token;
        if (token) {
            fetch("/api/v1.0/profile", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(resp => resp.json())
                .then(data => {
                    if (data.message) {
                        if (data.message === 'Token has expired') {
                            refreshToken();
                        } else {
                            userExpired();
                        }
                    } else {
                        dispatch({
                            type: 'loginUser',
                            payload: {
                                authenticated: true,
                                user: data
                            }
                        });
                    }
                });
        } else {
            userExpired();
        }
        // eslint-disable-next-line
    }, []);

    return (
        <UserContext.Provider
            value={{
                ...state,
                handleLogin: userLoginFetch,
                handleLogout: userLogoutFetch,
                refreshToken: refreshToken,
                makeAuthorizedRequest: makeAuthorizedRequest

            }}
        >
            {props.children}
        </UserContext.Provider>
    );
};