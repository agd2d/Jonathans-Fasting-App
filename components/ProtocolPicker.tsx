import React, { useState } from 'react';
import { FastProtocol } from '../types';
import { PROTOCOLS } from '../constants';
import { Icons } from './Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string, customHours?: number) => void;
  disabled?: boolean;
}

const difficultyColor: Record<FastProtocol['difficulty'], string> = {
  Begynder: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Øvet: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  Erfaren: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Ekspert: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
};

export const ProtocolPicker: React.FC<Props> = ({ open, onClose, selectedId, onSelect, disabled }) => {
  const [customHours, setCustomHours] = useState(16);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fadein">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-slate-900 px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vælg protokol</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hvor længe vil du faste?
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {disabled && (
          <div className="mx-5 mt-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl p-3 text-sm flex items-start gap-2">
            <Icons.Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Du kan ikke skifte protokol under en aktiv faste.</span>
          </div>
        )}

        <div className="p-5 space-y-3">
          {PROTOCOLS.map((p) => {
            const active = p.id === selectedId;
            return (
              <button
                key={p.id}
                disabled={disabled}
                onClick={() => {
                  onSelect(p.id);
                  onClose();
                }}
                className={`w-full text-left rounded-2xl p-4 border-2 transition active:scale-[0.99] ${
                  active
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {p.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${difficultyColor[p.difficulty]}`}
                      >
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{p.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Icons.Timer className="w-3.5 h-3.5" />
                        {p.fastHours}t faste
                      </span>
                      <span className="flex items-center gap-1">
                        <Icons.Flame className="w-3.5 h-3.5" />
                        {p.eatHours}t spise
                      </span>
                    </div>
                  </div>
                  {active && (
                    <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                      <Icons.Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Custom */}
          <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Tilpasset</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Vælg dit eget antal timer
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={disabled}
                  onClick={() => setCustomHours((h) => Math.max(1, h - 1))}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95"
                >
                  <Icons.Minus className="w-4 h-4" />
                </button>
                <span className="w-14 text-center font-extrabold text-lg tabular-nums">
                  {customHours}t
                </span>
                <button
                  disabled={disabled}
                  onClick={() => setCustomHours((h) => Math.min(96, h + 1))}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95"
                >
                  <Icons.Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              disabled={disabled}
              onClick={() => {
                onSelect('custom', customHours);
                onClose();
              }}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-2.5 rounded-xl active:scale-[0.98] disabled:opacity-50"
            >
              Brug tilpasset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
