import React from 'react';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import '../BigData.css';

const AttendanceReport: React.FC = () => {
  return (
    <>
      <SEO
        title="Attendance Leaderboard - F3 RVA Big Data"
        description="F3 RVA member attendance and workout leader rankings."
        url="https://f3rva.org/bigdata/attendance"
        type="website"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Attendance Leaderboard"
          description="Member rankings by total workouts attended, Qs led, and Q leadership ratio."
          category="LEADERBOARDS"
        />
        <div className="bigdata-card">
          <p style={{ color: '#a0a0a0', margin: 0 }}>Attendance leaderboard component loading...</p>
        </div>
      </div>
    </>
  );
};

export default AttendanceReport;
