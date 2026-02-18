function initReflection(container) {
  const canvas = document.createElement('canvas');
  const W = 600, H = 520;
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = 'auto';
  canvas.style.maxHeight = '100%';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Triangle vertices
  const verts = [
    { x: W / 2, y: 50, label: 'Rules' },
    { x: 80, y: H - 50, label: 'Randomness' },
    { x: W - 80, y: H - 50, label: 'Interpretation' }
  ];

  // Activity positions (barycentric → cartesian)
  function fromBary(r, rn, i) {
    return {
      x: verts[0].x * r + verts[1].x * rn + verts[2].x * i,
      y: verts[0].y * r + verts[1].y * rn + verts[2].y * i
    };
  }

  const activities = [
    { ...fromBary(0.15, 0.35, 0.50), label: 'A1: One Prompt', color: '#00FF41' },
    { ...fromBary(0.30, 0.30, 0.40), label: 'A2: Iterate', color: '#4ecdc4' },
    { ...fromBary(0.55, 0.25, 0.20), label: 'A3: Constraints', color: '#e94560' }
  ];

  let t = 0;

  function animate() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Triangle
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    ctx.lineTo(verts[1].x, verts[1].y);
    ctx.lineTo(verts[2].x, verts[2].y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vertex labels
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaa';
    verts.forEach(v => {
      ctx.fillText(v.label, v.x, v.y + (v.y < H / 2 ? -15 : 25));
    });

    // Animated trajectory arrows
    for (let i = 0; i < activities.length - 1; i++) {
      const a = activities[i], b = activities[i + 1];
      const progress = (Math.sin(t * 0.03 + i) + 1) / 2;

      // Dashed line
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moving dot along path
      const mx = a.x + (b.x - a.x) * progress;
      const my = a.y + (b.y - a.y) * progress;
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Arrow head at b
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const aLen = 10;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - Math.cos(angle - 0.4) * aLen, b.y - Math.sin(angle - 0.4) * aLen);
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - Math.cos(angle + 0.4) * aLen, b.y - Math.sin(angle + 0.4) * aLen);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Activity markers
    activities.forEach((a, i) => {
      const pulse = Math.sin(t * 0.05 + i * 2) * 3;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 10 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = a.color;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText(a.label, a.x, a.y - 20);
    });

    t++;
    requestAnimationFrame(animate);
  }

  animate();
}
