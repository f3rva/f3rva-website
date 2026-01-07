import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MonthArchives from './MonthArchives';
import { WorkoutPost } from '../../types/WorkoutPost';

// Mock the SEO component since it manages head tags
vi.mock('../../components/SEO', () => ({
  default: () => null,
}));

// Create a mock post that matches WorkoutPost interface
const mockWorkoutPost: WorkoutPost = {
  workoutId: 1,
  title: 'Crushing the Pyramid',
  author: 'Shocker',
  slug: 'crushing-the-pyramid',
  workoutDate: '2024-03-15',
  backblastUrl: 'http://example.com',
  content: '<p>Great workout!</p>',
  ao: [{ id: 1, description: 'Innsbrook' }],
  q: [{ memberId: 1, f3Name: 'Shocker' }],
  paxCount: 12
};

describe('MonthArchives Page', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = (year = '2024', month = '03') => {
    return render(
      <MemoryRouter initialEntries={[`/archives/${year}/${month}`]}>
        <Routes>
          <Route path="/archives/:year/:month" element={<MonthArchives />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    
    renderComponent();
    expect(screen.getByText('Loading month archives...')).toBeInTheDocument();
  });

  it('renders posts when API returns data', async () => {
    const mockResponseData = [mockWorkoutPost];
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponseData,
    });

    renderComponent('2024', '03');

    await waitFor(() => {
      expect(screen.queryByText('Loading month archives...')).not.toBeInTheDocument();
    });

    // Verify header date (March 2024)
    expect(screen.getByText('March 2024')).toBeInTheDocument();

    // Verify post title is rendered
    expect(screen.getByText('Crushing the Pyramid')).toBeInTheDocument();
    
    // Verify API was called with correct params
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('year=2024&month=03'),
      expect.any(Object)
    );
  });

  it('renders empty state when no posts are found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    renderComponent('2024', '01');

    await waitFor(() => {
      expect(screen.queryByText('Loading month archives...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No archives available for/i)).toBeInTheDocument();
    expect(screen.getByText(/Check back soon/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Loading month archives...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Error loading month archives/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });
});
