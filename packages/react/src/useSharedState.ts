import { useState, useEffect } from 'react';
import { SharedServiceClient  } from '@shared-service/core';

let sharedService: SharedServiceClient;

export function initSharedService(worker: SharedWorker) {
  sharedService = new SharedServiceClient({ worker });
}

export function useSharedState<T>(key: string, initialData: T) {
  const [data, setState] = useState(initialData);

  useEffect(() => {
    if (!sharedService) {
      throw new Error('Share service is not initialized.');
    }
    sharedService.getState(key).then(lastData => {
      if (lastData) {
        setState(lastData as T);
      }
    }).catch((e) => {
      console.error(e);
    });
    const onStateChange = (data) => {
      setState(data);
    }
    sharedService.on(key, onStateChange);
    return () => {
      sharedService.off(key, onStateChange);
    };
  }, []);

  const setData = (newData) => {
    return sharedService.setState(key, newData);
  }
  return [data, setData];
}
