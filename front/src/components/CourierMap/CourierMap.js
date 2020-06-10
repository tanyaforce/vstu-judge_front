import React, { useEffect, useState, useRef } from 'react'
import { YMaps, Map, Placemark, Clusterer} from 'react-yandex-maps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { makeStyles } from '@material-ui/core/styles';
import CourierList from './CourierList';
import Loader from '../Loader';

const useStyles = makeStyles(theme => ({
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: '-58px',
    marginTop: '-45px',
  },
}));

const mapData = {
    center: [48.71, 44.52],
    zoom: 12,
    behaviors: ['default', 'scrollZoom']
  };

const CourierMap = (props) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listCollapsed, setListCollapsed] = useState(true);
  const [listSpacerCollapsed, setlistSpacerCollapsed] = useState(true);
  const user = props.user
  const classes = useStyles();

  const timeoutId = useRef(null);
  const isMounted = useRef(null);
  
  const handleClick = () => {
    setListCollapsed(!listCollapsed);
    if(listSpacerCollapsed){
      setTimeout(()=>{setlistSpacerCollapsed(!listSpacerCollapsed)}, 300);
    } else {
      setlistSpacerCollapsed(!listSpacerCollapsed);
    }
  }
  
  const getData = async () => {
    clearTimeout(timeoutId.current);
    await user.makeAuthorizedRequest(()=>{
        return fetch(`/api/v1.0/courier-map/orders`, {
            method: 'get',
            headers: {
                'Authorization': `Bearer ${localStorage.access_token}`
            }
        });
    }).then(
        result => {
          if(isMounted.current){
            setData(result);
            const id = setTimeout(() =>{
              getData();
            }, 1000*120);
            timeoutId.current = id;
          }
        },
        (result)=>{
          if(isMounted.current){
            const id = setTimeout(() =>{
              getData();
            }, 1000*120);
            timeoutId.current = id;
          }
        }
    )
  }
  
  const changeVisibility = async (id, visibility) =>{
    await user.makeAuthorizedRequest(()=>{
      return fetch("/api/v1.0/courier-map/order-visibility", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Authorization': `Bearer ${localStorage.access_token}`
        },
        body: JSON.stringify({id, visibility})
      });
    }).then(
      result => {
          if(isMounted.current){
            getData();
          }
      }
    )
  }
  
  useEffect(() => {
    isMounted.current = true;
    getData();
    return () => {
      clearTimeout(timeoutId.current);
      isMounted.current = false;
    };
  }, [])
  
  return (
  <div className="courier-map-container">
    <YMaps >
    {isLoading ? <div className={classes.loader}><Loader color="#b21b22" text="Загрузка карты" /></div> : null}
      <Map state={mapData} className="YMAP" options={{autoFitToViewport:'always'}} onLoad={()=>{setIsLoading(false)}} >
        <Clusterer
          options={{
            groupByCoordinates: false,
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            hideIconOnBalloonOpen: false,
            preset: 'islands#redClusterIcons',
            clusterBalloonContentLayout: "cluster#balloonTwoColumns",
            clusterBalloonLeftColumnWidth: 60,
            balloonContentLayoutWidth: 300,
            balloonContentLayoutHeight: 125,
          }}
          modules={['clusterer.addon.balloon','geoObject.addon.balloon' ]}
        >
          {
            data.map((item, idx) => {
              if(item['visibility'] && item['has_address']){
                return (<Placemark key={item['number']} 
                  geometry={[Number(item['latitude']), Number(item['longitude'])]}
                  properties={{
                    iconContent: item['number'],
                    iconCaption: item['number'],
                    balloonContentHeader: item['number'],
                    balloonContentFooter: new Date(Date.parse(item['delivery_date'] + "+0400")).toLocaleString('ru-RU',{ timeZone: 'Europe/Samara', weekday: 'short', hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric' }),
                    balloonContentBody: '<strong>Адрес: </strong>' + item['address'] + '<br/><strong>Цена: </strong>' + item['price'] + '₽<hr/>',
                    clusterCaption: 'заказ <strong>' + item['number'] + '</strong>'
                  }}
                  options={{
                    hasBalloon: true,
                    preset: 'islands#redStretchyIcon',
                  }}
                  modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                />);
              } else {
                return null;
              }
            }
            )
          }
        </Clusterer>
      </Map>
    </YMaps>
    <div className={listSpacerCollapsed?"courier-map-list-spacer collapsed":"courier-map-list-spacer"}></div>
    <div className={listCollapsed?"courier-map-list collapsed":"courier-map-list"}>
      <div className={listCollapsed?"courier-map-list-btn":"courier-map-list-btn right"} onClick={handleClick}>
        <FontAwesomeIcon icon={faChevronCircleLeft}/>
      </div>
      <CourierList data={data} handleChangeVisibility={changeVisibility} />
    </div>
  </div>
  )
  
}


export default CourierMap;