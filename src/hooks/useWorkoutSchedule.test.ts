import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWorkoutSchedule } from './useWorkoutSchedule';

describe('useWorkoutSchedule', () => {
  const originalFetch = globalThis.fetch;

  let originalEnv: string | undefined;

  beforeEach(() => {
    vi.restoreAllMocks();
    originalEnv = import.meta.env.VITE_SCHEDULE_API_URL;
    (import.meta.env as any).VITE_SCHEDULE_API_URL = 'https://api.test.f3rva.org/schedule';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (import.meta.env as any).VITE_SCHEDULE_API_URL = originalEnv;
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

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ '1stF': mockWorkouts }),
    } as Response);

    const { result } = renderHook(() => useWorkoutSchedule());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.workouts).toEqual(mockWorkouts);
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

  it('sets error state when VITE_SCHEDULE_API_URL is missing', async () => {
    (import.meta.env as any).VITE_SCHEDULE_API_URL = undefined;

    const { result } = renderHook(() => useWorkoutSchedule());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('VITE_SCHEDULE_API_URL is not defined in environment variables');
  });
});
