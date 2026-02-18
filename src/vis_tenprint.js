import { makeCanvas, rafLoop } from './util_canvas.js';

// Slide 1 artifact: 10 PRINT-style maze.
export function tenPrint(container) {
  container.innerHTML = '';
  const { ctx, resize, destroy } = makeCanvas(container);

  let { width, height } = resize();
  const SIZE = 22;
  let x = 0, y = 0;

  function clear() {
    ctx.fillStyle = '#050b07';
    ctx.fillRect(0, 0, width, height);
  }

  function applyStyle() {
    ctx.strokeStyle = '#00FF41';
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
    clear();
    applyStyle();
  });
  ro.observe(container);

  const stop = rafLoop(() => {
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
      if (y >= height) { y = 0; clear(); applyStyle(); }
    }
  });

  return () => { stop(); ro.disconnect(); destroy(); };
}
