import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../../config';
import { AttendanceLeaderboardItem } from '../../../types/bigdata';
import { useFetch } from '../../../hooks/useFetch';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import Pagination from '../../../components/Pagination';
import SEO from '../../../components/SEO';
import '../BigData.css';
import '../AO/AO.css';
import './Attendance.css';

type TimeframePreset = 'ytd' | '12m' | '30d' | 'all';
type SortMetric = 'workout' | 'q' | 'ratio';

export const AttendanceLeaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframePreset>('ytd');
  const [sortMetric, setSortMetric] = useState<SortMetric>('workout');
  const [minQsThreshold, setMinQsThreshold] = useState<number>(3);
  const [filterText, setFilterText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<number>(20);

  // Compute startDate & endDate query parameters for the selected timeframe
  const queryParams = useMemo(() => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (timeframe === 'ytd') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return `?startDate=${formatDate(startOfYear)}&endDate=${formatDate(today)}`;
    }
    if (timeframe === '12m') {
      const start12m = new Date();
      start12m.setFullYear(today.getFullYear() - 1);
      return `?startDate=${formatDate(start12m)}&endDate=${formatDate(today)}`;
    }
    if (timeframe === '30d') {
      const start30d = new Date();
      start30d.setDate(today.getDate() - 30);
      return `?startDate=${formatDate(start30d)}&endDate=${formatDate(today)}`;
    }

    // All-time: explicit from region inception (2014-01-01) to today
    return `?startDate=2014-01-01&endDate=${formatDate(today)}`;
  }, [timeframe]);

  const apiUrl = `${config.apiBaseUrl}/v2/reports/attendance${queryParams}`;
  const { data: rawLeaderboard, loading, error } = useFetch<AttendanceLeaderboardItem[]>(apiUrl);

  // Timeframe Baseline KPIs (Constant across all metric tabs for this time period)
  const timeframeKpis = useMemo(() => {
    if (loading || !rawLeaderboard) {
      return {
        topPaxName: '--',
        topPaxPosts: '--',
        topQName: '--',
        topQCount: '--',
        totalActiveMembers: '--',
        totalPosts: '--',
      };
    }

    const sanitized = rawLeaderboard.filter(
      (m) => m.memberId !== 123 && m.f3Name.toLowerCase() !== 'all pax'
    );

    if (sanitized.length === 0) {
      return {
        topPaxName: 'N/A',
        topPaxPosts: '0',
        topQName: 'N/A',
        topQCount: '0',
        totalActiveMembers: '0',
        totalPosts: '0',
      };
    }

    let totalPosts = 0;
    let topPax = sanitized[0];
    let topQ = sanitized[0];

    sanitized.forEach((m) => {
      totalPosts += m.numWorkouts || 0;
      if ((m.numWorkouts || 0) > (topPax?.numWorkouts || 0)) {
        topPax = m;
      }
      if ((m.numQs || 0) > (topQ?.numQs || 0)) {
        topQ = m;
      }
    });

    return {
      topPaxName: topPax.f3Name,
      topPaxPosts: topPax.numWorkouts.toString(),
      topQName: topQ.f3Name,
      topQCount: topQ.numQs.toString(),
      totalActiveMembers: sanitized.length.toString(),
      totalPosts: totalPosts.toLocaleString(),
    };
  }, [rawLeaderboard, loading]);

  // Processed and sorted leaderboard (Filtered by metric, Q-ratio threshold, and search query)
  const processedLeaderboard = useMemo(() => {
    if (!rawLeaderboard) return [];

    const sanitized = rawLeaderboard.filter(
      (m) => m.memberId !== 123 && m.f3Name.toLowerCase() !== 'all pax'
    );

    // Apply Q-ratio threshold qualification if in ratio mode
    let filtered = sanitized;
    if (sortMetric === 'ratio' && minQsThreshold > 0) {
      filtered = filtered.filter((m) => m.numQs >= minQsThreshold);
    }

    // Filter by member name search term
    const term = filterText.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((m) => m.f3Name.toLowerCase().includes(term));
    }

    // Sort based on active ranking metric
    const sorted = [...filtered];
    if (sortMetric === 'q') {
      sorted.sort(
        (a, b) =>
          b.numQs - a.numQs ||
          b.numWorkouts - a.numWorkouts ||
          a.f3Name.localeCompare(b.f3Name)
      );
    } else if (sortMetric === 'ratio') {
      sorted.sort(
        (a, b) =>
          b.qRatio - a.qRatio ||
          b.numQs - a.numQs ||
          b.numWorkouts - a.numWorkouts ||
          a.f3Name.localeCompare(b.f3Name)
      );
    } else {
      // Default: most workouts attended
      sorted.sort(
        (a, b) =>
          b.numWorkouts - a.numWorkouts ||
          b.numQs - a.numQs ||
          a.f3Name.localeCompare(b.f3Name)
      );
    }

    return sorted;
  }, [rawLeaderboard, sortMetric, minQsThreshold, filterText]);

  // Top 3 Podium members
  const topThree = useMemo(() => {
    if (!processedLeaderboard || processedLeaderboard.length < 3) return null;
    return {
      first: processedLeaderboard[0],
      second: processedLeaderboard[1],
      third: processedLeaderboard[2],
    };
  }, [processedLeaderboard]);

  // Paginate list
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * resultsPerPage;
    return processedLeaderboard.slice(start, start + resultsPerPage);
  }, [processedLeaderboard, currentPage, resultsPerPage]);

  const hasMoreResults = currentPage * resultsPerPage < processedLeaderboard.length;

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleResultsPerPageChange = useCallback((newResultsPerPage: number) => {
    setResultsPerPage(newResultsPerPage);
    setCurrentPage(1);
  }, []);

  const handleTimeframeChange = (newTimeframe: TimeframePreset) => {
    setTimeframe(newTimeframe);
    setCurrentPage(1);
  };

  const handleMetricChange = (newMetric: SortMetric) => {
    setSortMetric(newMetric);
    setCurrentPage(1);
  };

  const getMetricDisplay = (member: AttendanceLeaderboardItem) => {
    if (sortMetric === 'workout') {
      return `${member.numWorkouts} Posts`;
    }
    if (sortMetric === 'q') {
      return `${member.numQs} Qs`;
    }
    return `${(member.qRatio * 100).toFixed(1)}% Ratio`;
  };

  return (
    <>
      <SEO
        title="Leaderboard - F3 RVA Big Data"
        description="F3 Richmond attendance leaderboard, Q rankings, and posting statistics across the region."
        url="https://f3rva.org/bigdata/attendance"
        type="website"
      />

      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Attendance & Q Leaderboard"
          description="Track posting consistency, gloom milestones, and Q leadership across Richmond."
          category="LEADERBOARDS"
          actions={
            <div className="ao-timeframe-bar" role="tablist" aria-label="Timeframe presets">
              <button
                type="button"
                className={`pax-year-btn ${timeframe === 'ytd' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('ytd')}
                role="tab"
                aria-selected={timeframe === 'ytd'}
              >
                This Year (YTD)
              </button>
              <button
                type="button"
                className={`pax-year-btn ${timeframe === '12m' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('12m')}
                role="tab"
                aria-selected={timeframe === '12m'}
              >
                Past 12 Months
              </button>
              <button
                type="button"
                className={`pax-year-btn ${timeframe === '30d' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('30d')}
                role="tab"
                aria-selected={timeframe === '30d'}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                className={`pax-year-btn ${timeframe === 'all' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('all')}
                role="tab"
                aria-selected={timeframe === 'all'}
              >
                All-Time
              </button>
            </div>
          }
        />

        {/* 3-Tile Aggregate Summary KPIs (Constant for selected timeframe) */}
        <div className="bigdata-kpi-grid">
          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Top PAX Leader</span>
            <span className="bigdata-kpi-value" style={{ color: '#b45309' }}>
              {timeframeKpis.topPaxName}
            </span>
            <span className="bigdata-kpi-subtext">{timeframeKpis.topPaxPosts} posts in period</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Top Q Leader</span>
            <span className="bigdata-kpi-value" style={{ color: '#047857' }}>
              {timeframeKpis.topQName}
            </span>
            <span className="bigdata-kpi-subtext">{timeframeKpis.topQCount} workouts led</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Active Members</span>
            <span className="bigdata-kpi-value" style={{ color: '#1d4ed8' }}>
              {timeframeKpis.totalActiveMembers}{' '}
              <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>PAX</span>
            </span>
            <span className="bigdata-kpi-subtext">Posted in selected timeframe</span>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`pax-tab-btn ${sortMetric === 'workout' ? 'active' : ''}`}
              onClick={() => handleMetricChange('workout')}
              style={{ borderRadius: '8px', padding: '0.6rem 1.25rem' }}
            >
              🏃 Most Workouts Attended
            </button>
            <button
              type="button"
              className={`pax-tab-btn ${sortMetric === 'q' ? 'active' : ''}`}
              onClick={() => handleMetricChange('q')}
              style={{ borderRadius: '8px', padding: '0.6rem 1.25rem' }}
            >
              👑 Most Workouts Led (Qs)
            </button>
            <button
              type="button"
              className={`pax-tab-btn ${sortMetric === 'ratio' ? 'active' : ''}`}
              onClick={() => handleMetricChange('ratio')}
              style={{ borderRadius: '8px', padding: '0.6rem 1.25rem' }}
            >
              ⚡ Highest Q Ratio
            </button>
          </div>

          {sortMetric === 'ratio' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fffbeb', border: '1px solid #fde68a', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e' }}>
                Qualification:
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1, 3, 5, 10].map((threshold) => (
                  <button
                    key={`min-q-${threshold}`}
                    type="button"
                    className={`pax-year-btn ${minQsThreshold === threshold ? 'active' : ''}`}
                    onClick={() => {
                      setMinQsThreshold(threshold);
                      setCurrentPage(1);
                    }}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    ≥ {threshold} Qs
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {sortMetric === 'ratio' && (
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>💡</span>
            <span>
              Filtering for members with at least <strong>{minQsThreshold} Qs</strong> to display meaningful leadership ratios and prevent single-workout anomalies.
            </span>
          </div>
        )}

        {/* Top 3 Visual Podium */}
        {!loading && !error && topThree && (
          <div className="podium-container">
            {/* 2nd Place */}
            <div className="podium-step podium-2">
              <div className="podium-avatar" style={{ background: '#f1f5f9', border: '2px solid #cbd5e1' }}>
                🥈
              </div>
              <Link to={`/bigdata/pax/${topThree.second.memberId}`} className="podium-name" title={topThree.second.f3Name}>
                {topThree.second.f3Name}
              </Link>
              <span className="podium-score">{getMetricDisplay(topThree.second)}</span>
              <span className="podium-subtext">
                {topThree.second.numWorkouts} posts • {topThree.second.numQs} Qs
              </span>
              <div className="podium-block">2</div>
            </div>

            {/* 1st Place */}
            <div className="podium-step podium-1">
              <div className="podium-avatar" style={{ background: '#fef3c7', border: '2px solid #f59e0b' }}>
                👑
                <span className="podium-medal">🥇</span>
              </div>
              <Link to={`/bigdata/pax/${topThree.first.memberId}`} className="podium-name" style={{ fontSize: '1.2rem' }} title={topThree.first.f3Name}>
                {topThree.first.f3Name}
              </Link>
              <span className="podium-score" style={{ background: '#fef3c7', color: '#b45309' }}>
                {getMetricDisplay(topThree.first)}
              </span>
              <span className="podium-subtext">
                {topThree.first.numWorkouts} posts • {topThree.first.numQs} Qs
              </span>
              <div className="podium-block">1</div>
            </div>

            {/* 3rd Place */}
            <div className="podium-step podium-3">
              <div className="podium-avatar" style={{ background: '#ffedd5', border: '2px solid #fb923c' }}>
                🥉
              </div>
              <Link to={`/bigdata/pax/${topThree.third.memberId}`} className="podium-name" title={topThree.third.f3Name}>
                {topThree.third.f3Name}
              </Link>
              <span className="podium-score">{getMetricDisplay(topThree.third)}</span>
              <span className="podium-subtext">
                {topThree.third.numWorkouts} posts • {topThree.third.numQs} Qs
              </span>
              <div className="podium-block">3</div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table Card */}
        <div className="bigdata-card">
          <div className="bigdata-card-header">
            <div>
              <h2 className="bigdata-card-title">📋 Full Rankings Table</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Showing {processedLeaderboard.length} member{processedLeaderboard.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="bigdata-search-container">
              <input
                type="text"
                className="bigdata-search-input"
                placeholder="Filter members by name..."
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter leaderboard"
              />
            </div>
          </div>

          {loading && <LoadingSpinner message="Calculating rankings..." />}

          {error && (
            <div className="bigdata-empty-state">
              <h3>Unable to load leaderboard</h3>
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
                      <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                      <th>PAX Name</th>
                      <th style={{ width: '160px', textAlign: 'right' }}>Workouts Attended</th>
                      <th style={{ width: '150px', textAlign: 'right' }}>Workouts Led (Qs)</th>
                      <th style={{ width: '140px', textAlign: 'right' }}>Leadership Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map((member, idx) => {
                      const absoluteRank = (currentPage - 1) * resultsPerPage + idx + 1;
                      return (
                        <tr key={`desktop-rank-${member.memberId}`}>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`ao-rank-badge ${
                                absoluteRank === 1
                                  ? 'ao-rank-1'
                                  : absoluteRank === 2
                                    ? 'ao-rank-2'
                                    : absoluteRank === 3
                                      ? 'ao-rank-3'
                                      : ''
                              }`}
                              style={{ margin: '0 auto' }}
                            >
                              {absoluteRank}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/bigdata/pax/${member.memberId}`}
                              style={{ color: '#1e293b', fontWeight: 600, textDecoration: 'none' }}
                            >
                              {member.f3Name}
                            </Link>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                            <span
                              className="bigdata-pill count-pill"
                              style={{
                                background: sortMetric === 'workout' ? '#ecfdf5' : '#f8fafc',
                                color: sortMetric === 'workout' ? '#047857' : '#1e293b',
                              }}
                            >
                              {member.numWorkouts}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span
                              className="bigdata-pill q-pill"
                              style={{
                                background: sortMetric === 'q' ? '#fef3c7' : '#f8fafc',
                                color: sortMetric === 'q' ? '#b45309' : '#1e293b',
                              }}
                            >
                              👑 {member.numQs}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', color: '#64748b', fontWeight: 600 }}>
                            {(member.qRatio * 100).toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}

                    {paginatedMembers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="bigdata-empty-state">
                          <h3>No members match your filter</h3>
                          <p>Try searching for a different F3 name.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card-List View */}
              <div className="mobile-only-view">
                {paginatedMembers.map((member, idx) => {
                  const absoluteRank = (currentPage - 1) * resultsPerPage + idx + 1;
                  return (
                    <div key={`mobile-rank-${member.memberId}`} className="bigdata-workout-mobile-card">
                      <div className="bigdata-workout-mobile-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            className={`ao-rank-badge ${
                              absoluteRank === 1
                                ? 'ao-rank-1'
                                : absoluteRank === 2
                                  ? 'ao-rank-2'
                                  : absoluteRank === 3
                                    ? 'ao-rank-3'
                                    : ''
                            }`}
                          >
                            {absoluteRank}
                          </span>
                          <Link
                            to={`/bigdata/pax/${member.memberId}`}
                            className="bigdata-workout-mobile-title"
                            style={{ margin: 0 }}
                          >
                            {member.f3Name}
                          </Link>
                        </div>
                        <span className="bigdata-pill count-pill">
                          {getMetricDisplay(member)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem' }}>
                        <span>Posts: <strong>{member.numWorkouts}</strong></span>
                        <span>Qs: <strong>{member.numQs}</strong></span>
                        <span>Ratio: <strong>{(member.qRatio * 100).toFixed(1)}%</strong></span>
                      </div>
                    </div>
                  );
                })}

                {paginatedMembers.length === 0 && (
                  <div className="bigdata-empty-state">
                    <h3>No members match your filter</h3>
                    <p>Try searching for a different F3 name.</p>
                  </div>
                )}
              </div>

              {processedLeaderboard.length > 0 && (
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AttendanceLeaderboard;
