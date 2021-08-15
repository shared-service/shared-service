import React from 'react';
import ReactDOM from 'react-dom';

import { initSharedService } from '@shared-service/react';

import App from './App';

if (typeof SharedWorker !== 'undefined') {
  const worker = new SharedWorker('./worker.js', { type: 'module' });
  initSharedService(worker);
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
