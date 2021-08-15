import { SharedServiceServer } from './SharedServiceServer';

export class SharedServiceWorker extends SharedServiceServer {
  onConnect(e: MessageEvent) {
    this.onNewPort(e.ports[0]);
  }
}
