// fx.js — canvas particles pool + DOM floating text
import { $ } from './core.js';

export const pool = [];
const MAX = 220;
export function spawnP(x, y, type, color, n = 1) {
  for (let i = 0; i < n; i++) {
    if (pool.length >= MAX) pool.shift();
    const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 80;
    pool.push({
      x, y, vx: Math.cos(a) * sp, vy: type === 'bubble' ? -(40 + Math.random() * 70) : Math.sin(a) * sp,
      life: 1, decay: type === 'bubble' ? .3 : 1.6, size: type === 'bubble' ? 2 + Math.random() * 4 : 2 + Math.random() * 3,
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
export function drawP(ctx, camY = 0) {
  // particles live in WORLD space — anchored to the scene, not the camera
  for (const p of pool) {
    const y = p.y - camY;
    if (y < -20 || y > ctx.canvas.height / (ctx.getTransform().a || 1) + 20) continue;
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    if (p.type === 'bubble') {
      ctx.strokeStyle = p.color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p.x, y, p.size, 0, 7); ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, y - p.size / 2, p.size, p.size);
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
