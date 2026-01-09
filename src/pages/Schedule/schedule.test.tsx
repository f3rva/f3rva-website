import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SchedulePage from './schedule.tsx';

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
    it('renders the 1stF tab by default', () => {
      render(<SchedulePage />);
      
      // Check for tab button active state
      const tab1 = screen.getByRole('button', { name: '1st F' });
      expect(tab1).toHaveClass('active');

      // Check for 1stF data
      expect(screen.getByText('Test Workout 1')).toBeInTheDocument();
      expect(screen.getByText('TestQ1')).toBeInTheDocument();

      // Ensure 2ndF data is NOT present
      expect(screen.queryByText('Test Event 2')).not.toBeInTheDocument();
    });

    it('switches to 2ndF tab when clicked', () => {
      render(<SchedulePage />);
      
      const tab2 = screen.getByRole('button', { name: '2nd F' });
      fireEvent.click(tab2);

      // Check active class
      expect(tab2).toHaveClass('active');
      expect(screen.getByRole('button', { name: '1st F' })).not.toHaveClass('active');

      // Check content updated
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
      expect(screen.queryByText('Test Workout 1')).not.toBeInTheDocument();
    });

    it('switches to 3rdF tab when clicked', () => {
      render(<SchedulePage />);
      
      const tab3 = screen.getByRole('button', { name: '3rd F' });
      fireEvent.click(tab3);

      expect(tab3).toHaveClass('active');
      // 3rdF is empty in our mock, so checking for absence of previous data is enough
      expect(screen.queryByText('Test Workout 1')).not.toBeInTheDocument();
    });
  });
});
