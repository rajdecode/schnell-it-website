/* ============================================================
   SCHNELL IT — JavaScript
   Scroll animations · Nav · Network canvas · Interactions
   ============================================================ */

// ── 1. Sticky Nav ──────────────────────────────────────────
const nav = document.querySelector('.nav');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  nav.classList.toggle('scrolled', scrollY > 20);
  lastScroll = scrollY;
}, { passive: true });

// ── 2. Mobile Nav ──────────────────────────────────────────
const hamburger = document.querySelector('.nav-hamburger');
const drawer = document.querySelector('.mobile-drawer');
const drawerLinks = document.querySelectorAll('.mobile-drawer a');

hamburger?.addEventListener('click', () => {
  drawer.classList.toggle('open');
  document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
});

drawerLinks.forEach(link => {
  link.addEventListener('click', () => {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── 3. Scroll Fade-In Observer ─────────────────────────────
const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // stop observing after first trigger
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-up, .fade-in').forEach(el => fadeObserver.observe(el));

// ── 4. Animated Network Graph (Hero Canvas) ────────────────
const canvas = document.getElementById('network-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, nodes, animId;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    W = rect.width;
    H = rect.height;
    initNodes();
  }

  class Node {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 3 + 2;
      this.pulsePhase = Math.random() * Math.PI * 2;
      // Some nodes are "hub" nodes — bigger
      this.isHub = Math.random() < 0.2;
      if (this.isHub) this.r = Math.random() * 4 + 5;
    }
    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
      this.x = Math.max(0, Math.min(W, this.x));
      this.y = Math.max(0, Math.min(H, this.y));
    }
    draw(t) {
      const pulse = Math.sin(t * 0.002 + this.pulsePhase) * 0.4 + 0.6;
      const alpha = this.isHub ? 0.9 : 0.5 + pulse * 0.3;
      const color = this.isHub ? `rgba(96,165,250,${alpha})` : `rgba(52,211,153,${alpha * 0.7})`;

      // Glow ring for hubs
      if (this.isHub) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
        gradient.addColorStop(0, `rgba(96,165,250,0.25)`);
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function initNodes() {
    const count = Math.min(42, Math.floor((W * H) / 8000));
    nodes = Array.from({ length: count }, () => new Node());
  }

  function drawEdges(t) {
    const maxDist = 120;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.35;
          const isHubEdge = nodes[i].isHub || nodes[j].isHub;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = isHubEdge
            ? `rgba(96,165,250,${alpha * 1.5})`
            : `rgba(96,165,250,${alpha * 0.5})`;
          ctx.lineWidth = isHubEdge ? 1.2 : 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate(t) {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => n.update(t));
    drawEdges(t);
    nodes.forEach(n => n.draw(t));
    animId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    animate(performance.now());
  }, { passive: true });

  resize();
  animate(performance.now());
}

// ── 5. Smooth scroll for anchor links ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── 6. Typewriter effect for hero sub ─────────────────────
function typewriter(el, text, speed = 28) {
  el.textContent = '';
  let i = 0;
  const tick = () => {
    if (i <= text.length) {
      el.textContent = text.slice(0, i++);
      setTimeout(tick, speed);
    }
  };
  tick();
}

// Trigger after a small delay for theatric effect
setTimeout(() => {
  const sub = document.querySelector('.hero-sub');
  if (sub) {
    const original = sub.textContent.trim();
    typewriter(sub, original, 22);
  }
}, 600);

// ── 7. Counter animation ───────────────────────────────────
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1600;
  const start = performance.now();
  const isFloat = Math.floor(target) !== target;

  const frame = (now) => {
    const pct = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - pct, 3); // ease-out cubic
    const val = ease * target;
    el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
    if (pct < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      animateCount(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));
