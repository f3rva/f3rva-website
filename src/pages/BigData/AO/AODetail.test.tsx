import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AODetail from './AODetail';

const mockLeaderboard = {
  aoId: 1,
  description: 'The Foundry',
  topQs: [
    { id: 101, name: 'Bischoff', count: 25 },
    { id: 102, name: 'Lockjaw', count: 18 },
  ],
  topPax: [
    { id: 103, name: 'Drip', count: 140 },
    { id: 101, name: 'Bischoff', count: 120 },
  ],
  streakers: [
    { id: 103, name: 'Drip', count: 12 },
  ],
};

const mockWorkouts = [
  {
    workoutId: 1,
    title: 'Foundry Beatdown',
    workoutDate: '2026-08-17',
    backblastUrl: 'https://f3rva.org/foundry-1',
    author: 'Bischoff',
    slug: 'foundry-beatdown',
    paxCount: 16,
    ao: [{ id: 1, description: 'The Foundry', slug: 'the-foundry' }],
    q: [{ memberId: 101, f3Name: 'Bischoff' }],
  },
  {
    workoutId: 2,
    title: 'Foundry Sprints',
    workoutDate: '2026-08-10',
    backblastUrl: 'https://f3rva.org/foundry-2',
    author: 'Lockjaw',
    slug: 'foundry-sprints',
    paxCount: 14,
    ao: [{ id: 1, description: 'The Foundry', slug: 'the-foundry' }],
    q: [{ memberId: 102, f3Name: 'Lockjaw' }],
  },
];

const mockAoSummaries = [
  { aoId: 1, description: 'The Foundry', totalWorkouts: 150, totalPax: 2250, averagePax: 15.0 },
];

describe('AODetail Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/bigdata/ao/1']}>
        <Routes>
          <Route path="/bigdata/ao/:id" element={<AODetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading AO analytics & leaderboard/i)).toBeInTheDocument();
  });

  it('renders AO details, KPI cards, 3-column leaderboard, and workouts', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v2/reports/ao/1/leaderboard')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockLeaderboard,
        } as Response);
      }
      if (urlStr.includes('/v2/workouts')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockWorkouts,
        } as Response);
      }
      if (urlStr.includes('/v2/reports/ao')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockAoSummaries,
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <MemoryRouter initialEntries={['/bigdata/ao/1']}>
        <Routes>
          <Route path="/bigdata/ao/:id" element={<AODetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('📍 The Foundry')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('15.0')).toBeInTheDocument();
      expect(screen.getByText('2,250')).toBeInTheDocument();
      expect(screen.getByText('👑 Top Q Leaders')).toBeInTheDocument();
      expect(screen.getByText('🏃 Top Regulars (PAX)')).toBeInTheDocument();
      expect(screen.getByText('🔥 Active Streakers')).toBeInTheDocument();
      expect(screen.getAllByText('Bischoff').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Drip').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Foundry Beatdown').length).toBeGreaterThan(0);
    });
  });

  it('filters workouts by query text', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v2/reports/ao/1/leaderboard')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockLeaderboard,
        } as Response);
      }
      if (urlStr.includes('/v2/workouts')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockWorkouts,
        } as Response);
      }
      if (urlStr.includes('/v2/reports/ao')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockAoSummaries,
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <MemoryRouter initialEntries={['/bigdata/ao/1']}>
        <Routes>
          <Route path="/bigdata/ao/:id" element={<AODetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Foundry Beatdown').length).toBeGreaterThan(0);
    });

    const filterInput = screen.getByPlaceholderText('Filter workouts...');
    fireEvent.change(filterInput, { target: { value: 'Sprints' } });

    expect(screen.queryByText('Foundry Beatdown')).not.toBeInTheDocument();
    expect(screen.getAllByText('Foundry Sprints').length).toBeGreaterThan(0);
  });

  it('handles invalid non-numeric AO ID safely without fetching AO-specific data', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response)
    );

    render(
      <MemoryRouter initialEntries={['/bigdata/ao/not-a-number']}>
        <Routes>
          <Route path="/bigdata/ao/:id" element={<AODetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/AO Not Found/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('/v2/reports/ao/not-a-number/leaderboard'), expect.anything());
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('/v2/workouts/ao/not-a-number'), expect.anything());
  });
});
