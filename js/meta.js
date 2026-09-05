// meta.js — wheel / gacha / signin / tasks / prestige / research / contracts
import { getState, now, todayKey, fmt, writeSave } from './core.js';
import { WHEEL, GACHA, GACHA_R, SIGNIN, TASK_POOL, RESEARCH, LAB, SKIN_BY, SKINS, getMods, coresFor, PRESTIGE_ZONE, ZONES } from './data.js';
import { bus, addCoins, incomePerMin, resetWorld } from './game.js';
import { requestAd, requestMidgame, adAvailable, SDK } from './ads.js';
import { icon } from './icons.js';

// ---------- daily reset ----------
export function dailyReset() {
  const st = getState(), tk = todayKey();
  if (st.wheel.day !== tk) { st.wheel = { day: tk, free: 1, adUsed: 0 }; }
  if (st.tasks.day !== tk || !st.tasks.list.length) genTasks();
}
function wPick(list, wf) {
  let tot = 0; for (const it of list) tot += wf(it);
  let r = Math.random() * tot;
  for (const it of list) { r -= wf(it); if (r <= 0) return it; }
  return list[list.length - 1];
}

// ---------- rewards ----------
export function grantReward(rw, src = '') {
  const st = getState(), mods = getMods(st);
  if (rw.kind === 'coins') {
    const c = Math.max(30, incomePerMin() * rw.min);
    addCoins(c);
    return { text: `${icon('coin', 16)} +${fmt(c)}`, coins: c };
  }
  if (rw.kind === 'gems') {
    const g = Math.round(rw.n * mods.gemMult);
    st.gems += g; bus.emit('gems', g);
    return { text: `${icon('gem', 16)} +${g}`, gems: g };
  }
  if (rw.kind === 'buff') { addBuff('x2', rw.min); return { text: `${icon('bolt', 16)} 2× ${rw.min}min` }; }
  if (rw.kind === 'egg') { st.gacha = st.gacha || { count: 0, tickets: 0 }; st.gacha.tickets += rw.n; return { text: `${icon('egg', 16)} x${rw.n}` }; }
  if (rw.kind === 'jackpot7') {
    const g = Math.round(100 * mods.gemMult);
    st.gems += g; st.gacha = st.gacha || { count: 0, tickets: 0 }; st.gacha.tickets += 1;
    return { text: `${icon('gem', 16)} +${g} ${icon('egg', 16)}`, gems: g };
  }
  return { text: '?' };
}
export function addBuff(id, minutes) {
  const st = getState();
  const until = now() + minutes * 60e3;
  const ex = st.buffs.find(b => b.id === id && b.until > now());
  if (ex) ex.until += minutes * 60e3; else st.buffs.push({ id, until });
  bus.emit('buff', 1);
}

// ---------- wheel ----------
export function wheelState() {
  const st = getState();
  return { free: st.wheel.free, canAd: adAvailable('wheel_extra') };
}
export function wheelSpin(useAd) {
  const st = getState();
  if (useAd) { st.wheel.free += 2; }
  else { if (st.wheel.free <= 0) return null; st.wheel.free--; }
  const seg = wPick(WHEEL, s => s.w);
  bus.emit('spin', 1);
  const idx = WHEEL.indexOf(seg);
  return { seg, idx };
}

// ---------- gacha ----------
export function gachaState() {
  const st = getState();
  st.gacha = st.gacha || { count: 0, tickets: 0 };
  return { gems: Math.floor(st.gems), tickets: st.gacha.tickets, pity: st.gacha.count };
}
export function gachaPull(n, useTicket = false) {
  const st = getState();
  st.gacha = st.gacha || { count: 0, tickets: 0 };
  const cost = n === 10 ? 180 : 20;
  if (useTicket) {
    if (st.gacha.tickets < n) return null;
    st.gacha.tickets -= n;
  } else {
    if (st.gems < cost) return null;
    st.gems -= cost;
  }
  const results = [];
  const luck = 1 + 0.25 * (st.lab.egg_luck || 0);
  for (let i = 0; i < n; i++) {
    st.gacha.count++;
    let item = wPick(GACHA, g => {
      const r = GACHA_R(g);
      let w = g.w;
      if (r >= 2) w *= luck;
      return w;
    });
    // pity: 10th pull guaranteed epic+
    if (st.gacha.count >= 10 && GACHA_R(item) < 2) {
      const epics = GACHA.filter(g => GACHA_R(g) >= 2);
      item = wPick(epics, g => g.w);
    }
    if (GACHA_R(item) >= 2) st.gacha.count = 0;
    results.push(applyGacha(item));
  }
  st.stats.eggs += n;
  bus.emit('egg', n);
  writeSave();
  return results;
}
function applyGacha(item) {
  const st = getState();
  if (item.type === 'skin') {
    if (st.skins.includes(item.id)) {
      st.gems += 40;
      return { type: 'dup', skin: SKIN_BY[item.id], text: `${SKIN_BY[item.id].nE} → +40 ${icon('gem', 13)}`, r: SKIN_BY[item.id].r };
    }
    st.skins.push(item.id);
    return { type: 'skin', skin: SKIN_BY[item.id], text: SKIN_BY[item.id].nE, r: SKIN_BY[item.id].r };
  }
  if (item.type === 'gems') { st.gems += item.n; return { type: 'gems', text: `+${item.n} ${icon('gem', 13)}`, r: item.n >= 80 ? 2 : 1 }; }
  if (item.type === 'buff') { addBuff('x2', item.min); return { type: 'buff', text: `${icon('bolt', 13)} 2× ${item.min}min`, r: 1 }; }
  if (item.type === 'coins') { const c = incomePerMin() * item.min; addCoins(c); return { type: 'coins', text: `+${fmt(c)} ${icon('coin', 13)}`, r: 1 }; }
  return { type: '?', text: '?', r: 0 };
}

// ---------- sign-in ----------
export function signinState() {
  const st = getState(), tk = todayKey();
  const claimedToday = st.signin.last === tk;
  const idx = st.signin.day % 7;
  return { claimedToday, idx, reward: SIGNIN[idx], canMakeup: !claimedToday && st.signin.last !== '' };
}
export function signinClaim(makeup = false) {
  const st = getState(), tk = todayKey();
  const s = signinState();
  if (s.claimedToday && !makeup) return null;
  const rw = SIGNIN[s.idx];
  const got = grantReward(rw, 'signin');
  st.signin.day++;
  if (!makeup) st.signin.last = tk;
  return { reward: rw, got };
}

// ---------- daily tasks ----------
function genTasks() {
  const st = getState();
  const pool = [...TASK_POOL];
  const list = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    const t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    let goal = t.goal;
    if (t.id === 'earn') goal = Math.max(500, Math.floor(incomePerMin() * 12));
    list.push({ id: t.id, goal, prog: 0, gem: t.gem, claimed: false });
  }
  st.tasks = { day: todayKey(), list };
}
export function taskEvent(ev, n = 1) {
  const st = getState();
  if (!st.tasks.list) return;
  let changed = false;
  for (const t of st.tasks.list) {
    const def = TASK_POOL.find(p => p.id === t.id);
    if (!def || def.ev !== ev || t.claimed) continue;
    if (t.prog < t.goal) { t.prog = Math.min(t.goal, t.prog + n); changed = true; }
  }
  if (changed) bus.emit('taskprog');
}
bus.on('catch', n => taskEvent('catch', n));
bus.on('golden', n => taskEvent('golden', n));
bus.on('earn', n => taskEvent('earn', n));
bus.on('catchOne', e => contractProgress(e.defId, e.golden));
bus.on('spin', () => taskEvent('spin', 1));
bus.on('research', () => taskEvent('research', 1));
bus.on('buff', () => taskEvent('buff', 1));
bus.on('egg', () => taskEvent('egg', 1));
bus.on('deep', () => taskEvent('deep', 1));
export function taskEarn(n) {
  taskEvent('earn', n);
}

// ---------- prestige ----------
export function prestigeInfo() {
  const st = getState();
  const cores = coresFor(st);
  return {
    cores, can: st.zone >= PRESTIGE_ZONE && cores > 0,
    prestiges: st.prestiges,
    labOpen: st.prestiges >= 2,
    zoneOk: st.zone >= PRESTIGE_ZONE,
  };
}
export async function doPrestige() {
  const st = getState();
  const info = prestigeInfo();
  if (!info.can) return false;
  await requestMidgame();
  st.cores += info.cores;
  st.prestiges++;
  st.coins = 0;
  st.lifetime.runEarned = 0;
  st.upgrades = {};
  st.zone = Math.min(st.lab.start_zone || 0, 4);
  st.scanner = { id: null, endsAt: 0 };
  if (st.lab.deep_bank) st.coins = 500 * 20 ** (st.lab.deep_bank - 1);
  resetWorld();
  SDK.happytime();
  bus.emit('prestige');
  return true;
}
export function labBuy(id) {
  const st = getState();
  const def = LAB.find(l => l.id === id);
  const lv = st.lab[id] || 0;
  if (lv >= def.max) return false;
  const cost = def.cost(lv);
  if (st.cores < cost) return false;
  st.cores -= cost;
  st.lab[id] = lv + 1;
  return true;
}

// ---------- research (scanner) ----------
export function researchState() {
  const st = getState();
  if (st.scanner.id && st.scanner.endsAt <= now()) {
    const def = RESEARCH.find(r => r.id === st.scanner.id);
    addBuff(def.buff, def.min);
    st.scanner = { id: null, endsAt: 0 };
    bus.emit('research', 1);
    writeSave();
    return { justFinished: def };
  }
  return { active: st.scanner.id ? RESEARCH.find(r => r.id === st.scanner.id) : null, endsAt: st.scanner.endsAt };
}
export function researchOptions() { return wPick2(RESEARCH); }
function wPick2(list) {
  const a = Math.floor(Math.random() * list.length);
  let b = Math.floor(Math.random() * list.length);
  if (b === a) b = (b + 1) % list.length;
  return [list[a], list[b]];
}
export function researchStart(id) {
  const st = getState(), mods = getMods(st);
  const def = RESEARCH.find(r => r.id === id);
  if (!def) return 0;
  const ms = def.time * 60e3 / mods.researchSpeed;
  st.scanner = { id, endsAt: now() + ms };
  return ms;
}
export function researchSkip() {
  const st = getState();
  if (!st.scanner.id) return false;
  st.scanner.endsAt = 0;
  researchState();
  return true;
}

// ---------- salvage contracts (timed challenges) ----------
export const contract = { active: null, cdUntil: 0 };
export function contractAvailable() {
  const st = getState();
  return st.zone >= 3 && !contract.active && now() >= contract.cdUntil;
}
export function contractStart() {
  const st = getState();
  let species = CREATURES.filter(c => c.zone === st.zone && c.r <= 1);
  if (!species.length) species = CREATURES.filter(c => c.zone === st.zone);
  const def = species[Math.floor(Math.random() * species.length)];
  const goal = 3 + Math.floor(Math.random() * 3);
  contract.active = {
    defId: def.id, goal, prog: 0,
    endsAt: now() + 90e3,
    gems: Math.round((5 + st.zone * 2) * getMods(st).contractMult),
    coinsM: 2 + st.zone,
  };
  bus.emit('contractstart');
  return contract.active;
}
export function contractTick() {
  if (!contract.active) return;
  if (now() > contract.active.endsAt) {
    contract.active = null;
    contract.cdUntil = now() + 8 * 60e3;
    bus.emit('contractfail');
  }
}
export function contractProgress(defId, golden) {
  const c = contract.active;
  if (!c) return;
  if (c.defId === defId || golden) {
    c.prog++;
    if (c.prog >= c.goal) {
      const st = getState(), mods = getMods(st);
      st.gems += c.gems;
      addCoins(incomePerMin() * c.coinsM);
      st.stats.contracts++;
      contract.active = null;
      contract.cdUntil = now() + 8 * 60e3;
      bus.emit('contractdone', c.gems);
      writeSave();
      SDK.happytime();
    }
  }
}
