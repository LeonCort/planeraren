(() => {
const DAY=86400000;
const WD=["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"];
const MO=["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"];
const TYPES={birthday:"Födelsedag",yearly:"Varje år",weekly:"Varje vecka",once:"En gång"};
const UNITS=[["auto","Auto"],["sov","Nätter"],["veckor","Veckor"],["manader","Månader"]];
const COLORS=["c1","c2","c3","c4","c5","c6"];
const I={
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>'
};

/* ---------- themes (picked from the card's name/type) ---------- */
const THEMES={
  jul:  {name:"Jul",      svg:'<path d="M12 3 7 10h3l-4 5h4l-3 4h10l-3-4h4l-4-5h3z"/><path d="M12 19v2.5"/>'},
  nyar: {name:"Nyår",     svg:'<path d="M12 12V4M12 12l6-5M12 12l-6-5M12 12l7 2M12 12l-7 2M12 12l4 7M12 12l-4 7"/><circle cx="12" cy="3" r=".8"/><circle cx="19" cy="6" r=".8"/><circle cx="5" cy="6" r=".8"/>'},
  kalas:{name:"Kalas",    svg:'<ellipse cx="12" cy="9" rx="5.5" ry="6.5"/><path d="m12 15.5-1 2h2zM12 17.5c0 2-2 2-2 4"/>'},
  mys:  {name:"Mys",      svg:'<path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20z"/>'},
  sommar:{name:"Sommar",  svg:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M3 12h2M19 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'},
  mids: {name:"Midsommar",svg:'<circle cx="12" cy="6.6" r="2.6"/><circle cx="16.7" cy="9.3" r="2.6"/><circle cx="16.7" cy="14.7" r="2.6"/><circle cx="12" cy="17.4" r="2.6"/><circle cx="7.3" cy="14.7" r="2.6"/><circle cx="7.3" cy="9.3" r="2.6"/><circle cx="12" cy="12" r="2.2"/>'},
  pask: {name:"Påsk",     svg:'<path d="M12 3c3.5 0 6 4.5 6 9a6 6 0 0 1-12 0c0-4.5 2.5-9 6-9z"/><path d="M7 11.5q2.5-2 5 0t5 0"/>'},
  spok: {name:"Spöke",    svg:'<path d="M5 21V11a7 7 0 0 1 14 0v10l-2.3-2-2.4 2-2.3-2-2.3 2-2.4-2z"/><circle cx="9.5" cy="11" r=".9"/><circle cx="14.5" cy="11" r=".9"/>'},
  fest: {name:"Fest",     svg:'<path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z"/>'}
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
const stk=k=>`<span class="stk" aria-hidden="true"><svg viewBox="0 0 24 24">${THEMES[k].svg}</svg></span>`;
// faint repeating pattern of the motif, generated once per theme
(()=>{const st=document.createElement("style");
  st.textContent=Object.entries(THEMES).map(([k,v])=>{
    const tile=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54"><g fill="none" stroke="#1d1740" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".13"><g transform="translate(4 4) scale(.8)">${v.svg}</g><g transform="translate(31 31) scale(.8)">${v.svg}</g></g></svg>`;
    return `.th-${k}{--pat:url("data:image/svg+xml,${encodeURIComponent(tile)}");background-image:var(--pat)}`}).join("\n");
  document.head.appendChild(st)})();

/* ---------- storage ----------
   The notes belong to the family and are kept by Planeraren (Convex) — this page always runs inside it.
   Only how this device shows them (kvar/sedan, unit, tab, light/dark) stays in this browser. */
const B=(()=>{try{return parent!==window&&parent.__bridge}catch{return null}})();
if(!B){location.replace("/");throw new Error("Kylskåpet öppnas inifrån Planeraren")}
const KEY="kylskapet.ui.v1";
const UI_KEYS=["mode","unit","theme","tab"];
const load=()=>{let ui={};try{ui=JSON.parse(localStorage.getItem(KEY))||{}}catch{}
  const tr=Array.isArray(B.shared.trackers)?JSON.parse(JSON.stringify(B.shared.trackers)):[];
  const r={mode:"kvar",unit:"auto",theme:null,trackers:tr};for(const k of UI_KEYS)if(ui[k]!==undefined)r[k]=ui[k];return r};
let save=()=>{try{const ui={};for(const k of UI_KEYS)ui[k]=S[k];localStorage.setItem(KEY,JSON.stringify(ui))}catch{}
  B.setShared({trackers:S.trackers.filter(t=>t.src!=="gcal")})};
let S=load();
/* Auto picks the unit a kid can grasp for how far away the day is: nights up to three weeks, then weeks, then months */
function pickUnit(c){
  if(c.t.type==="weekly")return "sov";
  if(S.unit!=="auto")return S.unit;
  const d=S.mode==="kvar"&&!c.passed?c.left:c.since;
  return d<=21?"sov":d<=120?"veckor":"manader";
}

/* ---------- date math (local calendar days, DST safe) ---------- */
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const parse=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const dnum=d=>Math.round(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/DAY);
const diff=(a,b)=>dnum(b)-dnum(a);
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const ymd=(y,m,d)=>{const last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.min(d,last))};
function monthsBetween(a,b){let m=(b.getFullYear()-a.getFullYear())*12+(b.getMonth()-a.getMonth());if(ymd(a.getFullYear(),a.getMonth()+m,a.getDate())>b)m--;const an=ymd(a.getFullYear(),a.getMonth()+m,a.getDate());return {m:Math.max(0,m),d:diff(an,b)}}
const today=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())};

function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;return new Date(y,mo-1,da)}
const MOVABLE={pask:y=>addDays(easter(y),-1),midsommar:y=>{const d=new Date(y,5,19);return addDays(d,(5-d.getDay()+7)%7)}};
function compute(t){
  const T=today();let prev,next,passed=false;
  if(t.type==="weekly"){const k=(t.weekday-T.getDay()+7)%7;next=addDays(T,k);prev=addDays(next,-7)}
  else if(t.type==="once"){next=parse(t.date);prev=parse(t.created||iso(addDays(next,-30)));if(diff(prev,next)<1)prev=addDays(next,-1);if(next<T)passed=true}
  else if(t.movable&&MOVABLE[t.movable]){const f=MOVABLE[t.movable];next=f(T.getFullYear());if(next<T)next=f(T.getFullYear()+1);prev=f(next.getFullYear()-1)}
  else{const o=parse(t.date);next=ymd(T.getFullYear(),o.getMonth(),o.getDate());if(next<T)next=ymd(T.getFullYear()+1,o.getMonth(),o.getDate());prev=ymd(next.getFullYear()-1,o.getMonth(),o.getDate())}
  const span=diff(prev,next),left=passed?0:diff(T,next),isToday=left===0&&!passed;
  const since=passed?diff(next,T):(isToday?0:diff(prev,T));
  const elapsed=passed?span:span-left,pct=Math.max(0,Math.min(1,elapsed/span));
  let title=t.name,age=null;
  if(t.type==="birthday"){age=next.getFullYear()-parse(t.date).getFullYear();title=`${t.name} fyller ${age}`}
  return {t,prev,next,span,left,since,elapsed,pct,isToday,passed,title,age};
}
const pl=(n,a,b)=>n===1?a:b;
function amount(c){
  const kvar=S.mode==="kvar"&&!c.passed, days=kvar?c.left:c.since;
  const from=kvar?today():(c.passed?c.next:c.prev), to=kvar?c.next:today();
  const unit=pickUnit(c);
  if(unit==="veckor"){const n=Math.floor(days/7),r=days%7;return {n,word:pl(n,"vecka","veckor"),rest:r?`och ${r} ${pl(r,"natt","nätter")}`:"",unit}}
  if(unit==="manader"){const {m,d}=monthsBetween(from,to);return {n:m,word:pl(m,"månad","månader"),rest:d?`och ${d} ${pl(d,"natt","nätter")}`:"",unit}}
  return {n:days,word:pl(days,"natt","nätter"),rest:"",unit};
}
function phrase(c,a){ // the kid sentence
  const kvar=S.mode==="kvar"&&!c.passed;
  if(c.isToday) return {lead:"Det är",unit:"idag!",sub:c.t.type==="birthday"?`Grattis ${c.t.name}, ${c.age} år!`:"Hurra!"};
  if(c.passed) return {lead:"",unit:`${a.word} sedan`,sub:`Det var ${c.next.getDate()} ${MO[c.next.getMonth()]}`};
  if(kvar) return {lead:"",unit:a.word,sub:`${a.rest?a.rest+" · ":""}${WD[c.next.getDay()]} ${c.next.getDate()} ${MO[c.next.getMonth()]}`.replace(/^och /,"")};
  const last=c.t.type==="birthday"?`${c.t.name} fyllde ${c.age-1}`:`förra ${c.t.name.toLowerCase()}`;
  return {lead:"",unit:`${a.word} sedan`,sub:`${a.rest?a.rest+" · ":""}${last}`};
}
function moons(c,cap,force){
  let unit=force||pickUnit(c);
  if(cap&&unit==="sov"&&(S.mode==="kvar"&&!c.passed?c.left:c.span)>60) unit="veckor"; // one moon per night as long as it stays countable
  else if(!cap&&unit==="sov"&&S.unit==="auto"&&!(S.mode==="kvar"&&!c.passed)&&c.span>60) unit=c.span<=120?"veckor":"manader"; // "sedan" draws the whole span: pick a unit that fits it
  const down0=S.mode==="kvar"&&!c.passed&&!c.isToday;
  if(unit==="manader"){ // real calendar months, from the first one in the span up to and including the month of the day itself
    const nowN=dnum(c.prev)+c.elapsed,a=dnum(c.prev),z=dnum(c.next);let h="",n=0;
    for(let m=new Date(c.prev.getFullYear(),c.prev.getMonth(),1);dnum(m)<=z;m=new Date(m.getFullYear(),m.getMonth()+1,1)){
      const s0=Math.max(dnum(m),a),e0=Math.min(dnum(new Date(m.getFullYear(),m.getMonth()+1,1)),z),goal=dnum(m)<=z&&z<dnum(new Date(m.getFullYear(),m.getMonth()+1,1));
      const up=e0>s0?Math.max(0,Math.min(1,(nowN-s0)/(e0-s0))):(nowN>=e0?1:0);
      if(down0&&up>=1-1e-9&&!goal)continue; // a month that is over disappears in "Hur länge kvar"
      const f=down0?1-up:up,st=goal&&down0?"on":f>=1-1e-9?"on":f>1e-9?"now":"";
      h+=`<i class="mo ${st}${goal?" goal":""}" style="--i:${n++}${st==="now"?`;--p:${Math.round(f*100)}%`:""}">${goal?`<em>${c.next.getDate()}</em>`:""}<span>${MO[m.getMonth()].slice(0,3)}</span>${goal?RING:""}</i>`;
    }
    return {h,total:Math.max(1,n),unit};
  }
  const size=unit==="veckor"?7:1;
  const total=Math.max(1,Math.round(c.span/size)), done=c.elapsed/size, down=S.mode==="kvar"&&!c.passed&&!c.isToday;
  // "Hur länge kvar": only the moons still to go are drawn (they disappear as nights pass).
  // "Hur länge sedan": the whole span is drawn and the passed part is filled in.
  let h="";const from=down?Math.min(total-1,Math.floor(done+1e-9)):0,show=total-from;
  for(let i=from;i<total;i++){
    // counting down: lit markers are what is left; counting up: markers fill as time passes
    const f=down?Math.max(0,Math.min(1,i+1-done)):Math.max(0,Math.min(1,done-i));
    const goal=i===total-1,st=goal&&down?"on":f>=1-1e-9?"on":f>1e-9?"now":"",g=goal?" goal":"",R=goal?RING:"";
    if(unit==="veckor"){ // seven day-dots per week
      const lit=st==="on"?7:Math.round(f*7);
      h+=`<i class="wk ${st}${g}" style="--i:${i}">${Array.from({length:7},(_,k)=>`<b class="${st==="now"&&(down?k>=7-lit:k<lit)?"lit":""}"></b>`).join("")}${R}</i>`;
    } else h+=st==="on"?`<i class="moon on${g}" style="--i:${i}">${R}</i>`:st==="now"?`<i class="moon now${g}" style="--i:${i};--p:${Math.round(f*100)}%">${R}</i>`:`<i class="moon${g}" style="--i:${i}">${R}</i>`;
  }
  return {h,total:show,unit};
}
const esc=s=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const rot=id=>{let x=0;for(const ch of id)x=(x*31+ch.charCodeAt(0))%1000;return ((x%5)-2)*0.9};

/* ---------- views ---------- */
document.documentElement.lang="sv"; // Swedish hyphenation for long names like "Midsommarafton"
const app=document.getElementById("app");
const sorted=()=>S.trackers.map(compute).sort((a,b)=>(a.passed-b.passed)||(a.left-b.left));
const isDark=()=>S.theme?S.theme==="dark":(document.documentElement.dataset.theme?document.documentElement.dataset.theme==="dark":!matchMedia("(prefers-color-scheme: light)").matches);
const RING='<svg class="ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M56 5C84 4 98 27 96 52C94 79 72 97 46 95C19 94 3 74 4 48C5 22 27 6 57 8C66 9 73 12 79 16"/></svg>';
const CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const MODES=[["kvar","Hur länge kvar?"],["sedan","Hur länge sedan?"]];
const UNIT_LABEL={auto:"Auto",sov:"Nätter",veckor:"Veckor",manader:"Månader"};
const CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const sel=(name,label,opts,val)=>{const cur=(opts.find(o=>o[0]===val)||opts[0])[1];
  return `<div class="dd" data-dd="${name}"><button class="pill" data-ddt="${name}" aria-haspopup="listbox" aria-expanded="false" aria-label="${label}: ${cur}"><span>${cur}</span>${CHEV}</button>
  <ul class="ddm" role="listbox" aria-label="${label}">${opts.map(([k,l],n)=>`<li><button role="option" style="--k:${n}" data-pickv="${name}" data-v="${k}" aria-selected="${val===k}"><span class="ck">${CHECK}</span>${l}</button></li>`).join("")}</ul></div>`};
function closeDD(except){document.querySelectorAll(".dd.open").forEach(d=>{if(d!==except){d.classList.remove("open");d.querySelector("[data-ddt]").setAttribute("aria-expanded","false")}})}
function openDD(d,focusSel){closeDD(d);d.classList.remove("r");d.classList.add("open");d.querySelector("[data-ddt]").setAttribute("aria-expanded","true");
  const m=d.querySelector(".ddm"),r=m.getBoundingClientRect();if(r.right>innerWidth-8)d.classList.add("r");
  if(focusSel)(m.querySelector('[aria-selected="true"]')||m.querySelector("button")).focus()}
function controls(){
  return `${sel("mode","Riktning",MODES,S.mode)}${sel("unit","Räkna i",UNITS.map(([k,l])=>[k,k==="auto"?"Räkna i: Auto":l]),S.unit)}
  <button class="pill ico" data-act="theme" aria-label="${isDark()?"Ljust läge":"Mörkt läge"}">${isDark()?I.sun:I.moon}</button>`;
}
/* tabs: everything, the family's birthdays, and the big days of the year */
const TABS=[["alla","Alla",()=>true],["fodelsedagar","Födelsedagar",t=>t.type==="birthday"],["stora","Stora dagar",t=>t.type==="yearly"||t.type==="once"]];
const tabNow=()=>TABS.find(x=>x[0]===S.tab)||TABS[0];
let tabDir=0;
function listView(){
  const tab=tabNow(),all=sorted(),cs=all.filter(c=>tab[2](c.t)),T=today();
  app.innerHTML=`
  <header class="top">
    <div class="lead">
      <span class="pill today-pill" aria-label="Dagens datum">${WD[T.getDay()][0].toUpperCase()+WD[T.getDay()].slice(1)} ${T.getDate()} ${MO[T.getMonth()]}</span>
      <div class="tabs" role="tablist" aria-label="Visa">${TABS.map(([k,l,f])=>`<button class="pill" role="tab" data-tab="${k}" aria-selected="${tab[0]===k}">${l}<span class="cnt">${all.filter(c=>f(c.t)).length}</span></button>`).join("")}</div>
    </div>
    <div class="ctl">${controls()}<button class="pill c2" data-act="new" aria-label="Ny lapp">${I.plus}<span class="txt"> Ny lapp</span></button></div>
  </header>
  <section class="board"><div class="notes ${cs.length>10?"many":cs.length<=5&&cs.length>0?"few":""}">
    ${cs.map(note).join("")}
    ${cs.length?"":'<button class="note add" data-act="new"><span class="who disp">+ Sätt upp en lapp</span></button>'}
  </div></section>`;
  fitListMoons();
  runFlip();
  if(tabDir&&!REDUCED.matches&&Element.prototype.animate){
    document.querySelectorAll(".note").forEach((n,i)=>n.animate([{opacity:0,transform:`translateX(${tabDir*40}px) rotate(var(--r,0deg)) scale(.92)`},{opacity:1,transform:"rotate(var(--r,0deg))"}],{duration:380,delay:Math.min(i*40,320),easing:"cubic-bezier(.3,1.4,.5,1)",fill:"backwards"}));
    tabDir=0;
  }
}
function setTab(k){const i=TABS.findIndex(x=>x[0]===k),j=TABS.indexOf(tabNow());if(i<0||i===j)return;tabDir=i>j?1:-1;S.tab=k;save();render()}
function stepTab(d){const j=TABS.indexOf(tabNow()),i=Math.max(0,Math.min(TABS.length-1,j+d));setTab(TABS[i][0])}
function note(c){
  const a=amount(c),p=phrase(c,a),t=c.t;
  const th=themeOf(t);
  return `<button class="note th-${th} ${c.isToday?"today":""}" style="--c:var(--${t.color||"c2"});--r:${rot(t.id)}deg;--magnet:var(--${COLORS[(COLORS.indexOf(t.color||"c2")+3)%6]})" data-open="${esc(t.id)}" aria-label="${esc(c.title)}">
    <span class="date">${c.next.getDate()} ${MO[c.next.getMonth()].slice(0,3)}</span>
    <h2 class="who disp">${esc(c.title).replace(/(\p{L}{4,})(afton|avslutning)/giu,"$1\u00AD$2")}</h2>
    <div class="big">${c.isToday?`<span class="num">IDAG</span>`:`<span class="num">${a.n}</span><span class="unit">${p.lead?p.lead+"<br>":""}${esc(p.unit)}</span>`}</div>
    ${(m=>`<div class="moons" data-n="${m.total}" data-u="${m.unit}" style="--d:${m.total>30?"13px":"18px"};--g:${m.total>30?"5px":"7px"}" title="${m.unit==="veckor"?"En ruta per vecka, en prick per dag":m.unit==="manader"?"Ett kalenderblad per månad":"En måne per natt"}">${m.h}</div>`)(moons(c,1))}
    <span class="sub">${esc(p.sub)}</span>
    ${th==="jul"?'<span class="drift" aria-hidden="true"></span>':""}${stk(th)}
  </button>`;
}
/* fun facts for the poster: 4 small stickers */
const nf=n=>n.toLocaleString("sv-SE"),cap=w=>w[0].toUpperCase()+w.slice(1);
function countWeekday(from,to,wd){let n=0;for(let d=addDays(from,1);d<=to;d=addDays(d,1))if(d.getDay()===wd)n++;return n}
function facts(c){
  const T=today(),t=c.t,out=[],kvar=S.mode==="kvar"&&!c.passed;
  const to=kvar?c.next:T, from=kvar?T:(c.passed?c.next:c.prev);
  if(c.isToday){
    if(t.type==="birthday"){const born=parse(t.date);out.push({big:nf(diff(born,T)),small:`dagar har ${esc(t.name)} levt`});out.push({big:cap(WD[born.getDay()]),small:`var dagen ${esc(t.name)} föddes`})}
    out.push({big:"100 %",small:"av väntan är över"});
    out.push({big:"Hurra!",small:"dags att fira"});
    return out.slice(0,4);
  }
  const sat=countWeekday(from,to,6),fri=countWeekday(from,to,5);
  if(t.type!=="weekly"){
    out.push({big:nf(sat),small:kvar?pl(sat,"lördag kvar","lördagar kvar"):pl(sat,"lördag sedan dess","lördagar sedan dess")});
    out.push({big:nf(fri),small:kvar?"fredagsmys kvar":"fredagsmys sedan dess"});
  } else {
    out.push({big:`${Math.round(c.pct*100)} %`,small:"av veckan har gått"});
    out.push({big:cap(WD[T.getDay()]),small:"är det idag"});
  }
  if(t.type==="birthday"){
    const born=parse(t.date);
    out.push({big:nf(diff(born,c.next)),small:`dagar gammal blir ${esc(t.name)} då`});
    out.push({big:cap(WD[born.getDay()]),small:`var dagen ${esc(t.name)} föddes`});
  } else if(t.type!=="weekly"){
    const {m,d}=monthsBetween(from,to);
    out.push({big:m?`${m} mån${d?" "+d+" d":""}`:`${d} d`,small:"om man räknar i månader"});
    out.push({big:`${Math.round((kvar?1-c.pct:c.pct)*100)} %`,small:`av ${/skolavslutning/i.test(t.name)?"läsåret":t.type==="once"?"väntan":"året"} ${kvar?"är kvar":"har gått"}`});
  } else {
    const nxt=sorted().find(x=>x.t.id!==t.id&&!x.passed);
    if(nxt) out.push({big:nf(nxt.left),small:`nätter till ${esc(nxt.title.toLowerCase())}`});
  }
  return out.slice(0,4);
}

/* ---------- note ⇄ poster transition ---------- */
let flip=null; // {rect,color,id,dir}
const REDUCED=matchMedia("(prefers-reduced-motion: reduce)");
function ghost(rect,color,radius){const g=document.createElement("div");g.style.cssText=`position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;background:${color};border:4px solid var(--line);border-radius:${radius}px;box-shadow:8px 8px 0 var(--line);z-index:25;pointer-events:none`;document.body.appendChild(g);return g}
function popOut(el){
  if(!el||REDUCED.matches)return;const r=el.getBoundingClientRect(),g=el.cloneNode(true);
  g.style.cssText=`position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:26;pointer-events:none;box-sizing:border-box`;
  document.body.appendChild(g);g.animate([{transform:"scale(1)",opacity:1},{transform:"scale(.4)",opacity:0}],{duration:200,easing:"cubic-bezier(.6,0,.8,.4)",fill:"forwards"}).onfinish=()=>g.remove();
}
function fadeClone(el,dur,hideSel){ // leave a fading copy of the outgoing view behind the growing/shrinking ghost
  if(!el||REDUCED.matches)return;const r=el.getBoundingClientRect(),g=el.cloneNode(true);
  if(hideSel)g.querySelectorAll(hideSel).forEach(x=>{x.style.visibility="hidden"});
  g.style.cssText=`position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:24;pointer-events:none;box-sizing:border-box;flex:none`;
  g.querySelectorAll("[id]").forEach(x=>x.removeAttribute("id"));
  document.body.appendChild(g);g.animate([{opacity:1},{opacity:0}],{duration:dur,easing:"ease-out",fill:"forwards"}).onfinish=()=>g.remove();
}
function popIn(sel,delay){
  if(REDUCED.matches||!Element.prototype.animate)return;
  document.querySelectorAll(sel).forEach((el,i)=>el.animate([{transform:"scale(.3)",opacity:0},{transform:"scale(1)",opacity:1}],{duration:420,delay:delay+i*70,easing:"cubic-bezier(.3,1.5,.5,1)",fill:"backwards"}));
}
const SHARED={who:".who",num:".num",unit:".unit",sub:".sub",stk:".stk"};
const rectNoTx=el=>{const t=el.style.transform;el.style.transform="none";const r=el.getBoundingClientRect();el.style.transform=t;return r};
// snapshot of a card about to leave: its own box plus where each shared piece sits (measured with the card un-rotated)
function snapshot(card){
  const t=card.style.transform;card.style.transform="none";
  const out={rect:card.getBoundingClientRect(),color:getComputedStyle(card).backgroundColor,sh:{}};
  for(const [k,sel] of Object.entries(SHARED)){const el=card.querySelector(sel);if(el)out.sh[k]={r:rectNoTx(el),text:el.textContent.trim()}}
  card.style.transform=t;return out;
}
function runFlip(){
  if(!flip||REDUCED.matches||!Element.prototype.animate){flip=null;return}
  const f=flip;flip=null;
  popIn(f.dir==="open"?"[data-act=back]":".today-pill,[data-act=new]",180);
  const target=f.dir==="open"?document.querySelector(".poster"):document.querySelector(`.note[data-open="${CSS.escape(f.id)}"]`);
  if(!target)return;
  const E="cubic-bezier(.7,0,.2,1)",D=f.dir==="open"?520:420;
  target.classList.add("flipping");
  const to=target.getBoundingClientRect();
  const g=ghost(f.rect,f.color,f.dir==="open"?22:32);
  // shared pieces: fly + scale from the old card to the new one; the rest waits and fades in afterwards
  const later=[],shared=[];
  for(const [k,sel] of Object.entries(SHARED)){
    const el=target.querySelector(sel);if(!el)continue;
    const from=f.sh&&f.sh[k];
    if(!from||from.text!==el.textContent.trim()){later.push(el);continue}
    const r=rectNoTx(el),base=getComputedStyle(el).transform,bt=base==="none"?"":" "+base;
    el.style.transformOrigin="0 0";shared.push(el); // scale about the top-left corner so translate maths holds
    el.animate([{transform:`translate(${from.r.left-r.left}px,${from.r.top-r.top}px) scale(${from.r.height/r.height})${bt}`},{transform:bt.trim()||"none"}],{duration:D,easing:E,fill:"backwards"});
  }
  target.querySelectorAll(".date,.moons,.fact,.foot,.tick,.hint").forEach(el=>later.push(el));
  later.forEach(el=>{el.style.opacity="0"});
  g.animate([{left:f.rect.left+"px",top:f.rect.top+"px",width:f.rect.width+"px",height:f.rect.height+"px",borderRadius:(f.dir==="open"?22:32)+"px"},
             {left:to.left+"px",top:to.top+"px",width:to.width+"px",height:to.height+"px",borderRadius:(f.dir==="open"?32:22)+"px"}],{duration:D,easing:E,fill:"forwards"})
   .onfinish=()=>{target.classList.remove("flipping");g.remove();shared.forEach(el=>{el.style.transformOrigin=""});
     later.forEach((el,i)=>{el.style.opacity="";el.animate([{opacity:0,transform:"translateY(14px) scale(.98)"},{opacity:1,transform:"none"}],{duration:360,delay:Math.min(i*40,320),easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"})});
     if(f.dir==="open") target.querySelectorAll(".moon,.wk,.mo").forEach((m,i)=>m.animate([{transform:"scale(0)"},{transform:"scale(1)"}],{duration:300,delay:120+Math.min(i*6,500),easing:"cubic-bezier(.3,1.6,.5,1)",fill:"backwards"}));
     else target.animate([{transform:"rotate(0deg) scale(1.03)"},{transform:"rotate(var(--r,0deg))"}],{duration:300,easing:"cubic-bezier(.3,1.4,.5,1)"});
   };
}
function detailView(id){
  const t=S.trackers.find(x=>x.id===id);if(!t){location.hash="";return listView()}
  const c=compute(t),a=amount(c),p=phrase(c,a);tick.c=c;
  app.innerHTML=`
  <header class="top">
    <div class="seg"><button class="pill" data-act="back" aria-label="Alla lappar">${I.back}<span class="txt"> Alla lappar</span></button></div>
    <div class="ctl">${controls()}</div>
  </header>
  <section class="poster th-${themeOf(t)} ${c.isToday?"party":""}" style="--c:var(--${t.color||"c2"})">
    ${themeOf(t)==="jul"?'<span class="drift" aria-hidden="true"></span>':""}${stk(themeOf(t))}
    <h1 class="who disp">${esc(c.title)}</h1>
    <div class="mid">
      <div>
        <span class="num ${c.isToday?"word":""}" id="bignum" role="button" tabindex="0" aria-label="Tryck för konfetti">${c.isToday?"IDAG":a.n}</span>
        <div class="unit">${c.isToday?esc(p.sub):esc(p.unit)}</div>
        <p class="sub">${c.isToday?"Tryck på IDAG för konfetti!":esc(p.sub)}</p>
        <div class="tick" id="tick" role="timer"></div>
      </div>
      <div class="side">
        <div class="facts">${facts(c).map((f,i)=>`<div class="fact" style="--i:${i}"><b class="fnum">${f.big}</b><span>${f.small}</span></div>`).join("")}</div>
        ${(m=>`<div class="moons" id="pmoons" aria-label="${UNIT_LABEL[m.unit]}" title="Tryck så hoppar de" data-n="${m.total}" data-u="${m.unit}">${m.h}</div>`)(moons(c,0))}
      </div>
    </div>
    <div class="foot">
      <span class="hint">Tryck på siffran för konfetti</span>
      <div class="seg"><button class="pill" data-act="edit" data-id="${esc(t.id)}">Ändra</button><button class="pill danger" data-act="del" data-id="${esc(t.id)}">Ta bort</button></div>
    </div>
  </section>`;
  fitMoons();
  runFlip();
  if(c.isToday) setTimeout(()=>confetti(innerWidth/2,innerHeight/3,160),600);
}

/* size poster moons to fill the free space under the fact stickers */
function fitMoons(){
  const box=document.getElementById("pmoons");if(!box){fitListMoons();return}
  const n=+box.dataset.n||1,W=box.clientWidth,mid=box.closest(".mid"),left=mid.firstElementChild,foot=box.closest(".poster").querySelector(".foot");
  const top=box.getBoundingClientRect().top;
  box.style.display="none"; // measure the free space without the moons pushing the poster taller
  const H=Math.max(120,Math.max(left.getBoundingClientRect().bottom,foot.getBoundingClientRect().top-24)-top);
  box.style.display="";
  sizeMoons(box,n,W,H,96);
}
function fitListMoons(){
  if(!FILL.matches)return;
  const boxes=[...document.querySelectorAll(".note .moons")];
  // shrink every marker first, so the notes settle at their natural row height before measuring
  boxes.forEach(b=>{b.style.setProperty("--d","6px");b.style.setProperty("--g","3px")});void document.body.offsetHeight;
  // measure every note first, then size: growing one note must not stretch the row the next one is measured in
  boxes.map(b=>{
    const note=b.closest(".note"),big=note.querySelector(".big"),sub=note.querySelector(".sub");
    const pad=parseFloat(getComputedStyle(note).paddingBottom)||14,gap=parseFloat(getComputedStyle(note).rowGap)||8;
    return [b,b.clientWidth,note.clientHeight-pad-(big.offsetTop+big.offsetHeight)-sub.offsetHeight-gap*2];
  }).forEach(([b,W,H])=>sizeMoons(b,+b.dataset.n||1,W,Math.max(12,H),b.closest('.few')?110:52));
}
const FILL=matchMedia("(min-width:900px) and (min-height:560px)");
function sizeMoons(box,n,W,H,cap){
  const u=box.dataset.u,aw=u==="veckor"?1.6:1,ah=u==="manader"?1.18:1;
  let d=Math.min(cap,Math.floor(W/3/aw));
  for(;d>=8;d--){const g=Math.max(3,Math.round(d*.3)),cols=Math.max(1,Math.floor((W+g)/(d*aw+g))),rows=Math.ceil(n/cols);if(rows*(d*ah+g)-g<=H)break}
  box.style.setProperty("--d",d+"px");box.style.setProperty("--g",Math.max(3,Math.round(d*.3))+"px");
}
addEventListener("resize",fitMoons);
document.fonts?.ready.then(fitMoons);

/* ---------- confetti ---------- */
const fx=document.getElementById("fx"),ctx=fx.getContext("2d");let parts=[],raf=0;
const PAL=["#ff6b5b","#ffcb3d","#5ec8ff","#6fe3a1","#c58bff","#ff9ad5"];
function confetti(x,y,n){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  fx.hidden=false;fx.width=innerWidth*devicePixelRatio;fx.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=6+Math.random()*9;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-6,r:4+Math.random()*6,c:PAL[i%6],rot:Math.random()*6,vr:(Math.random()-.5)*.4,life:90+Math.random()*50,sq:Math.random()<.5})}
  if(!raf)raf=requestAnimationFrame(step);
}
function step(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(p=>p.life>0);
  for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.vx*=.98;p.rot+=p.vr;p.life--;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.globalAlpha=Math.min(1,p.life/30);
    if(p.sq)ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);else{ctx.beginPath();ctx.arc(0,0,p.r/1.4,0,7);ctx.fill()}ctx.restore()}
  if(parts.length)raf=requestAnimationFrame(step);else{raf=0;fx.hidden=true}
}

/* ---------- editor ---------- */
let draft=null;
function openEditor(t){draft=t?{...t}:{id:null,type:S.tab==="stora"?"yearly":"birthday",name:"",date:"",weekday:6,color:COLORS[Math.floor(Math.random()*6)]};renderEditor()}
function renderEditor(err){
  let el=document.getElementById("ed");if(!el){el=document.createElement("div");el.id="ed";el.className="scrim";document.body.appendChild(el)}
  const t=draft,isW=t.type==="weekly";
  el.innerHTML=`<form class="sheet" aria-labelledby="edh">
    <h2 class="disp" id="edh">${t.id?"Ändra lappen":"Ny lapp"}</h2>
    <div class="f"><span class="lbl muted">Vad räknar vi till?</span><div class="types">${Object.entries(TYPES).map(([k,l])=>`<button type="button" class="pill" data-type="${k}" aria-pressed="${t.type===k}">${l}</button>`).join("")}</div></div>
    <label class="f"><span class="lbl muted">${t.type==="birthday"?"Vem fyller år?":"Vad heter det?"}</span><input id="ed-name" value="${esc(t.name)}" placeholder="${t.type==="birthday"?"Kian":isW?"Simskola":"Midsommar"}" maxlength="40" autocomplete="off"></label>
    ${isW?`<label class="f"><span class="lbl muted">Vilken dag?</span><select id="ed-wd">${[1,2,3,4,5,6,0].map(i=>`<option value="${i}" ${+t.weekday===i?"selected":""}>${WD[i][0].toUpperCase()+WD[i].slice(1)}</option>`).join("")}</select></label>`
        :t.movable&&t.type==="yearly"?`<p class="f muted">Datumet flyttar sig och räknas ut automatiskt varje år.</p>`
        :`<label class="f"><span class="lbl muted">${t.type==="birthday"?"Födelsedag":"Datum"}</span><input id="ed-date" type="date" value="${esc(t.date||"")}"></label>`}
    <div class="f"><span class="lbl muted">Färg på lappen</span><div class="swatches">${COLORS.map(k=>`<button type="button" class="sw" data-color="${k}" style="background:var(--${k})" aria-pressed="${t.color===k}" aria-label="Färg ${k.slice(1)}"></button>`).join("")}</div></div>
    ${err?`<p class="err" role="alert">${err}</p>`:""}
    <div class="acts"><button type="button" class="pill" data-act="cancel">Avbryt</button><button class="pill c4" type="submit">Sätt upp</button></div>
  </form>`;
  document.getElementById("ed-name").focus();
}
const closeEditor=()=>{document.getElementById("ed")?.remove();draft=null};
function readDraft(){draft.name=document.getElementById("ed-name").value.trim();const dt=document.getElementById("ed-date"),wd=document.getElementById("ed-wd");if(dt)draft.date=dt.value;if(wd)draft.weekday=+wd.value}
function submitEditor(){
  readDraft();
  if(!draft.name)return renderEditor("Skriv ett namn.");
  const mov=draft.movable&&draft.type==="yearly";
  if(draft.type!=="weekly"&&!mov&&!draft.date)return renderEditor("Välj ett datum.");
  if(draft.type==="birthday"&&parse(draft.date)>today())return renderEditor("Födelsedagen ligger i framtiden. Välj En gång i stället.");
  const clean={id:draft.id,type:draft.type,name:draft.name,color:draft.color};
  if(draft.type==="weekly")clean.weekday=draft.weekday;else if(mov)clean.movable=draft.movable;else clean.date=draft.date;
  if(draft.type==="once")clean.created=draft.created||iso(today());
  {const o=S.trackers.find(x=>x.id===draft.id);if(o&&o.src)clean.src=o.src}
  if(!clean.id){clean.id=Date.now().toString(36);S.trackers.push(clean)}else S.trackers=S.trackers.map(x=>x.id===clean.id?clean:x);
  save();closeEditor();location.hash=clean.id;render();
}

/* ---------- events ---------- */
document.addEventListener("click",e=>{
  const ddt=e.target.closest("[data-ddt]");
  if(ddt){const d=ddt.parentElement;d.classList.contains("open")?closeDD():openDD(d,e.detail===0);return}
  const pv=e.target.closest("[data-pickv]");
  if(pv){const k=pv.dataset.pickv;closeDD();if(S[k]!==pv.dataset.v){S[k]=pv.dataset.v;save();render()}document.querySelector(`[data-ddt="${k}"]`)?.focus();return}
  if(!e.target.closest(".dd"))closeDD();
  if(e.target.closest("#pmoons")){const m=e.target.closest("#pmoons");m.classList.remove("wave");void m.offsetWidth;m.classList.add("wave");return}
  const b=e.target.closest("button,[role=button]");if(!b)return;
  if(b.id==="bignum"){const r=b.getBoundingClientRect();return confetti(r.left+r.width/2,r.top+r.height/2,120)}
  if(b.dataset.type&&draft){readDraft();draft.type=b.dataset.type;return renderEditor()}
  if(b.dataset.color&&draft){readDraft();draft.color=b.dataset.color;return renderEditor()}
  if(b.dataset.tab)return setTab(b.dataset.tab);
  if(b.dataset.mode){S.mode=b.dataset.mode;save();return render()}
  if(b.dataset.unit){S.unit=b.dataset.unit;save();return render()}
  if(b.dataset.open){flip={...snapshot(b),id:b.dataset.open,dir:"open"};popOut(document.querySelector(".today-pill"));popOut(document.querySelector("[data-act=new]"));fadeClone(document.querySelector(".board"),420,`[data-open="${CSS.escape(b.dataset.open)}"]`);location.hash=b.dataset.open;return}
  const act=b.dataset.act;
  if(act==="new")openEditor();
  else if(act==="cancel")closeEditor();
  else if(act==="back"){const po=document.querySelector(".poster");if(po)flip={...snapshot(po),id:decodeURIComponent(location.hash.slice(1)),dir:"close"};popOut(b);fadeClone(po,260,Object.values(SHARED).join(","));location.hash=""}
  else if(act==="edit")openEditor(S.trackers.find(x=>x.id===b.dataset.id));
  else if(act==="del"){if(!b.classList.contains("armed")){b.classList.add("armed");b.textContent="Säker? Tryck igen";setTimeout(()=>{if(b.isConnected){b.classList.remove("armed");b.textContent="Ta bort"}},4000);return}
    const gone=S.trackers.find(x=>x.id===b.dataset.id);
    S.trackers=S.trackers.filter(x=>x.id!==b.dataset.id);save();location.hash="";render();
    if(EMBED&&gone&&gone.src==="gcal")try{parent.postMessage({hideGcal:gone.id},"*")}catch{}}
  else if(act==="theme"){S.theme=isDark()?"light":"dark";applyTheme();save();render();if(EMBED)try{parent.postMessage({themeNow:S.theme},"*")}catch{}}
});
// dropdown keyboard: arrows move through the options, Escape closes
document.addEventListener("keydown",e=>{const d=e.target.closest&&e.target.closest(".dd");if(!d)return;
  const opts=[...d.querySelectorAll("[data-pickv]")],i=opts.indexOf(e.target);
  if(e.key==="Escape"&&d.classList.contains("open")){e.preventDefault();e.stopPropagation();closeDD();d.querySelector("[data-ddt]").focus();return}
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();e.stopPropagation();
    if(!d.classList.contains("open"))return openDD(d,true);
    opts[(i<0?0:i+(e.key==="ArrowDown"?1:-1)+opts.length)%opts.length].focus();return}
  if(e.key==="ArrowLeft"||e.key==="ArrowRight")e.stopPropagation();
  if(e.key==="Tab"&&d.classList.contains("open"))closeDD();
},true);
// swipe or arrow keys move between tabs on the fridge
let sx=null,sy=0;
document.addEventListener("touchstart",e=>{if(location.hash||draft||!e.target.closest(".board"))return;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
document.addEventListener("touchend",e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)stepTab(dx<0?1:-1)});
document.addEventListener("keydown",e=>{if(!location.hash&&!draft&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){stepTab(e.key==="ArrowRight"?1:-1);document.querySelector('[data-tab][aria-selected="true"]')?.focus();return}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&draft)closeEditor();if(e.target.id==="bignum"&&(e.key==="Enter"||e.key===" ")){e.preventDefault();e.target.click()}});
document.addEventListener("submit",e=>{e.preventDefault();submitEditor()});
document.addEventListener("click",e=>{if(e.target.id==="ed")closeEditor()});
addEventListener("hashchange",()=>{render();scrollTo(0,0)});
function tick(){const el=document.getElementById("tick"),c=tick.c;if(!el||!c||c.isToday)return;const now=new Date(),down=S.mode==="kvar"&&!c.passed;let ms=Math.max(0,down?c.next-now:now-(c.passed?c.next:c.prev));const d=Math.floor(ms/DAY),r=ms%DAY,p=n=>String(n).padStart(2,"0");
  const vals=[[String(d),d===1?"dag":"dagar"],[p(Math.floor(r/36e5)),"tim"],[p(Math.floor(r%36e5/6e4)),"min"],[p(Math.floor(r%6e4/1e3)),"sek"]];
  if(!el.children.length){el.innerHTML=vals.map(()=>'<span class="tu"><b></b><small></small></span>').join("");el.setAttribute("aria-label","Exakt")}
  [...el.children].forEach((u,i)=>{const b=u.firstChild;if(b.textContent!==vals[i][0]){const first=!b.textContent;b.textContent=vals[i][0];u.lastChild.textContent=vals[i][1];if(!first){b.classList.remove("bump");void b.offsetWidth;b.classList.add("bump")}}});
  el.title=`Exakt ${d} dagar ${vals[1][0]}:${vals[2][0]}:${vals[3][0]}`}
setInterval(tick,1000);
function applyTheme(){if(S.theme)document.documentElement.setAttribute("data-dt",S.theme);else document.documentElement.removeAttribute("data-dt")}
function render(){tick.c=null;const id=decodeURIComponent(location.hash.slice(1));id?detailView(id):listView();tick()}
/* inside Planeraren: tighter top, follow the parent's light/dark choice, and tell it when the notes change */
const EMBED=location.search.includes("embed");
if(EMBED){document.documentElement.classList.add("embed");
  addEventListener("message",e=>{if(e.data&&e.data.theme!==undefined&&e.source===parent){S.theme=e.data.theme;applyTheme();save();render()}});
  const save0=save;save=()=>{save0();try{parent.postMessage({trackers:S.trackers},"*")}catch{}};
  /* the important events from Google Kalender arrive from Planeraren as countdown notes (src:"gcal");
     ones that are no longer important or have passed are taken down again */
  addEventListener("message",e=>{if(e.source!==parent||!e.data||!Array.isArray(e.data.gcal))return;
    const inc=e.data.gcal.filter(g=>g&&typeof g.id==="string"&&/^\d{4}-\d\d-\d\d$/.test(g.date||"")),ids=new Set(inc.map(g=>g.id)),T=iso(today());
    let ch=false;const keep=S.trackers.filter(t=>t.src!=="gcal"||ids.has(t.id));if(keep.length!==S.trackers.length){S.trackers=keep;ch=true}
    for(const g of inc){const o=S.trackers.find(t=>t.id===g.id),name=String(g.name||"").slice(0,60);
      if(!o){S.trackers.push({id:g.id,type:"once",name,date:g.date,created:T,color:/^c[1-6]$/.test(g.color)?g.color:"c3",src:"gcal"});ch=true}
      else if(o.src==="gcal"&&(o.name!==name||o.date!==g.date)){o.name=name;o.date=g.date;ch=true}}
    if(ch){save();render()}});
  /* a note changed on another phone in the family */
  addEventListener("message",e=>{if(e.source!==parent||!e.data||!Array.isArray(e.data.shared))return;
    const mine=JSON.stringify(S.trackers.filter(t=>t.src!=="gcal"));if(mine===JSON.stringify(e.data.shared))return;
    S.trackers=[...JSON.parse(JSON.stringify(e.data.shared)),...S.trackers.filter(t=>t.src==="gcal")];
    if(!document.getElementById("ed"))render()});
  try{parent.postMessage({ready:1,trackers:S.trackers},"*")}catch{}}
applyTheme();render();
setInterval(()=>{const k=iso(today());if(k!==render.day){render.day=k;render()}},60000);render.day=iso(today());
})();
