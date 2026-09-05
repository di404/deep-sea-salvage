// balance.mjs — headless pacing simulation (node tools/balance.mjs)
// Simulates a casual player: ~25 active catches/min early, buys best affordable upgrade greedily.
import { UPGRADES, costOf, ZONES, CREATURES, avgZoneValue, getMods, PRESTIGE_REQ_EARN } from '../js/data.js';

const st = {
  coins: 0, gems: 0, zone: 0, upgrades: {}, cores: 0, prestiges: 0, lab: {},
  book: {}, skins: ['default'], skin: 'default', buffs: [],
  lifetime: { earned: 0, runEarned: 0, catches: 0 },
};
globalThis.window = globalThis; // getMods reads no window; safety

// player model: 20 catches/min (12s per haul round-trip, ~1.7 grabs each)
const CATCHES_PER_MIN = 20;
const SIM_MINUTES = 240; // 4 hours
const dtMin = 0.25; // 15s steps

let milestones = [];
let lastBuyMin = 0, maxGap = 0;

for (let t = 0; t < SIM_MINUTES; t += dtMin) {
  const mods = getMods(st);
  const catches = CATCHES_PER_MIN * dtMin;
  let income = 0;
  for (let i = 0; i < catches; i++) {
    const pool = CREATURES.filter(c => c.zone === st.zone);
    const c = pool[Math.floor(Math.random() * pool.length)];
    let v = c.v * mods.valueMult;
    if (Math.random() < mods.goldenChance) v *= 10;
    income += v;
  }
  st.coins += income;
  st.lifetime.earned += income;
  st.lifetime.runEarned += income;
  st.lifetime.catches += catches;

  // greedy buy: cheapest affordable upgrade (players buy something every few minutes)
  const avail = UPGRADES.filter(u => st.zone >= u.zone && (st.upgrades[u.id] || 0) < u.max);
  const afford = avail.map(u => ({ u, c: costOf(u, st.upgrades[u.id] || 0) })).sort((a, b) => a.c - b.c);
  const target = afford.find(x => st.coins >= x.c);
  if (target) {
    st.coins -= target.c;
    st.upgrades[target.u.id] = (st.upgrades[target.u.id] || 0) + 1;
    maxGap = Math.max(maxGap, t - lastBuyMin);
    lastBuyMin = t;
  } else {
    // zone unlock if affordable and nothing to buy
    const nz = ZONES[st.zone + 1];
    if (nz && st.coins >= nz.cost) { st.coins -= nz.cost; st.zone++; milestones.push(`min ${t.toFixed(0)}: → zone ${st.zone + 1} (${st.zone >= 4 ? 'prestige OK' : ''})`); }
  }
  const nz2 = ZONES[st.zone + 1];
  if (nz2 && st.coins >= nz2.cost && !afford.some(x => x.c < nz2.cost)) { st.coins -= nz2.cost; st.zone++; milestones.push(`min ${t.toFixed(0)}: → zone ${st.zone + 1}`); }
}

const finalMods = getMods(st);
console.log('=== Deep Salvage Inc. pacing sim (casual 20 catches/min, greedy buys) ===');
console.log(milestones.join('\n'));
console.log(`after ${SIM_MINUTES}min: zone ${st.zone + 1}/8, coins ${Math.round(st.coins)}, lifetime ${Math.round(st.lifetime.earned)}`);
console.log(`upgrade gap max: ${maxGap.toFixed(1)} min (goal: < 10 min)`);
console.log(`valueMult: ${finalMods.valueMult.toFixed(2)}x`);
console.log(`prestige eligible: runEarned ${st.lifetime.runEarned >= PRESTIGE_REQ_EARN} (cores would be ${Math.floor((st.lifetime.runEarned / 4e5) ** 0.6)})`);
const z3Time = milestones.find(m => m.includes('zone 4'));
console.log(`zone 4 (3h wall check): ${z3Time || 'NOT reached in 4h — TOO SLOW'}`);
