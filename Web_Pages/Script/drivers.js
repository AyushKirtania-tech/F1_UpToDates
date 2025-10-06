/* drivers.js — manual championships + fixed filtering (cards get data-category)
   Replace your existing Script/drivers.js with this file.
*/

(() => {
  /* ---------- Configuration ---------- */
  const API_BASE = 'https://api.jolpi.ca/ergast/f1'; // keep your proxy if needed
  const CURRENT_SEASON = '2025';

  /* ---------- DOM helpers ---------- */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /* ---------- Manual championships (edit these values) ---------- */
  /* --- MANUAL CHAMPIONS: edit here --- */
  const manualChampionships = {
    'max_verstappen': 4,
    'leclerc': 0,
    'hamilton': 7,
    'russell': 0,
    'perez': 0,
    'sainz': 0,
    'norris': 0,
    'piastri': 0,
    'alonso': 2,
    'stroll': 0,
    'tsunoda': 0,
    'gasly': 0,
    'albon': 0,
    'ocon': 0,
    'hulkenberg': 0,
    'zhou': 0,
    'bottas': 0,
    'sargeant': 0,
    'magnussen': 0,
    'doohan': 0,
    'lawson': 0
  };
  /* ----------------------------------- */

  /* ---------- API helpers & verification ---------- */
  async function fetchJSON(url) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
      return await r.json();
    } catch (err) {
      console.error('fetchJSON error for', url, err);
      return null;
    }
  }

  async function fetchDrivers() {
    const url = `${API_BASE}/${CURRENT_SEASON}/drivers.json`;
    const data = await fetchJSON(url);
    return data?.MRData?.DriverTable?.Drivers || [];
  }

  async function fetchDriverStandings() {
    const url = `${API_BASE}/${CURRENT_SEASON}/driverStandings.json`;
    const data = await fetchJSON(url);
    return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  }

  /**
   * Fetch per-driver stats: wins, podiums, (championships from manual map), races.
   * Championships are taken from manualChampionships[driverId] || 0
   */
  async function fetchDriverStats(driverId) {
    try {
      // 1) Wins: count via results/1
      const winsData = await fetchJSON(`${API_BASE}/drivers/${driverId}/results/1.json?limit=1000`);
      const wins = parseInt(winsData?.MRData?.total || '0', 10);

      // 2) Podiums + total races: iterate through results (limit large to include career)
      const resultsData = await fetchJSON(`${API_BASE}/drivers/${driverId}/results.json?limit=1000`);
      const races = resultsData?.MRData?.RaceTable?.Races || [];
      let podiums = 0;
      races.forEach(race => {
        const res = race?.Results?.[0];
        if (!res) return;
        const pos = Number.isFinite(Number(res.position)) ? Number(res.position) : Number.POSITIVE_INFINITY;
        if (!Number.isNaN(pos) && pos <= 3) podiums++;
      });
      const totalRaces = Number(resultsData?.MRData?.total || races.length || 0);

      // 3) Championships: from manual map only
      const championships = Number.isFinite(Number(manualChampionships[driverId])) ? Number(manualChampionships[driverId]) : 0;

      console.debug(`stats[${driverId}] => champs:${championships} (manual), wins:${wins}, podiums:${podiums}, races:${totalRaces}`);

      return {
        wins: Number.isFinite(wins) ? wins : 0,
        podiums: Number.isFinite(podiums) ? podiums : 0,
        championships: Number.isFinite(championships) ? championships : 0,
        races: Number.isFinite(totalRaces) ? totalRaces : races.length
      };
    } catch (err) {
      console.error('Error fetching driver stats for', driverId, err);
      return { wins: 0, podiums: 0, championships: manualChampionships[driverId] || 0, races: 0 };
    }
  }

  /* ---------- Team / flag / image helpers (kept your existing mappings) ---------- */
  const teamColors = {
    'red_bull': 'linear-gradient(135deg,#1e3a8a,#3730a3)',
    'ferrari': 'linear-gradient(135deg,#dc2626,#991b1b)',
    'mercedes': 'linear-gradient(135deg,#00d2be,#00a19c)',
    'mclaren': 'linear-gradient(135deg,#ff8c00,#ff6600)',
    'alpine': 'linear-gradient(135deg,#0084c7,#005a8f)',
    'aston_martin': 'linear-gradient(135deg,#006a4e,#004d3b)',
    'williams': 'linear-gradient(135deg,#00a0de,#0073a3)',
    'rb': 'linear-gradient(135deg,#0f172a,#1e293b)',
    'kick_sauber': 'linear-gradient(135deg,#0b3b1f,#0f5a2f)',
    'haas': 'linear-gradient(135deg,#6b7280,#374151)',
    'alphatauri': 'linear-gradient(135deg,#0f172a,#1e293b)',
    'alfa': 'linear-gradient(135deg,#900,#600)',
    'racing_bulls': 'linear-gradient(135deg,#0f172a,#1e293b)',
    'sauber': 'linear-gradient(135deg,#0b3b1f,#0f5a2f)'
  };
  function getTeamColor(constructorId) { return teamColors[constructorId] || 'linear-gradient(135deg,#333,#555)'; }

  const flagMap = {
    'British': 'uk.jpg','Dutch': 'netherlands.webp','Monegasque': 'monaco.png','Spanish': 'spain.png','Mexican': 'mexico.png',
    'Thai': 'thailand.png','Japanese': 'japan.png','French': 'france.png','Australian': 'australia.png','German': 'germany.jpg',
    'Canadian': 'canada.png','Finnish': 'finland.svg','Danish': 'denmark.png','Chinese': 'china.png','American': 'usa.png',
    'Italian': 'italy.webp','Brazilian': 'brazil.png','Argentine': 'argentina.png','New Zealander': 'new-zealand.png'
  };
  function getFlagImage(nationality) { return flagMap[nationality] || 'default.png'; }

  // small manual corrections (maintainable)
  function getCorrectTeam(driverId, apiTeam) {
    const corrections = {
      'tsunoda': { name: 'Red Bull', constructorId: 'red_bull' },
      'lawson': { name: 'RB F1 team', constructorId: 'rb' }
    };
    return corrections[driverId] || { name: apiTeam?.name || 'Unknown', constructorId: apiTeam?.constructorId || '' };
  }

  function getDriverImageFilename(driverId) {
    const imageMap = {
      'max_verstappen': 'max.jpg','norris': 'lando.webp','leclerc': 'leclerc.jpg','hamilton': 'lewis.jpg',
      'russell': 'george.jpg','sainz': 'carlos.jpeg','piastri': 'piastri.webp','alonso': 'alonso.jpg',
      'stroll': 'lance.jpg','tsunoda': 'yuki.webp','gasly': 'gasly.jpg','albon': 'albon.jpg',
      'ocon': 'ocon.avif','hulkenberg': 'nico.jpg','perez': 'perez.jpg','zhou': 'zhou.jpg',
      'bottas': 'bottas.jpg','sargeant': 'logan.jpg','magnussen': 'kevin.jpg','doohan': 'Doohan.webp',
      'lawson': 'liam.avif','de_vries': 'devries.jpg','bearman': 'oliver.webp','antonelli': 'antonelli.avif',
      'colapinto': 'franco.webp','hadjar': 'isack.webp','bortoleto': 'gabriel.webp'
    };
    return imageMap[driverId] || `${driverId}.jpg`;
  }

  /* ---------- Card creation (consistent stats: Championships / Wins / Podiums) ---------- */
  function createDriverCard(driver, standing, stats) {
    const { driverId, givenName, familyName, nationality, permanentNumber, url } = driver;
    const apiTeam = standing?.Constructors?.[0];
    const corrected = getCorrectTeam(driverId, apiTeam);
    const teamName = corrected.name || 'Unknown Team';
    const constructorId = corrected.constructorId || '';
    const position = standing?.position || 'N/A';
    const points = standing?.points || '0';

    const card = document.createElement('article');
    card.className = 'driver-card reveal';
    card.dataset.team = constructorId;
    card.dataset.link = url || '#';

    // Build data-category values for filtering:
    // - 'current' if driver has a standing entry in current season
    // - 'podium' if career podiums > 0
    // - 'winner' if career wins > 0
    // - 'champion' if championships (manual) > 0
    // - include constructor id for team filtering
    const categories = [];
    if (standing) categories.push('current');
    if (stats && Number(stats.podiums) > 0) categories.push('podium');
    if (stats && Number(stats.wins) > 0) categories.push('winner');
    if (stats && Number(stats.championships) > 0) categories.push('champion');
    if (constructorId) categories.push(constructorId);
    // always include 'all' for universal matching
    categories.push('all');
    // set data-category attribute used by the filters
    card.dataset.category = categories.join(' ');

    // if no standing present indicate that clearly
    const standingBadge = (!standing) ? `<div class="standing-badge" title="No current standing found">No standing</div>` : '';

    card.innerHTML = `
      <div class="driver-header" style="background: ${getTeamColor(constructorId)};">
        <div>
          <div class="driver-number">#${permanentNumber || position}</div>
          ${standingBadge}
        </div>
        <div class="country-flag">
          <img src="images/flags/${getFlagImage(nationality)}" alt="${nationality}" onerror="this.style.display='none'">
        </div>
      </div>

      <div class="driver-image">
        <img src="images/drivers/${getDriverImageFilename(driverId)}" alt="${givenName} ${familyName}" loading="lazy" onerror="this.src='images/driver-fallback.jpg'">
      </div>

      <div class="driver-details">
        <h2>${givenName} ${familyName}</h2>
        <p class="team-name">${teamName} <span class="points-line">• ${points} pts</span></p>

        <div class="driver-stats">
          <div class="stat"><span class="stat-value">${stats.championships}</span><span class="stat-desc">Championships</span></div>
          <div class="stat"><span class="stat-value">${stats.wins}</span><span class="stat-desc">Wins</span></div>
          <div class="stat"><span class="stat-value">${stats.podiums}</span><span class="stat-desc">Podiums</span></div>
        </div>

        <p class="driver-description">Position: ${position} — ${nationality} driver in ${CURRENT_SEASON}.</p>
      </div>
    `;

    return card;
  }

  /* ---------- Load and render drivers, then move legends to end ---------- */
  async function loadDrivers() {
    const grid = $('#driversGrid');
    const loadingMsg = $('#loadingMessage');
    if (!grid) return;

    try {
      const [drivers, standings] = await Promise.all([fetchDrivers(), fetchDriverStandings()]);

      // print the driverIds so you can copy them into manualChampionships
      console.info('Driver IDs (copy these into manualChampionships):', drivers.map(d => d.driverId));

      // find current legend cards present in the HTML (count them)
      const initialLegends = Array.from(grid.querySelectorAll('.legend-card'));
      const legendCount = initialLegends.length;

      if (!drivers.length) {
        if (loadingMsg) loadingMsg.innerHTML = '<p style="color:var(--accent)">No drivers returned from API</p>';
        console.warn('No drivers returned from API for season', CURRENT_SEASON);
      } else {
        if (loadingMsg) loadingMsg.remove();
      }

      console.info(`Loaded ${drivers.length} drivers and ${standings.length} standings from API for ${CURRENT_SEASON}.`);

      // update hero stats
      const totalDriversEl = $('#totalDrivers');
      const totalCountriesEl = $('#totalCountries');
      const nationalities = new Set(drivers.map(d => d.nationality));
      if (totalDriversEl) totalDriversEl.textContent = (drivers.length + legendCount).toString();
      if (totalCountriesEl) totalCountriesEl.textContent = String(nationalities.size);


      // Create API driver cards sequentially (safer for rate-limited endpoints)
      for (const driver of drivers) {
        // find standing entry for this driver
        const standing = standings.find(s => s.Driver?.driverId === driver.driverId);
        const stats = await fetchDriverStats(driver.driverId);
        // sanity check: if standing exists but has unexpected values, log
        if (standing && typeof standing.points === 'undefined') {
          console.warn(`Standing for ${driver.driverId} exists but points missing`, standing);
        }
        const card = createDriverCard(driver, standing, stats);
        grid.appendChild(card);
      }

      // move static legend cards to the end of the grid so they display after API drivers
      const legendNodes = Array.from(grid.querySelectorAll('.legend-card'));
      legendNodes.forEach(node => grid.appendChild(node));

      // after DOM is updated, init reveal / modal / filters again (safe)
      initRevealOnScroll();
      initDriverModal();
      initFilters();

      console.info('Drivers rendered. Legends moved to end of grid.');

    } catch (err) {
      console.error('Error during loadDrivers()', err);
      if (loadingMsg) loadingMsg.innerHTML = '<p style="color:var(--accent)">Error loading drivers — see console.</p>';
    }
  }

  /* ---------- includeHTML & nav logic (kept) ---------- */
  async function includeHTML(id, path) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
      const resp = await fetch(path, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      container.innerHTML = await resp.text();
      setActiveNavLink();
    } catch (err) {
      console.warn(`Could not load '${path}' into #${id}:`, err.message);
      container.innerHTML = '';
    }
  }
  function setActiveNavLink() {
    requestAnimationFrame(() => {
      const links = Array.from(document.querySelectorAll('.main-nav a, nav a'));
      if (!links.length) return;
      const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
      links.forEach(a => {
        const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
        const isActive = href && (href === current || (href === '' && current === 'index.html'));
        a.classList.toggle('active', isActive);
        a.setAttribute('aria-current', isActive ? 'page' : 'false');
      });
    });
  }

  /* ---------- FILTERS (kept but re-usable) ---------- */
  function initFilters() {
    const buttons = Array.from(document.querySelectorAll('.filter-btn'));
    const noResults = $('#noResults');
    if (!buttons.length) return;

    // normalization map so buttons that use slightly different names still work
    const normMap = {
      'podium-winners': 'podium',
      'podium-winner': 'podium',
      'podiums': 'podium',
      'podium': 'podium',
      'current-drivers': 'current',
      'current-driver': 'current',
      'current': 'current',
      'winners': 'winner',
      'winner': 'winner',
      'champions': 'champion',
      'champion': 'champion',
      'all': 'all'
    };

    function normalizeFilterName(name) {
      if (!name) return 'all';
      const raw = String(name).toLowerCase().trim();
      return normMap[raw] || raw; // if unknown, return raw string (works if we set categories accordingly)
    }

    function cardCats(card) {
      return (card.dataset.category || 'all').toLowerCase().trim().split(/\s+/);
    }
    function applyFilter(filter) {
      const f = normalizeFilterName(filter || 'all');
      const cards = Array.from(document.querySelectorAll('.driver-card'));
      let anyShown = false;

      buttons.forEach(btn => {
        const active = normalizeFilterName(btn.dataset.filter || 'all') === f;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });

      cards.forEach(card => {
        const cats = cardCats(card);
        const show = f === 'all' || cats.includes(f);
        if (show) {
          card.classList.remove('filtered-out', 'is-hidden');
          card.style.display = '';
          anyShown = true;
        } else {
          card.classList.add('is-hidden');
          setTimeout(() => {
            if (card.classList.contains('is-hidden')) {
              card.classList.add('filtered-out');
              card.style.display = 'none';
            }
          }, 300);
        }
      });

      if (noResults) noResults.hidden = anyShown;
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
      btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
    });

    const start = buttons.find(b => b.classList.contains('active'))?.dataset.filter || 'all';
    applyFilter(start);
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  function initRevealOnScroll() {
    const targets = Array.from(document.querySelectorAll('.reveal:not(.visible)'));
    if (!targets.length) return;
    if (!('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('visible'));
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
    targets.forEach(t => obs.observe(t));
  }

  /* ---------- DRIVER MODAL (kept but safe) ---------- */
  function initDriverModal() {
    const grid = document.querySelector('.drivers-grid');
    if (!grid) return;

    // If modal already present, don't re-create.
    if (document.querySelector('.driver-modal-overlay')) {
      const existing = document.querySelector('.driver-modal-overlay');
      existing.querySelector('.driver-modal-close')?.addEventListener('click', () => existing.classList.remove('visible'));
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'driver-modal-overlay';
    overlay.innerHTML = `
      <div class="driver-modal" role="dialog" aria-modal="true" aria-hidden="true">
        <button class="driver-modal-close" aria-label="Close dialog">&times;</button>
        <div class="driver-modal-body">
          <div class="driver-modal-image"><img alt=""></div>
          <div class="driver-modal-content">
            <h2 class="modal-name"></h2>
            <div class="modal-team"></div>
            <div class="modal-stats"></div>
            <p class="modal-desc-text"></p>
            <a href="#" class="modal-learn-more" target="_blank" rel="noopener noreferrer">Learn more</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const modal = overlay.querySelector('.driver-modal');
    const closeBtn = overlay.querySelector('.driver-modal-close');
    const learnMoreBtn = overlay.querySelector('.modal-learn-more');
    const modalImg = overlay.querySelector('.driver-modal-image img');
    const modalName = overlay.querySelector('.modal-name');
    const modalTeam = overlay.querySelector('.modal-team');
    const modalStats = overlay.querySelector('.modal-stats');
    const modalDesc = overlay.querySelector('.modal-desc-text');

    let lastFocused = null;
    function trapFocus(e) {
      if (!overlay.classList.contains('visible')) return;
      const focusable = modal.querySelectorAll('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    function open(card) {
      lastFocused = document.activeElement;
      const img = card.querySelector('.driver-image img');
      const name = card.querySelector('.driver-details h2')?.textContent || '';
      const team = card.querySelector('.team-name')?.textContent || '';
      const desc = card.querySelector('.driver-description')?.textContent || '';
      const statNodes = card.querySelectorAll('.driver-stats .stat');
      const driverLink = card.dataset.link || '#';

      modalImg.src = img?.src || '';
      modalImg.alt = name;
      modalName.textContent = name;
      modalTeam.textContent = team;
      modalStats.innerHTML = '';
      statNodes.forEach(s => {
        const v = s.querySelector('.stat-value')?.textContent || '';
        const d = s.querySelector('.stat-desc')?.textContent || '';
        const el = document.createElement('div');
        el.className = 'modal-stat';
        el.innerHTML = `<span class="modal-value">${v}</span><span class="modal-desc">${d}</span>`;
        modalStats.appendChild(el);
      });
      modalDesc.textContent = desc || '';
      learnMoreBtn.href = driverLink;
      learnMoreBtn.style.display = driverLink === '#' ? 'none' : 'inline-block';

      overlay.classList.add('visible');
      overlay.setAttribute('aria-hidden', 'false');
      modal.setAttribute('aria-hidden', 'false');

      requestAnimationFrame(() => closeBtn.focus());
      document.addEventListener('keydown', handleKeyDown);
      modal.addEventListener('keydown', trapFocus);
    }
    function close() {
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      modal.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', handleKeyDown);
      modal.removeEventListener('keydown', trapFocus);
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') close();
    }

    grid.addEventListener('click', e => {
      const card = e.target.closest('.driver-card');
      if (!card) return;
      if (e.target.closest('a, button')) return;
      open(card);
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  }

  /* ---------- Utility initializers ---------- */
  function bindImageFallbacks() {
    document.body.addEventListener('error', e => {
      const img = e.target;
      if (img && img.tagName === 'IMG' && !img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = '1';
        img.src = img.getAttribute('data-fallback') || 'images/driver-fallback.jpg';
      }
    }, true);
  }
  function updateYearPlaceholders() {
    const els = document.querySelectorAll('#currentYear, #yr, .current-year');
    const y = new Date().getFullYear();
    els.forEach(el => el.textContent = y);
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
      includeHTML('navbar', 'navbar.html'),
      includeHTML('footer', 'footer.html')
    ]);

    initRevealOnScroll();
    bindImageFallbacks();
    updateYearPlaceholders();
    initFilters();
    initDriverModal();

    // load drivers and then move legends to end
    await loadDrivers();
  });

})();
