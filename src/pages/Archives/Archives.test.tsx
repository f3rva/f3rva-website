import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Archives from './Archives';
import { WorkoutPost } from '../../types/WorkoutPost';

// Mock the SEO component
vi.mock('../../components/SEO', () => ({
  default: () => null,
}));

// Mock post data
const mockWorkoutPost: WorkoutPost = {
  workoutId: 1,
  title: 'Standard Beatdown',
  author: 'Dredd',
  slug: 'standard-beatdown',
  workoutDate: '2024-06-01',
  backblastUrl: 'http://example.com',
  content: '<p>It was hot.</p>',
  ao: [{ id: 1, description: 'GridIron', slug: 'gridiron' }],
  q: [{ memberId: 1, f3Name: 'Dredd' }],
  paxCount: 15
};

describe('Archives Landing Page', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Archives />
      </MemoryRouter>
    );
  };

  it('shows loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Loading archives...')).toBeInTheDocument();
  });

  it('renders posts when API returns data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [mockWorkoutPost],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Loading archives...')).not.toBeInTheDocument();
    });

    // Verify Title
    expect(screen.getByText('Workout Archives')).toBeInTheDocument();

    // Verify Post Data
    expect(screen.getByText('Standard Beatdown')).toBeInTheDocument();
    expect(screen.getByText('Dredd')).toBeInTheDocument();
    expect(screen.getByText('GridIron')).toBeInTheDocument();
  });

  it('renders empty state when no posts returned', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Loading archives...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No archives available yet')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Server Down'));

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Loading archives...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Error loading archives/i)).toBeInTheDocument();
    expect(screen.getByText('Server Down')).toBeInTheDocument();
  });
});
