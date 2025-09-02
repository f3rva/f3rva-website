import React from 'react';
import { Link } from 'react-router-dom';
import './newGuy.css';

/**
 * Friendly New Guy (FNG) page component for F3 RVA website
 * Provides guidance and information for newcomers to F3
 * Helps new participants understand expectations and feel welcome
 */
const NewGuyPage: React.FC = () => {
  return (
    <div className="fng-page-container">
      <section className="fng-hero-section">
        <div className="hero-content-wrapper">
          <h2 className="fng-main-heading">Welcome, FNG!</h2>
          <p className="fng-description">
            So you want to be a FNG (Friendly New Guy)?
            <br />
            What did you think FNG stood for?
          </p>
        </div>
      </section>

      <section className="first-workout-section">
        <h3 className="section-main-title">Your First Workout</h3>
        <div className="first-workout-content-wrapper">
          <p className="first-workout-description">
            Showing up for your first F3 workout can feel intimidating, but our community is built 
            on welcoming new members. Here's a great intro video from our friends at F3 Nation
            that should give you a good feel for what is in your future.
          </p>
          
          <div className="video-placeholder">
            <div className="vimeo-embed-container">
                <iframe
                  src="https://player.vimeo.com/video/143444379?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  title="What is F3?"
                ></iframe>
              <script src="https://player.vimeo.com/api/player.js"></script>
            </div>
          </div>
          
          <div className="preparation-grid-container">
            <div className="preparation-card-item">
              <h4 className="preparation-title">What to Bring</h4>
              <ul className="preparation-list">
                <li>Comfortable workout clothes</li>
                <li>Athletic shoes</li>
                <li>Positive attitude</li>
                <li>Gloves (optional)</li>
              </ul>
              <p className="preparation-note">That's it! No gym membership or equipment needed.</p>
            </div>
            
            <div className="preparation-card-item">
              <h4 className="preparation-title">What to Expect</h4>
              <ul className="preparation-list">
                <li>45 to 60 minute high-intensity workout</li>
                <li>Bodyweight and functional exercises</li>
                <li>Outdoor setting in all weather</li>
                <li>Jovial banter from the PAX</li>
              </ul>
              <p className="preparation-note">Every workout is different and scalable to your fitness level.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="podcast-section">
        <div className="podcast-content-wrapper">
          <h3 className="section-main-title">Learn More About F3</h3>
          <p className="podcast-description">
            Want to understand the deeper purpose behind F3? Check out this excellent podcast episode 
            from The Art of Manliness that explores how F3 builds communities of strong men.
          </p>
          <div className="podcast-link-container">
            <a 
              href="https://www.artofmanliness.com/people/relationships/podcast-1068-building-tribe-how-to-create-and-sustain-communities-of-men/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="podcast-link"
            >
              Listen to "Building Tribe - How to Create and Sustain Communities of Men"
            </a>
          </div>
        </div>
      </section>

      <section className="fng-encouragement-section">
        <div className="encouragement-content-wrapper">
          <h3 className="section-main-title">Ready to Start?</h3>
          <p className="encouragement-description">
            The hardest part is showing up for your first workout. Once you do, you'll discover 
            a community that will challenge you physically, support you personally, and help you 
            grow in ways you never expected.
          </p>
          <div className="call-to-action-section">
            <p className="call-to-action-text">
              <strong>Just show up!</strong> Find a <Link to="/schedule" className="content-link">workout location</Link> and time that
              works for you, and take the first step toward becoming part of the F3 RVA community.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewGuyPage;