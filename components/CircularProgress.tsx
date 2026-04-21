import React from 'react';
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
 */
export const CircularProgress: React.FC<Props> = ({
  size = 300,
  stroke = 18,
  progress,
  activeStage,
  targetHours,
  elapsedMs,
  children
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);
  const cx = size / 2;
  const cy = size / 2;

  // Vælg kun stages der er inden for målet (plus slut-stage)
  const visibleStages = FAST_STAGES.filter((s) => s.hours <= targetHours);

  const elapsedHours = elapsedMs / MS_PER_HOUR;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={radius} stroke="#f1f5f9" strokeWidth={stroke} fill="transparent" />
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

      {/* Stage markers along the ring */}
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
                  ? 'bg-white text-slate-900 border border-slate-200'
                  : 'bg-white text-slate-400 border border-slate-200'
            }`}
            style={{
              width: 32,
              height: 32,
              left: x - 16,
              top: y - 16
            }}
          >
            <span className="text-base leading-none">{stage.emoji}</span>
          </div>
        );
      })}

      {/* Hour marker (end-goal label on right) */}
      <div
        className="absolute text-xs font-bold text-slate-700 bg-slate-100 rounded-full w-10 h-10 flex items-center justify-center border-2 border-white shadow"
        style={{
          left: cx + radius - 10,
          top: cy - 20
        }}
      >
        {targetHours}
      </div>

      {/* Lightning bolt indicating active state on opposite side */}
      <div
        className="absolute text-slate-400"
        style={{
          left: cx + radius - 24,
          top: cy + 4
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center text-center px-6 pt-2">
        {children}
      </div>
    </div>
  );
};
