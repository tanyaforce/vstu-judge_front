import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import routes, { history, routesNavOrder } from '../../utils/routes';

const useStyles = makeStyles(theme => ({
    rootContent: {
        flexGrow: 1,
    },
    link: {
        height: '100%',
    },
    card: {
        height: '100%',
    },
    root: {
        padding: '0px 10px',
    }
}));
function HomePage(props) {
    const classes = useStyles();

    const handleLinkClick = event => {
        event.preventDefault();
        const to = event.target.closest("[href]").getAttribute('href');
        if (window.location.pathname !== to) {
            history.push(to);
        }
    }
    const count = routesNavOrder.reduce((accum, cur)=>{return (accum + Number(routes[cur].homepage && props.user.modules.includes(cur)))}, 0);
    const offset = count % 3;
    var pageIdx = 0;

    return (
        <div className={classes.root}>
            <h1>Привет, {props.user.fullName || props.user.name} </h1>
            <div className={classes.rootContent}>
                <Grid container spacing={3}>
                    {routesNavOrder.map((curRoute) => {
                        if (routes[curRoute].homepage && props.user.modules.includes(curRoute)){
                            const route = routes[curRoute];
                            pageIdx += 1;
                            return(
                                <Grid item xs={12}
                                    sm={pageIdx > count - offset ? (count === 1 ? 12 : true) : 4 }
                                    key={curRoute}>
                                <Link href={route.path} onClick={handleLinkClick} className={classes.link}>
                                    <Card className={classes.card}>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                alt={route.label}
                                                height="160"
                                                image={route.image}
                                                title={route.label}
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    {route.label}
                                            </Typography>
                                                <Typography variant="body2" color="textSecondary" component="p">
                                                    {route.description}
                                            </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Link>
                            </Grid>
                            );
                        } else {
                            return null;
                        }
                    })}
                </Grid>
            </div>
        </div>
    )
}

export default HomePage