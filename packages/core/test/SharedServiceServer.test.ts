import { SharedServiceServer } from '../src/SharedServiceServer';

describe('SharedServiceServer', () => {
  let server: SharedServiceServer;
  let mockPort: MessagePort;

  beforeEach(() => {
    mockPort = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
      start: jest.fn(),
      close: jest.fn(),
    } as unknown as MessagePort;
    server = new SharedServiceServer(mockPort); // Corrected: Pass mockPort directly
  });

  it('should be defined', () => {
    expect(server).toBeDefined();
  });
});