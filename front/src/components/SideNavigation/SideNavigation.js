import React from 'react';
import styled from 'styled-components';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorClosed } from '@fortawesome/free-solid-svg-icons';
import routes, {routesNavOrder} from '../../utils/routes';

import '@trendmicro/react-sidenav/dist/react-sidenav.css';

const Separator = styled.div`
    clear: both;
    position: relative;
    margin: .8rem 0;
    background-color: #f9dcdd;
    height: 3px;
    opacity: 0.7;
`;

const StyledSideNav = styled(SideNav)`
    background-color: #b21b22;
    position: fixed;
    z-index: 1000;
`;
StyledSideNav.defaultProps = SideNav.defaultProps;

const StyledNav = styled(Nav)`
    && [class*="sidenav---navitem---"] {
        height: 65px;
        line-height: 65px;
    }

    && > [class*="sidenav-navitem--"] {
        > [class*="navitem--"] {
            [class*="navicon--"] {
                    height: 65px;
                    line-height: 85px;
            }
            [class*="navtext--"] {
                margin-left: 10px;
            }
        }
    }
`;
StyledNav.defaultProps = Nav.defaultProps;

function SideNavigation(props) {
    console.log(routes)
    return(
    <StyledSideNav onSelect={props.onSelect} onToggle={props.onToggle}>
        <Toggle />
        <StyledNav selected={props.selected}>
            {
                routesNavOrder.map( curRoute => {
                    if (props.modules.includes(curRoute)){
                        const route = routes[curRoute];
                        return (
                            <NavItem key={route['name']} eventKey={route['name']}>
                                <NavIcon>
                                    <FontAwesomeIcon icon={route['icon']} size='3x'/>
                                </NavIcon>
                                <NavText>
                                    {route['label']}
                                </NavText>
                            </NavItem>
                        )
                    } else {
                        return null;
                    }
                })
            }
            <Separator />
            <NavItem eventKey="logout" onClick={props.handleLogout}>
                <NavIcon>
                    <FontAwesomeIcon icon={faDoorClosed} size='3x' />
                </NavIcon>
                <NavText style={{ paddingRight: 32 }} title="Выйти">
                    Выйти
                </NavText>
            </NavItem>
        </StyledNav>
    </StyledSideNav>
    );
}

  export default SideNavigation;