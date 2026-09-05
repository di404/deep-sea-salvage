// fx.js — canvas particles pool + DOM floating text
import { $ } from './core.js';

export const pool = [];
const MAX = 220;
export function spawnP(x, y, type, color, n = 1) {
  for (let i = 0; i < n; i++) {
    if (pool.length >= MAX) pool.shift();
    const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 80;
    pool.push({
      x, y, vx: Math.cos(a) * sp, vy: type === 'bubble' ? -(30 + Math.random() * 60) : Math.sin(a) * sp,
      life: 1, decay: type === 'bubble' ? .5 : 1.6, size: type === 'bubble' ? 2 + Math.random() * 4 : 2 + Math.random() * 3,
      color, type,
    });
  }
}
export function updateP(dt) {
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.type !== 'bubble') p.vy += 140 * dt;
    p.life -= p.decay * dt;
    if (p.life <= 0) pool.splice(i, 1);
  }
}
export function drawP(ctx) {
  for (const p of pool) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    if (p.type === 'bubble') {
      ctx.strokeStyle = p.color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
  ctx.globalAlpha = 1;
}

// DOM floating text (screen space)
export function floatText(sx, sy, str, color = '#ffd257') {
  const layer = $('#fx-layer');
  if (!layer || layer.childElementCount > 40) return;
  const el = document.createElement('div');
  el.className = 'ftext';
  el.textContent = str;
  el.style.cssText = `left:${sx}px;top:${sy}px;color:${color};`;
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1150);
}
