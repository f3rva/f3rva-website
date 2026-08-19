import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { config } from '../../../config';
import { MemberDetail as MemberDetailType } from '../../../types/bigdata';
import { useFetch } from '../../../hooks/useFetch';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import Pagination from '../../../components/Pagination';
import SEO from '../../../components/SEO';
import { formatFullDisplayDate } from '../../../utils/dateUtils';
import ActivityHeatmap from './ActivityHeatmap';
import MonthlyMomentumChart from './MonthlyMomentumChart';
import AoDistributionChart from './AoDistributionChart';
import '../BigData.css';
import './PaxProfile.css';

export const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const apiUrl = id ? `${config.apiBaseUrl}/v2/members/${id}` : null;
  const { data: member, loading, error } = useFetch<MemberDetailType>(apiUrl);

  // Tabs for history explorer
  const [activeTab, setActiveTab] = useState<'attended' | 'qd'>('attended');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<number>(10);
  const [filterText, setFilterText] = useState<string>('');

  const activeWorkouts = useMemo(() => {
    if (!member) return [];
    return activeTab === 'attended' ? member.attendedWorkouts || [] : member.qdWorkouts || [];
  }, [member, activeTab]);

  // First & last workout dates
  const { firstPostDate, lastPostDate } = useMemo(() => {
    if (!member?.attendedWorkouts || member.attendedWorkouts.length === 0) {
      return { firstPostDate: 'N/A', lastPostDate: 'N/A' };
    }
    const dates = member.attendedWorkouts.map((w) => w.workoutDate).filter(Boolean).sort();
    return {
      firstPostDate: dates[0] || 'N/A',
      lastPostDate: dates[dates.length - 1] || 'N/A',
    };
  }, [member]);

  // Filter workouts by text in title, AO name, or date
  const filteredWorkouts = useMemo(() => {
    const term = filterText.trim().toLowerCase();
    if (!term) return activeWorkouts;

    return activeWorkouts.filter((w) => {
      const matchTitle = w.title.toLowerCase().includes(term);
      const matchAo = w.ao?.some((a) => a.description.toLowerCase().includes(term));
      const matchDate = w.workoutDate.includes(term);
      return matchTitle || matchAo || matchDate;
    });
  }, [activeWorkouts, filterText]);

  // Paginate filtered workouts
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

  const handleTabSwitch = (tab: 'attended' | 'qd') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setFilterText('');
  };

  if (loading) {
    return (
      <div className="bigdata-page-container">
        <LoadingSpinner message="Loading member analytics..." />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Member Not Found"
          description={error || `Member #${id} could not be located.`}
          category="MEMBERS"
        />
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <button
            type="button"
            className="bigdata-pill count-pill"
            style={{ padding: '0.6rem 1.25rem', fontSize: '1rem', cursor: 'pointer' }}
            onClick={() => navigate('/bigdata/attendance')}
          >
            ← Back to Attendance Leaderboard
          </button>
        </div>
      </div>
    );
  }

  const qRatioPct = member.stats?.qRatio != null ? `${(member.stats.qRatio * 100).toFixed(1)}%` : '0.0%';

  return (
    <>
      <SEO
        title={`${member.f3Name} - F3 RVA Member Analytics & Journey`}
        description={`Member statistics, 52-week activity heatmap, AO distribution, and complete workout attendance history for ${member.f3Name}.`}
        url={`https://f3rva.org/bigdata/pax/${member.memberId}`}
        type="profile"
      />

      <div className="bigdata-page-container">
        <BigDataPageHeader
          title={member.f3Name}
          category="MEMBERS"
          actions={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to="/bigdata/claim-alias"
                className="bigdata-pill q-pill"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
              >
                Claim an Alias ↗
              </Link>
              <Link
                to="/bigdata/attendance"
                className="bigdata-pill count-pill"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
              >
                ← Leaderboard
              </Link>
            </div>
          }
        />

        {/* Career KPI Summary Cards */}
        <div className="bigdata-kpi-grid">
          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Workouts Attended</span>
            <span className="bigdata-kpi-value" style={{ color: '#047857' }}>
              {member.stats?.numWorkouts ?? 0}
            </span>
            <span className="bigdata-kpi-subtext">Career posts logged</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Workouts Led (Qs)</span>
            <span className="bigdata-kpi-value" style={{ color: '#b45309' }}>
              {member.stats?.numQs ?? 0}
            </span>
            <span className="bigdata-kpi-subtext">Times in the gloom leadership chair</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Q Ratio</span>
            <span className="bigdata-kpi-value" style={{ color: '#1d4ed8' }}>
              {qRatioPct}
            </span>
            <span className="bigdata-kpi-subtext">Qs led / total workouts ratio</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Most Recent Post</span>
            <span className="bigdata-kpi-value" style={{ fontSize: '1.25rem', color: '#2c3e50' }}>
              {formatFullDisplayDate(lastPostDate)}
            </span>
            {firstPostDate !== 'N/A' && (
              <span className="bigdata-kpi-subtext">First post (FNG): {formatFullDisplayDate(firstPostDate)}</span>
            )}
          </div>
        </div>

        {/* 52-Week GitHub-Style Activity Heatmap */}
        <ActivityHeatmap
          attendedWorkouts={member.attendedWorkouts || []}
          qdWorkouts={member.qdWorkouts || []}
        />

        {/* 2-Column Analytics Charts Grid */}
        <div className="pax-charts-grid">
          <MonthlyMomentumChart
            attendedWorkouts={member.attendedWorkouts || []}
            qdWorkouts={member.qdWorkouts || []}
          />
          <AoDistributionChart
            attendedWorkouts={member.attendedWorkouts || []}
          />
        </div>

        {/* Tabbed Workout History Explorer */}
        <div className="bigdata-card">
          <div className="bigdata-card-header">
            <div className="pax-tabs-container" style={{ borderBottom: 'none', margin: 0 }}>
              <button
                type="button"
                className={`pax-tab-btn ${activeTab === 'attended' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('attended')}
              >
                🏃 Attended Workouts
                <span className="pax-tab-badge">{member.attendedWorkouts?.length || 0}</span>
              </button>
              <button
                type="button"
                className={`pax-tab-btn ${activeTab === 'qd' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('qd')}
              >
                👑 Workouts Q&apos;d
                <span className="pax-tab-badge">{member.qdWorkouts?.length || 0}</span>
              </button>
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
                aria-label="Filter member workouts"
              />
            </div>
          </div>

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
                {paginatedWorkouts.map((workout) => (
                  <tr key={`desktop-pax-w-${workout.workoutId}`}>
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
                            📍 {ao.description}
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
                    <td colSpan={5} className="bigdata-empty-state">
                      <h3>No workouts match your filter</h3>
                      <p>Try clearing your filter or switching tabs.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-List View */}
          <div className="mobile-only-view">
            {paginatedWorkouts.map((workout) => (
              <div key={`mobile-pax-w-${workout.workoutId}`} className="bigdata-workout-mobile-card">
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
                  {workout.ao?.map((ao) => (
                    <Link key={`m-ao-${workout.workoutId}-${ao.id}`} to={`/bigdata/ao/${ao.id}`} className="bigdata-pill ao-pill">
                      📍 {ao.description}
                    </Link>
                  ))}
                  {workout.q?.map((qic) => (
                    <Link key={`m-q-${workout.workoutId}-${qic.memberId}`} to={`/bigdata/pax/${qic.memberId}`} className="bigdata-pill q-pill">
                      👑 {qic.f3Name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {paginatedWorkouts.length === 0 && (
              <div className="bigdata-empty-state">
                <h3>No workouts match your filter</h3>
                <p>Try clearing your filter or switching tabs.</p>
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

        {/* Known Aliases Section (Bottom of Page) */}
        {member.aliases && member.aliases.length > 0 && (
          <div className="bigdata-card" style={{ marginTop: '1.5rem' }}>
            <div className="bigdata-card-header" style={{ marginBottom: '0.75rem' }}>
              <div>
                <h3 className="bigdata-card-title" style={{ fontSize: '1.1rem' }}>🏷️ Known Member Aliases</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Merged nicknames and alternate spellings associated with this profile
                </span>
              </div>
              <Link
                to="/bigdata/claim-alias"
                className="bigdata-pill q-pill"
                style={{ fontSize: '0.85rem' }}
              >
                Claim an alias ↗
              </Link>
            </div>
            <div className="pax-header-aliases" style={{ marginTop: 0 }}>
              {member.aliases.map((alias, idx) => (
                <span key={`alias-${idx}`} className="pax-alias-tag">
                  🏷️ {alias}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MemberDetail;

