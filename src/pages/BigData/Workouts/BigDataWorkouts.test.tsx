import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BigDataWorkouts from './BigDataWorkouts';

const mockWorkouts = [
  {
    workoutId: 1,
    title: 'The Foundry Beatdown',
    workoutDate: '2026-08-17',
    backblastUrl: 'https://f3rva.org/foundry-1',
    paxCount: 18,
    ao: [{ id: 10, description: 'The Foundry' }],
    q: [{ memberId: 101, f3Name: 'Bischoff' }],
  },
  {
    workoutId: 2,
    title: 'Gridiron Sprints',
    workoutDate: '2026-08-16',
    backblastUrl: null,
    paxCount: 12,
    ao: [{ id: 20, description: 'Gridiron' }],
    q: [{ memberId: 102, f3Name: 'Lockjaw' }],
  },
];

describe('BigDataWorkouts Explorer Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders table headers and workout rows', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockWorkouts,
    } as Response);

    render(
      <MemoryRouter>
        <BigDataWorkouts />
      </MemoryRouter>
    );

    expect(screen.getByText(/Recent Workouts Explorer/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('The Foundry Beatdown')).toBeInTheDocument();
      expect(screen.getByText('Gridiron Sprints')).toBeInTheDocument();
      expect(screen.getByText('The Foundry')).toBeInTheDocument();
      expect(screen.getByText('Bischoff')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });
  });

  it('filters workouts by query text on the current page', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockWorkouts,
    } as Response);

    render(
      <MemoryRouter>
        <BigDataWorkouts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('The Foundry Beatdown')).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText(/Filter current page/i);
    fireEvent.change(filterInput, { target: { value: 'Gridiron' } });

    expect(screen.queryByText('The Foundry Beatdown')).not.toBeInTheDocument();
    expect(screen.getByText('Gridiron Sprints')).toBeInTheDocument();
  });

  it('displays empty state when no matching results', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockWorkouts,
    } as Response);

    render(
      <MemoryRouter>
        <BigDataWorkouts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('The Foundry Beatdown')).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText(/Filter current page/i);
    fireEvent.change(filterInput, { target: { value: 'Nonexistent Workout' } });

    expect(screen.getByText('No workouts match your filter')).toBeInTheDocument();
  });
});
