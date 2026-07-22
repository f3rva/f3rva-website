import { useState, useEffect } from 'react';

export type Workout = {
  location: string;
  locationURL: string;
  name: string;
  tagURL: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  workoutStyle: string;
  siteQ: string;
  notes: string;
};

export type UseWorkoutScheduleResult = {
  workouts: Workout[];
  isLoading: boolean;
  error: Error | null;
};

export function useWorkoutSchedule(): UseWorkoutScheduleResult {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_SCHEDULE_API_URL;
    if (!apiUrl || apiUrl === 'undefined') {
      setError(new Error('VITE_SCHEDULE_API_URL is not defined in environment variables'));
      setIsLoading(false);
      return;
    }
    let isMounted = true;

    async function fetchSchedule() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(apiUrl, {
          headers: {
            'Client': 'f3rva-website',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch workout schedule: HTTP ${response.status}`);
        }

        const data = await response.json();
        const workoutList: Workout[] = data['1stF'] || data.events || [];

        if (isMounted) {
          setWorkouts(workoutList);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    }

    fetchSchedule();

    return () => {
      isMounted = false;
    };
  }, []);

  return { workouts, isLoading, error };
}
