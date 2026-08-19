import React from 'react';
import { useParams } from 'react-router-dom';

const WorkoutDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>Workout Detail #{id}</h1>
      <p style={{ color: '#888' }}>Workout roster and backblast information.</p>
    </div>
  );
};

export default WorkoutDetail;
