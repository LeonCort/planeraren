# Sätta upp Planeraren

Clerk-appen **Planeraren** är redan skapad (utvecklingsinstans). Där är Google-inloggning påslagen och sessionen har fått `aud = convex`, så att Convex godtar inloggningen.

- Clerk Frontend API URL: `https://saved-tick-6918.clerk.accounts.dev`
- Publishable key: `pk_test_c2F2ZWQtdGljay02OTE4LmNsZXJrLmFjY291bnRzLmRldiQ`

Kvar att göra, i den här ordningen:

## 1. Koden till GitHub

Lägg koden i repot `LeonCort/kylskapet` (eller ett nytt repo, till exempel `planeraren`) och pusha till `main`.

## 2. Convex (cirka 5 minuter)

1. Gå till [dashboard.convex.dev](https://dashboard.convex.dev), logga in med GitHub och skapa projektet **planeraren**.
2. Öppna **Production**-miljön → **Settings → Environment Variables** och lägg till:
   - `CLERK_FRONTEND_API_URL` = `https://saved-tick-6918.clerk.accounts.dev`
   - `CLERK_SECRET_KEY` = den hemliga nyckeln från Clerk (**Clerk → Planeraren → API keys → Secret key**, börjar med `sk_test_`)
3. **Settings → General → Deploy keys**: skapa en **Production deploy key** och kopiera den.

## 3. Vercel (cirka 5 minuter)

1. **Add New → Project** och importera GitHub-repot. Ramverket (Vite) och byggkommandot hämtas från `vercel.json`.
2. Under **Environment Variables**, för Production och Preview:
   - `VITE_CLERK_PUBLISHABLE_KEY` = `pk_test_c2F2ZWQtdGljay02OTE4LmNsZXJrLmFjY291bnRzLmRldiQ`
   - `CONVEX_DEPLOY_KEY` = deploy-nyckeln från steg 2
3. Klicka på **Deploy**. Bygget publicerar först Convex-funktionerna och sedan sidan. `VITE_CONVEX_URL` sätts automatiskt.

Nu går det att logga in, skapa familjen, bjuda in och använda kylskåpet och lapparna. Google Kalender kräver steg 4.

## 4. Google Kalender (cirka 10–15 minuter)

Clerks delade Google-uppgifter räcker för inloggning men inte för kalenderbehörighet. Därför behövs en egen OAuth-klient.

1. **Clerk → Planeraren → Configure → SSO connections → Google**: slå på **Use custom credentials**. Kopiera **Authorized redirect URI** som visas där.
2. **[console.cloud.google.com](https://console.cloud.google.com)**: skapa projektet **Planeraren**.
3. **APIs & Services → Library**: aktivera **Google Calendar API**.
4. **Google Auth Platform → Branding**: appnamn *Planeraren*, din e-post som support och kontakt. Under **Audience** väljer du *External*.
5. **Data Access → Add or remove scopes**: lägg till
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/calendar.calendarlist.readonly`
6. **Clients → Create client** → *Web application*:
   - **Authorized JavaScript origins**: din Vercel-adress, till exempel `https://planeraren.vercel.app`
   - **Authorized redirect URIs**: adressen från Clerk i steg 1
7. Kopiera **Client ID** och **Client secret** till Clerk (steg 1) och spara.
8. **Audience → Publish app** (läget *In production*).
   - Appen är då inte verifierad av Google. Vid första kopplingen visas en varning: välj *Avancerat → Gå till Planeraren*.
   - Upp till 100 personer kan koppla, och kopplingen slutar inte gälla efter 7 dagar som i testläget.

Sedan öppnar du **Google Kalender** i Planeraren och väljer **Koppla Google Kalender**.

## Senare

- **Egen domän och Clerks produktionsinstans.** Utvecklingsinstansen visar en liten "Development mode"-etikett och har begränsningar. Med en egen domän kan Clerks produktionsinstans skapas. Byt då nycklarna i Vercel och `CLERK_FRONTEND_API_URL` i Convex.
- **Fler familjer än er egen.** Skicka in appen för verifiering hos Google (integritetspolicy och verifierad domän krävs).
- **Fas 2: agenten.** Fritextuppdrag ("Rebecca hämtar på torsdag") sparas i Convex och genomförs av Claude via API:et, med samma Google-koppling som ovan.
