import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBackblastForm, slugify } from './useBackblastForm';
import { BACKBLAST_DRAFT_TTL_MS } from '../config/constants';
import { formatDateToISO } from '../utils/dateUtils';

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

  afterEach(() => {
    vi.useRealTimers();
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

  it('uses local date rather than UTC date when initialized late in the evening', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 19, 23, 30, 0));

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    expect(result.current.todayDate).toBe('2026-11-19');
    expect(result.current.formData.workoutDate).toBe('2026-11-19');
  });

  it('does not silently restore a fresh draft and resets unedited workoutDate to today on restore', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const now = new Date(2026, 10, 19, 8, 0, 0);
    vi.setSystemTime(now);

    const savedAt = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    localStorage.setItem(
      'f3rva_backblast_draft',
      JSON.stringify({
        title: 'Morning Beatdown',
        workoutDate: '2026-11-18',
        aoNames: ['First Watch'],
        qic: ['Dingo'],
        pax: ['Dingo'],
        fngs: [],
        drs: [],
        body: '<p>Great workout</p>',
        slug: 'morning-beatdown',
        dateManuallyEdited: false,
      })
    );
    localStorage.setItem('f3rva_backblast_draft_time', savedAt.toISOString());

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    // Form starts clean with today's date instead of silently loading draft
    expect(result.current.formData.title).toBe('');
    expect(result.current.formData.workoutDate).toBe('2026-11-19');
    expect(result.current.pendingDraft?.data.title).toBe('Morning Beatdown');

    // Explicit restore applies content but uses today's date since dateManuallyEdited was false
    act(() => {
      result.current.restoreDraft();
    });

    expect(result.current.formData.title).toBe('Morning Beatdown');
    expect(result.current.formData.workoutDate).toBe('2026-11-19');
    expect(result.current.pendingDraft).toBeNull();
  });

  it('preserves manually edited workoutDate when restoring a draft', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const now = new Date(2026, 10, 19, 8, 0, 0);
    vi.setSystemTime(now);

    const savedAt = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
    localStorage.setItem(
      'f3rva_backblast_draft',
      JSON.stringify({
        title: 'Backdated Beatdown',
        workoutDate: '2026-11-17',
        aoNames: ['First Watch'],
        qic: ['Dingo'],
        pax: ['Dingo'],
        fngs: [],
        drs: [],
        body: '<p>Backdated notes</p>',
        slug: 'backdated-beatdown',
        dateManuallyEdited: true,
      })
    );
    localStorage.setItem('f3rva_backblast_draft_time', savedAt.toISOString());

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    act(() => {
      result.current.restoreDraft();
    });

    expect(result.current.formData.title).toBe('Backdated Beatdown');
    expect(result.current.formData.workoutDate).toBe('2026-11-17');
  });

  it('discards pendingDraft and removes it from localStorage', async () => {
    const savedAt = new Date(Date.now() - 10 * 60 * 1000);
    localStorage.setItem(
      'f3rva_backblast_draft',
      JSON.stringify({ title: 'Temp Draft', workoutDate: formatDateToISO(new Date()) })
    );
    localStorage.setItem('f3rva_backblast_draft_time', savedAt.toISOString());

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    expect(result.current.pendingDraft).not.toBeNull();

    act(() => {
      result.current.discardDraft();
    });

    expect(result.current.pendingDraft).toBeNull();
    expect(localStorage.getItem('f3rva_backblast_draft')).toBeNull();
    expect(localStorage.getItem('f3rva_backblast_draft_time')).toBeNull();
  });

  it('purges expired drafts older than BACKBLAST_DRAFT_TTL_MS or missing timestamps on mount', async () => {
    const expiredAt = new Date(Date.now() - BACKBLAST_DRAFT_TTL_MS - 60 * 1000);
    localStorage.setItem('f3rva_backblast_draft', JSON.stringify({ title: 'Old Draft', workoutDate: '2026-11-01' }));
    localStorage.setItem('f3rva_backblast_draft_time', expiredAt.toISOString());

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    expect(result.current.pendingDraft).toBeNull();
    expect(localStorage.getItem('f3rva_backblast_draft')).toBeNull();
    expect(localStorage.getItem('f3rva_backblast_draft_time')).toBeNull();

    // Missing timestamp should also be purged
    localStorage.setItem('f3rva_backblast_draft', JSON.stringify({ title: 'Untimed Draft' }));
    const { result: second } = renderHook(() => useBackblastForm());
    await waitFor(() => {
      expect(second.current.loadingInitial).toBe(false);
    });
    expect(second.current.pendingDraft).toBeNull();
    expect(localStorage.getItem('f3rva_backblast_draft')).toBeNull();
  });

  it('refreshes unedited workoutDate on visibilitychange across midnight and preserves manually edited dates', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 19, 23, 50, 0));

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    expect(result.current.formData.workoutDate).toBe('2026-11-19');

    // Day rolls over while tab was open; unedited date updates automatically
    vi.setSystemTime(new Date(2026, 10, 20, 6, 30, 0));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.todayDate).toBe('2026-11-20');
    expect(result.current.formData.workoutDate).toBe('2026-11-20');

    // User manually picks an older date; subsequent day rollover should NOT overwrite it
    act(() => {
      result.current.updateField('workoutDate', '2026-11-18');
    });

    vi.setSystemTime(new Date(2026, 10, 21, 6, 30, 0));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.todayDate).toBe('2026-11-21');
    expect(result.current.formData.workoutDate).toBe('2026-11-18');

    // Explicit resetDateToToday updates back to current today
    act(() => {
      result.current.resetDateToToday();
    });
    expect(result.current.formData.workoutDate).toBe('2026-11-21');
  });

  it('rejects future workout dates during validation', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 19, 8, 0, 0));

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    act(() => {
      result.current.updateField('title', 'Future Beatdown');
      result.current.updateField('workoutDate', '2026-11-20');
      result.current.updateField('aoNames', ['First Watch']);
      result.current.updateField('body', '<p>Tomorrow</p>');
    });

    let success = true;
    await act(async () => {
      success = await result.current.submit();
    });

    expect(success).toBe(false);
    expect(result.current.validationErrors.workoutDate).toBe('Workout date cannot be in the future.');
  });

  it('clears saved draft and resets form state when clearDraft is confirmed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    act(() => {
      result.current.updateField('title', 'Draft To Clear');
      result.current.updateField('workoutDate', '2026-11-10');
    });

    expect(localStorage.getItem('f3rva_backblast_draft')).not.toBeNull();

    act(() => {
      result.current.clearDraft();
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(localStorage.getItem('f3rva_backblast_draft')).toBeNull();
    expect(result.current.formData.title).toBe('');
    expect(result.current.formData.workoutDate).toBe(formatDateToISO(new Date()));
    expect(result.current.isDirty).toBe(false);

    confirmSpy.mockRestore();
  });

  it('removes draft from localStorage if user empties all substantive content', async () => {
    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    act(() => {
      result.current.updateField('title', 'Temporary Title');
    });
    expect(localStorage.getItem('f3rva_backblast_draft')).not.toBeNull();

    act(() => {
      result.current.updateField('title', '');
    });
    expect(localStorage.getItem('f3rva_backblast_draft')).toBeNull();
    expect(result.current.lastSaved).toBeNull();
  });
});
