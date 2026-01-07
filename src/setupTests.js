// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock localStorage if it doesn't exist (or is partial) in the jsdom environment
if (!global.localStorage) {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };
}

// Ensure functions are mocks for spyOn capabilities if needed, 
// but primarily just ensure they exist.
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key) => {
      return this.store ? this.store[key] : null;
    },
    setItem: (key, value) => {
      if (!this.store) this.store = {};
      this.store[key] = value.toString();
    },
    removeItem: (key) => {
      if (this.store) delete this.store[key];
    },
    clear: () => {
      this.store = {};
    },
  },
  writable: true
});

// A better mock implementation using a closure to hold state
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});