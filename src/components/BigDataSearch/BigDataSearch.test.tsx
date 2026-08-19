import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BigDataSearch from './BigDataSearch';

const mockAos = [
  { aoId: 1, description: 'The Foundry', totalWorkouts: 100, totalPax: 1200, averagePax: 12.0 },
  { aoId: 2, description: 'Gridiron', totalWorkouts: 80, totalPax: 800, averagePax: 10.0 },
];

const mockMembers = [
  { memberId: 101, f3Name: 'Bischoff' },
  { memberId: 102, f3Name: 'Biscuits' },
];

describe('BigDataSearch Universal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search input', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockAos,
    } as Response);

    render(
      <MemoryRouter>
        <BigDataSearch />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search any PAX or AO/i)).toBeInTheDocument();
    });
  });


  it('searches and displays suggestions for matching query', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v2/reports/ao')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockAos,
        } as Response);
      }
      if (urlStr.includes('/v2/members/lookup')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMembers,
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <MemoryRouter>
        <BigDataSearch />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Search any PAX or AO/i);
    fireEvent.change(input, { target: { value: 'Bisc' } });

    await waitFor(() => {
      expect(screen.getByText('Bischoff')).toBeInTheDocument();
      expect(screen.getByText('Biscuits')).toBeInTheDocument();
    });
  });

  it('navigates to member profile when clicked', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v2/reports/ao')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockAos,
        } as Response);
      }
      if (urlStr.includes('/v2/members/lookup')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMembers,
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <MemoryRouter initialEntries={['/bigdata']}>
        <Routes>
          <Route path="/bigdata" element={<BigDataSearch />} />
          <Route path="/bigdata/pax/:id" element={<div>Member Profile Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Search any PAX or AO/i);
    fireEvent.change(input, { target: { value: 'Bisch' } });

    await waitFor(() => {
      expect(screen.getByText('Bischoff')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Bischoff'));

    await waitFor(() => {
      expect(screen.getByText('Member Profile Target')).toBeInTheDocument();
    });
  });
});
