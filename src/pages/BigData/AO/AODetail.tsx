import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { config } from '../../../config';
import { AOLeaderboardResponse, AOAttendanceSummary } from '../../../types/bigdata';
import { WorkoutPost } from '../../../types/WorkoutPost';
import { useFetch } from '../../../hooks/useFetch';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import Pagination from '../../../components/Pagination';
import SEO from '../../../components/SEO';
import { formatFullDisplayDate } from '../../../utils/dateUtils';
import AoTrendChart from './AoTrendChart';
import '../BigData.css';
import './AO.css';

export const AODetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. Fetch AO Leaderboard (Top Qs, Top PAX, Streakers)
  const leaderboardUrl = id ? `${config.apiBaseUrl}/v2/reports/ao/${id}/leaderboard` : null;
  const { data: leaderboard, loading: loadingLeaderboard, error: errorLeaderboard } = useFetch<AOLeaderboardResponse>(leaderboardUrl);

  // 2. Fetch AO Workouts History specifically for this AO (/v2/workouts/ao/:id)
  const [workouts, setWorkouts] = useState<WorkoutPost[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState<boolean>(true);
  const [errorWorkouts, setErrorWorkouts] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoadingWorkouts(true);
    setErrorWorkouts(null);

    const fetchAoWorkouts = async () => {
      try {
        // Fetch Page 1 (up to 100 workouts for this AO)
        const res1 = await fetch(`${config.apiBaseUrl}/v2/workouts/ao/${id}?page=1&results=100`);
        if (!res1.ok) {
          if (res1.status === 404) {
            if (isMounted) {
              setWorkouts([]);
              setLoadingWorkouts(false);
            }
            return;
          }
          throw new Error(`HTTP error! status: ${res1.status}`);
        }
        const data1: WorkoutPost[] = await res1.json();
        let allData = [...data1];

        // If page 1 returned 100 results, fetch page 2 to cover full 24 months
        if (data1.length === 100) {
          try {
            const res2 = await fetch(`${config.apiBaseUrl}/v2/workouts/ao/${id}?page=2&results=100`);
            if (res2.ok) {
              const data2: WorkoutPost[] = await res2.json();
              allData = allData.concat(data2);
            }
          } catch {
            // Page 2 is optional, proceed with page 1
          }
        }

        if (isMounted) {
          setWorkouts(allData);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Error fetching workouts';
          setErrorWorkouts(msg);
        }
      } finally {
        if (isMounted) {
          setLoadingWorkouts(false);
        }
      }
    };

    fetchAoWorkouts();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 3. Fetch All-Time AO Summary
  const aoSummaryUrl = `${config.apiBaseUrl}/v2/reports/ao`;
  const { data: allAos } = useFetch<AOAttendanceSummary[]>(aoSummaryUrl);

  // Find summary stats for this specific AO
  const aoSummary = useMemo(() => {
    if (!allAos || !id) return null;
    const numId = parseInt(id, 10);
    return allAos.find((a) => a.aoId === numId) || null;
  }, [allAos, id]);

  // Workout table state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<number>(10);
  const [filterText, setFilterText] = useState<string>('');

  // Dates
  const { firstWorkoutDate, lastWorkoutDate } = useMemo(() => {
    if (!workouts || workouts.length === 0) {
      return { firstWorkoutDate: 'N/A', lastWorkoutDate: 'N/A' };
    }
    const dates = workouts.map((w) => w.workoutDate).filter(Boolean).sort();
    return {
      firstWorkoutDate: dates[0] || 'N/A',
      lastWorkoutDate: dates[dates.length - 1] || 'N/A',
    };
  }, [workouts]);

  const aoName = leaderboard?.description || aoSummary?.description || `AO #${id}`;

  // Filter workouts by text in title, Q, or date
  const filteredWorkouts = useMemo(() => {
    if (!workouts) return [];
    const term = filterText.trim().toLowerCase();
    if (!term) return workouts;

    return workouts.filter((w) => {
      const matchTitle = w.title.toLowerCase().includes(term);
      const matchQ = w.q?.some((qic) => qic.f3Name.toLowerCase().includes(term));
      const matchDate = w.workoutDate.includes(term);
      return matchTitle || matchQ || matchDate;
    });
  }, [workouts, filterText]);

  // Paginate workouts
  const paginatedWorkouts = useMemo(() => {
    const start = (currentPage - 1) * resultsPerPage;
    return filteredWorkouts.slice(start, start + resultsPerPage);
  }, [filteredWorkouts, currentPage, resultsPerPage]);

  const hasMoreResults = currentPage * resultsPerPage < filteredWorkouts.length;

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleResultsPerPageChange = useCallback((newResultsPerPage: number) => {
    setResultsPerPage(newResultsPerPage);
    setCurrentPage(1);
  }, []);

  const loading = loadingLeaderboard || loadingWorkouts;
  const error = errorLeaderboard || errorWorkouts;

  if (loading) {
    return (
      <div className="bigdata-page-container">
        <LoadingSpinner message="Loading AO analytics & leaderboard..." />
      </div>
    );
  }

  if (error && !leaderboard && (!workouts || workouts.length === 0)) {
    return (
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="AO Not Found"
          description={error || `Area of Operations #${id} could not be found.`}
          category="AREAS OF OPERATION"
        />
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <button
            type="button"
            className="bigdata-pill count-pill"
            style={{ padding: '0.6rem 1.25rem', fontSize: '1rem', cursor: 'pointer' }}
            onClick={() => navigate('/bigdata/ao')}
          >
            ← Back to AO Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${aoName} - F3 RVA AO Analytics & Leaderboard`}
        description={`Attendance trend curves, top Q leaders, regular attendees, and recent workouts for ${aoName} in Richmond.`}
        url={`https://f3rva.org/bigdata/ao/${id}`}
        type="website"
      />

      <div className="bigdata-page-container">
        <BigDataPageHeader
          title={`📍 ${aoName}`}
          category="AREAS OF OPERATION"
          actions={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to="/schedule"
                className="bigdata-pill q-pill"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
              >
                View Schedule ↗
              </Link>
              <Link
                to="/bigdata/ao"
                className="bigdata-pill count-pill"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
              >
                ← All AOs
              </Link>
            </div>
          }
        />

        {/* 4-Tile Summary KPI Cards */}
        <div className="bigdata-kpi-grid">
          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Total Workouts</span>
            <span className="bigdata-kpi-value" style={{ color: '#1d4ed8' }}>
              {aoSummary?.totalWorkouts ?? workouts?.length ?? 0}
            </span>
            <span className="bigdata-kpi-subtext">Workouts logged in gloom</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Average Attendance</span>
            <span className="bigdata-kpi-value" style={{ color: '#047857' }}>
              {aoSummary?.averagePax ? aoSummary.averagePax.toFixed(1) : '0.0'}{' '}
              <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>PAX</span>
            </span>
            <span className="bigdata-kpi-subtext">Average turnout per workout</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Most Recent Workout</span>
            <span className="bigdata-kpi-value" style={{ fontSize: '1.25rem', color: '#2c3e50' }}>
              {formatFullDisplayDate(lastWorkoutDate)}
            </span>
            {firstWorkoutDate !== 'N/A' && (
              <span className="bigdata-kpi-subtext">First post: {formatFullDisplayDate(firstWorkoutDate)}</span>
            )}
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Total PAX Volume</span>
            <span className="bigdata-kpi-value" style={{ color: '#b45309' }}>
              {(aoSummary?.totalPax ?? 0).toLocaleString()}
            </span>
            <span className="bigdata-kpi-subtext">Cumulative participants</span>
          </div>
        </div>

        {/* 4-Week Rolling Moving Average Attendance Trend Chart */}
        <AoTrendChart workouts={workouts || []} />

        {/* 3-Column Community Leaderboard Grid */}
        <div className="ao-leaderboard-grid">
          {/* 1. Top Qs */}
          <div className="ao-leaderboard-card">
            <div className="ao-leaderboard-header">
              <h3 className="ao-leaderboard-title">👑 Top Q Leaders</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>All-Time</span>
            </div>

            {leaderboard?.topQs && leaderboard.topQs.length > 0 ? (
              <ul className="ao-leaderboard-list">
                {leaderboard.topQs.slice(0, 8).map((q, idx) => (
                  <li key={`top-q-${q.id}`} className="ao-leaderboard-item">
                    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <span className={`ao-rank-badge ${idx === 0 ? 'ao-rank-1' : idx === 1 ? 'ao-rank-2' : idx === 2 ? 'ao-rank-3' : ''}`}>
                        {idx + 1}
                      </span>
                      <Link to={`/bigdata/pax/${q.id}`} className="ao-leaderboard-name" title={q.name}>
                        {q.name}
                      </Link>
                    </div>
                    <span className="ao-leaderboard-count q-count">{q.count} Qs</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bigdata-empty-state" style={{ padding: '1.5rem 0' }}>
                <p>No Q leader records yet.</p>
              </div>
            )}
          </div>

          {/* 2. Top PAX Regulars */}
          <div className="ao-leaderboard-card">
            <div className="ao-leaderboard-header">
              <h3 className="ao-leaderboard-title">🏃 Top Regulars (PAX)</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>All-Time</span>
            </div>

            {leaderboard?.topPax && leaderboard.topPax.length > 0 ? (
              <ul className="ao-leaderboard-list">
                {leaderboard.topPax.slice(0, 8).map((pax, idx) => (
                  <li key={`top-pax-${pax.id}`} className="ao-leaderboard-item">
                    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <span className={`ao-rank-badge ${idx === 0 ? 'ao-rank-1' : idx === 1 ? 'ao-rank-2' : idx === 2 ? 'ao-rank-3' : ''}`}>
                        {idx + 1}
                      </span>
                      <Link to={`/bigdata/pax/${pax.id}`} className="ao-leaderboard-name" title={pax.name}>
                        {pax.name}
                      </Link>
                    </div>
                    <span className="ao-leaderboard-count">{pax.count} Posts</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bigdata-empty-state" style={{ padding: '1.5rem 0' }}>
                <p>No attendee records yet.</p>
              </div>
            )}
          </div>

          {/* 3. Active Streakers */}
          <div className="ao-leaderboard-card">
            <div className="ao-leaderboard-header">
              <h3 className="ao-leaderboard-title">🔥 Active Streakers</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Consecutive</span>
            </div>

            {leaderboard?.streakers && leaderboard.streakers.length > 0 ? (
              <ul className="ao-leaderboard-list">
                {leaderboard.streakers.slice(0, 8).map((streaker, idx) => (
                  <li key={`streaker-${streaker.id}`} className="ao-leaderboard-item">
                    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <span className={`ao-rank-badge ${idx === 0 ? 'ao-rank-1' : idx === 1 ? 'ao-rank-2' : idx === 2 ? 'ao-rank-3' : ''}`}>
                        {idx + 1}
                      </span>
                      <Link to={`/bigdata/pax/${streaker.id}`} className="ao-leaderboard-name" title={streaker.name}>
                        {streaker.name}
                      </Link>
                    </div>
                    <span className="ao-leaderboard-count streak-count">🔥 {streaker.count} wks</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bigdata-empty-state" style={{ padding: '1.5rem 0' }}>
                <p>No active streaks currently.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent AO Workouts Explorer */}
        <div className="bigdata-card">
          <div className="bigdata-card-header">
            <div>
              <h2 className="bigdata-card-title">📅 Workouts at {aoName}</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Browse past workouts, attendees, and backblasts logged at this location
              </span>
            </div>

            <div className="bigdata-search-container">
              <input
                type="text"
                className="bigdata-search-input"
                placeholder="Filter workouts..."
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter AO workouts"
              />
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="bigdata-table-wrapper desktop-only-view">
            <table className="bigdata-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Date</th>
                  <th>Workout Title</th>
                  <th>QIC (Leader)</th>
                  <th style={{ width: '100px', textAlign: 'center' }}># PAX</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWorkouts.map((workout) => (
                  <tr key={`desktop-ao-w-${workout.workoutId}`}>
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
                      {workout.q && workout.q.length > 0 ? (
                        workout.q.map((qic) => (
                          <Link
                            key={`q-${workout.workoutId}-${qic.memberId}`}
                            to={`/bigdata/pax/${qic.memberId}`}
                            className="bigdata-pill q-pill"
                          >
                            👑 {qic.f3Name}
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

                {paginatedWorkouts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="bigdata-empty-state">
                      <h3>No workouts match your filter</h3>
                      <p>Try clearing your search query.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-List View */}
          <div className="mobile-only-view">
            {paginatedWorkouts.map((workout) => (
              <div key={`mobile-ao-w-${workout.workoutId}`} className="bigdata-workout-mobile-card">
                <div className="bigdata-workout-mobile-header">
                  <span className="bigdata-workout-mobile-date">📅 {workout.workoutDate}</span>
                  <Link
                    to={`/bigdata/workout/${workout.workoutId}`}
                    className="bigdata-pill count-pill"
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
                  {workout.q?.map((qic) => (
                    <Link
                      key={`m-q-${workout.workoutId}-${qic.memberId}`}
                      to={`/bigdata/pax/${qic.memberId}`}
                      className="bigdata-pill q-pill"
                    >
                      👑 {qic.f3Name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {paginatedWorkouts.length === 0 && (
              <div className="bigdata-empty-state">
                <h3>No workouts match your filter</h3>
                <p>Try clearing your search query.</p>
              </div>
            )}
          </div>

          {filteredWorkouts.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <Pagination
                currentPage={currentPage}
                resultsPerPage={resultsPerPage}
                hasMoreResults={hasMoreResults}
                loading={false}
                onPageChange={handlePageChange}
                onResultsPerPageChange={handleResultsPerPageChange}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AODetail;
