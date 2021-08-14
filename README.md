# SharedService

SharedService is a Javascript library for building multiple tabs app.

* Use `SharedWorker` to share UI state between tabs.
* Make all data and services in `SharedWorker`.

## Installation

```
$ npm install @shared-service/core @shared-service/react
```

## Usage

In `React` app root endpoint:

```js
import React from 'react';
import ReactDOM from 'react-dom';

import { initSharedService } from '@shared-service/react';

import App from './App';

const worker = new SharedWorker('./worker.js', { type: 'module' });
initSharedService(worker);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

In SharedWorker file `worker.js`:

```js
import { SharedServiceWorker } from '@shared-service/core';

const sharedService = new SharedServiceWorker({
  count: 0,
});

/*global onconnect*/
onconnect = function(e) {
  sharedService.onConnect(e);
};

```

In React component:

```js
import React from 'react';
import { useSharedState } from '@shared-service/react';

export default function App() {
  const [count, setCount] = useSharedState('count', 0);
  return (
    <div className="App">
      <div className="Counter">
        <p>
          Counter:
          {count}
        </p>
        <button type="button" onClick={() => setCount(count + 1)}>
          +1 to global
        </button>
      </div>
    </div>
  );
}
```
