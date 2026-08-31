import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewGuyPage from './newGuy';
import * as analytics from '../../utils/analytics';

describe('NewGuyPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and displays guides and video iframe', () => {
    render(
      <MemoryRouter>
        <NewGuyPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome, FNG!')).toBeInTheDocument();
    expect(screen.getByText('Your First Workout')).toBeInTheDocument();
    expect(screen.getByTitle('What is F3?')).toBeInTheDocument();
  });

  it('tracks CTA find workout link click', () => {
    const trackCtaSpy = vi.spyOn(analytics, 'trackFngFindWorkoutClick');

    render(
      <MemoryRouter>
        <NewGuyPage />
      </MemoryRouter>
    );

    const ctaLink = screen.getByText('workout location');
    fireEvent.click(ctaLink);

    expect(trackCtaSpy).toHaveBeenCalled();
  });

  it('tracks podcast link click', () => {
    const trackPodcastSpy = vi.spyOn(analytics, 'trackFngPodcastClick');

    render(
      <MemoryRouter>
        <NewGuyPage />
      </MemoryRouter>
    );

    const podcastLink = screen.getByText(/Listen to "Building Tribe/i);
    fireEvent.click(podcastLink);

    expect(trackPodcastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        podcastUrl: expect.stringContaining('artofmanliness.com'),
        title: expect.stringContaining('Building Tribe'),
      })
    );
  });

  it('tracks Vimeo video play event from postMessage', () => {
    const trackVideoSpy = vi.spyOn(analytics, 'trackFngVideoPlay');

    render(
      <MemoryRouter>
        <NewGuyPage />
      </MemoryRouter>
    );

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://player.vimeo.com',
          data: JSON.stringify({ event: 'play' }),
        })
      );
    });

    expect(trackVideoSpy).toHaveBeenCalledWith({
      videoTitle: 'What is F3?',
      provider: 'vimeo',
    });
  });
});
