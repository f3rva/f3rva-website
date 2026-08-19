import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ActivityHeatmap from './ActivityHeatmap';
import { WorkoutPost } from '../../../types/WorkoutPost';

const mockAttended: WorkoutPost[] = [
  {
    workoutId: 1,
    title: 'Foundry Monday',
    workoutDate: '2026-08-17',
    backblastUrl: 'https://f3rva.org/foundry-1',
    author: 'Bischoff',
    slug: 'foundry-monday',
    paxCount: 15,
    ao: [{ id: 1, description: 'The Foundry', slug: 'the-foundry' }],
    q: [{ memberId: 10, f3Name: 'Bischoff' }],
  },
  {
    workoutId: 2,
    title: 'Gridiron Tuesday',
    workoutDate: '2025-05-10',
    backblastUrl: 'https://f3rva.org/gridiron-1',
    author: 'Lockjaw',
    slug: 'gridiron-tuesday',
    paxCount: 12,
    ao: [{ id: 2, description: 'Gridiron', slug: 'gridiron' }],
    q: [{ memberId: 20, f3Name: 'Lockjaw' }],
  },
];

const mockQd: WorkoutPost[] = [
  {
    workoutId: 1,
    title: 'Foundry Monday',
    workoutDate: '2026-08-17',
    backblastUrl: 'https://f3rva.org/foundry-1',
    author: 'Bischoff',
    slug: 'foundry-monday',
    paxCount: 15,
    ao: [{ id: 1, description: 'The Foundry', slug: 'the-foundry' }],
    q: [{ memberId: 10, f3Name: 'Bischoff' }],
  },
];

describe('ActivityHeatmap Component', () => {
  it('renders heatmap title, year buttons, and activity stats', () => {
    render(<ActivityHeatmap attendedWorkouts={mockAttended} qdWorkouts={mockQd} />);

    expect(screen.getByText(/Annual Activity & Q Heatmap/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '2026' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '2025' })).toBeInTheDocument();
  });

  it('switches year when year button is clicked', () => {
    render(<ActivityHeatmap attendedWorkouts={mockAttended} qdWorkouts={mockQd} />);

    const year2025Btn = screen.getByRole('tab', { name: '2025' });
    fireEvent.click(year2025Btn);

    expect(year2025Btn).toHaveClass('active');
    expect(screen.getByText(/in 2025/i)).toBeInTheDocument();
  });
});
