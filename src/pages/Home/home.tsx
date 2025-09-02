import React from 'react';
import { Link } from 'react-router-dom';
import { MdGroups, MdOutlineDirectionsRun, MdOutlinePinDrop, MdMoneyOff, MdPeople, MdHandshake, MdForum } from 'react-icons/md';
import { WiDayShowers } from "react-icons/wi";
import './home.css';

/**
 * Home page component for F3 RVA website
 * Displays welcome content, mission statement, and key information
 * Serves as the primary landing page for new visitors
 */
const HomePage: React.FC = () => {
  return (
    <>
      <section className="fullwidth-hero-section">
        <img 
          src="/images/dogpile-flag-1024x1024.jpg" 
          alt="F3 RVA Dogpile Flag" 
          className="hero-background-image"
        />
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper">
          <h2 className="welcome-main-heading">Welcome to F3RVA</h2>
          <p className="welcome-description">
            F3 is a national network of free, peer-led workouts for men. We plant, grow, 
            and serve these groups to invigorate male community leadership.
          </p>
          <div className="call-to-action-buttons">
            <Link to="/schedule" className="primary-action-button">Find a Workout</Link>
            <Link to="/friendly-new-guy" className="secondary-action-button">New to F3?</Link>
          </div>
        </div>
      </section>
      
      <div className="home-page-container">

      <section className="narrative-section">
        <h3 className="section-main-title">Our Community</h3>
        <div className="narrative-content-wrapper">
          <p className="narrative-description">
            F3 is a global movement. Started in Charlotte, NC over a decade ago, it provides
            an opportunity for men of all ages and fitness levels to come together and make
            each other better. Stronger men for ourselves, our families, our friends, our
            coworkers, and our communities.
          </p>

          <p className="narrative-description">
            The F3RVA region represents all of the greater Richmond region while providing
            opportunities to individually connect in the neighborhood that you call home.
          </p>
          
          <div className="community-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <MdOutlineDirectionsRun className="stat-icon" />
              </div>
              <h4 className="stat-number">30+</h4>
              <p className="stat-label">Active Workouts</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <MdGroups className="stat-icon" />
              </div>
              <h4 className="stat-number">200+</h4>
              <p className="stat-label">Active Participants</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <MdOutlinePinDrop className="stat-icon" />
              </div>
              <h4 className="stat-number">5</h4>
              <p className="stat-label">Nano Regions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="core-principles-section">
        <h3 className="section-main-title">The 5 Core Principles of F3</h3>
        <div className="principles-grid-container">
          <div className="principle-item">
            <div className="principle-icon">
              <MdMoneyOff className="principle-icon" />
            </div>
            <h4 className="principle-title">Free of Charge</h4>
            <p className="principle-description">
              Never pay to workout, ever
            </p>
          </div>
          
          <div className="principle-item">
            <div className="principle-icon">
              <MdPeople className="principle-icon" />
            </div>
            <h4 className="principle-title">Open to all Men</h4>
            <p className="principle-description">
              All men are welcome regardless of age or fitness
            </p>
          </div>
          
          <div className="principle-item">
            <div className="principle-icon">
              <WiDayShowers className="principle-icon" />
            </div>
            <h4 className="principle-title">Held Outdoors</h4>
            <p className="principle-description">
              Rain or shine, hot or cold, we are out there.
            </p>
          </div>
          
          <div className="principle-item">
            <div className="principle-icon">
              <MdHandshake className="principle-icon" />
            </div>
            <h4 className="principle-title">Peer Led</h4>
            <p className="principle-description">
              Rotating fashion of men leading each other
            </p>
          </div>
          
          <div className="principle-item">
            <div className="principle-icon">
              <MdForum className="principle-icon" />
            </div>
            <h4 className="principle-title">Ends with a COT</h4>
            <p className="principle-description">
              Always ends with a Circle of Trust
            </p>
          </div>
        </div>
      </section>

      <section className="credo-section">
        <div className="credo-content-wrapper">
          <img 
            src="/images/f3-logo.webp" 
            alt="F3 Logo" 
            className="credo-logo"
          />
          <p className="credo-text">
            Leave No Man Behind, <br/> But Leave No Man Where You Find Him.
          </p>
        </div>
      </section>

      <section className="community-information-section">
        <div className="information-content-wrapper">
          <h3 className="section-main-title">Join Our Community</h3>
          <p className="community-description">
            Find a workout that is near you and aligns with your fitness interests, 
            and simply show up! Nothing else is required. For bootcamps, many prefer 
            to bring a pair of gloves, but it’s entirely up to you. Just find a workout, 
            perhaps bring a friend, and the rest is taken care of.
          </p>
          <div className="community-call-to-action">
            <Link to="/schedule" className="primary-action-button">Find a Workout</Link>
            <Link to="/about" className="tertiary-action-button">Learn More</Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default HomePage;