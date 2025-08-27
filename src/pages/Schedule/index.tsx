import React from 'react';
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

      <section className="locations-section">
        <h3 className="section-main-title">Where We Meet</h3>
        <div className="locations-grid-container">
          <div className="location-card-item">
            <h4 className="location-title">Downtown RVA</h4>
            <p className="location-description">
              Kanawha Plaza<br />
              Weekdays: 5:30 AM<br />
              Contact: downtownrvaf3@gmail.com
            </p>
          </div>
          
          <div className="location-card-item">
            <h4 className="location-title">West End</h4>
            <p className="location-description">
              Tuckahoe Creek Park<br />
              Weekdays: 5:30 AM<br />
              Contact: westendrvaf3@gmail.com
            </p>
          </div>
          
          <div className="location-card-item">
            <h4 className="location-title">Southside</h4>
            <p className="location-description">
              Huguenot High School<br />
              Weekdays: 5:30 AM<br />
              Contact: southsidervaf3@gmail.com
            </p>
          </div>
          
          <div className="location-card-item">
            <h4 className="location-title">Henrico</h4>
            <p className="location-description">
              Deep Run Park<br />
              Weekdays: 5:30 AM<br />
              Contact: henricorvaf3@gmail.com
            </p>
          </div>
        </div>
      </section>

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

export default SchedulePage;