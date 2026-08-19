import React from 'react';
import { useParams } from 'react-router-dom';

const AODetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>AO Detail #{id}</h1>
      <p style={{ color: '#888' }}>Attendance trends, top attendees, top Qs, and active streakers.</p>
    </div>
  );
};

export default AODetail;
