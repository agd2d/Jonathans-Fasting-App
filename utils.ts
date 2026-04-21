import { FAST_STAGES, MOTIVATIONAL_QUOTES } from './constants';
import { FastSession, FastStage, MealLog, WaterLog } from './types';

export const MS_PER_HOUR = 60 * 60 * 1000;
export const MS_PER_MINUTE = 60 * 1000;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function formatDuration(ms: number): { h: string; m: string; s: string } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0')
  };
}

export function formatHoursMinutes(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / MS_PER_MINUTE));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}t`;
  return `${h}t ${m}m`;
}

export function formatClock(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatClockFromString(hhmm: string): string {
  return hhmm;
}

export function formatDayShort(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('da-DK', { weekday: 'short' });
}

export function formatDayAndClock(ts: number): string {
  const d = new Date(ts);
  const weekday = d.toLocaleDateString('da-DK', { weekday: 'short' }).replace('.', '');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${capitalize(weekday)} ${hh}:${mm}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDate(ts: number | string): string {
  const d = typeof ts === 'string' ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

export function formatDateLong(ts: number | string): string {
  const d = typeof ts === 'string' ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function todayIso(): string {
  return isoFromDate(new Date());
}

export function isoFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function timeFromDate(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function getCurrentStage(elapsedMs: number): FastStage {
  const hours = elapsedMs / MS_PER_HOUR;
  let current = FAST_STAGES[0];
  for (const stage of FAST_STAGES) {
    if (hours >= stage.hours) current = stage;
  }
  return current;
}

export function getNextStage(elapsedMs: number): FastStage | null {
  const hours = elapsedMs / MS_PER_HOUR;
  for (const stage of FAST_STAGES) {
    if (hours < stage.hours) return stage;
  }
  return null;
}

export function computeStreak(sessions: FastSession[]): number {
  const completed = sessions
    .filter((s) => s.completed && s.endTime)
    .sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
  if (completed.length === 0) return 0;

  const daysSet = new Set<string>();
  completed.forEach((s) => {
    if (s.endTime) daysSet.add(isoFromDate(new Date(s.endTime)));
  });

  let streak = 0;
  const cursor = new Date();
  while (daysSet.has(isoFromDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  if (streak === 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (daysSet.has(isoFromDate(yesterday))) {
      streak = 1;
      const cursor2 = new Date();
      cursor2.setDate(cursor2.getDate() - 2);
      while (daysSet.has(isoFromDate(cursor2))) {
        streak += 1;
        cursor2.setDate(cursor2.getDate() - 1);
      }
    }
  }
  return streak;
}

export function longestStreak(sessions: FastSession[]): number {
  const days = new Set<string>();
  sessions.forEach((s) => {
    if (s.completed && s.endTime) days.add(isoFromDate(new Date(s.endTime)));
  });
  if (days.size === 0) return 0;

  const sortedDays = Array.from(days).sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const cur = new Date(sortedDays[i]);
    const diff = Math.round((cur.getTime() - prev.getTime()) / MS_PER_DAY);
    if (diff === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export function getMotivationalQuote(seed: number): string {
  const idx = Math.abs(seed) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[idx];
}

export function totalFastedMs(sessions: FastSession[]): number {
  return sessions.reduce((acc, s) => {
    if (s.endTime) return acc + (s.endTime - s.startTime);
    return acc;
  }, 0);
}

export function averageFastHours(sessions: FastSession[]): number {
  const finished = sessions.filter((s) => s.endTime);
  if (finished.length === 0) return 0;
  const total = finished.reduce((acc, s) => acc + ((s.endTime || 0) - s.startTime), 0);
  return total / finished.length / MS_PER_HOUR;
}

export function longestFastHours(sessions: FastSession[]): number {
  let longest = 0;
  sessions.forEach((s) => {
    if (s.endTime) {
      const h = (s.endTime - s.startTime) / MS_PER_HOUR;
      if (h > longest) longest = h;
    }
  });
  return longest;
}

export function proteinForDay(meals: MealLog[], date: string): number {
  return meals.filter((m) => m.date === date).reduce((acc, m) => acc + m.proteinG, 0);
}

export function caloriesForDay(meals: MealLog[], date: string): number {
  return meals.filter((m) => m.date === date).reduce((acc, m) => acc + m.calories, 0);
}

export function waterForDay(logs: WaterLog[], date: string): number {
  return logs.find((w) => w.date === date)?.ml || 0;
}

/**
 * Beregn protein-score på 0-100 ud fra hvor stor andel af kalorier der kommer fra protein.
 * 4 kcal/g protein. Ideal andel omkring 30-35% giver høj score.
 */
export function proteinScore(proteinG: number, calories: number): number {
  if (calories <= 0 || proteinG <= 0) return 0;
  const pct = (proteinG * 4) / calories;
  if (pct >= 0.35) return 100;
  if (pct >= 0.3) return Math.round(90 + (pct - 0.3) * 200);
  if (pct >= 0.2) return Math.round(60 + (pct - 0.2) * 300);
  if (pct >= 0.1) return Math.round(30 + (pct - 0.1) * 300);
  return Math.max(0, Math.round(pct * 300));
}

export function proteinScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent protein density! Most of your calories came from lean, high-quality protein sources. Great job fueling efficiently today.';
  if (score >= 70) return 'Godt protein-indhold. Du får masser af protein fra dine måltider.';
  if (score >= 50) return 'OK protein-balance. Overvej at tilføje en portion mager protein ved næste måltid.';
  if (score >= 30) return 'Lavt protein-indhold. Prøv at prioritere protein i dit næste måltid.';
  return 'Meget lavt protein-indhold. Start med et proteinrigt måltid for at støtte din faste.';
}

export function getLastSevenDays(): Date[] {
  const res: Date[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    res.push(d);
  }
  return res;
}
