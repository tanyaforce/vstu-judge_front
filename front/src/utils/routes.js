import React from 'react';

import { faAddressCard, faPercent, faMapMarkerAlt, faHome, faQuestionCircle, faCheckCircle, faTools, faTasks, faShare, faShareSquare} from '@fortawesome/free-solid-svg-icons';
import CardsPool from '../components/cards-pool';
import Tasks from '../components/tasks'
import CardsPoolImage from '../assets/images/pizzacard.jpg';
import Corporate from '../components/corporate';
import CorporateImage from '../assets/images/corporate.jpg';
import TaskImage from '../assets/images/tasks.jpg';
import AllSubmissionsImage from '../assets/images/allsubmissions.jpg';
import MySubmissionsImage from '../assets/images/mysubmissions.jpg';
import CourierMap from '../components/CourierMap';
import CourierMapImage from '../assets/images/map.jpg';
import HomePage from '../components/home-page';
import QuizTest from '../components/QuizTest';
import QuizTestImage from '../assets/images/test.jpg';
import { QuizResults } from '../components/QuizTest';
import QuizResultsImage from '../assets/images/testresult.jpg';
import AdminPanel from '../components/AdminPanel';
import { UserContextConsumer } from '../contexts/UserContext';
import {createBrowserHistory} from 'history';
import MySubmissions from '../components/mysubmissions'
import AllSubmissions from '../components/allsubmissions'

export const routesOrder = ['tasks', 'mysubmissions', 'allsubmissions', 'adminpanel', 'homepage'];
export const routesNavOrder = ['homepage', 'tasks', 'mysubmissions', 'allsubmissions', 'adminpanel']; 
export const history = createBrowserHistory();



export default {
    // tasks:
    // {
    //     name: 'tasks',
    //     path: "/tasks",
    //     icon: faAddressCard,
    //     label: "Все задачи",
    //     image: CardsPoolImage,
    //     description: "Все задачи",
    //     homepage: true,
    //     JSX: <>
    //             <UserContextConsumer>
    //                 { user => <Tasks makeAuthorizedRequest={user.makeAuthorizedRequest}/>}
    //             </UserContextConsumer>
    //         </>,
    // },
    tasks:
    {
        name: 'tasks',
        path: "/tasks",
        icon: faTasks,
        label: "Все задачи",
        image: TaskImage,
        description: "Все задачи",
        homepage: true,
        JSX: <>
                <UserContextConsumer>
                    { user => <Tasks makeAuthorizedRequest={user.makeAuthorizedRequest}/>}
                </UserContextConsumer>
            </>,
    },
    mysubmissions:
    {
        name: 'mysubmissions',
        path: "/mysubmissions",
        icon: faShare,
        label: "Мои посылки",
        image: MySubmissionsImage,
        description: "Просмотр своих посылок на проверку",
        homepage: true,
        JSX: <>
            <UserContextConsumer>
                { user => <MySubmissions user={user} makeAuthorizedRequest={user.makeAuthorizedRequest}/>}
            </UserContextConsumer>
        </>,
    },
    allsubmissions:
    {
        name: 'allsubmissions',
        path: "/allsubmissions",
        icon: faShareSquare,
        label: "Все посылки",
        image: AllSubmissionsImage,
        description: "Просмотр всех посылок на сервере",
        homepage: true,
        JSX: <>
            <UserContextConsumer>
                { user => <AllSubmissions user={user} makeAuthorizedRequest={user.makeAuthorizedRequest}/>}
            </UserContextConsumer>
        </>,
    },
    homepage:
    {
        name: 'homepage',
        path: "/",
        icon: faHome,
        label: "Домашняя страница",
        image: CardsPoolImage,
        description: "Домашняя страница",
        homepage: false,
        JSX: <>
            <UserContextConsumer>
                { user => <HomePage user = {user} />}
            </UserContextConsumer>
        </>,
    },
    adminpanel:
    {
        name: 'adminpanel',
        path: "/adminpanel",
        icon: faTools,
        label: "Админ Панель",
        image: null,
        description: "Инструменты администратора",
        homepage: false,
        JSX: <>
            <UserContextConsumer>
                { user => <AdminPanel user={user}/>}
            </UserContextConsumer>
        </>,
    },
}