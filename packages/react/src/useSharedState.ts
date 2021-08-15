import { useState, useEffect } from 'react';
import { SharedServiceClient  } from '@shared-service/core';

let sharedService: SharedServiceClient;

export function initSharedService(worker: SharedWorker) {
  sharedService = new SharedServiceClient({ worker });
}

export function useSharedState<T>(key: string, initialData: T) {
  const [data, setState] = useState(initialData);
  if (!sharedService) {
    console.warn('Share service is not initialized.');
    return [data, setState];
  }
  useEffect(() => {
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
    const unsubscribe = sharedService.subscribe(key, onStateChange);
    return unsubscribe;
  }, []);

  const setData = (newData) => {
    return sharedService.setState(key, newData);
  }
  return [data, setData];
}
