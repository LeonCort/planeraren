/*
 * Planeraren — the bridge between the page and the services behind it.
 *
 *   Clerk   signs people in, and holds their Google connection (calendar access).
 *   Convex  keeps the family's shared data, live, and talks to Google Kalender.
 *
 * The planner itself (public/app/planner.js) and Kylskåpet (public/app/fridge.js) are
 * plain scripts. They only talk to window.__bridge, and to window.claude.use("mcp"),
 * which here is a small stand-in that sends the calendar calls to Convex instead.
 */
import { Clerk } from "@clerk/clerk-js";
import { svSE } from "@clerk/localizations";
import { ConvexClient } from "convex/browser";
import { anyApi } from "convex/server";
import { ConvexError } from "convex/values";

const api = anyApi;
const PK = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
/* what Planeraren asks Google for: read the list of calendars, read and write events */
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
];

const gate = document.getElementById("gate");
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]);
const show = (html) => {
  gate.hidden = false;
  gate.innerHTML = `<div class="gcard">${html}</div>`;
  return gate.firstElementChild;
};
const brand = `<div class="gbrand"><span class="glogo" aria-hidden="true"></span><h1 class="gdisp">Planeraren</h1></div>`;
const fail = (title, text) =>
  show(`${brand}<h2 class="gdisp">${esc(title)}</h2><p class="glead">${esc(text)}</p><button class="gbtn" onclick="location.reload()">Försök igen</button>`);

let clerk, convex;

function loadScript(src) {
  return new Promise((ok, no) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.onload = ok;
    s.onerror = () => no(new Error("Kunde inte ladda " + src));
    document.head.appendChild(s);
  });
}

/* ---------- start ---------- */
async function start() {
  if (!PK || !CONVEX_URL)
    return fail("Inställningar saknas", "VITE_CLERK_PUBLISHABLE_KEY och VITE_CONVEX_URL behöver vara satta när sidan byggs.");

  const clerkDomain = atob(PK.split("_")[2]).slice(0, -1);
  await loadScript(`https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`);
  clerk = new Clerk(PK);
  await clerk.load({
    ui: { ClerkUI: window.__internal_ClerkUICtor },
    localization: svSE,
    appearance: {
      variables: { colorPrimary: "#1d1740", fontFamily: "Nunito, 'Helvetica Neue', Arial, sans-serif", borderRadius: "14px" },
      /* deleting the account goes through the family menu, so the family data is cleaned up too */
      elements: { profileSection__danger: { display: "none" }, rootBox: { width: "100%", maxWidth: "100%" }, cardBox: { width: "100%", maxWidth: "100%" } },
    },
  });

  if (!clerk.isSignedIn) return signInView();

  convex = new ConvexClient(CONVEX_URL);
  const authed = await new Promise((ok) => {
    let done = false;
    convex.setAuth(fetchToken, (isAuth) => {
      if (!done) {
        done = true;
        ok(isAuth);
      }
    });
    setTimeout(() => !done && ((done = true), ok(false)), 15000);
  });
  if (!authed)
    return fail(
      "Inloggningen godtogs inte",
      "Servern kunde inte bekräfta inloggningen. Kontrollera att sessionen i Clerk har claim aud = convex och att CLERK_FRONTEND_API_URL är satt i Convex.",
    );

  const me = await convex.query(api.families.me, {});
  if (!me || !me.family) return onboardingView();
  boot(me);
}

async function fetchToken({ forceRefreshToken } = {}) {
  const s = clerk.session;
  if (!s) return null;
  /* the session token carries aud "convex" (set under Sessions → claims in Clerk, or by Clerk's Convex integration) */
  return await s.getToken({ skipCache: !!forceRefreshToken });
}

/* ---------- sign in ---------- */
function signInView() {
  const card = show(
    `${brand}<p class="glead">Familjens kalender, hämta &amp; lämna och kylskåpet med nedräkningar. Logga in för att börja.</p><div id="signin"></div><p class="gswap"><a class="glink" href="/integritet">Integritet</a> · <a class="glink" href="/villkor">Villkor</a></p>`,
  );
  clerk.mountSignIn(card.querySelector("#signin"), {
    forceRedirectUrl: location.href,
    signUpForceRedirectUrl: location.href,
  });
  clerk.addListener(({ user }) => {
    if (user) location.reload();
  });
}

/* ---------- create or join a family ---------- */
async function onboardingView(msg) {
  const params = new URLSearchParams(location.search);
  const code = (params.get("kod") || "").toUpperCase();
  const first = clerk.user?.firstName || "";
  let peek = null;
  if (code) {
    try {
      peek = await convex.query(api.families.peek, { code });
    } catch {}
  }
  const card = show(`${brand}
    ${msg ? `<p class="gerr" role="alert">${esc(msg)}</p>` : ""}
    ${
      peek
        ? `<h2 class="gdisp">Gå med i ${esc(peek.name)}</h2><p class="glead">Du har blivit inbjuden. Skriv vad du heter i familjen.</p>`
        : `<h2 class="gdisp">Välkommen!</h2><p class="glead">Skapa er familj, eller gå med i en som redan finns med koden du fått.</p>`
    }
    <form class="gform" id="fjoin" ${peek ? "" : "hidden"}>
      <label>Kod<input name="code" required maxlength="8" autocomplete="off" autocapitalize="characters" value="${esc(code)}"></label>
      <label>Ditt namn<input name="me" required maxlength="40" value="${esc(first)}" placeholder="Till exempel Pappa eller Leon"></label>
      <button class="gbtn">Gå med</button>
    </form>
    <form class="gform" id="fnew" ${peek ? "hidden" : ""}>
      <label>Familjens namn<input name="fam" required maxlength="40" placeholder="Till exempel Familjen Andersson"></label>
      <label>Ditt namn<input name="me" required maxlength="40" value="${esc(first)}"></label>
      <button class="gbtn">Skapa familjen</button>
    </form>
    <p class="gswap"><button type="button" class="glink" id="swap">${peek ? "Skapa en egen familj i stället" : "Jag har en kod"}</button></p>
    <p class="gswap"><button type="button" class="glink" id="out">Logga ut</button></p>`);
  const fj = card.querySelector("#fjoin"),
    fn = card.querySelector("#fnew");
  card.querySelector("#swap").onclick = (e) => {
    const toJoin = fj.hidden;
    fj.hidden = !toJoin;
    fn.hidden = toJoin;
    e.target.textContent = toJoin ? "Skapa en egen familj i stället" : "Jag har en kod";
  };
  card.querySelector("#out").onclick = signOut;
  const busy = (f, on) => f.querySelectorAll("input,button").forEach((x) => (x.disabled = on));
  fn.onsubmit = async (e) => {
    e.preventDefault();
    busy(fn, true);
    try {
      await convex.mutation(api.families.create, { familyName: fn.fam.value, myName: fn.me.value });
      location.replace("/");
    } catch (err) {
      busy(fn, false);
      onboardingView(errText(err));
    }
  };
  fj.onsubmit = async (e) => {
    e.preventDefault();
    busy(fj, true);
    try {
      await convex.mutation(api.families.join, { code: fj.code.value, myName: fj.me.value });
      location.replace("/");
    } catch (err) {
      busy(fj, false);
      onboardingView(errText(err));
    }
  };
}

function errText(err) {
  const c = err instanceof ConvexError ? err.data?.code : null;
  if (c === "bad_code") return "Koden hittades inte. Kontrollera den, eller be om en ny.";
  if (c === "already_in_family") return "Du är redan med i en familj.";
  if (c === "not_signed_in") return "Du behöver logga in igen.";
  return "Något gick fel. Försök igen om en stund.";
}

/* ---------- the running app ---------- */
function boot(me) {
  const SHARED = ["trackers", "items", "hl", "lv"];
  const shared = {},
    known = {};
  for (const k of SHARED) {
    shared[k] = me.family[k];
    known[k] = JSON.stringify(me.family[k] ?? null);
  }
  const listeners = [];
  let pending = {},
    timer = null,
    prefsPending = null,
    prefsTimer = null,
    prefsKnown = JSON.stringify(me.member.prefs || {});

  async function pushShared() {
    clearTimeout(timer);
    timer = null;
    const patch = pending;
    pending = {};
    if (!Object.keys(patch).length) return;
    try {
      await convex.mutation(api.families.setShared, patch);
    } catch (e) {
      console.error(e);
      toast("Kunde inte spara ändringen. Kontrollera nätet.");
    }
  }
  async function pushPrefs() {
    clearTimeout(prefsTimer);
    prefsTimer = null;
    const p = prefsPending;
    prefsPending = null;
    if (!p) return;
    try {
      await convex.mutation(api.families.setPrefs, { prefs: p });
    } catch (e) {
      console.error(e);
    }
  }

  const B = {
    me: { id: me.member._id, name: me.member.name },
    family: { name: me.family.name, inviteCode: me.family.inviteCode },
    members: me.members,
    shared,
    prefs: me.member.prefs || {},
    /* shared family data: only what really changed is sent, a moment later */
    setShared(patch) {
      for (const k of SHARED) {
        if (patch[k] === undefined) continue;
        const j = JSON.stringify(patch[k] ?? null);
        if (j === known[k]) continue;
        known[k] = j;
        shared[k] = JSON.parse(j);
        pending[k] = shared[k];
      }
      if (Object.keys(pending).length && !timer) timer = setTimeout(pushShared, 500);
    },
    setPrefs(p) {
      const next = { ...B.prefs, ...p };
      const j = JSON.stringify(next);
      if (j === prefsKnown) return;
      prefsKnown = j;
      B.prefs = next;
      prefsPending = next;
      if (!prefsTimer) prefsTimer = setTimeout(pushPrefs, 800);
    },
    async flush() {
      await Promise.all([pushShared(), pushPrefs()]);
    },
    onShared(fn) {
      listeners.push(fn);
    },
    hasGoogle,
    connectGoogle,
    openFamily,
    signOut,
  };
  window.__bridge = B;
  window.claude = { use: async (k) => (k === "mcp" ? mcpShim : k === "permissions" ? permShim : null) };
  addEventListener("pagehide", () => B.flush());
  document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && B.flush());

  /* live: when someone else in the family changes something, tell the page */
  convex.onUpdate(api.families.me, {}, (res) => {
    if (!res || !res.family) {
      location.replace("/");
      return;
    }
    B.family.name = res.family.name;
    B.family.inviteCode = res.family.inviteCode;
    B.members.splice(0, B.members.length, ...res.members);
    const changed = {};
    for (const k of SHARED) {
      if (k in pending) continue; // my own edit is on its way: it wins
      const j = JSON.stringify(res.family[k] ?? null);
      if (j === known[k]) continue;
      known[k] = j;
      shared[k] = res.family[k];
      changed[k] = res.family[k];
    }
    if (Object.keys(changed).length) for (const fn of listeners) try { fn(changed); } catch (e) { console.error(e); }
    if (document.getElementById("famsheet")) openFamily();
  });

  gate.hidden = true;
  gate.innerHTML = "";
  const s = document.createElement("script");
  s.src = "/app/planner.js";
  document.body.appendChild(s);

  if (new URLSearchParams(location.search).has("google")) history.replaceState(null, "", "/");
}

/* ---------- Google Kalender ---------- */
const googleAccount = () => clerk.user?.externalAccounts?.find((a) => a.provider === "google" || a.provider === "oauth_google");
function hasGoogle() {
  const a = googleAccount();
  if (!a || a.verification?.status !== "verified") return false;
  const got = String(a.approvedScopes || "").split(/\s+/);
  return SCOPES.every((s) => got.includes(s));
}
async function connectGoogle() {
  const redirectUrl = location.origin + "/?google=1";
  const a = googleAccount();
  const res = a
    ? await a.reauthorize({ additionalScopes: SCOPES, redirectUrl })
    : await clerk.user.createExternalAccount({ strategy: "oauth_google", redirectUrl, additionalScopes: SCOPES });
  const url = res?.verification?.externalVerificationRedirectURL;
  if (!url) throw new Error("Google svarade inte. Försök igen.");
  location.href = String(url.href || url);
}

const TZ = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "Europe/Stockholm";
  }
})();
/* local "2026-11-01T00:00:00" → an exact moment Google understands */
const exact = (s) => (s ? new Date(s).toISOString() : undefined);

const mcpShim = {
  async callTool(_server, tool, input = {}) {
    let i = { ...input };
    if (tool === "list_events")
      i = { calendarId: i.calendarId, timeMin: exact(i.startTime), timeMax: exact(i.endTime), timeZone: i.timeZone || TZ, pageToken: i.pageToken, pageSize: i.pageSize };
    else if (tool === "create_event" || tool === "update_event") i.timeZone = i.timeZone || TZ;
    try {
      const payload = await convex.action(api.google.call, { tool, input: i });
      return { payload };
    } catch (e) {
      const d = e instanceof ConvexError ? e.data || {} : { code: "server_unavailable", retryable: true };
      const err = new Error(d.message || d.code || "fel");
      err.code = d.code;
      err.retryable = !!d.retryable;
      throw err;
    }
  },
  async invalidate() {},
};
const permShim = {
  async state() {
    return hasGoogle() ? "granted" : "prompt";
  },
  async manage() {
    await connectGoogle();
  },
};

/* ---------- the family sheet: invite, names, sign out ---------- */
function openFamily() {
  const B = window.__bridge;
  let el = document.getElementById("famsheet");
  if (!el) {
    el = document.createElement("div");
    el.id = "famsheet";
    el.className = "gsheet";
    document.body.appendChild(el);
    el.addEventListener("click", (e) => e.target === el && el.remove());
    addEventListener("keydown", function k(e) {
      if (e.key === "Escape") {
        document.getElementById("famsheet")?.remove();
        removeEventListener("keydown", k);
      }
    });
  }
  const link = `${location.origin}/?kod=${B.family.inviteCode}`;
  el.innerHTML = `<div class="gcard" role="dialog" aria-modal="true" aria-labelledby="famh">
    <button class="gx" aria-label="Stäng" data-x>×</button>
    <h2 class="gdisp" id="famh">${esc(B.family.name)}</h2>
    <ul class="gmembers">${B.members.map((m) => `<li><span class="gdot" style="background:var(--${esc(m.color)})"></span>${esc(m.name)}${m.isMe ? " <small>(du)</small>" : ""}</li>`).join("")}</ul>
    <h3>Bjud in</h3>
    <p class="glead">Skicka länken till den du vill ha med. Hen loggar in och hamnar direkt i er familj.</p>
    <div class="gcode"><b>${esc(B.family.inviteCode)}</b><button class="gbtn sm" data-share>Dela länken</button></div>
    <p class="gswap"><button class="glink" data-newcode>Gör en ny kod (den gamla slutar gälla)</button></p>
    <h3>Namn</h3>
    <form class="gform" data-names>
      <label>Familjens namn<input name="fam" maxlength="40" value="${esc(B.family.name)}"></label>
      <label>Ditt namn<input name="me" maxlength="40" value="${esc(B.me.name)}"></label>
      <button class="gbtn sm">Spara</button>
    </form>
    <h3>Ditt konto</h3>
    <div class="grow" style="margin-top:6px">
      <button class="gbtn ghost" data-account>Kontoinställningar</button>
      <button class="gbtn ghost" data-out>Logga ut</button>
    </div>
    <div class="grow">
      <button class="gbtn ghost bad" data-leave>Lämna familjen</button>
      <button class="gbtn ghost bad" data-delete>Ta bort mitt konto</button>
    </div>
  </div>`;
  el.querySelector("[data-x]").onclick = () => el.remove();
  el.querySelector("[data-share]").onclick = async () => {
    const text = `Gå med i ${B.family.name} i Planeraren: ${link}`;
    try {
      if (navigator.share) await navigator.share({ title: "Planeraren", text, url: link });
      else {
        await navigator.clipboard.writeText(link);
        toast("Länken är kopierad.");
      }
    } catch {}
  };
  el.querySelector("[data-newcode]").onclick = async () => {
    await convex.mutation(api.families.newInviteCode, {});
  };
  el.querySelector("[data-names]").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    await convex.mutation(api.families.rename, { familyName: f.fam.value, myName: f.me.value });
    B.me.name = f.me.value.trim() || B.me.name;
    toast("Sparat.");
  };
  el.querySelector("[data-out]").onclick = signOut;
  el.querySelector("[data-account]").onclick = () => {
    el.remove();
    clerk.openUserProfile();
  };
  el.querySelector("[data-delete]").onclick = async () => {
    const alone = B.members.length <= 1;
    if (!confirm("Ta bort ditt konto för gott? Du lämnar " + B.family.name + (alone ? ", och eftersom du är sist kvar tas familjens kylskåp och lappar också bort." : ". Familjens lappar ligger kvar för de andra.") + " Inloggningen och Google-kopplingen tas bort.")) return;
    try {
      await B.flush();
      await convex.action(api.account.deleteMe, {});
    } catch (e) {
      return toast("Det gick inte att ta bort kontot. Försök igen om en stund.");
    }
    clearLocal();
    try {
      await clerk.signOut();
    } catch {}
    location.replace("/");
  };
  el.querySelector("[data-leave]").onclick = async () => {
    const alone = B.members.length <= 1;
    if (!confirm(alone ? "Du är sist kvar. Familjens kylskåp och lappar tas bort för gott. Lämna ändå?" : `Lämna ${B.family.name}? Du kan gå med igen med en ny inbjudan.`)) return;
    await B.flush();
    await convex.mutation(api.families.leave, {});
    clearLocal();
    location.replace("/");
  };
}

function clearLocal() {
  for (const k of ["planeraren.ui.v1", "planeraren.gcache", "kylskapet.ui.v1"]) try { localStorage.removeItem(k); } catch {}
}
async function signOut() {
  try {
    await window.__bridge?.flush();
  } catch {}
  clearLocal();
  await clerk.signOut();
  location.replace("/");
}

function toast(t) {
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.textContent = t;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

start().catch((e) => {
  console.error(e);
  fail("Planeraren kunde inte starta", String(e?.message || e));
});
