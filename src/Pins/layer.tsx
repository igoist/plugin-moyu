import * as React from 'react';

import useStoreStatus from './store';
import { requestListAsync } from './request';

const { useState, useEffect } = React;

type setLayerParseType = { dataId: number, title: string };

const useLayerStatus = () => {
  const [layerState, setLayerState] = useState({
    dataId: null,
    data: [],
    title: ''
  });

  const { pushStore, toPrevStore, toNextStore } = useStoreStatus();

  useEffect(() => {
    console.log('useLayerStatus Init');
    pushStore(layerState, setLayerState);
  }, []);

  const handleLayer = async (config: setLayerParseType) => {
    const { dataId, title } = config;
    requestListAsync(dataId, (data) => {
      console.log('Id: ', dataId, data);

      pushStore({
        dataId: dataId,
        data,
        title
      }, setLayerState);
    });
  };

  const hideLayer = () => {
    toPrevStore(setLayerState);
  };

  const reopenLayer = () => {
    toNextStore(setLayerState);
  };

  return {
    layerState,
    handleLayer,
    hideLayer,
    reopenLayer,
  }
};

export default useLayerStatus;
