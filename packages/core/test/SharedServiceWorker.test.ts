import { SharedServiceWorker } from '../src/SharedServiceWorker';
import { SharedServiceServer } from '../src/SharedServiceServer';

describe('SharedServiceWorker', () => {
  let worker: SharedServiceWorker;
  let mockPort: MessagePort;
  let onNewPortSpy: jest.SpyInstance;

  beforeEach(() => {
    mockPort = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
      start: jest.fn(),
      close: jest.fn(),
    } as unknown as MessagePort;

    // Spy on the prototype method of SharedServiceServer
    onNewPortSpy = jest.spyOn(SharedServiceServer.prototype, 'onNewPort').mockImplementation(jest.fn());

    // Clear all mocks including the spy
    jest.clearAllMocks();

    worker = new SharedServiceWorker(mockPort);
  });

  afterEach(() => {
    onNewPortSpy.mockRestore(); // Restore the original method after each test
  });

  it('should be defined', () => {
    expect(worker).toBeDefined();
  });

  it('should call onNewPort with the correct port on connect', () => {
    const mockMessageEvent = {
      ports: [mockPort],
    } as unknown as MessageEvent;

    worker.onConnect(mockMessageEvent);
    expect(onNewPortSpy).toHaveBeenCalledWith(mockPort);
  });
});