import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { WorkoutPost } from '../../../types/WorkoutPost';

interface MonthlyMomentumChartProps {
  attendedWorkouts: WorkoutPost[];
  qdWorkouts: WorkoutPost[];
}

export const MonthlyMomentumChart: React.FC<MonthlyMomentumChartProps> = ({
  attendedWorkouts,
  qdWorkouts,
}) => {
  const [timeframeMonths, setTimeframeMonths] = useState<number>(12);

  const chartData = useMemo(() => {
    const today = new Date();
    const buckets: { key: string; label: string; paxCount: number; qCount: number; total: number }[] = [];

    // Generate last N month keys (YYYY-MM)
    for (let i = timeframeMonths - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = (d.getMonth() + 1).toString().padStart(2, '0');
      const key = `${year}-${monthNum}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      buckets.push({ key, label, paxCount: 0, qCount: 0, total: 0 });
    }

    const bucketMap = new Map(buckets.map((b) => [b.key, b]));

    // Aggregate attended workouts
    attendedWorkouts.forEach((w) => {
      if (w.workoutDate && w.workoutDate.length >= 7) {
        const key = w.workoutDate.substring(0, 7);
        const bucket = bucketMap.get(key);
        if (bucket) {
          bucket.paxCount++;
        }
      }
    });

    // Aggregate Q workouts
    qdWorkouts.forEach((w) => {
      if (w.workoutDate && w.workoutDate.length >= 7) {
        const key = w.workoutDate.substring(0, 7);
        const bucket = bucketMap.get(key);
        if (bucket) {
          bucket.qCount++;
          // Ensure paxCount represents non-Q attendance if overlapping
          if (bucket.paxCount > 0) {
            bucket.paxCount = Math.max(0, bucket.paxCount - 1);
          }
        }
      }
    });

    buckets.forEach((b) => {
      b.total = b.paxCount + b.qCount;
    });

    return buckets;
  }, [attendedWorkouts, qdWorkouts, timeframeMonths]);

  return (
    <div className="bigdata-card">
      <div className="bigdata-card-header">
        <div>
          <h2 className="bigdata-card-title">📈 Monthly Momentum</h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Posts vs Q leadership ratio over the last {timeframeMonths} months
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            className={`pax-year-btn ${timeframeMonths === 12 ? 'active' : ''}`}
            onClick={() => setTimeframeMonths(12)}
          >
            12 Months
          </button>
          <button
            type="button"
            className={`pax-year-btn ${timeframeMonths === 24 ? 'active' : ''}`}
            onClick={() => setTimeframeMonths(24)}
          >
            24 Months
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: '280px', marginTop: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
            <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                color: '#1e293b',
              }}
              formatter={(value, name) => [`${value ?? 0} posts`, String(name || 'Role')]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '13px' }} />
            <Bar dataKey="paxCount" name="Attended (PAX)" stackId="a" fill="#3b82f6" radius={[0, 0, 2, 2]} />
            <Bar dataKey="qCount" name="Led as Q" stackId="a" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyMomentumChart;
