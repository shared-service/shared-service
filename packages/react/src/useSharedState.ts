import { useState, useEffect } from 'react';
import { SharedServiceClient  } from '@shared-service/core';

let sharedService: SharedServiceClient;
let environment;
if (typeof window !== 'undefined') {
  environment = window;
}
if (typeof global !== 'undefined') {
  environment = global.window || global;
}

export function initSharedService({ port }: { port: MessagePort }) {
  sharedService = new SharedServiceClient({ port });
  environment.$sharedService = sharedService;
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
