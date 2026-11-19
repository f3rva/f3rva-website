import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { BackblastForm } from './BackblastForm';

describe('BackblastForm draft persistence integration (real RichTextEditor & StrictMode)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('f3rva_auth_token', 'valid-jwt');
    localStorage.setItem('f3rva_auth_expires_at', String(Date.now() + 3600_000));
    localStorage.setItem('f3rva_auth_user', JSON.stringify({ memberId: 1, f3Name: 'Dingo', role: 'member' }));

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
          json: async () => [{ memberId: 1, f3Name: 'Dingo' }, { memberId: 2, f3Name: 'Lab Rat' }],
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => [] } as Response);
    });
  });

  it('preserves a saved draft across navigation and restores manually edited date and title', async () => {
    render(
      <React.StrictMode>
        <AuthProvider>
          <MemoryRouter initialEntries={['/backblast/new']}>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/backblast/new">Post</Link>
            </nav>
            <Routes>
              <Route path="/" element={<div>Home Page</div>} />
              <Route path="/backblast/new" element={<BackblastForm />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </React.StrictMode>
    );

    const titleInput = await screen.findByLabelText(/workout title/i);
    const dateInput = screen.getByLabelText(/workout date/i);

    fireEvent.change(dateInput, { target: { value: '2026-11-16' } });
    fireEvent.change(titleInput, { target: { value: 'Morning Beatdown' } });

    await waitFor(() => {
      expect(localStorage.getItem('f3rva_backblast_draft')).not.toBeNull();
    });

    // Leave page and come back
    fireEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(await screen.findByText('Home Page')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Post' }));
    expect(await screen.findByText(/unsaved draft found/i)).toBeInTheDocument();
    expect(screen.getByText(/morning beatdown/i)).toBeInTheDocument();

    // Restore draft and verify both title and manually edited date return
    fireEvent.click(screen.getByRole('button', { name: /restore draft/i }));
    expect(screen.getByLabelText(/workout title/i)).toHaveValue('Morning Beatdown');
    expect(screen.getByLabelText(/workout date/i)).toHaveValue('2026-11-16');
  });

  it('does not create a draft when merely visiting the form without editing', async () => {
    render(
      <React.StrictMode>
        <AuthProvider>
          <MemoryRouter initialEntries={['/backblast/new']}>
            <BackblastForm />
          </MemoryRouter>
        </AuthProvider>
      </React.StrictMode>
    );

    await screen.findByRole('heading', { name: /post a backblast/i });

    expect(localStorage.getItem('f3rva_backblast_draft')).toBeNull();
    expect(screen.queryByRole('button', { name: /clear draft/i })).not.toBeInTheDocument();
  });
});
