import React from 'react';
import { useParams, Link } from 'react-router-dom';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import '../BigData.css';

const AODetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <SEO
        title={`AO Analytics - Location #${id} - F3 RVA`}
        description={`Attendance trends, top attendees, and active streakers for AO #${id}.`}
        url={`https://f3rva.org/bigdata/ao/${id}`}
        type="website"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title={`Area of Operations #${id}`}
          description="Attendance trend curves, top attendees, top Qs, and active streakers."
          category="LOCATIONS"
          actions={
            <Link to="/bigdata/ao" className="bigdata-pill count-pill" style={{ padding: '0.45rem 0.9rem' }}>
              ← Back to All AOs
            </Link>
          }
        />
        <div className="bigdata-card">
          <p style={{ color: '#a0a0a0', margin: 0 }}>AO detail component loading...</p>
        </div>
      </div>
    </>
  );
};

export default AODetail;
