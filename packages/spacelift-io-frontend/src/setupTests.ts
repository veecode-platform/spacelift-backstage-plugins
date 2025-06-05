import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any; // eslint-disable-line @typescript-eslint/no-explicit-any

// handle React Router v7 warnings until dependencies are updated
// handle findDomNode errors in tests until test-utils are updated to MUI v5

const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && /React Router.+v7/.test(args[0])) {
      return; // suppress specific React Router v7 warnings
    }
    originalConsoleWarn(...args);
  };

  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && /findDOMNode/.test(args[0])) {
      return; // suppress specific MUI v5 errors
    }
    if (typeof args[0] === 'string' && /defaultProps/.test(args[0])) {
      return; // suppress specific MUI v5 errors
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});
