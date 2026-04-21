import React, { useEffect, useMemo, useState } from 'react';
import { FastProtocol, FastSession, MealLog, UserProfile, WaterLog } from '../types';
import { CircularProgress } from './CircularProgress';
import { Icons } from './Icons';
import { ProteinScoreGauge } from './ProteinScoreGauge';
import { WeekStrip } from './WeekStrip';
import { EXAMPLE_MEALS, EXPERT_TIPS } from '../constants';
import {
  MS_PER_HOUR,
  caloriesForDay,
  formatDayAndClock,
  formatDuration,
  formatHoursMinutes,
  getCurrentStage,
  getMotivationalQuote,
  proteinForDay,
  proteinScore,
  proteinScoreLabel,
  todayIso,
  waterForDay
} from '../utils';

interface Props {
  profile: UserProfile;
  activeSession: FastSession | null;
  selectedProtocol: FastProtocol;
  sessions: FastSession[];
  meals: MealLog[];
  waterLogs: WaterLog[];
  onOpenProtocolPicker: () => void;
  onStartFast: () => void;
  onStopFast: () => void;
  onAdjustStartTime: (newStart: number) => void;
  onAdjustGoalHours: (newHours: number) => void;
  onOpenMealLogger: () => void;
  onAddWater: (ml: number) => void;
  onRemoveWater: (ml: number) => void;
  onDeleteMeal: (id: string) => void;
}

export const TodayView: React.FC<Props> = ({
  profile,
  activeSession,
  selectedProtocol,
  sessions,
  meals,
  waterLogs,
  onOpenProtocolPicker,
  onStartFast,
  onStopFast,
  onAdjustStartTime,
  onAdjustGoalHours,
  onOpenMealLogger,
  onAddWater,
  onRemoveWater,
  onDeleteMeal
}) => {
  const [now, setNow] = useState(() => Date.now());
  const [editingStart, setEditingStart] = useState(false);
  const [tempStart, setTempStart] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('');

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const today = todayIso();
  const elapsedMs = activeSession ? now - activeSession.startTime : 0;
  const targetMs = activeSession
    ? activeSession.targetHours * MS_PER_HOUR
    : selectedProtocol.fastHours * MS_PER_HOUR;
  const progress = activeSession ? elapsedMs / targetMs : 0;
  const timeLeftMs = Math.max(0, targetMs - elapsedMs);
  const goalReached = activeSession ? elapsedMs >= targetMs : false;
  const pctRemaining = activeSession ? Math.max(0, Math.round((timeLeftMs / targetMs) * 100)) : 100;
  const { h, m, s } = formatDuration(timeLeftMs);
  const elapsed = formatDuration(elapsedMs);

  const currentStage = useMemo(() => getCurrentStage(elapsedMs), [elapsedMs]);

  const dayProtein = proteinForDay(meals, today);
  const dayCalories = caloriesForDay(meals, today);
  const score = proteinScore(dayProtein, dayCalories);
  const dayWater = waterForDay(waterLogs, today);

  const todaysMeals = meals
    .filter((m) => m.date === today)
    .sort((a, b) => b.time.localeCompare(a.time));

  const expertTip = useMemo(() => EXPERT_TIPS[new Date().getDate() % EXPERT_TIPS.length], []);
  const quote = useMemo(
    () => getMotivationalQuote(activeSession ? activeSession.startTime : selectedProtocol.fastHours),
    [activeSession, selectedProtocol.fastHours]
  );

  const goalTime = activeSession ? activeSession.startTime + targetMs : null;

  const handleSaveStart = () => {
    if (!tempStart || !activeSession) {
      setEditingStart(false);
      return;
    }
    const [hh, mm] = tempStart.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) {
      setEditingStart(false);
      return;
    }
    const current = new Date(activeSession.startTime);
    current.setHours(hh, mm, 0, 0);
    let newTs = current.getTime();
    if (newTs > Date.now()) newTs -= 24 * 60 * 60 * 1000;
    onAdjustStartTime(newTs);
    setEditingStart(false);
  };

  const handleSaveGoal = () => {
    const hrs = Number(tempGoal);
    if (isNaN(hrs) || hrs < 1 || hrs > 96) {
      setEditingGoal(false);
      return;
    }
    onAdjustGoalHours(hrs);
    setEditingGoal(false);
  };

  return (
    <div className="pb-32 px-4 pt-3 animate-fadein space-y-4">
      {/* Top header */}
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <button
          onClick={onOpenProtocolPicker}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 active:scale-95"
          aria-label="Vælg protokol"
        >
          <Icons.Check className="w-5 h-5" />
        </button>
        <h2 className="text-center font-bold text-slate-900 dark:text-white">
          {activeSession ? "You're fasting!" : 'Klar til at faste?'}
        </h2>
        <button
          onClick={onOpenMealLogger}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-brand-800 active:scale-95"
          aria-label="Log måltid"
        >
          <Icons.Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Week strip */}
      <WeekStrip sessions={sessions} activeStart={activeSession?.startTime || null} />

      {/* Main timer card */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex justify-center">
          <div className={activeSession && !goalReached ? 'pulse-ring rounded-full' : ''}>
            <CircularProgress
              size={300}
              stroke={18}
              progress={activeSession ? progress : 0}
              activeStage={currentStage}
              targetHours={activeSession ? activeSession.targetHours : selectedProtocol.fastHours}
              elapsedMs={elapsedMs}
            >
              <div className="flex flex-col items-center">
                {activeSession ? (
                  <>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {goalReached ? 'Mål nået!' : `Tilbage (${pctRemaining}%)`}
                    </div>
                    <div className="text-[40px] leading-none font-extrabold tabular-nums text-slate-900 dark:text-white mt-1">
                      {goalReached ? `${elapsed.h}:${elapsed.m}:${elapsed.s}` : `${h}:${m}:${s}`}
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 bg-brand-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full">
                      <span className="text-accent-500 text-sm">{currentStage.emoji}</span>
                      <span className="text-xs font-bold text-brand-800 dark:text-brand-300">
                        {currentStage.title}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Protokol
                    </div>
                    <button
                      onClick={onOpenProtocolPicker}
                      className="text-5xl font-extrabold text-slate-900 dark:text-white leading-none active:scale-95"
                    >
                      {selectedProtocol.name}
                    </button>
                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 px-4">
                      {selectedProtocol.description}
                    </div>
                  </>
                )}
              </div>
            </CircularProgress>
          </div>
        </div>

        {/* Started / Goal */}
        {activeSession && goalTime && (
          <div className="grid grid-cols-2 gap-4 mt-6 text-center">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Started</div>
              {editingStart ? (
                <div className="flex gap-1 items-center justify-center mt-1">
                  <input
                    type="time"
                    autoFocus
                    className="bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1 text-sm"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                  />
                  <button onClick={handleSaveStart} className="text-brand-800 p-1">
                    <Icons.Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatDayAndClock(activeSession.startTime)}
                  </div>
                  <button
                    onClick={() => {
                      setTempStart(new Date(activeSession.startTime).toTimeString().slice(0, 5));
                      setEditingStart(true);
                    }}
                    className="text-xs text-brand-800 dark:text-brand-300 font-semibold mt-0.5"
                  >
                    Edit Start
                  </button>
                </>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goal</div>
              {editingGoal ? (
                <div className="flex gap-1 items-center justify-center mt-1">
                  <input
                    type="number"
                    autoFocus
                    className="bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1 text-sm w-16"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    min={1}
                    max={96}
                  />
                  <span className="text-sm">t</span>
                  <button onClick={handleSaveGoal} className="text-brand-800 p-1">
                    <Icons.Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatDayAndClock(goalTime)}
                  </div>
                  <button
                    onClick={() => {
                      setTempGoal(String(activeSession.targetHours));
                      setEditingGoal(true);
                    }}
                    className="text-xs text-brand-800 dark:text-brand-300 font-semibold mt-0.5"
                  >
                    Edit {activeSession.targetHours}h Goal
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Start / End button */}
        <div className="mt-5 flex justify-center">
          {activeSession ? (
            <button
              onClick={onStopFast}
              className="bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 font-bold px-12 py-3.5 rounded-full active:scale-[0.98]"
            >
              End Fast
            </button>
          ) : (
            <button
              onClick={onStartFast}
              className="bg-brand-800 text-white font-bold px-12 py-3.5 rounded-full active:scale-[0.98] shadow-lg shadow-brand-800/30"
            >
              Start faste
            </button>
          )}
        </div>
      </section>

      {/* Add to your day */}
      <button
        onClick={onOpenMealLogger}
        className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.99]"
      >
        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-800">
          <Icons.Plus className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <div className="text-left flex-1">
          <div className="font-bold text-slate-900 dark:text-white">Tilføj til din dag</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Måltider, aktivitet, søvn eller mere
          </div>
        </div>
        <Icons.ChevronRight className="w-5 h-5 text-slate-400" />
      </button>

      {/* Protein Score */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-center">
          <ProteinScoreGauge score={score} />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 text-center mt-3 leading-relaxed">
          {dayCalories === 0
            ? 'Du har ikke logget noget mad i dag. Tilføj det du har spist, så beregner vi din score og giver dig feedback.'
            : proteinScoreLabel(score)}
        </p>
        <div className="flex justify-center mt-4">
          <button
            onClick={onOpenMealLogger}
            className="bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 font-bold px-6 py-2.5 rounded-full text-sm active:scale-95"
          >
            Tilføj måltid
          </button>
        </div>
      </section>

      {/* Macros */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
          <div className="pr-4 text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Protein</div>
            <div className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {Math.round(dayProtein)}<span className="text-slate-400">/{profile.dailyProteinG}</span>
              <span className="text-lg text-slate-400">g</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (dayProtein / profile.dailyProteinG) * 100)}%` }}
              />
            </div>
          </div>
          <div className="pl-4 text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Kalorier</div>
            <div className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {Math.round(dayCalories)}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {todaysMeals.length} måltid{todaysMeals.length === 1 ? '' : 'er'} i dag
            </div>
          </div>
        </div>
      </section>

      {/* Water */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">Vand</div>
          <Icons.Info className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-center mt-2">
          <span className="text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {dayWater}
          </span>
          <span className="text-xl text-slate-400 font-bold">ml</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => onRemoveWater(250)}
            className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 active:scale-95"
          >
            <Icons.Minus className="w-5 h-5" />
          </button>
          <div className="flex-1 h-10 rounded-full bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-sky-500 transition-all"
              style={{ width: `${Math.min(100, (dayWater / profile.dailyWaterMl) * 100)}%` }}
            />
          </div>
          <button
            onClick={() => onAddWater(250)}
            className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 active:scale-95"
          >
            <Icons.Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>0ml</span>
          <span>{profile.dailyWaterMl}ml</span>
        </div>
      </section>

      {/* Meals */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white">Dagens måltider</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {todaysMeals.length} i dag
          </span>
        </div>
        {todaysMeals.length === 0 ? (
          <div className="text-center py-6">
            {/* Illustrative meal card stack */}
            <div className="relative w-full max-w-xs mx-auto mb-4">
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-3 flex items-center gap-3 opacity-40 mb-2 translate-y-2 scale-95">
                <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow border border-slate-200 dark:border-slate-700">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-200 to-orange-400 flex items-center justify-center text-xl">
                  🍗
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Grilled Chicken with Quinoa
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    45g protein · 520 kcal
                  </div>
                </div>
              </div>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Log dine måltider</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3 px-4">
              Log hvad du spiser i dag, så vi kan tracke og beregne dit protein-indtag.
            </p>
            <button
              onClick={onOpenMealLogger}
              className="bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 font-bold px-6 py-2.5 rounded-full text-sm active:scale-95"
            >
              Log mad
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todaysMeals.map((meal) => {
              const emoji = EXAMPLE_MEALS.find((e) => e.name === meal.name)?.emoji || '🍽️';
              return (
                <div
                  key={meal.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl"
                >
                  <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-amber-100 to-orange-300 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center text-xl flex-shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {meal.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {meal.proteinG}g protein · {meal.calories} kcal · {meal.time}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Expert tip */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex-shrink-0 flex items-center justify-center text-xl font-extrabold text-brand-900">
            N
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-brand-800 dark:text-brand-300 uppercase tracking-wider">
              Expert tip
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">{expertTip.title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {expertTip.body}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
              — {expertTip.expert}
            </p>
          </div>
        </div>
      </section>

      {/* Motivational when idle */}
      {!activeSession && (
        <div className="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-900/40 rounded-2xl p-5 text-center">
          <Icons.Zap className="w-6 h-6 text-brand-800 dark:text-brand-300 mx-auto mb-2" />
          <p className="text-sm italic text-slate-700 dark:text-slate-200 leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};
