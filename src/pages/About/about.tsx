import React from 'react';
import './about.css';

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
          <h2 className="about-main-heading">About F3RVA</h2>
          <p className="about-description">
            Transforming men and communities in Richmond, Virginia.
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
            of regions across the United States. F3RVA launched in Richmond on 9/20/2014 at Gridiron.
            24 redwoods showed up that day to start a rapidly expanding chapter of F3 in the Richmond
            region.
          </p>
          <p className="history-description">
            What started as a small group of men looking for accountability in fitness has grown 
            into a community that impacts families, workplaces, and neighborhoods throughout 
            the Richmond area.
          </p>
          <p className="history-description">
            Expansion happened quickly, with new workout locations and groups forming throughout the
            Richmond area. All of this was organic, someone lived far away from one of the existing
            workouts, so he took the leadership to start a new workout. Today, F3RVA continues to grow, 
            welcoming men from all walks of life to join in.
          </p>
          <p className="history-description">
            Over the years, there have been many memorable moments and milestones for F3RVA. They
            are too numerous to list here, but when you come to your first workout, you will likely
            hear stories of the Blue Ridge Relay (BRR), The Century Classic, The Corporate Challenge,
            The Ghost Flag, The Podcast, The Frozen Triangle, Thanksgiving History Lessons, and many
            more.
          </p>
          <p className="history-description">
            These events served as a foundation for the culture that continues to grow within each of
            the nano-regions within F3RVA. Nano-regions is something we coined as well as a part of early
            F3RVA lore as a way to induce competition between the different areas of Richmond.
          </p>
          <p className="history-description">
            Now, F3RVA spans from the West End, the City of Richmond, Mechanicsville, New Kent, North and
            South Chesterfield, and even call our friends in Amelia as a part of our extended F3RVA family.
          </p>
          <p className="history-description">
            Outside of our region, we helped start F3 Hampton Roads and F3 Charlottesville to help expand
            the F3 movement throughout the Commonwealth of Virginia.
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