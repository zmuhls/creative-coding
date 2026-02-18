// Minimal slide deck controller (no external libs).
// - Uses <section class="slide" data-artifact="..."> panels.
// - Handles keyboard navigation and calls artifact modules.

import { artifacts } from './registry.js';

let idx = 0;
let slides = [];
let mounted = new Map();

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function show(i) {
  idx = clamp(i, 0, slides.length - 1);
  slides.forEach((s, k) => s.classList.toggle('active', k === idx));

  const slide = slides[idx];
  const name = slide.dataset.artifact;
  const stage = slide.querySelector('.stage');

  // Unmount everything except current (keeps CPU low)
  for (const [k, unmount] of mounted.entries()) {
    if (k !== idx) {
      try { unmount(); } catch {}
      mounted.delete(k);
    }
  }

  if (name && stage && !mounted.has(idx)) {
    const fn = artifacts[name];
    if (typeof fn === 'function') {
      const unmount = fn(stage) || (() => {});
      mounted.set(idx, unmount);
    }
  }

  const counter = document.getElementById('counter');
  if (counter) counter.textContent = `${idx + 1} / ${slides.length}`;

  history.replaceState(null, '', `#${idx + 1}`);
}

function next() { show(idx + 1); }
function prev() { show(idx - 1); }

function onKey(e) {
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
  if (e.key === 'Home') { e.preventDefault(); show(0); }
  if (e.key === 'End') { e.preventDefault(); show(slides.length - 1); }
}

function onHash() {
  const m = location.hash.match(/^#(\d+)$/);
  if (m) show(parseInt(m[1], 10) - 1);
}

function isInteractiveTarget(t) {
  if (!(t instanceof Element)) return false;
  return !!t.closest('a, button, input, textarea, select, summary, details, [contenteditable="true"]');
}

export function bootDeck() {
  slides = Array.from(document.querySelectorAll('section.slide'));
  document.addEventListener('keydown', onKey);
  window.addEventListener('hashchange', onHash);

  // Mobile support: swipe left/right only — no tap-to-advance.
  let touchStartX = 0;
  let touchStartY = 0;
  function onTouchStart(e) {
    if (!e.touches || e.touches.length !== 1) return;
    if (isInteractiveTarget(e.target)) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
  function onTouchEnd(e) {
    if (!touchStartX && !touchStartY) return;
    const t = (e.changedTouches && e.changedTouches[0]);
    if (!t) return;
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    touchStartX = 0;
    touchStartY = 0;

    // Horizontal swipe only.
    if (Math.abs(dx) < 45) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;

    if (dx < 0) next();
    else prev();
  }

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });

  const start = (() => {
    const m = location.hash.match(/^#(\d+)$/);
    return m ? clamp(parseInt(m[1], 10) - 1, 0, slides.length - 1) : 0;
  })();

  show(start);

  return () => {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('hashchange', onHash);
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchend', onTouchEnd);
    for (const unmount of mounted.values()) { try { unmount(); } catch {} }
    mounted.clear();
  };
}
