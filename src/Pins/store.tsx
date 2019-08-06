import * as React from 'react';

const { useState } = React;

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

export default useStoreStatus;
