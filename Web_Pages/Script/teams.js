/* teams.js — Synchronized for the 11-Team 2026 Layout with Mobile Back Button Fix, Skeletons, & Modals */

(() => {
  const API_ROOT = 'https://api.jolpi.ca/ergast/f1';
  const FALLBACK_RESULTS_URL = 'results.html';

  async function includeHTML(id, path) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
      const resp = await fetch(path, { cache: "no-store" });
      if (!resp.ok) throw new Error('Not found');
      container.innerHTML = await resp.text();
      setActiveNavLink();
    } catch (err) { 
      console.warn(`Failed to load ${path}`);
    }
  }

  function setActiveNavLink() {
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
          card.style.display = ''; 
          setTimeout(() => {
            card.classList.remove('filtered-out');
            card.classList.remove('hidden');
          }, 10);
          anyVisible = true;
        } else {
          card.classList.add('filtered-out');
          card.classList.add('hidden');
          setTimeout(() => {
            if(card.classList.contains('hidden')) card.style.display = 'none';
          }, 300);
        }
      });

      if (noResults) noResults.hidden = anyVisible;
    }

    buttons.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter || 'all')));
    applyFilter('all');
  }

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

  function initTeamModal() {
    const grid = document.querySelector('.teams-grid');
    if (!grid) return;

    const overlay = document.createElement('div');
    overlay.className = 'team-modal-overlay';
    
    overlay.innerHTML = `
      <div class="team-modal" role="dialog" aria-modal="true" aria-hidden="true">
        <div class="modal-pull-indicator"></div> <button class="team-modal-close" aria-label="Close">&times;</button>
        <div class="team-modal-grid">
          <div class="team-modal-image"><img alt=""></div>
          <div class="team-modal-content">
            <h2></h2>
            <div class="modal-base"></div>
            <div class="modal-stats"></div>
            <p class="modal-desc-text"></p>
            <a href="#" class="modal-learn-more btn primary" style="margin-top:20px;">Know The Car</a>
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

      const modalImg = overlay.querySelector('.team-modal-image img');
      modalImg.src = img?.src || '';
      modalImg.alt = `${title} 2026 Car`;

      overlay.querySelector('.team-modal-content h2').textContent = title;
      overlay.querySelector('.modal-base').textContent = base;

      const stats = overlay.querySelector('.modal-stats');
      stats.innerHTML = '';
      statNodes.forEach(s => {
        const val = s.querySelector('.stat-value')?.textContent || '';
        const label = s.querySelector('.stat-desc')?.textContent || '';
        const el = document.createElement('div');
        el.className = 'modal-stat';
        el.innerHTML = `<span class="modal-value" style="font-size:1.5rem; font-weight:bold; display:block;">${val}</span><span class="modal-desc" style="color:#aaa; font-size:0.9rem;">${label}</span>`;
        stats.appendChild(el);
      });

      overlay.querySelector('.modal-desc-text').textContent = desc || '';
      
      const carPageLink = teamName ? `cars/${teamName}.html` : '#';
      learnMoreBtn.href = carPageLink;
      learnMoreBtn.style.display = teamName ? 'inline-block' : 'none';

      history.pushState({ modalOpen: true }, "", window.location.href);

      overlay.classList.add('visible');
      overlay.setAttribute('aria-hidden', 'false');
      modal.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    }

    function close() {
      if (overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
        overlay.setAttribute('aria-hidden', 'true');
        modal.setAttribute('aria-hidden', 'true');
        if (history.state && history.state.modalOpen) {
          history.back(); 
        }
      }
    }

    window.addEventListener('popstate', () => {
      if (overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
        overlay.setAttribute('aria-hidden', 'true');
        modal.setAttribute('aria-hidden', 'true');
      }
    });

    grid.addEventListener('click', e => {
      const card = e.target.closest('.team-card');
      if (!card) return;
      if (e.target.closest('a') || e.target.closest('button')) return; 
      open(card);
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { 
      if (e.key === 'Escape' && overlay.classList.contains('visible')) close(); 
    });
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

  function fillTeamStatsFromDataAttributes() {
    document.querySelectorAll('.team-stats').forEach(statsBlock => {
      const championships = statsBlock.dataset.championships ?? '0';
      const wins = statsBlock.dataset.wins ?? '0';
      const founded = statsBlock.dataset.founded ?? 'TBA';

      const statValues = Array.from(statsBlock.querySelectorAll('.stat .stat-value'));
      if (statValues.length >= 3) {
        statValues[0].textContent = statValues[0].textContent.trim() || championships;
        statValues[1].textContent = statValues[1].textContent.trim() || wins;
        statValues[2].textContent = statValues[2].textContent.trim() || founded;
      }
    });
  }

  async function fetchMostRecentSeason() {
    try {
      const resp = await fetch(`${API_ROOT}/seasons.json?limit=1000`);
      if (!resp.ok) return null;
      const json = await resp.json();
      const seasons = json?.MRData?.SeasonTable?.Seasons || [];
      const normalized = seasons.map(s => (typeof s === 'string' ? s : s.season)).filter(Boolean).map(Number);
      if (!normalized.length) return null;
      return String(Math.max(...normalized));
    } catch (err) { 
      return null; 
    }
  }

  async function wireResultsLinks() {
    const resultsLink = document.getElementById('resultsLink');
    const season = await fetchMostRecentSeason();
    if (resultsLink) {
      resultsLink.href = season ? `results.html?season=${encodeURIComponent(season)}` : FALLBACK_RESULTS_URL;
    }
  }

  const constructorMap = {
    "mclaren": { name: "McLaren", class: "mclaren", color: "#ff8c00" },
    "ferrari": { name: "Scuderia Ferrari", class: "ferrari", color: "#dc2626" },
    "mercedes": { name: "Mercedes AMG", class: "mercedes", color: "#00d2be" },
    "red_bull": { name: "Red Bull Racing", class: "redbull", color: "#1e3a8a" },
    "williams": { name: "Williams Racing", class: "williams", color: "#00a0de" },
    "aston_martin": { name: "Aston Martin", class: "astonmartin", color: "#006a4e" },
    "alpine": { name: "Alpine", class: "alpine", color: "#0084c7" },
    "rb": { name: "Racing Bulls", class: "racingbulls", color: "#0f172a" },
    "haas": { name: "Haas", class: "haas", color: "#ffffff" },
    "audi": { name: "Audi", class: "audi", color: "#ff0000" },
    "sauber": { name: "Audi", class: "audi", color: "#ff0000" }, 
    "cadillac": { name: "Cadillac", class: "cadillac", color: "#a2a2a2" },
    "andretti": { name: "Cadillac", class: "cadillac", color: "#a2a2a2" } 
  };

  async function loadConstructorStandings() {
    const table = document.querySelector('.championship-table');
    if (!table) return;
    
    const header = table.querySelector('.table-header');
    
    // Inject Skeletons First
    const skeletonRows = Array(10).fill(`
      <div class="table-row skeleton-box" style="height: 50px; margin-bottom: 8px; border-radius: 12px; border: none;"></div>
    `).join('');
    
    table.innerHTML = '';
    table.appendChild(header);
    table.insertAdjacentHTML('beforeend', skeletonRows); 

    try {
      const response = await fetch(`${API_ROOT}/current/constructorStandings.json`);
      if (!response.ok) throw new Error("Failed to fetch standings");
      
      const data = await response.json();
      const standings = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
      const currentSeason = data.MRData.StandingsTable.season;
      
      table.innerHTML = '';
      table.appendChild(header);

      standings.forEach(standing => {
        const constructorId = standing.Constructor.constructorId;
        const position = standing.position;
        const points = standing.points;
        const teamInfo = constructorMap[constructorId] || { name: standing.Constructor.name, class: constructorId, color: "#cccccc" };

        const row = document.createElement('div');
        row.className = 'table-row';
        row.setAttribute('role', 'row');
        row.style.animation = 'fadeIn 0.5s ease'; 
        
        row.innerHTML = `
          <div>${position}</div>
          <div><span class="team-color ${teamInfo.class}" aria-hidden="true" style="background:${teamInfo.color};"></span>${teamInfo.name}</div>
          <div>${points}</div>
        `;
        table.appendChild(row);
      });

      const sectionTitle = document.querySelector('.championship-section .section-title');
      if (sectionTitle) sectionTitle.textContent = `${currentSeason} Constructor Standings`;

    } catch (error) {
      console.error("Error loading constructor standings, falling back to static HTML:", error);
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await Promise.allSettled([
      includeHTML('navbar', 'navbar.html'),
      includeHTML('footer', 'footer.html')
    ]);
    
    // Global Button Micro-Interaction
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (btn && btn.tagName === 'A' && btn.href && !btn.href.includes('#')) {
        e.preventDefault();
        btn.classList.add('is-loading');
        setTimeout(() => { window.location.href = btn.href; }, 350); 
      }
    });
    
    initFilters();
    initRevealOnScroll();
    fillTeamStatsFromDataAttributes();
    initTeamModal();
    bindImageFallbacks();
    wireResultsLinks();
    loadConstructorStandings();
    
    if(window.initMobileEnhancements) setTimeout(window.initMobileEnhancements, 300);
  });

})();