import { EventEmitter } from 'events';
import { Transport } from './Transport';
import { actionTypes } from './actionTypes';
export class SharedServiceClient extends EventEmitter {
  protected _port: MessagePort;
  protected _transport: Transport;

  constructor({ port }: { port: MessagePort }) {
    super();

    this._port = port;
    this._transport = new Transport({ port });
    this._transport.on(this._transport.events.push, (message) => {
      if (message.action === actionTypes.setState) {
        this.emit(message.key, message.state);
      }
    });
    if (typeof port.start === 'function') {
      port.start();
    }
    window.addEventListener('unload', () => {
      this._transport.push({
        payload: {
          action: actionTypes.close,
        }
      });
    });
  }

  subscribe<T>(key: string, func: (data: T) => void): () => void {
    this.on(key, func);
    return () => {
      this.off(key, func);
      this._transport.push({
        payload: {
          action: actionTypes.unsubscribe,
          key,
        }
      });
    };
  }

  async setState<T>(key: string, state: T) {
    await this._transport.request({
      payload: {
        action: actionTypes.setState,
        key,
        state,
      }
    });
  }

  async getState<T>(key: string): Promise<T> {
    const state = await this._transport.request({
      payload: {
        action: actionTypes.getState,
        key,
      }
    });
    return state as T;
  }

  async execute<T = any>(funcName: string, args?: any[]): Promise<T> {
    return this._transport.request<T>({
      payload: {
        action: actionTypes.execute,
        funcName,
        args,
      }
    });
  }
}
