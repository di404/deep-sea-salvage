// icons.js — vector icon set (no emoji anywhere). DOM: icon(); canvas: drawIcon().
// Each icon = list of {d: pathData, f: fill}. Default fill = currentColor.
const C = {
  gold: '#f0b429', goldHi: '#ffdd87', goldDk: '#a3701a',
  gem: '#4fd1f0', gemHi: '#b3f0ff',
  cream: '#f4e9cf', creamDk: '#d9c9a4',
  ink: '#0a2740',
};
const P = {
  coin: [
    { d: 'M12 1.5A10.5 10.5 0 1 0 12 22.5 10.5 10.5 0 0 0 12 1.5Z', f: C.gold },
    { d: 'M12 4.6A7.4 7.4 0 1 1 12 19.4 7.4 7.4 0 0 1 12 4.6Z', f: C.goldHi },
    { d: 'M12 7.6A4.4 4.4 0 1 0 12 16.4 4.4 4.4 0 0 0 12 7.6Z', f: C.gold },
    { d: 'M10.9 9h2.2v6h-2.2Z', f: C.goldDk },
  ],
  gem: [
    { d: 'M12 2 21 9.2 12 22 3 9.2Z', f: C.gem },
    { d: 'M7.4 9.2 12 2l4.6 7.2Z', f: C.gemHi },
    { d: 'M12 22 7.4 9.2h9.2Z', f: '#2fa8d8' },
  ],
  bolt: [
    { d: 'M13.4 2 4.6 13.4h6L9.2 22l9.6-12.2h-6.2Z', f: C.goldHi },
  ],
  egg: [
    { d: 'M12 2.2C8.7 2.2 5.6 8.2 5.6 13.4a6.4 6.4 0 0 0 12.8 0C18.4 8.2 15.3 2.2 12 2.2Z', f: C.cream },
    { d: 'M9.6 6.8c-1.2 1.9-2 4.3-2 6.4a4.4 4.4 0 0 0 1.6 3.4c-2.6-3.4.2-8.4.4-9.8Z', f: '#fffbe9' },
  ],
  gift: [
    { d: 'M3 7.6h18V12H3Z', f: '#ff7d9c' },
    { d: 'M4.8 13.2h14.4V21H4.8Z', f: '#ffb3c6' },
    { d: 'M10.9 7.6h2.2V21h-2.2Z', f: '#fff' },
    { d: 'M12 7.6C9 7.6 6.6 6.5 6.6 4.8 6.6 3.4 7.8 2.4 9.2 2.4c1.7 0 2.6 2 2.8 5.2Zm0 0c3 0 5.4-1.1 5.4-2.8 0-1.4-1.2-2.4-2.6-2.4-1.7 0-2.6 2-2.8 5.2Z', f: '#ff7d9c' },
  ],
  trophy: [
    { d: 'M7 3h10v2h3.4v3.2A5 5 0 0 1 16 13.1 5.4 5.4 0 0 1 13 15.6V18h3.2v3H7.8v-3H11v-2.4A5.4 5.4 0 0 1 8 13.1 5 5 0 0 1 3.6 8.2V5H7Zm10 4.4V12a3.2 3.2 0 0 0 1.6-2.8V7.4ZM7 7.4H5.4v1.8A3.2 3.2 0 0 0 7 12Z', f: C.gold, s: 1 },
    { d: 'M9 3.4h6V12a3 3 0 0 1-6 0Z', f: C.goldHi },
  ],
  star: [
    { d: 'M12 1.8l3 6.3 6.9.9-5.1 4.8 1.3 6.9-6.1-3.3-6.1 3.3 1.3-6.9L2.1 9l6.9-.9Z', f: C.goldHi },
    { d: 'M12 6.5l1.7 3.6 3.9.5-2.9 2.7.8 3.9-3.5-1.9Z', f: C.gold },
  ],
  target: [
    { d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.4a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Z', f: '#ff7d70', s: 1 },
    { d: 'M12 9.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z', f: '#ff7d70' },
  ],
  flask: [
    { d: 'M9 2h6v2.2l-1 1v3.6l5.4 9A2.1 2.1 0 0 1 17.6 21H6.4a2.1 2.1 0 0 1-1.8-3.2L10 8.8V5.2l-1-1Z', f: '#8fd4a8' },
    { d: 'M8.6 13.4h6.8l2.9 4.9a.5.5 0 0 1-.4.7H6.1a.5.5 0 0 1-.4-.7Z', f: '#fff' },
  ],
  x: [
    { d: 'M10.6 12 4.2 5.6 5.6 4.2 12 10.6l6.4-6.4 1.4 1.4L13.4 12l6.4 6.4-1.4 1.4L12 13.4 5.6 20 4.2 18.6Z', f: 'currentColor' },
  ],
  gear: [
    { d: 'M10.2 2h3.6l.5 2.6a7.6 7.6 0 0 1 1.9.8l2.2-1.5 2.5 2.5-1.5 2.2c.4.6.6 1.2.8 1.9l2.6.5v3.6l-2.6.5a7.6 7.6 0 0 1-.8 1.9l1.5 2.2-2.5 2.5-2.2-1.5a7.6 7.6 0 0 1-1.9.8L13.8 22h-3.6l-.5-2.6a7.6 7.6 0 0 1-1.9-.8l-2.2 1.5-2.5-2.5 1.5-2.2a7.6 7.6 0 0 1-.8-1.9L1.2 13v-3.6l2.6-.5c.2-.7.4-1.3.8-1.9L3.1 4.8l2.5-2.5 2.2 1.5c.6-.4 1.2-.6 1.9-.8Z', f: 'currentColor' },
    { d: 'M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z', f: '#0b3a5c' },
  ],
  wrench: [
    { d: 'M21.3 6.4a5.7 5.7 0 0 1-7.7 6.4L6.2 20.2a2.2 2.2 0 0 1-3.1-3.1l7.4-7.4a5.7 5.7 0 0 1 7.2-7.2l-3.3 3.3 2.9 2.9 3.3-3.3c.4.9.7 1.9.7 3Z', f: 'currentColor' },
  ],
  book: [
    { d: 'M5 2.6h13.4A1.6 1.6 0 0 1 20 4.2v15.6a1.6 1.6 0 0 1-1.6 1.6H5Z', f: 'currentColor' },
    { d: 'M7 4.6v14.8h11V4.6Z', f: '#0b3a5c' },
    { d: 'M8.6 6.4h7.2v1.6H8.6Zm0 3.4h7.2v1.6H8.6Z', f: 'currentColor' },
  ],
  cart: [
    { d: 'M2.4 3.4h2.4l2.5 10.2a1.8 1.8 0 0 0 1.8 1.4h7.6a1.8 1.8 0 0 0 1.8-1.4L20.6 6H6.1', f: 'currentColor' },
    { d: 'M8.6 17.2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm7.6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z', f: 'currentColor' },
  ],
  clipboard: [
    { d: 'M8.8 1.8h6.4a1 1 0 0 1 1 1v1.4h2.2A1.4 1.4 0 0 1 19.8 5.6V20a1.4 1.4 0 0 1-1.4 1.4H5.6A1.4 1.4 0 0 1 4.2 20V5.6a1.4 1.4 0 0 1 1.4-1.4h2.2V2.8a1 1 0 0 1 1-1Z', f: 'currentColor' },
    { d: 'M6.6 6.6h10.8V19H6.6Z', f: '#0b3a5c' },
    { d: 'M9 9h6v1.8H9Zm0 3.6h6v1.8H9Zm0 3.6h4v1.8H9Z', f: 'currentColor' },
  ],
  core: [
    { d: 'M12 1.6A10.4 10.4 0 1 0 22.4 12h-3A7.4 7.4 0 1 1 12 4.6Z', f: 'currentColor' },
    { d: 'M12 7.4a4.6 4.6 0 1 0 4.6 4.6h-2.4A2.2 2.2 0 1 1 12 9.8Z', f: 'currentColor' },
    { d: 'M12 10.4A1.6 1.6 0 1 0 13.6 12h-1.6Z', f: 'currentColor' },
  ],
  wheel: [
    { d: 'M12 1.8A10.2 10.2 0 1 0 22.2 12 10.2 10.2 0 0 0 12 1.8Zm0 3.4a6.8 6.8 0 1 1 0 13.6 6.8 6.8 0 0 1 0-13.6Z', f: 'currentColor', s: 1 },
    { d: 'M11 4.6h2v7.4h-2Zm1 5.4 6.4 3.7-1 1.7L11 11.8Z', f: 'currentColor' },
    { d: 'M12 12A1.9 1.9 0 1 1 12 15.8 1.9 1.9 0 0 1 12 12Z', f: 'currentColor' },
  ],
  clock: [
    { d: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3.4a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2Z', f: 'currentColor', s: 1 },
    { d: 'M11 6.6h2V12l3.8 2.2-1 1.7L11 13.3Z', f: 'currentColor' },
  ],
  anchor: [
    { d: 'M12 1.8a3 3 0 0 1 1 5.8V9h4v2.4h-4v7.2c2.8-.5 4.9-2.2 5.6-4.6h2.4c-.8 4.2-4.8 7.2-9 7.2s-8.2-3-9-7.2h2.4c.7 2.4 2.8 4.1 5.6 4.6V11.4H7V9h4V7.6a3 3 0 0 1 1-5.8Zm0 2.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z', f: 'currentColor' },
  ],
  chest: [
    { d: 'M2.8 10.4a4.6 4.6 0 0 1 4.6-4.6h9.2a4.6 4.6 0 0 1 4.6 4.6v1.4H2.8Z', f: '#b97d3a' },
    { d: 'M2.8 13.4h18.4V20H2.8Z', f: '#d8a355' },
    { d: 'M10.6 11h2.8v5h-2.8Z', f: C.gold },
    { d: 'M11.3 13h1.4v2.2h-1.4Z', f: C.ink },
  ],
};

export function icon(name, size = 18, cls = '') {
  const paths = P[name];
  if (!paths) return '';
  const body = paths.map(p => `<path d="${p.d}" fill="${p.f || 'currentColor'}"${p.s ? ' fill-rule="evenodd"' : ''}/>`).join('');
  return `<svg class="ic-s ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;
}

export function drawIcon(ctx, name, x, y, size = 20) {
  const paths = P[name];
  if (!paths) return;
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(size / 24, size / 24);
  for (const p of paths) {
    const path = new Path2D(p.d);
    ctx.fillStyle = p.f || '#ffffff';
    if (p.s) ctx.fill(path, 'evenodd'); else ctx.fill(path);
  }
  ctx.restore();
}
