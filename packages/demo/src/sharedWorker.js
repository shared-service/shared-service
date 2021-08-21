import { initSharedServiceServer } from './sharedServiceServer';

console.log('TODO demo with SharedService');

const sharedServiceServer = initSharedServiceServer();
// eslint-disable-next-line no-restricted-globals
self.$sharedServiceServer = sharedServiceServer;

// Connect sharedService with SharedWorker onconnect API
// eslint-disable-next-line no-restricted-globals
self.onconnect = function(e) {
  sharedServiceServer.onNewPort(e.ports[0]);
};
