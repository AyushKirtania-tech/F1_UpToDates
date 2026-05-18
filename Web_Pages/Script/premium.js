/* ═══════════════════════════════════════════════════════════════
   premium.js — F1 Racing Hub Premium Interactions
   Live race bar · Scroll navbar · Reveal animations · Tilt · Glow
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const API = 'https://api.jolpi.ca/ergast/f1';

  /* ─── UTILITIES ─────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const pad = n => String(Math.max(0, Math.floor(n))).padStart(2, '0');

  async function safeFetch(url) {
    try {
      const r = await fetch(url);
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  }

  /* ─── 1. LIVE RACE BAR ──────────────────────────────────────── */
  const lrbBar        = $('#liveRaceBar');
  const lrbStatusLbl  = $('#lrbStatusLabel');
  const lrbDot        = lrbBar?.querySelector('.lrb-dot');
  const lrbRound      = $('#lrbRound');
  const lrbRaceName   = $('#lrbRaceName');
  const lrbD          = $('#lrbD');
  const lrbH          = $('#lrbH');
  const lrbM          = $('#lrbM');
  const lrbS          = $('#lrbS');

  let lrbInterval = null;

  async function initLiveRaceBar() {
    if (!lrbBar) return;

    const data = await safeFetch(`${API}/current.json`);
    if (!data) return;

    const races = data?.MRData?.RaceTable?.Races || [];
    if (!races.length) return;

    const now = Date.now();

    // find next upcoming or current live race
    let target = null;

    for (const race of races) {
      const raceMs = new Date(`${race.date}T${race.time || '14:00:00Z'}`).getTime();
      const raceEnd = raceMs + 3 * 60 * 60 * 1000; // +3h window

      if (raceMs <= now && now <= raceEnd) {
        // LIVE
        target = { race, ms: raceEnd, state: 'live' };
        break;
      } else if (raceMs > now) {
        target = { race, ms: raceMs, state: 'upcoming' };
        break;
      }
    }

    if (!target) {
      // season over — show last race
      const last = races[races.length - 1];
      if (lrbRaceName) lrbRaceName.textContent = last.raceName;
      if (lrbRound) lrbRound.textContent = `Round ${last.round}`;
      if (lrbStatusLbl) { lrbStatusLbl.textContent = 'FINISHED'; lrbStatusLbl.style.color = '#666'; }
      if (lrbDot) { lrbDot.classList.add('finished'); }
      hideLrbTimer();
      return;
    }

    const { race, ms, state } = target;

    if (lrbRaceName) lrbRaceName.textContent = race.raceName;
    if (lrbRound) lrbRound.textContent = `Round ${race.round}`;

    if (state === 'live') {
      if (lrbStatusLbl) { lrbStatusLbl.textContent = 'LIVE'; lrbStatusLbl.style.color = 'var(--accent)'; }
      if (lrbDot) { lrbDot.classList.add('live'); }
      // count up from race start
      tickLrbCountdown(ms, true);
    } else {
      if (lrbStatusLbl) lrbStatusLbl.textContent = 'UPCOMING';
      tickLrbCountdown(ms, false);
    }
  }

  function hideLrbTimer() {
    const timer = $('#lrbTimer');
    if (timer) timer.style.display = 'none';
  }

  function tickLrbCountdown(targetMs, countUp) {
    function update() {
      const diff = countUp
        ? targetMs - Date.now()
        : targetMs - Date.now();

      if (diff < 0 && !countUp) {
        // Race started while page open — refresh
        clearInterval(lrbInterval);
        initLiveRaceBar();
        return;
      }

      const absDiff = Math.abs(diff);
      const d = Math.floor(absDiff / 86400000);
      const h = Math.floor((absDiff % 86400000) / 3600000);
      const m = Math.floor((absDiff % 3600000) / 60000);
      const s = Math.floor((absDiff % 60000) / 1000);

      if (lrbD) lrbD.textContent = pad(d);
      if (lrbH) lrbH.textContent = pad(h);
      if (lrbM) lrbM.textContent = pad(m);
      if (lrbS) lrbS.textContent = pad(s);
    }

    update();
    lrbInterval = setInterval(update, 1000);
  }

  /* ─── 2. NAVBAR SCROLL BEHAVIOR ────────────────────────────── */
  function initNavbarScroll() {
    const header = $('.site-header');
    if (!header) return;

    let lastY = 0;
    let ticking = false;
    const SCROLL_THRESHOLD = 60;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;

          // Solid background after scroll
          if (y > 20) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }

          // Hide on scroll down (mobile) — only below the fold
          if (window.innerWidth <= 768) {
            if (y > lastY && y > SCROLL_THRESHOLD) {
              header.classList.add('hidden');
            } else {
              header.classList.remove('hidden');
            }
          } else {
            header.classList.remove('hidden');
          }

          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* ─── 3. SCROLL REVEAL ──────────────────────────────────────── */
  function initScrollReveal() {
    const cards = $$('.reveal-card');
    if (!cards.length) return;

    if (!('IntersectionObserver' in window)) {
      cards.forEach(c => c.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // stagger siblings within same parent
            const siblings = $$('.reveal-card', entry.target.parentElement);
            const idx = siblings.indexOf(entry.target);
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, idx * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    cards.forEach(card => observer.observe(card));
  }

  /* ─── 4. 3D TILT EFFECT ─────────────────────────────────────── */
  function initTilt() {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    $$('.bento-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const rotX = ((y - cy) / cy) * -4;
        const rotY = ((x - cx) / cx) * 4;

        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale3d(1.01,1.01,1.01)`;
        card.style.boxShadow = `${-(x - cx) / 12}px ${-(y - cy) / 12}px 32px rgba(0,0,0,0.5), 0 0 40px rgba(225,6,0,0.08)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  /* ─── 5. CURSOR GLOW (DESKTOP) ──────────────────────────────── */
  function initCursorGlow() {
    const g1 = $('.glow-1');
    const g2 = $('.glow-2');
    if (!g1 || !g2) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let g1x = mx, g1y = my, g2x = mx, g2y = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function animate() {
      g1x += (mx - g1x) * 0.05;
      g1y += (my - g1y) * 0.05;
      g2x += ((window.innerWidth - mx) - g2x) * 0.025;
      g2y += ((window.innerHeight - my) - g2y) * 0.025;

      g1.style.transform = `translate(${g1x - 300}px, ${g1y - 300}px)`;
      g2.style.transform = `translate(${g2x - 250}px, ${g2y - 250}px)`;
      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ─── 6. DRIVER CAROUSEL ────────────────────────────────────── */
  function initDriverCarousel() {
    const grid = $('#driversGrid');
    const dotsWrap = $('#carouselDots');
    if (!grid || !dotsWrap) return;

    const cards = $$('.driver-portrait', grid);
    if (!cards.length) return;

    let perView = getPerView();
    let maxSlide = Math.max(0, cards.length - perView);
    let current = 0;
    let autoTimer;

    // Build dots
    function buildDots() {
      dotsWrap.innerHTML = '';
      const dotCount = maxSlide + 1;
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function getPerView() {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 1100) return 2;
      return 4;
    }

    function getCardW() {
      return cards[0]?.offsetWidth || 0;
    }

    function updateDots() {
      $$('.carousel-dot', dotsWrap).forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxSlide));
      const gap = 16;
      const offset = current * (getCardW() + gap);
      grid.scrollTo({ left: offset, behavior: 'smooth' });
      updateDots();
      resetAuto();
    }

    function nextSlide() {
      if (current >= maxSlide) goTo(0);
      else goTo(Math.min(current + perView, maxSlide));
    }

    function startAuto() {
      autoTimer = setInterval(nextSlide, 3800);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    // Recalc on resize
    function recalc() {
      perView = getPerView();
      maxSlide = Math.max(0, cards.length - perView);
      buildDots();
      updateDots();
    }

    // Sync dots with manual scroll
    grid.addEventListener('scroll', () => {
      const gap = 16;
      const cw = getCardW();
      if (!cw) return;
      const newIdx = Math.round(grid.scrollLeft / (cw + gap));
      if (newIdx !== current && newIdx <= maxSlide) {
        current = newIdx;
        updateDots();
      }
    }, { passive: true });

    // Drag to scroll
    let isDragging = false, startX = 0, startScroll = 0;

    grid.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - grid.offsetLeft;
      startScroll = grid.scrollLeft;
      grid.classList.add('active-drag');
    });

    grid.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - grid.offsetLeft;
      grid.scrollLeft = startScroll - (x - startX) * 1.8;
    });

    ['mouseup', 'mouseleave'].forEach(ev =>
      grid.addEventListener(ev, () => {
        isDragging = false;
        grid.classList.remove('active-drag');
      })
    );

    // Pause autoplay on hover/touch
    grid.addEventListener('mouseenter', () => clearInterval(autoTimer));
    grid.addEventListener('mouseleave', startAuto);
    grid.addEventListener('touchstart', () => clearInterval(autoTimer), { passive: true });
    grid.addEventListener('touchend', startAuto, { passive: true });

    window.addEventListener('resize', () => {
      clearTimeout(window._carouselResize);
      window._carouselResize = setTimeout(recalc, 120);
    });

    buildDots();
    startAuto();
  }

  /* ─── 7. STANDINGS TABS ─────────────────────────────────────── */
  function initStandingsTabs() {
    const tabs = $$('.standings-tab');
    const views = $$('.standings-view');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        views.forEach(v => (v.style.display = 'none'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const target = document.getElementById(tab.dataset.target);
        if (target) target.style.display = 'block';
      });
    });
  }

  /* ─── 8. LIVE STANDINGS ─────────────────────────────────────── */
  const TEAM_COLORS = {
    red_bull: '#1e3a8a', ferrari: '#dc2626', mercedes: '#00d2be',
    mclaren: '#ff8c00', aston_martin: '#006a4e', williams: '#00a0de',
    alpine: '#0084c7', racing_bulls: '#0f172a', rb: '#0f172a',
    haas: '#ffffff', audi: '#ff0000', sauber: '#ff0000',
    cadillac: '#a2a2a2', andretti: '#a2a2a2',
  };

  const TEAM_NAMES = {
    red_bull: 'Red Bull', ferrari: 'Ferrari', mercedes: 'Mercedes',
    mclaren: 'McLaren', aston_martin: 'Aston Martin', williams: 'Williams',
    alpine: 'Alpine', racing_bulls: 'Racing Bulls', rb: 'Racing Bulls',
    haas: 'Haas', audi: 'Audi', sauber: 'Audi', cadillac: 'Cadillac', andretti: 'Cadillac',
  };

  async function loadMiniStandings() {
    const dCont = $('#mini-driver-standings');
    const cCont = $('#mini-constructor-standings');
    if (!dCont && !cCont) return;

    // Check cache
    const CACHE_TTL = 30 * 60 * 1000; // 30min
    const cached = (() => {
      try {
        const raw = sessionStorage.getItem('f1_standings_cache');
        if (!raw) return null;
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL) return null;
        return data;
      } catch { return null; }
    })();

    let dData, cData;

    if (cached) {
      ({ dData, cData } = cached);
    } else {
      const [dRaw, cRaw] = await Promise.all([
        safeFetch(`${API}/current/driverStandings.json`),
        safeFetch(`${API}/current/constructorStandings.json`),
      ]);

      dData = dRaw?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
      cData = cRaw?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

      try {
        sessionStorage.setItem('f1_standings_cache', JSON.stringify({ ts: Date.now(), data: { dData, cData } }));
      } catch { /* ignore */ }
    }

    function makeDriverRow(d) {
      const cid = d.Constructors?.[0]?.constructorId || 'unknown';
      const color = TEAM_COLORS[cid] || '#666';
      const teamName = TEAM_NAMES[cid] || d.Constructors?.[0]?.name || '';
      return `
        <div class="mini-row">
          <span class="mini-pos">${d.position}</span>
          <div class="mini-name-col">
            <span class="mini-color" style="background:${color};"></span>
            <span class="mini-name">${d.Driver.givenName} ${d.Driver.familyName}
              <span class="mini-team-sub">${teamName}</span>
            </span>
          </div>
          <span class="mini-pts">${d.points}</span>
        </div>`;
    }

    function makeTeamRow(c) {
      const cid = c.Constructor.constructorId;
      const color = TEAM_COLORS[cid] || '#666';
      const name = TEAM_NAMES[cid] || c.Constructor.name;
      return `
        <div class="mini-row">
          <span class="mini-pos">${c.position}</span>
          <div class="mini-name-col">
            <span class="mini-color" style="background:${color};"></span>
            <span class="mini-name">${name}</span>
          </div>
          <span class="mini-pts">${c.points}</span>
        </div>`;
    }

    if (dCont) {
      if (!dData.length) {
        dCont.innerHTML = '<p style="text-align:center;color:#555;padding:20px;font-size:.85rem;">No 2026 standings yet.</p>';
      } else {
        dCont.innerHTML = dData.slice(0, 10).map(makeDriverRow).join('');
      }
    }

    if (cCont) {
      if (!cData.length) {
        cCont.innerHTML = '<p style="text-align:center;color:#555;padding:20px;font-size:.85rem;">No 2026 standings yet.</p>';
      } else {
        cCont.innerHTML = cData.slice(0, 10).map(makeTeamRow).join('');
      }
    }
  }

  /* ─── 9. NEXT RACE COUNTDOWN (main widget) ──────────────────── */
  async function initNextRace() {
    const nameEl  = $('#nr-name');
    const circEl  = $('#nr-circuit');
    const dateEl  = $('#nr-date');
    const gridEl  = $('#countdownGrid');
    const calBtn  = $('#addToCalendarBtn');

    if (!nameEl) return;

    // Try sessionStorage first
    let race = null;
    try {
      const raw = sessionStorage.getItem('f1_next_race');
      if (raw) {
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts < 60 * 60 * 1000) race = data;
      }
    } catch { /* ignore */ }

    if (!race) {
      const d = await safeFetch(`${API}/current.json`);
      const races = d?.MRData?.RaceTable?.Races || [];
      const now = Date.now();
      race = races.find(r => {
        const t = r.time ? r.time.substring(0, 8) : '14:00:00';
        return new Date(`${r.date}T${t}Z`).getTime() > now;
      });

      if (race) {
        try {
          sessionStorage.setItem('f1_next_race', JSON.stringify({ ts: Date.now(), data: race }));
        } catch { /* ignore */ }
      }
    }

    if (!race) return;

    nameEl.textContent = race.raceName;

    if (circEl) {
      const pin = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
      circEl.innerHTML = `${pin} ${race.Circuit.circuitName}, ${race.Circuit.Location.country}`;
    }

    if (dateEl) {
      const [y, mo, d] = race.date.split('-').map(Number);
      const dt = new Date(y, mo - 1, d);
      const cal = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
      dateEl.innerHTML = `${cal} ${dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    }

    // Countdown
    const raceTime = new Date(`${race.date}T${race.time || '14:00:00Z'}`).getTime();

    function tick() {
      const diff = raceTime - Date.now();
      if (diff <= 0) {
        if (gridEl) gridEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;font-size:1.3rem;font-weight:900;color:#10b981;font-family:var(--font-display);letter-spacing:.05em;">🏁 RACE IS LIVE</div>';
        return;
      }
      const dEl = $('#cd-days'); const hEl = $('#cd-hours');
      const mEl = $('#cd-mins'); const sEl = $('#cd-secs');
      if (dEl) dEl.textContent = pad(diff / 86400000);
      if (hEl) hEl.textContent = pad((diff % 86400000) / 3600000);
      if (mEl) mEl.textContent = pad((diff % 3600000) / 60000);
      if (sEl) sEl.textContent = pad((diff % 60000) / 1000);
    }

    tick();
    setInterval(tick, 1000);

    // Add to Calendar button
    if (calBtn && race.time) {
      const [rh, rm, rs] = race.time.replace('Z', '').split(':').map(Number);
      const [ry, rmo, rd] = race.date.split('-').map(Number);
      const start = new Date(Date.UTC(ry, rmo - 1, rd, rh, rm, rs));
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const fmt = d => d.toISOString().replace(/[-:.][\d]{3}/g, '').replace(/[-:]/g, '');
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=🏎️+F1:+${encodeURIComponent(race.raceName)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(race.Circuit.circuitName)}`;
      calBtn.style.display = 'inline-flex';
      calBtn.addEventListener('click', (e) => { e.preventDefault(); window.open(url, '_blank'); });
    }
  }

  /* ─── 10. BACK TO TOP ───────────────────────────────────────── */
  function initBackToTop() {
    const btn = $('#backToTop') || document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ─── 11. HERO PARALLAX (subtle) ────────────────────────────── */
  function initHeroParallax() {
    const bg = $('.hero-bg-img');
    if (!bg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        bg.style.transform = `scale(1.05) translateY(${y * 0.3}px)`;
      }
    }, { passive: true });
  }

  /* ─── 12. HERO STATS STRIP COUNTER ANIMATION ────────────────── */
  function initHeroCounters() {
    const nums = $$('.hss-num');
    if (!nums.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const raw = el.textContent.trim();
          const suffix = raw.replace(/[\d]/g, '');
          const target = parseInt(raw) || 0;
          if (!target) return;

          let start = 0;
          const duration = 800;
          const step = target / (duration / 16);
          const interval = setInterval(() => {
            start = Math.min(start + step, target);
            el.textContent = Math.floor(start) + suffix;
            if (start >= target) {
              el.textContent = target + suffix;
              clearInterval(interval);
            }
          }, 16);

          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    nums.forEach(n => observer.observe(n));
  }

  /* ─── 13. SMOOTH SECTION TRANSITIONS (editorial) ────────────── */
  function initEditorialReveal() {
    const items = $$('.editorial-item');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const idx = items.indexOf(entry.target);
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, idx * 80);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1 }
    );

    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(24px)';
      item.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(item);
    });
  }

  /* ─── 14. MOBILE SCROLL REVEAL (lightweight) ────────────────── */
  function initMobileReveal() {
    if (window.innerWidth > 768) return;

    const cards = $$('.bento-card, .driver-card, .team-card, .circuit-card');
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    cards.forEach(card => observer.observe(card));
  }

  /* ─── 15. LIVE RACE BAR HIDE ON SCROLL DOWN ─────────────────── */
  function initLiveBarScroll() {
    if (!lrbBar) return;
    let lastY = 0;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 80 && y > lastY) {
        lrbBar.classList.add('hide');
      } else {
        lrbBar.classList.remove('hide');
      }
      lastY = y;
    }, { passive: true });
  }

  /* ─── INIT ──────────────────────────────────────────────────── */
  function init() {
    initNavbarScroll();
    initScrollReveal();
    initCursorGlow();
    initStandingsTabs();
    initBackToTop();
    initHeroParallax();
    initHeroCounters();
    initEditorialReveal();
    initMobileReveal();
    initLiveBarScroll();

    // Async (no blocking)
    initLiveRaceBar();
    initNextRace();
    loadMiniStandings();
    initDriverCarousel();
    initTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();