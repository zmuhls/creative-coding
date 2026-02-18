function initStarfield(container) {
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  let W, H;
  function resize() {
    W = canvas.width = container.clientWidth;
    H = canvas.height = container.clientHeight;
  }
  resize();

  const ctx = canvas.getContext('2d');
  let mouseX = W / 2, mouseY = H / 2;

  const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    z: Math.random() * 3 + 0.5
  }));

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  function animate() {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 0, W, H);

    stars.forEach(s => {
      const alpha = s.z / 3.5;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(s.x, s.y, s.z * 1.5, s.z * 1.5);

      s.x += (mouseX - W / 2) * 0.002 * s.z;
      s.y += (mouseY - H / 2) * 0.002 * s.z;
      s.y += s.z * 0.3; // gentle drift down

      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;
    });

    requestAnimationFrame(animate);
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  animate();
}
