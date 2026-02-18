// Creative Coding Triangle — Rules / Randomness / Interpretation
// Draggable point inside triangle morphs background pattern
function initTriangle(container) {
  const canvas = document.createElement('canvas');
  const w = container.clientWidth;
  const h = container.clientHeight;
  canvas.width = w;
  canvas.height = h;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Triangle vertices
  const pad = 60;
  const tri = [
    { x: w / 2, y: pad, label: 'Rules\n(System Prompt)' },
    { x: pad, y: h - pad, label: 'Randomness\n(Temperature)' },
    { x: w - pad, y: h - pad, label: 'Interpretation\n(Human Curation)' }
  ];

  // Barycentric weights from point position
  let px = w / 2, py = h / 2;
  let dragging = false;

  function bary(px, py) {
    const [a, b, c] = tri;
    const det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    const u = ((b.y - c.y) * (px - c.x) + (c.x - b.x) * (py - c.y)) / det;
    const v = ((c.y - a.y) * (px - c.x) + (a.x - c.x) * (py - c.y)) / det;
    const wt = 1 - u - v;
    return { rules: Math.max(0, u), random: Math.max(0, v), interp: Math.max(0, wt) };
  }

  function render() {
    ctx.clearRect(0, 0, w, h);
    const weights = bary(px, py);

    // Background pattern influenced by weights
    const gridSize = 20;
    for (let x = 0; x < w; x += gridSize) {
      for (let y = 0; y < h; y += gridSize) {
        const dx = (Math.random() - 0.5) * gridSize * weights.random * 2;
        const dy = (Math.random() - 0.5) * gridSize * weights.random * 2;
        const size = 2 + weights.rules * 4;
        const alpha = 0.1 + weights.interp * 0.3;
        ctx.fillStyle = `rgba(100,180,255,${alpha})`;
        ctx.fillRect(x + dx, y + dy, size, size);
      }
    }

    // Draw triangle
    ctx.beginPath();
    ctx.moveTo(tri[0].x, tri[0].y);
    ctx.lineTo(tri[1].x, tri[1].y);
    ctx.lineTo(tri[2].x, tri[2].y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    tri.forEach(v => {
      const lines = v.label.split('\n');
      lines.forEach((line, i) => {
        const yOff = v.y < h / 2 ? -15 + i * 16 : 20 + i * 16;
        ctx.fillText(line, v.x, v.y + yOff);
      });
    });

    // Draggable point
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#e94560';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Weight readout
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`rules: ${weights.rules.toFixed(2)}  random: ${weights.random.toFixed(2)}  interp: ${weights.interp.toFixed(2)}`, 10, 20);
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (Math.hypot(mx - px, my - py) < 20) dragging = true;
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    px = e.clientX - rect.left;
    py = e.clientY - rect.top;
    render();
  });
  canvas.addEventListener('mouseup', () => { dragging = false; });

  render();
  return canvas;
}

if (typeof window !== 'undefined') window.triangle = { init };
