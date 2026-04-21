import React from 'react';
import { TabId } from '../types';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const ItemIcon: React.FC<{ id: TabId; active: boolean }> = ({ id, active }) => {
  const color = active ? '#FF4E2B' : '#94a3b8';
  const size = 26;
  if (id === 'today') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2.5" />
        {active && <circle cx="12" cy="12" r="3" fill={color} />}
      </svg>
    );
  }
  if (id === 'explore') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <polygon
          points="16 8 14 14 8 16 10 10"
          fill={color}
        />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};

const items: { id: TabId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'explore', label: 'Explore' },
  { id: 'me', label: 'Me' }
];

export const BottomNav: React.FC<Props> = ({ active, onChange }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 safe-bottom z-40">
    <div className="w-full grid grid-cols-3">
      {items.map((it) => {
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className="py-2.5 flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <ItemIcon id={it.id} active={isActive} />
            <span
              className={`text-[11px] font-bold ${
                isActive ? 'text-accent-500' : 'text-slate-400'
              }`}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);
