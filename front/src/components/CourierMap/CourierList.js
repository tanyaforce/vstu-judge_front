import React from 'react';
import MaterialTable from 'material-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

const renderTime = rowData => {return (<div>{new Date(Date.parse(rowData['delivery_date'] + "+0400")).toLocaleString('ru-RU',{ timeZone: 'Europe/Samara', weekday: 'short', hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric' })}</div>)}

const CourierList = (props) => {
    const data = Array.isArray(props.data) ? props.data : [];
    const columns = [
        { title: 'Номер заказа', field: 'number', searchable: true, removable: false, editable: 'never'},
        { title: 'Адрес', field: 'address', searchable: true, removable: false, editable: 'never' },
        { title: 'Район', field: 'district', searchable: true, removable: false, editable: 'never' },
        { title: 'Цена', field: 'price', type: 'numeric', removable: false, editable: 'never'},
        { title: 'Время доставки', field: 'delivery_date', type: 'datetime', removable: false, editable: 'never',
          render: renderTime},
    ];

  return (
    <MaterialTable style={{height:"100%"}}
      title="Список заказов"
      columns={columns}
      data={data}
      options={{
        paging: true,
        draggable: false,
        headerStyle: {
            fontWeight: 500,
        },
        rowStyle: rowData => ({
            backgroundColor: (rowData.has_address) ? '#ffffff' : '#ffa8a8'
        })
      }}
      localization={{
        toolbar:{
            searchPlaceholder: 'Поиск',
            searchTooltip: 'Поиск',
        },
        header:{
          actions: 'Показать/ Скрыть',
        },
        pagination:{
          labelDisplayedRows: '{from}-{to} из {count}',
          labelRowsPerPage: 'Строк на странице:',
          labelRowsSelect: 'Строк',
          firstAriaLabel: 'Первая Страница',
          previousAriaLabel: 'Предыдущая Страница',
          nextAriaLabel: 'Следующая Страница',
          lastAriaLabel: 'Последняя Страница',
          firstTooltip: 'Первая Страница',
          previousTooltip: 'Предыдущая Страница',
          nextTooltip: 'Следующая Страница',
          lastTooltip: 'Последняя Страница',
        },
        body:{
            emptyDataSourceMessage: 'В данный момент заказов нет',
        }
      }}
      icons={tableIcons}
      actions={[
        rowData => ({
          disabled: !rowData.has_address,
          icon: () => <FontAwesomeIcon icon={faEye} />,
          tooltip: 'Cкрыть',
          hidden: !rowData.visibility,
          onClick: (event, rowData) => {
            // Hide order
            props.handleChangeVisibility(rowData.id, !rowData.visibility)
          }
        }),
        rowData => ({
            disabled: !rowData.has_address,
            icon: () => <FontAwesomeIcon icon={faEyeSlash} />,
            tooltip: 'Показать',
            hidden: rowData.visibility,
            onClick: (event, rowData) => {
              // Show order
              props.handleChangeVisibility(rowData.id, !rowData.visibility)
            }
        }),
      ]}
    />
  );
}


export default CourierList;