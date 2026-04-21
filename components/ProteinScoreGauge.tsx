import React from 'react';

interface Props {
  score: number; // 0..100
  size?: number;
}

/** Halvcirkel-gauge til protein score. */
export const ProteinScoreGauge: React.FC<Props> = ({ score, size = 220 }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = Math.PI * radius;
  const offset = circ * (1 - clamped / 100);

  const color = clamped >= 90 ? '#22c55e' : clamped >= 60 ? '#84cc16' : clamped >= 30 ? '#f59e0b' : '#9ca3af';

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 24 }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
        <div className="text-5xl font-extrabold text-slate-900 dark:text-white leading-none">
          {Math.round(clamped)}
        </div>
        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">Protein Score</div>
      </div>
    </div>
  );
};
