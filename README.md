# Planeraren

Familjens kalender med hämta & lämna och Kylskåpet (nedräkningar för barnen), som en webbapp som kan läggas på hemskärmen.

- **Vercel** visar sidan.
- **Clerk** sköter inloggningen och Google-kopplingen (behörighet till kalendern).
- **Convex** sparar familjens data (lappar, kylskåpet, hämta & lämna-rytmen) i realtid och pratar med Google Kalender.

## Struktur

```
index.html            Planeraren: utseende (CSS) och startskärm
src/main.js           Bryggan: inloggning (Clerk), familj (Convex), Google-anrop
src/gate.css          Inloggning, välkomst och familjeinställningar
public/app/planner.js Planeraren: månad, vecka, dag, hämta & lämna
public/app/fridge.js  Kylskåpet: nedräkningarna
public/kylskapet.html Kylskåpets sida, visas i Planeraren
convex/schema.ts      Tabeller: families, members
convex/families.ts    Skapa/gå med i familj, spara delad data, bjud in
convex/google.ts      Google Kalender via token från Clerk
```

Vad som sparas var:

| Var | Vad |
| --- | --- |
| Familjen (Convex) | Kylskåpets lappar, egna lappar per dag, hämta & lämna (personer, tider, vanlig vecka), var Google-händelser visas |
| Personen (Convex) | Vilka Google-kalendrar som visas, vem jag är i hämta & lämna, automatisk inskrivning |
| Enheten (webbläsaren) | Vilken vy som är öppen, ljust/mörkt läge |

## Köra lokalt

```bash
npm install
npx convex dev          # första gången: loggar in och skapar ett dev-projekt
cp .env.example .env.local   # fyll i VITE_CLERK_PUBLISHABLE_KEY
npm run dev
```

Se [SETUP.md](SETUP.md) för att sätta upp allt från början.
