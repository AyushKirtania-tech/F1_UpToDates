// script.js - corrected and hardened version for F1 Racing home page

// Constants and Configuration
const ERGAST_API_URL = 'https://ergast.com/api/f1/current.json?limit=1000';
const CORS_PROXY = url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

// Short helpers
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

// Robust fetch with timeout and proxy fallback
async function fetchWithFallback(url, options = {}) {
  const controller = new AbortController();
  const timeout = 10000; // 10s
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Direct fetch failed — trying proxy:', err.message);
    try {
      const proxyRes = await fetch(CORS_PROXY(url));
      if (!proxyRes.ok) throw new Error(`Proxy HTTP ${proxyRes.status}`);
      return await proxyRes.json();
    } catch (proxyErr) {
      console.error('Proxy fetch also failed:', proxyErr);
      throw new Error('Unable to fetch data from API');
    }
  }
}

// Date/time formatting for races
function formatRaceDateTime(dateStr, timeStr) {
  try {
    if (!dateStr) return 'TBA';
    if (timeStr) {
      const dt = new Date(`${dateStr}T${timeStr}Z`);
      return dt.toLocaleString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
      });
    } else {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    }
  } catch (e) {
    console.error('formatRaceDateTime error', e);
    return dateStr || 'TBA';
  }
}

// Countdown system (uses setInterval for simplicity & reliability)
function createCountdown(targetDate) {
  const elDays = $('#cd-days'), elHours = $('#cd-hours'), elMins = $('#cd-mins'), elSecs = $('#cd-secs');
  if (!elDays || !elHours || !elMins || !elSecs) return () => {};
  function update() {
    const now = Date.now();
    let diff = targetDate.getTime() - now;
    if (diff <= 0) {
      elDays.textContent = '0';
      elHours.textContent = '00';
      elMins.textContent = '00';
      elSecs.textContent = '00';
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);
    const secs = Math.floor(diff / 1000);

    // animate only when changed
    const updates = {
      days: String(days),
      hours: String(hours).padStart(2, '0'),
      minutes: String(mins).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0')
    };

    if (elDays.textContent !== updates.days) { elDays.textContent = updates.days; }
    if (elHours.textContent !== updates.hours) { elHours.textContent = updates.hours; }
    if (elMins.textContent !== updates.minutes) { elMins.textContent = updates.minutes; }
    if (elSecs.textContent !== updates.seconds) { elSecs.textContent = updates.seconds; }
  }

  update();
  const intervalId = setInterval(update, 1000);
  return () => clearInterval(intervalId);
}

// Load next race from Ergast (with fallback)
async function loadNextRace() {
  const elName = $('#nr-name'), elCircuit = $('#nr-circuit'), elDate = $('#nr-date'), elLink = $('#nr-link'), elCountdown = $('#countdown');
  if (elName) { elName.textContent = 'Loading next race...'; elName.classList.add('loading'); }

  try {
    const data = await fetchWithFallback(ERGAST_API_URL);
    const races = data?.MRData?.RaceTable?.Races || [];
    if (!races.length) throw new Error('No race data');

    const now = new Date();
    const next = races.find(r => {
      if (!r.date) return false;
      const dt = r.time ? new Date(`${r.date}T${r.time}Z`) : new Date(`${r.date}T23:59:59Z`);
      return dt > now;
    });

    if (!next) {
      if (elName) elName.textContent = 'Season Complete! 🏆';
      if (elCircuit) elCircuit.textContent = 'Check back next season';
      if (elDate) elDate.textContent = '';
      if (elCountdown) elCountdown.style.display = 'none';
      return;
    }

    if (elName) { elName.textContent = next.raceName; elName.classList.remove('loading'); }
    if (elCircuit && next.Circuit) elCircuit.textContent = `${next.Circuit.circuitName} • ${next.Circuit.Location.locality}, ${next.Circuit.Location.country}`;
    if (elDate) elDate.textContent = formatRaceDateTime(next.date, next.time);
    if (elLink) elLink.href = 'schedule.html';

    if (elCountdown) elCountdown.style.display = ''; // show countdown
    const target = next.time ? new Date(`${next.date}T${next.time}Z`) : new Date(`${next.date}T14:00:00Z`);
    // start countdown and keep cleanup if needed
    createCountdown(target);

    // store for other use
    window.nextRaceData = next;
  } catch (err) {
    console.error('loadNextRace error', err);
    if (elName) { elName.textContent = 'Unable to load race data'; elName.classList.remove('loading'); }
    if (elCircuit) elCircuit.textContent = 'Please check your connection';
    if (elDate) elDate.textContent = '';
    if (elCountdown) elCountdown.style.display = 'none';
  }
}

// Newsletter (client-side demo)
function initNewsletter() {
  const form = $('#newsletterForm'), email = $('#email'), msg = $('#newsletter-msg');
  if (!form || !email || !msg) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const show = (text, type='success') => {
    msg.textContent = text;
    msg.style.color = type === 'success' ? '#4ade80' : '#f87171';
    setTimeout(() => { msg.textContent = ''; }, 5000);
  };

  email.addEventListener('input', () => {
    email.style.borderColor = email.value && !emailRegex.test(email.value) ? '#f87171' : '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = email.value.trim();
    if (!val) return show('Enter your email', 'error');
    if (!emailRegex.test(val)) return show('Please provide a valid email', 'error');

    const btn = form.querySelector('button[type="submit"]');
    const original = btn ? btn.textContent : null;
    if (btn) { btn.disabled = true; btn.textContent = 'Subscribing...' }

    try {
      await new Promise(r => setTimeout(r, 700)); // demo delay
      show(`Subscribed: ${val}`, 'success');
      email.value = '';
    } catch (err) {
      console.error(err);
      show('Subscription failed', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = original; }
    }
  });
}

// Scroll reveal using IntersectionObserver
function initScrollReveal() {
  const reveals = $$('.reveal');
  if (!reveals.length) return;

  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => obs.observe(el));
}

// Back-to-top button
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;
  let visible = false;
  window.addEventListener('scroll', () => {
    const should = window.pageYOffset > 300;
    if (should && !visible) { btn.style.display = 'flex'; visible = true; }
    else if (!should && visible) { btn.style.display = 'none'; visible = false; }
  }, { passive: true });
  btn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

// News ticker (rotate list items)
function initNewsTicker() {
  const ul = $('#newsList');
  if (!ul || !ul.children.length) return;
  setInterval(() => {
    const first = ul.firstElementChild;
    if (!first) return;
    first.style.transition = 'margin 0.45s ease, opacity 0.45s';
    first.style.marginTop = '-26px';
    first.style.opacity = '0';
    setTimeout(() => {
      first.style.transition = '';
      first.style.marginTop = '';
      first.style.opacity = '';
      ul.appendChild(first);
    }, 470);
  }, 3500);
}


// Interactive elements (team slides, driver cards)
function initInteractiveElements() {
  const slides = $$('.team-slide');
  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      const team = slide.dataset.team || slide.querySelector('.team-name')?.textContent || 'team';
      // Example: navigate to team page /teams.html#team
      console.log('team clicked', team);
      // window.location.href = `teams.html#${team.toLowerCase().replace(/\s+/g,'-')}`;
    });
  });

  const cards = $$('.card-grid li');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const driver = card.dataset.driver || card.querySelector('h3')?.textContent || 'driver';
      console.log('driver clicked', driver);
      // e.g. open driver page
    });
  });
}

// Image fallback for logos (hides broken images)
function attachImageFallbacks() {
  $$('.team-slide img').forEach(img => {
    img.addEventListener('error', () => {
      const parent = img.closest('.team-slide');
      if (parent) parent.classList.add('no-image');
      img.style.display = 'none';
    });
  });
}

// Performance & error monitoring (light)
function initPerformanceMonitoring() {
  window.addEventListener('load', () => {
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) console.log(`Load time: ${Math.round(nav.loadEventEnd - nav.startTime)}ms`);
    } catch (e) {}
  });
  window.addEventListener('error', (e) => console.error('Global error', e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => console.error('Unhandled promise', e.reason));
}

// Main initializer
function init() {
  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  attachImageFallbacks();
  loadNextRace();
  initNewsletter();
  initScrollReveal();
  initBackToTop();
  initNewsTicker();
  initInteractiveElements();
  initPerformanceMonitoring();

  console.log('🏁 F1 Racing initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Optional: service worker (register only on HTTPS or localhost)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker?.register('/sw.js').then(() => console.log('SW registered')).catch(() => {});
  });
}
