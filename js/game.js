// game.js — live world: spawning, claw state machine, camera, selling, events
import { rand, now, getState, fmt, SFX } from './core.js';
import { ZONES, CREATURES, RARITY_W, getMods, avgZoneValue, hasBuff } from './data.js';
import { spawnP, floatText } from './fx.js';
import { SDK } from './ads.js';

export const PPM = 5; // px per meter
export const bus = { m: {}, on(e, f) { (this.m[e] ||= []).push(f); }, emit(e, n) { (this.m[e] || []).forEach(f => f(n)); } };

export const G = {
  W: 0, H: 0, camY: 0, t: 0, shake: 0,
  claw: { state: 'swing', ang: 0, d: 0, hold: [], stun: 0 },
  ents: [],
  spawned: new Set(),
  squid: null, squidTimer: 60,
  surge: { active: false, nextAt: 30 },
  droneAcc: 0, droneVis: 0,
};

export function resize() {
  G.W = window.innerWidth; G.H = window.innerHeight;
  const c = document.getElementById('game');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = G.W * dpr; c.height = G.H * dpr;
  // CPU-backed 2D context: reliable readback/QA-sampling and consistent on low-end devices
  c.getContext('2d', { willReadFrequently: true }).setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ---------- world reset (on zone change / prestige / load) ----------
export function resetWorld() {
  G.ents = []; G.spawned.clear(); G.squid = null;
  G.squidTimer = 45; G.surge = { active: false, nextAt: 30 };
  G.claw.state = 'swing'; G.claw.d = 0; G.claw.hold = [];
}

// ---------- spawning ----------
const BAND = 50;
function ensureBands(topM, botM) {
  const st = getState();
  const z = ZONES[st.zone];
  const b0 = Math.max(1, Math.floor(topM / BAND)), b1 = Math.floor(botM / BAND);
  const mods = getMods(st);
  for (let b = b0; b <= b1; b++) {
    const k = z.id + ':' + b;
    if (G.spawned.has(k)) continue;
    G.spawned.add(k);
    const ym = b * BAND + rand(-18, 18);
    if (z.id >= 2 && Math.random() < 0.1) {
      G.ents.push({ mine: true, x: rand(.08, .92), ym, ph: rand(0, 6) });
    }
    for (let slot = 0; slot < 3; slot++) {
      if (Math.random() >= 0.8) continue;
      const sy = ym + rand(-14, 14);
      const roll = Math.random() * 100 * mods.rareBoost;
      let r = 0;
      if (roll < RARITY_W[3] * mods.rareBoost) r = 3;
      else if (roll < RARITY_W[3] + RARITY_W[2] * mods.rareBoost) r = 2;
      else if (roll < RARITY_W[3] + RARITY_W[2] + RARITY_W[1]) r = 1;
      let poolC = CREATURES.filter(c => c.zone === z.id && c.r === r);
      if (!poolC.length) poolC = CREATURES.filter(c => c.zone === z.id);
      const def = poolC[Math.floor(Math.random() * poolC.length)];
      G.ents.push({
        def, x: rand(.06, .94), ym: sy, dir: Math.random() < .5 ? -1 : 1,
        sp: rand(12, 30) * (z.mech === 'currents' ? 1.8 : 1), ph: rand(0, 6),
        golden: Math.random() < mods.goldenChance,
        echo: z.mech === 'echo' && Math.random() < 0.2,
      });
    }
  }
}

// ---------- claw ----------
const SWING_W = 1.5, MAX_ANG = 1.05, ARM = 170;
// pivot = crane boom tip (right of the boat, above the waterline).
// ARM >> pivot height so the claw always hangs at/below the water surface.
export function craneAnchor() { return { bx: G.W * 0.5 + 88, by: -40 }; }
export function clawTip() {
  const c = G.claw, { bx, by } = craneAnchor();
  return { x: bx + Math.sin(c.ang) * c.d, y: by + Math.cos(c.ang) * c.d };
}

export function tryDrop(sx, sy) {
  const st = getState(), c = G.claw;
  if (c.state !== 'swing' || c.stun > 0) return false;
  if (G.squid) {
    const s = { x: G.squid.x * G.W, y: G.squid.ym * PPM - G.camY };
    if (Math.hypot(s.x - sx, s.y - sy) < 70) { catchSquid(); return true; }
  }
  c.state = 'drop'; c.hold = [];
  SFX.splash();
  spawnP(clawTip().x, 8 - G.camY, 'splash', '#cfeeff', 10);
  return true;
}

export function catchSquid() {
  const st = getState(), mods = getMods(st);
  const gems = Math.max(1, Math.round(3 * mods.gemMult));
  const coins = avgZoneValue(st.zone) * mods.valueMult * 25;
  st.gems += gems; addCoins(coins);
  floatText(G.W / 2, G.H * 0.4, `+${gems}`, '#6ee7ff');
  floatText(G.W / 2, G.H * 0.4 + 26, `+${fmt(coins)}`, '#ffd257');
  SFX.golden(); bus.emit('golden', 1); bus.emit('catch', 1);
  G.squid = null;
  SDK.happytime();
}

export function addCoins(n) {
  const st = getState();
  st.coins += n; st.lifetime.earned += n; st.lifetime.runEarned += n;
  bus.emit('earn', n);
}

// ---------- surge / rush strings (set by main) ----------
let S_surge = () => 'SURGE!', S_rush = () => 'Golden Squid!', S_mine = () => 'Mine!', S_new = () => 'NEW SPECIES!';
export function setL(f) { S_surge = f.surge; S_rush = f.rush; S_mine = f.mine; S_new = f.newSpecies; }

// ---------- main update ----------
let hudAcc = 0;
export function update(dt) {
  const st = getState(), c = G.claw, mods = getMods(st);
  G.t += dt;
  if (G.shake > 0) G.shake -= dt * 2;

  if (c.state === 'swing') {
    c.ang = MAX_ANG * Math.sin(G.t * SWING_W * (hasBuff(st, 'speed') ? 1.35 : 1));
    c.d = ARM;
  }

  // bioluminescent surge (zone 6)
  if (st.zone === 6) {
    if (!G.surge.active && G.t > G.surge.nextAt) {
      G.surge.active = true;
      floatText(G.W / 2, G.H * 0.3, S_surge(), '#6ee7ff');
      SFX.fanfare();
      setTimeout(() => { G.surge.active = false; G.surge.nextAt = G.t + 52; }, 8000);
    }
  }

  // rush golden squid
  if (st.zone >= 1 && !G.squid) {
    G.squidTimer -= dt;
    if (G.squidTimer <= 0) {
      G.squid = { x: -.1, ym: 25 + rand(0, 30), sp: rand(120, 180), ph: 0 };
      G.squidTimer = rand(50, 100);
      floatText(G.W / 2, G.H * 0.25, S_rush(), '#ffd257');
      SFX.pop();
    }
  }
  if (G.squid) {
    G.squid.x += G.squid.sp * dt / G.W;
    if (G.squid.x > 1.15) G.squid = null;
  }

  // drop / haul
  const dropSpd = (100 + 40 * st.zone) * mods.dropSpeed * mods.speedBuff * PPM;
  const haulSpd = (120 + 50 * st.zone) * mods.haulSpeed * mods.speedBuff * PPM;
  if (c.state === 'drop') {
    c.d += dropSpd * dt;
    const tip = clawTip();
    const maxD = ZONES[st.zone].depth[1] * PPM;
    const cap = 1 + mods.extraGrab;
    for (const e of G.ents) {
      if (e.dead) continue;
      const ex = e.x * G.W, ey = e.ym * PPM;
      const hit = Math.abs(ey - tip.y) < 40 && Math.abs(ex - tip.x) < 36 * mods.grabRadius;
      if (!hit) continue;
      if (e.mine) {
        e.dead = true; c.hold = []; c.state = 'haul'; G.shake = 1;
        spawnP(tip.x, tip.y, 'spark', '#ff8844', 22);
        SFX.bad();
        floatText(G.W / 2, G.H * 0.45, S_mine(), '#ff6b6b');
        break;
      }
      e.dead = true; c.hold.push(e);
      spawnP(tip.x, tip.y, 'spark', '#ffffff', 6);
      SFX.grab();
      if (c.hold.length >= cap) { c.state = 'haul'; break; }
    }
    if (c.state === 'drop' && tip.y >= maxD) c.state = 'haul';
    // swung off-screen (shallow angle, missed everything) — reel back immediately
    if (c.state === 'drop' && (tip.x < 14 || tip.x > G.W - 14)) c.state = 'haul';
  } else if (c.state === 'haul') {
    c.d -= haulSpd * dt;
    if (c.d <= ARM) { c.d = ARM; sellHold(); c.state = 'swing'; }
  }

  // entity drift
  for (const e of G.ents) {
    if (e.mine) { e.ph += dt; continue; }
    e.x += e.dir * e.sp * dt / G.W;
    if (e.x < .04) { e.x = .04; e.dir = 1; }
    if (e.x > .96) { e.x = .96; e.dir = -1; }
    e.ph += dt * (2 + e.sp / 30);
  }
  const held = new Set(c.hold);
  G.ents = G.ents.filter(e => held.has(e) || (!e.dead && e.ym * PPM > G.camY - 600 && e.ym * PPM < G.camY + G.H + 900));
  if (G.ents.length > 120) G.ents.splice(0, G.ents.length - 120);

  // spawn around camera
  ensureBands(Math.max(5, (G.camY - 200) / PPM), (G.camY + G.H + 400) / PPM);

  // camera follow (idle rest shows the sky)
  const tip = clawTip();
  const camT = Math.max(-G.H * 0.16, tip.y - G.H * 0.42);
  G.camY += (camT - G.camY) * Math.min(1, dt * 4);

  // drone idle income
  if (mods.droneRate > 0) {
    G.droneAcc += dt * (mods.droneRate / 60) * 0.5;
    if (G.droneAcc >= 1) {
      const n = Math.floor(G.droneAcc); G.droneAcc -= n; G.droneVis += n;
      const inc = avgZoneValue(st.zone) * mods.valueMult * n;
      addCoins(inc);
      bus.emit('catch', n);
      if (G.droneVis % 3 === 1) floatText(G.W * .5 + 100, 60, `+${fmt(inc)}`, '#9cc8e6');
    }
  }

  // hud fast
  hudAcc++;
  if (hudAcc % 10 === 0) {
    const el = document.getElementById('hud-coins');
    if (el) el.textContent = fmt(st.coins);
    const g = document.getElementById('hud-gems');
    if (g) g.textContent = Math.floor(st.gems).toString();
    const d = document.getElementById('hud-depth');
    if (d) d.textContent = Math.floor(Math.max(0, tip.y) / PPM) + 'm';
  }
}

// ---------- selling ----------
function sellHold() {
  const st = getState(), mods = getMods(st), c = G.claw;
  if (!c.hold.length) return;
  let total = 0, anyGolden = false;
  for (const e of c.hold) {
    const def = e.def;
    let v = def.v;
    if (e.golden) { v *= 10; anyGolden = true; }
    if (e.echo) v *= 3;
    if (def.zone === 5) v *= 3;
    if (G.surge.active) v *= 2;
    if (Math.random() < mods.x2Proc) v *= 2;
    v *= mods.valueMult;
    total += v;
    const isNew = !st.book[def.id];
    st.book[def.id] = (st.book[def.id] || 0) + 1;
    if (isNew) {
      floatText(G.W / 2, G.H * 0.3, S_new(), '#5ee08a');
      SFX.fanfare(); SDK.happytime();
      bus.emit('newspecies', def);
    }
    if (e.golden) { st.stats.golden++; bus.emit('golden', 1); }
    if (def.zone === st.zone) bus.emit('deep', 1);
    bus.emit('catch', 1);
    bus.emit('catchOne', { defId: def.id, golden: !!e.golden });
  }
  addCoins(total);
  st.lifetime.catches += c.hold.length;
  const { bx } = craneAnchor();
  spawnP(bx, 8 - G.camY, 'splash', '#cfeeff', 14);
  floatText(bx + 60, 60, `+${fmt(total)}`, anyGolden ? '#ffd257' : '#ffffff');
  SFX.coin(c.hold.length); if (anyGolden) SFX.golden();
  c.hold = [];
}

// ---------- offline ----------
export function calcOffline() {
  const st = getState(), mods = getMods(st);
  const away = (now() - (st.lastSeen || now())) / 1000;
  if (away < 90 || mods.droneRate <= 0) return null;
  const capS = mods.offlineCapH * 3600;
  const eff = Math.min(away, capS);
  const coins = Math.floor(mods.droneRate * (eff / 60) * avgZoneValue(st.zone) * mods.valueMult);
  if (coins <= 0) return null;
  return { coins, away: Math.floor(away), capped: away > capS };
}

// ---------- timed gem chest ----------
export function chestArmed() { const st = getState(); if (!st.chest.nextAt) st.chest.nextAt = now() + 8 * 60e3; }
export function chestDue() { const st = getState(); return st.chest.nextAt > 0 && now() >= st.chest.nextAt; }
export function chestOpened() { const st = getState(); st.chest.nextAt = now() + 8 * 60e3; }

// estimated income/min — used for wheel & task reward scaling
export function incomePerMin() {
  const st = getState(), mods = getMods(st);
  return Math.max(avgZoneValue(st.zone) * mods.valueMult * 3, mods.droneRate * avgZoneValue(st.zone) * mods.valueMult);
}
