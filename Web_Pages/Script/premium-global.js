/* ═══════════════════════════════════════════════════════════════
   premium-global.js
   Universal interactions — loads on EVERY page via common.js
   Navbar scroll · Reveal · Cursor glow · Tilt · Back-to-top ·
   Page transitions · Mobile touch feel
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ─── UTILS ─────────────────────────────────────────────────── */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const isMobile = () => window.innerWidth <= 768;
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── 1. INJECT AMBIENT GLOW ORBS ───────────────────────────── */
  function injectGlowOrbs() {
    if (isMobile()) return;
    if ($('.pg-glow-wrap')) return;

    const wrap = document.createElement('div');
    wrap.className = 'pg-glow-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <div class="pg-glow pg-glow-1"></div>
      <div class="pg-glow pg-glow-2"></div>
    `;
    document.body.insertAdjacentElement('afterbegin', wrap);
  }

  /* ─── 2. CURSOR GLOW (desktop) ──────────────────────────────── */
  function initCursorGlow() {
    if (isMobile() || prefersReducedMotion()) return;

    const g1 = $('.pg-glow-1');
    const g2 = $('.pg-glow-2');
    if (!g1 || !g2) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let g1x = mx, g1y = my, g2x = mx, g2y = my;

    window.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    let rafId;
    function animate() {
      g1x += (mx - g1x) * 0.055;
      g1y += (my - g1y) * 0.055;
      g2x += ((window.innerWidth  - mx) - g2x) * 0.028;
      g2y += ((window.innerHeight - my) - g2y) * 0.028;

      g1.style.transform = `translate(${g1x - 300}px, ${g1y - 300}px)`;
      g2.style.transform = `translate(${g2x - 250}px, ${g2y - 250}px)`;
      rafId = requestAnimationFrame(animate);
    }

    animate();

    // Pause when tab not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else animate();
    });
  }

  /* ─── 3. NAVBAR SCROLL BEHAVIOUR ────────────────────────────── */
  function initNavbarScroll() {
    const header = $('.site-header');
    if (!header) return;

    let lastY = 0;
    let ticking = false;
    const HIDE_THRESHOLD = 80; // px scrolled before hiding on mobile

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;

        // Solid background
        header.classList.toggle('pg-scrolled', y > 20);

        // Hide on scroll-down (mobile only)
        if (isMobile()) {
          if (y > lastY && y > HIDE_THRESHOLD) {
            header.classList.add('pg-hidden');
          } else {
            header.classList.remove('pg-hidden');
          }
        } else {
          header.classList.remove('pg-hidden');
        }

        lastY = y;
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial state
  }

  /* ─── 4. SCROLL REVEAL ──────────────────────────────────────── */
  function initScrollReveal() {
    if (prefersReducedMotion()) return;

    // Selectors to auto-reveal on every page
    const SELECTORS = [
      '.bento-card',
      '.driver-card',
      '.team-card',
      '.circuit-card',
      '.race-card',
      '.era-card',
      '.tech-spec-card',
      '.feature-card',
      '.editorial-item',
      '.reveal',
      '.fade-in',
    ].join(',');

    const targets = $$(SELECTORS);
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => {
        el.classList.add('pg-reveal', 'pg-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;

        // Stagger siblings inside the same parent
        const parent = el.parentElement;
        const siblings = parent
          ? $$(SELECTORS, parent).filter(s => !s.classList.contains('pg-visible'))
          : [el];
        const idx = siblings.indexOf(el);
        const delay = Math.max(0, idx) * 55;

        setTimeout(() => {
          el.classList.add('pg-visible');
          // Also handle legacy class names
          el.classList.add('visible');
          el.classList.add('is-visible');
        }, delay);

        observer.unobserve(el);
      });
    }, {
      threshold: 0.07,
      rootMargin: '0px 0px -30px 0px',
    });

    targets.forEach(el => {
      el.classList.add('pg-reveal');
      observer.observe(el);
    });
  }

  /* ─── 5. 3D TILT (desktop cards) ────────────────────────────── */
  function initTilt() {
    if (isMobile() || prefersReducedMotion()) return;

    const TILT_CARDS = [
      '.bento-card',
      '.driver-card',
      '.team-card',
      '.circuit-card',
      '.era-card',
      '.tech-spec-card',
    ].join(',');

    $$( TILT_CARDS ).forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x  = e.clientX - rect.left;
        const y  = e.clientY - rect.top;
        const cx = rect.width  / 2;
        const cy = rect.height / 2;

        const rotX = ((y - cy) / cy) * -3.5;
        const rotY = ((x - cx) / cx) *  3.5;

        card.style.transform =
          `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale3d(1.01,1.01,1.01)`;
        card.style.boxShadow =
          `${-(x - cx) / 14}px ${-(y - cy) / 14}px 28px rgba(0,0,0,0.5), 0 0 36px rgba(225,6,0,0.08)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  /* ─── 6. BACK TO TOP ────────────────────────────────────────── */
  function initBackToTop() {
    // Wait for footer to be injected (common.js loads it async)
    let tries = 0;
    const poll = setInterval(() => {
      const btn = $('#backToTop') || $('.back-to-top');
      if (btn || tries++ > 20) {
        clearInterval(poll);
        if (!btn) return;

        window.addEventListener('scroll', () => {
          btn.classList.toggle('show', window.scrollY > 380);
        }, { passive: true });

        btn.addEventListener('click', () =>
          window.scrollTo({ top: 0, behavior: 'smooth' })
        );
      }
    }, 400);
  }

  /* ─── 7. MOBILE TOUCH FEEDBACK ──────────────────────────────── */
  function initMobileTouchFeedback() {
    if (!isMobile()) return;

    const PRESS_TARGETS = [
      '.bento-card', '.driver-card', '.team-card',
      '.circuit-card', '.race-card', '.c-logo-box',
      '.btn', '.filter-btn', '.driver-portrait',
    ].join(',');

    document.addEventListener('touchstart', e => {
      const el = e.target.closest(PRESS_TARGETS);
      if (el) el.style.transform = 'scale(0.97)';
    }, { passive: true });

    document.addEventListener('touchend', e => {
      const el = e.target.closest(PRESS_TARGETS);
      if (el) {
        setTimeout(() => { el.style.transform = ''; }, 180);
      }
    }, { passive: true });
  }

  /* ─── 8. SMOOTH PAGE ENTRY ──────────────────────────────────── */
  function initPageEntry() {
    if (prefersReducedMotion()) return;

    // The CSS handles the fade-in via animation on main/body.
    // Here we ensure the body is ready before painting.
    document.documentElement.style.opacity = '1';
  }

  /* ─── 9. ACTIVE NAV LINK ────────────────────────────────────── */
  function highlightActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    $$('.main-nav a').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop();
      a.classList.toggle('active', href === page);
    });
  }

  /* ─── 10. COUNTER ANIMATION ─────────────────────────────────── */
  function initCounters() {
    if (prefersReducedMotion()) return;

    const COUNTER_SELECTORS = [
      '.stat-number',
      '.stat-num',
      '.hss-num',
      '.highlight-value',
    ].join(',');

    const els = $$(COUNTER_SELECTORS);
    if (!els.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        const raw    = el.textContent.trim();
        const digits = raw.match(/[\d]+/)?.[0];
        const prefix = raw.match(/^[^\d]*/)?.[0] || '';
        const suffix = raw.match(/[^\d]+$/)?.[0] || '';

        if (!digits) return;

        const target   = parseInt(digits, 10);
        const duration = 700;
        const fps      = 60;
        const steps    = Math.floor(duration / (1000 / fps));
        const inc      = target / steps;
        let current    = 0;
        let frame      = 0;

        const interval = setInterval(() => {
          frame++;
          current = Math.min(current + inc, target);
          el.textContent = prefix + Math.floor(current) + suffix;
          if (frame >= steps) {
            el.textContent = prefix + target + suffix;
            clearInterval(interval);
          }
        }, 1000 / fps);

        observer.unobserve(el);
      });
    }, { threshold: 0.6 });

    els.forEach(el => observer.observe(el));
  }

  /* ─── 11. IMAGE LAZY LOAD FADE ──────────────────────────────── */
  function initImageFade() {
    if (prefersReducedMotion()) return;

    const imgs = $$('img[loading="lazy"]');

    imgs.forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease';

      if (img.complete) {
        img.style.opacity = '1';
      } else {
        img.addEventListener('load', () => { img.style.opacity = '1'; });
        img.addEventListener('error', () => { img.style.opacity = '1'; });
      }
    });
  }

  /* ─── 12. CARD SHIMMER ENTRANCE ─────────────────────────────── */
  function initCardShimmerEntrance() {
    if (prefersReducedMotion()) return;

    // Adds a subtle one-time shimmer to cards entering the viewport
    const cards = $$('.bento-card, .driver-card, .team-card, .circuit-card');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const card = entry.target;

        // Add a quick border flash on entry
        const originalBorder = card.style.borderColor;
        card.style.borderColor = 'rgba(225,6,0,0.35)';
        setTimeout(() => {
          card.style.borderColor = originalBorder || '';
        }, 600);

        observer.unobserve(card);
      });
    }, { threshold: 0.15 });

    cards.forEach(c => observer.observe(c));
  }

  /* ─── 13. FLOATING SHORTCUTS BUTTON STYLE FIX ───────────────── */
  function fixShortcutButton() {
    // Ensure the floating keyboard shortcut button doesn't clash with back-to-top
    const kbBtn = $('.floating-shortcut-btn');
    if (!kbBtn) return;

    // Move it to avoid overlapping back-to-top
    kbBtn.style.bottom = '72px';
    kbBtn.style.right  = '24px';
  }

  /* ─── 14. SEARCH BUTTON PULSE ───────────────────────────────── */
  function initSearchButtonPulse() {
    const btn = $('.search-button');
    if (!btn) return;

    btn.addEventListener('mouseenter', () => {
      btn.style.boxShadow = '0 0 0 3px rgba(225,6,0,0.2)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.boxShadow = '';
    });
  }

  /* ─── 15. HERO SECTION BORDER ACCENT ────────────────────────── */
  function initHeroBorderAccent() {
    // Adds a bottom red line to page hero sections (non-homepage)
    const heroes = $$(
      '.drivers-hero, .teams-hero, .circuits-hero, ' +
      '.schedule-hero, .analytics-hero, .about-hero'
    );

    heroes.forEach(hero => {
      if (hero.querySelector('.pg-hero-accent')) return;
      const line = document.createElement('div');
      line.className = 'pg-hero-accent';
      line.setAttribute('aria-hidden', 'true');
      line.style.cssText = `
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, var(--pg-accent, #e10600), transparent);
        opacity: 0.5;
      `;
      hero.style.position = 'relative';
      hero.appendChild(line);
    });
  }

  /* ─── 16. FOCUS VISIBLE STYLES ──────────────────────────────── */
  function initFocusStyles() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        document.body.classList.add('pg-keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('pg-keyboard-nav');
    });

    const style = document.createElement('style');
    style.textContent = `
      .pg-keyboard-nav *:focus {
        outline: 2px solid rgba(225,6,0,0.8) !important;
        outline-offset: 3px !important;
      }
    `;
    document.head.appendChild(style);
  }

  /* ─── INIT — DOM READY ──────────────────────────────────────── */
  function init() {
    injectGlowOrbs();
    initCursorGlow();
    initNavbarScroll();
    initScrollReveal();
    initTilt();
    initBackToTop();
    initMobileTouchFeedback();
    initPageEntry();
    highlightActiveNav();
    initCounters();
    initImageFade();
    initCardShimmerEntrance();
    fixShortcutButton();
    initSearchButtonPulse();
    initHeroBorderAccent();
    initFocusStyles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ─── RE-RUN REVEAL AFTER DYNAMIC CONTENT ───────────────────── */
  // Some pages inject cards after load (drivers.js, teams.js, etc.)
  // We watch for DOM additions and re-run reveal on new cards
  if ('MutationObserver' in window) {
    let revealDebounce;

    const mo = new MutationObserver(() => {
      clearTimeout(revealDebounce);
      revealDebounce = setTimeout(() => {
        initScrollReveal();
        initTilt();
        initCounters();
        initImageFade();
        initCardShimmerEntrance();
      }, 300);
    });

    mo.observe(document.body, { childList: true, subtree: true });
  }

})();