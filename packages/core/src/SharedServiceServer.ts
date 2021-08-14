import { EventEmitter } from 'events';

import { MessageRequest, TransportInterface } from './interfaces';

export class SharedServiceServer extends EventEmitter {
  protected _transports: TransportInterface[] = [];
  protected _state: any;

  constructor(initState) {
    super();
    this._state = initState || {};
  }

  _handleRequest(transport: TransportInterface, request: MessageRequest) {
    const payload = request.payload;
    if (payload.action === 'getState') {
      const state = this.getState(payload.key);
      transport.response({
        requestId: request.requestId,
        result: state,
        error: null,
      });
      return;
    }
    if (payload.action === 'setState') {
      this.setState(payload.key, payload.state);
      transport.response({
        requestId: request.requestId,
        result: 'ok',
        error: null,
      });
      return;
    }
  }

  getState(key) {
    return this._state[key];
  }

  setState(key, state) {
    if (typeof key !== 'string') {
      return;
    }
    this._state[key] = state;
    this._transports.forEach((transport) => {
      transport.push({
        payload: {
          action: 'setState',
          key,
          state,
        },
      });
    });
    this.emit('stateChange', { key, state });
  }
}
