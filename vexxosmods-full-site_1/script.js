// =========================================================
// VexxosMods — Site Scripts
// Vanilla JS, no dependencies, no build step.
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initNavToggle();
  initNavbarScroll();
  initScrollReveal();
  initYear();
  initVersionSelectors();
  initRippleButtons();
  initDownloadCounter();
});

/* ---------- Animated starfield ---------- */
function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let width, height;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(160, Math.floor((width * height) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.3,
      baseAlpha: Math.random() * 0.6 + 0.25,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.05,
      driftY: (Math.random() - 0.5) * 0.05
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      const alpha = reduceMotion
        ? s.baseAlpha
        : s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.25;
      ctx.beginPath();
      ctx.fillStyle = `rgba(230, 220, 255, ${Math.max(0, alpha)})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      if (!reduceMotion) {
        s.x += s.driftX;
        s.y += s.driftY;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;
      }
    }
    if (!reduceMotion) {
      requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
  if (reduceMotion) draw(0); // single static frame
}

/* ---------- Mobile nav toggle ---------- */
function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('open');
    });
  });
}

/* ---------- Navbar background on scroll ---------- */
function initNavbarScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Reveal-on-scroll ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => observer.observe(el));
}

/* ---------- Version selectors (e.g. Glazed) ---------- */
// Any <select data-download-select="X"> auto-wires to <a data-download="X">.
// Add more mods with a version dropdown just by giving both elements
// the same data-download-select / data-download value — no JS edits needed.
function initVersionSelectors() {
  const selects = document.querySelectorAll('[data-download-select]');
  selects.forEach(select => {
    const key = select.getAttribute('data-download-select');
    const targetLink = document.querySelector(`[data-download="${key}"]`);
    if (!targetLink) return;

    // Set initial href to whatever option is selected on load
    targetLink.setAttribute('href', select.value);

    select.addEventListener('change', () => {
      targetLink.setAttribute('href', select.value);
    });
  });
}

/* ---------- Footer year ---------- */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Ripple / click feedback on download buttons ---------- */
// Any element with class "ripple-btn" gets a short-lived ripple span
// injected at the click position. Purely cosmetic — doesn't touch hrefs
// or navigation, so it's safe on real download links.
function initRippleButtons() {
  const buttons = document.querySelectorAll('.ripple-btn');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // respect reduced-motion preference

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${(e.clientX || rect.left + rect.width / 2) - rect.left - size / 2}px`;
      ripple.style.top = `${(e.clientY || rect.top + rect.height / 2) - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
      // Safety net in case animationend doesn't fire (e.g. element removed/navigated away)
      setTimeout(() => ripple.remove(), 800);
    });
  });
}

/* ---------- Simulated "24hr live" download counter ---------- */
// Starts at 245 and grows by a random 15–30 per calendar day, persisted in
// localStorage so the number is stable across page loads/refreshes for the
// same visitor and only ticks up once per new day (not on every visit).
function initDownloadCounter() {
  const el = document.getElementById('download-counter');
  if (!el) return;

  const STORAGE_KEY = 'vx_download_counter';
  const START_COUNT = 245;
  const MIN_DAILY = 15;
  const MAX_DAILY = 30;
  const MAX_CATCHUP_DAYS = 14; // cap growth if the site sits unvisited for a long time

  const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  let data;
  try {
    data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    data = null;
  }

  if (!data || typeof data.count !== 'number' || !data.lastUpdate) {
    data = { count: START_COUNT, lastUpdate: todayKey };
  }

  if (data.lastUpdate !== todayKey) {
    const lastDate = new Date(data.lastUpdate);
    const today = new Date(todayKey);
    const daysPassed = Math.max(1, Math.round((today - lastDate) / 86400000));
    const daysToApply = Math.min(daysPassed, MAX_CATCHUP_DAYS);

    for (let i = 0; i < daysToApply; i++) {
      data.count += Math.floor(Math.random() * (MAX_DAILY - MIN_DAILY + 1)) + MIN_DAILY;
    }
    data.lastUpdate = todayKey;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage unavailable (private browsing, etc.) — still render this session's count
  }

  animateCounterTo(el, data.count);
}

/* Small count-up animation from 0 to the target value on load */
function animateCounterTo(el, target) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    el.textContent = target.toLocaleString();
    return;
  }

  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = Math.round(target * eased);
    el.textContent = value.toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(tick);
}
