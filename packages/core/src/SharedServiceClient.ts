import { EventEmitter } from 'events';
import { Transport } from './Transport';

export class SharedServiceClient extends EventEmitter {
  protected _worker: SharedWorker;
  protected _transport: Transport;

  constructor({ worker }: { worker: SharedWorker }) {
    super();

    this._worker = worker;
    this._transport = new Transport({ port: worker.port });
    this._transport.on(this._transport.events.push, (message) => {
      if (message.action === 'setState') {
        this.emit(message.key, message.state);
      }
    });
    worker.port.start();
  }

  async setState(key, state) {
    await this._transport.request({
      payload: {
        action: 'setState',
        key,
        state,
      }
    });
  }

  async getState(key) {
    const state = await this._transport.request({
      payload: {
        action: 'getState',
        key,
      }
    });
    return state;
  }
}
