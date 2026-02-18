import { makeCanvas, rafLoop } from './util_canvas.js';

// Takeaways artifact: activities mapped onto the creative coding triangle.
// Shows A1 (Interpretation) → A2 (balanced) → A3 (Rules) with animated markers.
export function reflection(container) {
  container.innerHTML = '';
  const { ctx, resize, destroy } = makeCanvas(container);

  let t = 0;

  const stop = rafLoop(() => {
    const { width: W, height: H } = resize();

    const verts = [
      { x: W * 0.50, y: H * 0.08, label: 'Rules' },
      { x: W * 0.08, y: H * 0.92, label: 'Randomness' },
      { x: W * 0.92, y: H * 0.92, label: 'Interpretation' },
    ];

    function fromBary(r, rn, i) {
      return {
        x: verts[0].x * r + verts[1].x * rn + verts[2].x * i,
        y: verts[0].y * r + verts[1].y * rn + verts[2].y * i,
      };
    }

    const activities = [
      { ...fromBary(0.15, 0.35, 0.50), label: 'A1: One Prompt', color: '#00FF41' },
      { ...fromBary(0.30, 0.30, 0.40), label: 'A2: Iterate',    color: '#4ecdc4' },
      { ...fromBary(0.55, 0.25, 0.20), label: 'A3: Constraints', color: '#e94560' },
    ];

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Triangle outline
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    ctx.lineTo(verts[1].x, verts[1].y);
    ctx.lineTo(verts[2].x, verts[2].y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vertex labels
    const lblSize = Math.max(11, Math.min(W, H) * 0.045);
    ctx.font = `${lblSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaa';
    verts.forEach(v => {
      ctx.fillText(v.label, v.x, v.y + (v.y < H / 2 ? -lblSize * 0.8 : lblSize * 1.4));
    });

    // Animated arcs between activity markers
    for (let i = 0; i < activities.length - 1; i++) {
      const a = activities[i], b = activities[i + 1];
      const progress = (Math.sin(t * 0.03 + i) + 1) / 2;

      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Traveling dot
      ctx.beginPath();
      ctx.arc(a.x + (b.x - a.x) * progress, a.y + (b.y - a.y) * progress, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Arrow at destination
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const aLen = Math.max(8, Math.min(W, H) * 0.025);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - Math.cos(angle - 0.4) * aLen, b.y - Math.sin(angle - 0.4) * aLen);
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - Math.cos(angle + 0.4) * aLen, b.y - Math.sin(angle + 0.4) * aLen);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Activity marker dots
    const dotR = Math.max(7, Math.min(W, H) * 0.028);
    const markerSize = Math.max(10, Math.min(W, H) * 0.038);
    ctx.font = `${markerSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;

    activities.forEach((a, i) => {
      const pulse = Math.sin(t * 0.05 + i * 2) * dotR * 0.3;
      ctx.beginPath();
      ctx.arc(a.x, a.y, dotR + pulse, 0, Math.PI * 2);
      ctx.fillStyle = a.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(a.label, a.x, a.y - dotR - markerSize * 0.4);
    });

    t++;
  });

  return () => { stop(); destroy(); };
}
