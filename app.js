(() => {
'use strict';
const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const F0 = 32768;
const SPEEDS = [1, 64, 4096, 32768];
const S = { C: 0, offset: 0, div: 1, paused: false, power: true, needsSet: false, ppm: 0, temp: 25, is24: true, tab: null, why: false };

const pad = n => String(n).padStart(2, '0');
const fmtInt = n => Math.round(n).toLocaleString('en-US');
const fmtRate = v => v >= 100 ? fmtInt(v) : String(+v.toFixed(2));
function fmtDur(sec) {
  sec = Math.abs(sec);
  if (sec < 60) return sec.toFixed(1) + ' s';
  if (sec < 3600) return Math.floor(sec / 60) + ' min ' + Math.floor(sec % 60) + ' s';
  return Math.floor(sec / 3600) + ' h ' + Math.floor(sec % 3600 / 60) + ' min';
}
function phoneSecs() { const d = new Date(); return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000; }
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function restart(e, cls) { e.classList.remove(cls); e.getBoundingClientRect(); e.classList.add(cls); }

/* ---------- 7-segment LCD ---------- */
const SEGMAP = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abcdfg'];
function segPolys(w, h, t) {
  const H = y => [[t/2+1, y], [t+1, y-t/2], [w-t-1, y-t/2], [w-t/2-1, y], [w-t-1, y+t/2], [t+1, y+t/2]];
  const V = (x, ya, yb) => [[x, ya], [x+t/2, ya+t/2], [x+t/2, yb-t/2], [x, yb], [x-t/2, yb-t/2], [x-t/2, ya+t/2]];
  return { a: H(t/2), g: H(h/2), d: H(h-t/2), f: V(t/2, t/2+1, h/2-1), b: V(w-t/2, t/2+1, h/2-1), e: V(t/2, h/2+1, h-t/2-1), c: V(w-t/2, h/2+1, h-t/2-1) };
}
const pts = p => p.map(q => q.join(',')).join(' ');
const lcd = $('lcdSvg');
const cfH = el('rect', { x: 12, y: 13, width: 86, height: 68, rx: 4, class: 'cf' }, lcd);
const cfM = el('rect', { x: 110, y: 13, width: 86, height: 68, rx: 4, class: 'cf' }, lcd);
function mkDigit(x, y, s) {
  const g = el('g', { transform: `translate(${x} ${y}) scale(${s}) skewX(-6)` }, lcd);
  const P = segPolys(34, 62, 7), segs = {};
  for (const k in P) segs[k] = el('polygon', { points: pts(P[k]), class: 'sg off' }, g);
  let cur = null;
  return v => { if (v === cur) return; cur = v; const on = v < 0 ? '' : SEGMAP[v]; for (const k in segs) segs[k].setAttribute('class', on.includes(k) ? 'sg' : 'sg off'); };
}
const modeTxt = el('text', { x: 14, y: 11, class: 'lcdtxt' }, lcd);
el('text', { x: 258, y: 11, class: 'lcdtxt', 'text-anchor': 'end' }, lcd).textContent = 'QRONOX';
const dH1 = mkDigit(16, 16, 1), dH2 = mkDigit(58, 16, 1), dM1 = mkDigit(114, 16, 1), dM2 = mkDigit(156, 16, 1);
const dS1 = mkDigit(204, 39.6, .62), dS2 = mkDigit(230, 39.6, .62);
const col1 = el('rect', { x: 99, y: 31, width: 6, height: 6, class: 'sg' }, lcd);
const col2 = el('rect', { x: 96, y: 54, width: 6, height: 6, class: 'sg' }, lcd);
function drawLcd(h, m, s) {
  const hh = S.is24 ? h : (h % 12 || 12);
  dH1(S.is24 ? Math.floor(hh / 10) : (hh >= 10 ? 1 : -1)); dH2(hh % 10);
  dM1(Math.floor(m / 10)); dM2(m % 10); dS1(Math.floor(s / 10)); dS2(s % 10);
  modeTxt.textContent = S.is24 ? '24H' : (h < 12 ? 'AM' : 'PM');
}
function blankLcd() {
  [dH1, dH2, dM1, dM2, dS1, dS2].forEach(f => f(-1));
  col1.setAttribute('class', 'sg off'); col2.setAttribute('class', 'sg off');
  modeTxt.textContent = '';
}

/* ---------- Big labelled digit (Display tab) ---------- */
const setBig = (() => {
  const svg = $('bigDigit');
  const g = el('g', { transform: 'translate(21 8) scale(2)' }, svg);
  const P = segPolys(34, 62, 7), segs = {}, lbl = {};
  const CEN = { a: [17, 3.5], b: [30.5, 16.25], c: [30.5, 45.75], d: [17, 58.5], e: [3.5, 45.75], f: [3.5, 16.25], g: [17, 31] };
  for (const k in P) segs[k] = el('polygon', { points: pts(P[k]), class: 'sg off' }, g);
  for (const k in CEN) { const t = el('text', { x: 21 + 2 * CEN[k][0], y: 8 + 2 * CEN[k][1], class: 'seglbl' }, svg); t.textContent = k; lbl[k] = t; }
  let cur = null;
  return v => {
    if (v === cur) return; cur = v;
    const on = v < 0 ? '' : SEGMAP[v];
    for (const k in segs) { const L = on.includes(k); segs[k].setAttribute('class', L ? 'sg' : 'sg off'); lbl[k].setAttribute('class', 'seglbl' + (L ? ' lit' : '')); }
    $('segTxt').innerHTML = v < 0 ? 'Display off — no battery.'
      : `Showing <b>${v}</b> → segments <b>${[...on].sort().join(' ')}</b> on, ${7 - on.length} off.`;
  };
})();

/* ---------- Crystal ---------- */
const A = 8;
const tine = (x0, x1, d) => `M${x0} 150 Q${x0} 92 ${(x0+d).toFixed(2)} 40 L${(x1+d).toFixed(2)} 40 Q${x1} 92 ${x1} 150 Z`;
$('gL1').setAttribute('d', tine(122, 150, A)); $('gL2').setAttribute('d', tine(122, 150, -A));
$('gR1').setAttribute('d', tine(170, 198, A)); $('gR2').setAttribute('d', tine(170, 198, -A));
function drawTines(s, blur) {
  const dl = A * s, dr = -A * s;   // prongs move in opposite directions (flexural mode)
  $('tL').setAttribute('d', tine(122, 150, dl)); $('eL').setAttribute('d', tine(130, 142, dl));
  $('tR').setAttribute('d', tine(170, 198, dr)); $('eR').setAttribute('d', tine(178, 190, dr));
  const cL = $('cL'), cR = $('cR');
  cL.setAttribute('x', (136 + dl * .5).toFixed(1)); cR.setAttribute('x', (184 + dr * .5).toFixed(1));
  if (blur) { cL.textContent = '±'; cR.textContent = '±'; }
  else if (Math.abs(s) < .15) { cL.textContent = ''; cR.textContent = ''; }
  else { cL.textContent = s > 0 ? '+' : '−'; cR.textContent = s > 0 ? '−' : '+'; }
}
let xKey = null, lastShown = '';
function renderCrystal(C, rate) {
  const key = !S.power ? 'o' : S.paused ? 'p' : rate > 12 ? 'b' : 'v';
  if (key !== xKey) {
    xKey = key;
    const blur = key === 'b';
    $('ghosts').style.display = blur ? '' : 'none';
    $('tines').style.opacity = blur ? '.35' : '1';
    $('lw').classList.toggle('fast', key === 'b' || key === 'v');
    $('xStatus').innerHTML = {
      o: '<b class="warn">No battery</b> — with no amplifier pushing it, the crystal stops ringing.',
      p: '<b class="warn">Frozen</b> — the prongs are stopped mid-swing.',
      b: '<b class="warn">Too fast to see</b> — the prongs blur, as a real crystal would. Tap ÷32,768 below.',
      v: '<b class="good">Slow enough to see</b> — the prongs close and open while the +/− charge on the electrodes flips.'
    }[key];
    if (blur) drawTines(0, true);
    if (key === 'o') drawTines(0, false);
  }
  if (key === 'v' || key === 'p') drawTines(Math.sin(2 * Math.PI * (C % 1)), false);
  const shown = fmtRate(rate) + ' vib/s';
  if (shown !== lastShown) { lastShown = shown; $('xShown').textContent = shown; }
}

/* ---------- Divider ---------- */
const dots = [], dState = [];
let selStage = 15;
const dClass = (n, st) => 'dd' + (n === 15 ? ' out' : '') + (n === selStage ? ' sel' : '') + (st ? ' ' + st : '');
for (let n = 1; n <= 15; n++) {
  const b = document.createElement('button');
  b.className = dClass(n, '');
  b.innerHTML = `<i></i>${n}`;
  b.setAttribute('aria-label', `Stage ${n}, ${fmtInt(F0 / 2 ** n)} hertz`);
  b.addEventListener('click', () => showStage(n));
  $('drow').appendChild(b); dots.push(b); dState.push(null);
}
function showStage(n) {
  selStage = n;
  dots.forEach((d, i) => { d.className = dClass(i + 1, dState[i]); });
  const f = fmtInt(F0 / 2 ** n);
  $('dinfo').innerHTML = n === 15 ? `<b>Stage 15 · 1 Hz</b> — the last stage. It sends one pulse per second to the counter.`
    : n === 1 ? `<b>Stage 1 · ${f} Hz</b> — half of the crystal's 32,768 Hz.`
    : `<b>Stage ${n} · ${f} Hz</b> — half of stage ${n - 1}'s ${fmtInt(F0 / 2 ** (n - 1))} Hz.`;
}
let lastCyc = '';
function renderDivider(cyc, rate) {
  for (let n = 1; n <= 15; n++) {
    const st = !S.power ? '' : rate / 2 ** n > 12 ? 'blur' : (((cyc >> (n - 1)) & 1) ? 'on' : '');
    if (st !== dState[n - 1]) { dState[n - 1] = st; dots[n - 1].className = dClass(n, st); }
  }
  const t = fmtInt(cyc) + ' / 32,768';
  if (t !== lastCyc) { lastCyc = t; $('cycTxt').textContent = t; $('cycBar').style.width = (cyc / F0 * 100).toFixed(2) + '%'; }
}
function updateDivNote() {
  const e = $('divNote');
  if (!S.power) { e.textContent = 'No battery — no pulses arrive, so every stage stays off.'; return; }
  if (S.paused) { e.textContent = 'Frozen — each light shows its stored bit: on = 1, off = 0.'; return; }
  let n = 0; while (n < 15 && F0 / S.div / 2 ** (n + 1) > 12) n++;
  e.textContent = n
    ? `Stages 1–${n} switch too fast to follow, so they look half-lit.${S.div < 4096 ? ' Tap ÷4,096 to watch the ripple.' : ''}`
    : 'Every stage is slow enough to follow — each light switches when the one before it turns off.';
}

/* ---------- Counter ---------- */
function setCounters(h, m, s) {
  $('nS').textContent = s + ' / 60'; $('bS').style.width = (s / 60 * 100) + '%';
  $('nM').textContent = m + ' / 60'; $('bM').style.width = (m / 60 * 100) + '%';
  $('nH').textContent = h + ' / 24'; $('bH').style.width = (h / 24 * 100) + '%';
}

/* ---------- Watch ---------- */
let lastSod = -1, prevH = null, prevM = null, lastPhone = '', lastDiff = '', lcdOff = false;
function setDiff(txt, cls) { if (txt === lastDiff) return; lastDiff = txt; const b = $('diff'); b.textContent = txt; b.className = cls; }
function renderWatch(C, cyc) {
  const phone = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !S.is24 });
  if (phone !== lastPhone) { lastPhone = phone; $('phoneTime').textContent = phone; }
  if (!S.power) {
    if (!lcdOff) { lcdOff = true; blankLcd(); setBig(-1); setCounters(0, 0, 0); }
    setDiff('Off — no battery', 'warn');
    return;
  }
  if (lcdOff) { lcdOff = false; lastSod = -1; }
  const colOn = ((cyc >> 14) & 1) === 0;            // colon blinks with the 1 Hz stage
  col1.setAttribute('class', colOn ? 'sg' : 'sg off'); col2.setAttribute('class', colOn ? 'sg' : 'sg off');
  const W = S.offset + Math.floor(C / F0);
  const sod = ((W % 86400) + 86400) % 86400;
  if (sod !== lastSod) {
    lastSod = sod;
    const h = Math.floor(sod / 3600), m = Math.floor(sod / 60) % 60, s = sod % 60;
    drawLcd(h, m, s); setCounters(h, m, s); setBig(s % 10);
    if (prevM !== null && m !== prevM) { restart(cfM, 'go'); restart($('rM'), 'carry'); }
    if (prevH !== null && h !== prevH) { restart(cfH, 'go'); restart($('rH'), 'carry'); }
    prevH = h; prevM = m;
  }
  if (S.needsSet) { setDiff('Not set — tap Sync', 'warn'); return; }
  let d = S.offset + C / F0 - phoneSecs();
  d = ((d + 43200) % 86400 + 86400) % 86400 - 43200;
  if (Math.abs(d) < .5) setDiff('In sync', 'good');
  else setDiff(fmtDur(d) + (d < 0 ? ' behind' : ' ahead'), 'warn');
}
function sync() {
  const p = phoneSecs();
  S.C = (p % 1) * F0; S.offset = Math.floor(p); S.needsSet = false;
  prevH = prevM = null;
  updateBatNote();
}

/* ---------- Battery ---------- */
function updateBatNote() {
  $('batNote').innerHTML = !S.power ? '<b class="warn">Battery out.</b> The crystal stops and the count is lost.'
    : S.needsSet ? '<b class="warn">Battery back in.</b> The watch restarted from 00:00:00 — tap ⟲ Sync to set it.'
    : '<b class="good">Powered.</b> The battery runs the oscillator, divider, counter and display.';
}
function updatePower() {
  $('batBtn').textContent = S.power ? 'Remove battery' : 'Insert battery';
  $('cellG').style.opacity = S.power ? '1' : '.1';
  $('syncBtn').disabled = $('rollBtn').disabled = !S.power;
  updateBatNote(); updateDivNote();
}
$('batBtn').addEventListener('click', () => {
  S.power = !S.power; S.C = 0; S.offset = 0;
  if (S.power) { S.needsSet = true; prevH = prevM = null; }
  updatePower();
});

/* ---------- Speed bar ---------- */
const spBtns = [...document.querySelectorAll('.sp[data-i]')];
function setSpeed(i) {
  S.div = SPEEDS[i];
  spBtns.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', String(j === i)); });
  updateDivNote();
}
spBtns.forEach(b => b.addEventListener('click', () => setSpeed(+b.dataset.i)));
$('pauseBtn').addEventListener('click', () => {
  S.paused = !S.paused;
  const b = $('pauseBtn');
  b.querySelector('b').textContent = S.paused ? '▶' : '❚❚';
  b.querySelector('span').textContent = S.paused ? 'Resume' : 'Freeze';
  b.classList.toggle('on', S.paused); b.setAttribute('aria-pressed', String(S.paused));
  updateDivNote();
});

/* ---------- Tour + tabs ---------- */
const steps = [
  { tab: 'battery', t: 'Power', one: 'A tiny battery supplies the energy.',
    b: 'A digital watch usually runs on a 3 V lithium coin cell. The circuit draws only about a microampere, so one cell can last for years. The battery supplies energy — it does not decide how fast time passes.',
    tr: 'Tap “Remove battery”. The display goes blank and the crystal stops. Put it back and the watch restarts from 00:00 — then tap ⟲ Sync.' },
  { tab: 'crystal', t: 'Quartz crystal', one: 'A quartz tuning fork vibrates 32,768 times every second.',
    b: 'Quartz is piezoelectric: squeeze it and electric charge appears; apply a voltage and it bends. Cut into a tuning-fork shape a few millimetres long, it has one strong natural frequency — like a bell that rings at only one note.',
    tr: 'Tap ÷32,768 in the bottom bar: one vibration per second, slow enough to watch the prongs swing and the charges flip.' },
  { tab: 'crystal', amp: true, t: 'Oscillator loop', one: 'An amplifier keeps the crystal ringing.',
    b: 'On its own, the vibration would die away. A tiny amplifier on the chip senses the crystal’s voltage, boosts it and feeds it back in step — like pushing a swing at the right moment. Because the crystal responds strongly only at its own frequency, the loop locks onto 32,768 Hz.',
    tr: 'Follow the loop wires from the crystal through the amplifier and back. At Real speed that is 32,768 pushes every second.' },
  { tab: 'divider', t: 'Frequency divider', one: 'Halve it 15 times: 32,768 → 1 per second.',
    b: '32,768 = 2¹⁵. Each flip-flop gives one output pulse for every two input pulses, halving the frequency. After 15 halvings exactly one pulse per second remains. The chain is really a 15-bit binary counter.',
    tr: 'Tap ÷4,096 and watch the lights ripple from stage 1 to 15. Tap any light to see its frequency.' },
  { tab: 'counter', t: 'Counter', one: 'Count the seconds; carry over at 60.',
    b: 'Each 1 Hz pulse adds one to the seconds. At 60, seconds return to 0 and the minutes go up by one; at 60 minutes the hour goes up; after 23:59:59 the day restarts at 00:00:00.',
    tr: 'Tap “→ 23:59:55” under the watch and watch all three counters roll over.' },
  { tab: 'display', t: 'Display', one: 'Each digit is drawn with 7 segments.',
    b: 'A driver circuit turns each number into a pattern of seven segments (a–g) and switches them on the liquid-crystal display. On many watches the colon blinks in time with the 1 Hz signal from the divider.',
    tr: 'Tap 12 h / 24 h on the watch. Only the display changes — the count underneath stays the same.' },
  { tab: 'accuracy', t: 'Why watches drift', one: 'Temperature nudges the crystal’s frequency.',
    b: 'The watch always treats 32,768 vibrations as one second. If the crystal runs even slightly slow, every “second” is slightly too long, and the error adds up day after day. This model uses Δf/f = −0.034 ppm/°C² × (T − 25)², a typical datasheet value; 1 ppm ≈ 0.086 s per day. Real crystals also differ slightly from the factory (often ±20 ppm) and age slowly. Phones avoid drift by re-syncing with network time; this watch relies only on its crystal.',
    tr: 'Tap “Fridge 4°”: the watch now loses about 1.3 s a day.' }
];
const TABS = ['battery', 'crystal', 'divider', 'counter', 'display', 'accuracy'];
TABS.forEach(t => $('t-' + t).addEventListener('click', () => setStep(steps.findIndex(s => s.tab === t))));
function showTab(t) {
  S.tab = t;
  TABS.forEach(k => { $('t-' + k).setAttribute('aria-selected', String(k === t)); $('tab-' + k).hidden = k !== t; });
  xKey = null; dState.fill(null);
  if (t === 'accuracy') drawCurve();
}
let step = 0;
function setStep(i) {
  step = (i + steps.length) % steps.length;
  const s = steps[step];
  if (s.tab !== S.tab) showTab(s.tab);
  $('ampG').classList.toggle('hi', !!s.amp);
  $('stepTag').textContent = `Step ${step + 1} of ${steps.length}`;
  $('stTitle').textContent = s.t; $('stOne').textContent = s.one; $('stBody').textContent = s.b;
  $('stTry').innerHTML = '<strong>Try it:</strong> ' + s.tr;
  $('prevBtn').disabled = step === 0;
  $('nextBtn').setAttribute('aria-label', step === steps.length - 1 ? 'Restart tour' : 'Next step');
}
$('nextBtn').addEventListener('click', () => setStep(step + 1));
$('prevBtn').addEventListener('click', () => setStep(step - 1));
$('whyBtn').addEventListener('click', () => {
  S.why = !S.why;
  $('stBody').hidden = !S.why;
  $('whyBtn').setAttribute('aria-expanded', String(S.why));
  $('whyBtn').textContent = S.why ? 'Why? ▴' : 'Why? ▾';
});

/* ---------- Accuracy ---------- */
const PRESETS = [[4, 'Fridge', 0], [25, 'Room', 0], [30, 'Wrist', 1], [45, 'Hot car', 0]];
const tickBtns = PRESETS.map(([T, name, row]) => {
  const b = document.createElement('button');
  b.className = 'tk' + (row ? ' r2' : '');
  b.textContent = `${name} ${T}°`;
  b.style.left = `calc(8px + ${((T + 10) / 60).toFixed(4)} * (100% - 16px))`;
  b.addEventListener('click', () => setTemp(T));
  $('ticks').appendChild(b); return b;
});
function setTemp(T) {
  T = +T; S.temp = T; $('temp').value = T;
  S.ppm = -0.034 * (T - 25) ** 2;
  $('tempTxt').textContent = T + ' °C';
  $('aPpm').textContent = S.ppm.toFixed(2) + ' ppm';
  const f = (F0 * (1 + S.ppm * 1e-6)).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' Hz';
  $('aFreq').textContent = f; $('xFreq').textContent = f;
  const day = S.ppm * 0.0864;   // 86,400 s/day × 1e-6
  const verb = day < 0 ? 'Loses ' : 'Gains ';
  const perfect = Math.abs(day) < 0.005;
  $('aDay').textContent = perfect ? 'Perfect' : verb + Math.abs(day).toFixed(2) + ' s';
  $('aMonth').textContent = perfect ? 'Perfect' : verb + Math.abs(day * 30).toFixed(1) + ' s';
  $('aDay').className = $('aMonth').className = Math.abs(day) < 0.1 ? 'good' : 'warn';
  tickBtns.forEach((b, i) => b.classList.toggle('sel', PRESETS[i][0] === T));
  drawCurve();
}
$('temp').addEventListener('input', e => setTemp(e.target.value));
function drawCurve() {
  const c = $('curve'), dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
  if (!w || !h) return;
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
  const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
  const L = 34, R = w - 10, T = 10, B = h - 22;
  const tx = t => L + (t + 10) / 60 * (R - L), ty = p => T + (-p) / 45 * (B - T);
  x.font = '10px ' + getComputedStyle(document.body).fontFamily; x.lineWidth = 1;
  for (let p = 0; p >= -40; p -= 20) {
    const y = ty(p); x.strokeStyle = p === 0 ? '#3d6b5a' : '#1f2b34';
    x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke();
    x.fillStyle = '#7f8f9b'; x.textAlign = 'right'; x.fillText(String(p), L - 5, y + 3);
  }
  for (let t = -10; t <= 50; t += 20) { x.textAlign = t === -10 ? 'left' : t === 50 ? 'right' : 'center'; x.fillText(t + '°C', tx(t), B + 15); }
  x.textAlign = 'right'; x.fillText('ppm', L - 5, ty(-10) + 3);
  x.textAlign = 'left'; x.fillStyle = '#7be0b0'; x.fillText('0 ppm = perfect', L + 6, T + 12);
  x.setLineDash([3, 4]); x.strokeStyle = '#3a4955';
  x.beginPath(); x.moveTo(tx(25), T); x.lineTo(tx(25), B); x.stroke();
  x.setLineDash([]); x.strokeStyle = '#64e6f2'; x.lineWidth = 2; x.beginPath();
  for (let t = -10; t <= 50; t += .5) { const X = tx(t), Y = ty(-0.034 * (t - 25) ** 2); t === -10 ? x.moveTo(X, Y) : x.lineTo(X, Y); }
  x.stroke();
  const X = tx(S.temp), Y = ty(S.ppm);
  x.setLineDash([2, 3]); x.strokeStyle = '#e4b96a'; x.lineWidth = 1;
  x.beginPath(); x.moveTo(X, Y); x.lineTo(X, B); x.stroke(); x.setLineDash([]);
  x.fillStyle = '#e4b96a'; x.beginPath(); x.arc(X, Y, 5, 0, Math.PI * 2); x.fill();
}
window.addEventListener('resize', drawCurve);
if (document.fonts) document.fonts.ready.then(drawCurve);

/* ---------- Watch buttons ---------- */
$('fmtBtn').addEventListener('click', () => {
  S.is24 = !S.is24;
  $('fmtBtn').textContent = S.is24 ? '12 h' : '24 h';
  $('fmtBtn').setAttribute('aria-label', S.is24 ? 'Switch to 12-hour' : 'Switch to 24-hour');
  lastSod = -1; lastPhone = '';
});
$('syncBtn').addEventListener('click', sync);
$('rollBtn').addEventListener('click', () => { S.offset = 86395 - Math.floor(S.C / F0); S.needsSet = false; prevH = prevM = null; updateBatNote(); });

/* ---------- Main loop ---------- */
let last = performance.now(), lastRun = null;
function frame(now) {
  const dt = Math.max(0, (now - last) / 1000); last = now;
  const rate = (S.paused || !S.power) ? 0 : F0 * (1 + S.ppm * 1e-6) / S.div;   // crystal vibrations per real second
  S.C += rate * dt;
  const C = S.C, cyc = Math.floor(C % F0);
  renderWatch(C, cyc);
  if (S.tab === 'crystal') renderCrystal(C, rate);
  if (S.tab === 'divider') renderDivider(cyc, rate);
  const run = rate > 0;
  if (run !== lastRun) { lastRun = run; $('strip').classList.toggle('run', run); }
  requestAnimationFrame(frame);
}

sync(); setStep(0); setSpeed(0); setTemp(25); showStage(15); updatePower();
requestAnimationFrame(frame);
})();
