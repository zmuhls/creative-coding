// 10 PRINT CHR$(205.5+RND(1)); : GOTO 10
// Canvas-based maze generator — Commodore 64 homage
function initTenprint(container) {
  const canvas = document.createElement('canvas');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#00FF41';
  ctx.lineWidth = 2;
  const SIZE = 20;
  let x = 0, y = 0;
  let frame = 0;

  function draw() {
    const batchSize = 5;
    for (let i = 0; i < batchSize; i++) {
      if (y >= canvas.height) return;
      ctx.beginPath();
      if (Math.random() > 0.5) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + SIZE, y + SIZE);
      } else {
        ctx.moveTo(x + SIZE, y);
        ctx.lineTo(x, y + SIZE);
      }
      ctx.stroke();
      x += SIZE;
      if (x >= canvas.width) { x = 0; y += SIZE; }
    }
    requestAnimationFrame(draw);
  }

  // Clear and restart on click
  canvas.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    x = 0; y = 0;
    draw();
  });

  draw();
  return canvas;
}

if (typeof window !== 'undefined') window.tenprint = { init };
