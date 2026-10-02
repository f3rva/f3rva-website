// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Web Storage API if it doesn't exist (or is partial) in the jsdom environment
const createStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] || null,
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  configurable: true,
  writable: true,
});

if (typeof globalThis !== 'undefined') {
  globalThis.localStorage = localStorageMock;
  globalThis.sessionStorage = sessionStorageMock;
}