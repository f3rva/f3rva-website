/**
 * Interface for workout post data structure from API
 * Used across all archive pages for consistent data modeling
 *
 * Single post usage: WorkoutPost
 * Array usage: WorkoutPost[]
 */

/**
 * Represents an Area of Operations (AO) where the workout takes place
 */
export interface WorkoutAO {
  id: number;
  description: string;
}

/**
 * Represents a member participating in the workout
 * Used for both QIC (Q In Charge) and PAX (participants)
 */
export interface WorkoutMember {
  memberId: number;
  f3Name: string;
}

/**
 * Main interface for a workout post/backblast
 * Contains all necessary data for displaying workout information
 */
export interface WorkoutPost {
  /** Unique identifier for the workout */
  workoutId: number;

  /** URL to the original backblast post */
  backblastUrl: string;

  /** Title of the workout post */
  title: string;

  /** Author of the post */
  author: string;

  /** URL-friendly slug for the post */
  slug: string;

  /** Array of Areas of Operations (workout locations) */
  ao: WorkoutAO[];

  /** Array of QICs (Q In Charge - workout leaders) */
  q: WorkoutMember[];

  /** Array of PAX (participants in the workout) - only available in detailed post views */
  pax?: WorkoutMember[];

  /** Count of PAX participants - available in listing views when pax array is not populated */
  paxCount?: number;

  /** Date when the workout occurred (ISO string format) */
  workoutDate: string;

  /** Rich text content of the backblast post */
  content: string;
}

/**
 * Type alias for arrays of workout posts
 * Used in listing pages that display multiple posts
 */
export type WorkoutPostList = WorkoutPost[];

/**
 * Utility type for partial workout posts
 * Useful for forms or incomplete data scenarios
 */
export type PartialWorkoutPost = Partial<WorkoutPost>;