import { makeCanvas, rafLoop } from './util_canvas.js';

// Slide 4 artifact: Molnar-inspired "interruptions".
// Grid of line segments with a movable circular void where lines are removed.
export function molnarInterruptions(container) {
  container.innerHTML = '';
  const { ctx, resize, destroy } = makeCanvas(container);

  let center = { x: 0.5, y: 0.5 };
  let dragging = false;

  function pointerPos(e) {
    const r = container.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  }

  const onDown = (e) => { dragging = true; center = pointerPos(e); };
  const onMove = (e) => { if (dragging) center = pointerPos(e); };
  const onUp = () => { dragging = false; };

  container.addEventListener('pointerdown', onDown);
  container.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  const stop = rafLoop((t) => {
    const { width, height } = resize();

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const cols = 48;
    const rows = 28;
    const stepX = width / cols;
    const stepY = height / rows;

    const cx = center.x * width;
    const cy = center.y * height;
    const baseR = Math.min(width, height) * 0.22;
    const pulse = 0.06 * baseR * Math.sin(t / 900);
    const voidR = baseR + pulse;

    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 2;

    // Uniform-ish angle with tiny drift (order)
    const theta = 0.35 + 0.12 * Math.sin(t / 1300);
    const ux = Math.cos(theta), uy = Math.sin(theta);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = (i + 0.5) * stepX;
        const y = (j + 0.5) * stepY;
        const d = Math.hypot(x - cx, y - cy);
        if (d < voidR) continue; // interruption (disorder)

        const len = 0.35 * Math.min(stepX, stepY);
        ctx.beginPath();
        ctx.moveTo(x - ux * len, y - uy * len);
        ctx.lineTo(x + ux * len, y + uy * len);
        ctx.stroke();
      }
    }

    // Draw void outline lightly for readability
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, voidR, 0, Math.PI * 2);
    ctx.stroke();

    // Instruction hint
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText('Drag to move interruption', 16, height - 18);
  });

  return () => {
    stop();
    container.removeEventListener('pointerdown', onDown);
    container.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    destroy();
  };
}
