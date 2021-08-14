import React from 'react';
import ReactDOM from 'react-dom';

import { initShareService } from '@shared-service/react';

import App from './App';

const worker = new SharedWorker('./worker.js', { type: 'module' });
initShareService(worker);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
