import React, { useEffect, useMemo, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { ExploreView } from './components/ExploreView';
import { MealLoggerModal } from './components/MealLoggerModal';
import { MeView } from './components/MeView';
import { Onboarding } from './components/Onboarding';
import { ProtocolPicker } from './components/ProtocolPicker';
import { TodayView } from './components/TodayView';
import {
  DEFAULT_PROFILE,
  PROTOCOLS,
  STORAGE_KEYS,
  computeProteinTarget,
  computeWaterTarget
} from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  FastProtocol,
  FastSession,
  MealLog,
  TabId,
  UserProfile,
  WaterLog,
  WeightLog
} from './types';
import { MS_PER_HOUR, formatHoursMinutes, timeFromDate, todayIso } from './utils';

export default function App() {
  const [profile, setProfile] = useLocalStorage<UserProfile>(STORAGE_KEYS.profile, DEFAULT_PROFILE);
  const [sessions, setSessions] = useLocalStorage<FastSession[]>(STORAGE_KEYS.sessions, []);
  const [waterLogs, setWaterLogs] = useLocalStorage<WaterLog[]>(STORAGE_KEYS.water, []);
  const [weightLogs, setWeightLogs] = useLocalStorage<WeightLog[]>(STORAGE_KEYS.weights, []);
  const [meals, setMeals] = useLocalStorage<MealLog[]>(STORAGE_KEYS.meals, []);
  const [activeSession, setActiveSession] = useLocalStorage<FastSession | null>(
    STORAGE_KEYS.activeSession,
    null
  );
  const [selectedProtocolId, setSelectedProtocolId] = useLocalStorage<string>(
    STORAGE_KEYS.selectedProtocolId,
    '16-8'
  );
  const [customHours, setCustomHours] = useLocalStorage<number>(STORAGE_KEYS.customHours, 16);

  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [protocolPickerOpen, setProtocolPickerOpen] = useState(false);
  const [mealLoggerOpen, setMealLoggerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [goalNotified, setGoalNotified] = useState(false);

  /* ---------- Theme handling ---------- */
  useEffect(() => {
    const root = document.documentElement;
    const pref = profile.themePreference;

    const apply = () => {
      root.classList.remove('light', 'dark');
      if (pref === 'dark') root.classList.add('dark');
      else if (pref === 'light') root.classList.add('light');
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
    };
    apply();

    if (pref === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => apply();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [profile.themePreference]);

  /* ---------- Selected protocol resolution ---------- */
  const selectedProtocol: FastProtocol = useMemo(() => {
    if (selectedProtocolId === 'custom') {
      return {
        id: 'custom',
        name: `${customHours}t`,
        fastHours: customHours,
        eatHours: Math.max(0, 24 - customHours),
        description: 'Din egen tilpassede protokol.',
        difficulty:
          customHours >= 36 ? 'Ekspert' : customHours >= 20 ? 'Erfaren' : customHours >= 16 ? 'Øvet' : 'Begynder'
      };
    }
    return PROTOCOLS.find((p) => p.id === selectedProtocolId) || PROTOCOLS[2];
  }, [selectedProtocolId, customHours]);

  /* ---------- Toast helper ---------- */
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  /* ---------- Goal reached notification ---------- */
  useEffect(() => {
    if (!activeSession) {
      setGoalNotified(false);
      return;
    }
    const targetMs = activeSession.targetHours * MS_PER_HOUR;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - activeSession.startTime;
      if (elapsed >= targetMs && !goalNotified) {
        setGoalNotified(true);
        if (
          profile.notificationsEnabled &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          try {
            new Notification('🎉 Du har nået dit fastemål!', {
              body: `${activeSession.protocolName} er gennemført. Godt gået!`
            });
          } catch {
            /* ignore */
          }
        }
        showToast('🎉 Du har nået dit fastemål!');
      }
    }, 5000);
    return () => window.clearInterval(id);
  }, [activeSession, goalNotified, profile.notificationsEnabled]);

  /* ---------- Handlers: fasts ---------- */
  const handleStartFast = () => {
    const session: FastSession = {
      id: `${Date.now()}`,
      protocolId: selectedProtocol.id,
      protocolName: selectedProtocol.name,
      targetHours: selectedProtocol.fastHours,
      startTime: Date.now(),
      endTime: null,
      completed: false
    };
    setActiveSession(session);
    setGoalNotified(false);
    showToast('Faste startet — hold ud!');
  };

  const handleStopFast = () => {
    if (!activeSession) return;
    const end = Date.now();
    const elapsedMs = end - activeSession.startTime;
    const goalMs = activeSession.targetHours * MS_PER_HOUR;
    const completed = elapsedMs >= goalMs;

    if (!completed) {
      const ok = confirm(
        `Du har fastet i ${formatHoursMinutes(elapsedMs)} ud af ${activeSession.targetHours}t. Er du sikker på du vil afslutte?`
      );
      if (!ok) return;
    }

    const done: FastSession = {
      ...activeSession,
      endTime: end,
      completed
    };
    setSessions((prev) => [done, ...prev]);
    setActiveSession(null);
    showToast(completed ? '🏆 Faste gennemført!' : 'Faste afsluttet');
  };

  const handleAdjustStartTime = (newStart: number) => {
    if (!activeSession) return;
    setActiveSession({ ...activeSession, startTime: newStart });
    setGoalNotified(false);
  };

  const handleAdjustGoalHours = (hours: number) => {
    if (!activeSession) return;
    setActiveSession({ ...activeSession, targetHours: hours });
    setGoalNotified(false);
  };

  const handleSelectProtocol = (id: string, custom?: number) => {
    if (activeSession) return;
    setSelectedProtocolId(id);
    if (id === 'custom' && custom !== undefined) setCustomHours(custom);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  /* ---------- Handlers: water ---------- */
  const handleAddWater = (ml: number) => {
    const today = todayIso();
    setWaterLogs((prev) => {
      const existing = prev.find((w) => w.date === today);
      if (existing) {
        return prev.map((w) => (w.date === today ? { ...w, ml: w.ml + ml } : w));
      }
      return [...prev, { date: today, ml }];
    });
  };

  const handleRemoveWater = (ml: number) => {
    const today = todayIso();
    setWaterLogs((prev) =>
      prev
        .map((w) => (w.date === today ? { ...w, ml: Math.max(0, w.ml - ml) } : w))
        .filter((w) => w.ml > 0 || w.date !== today)
    );
  };

  /* ---------- Handlers: meals ---------- */
  const handleAddMeal = (meal: { name: string; proteinG: number; calories: number }) => {
    const log: MealLog = {
      id: `${Date.now()}`,
      date: todayIso(),
      time: timeFromDate(new Date()),
      ...meal
    };
    setMeals((prev) => [log, ...prev]);
    showToast('Måltid tilføjet');
  };

  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  /* ---------- Handlers: weight ---------- */
  const handleAddWeight = (weightKg: number, date: string) => {
    const log: WeightLog = { id: `${Date.now()}`, date, weightKg };
    setWeightLogs((prev) => [log, ...prev.filter((w) => w.date !== date)]);
  };

  const handleDeleteWeight = (id: string) => {
    setWeightLogs((prev) => prev.filter((w) => w.id !== id));
  };

  /* ---------- Profile update ---------- */
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setProfile((p) => {
      const merged = { ...p, ...updates };
      // When weight or goal changes, auto-recalculate targets (only if user hasn't customized)
      if (
        (updates.currentWeightKg !== undefined ||
          updates.weightGoalDirection !== undefined) &&
        updates.dailyProteinG === undefined
      ) {
        const w = merged.currentWeightKg || p.currentWeightKg;
        if (w) {
          merged.dailyProteinG = computeProteinTarget(w, merged.weightGoalDirection);
          merged.dailyWaterMl = computeWaterTarget(w);
        }
      }
      return merged;
    });
  };

  const handleResetAll = () => {
    setSessions([]);
    setWaterLogs([]);
    setWeightLogs([]);
    setMeals([]);
    setActiveSession(null);
    setProfile(DEFAULT_PROFILE);
    setSelectedProtocolId('16-8');
    showToast('Alt data er slettet');
  };

  const handleOnboardComplete = (newProfile: UserProfile, protocolId: string) => {
    setProfile(newProfile);
    setSelectedProtocolId(protocolId);
  };

  /* ---------- Render ---------- */
  if (!profile.onboarded) {
    return <Onboarding onComplete={handleOnboardComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 safe-top">
      <main className="w-full">
        {activeTab === 'today' && (
          <TodayView
            profile={profile}
            activeSession={activeSession}
            selectedProtocol={selectedProtocol}
            sessions={sessions}
            meals={meals}
            waterLogs={waterLogs}
            onOpenProtocolPicker={() => setProtocolPickerOpen(true)}
            onStartFast={handleStartFast}
            onStopFast={handleStopFast}
            onAdjustStartTime={handleAdjustStartTime}
            onAdjustGoalHours={handleAdjustGoalHours}
            onOpenMealLogger={() => setMealLoggerOpen(true)}
            onAddWater={handleAddWater}
            onRemoveWater={handleRemoveWater}
            onDeleteMeal={handleDeleteMeal}
          />
        )}
        {activeTab === 'explore' && <ExploreView />}
        {activeTab === 'me' && (
          <MeView
            profile={profile}
            sessions={sessions}
            meals={meals}
            waterLogs={waterLogs}
            weightLogs={weightLogs}
            onUpdate={handleUpdateProfile}
            onDeleteSession={handleDeleteSession}
            onAddWeight={handleAddWeight}
            onDeleteWeight={handleDeleteWeight}
            onResetAll={handleResetAll}
          />
        )}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      <ProtocolPicker
        open={protocolPickerOpen}
        onClose={() => setProtocolPickerOpen(false)}
        selectedId={selectedProtocolId}
        onSelect={handleSelectProtocol}
        disabled={!!activeSession}
      />

      <MealLoggerModal
        open={mealLoggerOpen}
        onClose={() => setMealLoggerOpen(false)}
        onSave={handleAddMeal}
      />

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-lg text-sm font-semibold animate-fadein">
          {toast}
        </div>
      )}
    </div>
  );
}
