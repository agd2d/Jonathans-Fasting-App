import { FastProtocol, FastStage, UserProfile } from './types';

export const PROTOCOLS: FastProtocol[] = [
  {
    id: '12-12',
    name: '12:12',
    fastHours: 12,
    eatHours: 12,
    description: 'Blid opstart. God for begyndere og daglig rutine.',
    difficulty: 'Begynder'
  },
  {
    id: '14-10',
    name: '14:10',
    fastHours: 14,
    eatHours: 10,
    description: 'Afbalanceret faste, populær blandt kvinder.',
    difficulty: 'Begynder'
  },
  {
    id: '16-8',
    name: '16:8',
    fastHours: 16,
    eatHours: 8,
    description: 'Den klassiske Leangains-protokol. Mest populære metode.',
    difficulty: 'Øvet'
  },
  {
    id: '18-6',
    name: '18:6',
    fastHours: 18,
    eatHours: 6,
    description: 'Forøger autofagi og fedtforbrænding.',
    difficulty: 'Øvet'
  },
  {
    id: '20-4',
    name: '20:4',
    fastHours: 20,
    eatHours: 4,
    description: 'Warrior Diet. Ét måltid med et lille 4-timers vindue.',
    difficulty: 'Erfaren'
  },
  {
    id: 'omad',
    name: 'OMAD',
    fastHours: 23,
    eatHours: 1,
    description: 'One Meal A Day. Ét stort måltid om dagen.',
    difficulty: 'Erfaren'
  },
  {
    id: '36h',
    name: '36 timer',
    fastHours: 36,
    eatHours: 12,
    description: 'Monk fast. Dyb autofagi og fedtadaption.',
    difficulty: 'Ekspert'
  },
  {
    id: '48h',
    name: '48 timer',
    fastHours: 48,
    eatHours: 24,
    description: 'Forlænget faste for erfarne.',
    difficulty: 'Ekspert'
  }
];

export const FAST_STAGES: FastStage[] = [
  {
    id: 'anabolic',
    hours: 0,
    title: 'Anabolic',
    emoji: '🔧',
    description: 'Din krop opbygger og bruger næring fra det sidste måltid.',
    color: '#FF4E2B'
  },
  {
    id: 'catabolic',
    hours: 4,
    title: 'Catabolic',
    emoji: '⚡',
    description: 'Blodsukker falder. Kroppen bruger glykogen til energi.',
    color: '#F59E0B'
  },
  {
    id: 'fat-burning',
    hours: 12,
    title: 'Fat Burning',
    emoji: '🔥',
    description: 'Glykogenlagre tømmes. Fedtforbrænding begynder.',
    color: '#F97316'
  },
  {
    id: 'ketosis',
    hours: 16,
    title: 'Ketosis',
    emoji: '🥑',
    description: 'Kroppen producerer ketoner. Mental klarhed forbedres.',
    color: '#10B981'
  },
  {
    id: 'deep-ketosis',
    hours: 18,
    title: 'Deep Ketosis',
    emoji: '💪',
    description: 'Fedtforbrænding på højtryk. HGH-niveauerne stiger.',
    color: '#14B8A6'
  },
  {
    id: 'autophagy',
    hours: 24,
    title: 'Autophagy',
    emoji: '♻️',
    description: 'Cellulær oprydning. Kroppen genbruger beskadigede celler.',
    color: '#8B5CF6'
  },
  {
    id: 'deep-autophagy',
    hours: 36,
    title: 'Deep Autophagy',
    emoji: '✨',
    description: 'Maksimal cellulær fornyelse og reduceret inflammation.',
    color: '#A855F7'
  },
  {
    id: 'stem-cells',
    hours: 48,
    title: 'Stem Cells',
    emoji: '🌟',
    description: 'Immunsystemet fornyes. Stamcelle-produktion øges markant.',
    color: '#EC4899'
  }
];

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  themePreference: 'auto',
  onboarded: false,
  dailyWaterMl: 2500,
  dailyProteinG: 120,
  notificationsEnabled: false,
  weightGoalDirection: 'lose'
};

export const STORAGE_KEYS = {
  profile: 'jfa_profile_v2',
  sessions: 'jfa_sessions_v2',
  water: 'jfa_water_v2',
  weights: 'jfa_weights_v2',
  meals: 'jfa_meals_v1',
  sleep: 'jfa_sleep_v1',
  activeSession: 'jfa_active_v2',
  selectedProtocolId: 'jfa_protocol_v2',
  customHours: 'jfa_custom_hours_v1'
};

/** Udregn anbefalet protein-mål: 1.4g/kg for tabe, 1.2g/kg vedligehold, 1.6g/kg tage på. */
export function computeProteinTarget(weightKg: number, goal: UserProfile['weightGoalDirection']): number {
  if (!weightKg) return 100;
  const factor = goal === 'gain' ? 1.6 : goal === 'maintain' ? 1.2 : 1.4;
  return Math.round(weightKg * factor);
}

/** Udregn anbefalet vand-mål i ml: 33ml/kg som udgangspunkt. */
export function computeWaterTarget(weightKg: number): number {
  if (!weightKg) return 2500;
  return Math.round(weightKg * 33);
}

export const MOTIVATIONAL_QUOTES: string[] = [
  'Sult er ikke en nødsituation — det er bare en bølge.',
  'Du er stærkere end din sult.',
  'Hver time tæller. Bliv ved!',
  'Kroppen heler sig selv, når du giver den tid.',
  'Disciplin i dag = frihed i morgen.',
  'Du træner din krop til at forbrænde fedt.',
  'Hvert minut bringer dig tættere på dit mål.',
  'Faste er en gave til dit fremtidige jeg.',
  'Styrke vokser i de svære øjeblikke.',
  'Du gør det fantastisk — bliv ved!'
];

export const EXAMPLE_MEALS: { name: string; proteinG: number; calories: number; emoji: string }[] = [
  { name: 'Grilled Chicken with Quinoa and Broccoli', proteinG: 45, calories: 520, emoji: '🍗' },
  { name: 'Greek Yogurt with Berries', proteinG: 18, calories: 220, emoji: '🫐' },
  { name: 'Salmon Poke Bowl', proteinG: 35, calories: 480, emoji: '🍣' },
  { name: 'Spinach Omelette (3 æg)', proteinG: 22, calories: 310, emoji: '🍳' },
  { name: 'Proteinshake (whey)', proteinG: 30, calories: 180, emoji: '🥤' },
  { name: 'Tun-salat med avocado', proteinG: 28, calories: 340, emoji: '🥗' },
  { name: 'Havregrød med mandler', proteinG: 14, calories: 380, emoji: '🥣' },
  { name: 'Linser med ris og grønt', proteinG: 18, calories: 420, emoji: '🍛' }
];

export const EXPERT_TIPS: { title: string; body: string; expert: string }[] = [
  {
    title: 'Drik vand tidligt',
    body: 'Et glas vand lige efter du vågner kickstarter din metabolisme og hjælper med at undertrykke sult.',
    expert: 'Dr. Naomi, Chief Medical Officer'
  },
  {
    title: 'Bryd fasten blidt',
    body: 'Når du bryder fasten, så start med protein og fiber — ikke sukker. Det stabiliserer blodsukkeret.',
    expert: 'Dr. Naomi, Chief Medical Officer'
  },
  {
    title: 'Sorte kaffe og te er ok',
    body: 'Koffein kan hjælpe med at undertrykke sult og forlænge ketose — så længe der ikke er sukker eller mælk i.',
    expert: 'Dr. Naomi, Chief Medical Officer'
  },
  {
    title: 'Sov som en baby',
    body: 'Dårlig søvn øger kortisol og sultfølelse. Prioritér 7-9 timer for at understøtte din faste.',
    expert: 'Dr. Naomi, Chief Medical Officer'
  }
];
