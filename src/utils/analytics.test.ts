import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  trackEvent,
  trackWorkoutDirectionsClick,
  trackWorkoutTagClick,
  trackFngVideoPlay,
  trackFngPodcastClick,
  trackFngFindWorkoutClick,
  trackBigDataSearch,
  trackBigDataSearchSelect,
  trackClaimAliasSubmit,
  trackCommunityOutboundClick,
  trackPageNotFound,
} from './analytics';

describe('analytics utility', () => {
  const mockGtag = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.gtag = mockGtag;
  });

  afterEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it('safely handles trackEvent when window.gtag is not defined', () => {
    delete (window as unknown as { gtag?: unknown }).gtag;
    expect(() => trackEvent('test_event', { key: 'value' })).not.toThrow();
  });

  it('dispatches trackEvent and filters undefined parameters', () => {
    trackEvent('custom_event', {
      validParam: 'hello',
      numParam: 42,
      boolParam: true,
      undefinedParam: undefined,
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'custom_event', {
      validParam: 'hello',
      numParam: 42,
      boolParam: true,
    });
  });

  it('handles errors inside trackEvent gracefully', () => {
    const errorGtag = vi.fn().mockImplementation(() => {
      throw new Error('Gtag network fault');
    });
    window.gtag = errorGtag;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => trackEvent('failing_event')).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('tracks workout directions click', () => {
    trackWorkoutDirectionsClick({
      aoName: 'The Forge',
      dayOfWeek: 'Tuesday',
      startTime: '05:30',
      workoutStyle: 'Bootcamp',
      locationUrl: 'https://maps.google.com/?q=forge',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'workout_directions_click', {
      ao_name: 'The Forge',
      day_of_week: 'Tuesday',
      start_time: '05:30',
      workout_style: 'Bootcamp',
      destination_url: 'https://maps.google.com/?q=forge',
    });
  });

  it('tracks workout tag click', () => {
    trackWorkoutTagClick({
      aoName: 'Dogpile',
      tagUrl: '/archives/ao/dogpile',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'workout_tag_click', {
      ao_name: 'Dogpile',
      tag_url: '/archives/ao/dogpile',
    });
  });

  it('tracks FNG video play with defaults and overrides', () => {
    trackFngVideoPlay();
    expect(mockGtag).toHaveBeenCalledWith('event', 'fng_video_play', {
      video_title: 'What is F3?',
      video_provider: 'vimeo',
    });

    trackFngVideoPlay({ videoTitle: 'Custom Title', provider: 'youtube' });
    expect(mockGtag).toHaveBeenCalledWith('event', 'fng_video_play', {
      video_title: 'Custom Title',
      video_provider: 'youtube',
    });
  });

  it('tracks FNG podcast click', () => {
    trackFngPodcastClick({
      podcastUrl: 'https://artofmanliness.com/f3',
      title: 'Building Tribe',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'fng_podcast_click', {
      destination_url: 'https://artofmanliness.com/f3',
      podcast_title: 'Building Tribe',
    });
  });

  it('tracks FNG find workout CTA click', () => {
    trackFngFindWorkoutClick();
    expect(mockGtag).toHaveBeenCalledWith('event', 'fng_find_workout_click', {
      source_page: 'new_guy_guide',
    });
  });

  it('tracks Big Data search queries and zero result flags', () => {
    trackBigDataSearch({
      searchTerm: 'Shakedown',
      paxCount: 2,
      aoCount: 1,
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'bigdata_search', {
      search_term: 'Shakedown',
      pax_results_count: 2,
      ao_results_count: 1,
      total_results_count: 3,
      is_zero_results: false,
    });

    trackBigDataSearch({
      searchTerm: 'NonexistentPax',
      paxCount: 0,
      aoCount: 0,
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'bigdata_search', {
      search_term: 'NonexistentPax',
      pax_results_count: 0,
      ao_results_count: 0,
      total_results_count: 0,
      is_zero_results: true,
    });
  });

  it('tracks Big Data search selection', () => {
    trackBigDataSearchSelect({
      searchTerm: 'Shakedown',
      selectedType: 'pax',
      selectedId: 42,
      selectedName: 'Shakedown',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'bigdata_search_select', {
      search_term: 'Shakedown',
      selected_type: 'pax',
      selected_id: 42,
      selected_name: 'Shakedown',
    });
  });

  it('tracks claim alias submit', () => {
    trackClaimAliasSubmit({
      primaryMemberId: 101,
      primaryMemberName: 'Atticus',
      aliasMemberId: 202,
      aliasMemberName: 'Atticus Finch',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'claim_alias_submit', {
      primary_member_id: 101,
      primary_member_name: 'Atticus',
      alias_member_id: 202,
      alias_member_name: 'Atticus Finch',
    });
  });

  it('tracks community outbound clicks', () => {
    trackCommunityOutboundClick({
      platform: 'slack',
      destinationUrl: 'https://f3-rva-workspace.slack.com',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'community_outbound_click', {
      platform: 'slack',
      destination_url: 'https://f3-rva-workspace.slack.com',
    });
  });

  it('tracks 404 page not found telemetry with default and custom referrers', () => {
    trackPageNotFound({
      brokenPath: '/broken/legacy.php',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'page_not_found', {
      broken_path: '/broken/legacy.php',
      referrer: 'direct',
    });

    trackPageNotFound({
      brokenPath: '/broken/legacy.php',
      referrer: 'https://google.com',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'page_not_found', {
      broken_path: '/broken/legacy.php',
      referrer: 'https://google.com',
    });
  });
});
