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
    expect(result.current.formData.qic).toBe('Dingo');

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
    expect(result.current.validationErrors.aoName).toBe('Area of Operations (AO) is required.');
  });

  it('submits successfully in create mode and navigates to new workout', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/v2/workouts/aos')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, description: 'First Watch', slug: 'first-watch' }],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: 501, title: 'Epic Workout' }),
      } as Response);
    });

    const { result } = renderHook(() => useBackblastForm());

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
    });

    act(() => {
      result.current.updateField('title', 'Epic Workout');
      result.current.updateField('aoName', 'First Watch');
      result.current.updateField('qic', 'Dingo');
      result.current.updateField('pax', 'Dingo, Lab Rat');
      result.current.updateField('body', '<p>100 Burpees</p>');
    });

    let success = false;
    await act(async () => {
      success = await result.current.submit();
    });

    expect(success).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('/bigdata/workouts/501', { replace: true });
    expect(localStorage.getItem('f3rva_backblast_draft')).toBeNull();
  });
});
