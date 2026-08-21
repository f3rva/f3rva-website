import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkoutDetail from './WorkoutDetail';

const mockWorkoutDetail = {
  workoutId: 42,
  title: 'Dogpile 10-Year Anniversary',
  workoutDate: '2026-08-15',
  backblastUrl: 'https://f3rva.org/dogpile-anniversary',
  paxCount: 3,
  ao: [{ id: 1, description: 'Dogpile' }],
  q: [{ memberId: 10, f3Name: 'Bleeder' }],
  pax: [
    { memberId: 10, f3Name: 'Bleeder' },
    { memberId: 11, f3Name: 'Swobbler' },
    { memberId: 12, f3Name: 'Oyster' },
  ],
};

describe('WorkoutDetail Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/bigdata/workout/42']}>
        <Routes>
          <Route path="/bigdata/workout/:id" element={<WorkoutDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading workout details/i)).toBeInTheDocument();
  });

  it('renders workout metadata, attendee roster, and archive backblast button', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockWorkoutDetail,
    } as Response);

    render(
      <MemoryRouter initialEntries={['/bigdata/workout/42']}>
        <Routes>
          <Route path="/bigdata/workout/:id" element={<WorkoutDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dogpile 10-Year Anniversary')).toBeInTheDocument();
      expect(screen.getByText('📍 Dogpile')).toBeInTheDocument();
      expect(screen.getByText('👑 Bleeder')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Swobbler')).toBeInTheDocument();
      expect(screen.getByText('Oyster')).toBeInTheDocument();
      expect(screen.getByText('Read Backblast in Archives ↗')).toBeInTheDocument();
    });
  });

  it('renders not found error state when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ errorCode: 1001, errorMessage: 'Workout not found' }),
    } as Response);

    render(
      <MemoryRouter initialEntries={['/bigdata/workout/999']}>
        <Routes>
          <Route path="/bigdata/workout/:id" element={<WorkoutDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Workout Not Found')).toBeInTheDocument();
      expect(screen.getByText('← Back to Big Data Dashboard')).toBeInTheDocument();
    });
  });

  it('handles invalid non-numeric workout ID safely without API calls', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    render(
      <MemoryRouter initialEntries={['/bigdata/workout/not-a-number']}>
        <Routes>
          <Route path="/bigdata/workout/:id" element={<WorkoutDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Workout Not Found/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
