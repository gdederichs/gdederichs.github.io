(() => {
  const canvas = document.getElementById('mouse-field');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: -1000, y: -1000, active: false };
  const mouseRadius = 170;
  const mouseRadiusSquared = mouseRadius * mouseRadius;
  const connectionRadius = 115;
  const connectionRadiusSquared = connectionRadius * connectionRadius;
  const particleDensity = 0.0001;
  const minimumParticleCount = 72;
  const maximumParticleCount = 200;
  let particles = [];
  let animationFrame;
  let width = 0;
  let height = 0;

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const particleCount = Math.min(maximumParticleCount, Math.max(minimumParticleCount, Math.floor(width * height * particleDensity)));
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      homeX: 0,
      homeY: 0,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 1.4 + 0.6
    }));
    particles.forEach((particle) => {
      particle.homeX = particle.x;
      particle.homeY = particle.y;
    });
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    const motionReduced = reducedMotion.matches;

    particles.forEach((particle) => {
      if (!motionReduced) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distanceSquared = dx * dx + dy * dy;

        if (pointer.active && distanceSquared < mouseRadiusSquared && distanceSquared > 0) {
          const distance = Math.sqrt(distanceSquared);
          const force = (mouseRadius - distance) / mouseRadius;
          particle.vx += (dx / distance) * force * 0.04;
          particle.vy += (dy / distance) * force * 0.02;
        }

        particle.vx += (particle.homeX - particle.x) * 0.00001;
        particle.vy += (particle.homeY - particle.y) * 0.00001;
        particle.vx = particle.vx * 0.985 + (Math.random() - 0.5) * 0.002;
        particle.vy = particle.vy * 0.985 + (Math.random() - 0.5) * 0.002;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;
      }

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(187, 222, 228, 0.44)';
      context.fill();
    });

    const cellSize = connectionRadius;
    const cells = new Map();

    particles.forEach((particle, index) => {
      const cellX = Math.floor(particle.x / cellSize);
      const cellY = Math.floor(particle.y / cellSize);
      const key = `${cellX},${cellY}`;
      const cell = cells.get(key) || [];
      cell.push(index);
      cells.set(key, cell);
    });

    particles.forEach((particle, index) => {
      const cellX = Math.floor(particle.x / cellSize);
      const cellY = Math.floor(particle.y / cellSize);
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          const neighbors = cells.get(`${cellX + offsetX},${cellY + offsetY}`) || [];
          neighbors.forEach((nextIndex) => {
            if (nextIndex <= index) return;
            const nextParticle = particles[nextIndex];
            const deltaX = particle.x - nextParticle.x;
            const deltaY = particle.y - nextParticle.y;
            const distanceSquared = deltaX * deltaX + deltaY * deltaY;
            if (distanceSquared < connectionRadiusSquared) {
              const distance = Math.sqrt(distanceSquared);
              context.beginPath();
              context.moveTo(particle.x, particle.y);
              context.lineTo(nextParticle.x, nextParticle.y);
              context.strokeStyle = `rgba(137, 194, 204, ${0.11 * (1 - distance / connectionRadius)})`;
              context.lineWidth = 0.6;
              context.stroke();
            }
          });
        }
      }
    });

    if (!reducedMotion.matches) animationFrame = requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { pointer.active = false; });
  reducedMotion.addEventListener('change', () => {
    cancelAnimationFrame(animationFrame);
    resize();
    draw();
  });

  resize();
  draw();
})();
