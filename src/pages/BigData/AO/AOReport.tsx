import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../../config';
import { AOAttendanceSummary } from '../../../types/bigdata';
import { useFetch } from '../../../hooks/useFetch';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import '../BigData.css';
import './AO.css';

type TimeframePreset = '30d' | '12m' | 'all';
type SortField = 'description' | 'totalWorkouts' | 'totalPax' | 'averagePax';
type SortDirection = 'asc' | 'desc';

export const AOReport: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframePreset>('30d');
  const [filterText, setFilterText] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('averagePax');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Compute startDate / endDate for API call
  const queryParams = useMemo(() => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (timeframe === '30d') {
      const start = new Date();
      start.setDate(today.getDate() - 30);
      return `?startDate=${formatDate(start)}&endDate=${formatDate(today)}`;
    }
    if (timeframe === '12m') {
      const start = new Date();
      start.setFullYear(today.getFullYear() - 1);
      return `?startDate=${formatDate(start)}&endDate=${formatDate(today)}`;
    }
    return '';
  }, [timeframe]);

  const apiUrl = `${config.apiBaseUrl}/v2/reports/ao${queryParams}`;
  const { data: aoList, loading, error } = useFetch<AOAttendanceSummary[]>(apiUrl);

  // Compute aggregate KPI stats across all AOs in the selected period
  const kpis = useMemo(() => {
    if (!aoList || aoList.length === 0) {
      return {
        activeAos: 0,
        totalWorkouts: 0,
        totalPax: 0,
        regionAvg: '0.0',
        topAoName: 'N/A',
        topAoAvg: '0.0',
      };
    }

    let workoutsSum = 0;
    let paxSum = 0;
    let topAo = aoList[0];

    aoList.forEach((ao) => {
      workoutsSum += ao.totalWorkouts || 0;
      paxSum += ao.totalPax || 0;
      if (ao.averagePax > (topAo?.averagePax || 0)) {
        topAo = ao;
      }
    });

    const regionAvg = workoutsSum > 0 ? (paxSum / workoutsSum).toFixed(1) : '0.0';

    return {
      activeAos: aoList.length,
      totalWorkouts: workoutsSum,
      totalPax: paxSum,
      regionAvg,
      topAoName: topAo?.description || 'N/A',
      topAoAvg: topAo?.averagePax?.toFixed(1) || '0.0',
    };
  }, [aoList]);

  // Filter and sort AO list
  const filteredAndSortedAos = useMemo(() => {
    if (!aoList) return [];

    let list = aoList;
    const term = filterText.trim().toLowerCase();
    if (term) {
      list = list.filter((ao) => ao.description.toLowerCase().includes(term));
    }

    return [...list].sort((a, b) => {
      let aVal: string | number = a[sortField] ?? 0;
      let bVal: string | number = b[sortField] ?? 0;

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [aoList, filterText, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'description' ? 'asc' : 'desc');
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <>
      <SEO
        title="AO Attendance Analytics - F3 RVA Area of Operations"
        description="Performance metrics, attendance volume, and workout health averages across all F3 RVA Areas of Operations."
        url="https://f3rva.org/bigdata/ao"
        type="website"
      />

      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="AO Attendance & Health Analytics"
          description="Performance metrics, turnout volume, and attendance trends across all Richmond Areas of Operation."
          category="AREAS OF OPERATION"
          actions={
            <div className="ao-timeframe-bar" role="tablist" aria-label="Timeframe presets">
              <button
                type="button"
                className={`pax-year-btn ${timeframe === '30d' ? 'active' : ''}`}
                onClick={() => setTimeframe('30d')}
                role="tab"
                aria-selected={timeframe === '30d'}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                className={`pax-year-btn ${timeframe === '12m' ? 'active' : ''}`}
                onClick={() => setTimeframe('12m')}
                role="tab"
                aria-selected={timeframe === '12m'}
              >
                Past 12 Months
              </button>
              <button
                type="button"
                className={`pax-year-btn ${timeframe === 'all' ? 'active' : ''}`}
                onClick={() => setTimeframe('all')}
                role="tab"
                aria-selected={timeframe === 'all'}
              >
                All-Time
              </button>
            </div>
          }
        />

        {/* 4-Tile Aggregate Summary KPI Cards */}
        <div className="bigdata-kpi-grid">
          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Active AOs</span>
            <span className="bigdata-kpi-value" style={{ color: '#1d4ed8' }}>
              {kpis.activeAos} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>AOs</span>
            </span>
            <span className="bigdata-kpi-subtext">Locations active in timeframe</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Region Average</span>
            <span className="bigdata-kpi-value" style={{ color: '#b45309' }}>
              {kpis.regionAvg} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>PAX</span>
            </span>
            <span className="bigdata-kpi-subtext">Average attendance per workout</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Top AO by Attendance</span>
            <span className="bigdata-kpi-value" style={{ fontSize: '1.4rem', color: '#047857' }}>
              {kpis.topAoName}
            </span>
            <span className="bigdata-kpi-subtext">Highest average: {kpis.topAoAvg} PAX</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Total Workouts Conducted</span>
            <span className="bigdata-kpi-value" style={{ color: '#2c3e50' }}>
              {kpis.totalWorkouts.toLocaleString()}
            </span>
            <span className="bigdata-kpi-subtext">Total PAX: {kpis.totalPax.toLocaleString()}</span>
          </div>
        </div>

        {/* AO Table Card */}
        <div className="bigdata-card">
          <div className="bigdata-card-header">
            <div>
              <h2 className="bigdata-card-title">📍 Area of Operations Performance</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Showing {filteredAndSortedAos.length} location{filteredAndSortedAos.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="bigdata-search-container">
              <input
                type="text"
                className="bigdata-search-input"
                placeholder="Filter AOs by name..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                aria-label="Filter AOs"
              />
            </div>
          </div>

          {loading && <LoadingSpinner message="Calculating AO analytics..." />}

          {error && (
            <div className="bigdata-empty-state">
              <h3>Unable to load AO analytics</h3>
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
                      <th
                        onClick={() => handleSort('description')}
                        style={{ cursor: 'pointer' }}
                        title="Sort by AO Name"
                      >
                        AO Name{getSortIndicator('description')}
                      </th>
                      <th
                        onClick={() => handleSort('totalWorkouts')}
                        style={{ width: '150px', textAlign: 'right', cursor: 'pointer' }}
                        title="Sort by Total Workouts"
                      >
                        Workouts{getSortIndicator('totalWorkouts')}
                      </th>
                      <th
                        onClick={() => handleSort('totalPax')}
                        style={{ width: '150px', textAlign: 'right', cursor: 'pointer' }}
                        title="Sort by Total PAX"
                      >
                        Total Attendees{getSortIndicator('totalPax')}
                      </th>
                      <th
                        onClick={() => handleSort('averagePax')}
                        style={{ width: '160px', textAlign: 'right', cursor: 'pointer' }}
                        title="Sort by Average PAX per Workout"
                      >
                        Avg PAX / Workout{getSortIndicator('averagePax')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedAos.map((ao) => (
                      <tr key={`desktop-ao-${ao.aoId}`}>
                        <td>
                          <Link
                            to={`/bigdata/ao/${ao.aoId}`}
                            className="bigdata-pill ao-pill"
                            style={{ fontSize: '0.95rem' }}
                          >
                            📍 {ao.description}
                          </Link>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                          {ao.totalWorkouts.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', color: '#64748b', fontWeight: 500 }}>
                          {ao.totalPax.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span
                            className="bigdata-pill count-pill"
                            style={{
                              background: ao.averagePax >= 15 ? '#ecfdf5' : '#f8fafc',
                              color: ao.averagePax >= 15 ? '#047857' : '#1e293b',
                              borderColor: ao.averagePax >= 15 ? '#a7f3d0' : '#e2e8f0',
                            }}
                          >
                            {ao.averagePax.toFixed(1)} PAX
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredAndSortedAos.length === 0 && (
                      <tr>
                        <td colSpan={4} className="bigdata-empty-state">
                          <h3>No AOs match your filter</h3>
                          <p>Try searching for a different location name.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card-List View */}
              <div className="mobile-only-view">
                {filteredAndSortedAos.map((ao) => (
                  <div key={`mobile-ao-${ao.aoId}`} className="bigdata-workout-mobile-card">
                    <div className="bigdata-workout-mobile-header">
                      <Link
                        to={`/bigdata/ao/${ao.aoId}`}
                        className="bigdata-pill ao-pill"
                        style={{ fontSize: '1rem', fontWeight: 700 }}
                      >
                        📍 {ao.description}
                      </Link>
                      <span className="bigdata-pill count-pill">
                        {ao.averagePax.toFixed(1)} Avg
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      <span>Workouts: <strong>{ao.totalWorkouts}</strong></span>
                      <span>Total PAX: <strong>{ao.totalPax}</strong></span>
                    </div>
                  </div>
                ))}

                {filteredAndSortedAos.length === 0 && (
                  <div className="bigdata-empty-state">
                    <h3>No AOs match your filter</h3>
                    <p>Try searching for a different location name.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AOReport;
