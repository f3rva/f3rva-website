import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { config } from '../../../config';
import { F3_INCEPTION_DATE } from '../../../config/constants';
import { DayOfWeekAttendance } from '../../../types/bigdata';
import { useFetch } from '../../../hooks/useFetch';
import { formatDateToISO, getDateDaysAgo, getDateMonthsAgo } from '../../../utils/dateUtils';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import '../BigData.css';
import '../AO/AO.css';
import '../Attendance/Attendance.css';

type TimeframePreset = '30d' | '12m' | 'all';

const ORDERED_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DayOfWeekReport: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframePreset>('30d');

  // Compute startDate & endDate query parameters
  const queryParams = useMemo(() => {
    const today = new Date();

    if (timeframe === '30d') {
      const start = getDateDaysAgo(30, today);
      return `?startDate=${formatDateToISO(start)}&endDate=${formatDateToISO(today)}`;
    }
    if (timeframe === '12m') {
      const start = getDateMonthsAgo(12, today);
      return `?startDate=${formatDateToISO(start)}&endDate=${formatDateToISO(today)}`;
    }
    // All-time: explicit from region inception to today
    return `?startDate=${F3_INCEPTION_DATE}&endDate=${formatDateToISO(today)}`;
  }, [timeframe]);

  const apiUrl = `${config.apiBaseUrl}/v2/reports/day-of-week${queryParams}`;
  const { data: rawDayData, loading, error } = useFetch<DayOfWeekAttendance[]>(apiUrl);

  // Normalize day data to guarantee all 7 days Sun-Sat in order
  const dayData = useMemo(() => {
    if (!rawDayData) return [];

    const map = new Map<string, DayOfWeekAttendance>();
    rawDayData.forEach((d) => map.set(d.dayName.toLowerCase(), d));

    return ORDERED_DAYS.map((dayName, idx) => {
      const existing = map.get(dayName.toLowerCase());
      if (existing) {
        return existing;
      }
      return {
        dayId: idx + 1,
        dayName,
        workoutCount: 0,
        totalPax: 0,
        averagePax: 0,
      };
    });
  }, [rawDayData]);

  // Aggregate KPI Stats
  const kpis = useMemo(() => {
    if (loading || !rawDayData) {
      return {
        peakDay: '--',
        peakDayPax: '--',
        highestAvgDay: '--',
        highestAvg: '--',
        totalWorkouts: '--',
        totalPax: '--',
        rawTotalPax: 0,
        rawPeakDayPax: 0,
      };
    }

    if (!dayData || dayData.length === 0) {
      return {
        peakDay: 'N/A',
        peakDayPax: '0',
        highestAvgDay: 'N/A',
        highestAvg: '0.0',
        totalWorkouts: '0',
        totalPax: '0',
        rawTotalPax: 0,
        rawPeakDayPax: 0,
      };
    }

    let totalWorkouts = 0;
    let totalPax = 0;
    let peakDay = dayData[0];
    let highestAvgDay = dayData[0];

    dayData.forEach((d) => {
      totalWorkouts += d.workoutCount || 0;
      totalPax += d.totalPax || 0;

      if ((d.totalPax || 0) > (peakDay?.totalPax || 0)) {
        peakDay = d;
      }
      if ((d.averagePax || 0) > (highestAvgDay?.averagePax || 0)) {
        highestAvgDay = d;
      }
    });

    return {
      peakDay: peakDay?.dayName || 'N/A',
      peakDayPax: (peakDay?.totalPax || 0).toLocaleString(),
      highestAvgDay: highestAvgDay?.dayName || 'N/A',
      highestAvg: highestAvgDay?.averagePax ? highestAvgDay.averagePax.toFixed(1) : '0.0',
      totalWorkouts: totalWorkouts.toLocaleString(),
      totalPax: totalPax.toLocaleString(),
      rawTotalPax: totalPax,
      rawPeakDayPax: peakDay?.totalPax || 0,
    };
  }, [dayData, rawDayData, loading]);

  return (
    <>
      <SEO
        title="Day of Week Attendance Analytics - F3 RVA Big Data"
        description="Explore F3 Richmond workout attendance trends and PAX participation breakdown by day of the week."
        url="https://f3rva.org/bigdata/day-of-week"
        type="website"
      />

      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="📅 Day of Week Attendance Analytics"
          description="Analyze workout frequency, aggregate turnout, and average attendance by weekday."
          category="ANALYTICAL REPORTS"
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

        {/* 4-Tile Aggregate Summary KPIs */}
        <div className="bigdata-kpi-grid">
          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Peak Attendance Day</span>
            <span className="bigdata-kpi-value" style={{ color: '#2563eb' }}>
              {kpis.peakDay}
            </span>
            <span className="bigdata-kpi-subtext">
              {kpis.peakDayPax} total PAX posted
            </span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Highest Turnout Average</span>
            <span className="bigdata-kpi-value" style={{ color: '#047857' }}>
              {kpis.highestAvgDay}
            </span>
            <span className="bigdata-kpi-subtext">{kpis.highestAvg} PAX / workout</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Total Regional Workouts</span>
            <span className="bigdata-kpi-value" style={{ color: '#2c3e50' }}>
              {kpis.totalWorkouts}
            </span>
            <span className="bigdata-kpi-subtext">Across all 7 weekdays</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Total PAX Turnout</span>
            <span className="bigdata-kpi-value" style={{ color: '#b45309' }}>
              {kpis.totalPax}
            </span>
            <span className="bigdata-kpi-subtext">Cumulative participants</span>
          </div>
        </div>

        {/* 7-Day Regional Breakdown Cards Grid */}
        <div className="day-cards-grid">
          {dayData.map((d) => {
            const isPeak = d.dayName === kpis.peakDay && kpis.rawPeakDayPax > 0;
            const pctShare = kpis.rawTotalPax > 0 ? ((d.totalPax / kpis.rawTotalPax) * 100).toFixed(1) : '0.0';

            return (
              <div key={`day-card-${d.dayName}`} className={`day-card ${isPeak ? 'day-card-peak' : ''}`}>
                <div className="day-card-header">
                  <span className="day-card-name">{d.dayName}</span>
                  {isPeak && <span className="day-card-badge">🔥 Peak</span>}
                </div>
                <div className="day-card-stat">{d.totalPax.toLocaleString()} PAX</div>
                <div className="day-card-meta">
                  <span>Workouts: <strong>{d.workoutCount}</strong></span>
                  <span>Avg: <strong>{d.averagePax.toFixed(1)} PAX</strong></span>
                  <span>Share: <strong>{pctShare}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dual-Axis Turnout & Average Chart */}
        <div className="bigdata-card">
          <div className="bigdata-card-header">
            <div>
              <h2 className="bigdata-card-title">📊 Weekday Turnout & Average Distribution</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Compare total attendance volume against average workout turnout for each day of the week
              </span>
            </div>
          </div>

          {loading && <LoadingSpinner message="Calculating weekday distribution..." />}

          {error && (
            <div className="bigdata-empty-state">
              <h3>Unable to load day-of-week analytics</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div style={{ width: '100%', height: '340px', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dayData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="dayName" tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
                  <YAxis
                    yAxisId="left"
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#b45309', fontSize: 12 }}
                    stroke="#cbd5e1"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      color: '#1e293b',
                    }}
                    formatter={(value, name, item) => {
                      const dataKey = (item as { dataKey?: string })?.dataKey || name;
                      const numVal = typeof value === 'number' ? value : 0;
                      if (dataKey === 'totalPax' || name === 'Total Attendees') {
                        return [`${numVal.toLocaleString()} PAX`, 'Total Attendance'];
                      }
                      if (dataKey === 'workoutCount' || name === 'Workouts Hosted') {
                        return [`${numVal} workouts`, 'Workouts Hosted'];
                      }
                      return [`${numVal.toFixed(1)} PAX / workout`, 'Average Attendance'];
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '13px' }} />
                  <Bar yAxisId="left" dataKey="totalPax" name="Total Attendees" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="workoutCount" name="Workouts Hosted" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="averagePax"
                    name="Average PAX / Workout"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Comparison Table Card */}
        <div className="bigdata-card" style={{ marginTop: '1.5rem' }}>
          <div className="bigdata-card-header">
            <div>
              <h2 className="bigdata-card-title">📋 Weekday Comparison Breakdown</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Detailed breakdown of workouts, PAX volume, and turnout ratios
              </span>
            </div>
          </div>

          {!loading && !error && (
            <>
              {/* Desktop Table */}
              <div className="bigdata-table-wrapper desktop-only-view">
                <table className="bigdata-table">
                  <thead>
                    <tr>
                      <th>Day of Week</th>
                      <th style={{ width: '160px', textAlign: 'right' }}>Workouts Hosted</th>
                      <th style={{ width: '180px', textAlign: 'right' }}>Total Attendance (PAX)</th>
                      <th style={{ width: '180px', textAlign: 'right' }}>Avg Turnout / Workout</th>
                      <th style={{ width: '140px', textAlign: 'right' }}>Volume Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayData.map((d) => {
                      const isPeak = d.dayName === kpis.peakDay && kpis.rawPeakDayPax > 0;
                      const pctShare = kpis.rawTotalPax > 0 ? ((d.totalPax / kpis.rawTotalPax) * 100).toFixed(1) : '0.0';

                      return (
                        <tr key={`row-${d.dayName}`}>
                          <td style={{ fontWeight: 600, color: '#1e293b' }}>
                            {d.dayName} {isPeak && <span className="day-card-badge" style={{ marginLeft: '0.4rem' }}>Peak Day</span>}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                            {d.workoutCount}
                          </td>
                          <td style={{ textAlign: 'right', color: '#2563eb', fontWeight: 700 }}>
                            {d.totalPax.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span
                              className="bigdata-pill count-pill"
                              style={{
                                background: d.averagePax >= 15 ? '#ecfdf5' : '#f8fafc',
                                color: d.averagePax >= 15 ? '#047857' : '#1e293b',
                              }}
                            >
                              {d.averagePax.toFixed(1)} PAX
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', color: '#64748b', fontWeight: 600 }}>
                            {pctShare}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card-List View */}
              <div className="mobile-only-view">
                {dayData.map((d) => {
                  const isPeak = d.dayName === kpis.peakDay && kpis.rawPeakDayPax > 0;
                  const pctShare = kpis.rawTotalPax > 0 ? ((d.totalPax / kpis.rawTotalPax) * 100).toFixed(1) : '0.0';

                  return (
                    <div key={`m-row-${d.dayName}`} className="bigdata-workout-mobile-card">
                      <div className="bigdata-workout-mobile-header">
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                          {d.dayName} {isPeak && <span className="day-card-badge">Peak</span>}
                        </span>
                        <span className="bigdata-pill count-pill">
                          {d.averagePax.toFixed(1)} Avg
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem' }}>
                        <span>Workouts: <strong>{d.workoutCount}</strong></span>
                        <span>Total: <strong>{d.totalPax} PAX</strong></span>
                        <span>Share: <strong>{pctShare}%</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DayOfWeekReport;
