// Activity 3 — Constraint-based grid composition
// 12x12 circles, radius varies by center distance
// Palette: #1a1a2e, #16213e, #e94560
function initConstraintGrid(container) {
  const canvas = document.createElement('canvas');
  const w = container.clientWidth;
  const h = container.clientHeight;
  canvas.width = w;
  canvas.height = h;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const COLS = 12, ROWS = 12;
  const palette = ['#1a1a2e', '#16213e', '#e94560'];
  const cellW = w / (COLS + 2);
  const cellH = h / (ROWS + 2);
  const cx = w / 2, cy = h / 2;
  const maxDist = Math.hypot(cx, cy);

  let t = 0;

  function render() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = (col + 1) * cellW + cellW / 2;
        const y = (row + 1) * cellH + cellH / 2;
        const dist = Math.hypot(x - cx, y - cy) / maxDist;

        const maxR = Math.min(cellW, cellH) * 0.4;
        const r = maxR * (1 - dist * 0.7) + Math.sin(t + dist * 6) * maxR * 0.15;
        const colorIdx = Math.floor(dist * palette.length) % palette.length;
        const alpha = 0.5 + (1 - dist) * 0.5;

        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, r), 0, Math.PI * 2);
        ctx.fillStyle = palette[colorIdx];
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    t += 0.02;
    requestAnimationFrame(render);
  }

  render();
  return canvas;
}

if (typeof window !== 'undefined') window.constraintGrid = { init };
