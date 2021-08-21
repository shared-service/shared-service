# SharedService

[![Build Status](https://github.com/shared-service/shared-service/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shared-service/shared-service/actions)
[![NPM Version](https://img.shields.io/npm/v/@shared-service/core.svg?style=flat-square)](https://www.npmjs.com/package/@shared-service/core)
[![NPM Version](https://img.shields.io/npm/v/@shared-service/react.svg?style=flat-square)](https://www.npmjs.com/package/@shared-service/react)

SharedService is a Javascript library for building multiple tabs app.

* Use `SharedWorker` to share UI state between tabs.
* Make all data and services in `SharedWorker`.

## Demo project

A TODO demo project [here](https://github.com/shared-service/shared-service/tree/main/packages/demo):

[Online demo](https://shared-service.github.io/todo-demo/) open in multiple tabs

## Installation

```
$ npm install @shared-service/core @shared-service/react
```

## Get Started

1. In `React` app root endpoint:

```js
import React from 'react';
import ReactDOM from 'react-dom';

import { initSharedService } from '@shared-service/react';

import App from './App';

const worker = new SharedWorker('./worker.js', { type: 'module' });
initSharedService({ port: worker.port });

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

2. In SharedWorker file `worker.js`:

```js
import { SharedServiceServer } from '@shared-service/core';

const sharedServiceServer = new SharedServiceServer({
  count: 0,
});

/*global onconnect*/
onconnect = function(e) {
  sharedServiceServer.onNewPort(e.ports[0]);
};

```

3. In React component:

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

## Advanced

### Run actions in SharedService

In SharedWorker file `worker.js`:

```js
sharedServiceServer.registerExecutor('increaseCount', () => {
  const count = sharedServiceServer.getState('count');
  sharedServiceServer.setState('count', count + 1);
});
sharedServiceServer.registerExecutor('markAsCompleted', (id) => {
  const tasks = sharedServiceServer.getState('tasks');
  const updatedTasks = tasks.map(task => {
    if (id === task.id) {
      return {...task, completed: true }
    }
    return task;
  });
  sharedServiceServer.setState('tasks', updatedTasks);
});
```

In React component:

```js
import React from 'react';
import { useSharedState } from '@shared-service/react';

export default function App() {
  const [count] = useSharedState('count', 0);
  const increaseCount = () => {
    return $sharedService.execute('increaseCount');
  };
  const markAsCompleted = () => {
    return $sharedService.execute('markAsCompleted', ['todo-id']);
  };
  return (
    <div className="App">
      <div className="Counter">
        <p>
          Counter:
          {count}
        </p>
        <button type="button" onClick={increaseCount}>
          +1 to global
        </button>
        <button type="button" onClick={markAsCompleted}>
          Click to mark as completed
        </button>
      </div>
    </div>
  );
}
```

### Data persistence

In SharedWorker file `worker.js`:

```js
import localforage from 'localforage';

async function initStorage() {
  const storage = localforage.createInstance({
    name: 'myApp',
  });
  await storage.ready();
  const keys = await storage.keys();
  const promises = keys.map((key) =>
    storage.getItem(key).then((data) => {
      sharedServiceServer.setState(key, data);
    }),
  );
  await Promise.all(promises);
  sharedServiceServer.on('stateChange', ({ key, state }) => {
    storage.setItem(key, state);
  });
}

initStorage();
```

## TODO

- [ ] Make it work at Safari?
- [ ] Support Vue
- [ ] Run `ShareService` at browser extension background and normal page
- [ ] Run `ShareService` at Electron main and render process
