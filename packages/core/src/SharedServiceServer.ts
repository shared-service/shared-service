import { EventEmitter } from 'events';
import { ClientPort } from './ClientPort';
import { actionTypes } from './actionTypes';

import { ExecutorsMap } from './interfaces';
export class SharedServiceServer<T = any> extends EventEmitter {
  protected _ports: ClientPort[] = [];
  protected _executors: ExecutorsMap = {};
  protected _state: T;

  constructor(initState: T) {
    super();
    this._state = initState || {} as T;
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

    port.on(actionTypes.execute, async ({ funcName, args, requestId }) => {
      const executor = this._executors[funcName];
      if (!executor) {
        port.response({ requestId, result: null, error: new Error('Function not found') });
        return;
      }
      let result: unknown;
      let error: Error | null = null;
      try {
        result = await executor(...args);
      } catch (err) {
        result = null;
        error = err as Error;
      }
      port.response({ requestId, result, error });
    });
  }

  getState<K extends keyof T>(key: K): T[K] {
    return this._state[key];
  }

  setState<K extends keyof T & string>(key: K, state: T[K]) {
    this._state[key] = state;
    this._ports.forEach((port) => {
      port.pushState(key, state);
    });
    this.emit('stateChange', { key, state });
  }

  registerExecutor(funcName: string, func: (...args: any[]) => Promise<any>) {
    if (this._executors[funcName]) {
      throw new Error(`${funcName} is registered.`);
    }
    this._executors[funcName] = func;
  }

  unregisterExecutor(funcName: string) {
    delete this._executors[funcName];
  }

  dispose() {
    this._executors = {};
    this._ports.forEach((port) => {
      port.removeAllListeners();
      port.dispose();
    });
    this._ports = [];
  }
}
