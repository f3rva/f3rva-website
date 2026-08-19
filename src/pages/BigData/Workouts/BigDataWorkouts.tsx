import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../../config';
import { WorkoutPost } from '../../../types/WorkoutPost';
import { useFetch } from '../../../hooks/useFetch';
import Pagination from '../../../components/Pagination';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

export const BigDataWorkouts: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<number>(20);
  const [filterText, setFilterText] = useState<string>('');

  const apiUrl = `${config.apiBaseUrl}/v2/workouts?page=${currentPage}&results=${resultsPerPage}`;
  const { data: workoutsData, loading, error } = useFetch<WorkoutPost[]>(apiUrl);

  const workouts = useMemo(() => workoutsData || [], [workoutsData]);
  const hasMoreResults = workouts.length === resultsPerPage;

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleResultsPerPageChange = useCallback((newResultsPerPage: number) => {
    setResultsPerPage(newResultsPerPage);
    setCurrentPage(1);
  }, []);

  // Filter workouts by text in title, AO name, or Q name on the current loaded page
  const filteredWorkouts = useMemo(() => {
    const term = filterText.trim().toLowerCase();
    if (!term) return workouts;

    return workouts.filter((w) => {
      const matchTitle = w.title.toLowerCase().includes(term);
      const matchAo = w.ao?.some((a) => a.description.toLowerCase().includes(term));
      const matchQ = w.q?.some((q) => q.f3Name.toLowerCase().includes(term));
      const matchDate = w.workoutDate.includes(term);
      return matchTitle || matchAo || matchQ || matchDate;
    });
  }, [workouts, filterText]);

  return (
    <div className="bigdata-card">
      <div className="bigdata-card-header">
        <div>
          <h2 className="bigdata-card-title">Recent Workouts Explorer</h2>
        </div>

        <div className="bigdata-search-container">
          <input
            type="text"
            className="bigdata-search-input"
            placeholder="Filter current page (title, AO, Q)..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            aria-label="Filter current page workouts"
          />
        </div>
      </div>

      {loading && (
        <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <LoadingSpinner message="Loading recent workouts..." />
        </div>
      )}

      {error && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
          <h3>Failed to load workouts</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Desktop Table View */}
          <div className="bigdata-table-wrapper desktop-only-view">
            <table className="bigdata-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Date</th>
                  <th>Workout Title</th>
                  <th>AO Location</th>
                  <th>QIC (Leader)</th>
                  <th style={{ width: '90px', textAlign: 'center' }}># PAX</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkouts.map((workout) => (
                  <tr key={`desktop-${workout.workoutId}`}>
                    <td style={{ whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                      {workout.workoutDate}
                    </td>
                    <td>
                      <Link
                        to={`/bigdata/workout/${workout.workoutId}`}
                        style={{ color: '#1e293b', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {workout.title}
                      </Link>
                    </td>
                    <td>
                      {workout.ao && workout.ao.length > 0 ? (
                        workout.ao.map((ao) => (
                          <Link
                            key={`ao-${workout.workoutId}-${ao.id}`}
                            to={`/bigdata/ao/${ao.id}`}
                            className="bigdata-pill ao-pill"
                          >
                            {ao.description}
                          </Link>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td>
                      {workout.q && workout.q.length > 0 ? (
                        workout.q.map((qic) => (
                          <Link
                            key={`q-${workout.workoutId}-${qic.memberId}`}
                            to={`/bigdata/pax/${qic.memberId}`}
                            className="bigdata-pill q-pill"
                          >
                            {qic.f3Name}
                          </Link>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link
                        to={`/bigdata/workout/${workout.workoutId}`}
                        className="bigdata-pill count-pill"
                        title="View workout attendee roster"
                      >
                        {workout.paxCount ?? 0}
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredWorkouts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="bigdata-empty-state">
                      <h3>No workouts match your filter</h3>
                      <p>Try clearing your filter or navigating to another page.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-List View (Zero Horizontal Scroll on Small Screens) */}
          <div className="mobile-only-view">
            {filteredWorkouts.map((workout) => (
              <div key={`mobile-${workout.workoutId}`} className="bigdata-workout-mobile-card">
                <div className="bigdata-workout-mobile-header">
                  <span className="bigdata-workout-mobile-date">📅 {workout.workoutDate}</span>
                  <Link
                    to={`/bigdata/workout/${workout.workoutId}`}
                    className="bigdata-pill count-pill"
                    title="View workout attendees"
                  >
                    👥 {workout.paxCount ?? 0} PAX
                  </Link>
                </div>

                <Link
                  to={`/bigdata/workout/${workout.workoutId}`}
                  className="bigdata-workout-mobile-title"
                >
                  {workout.title}
                </Link>

                <div className="bigdata-workout-mobile-meta">
                  {workout.ao && workout.ao.length > 0 ? (
                    workout.ao.map((ao) => (
                      <Link
                        key={`m-ao-${workout.workoutId}-${ao.id}`}
                        to={`/bigdata/ao/${ao.id}`}
                        className="bigdata-pill ao-pill"
                      >
                        📍 {ao.description}
                      </Link>
                    ))
                  ) : null}

                  {workout.q && workout.q.length > 0 ? (
                    workout.q.map((qic) => (
                      <Link
                        key={`m-q-${workout.workoutId}-${qic.memberId}`}
                        to={`/bigdata/pax/${qic.memberId}`}
                        className="bigdata-pill q-pill"
                      >
                        👑 {qic.f3Name}
                      </Link>
                    ))
                  ) : null}
                </div>
              </div>
            ))}

            {filteredWorkouts.length === 0 && (
              <div className="bigdata-empty-state">
                <h3>No workouts match your filter</h3>
                <p>Try clearing your filter or navigating to another page.</p>
              </div>
            )}
          </div>


          <div style={{ marginTop: '1.25rem' }}>
            <Pagination
              currentPage={currentPage}
              resultsPerPage={resultsPerPage}
              hasMoreResults={hasMoreResults}
              loading={loading}
              onPageChange={handlePageChange}
              onResultsPerPageChange={handleResultsPerPageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BigDataWorkouts;
