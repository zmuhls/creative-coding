import { makeCanvas, rafLoop } from './util_canvas.js';

// Slide 1 artifact: 10 PRINT-style maze.
export function tenPrint(container) {
  container.innerHTML = '';
  const { ctx, resize, destroy } = makeCanvas(container);

  let { width, height } = resize();
  const SIZE = 22;
  let x = 0, y = 0;
  let paused = false;
  let pauseUntil = 0;

  function caption() {
    const captionH = Math.max(28, height * 0.06);
    ctx.fillStyle = 'rgba(5,11,7,0.85)';
    ctx.fillRect(0, height - captionH, width, captionH);
    const fontSize = Math.max(12, Math.min(width, height) * 0.028);
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('10 PRINT CHR$(205.5+RND(1)); : GOTO 10 (1982)', width / 2, height - captionH * 0.3);
  }

  function clear() {
    ctx.fillStyle = '#050b07';
    ctx.fillRect(0, 0, width, height);
  }

  function applyStyle() {
    ctx.strokeStyle = '#5cb870';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
  }

  clear();
  applyStyle();

  // Resize only when the container actually changes size — avoids
  // clearing the canvas (and resetting context state) every frame.
  const ro = new ResizeObserver(() => {
    ({ width, height } = resize());
    x = 0;
    y = 0;
    paused = false;
    clear();
    applyStyle();
  });
  ro.observe(container);

  const stop = rafLoop((t) => {
    // Hold the completed maze on screen before restarting.
    if (paused) {
      if (t < pauseUntil) return;
      paused = false;
      x = 0;
      y = 0;
      clear();
      applyStyle();
    }

    for (let i = 0; i < 120; i++) {
      if (Math.random() > 0.5) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + SIZE, y + SIZE);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x + SIZE, y);
        ctx.lineTo(x, y + SIZE);
        ctx.stroke();
      }
      x += SIZE;
      if (x >= width) { x = 0; y += SIZE; }
      if (y >= height) {
        caption();
        paused = true;
        pauseUntil = t + 5000;
        return;
      }
    }
  });

  return () => { stop(); ro.disconnect(); destroy(); };
}
