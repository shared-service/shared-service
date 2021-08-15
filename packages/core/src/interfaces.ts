export interface MessageRequestPayload {
  action: string;
  key?: string;
  state?: any;
  funcName?: string;
  args?: any[];
}

export interface MessageRequest {
  requestId: string;
  payload: MessageRequestPayload;
}

export interface TransportInterface {
  request({ payload }): Promise<any>;
  response({ requestId, result, error }): void;
  push({ payload }): void;
}

export interface StateKeysMap {
  [key: string]: boolean;
}

export interface ExecutorsMap {
  [funcName: string]: (...args: any[]) => Promise<any>;
}
