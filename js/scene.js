// scene.js — all rendering is procedural canvas (zero image assets)
import { ZONES, SKIN_BY } from './data.js';
import { getState, rand } from './core.js';
import { G, PPM, clawTip, craneAnchor } from './game.js';
import { pool, drawP } from './fx.js';

// ---------- color utils ----------
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, t) {
  const A = hexRgb(a), B = hexRgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
}
function hsl(h, s, l, a = 1) { return `hsla(${h},${s}%,${l}%,${a})`; }
function hash(n) { let x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }

function zoneColorAt(ym) {
  for (const z of ZONES) {
    if (ym >= z.depth[0] && ym < z.depth[1] || (z.id === ZONES.length - 1 && ym >= z.depth[0])) {
      const t = Math.min(1, (ym - z.depth[0]) / (z.depth[1] - z.depth[0]));
      return mix(z.top, z.bot, t);
    }
  }
  return ZONES[0].top;
}

// ---------- creature drawing ----------
function eye(x, y, r = 3) {
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#08131c'; ctx.beginPath(); ctx.arc(x + r * .3, y, r * .55, 0, 7); ctx.fill();
}
let ctx = null, TT = 0;

export function drawCreature(c, def, x, y, t, o = {}) {
  ctx = c; TT = t;
  const s = (o.scale || 1) * def.sz / 40;
  let hue = def.hue;
  if (def.prism) hue = (t * 50) % 360;
  if (o.golden) hue = 46;
  const glow = def.glow || o.golden;
  ctx.save();
  ctx.translate(x, y);
  if (o.ghost) ctx.globalAlpha = 0.35 + 0.3 * Math.sin(t * 2 + x);
  ctx.scale(s, s);
  if (glow) { ctx.shadowColor = o.golden ? 'rgba(255,215,80,.9)' : hsl(hue, 90, 65, .9); ctx.shadowBlur = o.golden ? 22 : 14; }
  const D = {
    fish: dFish, jelly: dJelly, squid: dSquid, octo: dOcto, crab: dCrab, eel: dEel, blob: dBlob,
    isopod: dIsopod, clam: dClam, chest: dChest, amphora: dAmphora, coral: dCoral, coins: dCoins,
    crown: dCrown, gem: dGem, whale: dWhale, ray: dRay, shark: dShark, turtle: dTurtle, barrel: dBarrel,
    seapig: dSeapig, trilobite: dTrilobite, tube: dTube, junk: dBoot, junk2: dBottle, ship: dShip,
    angler: dAngler, puff: dPuff, leviathan: dLeviathan,
  }[def.shape] || dFish;
  D(hue, o);
  ctx.restore();
}

const dFish = (h) => {
  ctx.fillStyle = hsl(h, 75, 55);
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 11, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-28, -9); ctx.lineTo(-28, 9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = hsl(h, 80, 70, .8);
  ctx.beginPath(); ctx.ellipse(2, -3, 10, 4, -.3, 0, 7); ctx.fill();
  eye(11, -2, 3.2);
};
const dAngler = (h) => {
  ctx.fillStyle = hsl(h, 45, 38);
  ctx.beginPath(); ctx.ellipse(0, 2, 19, 13, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(-24, -6); ctx.lineTo(-24, 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  for (let i = -1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(i * 6 - 4, -8); ctx.lineTo(i * 6 - 1, -13); ctx.lineTo(i * 6 + 2, -8); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = hsl(h, 60, 60); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(10, -10); ctx.quadraticCurveTo(18, -22, 26, -16); ctx.stroke();
  ctx.fillStyle = 'rgba(255,240,150,.95)'; ctx.beginPath(); ctx.arc(27, -16, 4, 0, 7); ctx.fill();
  eye(8, -3, 3.6);
  ctx.strokeStyle = '#dff'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(10, 8); ctx.moveTo(5, 12); ctx.lineTo(12, 11); ctx.stroke();
};
const dPuff = (h) => {
  ctx.fillStyle = hsl(h, 80, 60);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 13, Math.sin(a) * 13); ctx.lineTo(Math.cos(a) * 21, Math.sin(a) * 21); ctx.lineTo(Math.cos(a + .35) * 13, Math.sin(a + .35) * 13); ctx.closePath(); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, 0, 15, 0, 7); ctx.fill();
  eye(-5, -3, 3); eye(6, -3, 3);
  ctx.fillStyle = '#c76'; ctx.beginPath(); ctx.arc(0, 4, 3, 0, 7); ctx.fill();
};
const dJelly = (h) => {
  ctx.fillStyle = hsl(h, 85, 68, .85);
  ctx.beginPath(); ctx.arc(0, 0, 16, Math.PI, 0); ctx.quadraticCurveTo(16, 8, 0, 8); ctx.quadraticCurveTo(-16, 8, -16, 0); ctx.fill();
  ctx.strokeStyle = hsl(h, 85, 72, .7); ctx.lineWidth = 2.4;
  for (let i = 0; i < 4; i++) {
    const x0 = -10 + i * 7;
    ctx.beginPath(); ctx.moveTo(x0, 7);
    ctx.quadraticCurveTo(x0 + Math.sin(TT * 3 + i) * 5, 16, x0 + Math.sin(TT * 3 + i + 1) * 6, 24); ctx.stroke();
  }
  eye(2, -4, 2.6);
};
const dSquid = (h, o) => {
  ctx.fillStyle = hsl(h, 65, 55);
  ctx.beginPath(); ctx.moveTo(0, -20); ctx.quadraticCurveTo(14, -6, 10, 6); ctx.lineTo(-10, 6); ctx.quadraticCurveTo(-14, -6, 0, -20); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -20); ctx.quadraticCurveTo(16, -26, 20, -16); ctx.quadraticCurveTo(10, -16, 0, -13); ctx.fill();
  ctx.strokeStyle = hsl(h, 70, 48); ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const x0 = -6 + i * 4;
    ctx.beginPath(); ctx.moveTo(x0, 5);
    ctx.quadraticCurveTo(x0 + Math.sin(TT * 4 + i * 2) * 5, 15, x0 - 2 + Math.sin(TT * 4 + i) * 7, 22); ctx.stroke();
  }
  eye(4, -8, 3.4); eye(-3, -7, 2.6);
};
const dOcto = (h) => {
  ctx.fillStyle = hsl(h, 70, 58);
  ctx.beginPath(); ctx.arc(0, -2, 15, Math.PI, 0);
  ctx.quadraticCurveTo(17, 4, 14, 6); ctx.quadraticCurveTo(8, 2, 0, 6); ctx.quadraticCurveTo(-8, 2, -14, 6); ctx.quadraticCurveTo(-17, 4, -15, 0); ctx.fill();
  ctx.strokeStyle = hsl(h, 70, 50); ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const x0 = -9 + i * 6;
    ctx.beginPath(); ctx.moveTo(x0, 5); ctx.quadraticCurveTo(x0 + Math.sin(TT * 2.5 + i) * 6, 14, x0 + Math.sin(TT * 2.5 + i) * 8, 20); ctx.stroke();
  }
  eye(-5, -4, 3); eye(5, -4, 3);
  ctx.fillStyle = hsl(h, 70, 40, .5); ctx.beginPath(); ctx.arc(0, -1, 3, 0, 7); ctx.fill();
};
const dCrab = (h) => {
  ctx.strokeStyle = hsl(h, 70, 42); ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(s * 8, 4); ctx.lineTo(s * (15 + i * 3), 12 + i * 2); ctx.stroke();
  }
  ctx.fillStyle = hsl(h, 75, 50);
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 9, 0, 0, 7); ctx.fill();
  for (let s = -1; s <= 1; s += 2) {
    ctx.beginPath(); ctx.arc(s * 18, -4, 6, 0, 7); ctx.fill();
    ctx.fillStyle = hsl(h, 75, 38);
    ctx.beginPath(); ctx.moveTo(s * 22, -8); ctx.lineTo(s * 26, -2); ctx.lineTo(s * 20, -1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = hsl(h, 75, 50);
  }
  eye(-5, -6, 2.6); eye(5, -6, 2.6);
};
const dEel = (h) => {
  ctx.strokeStyle = hsl(h, 65, 45); ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-26, 4);
  for (let i = 0; i <= 4; i++) ctx.quadraticCurveTo(-20 + i * 12, Math.sin(TT * 3 + i) * 6 - 4, -14 + i * 12, Math.sin(TT * 3 + i) * 4);
  ctx.stroke();
  ctx.fillStyle = hsl(h, 70, 55); ctx.beginPath(); ctx.arc(24, Math.sin(TT * 3 + 4) * 3 - 2, 7, 0, 7); ctx.fill();
  eye(26, Math.sin(TT * 3 + 4) * 3 - 4, 2.6);
};
const dBlob = (h) => {
  ctx.fillStyle = hsl(h, 60, 68);
  ctx.beginPath(); ctx.moveTo(-16, 10); ctx.quadraticCurveTo(-18, -14, 0, -14); ctx.quadraticCurveTo(18, -14, 16, 10); ctx.quadraticCurveTo(0, 16, -16, 10); ctx.fill();
  ctx.fillStyle = hsl(h, 60, 55);
  ctx.beginPath(); ctx.arc(-2, -18, 4, 0, 7); ctx.fill();
  eye(-6, 0, 3.4); eye(7, 1, 3.4);
  ctx.strokeStyle = hsl(h, 50, 35); ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(0, 6, 4, .3, Math.PI - .3); ctx.stroke();
};
const dIsopod = (h) => {
  ctx.fillStyle = hsl(h, 40, 50);
  ctx.beginPath(); ctx.ellipse(0, 0, 18, 11, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = hsl(h, 40, 32); ctx.lineWidth = 1.6;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(i * 5.5, 0, 4, 10, 0, -.9, .9); ctx.stroke(); }
  ctx.strokeStyle = hsl(h, 40, 45); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(16, -3); ctx.lineTo(24, -8); ctx.moveTo(16, 1); ctx.lineTo(24, 3); ctx.stroke();
  eye(13, -3, 2.4);
};
const dClam = (h) => {
  ctx.fillStyle = '#e8ddc8';
  ctx.beginPath(); ctx.arc(0, 4, 16, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#b8a888'; ctx.lineWidth = 1.4;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(i * 6, -10); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,240,220,.9)'; ctx.beginPath(); ctx.arc(0, 2, 6, 0, 7); ctx.fill();
  ctx.fillStyle = 'radial-gradient(#fff,#9cd8f0)'; ctx.fillStyle = '#bfe6f5';
  ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, 7); ctx.fill();
  ctx.shadowColor = '#fff'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
};
const dChest = (h) => {
  ctx.fillStyle = '#7a4a1e';
  ctx.fillRect(-15, -2, 30, 13);
  ctx.beginPath(); ctx.arc(0, -2, 15, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#ffd257'; ctx.fillRect(-15, -4, 30, 3.4);
  ctx.fillStyle = '#c9962e'; ctx.fillRect(-2.6, -5, 5.2, 8);
  ctx.fillStyle = '#4a2a0e'; ctx.fillRect(-2, 0, 4, 3);
};
const dAmphora = (h) => {
  ctx.fillStyle = hsl(h, 45, 52);
  ctx.beginPath(); ctx.moveTo(-4, -16); ctx.quadraticCurveTo(10, -10, 9, 2); ctx.quadraticCurveTo(8, 14, 0, 15); ctx.quadraticCurveTo(-8, 14, -9, 2); ctx.quadraticCurveTo(-10, -10, 4, -16); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = hsl(h, 45, 38); ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(-9, -6); ctx.quadraticCurveTo(-16, -6, -15, 1); ctx.moveTo(9, -6); ctx.quadraticCurveTo(16, -6, 15, 1); ctx.stroke();
  ctx.fillStyle = '#3a2414'; ctx.fillRect(-5, -19, 10, 4);
};
const dCoral = (h) => {
  ctx.strokeStyle = hsl(h, 80, 60); ctx.lineWidth = 5; ctx.lineCap = 'round';
  const sw = Math.sin(TT * 1.5) * 2;
  [[0, 0, -8, -14, -12 + sw, -24], [0, 0, 0, -16, 2 + sw, -28], [0, 0, 9, -12, 14 + sw, -22]].forEach(b => {
    ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.quadraticCurveTo(b[2], b[3], b[4], b[5]); ctx.stroke();
    ctx.fillStyle = hsl(h, 90, 72); ctx.beginPath(); ctx.arc(b[4], b[5], 3, 0, 7); ctx.fill();
  });
};
const dCoins = (h) => {
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#f5c542'; ctx.strokeStyle = '#a87b12'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(i * 4 - 4, 4 - i * 7, 11, 4.4, 0, 0, 7); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = '#fff6d0'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('$', 4, -4);
};
const dCrown = (h) => {
  ctx.fillStyle = '#ffd257';
  ctx.beginPath(); ctx.moveTo(-14, 8); ctx.lineTo(-14, -4); ctx.lineTo(-7, 2); ctx.lineTo(0, -10); ctx.lineTo(7, 2); ctx.lineTo(14, -4); ctx.lineTo(14, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e0483e'; ctx.beginPath(); ctx.arc(0, 0, 2.4, 0, 7); ctx.fill();
  ctx.fillStyle = '#4ea8e0'; ctx.beginPath(); ctx.arc(-8, 4, 2, 0, 7); ctx.fill();
  ctx.fillStyle = '#59c96a'; ctx.beginPath(); ctx.arc(8, 4, 2, 0, 7); ctx.fill();
};
const dGem = (h) => {
  ctx.fillStyle = hsl(h, 85, 62);
  ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(13, -4); ctx.lineTo(8, 12); ctx.lineTo(-8, 12); ctx.lineTo(-13, -4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = hsl(h, 90, 82, .8); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 12); ctx.moveTo(-13, -4); ctx.lineTo(13, -4); ctx.moveTo(-8, 12); ctx.lineTo(0, -4); ctx.lineTo(8, 12); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.globalAlpha = .5; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(6, -6); ctx.lineTo(0, -4); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
};
const dWhale = (h) => {
  ctx.fillStyle = hsl(h, 35, 42);
  ctx.beginPath(); ctx.ellipse(0, 0, 26, 12, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-22, -2); ctx.quadraticCurveTo(-34, -14, -36, -4); ctx.quadraticCurveTo(-32, 0, -36, 6); ctx.quadraticCurveTo(-32, 6, -22, 4); ctx.fill();
  ctx.fillStyle = hsl(h, 35, 60);
  ctx.beginPath(); ctx.ellipse(4, 6, 16, 4.4, 0, 0, 7); ctx.fill();
  eye(14, -3, 2.6);
  ctx.strokeStyle = hsl(h, 30, 30, .6); ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(16 + i * 4, 2); ctx.lineTo(15 + i * 4, 8); ctx.stroke(); }
};
const dLeviathan = (h) => {
  ctx.fillStyle = hsl(h, 55, 40);
  ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-10, -18, 22, -8); ctx.quadraticCurveTo(34, -4, 30, 2); ctx.quadraticCurveTo(10, 12, -30, 0); ctx.fill();
  ctx.fillStyle = hsl(h, 70, 65);
  for (let i = 0; i < 4; i++) { const x = -18 + i * 12; ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x + 4, -22 - i * 2); ctx.lineTo(x + 8, -9); ctx.closePath(); ctx.fill(); }
  eye(20, -5, 3);
  ctx.shadowBlur = 18; ctx.fillStyle = hsl(h, 90, 75, .8);
  ctx.beginPath(); ctx.arc(-24, -2, 3, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
};
const dRay = (h) => {
  const flap = Math.sin(TT * 3) * 5;
  ctx.fillStyle = hsl(h, 60, 48);
  ctx.beginPath(); ctx.moveTo(0, -6); ctx.quadraticCurveTo(18, -18 + flap, 26, 0); ctx.quadraticCurveTo(18, 14 - flap, 0, 8); ctx.quadraticCurveTo(-18, 14 - flap, -24, 0); ctx.quadraticCurveTo(-18, -18 + flap, 0, -6); ctx.fill();
  ctx.strokeStyle = hsl(h, 60, 40); ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(-24, 0); ctx.quadraticCurveTo(-34, Math.sin(TT * 4) * 6, -40, 4); ctx.stroke();
  eye(2, -4, 2.6);
};
const dShark = (h) => {
  ctx.fillStyle = hsl(h, 35, 45);
  ctx.beginPath(); ctx.ellipse(0, 0, 24, 10, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(2, -18); ctx.lineTo(8, -8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, -2); ctx.lineTo(-32, -10); ctx.lineTo(-32, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = hsl(h, 30, 70);
  ctx.beginPath(); ctx.ellipse(2, 5, 16, 4, 0, 0, 7); ctx.fill();
  eye(13, -3, 2.8);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(18, 2); ctx.lineTo(23, 2); ctx.lineTo(20, 6); ctx.closePath(); ctx.fill();
};
const dTurtle = (h) => {
  ctx.fillStyle = hsl(h, 45, 45);
  ctx.beginPath(); ctx.ellipse(0, 0, 17, 12, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = hsl(h, 50, 32); ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(0, 0, 10, 7, 0, 0, 7); ctx.stroke();
  ctx.fillStyle = hsl(h, 50, 58);
  ctx.beginPath(); ctx.arc(19, -2, 6, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-14, -8, 7, 3.6, .6, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-14, 8, 7, 3.6, -.6, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(12, 9, 6, 3, -.5, 0, 7); ctx.fill();
  eye(21, -4, 2.2);
};
const dBarrel = (h) => {
  ctx.fillStyle = hsl(h, 50, 52);
  ctx.beginPath(); ctx.ellipse(0, 2, 18, 10, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-26, -6); ctx.lineTo(-26, 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(180,230,255,.35)';
  ctx.beginPath(); ctx.arc(8, -3, 8, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(6, -3, 4.4, 0, 7); ctx.fill();
  ctx.fillStyle = '#08131c'; ctx.beginPath(); ctx.arc(7, -3, 2.4, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(11, -4, 2.4, 0, 7); ctx.fill();
};
const dSeapig = (h) => {
  ctx.fillStyle = hsl(h, 70, 70);
  ctx.beginPath(); ctx.ellipse(0, 0, 15, 10, 0, 0, 7); ctx.fill();
  ctx.fillStyle = hsl(h, 60, 58);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(i * 7 - 2, 8); ctx.lineTo(i * 7, 14); ctx.lineTo(i * 7 + 2, 8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(i * 7 - 2, -8); ctx.lineTo(i * 7, -13); ctx.lineTo(i * 7 + 2, -8); ctx.fill();
  }
  eye(-6, -2, 2.4); eye(7, -2, 2.4);
};
const dTrilobite = (h) => {
  ctx.fillStyle = hsl(h, 45, 48);
  ctx.beginPath(); ctx.ellipse(0, 0, 17, 11, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = hsl(h, 45, 30); ctx.lineWidth = 1.4;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 5, -10); ctx.lineTo(i * 5, 10); ctx.stroke(); }
  ctx.fillStyle = hsl(h, 45, 38);
  ctx.beginPath(); ctx.ellipse(14, 0, 6, 9, 0, 0, 7); ctx.fill();
  eye(15, -3, 1.8); eye(15, 3, 1.8);
};
const dTube = (h) => {
  for (let i = -1; i <= 1; i++) {
    const x = i * 9, hh = 20 - Math.abs(i) * 5, sw = Math.sin(TT + i) * 1.5;
    ctx.fillStyle = '#d8ccc0';
    ctx.beginPath(); ctx.moveTo(x - 3, 12); ctx.lineTo(x - 3 + sw, -hh); ctx.lineTo(x + 3 + sw, -hh); ctx.lineTo(x + 3, 12); ctx.fill();
    ctx.fillStyle = hsl(h, 85, 55);
    ctx.beginPath(); ctx.ellipse(x + sw, -hh, 3.4, 2, 0, 0, 7); ctx.fill();
  }
};
const dBoot = (h) => {
  ctx.fillStyle = hsl(h, 40, 32);
  ctx.beginPath(); ctx.moveTo(-8, -16); ctx.lineTo(0, -16); ctx.lineTo(1, 2); ctx.lineTo(12, 4); ctx.quadraticCurveTo(15, 12, 6, 12); ctx.lineTo(-8, 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = hsl(h, 40, 22); ctx.fillRect(-9, 9, 22, 4);
  ctx.fillStyle = hsl(h, 40, 45); ctx.fillRect(-9, -18, 4, 6);
};
const dBottle = (h) => {
  ctx.fillStyle = hsl(h, 60, 60, .8);
  ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(-6, 12); ctx.quadraticCurveTo(0, 16, 6, 12); ctx.lineTo(6, -8); ctx.closePath(); ctx.fill();
  ctx.fillRect(-2.6, -16, 5.2, 9);
  ctx.fillStyle = '#8a5a2a'; ctx.fillRect(-3, -19, 6, 4);
  ctx.fillStyle = '#fff8e0'; ctx.fillRect(-4.6, -3, 9.2, 8);
  ctx.fillStyle = '#a77'; ctx.fillRect(-3.6, -1, 7.2, 1.4);
};
const dShip = (h) => {
  ctx.fillStyle = hsl(h, 30, 25);
  ctx.beginPath(); ctx.moveTo(-26, -2); ctx.lineTo(26, -2); ctx.lineTo(18, 12); ctx.lineTo(-20, 12); ctx.closePath(); ctx.fill();
  ctx.fillRect(-2, -30, 4, 28);
  ctx.beginPath(); ctx.moveTo(2, -28); ctx.lineTo(20, -8); ctx.lineTo(2, -8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#d8d0c0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(2, -24); ctx.lineTo(16, -12); ctx.stroke();
};

export function drawMine(c, x, y, t) {
  ctx = c;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#1a2833';
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, 7); ctx.fill();
  ctx.strokeStyle = '#33475a'; ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * .3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 13, Math.sin(a) * 13); ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); ctx.stroke(); }
  if (Math.sin(t * 6) > 0) { ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(0, -4, 3, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- boat, crane, claw (pivot on the crane boom; claw rotates with swing) ----------
export function drawClaw(c, skinHue, state, hold, t) {
  const tip = clawTip();
  const { bx, by } = craneAnchor();
  const ang = G.claw.ang;
  const dx = Math.sin(ang), dy = Math.cos(ang);
  const oy = -G.camY; // world y → screen y (waterline offset)
  // cable from boom pulley to claw, along the swing/drop direction
  ctx = c;
  ctx.strokeStyle = 'rgba(222,230,238,.92)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(bx, by + oy);
  ctx.lineTo(tip.x - dx * 15, tip.y + oy - dy * 15);
  ctx.stroke();
  const prism = skinHue < 0;
  const hue = prism ? (t * 60) % 360 : skinHue;
  const open = state === 'drop' ? 1 : 0.18;
  ctx.save();
  ctx.translate(tip.x, tip.y + oy);
  ctx.rotate(-ang);
  // mount block (steel)
  const mg = ctx.createLinearGradient(0, -16, 0, -6);
  mg.addColorStop(0, '#eef3f8'); mg.addColorStop(1, '#93a7ba');
  ctx.fillStyle = mg;
  ctx.strokeStyle = '#5b7086'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.roundRect(-9, -16, 18, 10, 3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd257';
  ctx.beginPath(); ctx.arc(0, -11, 2.4, 0, 7); ctx.fill();
  // pincers (skin-tinted metal, hinge below mount)
  const pg = ctx.createLinearGradient(0, -6, 0, 26);
  pg.addColorStop(0, hsl(hue, 52, 68));
  pg.addColorStop(1, hsl(hue, 55, 38));
  for (const s of [-1, 1]) {
    ctx.save(); ctx.scale(s, 1); ctx.rotate(s * open * 0.55);
    ctx.fillStyle = pg; ctx.strokeStyle = hsl(hue, 50, 26); ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(3, -6);
    ctx.quadraticCurveTo(15, -2, 14, 10);
    ctx.quadraticCurveTo(13.4, 16, 8, 18);
    ctx.lineTo(5.6, 20);
    ctx.quadraticCurveTo(9, 10, 3, 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = hsl(hue, 40, 30);
  ctx.beginPath(); ctx.arc(0, -5, 2.8, 0, 7); ctx.fill();
  ctx.restore();
  // held catch hangs along the cable direction
  hold.forEach((e, i) => {
    const hx = tip.x + dx * (18 + i * 26);
    const hy = tip.y + oy + dy * (18 + i * 26);
    drawCreature(c, e.def, hx, hy, t, { scale: .5, golden: e.golden, dir: 1 });
  });
}

// boat + crane drawn at the surface in world space
function drawBoatAt(c, skinHue, t) {
  ctx = c;
  const camY = G.camY;
  const bx = G.W * 0.5;             // boat center
  const oy = -camY;                 // world y0 on screen (waterline)
  if (oy < -80 || oy > G.H + 200) return;
  const deck = oy - 12;
  ctx.save();
  ctx.translate(0, 0);
  // crane post + boom (pivot must match craneAnchor)
  const px = bx + 88, py = oy - 40;
  ctx.strokeStyle = '#6d7f92'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(bx + 40, deck - 2); ctx.lineTo(bx + 40, oy - 74); ctx.stroke();
  ctx.strokeStyle = '#8496a8'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(bx + 40, deck - 4); ctx.lineTo(bx + 40, oy - 68); ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(bx + 40, oy - 72); ctx.lineTo(px, py + 5); ctx.stroke();
  ctx.strokeStyle = '#46586b'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx + 40, oy - 64); ctx.lineTo(px - 12, py + 12); ctx.stroke();
  // pulley
  ctx.fillStyle = '#37485a';
  ctx.beginPath(); ctx.arc(px, py, 7.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffd257';
  ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 7); ctx.fill();
  // hull
  const hull = ctx.createLinearGradient(0, deck, 0, oy + 16);
  hull.addColorStop(0, '#a85a2c'); hull.addColorStop(1, '#6e3a1a');
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(bx - 74, deck);
  ctx.lineTo(bx + 66, deck);
  ctx.quadraticCurveTo(bx + 70, oy + 2, bx + 46, oy + 12);
  ctx.quadraticCurveTo(bx, oy + 18, bx - 48, oy + 10);
  ctx.quadraticCurveTo(bx - 72, oy + 2, bx - 74, deck);
  ctx.closePath(); ctx.fill();
  // deck stripe + rail
  ctx.fillStyle = '#c96a2e';
  ctx.fillRect(bx - 74, deck - 4, 140, 5);
  ctx.strokeStyle = '#e8dcc8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx - 70, deck - 8); ctx.lineTo(bx + 62, deck - 8); ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const rx = bx - 62 + i * 24;
    ctx.beginPath(); ctx.moveTo(rx, deck - 8); ctx.lineTo(rx, deck - 2); ctx.stroke();
  }
  // cabin
  ctx.fillStyle = '#efe9da';
  ctx.beginPath(); ctx.roundRect(bx - 58, deck - 34, 40, 26, 3); ctx.fill();
  ctx.fillStyle = '#cf4b32';
  ctx.beginPath(); ctx.roundRect(bx - 62, deck - 40, 48, 8, 3); ctx.fill();
  ctx.fillStyle = '#7fb4d4';
  ctx.beginPath(); ctx.roundRect(bx - 50, deck - 28, 10, 8, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(bx - 34, deck - 28, 10, 8, 2); ctx.fill();
  // porthole on hull
  ctx.fillStyle = '#ffd257';
  ctx.beginPath(); ctx.arc(bx + 20, oy + 2, 3.4, 0, 7); ctx.fill();
  // flag
  ctx.strokeStyle = '#5b7086'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx + 40, oy - 74); ctx.lineTo(bx + 40, oy - 92); ctx.stroke();
  const fw = Math.sin(t * 4) * 2;
  ctx.fillStyle = '#ffd257';
  ctx.beginPath();
  ctx.moveTo(bx + 40, oy - 92);
  ctx.quadraticCurveTo(bx + 52, oy - 90 + fw, bx + 60, oy - 87);
  ctx.lineTo(bx + 40, oy - 82);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ---------- main render ----------
let bubbleAcc = 0;
export function render(c, dt) {
  const st = getState();
  const W = G.W, H = G.H;
  ctx = c; TT = G.t;
  const camY = G.camY;
  const skinHue = st.skin === 'prism' ? -1 : (SKIN_BY[st.skin] || SKINS[0]).hue;

  ctx.save();
  if (G.shake > 0) ctx.translate(rand(-1, 1) * G.shake * 8, rand(-1, 1) * G.shake * 8);

  // ---- sky (visible when camY small) ----
  const waterTopScreen = -camY + 0; // world y0 at screen -camY
  if (camY < 400) {
    const sky = ctx.createLinearGradient(0, 0, 0, Math.max(1, waterTopScreen));
    sky.addColorStop(0, '#aee3f8'); sky.addColorStop(1, '#d8f2fc');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, Math.max(0, waterTopScreen));
    // sun & clouds
    const sy2 = Math.max(30, waterTopScreen - 160);
    const halo = ctx.createRadialGradient(W * .78, sy2, 8, W * .78, sy2, 90);
    halo.addColorStop(0, 'rgba(255,244,200,.95)'); halo.addColorStop(1, 'rgba(255,244,200,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(W * .78, sy2, 90, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffec9e';
    ctx.beginPath(); ctx.arc(W * .78, sy2, 30, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 3; i++) {
      const cx = (hash(i + 3) * W + G.t * (6 + i * 3)) % (W + 160) - 80;
      const cy = 30 + hash(i * 7) * Math.max(20, waterTopScreen - 120);
      ctx.beginPath(); ctx.ellipse(cx, cy, 42, 13, 0, 0, 7); ctx.ellipse(cx + 24, cy - 7, 28, 11, 0, 0, 7); ctx.fill();
    }
  }

  // ---- water column ----
  const topScreen = Math.max(0, waterTopScreen);
  const g1 = zoneColorAt(camY / PPM + (topScreen > 0 ? 0 : 0));
  const g2 = zoneColorAt((camY + H) / PPM);
  const wg = ctx.createLinearGradient(0, topScreen, 0, H);
  wg.addColorStop(0, topScreen === 0 ? zoneColorAt(camY / PPM) : g1);
  wg.addColorStop(1, g2);
  ctx.fillStyle = wg;
  ctx.fillRect(0, topScreen, W, H - topScreen);

  // god rays near surface
  if (camY < 1500) {
    ctx.save(); ctx.globalAlpha = Math.max(0, .18 * (1 - camY / 1500));
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const x = (hash(i) * W + Math.sin(G.t * .3 + i) * 30);
      ctx.beginPath();
      ctx.moveTo(x, topScreen); ctx.lineTo(x + 60, topScreen); ctx.lineTo(x + 160, topScreen + 420); ctx.lineTo(x + 60, topScreen + 420);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  // ---- zone boundaries & labels ----
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';
  for (const z of ZONES) {
    if (z.id === 0) continue;
    const sy = z.depth[0] * PPM - camY;
    if (sy > -20 && sy < H + 20) {
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      ctx.fillText((z.id <= 4 ? (st.settings.lang === 'zh' || document.documentElement.lang === 'zh' ? z.nZ : z.nE) : ''), 14, sy - 6);
    }
  }

  // ---- ambient bubbles ----
  bubbleAcc += dt;
  if (bubbleAcc > .3) {
    bubbleAcc = 0;
    import('./fx.js').then(fx => fx.spawnP(Math.random() * W, camY + H + 10, 'bubble', 'rgba(255,255,255,.5)', 1));
  }

  // ---- entities ----
  const held = new Set(G.claw.hold);
  for (const e of G.ents) {
    if (e.mine) {
      const sy = e.ym * PPM - camY + Math.sin(e.ph) * 6;
      if (sy > -60 && sy < H + 60) drawMine(ctx, e.x * W, sy, G.t);
      continue;
    }
    if (held.has(e)) continue;
    const bob = Math.sin(e.ph) * 6;
    const sy = e.ym * PPM - camY + bob;
    if (sy < -80 || sy > H + 80) continue;
    drawCreature(ctx, e.def, e.x * W, sy, G.t, { dir: e.dir > 0 ? 1 : -1, golden: e.golden, ghost: ZONES[st.zone].mech === 'ghost' });
    if (e.golden && Math.random() < .1) import('./fx.js').then(fx => fx.spawnP(e.x * W, sy, 'spark', '#ffe680', 1));
  }

  // ---- rush squid ----
  if (G.squid) {
    const sx = G.squid.x * W, sy = G.squid.ym * PPM - camY + Math.sin(G.t * 4) * 8;
    drawCreature(ctx, { shape: 'squid', hue: 48, sz: 46, glow: 1, prism: 0 }, sx, sy, G.t, { dir: 1, golden: 1, scale: 1 });
  }

  // ---- boat & claw ----
  drawBoatAt(ctx, skinHue, G.t);
  drawClaw(ctx, skinHue, G.claw.state, G.claw.hold, G.t);

  // ---- particles ----
  drawP(ctx);

  // ---- depth ruler ----
  ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
  const stepM = 100;
  const m0 = Math.floor(camY / PPM / stepM) * stepM, m1 = (camY + H) / PPM;
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  for (let m = Math.max(stepM, m0); m < m1; m += stepM) {
    const sy = m * PPM - camY;
    const big = m % 500 === 0;
    ctx.fillRect(W - (big ? 26 : 14), sy, big ? 20 : 8, 1);
    if (big) ctx.fillText(m + 'm', W - 30, sy + 3);
  }

  // ---- vignette for depth ----
  const dg = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H);
  dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(1, `rgba(0,4,12,${Math.min(.5, camY / 40000 + .12)})`);
  ctx.fillStyle = dg; ctx.fillRect(0, 0, W, H);

  // waterline waves
  if (topScreen > 0 && topScreen < H) drawWaves(ctx, topScreen, W, G.t);

  ctx.restore();
}

// waterline wave strip
function drawWaves(c, topScreen, W, t) {
  ctx = c;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.beginPath();
  ctx.moveTo(0, topScreen + 2);
  for (let x = 0; x <= W; x += 24) {
    ctx.lineTo(x, topScreen + Math.sin(x * 0.025 + t * 2.1) * 2.6);
  }
  ctx.lineTo(W, topScreen + 7);
  ctx.lineTo(0, topScreen + 7);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ctx.beginPath();
  ctx.moveTo(0, topScreen + 8);
  for (let x = 0; x <= W; x += 30) {
    ctx.lineTo(x, topScreen + 7 + Math.sin(x * 0.018 - t * 1.6) * 2.2);
  }
  ctx.lineTo(W, topScreen + 13); ctx.lineTo(0, topScreen + 13);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
