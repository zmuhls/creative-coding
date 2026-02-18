import { makeCanvas, rafLoop } from './util_canvas.js';

// Activity 3 artifact: constraint-based grid.
// Demonstrates: grid ≥ 100 elements, radius varies by distance from center,
// exactly one randomness source (t), only 3 colors, animated with rAF.
export function constraintGrid(container) {
  container.innerHTML = '';
  const { ctx, resize, destroy } = makeCanvas(container);

  const COLS = 12, ROWS = 12;
  const palette = ['#1a1a2e', '#16213e', '#e94560'];
  let t = 0;

  const stop = rafLoop(() => {
    const { width, height } = resize();
    const cellW = width / (COLS + 2);
    const cellH = height / (ROWS + 2);
    const cx = width / 2, cy = height / 2;
    const maxDist = Math.hypot(cx, cy);

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

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
  });

  return () => { stop(); destroy(); };
}
