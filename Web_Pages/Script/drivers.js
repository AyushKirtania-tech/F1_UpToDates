/* drivers.js — Updated for 2026 Grid with Live Stats Modal, Filter Fixes & Skeletons */

(() => {
  const API_BASE = 'https://api.jolpi.ca/ergast/f1';
  const $ = sel => document.querySelector(sel);

  /* ---------- THE 2026 GRID ---------- */
  const currentDrivers = [
    { driverId: 'norris', givenName: 'Lando', familyName: 'Norris', nationality: 'British', permanentNumber: '1', teamId: 'mclaren' },
    { driverId: 'piastri', givenName: 'Oscar', familyName: 'Piastri', nationality: 'Australian', permanentNumber: '81', teamId: 'mclaren' },
    { driverId: 'max_verstappen', givenName: 'Max', familyName: 'Verstappen', nationality: 'Dutch', permanentNumber: '3', teamId: 'red_bull' },
    { driverId: 'hadjar', givenName: 'Isack', familyName: 'Hadjar', nationality: 'French', permanentNumber: '6', teamId: 'red_bull' },
    { driverId: 'leclerc', givenName: 'Charles', familyName: 'Leclerc', nationality: 'Monegasque', permanentNumber: '16', teamId: 'ferrari' },
    { driverId: 'hamilton', givenName: 'Lewis', familyName: 'Hamilton', nationality: 'British', permanentNumber: '44', teamId: 'ferrari' },
    { driverId: 'russell', givenName: 'George', familyName: 'Russell', nationality: 'British', permanentNumber: '63', teamId: 'mercedes' },
    { driverId: 'antonelli', givenName: 'Kimi', familyName: 'Antonelli', nationality: 'Italian', permanentNumber: '12', teamId: 'mercedes' },
    { driverId: 'alonso', givenName: 'Fernando', familyName: 'Alonso', nationality: 'Spanish', permanentNumber: '14', teamId: 'aston_martin' },
    { driverId: 'stroll', givenName: 'Lance', familyName: 'Stroll', nationality: 'Canadian', permanentNumber: '18', teamId: 'aston_martin' },
    { driverId: 'sainz', givenName: 'Carlos', familyName: 'Sainz', nationality: 'Spanish', permanentNumber: '55', teamId: 'williams' },
    { driverId: 'albon', givenName: 'Alexander', familyName: 'Albon', nationality: 'Thai', permanentNumber: '23', teamId: 'williams' },
    { driverId: 'lawson', givenName: 'Liam', familyName: 'Lawson', nationality: 'New Zealander', permanentNumber: '30', teamId: 'racing_bulls' },
    { driverId: 'lindblad', givenName: 'Arvid', familyName: 'Lindblad', nationality: 'British', permanentNumber: '41', teamId: 'racing_bulls' },
    { driverId: 'bearman', givenName: 'Oliver', familyName: 'Bearman', nationality: 'British', permanentNumber: '87', teamId: 'haas' },
    { driverId: 'ocon', givenName: 'Esteban', familyName: 'Ocon', nationality: 'French', permanentNumber: '31', teamId: 'haas' },
    { driverId: 'hulkenberg', givenName: 'Nico', familyName: 'Hülkenberg', nationality: 'German', permanentNumber: '27', teamId: 'audi' },
    { driverId: 'bortoleto', givenName: 'Gabriel', familyName: 'Bortoleto', nationality: 'Brazilian', permanentNumber: '5', teamId: 'audi' },
    { driverId: 'gasly', givenName: 'Pierre', familyName: 'Gasly', nationality: 'French', permanentNumber: '10', teamId: 'alpine' },
    { driverId: 'colapinto', givenName: 'Franco', familyName: 'Colapinto', nationality: 'Argentine', permanentNumber: '43', teamId: 'alpine' },
    { driverId: 'bottas', givenName: 'Valtteri', familyName: 'Bottas', nationality: 'Finnish', permanentNumber: '77', teamId: 'cadillac' },
    { driverId: 'perez', givenName: 'Sergio', familyName: 'Perez', nationality: 'Mexican', permanentNumber: '11', teamId: 'cadillac' }
  ];

  const manualChampionships = {
    'max_verstappen': 4, 'leclerc': 0, 'hamilton': 7, 'russell': 0, 'perez': 0, 'sainz': 0, 
    'norris': 1, 'piastri': 0, 'alonso': 2, 'stroll': 0, 'gasly': 0, 'albon': 0, 'ocon': 0, 
    'hulkenberg': 0, 'bottas': 0, 'lawson': 0, 'antonelli': 0, 'bearman': 0, 
    'hadjar': 0, 'bortoleto': 0, 'lindblad': 0, 'colapinto': 0 
  };

  /* ---------- FILTER LOGIC ---------- */
  let currentDriverFilter = 'all';

  function applyDriverFilter(filter) {
    currentDriverFilter = filter || 'all';
    const f = currentDriverFilter.toLowerCase();
    
    // Maps the HTML 'data-filter' values to the generated categories
    const map = {'podiums':'podium', 'winners':'winner', 'legends':'legends', 'current':'current'}; 
    const target = map[f] || f;
    
    const cards = Array.from(document.querySelectorAll('.driver-card'));
    let anyShown = false;

    document.querySelectorAll('.filter-btn').forEach(btn => {
      const isActive = btn.dataset.filter === currentDriverFilter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });

    cards.forEach(card => {
      const cats = (card.dataset.category || 'all').toLowerCase().split(' ');
      const show = target === 'all' || cats.includes(target);
      
      if (show) {
        card.style.removeProperty('display');
        anyShown = true;
      } else {
        card.style.setProperty('display', 'none', 'important');
      }
    });

    const noResults = $('#noResults');
    if (noResults) noResults.hidden = anyShown;
  }

  /* ---------- DATA FETCHING ---------- */
  async function fetchJSON(url) {
    try {
      const r = await fetch(url);
      if (!r.ok) return null;
      return await r.json();
    } catch (err) {
      return null;
    }
  }

  async function fetchDriverStats(driverId) {
    try {
      const [winsData, resultsData] = await Promise.all([
        fetchJSON(`${API_BASE}/drivers/${driverId}/results/1.json?limit=1000`),
        fetchJSON(`${API_BASE}/drivers/${driverId}/results.json?limit=1000`)
      ]);

      const wins = parseInt(winsData?.MRData?.total || '0', 10);
      const races = resultsData?.MRData?.RaceTable?.Races || [];
      let podiums = 0;
      races.forEach(race => {
        const res = race?.Results?.[0];
        if (res && Number(res.position) <= 3) podiums++;
      });
      
      const careerStats = {
        wins: wins || 0,
        podiums: podiums || 0,
        championships: manualChampionships[driverId] || 0,
        races: Number(resultsData?.MRData?.total || races.length || 0)
      };

      if (driverId === 'lindblad' && careerStats.races === 0) careerStats.races = 1;
      return careerStats;

    } catch (err) {
      return { wins: 0, podiums: 0, championships: manualChampionships[driverId] || 0, races: driverId === 'lindblad' ? 1 : 0 };
    }
  }

  async function loadCurrentSeasonData(driverId, container) {
    // Skeletons
    container.innerHTML = `
      <div class="live-stats-grid">
        <div class="live-stat-box skeleton-box" style="height: 65px; border-radius: 12px;"></div>
        <div class="live-stat-box skeleton-box" style="height: 65px; border-radius: 12px;"></div>
        <div class="live-stat-box skeleton-box" style="height: 65px; border-radius: 12px;"></div>
        <div class="live-stat-box skeleton-box" style="height: 65px; border-radius: 12px;"></div>
        <div class="live-stat-box skeleton-box" style="height: 65px; border-radius: 12px;"></div>
        <div class="live-stat-box skeleton-box" style="height: 65px; border-radius: 12px;"></div>
      </div>
    `;
    
    const apiDriverId = driverId === 'max_verstappen' ? 'max_verstappen' : driverId;

    try {
      const [standingsRes, resultsRes] = await Promise.all([
        fetchJSON(`${API_BASE}/current/drivers/${apiDriverId}/driverStandings.json`),
        fetchJSON(`${API_BASE}/current/drivers/${apiDriverId}/results.json`)
      ]);

      const standing = standingsRes?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0];
      const races = resultsRes?.MRData?.RaceTable?.Races || [];

      if (races.length === 0 && !standing) {
          container.innerHTML = '<div class="no-data" style="text-align:center; padding:20px; color:#aaa;">Live stats will appear here automatically after Round 1.</div>';
          return;
      }

      let bestFinish = 999, bestGrid = 999, dnfs = 0;
      races.forEach(r => {
          const res = r.Results[0];
          const pos = parseInt(res.position);
          const grid = parseInt(res.grid);
          if (pos < bestFinish) bestFinish = pos;
          if (grid > 0 && grid < bestGrid) bestGrid = grid;
          if (!res.status.includes('Finished') && !res.status.match(/\+\d/)) dnfs++;
      });

      const points = standing?.points || '0';
      const position = standing?.position || '-';
      const seasonWins = standing?.wins || '0';

      container.innerHTML = `
        <div class="live-stats-grid" style="animation: fadeIn 0.4s ease;">
          <div class="live-stat-box"><span class="ls-label">WDC Pos</span><span class="ls-val">P${position}</span></div>
          <div class="live-stat-box"><span class="ls-label">Points</span><span class="ls-val">${points}</span></div>
          <div class="live-stat-box"><span class="ls-label">Season Wins</span><span class="ls-val">${seasonWins}</span></div>
          <div class="live-stat-box"><span class="ls-label">Best Finish</span><span class="ls-val">${bestFinish === 999 ? '-' : 'P'+bestFinish}</span></div>
          <div class="live-stat-box"><span class="ls-label">Best Grid</span><span class="ls-val">${bestGrid === 999 ? '-' : 'P'+bestGrid}</span></div>
          <div class="live-stat-box"><span class="ls-label">Retirements</span><span class="ls-val">${dnfs}</span></div>
        </div>
      `;
    } catch(e) {
      container.innerHTML = '<div class="no-data" style="text-align:center; padding:20px; color:#e10600;">⚠️ Failed to connect to F1 Live API.</div>';
    }
  }

  const teamColors = {
    'red_bull': 'linear-gradient(135deg,#1e3a8a,#3730a3)', 'ferrari': 'linear-gradient(135deg,#dc2626,#991b1b)',
    'mercedes': 'linear-gradient(135deg,#00d2be,#00a19c)', 'mclaren': 'linear-gradient(135deg,#ff8c00,#ff6600)',
    'alpine': 'linear-gradient(135deg,#0084c7,#005a8f)', 'aston_martin': 'linear-gradient(135deg,#006a4e,#004d3b)',
    'williams': 'linear-gradient(135deg,#00a0de,#0073a3)', 'racing_bulls': 'linear-gradient(135deg,#0f172a,#1e293b)',
    'audi': 'linear-gradient(135deg,#000000,#ff0000)', 'haas': 'linear-gradient(135deg,#6b7280,#374151)',
    'cadillac': 'linear-gradient(135deg,#ffffff,#a2a2a2)'
  };
  
  function getTeamColor(teamId) { return teamColors[teamId] || 'linear-gradient(135deg,#333,#555)'; }
  
  const flagMap = {
    'British': 'uk.jpg','Dutch': 'netherlands.webp','Monegasque': 'monaco.png','Spanish': 'spain.png','Mexican': 'mexico.png',
    'Thai': 'thailand.png','French': 'france.png','Australian': 'australia.png','German': 'germany.jpg',
    'Canadian': 'canada.png','Finnish': 'finland.svg','Italian': 'italy.webp','Brazilian': 'brazil.png','New Zealander': 'new-zealand.png',
    'Argentine': 'argentina.png'
  };
  function getFlagImage(nat) { return flagMap[nat] || 'default.png'; }

  function getDriverImageFilename(driverId) {
    const map = {
      'max_verstappen': 'max.jpg','norris': 'lando.webp','leclerc': 'leclerc.jpg','hamilton': 'lewis.jpg',
      'russell': 'george.jpg','sainz': 'carlos.jpeg','piastri': 'piastri.webp','alonso': 'alonso.jpg',
      'stroll': 'lance.jpg','gasly': 'gasly.jpg','albon': 'albon.jpg', 'ocon': 'ocon.avif',
      'hulkenberg': 'nico.webp','perez': 'Sergio.jpg','bottas': 'bottas.jpg', 'lawson': 'liam.avif',
      'bearman': 'oliver.webp','antonelli': 'antonelli.avif', 'colapinto': 'franco.webp',
      'hadjar': 'isack.webp','bortoleto': 'gabriel.webp', 'lindblad': 'lindblad.avif'
    };
    return map[driverId] || `${driverId}.jpg`;
  }

  function createDriverCard(driver, stats) {
    const { driverId, givenName, familyName, nationality, permanentNumber, teamId } = driver;
    const champs = manualChampionships[driverId] || 0;
    const teamName = (teamId || 'Unknown').replace('_', ' ').toUpperCase();

    let pointsText = '2026 Driver';
    let descText = champs > 0 ? `${champs}x World Champion.` : `Official Driver for ${teamName}.`;

    const card = document.createElement('article');
    card.className = 'driver-card reveal';
    card.dataset.team = teamId;
    card.dataset.driverId = driverId; 
    
    const categories = ['all', 'current'];
    if (stats.wins > 0) categories.push('winner');
    if (stats.podiums > 0) categories.push('podium');
    if (stats.championships > 0) categories.push('champion');
    card.dataset.category = categories.join(' ');

    card.innerHTML = `
      <div class="driver-header" style="background: ${getTeamColor(teamId)};">
        <div>
          <div class="driver-number">#${permanentNumber || '?'}</div>
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
        <p class="team-name">${teamName} <span class="points-line">• ${pointsText}</span></p>
        <div class="stats-header"><span class="stats-label">Career Statistics</span></div>
        <div class="driver-stats">
          <div class="stat"><span class="stat-value">${stats.championships}</span><span class="stat-desc">Championships</span></div>
          <div class="stat"><span class="stat-value">${stats.wins}</span><span class="stat-desc">Wins</span></div>
          <div class="stat"><span class="stat-value">${stats.podiums}</span><span class="stat-desc">Podiums</span></div>
        </div>
        <p class="driver-description">${descText}</p>
      </div>
    `;
    return card;
  }

  async function loadDrivers() {
    const grid = $('#driversGrid');
    const loadingMsg = $('#loadingMessage');
    const totalDriversEl = $('#totalDrivers');
    const totalCountriesEl = $('#totalCountries');
    const legendsCountEl = document.querySelector('.stat-item[aria-label="Legends"] .stat-number');
    if (!grid) return;

    const existingLegends = Array.from(document.querySelectorAll('.legend-card'));
    existingLegends.forEach(legend => {
        let currentCats = legend.dataset.category || '';
        if (!currentCats.includes('podium')) legend.dataset.category = currentCats + ' podium winner';
        legend.remove(); 
    });

    if (loadingMsg) {
      loadingMsg.style.display = 'block';
      loadingMsg.innerHTML = '<div class="loading-spinner"></div><p>Loading API Data...</p>';
    }

    try {
      const statsPromises = currentDrivers.map(driver => fetchDriverStats(driver.driverId));
      const allStats = await Promise.all(statsPromises);

      if (loadingMsg) loadingMsg.remove(); 

      currentDrivers.forEach((driver, index) => {
        const stats = allStats[index];
        const card = createDriverCard(driver, stats);
        grid.appendChild(card);
      });

      existingLegends.forEach(legend => grid.appendChild(legend));

      // UPDATED LOGIC: Exactly 22 Active Drivers
      const totalCount = currentDrivers.length; 
      const uniqueCountries = new Set(currentDrivers.map(d => d.nationality));
      
      if (totalDriversEl) totalDriversEl.textContent = totalCount;
      if (totalCountriesEl) totalCountriesEl.textContent = uniqueCountries.size;
      if (legendsCountEl) legendsCountEl.textContent = existingLegends.length; 

      initRevealOnScroll();
      initDriverModal();
      applyDriverFilter(currentDriverFilter); 

    } catch (err) {
      if (loadingMsg) loadingMsg.innerHTML = '<p>Failed to load active drivers.</p>';
      existingLegends.forEach(legend => grid.appendChild(legend));
    }
  }

  function initRevealOnScroll() {
    const targets = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      });
      targets.forEach(t => obs.observe(t));
    } else {
      targets.forEach(t => t.classList.add('visible'));
    }
  }

  function initDriverModal() {
    const grid = document.querySelector('.drivers-grid');
    if (!grid || document.querySelector('.driver-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'driver-modal-overlay';
    
    overlay.innerHTML = `
      <div class="driver-modal">
        <div class="modal-pull-indicator"></div>
        <button class="driver-modal-close">&times;</button>
        <div class="driver-modal-body">
          <div class="driver-modal-image"><img alt=""></div>
          <div class="driver-modal-content">
            <h2 class="modal-name"></h2>
            <div class="modal-team"></div>
            <p class="modal-desc-text"></p>
            
            <h3 class="modal-section-title">Career Statistics</h3>
            <div class="modal-stats"></div>

            <h3 class="modal-section-title live-title">🔴 2026 Live Season Stats</h3>
            <div class="modal-live-stats" id="modalLiveStats"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => {
      if (overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
        if (history.state && history.state.modalOpen) history.back(); 
      }
    };

    window.addEventListener('popstate', () => {
      if (overlay.classList.contains('visible')) overlay.classList.remove('visible'); 
    });

    overlay.querySelector('.driver-modal-close').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    grid.addEventListener('click', e => {
      const card = e.target.closest('.driver-card');
      if (card && !e.target.closest('button')) {
        const img = card.querySelector('.driver-image img');
        overlay.querySelector('.driver-modal-image img').src = img?.src || '';
        overlay.querySelector('.modal-name').textContent = card.querySelector('h2').textContent;
        overlay.querySelector('.modal-team').textContent = card.querySelector('.team-name').textContent;
        overlay.querySelector('.modal-desc-text').textContent = card.querySelector('.driver-description').textContent;
        
        const stats = overlay.querySelector('.modal-stats');
        stats.innerHTML = '';
        card.querySelectorAll('.driver-stats .stat').forEach(s => stats.appendChild(s.cloneNode(true)));
        
        const driverId = card.dataset.driverId;
        const liveStatsContainer = overlay.querySelector('#modalLiveStats');
        const liveTitle = overlay.querySelector('.live-title');

        if (!driverId || card.classList.contains('legend-card')) {
          liveTitle.style.display = 'none';
          liveStatsContainer.style.display = 'none';
          liveStatsContainer.innerHTML = '';
        } else {
          liveTitle.style.display = 'block';
          liveStatsContainer.style.display = 'block';
          loadCurrentSeasonData(driverId, liveStatsContainer);
        }

        history.pushState({ modalOpen: true }, "", window.location.href);
        overlay.classList.add('visible');
      }
    });
  }

  function bindImageFallbacks() {
    document.body.addEventListener('error', e => {
      if (e.target.tagName === 'IMG') e.target.src = 'images/driver-fallback.jpg';
    }, true);
  }

  async function includeHTML(id, path) {
    const el = document.getElementById(id);
    if (el) { try { const r = await fetch(path); if(r.ok) el.innerHTML = await r.text(); } catch(e){} }
  }

  const driverMap = {
    "max_verstappen": { class: "redbull", color: "#1e3a8a" },
    "hadjar": { class: "redbull", color: "#1e3a8a" },
    "norris": { class: "mclaren", color: "#ff8c00" },
    "piastri": { class: "mclaren", color: "#ff8c00" },
    "leclerc": { class: "ferrari", color: "#dc2626" },
    "hamilton": { class: "ferrari", color: "#dc2626" },
    "russell": { class: "mercedes", color: "#00d2be" },
    "antonelli": { class: "mercedes", color: "#00d2be" },
    "albon": { class: "williams", color: "#00a0de" },
    "sainz": { class: "williams", color: "#00a0de" },
    "alonso": { class: "astonmartin", color: "#006a4e" },
    "stroll": { class: "astonmartin", color: "#006a4e" },
    "gasly": { class: "alpine", color: "#0084c7" },
    "colapinto": { class: "alpine", color: "#0084c7" },
    "lawson": { class: "racingbulls", color: "#0f172a" },
    "lindblad": { class: "racingbulls", color: "#0f172a" },
    "ocon": { class: "haas", color: "#ffffff" },
    "bearman": { class: "haas", color: "#ffffff" },
    "hulkenberg": { class: "audi", color: "#ff0000" },
    "bortoleto": { class: "audi", color: "#ff0000" },
    "perez": { class: "cadillac", color: "#a2a2a2" },
    "bottas": { class: "cadillac", color: "#a2a2a2" }
  };

  async function loadDriverStandings() {
    try {
      const response = await fetch(`${API_BASE}/current/driverStandings.json`);
      if (!response.ok) throw new Error("Failed to fetch standings");
      
      const data = await response.json();
      const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
      const currentSeason = data.MRData.StandingsTable.season;
      
      const table = document.querySelector('.championship-table');
      if (!table) return;

      const header = table.querySelector('.table-header');
      table.innerHTML = '';
      table.appendChild(header);

      standings.forEach(standing => {
        const driverId = standing.Driver.driverId;
        const driverName = `${standing.Driver.givenName} ${standing.Driver.familyName}`;
        const position = standing.position;
        const points = standing.points;
        const constructorId = standing.Constructors[0]?.constructorId || 'unknown';
        const driverInfo = driverMap[driverId] || { class: constructorId, color: "#cccccc" };

        const row = document.createElement('div');
        row.className = 'table-row';
        row.setAttribute('role', 'row');
        row.innerHTML = `
          <div>${position}</div>
          <div><span class="team-color ${driverInfo.class}" aria-hidden="true" style="background:${driverInfo.color};"></span>${driverName}</div>
          <div>${points}</div>
        `;
        table.appendChild(row);
      });

      const sectionTitle = document.querySelector('.championship-section .section-title');
      if (sectionTitle) sectionTitle.textContent = `${currentSeason} Driver Standings`;

    } catch (error) {
      console.error("Error loading driver standings, falling back to static HTML:", error);
    }
  }

  // Init block
  document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([includeHTML('navbar', 'navbar.html'), includeHTML('footer', 'footer.html')]);
    bindImageFallbacks();
    
    // Global Button Micro-Interaction
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (btn && btn.tagName === 'A' && btn.href && !btn.href.includes('#')) {
        e.preventDefault();
        btn.classList.add('is-loading');
        setTimeout(() => { window.location.href = btn.href; }, 350); 
      }
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => applyDriverFilter(btn.dataset.filter));
    });

    if ($('#driversGrid')) await loadDrivers();
    loadDriverStandings();
    
    if(window.initMobileEnhancements) setTimeout(window.initMobileEnhancements, 300);
  });

})();