import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

/**
 * Big Data Hub Landing Page
 * Serves as the central entrypoint for F3 RVA community analytics,
 * member leaderboards, AO performance, and self-service tools.
 */
const BigDataHub: React.FC = () => {
  return (
    <>
      <SEO
        title="Big Data - F3 RVA Analytics & Records"
        description="F3 RVA Big Data dashboard. Explore member attendance leaderboards, AO statistics, workout history, and personal stats across the Richmond region."
        url="https://f3rva.org/bigdata"
        type="website"
      />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>F3 RVA Big Data</h1>
          <p style={{ color: '#888', fontSize: '1.1rem' }}>
            Region-wide workout analytics, leaderboards, and member statistics.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#f1b51c', marginTop: 0 }}>📊 Attendance Leaderboard</h2>
            <p style={{ color: '#ccc', fontSize: '0.95rem' }}>
              See top attendees and workout leaders ranked by workouts, Qs, and Q-ratios.
            </p>
            <Link to="/bigdata/attendance" style={{ color: '#f1b51c', fontWeight: 600, textDecoration: 'none' }}>
              View Leaderboard →
            </Link>
          </div>

          <div style={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#f1b51c', marginTop: 0 }}>📍 AO Analytics</h2>
            <p style={{ color: '#ccc', fontSize: '0.95rem' }}>
              Explore Area of Operations performance, attendance trends, and active streakers.
            </p>
            <Link to="/bigdata/ao" style={{ color: '#f1b51c', fontWeight: 600, textDecoration: 'none' }}>
              View AO Analytics →
            </Link>
          </div>

          <div style={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#f1b51c', marginTop: 0 }}>📅 Day of Week Breakdown</h2>
            <p style={{ color: '#ccc', fontSize: '0.95rem' }}>
              Analyze workout volume and regional PAX distribution by day of the week.
            </p>
            <Link to="/bigdata/day-of-week" style={{ color: '#f1b51c', fontWeight: 600, textDecoration: 'none' }}>
              View Day of Week →
            </Link>
          </div>

          <div style={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#f1b51c', marginTop: 0 }}>🏷️ Claim Alias</h2>
            <p style={{ color: '#ccc', fontSize: '0.95rem' }}>
              Merge alternate nicknames or duplicate attendance records to your primary profile.
            </p>
            <Link to="/bigdata/claim-alias" style={{ color: '#f1b51c', fontWeight: 600, textDecoration: 'none' }}>
              Submit Alias Claim →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BigDataHub;
