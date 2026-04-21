import React, { useState } from 'react';
import { EXAMPLE_MEALS } from '../constants';
import { Icons } from './Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (meal: { name: string; proteinG: number; calories: number }) => void;
}

export const MealLoggerModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [protein, setProtein] = useState('');
  const [calories, setCalories] = useState('');

  if (!open) return null;

  const handleSave = () => {
    const p = parseFloat(protein.replace(',', '.'));
    const c = parseFloat(calories.replace(',', '.'));
    if (!name.trim() || isNaN(p) || isNaN(c)) return;
    onSave({ name: name.trim(), proteinG: p, calories: c });
    setName('');
    setProtein('');
    setCalories('');
    onClose();
  };

  const handlePickPreset = (meal: typeof EXAMPLE_MEALS[number]) => {
    setName(meal.name);
    setProtein(String(meal.proteinG));
    setCalories(String(meal.calories));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fadein">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-slate-900 px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Log a meal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vi beregner protein og kalorier.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Navn
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="fx. Kyllingesalat"
              className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Protein (g)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Kalorier
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Hurtige forslag
            </div>
            <div className="space-y-2">
              {EXAMPLE_MEALS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => handlePickPreset(m)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-left active:scale-[0.99] transition"
                >
                  <div className="text-2xl">{m.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {m.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {m.proteinG}g protein · {m.calories} kcal
                    </div>
                  </div>
                  <Icons.ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim() || !protein || !calories}
            className="w-full bg-brand-800 text-white font-bold py-4 rounded-full disabled:opacity-40 active:scale-[0.98] shadow-lg shadow-brand-800/30"
          >
            Log måltid
          </button>
        </div>
      </div>
    </div>
  );
};
