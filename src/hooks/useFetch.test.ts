import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFetch } from './useFetch';
import { config } from '../config';

describe('useFetch Custom Hook', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initially returns loading = true and null data', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useFetch<string>('http://api.com/data'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('does not initiate fetch and turns off loading if url is null', async () => {
    const { result } = renderHook(() => useFetch<string>(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches data successfully and sets loading to false', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => 'hello world',
    });

    const { result } = renderHook(() => useFetch<string>('http://api.com/data'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('hello world');
    expect(result.current.error).toBeNull();
  });

  it('sets error when response.ok is false', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useFetch<string>('http://api.com/data'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('HTTP error! status: 500');
  });

  it('sets error when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFetch<string>('http://api.com/data'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('triggers a timeout error if fetch exceeds apiTimeoutMs', async () => {
    const originalTimeout = config.apiTimeoutMs;
    config.apiTimeoutMs = 10; // Set very short timeout for test

    mockFetch.mockImplementation((_url, options) => {
      const signal = options?.signal;
      return new Promise((_resolve, reject) => {
        if (signal) {
          signal.addEventListener('abort', () => {
            const err = new DOMException('The user aborted a request.', 'AbortError');
            reject(err);
          });
        }
      });
    });

    const { result } = renderHook(() => useFetch<string>('http://api.com/data'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 200 });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Request timed out. Please try again.');

    config.apiTimeoutMs = originalTimeout;
  });

  it('aborts current fetch on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

    const { unmount } = renderHook(() => useFetch<string>('http://api.com/data'));

    unmount();

    expect(abortSpy).toHaveBeenCalledWith('unmount');
    abortSpy.mockRestore();
  });
});
