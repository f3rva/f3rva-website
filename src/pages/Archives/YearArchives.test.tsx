import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import YearArchives from './YearArchives';
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
  ao: [{ id: 1, description: 'Innsbrook', slug: 'innsbrook' }],
  q: [{ memberId: 1, f3Name: 'Shocker' }],
  paxCount: 12
};

describe('YearArchives Page', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = (year = '2024') => {
    return render(
      <MemoryRouter initialEntries={[`/archives/${year}`]}>
        <Routes>
          <Route path="/archives/:year" element={<YearArchives />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    
    renderComponent();
    expect(screen.getByText('Loading year archives...')).toBeInTheDocument();
  });

  it('renders posts when API returns data', async () => {
    const mockResponseData = [mockWorkoutPost];
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponseData,
    });

    renderComponent('2024');

    await waitFor(() => {
      expect(screen.queryByText('Loading year archives...')).not.toBeInTheDocument();
    });

    // Verify header year (using regex to avoid matching breadcrumbs or other "2024" strings ambiguously)
    // The subtitle has class "archives-subtitle"
    const subtitle = screen.getByRole('heading', { name: '2024' });
    expect(subtitle).toBeInTheDocument();

    // Verify post title is rendered
    expect(screen.getByText('Crushing the Pyramid')).toBeInTheDocument();
    
    // Verify API was called with correct params
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('year=2024'),
      expect.any(Object)
    );
  });

  it('renders empty state when no posts are found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    renderComponent('2024');

    await waitFor(() => {
      expect(screen.queryByText('Loading year archives...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No archives available for 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Check back soon/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Loading year archives...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Error loading year archives/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });
});
