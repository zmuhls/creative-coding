function initSpectrum(container) {
  const canvas = document.createElement('canvas');
  const W = 800, H = 400;
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = '100%';
  canvas.style.maxWidth = W + 'px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Slider
  const sliderWrap = document.createElement('div');
  sliderWrap.style.cssText = 'text-align:center;margin-top:12px;';
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '0';
  slider.style.cssText = 'width:80%;max-width:600px;cursor:pointer;';
  sliderWrap.appendChild(slider);

  const labels = document.createElement('div');
  labels.style.cssText = 'display:flex;justify-content:space-between;max-width:600px;margin:8px auto 0;font-family:monospace;font-size:12px;color:#aaa;';
  labels.innerHTML = '<span>Vibe Coding</span><span>Iterative</span><span>Constraint-Based</span><span>Manual</span>';
  sliderWrap.appendChild(labels);
  container.appendChild(sliderWrap);

  // Particles
  const particles = Array.from({ length: 150 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    baseX: 0, baseY: 0
  }));

  // Assign grid positions
  const cols = 15, rows = 10;
  particles.forEach((p, i) => {
    const gi = i % (cols * rows);
    p.baseX = (gi % cols + 0.5) * (W / cols);
    p.baseY = (Math.floor(gi / cols) + 0.5) * (H / rows);
  });

  let t = 0;

  function animate() {
    const v = slider.value / 100; // 0=chaotic, 1=grid
    ctx.fillStyle = 'rgba(10,10,20,0.15)';
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      // Blend between chaotic movement and grid position
      const targetX = p.baseX * v + (p.x + p.vx) * (1 - v);
      const targetY = p.baseY * v + (p.y + p.vy) * (1 - v);

      p.x += (targetX - p.x) * 0.08;
      p.y += (targetY - p.y) * 0.08;

      // Chaotic motion
      if (v < 0.8) {
        p.vx += (Math.random() - 0.5) * 0.5 * (1 - v);
        p.vy += (Math.random() - 0.5) * 0.5 * (1 - v);
        p.vx *= 0.99;
        p.vy *= 0.99;
      }

      // Wrap
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      const size = 2 + v * 6;
      const hue = v * 200 + 10;
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${0.5 + v * 0.4})`;

      if (v > 0.7) {
        // Grid mode: draw squares
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    t++;
    requestAnimationFrame(animate);
  }

  animate();
}
