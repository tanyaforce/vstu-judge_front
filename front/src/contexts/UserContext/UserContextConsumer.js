import React from 'react';
import UserContext from './UserContext';

export default function UserContextConsumer(props) {
    return(
    <UserContext.Consumer>
        {props.children}
    </UserContext.Consumer>
    );
}