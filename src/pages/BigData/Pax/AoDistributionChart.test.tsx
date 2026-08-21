import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AoDistributionChart from './AoDistributionChart';
import { WorkoutPost } from '../../../types/WorkoutPost';

const mockAttended: WorkoutPost[] = [
  {
    workoutId: 1,
    title: 'Foundry Monday',
    workoutDate: '2026-08-10',
    backblastUrl: 'https://f3rva.org/foundry-1',
    author: 'Bischoff',
    slug: 'foundry-monday',
    paxCount: 10,
    ao: [{ id: 1, description: 'The Foundry', slug: 'the-foundry' }],
    q: [],
  },
  {
    workoutId: 2,
    title: 'Gridiron Tuesday',
    workoutDate: '2026-08-11',
    backblastUrl: 'https://f3rva.org/gridiron-1',
    author: 'Lockjaw',
    slug: 'gridiron-tuesday',
    paxCount: 12,
    ao: [{ id: 2, description: 'Gridiron', slug: 'gridiron' }],
    q: [],
  },
];

describe('AoDistributionChart Component', () => {
  it('renders title and allows switching timeframe filter', () => {
    render(<AoDistributionChart attendedWorkouts={mockAttended} />);

    expect(screen.getByText('📍 Top AO Distribution')).toBeInTheDocument();
    const allTimeBtn = screen.getByRole('button', { name: 'All-Time' });
    expect(allTimeBtn).toBeInTheDocument();

    fireEvent.click(allTimeBtn);
    expect(allTimeBtn).toHaveClass('active');
  });
});
