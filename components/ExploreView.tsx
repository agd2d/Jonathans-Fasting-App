import React, { useState } from 'react';
import { EXAMPLE_MEALS, EXPERT_TIPS, FAST_STAGES, PROTOCOLS } from '../constants';
import { Icons } from './Icons';

export const ExploreView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'stages' | 'meals' | 'tips'>('all');

  return (
    <div className="pb-32 px-4 pt-4 animate-fadein">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white display-title">
          Explore
        </h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Lær mere om faste, find inspiration og få ekspertråd.
      </p>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">
        {(
          [
            { id: 'all', label: 'Alle' },
            { id: 'stages', label: 'Faser' },
            { id: 'meals', label: 'Måltider' },
            { id: 'tips', label: 'Råd' }
          ] as const
        ).map((chip) => (
          <button
            key={chip.id}
            onClick={() => setFilter(chip.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap ${
              filter === chip.id
                ? 'bg-brand-800 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Hero card */}
      {filter === 'all' && (
        <div className="relative bg-gradient-to-br from-accent-500 to-brand-800 rounded-2xl p-5 text-white mb-4 hero-grain overflow-hidden">
          <div className="relative">
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">
              Guide
            </div>
            <h2 className="display-title text-2xl mt-1">
              Din krop under en 16-timers faste
            </h2>
            <p className="text-sm opacity-90 mt-2">
              Se præcis hvad der sker inde i dig — fra anabolisk til ketose.
            </p>
            <button
              onClick={() => setFilter('stages')}
              className="mt-4 bg-white text-brand-800 font-bold px-5 py-2 rounded-full text-sm"
            >
              Læs mere
            </button>
          </div>
        </div>
      )}

      {/* Stages */}
      {(filter === 'all' || filter === 'stages') && (
        <section className="mb-6">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
            Fastens faser
          </h3>
          <div className="space-y-2">
            {FAST_STAGES.map((stage) => (
              <div
                key={stage.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm flex items-start gap-3"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${stage.color}22`, color: stage.color }}
                >
                  {stage.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {stage.title}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      fra {stage.hours}t
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Protocols */}
      {filter === 'all' && (
        <section className="mb-6">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
            Faste-protokoller
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {PROTOCOLS.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm"
              >
                <div className="font-extrabold text-xl text-slate-900 dark:text-white">
                  {p.name}
                </div>
                <div className="text-xs text-brand-800 dark:text-brand-300 font-bold mt-1">
                  {p.difficulty}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Example meals */}
      {(filter === 'all' || filter === 'meals') && (
        <section className="mb-6">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
            Proteinrige måltider
          </h3>
          <div className="space-y-2">
            {EXAMPLE_MEALS.map((meal) => (
              <div
                key={meal.name}
                className="bg-white dark:bg-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-sm"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-300 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center text-2xl flex-shrink-0">
                  {meal.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {meal.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {meal.proteinG}g protein · {meal.calories} kcal
                  </div>
                </div>
                <Icons.ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Expert tips */}
      {(filter === 'all' || filter === 'tips') && (
        <section className="mb-6">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
            Ekspertråd
          </h3>
          <div className="space-y-2">
            {EXPERT_TIPS.map((tip, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm flex gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex-shrink-0 flex items-center justify-center text-xl font-extrabold text-brand-900">
                  N
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-brand-800 dark:text-brand-300 uppercase tracking-wider">
                    Tip
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {tip.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {tip.body}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                    — {tip.expert}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
