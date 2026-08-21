import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MonthlyMomentumChart from './MonthlyMomentumChart';
import { WorkoutPost } from '../../../types/WorkoutPost';

const mockAttended: WorkoutPost[] = [
  {
    workoutId: 1,
    title: 'Workout A',
    workoutDate: '2026-08-10',
    backblastUrl: 'https://f3rva.org/workout-a',
    author: 'Test',
    slug: 'workout-a',
    paxCount: 10,
    ao: [{ id: 1, description: 'Foundry', slug: 'the-foundry' }],
    q: [],
  },
];

const mockQd: WorkoutPost[] = [
  {
    workoutId: 2,
    title: 'Workout B',
    workoutDate: '2026-08-15',
    backblastUrl: 'https://f3rva.org/workout-b',
    author: 'Bischoff',
    slug: 'workout-b',
    paxCount: 15,
    ao: [{ id: 1, description: 'Foundry', slug: 'the-foundry' }],
    q: [{ memberId: 1, f3Name: 'Bischoff' }],
  },
];

describe('MonthlyMomentumChart Component', () => {
  it('renders title and allows switching timeframe', () => {
    render(<MonthlyMomentumChart attendedWorkouts={mockAttended} qdWorkouts={mockQd} />);

    expect(screen.getByText('📈 Monthly Momentum')).toBeInTheDocument();
    const btn24 = screen.getByRole('button', { name: '24 Months' });
    expect(btn24).toBeInTheDocument();

    fireEvent.click(btn24);
    expect(btn24).toHaveClass('active');
    expect(screen.getByText(/over the last 24 months/i)).toBeInTheDocument();
  });
});
