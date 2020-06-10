import React from 'react';
import { Paper } from '@material-ui/core';

import { Chart, ArgumentAxis, ValueAxis, BarSeries, Legend, Title, Tooltip } from "@devexpress/dx-react-chart-material-ui";
// import { Chart, ArgumentAxis, ValueAxis, LineSeries } from "@devexpress/dx-react-chart-bootstrap4";

import { scaleBand } from '@devexpress/dx-chart-core';
import { ArgumentScale, EventTracker } from '@devexpress/dx-react-chart';

import { Stack, Animation } from '@devexpress/dx-react-chart';

import { withStyles, makeStyles } from '@material-ui/core/styles';

const styles = theme => ({
    title: {
   
      marginBottom: 0,
 
    },
    item: {
      flexDirection: 'row-reverse',
    },
    label: {
      textAlign: 'left',
    },
  });

const useStyles = makeStyles(theme => ({
    paper: {

      marginBottom: theme.spacing(2),
      overflowX: 'scroll',
    },
    chart: {
      minWidth: '300px',
    }
}));


function ChartStackedBar(props){

    const classes = useStyles();
    const {title, legendTitle, data, groupBy, values} = props;

    const RootWithTitle = withStyles(styles)(({ classes, ...restProps }) => (
        <div>
          <h2 className={classes.title}>
            {legendTitle}
          </h2>
          <Legend.Root {...restProps} />
        </div>
      ));
      
      const Item = withStyles(styles)(({ classes, ...restProps }) => (
        <Legend.Item {...restProps} className={classes.item} />
      ));
      
      const Label = withStyles(styles)(({ classes, ...restProps }) => (
        <Legend.Label {...restProps} className={classes.label} />
      ));

    return (
      <Paper elevation={2} className={classes.paper}>
        <Chart
            className={classes.chart}
            data={data}
            >
            <ArgumentAxis />
            <ArgumentScale factory={scaleBand}/>
            <ValueAxis />
            <Title
                text={title}
            />
            {values.map(value => {
                return(
                    <BarSeries
                    key={String(value.label) + String(value.id)}
                    name={value.label}
                    valueField={value.id}
                    argumentField={groupBy}
                /> 
                );
            })}
            
            <Stack />
            <EventTracker />
            <Tooltip />
            <Legend 
                rootComponent={RootWithTitle}
                itemComponent={Item}
                labelComponent={Label}
                position='bottom'
            />
            <Animation />
            </Chart>
      </Paper>
    );
}

export default ChartStackedBar;