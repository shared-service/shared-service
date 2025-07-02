import { SharedServiceClient } from '../src/SharedServiceClient';
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
      emitter.request = jest.fn();
      emitter.push = jest.fn();
      return emitter;
    }),
  };
});

describe('SharedServiceClient', () => {
  let client: SharedServiceClient;
  let mockPort: MessagePort;
  let mockTransportInstance: jest.Mocked<Transport>;

  beforeEach(() => {
    mockPort = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
      start: jest.fn(),
      close: jest.fn(),
    } as unknown as MessagePort; // Mock MessagePort

    // Clear all mocks before each test
    jest.clearAllMocks();

    client = new SharedServiceClient({ port: mockPort });
    mockTransportInstance = (Transport as jest.MockedClass<typeof Transport>).mock.results[0].value;
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should initialize Transport with the given port', () => {
    expect(Transport).toHaveBeenCalledWith({ port: mockPort });
  });

  it('should call port.start() if it\'s a function', () => {
    expect(mockPort.start).toHaveBeenCalled();
  });

  it('should emit state on setState push event', () => {
    const handler = jest.fn();
    client.on('testKey', handler);
    mockTransportInstance.emit(mockTransportInstance.events.push, { action: actionTypes.setState, key: 'testKey', state: 'testValue' });
    expect(handler).toHaveBeenCalledWith('testValue');
  });

  describe('unload listener', () => {
    let addEventListenerSpy: jest.SpyInstance;
    let newClient: SharedServiceClient;
    let innerMockTransportInstance: jest.Mocked<Transport>; // New variable for inner scope

    beforeEach(() => {
      addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      newClient = new SharedServiceClient({ port: mockPort }); // Create new client here
      // Get the transport instance for the new client. This will be the *second* Transport instance created.
      innerMockTransportInstance = (Transport as jest.MockedClass<typeof Transport>).mock.results[1].value;
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
    });

    it('should add unload event listener to window', () => {
      expect(addEventListenerSpy).toHaveBeenCalledWith('unload', expect.any(Function));
    });

    it('should push close action on unload', () => {
      const unloadHandler = (addEventListenerSpy.mock.calls.find(call => call[0] === 'unload') || [])[1];
      if (unloadHandler) {
        unloadHandler();
        expect(innerMockTransportInstance.push).toHaveBeenCalledWith({
          payload: {
            action: actionTypes.close,
          },
        });
      }
    });
  });

  describe('subscribe', () => {
    it('should subscribe to a key and return an unsubscribe function', () => {
      const handler = jest.fn();
      const unsubscribe = client.subscribe('testKey', handler);
      client.emit('testKey', 'someData');
      expect(handler).toHaveBeenCalledWith('someData');

      unsubscribe();
      client.emit('testKey', 'someOtherData');
      expect(handler).not.toHaveBeenCalledWith('someOtherData');
    });

    it('should send unsubscribe action when unsubscribe function is called', () => {
      const handler = jest.fn();
      const unsubscribe = client.subscribe('testKey', handler);
      unsubscribe();
      expect(mockTransportInstance.push).toHaveBeenCalledWith({
        payload: {
          action: actionTypes.unsubscribe,
          key: 'testKey',
        },
      });
    });
  });

  describe('setState', () => {
    it('should call transport.request with setState action', async () => {
      await client.setState('testKey', 'testValue');
      expect(mockTransportInstance.request).toHaveBeenCalledWith({
        payload: {
          action: actionTypes.setState,
          key: 'testKey',
          state: 'testValue',
        },
      });
    });
  });

  describe('getState', () => {
    it('should call transport.request with getState action and return state', async () => {
      mockTransportInstance.request.mockResolvedValueOnce('retrievedState');
      const state = await client.getState('testKey');
      expect(mockTransportInstance.request).toHaveBeenCalledWith({
        payload: {
          action: actionTypes.getState,
          key: 'testKey',
        },
      });
      expect(state).toBe('retrievedState');
    });
  });

  describe('execute', () => {
    it('should call transport.request with execute action and return result', async () => {
      mockTransportInstance.request.mockResolvedValueOnce('executionResult');
      const result = await client.execute('testFunc', [1, 2]);
      expect(mockTransportInstance.request).toHaveBeenCalledWith({
        payload: {
          action: actionTypes.execute,
          funcName: 'testFunc',
          args: [1, 2],
        },
      });
      expect(result).toBe('executionResult');
    });
  });
});
