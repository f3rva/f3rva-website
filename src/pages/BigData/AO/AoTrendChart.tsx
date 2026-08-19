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
import { WorkoutPost } from '../../../types/WorkoutPost';

interface AoTrendChartProps {
  workouts: WorkoutPost[];
}

interface WeekBucket {
  weekKey: string;
  weekLabel: string;
  weeklyPax: number;
  workoutCount: number;
  avgPaxPerWorkout: number;
  movingAvg: number;
}

export const AoTrendChart: React.FC<AoTrendChartProps> = ({ workouts }) => {
  const [timeframeMonths, setTimeframeMonths] = useState<number>(12);

  const chartData = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];

    const today = new Date();
    const timeframeCutoff = new Date();
    timeframeCutoff.setMonth(today.getMonth() - timeframeMonths);

    // Find the earliest workout date in the entire dataset
    const validWorkoutDates = workouts
      .map((w) => w.workoutDate)
      .filter((d): d is string => Boolean(d && /^\d{4}-\d{2}-\d{2}$/.test(d)))
      .sort();

    if (validWorkoutDates.length === 0) return [];

    const earliestWorkoutDate = new Date(validWorkoutDates[0] + 'T00:00:00');

    // Start timeline at either timeframe cutoff or first workout date, whichever is later
    const startDate = earliestWorkoutDate > timeframeCutoff ? earliestWorkoutDate : timeframeCutoff;

    // Align start to the Sunday of that week
    const curr = new Date(startDate);
    curr.setDate(curr.getDate() - curr.getDay());

    // Generate weekly slots (Sunday dates) covering timeline up to today
    const weeks: WeekBucket[] = [];
    while (curr <= today) {
      const year = curr.getFullYear();
      const month = (curr.getMonth() + 1).toString().padStart(2, '0');
      const day = curr.getDate().toString().padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      const label = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      weeks.push({
        weekKey: key,
        weekLabel: label,
        weeklyPax: 0,
        workoutCount: 0,
        avgPaxPerWorkout: 0,
        movingAvg: 0,
      });

      curr.setDate(curr.getDate() + 7);
    }

    // Map each workout into its corresponding Sunday week bucket
    workouts.forEach((w) => {
      if (!w.workoutDate || !/^\d{4}-\d{2}-\d{2}$/.test(w.workoutDate)) return;
      const wDate = new Date(w.workoutDate + 'T00:00:00');
      if (wDate < startDate) return;

      const sunday = new Date(wDate);
      sunday.setDate(sunday.getDate() - sunday.getDay());
      const sYear = sunday.getFullYear();
      const sMonth = (sunday.getMonth() + 1).toString().padStart(2, '0');
      const sDay = sunday.getDate().toString().padStart(2, '0');
      const key = `${sYear}-${sMonth}-${sDay}`;

      const bucket = weeks.find((wk) => wk.weekKey === key);
      if (bucket) {
        const count = w.paxCount || (w.pax?.length || 0);
        bucket.weeklyPax += count;
        bucket.workoutCount += 1;
      }
    });

    // Compute average PAX per workout for each week
    weeks.forEach((wk) => {
      if (wk.workoutCount > 0) {
        wk.avgPaxPerWorkout = parseFloat((wk.weeklyPax / wk.workoutCount).toFixed(1));
      }
    });

    // Calculate 4-week smoothed moving average (PAX per workout over 4-week window)
    let lastValidMovingAvg = 0;
    for (let i = 0; i < weeks.length; i++) {
      let windowPax = 0;
      let windowWorkouts = 0;

      for (let j = Math.max(0, i - 3); j <= i; j++) {
        const wk = weeks[j];
        if (wk && wk.workoutCount > 0) {
          windowPax += wk.weeklyPax;
          windowWorkouts += wk.workoutCount;
        }
      }

      const curWk = weeks[i];
      if (curWk) {
        if (windowWorkouts > 0) {
          curWk.movingAvg = parseFloat((windowPax / windowWorkouts).toFixed(1));
          lastValidMovingAvg = curWk.movingAvg;
        } else {
          // If no workouts in 4-week window, carry over previous moving average or 0
          curWk.movingAvg = lastValidMovingAvg;
        }
      }
    }

    return weeks;
  }, [workouts, timeframeMonths]);

  return (
    <div className="bigdata-card">
      <div className="bigdata-card-header">
        <div>
          <h2 className="bigdata-card-title">📈 Attendance Trend & 4-Week Moving Average</h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Weekly attendance volume with a 4-week smoothed turnout average curve
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            className={`pax-year-btn ${timeframeMonths === 12 ? 'active' : ''}`}
            onClick={() => setTimeframeMonths(12)}
          >
            Past 12M
          </button>
          <button
            type="button"
            className={`pax-year-btn ${timeframeMonths === 24 ? 'active' : ''}`}
            onClick={() => setTimeframeMonths(24)}
          >
            Past 24M
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: '320px', marginTop: '1rem' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="weekLabel"
                tick={{ fill: '#64748b', fontSize: 11 }}
                stroke="#cbd5e1"
                interval={Math.ceil(chartData.length / 10)}
              />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} stroke="#cbd5e1" />
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
                  if (dataKey === 'weeklyPax' || name === 'Weekly Attendance') {
                    const payload = (item as { payload?: WeekBucket })?.payload;
                    const countStr = payload?.workoutCount
                      ? ` (${payload.workoutCount} workout${payload.workoutCount > 1 ? 's' : ''})`
                      : '';
                    return [`${numVal} PAX${countStr}`, 'Weekly Attendance (Total)'];
                  }
                  return [`${numVal.toFixed(1)} PAX / workout`, '4-Week Moving Average'];
                }}
                labelFormatter={(label) => `Week of ${label}`}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '13px' }} />
              <Bar dataKey="weeklyPax" name="Weekly Attendance" fill="#93c5fd" radius={[2, 2, 0, 0]} />
              <Line
                type="monotone"
                dataKey="movingAvg"
                name="4-Week Moving Avg (PAX/Workout)"
                stroke="#1d4ed8"
                strokeWidth={3}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="bigdata-empty-state" style={{ padding: '2rem' }}>
            <p>No historical attendance data available for trend calculation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AoTrendChart;

