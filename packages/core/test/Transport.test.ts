import { Transport } from '../src/Transport';
import { eventTypes } from '../src/eventTypes';

describe('Transport', () => {
  let transport: Transport;
  let mockPort: MessagePort;
  let messageEventHandler: (event: MessageEvent) => void;

  beforeEach(() => {
    mockPort = {
      addEventListener: jest.fn((event, handler) => {
        if (event === 'message') {
          messageEventHandler = handler as (event: MessageEvent) => void;
        }
      }),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
      start: jest.fn(),
      close: jest.fn(),
    } as unknown as MessagePort;

    jest.clearAllMocks();
    transport = new Transport({ port: mockPort });
  });

  it('should be defined', () => {
    expect(transport).toBeDefined();
  });

  it('should add a message event listener to the port', () => {
    expect(mockPort.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  describe('request', () => {
    it('should send a request and resolve with a response', async () => {
      const payload = { action: 'testAction' };
      const promise = transport.request({ payload });

      expect(mockPort.postMessage).toHaveBeenCalledWith({
        type: eventTypes.request,
        requestId: expect.any(String),
        payload,
      });

      const requestId = (mockPort.postMessage as jest.Mock).mock.calls[0][0].requestId;
      const responseData = { result: 'success' };
      messageEventHandler({ data: { type: eventTypes.response, requestId, result: responseData } } as MessageEvent);

      await expect(promise).resolves.toEqual(responseData);
    });

    it('should send a request and reject with an error', async () => {
      const payload = { action: 'testAction' };
      const promise = transport.request({ payload });

      const requestId = (mockPort.postMessage as jest.Mock).mock.calls[0][0].requestId;
      const error = new Error('Something went wrong');
      messageEventHandler({ data: { type: eventTypes.response, requestId, error: error.message } } as MessageEvent);

      await expect(promise).rejects.toThrow('Something went wrong');
    });
  });

  describe('response', () => {
    it('should send a response message', () => {
      const responseData = { requestId: '123', result: 'data', error: null };
      transport.response(responseData);
      expect(mockPort.postMessage).toHaveBeenCalledWith({
        type: eventTypes.response,
        ...responseData,
      });
    });
  });

  describe('push', () => {
    it('should send a push message', () => {
      const payload = { action: 'update', data: 'newData' };
      transport.push({ payload });
      expect(mockPort.postMessage).toHaveBeenCalledWith({
        type: eventTypes.push,
        payload,
      });
    });
  });

  describe('dispose', () => {
    it('should remove the message event listener', () => {
      transport.dispose();
      expect(mockPort.removeEventListener).toHaveBeenCalledWith('message', messageEventHandler);
    });
  });

  describe('message event handling', () => {
    it('should emit a request event for incoming request messages', () => {
      const requestSpy = jest.fn();
      transport.on(transport.events.request, requestSpy);
      const requestData = { type: eventTypes.request, requestId: 'req1', payload: { action: 'getData' } };
      messageEventHandler({ data: requestData } as MessageEvent);
      expect(requestSpy).toHaveBeenCalledWith({ requestId: requestData.requestId, payload: requestData.payload });
    });

    it('should emit a push event for incoming push messages', () => {
      const pushSpy = jest.fn();
      transport.on(transport.events.push, pushSpy);
      const pushData = { type: eventTypes.push, payload: { action: 'notification' } };
      messageEventHandler({ data: pushData } as MessageEvent);
      expect(pushSpy).toHaveBeenCalledWith(pushData.payload);
    });

    it('should handle response messages internally', async () => {
      const payload = { action: 'someAction' };
      const promise = transport.request({ payload });
      const requestId = (mockPort.postMessage as jest.Mock).mock.calls[0][0].requestId;
      const responseData = { result: 'handled' };
      messageEventHandler({ data: { type: eventTypes.response, requestId, result: responseData } } as MessageEvent);
      await expect(promise).resolves.toEqual(responseData);
    });

    it('should ignore unknown message types', () => {
      const requestSpy = jest.fn();
      const pushSpy = jest.fn();
      transport.on(transport.events.request, requestSpy);
      transport.on(transport.events.push, pushSpy);

      messageEventHandler({ data: { type: 'unknown', someData: 'abc' } } as MessageEvent);

      expect(requestSpy).not.toHaveBeenCalled();
      expect(pushSpy).not.toHaveBeenCalled();
    });
  });
});
