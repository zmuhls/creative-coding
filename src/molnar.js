// Vera Molnar — "Interruptions" series
// Grid of line segments with a draggable circular void
function initMolnar(container) {
  const canvas = document.createElement('canvas');
  const w = container.clientWidth;
  const h = container.clientHeight;
  canvas.width = w;
  canvas.height = h;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const COLS = 30;
  const ROWS = 30;
  const cellW = w / COLS;
  const cellH = h / ROWS;
  let voidX = w / 2;
  let voidY = h / 2;
  let voidR = Math.min(w, h) * 0.2;
  let dragging = false;

  // Pre-generate angles for stability
  const angles = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    angles.push(Math.floor(Math.random() * 4) * (Math.PI / 2));
  }

  function render() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 1.5;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cx = col * cellW + cellW / 2;
        const cy = row * cellH + cellH / 2;
        const dist = Math.hypot(cx - voidX, cy - voidY);

        if (dist < voidR) continue; // void zone

        const len = cellW * 0.35;
        const angle = angles[row * COLS + col];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-len, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Draw void boundary
    ctx.beginPath();
    ctx.arc(voidX, voidY, voidR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.stroke();
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (Math.hypot(mx - voidX, my - voidY) < voidR + 20) dragging = true;
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    voidX = e.clientX - rect.left;
    voidY = e.clientY - rect.top;
    render();
  });
  canvas.addEventListener('mouseup', () => { dragging = false; });
  canvas.addEventListener('mouseleave', () => { dragging = false; });

  render();
  return canvas;
}

if (typeof window !== 'undefined') window.molnar = { init };
