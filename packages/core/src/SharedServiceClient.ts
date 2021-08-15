import { EventEmitter } from 'events';
import { Transport } from './Transport';
import { actionTypes } from './actionTypes';
export class SharedServiceClient extends EventEmitter {
  protected _worker: SharedWorker;
  protected _transport: Transport;

  constructor({ worker }: { worker: SharedWorker }) {
    super();

    this._worker = worker;
    this._transport = new Transport({ port: worker.port });
    this._transport.on(this._transport.events.push, (message) => {
      if (message.action === actionTypes.setState) {
        this.emit(message.key, message.state);
      }
    });
    worker.port.start();
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

  async setState(key, state) {
    await this._transport.request({
      payload: {
        action: actionTypes.setState,
        key,
        state,
      }
    });
  }

  async getState(key) {
    const state = await this._transport.request({
      payload: {
        action: actionTypes.getState,
        key,
      }
    });
    return state;
  }

  async execute(funcName: string, args?: any[]) {
    return this._transport.request({
      payload: {
        action: actionTypes.execute,
        funcName,
        args,
      }
    });
  }
}
