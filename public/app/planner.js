/* ---------- family days: the same ones that hang on Kylskåpet ---------- */
const DAY=86400000;
const WD=["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"];
const WDS=["sön","mån","tis","ons","tor","fre","lör"];
const MO=["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"];
const THEMES={
  jul:  {name:"Jul",      bg:"#f2483d",ink:"#fffaf0",svg:'<path d="M12 3 7 10h3l-4 5h4l-3 4h10l-3-4h4l-4-5h3z"/><path d="M12 19v2.5"/>'},
  nyar: {name:"Nyår",     bg:"#2b2370",ink:"#fff7e8",svg:'<path d="M12 12V4M12 12l6-5M12 12l-6-5M12 12l7 2M12 12l-7 2M12 12l4 7M12 12l-4 7"/><circle cx="12" cy="3" r=".8"/><circle cx="19" cy="6" r=".8"/><circle cx="5" cy="6" r=".8"/>'},
  kalas:{name:"Kalas",    bg:"#ff9ad5",ink:"#1d1740",svg:'<ellipse cx="12" cy="9" rx="5.5" ry="6.5"/><path d="m12 15.5-1 2h2zM12 17.5c0 2-2 2-2 4"/>'},
  mys:  {name:"Mys",      bg:"#6fe3a1",ink:"#1d1740",svg:'<path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20z"/>'},
  sommar:{name:"Sommar",  bg:"#ffcb3d",ink:"#1d1740",svg:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M3 12h2M19 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'},
  mids: {name:"Midsommar",bg:"#b4e86a",ink:"#1d1740",svg:'<circle cx="12" cy="6.6" r="2.6"/><circle cx="16.7" cy="9.3" r="2.6"/><circle cx="16.7" cy="14.7" r="2.6"/><circle cx="12" cy="17.4" r="2.6"/><circle cx="7.3" cy="14.7" r="2.6"/><circle cx="7.3" cy="9.3" r="2.6"/><circle cx="12" cy="12" r="2.2"/>'},
  pask: {name:"Påsk",     bg:"#ffe58a",ink:"#1d1740",svg:'<path d="M12 3c3.5 0 6 4.5 6 9a6 6 0 0 1-12 0c0-4.5 2.5-9 6-9z"/><path d="M7 11.5q2.5-2 5 0t5 0"/>'},
  spok: {name:"Spöke",    bg:"#ff8a2a",ink:"#1d1740",svg:'<path d="M5 21V11a7 7 0 0 1 14 0v10l-2.3-2-2.4 2-2.3-2-2.3 2-2.4-2z"/><circle cx="9.5" cy="11" r=".9"/><circle cx="14.5" cy="11" r=".9"/>'},
  fest: {name:"Fest",     bg:"#c58bff",ink:"#1d1740",svg:'<path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z"/>'}
};
function themeOf(t){
  const n=(t.name||"").toLowerCase();
  if(/jul|advent|lucia/.test(n))return "jul";
  if(/nyår|nyar/.test(n))return "nyar";
  if(/midsommar/.test(n))return "mids";
  if(/sommar|semester|lov|skolavslutning/.test(n))return "sommar";
  if(/påsk|pask/.test(n))return "pask";
  if(/halloween|spök/.test(n))return "spok";
  if(t.type==="birthday")return "kalas";
  if(t.type==="weekly")return "mys";
  return "fest";
}
const B=window.__bridge;
let TRACKERS=Array.isArray(B.shared.trackers)?B.shared.trackers.slice():[];

/* ---------- dates (DST-safe: compare by calendar day, not by milliseconds) ---------- */
const dnum=d=>Math.round(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/DAY);
const diff=(a,b)=>dnum(b)-dnum(a);
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const parse=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const today=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())};
const same=(a,b)=>dnum(a)===dnum(b);
const monday=d=>addDays(d,-((d.getDay()+6)%7));
function isoWeek(d){const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const dn=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-dn);const y0=new Date(Date.UTC(x.getUTCFullYear(),0,1));return Math.ceil(((x-y0)/DAY+1)/7)}
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;return new Date(y,mo-1,da)}
const MOVABLE={pask:y=>addDays(easter(y),-1),midsommar:y=>{const d=new Date(y,5,19);return addDays(d,(5-d.getDay()+7)%7)}};
const cap=w=>w[0].toUpperCase()+w.slice(1);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));

/* which family days land on a given date */
function daysOn(d){
  const out=[];
  for(const t of TRACKERS){if(t.src==="gcal"||t.type==="weekly")continue; /* veckodagar (Lördag, Fredagsmys) visas bara på kylskåpet */
    let hit=false,title=t.name;
    if(t.type==="weekly")hit=d.getDay()===t.weekday;
    else if(t.type==="once")hit=iso(d)===t.date;
    else if(t.movable)hit=same(MOVABLE[t.movable](d.getFullYear()),d);
    else{const o=parse(t.date);hit=o.getMonth()===d.getMonth()&&o.getDate()===d.getDate();
      if(hit&&t.type==="birthday")title=`${t.name} fyller ${d.getFullYear()-o.getFullYear()}`}
    if(hit)out.push({t,title,theme:themeOf(t),weekly:t.type==="weekly"});
  }
  return out.sort((a,b)=>a.weekly-b.weekly);
}
/* the next big day after a date (not the weekly ones) */
function nextBig(from){
  let best=null;
  for(const t of TRACKERS){if(t.type==="weekly"||t.src==="gcal")continue;
    let n;
    if(t.type==="once"){n=parse(t.date);if(n<from)continue}
    else if(t.movable){const f=MOVABLE[t.movable];n=f(from.getFullYear());if(n<from)n=f(from.getFullYear()+1)}
    else{const o=parse(t.date);n=new Date(from.getFullYear(),o.getMonth(),o.getDate());if(n<from)n=new Date(from.getFullYear()+1,o.getMonth(),o.getDate())}
    const left=diff(from,n);if(!best||left<best.left)best={t,left,n,title:t.type==="birthday"?`${t.name} fyller ${n.getFullYear()-parse(t.date).getFullYear()}`:t.name,theme:themeOf(t)};
  }
  if(typeof G!=="undefined")for(const e of G.ev.values()){if(!calOn(e.cal)||level(e)!=="kyl")continue;const n=parse(e.date);if(n<from)continue;const left=diff(from,n);
    if(!best||left<best.left)best={t:{name:e.title},left,n,title:e.title,theme:gTheme(e)}}
  return best;
}

/* ---------- state: what you wrote, saved in this browser ---------- */
/* ---------- state ----------
   Shared with the family (Convex): own notes (items), Hämta & lämna (hl), where Google events show (gc.lv).
   Mine (my account): Google calendar choices (gc), who I am (hl.me), auto-sync (hl.sync).
   This device only: which view is open, the date, light/dark. */
const KEY="planeraren.ui.v1";
const UI_KEYS=["view","at","theme","roll","back","cview"];
const pick=(o,ks)=>{const r={};for(const k of ks)if(o&&o[k]!==undefined)r[k]=o[k];return r};
const omit=(o,ks)=>{const r={...(o||{})};for(const k of ks)delete r[k];return r};
const clone=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
const load=()=>{let ui={};try{ui=JSON.parse(localStorage.getItem(KEY))||{}}catch{}
  const sh=B.shared||{},pr=B.prefs||{};
  return {view:"manad",at:iso(today()),theme:null,...pick(ui,UI_KEYS),
    items:clone(sh.items)||[],
    gc:{on:false,cals:{},...clone(pr.gc||{}),lv:clone(sh.lv)||{}},
    hl:{...clone(sh.hl||{}),me:pr.me,sync:pr.sync}}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(pick(S,UI_KEYS)))}catch{}
  B.setShared({items:S.items,lv:S.gc.lv,hl:omit(S.hl,["me","sync"])});
  B.setPrefs({gc:omit(S.gc,["lv"]),me:S.hl.me,sync:S.hl.sync})};
let S=load();
if(!Array.isArray(S.items))S.items=[];
const itemsOn=d=>S.items.filter(i=>i.date===iso(d)).sort((a,b)=>(a.time||"99")<(b.time||"99")?-1:(a.time||"99")>(b.time||"99")?1:0);
const uid=()=>Math.random().toString(36).slice(2,9);

/* ---------- icons ---------- */
const ICO=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${THEMES[k].svg}</svg>`;
const I={
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  prev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  next:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>'
};
const RING='<svg class="ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M56 5C84 4 98 27 96 52C94 79 72 97 46 95C19 94 3 74 4 48C5 22 27 6 57 8C66 9 73 12 79 16"/></svg>';
const isDark=()=>S.theme?S.theme==="dark":!matchMedia("(prefers-color-scheme: light)").matches;
const applyTheme=()=>{if(S.theme)document.documentElement.dataset.theme=S.theme;else delete document.documentElement.dataset.theme};

/* ---------- views ---------- */
const app=document.getElementById("app");
const VIEWS=[["manad","Månad"],["vecka","Vecka"],["dag","Dag"],["hamta","Hämta"],["kyl","Kylskåpet"]];
let dir=0;
const at=()=>parse(S.at);
const chip=(e,small)=>`<span class="chip ${e.weekly?"wkly":""}" style="--th:${THEMES[e.theme].bg};--thi:${THEMES[e.theme].ink}" title="${esc(e.title)}">${ICO(e.theme)}<span>${esc(small&&e.t.type==="birthday"?e.t.name:e.title)}</span></span>`;
const evRow=(e,T,d)=>{const left=diff(T,d);return `<div class="ev ${e.weekly?"wkly":""}" style="--th:${THEMES[e.theme].bg};--thi:${THEMES[e.theme].ink}">${ICO(e.theme)}<span>${esc(e.title)}</span>${!e.weekly&&left>0?`<span class="lft">${left} ${left===1?"natt":"nätter"}</span>`:left===0&&!e.weekly?'<span class="lft">idag!</span>':""}</div>`};
const tdRow=i=>`<div class="td ${i.done?"done":""}" data-id="${i.id}" data-drag="n:${i.id}"><button class="cb" data-act="toggle" data-id="${i.id}" aria-label="${i.done?"Markera som inte klar":"Markera som klar"}" aria-pressed="${!!i.done}">${I.check}</button><span class="tx">${esc(i.text)}</span>${i.time?`<span class="tm">${esc(i.time)}</span>`:""}<button class="x" data-act="del" data-id="${i.id}" aria-label="Ta bort">${I.x}</button></div>`;

const CALV=["manad","vecka","dag"],isCal=v=>CALV.includes(v);
let moreOpen=false;
const NI={
  more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2.3"/><circle cx="12" cy="12" r="2.3"/><circle cx="19" cy="12" r="2.3"/></svg>',
  rule:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h11M4 12h16M4 17h8"/><circle cx="18" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M14 14h2M8 17h2"/></svg>',
  hl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="2.4"/><circle cx="16.5" cy="9" r="2"/><path d="M8 9.5v5.5M8 15l-2.5 5M8 15l2.5 5M5 12h6"/><path d="M16.5 11.5v4M16.5 15.5l-2 4.5M16.5 15.5l2 4.5M11 12.5h5.5"/></svg>',
  kyl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2.5" width="14" height="19" rx="3"/><path d="M5 9.5h14M8.5 5.5v2M8.5 12.5v3"/></svg>',
  fam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/></svg>'
};
/* which day a new note lands on: the open day, or today when today is on screen */
function newDate(){
  const T=today(),a=at();if(S.view==="dag")return S.at;
  let from,to;
  if(S.view==="manad"){from=new Date(a.getFullYear(),a.getMonth(),1);to=new Date(a.getFullYear(),a.getMonth()+1,0)}
  else{from=S.view==="vecka"?weekStart(S):monday(a);to=addDays(from,6)}
  return T>=from&&T<=to?iso(T):iso(from);
}
/* phones: Kalender, Hämta and Kylskåpet live in a bar at the bottom */
const bnav=()=>(S.view!=="kyl"?`<button class="fab" data-act="new" aria-label="Ny lapp">${I.plus}</button>`:"")+`<nav class="bnav" aria-label="Huvudmeny">${[["manad","Kalender",NI.cal,isCal(S.view)],["hamta","Hämta",NI.hl,S.view==="hamta"],["kyl","Kylskåpet",NI.kyl,S.view==="kyl"]].map(([v,l,ic,on])=>`<button data-view="${v}" ${on?'aria-current="page"':""}>${ic}<span>${l}</span></button>`).join("")}<button data-act="more" aria-expanded="${moreOpen}" ${moreOpen?'class="on"':""}>${NI.more}<span>Mer</span></button>${moreOpen?moreMenu():""}</nav>`;
const moreMenu=()=>`<div class="more" role="menu">
  ${G.avail?`<button role="menuitem" data-act="gcal">${I.cal}<span>Google Kalender<small>${S.gc.on?(G.state==="err"?"Något gick fel":"Kopplad"):"Inte kopplad"}</small></span></button>`:""}
  ${G.avail&&S.gc.on?`<button role="menuitem" data-act="rule">${NI.rule}<span>Vanlig vecka<small>Hämta & lämna-rytmen</small></span></button>`:""}
  <button role="menuitem" data-act="theme">${isDark()?I.sun:I.moon}<span>${isDark()?"Ljust läge":"Mörkt läge"}<small>Just nu ${isDark()?"mörkt":"ljust"}</small></span></button>
  <button role="menuitem" data-act="family">${NI.fam}<span>${esc(B.family.name)}<small>Bjud in, namn, konto</small></span></button>
</div>`;
const tabs=()=>`<div class="tabs" role="tablist" aria-label="Läge">${VIEWS.map(([k,l])=>`<button class="pill ${isCal(k)?"":"tx"}" role="tab" data-view="${k}" aria-selected="${S.view===k}">${l}</button>`).join("")}</div>`;
function header(title,sub){
  if(isCal(S.view))S.cview=S.view;
  if(S.view==="kyl")return `<header class="top kyl">${tabs()}</header>${bnav()}`;
  return `${bnav()}<header class="top ${isCal(S.view)?"":"nocal"}">
    ${tabs()}
    <div class="nav">
      <button class="pill ico" data-step="-1" aria-label="Bakåt">${I.prev}</button>
      <h1 class="disp">${title}<small>${sub}</small></h1>
      <button class="pill ico" data-step="1" aria-label="Framåt">${I.next}</button>
    </div>
    <div class="act">${S.view==="vecka"||((S.view==="dag")&&S.back)?'<i class="brk"></i>':""}
      ${(S.view==="dag"||S.view==="vecka")&&S.back?`<button class="pill back" data-act="back">${I.prev}<span>Tillbaka<i class="bt"> till ${S.back.view==="dag"?"dagen":VIEWS.find(v=>v[0]===S.back.view)[1].toLowerCase()}</i></span></button>`:""}
      ${S.view==="vecka"?`<button class="pill rollb ${S.roll?"on":""}" data-act="roll" title="Växla mellan vecka (mån–sön) och sju dagar från idag">${S.roll?"Visa veckan":"7 dagar"}</button>`:""}
      <button class="pill" data-act="today">Idag</button>
      ${G.avail?`<button class="pill ico gcb ${G.state==="loading"?"loading":G.state==="err"?"err":!S.gc.on?"off":""}" data-act="gcal" aria-label="Google Kalender" title="Google Kalender">${I.cal}</button>`:""}
      <button class="pill ico" data-act="theme" aria-label="${isDark()?"Ljust läge":"Mörkt läge"}">${isDark()?I.sun:I.moon}</button>
      <button class="pill ico famb" data-act="family" aria-label="${esc(B.family.name)}: bjud in, namn, konto" title="${esc(B.family.name)}">${NI.fam}</button>
      <button class="pill c2" data-act="new" aria-label="Ny lapp">${I.plus}<span class="txt"> Ny lapp</span></button>
    </div>
  </header>`;
}

function monthView(){
  const T=today(),a=at(),first=new Date(a.getFullYear(),a.getMonth(),1),start=monday(first);
  const last=new Date(a.getFullYear(),a.getMonth()+1,0),rows=Math.ceil((diff(start,last)+1)/7);
  let cells="",i=0;
  for(let r=0;r<rows;r++){
    const d0=addDays(start,r*7);
    cells+=`<button class="wk" data-week="${iso(d0)}" title="Öppna vecka ${isoWeek(d0)}" aria-label="Öppna vecka ${isoWeek(d0)}"><small>v</small><b>${isoWeek(d0)}</b></button>`;
    for(let k=0;k<7;k++){
      const d=addDays(d0,k),out=d.getMonth()!==a.getMonth(),ev=daysOn(d),its=itemsOn(d),big=ev.filter(e=>!e.weekly),wk=ev.filter(e=>e.weekly);
      const gk=gcOn(d,"kyl"),gp=gcOn(d,"plan");
      const timed=[...its.map(x=>[x.time||"",`<span class="chip note ${x.done?"done":""}" data-drag="n:${x.id}">${x.time?`<b>${esc(x.time)}</b> `:""}${esc(x.text)}</span>`]),...gp.map(e=>[e.allDay?"":e.time,gcChip(e,d)])].sort((a,b)=>(a[0]||"99")<(b[0]||"99")?-1:1).map(x=>x[1]);
      const shown=[...big.map(e=>chip(e,true)),...gk.map(e=>gcChip(e,d)),...timed];
      const more=shown.length>3?`<span class="chip more">+${shown.length-3} till</span>`:"";
      cells+=`<button class="day ${out?"out":""} ${k>=5?"wkend":""} ${same(d,T)?"today":""} ${!out&&d<T?"past":""}" data-go="${iso(d)}" data-drop="${iso(d)}" style="--i:${i++};view-transition-name:${vtn(d)}" aria-label="${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}">
        <span class="n">${d.getDate()}${same(d,T)?RING:""}</span>${G.loaded&&!out?((l,h)=>l.who||h.who?`<span class="hli" aria-hidden="true">${[l,h].map((w,j)=>w.who?`<b class="${w.inf?"inf":""}" style="--pc:${hlColor(w.who)}" title="${j?"Hämtar":"Lämnar"} ${esc(w.who)}">${esc(hlInit(w.who))}</b>`:`<b class="no">·</b>`).join("")}</span>`:"")(hlWho(d,"l"),hlWho(d,"h")):""}
        <span class="items">${shown.slice(0,3).join("")}${more}</span>
        <span class="dots">${big.map(e=>`<i style="--th:${THEMES[e.theme].bg}"></i>`).join("")}${gk.map(e=>`<i style="--th:${THEMES[gTheme(e)].bg}"></i>`).join("")}${gp.map(()=>`<i class="gp"></i>`).join("")}${its.map(()=>`<i style="--th:var(--paper)"></i>`).join("")}${wk.map(e=>`<i style="--th:${THEMES[e.theme].bg};opacity:.5"></i>`).join("")}</span>
      </button>`;
    }
  }
  return `<section class="view month" style="--dir:${dir}">
    <div class="wdh"><span></span>${[1,2,3,4,5,6,0].map(k=>`<span>${WDS[k]}</span>`).join("")}</div>
    <div class="grid">${cells}</div>
  </section>`;
}

const vtn=d=>"d"+iso(d).replace(/-/g,"");
function weekStart(st){return st.roll?today():monday(parse(st.at))}
function weekView(){return `<section class="view week" style="--dir:${dir}">${weekCols(weekStart(S),7)}</section>`}
function weekCols(m,n){
  const T=today();
  return Array.from({length:n},(_,i)=>i).map(i=>{
    const d=addDays(m,i),k=(d.getDay()+6)%7,ev=daysOn(d),its=itemsOn(d),isT=same(d,T);
    return `<article class="wnote ${d.getDay()%6===0?"wkend":""} ${isT?"today":""} ${d<T?"past":""}" data-drop="${iso(d)}" style="--i:${i%7};--r:${[-1.2,.8,-.6,1.1,-.9,.7,-1.4][k]}deg;--mag:var(--c${k%6+1});view-transition-name:${vtn(d)}">
      <button class="hd" data-go="${iso(d)}" aria-label="Öppna ${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}"><span class="wd">${WD[d.getDay()]}</span><span class="dn">${d.getDate()}${isT?RING:""}</span></button>
      ${hlReady()&&G.loaded&&(d.getDay()%6!==0||hlOn(d,"l")||hlOn(d,"h"))?`<div class="hlstrip">${hlBtn(d,"l")}${hlBtn(d,"h")}</div>`:""}
      <div class="list">
        ${ev.map(e=>evRow(e,T,d)).join("")}
        ${gcOn(d,"kyl").map(e=>gcRow(e,d)).join("")}
        ${mix(its,gcOn(d,"plan"),d)}
      </div>
      <button class="pill add" data-add="${iso(d)}">${I.plus} Skriv en lapp</button>
    </article>`;
  }).join("");
}

function dayView(){
  const T=today(),d=at(),ev=daysOn(d),its=itemsOn(d),left=diff(T,d),nb=nextBig(addDays(d,1));
  const gk=gcOn(d,"kyl"),gp=gcOn(d,"plan");
  const big=ev.find(e=>!e.weekly)||(gk[0]&&{theme:gTheme(gk[0])}),pc=big?THEMES[big.theme].bg:(d.getDay()===0||d.getDay()===6?"var(--c2)":"var(--c3)"),pi=big?THEMES[big.theme].ink:"#1d1740";
  const rel=left===0?"Idag":left===1?"Imorgon":left===-1?"Igår":left>1?`Om ${left} nätter`:`För ${-left} nätter sedan`;
  const done=its.filter(i=>i.done).length;
  return `<section class="view dayv one" style="--dir:${dir}">
   <article class="daycard" style="view-transition-name:${vtn(d)}">
    <div class="poster" style="--pc:${pc};color:${pi}">
      <div class="dtools"><button class="pill dt" data-act="${S.back?"back":"tomonth"}">${I.prev}<span>${S.back&&S.back.view!=="manad"?VIEWS.find(v=>v[0]===S.back.view)[1]:"Månad"}</span></button>${left!==0?`<button class="pill dt" data-act="today">Idag</button>`:""}</div>
      <span class="wd">${WD[d.getDay()]} · ${rel} · vecka ${isoWeek(d)}</span>
      <span class="big disp" id="bignum" title="Tryck för konfetti">${d.getDate()}</span>
      <span class="mo disp">${MO[d.getMonth()]} ${d.getFullYear()}</span>
      ${hlReady()&&G.loaded&&(d.getDay()%6!==0||hlOn(d,"l")||hlOn(d,"h"))?`<div class="hlstrip">${hlBtn(d,"l")}${hlBtn(d,"h")}</div>`:""}
      <div class="evs">${ev.length||gk.length?ev.map(e=>evRow(e,T,d)).join("")+gk.map(e=>gcRow(e,d)).join(""):'<p class="empty">Ingen särskild dag. Men en bra dag ändå!</p>'}</div>
      ${nb?`<button class="nxt" data-go="${iso(nb.n)}">${ICO(nb.theme).replace("<svg",'<svg style="width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round"')}<span class="big2">${nb.left}</span><span class="lb">${nb.left===1?"natt":"nätter"} till ${esc(nb.title)}<small>${WD[nb.n.getDay()]} ${nb.n.getDate()} ${MO[nb.n.getMonth()]}</small></span></button>`:""}
    </div>
    <div class="sheet">
      <div class="list">
        ${renderSections(its,gp,d)}
      </div>
      <form class="add-row" data-date="${iso(d)}">
        <input type="time" name="time" aria-label="Tid">
        <input type="text" name="text" placeholder="${gcW()&&gDest()?"Ny händelse i Google Kalender":"Vad händer?"}" maxlength="80" autocomplete="off" required aria-label="Text">
        ${gcW()?`<button class="pill gtog" type="button" data-act="gdest" aria-pressed="${gDest()}" aria-label="Spara i Google Kalender" title="Spara i Google Kalender">${I.cal}</button>`:""}
        <button class="pill c2" type="submit">${I.plus}<span> Lägg till</span></button>
      </form>
    </div>
   </article>
  </section>`;
}
/* the day as a time rail: 07–20 by default (wider if something is earlier/later),
   each thing sits at the height of its time; blocks never overlap, a later one is nudged down */
let tlFit=0;
/* measure the room below the timeline's top; render again if it changed */
function fitTl(){const L=app.querySelector(".stage .daycard .list"),tl=L&&L.querySelector(".tl.prop");if(!tl)return;
  const loose=tl.getBoundingClientRect().top-L.getBoundingClientRect().top+L.scrollTop;
  const room=Math.round(L.clientHeight-(parseFloat(getComputedStyle(L).paddingBottom)||0)-loose-12);if(room>120&&Math.abs(room-tlFit)>3){tlFit=room;still=true;render()}}
addEventListener("resize",()=>{if(S.view==="dag"){tlFit=0;still=true;render()}});
function renderSections(its,gp=[],d){
  const toM=t=>{const [h,m]=String(t).split(":").map(Number);return h*60+(m||0)};
  const rows=[...its.map(i=>[i.time,tdRow(i),""]),...gp.map(e=>{const t=e.allDay||iso(d)!==e.date?"":e.time;return [t,gcRow(e,d),t&&e.tEnd&&e.tEnd>t?e.tEnd:""]})].sort((a,b)=>(a[0]||"")<(b[0]||"")?-1:1);
  const loose=rows.filter(r=>!r[0]).map(r=>r[1]).join("");
  /* timed things: start and end in minutes; a note without an end counts as one hour */
  const evs=rows.filter(r=>r[0]).map(([t,h,end])=>{const a=toM(t);return {a,b:end?Math.max(toM(end),a+15):a+60,h,t}});
  const mob=matchMedia("(max-width:760px)").matches;
  let h0=7,h1=20;for(const e of evs){h0=Math.min(h0,Math.floor(e.a/60));h1=Math.max(h1,Math.ceil(e.b/60))}
  h1=Math.min(h1,24);
  /* the hours share the height the card has, so the whole day fits on screen */
  const ph=tlFit?Math.max(18,(tlFit-14)/(h1-h0)):(mob?48:56),Y=m=>(m-h0*60)/60*ph,MINH=mob?26:30;
  /* things that overlap in time stand side by side: group overlapping ones, give each a column */
  for(const e of evs)e.vb=Math.max(e.b,e.a+MINH/ph*60);
  const clusters=[];let cur=null;
  for(const e of evs.sort((x,y)=>x.a-y.a||y.b-x.b)){if(!cur||e.a>=cur.end){cur={end:e.vb,items:[],cols:[]};clusters.push(cur)}
    let c=cur.cols.findIndex(endM=>endM<=e.a);if(c<0){c=cur.cols.length;cur.cols.push(0)}cur.cols[c]=e.vb;e.col=c;cur.items.push(e);cur.end=Math.max(cur.end,e.vb)}
  const G=62,cards=[];
  for(const cl of clusters){const n=cl.cols.length;for(const e of cl.items){const top=Y(e.a),hgt=Math.max(MINH,Y(e.b)-top)-3;
    cards.push(`<div class="tlc${hgt<46?" short":""}${n>1?" side":""}" style="top:${top.toFixed(1)}px;height:${hgt.toFixed(1)}px;left:calc(${G}px + (100% - ${G}px) * ${e.col}/${n});width:calc((100% - ${G}px) / ${n} - ${n>1?4:0}px)" data-t="${esc(e.t)}">${e.h}</div>`)}}
  const dots=[...new Set(evs.map(e=>e.a))].map(a=>`<i class="tld" style="top:${Y(a).toFixed(1)}px"></i>`).join("");
  const H=(h1-h0)*ph,taken=[];
  let now="";if(d&&same(d,today())){const n=new Date(),m=n.getHours()*60+n.getMinutes();if(m>=h0*60&&m<=h1*60){taken.push(Y(m));now=`<div class="tlnow" style="top:${Y(m)}px"><span class="tlt">${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}</span><i></i></div>`}}
  const hrs=[];for(let h=h0;h<=h1;h++){const y=(h-h0)*ph;hrs.push(`<div class="hr" style="top:${y}px">${taken.some(t=>Math.abs(t-y)<14)||(ph<24&&h%2)?"":`<span>${String(h).padStart(2,"0")}</span>`}</div>`)}
  const empty=!evs.length&&!loose?`<p class="tlempty">Inget inskrivet än</p>`:"";
  return loose+`<div class="tl prop" style="height:${H}px">${hrs.join("")}${dots}${cards.join("")}${now}${empty}</div>`;
}
/* notes and planner-only Google events, in time order */
const mix=(its,gp,d)=>[...its.map(i=>[i.time,tdRow(i)]),...gp.map(e=>[e.allDay||iso(d)!==e.date?"":e.time,gcRow(e,d)])].sort((a,b)=>(a[0]||"")<(b[0]||"")?-1:1).map(x=>x[1]).join("");
/* ---------- Google Kalender ----------
   The page reads your calendar with your own Google connection (read only).
   Every event gets one of three levels:
     kyl  = on the fridge and in the planner (the important, fun things)
     plan = only in the planner (routines, work, appointments)
     hide = not shown at all
   A guess is made from simple rules (autoLevel), and a tap on an event lets you choose yourself.
   Your choice is remembered per event, and for a repeating event it covers every time it repeats. */
const GC="Google Calendar";
if(!S.gc||typeof S.gc!=="object")S.gc={on:false,cals:{},lv:{}};
S.gc.cals=S.gc.cals||{};S.gc.lv=S.gc.lv||{};
const G={avail:false,state:"off",msg:null,cals:[],ev:new Map(),done:new Set(),fail:new Set(),busy:new Set(),stamp:0,loaded:false,ids:new Map()};
let mcp=null,perms=null;
const hm=d=>String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
const lc=s=>String(s||"").toLowerCase().replace(/[^a-zåäö0-9]+/g," ").trim();
const FUN=/(kalas|födelsedag|fyller\s|resa\b|resan|semester|lov\b|lovet|fest\b|festen|bröllop|\bbio\b|utflykt|besök|mormor|morfar|farmor|farfar|skolfoto|lucia|avslutning|konsert|\bmatch|\bcup\b|teater|camping|stugan?\b|flyg|hotell|nöjespark|djurpark|\bzoo\b|party|birthday|vacation|holiday|\btrip\b)/i;
const isHoliday=c=>/#holiday@/.test(c.id)||/helgdag|holiday/i.test(c.summary||"");
const isWeekNum=c=>/#weeknum@/.test(c.id)||/veckonummer|week numbers/i.test(c.summary||"");
const isContacts=c=>/#contacts@/.test(c.id);
const calOn=id=>S.gc.cals[id]?.on!==false;
function autoLevel(e,cal,allDay,days){
  const txt=(e.summary||"")+" "+(e.description||"");
  if(/[⭐★]|#kyl\b/i.test(txt))return ["kyl","har ⭐ eller #kyl i namnet"];
  if(/#dölj\b|#hide\b/i.test(txt))return ["hide","har #dölj i namnet"];
  if(hlParse(e.summary))return ["plan","hämta och lämna"];
  if(isHoliday(cal))return ["plan","helgdag ur kalendern"];
  if(e.eventType==="outOfOffice"||e.eventType==="focusTime")return ["plan","jobb"];
  const others=(e.attendees||[]).filter(a=>!a.self&&!a.resource).length;
  if(e.conferenceData||/teams|zoom|meet\.google|webex/i.test((e.location||"")+" "+(e.description||"").slice(0,400))||others>=3)return ["plan","ser ut som ett jobbmöte"];
  if(e.recurringEventId)return ["plan","återkommer varje gång, så det är vardag"];
  if(allDay&&days>=2)return ["kyl","flera dagar i rad"];
  if(FUN.test(e.summary||""))return ["kyl","låter roligt (kalas, resa, lov …)"];
  return ["plan","vanlig händelse"];
}
const level=e=>S.gc.lv[e.key]||e.auto[0];
function normEv(e,cal){
  if(!e||e.status==="cancelled"||e.eventType==="workingLocation"||!e.start)return null;
  const me=(e.attendees||[]).find(a=>a.self);if(me&&me.responseStatus==="declined")return null;
  const allDay=!!e.start.date;let s,last,time="",tEnd="",dur=0;
  if(allDay){s=parse(e.start.date);last=addDays(parse((e.end&&e.end.date)||e.start.date),-1);if(last<s)last=s}
  else{const a=new Date(e.start.dateTime),b=new Date((e.end&&e.end.dateTime)||e.start.dateTime);if(isNaN(a))return null;
    s=new Date(a.getFullYear(),a.getMonth(),a.getDate());const bb=new Date(Math.max(+a,b-1));last=new Date(bb.getFullYear(),bb.getMonth(),bb.getDate());time=hm(a);tEnd=hm(b);dur=Math.max(0,b-a)}
  if(diff(s,last)>62)last=addDays(s,62);
  const days=diff(s,last)+1;
  const title=(e.summary||"Utan namn").replace(/#kyl\b|#dölj\b|#hide\b|[⭐★]\uFE0F?/gi,"").replace(/\s+/g," ").trim()||"Utan namn";
  const os=e.originalStartTime||e.start,od=os.date?parse(os.date):new Date(os.dateTime);
  return {gen:/Planeraren · auto/.test(e.description||""),dur,eid:e.id,rid:e.recurringEventId||null,owd:isNaN(od)?s.getDay():od.getDay(),hl:hlParse(title),uid:cal.id+"|"+e.id,key:cal.id+"|"+(e.recurringEventId||e.id),cal:cal.id,rec:!!e.recurringEventId,title,date:iso(s),last:iso(last),days,time,tEnd,allDay,auto:autoLevel(e,cal,allDay,days)};
}
/* Google events on one day, without ones you hid, turned-off calendars and holidays the family days already show */
function gcOn(d,lv){
  if(!G.ev.size)return [];const k=iso(d);let fam=null;const out=[];
  for(const e of G.ev.values()){
    if(e.hl||e.date>k||e.last<k||!calOn(e.cal))continue;const L=level(e);if(L==="hide"||(lv&&L!==lv))continue;
    if(G.hol.has(e.cal)){fam=fam||daysOn(d).flatMap(f=>[lc(f.title),lc(f.t.name)]);if(fam.includes(lc(e.title)))continue}
    out.push(e);
  }
  return out.sort((a,b)=>(a.allDay?"00":a.time)<(b.allDay?"00":b.time)?-1:1);
}
G.hol=new Set();
const gTheme=e=>themeOf({name:e.title});
const gWhen=(e,d)=>e.allDay?(e.days>1?`dag ${diff(parse(e.date),d)+1}/${e.days}`:""):(iso(d)===e.date?e.time:"");
const gcRow=(e,d)=>{const L=level(e),th=gTheme(e),t=gWhen(e,d);
  return `<button class="ev gc ${L}" data-gev="${esc(e.uid)}" data-drag="g:${esc(e.uid)}" ${L==="kyl"?`style="--th:${THEMES[th].bg};--thi:${THEMES[th].ink}"`:""} aria-label="${esc(e.title)}${t?", "+t:""}. Tryck för att välja var den syns">${L==="kyl"?ICO(th):I.cal}<span>${esc(e.title)}</span>${t?`<span class="lft">${esc(t)}</span>`:""}${t&&e.tEnd&&!e.allDay?`<span class="lft end">–${esc(e.tEnd)}</span>`:""}</button>`};
const gcChip=(e,d)=>{const L=level(e),th=gTheme(e),t=e.allDay?"":(iso(d)===e.date?e.time:"");
  return L==="kyl"?`<span class="chip" data-drag="g:${esc(e.uid)}" style="--th:${THEMES[th].bg};--thi:${THEMES[th].ink}">${ICO(th)}<span>${esc(e.title)}</span></span>`
    :`<span class="chip gplan" data-drag="g:${esc(e.uid)}">${t?`<b>${esc(t)}</b> `:""}${esc(e.title)}</span>`};

/* what the page says when Google answers with an error, per kind of error */
function gErr(e){
  const c=e&&e.code;
  if(c==="needs_reauth")return {msg:"Kopplingen till Google Kalender har gått ut. Tryck på Koppla Google Kalender igen.",drop:true,gone:true};
  if(c==="needs_google"||c==="server_not_connected"||c==="server_not_found")return {msg:"Planeraren behöver få läsa och skriva i din Google Kalender. Tryck på Koppla Google Kalender.",drop:true,google:true};
  if(c==="server_misconfigured")return {msg:"Servern saknar en inställning för Google. Säg till den som satte upp Planeraren."};
  if(c==="selection_required")return {msg:"Du har flera Google-konton. Välj vilket som ska användas i rutan som visades, och tryck sedan på Försök igen."};
  if(c==="not_in_manifest"||c==="consent_required")return {msg:"Planeraren har inte fått läsa kalendern. Du kan tillåta det under Behörigheter.",drop:true,perm:true};
  if(c==="blocked_by_policy")return {msg:"Din organisation tillåter inte att sidan läser Google Kalender.",drop:true};
  if(c==="approval_required")return {msg:"Kalendern behöver ditt godkännande. Tryck på Försök igen och välj Tillåt."};
  if(c==="not_granted"||c==="capability_disabled"||c==="capability_removed")return {msg:"Kalendern går inte att nå i den här vyn.",drop:true,gone:true};
  if(c==="user_changed")return {msg:null,drop:true,gone:true};
  if(c==="server_unavailable"||c==="rate_limited")return {msg:"Google svarar inte just nu. Försök igen om en stund."};
  if(c==="tool_error")return {msg:"Google kunde inte läsa en av kalendrarna."};
  return {msg:"Något gick fel när kalendern skulle läsas. Försök igen om en stund."};
}
async function callGC(tool,input,again){
  try{
    const r=await mcp.callTool(GC,tool,input,{cache:{staleTime:10*60e3,gcTime:24*3600e3}});
    let p=r&&r.payload;
    if(p===undefined){const t=(r&&r.content||[]).find(c=>c.type==="text");try{p=JSON.parse(t.text)}catch{p=null}}
    return p||{};
  }catch(e){
    if(e&&e.retryable&&!again){await new Promise(ok=>setTimeout(ok,Math.min(e.retryAfterMs||1500,15000)+Math.random()*800));return callGC(tool,input,true)}
    throw e;
  }
}
function gFail(e){
  const r=gErr(e);G.state="err";G.msg=r.msg;
  if(r.drop){G.ev.clear();G.done.clear();G.loaded=false}
  if(r.gone){G.state="off"}
  if(r.google){G.state="off"} /* the Google token is missing here; keep the choice, it belongs to the person on every device */
  G.perm=!!r.perm;
  refreshUI();
}
const ymKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
/* months to read: what you are looking at, plus today and six months ahead (for the fridge) */
function wantedMonths(){
  const a=at(),T=today(),set=new Set();
  const add=d=>set.add(ymKey(d));
  if(S.view==="vecka"||S.view==="hamta"){add(monday(a));add(addDays(monday(a),6))}else add(a);
  if(S.view==="manad"){add(monday(new Date(a.getFullYear(),a.getMonth(),1)));add(addDays(new Date(a.getFullYear(),a.getMonth()+1,0),6))}
  for(let i=0;i<=6;i++)add(new Date(T.getFullYear(),T.getMonth()+i,1));
  return [...set];
}
async function fetchMonth(cal,ym){
  const [y,m]=ym.split("-").map(Number),pad=n=>String(n).padStart(2,"0");
  const e=new Date(y,m,1),base={calendarId:cal.id,startTime:`${y}-${pad(m)}-01T00:00:00`,endTime:`${e.getFullYear()}-${pad(e.getMonth()+1)}-01T00:00:00`,orderBy:"startTime",pageSize:250};
  try{base.timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone}catch{}
  let token=null,n=0;const got=[];
  do{const p=await callGC("list_events",token?{...base,pageToken:token}:base);
    for(const ev of p.events||[]){const x=normEv(ev,cal);if(x)got.push(x)}
    token=p.nextPageToken;n++}while(token&&n<6);
  /* replace what we had for this calendar and month, so moved or deleted events disappear */
  for(const [k,v] of G.ev)if(v.cal===cal.id&&v.date.slice(0,7)===ym)G.ev.delete(k);
  for(const x of got)G.ev.set(x.uid+"@"+x.date,x);
}
/* keep the last calendar read in this browser, so the page opens with it at once instead of filling in later */
const GCACHE="planeraren.gcache";
function gSaveCache(){try{localStorage.setItem(GCACHE,JSON.stringify({t:Date.now(),cals:G.cals,ev:[...G.ev.values()]}))}catch{}}
function gLoadCache(){try{const c=JSON.parse(localStorage.getItem(GCACHE));if(!c||!Array.isArray(c.ev)||Date.now()-c.t>14*864e5)return false;
  G.cals=c.cals||[];G.hol=new Set(G.cals.filter(isHoliday).map(x=>x.id));for(const e of c.ev)if(e&&e.uid)G.ev.set(e.uid+"@"+e.date,e);G.loaded=G.ev.size>0;G.stamp=c.t;return G.loaded}catch{return false}}
let gRun=null;
async function gLoad(){
  if(!mcp||!S.gc.on)return;
  if(!G.cals.length||G.needCals){G.needCals=false;
    G.state="loading";refreshUI(true);
    try{const p=await callGC("list_calendars",{});G.cals=(p.calendars||[]).filter(c=>c&&c.id)}
    catch(e){G.calFail=true;return gFail(e)}
    for(const c of G.cals){if(!S.gc.cals[c.id])S.gc.cals[c.id]={on:!(isWeekNum(c)||isContacts(c))};S.gc.cals[c.id].name=c.summary||c.id}
    G.hol=new Set(G.cals.filter(isHoliday).map(c=>c.id));save();
  }
  const jobs=[];
  for(const c of G.cals){if(!calOn(c.id))continue;for(const ym of wantedMonths()){const k=c.id+"#"+ym;if(!G.done.has(k)&&!G.fail.has(k)&&!G.busy.has(k))jobs.push([c,ym,k])}}
  if(!jobs.length){if(G.state==="loading"){G.state="ok";refreshUI()}return}
  G.state="loading";refreshUI(true);
  let bad=null;const q=jobs.slice();
  const worker=async()=>{while(q.length){const [c,ym,k]=q.shift();G.busy.add(k);
    try{await fetchMonth(c,ym);G.done.add(k)}catch(e){G.fail.add(k);bad=bad||e;if(e&&gErr(e).drop)q.length=0}
    finally{G.busy.delete(k)}}};
  await Promise.all([worker(),worker(),worker()]);
  G.stamp=Date.now();G.loaded=true;
  if(bad)return gFail(bad);
  G.state="ok";G.msg=null;G.perm=false;gSaveCache();refreshUI();syncFridge();setTimeout(syncMine,400);
}
function gEnsure(){if(G.avail&&S.gc.on&&!G.calFail&&G.state!=="loading"&&G.state!=="off")gLoad()}
async function gRefresh(){if(!mcp)return;G.done.clear();G.fail.clear();G.cals=[];G.ev.clear();G.calFail=false;G.msg=null;try{await mcp.invalidate(GC)}catch{}gLoad()}
function refreshUI(soft){
  const b=document.querySelector(".gcb");
  if(b){b.className=`pill ico gcb ${G.state==="loading"?"loading":G.state==="err"?"err":!S.gc.on?"off":""}`}
  if(document.querySelector(".ed .gs"))openGSheet(true);
  if(!soft&&S.view!=="kyl")render();
}

/* the important ones go to the fridge as countdown notes; each repeating event only with its next time */
const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return h.toString(36)};
function syncFridge(clear){
  if(!fridge.src)return;if(!S.gc.on)clear=true;
  let list=[];
  if(!clear){if(!G.loaded)return;
    const T=iso(today()),lim=iso(addDays(today(),190)),m=new Map();
    for(const e of G.ev.values()){if(!calOn(e.cal)||level(e)!=="kyl"||e.last<T||e.date>lim)continue;
      if(G.hol.has(e.cal)&&daysOn(parse(e.date)).some(f=>lc(f.title)===lc(e.title)||lc(f.t.name)===lc(e.title)))continue;
      const p=m.get(e.key);if(!p||e.date<p.date)m.set(e.key,e)}
    list=[...m.values()].sort((a,b)=>a.date<b.date?-1:1).slice(0,12).map(e=>{const id="g_"+hash(e.key);G.ids.set(id,e.key);
      return {id,type:"once",name:e.title,date:e.date<T?T:e.date,color:"c"+(parseInt(hash(e.key),36)%6+1),src:"gcal"}});
  }
  try{fridge.contentWindow.postMessage({gcal:list},"*")}catch{}
}

/* tap an event: choose where it shows */
function openGEvent(uid){
  const e=[...G.ev.values()].find(x=>x.uid===uid);if(!e)return;
  closeEditor();edDate="gev";const L=level(e),own=!!S.gc.lv[e.key],d=parse(e.date);
  const when=`${cap(WD[d.getDay()])} ${d.getDate()} ${MO[d.getMonth()]}${e.allDay?(e.days>1?` · ${e.days} dagar`:" · hela dagen"):` · ${e.time}–${e.tEnd}`}`;
  const opt=(k,cls,ico,t,s)=>`<button class="lvl ${cls}" data-act="glv" data-key="${esc(e.key)}" data-lv="${k}" aria-pressed="${L===k}"><b aria-hidden="true">${ico}</b>${t}<small>${s}</small></button>`;
  const el=document.createElement("div");el.className="ed";el.id="ed";
  el.innerHTML=`<div class="box" role="dialog" aria-modal="true" aria-label="${esc(e.title)}"><h3 class="disp">${esc(e.title)}</h3>
    <p class="muted" style="margin:-6px 0 0;font-size:13px;font-weight:800">${when} · ${esc(S.gc.cals[e.cal]?.name||"Google")}</p>
    <div class="lvls">${opt("kyl","k","★","Viktigt – på kylskåpet","Syns här och som nedräkning på kylskåpet")}${opt("plan","p","✓","Bara i planeraren","Syns i månad, vecka och dag")}${opt("hide","h","–","Dölj","Syns inte alls")}</div>
    <p class="muted" style="margin:0;font-size:12px;font-weight:700">${own?"Du har valt själv.":`Gissat automatiskt: ${esc(e.auto[1])}.`}${e.rec?" Gäller alla gånger den återkommer.":""}</p>
    <div class="btns">${own?`<button class="pill" data-act="glv" data-key="${esc(e.key)}" data-lv="">Låt den gissa</button>`:""}<button class="pill c2" data-act="cancel">Klar</button></div></div>`;
  document.body.appendChild(el);el.querySelector(".lvl[aria-pressed=true]")?.focus();
}
function setLevel(key,lv){if(lv)S.gc.lv[key]=lv;else delete S.gc.lv[key];save();closeEditor();render();syncFridge()}

/* the calendar sheet: connect, choose calendars, see the rules */
function openGSheet(keep){
  const old=document.getElementById("ed");if(old&&!keep)closeEditor();
  const on=S.gc.on&&G.state!=="off";
  const st=G.state==="loading"?"Läser kalendern …":G.stamp?`Uppdaterad ${hm(new Date(G.stamp))}`:"";
  const html=`<div class="box gs" role="dialog" aria-modal="true" aria-label="Google Kalender"><h3 class="disp">Google Kalender</h3>
    ${G.msg?`<p class="msg ${G.state==="err"?"bad":""}" role="status">${esc(G.msg)}</p>`:""}
    ${!on?`<p class="lead">Planeraren läser dina händelser och skriver bara när du själv lägger till eller ändrar något, till exempel vem som hämtar. Allt syns i månad, vecka och dag. Bara det viktiga hamnar på kylskåpet. Google frågar dig om lov första gången.</p>`
      :`${st?`<p class="lead" style="color:var(--muted)">${st}</p>`:""}
      ${gWritable().length>1?`<p class="lead" style="margin-top:2px">Nya händelser sparas i:</p><div class="dest">${gWritable().map(c=>`<button class="pill" data-act="gwcal" data-id="${esc(c.id)}" aria-pressed="${c.id===gDefCal()}">${esc(c.summary||c.id)}</button>`).join("")}</div><p class="lead" style="margin-top:2px">Visa kalendrar:</p>`:""}
      <div class="cals">${G.cals.map(c=>`<button class="cal" data-act="gcal1" data-id="${esc(c.id)}" aria-pressed="${calOn(c.id)}"><i>${calOn(c.id)?"✓":""}</i>${esc(c.summary||c.id)}</button>`).join("")}</div>`}
    <ol class="rules">
      <li><b>★ På kylskåpet:</b> händelser med ⭐ eller #kyl i namnet, sådant som pågår flera dagar, och roliga saker som kalas, resa, lov och besök.</li>
      <li><b>Bara i planeraren:</b> det som återkommer varje vecka, jobbmöten och helgdagar.</li>
      <li><b>Tryck på en händelse</b> för att välja själv. Det kommer planeraren ihåg.</li>
      <li><b>Ny händelse:</b> välj Google Kalender när du skriver en ny lapp, eller tryck på kalenderknappen bredvid Lägg till i dagvyn.</li>
    </ol>
    <div class="btns">
      ${G.perm&&perms?`<button class="pill" data-act="gperm">Behörigheter</button>`:""}
      ${on?`<button class="pill" data-act="goff">Koppla från</button><button class="pill" data-act="gre">${G.state==="err"?"Försök igen":"Läs om"}</button>`:`<button class="pill c2" data-act="gon">Koppla Google Kalender</button>`}
      <button class="pill c2" data-act="cancel">Klar</button>
    </div></div>`;
  if(old&&keep){old.innerHTML=html;return}
  edDate="gs";const el=document.createElement("div");el.className="ed";el.id="ed";el.innerHTML=html;document.body.appendChild(el);
}
/* ---------- write new events to Google Kalender ---------- */
const gWritable=()=>G.cals.filter(c=>!isHoliday(c)&&!isWeekNum(c)&&!isContacts(c)&&!/#/.test(c.id));
const gcW=()=>G.avail&&S.gc.on&&G.state!=="off"&&gWritable().length>0;
const gDest=()=>S.gc.dest==="google";
function gDefCal(){const w=gWritable();return (w.find(c=>c.id===S.gc.wcal)||w.find(c=>c.primary)||w.find(c=>!/group\.calendar/.test(c.id))||w[0]||{}).id}
const loc=x=>`${iso(x)}T${hm(x)}:00`;
async function gCreate(date,time,end,text,calId,kyl){
  text=String(text||"").trim();if(!text)return "Skriv vad som händer.";
  const cal=G.cals.find(c=>c.id===calId);if(!cal)return "Välj en kalender.";
  const d=parse(date),input={calendarId:cal.id,summary:text};
  if(time){const [h,mi]=time.split(":").map(Number),a=new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,mi);
    let b=new Date(+a+3600e3);if(end&&end>time){const [h2,m2]=end.split(":").map(Number);b=new Date(d.getFullYear(),d.getMonth(),d.getDate(),h2,m2)}
    input.startTime=loc(a);input.endTime=loc(b)}
  else{input.startTime=date+"T00:00:00";input.endTime=iso(addDays(d,1))+"T00:00:00";input.allDay=true}
  let p;
  try{const r=await mcp.callTool(GC,"create_event",input);p=r&&r.payload;
    if(p===undefined){const t=(r&&r.content||[]).find(c=>c.type==="text");try{p=JSON.parse(t.text)}catch{p=null}}}
  catch(e){const c=e&&e.code;
    if(c==="tool_error")return "Google kunde inte spara händelsen. Kanske får du inte skriva i den kalendern.";
    if(c==="cancelled")return "Händelsen sparades inte.";
    if(c==="not_in_manifest"||c==="approval_required"||c==="consent_required")return "Planeraren fick inte skriva i kalendern. Tryck på Lägg till igen och välj Tillåt.";
    return gErr(e).msg||"Något gick fel."}
  const ev=(p&&(p.event||p))||{};
  const id=ev.id||("ny"+uid());
  const raw={id,summary:text,start:input.allDay?{date}:{dateTime:input.startTime},end:input.allDay?{date:iso(addDays(d,1))}:{dateTime:input.endTime}};
  const x=normEv(raw,cal);if(x)G.ev.set(x.uid+"@"+x.date,x);
  if(kyl&&x)S.gc.lv[x.key]="kyl";
  save();
  try{await mcp.invalidate(GC,"list_events")}catch{}
  G.done.delete(cal.id+"#"+ymKey(d));
  render();syncFridge();
  if(ev.id)setTimeout(gEnsure,1500);
  return null;
}
function alertMsg(t){const el=document.createElement("div");el.className="ed";el.id="ed";edDate="msg";
  el.innerHTML=`<div class="box" role="alertdialog" aria-modal="true"><p class="msg bad">${esc(t)}</p><div class="btns"><button class="pill c2" data-act="cancel">OK</button></div></div>`;
  closeEditor();edDate="msg";document.body.appendChild(el)}
/* ---------- Hämta & lämna ----------
   Who drops the kids off (lämnar) and picks them up (hämtar). The truth lives in the shared family
   Google calendar, so both parents see the same thing: an event like "Leon hämtar barnen".
   The usual week = the repeating events; a change on one day = that one day's event is changed. */
if(!S.hl||typeof S.hl!=="object")S.hl={};
S.hl.people=Array.isArray(S.hl.people)&&S.hl.people.length?S.hl.people:B.members.map(m=>({n:m.name,a:[],c:m.color}));
S.hl.times=S.hl.times||{l:["08:00","08:15"],h:["15:30","16:00"]};
/* your calendar's habit: when nobody is written in, Rebecca picks up; and whoever picks up usually drops off too */
if(S.hl.dflt===undefined)S.hl.dflt="";
const HLK={l:{verb:"lämnar",lbl:"Lämnar",ico:"☀"},h:{verb:"hämtar",lbl:"Hämtar",ico:"⌂"}};
const HL_STOP=new Set(["barnen","barn","ungarna","kidsen","kids","på","från","till","förskolan","förskola","fsk","skolan","och","&","+","-","–"]);
function hlParse(title){
  const t=String(title||""),m=t.match(/(hämt|lämn)[a-zåäö]*/i);if(!m)return null;
  const toks=t.replace(/[(),.:!]/g," ").split(/\s+/).filter(Boolean);
  const kids=/barn|förskol|ungar|kids/i.test(t);
  const rest=toks.filter(w=>!/^(hämt|lämn)/i.test(w)&&!HL_STOP.has(w.toLowerCase()));
  const p=hlPerson(rest.join(" "));
  if(!kids&&!p)return null;
  const who=p?p.n:(rest.length?rest.map(cap).join(" "):"");
  return {k:/^hämt/i.test(m[0])?"h":"l",who};
}
function hlPerson(s){s=String(s||"").toLowerCase();if(!s)return null;
  return S.hl.people.find(p=>s.split(/\s+/).some(w=>w===p.n.toLowerCase()||p.a.includes(w)))||null}
const hlColor=who=>{const p=hlPerson(who);return p?`var(--${p.c})`:who?"var(--c2)":"var(--paper)"};
const hlInit=who=>who?who.trim()[0].toUpperCase():"?";
/* the pickup/drop-off events of one day */
function hlOn(d,k){if(!G.ev.size)return null;const key=iso(d);let best=null;
  for(const e of G.ev.values()){if(!e.hl||e.hl.k!==k||e.date!==key||!calOn(e.cal))continue;if(!best||e.time<best.time)best=e}
  return best}
/* the usual week: for each weekday, the repeating series that is still going */
function hlSeries(wd,k){
  const by=new Map(),T=iso(today());
  for(const e of G.ev.values()){if(!e.hl||e.hl.k!==k||!e.rid||e.owd!==wd||!calOn(e.cal))continue;
    const s=by.get(e.rid)||{rid:e.rid,cal:e.cal,n:0,later:0,who:{},time:e.time,tEnd:e.tEnd};s.n++;if(e.date>=T)s.later++;s.who[e.hl.who]=(s.who[e.hl.who]||0)+1;by.set(e.rid,s)}
  const list=[...by.values()].filter(s=>s.later>0).sort((a,b)=>b.n-a.n);
  if(!list.length)return null;const s=list[0];s.whoName=Object.entries(s.who).sort((a,b)=>b[1]-a[1])[0][0];return s;
}
function hlRWho(wd,k){const s=hlSeries(wd,k);if(s)return {who:s.whoName,s};
  if(k==="h")return {who:S.hl.dflt||"",inf:true};return {who:hlRWho(wd,"h").who,inf:true}}
const hlCal=()=>{const w=gWritable();return (w.find(c=>c.id===S.hl.cal)||w.find(c=>/famil/i.test(c.summary||""))||w.find(c=>/group\.calendar/.test(c.id))||w.find(c=>c.id===gDefCal())||{}).id};
const hlTitle=(who,k)=>`${who} ${HLK[k].verb} barnen`;
/* who does it on a day: what is written in the calendar, otherwise the habit */
function hlWho(d,k){const e=hlOn(d,k);if(e)return {who:e.hl.who,e};
  if(d.getDay()===0||d.getDay()===6)return {who:""};
  if(k==="h")return {who:S.hl.dflt||"",inf:true};
  return {who:hlWho(d,"h").who,inf:true}}
const hlBtn=(d,k,cls)=>{const w=hlWho(d,k),e=w.e,who=w.who;
  return `<button class="hs ${cls||""} ${who?"":"none"} ${w.inf&&who?"inf":""}" data-hl="${iso(d)}|${k}" data-dropslot="${iso(d)}|${k}" ${who?`data-drag="p:${esc(who)}"`:""} style="--pc:${hlColor(who)}" aria-label="${HLK[k].lbl} ${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}: ${who?esc(who):"ingen bestämd"}${w.inf&&who?" (som vanligt)":""}"><b>${who?esc(who):cls==="big"?"Vem?":"–"}</b><small>${HLK[k].verb}${e&&!e.allDay?` ${e.time}`:""}</small></button>`};
const hlReady=()=>S.gc.on&&G.state!=="off"&&(G.avail||G.loaded);

function hamtaView(){
  const T=today(),m=monday(at());
  if(!G.avail&&!G.loaded)return `<section class="view hlv" style="--dir:${dir}"><div class="hlcard"><h2 class="disp">Hämta & lämna</h2><p class="lead">Här ser ni vem som lämnar och hämtar barnen. Det läses från er gemensamma Google-kalender. Koppla Google Kalender i menyn för att komma igång.</p></div></section>`;
  if(!S.gc.on)return `<section class="view hlv" style="--dir:${dir}"><div class="hlcard"><h2 class="disp">Hämta & lämna</h2><p class="lead">Koppla Google Kalender så ser ni vem som lämnar och hämtar varje dag. Ändringar sparas i familjekalendern, så båda ser samma sak.</p><button class="pill c2" data-act="gon">${I.cal} Koppla Google Kalender</button></div></section>`;
  const days=[0,1,2,3,4,5,6].map(k=>addDays(m,k)).filter((d,i)=>i<5||hlOn(d,"l")||hlOn(d,"h"));
  const tally={};
  for(const d of days)for(const k of ["l","h"]){const w=hlWho(d,k).who;if(w)tally[w]=(tally[w]||0)+1}
  const cols=days.map((d,i)=>`<article class="hday ${same(d,T)?"today":""} ${d<T?"past":""}" data-drop="${iso(d)}" style="--i:${i};view-transition-name:${vtn(d)}">
      <button class="hd" data-go="${iso(d)}" aria-label="Öppna ${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}"><span class="wd">${WD[d.getDay()]}</span><span class="dn">${d.getDate()}${same(d,T)?RING:""}</span></button>
      ${hlBtn(d,"l","big")}${hlBtn(d,"h","big")}</article>`).join("");
  const rh=[1,2,3,4,5].map(wd=>`<div class="rday"><span class="wd">${WDS[wd]}</span>${["l","h"].map(k=>{const w=hlRWho(wd,k),who=w.who;
      return `<button class="hs mini ${who?"":"none"} ${w.inf&&who?"inf":""}" data-hlr="${wd}|${k}" data-dropslot="r:${wd}|${k}" ${who?`data-drag="p:${esc(who)}"`:""} style="--pc:${hlColor(who)}" aria-label="Vanlig ${WD[wd]}, ${HLK[k].verb}: ${who?esc(who):"ingen"}"><b>${who?esc(who):"–"}</b><small>${HLK[k].verb}</small></button>`}).join("")}</div>`).join("");
  const loading=G.state==="loading"&&!G.loaded;
  return `<section class="view hlv" style="--dir:${dir}">
    <div class="names"><span>Dra ett namn till en ruta</span>${S.hl.people.map(p=>`<button class="hname" data-drag="p:${esc(p.n)}" style="--pc:var(--${p.c})" aria-label="Dra ${esc(p.n)} till en dag">${esc(p.n)}</button>`).join("")}</div>
    <div class="hweek">${loading?'<p class="lead muted">Läser kalendern …</p>':cols}</div>
    <div class="hfoot">
      <div class="tally">${Object.keys(tally).length?Object.entries(tally).sort((a,b)=>b[1]-a[1]).map(([w,n])=>`<span class="tp" style="--pc:${hlColor(w)}"><b>${esc(w)}</b> ${n} ${n===1?"gång":"gånger"}</span>`).join(""):'<span class="muted">Inget inlagt den här veckan än.</span>'}</div>
      <button class="pill" data-act="rule">${I.cal} Vanlig vecka</button>
    </div>
  </section>`;
}

/* choose who, for one day or for the usual week */
function openHL(date,k,isR){
  closeEditor();edDate="hl";
  let title,cur,note;
  let inf=false;
  if(isR){const wd=+date,w=hlRWho(wd,k);cur=w.who||null;inf=!!w.inf;title=`${HLK[k].lbl} varje ${WD[wd]}`;note=w.s?"Gäller alla kommande veckor.":w.who?`Inget återkommande står i kalendern, så ${w.who} ${HLK[k].verb} som vanligt.`:"Väljer du någon skapas en händelse som återkommer varje vecka."}
  else{const d=parse(date),w=hlWho(d,k),e=w.e;cur=w.who||null;inf=!!w.inf;title=`${HLK[k].lbl} ${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;note=e?(e.rec?"Ändrar bara den här dagen. Den vanliga veckan är kvar.":""):w.who?`Inget står i kalendern, så ${w.who} ${HLK[k].verb} som vanligt.`:"Ingen är inlagd. Väljer du någon läggs en händelse in i familjekalendern."}
  const ppl=S.hl.people.map(p=>`<button class="lvl" data-act="hlset" data-who="${esc(p.n)}" aria-pressed="${cur===p.n}" style="--pc:var(--${p.c})"><b class="dotp" aria-hidden="true">${hlInit(p.n)}</b>${esc(p.n)}<small>${esc(p.n)} ${HLK[k].verb}</small></button>`).join("");
  const el=document.createElement("div");el.className="ed";el.id="ed";
  el.innerHTML=`<form class="box hlbox" id="hlf" data-date="${esc(String(date))}" data-k="${k}" data-r="${isR?1:""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h3 class="disp">${esc(title)}</h3>
    <div class="lvls">${ppl}</div>
    <div class="add-row"><input type="text" name="who" placeholder="Någon annan, till exempel Mormor" maxlength="30" autocomplete="off" aria-label="Någon annan" value="${cur&&!hlPerson(cur)?esc(cur):""}"><button class="pill" type="submit">Spara</button></div>
    ${note?`<p class="muted small" style="margin:0">${note}</p>`:""}
    <p class="msg bad" role="status" hidden></p>
    <div class="btns">${cur&&!inf&&!(isR?(k==="h"?S.hl.dflt:hlRWho(+date,"h").who):(k==="h"?S.hl.dflt:hlWho(parse(date),"h").who))?`<button class="pill" type="button" data-act="hlset" data-who="">${isR?"Ingen vanlig tid":"Ingen den här dagen"}</button>`:""}<button class="pill c2" type="button" data-act="cancel">Klar</button></div></form>`;
  document.body.appendChild(el);
}
async function gWrite(tool,input){
  try{const r=await mcp.callTool(GC,tool,input);let p=r&&r.payload;if(p===undefined){const t=(r&&r.content||[]).find(c=>c.type==="text");try{p=JSON.parse(t.text)}catch{p=null}}return {p:p||{}}}
  catch(e){const c=e&&e.code;
    if(c==="tool_error")return {err:"Google kunde inte spara ändringen. Kanske får du inte ändra i den kalendern."};
    if(c==="cancelled")return {err:"Ändringen sparades inte."};
    if(c==="not_in_manifest"||c==="approval_required"||c==="consent_required")return {err:"Planeraren fick inte ändra i kalendern. Försök igen och välj Tillåt."};
    return {err:gErr(e).msg||"Något gick fel."}}
}
async function hlAfter(calId,all){
  try{await mcp.invalidate(GC,"list_events")}catch{}
  if(all){G.done.clear()}else{for(const k of [...G.done])if(k.startsWith(calId+"#"))G.done.delete(k)}
  render();setTimeout(gEnsure,800);
}
async function hlSet(date,k,isR,who){
  who=String(who||"").trim().replace(/\s+/g," ");if(who&&!hlPerson(who))who=who.split(" ").map(cap).join(" ");else if(who)who=hlPerson(who).n;
  const box=document.getElementById("hlf"),msg=box&&box.querySelector(".msg");
  box&&box.querySelectorAll("button").forEach(b=>b.disabled=true);
  const fail=t=>{if(!box||!box.isConnected)return alertMsg(t);box.querySelectorAll("button").forEach(b=>b.disabled=false);msg.textContent=t;msg.hidden=false};
  const [t0,t1]=S.hl.times[k];
  if(isR){
    const wd=+date,s=hlSeries(wd,k);
    if(!s&&who&&who===(k==="h"?S.hl.dflt:hlRWho(wd,"h").who)){closeEditor();return}
    if(s&&!who){const r=await gWrite("delete_event",{calendarId:s.cal,eventId:s.rid});if(r.err)return fail(r.err);
      for(const [u,e] of G.ev)if(e.rid===s.rid)G.ev.delete(u)}
    else if(s){const r=await gWrite("update_event",{calendarId:s.cal,eventId:s.rid,summary:hlTitle(who,k)});if(r.err)return fail(r.err);
      for(const e of G.ev.values())if(e.rid===s.rid){e.title=hlTitle(who,k);e.hl={k,who}}}
    else if(who){const cal=hlCal();if(!cal)return fail("Hittar ingen kalender att skriva i.");
      let d=today();while(d.getDay()!==wd)d=addDays(d,1);
      const r=await gWrite("create_event",{calendarId:cal,summary:hlTitle(who,k),startTime:`${iso(d)}T${t0}:00`,endTime:`${iso(d)}T${t1}:00`,recurrenceData:["RRULE:FREQ=WEEKLY"],description:"Hämta & lämna · Planeraren"});if(r.err)return fail(r.err)}
    closeEditor();return hlAfter(s?s.cal:hlCal(),true);
  }
  const d=parse(date),e=hlOn(d,k);
  /* choosing the person who does it anyway takes the note away, the way your calendar already works */
  if(who&&who!==S.hl.me&&who===(k==="h"?S.hl.dflt:hlWho(d,"h").who))who="";
  if(!e&&!who){closeEditor();return}
  if(e&&!who){const r=await gWrite("delete_event",{calendarId:e.cal,eventId:e.eid});if(r.err)return fail(r.err);G.ev.delete(e.uid+"@"+e.date)}
  else if(e){const r=await gWrite("update_event",{calendarId:e.cal,eventId:e.eid,summary:hlTitle(who,k)});if(r.err)return fail(r.err);e.title=hlTitle(who,k);e.hl={k,who}}
  else if(who){const cal=hlCal();if(!cal)return fail("Hittar ingen kalender att skriva i.");
    const r=await gWrite("create_event",{calendarId:cal,summary:hlTitle(who,k),startTime:`${date}T${t0}:00`,endTime:`${date}T${t1}:00`,description:"Hämta & lämna · Planeraren"});if(r.err)return fail(r.err);
    const c=G.cals.find(x=>x.id===cal),x=normEv({id:(r.p.event||r.p).id||"ny"+uid(),summary:hlTitle(who,k),start:{dateTime:`${date}T${t0}:00`},end:{dateTime:`${date}T${t1}:00`}},c);if(x)G.ev.set(x.uid+"@"+x.date,x)}
  closeEditor();hlAfter(e?e.cal:hlCal(),false);
}

/* ---------- Vanlig vecka: your usual rhythm, kept here, written to the calendar only after you confirm ---------- */
S.hl.rules=S.hl.rules||{1:"Leon",2:"Rebecca",3:"Rebecca",4:"Leon",5:"alt",even:"Leon",odd:"Rebecca",firstWed:true};
const RS={weeks:8,diffs:null,busy:false,done:null};
/* who picks up on a day according to the rhythm */
function ruleWho(d){
  const R=S.hl.rules,wd=d.getDay();if(wd===0||wd===6)return "";
  const base=x=>{const v=R[x.getDay()];return v==="alt"?(isoWeek(x)%2===0?R.even:R.odd):(v||"")};
  if(R.firstWed&&(wd===3||wd===4)){const wed=wd===3?d:addDays(d,-1);if(wed.getDate()<=7)return base(wd===3?addDays(d,1):addDays(d,-1))}
  return base(d);
}
function ruleDiffs(){
  const T=today(),out=[];
  for(let i=0;i<RS.weeks*7;i++){const d=addDays(T,i),target=ruleWho(d);if(!target)continue;
    const w=hlWho(d,"h");if(w.who===target)continue;
    const booked=!!w.e||!!hlSeries(d.getDay(),"h");
    const why=S.hl.rules.firstWed&&(d.getDay()===3&&d.getDate()<=7||d.getDay()===4&&addDays(d,-1).getDate()<=7)?"första onsdagen":S.hl.rules[d.getDay()]==="alt"?"varannan fredag":"";
    out.push({date:iso(d),from:w.who||"ingen",to:target,booked,on:!booked,why})}
  return out;
}
function openRule(keep){
  const R=S.hl.rules,old=document.getElementById("ed");if(old&&!keep)closeEditor();
  const pick=(wd)=>S.hl.people.map(p=>`<button type="button" class="pill" data-act="rset" data-wd="${wd}" data-who="${esc(p.n)}" aria-pressed="${R[wd]===p.n}" style="--pc:var(--${p.c})">${esc(p.n)}</button>`).join("")+(wd===5?`<button type="button" class="pill" data-act="rset" data-wd="5" data-who="alt" aria-pressed="${R[5]==="alt"}">Varannan</button>`:"");
  const rows=[1,2,3,4,5].map(wd=>`<div class="rrow"><b>${cap(WD[wd])}</b><div class="dest">${pick(wd)}</div></div>`).join("")
    +(R[5]==="alt"?`<div class="rrow sub"><span>Jämna veckor hämtar <b>${esc(R.even)}</b>, udda veckor <b>${esc(R.odd)}</b>.</span><button type="button" class="pill" data-act="rswap">Byt</button></div>`:"");
  const ds=RS.diffs;
  const list=ds?(ds.length?`<div class="dlist">${ds.map((x,i)=>{const d=parse(x.date);return `<label class="drow ${x.booked?"bk":""}"><input type="checkbox" data-di="${i}" ${x.on?"checked":""}><span><b>${cap(WDS[d.getDay()])} ${d.getDate()} ${MO[d.getMonth()].slice(0,3)}</b> ${esc(x.from)} → <b>${esc(x.to)}</b>${x.why?` <small>(${x.why})</small>`:""}${x.booked?`<em>Ändrar något som redan står i kalendern</em>`:""}</span></label>`}).join("")}</div>
      <div class="btns"><button type="button" class="pill" data-act="rall">Markera alla</button><button type="button" class="pill c2" data-act="rapply" ${RS.busy?"disabled":""}>${RS.busy?"Skriver …":`Ja, skriv ${ds.filter(x=>x.on).length} ändringar i kalendern`}</button></div>`
      :`<p class="msg">Kalendern stämmer redan med er vanliga vecka de kommande ${RS.weeks} veckorna.</p>`):"";
  const html=`<div class="box gs rulebox" role="dialog" aria-modal="true" aria-label="Vanlig vecka"><h3 class="disp">Vanlig vecka</h3>
    <p class="lead">Vem som brukar hämta. Den som hämtar lämnar också. Det här ändrar ingenting i kalendern förrän du bekräftar längre ner.</p>
    ${rows}
    <div class="rrow"><b>Jag är</b><div class="dest">${S.hl.people.map(p=>`<button type="button" class="pill" data-act="rme" data-who="${esc(p.n)}" aria-pressed="${S.hl.me===p.n}" style="--pc:var(--${p.c})">${esc(p.n)}</button>`).join("")}</div></div>
    <label class="chkrow"><input type="checkbox" data-act="rsync" ${S.hl.sync?"checked":""}> Skriv alltid in mina hämtningar och lämningar i familjekalendern (tre veckor framåt)</label>
    <label class="chkrow"><input type="checkbox" data-act="rfw" ${R.firstWed?"checked":""}> Första onsdagen i månaden byter onsdag och torsdag</label>
    <div class="rapply"><h4>Lägg in i kalendern</h4>
      <div class="dest">${[4,8,12].map(n=>`<button type="button" class="pill" data-act="rweeks" data-n="${n}" aria-pressed="${RS.weeks===n}">${n} veckor</button>`).join("")}<button type="button" class="pill" data-act="rshow">Visa vad som ändras</button></div>
      ${RS.done?`<p class="msg" role="status">${esc(RS.done)}</p>`:""}
      ${list}
    </div>
    <div class="btns"><button class="pill c2" type="button" data-act="cancel">Klar</button></div></div>`;
  if(old&&keep){old.innerHTML=html;return}
  edDate="rule";const el=document.createElement("div");el.className="ed";el.id="ed";el.innerHTML=html;document.body.appendChild(el);
}
async function ruleApply(){
  const todo=(RS.diffs||[]).filter(x=>x.on);if(!todo.length||RS.busy)return;
  RS.busy=true;RS.done=null;openRule(true);let ok=0,err=null;const cal=hlCal(),[t0,t1]=S.hl.times.h;
  for(const x of todo){const d=parse(x.date),e=hlOn(d,"h");let r;
    if(e&&x.to===S.hl.dflt)r=await gWrite("delete_event",{calendarId:e.cal,eventId:e.eid});
    else if(e)r=await gWrite("update_event",{calendarId:e.cal,eventId:e.eid,summary:hlTitle(x.to,"h")});
    else r=await gWrite("create_event",{calendarId:cal,summary:hlTitle(x.to,"h"),startTime:`${x.date}T${t0}:00`,endTime:`${x.date}T${t1}:00`,description:"Hämta & lämna · Planeraren"});
    if(r.err){err=r.err;break}ok++}
  RS.busy=false;RS.diffs=null;RS.done=err?`${ok} ändringar sparades, sedan stoppade Google: ${err}`:`Klart! ${ok} ändringar är sparade i kalendern.`;
  try{await mcp.invalidate(GC,"list_events")}catch{}G.done.clear();openRule(true);render();setTimeout(gEnsure,300);
}

/* ---------- my days always in the family calendar ----------
   Whenever "me" drops off or picks up (also when it is only worked out "as usual"), make sure an event
   exists in the family calendar, so the other parent sees it there. Events made this way are marked "auto",
   and are taken away again if the day changes so it is no longer me. Looks three weeks ahead. */
if(!S.hl.me)S.hl.me=B.me.name;
if(S.hl.sync===undefined)S.hl.sync=true;
const AUTO="Hämta & lämna · Planeraren · auto";
let syncBusy=false,syncAt=0;
function hlInferNoEv(d,k){return k==="h"?S.hl.dflt||"":hlWho(d,"h").who}
function syncPlan(){
  const me=S.hl.me,T=today(),now=new Date(),out=[];
  for(let i=0;i<21;i++){const d=addDays(T,i);if(d.getDay()===0||d.getDay()===6)continue;
    for(const k of ["h","l"]){
      const [t0]=S.hl.times[k];if(i===0&&hm(now)>=t0)continue;
      const w=hlWho(d,k);
      if(!w.e&&w.who===me)out.push({op:"add",d,k});
      else if(w.e&&w.e.gen&&w.e.hl.who===me&&hlInferNoEv(d,k)!==me&&!(k==="l"&&hlWho(d,"h").who===me))out.push({op:"del",d,k,e:w.e});
    }}
  return out;
}
async function syncMine(){
  if(!S.hl.sync||syncBusy||!mcp||!G.loaded||G.state!=="ok"||!gWritable().length)return;
  const plan=syncPlan();if(!plan.length)return;
  syncBusy=true;let n=0,err=null;const cal=hlCal();
  for(const x of plan){const [t0,t1]=S.hl.times[x.k],ds=iso(x.d);let r;
    if(x.op==="add"){r=await gWrite("create_event",{calendarId:cal,summary:hlTitle(S.hl.me,x.k),startTime:`${ds}T${t0}:00`,endTime:`${ds}T${t1}:00`,description:AUTO});
      if(!r.err){const c=G.cals.find(c=>c.id===cal),ev=normEv({id:((r.p.event||r.p).id)||"ny"+uid(),summary:hlTitle(S.hl.me,x.k),description:AUTO,start:{dateTime:`${ds}T${t0}:00`},end:{dateTime:`${ds}T${t1}:00`}},c);if(ev)G.ev.set(ev.uid+"@"+ev.date,ev)}}
    else{r=await gWrite("delete_event",{calendarId:x.e.cal,eventId:x.e.eid});if(!r.err)G.ev.delete(x.e.uid+"@"+x.e.date)}
    if(r.err){err=r.err;break}n++}
  syncBusy=false;syncAt=Date.now();
  if(n)toast(`${n} ${n===1?"ändring":"ändringar"} av dina hämtningar och lämningar ${n===1?"är":"är"} nu i familjekalendern.`);
  if(err)toast("Kunde inte skriva i familjekalendern: "+err,true);
  try{await mcp.invalidate(GC,"list_events")}catch{}
  render();
}
function toast(t,bad){const el=document.createElement("div");el.className="toast"+(bad?" bad":"");el.setAttribute("role","status");el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),5200)}

async function gInit(){
  if(!window.claude||typeof claude.use!=="function")return;
  try{mcp=await claude.use("mcp")}catch{mcp=null}
  if(!mcp)return;
  try{perms=await claude.use("permissions")}catch{perms=null}
  let st="prompt";
  if(perms){try{st=await perms.state("mcp:"+GC);if(st==="unavailable")st=await perms.state("mcp")}catch{}}
  if(st==="unavailable")return;
  G.avail=true;G.state=S.gc.on?"idle":"off";
  if(st==="denied"){S.gc.on=false;G.state="off";G.msg="Planeraren har inte fått läsa kalendern. Du kan tillåta det under Behörigheter.";G.perm=true}
  if(S.view!=="kyl")render();
  if(S.gc.on||st==="granted"){S.gc.on=true;save();
    /* start from what was read last time; the fresh read then only changes what really changed */
    gLoad()}
}


const fridge=document.getElementById("fridge");
function showFridge(on){
  if(on&&!fridge.src)fridge.src="kylskapet.html?embed";
  fridge.hidden=!on;
  if(on)fridge.contentWindow?.postMessage({theme:S.theme},"*");
}
addEventListener("message",e=>{
  if(e.source!==fridge.contentWindow||!e.data)return;
  if(e.data.ready){fridge.contentWindow.postMessage({theme:S.theme},"*");syncFridge()}
  if(e.data.hideGcal){const k=G.ids.get(e.data.hideGcal);if(k){S.gc.lv[k]="plan";save()}}
  if(e.data.themeNow!==undefined&&e.data.themeNow!==S.theme){S.theme=e.data.themeNow;applyTheme();save()}
  if(Array.isArray(e.data.trackers)&&e.data.trackers.length){TRACKERS=e.data.trackers;if(S.view!=="kyl")render()}
});
let lastSig="";
const viewBody=()=>S.view==="manad"?monthView():S.view==="vecka"?weekView():S.view==="hamta"?hamtaView():dayView();
let still=false,gliding=false;
function render(){
  if(gliding)return; /* a period is sliding; it renders when it lands */
  const sig=S.view+"|"+S.at+"|"+!!S.roll,fresh=sig!==lastSig;app.classList.toggle("quiet",still||sig===lastSig);lastSig=sig;still=false;
  if(S.view==="dag")requestAnimationFrame(fitTl);
  if(fresh&&S.view==="dag")requestAnimationFrame(()=>{const L=app.querySelector(".daycard .list"),tl=L&&L.querySelector(".tl.prop");if(!tl)return;
    const tg=tl.querySelector(".tlnow")||tl.querySelector(".tlc");if(!tg)return;const dy=tg.getBoundingClientRect().top-L.getBoundingClientRect().top;
    if(dy>L.clientHeight*.6)L.scrollTop+=dy-L.clientHeight*.3});
  if(S.view==="kyl"){app.innerHTML=header();showFridge(true);dir=0;return}
  showFridge(false);
  const a=at();let title,sub;
  if(S.view==="manad"){title=`${cap(MO[a.getMonth()])}`;sub=String(a.getFullYear())}
  else if(S.view==="hamta"){const m=monday(a),f=addDays(m,4);title=`Hämta & lämna`;sub=`Vecka ${isoWeek(a)} · ${m.getDate()} ${MO[m.getMonth()].slice(0,3)} – ${f.getDate()} ${MO[f.getMonth()].slice(0,3)}`}
  else if(S.view==="vecka"){const m=S.roll?today():monday(a),s=addDays(m,6);title=S.roll?`7 dagar`:`Vecka ${isoWeek(a)}`;sub=`${m.getDate()} ${MO[m.getMonth()].slice(0,3)} – ${s.getDate()} ${MO[s.getMonth()].slice(0,3)} ${s.getFullYear()}`}
  else{title=`${cap(WD[a.getDay()])} ${a.getDate()} ${MO[a.getMonth()].slice(0,3)}`;sub=String(a.getFullYear())}
  app.innerHTML=header(title,sub)+`<div class="stage s-${S.view}">${viewBody()}</div>`;
  dir=0;gEnsure();
}
/* ---------- moving between periods ----------
   The neighbouring period is laid out next to the current one and everything glides
   sideways together, like paper on a long table. In the week, the days themselves slide:
   this week -> 7 days from today -> next whole week. */
function nbr(n){
  const a=at(),T=today(),mT=monday(T),rollable=T.getDay()!==1;
  if(S.view==="vecka"){
    if(S.roll)return {at:iso(n>0?addDays(mT,7):mT),roll:false};
    const m=monday(a);
    if(rollable&&((n>0&&same(m,mT))||(n<0&&same(m,addDays(mT,7)))))return {at:iso(T),roll:true};
    return {at:iso(addDays(m,7*n)),roll:false};
  }
  if(S.view==="manad")return {at:iso(new Date(a.getFullYear(),a.getMonth()+n,1)),roll:!!S.roll};
  return {at:iso(addDays(a,S.view==="hamta"?7*n:n)),roll:!!S.roll};
}
function withState(st,f){const o=[S.at,S.roll];S.at=st.at;S.roll=st.roll;try{return f()}finally{[S.at,S.roll]=o}}
const calm=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const cur=()=>({at:S.at,roll:!!S.roll});
const keyOf=st=>S.view==="vecka"?dnum(weekStart(st)):dnum(parse(st.at));
/* lay out several periods side by side; returns the strip and the x offset of each */
function buildTrack(states){
  const st=app.querySelector(".stage");if(!st)return null;
  const w=st.clientWidth,wn=st.querySelectorAll(".week>.wnote");
  if(S.view==="vecka"&&wn.length>1&&getComputedStyle(st.querySelector(".week")).gridTemplateColumns.split(" ").length>1){
    const wk=st.querySelector(".week"),gap=parseFloat(getComputedStyle(wk).columnGap)||0,colW=parseFloat(getComputedStyle(wk).gridTemplateColumns)||(wk.getBoundingClientRect().width-6*gap)/7,stepW=colW+gap; /* exact column size (not the tilted cards, not rounded) */
    const starts=states.map(weekStart),s0=new Date(Math.min(...starts)),span=diff(s0,new Date(Math.max(...starts)))+7;
    if(span<=35){
      const el=document.createElement("div");el.className="track";
      el.innerHTML=`<section class="view week strip" style="grid-template-columns:repeat(${span},${colW}px);width:${span*stepW-gap}px">${weekCols(s0,span)}</section>`;
      return {st,el,off:starts.map(s=>-diff(s0,s)*stepW)};
    }
  }
  const gap=28,el=document.createElement("div");el.className="track";
  el.innerHTML=states.map(x=>`<div class="pane" style="flex-basis:${w}px;width:${w}px">${withState(x,viewBody)}</div>`).join("");
  el.style.gap=gap+"px";
  return {st,el,off:states.map((_,i)=>-i*(w+gap))};
}
function mount(t,x){t.st.classList.add("gliding");t.st.replaceChildren(t.el);t.el.style.transform=`translateX(${x}px)`}
function commit(nx){S.at=nx.at;S.roll=nx.roll;save();still=true;gliding=false;render()}
function glideTo(nx){
  if(gliding)return;
  if(calm()||S.view==="kyl"||keyOf(nx)===keyOf(cur())&&nx.roll===!!S.roll){dir=0;return commit(nx)}
  const c=cur(),fwd=keyOf(nx)>keyOf(c)||keyOf(nx)===keyOf(c)&&nx.roll,states=fwd?[c,nx]:[nx,c],t=buildTrack(states);
  if(!t)return commit(nx);
  gliding=true;const from=t.off[fwd?0:1],to=t.off[fwd?1:0];
  mount(t,from);t.el.getBoundingClientRect();
  t.el.style.transition="transform .42s cubic-bezier(.22,.9,.25,1)";t.el.style.transform=`translateX(${to}px)`;
  let done=false;const fin=()=>{if(done)return;done=true;commit(nx)};
  t.el.addEventListener("transitionend",fin,{once:true});setTimeout(fin,600);
}
function step(n){glideTo(nbr(n))}
/* switching Månad / Vecka / Dag keeps the same day on screen and grows it into place */
function morph(fn){
  if(!document.startViewTransition||calm()||gliding){fn();return}
  document.documentElement.classList.add("vt");
  const v=document.startViewTransition(()=>{still=true;fn()});
  v.finished.finally(()=>document.documentElement.classList.remove("vt"));
}
function setView(v,d){morph(()=>{if(d)S.at=d;dir=0;S.view=v;save();render()})}

/* ---------- write a note from the month or the week ---------- */
let edDate=null;
function openEditor(date){
  edDate=date;const d=parse(date);
  const el=document.createElement("div");el.className="ed";el.id="ed";
  const gw=gcW(),go=gw&&gDest();
  el.innerHTML=`<form class="box" id="edf"><h3 class="disp">${go?"Ny händelse":"Ny lapp"}</h3><p class="muted" style="margin:0;font-size:13px">${cap(WD[d.getDay()])} ${d.getDate()} ${MO[d.getMonth()]}</p>
    ${gw?`<div class="dest" role="group" aria-label="Spara som"><button class="pill" type="button" data-act="gdest" data-v="lapp" aria-pressed="${!go}">Lapp här</button><button class="pill" type="button" data-act="gdest" data-v="google" aria-pressed="${go}">${I.cal} Google Kalender</button></div>`:""}
    <div class="add-row"><input type="time" name="time" aria-label="Tid"><input type="text" name="text" placeholder="Vad händer?" maxlength="80" autocomplete="off" required aria-label="Text"></div>
    ${gw?`<div class="gopts" ${go?"":"hidden"}><label>Slut <input type="time" name="end" aria-label="Sluttid"></label>
      <select name="cal" aria-label="Kalender">${gWritable().map(c=>`<option value="${esc(c.id)}" ${c.id===gDefCal()?"selected":""}>${esc(c.summary||c.id)}</option>`).join("")}</select>
      <label class="chk"><input type="checkbox" name="kyl"> ★ Visa på kylskåpet</label></div>
    <p class="msg bad" role="status" hidden></p>`:""}
    <div class="btns"><button class="pill" type="button" data-act="cancel">Avbryt</button><button class="pill c2" type="submit">${I.plus}<span> Lägg till</span></button></div></form>`;
  document.body.appendChild(el);el.querySelector("[name=text]").focus();
}
function closeEditor(){document.getElementById("ed")?.remove();edDate=null}
function addItem(date,time,text){text=text.trim();if(!text)return;S.items.push({id:uid(),date,time:time||"",text,done:false});save();render()}

/* ---------- confetti ---------- */
const fx=document.getElementById("fx"),ctx=fx.getContext("2d");let parts=[],raf=0;
const PAL=["#ff6b5b","#ffcb3d","#5ec8ff","#6fe3a1","#c58bff","#ff9ad5"];
function confetti(x,y,n){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  fx.hidden=false;fx.width=innerWidth*devicePixelRatio;fx.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=6+Math.random()*9;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-6,r:4+Math.random()*6,c:PAL[i%6],rot:Math.random()*6,vr:(Math.random()-.5)*.4,life:90+Math.random()*50,sq:Math.random()<.5})}
  if(!raf)raf=requestAnimationFrame(stepFx);
}
function stepFx(){
  ctx.clearRect(0,0,innerWidth,innerHeight);parts=parts.filter(p=>p.life>0);
  for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.vx*=.98;p.rot+=p.vr;p.life--;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.globalAlpha=Math.min(1,p.life/30);
    if(p.sq)ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);else{ctx.beginPath();ctx.arc(0,0,p.r/1.4,0,7);ctx.fill()}ctx.restore()}
  if(parts.length)raf=requestAnimationFrame(stepFx);else{raf=0;fx.hidden=true}
}

/* ---------- events ---------- */
document.addEventListener("click",e=>{
  if(moreOpen&&!e.target.closest('[data-act=more]')){moreOpen=false;document.querySelector(".bnav .more")?.remove();const mb=document.querySelector("[data-act=more]");if(mb){mb.classList.remove("on");mb.setAttribute("aria-expanded","false")}}
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.act==="more"){moreOpen=!moreOpen;still=true;return render()}
  if(b.id==="bignum"){const r=b.getBoundingClientRect();return confetti(r.left+r.width/2,r.top+r.height/2,120)}
  if(b.dataset.view){S.back=null;return setView(b.dataset.view)}
  if(b.dataset.step)return step(+b.dataset.step);
  if(b.dataset.week){S.back={view:S.view,at:S.at};S.roll=false;return setView("vecka",b.dataset.week)}
  if(b.dataset.go){if(S.view!=="dag"||S.at!==b.dataset.go)S.back={view:S.view,at:S.at};return setView("dag",b.dataset.go)}
  if(b.dataset.add)return openEditor(b.dataset.add);
  if(b.dataset.gev)return openGEvent(b.dataset.gev);
  if(b.dataset.hl){const [dt,k]=b.dataset.hl.split("|");return openHL(dt,k,false)}
  if(b.dataset.hlr){const [wd,k]=b.dataset.hlr.split("|");return openHL(wd,k,true)}
  const act=b.dataset.act;
  if(act==="today"){glideTo({at:iso(today()),roll:S.view==="vecka"?true:!!S.roll})}
  if(act==="roll"){glideTo(S.roll?{at:iso(today()),roll:false}:{at:iso(today()),roll:true})}
  else if(act==="theme"){S.theme=isDark()?"light":"dark";applyTheme();save();render();fridge.contentWindow?.postMessage({theme:S.theme},"*")}
  else if(act==="new")openEditor(newDate());
  else if(act==="cancel")closeEditor();
  else if(act==="gcal")openGSheet();
  else if(act==="tomonth"){morph(()=>{dir=0;S.view="manad";save();render()})}
  else if(act==="back"){const bk=S.back;S.back=null;if(bk)morph(()=>{dir=0;S.view=bk.view;S.at=bk.at;save();render()})}
  else if(act==="rule"){RS.diffs=null;RS.done=null;openRule()}
  else if(act==="rme"){S.hl.me=b.dataset.who;save();openRule(true);syncMine()}
  else if(act==="rset"){S.hl.rules[b.dataset.wd]=b.dataset.who;save();RS.diffs=null;openRule(true);render()}
  else if(act==="rswap"){const R=S.hl.rules;[R.even,R.odd]=[R.odd,R.even];save();RS.diffs=null;openRule(true)}
  else if(act==="rweeks"){RS.weeks=+b.dataset.n;RS.diffs=null;openRule(true)}
  else if(act==="rshow"){RS.done=null;RS.diffs=ruleDiffs();openRule(true)}
  else if(act==="rall"){(RS.diffs||[]).forEach(x=>x.on=true);openRule(true)}
  else if(act==="rapply")ruleApply();
  else if(act==="hldf"){S.hl.dflt=b.dataset.who;save();render()}
  else if(act==="hlset"){const f=document.getElementById("hlf");
    if(f&&f.dataset.r&&!b.dataset.who&&!b.classList.contains("armed")){b.classList.add("armed");b.textContent="Hela serien tas bort. Tryck igen";return}
    if(f)hlSet(f.dataset.date,f.dataset.k,!!f.dataset.r,b.dataset.who)}
  else if(act==="gdest"){S.gc.dest=b.dataset.v?b.dataset.v:(gDest()?"lapp":"google");save();
    const f=document.getElementById("edf");
    if(f){const go=gDest();f.querySelectorAll(".dest .pill").forEach(x=>x.setAttribute("aria-pressed",String((x.dataset.v==="google")===go)));f.querySelector(".gopts").hidden=!go;f.querySelector("h3").textContent=go?"Ny händelse":"Ny lapp";f.text.focus()}
    else{const t=document.querySelector(".add-row [name=text]")?.value;render();const n=document.querySelector(".add-row [name=text]");if(n){n.value=t||"";n.focus()}}}
  else if(act==="gwcal"){S.gc.wcal=b.dataset.id;save();openGSheet(true)}
  else if(act==="glv")setLevel(b.dataset.key,b.dataset.lv);
  else if(act==="gcal1"){const c=S.gc.cals[b.dataset.id]||(S.gc.cals[b.dataset.id]={});c.on=!calOn(b.dataset.id);save();openGSheet(true);render();syncFridge()}
  else if(act==="gon"){if(!B.hasGoogle()){S.gc.on=true;save();B.flush().then(()=>B.connectGoogle()).catch(e=>alertMsg(String(e&&e.message||e)));return}S.gc.on=true;G.state="idle";G.msg=null;G.calFail=false;G.fail.clear();save();gLoad();openGSheet(true)}
  else if(act==="gre")gRefresh();
  else if(act==="family")B.openFamily();
  else if(act==="goff"){try{localStorage.removeItem(GCACHE)}catch{}S.gc.on=false;G.state="off";G.ev.clear();G.done.clear();G.fail.clear();G.cals=[];G.loaded=false;G.msg=null;save();syncFridge(true);openGSheet(true);render()}
  else if(act==="gperm"){perms.manage().then(()=>{G.msg=null;G.perm=false;S.gc.on=true;G.state="idle";G.calFail=false;G.fail.clear();gLoad()}).catch(()=>{G.msg="Tryck på Koppla Google Kalender och tillåt Google Kalender.";openGSheet(true)})}
  else if(act==="toggle"){const i=S.items.find(x=>x.id===b.dataset.id);if(i){i.done=!i.done;save();if(i.done){const r=b.getBoundingClientRect();confetti(r.left+10,r.top+10,24)}render()}}
  else if(act==="del"){S.items=S.items.filter(x=>x.id!==b.dataset.id);save();render()}
});
document.addEventListener("change",e=>{const t=e.target;
  if(t.dataset.di!==undefined&&RS.diffs){RS.diffs[+t.dataset.di].on=t.checked;const b=document.querySelector("[data-act=rapply]");if(b)b.textContent=`Ja, skriv ${RS.diffs.filter(x=>x.on).length} ändringar i kalendern`}
  else if(t.dataset.act==="rsync"){S.hl.sync=t.checked;save();if(t.checked)syncMine()}
  else if(t.dataset.act==="rfw"){S.hl.rules.firstWed=t.checked;save();RS.diffs=null;openRule(true);render()}
});
document.addEventListener("submit",e=>{
  e.preventDefault();const f=e.target;
  if(f.id==="hlf"){if(f.who.value.trim())hlSet(f.dataset.date,f.dataset.k,!!f.dataset.r,f.who.value);return}
  if(f.id==="edf"){
    if(gcW()&&gDest()){const bt=f.querySelector("[type=submit]"),m=f.querySelector(".msg");bt.disabled=true;bt.lastElementChild.textContent=" Sparar …";m.hidden=true;
      gCreate(edDate,f.time.value,f.end.value,f.text.value,f.cal.value,f.kyl.checked).then(err=>{if(!err)return closeEditor();bt.disabled=false;bt.lastElementChild.textContent=" Lägg till";m.textContent=err;m.hidden=false});return}
    addItem(edDate,f.time.value,f.text.value);closeEditor();return}
  if(f.classList.contains("add-row")){
    if(gcW()&&gDest()){const bt=f.querySelector("[type=submit]");bt.disabled=true;
      gCreate(f.dataset.date,f.time.value,"",f.text.value,gDefCal(),false).then(err=>{bt.disabled=false;if(err)alertMsg(err)});return}
    addItem(f.dataset.date,f.time.value,f.text.value)}
});
document.addEventListener("click",e=>{if(e.target.id==="ed")closeEditor()});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&edDate)return closeEditor();
  if(e.key==="Escape"&&S.view==="dag"&&S.back)return document.querySelector("[data-act=back]")?.click();
  if(/INPUT|TEXTAREA/.test(e.target.tagName)||edDate)return;
  if(S.view==="kyl")return;
  if(e.key==="ArrowRight")step(1);else if(e.key==="ArrowLeft")step(-1);
  else if(e.key==="m"||e.key==="M")setView("manad");else if(e.key==="v"||e.key==="V")setView("vecka");else if(e.key==="d"||e.key==="D")setView("dag");else if(e.key==="k"||e.key==="K")setView("kyl");else if(e.key==="h"||e.key==="H")setView("hamta");
  else if(e.key==="t"||e.key==="T"){S.at=iso(today());save();render()}
});
/* swipe left/right to flip to the next or previous day, week or month.
   The page follows the finger (or mouse), and flies off when you let go far enough. */
let drag=null,eatClick=false;
document.addEventListener("pointerdown",e=>{
  if(edDate||S.view==="kyl"||e.button>0||dd&&e.pointerType==="mouse")return;const st=e.target.closest(".stage");if(!st||e.target.closest("input,form"))return;
  if(gliding)return;
  drag={x:e.clientX,y:e.clientY,t0:performance.now(),id:e.pointerId,st,on:false,dx:0};
});
document.addEventListener("pointermove",e=>{
  if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.on){if(Math.abs(dy)>14&&Math.abs(dy)>Math.abs(dx)){drag=null;return}
    if(Math.abs(dx)<10||Math.abs(dx)<Math.abs(dy)*1.2)return;
    drag.on=true;drag.st.classList.add("dragging");try{drag.st.setPointerCapture(e.pointerId)}catch{}
    drag.nb=[nbr(-1),cur(),nbr(1)];drag.t=buildTrack(drag.nb);if(!drag.t){drag=null;return}gliding=true;mount(drag.t,drag.t.off[1])}
  drag.dx=dx;drag.t.el.style.transition="none";drag.t.el.style.transform=`translateX(${drag.t.off[1]+dx}px)`;
});
function endDrag(e){
  if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;if(!d.on)return;
  d.st.classList.remove("dragging");eatClick=true;setTimeout(()=>eatClick=false,0);
  const t=d.t,w=d.st.clientWidth||innerWidth,v=d.dx/Math.max(1,performance.now()-d.t0),n=d.dx<0?1:-1;
  const reach=Math.abs(t.off[1+n]-t.off[1])||w,go=Math.abs(d.dx)>Math.min(w*.18,reach*.35)||Math.abs(v)>.5&&Math.abs(d.dx)>30;
  const to=go?t.off[1+n]:t.off[1],rest=Math.abs(to-(t.off[1]+d.dx)),ms=Math.max(180,Math.min(420,rest/Math.max(.8,Math.abs(v))));
  t.el.style.transition=`transform ${ms}ms cubic-bezier(.22,.9,.25,1)`;t.el.style.transform=`translateX(${to}px)`;
  let done=false;const fin=()=>{if(done)return;done=true;commit(go?d.nb[1+n]:d.nb[1])};
  t.el.addEventListener("transitionend",fin,{once:true});setTimeout(fin,ms+120);
}
document.addEventListener("pointerup",endDrag);
document.addEventListener("pointercancel",endDrag);
document.addEventListener("click",e=>{if(eatClick){e.stopImmediatePropagation();e.preventDefault()}},true);
/* two-finger sideways scroll on a trackpad flips too */
let wx=0,wlock=0;
document.addEventListener("wheel",e=>{
  if(S.view==="kyl"||edDate||!e.target.closest(".stage")||Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;
  e.preventDefault();const now=performance.now();if(now<wlock)return;
  wx+=e.deltaX;if(Math.abs(wx)>90){step(wx>0?1:-1);wx=0;wlock=now+550}
},{passive:false});
addEventListener("resize",()=>{if(!fx.hidden){fx.width=innerWidth*devicePixelRatio;fx.height=innerHeight*devicePixelRatio}});

/* ---------- drag notes and events to another day ----------
   Mouse: press on a note and move. Finger: hold a moment, then move. Drop it on another day. */
let dd=null;
const findEv=u=>{for(const e of G.ev.values())if(e.uid===u)return e;return null};
function ddStart(){
  dd.on=true;drag=null;const r=dd.src.getBoundingClientRect();
  const g=dd.src.cloneNode(true);g.classList.add("ghost");g.removeAttribute("data-drag");g.style.width=r.width+"px";g.style.left=r.left+"px";g.style.top=r.top+"px";
  dd.dx=dd.x-r.left;dd.dy=dd.y-r.top;dd.ghost=g;document.body.appendChild(g);dd.src.classList.add("dragsrc");document.body.classList.add("dragging");
  try{navigator.vibrate&&navigator.vibrate(12)}catch{}
}
function ddEnd(){if(!dd)return;clearTimeout(dd.timer);dd.ghost?.remove();dd.src.classList.remove("dragsrc");document.querySelector(".dropok")?.classList.remove("dropok");document.body.classList.remove("dragging");dd=null}
document.addEventListener("pointerdown",e=>{
  if(e.button>0||edDate)return;const src=e.target.closest("[data-drag]");if(!src)return;
  dd={src,id:src.dataset.drag,x:e.clientX,y:e.clientY,pid:e.pointerId,touch:e.pointerType!=="mouse",on:false,target:null};
  if(dd.touch)dd.timer=setTimeout(()=>{if(dd&&!dd.on&&!(drag&&drag.on))ddStart()},380);
},true);
document.addEventListener("pointermove",e=>{
  if(!dd||e.pointerId!==dd.pid)return;
  if(!dd.on){const m=Math.hypot(e.clientX-dd.x,e.clientY-dd.y);
    if(dd.touch){if(m>10){clearTimeout(dd.timer);dd=null}return}
    if(m<6)return;ddStart()}
  e.stopPropagation();e.preventDefault();
  dd.ghost.style.left=(e.clientX-dd.dx)+"px";dd.ghost.style.top=(e.clientY-dd.dy)+"px";
  const el=document.elementFromPoint(e.clientX,e.clientY),t=dd.id[0]==="p"?el?.closest("[data-dropslot]")||null:el?.closest("[data-drop]")||null;
  if(t!==dd.target){dd.target?.classList.remove("dropok");dd.target=t;t?.classList.add("dropok")}
},true);
document.addEventListener("touchmove",e=>{if(dd&&dd.on)e.preventDefault()},{passive:false});
document.addEventListener("pointerup",e=>{
  if(!dd||e.pointerId!==dd.pid)return;
  if(!dd.on){clearTimeout(dd.timer);dd=null;return}
  e.stopPropagation();const id=dd.id,to=dd.target&&(dd.target.dataset.dropslot||dd.target.dataset.drop),tel=dd.target;ddEnd();
  if(to&&id[0]==="p"){tel.classList.add("saving");const [a,k]=to.split("|"),r=a.startsWith("r:");
    eatClick=true;setTimeout(()=>eatClick=false,0);return dropName(id.slice(2),r?a.slice(2):a,k,r)}
  eatClick=true;setTimeout(()=>eatClick=false,0);
  if(to)dropOn(id,to);
},true);
document.addEventListener("pointercancel",e=>{if(dd&&e.pointerId===dd.pid)ddEnd()},true);
document.addEventListener("contextmenu",e=>{if(dd)e.preventDefault()});

/* a name dropped on a lämna/hämta box: that box gets that person */
async function dropName(who,at,k,isR){
  const cur=isR?hlRWho(+at,k):hlWho(parse(at),k);
  if(cur.who===who&&!cur.inf){render();return}
  if(cur.who===who&&cur.inf){render();return}
  await hlSet(at,k,isR,who);
}
async function dropOn(id,date){
  const t=id[0],ref=id.slice(2);
  if(t==="n"){const it=S.items.find(x=>x.id===ref);if(!it||it.date===date)return;it.date=date;save();render();return}
  if(t!=="g")return;
  const e=findEv(ref);if(!e||e.date===date)return;
  const moves=[[e,date]];
  if(e.hl){const o=hlOn(parse(date),e.hl.k);if(o){if(o.hl.who===e.hl.who)return;moves.push([o,e.date])}}
  const undo=moves.map(([x])=>({...x}));
  for(const [x,to] of moves)moveLocal(x,to);
  render();
  for(const [x,to] of moves){
    const err=await moveRemote(x,to);
    if(err){for(const u of undo){for(const [k,v] of G.ev)if(v.uid===u.uid)G.ev.delete(k);G.ev.set(u.uid+"@"+u.date,u)}render();return alertMsg(err)}
  }
  hlAfter(e.cal,false);syncFridge();
}
function moveLocal(x,to){
  for(const [k,v] of G.ev)if(v===x)G.ev.delete(k);
  const n=diff(parse(x.date),parse(to));x.date=to;x.last=iso(addDays(parse(x.last),n));G.ev.set(x.uid+"@"+x.date,x);
}
async function moveRemote(x,to){
  const input={calendarId:x.cal,eventId:x.eid};
  if(x.allDay){input.allDay=true;input.startTime=to+"T00:00:00";input.endTime=iso(addDays(parse(x.last),1))+"T00:00:00"}
  else{const [h,m]=x.time.split(":").map(Number),a=parse(to);a.setHours(h,m);input.startTime=loc(a);input.endTime=loc(new Date(+a+(x.dur||3600e3)))}
  const r=await gWrite("update_event",input);return r.err||null;
}

/* show last time's calendar straight away, before the connection answers */
if(S.gc.on&&gLoadCache()){G.needCals=true;G.state="idle"}
/* a change made on another phone in the family arrives here */
B.onShared(sh=>{
  if(sh.items!==undefined)S.items=clone(sh.items)||[];
  if(sh.lv!==undefined)S.gc.lv=clone(sh.lv)||{};
  if(sh.hl!==undefined){const me=S.hl.me,sync=S.hl.sync;S.hl={...S.hl,...clone(sh.hl),me,sync}}
  if(sh.trackers!==undefined){TRACKERS=[...sh.trackers,...TRACKERS.filter(t=>t.src==="gcal")];try{fridge.contentWindow?.postMessage({shared:sh.trackers},"*")}catch{}}
  if(S.view!=="kyl"&&!document.querySelector(".ed"))render();
});
applyTheme();render();gInit();
