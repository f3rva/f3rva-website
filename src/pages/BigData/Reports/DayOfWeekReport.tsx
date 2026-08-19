import React from 'react';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import '../BigData.css';

const DayOfWeekReport: React.FC = () => {
  return (
    <>
      <SEO
        title="Day of Week Breakdown - F3 RVA Big Data"
        description="Regional workout frequency and attendance distribution by day of week."
        url="https://f3rva.org/bigdata/day-of-week"
        type="website"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Day of Week Breakdown"
          description="Analyze workout volume and regional PAX distribution across each day of the week."
          category="REPORTS"
        />
        <div className="bigdata-card">
          <p style={{ color: '#a0a0a0', margin: 0 }}>Day of week analytics component loading...</p>
        </div>
      </div>
    </>
  );
};

export default DayOfWeekReport;
