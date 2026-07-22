import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SchedulePage from './schedule';
import * as workoutScheduleHook from '../../hooks/useWorkoutSchedule';

// Mock SEO to avoid head side effects
vi.mock('../../components/SEO', () => ({
  default: () => null,
}));

// Mock the useWorkoutSchedule hook
vi.mock('../../hooks/useWorkoutSchedule', () => ({
  useWorkoutSchedule: vi.fn(),
}));

describe('SchedulePage', () => {
  const mockWorkouts = [
    {
      location: 'Test Location 1',
      locationURL: 'http://maps.google.com/1',
      name: 'Test Workout 1',
      tagURL: '/tag/test1',
      dayOfWeek: 'Monday',
      startTime: '0530',
      endTime: '0615',
      workoutStyle: 'Bootcamp',
      siteQ: 'TestQ1',
      notes: 'Test Notes 1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window width for desktop view by default
    globalThis.innerWidth = 1024;
    fireEvent(window, new Event('resize'));

    // Default mock implementation
    vi.mocked(workoutScheduleHook.useWorkoutSchedule).mockReturnValue({
      workouts: mockWorkouts,
      isLoading: false,
      error: null,
    });
  });

  it('renders the main heading and description', () => {
    render(<SchedulePage />);
    expect(screen.getByRole('heading', { name: /Workout Schedule/i })).toBeInTheDocument();
    expect(screen.getByText(/Join us for free, peer-led workouts/i)).toBeInTheDocument();
  });

  it('renders the map iframe with desktop URL by default', () => {
    render(<SchedulePage />);
    const iframe = screen.getByTitle('F3 Workout Locations Map');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining('zoom=10'));
  });

  it('renders the map iframe with mobile URL on small screens', () => {
    // Simulate mobile viewport
    globalThis.innerWidth = 500;
    fireEvent(window, new Event('resize'));

    render(<SchedulePage />);
    const iframe = screen.getByTitle('F3 Workout Locations Map');
    expect(iframe).toHaveAttribute('src', expect.stringContaining('zoom=9'));
  });

  describe('WorkoutScheduleTable', () => {
    it('renders the loading state when isLoading is true', () => {
      vi.mocked(workoutScheduleHook.useWorkoutSchedule).mockReturnValue({
        workouts: [],
        isLoading: true,
        error: null,
      });

      render(<SchedulePage />);
      expect(screen.getByText(/Loading workout schedule.../i)).toBeInTheDocument();
    });

    it('renders the error state when error is present', () => {
      vi.mocked(workoutScheduleHook.useWorkoutSchedule).mockReturnValue({
        workouts: [],
        isLoading: false,
        error: new Error('API error'),
      });

      render(<SchedulePage />);
      expect(screen.getByText(/Unable to load workout schedule/i)).toBeInTheDocument();
    });

    it('renders the workout schedule table when data is loaded', () => {
      render(<SchedulePage />);

      expect(screen.getByText('Test Workout 1')).toBeInTheDocument();
    });
  });
});
