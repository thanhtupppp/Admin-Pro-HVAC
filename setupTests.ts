import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextEncoder, TextDecoder });

// Mock Firebase
jest.mock('./services/firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

// Mock AIService to avoid import.meta issues
jest.mock('./components/AIService', () => ({
  analyzeFileContent: jest.fn().mockResolvedValue({}),
  chatWithAI: jest.fn().mockResolvedValue('AI Response'),
  loadAISettings: jest.fn().mockResolvedValue(undefined),
}));

// Mock fetch if not defined
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
  });
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true, configurable: true });

// Mock navigator.userAgent
Object.defineProperty(global.navigator, 'userAgent', {
  value: 'jest-test-agent',
  writable: true,
  configurable: true,
});

// Mock window.open for invoice tests
if (typeof window !== 'undefined') {
  window.open = jest.fn();
  window.alert = jest.fn();
}

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
global.URL.revokeObjectURL = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
