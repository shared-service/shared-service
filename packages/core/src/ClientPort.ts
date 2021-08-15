import { EventEmitter } from 'events';
import { Transport } from './Transport';
import { MessageRequest } from './interfaces';
import { actionTypes } from './actionTypes';

interface StateKeysMap {
  [key: string]: boolean;
}

export class ClientPort extends EventEmitter {
  protected _transport: Transport;
  protected _subscribedStateKeys: StateKeysMap = {};

  constructor(port: MessagePort) {
    super();
    this._transport = new Transport({ port });

    this._transport.on(this._transport.events.push, (message) => {
      if (message.action === actionTypes.close) {
        this.emit(actionTypes.close);
      }
      if (message.action === actionTypes.unsubscribe) {
        delete this._subscribedStateKeys[message.key];
      }
    });
    this._transport.on(this._transport.events.request, (request) => {
      this._handleRequest(request);
    });
    port.start();
  }

  _handleRequest(request: MessageRequest) {
    const payload = request.payload;
    if (payload.action === actionTypes.getState) {
      this._subscribedStateKeys[payload.key] = true;
      this.emit(actionTypes.getState, {
        key: payload.key,
        requestId: request.requestId,
      });
      return;
    }
    if (payload.action === actionTypes.setState) {
      this.emit(actionTypes.setState, {
        key: payload.key,
        state: payload.state,
        requestId: request.requestId,
      });
      return;
    }
  }

  response({ requestId, result, error }) {
    this._transport.response({ requestId, result, error });
  }

  dispose() {
    this._transport.removeAllListeners();
    this._transport.dispose();
    this._transport = null;
  }

  pushState(key: string, state) {
    if (!this._subscribedStateKeys[key]) {
      return;
    }
    this._transport.push({
      payload: {
        action: actionTypes.setState,
        key,
        state,
      },
    });
  }
}
