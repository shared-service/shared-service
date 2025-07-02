import { ClientPort } from '../src/ClientPort';

describe('ClientPort', () => {
  let clientPort: ClientPort;
  let mockPort: MessagePort;

  beforeEach(() => {
    mockPort = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
      start: jest.fn(),
      close: jest.fn(),
    } as unknown as MessagePort;
    clientPort = new ClientPort(mockPort); // Corrected: Pass mockPort directly
  });

  it('should be defined', () => {
    expect(clientPort).toBeDefined();
  });
});