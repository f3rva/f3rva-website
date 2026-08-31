import React from 'react';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GoogleAnalytics from './GoogleAnalytics';
import * as analyticsConfig from '../config/analytics.js';
import * as cookieConsent from '../utils/cookieConsent';

describe('GoogleAnalytics component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = '';
    delete (window as unknown as { gtag?: unknown }).gtag;
    delete (window as unknown as { dataLayer?: unknown }).dataLayer;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = '';
  });

  it('renders nothing and does not initialize if config is null', () => {
    vi.spyOn(analyticsConfig, 'getAnalyticsConfig').mockReturnValue(null);

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleAnalytics />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
    expect(window.gtag).toBeUndefined();
  });

  it('initializes Consent Mode v2 with default denied when cookies are not accepted', async () => {
    vi.spyOn(analyticsConfig, 'getAnalyticsConfig').mockReturnValue({
      trackingId: 'G-TEST12345',
      enabled: true,
    });
    vi.spyOn(cookieConsent, 'hasAcceptedCookies').mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleAnalytics />
      </MemoryRouter>
    );

    expect(typeof window.gtag).toBe('function');
    expect(window.dataLayer).toBeDefined();

    // Verify script tag injection
    const script = document.querySelector('script[src*="G-TEST12345"]');
    expect(script).not.toBeNull();
    expect(script?.getAttribute('src')).toContain('G-TEST12345');

    // Check dataLayer events for default consent
    const dataLayerEvents = window.dataLayer as unknown[][];
    const defaultConsentCall = dataLayerEvents.find(
      (args) => Array.isArray(args) && args[0] === 'consent' && args[1] === 'default'
    );
    expect(defaultConsentCall).toBeDefined();
    expect(defaultConsentCall?.[2]).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    });
  });

  it('initializes Consent Mode v2 with default granted when cookies were previously accepted', async () => {
    vi.spyOn(analyticsConfig, 'getAnalyticsConfig').mockReturnValue({
      trackingId: 'G-TEST12345',
      enabled: true,
    });
    vi.spyOn(cookieConsent, 'hasAcceptedCookies').mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleAnalytics />
      </MemoryRouter>
    );

    const dataLayerEvents = window.dataLayer as unknown[][];
    const defaultConsentCall = dataLayerEvents.find(
      (args) => Array.isArray(args) && args[0] === 'consent' && args[1] === 'default'
    );
    const consentPayload = defaultConsentCall?.[2] as Record<string, unknown> | undefined;
    expect(consentPayload?.analytics_storage).toBe('granted');
  });

  it('updates consent when cookieConsentAccepted event is dispatched', async () => {
    vi.spyOn(analyticsConfig, 'getAnalyticsConfig').mockReturnValue({
      trackingId: 'G-TEST12345',
      enabled: true,
    });
    vi.spyOn(cookieConsent, 'hasAcceptedCookies').mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleAnalytics />
      </MemoryRouter>
    );

    act(() => {
      window.dispatchEvent(new Event('cookieConsentAccepted'));
    });

    const dataLayerEvents = window.dataLayer as unknown[][];
    const updateConsentCall = dataLayerEvents.find(
      (args) =>
        Array.isArray(args) &&
        args[0] === 'consent' &&
        args[1] === 'update' &&
        (args[2] as Record<string, unknown>)?.analytics_storage === 'granted'
    );
    expect(updateConsentCall).toBeDefined();
  });

  it('updates consent when cookieConsentDeclined event is dispatched', async () => {
    vi.spyOn(analyticsConfig, 'getAnalyticsConfig').mockReturnValue({
      trackingId: 'G-TEST12345',
      enabled: true,
    });
    vi.spyOn(cookieConsent, 'hasAcceptedCookies').mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleAnalytics />
      </MemoryRouter>
    );

    act(() => {
      window.dispatchEvent(new Event('cookieConsentDeclined'));
    });

    const dataLayerEvents = window.dataLayer as unknown[][];
    const updateConsentCall = dataLayerEvents.find(
      (args) =>
        Array.isArray(args) &&
        args[0] === 'consent' &&
        args[1] === 'update' &&
        (args[2] as Record<string, unknown>)?.analytics_storage === 'denied'
    );
    expect(updateConsentCall).toBeDefined();
  });

  it('tracks page_view event on route changes with document title', async () => {
    vi.useFakeTimers();
    vi.spyOn(analyticsConfig, 'getAnalyticsConfig').mockReturnValue({
      trackingId: 'G-TEST12345',
      enabled: true,
    });
    vi.spyOn(cookieConsent, 'hasAcceptedCookies').mockReturnValue(true);

    document.title = 'Test Schedule Title';

    render(
      <MemoryRouter initialEntries={['/schedule']}>
        <GoogleAnalytics />
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(150);
    });

    const dataLayerEvents = window.dataLayer as unknown[][];
    const pageViewCall = dataLayerEvents.find(
      (args) => Array.isArray(args) && args[0] === 'event' && args[1] === 'page_view'
    );
    expect(pageViewCall).toBeDefined();
    expect(pageViewCall?.[2]).toMatchObject({
      page_title: 'Test Schedule Title',
      page_path: '/schedule',
    });

    vi.useRealTimers();
  });
});
