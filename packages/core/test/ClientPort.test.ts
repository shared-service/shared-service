import { ClientPort } from '../src/ClientPort';
import { Transport } from '../src/Transport';
import { actionTypes } from '../src/actionTypes';

// Mock the Transport class
jest.mock('../src/Transport', () => {
  const EventEmitter = require('events');
  return {
    Transport: jest.fn().mockImplementation(() => {
      const emitter = new EventEmitter();
      emitter.events = {
        push: 'push',
        request: 'request',
      };
      emitter.response = jest.fn();
      emitter.dispose = jest.fn();
      emitter.removeAllListeners = jest.fn();
      emitter.push = jest.fn();
      return emitter;
    }),
  };
});

describe('ClientPort', () => {
  let clientPort: ClientPort;
  let mockPort: MessagePort;
  let mockTransportInstance: jest.Mocked<Transport>;

  beforeEach(() => {
    mockPort = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
      start: jest.fn(),
      close: jest.fn(),
    } as unknown as MessagePort;

    // Clear all mocks before each test
    jest.clearAllMocks();

    clientPort = new ClientPort(mockPort);
    // Get the mocked Transport instance
    mockTransportInstance = (Transport as jest.MockedClass<typeof Transport>).mock.results[0].value;
  });

  it('should be defined', () => {
    expect(clientPort).toBeDefined();
  });

  it('should initialize Transport with the given port', () => {
    expect(Transport).toHaveBeenCalledWith({ port: mockPort });
  });

  it('should call port.start() if it\'s a function', () => {
    expect(mockPort.start).toHaveBeenCalled();
  });

  it('should handle close action from transport push event', () => {
    const closeSpy = jest.fn();
    clientPort.on(actionTypes.close, closeSpy);
    mockTransportInstance.emit(mockTransportInstance.events.push, { action: actionTypes.close });
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should handle unsubscribe action from transport push event', () => {
    // Simulate a subscribed key
    (clientPort as any)._subscribedStateKeys['testKey'] = true;
    mockTransportInstance.emit(mockTransportInstance.events.push, { action: actionTypes.unsubscribe, key: 'testKey' });
    expect((clientPort as any)._subscribedStateKeys['testKey']).toBeUndefined();
  });

  it('should handle getState action from transport request event', () => {
    const getStateSpy = jest.fn();
    clientPort.on(actionTypes.getState, getStateSpy);
    const request = { requestId: '123', payload: { action: actionTypes.getState, key: 'someKey' } };
    mockTransportInstance.emit(mockTransportInstance.events.request, request);
    expect(getStateSpy).toHaveBeenCalledWith({ key: 'someKey', requestId: '123' });
    expect((clientPort as any)._subscribedStateKeys['someKey']).toBe(true);
  });

  it('should handle setState action from transport request event', () => {
    const setStateSpy = jest.fn();
    clientPort.on(actionTypes.setState, setStateSpy);
    const request = { requestId: '456', payload: { action: actionTypes.setState, key: 'anotherKey', state: { value: 1 } } };
    mockTransportInstance.emit(mockTransportInstance.events.request, request);
    expect(setStateSpy).toHaveBeenCalledWith({ key: 'anotherKey', state: { value: 1 }, requestId: '456' });
  });

  it('should handle execute action from transport request event', () => {
    const executeSpy = jest.fn();
    clientPort.on(actionTypes.execute, executeSpy);
    const request = { requestId: '789', payload: { action: actionTypes.execute, funcName: 'myFunc', args: [1, 2] } };
    mockTransportInstance.emit(mockTransportInstance.events.request, request);
    expect(executeSpy).toHaveBeenCalledWith({ funcName: 'myFunc', args: [1, 2], requestId: '789' });
  });

  it('should call _transport.response with correct arguments', () => {
    const responseArgs = { requestId: 'req1', result: 'data', error: null };
    clientPort.response(responseArgs);
    expect(mockTransportInstance.response).toHaveBeenCalledWith(responseArgs);
  });

  it('should dispose the transport and remove all listeners on dispose', () => {
    clientPort.dispose();
    expect(mockTransportInstance.removeAllListeners).toHaveBeenCalled();
    expect(mockTransportInstance.dispose).toHaveBeenCalled();
    expect((clientPort as any)._transport).toBeNull();
  });

  it('should push state if key is subscribed', () => {
    (clientPort as any)._subscribedStateKeys['subscribedKey'] = true;
    clientPort.pushState('subscribedKey', { data: 'test' });
    expect(mockTransportInstance.push).toHaveBeenCalledWith({
      payload: {
        action: actionTypes.setState,
        key: 'subscribedKey',
        state: { data: 'test' },
      },
    });
  });

  it('should not push state if key is not subscribed', () => {
    clientPort.pushState('unsubscribedKey', { data: 'test' });
    expect(mockTransportInstance.push).not.toHaveBeenCalled();
  });
});
