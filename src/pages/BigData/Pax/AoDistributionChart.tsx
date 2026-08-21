import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { WorkoutPost } from '../../../types/WorkoutPost';

interface AoDistributionChartProps {
  attendedWorkouts: WorkoutPost[];
}

export const AoDistributionChart: React.FC<AoDistributionChartProps> = ({
  attendedWorkouts,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'12m' | 'all'>('12m');

  const chartData = useMemo(() => {
    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setFullYear(today.getFullYear() - 1);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const filtered = filterPeriod === '12m'
      ? attendedWorkouts.filter((w) => w.workoutDate && w.workoutDate >= cutoffStr)
      : attendedWorkouts;

    const aoCounts = new Map<string, number>();
    let totalPosts = 0;

    filtered.forEach((w) => {
      totalPosts++;
      const aoName = w.ao?.[0]?.description || 'Other / Unknown';
      aoCounts.set(aoName, (aoCounts.get(aoName) || 0) + 1);
    });

    const sorted = Array.from(aoCounts.entries())
      .map(([name, count]) => ({
        name: name.length > 16 ? `${name.substring(0, 14)}...` : name,
        fullName: name,
        count,
        percentage: totalPosts > 0 ? ((count / totalPosts) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.count - a.count);

    if (sorted.length <= 5) {
      return sorted;
    }

    const top5 = sorted.slice(0, 5);
    const otherCount = sorted.slice(5).reduce((acc, curr) => acc + curr.count, 0);
    top5.push({
      name: 'Other AOs',
      fullName: 'Other AOs combined',
      count: otherCount,
      percentage: totalPosts > 0 ? ((otherCount / totalPosts) * 100).toFixed(1) : '0',
    });

    return top5;
  }, [attendedWorkouts, filterPeriod]);

  return (
    <div className="bigdata-card">
      <div className="bigdata-card-header">
        <div>
          <h2 className="bigdata-card-title">📍 Top AO Distribution</h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Most frequented Areas of Operation
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            className={`pax-year-btn ${filterPeriod === '12m' ? 'active' : ''}`}
            onClick={() => setFilterPeriod('12m')}
          >
            Past 12M
          </button>
          <button
            type="button"
            className={`pax-year-btn ${filterPeriod === 'all' ? 'active' : ''}`}
            onClick={() => setFilterPeriod('all')}
          >
            All-Time
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: '280px', marginTop: '1rem' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
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
                formatter={(value, _name, entry) => {
                  const item = entry as { payload?: { percentage?: string; fullName?: string } };
                  return [
                    `${value ?? 0} posts (${item?.payload?.percentage ?? '0'}%)`,
                    item?.payload?.fullName || 'AO',
                  ];
                }}
              />
              <Bar dataKey="count" name="Posts" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="bigdata-empty-state" style={{ padding: '2rem' }}>
            <p>No workout location data available for this timeframe.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AoDistributionChart;
