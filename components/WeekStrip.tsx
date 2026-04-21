import React, { useEffect, useState } from 'react';
import { FastSession } from '../types';
import { isoFromDate, MS_PER_HOUR } from '../utils';

interface Props {
  sessions: FastSession[];
  activeStart: number | null;
}

/**
 * 7-dages strip af dage der viser, hvor meget af hver dag du har fastet.
 * Sidste kolonne er i dag (højrekolonne).
 */
export const WeekStrip: React.FC<Props> = ({ sessions, activeStart }) => {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  const trackColor = isDark ? '#334155' : '#e5e7eb';

  const days: { date: Date; iso: string }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({ date: d, iso: isoFromDate(d) });
  }

  const todayIso = isoFromDate(now);

  const fastedMinutesByDay: Record<string, number> = {};
  sessions.forEach((s) => {
    if (!s.endTime) return;
    // Dag = dato for endTime
    const iso = isoFromDate(new Date(s.endTime));
    const minutes = (s.endTime - s.startTime) / (60 * 1000);
    fastedMinutesByDay[iso] = (fastedMinutesByDay[iso] || 0) + minutes;
  });

  if (activeStart) {
    const iso = isoFromDate(new Date());
    const minutes = (Date.now() - activeStart) / (60 * 1000);
    fastedMinutesByDay[iso] = (fastedMinutesByDay[iso] || 0) + minutes;
  }

  return (
    <div className="grid grid-cols-7 gap-1 px-1">
      {days.map(({ date, iso }) => {
        const isToday = iso === todayIso;
        const minutes = fastedMinutesByDay[iso] || 0;
        const hours = minutes / 60;
        const pct = Math.min(1, hours / 16); // 16t = fuld ring
        const weekday = date
          .toLocaleDateString('da-DK', { weekday: 'short' })
          .replace('.', '')
          .toUpperCase();
        const size = 28;
        const radius = (size - 3) / 2;
        const circ = 2 * Math.PI * radius;
        const dashOffset = circ * (1 - pct);
        return (
          <div key={iso} className="flex flex-col items-center gap-1">
            <span
              className={`text-[10px] font-bold tracking-wider ${
                isToday ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}
            >
              {weekday}
            </span>
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={trackColor}
                  strokeWidth={2}
                  fill="transparent"
                />
                {pct > 0 && (
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#FF4E2B"
                    strokeWidth={2.5}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={dashOffset}
                  />
                )}
              </svg>
              {isToday && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
