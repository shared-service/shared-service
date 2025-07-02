// Mock MessageChannel for JSDOM environment
if (typeof global.MessageChannel === 'undefined') {
  global.MessageChannel = class MockMessageChannel {
    port1: any;
    port2: any;

    constructor() {
      this.port1 = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        postMessage: jest.fn(),
        start: jest.fn(),
        close: jest.fn(),
      };
      this.port2 = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        postMessage: jest.fn(),
        start: jest.fn(),
        close: jest.fn(),
      };
    }
  };
}