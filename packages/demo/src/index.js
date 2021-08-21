import React from 'react';
import ReactDOM from 'react-dom';

import { initSharedService } from '@shared-service/react';
import { initSharedServiceServer } from './sharedServiceServer';

import App from './App';

if (typeof SharedWorker !== 'undefined') {
  const worker = new SharedWorker('./sharedWorker.js', { type: 'module' });
  initSharedService({ port: worker.port });
} else {
  // Make app work at Safari
  const sharedServiceServer = initSharedServiceServer();
  sharedServiceServer.onNewPort(window);
  initSharedService({ port: window });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
