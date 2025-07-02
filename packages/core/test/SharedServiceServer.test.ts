import { SharedServiceServer } from '../src/SharedServiceServer';
import { ClientPort } from '../src/ClientPort';
import { EventEmitter } from 'events';
import { actionTypes } from '../src/actionTypes';

// Move mockClientPortInstance to top-level scope
let mockClientPortInstance: jest.Mocked<ClientPort>;
let lastEmitter: EventEmitter | null = null;

jest.mock('../src/ClientPort', () => {
  const EventEmitter = require('events');
  // Use the top-level mockClientPortInstance
  const MockClientPort = jest.fn().mockImplementation(function(this: ClientPort, rawPort: MessagePort) {
    const emitter = new EventEmitter();
    this.on = jest.fn((event, listener) => { emitter.on(event, listener); return this as any; });
    this.response = jest.fn();
    this.pushState = jest.fn();
    this.removeAllListeners = jest.fn((event?: string | symbol) => { emitter.removeAllListeners(event); return this; });
    this.dispose = jest.fn();
    (this as any)._emitter = emitter; // Expose emitter for triggering events
    lastEmitter = emitter;
    // Assign the newly created mock instance to the global variable
    Object.assign(this, mockClientPortInstance);
  });
  return {
    ClientPort: MockClientPort,
  };
});

describe('SharedServiceServer', () => {
  let server: SharedServiceServer;

  beforeEach(() => {
    // Reset the mockClientPortInstance before each test
    mockClientPortInstance = {
      response: jest.fn(),
      pushState: jest.fn(),
      removeAllListeners: jest.fn(),
      dispose: jest.fn(),
    } as unknown as jest.Mocked<ClientPort>;

    jest.clearAllMocks();
    server = new SharedServiceServer({});
  });

  it('should be defined', () => {
    expect(server).toBeDefined();
  });

  it('should add a new port and handle close action', () => {
    server.onNewPort({} as MessagePort);
    expect(server['_ports'].length).toBe(1);

    (server['_ports'][0] as any)._emitter.emit(actionTypes.close);

    expect(server['_ports'].length).toBe(0);
  });

  it('should handle getState action', () => {
    server.onNewPort({} as MessagePort);
    server['_state'] = { testKey: 'testValue' };

    (server['_ports'][0] as any)._emitter.emit(actionTypes.getState, { key: 'testKey', requestId: '123' });

    expect(mockClientPortInstance.response).toHaveBeenCalledWith({
      requestId: '123',
      result: 'testValue',
      error: null,
    });
  });

  it('should handle setState action', () => {
    const emitSpy = jest.spyOn(server, 'emit');
    server.onNewPort({} as MessagePort);

    (server['_ports'][0] as any)._emitter.emit(actionTypes.setState, { key: 'testKey', state: 'newValue', requestId: '123' });

    expect(server['_state']['testKey']).toBe('newValue');
    expect(mockClientPortInstance.response).toHaveBeenCalledWith({
      requestId: '123',
      result: 'ok',
      error: null,
    });
    expect(emitSpy).toHaveBeenCalledWith('stateChange', { key: 'testKey', state: 'newValue' });
  });

  it('should handle execute action with existing executor', async () => {
    const mockExecutor = jest.fn().mockResolvedValue('executorResult');
    server.registerExecutor('testFunc', mockExecutor);
    server.onNewPort({} as MessagePort);

    await (server['_ports'][0] as any)._emitter.emit(actionTypes.execute, { funcName: 'testFunc', args: [1, 2], requestId: '123' });

    expect(mockExecutor).toHaveBeenCalledWith(1, 2);
    expect(mockClientPortInstance.response).toHaveBeenCalledWith({
      requestId: '123',
      result: 'executorResult',
      error: null,
    });
  });

  it('should handle execute action with non-existing executor', async () => {
    server.onNewPort({} as MessagePort);

    await (server['_ports'][0] as any)._emitter.emit(actionTypes.execute, { funcName: 'nonExistentFunc', args: [], requestId: '123' });

    expect(mockClientPortInstance.response).toHaveBeenCalledWith({
      requestId: '123',
      result: null,
      error: expect.any(Error),
    });
    expect((mockClientPortInstance.response as jest.Mock).mock.calls[0][0].error.message).toBe('Function not found');
  });

  it('should get state by key', () => {
    server['_state'] = { key1: 'value1', key2: 'value2' };
    expect(server.getState('key1')).toBe('value1');
  });

  it('should set state by key and notify ports', () => {
    const pushStateSpy = jest.fn();
    server['_ports'].push({ pushState: pushStateSpy } as any);
    const emitSpy = jest.spyOn(server, 'emit');

    server.setState('key1', 'newValue');

    expect(server['_state']['key1']).toBe('newValue');
    expect(pushStateSpy).toHaveBeenCalledWith('key1', 'newValue');
    expect(emitSpy).toHaveBeenCalledWith('stateChange', { key: 'key1', state: 'newValue' });
  });

  it('should register an executor', () => {
    const mockExecutor = jest.fn();
    server.registerExecutor('testFunc', mockExecutor);
    expect(server['_executors']['testFunc']).toBe(mockExecutor);
  });

  it('should throw error if executor is already registered', () => {
    const mockExecutor = jest.fn();
    server.registerExecutor('testFunc', mockExecutor);
    expect(() => server.registerExecutor('testFunc', mockExecutor)).toThrow('testFunc is registered.');
  });

  it('should unregister an executor', () => {
    const mockExecutor = jest.fn();
    server.registerExecutor('testFunc', mockExecutor);
    server.unregisterExecutor('testFunc');
    expect(server['_executors']['testFunc']).toBeUndefined();
  });

  it('should dispose the server', () => {
    const removeAllListenersSpy = jest.fn();
    const disposePortSpy = jest.fn();
    server['_ports'].push({ removeAllListeners: removeAllListenersSpy, dispose: disposePortSpy } as any);
    server['_executors']['testFunc'] = jest.fn();

    server.dispose();

    expect(server['_executors']).toEqual({});
    expect(removeAllListenersSpy).toHaveBeenCalled();
    expect(disposePortSpy).toHaveBeenCalled();
    expect(server['_ports']).toEqual([]);
  });
});