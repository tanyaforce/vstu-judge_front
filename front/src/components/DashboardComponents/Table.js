import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { makeStyles } from '@material-ui/core/styles';
import { Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TablePagination,
TableRow,
TableSortLabel,
Paper } from '@material-ui/core';


function EnhancedTableHead(props) {
    const { classes, order, orderBy, onRequestSort, headCells, isRowsExpandable} = props;
    const createSortHandler = property => event => {
      onRequestSort(event, property);
    };
  
    return (
      <TableHead>
        <TableRow>
            {isRowsExpandable &&
            <TableCell
              key={'expand'}
              padding={'default'}
              sortDirection={false}
            />}
          {headCells.map(headCell => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
}
  
EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
};

const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    tableExpandCell: {
        cursor: 'pointer',
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
}));

function desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  function stableSort(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = cmp(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
  }
  
  function getSorting(order, orderBy) {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
  }


export default function EnhancedTable(props) {
    const classes = useStyles();
    const [order, setOrder] = React.useState(props.order || 'asc');
    const [orderBy, setOrderBy] = React.useState(props.orderBy);
    const [page, setPage] = React.useState(props.page || 0);
    const [rowsPerPage, setRowsPerPage] = React.useState(props.rowsPerPage || 25);
    const [expanded, setExpanded] = React.useState([]);
    const isRowsExpandable = props.isRowsExpandable || false;
    const {headCells, rows} = props;
    const handleRequestSort = (event, property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = event => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const handleExpandClick = (event, name) => {
        const expandIndex = expanded.indexOf(name);
        let newExpanded = [];
    
        if (expandIndex === -1) {
            newExpanded = newExpanded.concat(expanded, name);
        } else if (expandIndex === 0) {
            newExpanded = newExpanded.concat(expanded.slice(1));
        } else if (expandIndex === expanded.length - 1) {
            newExpanded = newExpanded.concat(expanded.slice(0, -1));
        } else if (expandIndex > 0) {
            newExpanded = newExpanded.concat(
            expanded.slice(0, expandIndex),
            expanded.slice(expandIndex + 1),
          );
        }
    
        setExpanded(newExpanded);
    };

    const isExpanded = name => expanded.indexOf(name) !== -1;
  
    //Empty space if not enough rows for rowsPerPage
    // const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
  
    return (
        <Paper className={classes.paper}>
          <TableContainer>
            <Table
              className={classes.table}
              aria-labelledby="tableTitle"
              size="medium"
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                classes={classes}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                headCells = {headCells}
                isRowsExpandable = {isRowsExpandable}
              />
              <TableBody>
                {stableSort(rows, getSorting(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemExpanded = isExpanded(String(row[Object.keys(row)[0]]) + index);

                    return (
                        <React.Fragment key={String(row[Object.keys(row)[0]]) + index}>
                        <TableRow
                            hover
                            tabIndex={-1}
                            key={String(row[Object.keys(row)[0]]) + index}
                        >
                        { isRowsExpandable &&
                        <TableCell
                            key = {String(row[Object.keys(row)[0]]) + index + 'expand'}
                            onClick={event => handleExpandClick(event, String(row[Object.keys(row)[0]]) + index)}
                            align={'center'}
                            padding={'default'}
                            className={classes.tableExpandCell}>
                            {isItemExpanded ? 
                            (<FontAwesomeIcon icon={faChevronUp} />) :
                            (<FontAwesomeIcon icon={faChevronDown} />)
                            }
                        </TableCell>}
                        {headCells.map((headCell, index) => {
                            return (
                                <TableCell
                                key = {String(row[Object.keys(row)[0]]) + index + headCell.id}
                                align={headCell.numeric ? 'right' : 'left'}
                                padding={headCell.disablePadding ? 'none' : 'default'}>
                                {row[headCell.id]}
                                </TableCell>
                            );
                        })}
                      </TableRow>
                      {isItemExpanded && 
                      <TableRow>
                          <TableCell colSpan={headCells.length + 1}>
                            {row.expandingElement}
                          </TableCell>
                      </TableRow>}
                      </React.Fragment>
                    );
                  })}
                {/* Empty space if not enough rows for rowsPerPage
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 }}>
                    <TableCell colSpan={headCells.length + (isRowsExpandable? 1 : 0)} />
                  </TableRow>
                )} */}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Paper>
    );
  }