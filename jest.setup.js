// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for Request/Response APIs
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for Request/Response (needed for Next.js API routes in Node environment)
// Next.js provides these, but we need to ensure they're available in test environment
if (typeof global.Request === 'undefined') {
  // Use undici for Node.js compatibility
  try {
    const { Request, Response, Headers } = require('undici');
    global.Request = Request;
    global.Response = Response;
    global.Headers = Headers;
  } catch (e) {
    // Fallback: create minimal mocks
    global.Request = class Request {
      constructor(input, init) {
        this.url = typeof input === 'string' ? input : input.url;
        this.method = (init && init.method) || 'GET';
        this.headers = new Map();
        this.body = init && init.body ? JSON.parse(init.body) : null;
      }
      async json() {
        return this.body;
      }
    };
    global.Response = class Response {
      constructor(body, init) {
        this.body = body;
        this.status = (init && init.status) || 200;
        this.statusText = (init && init.statusText) || 'OK';
      }
      async json() {
        return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
      }
    };
    global.Headers = class Headers {
      constructor() {
        this.map = new Map();
      }
      get(key) {
        return this.map.get(key.toLowerCase());
      }
      set(key, value) {
        this.map.set(key.toLowerCase(), value);
      }
    };
  }
}

// Mock next/navigation
const mockUseRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
}));

const mockUsePathname = jest.fn(() => '/');
const mockUseSearchParams = jest.fn(() => new URLSearchParams());

jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signOut: jest.fn(() => Promise.resolve()),
  SessionProvider: ({ children }) => children,
}));

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// Mock next/server
jest.mock('next/server', () => {
  class MockResponse extends Response {
    constructor(body, init) {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
      super(bodyString, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
      this._json = typeof body === 'string' ? JSON.parse(body) : body;
    }

    async json() {
      return Promise.resolve(this._json);
    }
  }

  return {
    NextResponse: {
      json: (body, init) => {
        return new MockResponse(body, init);
      },
      next: () => new MockResponse(null, { status: 200 }),
      redirect: (url) => {
        const urlString = url instanceof URL ? url.toString() : String(url);
        const headers = new Headers();
        headers.set('Location', urlString);
        const response = new Response(null, {
          status: 307,
          headers: headers,
        });
        response.json = jest.fn(() => Promise.resolve(null));
        return response;
      },
    },
  };
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 },
    type: '',
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
  })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
}));

global.window.AudioContext = global.AudioContext;
global.window.webkitAudioContext = global.AudioContext;

// Mock Audio
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
}));
