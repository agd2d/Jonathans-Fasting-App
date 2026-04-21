import React, { useMemo, useState } from 'react';
import {
  FastSession,
  MealLog,
  ThemePreference,
  UserProfile,
  WaterLog,
  WeightLog
} from '../types';
import {
  MS_PER_HOUR,
  averageFastHours,
  caloriesForDay,
  computeStreak,
  formatClock,
  formatDate,
  formatHoursMinutes,
  isoFromDate,
  longestFastHours,
  longestStreak,
  proteinForDay,
  totalFastedMs,
  waterForDay
} from '../utils';
import { Icons } from './Icons';

interface Props {
  profile: UserProfile;
  sessions: FastSession[];
  meals: MealLog[];
  waterLogs: WaterLog[];
  weightLogs: WeightLog[];
  onUpdate: (updates: Partial<UserProfile>) => void;
  onDeleteSession: (id: string) => void;
  onAddWeight: (weightKg: number, date: string) => void;
  onDeleteWeight: (id: string) => void;
  onResetAll: () => void;
}

export const MeView: React.FC<Props> = ({
  profile,
  sessions,
  meals,
  waterLogs,
  weightLogs,
  onUpdate,
  onDeleteSession,
  onAddWeight,
  onDeleteWeight,
  onResetAll
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [metricsTab, setMetricsTab] = useState<'weight' | 'protein' | 'water'>('weight');

  const finished = useMemo(() => sessions.filter((s) => s.endTime), [sessions]);
  const completedCount = finished.length;
  const avg = averageFastHours(finished);
  const longestHours = longestFastHours(finished);
  const streak = computeStreak(finished);
  const longest = longestStreak(finished);
  const totalHours = totalFastedMs(finished) / MS_PER_HOUR;

  // Calendar for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const fastedDays = useMemo(() => {
    const set = new Set<number>();
    finished.forEach((s) => {
      if (s.endTime) {
        const d = new Date(s.endTime);
        if (d.getFullYear() === year && d.getMonth() === month) set.add(d.getDate());
      }
    });
    return set;
  }, [finished, year, month]);

  const proteinDays = useMemo(() => {
    const set = new Set<number>();
    meals.forEach((m) => {
      const d = new Date(m.date);
      if (d.getFullYear() === year && d.getMonth() === month) set.add(d.getDate());
    });
    return set;
  }, [meals, year, month]);

  const waterDays = useMemo(() => {
    const set = new Set<number>();
    waterLogs.forEach((w) => {
      const d = new Date(w.date);
      if (d.getFullYear() === year && d.getMonth() === month && w.ml > 0) set.add(d.getDate());
    });
    return set;
  }, [waterLogs, year, month]);

  // Weekly averages
  const weekIsos = useMemo(() => {
    const res: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      res.push(isoFromDate(d));
    }
    return res;
  }, []);

  const avgCalories = useMemo(() => {
    const total = weekIsos.reduce((acc, iso) => acc + caloriesForDay(meals, iso), 0);
    return Math.round(total / 7);
  }, [meals, weekIsos]);

  const avgProtein = useMemo(() => {
    const total = weekIsos.reduce((acc, iso) => acc + proteinForDay(meals, iso), 0);
    return Math.round(total / 7);
  }, [meals, weekIsos]);

  const avgWater = useMemo(() => {
    const total = weekIsos.reduce((acc, iso) => acc + waterForDay(waterLogs, iso), 0);
    return Math.round(total / 7);
  }, [waterLogs, weekIsos]);

  const avgFastMs = useMemo(() => {
    const weekSessions = finished.filter(
      (s) => s.endTime && weekIsos.includes(isoFromDate(new Date(s.endTime)))
    );
    if (weekSessions.length === 0) return 0;
    return (
      weekSessions.reduce((acc, s) => acc + ((s.endTime || 0) - s.startTime), 0) /
      weekSessions.length
    );
  }, [finished, weekIsos]);

  const avgFatBurningMs = useMemo(() => {
    const fatBurnThreshold = 12 * MS_PER_HOUR;
    const weekSessions = finished.filter(
      (s) => s.endTime && weekIsos.includes(isoFromDate(new Date(s.endTime)))
    );
    const total = weekSessions.reduce((acc, s) => {
      const dur = (s.endTime || 0) - s.startTime;
      return acc + Math.max(0, dur - fatBurnThreshold);
    }, 0);
    if (weekSessions.length === 0) return 0;
    return total / weekSessions.length;
  }, [finished, weekIsos]);

  const currentWeight =
    [...weightLogs].sort((a, b) => (a.date < b.date ? 1 : -1))[0]?.weightKg ||
    profile.currentWeightKg;

  const handleAddWeight = () => {
    const w = parseFloat(weightInput.replace(',', '.'));
    if (isNaN(w) || w <= 0 || w > 400) return;
    onAddWeight(w, isoFromDate(new Date()));
    onUpdate({ currentWeightKg: w });
    setWeightInput('');
  };

  const themes: { id: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Lys', icon: <Icons.Sun className="w-4 h-4" /> },
    { id: 'dark', label: 'Mørk', icon: <Icons.Moon className="w-4 h-4" /> },
    { id: 'auto', label: 'Auto', icon: <Icons.Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="pb-32 px-4 pt-4 animate-fadein">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button className="w-10 h-10 rounded-full flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-300">
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="14" y1="18" y2="18" />
          </svg>
        </button>
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500"
        >
          <Icons.Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Profile hero */}
      <div className="flex flex-col items-center mt-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg">
            {(profile.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center border-2 border-slate-100">
            <Icons.Edit className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {profile.name || 'Bruger'}
          </h1>
          <span className="bg-accent-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            FASTE+
          </span>
        </div>
      </div>

      {/* Stat row */}
      <div className="mt-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700">
        <StatBlock label="Total faster" value={completedCount} />
        <StatBlock
          label="Milepæle"
          value={completedCount >= 10 ? Math.floor(completedCount / 5) : 0}
        />
        <StatBlock label="Længste streak" value={longest} />
      </div>

      {/* Calendar */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Kalender</h3>
          <button className="text-xs font-bold text-brand-800 dark:text-brand-300 tracking-wider">
            SE ALLE
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.slice(-14).map((d) => {
              const isToday = d === now.getDate();
              const hasFast = fastedDays.has(d);
              const hasProtein = proteinDays.has(d);
              const hasWater = waterDays.has(d);
              return (
                <div key={d} className="flex flex-col items-center gap-1">
                  <span
                    className={`text-xs ${
                      isToday
                        ? 'text-slate-900 dark:text-white font-extrabold'
                        : 'text-slate-400'
                    }`}
                  >
                    {d}
                  </span>
                  <div className="relative w-7 h-7">
                    <div className="w-7 h-7 rounded-full border-2 border-slate-200 dark:border-slate-700" />
                    {hasFast && (
                      <div className="absolute inset-0 rounded-full border-2 border-emerald-500" />
                    )}
                    {hasProtein && (
                      <div className="absolute top-[-3px] right-[-3px] w-2.5 h-2.5 rounded-full bg-pink-500" />
                    )}
                    {hasWater && (
                      <div className="absolute bottom-[-3px] left-[-3px] w-2.5 h-2.5 rounded-full bg-sky-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
            <Legend color="bg-emerald-500" label="Faste" />
            <Legend color="bg-pink-500" label="Protein" />
            <Legend color="bg-sky-500" label="Vand" />
            <Legend color="bg-purple-500" label="Søvn" />
            <Legend color="bg-orange-500" label="Restitution" />
          </div>
        </div>
      </section>

      {/* Weekly Metrics */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Ugens målinger</h3>
          <div className="flex items-center gap-1 text-brand-800 dark:text-brand-300 text-xs font-extrabold tracking-wider">
            <select
              value={profile.weightGoalDirection}
              onChange={(e) =>
                onUpdate({ weightGoalDirection: e.target.value as UserProfile['weightGoalDirection'] })
              }
              className="bg-transparent outline-none"
            >
              <option value="lose">VÆGTTAB</option>
              <option value="maintain">VEDLIGEHOLD</option>
              <option value="gain">TAG PÅ</option>
            </select>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-violet-200 dark:bg-violet-800 flex items-center justify-center text-xl">
              🔬
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 flex-1">
              Lær mere om vores tilgang til sund vægt.
            </p>
            <Icons.Info className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            <Metric
              label="Current Weight"
              value={currentWeight ? `${currentWeight.toFixed(1)}` : '—'}
              unit="kg"
            />
            <Metric label="Avg. kalorier" value={`${avgCalories}`} unit="kcal" />
            <Metric label="Avg. protein" value={`${avgProtein}`} unit="g" />
            <Metric
              label="Avg. vand"
              value={`${(avgWater / 1000).toFixed(1)}`}
              unit="L"
            />
            <Metric
              label="Avg. faste"
              value={formatHoursMinutes(avgFastMs)}
              unit=""
            />
            <Metric
              label="Avg. fedtforbr."
              value={formatHoursMinutes(avgFatBurningMs)}
              unit=""
            />
          </div>

          {/* Quick weight input */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="Log ny vægt (kg)"
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5"
              />
              <button
                onClick={handleAddWeight}
                disabled={!weightInput}
                className="bg-brand-800 text-white font-bold px-5 rounded-xl active:scale-95 disabled:opacity-40"
              >
                Gem
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Fasts history */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Faster</h3>
          <span className="text-xs font-bold text-slate-500">
            {streak > 0 && `🔥 ${streak} dag${streak === 1 ? '' : 'e'}`}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {finished.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Ingen færdige faster endnu.
            </div>
          ) : (
            <ul>
              {finished.slice(0, 8).map((s) => {
                const duration = (s.endTime || 0) - s.startTime;
                const hours = duration / MS_PER_HOUR;
                const goalMs = s.targetHours * MS_PER_HOUR;
                const reached = duration >= goalMs;
                return (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 p-4 border-b last:border-b-0 border-slate-100 dark:border-slate-700"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        reached
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {reached ? '🏆' : '⏱️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {s.protocolName} · {hours.toFixed(1)}t
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(s.startTime)} · {formatClock(s.startTime)} →{' '}
                        {s.endTime ? formatClock(s.endTime) : '—'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Slet denne faste?')) onDeleteSession(s.id);
                      }}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Settings panel */}
      {showSettings && (
        <section className="mt-6 bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
            Indstillinger
          </h3>

          <SettingRow label="Navn">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm w-40 text-right"
            />
          </SettingRow>
          <SettingRow label="Højde (cm)">
            <input
              type="number"
              value={profile.heightCm || ''}
              onChange={(e) =>
                onUpdate({ heightCm: e.target.value ? Number(e.target.value) : undefined })
              }
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm w-24 text-right"
            />
          </SettingRow>
          <SettingRow label="Mål-vægt (kg)">
            <input
              type="number"
              step="0.1"
              value={profile.targetWeightKg || ''}
              onChange={(e) =>
                onUpdate({ targetWeightKg: e.target.value ? Number(e.target.value) : undefined })
              }
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm w-24 text-right"
            />
          </SettingRow>
          <SettingRow label="Dagligt protein (g)">
            <input
              type="number"
              value={profile.dailyProteinG}
              onChange={(e) => onUpdate({ dailyProteinG: Number(e.target.value) })}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm w-24 text-right"
            />
          </SettingRow>
          <SettingRow label="Dagligt vand (ml)">
            <input
              type="number"
              value={profile.dailyWaterMl}
              onChange={(e) => onUpdate({ dailyWaterMl: Number(e.target.value) })}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm w-24 text-right"
            />
          </SettingRow>

          <div className="mt-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tema
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdate({ themePreference: t.id })}
                  className={`py-2.5 rounded-xl flex flex-col items-center gap-1 border-2 transition ${
                    profile.themePreference === t.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  {t.icon}
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-700 dark:text-slate-200">
              Notifikationer
            </span>
            <button
              onClick={async () => {
                if (!profile.notificationsEnabled && 'Notification' in window) {
                  const perm = await Notification.requestPermission();
                  onUpdate({ notificationsEnabled: perm === 'granted' });
                } else {
                  onUpdate({ notificationsEnabled: false });
                }
              }}
              className={`relative w-11 h-6 rounded-full transition ${
                profile.notificationsEnabled ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  profile.notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm('Slet al data? Dette kan ikke fortrydes.')) onResetAll();
            }}
            className="mt-5 w-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Icons.Trash className="w-4 h-4" />
            Nulstil alt data
          </button>
        </section>
      )}

      <div className="mt-6 text-center text-xs text-slate-400">
        Jonathans Faste App · v1.0.0
      </div>
    </div>
  );
};

/* ---------- Small helpers ---------- */

const StatBlock: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div className="py-4 text-center">
    <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
      {value}
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
  </div>
);

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
    {label}
  </div>
);

const Metric: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div>
    <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    <div className="mt-1 flex items-baseline gap-1">
      <span className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
        {value}
      </span>
      {unit && <span className="text-xs text-slate-400">{unit}</span>}
    </div>
  </div>
);

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
    <div>{children}</div>
  </div>
);
