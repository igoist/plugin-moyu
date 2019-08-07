import * as React from 'react';

import useStoreStatus from './store';
import useLayerStatus from './layer';
import { requestTypeAsync } from './request';

const { useState, useEffect } = React;

const IGOIST = 'igoist-moyu';

type setLayerParseType = { dataId: number, title: string };

interface PinProps {
  id: number;
  top: number;
  left: number;
  height: number;
  bgColor: string;
  dataId?: number;
  title?: string;
  setLayer?: (config: setLayerParseType) => void;
}

interface WFCell {
  id: number;
  col: number;
  top: number;
  left: number;
  height: number;
  bgColor: string;
  dataId?: number;
  title?: string;
}

const Pin = (props: PinProps) => {
  const { id, top, left, height, bgColor, setLayer, dataId, title } = props;
  return (
    <div className='wfc'
      style={{
        top: top + 'px',
        left: left + 'px',
        height: height + 'px',
        lineHeight: height + 'px',
        backgroundColor: bgColor
      }}
      onClick={() => setLayer({ dataId, title })}
    >
      {/* { id + 'x' + dataId + ': ' + title } */}
      { title }
    </div>
  );
};
const WFMultiple = 1;
const o = {
  cellWidth: WFMultiple * 59,
  cellSpace: WFMultiple * 4,
  containerSelectorOffset: 50,
  hibernate: 5000,
  // maxCol: 0,
  // minCol: 0,
  // height: 0,
};

type handlePosConfig = {
  cell: WFCell,
  hs: Array<number>,
}

const handlePos = (config: handlePosConfig) => {
  const { cell, hs } = config;

  let cols = 4 - 0;
  let col = 0;

  if (0) {

  } else {
    for (let i = 0; i < cols; i++) {
      if (hs[i] < hs[col]) {
        col = i;
      }
    }
  }

  let left = col * (o.cellWidth + o.cellSpace);
  let top = hs[col];

  // o.hs
  hs[col] += cell.height + o.cellSpace;

  let max = 0;
  let min = 0;

  for (let i = 0; i < cols; i++) {
    if (hs[i] < hs[min]) min = i;
    if (hs[i] > hs[max]) max = i;
  }

  // o.maxCol = max;
  // o.minCol = min;

  let tmpWrapHeight = hs[max] + o.containerSelectorOffset;
  // o.height = tmpWrapHeight;

  return {
    cell: {
      ...cell,
      col,
      top,
      left,
    },
    wrapHeight: tmpWrapHeight,
    hs: hs,
  }
};

const usePageStatus = () => {
  const [pageState, setPageState] = useState({
    wrapHeight: 0,
    cols: 4,
    hs: [0, 0, 0, 0],
    pins: [],
    globalPins: [],
  });

  const { pushStore, toPrevStore, toNextStore } = useStoreStatus();

  const { layerState, handleLayer, hideLayer } = useLayerStatus();

  useEffect(() => {
    console.log('usePageStatus Init');
    let xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    if (process.env.NODE_ENV === 'development') {
      xhr.open('GET', '/map/map-pins.json');
    } else if (process.env.NODE_ENV === 'production') {
      xhr.open('GET', './map/map-pins.json');
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let tmpGlobalPins = JSON.parse(xhr.response);

        requestTypeAsync((data) => {
          let tmpPins = [];
          console.log(data);

          tmpPins = tmpGlobalPins.slice(0, 20);

          let tmpWrapHeight = 0;
          let tmpHs = [0, 0, 0, 0];
          tmpPins = tmpPins.map((pin: WFCell, index: number) => {
            pin.height = pin.height * WFMultiple / 4;
            const { cell, wrapHeight,  hs } = handlePos({
              cell: pin,
              hs: tmpHs
            });
            tmpWrapHeight = wrapHeight;
            tmpHs = hs;
            (cell as any).dataId = data[index].id;
            (cell as any).title = data[index].title;
            console.log('index: ', index, data[index].id, data[index].title);
            return cell;
          });
          console.log(tmpPins);

          pushStore({
            wrapHeight: tmpWrapHeight,
            cols: 4,
            hs: tmpHs,
            pins: tmpPins,
            globalPins: tmpGlobalPins,
          }, setPageState);
        });
      }
    };
    xhr.send();
  }, []);

  const addRandomPin = () => {
    let randomPin: WFCell = pageState.globalPins[pageState.pins.length];

    // [...pageState.hs] is really important
    // parse a new copy, or you parse the old array's ref, and the old array would be changed
    const { cell, wrapHeight, hs } = handlePos({
      cell: randomPin,
      hs: [...pageState.hs]
    });

    pushStore({
      ...pageState,
      wrapHeight: wrapHeight,
      hs,
      pins: [
        ...pageState.pins, cell
      ]
    }, setPageState);
  };

  const setLayer = (config: setLayerParseType) => {
    handleLayer(config);
  };

  const toPrevPage = () => {
    toPrevStore(setPageState);
  }

  const toNextPage = () => {
    toNextStore(setPageState);
  }

  const renderLayer = () => {
    // console.log('layerState.dataId:', layerState.dataId);
    if (layerState.dataId) {
      if (layerState.data) {
        return (
          <div
            id={ `${ IGOIST }-layer` }
            onClick={ hideLayer }
          >
            <div className={ `${ IGOIST }-title` }>
              { layerState.title }
            </div>
            {
              layerState.data.map((item, index) => {
                return (
                  <div className={ `${ IGOIST }-item` } key={ index.toString() }>
                    <a href={ item.url } target='_blank' title={ item.title }>{ item.title }</a>
                  </div>
                );
              })
            }
          </div>
        );
      } else {
        return (
          <div
            id={ `${ IGOIST }-layer` }
            onClick={ hideLayer }
          >
            <div className={ `${ IGOIST }-title` }>Opps!</div>
          </div>
        );
      }
    } else {
      return null;
    }
  };

  return {
    pageState,
    addRandomPin,
    setLayer,
    toPrevPage,
    toNextPage,
    renderLayer
  };
};

const App = () => {
  const { pageState, addRandomPin, setLayer, toPrevPage, toNextPage, renderLayer } = usePageStatus();

  return (
    <React.Fragment>
      <div className={ `waterfall-wrap cols-${ pageState.cols }` }
        style={{
          height: pageState.wrapHeight
        }}
      >
        {
          pageState.pins.map((pin, index) => {
            return (
              <Pin
                { ...pin }
                setLayer={ setLayer }
                key={ index.toString() }
              />
            )
          })
        }
      </div>

      {/* <button
        id='addPin'
        onClick={ addRandomPin }
      >AddRandomPin</button>
      <button
        id='toPrevPage'
        onClick={ toPrevPage }
      >toPrevPage</button>
      <button
        id='toNextPage'
        onClick={ toNextPage }
      >toNextPage</button> */}

      { renderLayer() }
    </React.Fragment>
  );
}

export default App;
