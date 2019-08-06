import * as React from 'react';

import useStoreStatus from './store';
import { requestListAsync } from './request';

const { useState, useEffect } = React;

const useLayerStatus = () => {
  const [layerState, setLayerState] = useState({
    dataId: null,
    data: []
  });

  const { pushStore, toPrevStore, toNextStore } = useStoreStatus();

  useEffect(() => {
    console.log('useLayerStatus Init');
    pushStore(layerState, setLayerState);
  }, []);

  const handleDataId = async (dataId: number) => {
    requestListAsync(dataId, (data) => {
      console.log('Id: ', dataId, data);

      pushStore({
        dataId: dataId,
        data
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
    handleDataId,
    hideLayer,
    reopenLayer,
  }
};

export default useLayerStatus;
