import React from 'react';
import { Card, CardActionArea, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    singleValue: {
      backgroundColor: props => props.color,
      color: '#ffffff',
    },
    bold: {
        fontWeight: '700',
    }
  }));

function SingleValue(props) {
    const classes=useStyles(props);
    return (
    <Card className={classes.singleValue} elevation={15}>
        <CardActionArea>
            <CardContent>
                <Typography variant="h1" component="h2" align='center' className={classes.bold}>
                    {props.value}
                </Typography>
                <Typography variant="body2" component="p" align='center'>
                    {props.subscription}
                </Typography>
            </CardContent>
        </CardActionArea>
    </Card>
    )
}

export default SingleValue;