import React from 'react';
import './index.css';

/**
 * About page component for F3 RVA website
 * Provides detailed information about F3 mission, values, and local community
 * Educates visitors about the F3 movement and Richmond chapter specifics
 */
const AboutPage: React.FC = () => {
  return (
    <div className="about-page-container">
      <section className="about-hero-section">
        <div className="hero-content-wrapper">
          <h2 className="about-main-heading">About F3 RVA</h2>
          <p className="about-description">
            Fitness, Fellowship, and Faith - transforming men and communities in Richmond, Virginia.
          </p>
        </div>
      </section>

      <section className="mission-statement-section">
        <h3 className="section-main-title">Our Mission</h3>
        <div className="mission-content-wrapper">
          <p className="mission-description">
            F3 is a national fitness movement focused on peer-led workouts that are free of charge, 
            open to all men, and held outdoors in all weather conditions. We plant, grow and serve 
            small workout groups for men for the invigoration of male community leadership.
          </p>
        </div>
      </section>

      <section className="history-section">
        <h3 className="section-main-title">Our Story</h3>
        <div className="history-content-wrapper">
          <p className="history-description">
            F3 was founded in Charlotte, North Carolina in 2011 and has since expanded to hundreds 
            of regions across the United States. F3 RVA launched in Richmond with the mission of 
            building stronger men through challenging workouts, meaningful relationships, and 
            spiritual growth.
          </p>
          <p className="history-description">
            What started as a small group of men looking for accountability in fitness has grown 
            into a community that impacts families, workplaces, and neighborhoods throughout 
            the Richmond area.
          </p>
        </div>
      </section>

      <section className="values-section">
        <h3 className="section-main-title">Our Values</h3>
        <div className="values-grid-container">
          <div className="value-card-item">
            <h4 className="value-title">Leadership</h4>
            <p className="value-description">
              Every man is encouraged to step up and lead, whether in workouts, 
              community service, or daily life.
            </p>
          </div>
          
          <div className="value-card-item">
            <h4 className="value-title">Accountability</h4>
            <p className="value-description">
              We challenge each other to show up, work hard, and be better 
              versions of ourselves every day.
            </p>
          </div>
          
          <div className="value-card-item">
            <h4 className="value-title">Service</h4>
            <p className="value-description">
              We serve our families, communities, and each other through 
              acts of service and leadership.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;