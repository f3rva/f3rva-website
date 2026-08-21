import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AoTrendChart from './AoTrendChart';
import { WorkoutPost } from '../../../types/WorkoutPost';

const mockWorkouts: WorkoutPost[] = [
  {
    workoutId: 1,
    title: 'Foundry Monday',
    workoutDate: '2026-08-17',
    backblastUrl: 'https://f3rva.org/foundry-1',
    author: 'Bischoff',
    slug: 'foundry-monday',
    paxCount: 16,
    ao: [{ id: 1, description: 'The Foundry', slug: 'the-foundry' }],
    q: [{ memberId: 10, f3Name: 'Bischoff' }],
  },
  {
    workoutId: 2,
    title: 'Foundry Previous Week',
    workoutDate: '2026-08-10',
    backblastUrl: 'https://f3rva.org/foundry-2',
    author: 'Lockjaw',
    slug: 'foundry-previous',
    paxCount: 14,
    ao: [{ id: 1, description: 'The Foundry', slug: 'the-foundry' }],
    q: [{ memberId: 20, f3Name: 'Lockjaw' }],
  },
];

describe('AoTrendChart Component', () => {
  it('renders title and allows switching timeframe to 24 months', () => {
    render(<AoTrendChart workouts={mockWorkouts} />);

    expect(screen.getByText('📈 Attendance Trend & 4-Week Moving Average')).toBeInTheDocument();
    const btn24 = screen.getByRole('button', { name: 'Past 24M' });
    expect(btn24).toBeInTheDocument();

    fireEvent.click(btn24);
    expect(btn24).toHaveClass('active');
  });

  it('renders empty state when no workouts provided', () => {
    render(<AoTrendChart workouts={[]} />);

    expect(screen.getByText(/No historical attendance data available/i)).toBeInTheDocument();
  });
});
