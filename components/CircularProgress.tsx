import React, { useEffect, useRef, useState } from 'react';
import { FAST_STAGES } from '../constants';
import { FastStage } from '../types';

interface Props {
  size?: number;
  stroke?: number;
  progress: number; // 0..1
  activeStage: FastStage;
  targetHours: number;
  elapsedMs: number;
  children?: React.ReactNode;
}

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Cirkulær timer-ring, med stage-ikoner fordelt langs ringen.
 * Skalerer responsivt — maks størrelse er `size` prop, men krymper hvis
 * containeren er smallere (typisk mobilskærme < 340px).
 */
export const CircularProgress: React.FC<Props> = ({
  size: maxSize = 300,
  stroke: baseStroke = 18,
  progress,
  activeStage,
  targetHours,
  elapsedMs,
  children
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(maxSize);
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth;
      if (available > 0) {
        setSize(Math.max(180, Math.min(maxSize, available)));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxSize]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  const trackColor = isDark ? '#334155' : '#f1f5f9'; // slate-700 / slate-100

  // Scale stroke and marker sizes proportionally to size
  const stroke = Math.max(10, Math.round((baseStroke * size) / maxSize));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);
  const cx = size / 2;
  const cy = size / 2;

  const markerSize = Math.max(24, Math.round((32 * size) / maxSize));

  const visibleStages = FAST_STAGES.filter((s) => s.hours <= targetHours);
  const elapsedHours = elapsedMs / MS_PER_HOUR;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[480px] mx-auto">
      <div
        className="relative flex items-center justify-center mx-auto"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={radius} stroke={trackColor} strokeWidth={stroke} fill="transparent" />
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="#FF4E2B"
            strokeWidth={stroke}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>

        {visibleStages.map((stage) => {
          if (stage.hours <= 0) return null;
          const pct = stage.hours / targetHours;
          const angle = pct * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const passed = elapsedHours >= stage.hours;
          const isActive = activeStage.id === stage.id;
          return (
            <div
              key={stage.id}
              className={`absolute flex items-center justify-center rounded-full text-sm font-semibold transition ${
                isActive
                  ? 'bg-accent-500 text-white shadow-lg scale-110'
                  : passed
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                    : 'bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
              }`}
              style={{
                width: markerSize,
                height: markerSize,
                left: x - markerSize / 2,
                top: y - markerSize / 2
              }}
            >
              <span className="text-base leading-none">{stage.emoji}</span>
            </div>
          );
        })}

        <div
          className="absolute text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow"
          style={{
            width: markerSize + 8,
            height: markerSize + 8,
            left: cx + radius - (markerSize + 8) / 3,
            top: cy - (markerSize + 8) / 2
          }}
        >
          {targetHours}
        </div>

        <div className="absolute inset-0 flex items-center justify-center text-center px-6 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
};
