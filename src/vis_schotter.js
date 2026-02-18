import { makeCanvas } from './util_canvas.js';

// Slide 3 artifact: Nees-style "Schotter".
export function schotter(container) {
  container.innerHTML = '';
  const { ctx, resize, destroy } = makeCanvas(container);
  let { width, height } = resize();

  function draw() {
    ({ width, height } = resize());
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const COLS = 12;
    const ROWS = 22;
    const captionH = Math.max(28, height * 0.06);
    const availH = height - captionH;
    const pad = Math.min(width, availH) * 0.06;
    const size = Math.min((width - pad * 2) / COLS, (availH - pad * 2) / ROWS);
    const gridW = COLS * size;
    const gridH = ROWS * size;
    const ox = (width - gridW) / 2;
    const oy = (availH - gridH) / 2;

    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const disorder = row / (ROWS - 1);
        const angle = (Math.random() - 0.5) * disorder * Math.PI;
        const dx = (Math.random() - 0.5) * disorder * size;
        const dy = (Math.random() - 0.5) * disorder * size;
        const cx = ox + col * size + size / 2 + dx;
        const cy = oy + row * size + size / 2 + dy;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }

    // Caption
    const fontSize = Math.max(12, Math.min(width, height) * 0.028);
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Georg Nees, Schotter (1968\u201370)', width / 2, height - captionH * 0.3);
  }

  draw();

  // Redraw immediately on resize so the canvas isn't left blank
  // until the 5-second interval fires.
  const ro = new ResizeObserver(() => draw());
  ro.observe(container);

  const interval = setInterval(draw, 5000);

  return () => {
    clearInterval(interval);
    ro.disconnect();
    destroy();
  };
}
