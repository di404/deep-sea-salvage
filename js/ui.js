// ui.js — HUD, panels, popups, tutorial (DOM-based UI)
import { $, fmt, fmtDur, now, getState, writeSave, L, getLang, setLang, SFX, defaultState } from './core.js';
import { UPGRADES, costOf, ZONES, CREATURES, CMAP, RARITY_NAME, SKINS, SKIN_BY, getMods, activeBuffs, BUFFS, coresFor, PRESTIGE_ZONE, LAB, RESEARCH, SIGNIN, WHEEL, GACHA_R } from './data.js';
import { G, resetWorld, addCoins, incomePerMin, chestDue, chestOpened, bus, setL as gameSetL } from './game.js';
import { drawCreature } from './scene.js';
import { icon, drawIcon } from './icons.js';
import * as meta from './meta.js';
import { requestAd, SDK, adUsesLeft } from './ads.js';

const SKIN_PRICE = { deep_blue: 60, lava: 120, neon: 160, ghost: 240, gold: 320, royal: 480, prism: 640 };
let panelOpen = null;

// ---------- helpers ----------
function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }
function refreshBuffs() {
  const box = $('#buff-chips'); if (!box) return;
  const st = getState();
  box.innerHTML = '';
  for (const b of activeBuffs(st)) {
    const def = BUFFS[b.id]; if (!def) continue;
    const left = Math.max(0, (b.until - now()) / 1000);
    const chip = el(`<span class="buff-chip">${icon(def.ic, 13)} ${fmtTimeShort(left)}</span>`);
    box.appendChild(chip);
  }
  if (chestDue()) {
    const btn = el(`<button class="buff-chip" style="border-color:var(--gold);color:var(--gold)">${icon('chest', 13)} ${L('openChest')}</button>`);
    btn.onclick = openChest;
    box.appendChild(btn);
  }
}
function fmtTimeShort(s) {
  s = Math.ceil(s);
  if (s >= 3600) return Math.floor(s / 3600) + 'h' + Math.floor(s % 3600 / 60) + 'm';
  if (s >= 60) return Math.floor(s / 60) + 'm' + (s % 60) + 's';
  return s + 's';
}

// ---------- nav dots ----------
export function refreshDots() {
  const st = getState(), mods = getMods(st);
  const dots = { upgrades: false, book: false, shop: false, tasks: false, prestige: false };
  dots.upgrades = UPGRADES.some(u => st.zone >= u.zone && (st.upgrades[u.id] || 0) < u.max && st.coins >= costOf(u, st.upgrades[u.id] || 0));
  const nextZ = ZONES[st.zone + 1];
  if (nextZ && st.coins >= nextZ.cost) dots.upgrades = true;
  dots.shop = (st.wheel.free > 0 || chestDue());
  dots.tasks = (st.tasks.list || []).some(t => t.prog >= t.goal && !t.claimed);
  dots.book = CREATURES.some(c => c.zone <= st.zone && !st.book[c.id]) && st.lifetime.catches > 0;
  const pi = meta.prestigeInfo();
  dots.prestige = pi.can || (pi.labOpen && LAB.some(l => (st.lab[l.id] || 0) < l.max && st.cores >= l.cost((st.lab[l.id] || 0))));
  for (const k of Object.keys(dots)) {
    const b = document.querySelector(`.nav-btn[data-panel="${k}"] .dot`);
    if (b) b.classList.toggle('hidden', !dots[k]);
  }
  // contract / side buttons
  const bc = $('#btn-contract');
  if (bc) bc.classList.toggle('hidden', !meta.contractAvailable());
  const chip = $('#contract-chip');
  if (chip) chip.classList.toggle('hidden', !meta.contract.active);
  document.querySelectorAll('[data-icon]').forEach(n => { n.innerHTML = icon(n.dataset.icon, n.dataset.size || 20); });
  refreshBuffs();
}

// ---------- panel system ----------
export function openPanel(name) {
  panelOpen = name;
  markNav(name);
  $('#panel').classList.remove('hidden');
  $('#panel-title').textContent = { upgrades: L('up'), book: L('book'), shop: L('shop'), tasks: L('tasks'), prestige: L('core') }[name] || name;
  renderPanel();
  SFX.click();
}
export function closePanel() { panelOpen = null; markNav(null); $('#panel').classList.add('hidden'); }
export function panelIsOpen() { return panelOpen; }
export function reRenderPanel() { if (panelOpen) renderPanel(); }

function renderPanel() {
  const body = $('#panel-body');
  body.innerHTML = '';
  if (panelOpen === 'upgrades') renderUpgrades(body);
  else if (panelOpen === 'book') renderBook(body);
  else if (panelOpen === 'shop') renderShop(body);
  else if (panelOpen === 'tasks') renderTasks(body);
  else if (panelOpen === 'prestige') renderPrestige(body);
}

// ---------- upgrades ----------
function renderUpgrades(body) {
  const st = getState(), mods = getMods(st);
  const nextZ = ZONES[st.zone + 1];
  if (nextZ) {
    const can = st.coins >= nextZ.cost;
    const zh = getLang() === 'zh';
    const row = el(`<div class="row" style="border-color:var(--gold)">
      <div class="grow"><h4>${zh ? nextZ.nZ : nextZ.nE}</h4>
      <div class="sub">${zh ? nextZ.mechE : nextZ.mechE} · ${nextZ.depth[0]}m+</div></div>
      <button class="btn gold ${can ? '' : 'gray'}" ${can ? '' : 'disabled'}>${icon('coin', 13)} ${fmt(nextZ.cost)}</button></div>`);
    row.querySelector('button').onclick = () => {
      if (st.coins < nextZ.cost) return;
      st.coins -= nextZ.cost; st.zone++;
      resetWorld();
      SFX.fanfare(); SDK.happytime();
      zoneBanner(st.zone);
      bus.emit('zone');
      if (st.tutorial === 2) { st.tutorial = 3; hideTut(); }
      renderPanel(); refreshDots(); writeSave();
    };
    body.appendChild(row);
  }
  const zh = getLang() === 'zh';
  body.appendChild(el(`<div class="sect">${zh ? '装备' : 'EQUIPMENT'}</div>`));
  const list = UPGRADES.filter(u => st.zone >= u.zone);
  for (const u of list) {
    const lv = st.upgrades[u.id] || 0;
    const maxed = lv >= u.max;
    const cost = maxed ? 0 : costOf(u, lv);
    const can = !maxed && st.coins >= cost;
    const row = el(`<div class="row up-row ${maxed ? 'maxed' : ''}">
      <div class="grow"><h4>${zh ? u.nZ : u.nE}<span class="lv">Lv.${lv}${maxed ? '' : '→' + (lv + 1)}/${u.max}</span></h4>
      <div class="sub">${zh ? u.dZ : u.dE}: <span class="eff">${u.eff(lv)}${maxed ? '' : ' → ' + u.eff(lv + 1)}</span></div></div>
      <button class="btn ${can ? 'gold' : 'gray'}" ${can ? '' : 'disabled'}>${maxed ? L('maxed') : icon('coin', 13) + ' ' + fmt(cost)}</button></div>`);
    if (!maxed) row.querySelector('button').onclick = () => buyUpgrade(u.id);
    body.appendChild(row);
  }
  const locked = UPGRADES.filter(u => st.zone < u.zone);
  if (locked.length) {
    body.appendChild(el(`<div class="sub" style="text-align:center;padding:8px;color:var(--tx2);font-size:12px">${L('moreAt')} ${locked[0].zone + 1} ${zh ? '区' : 'zone'}</div>`));
  }
  // research section
  if (st.zone >= 3) {
    body.appendChild(el(`<div class="sect">${L('research')}</div>`));
    const rs = meta.researchState();
    if (rs.justFinished) { /* handled by toast */ }
    if (rs.active) {
      const left = (rs.endsAt - now()) / 1000;
      const row = el(`<div class="row"><div class="grow"><h4>${BUFFS[rs.active.buff].em} ${getLang() === 'zh' ? rs.active.nZ : rs.active.nE}</h4>
        <div class="sub">${L('researching')} ${fmtTimeShort(left)}</div></div>
        <button class="btn gem ad">${L('finishNow')}</button></div>`);
      row.querySelector('button').onclick = async () => {
        if (await requestAd('scanner_skip')) { meta.researchSkip(); SFX.gem(); reRenderPanel(); }
      };
      body.appendChild(row);
    } else {
      const row = el(`<div class="row"><div class="grow"><h4>${icon('flask', 15)} ${L('research')}</h4><div class="sub">${zh ? '开始一项限时研究获得增益' : 'Start a timed research for buffs'}</div></div><button class="btn">${L('contractGo')}</button></div>`);
      row.querySelector('button').onclick = () => { openResearch(); };
      body.appendChild(row);
    }
  }
}
function buyUpgrade(id) {
  const st = getState();
  const u = UPGRADES.find(x => x.id === id);
  const lv = st.upgrades[id] || 0;
  if (lv >= u.max) return;
  const cost = costOf(u, lv);
  if (st.coins < cost) return;
  st.coins -= cost;
  st.upgrades[id] = lv + 1;
  SFX.upgrade();
  bus.emit('upgrade', id);
  if (st.tutorial === 1) { st.tutorial = 2; showTut(2); }
  refreshDots(); reRenderPanel(); writeSave();
}
export function zoneBanner(z) {
  const b = $('#zone-banner');
  const zh = getLang() === 'zh';
  const zone = ZONES[z];
  b.innerHTML = `<b>${zh ? zone.nZ : zone.nE}</b><span>${L('zoneUnlocked')} ${zone.mechE}</span>`;
  b.classList.remove('hidden');
  setTimeout(() => b.classList.add('hidden'), 3000);
}

// ---------- book ----------
let bookTab = 0;
function renderBook(body) {
  const st = getState();
  const zh = getLang() === 'zh';
  const tabs = el(`<div class="tabs"></div>`);
  for (let z = 0; z <= st.zone; z++) {
    const t = el(`<button class="tab ${z === bookTab ? 'on' : ''}">${z + 1}. ${zh ? ZONES[z].nZ : ZONES[z].nE}</button>`);
    t.onclick = () => { bookTab = z; renderPanel(); SFX.click(); };
    tabs.appendChild(t);
  }
  body.appendChild(tabs);
  const list = CREATURES.filter(c => c.zone === bookTab);
  const gotN = list.filter(c => st.book[c.id]).length;
  body.appendChild(el(`<div class="book-bonus">${L('zoneBonus')}: ${gotN}/${list.length} ${gotN === list.length ? ' · +5% ' + L('value') : ''}</div>`));
  const grid = el(`<div class="book-grid"></div>`);
  for (const cdef of list) {
    const got = st.book[cdef.id];
    const slot = el(`<div class="slot ${got ? 'got' : 'locked'} ${cdef.r >= 2 ? 'r' + cdef.r : ''}">
      <span class="rd">${icon('star', 9).repeat(cdef.r)}</span></div>`);
    const cv = document.createElement('canvas');
    cv.width = 108; cv.height = 88;
    drawCreature(cv.getContext('2d'), cdef, 54, 40, 1.2, { scale: .8, dir: 1 });
    slot.insertBefore(cv, slot.firstChild);
    slot.appendChild(el(`<div class="nm">${got ? (zh ? cdef.nZ : cdef.nE) : L('missing')}</div>`));
    slot.appendChild(el(`<div class="val">${got ? icon('coin', 10) + fmt(cdef.v) + ' ×' + st.book[cdef.id] : '???'}</div>`));
    grid.appendChild(slot);
  }
  body.appendChild(grid);
}

// ---------- shop ----------
function renderShop(body) {
  const st = getState(), zh = getLang() === 'zh';
  const hero = el(`<div class="shop-hero">
    <h3>${L('freeGems')}</h3>
    <p>${zh ? '宝石是高级货币：开蛋、加速、皮肤' : 'Gems are the premium currency: eggs, speed-ups, skins'}</p>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap">
      <button class="btn gem ad" id="sh-gems">${L('adGems')} ${icon('gem', 13)} ${icon('gem', 13)}${adUsesLeft('free_gems') !== Infinity ? ' (' + adUsesLeft('free_gems') + ')' : ''}</button>
      <button class="btn green ad" id="sh-buff">${icon('bolt', 13)} 2× 4h ${adUsesLeft('buff_2x') !== Infinity ? '(' + adUsesLeft('buff_2x') + ')' : ''}</button>
    </div></div>`);
  hero.querySelector('#sh-gems').onclick = async () => {
    if (await requestAd('free_gems')) {
      const mods = getMods(st);
      const g = Math.round(15 * mods.gemMult);
      st.gems += g; SFX.gem();
      floatToast(`${icon('gem', 16)} +${g}`, '#6ee7ff');
      renderPanel(); refreshDots(); writeSave();
    }
  };
  hero.querySelector('#sh-buff').onclick = async () => {
    if (await requestAd('buff_2x')) {
      meta.addBuff('x2', 240);
      SFX.upgrade(); floatToast(`${icon('bolt', 16)} 2× 4h`);
      renderPanel(); refreshDots(); writeSave();
    }
  };
  body.appendChild(hero);
  // wheel + gacha entries
  const row = el(`<div class="row"><div class="grow"><h4>${icon('wheel', 16)} ${L('wheel')}</h4><div class="sub">${L('freeSpins')}: ${st.wheel.free}</div></div><button class="btn gold">${L('spin')}</button></div>`);
  row.querySelector('button').onclick = () => openWheel();
  body.appendChild(row);
  const g = meta.gachaState();
  const row2 = el(`<div class="row"><div class="grow"><h4>${icon('egg', 16)} ${L('gacha')}</h4><div class="sub">${L('pityNote')} · ${icon('egg', 12)} ×${g.tickets}</div></div><button class="btn gem">${L('open1')}</button></div>`);
  row2.querySelector('button').onclick = () => openGacha();
  body.appendChild(row2);

  body.appendChild(el(`<div class="sect">${L('skins')}</div>`));
  const grid = el(`<div class="skin-grid"></div>`);
  for (const s of SKINS) {
    const owned = st.skins.includes(s.id);
    const on = st.skin === s.id;
    const price = SKIN_PRICE[s.id];
    const cell = el(`<div class="skin-cell ${owned ? 'owned' : ''} ${on ? 'on' : ''}">
      <span class="tag">${s.bonus > 0 ? '+' + s.bonus + '%' : ''}</span></div>`);
    const cv = document.createElement('canvas');
    cv.width = 120; cv.height = 60;
    const cc = cv.getContext('2d');
    const hue = s.id === 'prism' ? (Date.now() / 30) % 360 : s.hue;
    cc.save(); cc.translate(60, 32);
    // mini claw preview
    cc.fillStyle = `hsl(${hue},55%,58%)`;
    cc.strokeStyle = `hsl(${hue},50%,32%)`;
    cc.beginPath(); cc.roundRect(-14, -8, 28, 15, 4); cc.fill(); cc.stroke();
    for (const sd of [-1, 1]) {
      cc.save(); cc.scale(sd, 1); cc.rotate(sd * .4);
      cc.beginPath(); cc.moveTo(6, -5); cc.quadraticCurveTo(24, 2, 20, 16); cc.quadraticCurveTo(14, 6, 5, 4); cc.closePath();
      cc.fillStyle = `hsl(${hue},55%,62%)`; cc.fill(); cc.stroke();
      cc.restore();
    }
    cc.restore();
    cell.insertBefore(cv, cell.firstChild);
    cell.appendChild(el(`<div class="nm">${owned ? (zh ? s.nZ : s.nE) : (st.lifetime.catches > 2 ? (zh ? s.nZ : s.nE) : '???')}</div>`));
    if (on) cell.appendChild(el(`<div class="tag">${L('equipped')}</div>`));
    else if (owned) { const b = el(`<button class="btn gray" style="padding:4px 10px;font-size:11px">${L('equip')}</button>`); b.onclick = () => { st.skin = s.id; SFX.click(); renderPanel(); writeSave(); }; cell.appendChild(b); }
    else {
      const b = el(`<button class="btn gem" style="padding:4px 10px;font-size:11px">${icon('gem', 12)} ${price}</button>`);
      b.onclick = () => {
        if (st.gems >= price) { st.gems -= price; st.skins.push(s.id); SFX.fanfare(); renderPanel(); refreshDots(); writeSave(); }
        else floatToast(`${icon('gem', 14)} ${L('need')} ${fmt(price - st.gems)}`, '#6ee7ff');
      };
      cell.appendChild(b);
    }
    grid.appendChild(cell);
  }
  body.appendChild(grid);
}

// ---------- tasks ----------
function renderTasks(body) {
  const st = getState(), zh = getLang() === 'zh';
  body.appendChild(el(`<div class="sub" style="color:var(--tx2);font-size:12px;margin-bottom:8px">${zh ? '每天 3 个悬赏 · 零点刷新' : '3 jobs daily · resets at midnight'}</div>`));
  for (const t of st.tasks.list || []) {
    const def = TASK(t.id);
    if (!def) continue;
    const done = t.prog >= t.goal;
    const row = el(`<div class="row ${done ? 'task-done' : ''}">
      <div class="grow"><h4>${(zh ? def.nZ : def.nE).replace('{0}', fmt(t.goal))}</h4>
      <div class="task-bar"><i style="width:${Math.min(100, t.prog / t.goal * 100)}%"></i></div>
      <div class="sub">${fmt(Math.min(t.prog, t.goal))} / ${fmt(t.goal)}</div></div>
      <button class="btn ${done && !t.claimed ? 'green' : 'gray'}" ${done && !t.claimed ? '' : 'disabled'}>${icon('gem', 12)} ${t.gem}</button></div>`);
    row.querySelector('button').onclick = () => {
      if (t.prog >= t.goal && !t.claimed) {
        t.claimed = true; st.gems += t.gem;
        SFX.gem(); floatToast(`${icon('gem', 16)} +${t.gem}`, '#6ee7ff');
        renderPanel(); refreshDots(); writeSave();
      }
    };
    body.appendChild(row);
  }
}
import { TASK_POOL } from './data.js';
function TASK(id) { return TASK_POOL.find(t => t.id === id); }

// ---------- prestige ----------
function renderPrestige(body) {
  const st = getState(), zh = getLang() === 'zh';
  const pi = meta.prestigeInfo();
  body.appendChild(el(`<div class="sect">${L('cores')}</div>`));
  body.appendChild(el(`<div class="core-big">${icon('core', 26)} ${st.cores}</div>`));
  body.appendChild(el(`<div class="m-sub" style="text-align:center;color:var(--tx2);font-size:12px;margin-bottom:10px">${L('coreEffect')} · ${L('bookBonus')} +${Math.round(getMods(st).bookBonus * 100)}%</div>`));
  if (!pi.labOpen) {
    const can = pi.zoneOk && pi.cores > 0;
    body.appendChild(el(`<div class="row"><div class="grow"><h4>${icon('core', 16)} ${L('prestige')}</h4>
      <div class="sub">${L('prestigeWarn')}</div>
      <div class="sub">${L('cores')} +${pi.cores}</div></div>
      <button class="btn ${can ? 'gold' : 'gray'}" ${can ? '' : 'disabled'}>${L('prestige')}</button></div>`));
    body.querySelectorAll('.btn.gold,.btn.gray').forEach(b => {
      if (b.textContent.includes(L('prestige')) && can) b.onclick = openPrestigeConfirm;
    });
  } else {
    const row = el(`<div class="row"><div class="grow"><h4>${icon('core', 16)} ${L('prestige')}</h4><div class="sub">${L('cores')} +${pi.cores} · ${zh ? '已跃迁' : 'dives'} ×${st.prestiges}</div></div>
      <button class="btn ${pi.can ? 'gold' : 'gray'}" ${pi.can ? '' : 'disabled'}>${L('prestige')}</button></div>`);
    row.querySelector('button').onclick = () => { if (pi.can) openPrestigeConfirm(); };
    body.appendChild(row);
    body.appendChild(el(`<div class="sect">${L('lab')}</div>`));
    const grid = el(`<div class="lab-grid"></div>`);
    for (const l of LAB) {
      const lv = st.lab[l.id] || 0;
      const maxed = lv >= l.max;
      const cost = maxed ? 0 : l.cost(lv);
      const can = !maxed && st.cores >= cost;
      const cell = el(`<div class="lab-cell"><h5>${zh ? l.nZ : l.nE} <span style="color:var(--tx2)">${lv}/${l.max}</span></h5>
        <div class="sub">${(zh ? l.dZ : l.dE).replace('{0}', lv)}</div>
        <button class="btn ${can ? 'gem' : 'gray'}" style="margin-top:6px;padding:4px 10px;font-size:11px" ${can ? '' : 'disabled'}>${icon('core', 12)} ${maxed ? L('maxed') : cost}</button></div>`);
      if (!maxed) cell.querySelector('button').onclick = () => { if (meta.labBuy(l.id)) { SFX.upgrade(); renderPanel(); refreshDots(); writeSave(); } };
      grid.appendChild(cell);
    }
    body.appendChild(grid);
  }
}
function openPrestigeConfirm() {
  const zh = getLang() === 'zh';
  const pi = meta.prestigeInfo();
  showModal(`<h3>${icon('core', 20)} ${L('prestige')}</h3>
    <div class="m-sub">${L('prestigeConfirm')}</div>
    <div class="big-reward">+${pi.cores} ${icon('core', 18)}</div>
    <div class="btns"><button class="btn gold" id="pm-yes">${L('yes')}</button><button class="btn gray" id="pm-no">${L('no')}</button></div>`,
    async m => {
      m.querySelector('#pm-yes').onclick = async () => {
        if (await meta.doPrestige()) { closeModal(); closePanel(); SFX.fanfare(); zoneBanner(getState().zone); refreshDots(); }
      };
      m.querySelector('#pm-no').onclick = closeModal;
    });
}

// ---------- modal (all modals are closable: X button + mask click) ----------
let modalEl = null, modalLock = false;
export function showModal(html, setup) {
  closeModal();
  modalEl = el(`<div class="modal-mask"><div class="modal"><button class="m-x" aria-label="close">${icon('x', 15)}</button>${html}</div></div>`);
  $('#modal-root').appendChild(modalEl);
  modalEl.querySelector('.m-x').onclick = () => { if (!modalLock) closeModal(); };
  modalEl.addEventListener('click', e => { if (e.target === modalEl && !modalLock) closeModal(); });
  setup && setup(modalEl.querySelector('.modal'));
  return modalEl.querySelector('.modal');
}
export function closeModal() { if (modalEl) { modalEl.remove(); modalEl = null; } modalLock = false; }

// ---------- offline popup ----------
export function openOffline(res) {
  const zh = getLang() === 'zh';
  showModal(`<h3>${icon('anchor', 20)} ${L('offlineTitle')}</h3>
    <div class="m-sub">${L('offlineEarned')} (${fmtDur(res.away * 1000)}${res.capped ? (zh ? ' · 已达上限' : ' · capped') : ''})</div>
    <div class="big-reward">${icon('coin', 20)} ${fmt(res.coins)}</div>
    <div class="btns">
      <button class="btn green ad" id="of-x2">${L('x2Button')}</button>
      <button class="btn gray" id="of-col">${L('collect')}</button>
    </div>`,
    m => {
      m.querySelector('#of-x2').onclick = async () => {
        if (await requestAd('offline_x2')) { addCoins(res.coins * 2); floatToast(`${icon('coin', 16)} +${fmt(res.coins * 2)}`); SFX.coin(4); closeModal(); refreshDots(); writeSave(); }
      };
      m.querySelector('#of-col').onclick = () => { addCoins(res.coins); floatToast(`${icon('coin', 16)} +${fmt(res.coins)}`); SFX.coin(2); closeModal(); refreshDots(); writeSave(); };
    });
}

// ---------- wheel ----------
let wheelRot = 0, spinning = false;
export function openWheel() {
  const zh = getLang() === 'zh';
  const ws = meta.wheelState();
  showModal(`<h3>${icon('wheel', 20)} ${L('wheel')}</h3>
    <div class="wheel-wrap"><span class="wheel-ptr"></span><canvas id="wheel-cv" width="560" height="560"></canvas>
    <div class="wheel-center">${icon('core', 22)}</div></div>
    <div class="center spin-count">${L('freeSpins')}: <b id="wl-free">${ws.free}</b></div>
    <div class="btns">
      <button class="btn gold" id="wl-spin">${L('spin')}</button>
      <button class="btn green ad" id="wl-ad">${L('watchMore')}</button>
    </div>
    <div class="note">${L('alreadyToday')}</div>`,
    mm => {
      drawWheel(mm.querySelector('#wheel-cv'), wheelRot);
      mm.querySelector('#wl-spin').onclick = () => doSpin(false, mm);
      mm.querySelector('#wl-ad').onclick = async () => {
        if (await requestAd('wheel_extra')) { doSpin(true, mm); }
      };
      updateWheelBtns(mm);
    });
}
function updateWheelBtns(mm) {
  const st = getState();
  mm.querySelector('#wl-free').textContent = st.wheel.free;
  mm.querySelector('#wl-spin').disabled = st.wheel.free <= 0;
  mm.querySelector('#wl-spin').classList.toggle('gray', st.wheel.free <= 0);
}
function drawWheel(cv, rot) {
  const c = cv.getContext('2d');
  const R = 270, cx = 280, cy = 280;
  c.clearRect(0, 0, 560, 560);
  c.save(); c.translate(cx, cy); c.rotate(rot);
  WHEEL.forEach((s, i) => {
    const a0 = i * Math.PI * 2 / 8 - Math.PI / 2 - Math.PI / 8;
    const a1 = a0 + Math.PI * 2 / 8;
    c.fillStyle = `hsl(${i * 42},72%,${i % 2 ? 55 : 45}%)`;
    c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, a0, a1); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; c.stroke();
    c.save();
    c.rotate(a0 + Math.PI / 8);
    c.translate(R * .66, 0); c.rotate(Math.PI / 2);
    drawIcon(c, s.ic, 0, 0, 58);
    c.restore();
  });
  c.restore();
  // rim + bulbs
  c.strokeStyle = '#ffd257'; c.lineWidth = 10;
  c.beginPath(); c.arc(cx, cy, R - 2, 0, 7); c.stroke();
  c.fillStyle = '#fff2c8';
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    c.beginPath(); c.arc(cx + Math.cos(a) * (R - 2), cy + Math.sin(a) * (R - 2), 5, 0, 7); c.fill();
  }
}
function doSpin(useAd, mm) {
  if (spinning) return;
  const res = meta.wheelSpin(useAd);
  if (!res) return;
  spinning = true; modalLock = true;
  SFX.click();
  const target = -res.idx * (Math.PI * 2 / 8) + (Math.random() - .5) * .4;
  const start = wheelRot;
  const total = start + Math.PI * 6 + ((target - start) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const cv = mm.querySelector('#wheel-cv');
  const t0 = performance.now(), dur = 3200;
  let lastTick = 0;
  const iv = setInterval(() => {
    if (!document.body.contains(cv)) { clearInterval(iv); spinning = false; modalLock = false; return; }
    const p = Math.min(1, (performance.now() - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    wheelRot = start + (total - start) * e;
    drawWheel(cv, wheelRot);
    if (performance.now() - lastTick > 120 - p * 80) { lastTick = performance.now(); if (p < .98) SFX.tick(); }
    if (p >= 1) {
      clearInterval(iv);
      spinning = false; modalLock = false;
      const got = meta.grantReward(res.seg, 'wheel');
      const em = res.seg.kind === 'gems' ? icon('gem', 18) : res.seg.kind === 'egg' ? icon('egg', 18) : res.seg.kind === 'buff' ? icon('bolt', 18) : icon('coin', 18);
      floatToast(got.text);
      SFX.coin(3);
      updateWheelBtns(mm); refreshDots(); writeSave();
    }
  }, 16);
}

// ---------- gacha ----------
export function openGacha() {
  const zh = getLang() === 'zh';
  const g = meta.gachaState();
  showModal(`<h3>${icon('egg', 20)} ${L('gacha')}</h3>
    <div class="m-sub">${L('pityNote')} · ${zh ? '已有蛋票' : 'tickets'}: ${g.tickets} · ${icon('gem', 13)} ${g.gems}</div>
    <div class="btns">
      <button class="btn gem" id="ga-1">${L('open1')} ${icon('gem', 12)}</button>
      <button class="btn gem" id="ga-10">${L('open10')} ${icon('gem', 12)}</button>
      ${g.tickets > 0 ? `<button class="btn green" id="ga-t">${icon('egg', 13)} ${zh ? '用蛋票开 1 个' : 'Open 1 with ticket'}</button>` : ''}
      <button class="btn gray" id="ga-x">${L('close')}</button>
    </div>`,
    m => {
      m.querySelector('#ga-1').onclick = () => pull(1, false, m);
      m.querySelector('#ga-10').onclick = () => pull(10, false, m);
      const t = m.querySelector('#ga-t');
      if (t) t.onclick = () => pull(1, true, m);
      m.querySelector('#ga-x').onclick = closeModal;
    });
}
function pull(n, ticket, m) {
  const res = meta.gachaPull(n, ticket);
  if (!res) { floatToast(`${icon('gem', 14)} ${L('need')}`, '#6ee7ff'); return; }
  SFX.pop();
  const zh = getLang() === 'zh';
  const cards = res.map((r, i) => {
    const em = r.type === 'skin' || r.type === 'dup' ? icon('wrench', 26) : r.type === 'gems' ? icon('gem', 26) : r.type === 'buff' ? icon('bolt', 26) : r.type === 'coins' ? icon('coin', 26) : icon('egg', 26);
    return `<div class="gcard r${r.r + 1}" style="animation-delay:${i * .08}s"><span class="em">${em}</span>${r.text}</div>`;
  }).join('');
  showModal(`<h3>${icon('egg', 20)} ${L('gacha')}</h3>
    <div class="gacha-cards">${cards}</div>
    <div class="note">${L('dupConv')}</div>
    <div class="btns"><button class="btn gold" id="ga-again">${n === 10 ? L('open10') : L('open1')}</button>
    <button class="btn gray" id="ga-back">${L('close')}</button></div>`,
    mm => {
      mm.querySelector('#ga-again').onclick = () => { pull(n, false, mm); };
      mm.querySelector('#ga-back').onclick = () => { closeModal(); reRenderPanel(); };
      if (res.some(r => r.r >= 3)) SFX.fanfare(); else SFX.gem();
      refreshDots(); writeSave();
    });
}

// ---------- research options ----------
export function openResearch() {
  const zh = getLang() === 'zh';
  const opts = meta.researchOptions();
  showModal(`<h3>${icon('flask', 20)} ${L('research')}</h3><div class="m-sub">${zh ? '选择一项研究，完成后获得限时增益' : 'Pick one research; finish it for a timed buff'}</div>
    <div class="btns">${opts.map((o, i) => `<button class="btn ${i ? 'gem' : 'gold'}" data-r="${o.id}">${icon(BUFFS[o.buff].ic, 14)} ${zh ? o.nZ : o.nE} · ${o.min}min (${Math.ceil(o.time / 60)}min)</button>`).join('')}
    <button class="btn gray" id="rs-x">${L('close')}</button></div>`,
    m => {
      m.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
        const ms = meta.researchStart(b.dataset.r);
        closeModal();
        floatToast(`${icon('flask', 16)} ${fmtDur(ms)}`);
        SFX.click(); reRenderPanel(); writeSave();
      });
      m.querySelector('#rs-x').onclick = closeModal;
    });
}

// ---------- chest ----------
export async function openChest() {
  if (!chestDue()) return;
  const st = getState();
  if (await requestAd('offline_x2')) {
    const mods = getMods(st);
    const g = Math.round((10 + Math.random() * 20) * mods.gemMult);
    st.gems += g;
    chestOpened();
    floatToast(`${icon('chest', 16)} +${g}`, '#6ee7ff');
    SFX.gem(); refreshDots(); writeSave();
  }
}

// ---------- signin ----------
export function openSignin() {
  const s = meta.signinState();
  const zh = getLang() === 'zh';
  const cells = SIGNIN.map((rw, i) => {
    const done = i < s.idx || (i === s.idx && s.claimedToday);
    const today = i === s.idx && !s.claimedToday;
    return `<div class="sign-cell ${done ? 'done' : ''} ${today ? 'today' : ''} ${i === 6 ? 'big' : ''}">
      <div class="d">${L('day')} ${i + 1}</div><div class="em">${icon(rw.ic, 22)}</div>
      <div class="d">${rw.kind === 'coins' ? icon('coin', 10) + rw.min + 'm' : rw.kind === 'gems' ? rw.n : rw.kind === 'buff' ? rw.min + 'min' : rw.kind === 'egg' ? '×' + rw.n : 'BIG'}</div></div>`;
  }).join('');
  showModal(`<h3>${icon('gift', 20)} ${L('signin')}</h3>
    <div class="sign-grid">${cells}</div>
    <div class="btns">
      ${!s.claimedToday ? `<button class="btn gold" id="si-claim">${L('claim')}</button>` : `<button class="btn gray" disabled>${L('done')}</button>`}
      ${s.canMakeup && !s.claimedToday ? `<button class="btn green ad" id="si-makeup">${L('makeup')}</button>` : ''}
    </div>`,
    m => {
      const c = m.querySelector('#si-claim');
      if (c) c.onclick = () => {
        const got = meta.signinClaim(false);
        if (got) { floatToast(got.got.text); SFX.fanfare(); closeModal(); refreshDots(); writeSave(); }
      };
      const mk = m.querySelector('#si-makeup');
      if (mk) mk.onclick = async () => {
        if (await requestAd('signin_makeup')) {
          const got = meta.signinClaim(true);
          if (got) { floatToast(got.got.text); SFX.fanfare(); }
          closeModal(); openSignin();
        }
      };
    });
}

// ---------- settings ----------
export function openSettings() {
  const st = getState(), zh = getLang() === 'zh';
  showModal(`<h3>${icon('gear', 20)} ${L('settings')}</h3>
    <div class="set-row"><span>${L('sound')}</span><button class="tgl ${st.settings.sfx ? 'on' : ''}" id="se-sfx"></button></div>
    <div class="set-row"><span>${L('music')}</span><button class="tgl ${st.settings.music ? 'on' : ''}" id="se-mus"></button></div>
    <div class="set-row"><span>${L('language')}</span><button class="btn gray" id="se-lang" style="padding:5px 14px">${getLang() === 'zh' ? '中文 → EN' : 'EN → 中文'}</button></div>
    <div class="set-row"><span>${L('resetSave')}</span><button class="btn gray" id="se-reset" style="padding:5px 14px">${zh ? '重置' : 'Reset'}</button></div>
    <div class="note">Deep Salvage Inc. v1.0 · made for CrazyGames</div>
    <div class="btns"><button class="btn" id="se-x">${L('close')}</button></div>`,
    m => {
      m.querySelector('#se-sfx').onclick = e => { st.settings.sfx = !st.settings.sfx; SFX.enabled = st.settings.sfx; e.target.classList.toggle('on'); writeSave(); };
      m.querySelector('#se-mus').onclick = e => { st.settings.music = !st.settings.music; SFX.music = st.settings.music; st.settings.music ? SFX.startMusic() : SFX.stopMusic(); e.target.classList.toggle('on'); writeSave(); };
      m.querySelector('#se-lang').onclick = () => { setLang(getLang() === 'zh' ? 'en' : 'zh'); st.settings.lang = getLang(); writeSave(); closeModal(); openSettings(); };
      m.querySelector('#se-reset').onclick = () => {
        showModal(`<h3>${icon('x', 18)}</h3><div class="m-sub">${L('resetConfirm')}</div>
          <div class="btns"><button class="btn gold" id="rs-y">${L('yes')}</button><button class="btn gray" id="rs-n">${L('no')}</button></div>`,
          mm => {
            mm.querySelector('#rs-y').onclick = () => { localStorage.removeItem('deepsalvage_v1'); location.reload(); };
            mm.querySelector('#rs-n').onclick = closeModal;
          });
      };
      m.querySelector('#se-x').onclick = closeModal;
    });
}

// ---------- tutorial ----------
export function showTut(step) {
  const tip = $('#tut-tip');
  const st = getState();
  const msg = step === 0 ? L('tapToDrop') : step === 1 ? L('sellFish') : step === 2 ? L('goDeeper') : null;
  if (!msg) { tip.classList.add('hidden'); return; }
  tip.textContent = msg;
  tip.classList.remove('hidden');
  st.tutorial = Math.max(st.tutorial, step);
}
export function hideTut() { $('#tut-tip').classList.add('hidden'); }

// ---------- toast (accepts inline SVG) ----------
export function floatToast(html, color = '#ffd257') {
  const layer = document.getElementById('fx-layer');
  if (!layer) return;
  const el2 = document.createElement('div');
  el2.className = 'ftext';
  el2.innerHTML = html;
  el2.style.cssText = `left:50%;top:38%;transform:translateX(-50%);font-size:20px;color:${color};`;
  layer.appendChild(el2);
  setTimeout(() => el2.remove(), 1150);
}

// ---------- boot helpers ----------
export function initUIStrings() {
  gameSetL({
    surge: () => L('surge'), rush: () => L('rushHint'), mine: () => L('mine'), newSpecies: () => L('newSpecies'),
  });
}
export function bindNav() {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.onclick = () => openPanel(b.dataset.panel);
  });
  $('#panel-close').onclick = closePanel;
  $('#panel').addEventListener('click', e => { if (e.target.id === 'panel') closePanel(); });
  $('#btn-settings').onclick = openSettings;
  $('#btn-contract').onclick = () => {
    const c = meta.contractStart();
    if (c) SFX.pop();
  };
}
export function markNav(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('on', b.dataset.panel === name));
}

// contract chip refresh (called from main loop)
export function refreshContract() {
  const c = meta.contract.active;
  const chip = $('#contract-chip');
  if (!chip) return;
  if (!c) { chip.classList.add('hidden'); return; }
  chip.classList.remove('hidden');
  const left = Math.max(0, (c.endsAt - now()) / 1000);
  chip.querySelector('#contract-timer').textContent = fmtTimeShort(left);
  const def = CMAP[c.defId];
  chip.querySelector('#contract-goal').textContent = `${(getLang() === 'zh' ? def.nZ : def.nE)} ${c.prog}/${c.goal}`;
}
