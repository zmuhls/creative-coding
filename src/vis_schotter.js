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

    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1;

    const COLS = 12;
    const ROWS = 22;

    const pad = Math.min(width, height) * 0.08;
    const gridW = width - pad * 2;
    const gridH = height - pad * 2;
    const size = Math.min(gridW / COLS, gridH / ROWS);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const disorder = row / (ROWS - 1);
        const angle = (Math.random() - 0.5) * disorder * Math.PI;
        const dx = (Math.random() - 0.5) * disorder * size;
        const dy = (Math.random() - 0.5) * disorder * size;
        const cx = pad + col * size + size / 2 + dx;
        const cy = pad + row * size + size / 2 + dy;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }
  }

  draw();

  const onClick = () => draw();
  container.addEventListener('click', onClick);

  return () => {
    container.removeEventListener('click', onClick);
    destroy();
  };
}
