import { makeCanvas, rafLoop } from './util_canvas.js';

// Slide 1 artifact: 10 PRINT-style maze.
// Draws gradually (~4s), holds 5s with caption, then regenerates.
export function tenPrint(container) {
  container.innerHTML = '';
  const { ctx, resize, destroy } = makeCanvas(container);

  let { width, height } = resize();
  const SIZE = 22;
  let x = 0, y = 0;
  let phase = 'draw';   // 'draw' | 'hold'
  let holdUntil = 0;

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
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
  }

  function restart() {
    x = 0;
    y = 0;
    phase = 'draw';
    clear();
    caption();
    applyStyle();
  }

  restart();

  const ro = new ResizeObserver(() => {
    ({ width, height } = resize());
    restart();
  });
  ro.observe(container);

  const stop = rafLoop((t) => {
    if (phase === 'hold') {
      if (t < holdUntil) return;
      restart();
      return;
    }

    // ~4 segments/frame → fills a typical stage in ~16–18 seconds.
    for (let i = 0; i < 4; i++) {
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
        phase = 'hold';
        holdUntil = t + 5000;
        return;
      }
    }
  });

  return () => { stop(); ro.disconnect(); destroy(); };
}
