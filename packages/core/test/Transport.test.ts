import { Transport } from '../src/Transport';

describe('Transport', () => {
  let transport: Transport;
  let mockPort: MessagePort;

  beforeEach(() => {
    mockPort = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
      start: jest.fn(),
      close: jest.fn(),
    } as unknown as MessagePort;
    transport = new Transport({ port: mockPort });
  });

  it('should be defined', () => {
    expect(transport).toBeDefined();
  });
});