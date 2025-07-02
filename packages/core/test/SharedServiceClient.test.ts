import { SharedServiceClient } from '../src/SharedServiceClient';

describe('SharedServiceClient', () => {
  let client: SharedServiceClient;
  let mockPort: MessagePort;

  beforeEach(() => {
    mockPort = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
      start: jest.fn(),
      close: jest.fn(),
    } as unknown as MessagePort; // Mock MessagePort
    client = new SharedServiceClient({ port: mockPort });
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  // Add more tests here as needed
});