import { SharedServiceWorker } from '@shared-service/core';

console.log('worker');

const sharedService = new SharedServiceWorker({
  tasks: [
    { id: 0, name: "Eat", completed: true },
    { id: 1, name: "Sleep", completed: false },
    { id: 2, name: "Repeat", completed: false }
  ],
});

// @ts-ignore

/*global onconnect*/
onconnect = function(e) {
  sharedService.onConnect(e);
};
