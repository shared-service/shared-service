import uuid from 'uuid';
import { EventEmitter } from 'events';

import { eventTypes } from './eventTypes';

import { TransportInterface, MessageRequestPayload } from './interfaces';

export class Transport extends EventEmitter implements TransportInterface {
  private _timeout: number;
  private _port: MessagePort;
  private _requests: Map<string, any>;
  constructor(
    { port, timeout = 15 * 1000 }: { port: MessagePort, timeout?: number }
  ) {
    super();

    this._timeout = timeout;
    this._port = port;
    this._requests = new Map();
    this._port.addEventListener('message', this._onMessage);
  }

  _onMessage = (e) => {
    const data  = e.data;
    // console.log(data);
    if (data.type === this.events.request) {
      this.emit(this.events.request, { requestId: data.requestId, payload: data.payload });
      return;
    }
    if (data.type === this.events.response) {
      const requestId = data.requestId;
      if (requestId && this._requests.has(requestId)) {
        const error = data.error;
        if (error) {
          this._requests.get(requestId).reject(new Error(error));
        } else {
          const result = data.result
          this._requests.get(requestId).resolve(result);
        }
      }
      return;
    }
    if (data.type === this.events.push) {
      this.emit(this.events.push, data.payload);
    }
  }

  request<T>({ payload }: { payload: MessageRequestPayload<T> }): Promise<T> {
    const requestId = uuid.v4();
    let promise = new Promise((resolve, reject) => {
      this._requests.set(requestId, {
        resolve,
        reject,
      });
      this._port.postMessage({
        type: this.events.request,
        payload,
        requestId,
      });
    });
    let timeout = setTimeout(() => {
      timeout = null;
      this._requests.get(requestId).reject(new Error(this.events.timeout));
    }, this._timeout);
    promise = promise
      .then((result) => {
        if (timeout !== undefined && timeout !== null) clearTimeout(timeout);
        this._requests.delete(requestId);
        return Promise.resolve(result);
      })
      .catch((error) => {
        if (timeout !== undefined && timeout !== null) clearTimeout(timeout);
        this._requests.delete(requestId);
        return Promise.reject(error);
      });
    return promise;
  }

  response({ requestId, result, error }: { requestId: string, result: any, error: Error | null }) {
    this._port.postMessage({
      type: this.events.response,
      requestId,
      result: result,
      error: error,
    });
  }

  push({ payload }: { payload: MessageRequestPayload }) {
    this._port.postMessage({
      type: this.events.push,
      payload,
    });
  }

  dispose() {
    this._requests = new Map();;
    this._port.removeEventListener('message', this._onMessage);
  }

  get events() {
    return eventTypes;
  }

  get port() {
    return this._port;
  }
}
