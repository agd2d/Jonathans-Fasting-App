# Jonathans Faste App

En komplet mobil-først faste-app bygget som en PWA, der kan installeres på hjemskærmen.

## Funktioner

- **Faste-timer** med cirkulær fremskridtsvisning
- **Otte faste-protokoller** (12:12, 14:10, 16:8, 18:6, 20:4, OMAD, 36t, 48t) + tilpasset tid
- **Fastefaser** — se hvad der sker i kroppen (anabolisk → katabolisk → ketose → autofagi → stamceller)
- **Historik** med statistik, streak, længste faste, gennemsnit og humør/notater
- **Vand-tracker** med dagligt mål og 7-dages oversigt
- **Vægt-tracker** med graf, BMI og fremskridt mod mål
- **Onboarding-flow** der tilpasser appen til dig
- **Notifikationer** når fastemålet nås
- **Dark mode** (auto / lys / mørk)
- **Alt data gemmes lokalt** i browseren (localStorage) — intet backend, ingen login
- **Installerbar som PWA** på iOS/Android

## Kør lokalt

```bash
cd jonathans-faste-app
npm install
npm run dev
```

Åbn derefter http://localhost:3000 i din mobilbrowser (eller brug DevTools mobilvisning).

## Byg til produktion

```bash
npm run build
npm run preview
```

Output ligger i `dist/` og kan uploades til ethvert statisk hosting (Vercel, Netlify, GitHub Pages osv.).

## Installér på mobil

1. Åbn appen i Safari (iOS) eller Chrome (Android)
2. Tryk "Del" → "Tilføj til hjemskærm"
3. App'en starter nu fullscreen og virker offline

## Teknologi

- React 18 + TypeScript
- Vite
- Tailwind CSS (via CDN for nem udvikling)
- Service worker til offline-cache
- Web Notifications API til mål-påmindelser
