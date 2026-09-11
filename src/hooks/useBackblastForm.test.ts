import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBackblastForm, slugify } from './useBackblastForm';

const mockNavigate = vi.fn();
const mockGetAuthHeaders = vi.fn().mockReturnValue({ Authorization: 'Bearer test-token' });

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('./useAuth', () => ({
  useAuth: () => ({
    user: { f3Name: 'Dingo', role: 'member' },
    isAuthenticated: true,
    getAuthHeaders: mockGetAuthHeaders,
  }),
}));

describe('slugify helper', () => {
  it('converts strings to clean url slugs', () => {
    expect(slugify('Beatdown at First Watch!')).toBe('beatdown-at-first-watch');
    expect(slugify('  Dogpile & Spider Run  ')).toBe('dogpile-spider-run');
  });
});

describe('useBackblastForm Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, description: 'First Watch', slug: 'first-watch' }],
    } as Response);
  });

  it('initializes with default values and auto-saves draft in create mode', async () => {
    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    expect(result.current.isEditMode).toBe(false);
    expect(result.current.formData.qic).toEqual(['Dingo']);
    expect(result.current.formData.pax).toEqual(['Dingo']);

    act(() => {
      result.current.updateField('title', 'Summer Ruck');
    });

    expect(result.current.formData.slug).toBe('summer-ruck');

    // Verify saved to localStorage
    const saved = JSON.parse(localStorage.getItem('f3rva_backblast_draft') || '{}');
    expect(saved.title).toBe('Summer Ruck');
  });

  it('validates required fields before submitting', async () => {
    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.submit();
    });

    expect(success).toBe(false);
    expect(result.current.validationErrors.title).toBe('Title is required.');
    expect(result.current.validationErrors.aoNames).toBe('At least one Area of Operations (AO) is required.');
  });

  it('submits successfully in create mode and navigates to new workout', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/v2/workouts/aos')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, description: 'First Watch', slug: 'first-watch' }],
        } as Response);
      }
      if (url.includes('/v2/members')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ memberId: 1, f3Name: 'Dingo' }, { memberId: 2, f3Name: 'Lab Rat' }],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 501,
          title: 'Epic Workout',
          url: 'https://f3rva.org/2026/09/02/epic-workout',
        }),
      } as Response);
    });

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    act(() => {
      result.current.updateField('title', 'Epic Workout');
      result.current.updateField('aoNames', ['First Watch']);
      result.current.updateField('qic', ['Dingo']);
      result.current.updateField('pax', ['Dingo', 'Lab Rat']);
      result.current.updateField('body', '<p>100 Burpees</p>');
    });

    let success = false;
    await act(async () => {
      success = await result.current.submit();
    });

    expect(success).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('/2026/09/02/epic-workout', { replace: true });
    expect(localStorage.getItem('f3rva_backblast_draft')).toBeNull();
  });

  it('submits fngs and drs in payload and validates attendance across pax, fngs, and drs', async () => {
    const captured: { body?: { fngs?: string; drs?: string } } = {};
    globalThis.fetch = vi.fn().mockImplementation((url: string, init?: { method?: string; body?: string }) => {
      if (url.includes('/v2/workouts/aos')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, description: 'First Watch', slug: 'first-watch' }],
        } as Response);
      }
      if (url.includes('/v2/members')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ memberId: 1, f3Name: 'Dingo' }],
        } as Response);
      }
      if (init?.method === 'POST') {
        captured.body = JSON.parse(init.body as string);
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 502,
            title: 'Beatdown with New Guys',
            url: 'https://f3rva.org/2026/09/02/beatdown-with-new-guys',
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => [] } as Response);
    });

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    act(() => {
      result.current.updateField('title', 'Beatdown with New Guys');
      result.current.updateField('aoNames', ['First Watch']);
      result.current.updateField('qic', ['Dingo']);
      result.current.updateField('pax', ['Dingo']);
      result.current.updateField('fngs', ['Flipper', 'Nemo']);
      result.current.updateField('drs', ['Sparky', 'YardWork']);
      result.current.updateField('body', '<p>Great beatdown</p>');
    });

    let success = false;
    await act(async () => {
      success = await result.current.submit();
    });

    expect(success).toBe(true);
    expect(captured.body?.fngs).toBe('Flipper, Nemo');
    expect(captured.body?.drs).toBe('Sparky, YardWork');
  });

  it('populates originalFngs when loading an existing workout in edit mode', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/v2/workouts/101')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 101,
            title: 'Existing Workout',
            workoutDate: '2026-09-01',
            ao: [{ id: 1, description: 'First Watch', slug: 'first-watch' }],
            q: [{ memberId: 1, f3Name: 'Dingo' }],
            pax: [{ memberId: 1, f3Name: 'Dingo' }],
            fngs: [{ memberId: 99, f3Name: 'Flipper' }],
            drs: [],
            content: '<p>Content</p>',
            slug: 'existing-workout',
          }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => [] } as Response);
    });

    const { result } = renderHook(() => useBackblastForm(101));

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    expect(result.current.isEditMode).toBe(true);
    expect(result.current.originalFngs).toEqual(['Flipper']);
    expect(result.current.formData.fngs).toEqual(['Flipper']);
  });
});
