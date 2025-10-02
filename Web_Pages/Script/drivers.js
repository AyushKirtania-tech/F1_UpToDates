/* drivers.js (improved)
   - includeHTML for navbar/footer
   - filterable driver cards (cards may have multiple space-separated categories)
   - reveal-on-scroll (IntersectionObserver)
   - accessible modal (focus trap + restore)
   - image fallback, year placeholders
*/

(() => {
  /* ---------- Helpers ---------- */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- includeHTML: inject external HTML into container ---------- */
  async function includeHTML(id, path) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
      const resp = await fetch(path, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      container.innerHTML = html;
      setActiveNavLink(); // call after nav injected
    } catch (err) {
      // fail silently but log
      console.warn(`Could not load '${path}' into #${id}:`, err.message);
      container.innerHTML = ''; // ensure no leftover
    }
  }

  /* ---------- Set active nav link (robust) ---------- */
  function setActiveNavLink() {
    // run async to ensure nav links exist
    requestAnimationFrame(() => {
      const links = $$('.main-nav a, nav a');
      if (!links.length) return;
      // Use pathname last segment (or index.html if blank)
      const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
      links.forEach(a => {
        const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
        const isActive = href && (href === current || (href === '' && current === 'index.html'));
        a.classList.toggle('active', isActive);
        a.setAttribute('aria-current', isActive ? 'page' : 'false');
      });
    });
  }

  /* ---------- FILTERS ---------- */
  function initFilters() {
    const buttons = $$('.filter-btn');
    const cards = $$('.driver-card');
    const noResults = $('#noResults');

    if (!buttons.length || !cards.length) return;

    // normalize category list of a card into an array
    const cardCats = card => (card.dataset.category || 'all').toLowerCase().trim().split(/\s+/);

    function applyFilter(filter) {
      const f = (filter || 'all').toLowerCase();
      let anyShown = false;

      // update buttons (single-select behavior)
      buttons.forEach(btn => {
        const active = (btn.dataset.filter || 'all').toLowerCase() === f;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
        btn.setAttribute('aria-selected', String(active));
      });

      // show/hide cards
      cards.forEach(card => {
        const cats = cardCats(card);
        const show = f === 'all' || cats.includes(f);
        if (show) {
          // reveal with animation: remove hidden/filtered classes
          card.classList.remove('filtered-out');
          // ensure element is in layout before removing 'hidden' so CSS transition can play
          card.style.display = '';
          requestAnimationFrame(() => card.classList.remove('hidden'));
          anyShown = true;
        } else {
          // add hidden class then after transition set display none/filtered-out
          card.classList.add('hidden');
          // after CSS transition (300ms in your stylesheet) mark filtered
          setTimeout(() => {
            // if still hidden, mark filtered-out and remove from layout
            if (card.classList.contains('hidden')) {
              card.classList.add('filtered-out');
              card.style.display = 'none';
            }
          }, 320);
        }
      });

      if (noResults) noResults.hidden = anyShown;
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
      // keyboard accessibility
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // initial filter (if one button has active class use it, else 'all')
    const start = buttons.find(b => b.classList.contains('active'))?.dataset.filter || 'all';
    applyFilter(start);
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  function initRevealOnScroll() {
    const targets = $$('.reveal');
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

  /* ---------- DRIVER MODAL (accessible) ---------- */
  function initDriverModal() {
    const grid = $('.drivers-grid');
    if (!grid) return;

    // Create overlay/modal once
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

    // keep track of last focused element to restore focus when modal closes
    let lastFocused = null;

    // focus trap helpers
    function trapFocus(e) {
      if (!overlay.classList.contains('visible')) return;
      const focusable = modal.querySelectorAll('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey) { // shift + tab
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else { // tab
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
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

      // populate modal
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

      // show overlay
      overlay.classList.add('visible');
      overlay.setAttribute('aria-hidden', 'false');
      modal.setAttribute('aria-hidden', 'false');

      // wait a tick then focus close button
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
      // restore focus
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') close();
    }

    // delegate click on grid to open modal
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.driver-card');
      if (!card) return;
      // don't open when clicking links or buttons inside the card
      if (e.target.closest('a, button')) return;
      open(card);
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  /* ---------- year placeholders ---------- */
  function updateYearPlaceholders() {
    const yearEls = $$('#currentYear, #yr, .current-year');
    const year = new Date().getFullYear();
    yearEls.forEach(el => (el.textContent = year));
  }

  /* ---------- image fallback ---------- */
  function bindImageFallbacks() {
    document.body.addEventListener('error', (e) => {
      const img = e.target;
      if (img && img.tagName === 'IMG') {
        if (!img.dataset.fallbackApplied) {
          img.dataset.fallbackApplied = '1';
          // try data-fallback attribute first, then generic fallback
          img.src = img.getAttribute('data-fallback') || 'images/driver-fallback.jpg';
        }
      }
    }, true);
  }

  /* ---------- initialize everything ---------- */
  document.addEventListener('DOMContentLoaded', async () => {
    // load navbar & footer if they exist as containers
    await Promise.all([
      includeHTML('navbar', 'navbar.html'),
      includeHTML('footer', 'footer.html')
    ]);

    // init features
    initFilters();
    initRevealOnScroll();
    initDriverModal();
    bindImageFallbacks();
    updateYearPlaceholders();
  });

})();
