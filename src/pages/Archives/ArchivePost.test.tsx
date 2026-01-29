import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ArchivePost from './ArchivePost';
import { WorkoutPost } from '../../types/WorkoutPost';

// Mock the SEO component
vi.mock('../../components/SEO', () => ({
  default: () => null,
}));

// Mock post data
const mockPost: WorkoutPost = {
  workoutId: 101,
  title: 'Morning Beatdown at the Zoo',
  author: 'Gomer Pyle',
  slug: 'morning-beatdown-zoo',
  workoutDate: '2024-05-20',
  backblastUrl: 'https://f3rva.org/backblast/101',
  content: '<p>The <strong>PAX</strong> crushed it today.</p><ul><li>Burpees</li><li>Merkins</li></ul>',
  ao: [{ id: 5, description: 'The Zoo', slug: 'thezoo' }],
  q: [{ memberId: 1, f3Name: 'Gomer Pyle' }],
  pax: [
    { memberId: 1, f3Name: 'Gomer Pyle' },
    { memberId: 2, f3Name: 'Shocker' },
    { memberId: 3, f3Name: 'Twinkle Toes' }
  ],
  paxCount: 3
};

describe('ArchivePost Page', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockReset();
    // Silence console.log during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = (year = '2024', month = '05', day = '20', slug = 'morning-beatdown-zoo') => {
    return render(
      <MemoryRouter initialEntries={[`/${year}/${month}/${day}/${slug}`]}>
        <Routes>
          <Route path="/:year/:month/:day/:slug" element={<ArchivePost />} />
          <Route path="/404" element={<div>404 Not Found</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Loading post...')).toBeInTheDocument();
  });

  it('renders post content when API returns data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPost,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Loading post...')).not.toBeInTheDocument();
    });

    // Verify Title
    expect(screen.getByText('Morning Beatdown at the Zoo')).toBeInTheDocument();
    
    // Verify Date
    expect(screen.getByText('Mon, May 20, 2024')).toBeInTheDocument();

    // Verify QIC and Author (should be at least two occurrences of the name)
    const nameElements = screen.getAllByText('Gomer Pyle');
    expect(nameElements.length).toBeGreaterThanOrEqual(2);

    // Verify AO link (now uses slug instead of encoded description)
    const aoLink = screen.getByRole('link', { name: 'The Zoo' });
    expect(aoLink).toBeInTheDocument();
    expect(aoLink).toHaveAttribute('href', '/archives/ao/thezoo');

    // Verify PAX count and names
    expect(screen.getByText(/PAX \(3\)/)).toBeInTheDocument();
    expect(screen.getByText(/Shocker/)).toBeInTheDocument();
    expect(screen.getByText(/Twinkle Toes/)).toBeInTheDocument();

    // Verify Content (HTML should be rendered)
    expect(screen.getByText('Burpees')).toBeInTheDocument();
    expect(screen.getByText('Merkins')).toBeInTheDocument();
    
    // Check for author in footer
    expect(screen.getByText(/Posted by:/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API Failure'));

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Loading post...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Error loading post/i)).toBeInTheDocument();
    expect(screen.getByText('API Failure')).toBeInTheDocument();
  });

  it('redirects to 404 if post is not found', async () => {
    // Mock API returning null
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('404 Not Found')).toBeInTheDocument();
    });
  });
});
