import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWorkoutSchedule } from './useWorkoutSchedule';

describe('useWorkoutSchedule', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches schedule successfully and returns workouts', async () => {
    const mockWorkouts = [
      {
        location: 'RounTrey Clubhouse',
        locationURL: 'http://maps.google.com/1',
        name: 'The Alamo',
        tagURL: '/archives/ao/the-alamo/',
        dayOfWeek: 'Monday',
        startTime: '0530',
        endTime: '0615',
        workoutStyle: 'Bootcamp',
        siteQ: 'Vagabond',
        notes: 'Meet in lot',
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ '1stF': mockWorkouts }),
    } as Response);
    globalThis.fetch = fetchMock;

    const { result } = renderHook(() => useWorkoutSchedule());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.workouts).toEqual(mockWorkouts);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/schedule$/),
      expect.objectContaining({
        headers: {
          Client: 'f3rva-website',
          Accept: 'application/json',
        },
      })
    );
  });

  it('sets error state when API returns non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => useWorkoutSchedule());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('HTTP 500');
    expect(result.current.workouts).toEqual([]);
  });

  it('sets error state when network call rejects', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useWorkoutSchedule());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.workouts).toEqual([]);
  });
});
