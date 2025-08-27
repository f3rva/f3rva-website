import React from 'react';
import './index.css';

/**
 * Friendly New Guy (FNG) page component for F3 RVA website
 * Provides guidance and information for newcomers to F3
 * Helps new participants understand expectations and feel welcome
 */
const FriendlyNewGuyPage: React.FC = () => {
  return (
    <div className="fng-page-container">
      <section className="fng-hero-section">
        <div className="hero-content-wrapper">
          <h2 className="fng-main-heading">Welcome, FNG!</h2>
          <p className="fng-description">
            New to F3? You're a "Friendly New Guy" (FNG) and we're excited to have you join us!
          </p>
        </div>
      </section>

      <section className="first-workout-section">
        <h3 className="section-main-title">Your First Workout</h3>
        <div className="first-workout-content-wrapper">
          <p className="first-workout-description">
            Showing up for your first F3 workout can feel intimidating, but our community is built 
            on welcoming new members. Here's what you need to know to feel confident and prepared.
          </p>
          <div className="preparation-grid-container">
            <div className="preparation-card-item">
              <h4 className="preparation-title">What to Bring</h4>
              <ul className="preparation-list">
                <li>Comfortable workout clothes</li>
                <li>Running shoes</li>
                <li>Water bottle</li>
                <li>Positive attitude</li>
              </ul>
              <p className="preparation-note">That's it! No gym membership or equipment needed.</p>
            </div>
            
            <div className="preparation-card-item">
              <h4 className="preparation-title">What to Expect</h4>
              <ul className="preparation-list">
                <li>45-minute high-intensity workout</li>
                <li>Bodyweight and functional exercises</li>
                <li>Outdoor setting in all weather</li>
                <li>Circle of Trust (COT) to close</li>
              </ul>
              <p className="preparation-note">Every workout is different and scalable to your fitness level.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="fng-traditions-section">
        <h3 className="section-main-title">F3 Traditions You'll Learn</h3>
        <div className="traditions-grid-container">
          <div className="tradition-card-item">
            <h4 className="tradition-title">Name Your Workout</h4>
            <p className="tradition-description">
              After your first few workouts, you'll receive your F3 name - a unique nickname 
              given by your fellow HIMs (Humans In Motion) based on something memorable about you.
            </p>
          </div>
          
          <div className="tradition-card-item">
            <h4 className="tradition-title">No One Left Behind</h4>
            <p className="tradition-description">
              We modify exercises to include everyone. Whether you're a former athlete or 
              haven't exercised in years, you'll find your place in our community.
            </p>
          </div>
          
          <div className="tradition-card-item">
            <h4 className="tradition-title">Circle of Trust</h4>
            <p className="tradition-description">
              Each workout ends with announcements, intentions, and encouragement. 
              It's where fitness meets fellowship and builds lasting friendships.
            </p>
          </div>
          
          <div className="tradition-card-item">
            <h4 className="tradition-title">Step Up to Lead</h4>
            <p className="tradition-description">
              Once you're comfortable, you'll be encouraged to "take the Q" (lead a workout). 
              Leadership development is part of what makes F3 transformational.
            </p>
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
          <div className="encouragement-highlights-list">
            <ul className="highlights-item-list">
              <li className="highlight-item">Everyone was an FNG once</li>
              <li className="highlight-item">You'll be welcomed and supported</li>
              <li className="highlight-item">Modify any exercise as needed</li>
              <li className="highlight-item">Focus on showing up consistently</li>
              <li className="highlight-item">Ask questions - we love to help</li>
            </ul>
          </div>
          <div className="call-to-action-section">
            <p className="call-to-action-text">
              <strong>Just show up!</strong> Find a workout location and time that works for you, 
              and take the first step toward becoming part of the F3 RVA community.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FriendlyNewGuyPage;