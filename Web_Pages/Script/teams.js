/* teams.js — cleaned version + results-link wiring
   - Keeps includeHTML, filters, reveal-on-scroll, modal, year placeholders, image fallbacks
   - Adds wiring for a global results link and per-team "Check Results" buttons.
*/

(() => {
  /* --------- Config --------- */
  const API_ROOT = 'https://api.jolpi.ca/ergast/f1';
  const FALLBACK_RESULTS_URL = 'results.html';

  /* includeHTML: injects external html into a container */
  async function includeHTML(id, path) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
      const resp = await fetch(path, { cache: "no-store" });
      if (!resp.ok) throw new Error('Not found');
      container.innerHTML = await resp.text();
      setActiveNavLink();
    } catch (err) {
      console.warn(`Could not load ${path} for ${id}:`, err && err.message);
    }
  }

  function setActiveNavLink() {
    // small delay so included HTML has time to render
    setTimeout(() => {
      const links = document.querySelectorAll('.main-nav a');
      if (!links.length) return;
      const current = location.pathname.split('/').pop() || 'index.html';
      links.forEach(a => {
        const href = (a.getAttribute('href') || '').split('/').pop();
        a.classList.toggle('active', href === current);
      });
    }, 50);
  }

  /* --------- Filters --------- */
  function initFilters() {
    const buttons = Array.from(document.querySelectorAll('.filter-btn'));
    const cards = Array.from(document.querySelectorAll('.team-card'));
    const noResults = document.getElementById('noResults');

    if (!buttons.length || !cards.length) return;

    function applyFilter(filter) {
      let anyVisible = false;

      buttons.forEach(b => {
        const isActive = b.dataset.filter === filter;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });

      cards.forEach(card => {
        const cat = card.dataset.category || 'all';
        const matches = filter === 'all' || cat === filter;
        if (matches) {
          card.classList.remove('filtered-out');
          card.style.display = '';
          requestAnimationFrame(() => card.classList.remove('hidden'));
          anyVisible = true;
        } else {
          // hide with animation then set display none
          card.classList.add('hidden');
          setTimeout(() => card.classList.add('filtered-out'), 300);
        }
      });

      if (noResults) noResults.hidden = anyVisible;
    }

    buttons.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter || 'all')));

    // initialize using an active button if present
    const start = buttons.find(b => b.classList.contains('active'))?.dataset.filter || 'all';
    applyFilter(start);
  }

  /* --------- Reveal on scroll --------- */
  function initRevealOnScroll() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('visible'));
      return;
    }

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(t => obs.observe(t));
  }

  /* --------- Modal (team details) --------- */
  function initTeamModal() {
    const grid = document.querySelector('.teams-grid');
    if (!grid) return;

    // create overlay/modal once
    const overlay = document.createElement('div');
    overlay.className = 'team-modal-overlay';
    overlay.innerHTML = `
      <div class="team-modal" role="dialog" aria-modal="true" aria-hidden="true">
        <button class="team-modal-close" aria-label="Close">&times;</button>
        <div class="team-modal-grid">
          <div class="team-modal-image"><img alt=""></div>
          <div class="team-modal-content">
            <h2></h2>
            <div class="modal-base"></div>
            <div class="modal-stats"></div>
            <p class="modal-desc-text"></p>
            <a href="#" class="modal-learn-more">Know The Car</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const modal = overlay.querySelector('.team-modal');
    const closeBtn = overlay.querySelector('.team-modal-close');
    const learnMoreBtn = overlay.querySelector('.modal-learn-more');

    function open(card) {
      const img = card.querySelector('.team-image img');
      const title = card.querySelector('.team-info h2')?.textContent || '';
      const base = card.querySelector('.team-base')?.textContent || '';
      const desc = card.querySelector('.team-description')?.textContent || '';
      const statNodes = card.querySelectorAll('.team-stats .stat');
      const teamName = card.dataset.team || '';

      overlay.classList.add('visible');
      overlay.setAttribute('aria-hidden', 'false');
      modal.setAttribute('aria-hidden', 'false');

      const modalImg = overlay.querySelector('.team-modal-image img');
      modalImg.src = img?.src || '';
      modalImg.alt = `${title} car`;

      overlay.querySelector('.team-modal-content h2').textContent = title;
      overlay.querySelector('.modal-base').textContent = base;

      const stats = overlay.querySelector('.modal-stats');
      stats.innerHTML = '';
      statNodes.forEach(s => {
        const val = s.querySelector('.stat-value')?.textContent || '';
        const label = s.querySelector('.stat-desc')?.textContent || '';
        const el = document.createElement('div');
        el.className = 'modal-stat';
        el.innerHTML = `<span class="modal-value">${val}</span><span class="modal-desc">${label}</span>`;
        stats.appendChild(el);
      });

      overlay.querySelector('.modal-desc-text').textContent = desc || '';

      const carPageLink = teamName ? `cars/${teamName}.html` : '#';   //Kown the car button
      learnMoreBtn.href = carPageLink;
      learnMoreBtn.style.display = teamName ? 'inline-block' : 'none';

      // focus management
      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      modal.setAttribute('aria-hidden', 'true');
    }

    // delegate clicks on cards to open modal
    grid.addEventListener('click', e => {
      const card = e.target.closest('.team-card');
      if (!card) return;
      if (e.target.closest('a') || e.target.closest('button')) return;
      open(card);
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('visible')) close(); });
  }

  /* --------- Helpers --------- */
  function updateYearPlaceholders() {
    const yearEls = document.querySelectorAll('#currentYear, #yr');
    const currentYear = new Date().getFullYear();
    yearEls.forEach(el => el.textContent = currentYear);
  }

  function bindImageFallbacks() {
    document.body.addEventListener('error', e => {
      const img = e.target;
      if (img && img.tagName === 'IMG') {
        if (!img.dataset.fallbackApplied) {
          img.dataset.fallbackApplied = '1';
          img.src = img.getAttribute('data-fallback') || 'images/team-fallback.jpg';
        }
      }
    }, true);
  }

  // Fill stat boxes from data attributes (fast immediate UI)
  function fillTeamStatsFromDataAttributes() {
    document.querySelectorAll('.team-stats').forEach(statsBlock => {
      const championships = statsBlock.dataset.championships ?? '';
      const wins = statsBlock.dataset.wins ?? '';
      const founded = statsBlock.dataset.founded ?? '';

      const statValues = Array.from(statsBlock.querySelectorAll('.stat .stat-value'));
      if (statValues.length >= 3) {
        statValues[0].textContent = statValues[0].textContent.trim() || (championships || '—');
        statValues[1].textContent = statValues[1].textContent.trim() || (wins || '—');
        statValues[2].textContent = statValues[2].textContent.trim() || (founded || '—');
      }
    });
  }

  /* --------- Results links wiring --------- */
  // small helper: fetch seasons and return most recent season as string (e.g. "2025")
  async function fetchMostRecentSeason() {
    try {
      // fetch all seasons (safe) and pick the max (server returns full list)
      const resp = await fetch(`${API_ROOT}/seasons/?limit=1000`);
      if (!resp.ok) throw new Error('Network error fetching seasons');
      const json = await resp.json();
      const seasons = json?.MRData?.SeasonTable?.Seasons || [];
      const normalized = seasons
        .map(s => (typeof s === 'string' ? s : s.season))
        .filter(Boolean)
        .map(Number);
      if (!normalized.length) return null;
      const max = Math.max(...normalized);
      return String(max);
    } catch (err) {
      console.warn('fetchMostRecentSeason failed', err);
      return null;
    }
  }

  // wire global results button + per-team buttons
  async function wireResultsLinks() {
    const resultsLink = document.getElementById('resultsLink');
    const perTeamLinks = Array.from(document.querySelectorAll('.team-results-link'));
    const season = await fetchMostRecentSeason();
    const seasonParam = season ? `season=${encodeURIComponent(season)}` : null;

    // global
    if (resultsLink) {
      resultsLink.href = season ? `results.html?season=${encodeURIComponent(season)}` : FALLBACK_RESULTS_URL;
    }

    // per-team
    perTeamLinks.forEach(a => {
      const team = a.dataset.team;
      if (!team) return;
      const params = [];
      if (seasonParam) params.push(seasonParam);
      params.push('team=' + encodeURIComponent(team));
      const href = 'results.html' + (params.length ? ('?' + params.join('&')) : '');
      a.setAttribute('href', href);

      // defensive click handler to avoid "Cannot set properties of null" style errors in some older setups
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // allow open-in-new-tab
        e.preventDefault();
        window.location.href = href;
      });
    });
  }

  /* --------- Initialize on DOMContentLoaded --------- */
  document.addEventListener('DOMContentLoaded', async () => {
    // include nav & footer (non-blocking)
    await Promise.allSettled([
      includeHTML('navbar', 'navbar.html'),
      includeHTML('footer', 'footer.html')
    ]);

    // initialize UI
    initFilters();
    initRevealOnScroll();
    initTeamModal();
    updateYearPlaceholders();
    bindImageFallbacks();

    // populate stats from markup data-* attributes
    fillTeamStatsFromDataAttributes();

    // wire results links (does a single API call to get latest season)
    wireResultsLinks().catch(err => {
      // fail silently; links will still point to results.html fallback
      console.warn('wireResultsLinks error', err);
    });
  });

})();
