import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Footer from './Footer';
import * as analytics from '../utils/analytics';

describe('Footer component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders footer organization info, mission, and links', () => {
    render(<Footer />);

    expect(screen.getByText('F3RVA')).toBeInTheDocument();
    expect(screen.getByText('Backblasts')).toBeInTheDocument();
    expect(screen.getByText('F3Nation')).toBeInTheDocument();
    expect(screen.getByLabelText('Engage with F3RVA on Slack')).toBeInTheDocument();
  });

  it('tracks outbound clicks on Slack and social links', () => {
    const trackOutboundSpy = vi.spyOn(analytics, 'trackCommunityOutboundClick');

    render(<Footer />);

    const slackLink = screen.getByLabelText('Engage with F3RVA on Slack');
    fireEvent.click(slackLink);

    expect(trackOutboundSpy).toHaveBeenCalledWith({
      platform: 'slack',
      destinationUrl: 'https://f3-rva-workspace.slack.com',
    });

    const backblastsLink = screen.getByText('Backblasts');
    fireEvent.click(backblastsLink);

    expect(trackOutboundSpy).toHaveBeenCalledWith({
      platform: 'backblasts',
      destinationUrl: 'https://backblasts.f3rva.org',
    });
  });
});
