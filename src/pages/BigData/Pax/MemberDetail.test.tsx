import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MemberDetail from './MemberDetail';

const mockMemberDetail = {
  memberId: 77,
  f3Name: 'Bischoff',
  aliases: ['Bischoff_RVA', 'BBischoff'],
  stats: {
    memberId: 77,
    numWorkouts: 250,
    numQs: 35,
    qRatio: 0.14,
  },
  attendedWorkouts: [
    {
      workoutId: 101,
      title: 'Foundry Convergence',
      workoutDate: '2026-08-17',
      paxCount: 18,
      ao: [{ id: 1, description: 'The Foundry' }],
      q: [{ memberId: 77, f3Name: 'Bischoff' }],
    },
    {
      workoutId: 102,
      title: 'Gridiron Sprints',
      workoutDate: '2026-08-10',
      paxCount: 12,
      ao: [{ id: 2, description: 'Gridiron' }],
      q: [{ memberId: 12, f3Name: 'Lockjaw' }],
    },
  ],
  qdWorkouts: [
    {
      workoutId: 101,
      title: 'Foundry Convergence',
      workoutDate: '2026-08-17',
      paxCount: 18,
      ao: [{ id: 1, description: 'The Foundry' }],
      q: [{ memberId: 77, f3Name: 'Bischoff' }],
    },
  ],
};

describe('MemberDetail Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/bigdata/pax/77']}>
        <Routes>
          <Route path="/bigdata/pax/:id" element={<MemberDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading member analytics/i)).toBeInTheDocument();
  });

  it('renders member profile, aliases, KPI cards, and tabs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockMemberDetail,
    } as Response);

    render(
      <MemoryRouter initialEntries={['/bigdata/pax/77']}>
        <Routes>
          <Route path="/bigdata/pax/:id" element={<MemberDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Bischoff')).toBeInTheDocument();
      expect(screen.getByText('🏷️ Bischoff_RVA')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('14.0%')).toBeInTheDocument();
    });
  });

  it('switches between attended and Q history tabs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockMemberDetail,
    } as Response);

    render(
      <MemoryRouter initialEntries={['/bigdata/pax/77']}>
        <Routes>
          <Route path="/bigdata/pax/:id" element={<MemberDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Foundry Convergence').length).toBeGreaterThan(0);
    });

    const qTab = screen.getByRole('button', { name: /Workouts Q'd/i });
    fireEvent.click(qTab);

    expect(qTab).toHaveClass('active');
    expect(screen.getAllByText('Foundry Convergence').length).toBeGreaterThan(0);
  });

  it('filters member workouts by text query', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockMemberDetail,
    } as Response);

    render(
      <MemoryRouter initialEntries={['/bigdata/pax/77']}>
        <Routes>
          <Route path="/bigdata/pax/:id" element={<MemberDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Foundry Convergence').length).toBeGreaterThan(0);
    });

    const filterInput = screen.getByPlaceholderText('Filter workouts...');
    fireEvent.change(filterInput, { target: { value: 'Gridiron' } });

    expect(screen.queryByText('Foundry Convergence')).not.toBeInTheDocument();
    expect(screen.getAllByText('Gridiron Sprints').length).toBeGreaterThan(0);
  });

  it('handles invalid non-numeric member ID safely without API calls', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    render(
      <MemoryRouter initialEntries={['/bigdata/pax/invalid-id']}>
        <Routes>
          <Route path="/bigdata/pax/:id" element={<MemberDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Member Not Found/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
