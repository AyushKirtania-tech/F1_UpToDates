/* drivers.js — OPTIMIZED with parallel loading and better error handling */

(() => {
  /* ---------- Configuration ---------- */
  const API_BASE = 'https://api.jolpi.ca/ergast/f1';
  const CURRENT_SEASON = '2025';

  /* ---------- DOM helpers ---------- */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /* ---------- Manual championships (UPDATE THESE WITH CORRECT VALUES) ---------- */
  const manualChampionships = {
    'max_verstappen': 4,    // 2021, 2022, 2023, 2024
    'leclerc': 0,
    'hamilton': 7,          // 2008, 2014, 2015, 2017, 2018, 2019, 2020
    'russell': 0,
    'perez': 0,
    'sainz': 0,
    'norris': 0,
    'piastri': 0,
    'alonso': 2,            // 2005, 2006
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
    'lawson': 0,
    'antonelli': 0,
    'bearman': 0,
    'colapinto': 0,
    'hadjar': 0,
    'bortoleto': 0
  };

  /* ---------- API helpers ---------- */
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
   * OPTIMIZED: Fetch stats with better error handling and caching
   */
  async function fetchDriverStats(driverId) {
    try {
      // Fetch both in parallel instead of sequentially
      const [winsData, resultsData] = await Promise.all([
        fetchJSON(`${API_BASE}/drivers/${driverId}/results/1.json?limit=1000`),
        fetchJSON(`${API_BASE}/drivers/${driverId}/results.json?limit=1000`)
      ]);

      const wins = parseInt(winsData?.MRData?.total || '0', 10);
      
      const races = resultsData?.MRData?.RaceTable?.Races || [];
      let podiums = 0;
      races.forEach(race => {
        const res = race?.Results?.[0];
        if (!res) return;
        const pos = Number(res.position);
        if (!isNaN(pos) && pos <= 3) podiums++;
      });
      
      const totalRaces = Number(resultsData?.MRData?.total || races.length || 0);
      const championships = Number(manualChampionships[driverId]) || 0;

      console.debug(`stats[${driverId}] => champs:${championships}, wins:${wins}, podiums:${podiums}, races:${totalRaces}`);

      return {
        wins: wins || 0,
        podiums: podiums || 0,
        championships: championships || 0,
        races: totalRaces || 0
      };
    } catch (err) {
      console.error('Error fetching driver stats for', driverId, err);
      return { 
        wins: 0, 
        podiums: 0, 
        championships: manualChampionships[driverId] || 0, 
        races: 0 
      };
    }
  }

  /* ---------- Team / flag / image helpers ---------- */
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
  
  function getTeamColor(constructorId) { 
    return teamColors[constructorId] || 'linear-gradient(135deg,#333,#555)'; 
  }

  const flagMap = {
    'British': 'uk.jpg','Dutch': 'netherlands.webp','Monegasque': 'monaco.png','Spanish': 'spain.png','Mexican': 'mexico.png',
    'Thai': 'thailand.png','Japanese': 'japan.png','French': 'france.png','Australian': 'australia.png','German': 'germany.jpg',
    'Canadian': 'canada.png','Finnish': 'finland.svg','Danish': 'denmark.png','Chinese': 'china.png','American': 'usa.png',
    'Italian': 'italy.webp','Brazilian': 'brazil.png','Argentine': 'argentina.png','New Zealander': 'new-zealand.png'
  };
  
  function getFlagImage(nationality) { 
    return flagMap[nationality] || 'default.png'; 
  }

  function getCorrectTeam(driverId, apiTeam) {
    const corrections = {
      'tsunoda': { name: 'Red Bull', constructorId: 'red_bull' },
      'lawson': { name: 'RB F1 team', constructorId: 'rb' }
    };
    return corrections[driverId] || { 
      name: apiTeam?.name || 'Unknown', 
      constructorId: apiTeam?.constructorId || '' 
    };
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

  /* ---------- Card creation ---------- */
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

    const categories = [];
    if (standing) categories.push('current');
    if (stats && Number(stats.podiums) > 0) categories.push('podium');
    if (stats && Number(stats.wins) > 0) categories.push('winner');
    if (stats && Number(stats.championships) > 0) categories.push('champion');
    if (constructorId) categories.push(constructorId);
    categories.push('all');
    card.dataset.category = categories.join(' ');

    const standingBadge = (!standing) ? 
      `<div class="standing-badge" title="No current standing found">No standing</div>` : '';

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

        <div class="stats-header">
          <span class="stats-label">Career Statistics</span>
        </div>
        <div class="driver-stats">
          <div class="stat"><span class="stat-value">${stats.championships}</span><span class="stat-desc">Championships</span></div>
          <div class="stat"><span class="stat-value">${stats.wins}</span><span class="stat-desc">Career Wins</span></div>
          <div class="stat"><span class="stat-value">${stats.podiums}</span><span class="stat-desc">Career Podiums</span></div>
        </div>

        <p class="driver-description">Position: ${position} — ${nationality} driver in ${CURRENT_SEASON}.</p>
      </div>
    `;

    return card;
  }

  /* ---------- OPTIMIZED: Load drivers with parallel processing ---------- */
  async function loadDrivers() {
    const grid = $('#driversGrid');
    const loadingMsg = $('#loadingMessage');
    if (!grid) return;

    try {
      // Step 1: Fetch drivers and standings in parallel
      const [drivers, standings] = await Promise.all([
        fetchDrivers(), 
        fetchDriverStandings()
      ]);

      console.info(`Loaded ${drivers.length} drivers and ${standings.length} standings`);
      console.info('Driver IDs:', drivers.map(d => d.driverId));

      const initialLegends = Array.from(grid.querySelectorAll('.legend-card'));
      const legendCount = initialLegends.length;

      if (!drivers.length) {
        if (loadingMsg) loadingMsg.innerHTML = '<p style="color:var(--accent)">No drivers found for 2025 season</p>';
        return;
      }

      // Update hero stats
      const totalDriversEl = $('#totalDrivers');
      const totalCountriesEl = $('#totalCountries');
      const nationalities = new Set(drivers.map(d => d.nationality));
      if (totalDriversEl) totalDriversEl.textContent = (drivers.length + legendCount).toString();
      if (totalCountriesEl) totalCountriesEl.textContent = String(nationalities.size);

      // Show progressive loading message
      if (loadingMsg) {
        loadingMsg.innerHTML = '<div class="loading-spinner"></div><p>Loading driver statistics...</p>';
      }

      // Step 2: Fetch ALL stats in parallel (MUCH FASTER!)
      const statsPromises = drivers.map(driver => fetchDriverStats(driver.driverId));
      const allStats = await Promise.all(statsPromises);

      // Step 3: Create all cards with fetched data
      drivers.forEach((driver, index) => {
        const standing = standings.find(s => s.Driver?.driverId === driver.driverId);
        const stats = allStats[index];
        const card = createDriverCard(driver, standing, stats);
        grid.appendChild(card);
      });

      // Remove loading message
      if (loadingMsg) loadingMsg.remove();

      // Move legends to end
      const legendNodes = Array.from(grid.querySelectorAll('.legend-card'));
      legendNodes.forEach(node => grid.appendChild(node));

      // Initialize UI features
      initRevealOnScroll();
      initDriverModal();
      initFilters();

      console.info('✅ All drivers loaded successfully!');

    } catch (err) {
      console.error('Error loading drivers:', err);
      if (loadingMsg) {
        loadingMsg.innerHTML = '<p style="color:var(--accent)">Error loading drivers. Please refresh the page.</p>';
      }
    }
  }

  /* ---------- Filters ---------- */
  function initFilters() {
    const buttons = Array.from(document.querySelectorAll('.filter-btn'));
    const noResults = $('#noResults');
    if (!buttons.length) return;

    const normMap = {
      'podium-winners': 'podium','podium-winner': 'podium','podiums': 'podium','podium': 'podium',
      'current-drivers': 'current','current-driver': 'current','current': 'current',
      'winners': 'winner','winner': 'winner','champions': 'champion','champion': 'champion','all': 'all'
    };

    function normalizeFilterName(name) {
      if (!name) return 'all';
      const raw = String(name).toLowerCase().trim();
      return normMap[raw] || raw;
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
      btn.addEventListener('keydown', e => { 
        if (e.key === 'Enter' || e.key === ' ') { 
          e.preventDefault(); 
          btn.click(); 
        } 
      });
    });

    const start = buttons.find(b => b.classList.contains('active'))?.dataset.filter || 'all';
    applyFilter(start);
  }

  /* ---------- Reveal on scroll ---------- */
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

  /* ---------- Driver Modal ---------- */
  function initDriverModal() {
    const grid = document.querySelector('.drivers-grid');
    if (!grid) return;

    if (document.querySelector('.driver-modal-overlay')) {
      const existing = document.querySelector('.driver-modal-overlay');
      existing.querySelector('.driver-modal-close')?.addEventListener('click', () => 
        existing.classList.remove('visible')
      );
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
        if (e.shiftKey && document.activeElement === first) { 
          e.preventDefault(); 
          last.focus(); 
        } else if (!e.shiftKey && document.activeElement === last) { 
          e.preventDefault(); 
          first.focus(); 
        }
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
      
      // Add career stats header in modal
      modalStats.innerHTML = '<div style="grid-column: 1/-1; text-align: center; margin-bottom: 8px;"><span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); opacity: 0.9;">Career Statistics</span></div>';
      
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
    overlay.addEventListener('click', e => { 
      if (e.target === overlay) close(); 
    });
  }

  /* ---------- Utility functions ---------- */
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

  /* ---------- Boot ---------- */
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

    await loadDrivers();
  });

})();