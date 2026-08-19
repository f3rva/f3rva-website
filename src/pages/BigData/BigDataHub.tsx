import React, { useMemo } from 'react';
import { config } from '../../config';
import { AOAttendanceSummary, DayOfWeekAttendance } from '../../types/bigdata';
import { useFetch } from '../../hooks/useFetch';
import BigDataPageHeader from '../../components/BigDataPageHeader';
import BigDataSearch from '../../components/BigDataSearch';
import BigDataWorkouts from './Workouts/BigDataWorkouts';
import SEO from '../../components/SEO';
import './BigData.css';

export const BigDataHub: React.FC = () => {
  // Compute date range for past 30 days
  const { startDate30, endDateToday } = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    return {
      startDate30: formatDate(thirtyDaysAgo),
      endDateToday: formatDate(today),
    };
  }, []);

  // Fetch 30-day AO attendance metrics
  const aoUrl = `${config.apiBaseUrl}/v2/reports/ao?startDate=${startDate30}&endDate=${endDateToday}`;
  const { data: ao30Data, loading: aoLoading } = useFetch<AOAttendanceSummary[]>(aoUrl);

  // Fetch Day of Week trends for the past 30 days
  const dowUrl = `${config.apiBaseUrl}/v2/reports/day-of-week?startDate=${startDate30}&endDate=${endDateToday}`;
  const { data: dowData, loading: dowLoading } = useFetch<DayOfWeekAttendance[]>(dowUrl);

  // Calculate 30-day Region KPI Metrics
  const metrics = useMemo(() => {
    if (aoLoading || !ao30Data) {
      return {
        avgPax: '--',
        activeAos: '--',
        topAoName: '--',
        topAoAvg: '--',
      };
    }

    if (ao30Data.length === 0) {
      return {
        avgPax: '0.0',
        activeAos: '0',
        topAoName: 'N/A',
        topAoAvg: '0.0',
      };
    }

    const totalW = ao30Data.reduce((acc, curr) => acc + (curr.totalWorkouts || 0), 0);
    const totalP = ao30Data.reduce((acc, curr) => acc + (curr.totalPax || 0), 0);
    const activeCount = ao30Data.filter((ao) => (ao.totalWorkouts || 0) > 0).length;
    const avg = totalW > 0 ? (totalP / totalW).toFixed(1) : '0.0';

    // Find top AO by average PAX
    const sortedAos = [...ao30Data].sort((a, b) => (b.averagePax || 0) - (a.averagePax || 0));
    const topAo = sortedAos[0];

    return {
      avgPax: avg,
      activeAos: activeCount.toString(),
      topAoName: topAo?.description || 'N/A',
      topAoAvg: topAo?.averagePax?.toFixed(1) || '0.0',
    };
  }, [ao30Data, aoLoading]);

  // Find most active workout day
  const topDay = useMemo(() => {
    if (dowLoading || !dowData) return '--';
    if (dowData.length === 0) return 'N/A';
    const sorted = [...dowData].sort((a, b) => b.totalPax - a.totalPax);
    return sorted[0]?.dayName || 'N/A';
  }, [dowData, dowLoading]);

  return (
    <>
      <SEO
        title="Big Data Dashboard - F3 RVA Region Analytics"
        description="Explore F3 RVA region-wide workout analytics, attendance leaderboards, AO performance metrics, and member statistics across Richmond."
        url="https://f3rva.org/bigdata"
        type="website"
      />

      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Big Data Dashboard"
          description="Region-wide workout analytics, attendance leaderboards, AO metrics, and member statistics."
          category="DASHBOARD"
        />

        {/* Universal Fast Search Bar */}
        <BigDataSearch placeholder="Search any PAX or AO (e.g., 'E.F. Hutton', 'GridIron', 'Rosie')..." />

        {/* 30-Day Region KPI Summary Cards */}
        <div className="bigdata-kpi-grid">
          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">30-Day Region Average</span>
            <span className="bigdata-kpi-value" style={{ color: '#b45309' }}>
              {metrics.avgPax} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>PAX</span>
            </span>
            <span className="bigdata-kpi-subtext">Average attendance per workout (last 30 days)</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Active AOs (30 Days)</span>
            <span className="bigdata-kpi-value" style={{ color: '#1d4ed8' }}>
              {metrics.activeAos} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>AOs</span>
            </span>
            <span className="bigdata-kpi-subtext">Locations with active posts in the last month</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Top AO (30 Days)</span>
            <span className="bigdata-kpi-value" style={{ fontSize: '1.4rem', color: '#047857' }}>
              {metrics.topAoName}
            </span>
            <span className="bigdata-kpi-subtext">Highest average: {metrics.topAoAvg} PAX / workout</span>
          </div>

          <div className="bigdata-kpi-card">
            <span className="bigdata-kpi-label">Peak Workout Day</span>
            <span className="bigdata-kpi-value" style={{ fontSize: '1.5rem', color: '#2c3e50' }}>
              {topDay}
            </span>
            <span className="bigdata-kpi-subtext">Highest weekly PAX attendance volume</span>
          </div>
        </div>

        {/* Recent Workouts Explorer Table */}
        <BigDataWorkouts />
      </div>
    </>
  );
};

export default BigDataHub;


