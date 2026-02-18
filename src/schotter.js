// Georg Nees — "Schotter" (Gravel), 1968-70
// Grid of squares where disorder increases top to bottom
function initSchotter(container) {
  const canvas = document.createElement('canvas');
  const w = container.clientWidth;
  const h = container.clientHeight;
  canvas.width = w;
  canvas.height = h;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 1;

  const COLS = 12;
  const ROWS = 22;
  const SIZE = Math.min(w / (COLS + 2), h / (ROWS + 2));
  const offsetX = (w - COLS * SIZE) / 2;
  const offsetY = (h - ROWS * SIZE) / 2;

  function render() {
    ctx.clearRect(0, 0, w, h);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const disorder = row / ROWS;
        const angle = (Math.random() - 0.5) * disorder * Math.PI;
        const dx = (Math.random() - 0.5) * disorder * SIZE;
        const dy = (Math.random() - 0.5) * disorder * SIZE;
        const cx = offsetX + col * SIZE + SIZE / 2 + dx;
        const cy = offsetY + row * SIZE + SIZE / 2 + dy;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.strokeRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE);
        ctx.restore();
      }
    }
  }

  // Click to regenerate with new random values
  canvas.addEventListener('click', render);
  render();
  return canvas;
}

if (typeof window !== 'undefined') window.schotter = { init };
