import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DayOfWeekReport from './DayOfWeekReport';

const mockDayData = [
  { dayId: 1, dayName: 'Sunday', workoutCount: 5, totalPax: 45, averagePax: 9.0 },
  { dayId: 2, dayName: 'Monday', workoutCount: 22, totalPax: 330, averagePax: 15.0 },
  { dayId: 3, dayName: 'Tuesday', workoutCount: 25, totalPax: 375, averagePax: 15.0 },
  { dayId: 4, dayName: 'Wednesday', workoutCount: 24, totalPax: 360, averagePax: 15.0 },
  { dayId: 5, dayName: 'Thursday', workoutCount: 23, totalPax: 345, averagePax: 15.0 },
  { dayId: 6, dayName: 'Friday', workoutCount: 20, totalPax: 280, averagePax: 14.0 },
  { dayId: 7, dayName: 'Saturday', workoutCount: 30, totalPax: 600, averagePax: 20.0 },
];

describe('DayOfWeekReport Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <DayOfWeekReport />
      </MemoryRouter>
    );

    expect(screen.getByText(/Calculating weekday distribution/i)).toBeInTheDocument();
  });

  it('renders title, summary KPIs, 7 weekday cards, and breakdown table', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockDayData,
    } as Response);

    render(
      <MemoryRouter>
        <DayOfWeekReport />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('📅 Day of Week Attendance Analytics')).toBeInTheDocument();
      expect(screen.getAllByText('Saturday').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Monday').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sunday').length).toBeGreaterThan(0);
      expect(screen.getByText('2,335')).toBeInTheDocument(); // total PAX: 45+330+375+360+345+280+600 = 2335
      expect(screen.getByText('149')).toBeInTheDocument(); // total workouts: 5+22+25+24+23+20+30 = 149
    });
  });

  it('switches timeframe preset', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockDayData,
    } as Response);

    render(
      <MemoryRouter>
        <DayOfWeekReport />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('📅 Day of Week Attendance Analytics')).toBeInTheDocument();
    });

    const allTimeTab = screen.getByRole('tab', { name: 'All-Time' });
    fireEvent.click(allTimeTab);

    expect(allTimeTab).toHaveClass('active');
    expect(fetchSpy).toHaveBeenCalled();
  });
});
