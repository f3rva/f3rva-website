import React, { useState } from 'react';
import './index.css';
import workoutDataJson from './workoutData.json';

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

      <section className="workout-description-section">
        <div className="description-content-wrapper">
          <p className="workout-brief-description">
            Find workout locations and times throughout the Richmond area using our interactive map
            or the full workout list below. We are constantly adding new workouts, so check back often!
          </p>
        </div>
      </section>

      <section className="workout-map-section">
        <div className="map-container">
          <iframe 
            style={{border: '1px solid #aaa'}} 
            src="https://map.f3nation.com/?lat=37.521167&amp;lon=-77.41183535&amp;zoom=11" 
            width="100%" 
            height="650" 
            allow="geolocation"
            title="F3 Workout Locations Map"
          />
        </div>
      </section>

      <WorkoutScheduleTable />
    </div>
  );
};

/**
 * WorkoutScheduleTable component with tabbed interface for 1st F, 2nd F, and 3rd F workouts
 * Displays workout information in a structured table format
 */
const WorkoutScheduleTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'1stF' | '2ndF' | '3rdF'>('1stF');

  // Typed workout data imported from external JSON
  type Workout = {
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

  type WorkoutData = {
    '1stF': Workout[];
    '2ndF': Workout[];
    '3rdF': Workout[];
  };

  const workoutData: WorkoutData = workoutDataJson as unknown as WorkoutData;

  return (
    <section className="workout-schedule-section">
      <h3 className="section-main-title">Workout List</h3>
      
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
                    <td><a href={workout.locationURL} target="_blank" rel="noopener noreferrer">{workout.location}</a></td>
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