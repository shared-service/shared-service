import { EventEmitter } from 'events';
import { ClientPort } from './ClientPort';
import { actionTypes } from './actionTypes';

export class SharedServiceServer extends EventEmitter {
  protected _ports: ClientPort[] = [];
  protected _state: any;

  constructor(initState) {
    super();
    this._state = initState || {};
  }

  onNewPort(rawPort: MessagePort) {
    const port = new ClientPort(rawPort);
    this._ports.push(port);
    port.on(actionTypes.close, () => {
      this._ports = this._ports.filter(p => p !== port);
      port.removeAllListeners();
      port.dispose();
    });

    port.on(actionTypes.getState, ({ key, requestId }) => {
      const state = this.getState(key);
      port.response({ requestId, result: state, error: null });
    });

    port.on(actionTypes.setState, ({ key, state, requestId }) => {
      this.setState(key, state);
      port.response({ requestId, result: 'ok', error: null });
    });
  }

  getState(key) {
    return this._state[key];
  }

  setState(key, state) {
    if (typeof key !== 'string') {
      return;
    }
    this._state[key] = state;
    this._ports.forEach((port) => {
      port.pushState(key, state);
    });
    this.emit('stateChange', { key, state });
  }
}
