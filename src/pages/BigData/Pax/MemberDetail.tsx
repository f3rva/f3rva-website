import React from 'react';
import { useParams, Link } from 'react-router-dom';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import '../BigData.css';

const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <SEO
        title={`PAX Profile #${id} - F3 RVA Big Data`}
        description={`Attendance heatmap, AO distribution, and workout history for member #${id}.`}
        url={`https://f3rva.org/bigdata/pax/${id}`}
        type="profile"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title={`Member Profile #${id}`}
          description="Annual activity heatmap, AO distribution breakdown, and complete workout history."
          category="MEMBERS"
          actions={
            <Link to="/bigdata/attendance" className="bigdata-pill count-pill" style={{ padding: '0.45rem 0.9rem' }}>
              ← View Leaderboard
            </Link>
          }
        />
        <div className="bigdata-card">
          <p style={{ color: '#a0a0a0', margin: 0 }}>Member profile component loading...</p>
        </div>
      </div>
    </>
  );
};

export default MemberDetail;
