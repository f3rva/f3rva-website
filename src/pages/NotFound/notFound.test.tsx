import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotFoundPage from './notFound';
import * as analytics from '../../utils/analytics';

describe('NotFoundPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 404 message and helpful links', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
    expect(screen.getByText('Find a Workout')).toBeInTheDocument();
  });

  it('triggers trackPageNotFound on mount', () => {
    const trackNotFoundSpy = vi.spyOn(analytics, 'trackPageNotFound');

    render(
      <MemoryRouter initialEntries={['/nonexistent-route']}>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(trackNotFoundSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        brokenPath: expect.any(String),
      })
    );
  });
});
