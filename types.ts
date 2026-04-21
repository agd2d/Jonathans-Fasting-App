export type ThemePreference = 'light' | 'dark' | 'auto';

export interface FastProtocol {
  id: string;
  name: string;
  fastHours: number;
  eatHours: number;
  description: string;
  difficulty: 'Begynder' | 'Øvet' | 'Erfaren' | 'Ekspert';
}

export interface FastSession {
  id: string;
  protocolId: string;
  protocolName: string;
  targetHours: number;
  startTime: number;
  endTime: number | null;
  completed: boolean;
  note?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  ml: number;
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
}

export interface MealLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  name: string;
  proteinG: number;
  calories: number;
}

export interface SleepLog {
  date: string; // YYYY-MM-DD
  minutes: number;
}

export interface FastStage {
  id: string;
  hours: number;
  title: string;
  emoji: string;
  description: string;
  color: string;
}

export type WeightGoal = 'lose' | 'gain' | 'maintain';

export interface UserProfile {
  name: string;
  themePreference: ThemePreference;
  targetWeightKg?: number;
  currentWeightKg?: number;
  heightCm?: number;
  ageYears?: number;
  weightGoalDirection?: WeightGoal;
  onboarded: boolean;
  dailyWaterMl: number; // beregnet eller brugervalgt
  dailyProteinG: number; // beregnet eller brugervalgt
  notificationsEnabled: boolean;
}

export type TabId = 'today' | 'explore' | 'me';
