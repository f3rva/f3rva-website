import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BackblastForm } from './BackblastForm';
import { AuthContext } from '../../context/AuthContext';
import { formatDateToISO } from '../../utils/dateUtils';

vi.mock('../../components/RichTextEditor', () => ({
  default: ({ content, onChange }: { content: string; onChange: (val: string) => void }) => (
    <textarea data-testid="mock-rich-editor" value={content} onChange={(e) => onChange(e.target.value)} />
  ),
  RichTextEditor: ({ content, onChange }: { content: string; onChange: (val: string) => void }) => (
    <textarea data-testid="mock-rich-editor" value={content} onChange={(e) => onChange(e.target.value)} />
  ),
}));

describe('BackblastForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/v2/workouts/aos')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, description: 'First Watch', slug: 'first-watch' }],
        } as Response);
      }
      if (url.includes('/v2/members')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ memberId: 1, f3Name: 'Dingo' }],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Slack login prompt when unauthenticated', () => {
    const mockAuthContext = {
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      adminUsername: null,
      loading: false,
      error: null,
      loginWithToken: vi.fn(),
      logout: vi.fn(),
      getAuthHeaders: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole('heading', { name: /sign in with slack/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with slack/i })).toBeInTheDocument();
  });

  it('renders backblast form when authenticated', async () => {
    const mockAuthContext = {
      token: 'valid-jwt',
      isAuthenticated: true,
      isAdmin: false,
      user: { memberId: 1, f3Name: 'Dingo', role: 'member' as const },
      adminUsername: 'Dingo',
      loading: false,
      error: null,
      loginWithToken: vi.fn(),
      logout: vi.fn(),
      getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer valid-jwt' }),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByRole('heading', { name: /post a backblast/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/workout title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/workout date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/area of operations/i)).toBeInTheDocument();
    expect(screen.getByText(/q \/ co-q\(s\)/i)).toBeInTheDocument();
    expect(screen.getByText(/pax attendees/i)).toBeInTheDocument();
    expect(screen.getByText(/friendly new guys \(fngs\)/i)).toBeInTheDocument();
    expect(screen.getByText(/downrange pax \(dr\)/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const mockAuthContext = {
      token: 'valid-jwt',
      isAuthenticated: true,
      isAdmin: false,
      user: { memberId: 1, f3Name: 'Dingo', role: 'member' as const },
      adminUsername: 'Dingo',
      loading: false,
      error: null,
      loginWithToken: vi.fn(),
      logout: vi.fn(),
      getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer valid-jwt' }),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const submitBtn = await screen.findByRole('button', { name: /publish backblast/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
  });

  it('displays soft warning banner when entered FNG matches an existing roster member', async () => {
    const mockAuthContext = {
      token: 'valid-jwt',
      isAuthenticated: true,
      isAdmin: false,
      user: { memberId: 1, f3Name: 'Dingo', role: 'member' as const },
      adminUsername: 'Dingo',
      loading: false,
      error: null,
      loginWithToken: vi.fn(),
      logout: vi.fn(),
      getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer valid-jwt' }),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await screen.findByRole('heading', { name: /post a backblast/i });

    // Find FNG input
    const fngInput = screen.getByPlaceholderText(/type fng name/i);
    fireEvent.change(fngInput, { target: { value: 'Dingo' } });
    fireEvent.keyDown(fngInput, { key: 'Enter', code: 'Enter' });

    // Warning banner should appear
    expect(await screen.findByRole('alert')).toHaveTextContent(/already a registered member in the roster/i);
  });

  it('rejects custom Q entry when name is not in the roster', async () => {
    const mockAuthContext = {
      token: 'valid-jwt',
      isAuthenticated: true,
      isAdmin: false,
      user: { memberId: 1, f3Name: 'Dingo', role: 'member' as const },
      adminUsername: 'Dingo',
      loading: false,
      error: null,
      loginWithToken: vi.fn(),
      logout: vi.fn(),
      getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer valid-jwt' }),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await screen.findByRole('heading', { name: /post a backblast/i });

    const qInput = screen.getByLabelText(/q \/ co-q/i);
    fireEvent.change(qInput, { target: { value: 'Unknown Leader' } });
    fireEvent.keyDown(qInput, { key: 'Enter', code: 'Enter' });

    expect(screen.queryByText('Unknown Leader')).not.toBeInTheDocument();
  });

  it('does not display warning banner in edit mode for FNGs that already belong to the workout', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/v2/workouts/42')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 42,
            title: 'Test Workout',
            workoutDate: '2026-09-01',
            ao: [{ id: 1, description: 'First Watch', slug: 'first-watch' }],
            q: [{ memberId: 1, f3Name: 'Dingo' }],
            pax: [{ memberId: 1, f3Name: 'Dingo' }],
            fngs: [{ memberId: 99, f3Name: 'Flipper' }],
            drs: [],
            content: '<p>Workout content</p>',
            slug: 'test-workout',
          }),
        } as Response);
      }
      if (url.includes('/v2/workouts/aos')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, description: 'First Watch', slug: 'first-watch' }],
        } as Response);
      }
      if (url.includes('/v2/members')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { memberId: 1, f3Name: 'Dingo' },
            { memberId: 99, f3Name: 'Flipper' },
          ],
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => [] } as Response);
    });

    const mockAuthContext = {
      token: 'valid-jwt',
      isAuthenticated: true,
      isAdmin: false,
      user: { memberId: 1, f3Name: 'Dingo', role: 'member' as const },
      adminUsername: 'Dingo',
      loading: false,
      error: null,
      loginWithToken: vi.fn(),
      logout: vi.fn(),
      getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer valid-jwt' }),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/backblast/edit/42']}>
          <Routes>
            <Route path="/backblast/edit/:id" element={<BackblastForm />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await screen.findByRole('heading', { name: /edit backblast/i });

    // Flipper chip should be displayed as part of the workout
    expect(await screen.findByText('Flipper')).toBeInTheDocument();

    // Alert should NOT be present for Flipper
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // Past-date heads-up warning should NOT appear in edit mode
    expect(screen.queryByText(/heads up:/i)).not.toBeInTheDocument();
  });

  it('displays draft recovery banner and supports restoring or discarding a saved draft', async () => {
    const savedAt = new Date(Date.now() - 15 * 60 * 1000);
    localStorage.setItem(
      'f3rva_backblast_draft',
      JSON.stringify({
        title: 'Saved Beatdown',
        workoutDate: formatDateToISO(new Date()),
        aoNames: ['First Watch'],
        body: '<p>Saved body</p>',
      })
    );
    localStorage.setItem('f3rva_backblast_draft_time', savedAt.toISOString());

    const mockAuthContext = {
      token: 'valid-jwt',
      isAuthenticated: true,
      isAdmin: false,
      user: { memberId: 1, f3Name: 'Dingo', role: 'member' as const },
      adminUsername: 'Dingo',
      loading: false,
      error: null,
      loginWithToken: vi.fn(),
      logout: vi.fn(),
      getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer valid-jwt' }),
    };

    const { unmount } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByText(/unsaved draft found/i)).toBeInTheDocument();
    expect(screen.getByText(/saved beatdown/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/workout title/i)).toHaveValue('');

    fireEvent.click(screen.getByRole('button', { name: /restore draft/i }));
    expect(screen.getByLabelText(/workout title/i)).toHaveValue('Saved Beatdown');
    expect(screen.queryByText(/unsaved draft found/i)).not.toBeInTheDocument();

    unmount();

    // Re-render with draft and click Discard
    localStorage.setItem('f3rva_backblast_draft_time', savedAt.toISOString());
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByText(/unsaved draft found/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /discard/i }));
    expect(screen.queryByText(/unsaved draft found/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('f3rva_backblast_draft')).toBeNull();
  });

  it('shows past-date warning with Set to Today button and blocks future dates in create mode', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 19, 8, 0, 0));

    const mockAuthContext = {
      token: 'valid-jwt',
      isAuthenticated: true,
      isAdmin: false,
      user: { memberId: 1, f3Name: 'Dingo', role: 'member' as const },
      adminUsername: 'Dingo',
      loading: false,
      error: null,
      loginWithToken: vi.fn(),
      logout: vi.fn(),
      getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer valid-jwt' }),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const dateInput = await screen.findByLabelText(/workout date/i);
    expect(dateInput).toHaveValue('2026-11-19');
    expect(dateInput).toHaveAttribute('max', '2026-11-19');

    // Select a date 3 days ago
    fireEvent.change(dateInput, { target: { value: '2026-11-16' } });
    expect(screen.getByText(/heads up:/i)).toBeInTheDocument();
    expect(screen.getByText(/3 days ago/i)).toBeInTheDocument();

    // Reset back to today
    fireEvent.click(screen.getByRole('button', { name: /set to today/i }));
    expect(dateInput).toHaveValue('2026-11-19');
    expect(screen.queryByText(/heads up:/i)).not.toBeInTheDocument();

    // Select a future date and submit
    fireEvent.change(dateInput, { target: { value: '2026-11-25' } });
    fireEvent.click(screen.getByRole('button', { name: /publish backblast/i }));
    expect(await screen.findByText('Workout date cannot be in the future.')).toBeInTheDocument();
  });
});
