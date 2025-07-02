import { SharedServiceWorker } from '../src/SharedServiceWorker';

describe('SharedServiceWorker', () => {
  let worker: SharedServiceWorker;
  let mockPort: MessagePort;

  beforeEach(() => {
    mockPort = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
      start: jest.fn(),
      close: jest.fn(),
    } as unknown as MessagePort;
    worker = new SharedServiceWorker(mockPort); // Corrected: Pass mockPort directly
  });

  it('should be defined', () => {
    expect(worker).toBeDefined();
  });
});