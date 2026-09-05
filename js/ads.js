// ads.js — CrazyGames SDK adapter + rewarded ad manager with frequency caps
import { getState, writeSave, todayKey } from './core.js';

export const SDK = {
  ready: false, available: false,
  async init() {
    try {
      if (window.CrazyGames?.SDK) {
        await window.CrazyGames.SDK.init();
        this.available = true;
      }
    } catch (e) { console.warn('CG SDK init failed, running standalone', e); this.available = false; }
    this.ready = true;
  },
  loadingStart() { try { this.available && window.CrazyGames.SDK.game.sdkGameLoadingStart(); } catch (e) { } },
  loadingStop() { try { this.available && window.CrazyGames.SDK.game.sdkGameLoadingStop(); } catch (e) { } },
  happytime() { try { this.available && window.CrazyGames.SDK.game.happytime(); } catch (e) { } },
};

// daily frequency caps per placement (0 = gated by flow, not by count)
const CAPS = {
  offline_x2: 0, buff_2x: 6, wheel_extra: 5, free_gems: 10,
  scanner_skip: 12, signin_makeup: 2,
};

let lastAdAt = 0;
const GLOBAL_COOLDOWN = 15000;

function capInfo(key) {
  const s = getState();
  if (!s.adCaps[key] || s.adCaps[key].date !== todayKey()) s.adCaps[key] = { date: todayKey(), count: 0 };
  return s.adCaps[key];
}
export function adUsesLeft(key) {
  const cap = CAPS[key] ?? 0;
  if (cap === 0) return Infinity;
  return Math.max(0, cap - capInfo(key).count);
}
export function adAvailable(key) {
  if (Date.now() - lastAdAt < GLOBAL_COOLDOWN) return false;
  return adUsesLeft(key) > 0;
}

// simulated ad overlay for dev / SDK-missing environments
function simulateAd() {
  return new Promise(resolve => {
    const mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML = `<div class="modal center"><h3>Simulated Ad</h3>
      <div class="m-sub">CrazyGames rewarded ad placeholder</div>
      <div class="big-reward" id="sim-ad-cd">3</div>
      <div class="note">Dev environment: SDK not detected</div></div>`;
    document.body.appendChild(mask);
    let n = 3;
    const el = mask.querySelector('#sim-ad-cd');
    const iv = setInterval(() => {
      n--; el.textContent = n;
      if (n <= 0) { clearInterval(iv); mask.remove(); resolve(true); }
    }, 900);
  });
}

/**
 * Request a rewarded ad for placement `key`.
 * Resolves true when the reward should be granted.
 * Graceful fallback: on ad error we still resolve true (QA requirement: never block flow).
 */
export function requestAd(key) {
  const info = capInfo(key);
  lastAdAt = Date.now();
  info.count++;
  writeSave();
  if (!SDK.available) return simulateAd();
  return new Promise(resolve => {
    let done = false;
    const finish = ok => { if (!done) { done = true; resolve(ok); } };
    try {
      window.CrazyGames.SDK.ad.requestAd('rewarded', {
        adStarted: () => { },
        adFinished: () => finish(true),
        adError: err => { console.warn('ad error', err); finish(true); },
      });
      setTimeout(() => finish(true), 45000); // hard safety net
    } catch (e) { finish(true); }
  });
}

// midgame ad — only at prestige (natural pause point), SDK controls pacing
export function requestMidgame() {
  if (!SDK.available) return Promise.resolve();
  return new Promise(resolve => {
    try {
      window.CrazyGames.SDK.ad.requestAd('midgame', {
        adStarted: () => { }, adFinished: resolve, adError: resolve,
      });
      setTimeout(resolve, 30000);
    } catch (e) { resolve(); }
  });
}
