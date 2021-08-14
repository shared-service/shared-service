import { MessageRequest, TransportInterface } from './interfaces';

export class SharedServiceServer {
  protected _transports: TransportInterface[] = [];
  protected _state: any;

  constructor(initState) {
    this._state = initState || {};
  }

  _handleRequest(portTransport: TransportInterface, request: MessageRequest) {
    console.log(request);
    const payload = request.payload;
    if (payload.action === 'getState') {
      const state = this._state[payload.key];
      portTransport.response({
        requestId: request.requestId,
        result: state,
        error: null,
      });
      return;
    }
    if (payload.action === 'setState') {
      this._state[payload.key] = payload.state;
      console.log(this._state);
      portTransport.response({
        requestId: request.requestId,
        result: 'ok',
        error: null,
      });
      this._transports.forEach((transport) => {
        transport.push({
          payload: {
            action: 'setState',
            key: payload.key,
            state: payload.state,
          },
        });
      });
      return;
    }
  }
}
