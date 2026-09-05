// core.js — utils / i18n / save / audio
export const $ = s => document.querySelector(s);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rand = (a, b) => a + Math.random() * (b - a);
export const irand = (a, b) => Math.floor(rand(a, b + 1));
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const now = () => Date.now();
export const todayKey = () => new Date().toISOString().slice(0, 10);

const SUFFIX = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af'];
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '-' + fmt(-n);
  if (n < 1000) return n < 10 && n % 1 !== 0 ? n.toFixed(1) : String(Math.floor(n));
  let i = 0;
  while (n >= 1000 && i < SUFFIX.length - 1) { n /= 1000; i++; }
  return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + SUFFIX[i];
}
export function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}
export function fmtDur(ms) { return fmtTime(ms / 1000); }

// ---------------- i18n ----------------
const STR = {
  en: {
    gameName: 'DEEP SALVAGE INC.', tapToDrop: 'Tap / Click to drop the claw!',
    sellFish: 'Nice catch! Coins earned — spend them on upgrades',
    goDeeper: 'Depth unlocked! New creatures below…', up: 'UPGRADES', book: 'COLLECTION',
    shop: 'SHOP', jobs: 'JOBS', core: 'CORE', settings: 'SETTINGS', sound: 'Sound', music: 'Music',
    language: 'Language', resetSave: 'Reset save', resetConfirm: 'Reset ALL progress?',
    yes: 'Yes', no: 'No', close: 'Close',
    offlineTitle: 'Welcome back, Captain!', offlineEarned: 'Your drone salvaged while away',
    x2Button: 'WATCH AD · DOUBLE', collect: 'Collect', buffTitle: '2× Income Active',
    wheel: 'Lucky Wheel', spin: 'SPIN', freeSpins: 'Free spins', watchMore: 'AD · +2 spins',
    jackpot: 'JACKPOT!', gacha: 'Mystery Eggs', open1: 'Open Egg · 20', open10: 'Open 10 · 180',
    freeGems: 'Free Gems', adGems: 'AD · +15', skins: 'Claw Skins', equipped: 'Equipped',
    equip: 'Equip', owned: 'Owned', locked: '???', signin: 'Daily Sign-in', makeup: 'AD · Make up',
    day: 'Day', claim: 'Claim', tasks: 'Salvage Jobs', taskGo: 'Go', taskClaim: 'Claim',
    prestige: 'DIVE NEW OCEAN', cores: 'Depth Cores', coreEffect: 'Each core: +8% coin value (permanent)',
    prestigeWarn: 'Reach the Hadal Zone (zone 5) to dive', prestigeConfirm: 'Dive a new ocean? Coins & upgrades reset. You keep cores, collection, gems & skins.',
    lab: 'Evolution Lab', labNeed: 'Unlocks after 2 dives',
    zoneUnlocked: 'New depth reached!', contract: 'SALVAGE CONTRACT', contractGo: 'START',
    contractFail: 'Contract failed!', contractDone: 'Contract complete!', reward: 'Reward',
    maxed: 'MAX', buy: 'Buy', need: 'Need', moreAt: 'More tech at', newSpecies: 'NEW SPECIES',
    research: 'Research', researching: 'Researching', finishNow: 'AD · FINISH NOW',
    chest: 'Salvage Chest', openChest: 'AD · OPEN', chestEmpty: 'Next chest soon…',
    alreadyToday: 'Come back tomorrow!', golden: 'GOLDEN', caught: 'Caught', notCaught: 'Not caught',
    bookBonus: 'Collection bonus', zoneBonus: 'Zone completion', value: 'Value', depth: 'Depth',
    zone: 'Zone', addCoins: '+Coins', addGems: '+Gems', buff: '2× Coins', eggTicket: 'Free Egg',
    done: 'Done!', save: 'Save', pull: 'pulls', pityNote: 'Every 10 eggs: guaranteed Epic+',
    dupConv: 'Duplicate skin → 40 Gems', skinBonus: 'Value bonus', tutorial: 'Tutorial',
    missing: 'Missing', setBonus: 'set bonus', catchN: 'Catch {0} creatures', goldenN: 'Catch {0} golden targets',
    earnN: 'Earn {0} coins', spin1: 'Spin the wheel once', research1: 'Complete 1 research',
    buffUse: 'Use the 2× buff', egg1: 'Open 1 mystery egg', deepN: 'Salvage in zone {0}+ ×{1}',
    bonus: 'Bonus', rushHint: 'A Golden Squid! Tap it!', mine: 'A mine! Avoid grabbing it',
    surge: 'BIOLUMINESCENT SURGE — 2× value!', echo: 'Time Echo ×3!',
    contractDesc: 'Catch in time!', scanned: 'Research complete!',
  },
  zh: {
    gameName: '深海捞捞', tapToDrop: '点击屏幕，放下机械爪！', sellFish: '赚到了！快用金币升级设备',
    goDeeper: '解锁新深度！下面有新生物…', up: '装备升级', book: '图鉴收集',
    shop: '商店', jobs: '悬赏任务', core: '深海核心', settings: '设置', sound: '音效', music: '音乐',
    language: '语言', resetSave: '重置存档', resetConfirm: '确定要清空全部进度吗？',
    yes: '确定', no: '取消', close: '关闭',
    offlineTitle: '欢迎回来，船长！', offlineEarned: '打捞无人机在你离开时工作赚了',
    x2Button: '看广告 · 双倍领取', collect: '领取', buffTitle: '双倍收益进行中',
    wheel: '幸运转盘', spin: '转！', freeSpins: '免费次数', watchMore: '广告 · +2次',
    jackpot: '头奖！', gacha: '神秘打捞蛋', open1: '开蛋 · 20', open10: '十连 · 180',
    freeGems: '免费宝石', adGems: '广告 · +15', skins: '机械爪皮肤', equipped: '已装备',
    equip: '装备', owned: '已拥有', locked: '???', signin: '每日签到', makeup: '广告 · 补签',
    day: '第', claim: '领取', tasks: '悬赏任务', taskGo: '前往', taskClaim: '领取',
    prestige: '跃迁新大洋', cores: '深渊核心', coreEffect: '每个核心：金币价值 +8%（永久）',
    prestigeWarn: '抵达第5区（超深渊带）后可跃迁', prestigeConfirm: '跃迁新大洋？金币与装备重置。保留核心、图鉴、宝石与皮肤。',
    lab: '进化实验室', labNeed: '跃迁 2 次后解锁',
    zoneUnlocked: '抵达新深度！', contract: '打捞合同', contractGo: '开始',
    contractFail: '合同失败！', contractDone: '合同完成！', reward: '奖励',
    maxed: '满级', buy: '购买', need: '需要', moreAt: '更多科技解锁于', newSpecies: '新物种',
    research: '研究', researching: '研究中', finishNow: '广告 · 立即完成',
    chest: '打捞宝箱', openChest: '广告 · 打开', chestEmpty: '下个宝箱很快出现…',
    alreadyToday: '明天再来吧！', golden: '黄金', caught: '已捕获', notCaught: '未捕获',
    bookBonus: '图鉴加成', zoneBonus: '区域集齐', value: '价值', depth: '深度',
    zone: '区域', addCoins: '+金币', addGems: '+宝石', buff: '双倍金币', eggTicket: '免费蛋',
    done: '已完成！', save: '存档', pull: '抽', pityNote: '每 10 抽必得史诗以上',
    dupConv: '重复皮肤 → 40 宝石', skinBonus: '价值加成', tutorial: '教程',
    missing: '未捕获', setBonus: '集齐加成', catchN: '打捞 {0} 只生物', goldenN: '捕获 {0} 个黄金目标',
    earnN: '赚取 {0} 金币', spin1: '转动一次幸运转盘', research1: '完成 1 次研究',
    buffUse: '使用一次双倍 Buff', egg1: '开启 1 个神秘蛋', deepN: '在 {0} 区及以下打捞 ×{1}',
    bonus: '加成', rushHint: '黄金鱿鱼！快点它！', mine: '是水雷！小心别抓',
    surge: '荧光潮汐 —— 价值 ×2！', echo: '时空回响 ×3！',
    contractDesc: '限时捕获！', scanned: '研究完成！',
  }
};
let LANG = null;
export function initLang(saved) {
  LANG = saved || (navigator.language && navigator.language.startsWith('zh') ? 'zh' : 'en');
  return LANG;
}
export function getLang() { return LANG; }
export function setLang(l) { LANG = l; }
export function L(key, ...args) {
  let s = (STR[LANG] && STR[LANG][key]) || STR.en[key] || key;
  args.forEach((a, i) => { s = s.replace(`{${i}}`, a); });
  return s;
}

// ---------------- save ----------------
const SAVE_KEY = 'deepsalvage_v1';
export function defaultState() {
  return {
    v: 1, coins: 0, gems: 0,
    lifetime: { earned: 0, runEarned: 0, catches: 0 },
    zone: 0, upgrades: {}, cores: 0, prestiges: 0, lab: {},
    book: {}, skins: ['default'], skin: 'default',
    buffs: [],               // [{id, until}]
    wheel: { day: '', free: 1, adUsed: 0 },
    signin: { day: 0, last: '' },
    tasks: { day: '', list: [] },
    scanner: { id: null, endsAt: 0 },
    chest: { nextAt: 0 },
    adCaps: {},
    settings: { sfx: true, music: true, lang: null },
    stats: { golden: 0, contracts: 0, eggs: 0 },
    tutorial: 0, lastSeen: 0, created: now(),
  };
}
let state = defaultState();
export function getState() { return state; }
export function setState(s) { state = s; }

export function loadSave() {
  try {
    let raw = localStorage.getItem(SAVE_KEY);
    // cloud override when available; SDK.data throws outside the CrazyGames host — never let it wipe local progress
    try {
      const cloud = window.CrazyGames?.SDK?.data?.getItem?.(SAVE_KEY);
      if (typeof cloud === 'string' && cloud.length > 2) raw = cloud;
    } catch (e) { /* cloud unavailable */ }
    if (raw) {
      const s = JSON.parse(raw);
      state = Object.assign(defaultState(), s);
      // nested merges for forward compat
      const d = defaultState();
      for (const k of Object.keys(d)) if (typeof d[k] === 'object' && d[k] !== null && !Array.isArray(d[k]) && typeof state[k] === 'object' && state[k] !== null) state[k] = Object.assign({}, d[k], state[k]);
    }
  } catch (e) { console.warn('load fail', e); }
  return state;
}
export function writeSave() {
  if (state.__freezeLastSeen) delete state.__freezeLastSeen; // QA: keep a crafted lastSeen
  else state.lastSeen = now();
  try {
    const raw = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, raw);
    window.CrazyGames?.SDK?.data?.setItem?.(SAVE_KEY, raw);
  } catch (e) { /* private mode */ }
}

// ---------------- audio (WebAudio synth, zero assets) ----------------
let AC = null, musicNodes = null;
function ac() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; }
export const SFX = {
  enabled: true, music: true,
  tone(freq, dur = .12, type = 'sine', vol = .22, slide = 0, delay = 0) {
    if (!this.enabled) return;
    try {
      const a = ac(), t = a.currentTime + delay;
      const o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .02);
    } catch (e) { }
  },
  noise(dur = .3, vol = .25, freq = 800, delay = 0) {
    if (!this.enabled) return;
    try {
      const a = ac(), t = a.currentTime + delay;
      const len = a.sampleRate * dur, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = a.createBufferSource(); src.buffer = buf;
      const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
      const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      src.connect(f).connect(g).connect(a.destination); src.start(t);
    } catch (e) { }
  },
  click() { this.tone(700, .05, 'square', .1); },
  splash() { this.noise(.35, .3, 900); this.tone(300, .15, 'sine', .1, -150); },
  grab() { this.tone(500, .08, 'square', .15); this.tone(760, .1, 'square', .12, 0, .06); },
  coin(n = 1) { for (let i = 0; i < Math.min(n, 4); i++) this.tone(880 + i * 220, .09, 'triangle', .14, 120, i * .07); },
  upgrade() { this.tone(440, .1, 'triangle', .18); this.tone(660, .12, 'triangle', .18, 0, .09); this.tone(880, .16, 'triangle', .18, 0, .18); },
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .22, 'triangle', .2, 0, i * .13)); },
  bad() { this.tone(180, .3, 'sawtooth', .18, -80); },
  golden() { [1200, 1600, 2000].forEach((f, i) => this.tone(f, .12, 'sine', .14, 200, i * .06)); },
  tick() { this.tone(900, .03, 'square', .07); },
  pop() { this.tone(980, .07, 'sine', .16, 260); },
  gem() { this.tone(1400, .1, 'sine', .15, 300); this.tone(1800, .12, 'sine', .12, 200, .08); },
  startMusic() {
    if (!this.music || musicNodes) return;
    try {
      const a = ac();
      const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
      o.type = 'sine'; o.frequency.value = 55;
      f.type = 'lowpass'; f.frequency.value = 220;
      g.gain.value = .05;
      o.connect(f).connect(g).connect(a.destination); o.start();
      musicNodes = { o, g };
    } catch (e) { }
  },
  stopMusic() { if (musicNodes) { try { musicNodes.o.stop(); } catch (e) { } musicNodes = null; } },
};
