/* drivers.js — FIXED: Status Counts, Filters, and 2025 Grid */

(() => {
  /* ---------- Configuration ---------- */
  const API_BASE = 'https://api.jolpi.ca/ergast/f1';
  
  /* ---------- DOM helpers ---------- */
  const $ = sel => document.querySelector(sel);

  /* ---------- 1. THE 2025 GRID (Manually Defined) ---------- */
  const currentDrivers = [
    { driverId: 'max_verstappen', givenName: 'Max', familyName: 'Verstappen', nationality: 'Dutch', permanentNumber: '1', teamId: 'red_bull' },
    { driverId: 'norris', givenName: 'Lando', familyName: 'Norris', nationality: 'British', permanentNumber: '4', teamId: 'mclaren' },
    { driverId: 'leclerc', givenName: 'Charles', familyName: 'Leclerc', nationality: 'Monegasque', permanentNumber: '16', teamId: 'ferrari' },
    { driverId: 'hamilton', givenName: 'Lewis', familyName: 'Hamilton', nationality: 'British', permanentNumber: '44', teamId: 'ferrari' },
    { driverId: 'russell', givenName: 'George', familyName: 'Russell', nationality: 'British', permanentNumber: '63', teamId: 'mercedes' },
    { driverId: 'piastri', givenName: 'Oscar', familyName: 'Piastri', nationality: 'Australian', permanentNumber: '81', teamId: 'mclaren' },
    { driverId: 'sainz', givenName: 'Carlos', familyName: 'Sainz', nationality: 'Spanish', permanentNumber: '55', teamId: 'williams' },
    { driverId: 'alonso', givenName: 'Fernando', familyName: 'Alonso', nationality: 'Spanish', permanentNumber: '14', teamId: 'aston_martin' },
    { driverId: 'stroll', givenName: 'Lance', familyName: 'Stroll', nationality: 'Canadian', permanentNumber: '18', teamId: 'aston_martin' },
    { driverId: 'gasly', givenName: 'Pierre', familyName: 'Gasly', nationality: 'French', permanentNumber: '10', teamId: 'alpine' },
    { driverId: 'ocon', givenName: 'Esteban', familyName: 'Ocon', nationality: 'French', permanentNumber: '31', teamId: 'haas' },
    { driverId: 'albon', givenName: 'Alexander', familyName: 'Albon', nationality: 'Thai', permanentNumber: '23', teamId: 'williams' },
    { driverId: 'tsunoda', givenName: 'Yuki', familyName: 'Tsunoda', nationality: 'Japanese', permanentNumber: '22', teamId: 'red_bull' },
    { driverId: 'hulkenberg', givenName: 'Nico', familyName: 'Hülkenberg', nationality: 'German', permanentNumber: '27', teamId: 'sauber' },
    { driverId: 'lawson', givenName: 'Liam', familyName: 'Lawson', nationality: 'New Zealander', permanentNumber: '30', teamId: 'racing_bulls' },
    { driverId: 'bearman', givenName: 'Oliver', familyName: 'Bearman', nationality: 'British', permanentNumber: '87', teamId: 'haas' },
    { driverId: 'antonelli', givenName: 'Kimi', familyName: 'Antonelli', nationality: 'Italian', permanentNumber: '12', teamId: 'mercedes' },
    { driverId: 'doohan', givenName: 'Jack', familyName: 'Doohan', nationality: 'Australian', permanentNumber: '61', teamId: 'alpine' },
    { driverId: 'colapinto', givenName: 'Franco', familyName: 'Colapinto', nationality: 'Argentine', permanentNumber: '43', teamId: 'alpine' }
  ];

  /* ---------- 2. THE 2026 ROOKIES ---------- */
  const manualDrivers = [
    { driverId: 'lindblad', givenName: 'Arvid', familyName: 'Lindblad', nationality: 'British', permanentNumber: 'TBA', season: 2026, teamId: 'racing_bulls' },
    { driverId: 'hadjar', givenName: 'Isack', familyName: 'Hadjar', nationality: 'French', permanentNumber: 'TBA', season: 2026, teamId: 'red_bull' },
    { driverId: 'bortoleto', givenName: 'Gabriel', familyName: 'Bortoleto', nationality: 'Brazilian', permanentNumber: 'TBA', season: 2026, teamId: 'sauber' }
  ];

  /* ---------- Manual Stats (Backup) ---------- */
  const manualChampionships = {
    'max_verstappen': 4, 'leclerc': 0, 'hamilton': 7, 'russell': 0, 'perez': 0, 'sainz': 0, 
    'norris': 1, 'piastri': 0, 'alonso': 2, 'stroll': 0, 'tsunoda': 0, 'gasly': 0, 
    'albon': 0, 'ocon': 0, 'hulkenberg': 0, 'zhou': 0, 'bottas': 0, 'magnussen': 0, 
    'doohan': 0, 'lawson': 0, 'antonelli': 0, 'bearman': 0, 'colapinto': 0, 'hadjar': 0, 
    'bortoleto': 0, 'lindblad': 0 
  };

  /* ---------- API Helpers ---------- */
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
    if (['lindblad', 'hadjar', 'bortoleto', 'antonelli', 'bearman', 'doohan', 'colapinto'].includes(driverId)) {
       return { wins: 0, podiums: 0, championships: 0, races: 0 };
    }
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
      
      return {
        wins: wins || 0,
        podiums: podiums || 0,
        championships: manualChampionships[driverId] || 0,
        races: Number(resultsData?.MRData?.total || races.length || 0)
      };
    } catch (err) {
      return { wins: 0, podiums: 0, championships: manualChampionships[driverId] || 0, races: 0 };
    }
  }

  /* ---------- Visual Helpers ---------- */
  const teamColors = {
    'red_bull': 'linear-gradient(135deg,#1e3a8a,#3730a3)',
    'ferrari': 'linear-gradient(135deg,#dc2626,#991b1b)',
    'mercedes': 'linear-gradient(135deg,#00d2be,#00a19c)',
    'mclaren': 'linear-gradient(135deg,#ff8c00,#ff6600)',
    'alpine': 'linear-gradient(135deg,#0084c7,#005a8f)',
    'aston_martin': 'linear-gradient(135deg,#006a4e,#004d3b)',
    'williams': 'linear-gradient(135deg,#00a0de,#0073a3)',
    'rb': 'linear-gradient(135deg,#0f172a,#1e293b)',
    'racing_bulls': 'linear-gradient(135deg,#0f172a,#1e293b)',
    'sauber': 'linear-gradient(135deg,#0b3b1f,#0f5a2f)',
    'kick_sauber': 'linear-gradient(135deg,#0b3b1f,#0f5a2f)',
    'haas': 'linear-gradient(135deg,#6b7280,#374151)'
  };
  
  function getTeamColor(teamId) { return teamColors[teamId] || 'linear-gradient(135deg,#333,#555)'; }
  
  const flagMap = {
    'British': 'uk.jpg','Dutch': 'netherlands.webp','Monegasque': 'monaco.png','Spanish': 'spain.png','Mexican': 'mexico.png',
    'Thai': 'thailand.png','Japanese': 'japan.png','French': 'france.png','Australian': 'australia.png','German': 'germany.jpg',
    'Canadian': 'canada.png','Finnish': 'finland.svg','Danish': 'denmark.png','Chinese': 'china.png','American': 'usa.png',
    'Italian': 'italy.webp','Brazilian': 'brazil.png','Argentine': 'argentina.png','New Zealander': 'new-zealand.png'
  };
  function getFlagImage(nat) { return flagMap[nat] || 'default.png'; }

  function getDriverImageFilename(driverId) {
    const map = {
      'max_verstappen': 'max.jpg','norris': 'lando.webp','leclerc': 'leclerc.jpg','hamilton': 'lewis.jpg',
      'russell': 'george.jpg','sainz': 'carlos.jpeg','piastri': 'piastri.webp','alonso': 'alonso.jpg',
      'stroll': 'lance.jpg','tsunoda': 'yuki.webp','gasly': 'gasly.jpg','albon': 'albon.jpg',
      'ocon': 'ocon.avif','hulkenberg': 'nico.jpg','perez': 'perez.jpg','zhou': 'zhou.jpg',
      'bottas': 'bottas.jpg','sargeant': 'logan.jpg','magnussen': 'kevin.jpg','doohan': 'Doohan.webp',
      'lawson': 'liam.avif','de_vries': 'devries.jpg','bearman': 'oliver.webp','antonelli': 'antonelli.avif',
      'colapinto': 'franco.webp','hadjar': 'isack.webp','bortoleto': 'gabriel.webp', 'lindblad': 'lindblad.avif'
    };
    return map[driverId] || `${driverId}.jpg`;
  }

  /* ---------- Create Card ---------- */
  function createDriverCard(driver, stats) {
    const { driverId, givenName, familyName, nationality, permanentNumber, teamId, season } = driver;
    const isRookie = season === 2026;
    const champs = manualChampionships[driverId] || 0;
    const teamName = (teamId || 'Unknown').replace('_', ' ').toUpperCase();

    let pointsText = isRookie ? 'Debut Season' : '2025 Driver';
    let descText = isRookie ? `Confirmed for 2026 Grid — ${nationality} talent.` 
                            : (champs > 0 ? `${champs}x World Champion.` : `Official Driver for ${teamName}.`);

    const card = document.createElement('article');
    card.className = 'driver-card reveal';
    card.dataset.team = teamId;
    
    // Categories for Filtering
    const categories = ['all'];
    if (!isRookie) categories.push('current');
    if (stats.wins > 0) categories.push('winner');
    if (stats.podiums > 0) categories.push('podium');
    if (stats.championships > 0) categories.push('champion');
    card.dataset.category = categories.join(' ');

    const standingBadge = isRookie ? `<div class="standing-badge">2026 Rookie</div>` : '';

    card.innerHTML = `
      <div class="driver-header" style="background: ${getTeamColor(teamId)};">
        <div>
          <div class="driver-number">#${permanentNumber || '?'}</div>
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

  /* ---------- Main Load Function ---------- */
  async function loadDrivers() {
    const grid = $('#driversGrid');
    const loadingMsg = $('#loadingMessage');
    const totalDriversEl = $('#totalDrivers');
    const totalCountriesEl = $('#totalCountries');
    
    if (!grid) return;

    // 1. Save Legends
    const existingLegends = Array.from(document.querySelectorAll('.legend-card'));
    
    // FIX: Add 'podium' and 'winner' categories to legends automatically so filters work
    existingLegends.forEach(legend => {
        let currentCats = legend.dataset.category || '';
        if (!currentCats.includes('podium')) legend.dataset.category = currentCats + ' podium winner';
    });

    grid.innerHTML = ''; // Clear skeleton

    try {
      if (loadingMsg) loadingMsg.innerHTML = '<div class="loading-spinner"></div><p>Loading...</p>';

      const allDrivers = [...currentDrivers, ...manualDrivers];

      // 2. Fetch Stats
      const statsPromises = allDrivers.map(driver => fetchDriverStats(driver.driverId));
      const allStats = await Promise.all(statsPromises);

      // 3. Render Cards
      allDrivers.forEach((driver, index) => {
        const stats = allStats[index];
        const card = createDriverCard(driver, stats);
        grid.appendChild(card);
      });

      // 4. Add Back Legends
      existingLegends.forEach(legend => grid.appendChild(legend));

      // 5. UPDATE STATUS BOX (FIXED DASHES)
      const totalCount = allDrivers.length + existingLegends.length;
      const uniqueCountries = new Set(allDrivers.map(d => d.nationality));
      // Manually add legend countries to the count
      ['Brazilian', 'German', 'French', 'Argentine', 'Austrian', 'British'].forEach(c => uniqueCountries.add(c));
      
      if (totalDriversEl) totalDriversEl.textContent = totalCount;
      if (totalCountriesEl) totalCountriesEl.textContent = uniqueCountries.size;

      if (loadingMsg) loadingMsg.remove();
      
      initRevealOnScroll();
      initDriverModal();
      initFilters();

    } catch (err) {
      console.error('Error:', err);
      existingLegends.forEach(legend => grid.appendChild(legend)); // Restore legends on error
    }
  }

  /* ---------- UI Functions ---------- */
  function initFilters() {
    const buttons = Array.from(document.querySelectorAll('.filter-btn'));
    const noResults = $('#noResults');
    if (!buttons.length) return;

    function applyFilter(filter) {
      const f = (filter || 'all').toLowerCase();
      // Map 'podiums' -> 'podium' to match category
      const map = {'podiums':'podium', 'winners':'winner', 'legends':'legends'}; 
      const target = map[f] || f;
      
      const cards = Array.from(document.querySelectorAll('.driver-card'));
      let anyShown = false;

      buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));

      cards.forEach(card => {
        const cats = (card.dataset.category || 'all').toLowerCase().split(' ');
        const show = target === 'all' || cats.includes(target);
        card.style.display = show ? '' : 'none';
        if (show) anyShown = true;
      });
      if (noResults) noResults.hidden = anyShown;
    }

    buttons.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
    applyFilter('all');
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
    overlay.innerHTML = `<div class="driver-modal"><button class="driver-modal-close">&times;</button><div class="driver-modal-body"><div class="driver-modal-image"><img alt=""></div><div class="driver-modal-content"><h2 class="modal-name"></h2><div class="modal-team"></div><div class="modal-stats"></div><p class="modal-desc-text"></p></div></div></div>`;
    document.body.appendChild(overlay);

    const close = () => overlay.classList.remove('visible');
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
        card.querySelectorAll('.stat').forEach(s => stats.appendChild(s.cloneNode(true)));
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

  document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([includeHTML('navbar', 'navbar.html'), includeHTML('footer', 'footer.html')]);
    bindImageFallbacks();
    if ($('#driversGrid')) await loadDrivers();
  });

})();