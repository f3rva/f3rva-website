import React from 'react';

const AttendanceReport: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>Attendance Leaderboard</h1>
      <p style={{ color: '#888' }}>Rankings by workouts attended, Qs led, and Q ratio.</p>
    </div>
  );
};

export default AttendanceReport;
