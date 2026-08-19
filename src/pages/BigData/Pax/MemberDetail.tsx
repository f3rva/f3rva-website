import React from 'react';
import { useParams } from 'react-router-dom';

const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>Member Profile #{id}</h1>
      <p style={{ color: '#888' }}>Activity heatmap, AO distribution, and workout history.</p>
    </div>
  );
};

export default MemberDetail;
