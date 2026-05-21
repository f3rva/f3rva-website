import React, { useState, useEffect } from 'react';
import { config } from '../config';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Custom React hook for robust, type-safe data fetching with AbortController,
 * Strict Mode double-mount guard protection, and timeout sentinel.
 *
 * @param url The API endpoint to fetch, or null if parameters are currently invalid or not ready.
 */
export function useFetch<T>(
  url: string | null
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('timeout'), config.apiTimeoutMs);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: T = await response.json();

        if (controller.signal.aborted) return;

        setData(result);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        const errorName = err instanceof Error ? err.name : '';
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch';

        if (errorName === 'timeout' || controller.signal.reason === 'timeout') {
          setError('Request timed out. Please try again.');
        } else {
          setError(errorMessage);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      clearTimeout(timeoutId);
      controller.abort('unmount');
    };
  }, [url]);

  return { data, loading, error, setData };
}
