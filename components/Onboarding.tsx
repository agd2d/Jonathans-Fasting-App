import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile, WeightGoal } from '../types';
import { PROTOCOLS, computeProteinTarget, computeWaterTarget } from '../constants';
import { Icons } from './Icons';

interface Props {
  onComplete: (profile: UserProfile, protocolId: string) => void;
}

type Step =
  | 'welcome'
  | 'name'
  | 'goal'
  | 'metrics'
  | 'current-weight'
  | 'target-weight'
  | 'creating-plan'
  | 'protein'
  | 'water'
  | 'hydration-simple'
  | 'sync'
  | 'protocol'
  | 'ready';

const STEP_ORDER: Step[] = [
  'welcome',
  'name',
  'goal',
  'metrics',
  'current-weight',
  'target-weight',
  'creating-plan',
  'protein',
  'water',
  'hydration-simple',
  'sync',
  'protocol',
  'ready'
];

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEP_ORDER[stepIdx];

  const [name, setName] = useState('Jonathan');
  const [goal, setGoal] = useState<WeightGoal>('lose');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('30');
  const [currentWeight, setCurrentWeight] = useState('90');
  const [targetWeight, setTargetWeight] = useState('80');
  const [protocolId, setProtocolId] = useState('16-8');

  const weightNum = Number(currentWeight) || 0;
  const proteinTarget = useMemo(() => computeProteinTarget(weightNum, goal), [weightNum, goal]);
  const waterTarget = useMemo(() => computeWaterTarget(weightNum), [weightNum]);

  const next = () => setStepIdx((i) => Math.min(STEP_ORDER.length - 1, i + 1));
  const prev = () => setStepIdx((i) => Math.max(0, i - 1));

  const progress = (stepIdx + 1) / STEP_ORDER.length;

  // Auto-advance from the "creating plan" loading screen
  useEffect(() => {
    if (step === 'creating-plan') {
      const t = window.setTimeout(() => next(), 2800);
      return () => window.clearTimeout(t);
    }
  }, [step]);

  const finish = () => {
    const profile: UserProfile = {
      name: name.trim() || 'Bruger',
      themePreference: 'auto',
      onboarded: true,
      dailyWaterMl: waterTarget,
      dailyProteinG: proteinTarget,
      notificationsEnabled: false,
      weightGoalDirection: goal,
      heightCm: Number(height) || undefined,
      ageYears: Number(age) || undefined,
      currentWeightKg: Number(currentWeight) || undefined,
      targetWeightKg: Number(targetWeight) || undefined
    };
    onComplete(profile, protocolId);
  };

  const showBackButton = stepIdx > 0 && step !== 'creating-plan';
  const showProgressBar = step !== 'welcome' && step !== 'creating-plan';

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 flex flex-col safe-top safe-bottom">
      {/* Header with back button + progress */}
      {showBackButton && (
        <div className="px-5 pt-4 flex items-center gap-3">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-white/70 dark:bg-slate-800 flex items-center justify-center"
          >
            <Icons.ChevronLeft className="w-5 h-5" />
          </button>
          {showProgressBar && (
            <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-accent-500 transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {step === 'welcome' && (
          <HeroStep
            background="bg-gradient-to-br from-accent-500 to-brand-800"
            illustration={
              <div className="text-white text-center">
                <div className="w-32 h-32 mx-auto rounded-full border-[10px] border-white/80 flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <span className="text-3xl">⏱️</span>
                  </div>
                </div>
                <h1 className="display-title text-4xl text-white mb-2">Jonathans Faste App</h1>
                <p className="text-white/80">Din personlige tracker til intermittent faste.</p>
              </div>
            }
            title=""
            body=""
            cta="Kom i gang"
            onNext={next}
          />
        )}

        {step === 'name' && (
          <BasicStep
            title="Hvad skal vi kalde dig?"
            subtitle="Så vi kan hilse ordentligt på dig."
          >
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dit navn"
              className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-lg font-bold focus:outline-none focus:border-brand-500"
            />
          </BasicStep>
        )}

        {step === 'goal' && (
          <BasicStep title="Hvad er dit mål?" subtitle="Vi tilpasser appen til dig.">
            <div className="space-y-3">
              {(
                [
                  { id: 'lose', label: 'Tabe mig', emoji: '📉' },
                  { id: 'maintain', label: 'Holde min vægt', emoji: '⚖️' },
                  { id: 'gain', label: 'Tage på', emoji: '💪' }
                ] as const
              ).map((o) => (
                <button
                  key={o.id}
                  onClick={() => setGoal(o.id)}
                  className={`w-full p-4 rounded-2xl text-left flex items-center gap-3 transition border-2 ${
                    goal === o.id
                      ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <span className="font-bold text-lg text-slate-900 dark:text-white flex-1">
                    {o.label}
                  </span>
                  {goal === o.id && (
                    <Icons.Check className="w-5 h-5 text-brand-800" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </BasicStep>
        )}

        {step === 'metrics' && (
          <BasicStep title="Fortæl os om dig" subtitle="Vi bruger det til at beregne dine mål.">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Højde (cm)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-1 w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-lg font-bold focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Alder
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1 w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-lg font-bold focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </BasicStep>
        )}

        {step === 'current-weight' && (
          <BasicStep title="Hvad vejer du nu?" subtitle="Bare en udgangsværdi — du kan ændre den.">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vægt (kg)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="mt-1 w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-lg font-bold focus:outline-none focus:border-brand-500"
              />
            </div>
          </BasicStep>
        )}

        {step === 'target-weight' && (
          <BasicStep title="Hvad er din mål-vægt?" subtitle="Vi hjælper dig med at nå derhen.">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Mål-vægt (kg)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="mt-1 w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-lg font-bold focus:outline-none focus:border-brand-500"
              />
            </div>
          </BasicStep>
        )}

        {step === 'creating-plan' && (
          <CreatingPlanStep
            height={Number(height)}
            weight={weightNum}
            age={Number(age)}
            goal={goal}
          />
        )}

        {step === 'protein' && (
          <RecommendationStep
            background="bg-accent-500"
            illustration={
              <div className="flex items-center justify-center h-64">
                {/* Dartboard illustration */}
                <div className="relative">
                  <div className="w-56 h-56 rounded-full bg-white flex items-center justify-center">
                    <div className="w-44 h-44 rounded-full bg-amber-400 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -rotate-12">
                    <div className="text-6xl">🎯</div>
                  </div>
                </div>
              </div>
            }
            title={
              <>
                Vi anbefaler <span className="text-accent-500">{proteinTarget} gram</span> protein om dagen
              </>
            }
            body="Protein driver muskler, metabolisme og restitution. At nå dit daglige mål hjælper dig med at være stærk og energisk — især når du faster. Du kan altid justere målet senere."
            testimonial="At ramme dit daglige protein-mål gør dig mættet længere, hvilket kan være en game-changer for din næste faste."
            onNext={next}
          />
        )}

        {step === 'water' && (
          <RecommendationStep
            background="bg-blue-600"
            illustration={
              <div className="flex items-center justify-center h-64">
                <div className="w-40 h-56 bg-sky-300 rounded-2xl relative flex items-end">
                  <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-16 h-5 bg-slate-700 rounded-md" />
                  <div className="absolute top-2 left-4 bottom-4 w-1 flex flex-col gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-0.5 w-4 bg-white/80" />
                    ))}
                  </div>
                  <div className="w-full bg-sky-500/60 rounded-b-2xl" style={{ height: '70%' }} />
                </div>
              </div>
            }
            title={
              <>
                Vi anbefaler <span className="text-accent-500">{waterTarget} ml</span> vand om dagen
              </>
            }
            body="Bedre hydrering betyder bedre faste og bedre energi. Du kan altid justere målet senere."
            testimonial="At være hydreret er en af de enkleste og mest effektive ting, du kan gøre for din krop. Det booster metabolismen og holder hjernen skarp."
            onNext={next}
          />
        )}

        {step === 'hydration-simple' && (
          <RecommendationStep
            background="bg-blue-500"
            illustration={
              <div className="flex items-center justify-center h-64">
                <div className="bg-white rounded-2xl p-6 w-72 shadow-xl">
                  <div className="text-center text-4xl font-extrabold text-slate-900">
                    {Math.round(waterTarget * 0.6)}<span className="text-xl">ml</span>
                  </div>
                  <div className="mt-4 h-3 bg-slate-100 rounded-full relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>0ml</span>
                    <span>{waterTarget}ml</span>
                  </div>
                </div>
              </div>
            }
            title="Vand-tracking har aldrig været nemmere"
            body="Fra klar tænkning til bedre bevægelse — vand er afgørende. Log dit daglige indtag og føl forskellen."
            onNext={next}
          />
        )}

        {step === 'sync' && (
          <RecommendationStep
            background="bg-accent-500"
            illustration={
              <div className="flex items-center justify-center h-64">
                <div className="bg-white/20 backdrop-blur rounded-[2.5rem] border-4 border-white/40 p-8 w-60 h-80 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-extrabold text-accent-500">
                      JF
                    </div>
                    <div className="text-white text-2xl">🔄</div>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">❤️</span>
                    </div>
                  </div>
                </div>
              </div>
            }
            title="Track dine sundheds-metrics automatisk"
            body="Når du senere forbinder med Apple Health eller Google Fit, hjælper vi dig med at holde dine protein-, vand- og vægt-mål synkroniseret med dine mål."
            cta="Fortsæt"
            secondaryCta="Måske senere"
            onNext={next}
            onSecondary={next}
          />
        )}

        {step === 'protocol' && (
          <BasicStep title="Vælg en startprotokol" subtitle="Du kan altid ændre den senere.">
            <div className="space-y-2">
              {PROTOCOLS.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProtocolId(p.id)}
                  className={`w-full text-left p-4 rounded-2xl transition border-2 ${
                    protocolId === p.id
                      ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-lg text-slate-900 dark:text-white">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {p.description}
                      </div>
                    </div>
                    {protocolId === p.id && (
                      <Icons.Check className="w-5 h-5 text-brand-800" strokeWidth={3} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </BasicStep>
        )}

        {step === 'ready' && (
          <BasicStep title={`Alt er klart, ${name}!`} subtitle="Din plan er personaliseret til dine mål.">
            <div className="space-y-3">
              <ReadyRow icon="🎯" label="Mål-vægt" value={`${targetWeight} kg`} />
              <ReadyRow icon="⏱️" label="Startprotokol" value={PROTOCOLS.find(p => p.id === protocolId)?.name || protocolId} />
              <ReadyRow icon="🍗" label="Daglig protein" value={`${proteinTarget}g`} />
              <ReadyRow icon="💧" label="Daglig vand" value={`${waterTarget}ml`} />
            </div>
            <div className="mt-6 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-900/40 rounded-2xl p-4 text-center">
              <div className="text-sm italic text-slate-700 dark:text-slate-200">
                &ldquo;Det bedste tidspunkt at starte var i går. Det næstbedste er nu.&rdquo;
              </div>
            </div>
          </BasicStep>
        )}
      </div>

      {/* Footer */}
      {step !== 'welcome' && step !== 'creating-plan' && step !== 'sync' && step !== 'protein' && step !== 'water' && step !== 'hydration-simple' && (
        <div className="p-5">
          <button
            onClick={step === 'ready' ? finish : next}
            className="w-full bg-brand-800 text-white font-bold py-4 rounded-full shadow-xl shadow-brand-800/20 active:scale-[0.98]"
          >
            {step === 'ready' ? '🚀 Start min faste-rejse' : 'Fortsæt'}
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------- Helper step components ---------- */

interface HeroStepProps {
  background: string;
  illustration: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onNext: () => void;
}

const HeroStep: React.FC<HeroStepProps> = ({ background, illustration, cta, onNext }) => (
  <div className="flex flex-col h-full min-h-[100dvh]">
    <div className={`${background} flex-1 flex items-center justify-center p-8 hero-grain`}>
      {illustration}
    </div>
    <div className="p-5">
      <button
        onClick={onNext}
        className="w-full bg-brand-800 text-white font-bold py-4 rounded-full shadow-xl active:scale-[0.98]"
      >
        {cta}
      </button>
    </div>
  </div>
);

interface RecommendationStepProps {
  background: string;
  illustration: React.ReactNode;
  title: React.ReactNode;
  body: string;
  testimonial?: string;
  cta?: string;
  secondaryCta?: string;
  onNext: () => void;
  onSecondary?: () => void;
}

const RecommendationStep: React.FC<RecommendationStepProps> = ({
  background,
  illustration,
  title,
  body,
  testimonial,
  cta = 'Fortsæt',
  secondaryCta,
  onNext,
  onSecondary
}) => (
  <div className="flex flex-col min-h-[calc(100dvh-3.5rem)]">
    <div className={`${background} p-6 hero-grain`}>{illustration}</div>
    <div className="px-6 pt-6 pb-4 flex-1">
      <h1 className="display-title text-3xl text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
      {testimonial && (
        <div className="mt-6 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center text-xl font-extrabold text-brand-900 flex-shrink-0">
            N
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {testimonial}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
              — Dr. Naomi, Chief Medical Officer
            </p>
          </div>
        </div>
      )}
    </div>
    <div className="p-5 space-y-2">
      {secondaryCta && onSecondary && (
        <button
          onClick={onSecondary}
          className="w-full bg-slate-100 dark:bg-slate-800 text-brand-800 dark:text-brand-300 font-bold py-3.5 rounded-full active:scale-[0.98]"
        >
          {secondaryCta}
        </button>
      )}
      <button
        onClick={onNext}
        className="w-full bg-brand-800 text-white font-bold py-4 rounded-full shadow-xl shadow-brand-800/20 active:scale-[0.98]"
      >
        {cta}
      </button>
    </div>
  </div>
);

const BasicStep: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children
}) => (
  <div className="px-6 pt-8 pb-4">
    <h1 className="display-title text-3xl text-slate-900 dark:text-white">{title}</h1>
    {subtitle && (
      <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">{subtitle}</p>
    )}
    <div className="mt-6">{children}</div>
  </div>
);

const ReadyRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
    <div className="text-2xl">{icon}</div>
    <div className="flex-1 text-sm text-slate-500 dark:text-slate-400">{label}</div>
    <div className="font-extrabold text-slate-900 dark:text-white">{value}</div>
  </div>
);

/* ---------- "Creating plan" loading step ---------- */

const CreatingPlanStep: React.FC<{
  height: number;
  weight: number;
  age: number;
  goal: WeightGoal;
}> = ({ height, weight, age, goal }) => {
  const [visibleChecks, setVisibleChecks] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    for (let i = 1; i <= 4; i++) {
      timers.push(window.setTimeout(() => setVisibleChecks(i), i * 500));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const goalLabel =
    goal === 'lose' ? 'weight management' : goal === 'gain' ? 'at tage på' : 'at vedligeholde';

  const rows = [
    { label: `${height} cm`, show: visibleChecks >= 1 },
    { label: `${weight} kg`, show: visibleChecks >= 2 },
    { label: `${age} år`, show: visibleChecks >= 3 },
    { label: `Dit mål er ${goalLabel}`, show: visibleChecks >= 4 }
  ];

  return (
    <div className="h-full min-h-[calc(100dvh-3.5rem)] flex flex-col px-6 pt-10 pb-5">
      <div className="w-16 h-16 rounded-full border-[6px] border-accent-500 animate-pulse mb-6" />
      <h1 className="display-title text-3xl text-slate-900 dark:text-white">
        Laver en personlig plan bare til dig
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">
        Vi analyserer dine mål og sundheds-metrics for at bygge en faste- og ernæringsplan, der er
        skræddersyet til dig.
      </p>
      <div className="mt-8 space-y-3">
        {rows.map((r, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 transition-opacity ${
              r.show ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center">
              <Icons.Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
