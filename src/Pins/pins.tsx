import * as React from 'react';

const { useState, useEffect } = React;

interface PinProps {
  id: number;
  top: number;
  left: number;
  height: number;
  bgColor: string;
  dataId?: number;
  title?: string;
  setLayer?: (id: number) => void;
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
    >
      { id + 'x' + dataId + ': ' + title }
    </div>
  );
};

const o = {
  cellWidth: 236,
  cellSpace: 16,
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

const useStoreStatus = () => {
  // default current is equal to storeList.length - 1
  // and use it as storeState.storeList[storeState.current]
  const [storeState, setStore] = useState({
    storeList: [],
    current: -1
  });

  const pushStore = (newStore: any, setMethod: (state: any) => void) => {
    if (storeState.current === storeState.storeList.length - 1) {
      setStore({
        storeList: [
          ...storeState.storeList,
          newStore
        ],
        current: storeState.current + 1
      });
    } else {
      let tmp = storeState.storeList.slice(0, storeState.current + 1);

      setStore({
        storeList: [
          ...tmp,
          newStore
        ],
        current: storeState.current + 1
      });
    }

    setMethod(newStore);
  };

  const toPrevStore = (setMethod: (state: any) => void) => {
    if (storeState.current > 0) {
      setStore({
        storeList: storeState.storeList,
        current: storeState.current - 1
      });

      setMethod(storeState.storeList[storeState.current - 1]);

      // console.log('toPrevStore: ', storeState.current, storeState.current - 1);
    } else {
      console.log('toPrevStore: is at the beginning');
    }
  };

  const toNextStore = (setMethod: (state: any) => void) => {
    if (storeState.current + 1 < storeState.storeList.length) {
      setStore({
        storeList: storeState.storeList,
        current: storeState.current + 1
      });

      setMethod(storeState.storeList[storeState.current + 1]);

      // console.log('toNextStore: ', storeState.current, storeState.current + 1);
    } else {
      console.log('toNextStore: is the latest');
    }
  };

  return {
    storeState,
    pushStore,
    toPrevStore,
    toNextStore
  }
};

const promiseWrap = () => {
  return new Promise((resolve) => {
    let xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', 'https://www.printf520.com:8080/GetType');
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response));
      }
    };
    xhr.send();
  });
};

type requestAsyncCallback = (data: any) => void;

const requestAsync = async (callback: requestAsyncCallback) => {
  let data: any = await promiseWrap();

  if (data.Code === 0) {
    callback(data.Data);
  } else {
    console.log('API request error.');
    console.log('requestAsync data: ', data);
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

  useEffect(() => {
    console.log('usePageStatus Init');
    let xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', '/map/map-pins.json');
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let tmpGlobalPins = JSON.parse(xhr.response);

        requestAsync((data) => {
          let tmpPins = [];
          console.log(data);

          tmpPins = tmpGlobalPins.slice(0, 20);

          let tmpWrapHeight = 0;
          let tmpHs = [0, 0, 0, 0];
          tmpPins = tmpPins.map((pin: WFCell, index: number) => {
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

  const setLayer = (id: number) => {

  };

  const toPrevPage = () => {
    toPrevStore(setPageState);
  }

  const toNextPage = () => {
    toNextStore(setPageState);
  }

  return {
    pageState,
    addRandomPin,
    toPrevPage,
    toNextPage
  };
};

const App = () => {
  const { pageState, addRandomPin, toPrevPage, toNextPage } = usePageStatus();

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
                key={ index.toString() }
              />
            )
          })
        }
      </div>

      <button
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
      >toNextPage</button>
    </React.Fragment>
  );
}

export default App;
