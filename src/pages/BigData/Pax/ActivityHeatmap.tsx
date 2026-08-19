import React, { useState, useMemo } from 'react';
import { WorkoutPost } from '../../../types/WorkoutPost';

interface ActivityHeatmapProps {
  attendedWorkouts: WorkoutPost[];
  qdWorkouts: WorkoutPost[];
}

interface DayActivity {
  date: string;
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  count: number;
  isQ: boolean;
  workouts: WorkoutPost[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  attendedWorkouts,
  qdWorkouts,
}) => {
  const currentYear = new Date().getFullYear();

  // Extract all distinct years from workout history
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);

    [...attendedWorkouts, ...qdWorkouts].forEach((w) => {
      if (w.workoutDate) {
        const y = parseInt(w.workoutDate.substring(0, 4), 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [attendedWorkouts, qdWorkouts, currentYear]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || currentYear);

  // Index workouts for selected year by date string "YYYY-MM-DD"
  const { activityMap, yearAttendedCount, yearQCount } = useMemo(() => {
    const map = new Map<string, { count: number; isQ: boolean; workouts: WorkoutPost[] }>();
    let attendedCount = 0;
    let qCount = 0;

    const prefix = `${selectedYear}-`;

    attendedWorkouts.forEach((w) => {
      if (w.workoutDate && w.workoutDate.startsWith(prefix)) {
        attendedCount++;
        const existing = map.get(w.workoutDate) || { count: 0, isQ: false, workouts: [] };
        existing.count++;
        existing.workouts.push(w);
        map.set(w.workoutDate, existing);
      }
    });

    qdWorkouts.forEach((w) => {
      if (w.workoutDate && w.workoutDate.startsWith(prefix)) {
        qCount++;
        const existing = map.get(w.workoutDate) || { count: 0, isQ: false, workouts: [] };
        existing.isQ = true;
        if (!existing.workouts.some((ex) => ex.workoutId === w.workoutId)) {
          existing.count++;
          existing.workouts.push(w);
        }
        map.set(w.workoutDate, existing);
      }
    });

    return { activityMap: map, yearAttendedCount: attendedCount, yearQCount: qCount };
  }, [attendedWorkouts, qdWorkouts, selectedYear]);

  // Generate 52/53 weeks of days for the selected year
  const { weeks, monthPositions } = useMemo(() => {
    const start = new Date(Date.UTC(selectedYear, 0, 1));
    const end = new Date(Date.UTC(selectedYear, 11, 31));

    const allDays: DayActivity[] = [];
    const curr = new Date(start);

    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0];
      const dayOfWeek = curr.getUTCDay();
      const data = activityMap.get(dateStr);

      allDays.push({
        date: dateStr,
        dayOfWeek,
        count: data?.count || 0,
        isQ: data?.isQ || false,
        workouts: data?.workouts || [],
      });

      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    // Group into 7-day columns (weeks)
    const weekCols: DayActivity[][] = [];
    let currentWeek: DayActivity[] = [];

    // Pad beginning of first week if year does not start on Sunday
    const firstDayOfWeek = allDays[0]?.dayOfWeek || 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: '',
        dayOfWeek: i,
        count: 0,
        isQ: false,
        workouts: [],
      });
    }

    allDays.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weekCols.push(currentWeek);
        currentWeek = [];
      }
    });

    // Pad trailing days in last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: '',
          dayOfWeek: currentWeek.length,
          count: 0,
          isQ: false,
          workouts: [],
        });
      }
      weekCols.push(currentWeek);
    }

    // Calculate approx month labels positions
    const mPositions: { month: string; colIndex: number }[] = [];
    let lastMonth = -1;

    weekCols.forEach((week, colIdx) => {
      const firstValidDay = week.find((d) => d.date);
      if (firstValidDay) {
        const monthNum = parseInt(firstValidDay.date.split('-')[1], 10) - 1;
        if (monthNum !== lastMonth) {
          mPositions.push({ month: MONTH_NAMES[monthNum] || '', colIndex: colIdx });
          lastMonth = monthNum;
        }
      }
    });

    return { weeks: weekCols, monthPositions: mPositions };
  }, [selectedYear, activityMap]);

  return (
    <div className="bigdata-card">
      <div className="bigdata-card-header">
        <div>
          <h2 className="bigdata-card-title">📅 Annual Activity & Q Heatmap</h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {yearAttendedCount} posts ({yearQCount} led as Q) in {selectedYear}
          </span>
        </div>

        {/* Year Switcher Buttons */}
        <div className="pax-heatmap-year-selector" role="tablist" aria-label="Select Year">
          {availableYears.map((yr) => (
            <button
              key={`year-btn-${yr}`}
              type="button"
              className={`pax-year-btn ${selectedYear === yr ? 'active' : ''}`}
              onClick={() => setSelectedYear(yr)}
              role="tab"
              aria-selected={selectedYear === yr}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      <div className="pax-heatmap-container">
        <div className="pax-heatmap-grid-wrapper">
          {/* Month Header row */}
          <div style={{ display: 'flex', marginLeft: '28px', marginBottom: '6px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            {monthPositions.map((m, idx) => (
              <span
                key={`month-${m.month}-${idx}`}
                style={{
                  width: `${(52 / 12) * 16}px`,
                  textAlign: 'left',
                }}
              >
                {m.month}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {/* Day of Week Labels (Mon, Wed, Fri) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.68rem', color: '#94a3b8', width: '22px', textAlign: 'right' }}>
              <span style={{ height: '13px', lineHeight: '13px' }}></span>
              <span style={{ height: '13px', lineHeight: '13px' }}>Mon</span>
              <span style={{ height: '13px', lineHeight: '13px' }}></span>
              <span style={{ height: '13px', lineHeight: '13px' }}>Wed</span>
              <span style={{ height: '13px', lineHeight: '13px' }}></span>
              <span style={{ height: '13px', lineHeight: '13px' }}>Fri</span>
              <span style={{ height: '13px', lineHeight: '13px' }}></span>
            </div>

            {/* 52 Week Columns */}
            <div className="pax-heatmap-grid">
              {weeks.map((week, wIdx) =>
                week.map((day, dIdx) => {
                  if (!day.date) {
                    return <div key={`empty-${wIdx}-${dIdx}`} style={{ width: '13px', height: '13px' }} />;
                  }

                  let levelClass = 'level-0';
                  if (day.isQ) levelClass = 'is-q';
                  else if (day.count >= 3) levelClass = 'level-3';
                  else if (day.count === 2) levelClass = 'level-2';
                  else if (day.count === 1) levelClass = 'level-1';

                  const tooltip = day.count > 0
                    ? `${day.date}: ${day.count} workout${day.count > 1 ? 's' : ''} ${day.isQ ? '(👑 Led as Q)' : '(PAX)'}\n${day.workouts.map((w) => `• ${w.title} @ ${w.ao?.[0]?.description || 'AO'}`).join('\n')}`
                    : `${day.date}: No workout logged`;

                  return (
                    <div
                      key={`cell-${day.date}`}
                      className={`pax-heatmap-cell ${levelClass}`}
                      title={tooltip}
                      aria-label={tooltip}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="pax-heatmap-legend">
          <span>Less</span>
          <div className="pax-legend-box" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }} />
          <div className="pax-legend-box" style={{ background: '#86efac', border: '1px solid #4ade80' }} />
          <div className="pax-legend-box" style={{ background: '#22c55e', border: '1px solid #16a34a' }} />
          <div className="pax-legend-box" style={{ background: '#15803d', border: '1px solid #166534' }} />
          <span>More</span>
          <span style={{ marginLeft: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <div className="pax-legend-box" style={{ background: '#f59e0b', border: '1px solid #d97706' }} />
            <strong>QIC</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
