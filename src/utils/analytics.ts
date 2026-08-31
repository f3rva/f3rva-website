/**
 * Google Analytics 4 Telemetry & Event Helpers
 *
 * Provides strictly typed utility functions for sending custom events to GA4.
 * Fails gracefully if Google Analytics is uninitialized or blocked by ad-blockers.
 */

// Event parameter value primitive types (strictly typed, zero 'any')
export type EventParamValue = string | number | boolean | undefined;
export type EventParams = Record<string, EventParamValue>;

/**
 * Generic event dispatcher wrapping gtag('event', ...)
 * @param eventName - The GA4 event name (e.g. 'search', 'workout_directions_click')
 * @param params - Optional structured event parameters
 */
export const trackEvent = (eventName: string, params?: EventParams): void => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      // Filter out undefined values to keep payloads clean
      const cleanedParams: Record<string, string | number | boolean> = {};
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined) {
            cleanedParams[key] = value;
          }
        }
      }
      window.gtag('event', eventName, cleanedParams);
    }
  } catch (error) {
    // Non-blocking catch to ensure telemetry never interrupts user flow
    console.warn('Failed to dispatch analytics event:', eventName, error);
  }
};

/**
 * Track when a user clicks a workout location link (opening Google Maps/Apple Maps directions)
 */
export interface WorkoutDirectionsParams {
  aoName: string;
  dayOfWeek: string;
  startTime: string;
  workoutStyle: string;
  locationUrl: string;
}

export const trackWorkoutDirectionsClick = (params: WorkoutDirectionsParams): void => {
  trackEvent('workout_directions_click', {
    ao_name: params.aoName,
    day_of_week: params.dayOfWeek,
    start_time: params.startTime,
    workout_style: params.workoutStyle,
    destination_url: params.locationUrl,
  });
};

/**
 * Track when a user clicks an AO name/tag to inspect its backblast archive
 */
export interface WorkoutTagParams {
  aoName: string;
  tagUrl: string;
}

export const trackWorkoutTagClick = (params: WorkoutTagParams): void => {
  trackEvent('workout_tag_click', {
    ao_name: params.aoName,
    tag_url: params.tagUrl,
  });
};

/**
 * Track when a user starts playing the "What is F3?" intro video on the New Guy page
 */
export interface FngVideoParams {
  videoTitle?: string;
  provider?: string;
}

export const trackFngVideoPlay = (params?: FngVideoParams): void => {
  trackEvent('fng_video_play', {
    video_title: params?.videoTitle || 'What is F3?',
    video_provider: params?.provider || 'vimeo',
  });
};

/**
 * Track when a user clicks the Art of Manliness podcast link on the New Guy page
 */
export interface FngPodcastParams {
  podcastUrl: string;
  title: string;
}

export const trackFngPodcastClick = (params: FngPodcastParams): void => {
  trackEvent('fng_podcast_click', {
    destination_url: params.podcastUrl,
    podcast_title: params.title,
  });
};

/**
 * Track when a user clicks the "Find a workout location" CTA on the New Guy page
 */
export const trackFngFindWorkoutClick = (): void => {
  trackEvent('fng_find_workout_click', {
    source_page: 'new_guy_guide',
  });
};

/**
 * Track Big Data search queries and result counts
 */
export interface BigDataSearchParams {
  searchTerm: string;
  paxCount: number;
  aoCount: number;
}

export const trackBigDataSearch = (params: BigDataSearchParams): void => {
  const totalResults = params.paxCount + params.aoCount;
  trackEvent('bigdata_search', {
    search_term: params.searchTerm,
    pax_results_count: params.paxCount,
    ao_results_count: params.aoCount,
    total_results_count: totalResults,
    is_zero_results: totalResults === 0,
  });
};

/**
 * Track when a user selects a PAX or AO from the Big Data search dropdown
 */
export interface BigDataSearchSelectParams {
  searchTerm: string;
  selectedType: 'pax' | 'ao';
  selectedId: number;
  selectedName: string;
}

export const trackBigDataSearchSelect = (params: BigDataSearchSelectParams): void => {
  trackEvent('bigdata_search_select', {
    search_term: params.searchTerm,
    selected_type: params.selectedType,
    selected_id: params.selectedId,
    selected_name: params.selectedName,
  });
};

/**
 * Track when a member submits a PAX alias claim request
 */
export interface ClaimAliasSubmitParams {
  primaryMemberId: number;
  primaryMemberName: string;
  aliasMemberId: number;
  aliasMemberName: string;
}

export const trackClaimAliasSubmit = (params: ClaimAliasSubmitParams): void => {
  trackEvent('claim_alias_submit', {
    primary_member_id: params.primaryMemberId,
    primary_member_name: params.primaryMemberName,
    alias_member_id: params.aliasMemberId,
    alias_member_name: params.aliasMemberName,
  });
};

/**
 * Track outbound community and social links (Slack, Instagram, Facebook, X, F3Nation)
 */
export interface CommunityOutboundParams {
  platform: 'slack' | 'instagram' | 'facebook' | 'x' | 'f3nation' | 'backblasts' | string;
  destinationUrl: string;
}

export const trackCommunityOutboundClick = (params: CommunityOutboundParams): void => {
  trackEvent('community_outbound_click', {
    platform: params.platform,
    destination_url: params.destinationUrl,
  });
};

/**
 * Track 404 Not Found errors to detect broken links or outdated redirects
 */
export interface PageNotFoundParams {
  brokenPath: string;
  referrer?: string;
}

export const trackPageNotFound = (params: PageNotFoundParams): void => {
  trackEvent('page_not_found', {
    broken_path: params.brokenPath,
    referrer: params.referrer || 'direct',
  });
};
