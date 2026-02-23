/* teams.js — Synchronized for the 11-Team 2026 Layout */

(() => {
  const API_ROOT = 'https://api.jolpi.ca/ergast/f1';
  const FALLBACK_RESULTS_URL = 'results.html';

  // Include Navbar and Footer dynamically
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

  // Handle Team Category Filtering (All, Top Tier, Midfield, Challengers)
  function initFilters() {
    const buttons = Array.from(document.querySelectorAll('.filter-btn'));
    const cards = Array.from(document.querySelectorAll('.team-card'));
    const noResults = document.getElementById('noResults');

    if (!buttons.length || !cards.length) return;

    function applyFilter(filter) {
      let anyVisible = false;

      // Update active button states
      buttons.forEach(b => {
        const isActive = b.dataset.filter === filter;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });

      // Filter the grid cards
      cards.forEach(card => {
        const cat = card.dataset.category || 'all';
        const matches = filter === 'all' || cat === filter;
        
        if (matches) {
          card.style.display = ''; // Reset display
          // Slight delay for reflow so animation works
          setTimeout(() => {
            card.classList.remove('filtered-out');
            card.classList.remove('hidden');
          }, 10);
          anyVisible = true;
        } else {
          card.classList.add('filtered-out');
          card.classList.add('hidden');
          // Wait for CSS transition before removing from flow
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

  // Animate Elements on Scroll
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

  // Inject and Handle the Detailed Team Modal View
  function initTeamModal() {
    const grid = document.querySelector('.teams-grid');
    if (!grid) return;

    // Create modal DOM structure
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
      // Extract data from the clicked card
      const img = card.querySelector('.team-image img');
      const title = card.querySelector('.team-info h2')?.textContent || '';
      const base = card.querySelector('.team-base')?.textContent || '';
      const desc = card.querySelector('.team-description')?.textContent || '';
      const statNodes = card.querySelectorAll('.team-stats .stat');
      const teamName = card.dataset.team || ''; // e.g. 'mclaren', 'cadillac', 'audi'

      // Populate Modal
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
      
      // Wire up the button to their car details page (e.g., cars/audi.html)
      const carPageLink = teamName ? `cars/${teamName}.html` : '#';
      learnMoreBtn.href = carPageLink;
      learnMoreBtn.style.display = teamName ? 'inline-block' : 'none';

      // Show Modal
      overlay.classList.add('visible');
      overlay.setAttribute('aria-hidden', 'false');
      modal.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      modal.setAttribute('aria-hidden', 'true');
    }

    // Attach click listener to grid using event delegation
    grid.addEventListener('click', e => {
      const card = e.target.closest('.team-card');
      if (!card) return;
      // Prevent opening modal if clicking an existing link inside card
      if (e.target.closest('a') || e.target.closest('button')) return; 
      
      open(card);
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { 
      if (e.key === 'Escape' && overlay.classList.contains('visible')) close(); 
    });
  }

  // Handle broken images gracefully
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

  // Auto-fill HTML <span class="stat-value"> elements via data attributes
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

  // Fetch API for dynamic Quick Links to results
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
      // In Fall of 2026, it will route dynamically based on Ergast API
      resultsLink.href = season ? `results.html?season=${encodeURIComponent(season)}` : FALLBACK_RESULTS_URL;
    }
  }

  // Boot up the page
  document.addEventListener('DOMContentLoaded', async () => {
    await Promise.allSettled([
      includeHTML('navbar', 'navbar.html'),
      includeHTML('footer', 'footer.html')
    ]);
    
    initFilters();
    initRevealOnScroll();
    fillTeamStatsFromDataAttributes();
    initTeamModal();
    bindImageFallbacks();
    wireResultsLinks();
  });

})();