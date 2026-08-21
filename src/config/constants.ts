/**
 * Centralized Constants Dictionary for F3 RVA Big Data & Application Logic.
 * Eliminates magic constants across services, components, and reports.
 */

/** Region inception date for all-time historical calculations */
export const F3_INCEPTION_DATE = '2014-01-01';

/** Special reserved Member ID for anonymous / non-registered "All PAX" aggregation */
export const ALL_PAX_MEMBER_ID = 123;
export const ALL_PAX_NAME = 'All PAX';

/** Default pagination parameters */
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/** Alias claim status enumeration */
export const ALIAS_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type AliasStatus = (typeof ALIAS_STATUS)[keyof typeof ALIAS_STATUS];

/** Timeframe presets for report aggregations */
export const TIMEFRAME_PRESETS = {
  YTD: 'ytd',
  PAST_12M: '12m',
  LAST_30D: '30d',
  ALL_TIME: 'all',
} as const;

export type TimeframePreset = (typeof TIMEFRAME_PRESETS)[keyof typeof TIMEFRAME_PRESETS];

/** Sorting metrics for attendance leaderboards */
export const SORT_METRICS = {
  WORKOUTS: 'workout',
  QS: 'q',
  RATIO: 'ratio',
} as const;

export type SortMetric = (typeof SORT_METRICS)[keyof typeof SORT_METRICS];
