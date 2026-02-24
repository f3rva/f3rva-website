import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AOArchives from './AOArchives';
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

describe('AOArchives Page', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = (ao = 'innsbrook') => {
    return render(
      <MemoryRouter initialEntries={[`/archives/ao/${encodeURIComponent(ao.toLowerCase())}`]}>
        <Routes>
          <Route path="/archives/ao/:ao" element={<AOArchives />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    
    renderComponent();
    expect(screen.getByText('Loading AO archives...')).toBeInTheDocument();
  });

  it('renders posts when API returns data', async () => {
    const mockResponseData = [mockWorkoutPost];
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponseData,
    });

    renderComponent('innsbrook');

    await waitFor(() => {
      expect(screen.queryByText('Loading AO archives...')).not.toBeInTheDocument();
    });

    // Verify header AO name (displays proper case from post data)
    const subtitle = screen.getByRole('heading', { name: 'Innsbrook' });
    expect(subtitle).toBeInTheDocument();

    // Verify post title is rendered
    expect(screen.getByText('Crushing the Pyramid')).toBeInTheDocument();

    // Verify API was called with correct params (now uses slug parameter)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('slug=innsbrook'),
      expect.any(Object)
    );
  });

  it('renders empty state when no posts are found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    renderComponent('innsbrook');

    await waitFor(() => {
      expect(screen.queryByText('Loading AO archives...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No archives available for innsbrook/i)).toBeInTheDocument();
    expect(screen.getByText(/Check back soon/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Loading AO archives...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Error loading AO archives/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });

  it('uses slug for API call and displays AO name from post data', async () => {
    const mockResponseData = [mockWorkoutPost];
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponseData,
    });

    renderComponent('innsbrook');

    await waitFor(() => {
      expect(screen.queryByText('Loading AO archives...')).not.toBeInTheDocument();
    });

    // Should display AO name from the post data
    expect(screen.getByRole('heading', { name: 'Innsbrook' })).toBeInTheDocument();

    // API call should use slug parameter instead of name
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('slug=innsbrook'),
      expect.any(Object)
    );
  });

  it('shows error for invalid slug format', async () => {
    // No mockFetch setup needed as it should return early

    render(
      <MemoryRouter initialEntries={['/archives/ao/invalid$slug']}>
        <Routes>
          <Route path="/archives/ao/:ao" element={<AOArchives />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading AO archives...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Error loading AO archives')).toBeInTheDocument();
    expect(screen.getByText('Invalid AO format')).toBeInTheDocument();

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
