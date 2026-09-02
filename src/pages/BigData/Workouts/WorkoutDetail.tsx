import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { config } from '../../../config';
import { WorkoutPost } from '../../../types/WorkoutPost';
import { useFetch } from '../../../hooks/useFetch';
import { useAuth } from '../../../hooks/useAuth';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import { formatFullDisplayDate } from '../../../utils/dateUtils';
import '../BigData.css';

export const WorkoutDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();

  const isValidId = Boolean(id && /^\d+$/.test(id));
  const apiUrl = isValidId ? `${config.apiBaseUrl}/v2/workouts/${id}` : null;
  const { data: workout, loading, error } = useFetch<WorkoutPost>(apiUrl);

  if (loading) {
    return (
      <div className="bigdata-page-container">
        <LoadingSpinner message="Loading workout details..." />
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Workout Not Found"
          description={error || `Workout #${id} could not be located.`}
          category="WORKOUTS"
        />
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <button
            type="button"
            className="bigdata-pill count-pill"
            style={{ padding: '0.6rem 1.25rem', fontSize: '1rem', cursor: 'pointer' }}
            onClick={() => navigate('/bigdata')}
          >
            ← Back to Big Data Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${workout.title} - F3 RVA Workout Record`}
        description={`Attendee roster and metadata for ${workout.title} on ${workout.workoutDate}. Led by ${workout.q.map((q) => q.f3Name).join(', ')} with ${workout.paxCount} attendees.`}
        url={`https://f3rva.org/bigdata/workout/${workout.workoutId}`}
        type="article"
      />

      <div className="bigdata-page-container">
        <BigDataPageHeader
          title={workout.title}
          category="WORKOUTS"
          actions={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {isAuthenticated && (isAdmin || user?.f3Name === workout.author || workout.q.some(q => q.f3Name === user?.f3Name)) && (
                <Link
                  to={`/backblast/edit/${workout.workoutId}`}
                  className="bigdata-pill action-pill"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem', backgroundColor: '#a81c1c', color: '#ffffff' }}
                >
                  Edit Workout ✎
                </Link>
              )}
              {workout.backblastUrl && (
                <a
                  href={workout.backblastUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bigdata-pill q-pill"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
                >
                  Read Backblast in Archives ↗
                </a>
              )}
              <Link
                to="/bigdata"
                className="bigdata-pill count-pill"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
              >
                ← Back to Dashboard
              </Link>
            </div>
          }
        />

        {/* Metadata KPI Summary Cards */}
        <div className="bigdata-kpi-grid">
          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Workout Date</span>
            <span className="bigdata-kpi-value" style={{ fontSize: '1.25rem' }}>
              {formatFullDisplayDate(workout.workoutDate)}
            </span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Location (AO)</span>
            <div style={{ marginTop: '0.25rem' }}>
              {workout.ao && workout.ao.length > 0 ? (
                workout.ao.map((ao) => (
                  <Link
                    key={`ao-detail-${ao.id}`}
                    to={`/bigdata/ao/${ao.id}`}
                    className="bigdata-pill ao-pill"
                    style={{ fontSize: '0.95rem' }}
                  >
                    📍 {ao.description}
                  </Link>
                ))
              ) : (
                <span style={{ color: '#777' }}>Unspecified AO</span>
              )}
            </div>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Q in Charge (QIC)</span>
            <div style={{ marginTop: '0.25rem' }}>
              {workout.q && workout.q.length > 0 ? (
                workout.q.map((qic) => (
                  <Link
                    key={`qic-detail-${qic.memberId}`}
                    to={`/bigdata/pax/${qic.memberId}`}
                    className="bigdata-pill q-pill"
                    style={{ fontSize: '0.95rem' }}
                  >
                    👑 {qic.f3Name}
                  </Link>
                ))
              ) : (
                <span style={{ color: '#777' }}>No Q recorded</span>
              )}
            </div>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">PAX Attendance</span>
            <span className="bigdata-kpi-value" style={{ color: '#34d399' }}>
              {workout.paxCount ?? 0}
            </span>
          </div>
        </div>

        {/* Full PAX Attendee Roster Card */}
        <div className="bigdata-card">
          <div className="bigdata-card-header">
            <h2 className="bigdata-card-title">👥 PAX Attendee Roster ({workout.pax?.length || workout.paxCount || 0})</h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Click any member to view their individual profile, streak & posting history
            </span>
          </div>

          {workout.pax && workout.pax.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {workout.pax.map((pax) => {
                const isQ = workout.q?.some((q) => q.memberId === pax.memberId);
                return (
                  <Link
                    key={`pax-${pax.memberId}`}
                    to={`/bigdata/pax/${pax.memberId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      background: isQ ? '#fefce8' : '#ffffff',
                      border: isQ ? '1px solid #fef08a' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      textDecoration: 'none',
                      color: '#1e293b',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isQ ? '#f59e0b' : '#e2e8f0',
                        color: isQ ? '#ffffff' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {pax.f3Name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>{pax.f3Name}</span>
                      {isQ && <span style={{ fontSize: '0.75rem', color: '#b45309', display: 'block', fontWeight: 600 }}>QIC</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bigdata-empty-state">
              <p>Detailed PAX names are not indexed for this entry.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkoutDetail;
