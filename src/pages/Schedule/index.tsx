import React, { useState } from 'react';
import './index.css';

/**
 * Schedule page component for F3 RVA website
 * Displays workout schedules, locations, and timing information
 * Helps visitors find and join local workout groups
 */
const SchedulePage: React.FC = () => {
  return (
    <div className="schedule-page-container">
      <section className="schedule-hero-section">
        <div className="hero-content-wrapper">
          <h2 className="schedule-main-heading">Workout Schedule</h2>
          <p className="schedule-description">
            Join us for free, peer-led workouts throughout the Richmond area. All fitness levels welcome.
          </p>
        </div>
      </section>

      <section className="workout-times-section">
        <h3 className="section-main-title">When We Meet</h3>
        <div className="times-grid-container">
          <div className="time-card-item">
            <h4 className="time-title">Weekday Mornings</h4>
            <p className="time-description">
              <strong>5:30 AM - 6:15 AM</strong><br />
              Monday through Friday<br />
              Various locations across RVA
            </p>
          </div>
          
          <div className="time-card-item">
            <h4 className="time-title">Saturday Mornings</h4>
            <p className="time-description">
              <strong>7:00 AM - 8:00 AM</strong><br />
              Extended workouts<br />
              Multiple location options
            </p>
          </div>
        </div>
      </section>

      <WorkoutScheduleTable />

      <section className="what-to-expect-section">
        <div className="expect-content-wrapper">
          <h3 className="section-main-title">What to Expect</h3>
          <div className="expect-highlights-list">
            <ul className="highlights-item-list">
              <li className="highlight-item">45-minute high-intensity workouts</li>
              <li className="highlight-item">Bodyweight exercises and functional fitness</li>
              <li className="highlight-item">All weather conditions - rain or shine</li>
              <li className="highlight-item">Supportive community atmosphere</li>
              <li className="highlight-item">Optional coffee and fellowship after</li>
            </ul>
          </div>
          <div className="getting-started-info">
            <p className="getting-started-description">
              New to F3? Just show up! No equipment needed - we'll provide everything you need 
              to get started. Wear comfortable workout clothes and bring water.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * WorkoutScheduleTable component with tabbed interface for 1st F, 2nd F, and 3rd F workouts
 * Displays workout information in a structured table format
 */
const WorkoutScheduleTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'1stF' | '2ndF' | '3rdF'>('1stF');

  // Sample workout data - this should be replaced with actual data source
  const workoutData = {
    '1stF': [
      {
        location: 'Kanawha Plaza',
        name: 'Downtown RVA',
        dayOfWeek: 'Monday-Friday',
        startTime: '5:30 AM',
        endTime: '6:15 AM',
        workoutStyle: 'Bootcamp',
        siteQ: 'Toothless',
        notes: 'Downtown location, all weather conditions'
      },
      {
        location: 'Tuckahoe Creek Park',
        name: 'West End',
        dayOfWeek: 'Monday-Friday',
        startTime: '5:30 AM',
        endTime: '6:15 AM',
        workoutStyle: 'HIIT',
        siteQ: 'Pavement',
        notes: 'Park setting with trails available'
      },
      {
        location: 'Huguenot High School',
        name: 'Southside',
        dayOfWeek: 'Monday-Friday',
        startTime: '5:30 AM',
        endTime: '6:15 AM',
        workoutStyle: 'Functional Fitness',
        siteQ: 'Hammer',
        notes: 'School campus, ample parking'
      },
      {
        location: 'Deep Run Park',
        name: 'Henrico',
        dayOfWeek: 'Monday-Friday',
        startTime: '5:30 AM',
        endTime: '6:15 AM',
        workoutStyle: 'Bootcamp',
        siteQ: 'Clutch',
        notes: 'Large park with varied terrain'
      }
    ],
    '2ndF': [
      {
        location: 'Various Local Restaurants',
        name: 'Coffee & Fellowship',
        dayOfWeek: 'Saturday',
        startTime: '8:00 AM',
        endTime: '10:00 AM',
        workoutStyle: 'Social',
        siteQ: 'Rotating',
        notes: 'Post-workout fellowship and community building'
      },
      {
        location: 'Breweries & Bars',
        name: 'Monthly Social',
        dayOfWeek: 'Various',
        startTime: '6:00 PM',
        endTime: '9:00 PM',
        workoutStyle: 'Social',
        siteQ: 'All PAX',
        notes: 'Monthly social gathering for all F3 members'
      }
    ],
    '3rdF': [
      {
        location: 'Local Churches',
        name: 'Faith Sharing',
        dayOfWeek: 'Sunday',
        startTime: '9:00 AM',
        endTime: '10:30 AM',
        workoutStyle: 'Discussion',
        siteQ: 'Various',
        notes: 'Optional faith-based discussions and community service'
      },
      {
        location: 'Community Centers',
        name: 'Service Projects',
        dayOfWeek: 'Various',
        startTime: 'Varies',
        endTime: 'Varies',
        workoutStyle: 'Service',
        siteQ: 'Volunteer Leads',
        notes: 'Community service opportunities and giving back initiatives'
      }
    ]
  };

  return (
    <section className="workout-schedule-section">
      <h3 className="section-main-title">Workout Details</h3>
      
      <div className="tab-container">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === '1stF' ? 'active' : ''}`}
            onClick={() => setActiveTab('1stF')}
          >
            1st F
          </button>
          <button 
            className={`tab-button ${activeTab === '2ndF' ? 'active' : ''}`}
            onClick={() => setActiveTab('2ndF')}
          >
            2nd F
          </button>
          <button 
            className={`tab-button ${activeTab === '3rdF' ? 'active' : ''}`}
            onClick={() => setActiveTab('3rdF')}
          >
            3rd F
          </button>
        </div>

        <div className="tab-content">
          <div className="table-container">
            <table className="workout-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Name</th>
                  <th>Day of Week</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Workout Style</th>
                  <th>Site Q</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {workoutData[activeTab].map((workout, index) => (
                  <tr key={index}>
                    <td>{workout.location}</td>
                    <td>{workout.name}</td>
                    <td>{workout.dayOfWeek}</td>
                    <td>{workout.startTime}</td>
                    <td>{workout.endTime}</td>
                    <td>{workout.workoutStyle}</td>
                    <td>{workout.siteQ}</td>
                    <td className="notes-column">{workout.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SchedulePage;