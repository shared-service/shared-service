import { useState, useEffect } from 'react';
import { SharedServiceClient  } from '@shared-service/core';

let shareService: SharedServiceClient;

export function initShareService(worker: SharedWorker) {
  shareService = new SharedServiceClient({ worker });
}

export function useSharedService<T>(key: string, initialData: T) {
  const [data, setState] = useState(initialData);

  useEffect(() => {
    if (!shareService) {
      throw new Error('Share service is not initialized.');
    }
    shareService.getState(key).then(lastData => {
      if (lastData) {
        setState(lastData as T);
      }
    }).catch((e) => {
      console.error(e);
    });
    const onStateChange = (data) => {
      setState(data);
    }
    shareService.on(key, onStateChange);
    return () => {
      shareService.off(key, onStateChange);
    };
  }, []);

  const setData = (newData) => {
    return shareService.setState(key, newData);
  }
  return [data, setData];
}
