import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AOReport from './AOReport';

const mockAos = [
  { aoId: 1, description: 'The Foundry', totalWorkouts: 120, totalPax: 1800, averagePax: 15.0 },
  { aoId: 2, description: 'Gridiron', totalWorkouts: 80, totalPax: 880, averagePax: 11.0 },
  { aoId: 3, description: 'Dogpile', totalWorkouts: 50, totalPax: 400, averagePax: 8.0 },
];

describe('AOReport Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <AOReport />
      </MemoryRouter>
    );

    expect(screen.getByText(/Calculating AO analytics/i)).toBeInTheDocument();
  });

  it('renders AO performance table, timeframe presets, and summary KPIs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockAos,
    } as Response);

    render(
      <MemoryRouter>
        <AOReport />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('The Foundry').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('AO Attendance & Health Analytics')).toBeInTheDocument();
    expect(screen.getAllByText(/The Foundry/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Gridiron/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Dogpile/).length).toBeGreaterThan(0);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('12.3')).toBeInTheDocument();
  });

  it('filters AOs by search input', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockAos,
    } as Response);

    render(
      <MemoryRouter>
        <AOReport />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('The Foundry')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Filter AOs by name/i);
    fireEvent.change(input, { target: { value: 'Dogpile' } });

    expect(screen.queryByRole('link', { name: /The Foundry/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Dogpile/i }).length).toBe(2);
  });

  it('switches timeframe preset and triggers new query', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockAos,
    } as Response);

    render(
      <MemoryRouter>
        <AOReport />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('The Foundry')).toBeInTheDocument();
    });

    const allTimeBtn = screen.getByRole('tab', { name: 'All-Time' });
    fireEvent.click(allTimeBtn);

    expect(allTimeBtn).toHaveClass('active');
    expect(fetchSpy).toHaveBeenCalled();
  });
});
