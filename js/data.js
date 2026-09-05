// data.js — ALL content is table-driven here. New content = new rows, zero code.
import { getState } from './core.js';

// ---------------- ZONES (8) ----------------
export const ZONES = [
  { id: 0, nE: 'Sunlight Zone', nZ: '阳光带', depth: [0, 200], cost: 0, top: '#8ed8f8', bot: '#2a86c9', mech: null, mechE: 'Aim & drop' },
  { id: 1, nE: 'Twilight Zone', nZ: '暮光带', depth: [200, 1000], cost: 1500, top: '#1d6fa8', bot: '#0d4468', mech: 'golden', mechE: 'Golden targets ×10' },
  { id: 2, nE: 'Midnight Zone', nZ: '午夜带', depth: [1000, 4000], cost: 25000, top: '#123a63', bot: '#081f3a', mech: 'mines', mechE: 'Mines — don\'t grab!' },
  { id: 3, nE: 'Abyssal Zone', nZ: '深渊带', depth: [4000, 6000], cost: 450000, top: '#0a2440', bot: '#050f1f', mech: 'contracts', mechE: 'Salvage Contracts' },
  { id: 4, nE: 'Hadal Zone', nZ: '超深渊带', depth: [6000, 11000], cost: 7500000, top: '#081a30', bot: '#03080f', mech: 'currents', mechE: 'Swift currents' },
  { id: 5, nE: 'Trench of Echoes', nZ: '回声海沟', depth: [11000, 16000], cost: 100000000, top: '#0a1430', bot: '#04061a', mech: 'ghosts', mechE: 'Ghost creatures ×3' },
  { id: 6, nE: 'Bioluminescent Abyss', nZ: '荧光深渊', depth: [16000, 22000], cost: 1500000000, top: '#0b2038', bot: '#051021', mech: 'surge', mechE: 'Glow surges ×2' },
  { id: 7, nE: 'The Ancient Sea', nZ: '古海', depth: [22000, 30000], cost: 20000000000, top: '#14203a', bot: '#070a18', mech: 'echo', mechE: 'Time Echoes ×3' },
];
export const PRESTIGE_ZONE = 4; // zone index required to prestige (5th zone)

// ---------------- CREATURES (48) ----------------
// shape templates drawn procedurally in scene.js
// r: 0 common 1 uncommon 2 rare 3 legendary ; spawn weight by rarity: [60,25,12,3]
export const CREATURES = [
  // z0 sunlight
  { id: 'sardine', nE: 'Sardine', nZ: '沙丁鱼', zone: 0, shape: 'fish', hue: 205, sz: 34, v: 3, r: 0 },
  { id: 'clownfish', nE: 'Clownfish', nZ: '小丑鱼', zone: 0, shape: 'fish', hue: 20, sz: 38, v: 4, r: 0 },
  { id: 'puffer', nE: 'Pufferfish', nZ: '河豚', zone: 0, shape: 'puff', hue: 50, sz: 44, v: 7, r: 0 },
  { id: 'moonjelly', nE: 'Moon Jelly', nZ: '海月水母', zone: 0, shape: 'jelly', hue: 195, sz: 46, v: 9, r: 1 },
  { id: 'turtle', nE: 'Sea Turtle', nZ: '海龟', zone: 0, shape: 'turtle', hue: 115, sz: 60, v: 14, r: 1 },
  { id: 'boot', nE: 'Old Boot', nZ: '旧靴子', zone: 0, shape: 'junk', hue: 25, sz: 40, v: 2, r: 0 },
  { id: 'bottle', nE: 'Drift Bottle', nZ: '漂流瓶', zone: 0, shape: 'junk2', hue: 160, sz: 38, v: 5, r: 0 },
  // z1 twilight
  { id: 'tuna', nE: 'Tuna', nZ: '金枪鱼', zone: 1, shape: 'fish', hue: 200, sz: 52, v: 30, r: 0 },
  { id: 'squid_s', nE: 'Reef Squid', nZ: '礁乌贼', zone: 1, shape: 'squid', hue: 285, sz: 46, v: 36, r: 0 },
  { id: 'crab', nE: 'Rock Crab', nZ: '岩蟹', zone: 1, shape: 'crab', hue: 12, sz: 44, v: 42, r: 0 },
  { id: 'eel_g', nE: 'Moray Eel', nZ: '海鳗', zone: 1, shape: 'eel', hue: 95, sz: 66, v: 55, r: 1 },
  { id: 'immortal', nE: 'Immortal Jelly', nZ: '灯塔水母', zone: 1, shape: 'jelly', hue: 340, sz: 42, v: 75, r: 1 },
  { id: 'angler', nE: 'Anglerfish', nZ: '灯笼鱼', zone: 1, shape: 'angler', hue: 35, sz: 52, v: 110, glow: 1, r: 2 },
  { id: 'chest_s', nE: 'Small Chest', nZ: '小宝箱', zone: 1, shape: 'chest', hue: 28, sz: 46, v: 140, r: 2 },
  // z2 midnight
  { id: 'hatchet', nE: 'Hatchetfish', nZ: '星光鱼', zone: 2, shape: 'fish', hue: 220, sz: 36, v: 280, glow: 1, r: 0 },
  { id: 'vampire', nE: 'Vampire Squid', nZ: '吸血鬼乌贼', zone: 2, shape: 'squid', hue: 355, sz: 50, v: 340, r: 1 },
  { id: 'gulper', nE: 'Gulper Eel', nZ: '囊咽鱼', zone: 2, shape: 'eel', hue: 320, sz: 80, v: 390, r: 1 },
  { id: 'dumbo', nE: 'Dumbo Octopus', nZ: '小飞象章鱼', zone: 2, shape: 'octo', hue: 305, sz: 50, v: 480, r: 1 },
  { id: 'giant_squid', nE: 'Giant Squid', nZ: '大王乌贼', zone: 2, shape: 'squid', hue: 265, sz: 90, v: 650, r: 2 },
  { id: 'clam', nE: 'Pearl Oyster', nZ: '珍珠贝', zone: 2, shape: 'clam', hue: 230, sz: 50, v: 800, r: 2 },
  { id: 'amphora', nE: 'Ancient Amphora', nZ: '古希腊陶罐', zone: 2, shape: 'amphora', hue: 30, sz: 52, v: 950, r: 2 },
  // z3 abyssal
  { id: 'tripod', nE: 'Tripodfish', nZ: '三脚架鱼', zone: 3, shape: 'fish', hue: 195, sz: 44, v: 2600, r: 0 },
  { id: 'glass_squid', nE: 'Glass Squid', nZ: '玻璃乌贼', zone: 3, shape: 'squid', hue: 180, sz: 46, v: 3000, r: 0 },
  { id: 'blobfish', nE: 'Blobfish', nZ: '水滴鱼', zone: 3, shape: 'blob', hue: 28, sz: 46, v: 3600, r: 1 },
  { id: 'isopod', nE: 'Giant Isopod', nZ: '大王具足虫', zone: 3, shape: 'isopod', hue: 150, sz: 52, v: 4200, r: 1 },
  { id: 'snailfish', nE: 'Snailfish', nZ: '狮子鱼', zone: 3, shape: 'fish', hue: 285, sz: 44, v: 5000, r: 1 },
  { id: 'coral_g', nE: 'Glow Coral', nZ: '荧光珊瑚', zone: 3, shape: 'coral', hue: 320, sz: 54, v: 6500, glow: 1, r: 2 },
  { id: 'coin_hoard', nE: 'Coin Hoard', nZ: '沉船金币', zone: 3, shape: 'coins', hue: 45, sz: 50, v: 9000, r: 2 },
  // z4 hadal
  { id: 'hadal_snail', nE: 'Hadal Snailfish', nZ: '超深渊狮子鱼', zone: 4, shape: 'fish', hue: 270, sz: 46, v: 26000, r: 0 },
  { id: 'seapig', nE: 'Sea Pig', nZ: '海猪', zone: 4, shape: 'seapig', hue: 335, sz: 46, v: 32000, r: 0 },
  { id: 'barreleye', nE: 'Barreleye', nZ: '管眼鱼', zone: 4, shape: 'barrel', hue: 205, sz: 48, v: 38000, r: 1 },
  { id: 'lava_crab', nE: 'Lava Crab', nZ: '熔岩蟹', zone: 4, shape: 'crab', hue: 8, sz: 50, v: 46000, glow: 1, r: 1 },
  { id: 'megamouth', nE: 'Megamouth Shark', nZ: '巨口鲨', zone: 4, shape: 'shark', hue: 210, sz: 95, v: 70000, r: 2 },
  { id: 'whalefall', nE: 'Whale Fall', nZ: '鲸落', zone: 4, shape: 'whale', hue: 85, sz: 130, v: 120000, r: 3 },
  // z5 trench of echoes
  { id: 'echo_ray', nE: 'Echo Ray', nZ: '回声鳐', zone: 5, shape: 'ray', hue: 260, sz: 80, v: 280000, r: 0 },
  { id: 'sonar_eel', nE: 'Sonar Eel', nZ: '声呐鳗', zone: 5, shape: 'eel', hue: 180, sz: 76, v: 340000, glow: 1, r: 0 },
  { id: 'abyss_hunter', nE: 'Abyss Hunter', nZ: '深渊猎手', zone: 5, shape: 'fish', hue: 0, sz: 60, v: 420000, r: 1 },
  { id: 'black_pearl', nE: 'Black Pearl', nZ: '黑珍珠', zone: 5, shape: 'gem', hue: 275, sz: 44, v: 650000, r: 2 },
  { id: 'ghost_ship', nE: 'Ghost Ship Wreck', nZ: '幽灵船残骸', zone: 5, shape: 'ship', hue: 30, sz: 120, v: 1500000, r: 3 },
  // z6 bioluminescent
  { id: 'bio_jelly', nE: 'Bio Jelly', nZ: '荧光水母', zone: 6, shape: 'jelly', hue: 160, sz: 50, v: 2800000, glow: 1, r: 0 },
  { id: 'tube_worm', nE: 'Giant Tube Worm', nZ: '巨型管虫', zone: 6, shape: 'tube', hue: 300, sz: 60, v: 3400000, r: 0 },
  { id: 'prism_fish', nE: 'Prism Fish', nZ: '棱镜鱼', zone: 6, shape: 'fish', hue: 200, sz: 50, v: 4200000, r: 1, prism: 1 },
  { id: 'crown', nE: 'Sunken Crown', nZ: '沉没王冠', zone: 6, shape: 'crown', hue: 48, sz: 48, v: 7000000, r: 2 },
  { id: 'crystal_lev', nE: 'Crystal Leviathan', nZ: '水晶利维坦', zone: 6, shape: 'leviathan', hue: 190, sz: 140, v: 16000000, glow: 1, r: 3 },
  // z7 ancient sea
  { id: 'trilobite', nE: 'Trilobite', nZ: '三叶虫', zone: 7, shape: 'trilobite', hue: 115, sz: 48, v: 28000000, r: 0 },
  { id: 'chrono', nE: 'Chrono Fish', nZ: '时之鱼', zone: 7, shape: 'fish', hue: 45, sz: 52, v: 38000000, r: 1 },
  { id: 'kraken', nE: 'The Kraken', nZ: '北海巨妖', zone: 7, shape: 'octo', hue: 250, sz: 110, v: 90000000, r: 2 },
  { id: 'heart_ocean', nE: 'Heart of the Ocean', nZ: '海洋之心', zone: 7, shape: 'gem', hue: 210, sz: 46, v: 300000000, r: 3 },
];
export const CMAP = Object.fromEntries(CREATURES.map(c => [c.id, c]));
export const RARITY_W = [60, 25, 12, 3];
export const RARITY_NAME = { en: ['Common', 'Uncommon', 'Rare', 'Legendary'], zh: ['普通', '罕见', '稀有', '传说'] };

// ---------------- UPGRADES (16 lines → 187 purchasable levels) ----------------
export const UPGRADES = [
  { id: 'winch', nE: 'Winch Power', nZ: '绞盘功率', dE: 'Haul speed', dZ: '收爪速度', base: 60, g: 1.9, max: 20, zone: 0, eff: l => `+${(l * 10)}%` },
  { id: 'claw_speed', nE: 'Hydraulic Claw', nZ: '液压爪', dE: 'Drop speed', dZ: '下爪速度', base: 50, g: 1.8, max: 20, zone: 0, eff: l => `+${l * 10}%` },
  { id: 'grip', nE: 'Grip Strength', nZ: '抓爪强度', dE: 'Creature value', dZ: '生物价值', base: 100, g: 2.6, max: 15, zone: 0, eff: l => `×${(1.15 ** l).toFixed(2)}` },
  { id: 'scope', nE: 'Sonar Scope', nZ: '声呐估值', dE: 'All coin value', dZ: '全部金币价值', base: 150, g: 2.3, max: 25, zone: 0, eff: l => `×${(1.12 ** l).toFixed(2)}` },
  { id: 'wide', nE: 'Wide Claw', nZ: '加宽抓斗', dE: 'Grab range', dZ: '抓取范围', base: 200, g: 2.2, max: 10, zone: 0, eff: l => `+${l * 6}%` },
  { id: 'multi', nE: 'Multi-Claw Rig', nZ: '多爪回收', dE: 'Extra grabs per haul', dZ: '每次多抓', base: 5000, g: 8, max: 3, zone: 1, eff: l => `+${l}` },
  { id: 'golden_luck', nE: 'Golden Lure', nZ: '黄金诱饵', dE: 'Golden chance', dZ: '黄金概率', base: 800, g: 3, max: 10, zone: 1, eff: l => `+${(l * 0.4).toFixed(1)}%` },
  { id: 'gem_magnet', nE: 'Gem Magnet', nZ: '宝石磁铁', dE: 'Gem find chance', dZ: '宝石概率', base: 1200, g: 2.5, max: 10, zone: 2, eff: l => `${(1.5 + l * 0.5).toFixed(1)}%` },
  { id: 'drone', nE: 'Salvage Drone', nZ: '打捞无人机', dE: 'Idle & offline rate', dZ: '挂机与离线收益', base: 500, g: 2.4, max: 10, zone: 1, eff: l => `${(l * 1.2).toFixed(1)}/min` },
  { id: 'drone_power', nE: 'Drone Overdrive', nZ: '无人机超频', dE: 'Drone rate', dZ: '无人机效率', base: 200, g: 1.7, max: 15, zone: 1, eff: l => `×${(1.2 ** l).toFixed(2)}` },
  { id: 'drum', nE: 'Cargo Drum', nZ: '离线仓储', dE: 'Offline cap +2h', dZ: '离线上限 +2小时', base: 300, g: 2, max: 10, zone: 1, eff: l => `${4 + l * 2}h` },
  { id: 'lucky_net', nE: 'Lucky Net', nZ: '幸运网', dE: 'Chance of ×2 haul', dZ: '双倍haul概率', base: 1000, g: 2.6, max: 10, zone: 2, eff: l => `${l * 2}%` },
  { id: 'gem_cut', nE: 'Gem Cutting', nZ: '精密切割', dE: 'Gem value', dZ: '宝石价值', base: 3000, g: 4, max: 5, zone: 3, eff: l => `×${(1 + l * 0.25).toFixed(2)}` },
  { id: 'sonar', nE: 'Deep Sonar', nZ: '深海声呐', dE: 'Rare species weight', dZ: '稀有物种权重', base: 2500, g: 2.4, max: 8, zone: 2, eff: l => `+${l * 15}%` },
  { id: 'contract_pack', nE: 'Contract Permit', nZ: '合同专精', dE: 'Contract rewards', dZ: '合同奖励', base: 1500, g: 3, max: 8, zone: 3, eff: l => `+${l * 15}%` },
  { id: 'scanner_lab', nE: 'Scanner Lab', nZ: '扫描实验室', dE: 'Research speed', dZ: '研究速度', base: 1200, g: 2.8, max: 8, zone: 3, eff: l => `+${l * 8}%` },
];
export const UMAP = Object.fromEntries(UPGRADES.map(u => [u.id, u]));
export const TOTAL_UPGRADE_ENTRIES = UPGRADES.reduce((a, u) => a + u.max, 0); // 187

export const costOf = (u, lv) => Math.floor(u.base * u.g ** lv);

// ---------------- SKINS (8) ----------------
export const SKINS = [
  { id: 'default', nE: 'Steel Claw', nZ: '钢爪', hue: 210, r: 0, bonus: 0, src: 'own' },
  { id: 'deep_blue', nE: 'Abyss Blue', nZ: '深渊蓝', hue: 225, r: 0, bonus: 2, src: 'gacha' },
  { id: 'lava', nE: 'Lava Claw', nZ: '熔岩爪', hue: 15, r: 1, bonus: 4, src: 'gacha' },
  { id: 'neon', nE: 'Neon Rider', nZ: '霓虹爪', hue: 160, r: 1, bonus: 5, src: 'gacha' },
  { id: 'ghost', nE: 'Ghost Shell', nZ: '幽灵壳', hue: 280, r: 2, bonus: 6, src: 'gacha' },
  { id: 'gold', nE: 'Midas Claw', nZ: '黄金爪', hue: 45, r: 2, bonus: 8, src: 'gacha' },
  { id: 'royal', nE: 'Royal Anchor', nZ: '皇家徽章', hue: 320, r: 3, bonus: 10, src: 'gacha' },
  { id: 'prism', nE: 'Prism Prime', nZ: '棱镜至尊', hue: 190, r: 3, bonus: 15, src: 'gacha' },
];
export const SKIN_BY = Object.fromEntries(SKINS.map(s => [s.id, s]));
export const GEM_PRICE = { open1: 20, open10: 180 };

// ---------------- WHEEL (8 segments, all positive) ----------------
export const WHEEL = [
  { id: 'coins_s', ic: 'coin', w: 22, kind: 'coins', min: 10 },
  { id: 'gems5', ic: 'gem', w: 16, kind: 'gems', n: 5 },
  { id: 'buff30', ic: 'bolt', w: 16, kind: 'buff', min: 30 },
  { id: 'coins_m', ic: 'coin', w: 14, kind: 'coins', min: 30 },
  { id: 'egg', ic: 'egg', w: 12, kind: 'egg' },
  { id: 'gems15', ic: 'gem', w: 10, kind: 'gems', n: 15 },
  { id: 'coins_xl', ic: 'trophy', w: 8, kind: 'coins', min: 120 },
  { id: 'jackpot', ic: 'star', w: 2, kind: 'gems', n: 100 },
];

// ---------------- GACHA POOL ----------------
export const GACHA = [
  { type: 'skin', id: 'deep_blue', w: 24 },
  { type: 'skin', id: 'lava', w: 14 },
  { type: 'skin', id: 'neon', w: 12 },
  { type: 'skin', id: 'ghost', w: 7 },
  { type: 'skin', id: 'gold', w: 5 },
  { type: 'skin', id: 'royal', w: 2.5 },
  { type: 'skin', id: 'prism', w: 1 },
  { type: 'gems', n: 30, w: 14 },
  { type: 'gems', n: 80, w: 6 },
  { type: 'buff', min: 30, w: 10 },
  { type: 'coins', min: 45, w: 4.5 },
];
export const GACHA_R = s => s.type === 'skin' ? (SKIN_BY[s.id]?.r ?? 0) : s.type === 'gems' ? (s.n >= 80 ? 2 : 1) : 1;

// ---------------- SIGN-IN (7-day loop) ----------------
export const SIGNIN = [
  { ic: 'gem', kind: 'gems', n: 10 },
  { ic: 'coin', kind: 'coins', min: 15 },
  { ic: 'bolt', kind: 'buff', min: 60 },
  { ic: 'gem', kind: 'gems', n: 25 },
  { ic: 'egg', kind: 'egg', n: 1 },
  { ic: 'gem', kind: 'gems', n: 50 },
  { ic: 'gift', kind: 'jackpot7' },
];

// ---------------- DAILY TASKS ----------------
export const TASK_POOL = [
  { id: 'catch', nE: 'Catch {0} creatures', nZ: '打捞 {0} 只生物', goal: 20, ev: 'catch', gem: 8 },
  { id: 'golden', nE: 'Catch {0} golden targets', nZ: '捕获 {0} 个黄金目标', goal: 2, ev: 'golden', gem: 12 },
  { id: 'earn', nE: 'Earn {0} coins', nZ: '赚取 {0} 金币', goal: 0, ev: 'earn', gem: 8 }, // goal scaled at gen
  { id: 'spin', nE: 'Spin the wheel once', nZ: '转动一次幸运转盘', goal: 1, ev: 'spin', gem: 8 },
  { id: 'research', nE: 'Complete 1 research', nZ: '完成 1 次研究', goal: 1, ev: 'research', gem: 10 },
  { id: 'buff', nE: 'Use the 2× buff', nZ: '使用一次双倍 Buff', goal: 1, ev: 'buff', gem: 8 },
  { id: 'egg', nE: 'Open 1 mystery egg', nZ: '开启 1 个神秘蛋', goal: 1, ev: 'egg', gem: 10 },
  { id: 'deep', nE: 'Salvage in your deepest zone ×{0}', nZ: '在最深区域打捞 {0} 次', goal: 8, ev: 'deep', gem: 10 },
];

// ---------------- RESEARCH (scanner, timed → speed-up ad hook) ----------------
export const RESEARCH = [
  { id: 'r_x2', nE: 'Coin Amplifier', nZ: '金币放大器', buff: 'x2', min: 10, time: 240 },
  { id: 'r_gem', nE: 'Gem Refinery', nZ: '宝石精炼', buff: 'x3gem', min: 10, time: 360 },
  { id: 'r_gold', nE: 'Gold Radar', nZ: '黄金雷达', buff: 'golden', min: 15, time: 300 },
  { id: 'r_speed', nE: 'Overclock Rig', nZ: '超频吊臂', buff: 'speed', min: 12, time: 300 },
];
export const BUFFS = {
  x2: { ic: 'bolt', mult: 2, coins: true },
  x3gem: { ic: 'gem', gems: 3 },
  golden: { ic: 'star', goldenAdd: 0.05 },
  speed: { ic: 'clock', speed: 1.5 },
};

// ---------------- LAB (prestige layer 2) ----------------
export const LAB = [
  { id: 'start_zone', nE: 'Head Start', nZ: '先发优势', dE: 'Start with zone {0} unlocked', dZ: '开局解锁 {0} 区', max: 4, cost: l => [4, 12, 40, 120][l] },
  { id: 'core_power', nE: 'Core Resonance', nZ: '核心共鸣', dE: 'Core bonus +4%/lv', dZ: '核心效果 +4%/级', max: 5, cost: l => (l + 1) * 6 },
  { id: 'gem_luck', nE: 'Gem Sense', nZ: '宝石嗅觉', dE: 'All gems +10%/lv', dZ: '宝石获取 +10%/级', max: 4, cost: l => (l + 1) * 5 },
  { id: 'drone_boost', nE: 'Drone Fleet', nZ: '无人机编队', dE: 'Drone rate +30%/lv', dZ: '无人机 +30%/级', max: 5, cost: l => (l + 1) * 5 },
  { id: 'golden_star', nE: 'Midas Sonar', nZ: '点金声呐', dE: 'Golden chance +0.8%/lv', dZ: '黄金概率 +0.8%/级', max: 4, cost: l => (l + 1) * 4 },
  { id: 'egg_luck', nE: 'Lucky Genes', nZ: '幸运基因', dE: 'Epic+ egg weight +25%/lv', dZ: '史诗以上权重 +25%/级', max: 4, cost: l => (l + 1) * 4 },
  { id: 'deep_bank', nE: 'Seed Capital', nZ: '启动资金', dE: 'Start dives with coins', dZ: '跃迁后附带金币', max: 4, cost: l => (l + 1) * 8 },
];

// ---------------- economy math ----------------
export function hasBuff(st, id) { return st.buffs.some(b => b.id === id && b.until > Date.now()); }
export function activeBuffs(st) { return st.buffs.filter(b => b.until > Date.now()); }

export function getMods(st) {
  const lv = id => st.upgrades[id] || 0;
  const lab = id => st.lab[id] || 0;
  const skin = SKIN_BY[st.skin] || SKINS[0];
  let bookBonus = 0;
  for (let z = 0; z < ZONES.length; z++) {
    const list = CREATURES.filter(c => c.zone === z);
    if (list.length && list.every(c => st.book[c.id])) bookBonus += 0.05;
  }
  const coreMult = 1 + st.cores * (0.08 + 0.04 * lab('core_power'));
  const valueMult =
    1.15 ** lv('grip') * 1.12 ** lv('scope') *
    coreMult * (1 + skin.bonus / 100) * (1 + bookBonus) *
    (hasBuff(st, 'x2') ? 2 : 1);
  return {
    valueMult,
    coreMult,
    haulSpeed: 1 + 0.12 * lv('winch'),
    dropSpeed: 1 + 0.10 * lv('claw_speed'),
    grabRadius: 1 + 0.06 * lv('wide'),
    extraGrab: lv('multi'),
    goldenChance: Math.min(0.25, 0.02 + 0.004 * lv('golden_luck') + 0.008 * lab('golden_star') + (hasBuff(st, 'golden') ? 0.05 : 0)),
    gemChance: 0.015 + 0.005 * lv('gem_magnet'),
    gemMult: (1 + 0.25 * lv('gem_cut')) * (1 + 0.1 * lab('gem_luck')),
    droneRate: lv('drone') * 1.2 * (1.2 ** lv('drone_power')) * (1 + 0.3 * lab('drone_boost')),
    offlineCapH: 4 + 2 * lv('drum'),
    x2Proc: 0.02 * lv('lucky_net'),
    rareBoost: 1 + 0.15 * lv('sonar'),
    contractMult: 1 + 0.15 * lv('contract_pack'),
    researchSpeed: 1 + 0.08 * lv('scanner_lab'),
    speedBuff: hasBuff(st, 'speed') ? 1.5 : 1,
    bookBonus,
  };
}

export function avgZoneValue(zone) {
  const list = CREATURES.filter(c => c.zone === zone);
  return list.reduce((a, c) => a + c.v, 0) / list.length;
}

// prestige: cores earned for current run
export function coresFor(st) { return Math.floor(Math.sqrt(st.lifetime.runEarned / 5e5)); }
export const PRESTIGE_REQ_EARN = 4e5;
