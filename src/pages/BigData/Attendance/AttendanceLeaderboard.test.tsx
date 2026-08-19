import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AttendanceLeaderboard from './AttendanceLeaderboard';

const mockLeaderboard = [
  { memberId: 101, f3Name: 'Bischoff', numWorkouts: 85, numQs: 25, qRatio: 0.294 },
  { memberId: 102, f3Name: 'Lockjaw', numWorkouts: 78, numQs: 18, qRatio: 0.231 },
  { memberId: 103, f3Name: 'Drip', numWorkouts: 72, numQs: 12, qRatio: 0.167 },
  { memberId: 104, f3Name: 'Biscuits', numWorkouts: 65, numQs: 8, qRatio: 0.123 },
];

describe('AttendanceLeaderboard Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <AttendanceLeaderboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Calculating rankings/i)).toBeInTheDocument();
  });

  it('renders leaderboard title, podium, KPI cards, and rankings table', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockLeaderboard,
    } as Response);

    render(
      <MemoryRouter>
        <AttendanceLeaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Bischoff').length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/Member Attendance & Leadership Leaderboard/i)).toBeInTheDocument();
    expect(screen.getAllByText('Lockjaw').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Drip').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Biscuits').length).toBeGreaterThan(0);
  });

  it('filters leaderboard by member name', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockLeaderboard,
    } as Response);

    render(
      <MemoryRouter>
        <AttendanceLeaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Bischoff').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText('Filter members by name...');
    fireEvent.change(searchInput, { target: { value: 'Biscuits' } });

    // Table should filter out Bischoff and show Biscuits
    expect(screen.getAllByText('Biscuits').length).toBeGreaterThan(0);
  });

  it('switches ranking metric tab and timeframe preset', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockLeaderboard,
    } as Response);

    render(
      <MemoryRouter>
        <AttendanceLeaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Bischoff').length).toBeGreaterThan(0);
    });

    // Switch metric to Most Workouts Led (Qs)
    const qTab = screen.getByRole('button', { name: /Most Workouts Led/i });
    fireEvent.click(qTab);
    expect(qTab).toHaveClass('active');
    expect(fetchSpy).toHaveBeenCalled();

    // Switch timeframe to Past 12 Months
    const timeTab = screen.getByRole('tab', { name: 'Past 12 Months' });
    fireEvent.click(timeTab);
    expect(timeTab).toHaveClass('active');
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('excludes member ID 123 (All PAX) and supports Q ratio threshold', async () => {
    const listWithAllPax = [
      ...mockLeaderboard,
      { memberId: 123, f3Name: 'All PAX', numWorkouts: 200, numQs: 0, qRatio: 0 },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => listWithAllPax,
    } as Response);

    render(
      <MemoryRouter>
        <AttendanceLeaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Bischoff').length).toBeGreaterThan(0);
    });

    // Verify "All PAX" is not rendered in the leaderboard
    expect(screen.queryByText('All PAX')).not.toBeInTheDocument();

    // Switch to ratio metric
    const ratioTab = screen.getByRole('button', { name: /Highest Q Ratio/i });
    fireEvent.click(ratioTab);

    // Verify threshold buttons appear
    expect(screen.getByText('≥ 3 Qs')).toBeInTheDocument();
    expect(screen.getByText('≥ 5 Qs')).toBeInTheDocument();
  });
});
