import { actionTypes } from "./actionTypes";

export type MessageRequestAction = typeof actionTypes[keyof typeof actionTypes];

export interface MessageRequestPayload<T = any> {
  action: MessageRequestAction;
  key?: string;
  state?: T;
  funcName?: string;
  args?: any[];
}

export interface MessageRequest {
  requestId: string;
  payload: MessageRequestPayload;
}

export interface TransportInterface {
  request<T = any>({ payload }: { payload: MessageRequestPayload<T> }): Promise<T>;
  response({ requestId, result, error }: { requestId: string, result: any, error: Error | null }): void;
  push({ payload }: { payload: MessageRequestPayload }): void;
}

export interface StateKeysMap {
  [key: string]: boolean;
}

export interface ExecutorsMap {
  [funcName: string]: (...args: any[]) => Promise<any>;
}
