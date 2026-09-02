/**
 * TypeScript interface definitions for Big Data entities, analytical reports,
 * leaderboards, and administrative mutations matching f3rva-api v2 schemas.
 */

import { WorkoutPost } from './WorkoutPost';

/**
 * Summary representation of an Area of Operations (AO).
 */
export interface AOSummary {
  id: number;
  description: string;
  slug?: string | null;
}

/**
 * Summary representation of an F3 Member / PAX.
 */
export interface MemberSummary {
  memberId: number;
  f3Name: string;
}

/**
 * Member attendance and leadership statistics.
 */
export interface MemberStats {
  memberId: number;
  numWorkouts: number;
  numQs: number;
  qRatio: number;
}

/**
 * Detailed member profile including aliases, statistics, and full workout histories.
 */
export interface MemberDetail {
  memberId: number;
  f3Name: string;
  aliases: string[];
  stats: MemberStats;
  attendedWorkouts: WorkoutPost[];
  qdWorkouts: WorkoutPost[];
}

/**
 * Workout and Q count distribution for a member at a specific AO.
 */
export interface MemberAODistribution {
  aoId: number;
  description: string;
  qCount: number;
  paxCount: number;
}

/**
 * Full AO distribution response for a member.
 */
export interface MemberDistributionResponse {
  memberId: number;
  f3Name: string;
  distribution: MemberAODistribution[];
}

/**
 * Member entry in the attendance leaderboard report.
 */
export interface AttendanceLeaderboardItem {
  memberId: number;
  f3Name: string;
  numWorkouts: number;
  numQs: number;
  qRatio: number;
}

/**
 * Area of Operations aggregate attendance summary.
 */
export interface AOAttendanceSummary {
  aoId: number;
  description: string;
  slug?: string | null;
  totalWorkouts: number;
  totalPax: number;
  averagePax: number;
}

/**
 * Ranked leaderboard entry (used for Top Qs, Top PAX, and Streakers).
 */
export interface LeaderboardEntry {
  id: number;
  name: string;
  count: number;
}

/**
 * Consolidated leaderboard and streaker metrics for a specific AO.
 */
export interface AOLeaderboardResponse {
  aoId: number;
  description: string;
  topQs: LeaderboardEntry[];
  topPax: LeaderboardEntry[];
  streakers: LeaderboardEntry[];
}

/**
 * Workout frequency and attendance metrics aggregated by day of the week.
 */
export interface DayOfWeekAttendance {
  dayId: number; // 1 = Sunday, 7 = Saturday
  dayName: string;
  workoutCount: number;
  totalPax: number;
  averagePax: number;
}

/**
 * Payload to submit a member alias claim or direct merger.
 */
export interface AliasClaimRequest {
  primaryMemberId: number;
  aliasMemberId: number;
}

/**
 * Alias request item returned by self-service and admin endpoints.
 */
export interface AliasRequestResponse {
  primaryMember: MemberSummary;
  aliasMember: MemberSummary;
  status: 'pending' | 'approved' | 'rejected' | string;
}

/**
 * Administrator login request payload.
 */
export interface AdminLoginRequest {
  username: string;
  password: string;
}

/**
 * JWT Access Token response from admin login.
 */
export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Standard structured API error response.
 */
export interface ApiErrorResponse {
  errorCode: number;
  errorMessage: string;
}

/**
 * Authenticated user profile (Member or Admin).
 */
export interface AuthUserProfile {
  slackUserId?: string;
  memberId?: number;
  f3Name: string;
  role: 'member' | 'admin';
  realName?: string;
  email?: string;
}

/**
 * Slack OAuth authentication response.
 */
export interface SlackAuthResponse {
  isLinked: boolean;
  accessToken?: string | null;
  tokenType?: string;
  expiresIn?: number;
  user?: AuthUserProfile | null;
  suggestedMember?: MemberSummary | null;
  tempToken?: string | null;
}

/**
 * Structured AO input for workout creation / update.
 */
export interface AOInput {
  name: string;
  slug?: string | null;
}

/**
 * Payload to create a new workout.
 */
export interface AddWorkoutPayload {
  title: string;
  workoutDate: string;
  qic: string[] | string;
  pax: string[] | string;
  aos: (AOInput | string)[];
  body?: string | null;
  url?: string | null;
  author?: string | null;
  slug?: string | null;
}

/**
 * Payload to update an existing workout.
 */
export interface UpdateWorkoutPayload {
  title: string;
  workoutDate: string;
  qic: string[] | string;
  pax: string[] | string;
  aos: (AOInput | string)[];
  body?: string | null;
  url?: string | null;
  author?: string | null;
  slug?: string | null;
}

/**
 * Response when a workout is created.
 */
export interface WorkoutCreatedResponse {
  id: number;
  title: string;
  workoutDate: string;
  url?: string | null;
  slug?: string | null;
}

/**
 * Response when a workout is updated.
 */
export interface WorkoutUpdatedResponse {
  id: number;
  title: string;
  workoutDate: string;
  url?: string | null;
  slug?: string | null;
}
