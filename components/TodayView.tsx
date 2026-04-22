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
    <div className="pb-32 px-4 pt-4 animate-fadein space-y-5">
      {/* Top header */}
      <div className="grid grid-cols-[48px_1fr_48px] items-center">
        <button
          onClick={onOpenProtocolPicker}
          className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 active:scale-95"
          aria-label="Vælg protokol"
        >
          <Icons.Check className="w-6 h-6" />
        </button>
        <h2 className="text-center font-extrabold text-lg text-slate-900 dark:text-white">
          {activeSession ? "You're fasting!" : 'Klar til at faste?'}
        </h2>
        <button
          onClick={onOpenMealLogger}
          className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-brand-800 active:scale-95"
          aria-label="Log måltid"
        >
          <Icons.Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>

      {/* Week strip */}
      <WeekStrip sessions={sessions} activeStart={activeSession?.startTime || null} />

      {/* Main timer card */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 pb-10 shadow-sm">
        <div className="flex justify-center">
          <div className={activeSession && !goalReached ? 'pulse-ring rounded-full w-full' : 'w-full'}>
            <CircularProgress
              size={480}
              stroke={22}
              progress={activeSession ? progress : 0}
              activeStage={currentStage}
              targetHours={activeSession ? activeSession.targetHours : selectedProtocol.fastHours}
              elapsedMs={elapsedMs}
            >
              <div className="flex flex-col items-center">
                {activeSession ? (
                  <>
                    <div className="text-lg text-slate-500 dark:text-slate-400 font-semibold">
                      {goalReached ? 'Mål nået!' : `Tilbage (${pctRemaining}%)`}
                    </div>
                    <div className="text-[clamp(44px,15vw,72px)] leading-none font-extrabold tabular-nums text-slate-900 dark:text-white mt-3 whitespace-nowrap">
                      {goalReached ? `${elapsed.h}:${elapsed.m}:${elapsed.s}` : `${h}:${m}:${s}`}
                    </div>
                    <div className="mt-4 flex items-center gap-2 bg-brand-50 dark:bg-slate-900/50 px-5 py-2.5 rounded-full">
                      <span className="text-accent-500 text-lg">{currentStage.emoji}</span>
                      <span className="text-base font-extrabold text-brand-800 dark:text-brand-300">
                        {currentStage.title}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-base font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                      Protokol
                    </div>
                    <button
                      onClick={onOpenProtocolPicker}
                      className="text-[clamp(52px,18vw,80px)] font-extrabold text-slate-900 dark:text-white leading-none active:scale-95"
                    >
                      {selectedProtocol.name}
                    </button>
                    <div className="mt-4 text-base text-slate-500 dark:text-slate-400 px-4">
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
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Started</div>
              {editingStart ? (
                <div className="flex gap-1 items-center justify-center mt-1">
                  <input
                    type="time"
                    autoFocus
                    className="bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1 text-base"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                  />
                  <button onClick={handleSaveStart} className="text-brand-800 p-1">
                    <Icons.Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatDayAndClock(activeSession.startTime)}
                  </div>
                  <button
                    onClick={() => {
                      setTempStart(new Date(activeSession.startTime).toTimeString().slice(0, 5));
                      setEditingStart(true);
                    }}
                    className="text-sm text-brand-800 dark:text-brand-300 font-bold mt-1"
                  >
                    Edit Start
                  </button>
                </>
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Goal</div>
              {editingGoal ? (
                <div className="flex gap-1 items-center justify-center mt-1">
                  <input
                    type="number"
                    autoFocus
                    className="bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1 text-base w-16"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    min={1}
                    max={96}
                  />
                  <span className="text-base">t</span>
                  <button onClick={handleSaveGoal} className="text-brand-800 p-1">
                    <Icons.Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatDayAndClock(goalTime)}
                  </div>
                  <button
                    onClick={() => {
                      setTempGoal(String(activeSession.targetHours));
                      setEditingGoal(true);
                    }}
                    className="text-sm text-brand-800 dark:text-brand-300 font-bold mt-1"
                  >
                    Edit {activeSession.targetHours}h Goal
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Start / End button */}
        <div className="mt-6 flex justify-center">
          {activeSession ? (
            <button
              onClick={onStopFast}
              className="bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 font-extrabold text-lg px-14 py-4 rounded-full active:scale-[0.98]"
            >
              End Fast
            </button>
          ) : (
            <button
              onClick={onStartFast}
              className="bg-brand-800 text-white font-extrabold text-lg px-14 py-4 rounded-full active:scale-[0.98] shadow-lg shadow-brand-800/30"
            >
              Start faste
            </button>
          )}
        </div>
      </section>

      {/* Add to your day */}
      <button
        onClick={onOpenMealLogger}
        className="w-full bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm flex items-center gap-5 active:scale-[0.99]"
      >
        <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-800 flex-shrink-0">
          <Icons.Plus className="w-8 h-8" strokeWidth={2.5} />
        </div>
        <div className="text-left flex-1">
          <div className="font-extrabold text-2xl text-slate-900 dark:text-white">Tilføj til din dag</div>
          <div className="text-base text-slate-500 dark:text-slate-400 mt-1">
            Måltider, aktivitet, søvn eller mere
          </div>
        </div>
        <Icons.ChevronRight className="w-7 h-7 text-slate-400" />
      </button>

      {/* Protein Score */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-center">
          <ProteinScoreGauge score={score} size={300} />
        </div>
        <p className="text-base text-slate-600 dark:text-slate-300 text-center mt-6 leading-relaxed">
          {dayCalories === 0
            ? 'Du har ikke logget noget mad i dag. Tilføj det du har spist, så beregner vi din score og giver dig feedback.'
            : proteinScoreLabel(score)}
        </p>
        <div className="flex justify-center mt-6">
          <button
            onClick={onOpenMealLogger}
            className="bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 font-extrabold px-8 py-3.5 rounded-full text-base active:scale-95"
          >
            Tilføj måltid
          </button>
        </div>
      </section>

      {/* Macros */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
          <div className="pr-4 text-center">
            <div className="text-lg font-semibold text-slate-500 dark:text-slate-400">Protein</div>
            <div className="mt-3 text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {Math.round(dayProtein)}<span className="text-slate-400">/{profile.dailyProteinG}</span>
              <span className="text-2xl text-slate-400">g</span>
            </div>
            <div className="mt-4 h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (dayProtein / profile.dailyProteinG) * 100)}%` }}
              />
            </div>
          </div>
          <div className="pl-4 text-center">
            <div className="text-lg font-semibold text-slate-500 dark:text-slate-400">Kalorier</div>
            <div className="mt-3 text-5xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {Math.round(dayCalories)}
            </div>
            <div className="mt-4 text-base text-slate-400">
              {todaysMeals.length} måltid{todaysMeals.length === 1 ? '' : 'er'} i dag
            </div>
          </div>
        </div>
      </section>

      {/* Water */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-slate-500 dark:text-slate-400">Vand</div>
          <Icons.Info className="w-6 h-6 text-slate-400" />
        </div>
        <div className="text-center mt-4">
          <span className="text-7xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {dayWater}
          </span>
          <span className="text-3xl text-slate-400 font-bold">ml</span>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={() => onRemoveWater(250)}
            className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 active:scale-95 flex-shrink-0"
          >
            <Icons.Minus className="w-7 h-7" />
          </button>
          <div className="flex-1 h-14 rounded-full bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-sky-500 transition-all"
              style={{ width: `${Math.min(100, (dayWater / profile.dailyWaterMl) * 100)}%` }}
            />
          </div>
          <button
            onClick={() => onAddWater(250)}
            className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 active:scale-95 flex-shrink-0"
          >
            <Icons.Plus className="w-7 h-7" />
          </button>
        </div>
        <div className="mt-3 flex justify-between text-base font-semibold text-slate-400">
          <span>0ml</span>
          <span>{profile.dailyWaterMl}ml</span>
        </div>
      </section>

      {/* Meals */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white">Dagens måltider</h3>
          <span className="text-base font-semibold text-slate-500 dark:text-slate-400">
            {todaysMeals.length} i dag
          </span>
        </div>
        {todaysMeals.length === 0 ? (
          <div className="text-center py-8">
            {/* Illustrative meal card stack */}
            <div className="relative w-full max-w-sm mx-auto mb-6">
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 flex items-center gap-4 opacity-40 mb-3 translate-y-2 scale-95">
                <div className="h-14 w-14 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow border border-slate-200 dark:border-slate-700">
                <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-amber-200 to-orange-400 flex items-center justify-center text-2xl">
                  🍗
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-base text-slate-900 dark:text-white">
                    Grilled Chicken with Quinoa
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    45g protein · 520 kcal
                  </div>
                </div>
              </div>
            </div>
            <h4 className="font-extrabold text-xl text-slate-900 dark:text-white">Log dine måltider</h4>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2 mb-5 px-2">
              Log hvad du spiser i dag, så vi kan tracke og beregne dit protein-indtag.
            </p>
            <button
              onClick={onOpenMealLogger}
              className="bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 font-extrabold px-8 py-3.5 rounded-full text-base active:scale-95"
            >
              Log mad
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysMeals.map((meal) => {
              const emoji = EXAMPLE_MEALS.find((e) => e.name === meal.name)?.emoji || '🍽️';
              return (
                <div
                  key={meal.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl"
                >
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-amber-100 to-orange-300 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center text-2xl flex-shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {meal.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {meal.proteinG}g protein · {meal.calories} kcal · {meal.time}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="text-slate-400 hover:text-red-500 p-2"
                  >
                    <Icons.Trash className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Expert tip */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex-shrink-0 flex items-center justify-center text-2xl font-extrabold text-brand-900">
            N
          </div>
          <div className="flex-1">
            <div className="text-sm font-extrabold text-brand-800 dark:text-brand-300 uppercase tracking-wider">
              Expert tip
            </div>
            <h4 className="font-extrabold text-xl text-slate-900 dark:text-white mt-1">{expertTip.title}</h4>
            <p className="text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {expertTip.body}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 italic">
              — {expertTip.expert}
            </p>
          </div>
        </div>
      </section>

      {/* Motivational when idle */}
      {!activeSession && (
        <div className="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-900/40 rounded-2xl p-8 text-center">
          <Icons.Zap className="w-8 h-8 text-brand-800 dark:text-brand-300 mx-auto mb-3" />
          <p className="text-lg italic text-slate-700 dark:text-slate-200 leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};
