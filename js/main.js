// main.js — boot, loop, input
import { $, getState, loadSave, writeSave, initLang, setLang, SFX, L, fmt } from './core.js';
import { SDK } from './ads.js';
import { G, resize, update, resetWorld, tryDrop, calcOffline, chestArmed, bus, incomePerMin } from './game.js';
import { render } from './scene.js';
import * as meta from './meta.js';
import { bindNav, initUIStrings, openOffline, openSignin, refreshDots, refreshContract, showTut, hideTut, zoneBanner, floatToast, reRenderPanel, panelIsOpen, openPanel } from './ui.js';

let last = 0, saveAcc = 0, dotAcc = 0, lastStepAt = 0;

function step(dt) {
  lastStepAt = performance.now();
  if (G.W !== window.innerWidth || G.H !== window.innerHeight) resize();

  update(dt);
  meta.contractTick();
  render($('#game').getContext('2d'), dt);

  saveAcc += dt;
  if (saveAcc > 15) { saveAcc = 0; writeSave(); }

  dotAcc += dt;
  if (dotAcc > 1) {
    dotAcc = 0;
    const rs = meta.researchState();
    if (rs.justFinished) { floatToast(`🔬 ${L('scanned')} ⚡`); SFX.fanfare(); }
    refreshDots();
    refreshContract();
    writeSave();
  }
}

function loop(t) {
  const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
  last = t;
  step(dt);
  requestAnimationFrame(loop);
}
async function boot() {
  const st = loadSave();
  window.__bootInfo = { gems: st.gems, signin: st.signin, catches: st.lifetime.catches, ver: 7 };
  setLang(initLang(st.settings.lang));
  SFX.enabled = st.settings.sfx;
  SFX.music = st.settings.music;

  await SDK.init(); // must complete before ads/loading events on CrazyGames
  SDK.loadingStart();
  resize();
  window.addEventListener('resize', resize);
  initUIStrings();
  bindNav();

  meta.dailyReset();
  resetWorld();
  chestArmed();

  // bus wiring
  bus.on('newspecies', () => refreshDots());
  bus.on('contractdone', g => { floatToast(`✅ ${L('contractDone')} +${g} 💎`); SFX.fanfare(); refreshDots(); });
  bus.on('contractfail', () => { floatToast(`❌ ${L('contractFail')}`); SFX.bad(); refreshDots(); });
  bus.on('zone', () => { if (panelIsOpen() === 'upgrades') reRenderPanel(); });

  // offline earnings
  const off = calcOffline();
  if (off) setTimeout(() => openOffline(off), 600);

  // daily sign-in
  const si = meta.signinState();
  if (!si.claimedToday && !off) setTimeout(() => openSignin(), 400);
  else if (!si.claimedToday) setTimeout(() => openSignin(), 1600);

  // tutorial
  if (st.tutorial === 0 && st.lifetime.catches === 0) showTut(0);
  else if (st.tutorial === 1) showTut(1);

  // audio unlock on first interaction
  const unlock = () => {
    if (st.settings.music) SFX.startMusic();
    window.removeEventListener('pointerdown', unlock);
  };
  window.addEventListener('pointerdown', unlock);

  // input → claw
  const cv = $('#game');
  cv.addEventListener('pointerdown', e => {
    const dropped = tryDrop(e.clientX, e.clientY);
    if (dropped && st.tutorial === 0) { st.tutorial = 1; showTut(1); }
  });

  // save on hide
  document.addEventListener('visibilitychange', () => { if (document.hidden) writeSave(); });
  window.addEventListener('beforeunload', writeSave);

  // hide loading & start loop
  SDK.loadingStop();
  setTimeout(() => { $('#loading').remove(); $('#hud').classList.remove('hidden'); }, 350);
  // error surface handled above; expose manual tick for QA automation
  window.__deepTick = (n = 30) => { for (let i = 0; i < n; i++) step(1 / 30); };
  window.__deepDebug = () => ({
    claw: { state: G.claw.state, ang: +G.claw.ang.toFixed(2), d: Math.round(G.claw.d), hold: G.claw.hold.length },
    ents: G.ents.length, camY: Math.round(G.camY), squid: !!G.squid, W: G.W, H: G.H,
  });
  window.__dev = (c = 0, g = 0, re = 0) => {
    const s = getState(); s.coins += c; s.gems += g;
    if (re) { s.lifetime.runEarned += re; s.lifetime.earned += re; }
  };
  window.__devAway = (min = 30) => { getState().lastSeen = Date.now() - min * 60000; };
  window.__devState = fn => fn(getState()); // QA: full state access  refreshDots();
  requestAnimationFrame(loop);
  // occluded webview / throttled-rAF fallback driver (no-op when rAF is healthy)
  setInterval(() => {
    if (performance.now() - lastStepAt < 250) return;
    step(0.033);
  }, 250);
}

// error surface (QA: no silent black screens)
window.addEventListener('error', e => {
  console.error(e);
  const el = document.getElementById('loading');
  if (el) el.querySelector('.load-sub').textContent = 'Error: ' + e.message;
});

boot();
