import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SchedulePage from './schedule';

// Mock SEO to avoid head side effects
vi.mock('../../components/SEO', () => ({
  default: () => null,
}));

// Mock the JSON data import
vi.mock('./workoutData.json', () => ({
  default: {
    '1stF': [
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
        notes: 'Test Notes 1'
      }
    ],
    '2ndF': [
      {
        location: 'Test Location 2',
        locationURL: 'http://maps.google.com/2',
        name: 'Test Event 2',
        tagURL: '/tag/test2',
        dayOfWeek: 'Tuesday',
        startTime: '1800',
        endTime: '1900',
        workoutStyle: 'Social',
        siteQ: 'TestQ2',
        notes: 'Test Notes 2'
      }
    ],
    '3rdF': []
  }
}));

describe('SchedulePage', () => {
  beforeEach(() => {
    // Reset window width for desktop view by default
    globalThis.innerWidth = 1024;
    fireEvent(window, new Event('resize'));
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
    it('renders the workout schedule table', () => {
      render(<SchedulePage />);

      // Check for 1stF workout data
      expect(screen.getByText('Test Workout 1')).toBeInTheDocument();
      expect(screen.getByText('TestQ1')).toBeInTheDocument();
    });
  });
});
