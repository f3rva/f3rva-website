import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BigDataHub from './BigDataHub';

describe('BigDataHub Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dashboard title, breadcrumbs, search, and navigation cards', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v2/reports/ao')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { aoId: 1, description: 'The Forge', totalWorkouts: 120, totalPax: 1500, averagePax: 12.5 },
            { aoId: 2, description: 'Gridiron', totalWorkouts: 80, totalPax: 880, averagePax: 11.0 },
          ],
        } as Response);
      }
      if (urlStr.includes('/v2/reports/day-of-week')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { dayId: 1, dayName: 'Sunday', workoutCount: 10, totalPax: 100, averagePax: 10.0 },
            { dayId: 7, dayName: 'Saturday', workoutCount: 150, totalPax: 2200, averagePax: 14.6 },
          ],
        } as Response);
      }
      if (urlStr.includes('/v2/workouts')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              workoutId: 101,
              title: 'Morning Beatdown',
              workoutDate: '2026-08-18',
              paxCount: 14,
              ao: [{ id: 1, description: 'The Forge' }],
              q: [{ memberId: 5, f3Name: 'Drip' }],
            },
          ],
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <MemoryRouter>
        <BigDataHub />
      </MemoryRouter>
    );

    expect(screen.getByText('F3 RVA Big Data Dashboard')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search any PAX or AO/i)).toBeInTheDocument();
    expect(screen.getByText('30-Day Region Average')).toBeInTheDocument();
    expect(screen.getByText('Active AOs (30 Days)')).toBeInTheDocument();
    expect(screen.getByText('Top AO (30 Days)')).toBeInTheDocument();
    expect(screen.getByText('Peak Workout Day')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Morning Beatdown')).toBeInTheDocument();
    });
  });
});

