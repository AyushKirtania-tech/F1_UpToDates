/* drivers.js
   - Clean navbar/footer loading
   - Filterable driver cards with animation
   - Reveal on scroll (IntersectionObserver)
   - Modal with driver details and learn more button
*/

(() => {
  /* includeHTML: injects external html into a container */
  async function includeHTML(id, path) {
    const container = document.getElementById(id);
    if (!container) return Promise.resolve();
    
    try {
      const resp = await fetch(path, { cache: "no-store" });
      if (!resp.ok) throw new Error('Not found');
      const html = await resp.text();
      container.innerHTML = html;
      setActiveNavLink();
      return;
    } catch (err) {
      console.warn(`Could not load ${path} for ${id}:`, err.message);
      return;
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

  /* FILTERS */
  function initFilters() {
    const buttons = Array.from(document.querySelectorAll('.filter-btn'));
    const cards = Array.from(document.querySelectorAll('.driver-card'));
    const noResults = document.getElementById('noResults');

    if (!buttons.length || !cards.length) return;

    function applyFilter(filter) {
      let any = false;
      buttons.forEach(b => {
        const isActive = b.dataset.filter === filter;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });

      cards.forEach(card => {
        const cat = card.dataset.category || 'all';
        const matches = filter === 'all' || cat === filter || cat === 'all';
        if (matches) {
          card.classList.remove('filtered-out');
          card.style.display = '';
          requestAnimationFrame(() => card.classList.remove('hidden'));
          any = true;
        } else {
          card.classList.add('hidden');
          setTimeout(() => {
            card.classList.add('filtered-out');
          }, 300);
        }
      });

      if (noResults) {
        noResults.hidden = any;
      }
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filter || 'all'));
    });

    const start = buttons.find(b => b.classList.contains('active'))?.dataset.filter || 'all';
    applyFilter(start);
  }

  /* REVEAL ON SCROLL */
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

  /* MODAL for driver details */
  function initDriverModal() {
    const grid = document.querySelector('.drivers-grid');
    if (!grid) return;

    const overlay = document.createElement('div');
    overlay.className = 'driver-modal-overlay';
    overlay.innerHTML = `
      <div class="driver-modal" role="dialog" aria-modal="true" aria-hidden="true">
        <button class="driver-modal-close" aria-label="Close">&times;</button>
        <div class="driver-modal-image"><img alt=""></div>
        <div class="driver-modal-content">
          <h2></h2>
          <div class="modal-team"></div>
          <div class="modal-stats"></div>
          <p class="modal-desc-text"></p>
          <a href="#" class="modal-learn-more" target="_blank" rel="noopener noreferrer">Learn More</a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const modal = overlay.querySelector('.driver-modal');
    const closeBtn = overlay.querySelector('.driver-modal-close');
    const learnMoreBtn = overlay.querySelector('.modal-learn-more');

    function open(card) {
      const img = card.querySelector('.driver-image img');
      const name = card.querySelector('.driver-details h2')?.textContent || '';
      const team = card.querySelector('.team-name')?.textContent || '';
      const desc = card.querySelector('.driver-description')?.textContent || '';
      const statNodes = card.querySelectorAll('.driver-stats .stat');
      const driverLink = card.dataset.link || '#';

      overlay.classList.add('visible');
      overlay.setAttribute('aria-hidden', 'false');
      modal.setAttribute('aria-hidden', 'false');

      const modalImg = overlay.querySelector('.driver-modal-image img');
      modalImg.src = img?.src || '';
      modalImg.alt = name;
      
      overlay.querySelector('.driver-modal-content h2').textContent = name;
      overlay.querySelector('.modal-team').textContent = team;

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
      
      // Update Learn More button
      learnMoreBtn.href = driverLink;
      if (driverLink === '#') {
        learnMoreBtn.style.display = 'none';
      } else {
        learnMoreBtn.style.display = 'inline-block';
      }
      
      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden','true');
      modal.setAttribute('aria-hidden','true');
    }

    grid.addEventListener('click', e => {
      const card = e.target.closest('.driver-card');
      if (!card) return;
      if (e.target.closest('a') || e.target.closest('button')) return;
      open(card);
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('visible')) close(); });
  }

  /* Update year placeholders */
  function updateYearPlaceholders() {
    const yearEls = document.querySelectorAll('#currentYear, #yr');
    const currentYear = new Date().getFullYear();
    yearEls.forEach(el => el.textContent = currentYear);
  }

  /* Global image fallback handler */
  function bindImageFallbacks() {
    document.body.addEventListener('error', e => {
      const target = e.target;
      if (target && target.tagName === 'IMG') {
        if (!target.dataset.fallbackApplied) {
          target.dataset.fallbackApplied = '1';
          target.src = target.getAttribute('data-fallback') || 'images/driver-fallback.jpg';
        }
      }
    }, true);
  }

  /* Initialize when DOM ready */
  document.addEventListener('DOMContentLoaded', async () => {
    // Load navbar and footer
    await Promise.all([
      includeHTML('navbar', 'navbar.html'),
      includeHTML('footer', 'footer.html')
    ]);

    // Initialize interactive features
    initFilters();
    initRevealOnScroll();
    initDriverModal();
    updateYearPlaceholders();
    bindImageFallbacks();
  });

})();