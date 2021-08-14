import { Transport } from './Transport';
import { SharedServiceServer } from './SharedServiceServer';

export class SharedServiceWorker extends SharedServiceServer {
  onConnect(e: MessageEvent) {
    const port = e.ports[0];
    const transport = new Transport({ port });
    this._transports.push(transport);
    transport.on(transport.events.push, (message) => {
      if (message.action === 'close') {
        this._transports = this._transports.filter(p => p !== transport);
        transport.removeAllListeners();
        transport.dispose();
      }
    });

    transport.on(transport.events.request, (request) => {
      this._handleRequest(transport, request);
    });
    port.start();
  }
}
