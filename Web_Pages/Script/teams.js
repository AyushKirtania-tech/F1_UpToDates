// Script/teams.js
// Controls filtering, reveal-on-scroll, accessible interactions, and team detail modal.

document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const teamCards = Array.from(document.querySelectorAll('.team-card'));
  const teamsGrid = document.querySelector('.teams-grid');
  // create no-results element (hidden by default)
  const noResults = document.createElement('div');
  noResults.className = 'no-results';
  noResults.textContent = 'No teams match your filter.';
  noResults.style.display = 'none';
  if (teamsGrid && teamsGrid.parentElement) {
    teamsGrid.parentElement.insertBefore(noResults, teamsGrid.nextSibling);
  }

  // --- Filtering logic ---
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter || 'all';
      applyFilter(filter);
    });

    // keyboard accessibility
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  function applyFilter(filter) {
    let visibleCount = 0;

    teamCards.forEach(card => {
      const cat = card.dataset.category || '';
      if (filter === 'all' || filter === cat) {
        showCard(card);
        visibleCount++;
      } else {
        hideCard(card);
      }
    });

    noResults.style.display = (visibleCount === 0) ? 'block' : 'none';
    // after filtering, smooth-scroll to top of grid
    if (teamsGrid) teamsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Hide with animation then remove from layout
  function hideCard(card) {
    if (card.classList.contains('hidden') || card.classList.contains('filtered-out')) return;
    // remove any existing transitionend handler
    card.classList.add('hidden');
    const onTrans = function () {
      card.classList.add('filtered-out');
      card.removeEventListener('transitionend', onTrans);
    };
    card.addEventListener('transitionend', onTrans);
    // fallback in case transitionend doesn't fire
    setTimeout(() => {
      if (!card.classList.contains('filtered-out')) {
        card.classList.add('filtered-out');
      }
    }, 500);
  }

  // Show: ensure in layout then animate in
  function showCard(card) {
    if (!card.classList.contains('filtered-out')) {
      // if already visible, ensure it's not hidden
      card.classList.remove('hidden');
      return;
    }
    card.classList.remove('filtered-out');
    // force reflow to allow transition
    void card.offsetWidth;
    card.classList.remove('hidden');
  }

  // Initialize default filter (if a button has .active initially, use it)
  const activeBtn = filterBtns.find(b => b.classList.contains('active'));
  if (activeBtn) applyFilter(activeBtn.dataset.filter || 'all');
  else applyFilter('all');

  // --- Reveal on scroll using IntersectionObserver ---
  const revealElements = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach(el => observer.observe(el));
  } else {
    // fallback - just show all
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // --- Team modal (click on any team-card to open) ---
  teamCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Avoid opening modal when clicking interactive children (if present)
      const interactive = e.target.closest('a, button, input, label');
      if (interactive) return;
      openTeamModal(card);
    });

    // make team cards keyboard-accessible (Enter/Space)
    card.tabIndex = 0;
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  function openTeamModal(card) {
    // gather content
    const teamName = card.querySelector('.team-info h2')?.textContent?.trim() || card.dataset.team || 'Team';
    const teamBase = card.querySelector('.team-base')?.textContent?.trim() || '';
    const teamImg = card.querySelector('.team-image img')?.src || '';
    const description = card.querySelector('.team-description')?.textContent?.trim() || '';
    const stats = Array.from(card.querySelectorAll('.team-stats .stat')).map(s => {
      return {
        value: s.querySelector('.stat-value')?.textContent || '',
        desc: s.querySelector('.stat-desc')?.textContent || ''
      };
    });

    // build modal
    const overlay = document.createElement('div');
    overlay.className = 'team-modal-overlay';
    overlay.innerHTML = /* html */`
      <div class="team-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(teamName)}">
        <button class="team-modal-close" aria-label="Close modal">&times;</button>
        <div class="team-modal-grid">
          <div class="team-modal-image">
            <img src="${escapeHtml(teamImg)}" alt="${escapeHtml(teamName)} car" loading="lazy">
          </div>
          <div class="team-modal-content">
            <h2>${escapeHtml(teamName)}</h2>
            <p class="modal-base">${escapeHtml(teamBase)}</p>
            <div class="modal-stats">
              ${stats.map(s => `<div class="modal-stat"><span class="modal-value">${escapeHtml(s.value)}</span><span class="modal-desc">${escapeHtml(s.desc)}</span></div>`).join('')}
            </div>
            <p class="modal-desc-text">${escapeHtml(description)}</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    // prevent background scroll
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // small delay then show
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // close handlers
    const close = () => {
      overlay.classList.remove('visible');
      // restore scroll after transition
      overlay.addEventListener('transitionend', () => {
        overlay.remove();
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }, { once: true });
      window.removeEventListener('keydown', escHandler);
    };

    overlay.querySelector('.team-modal-close')?.addEventListener('click', close);
    overlay.addEventListener('click', (evt) => {
      if (evt.target === overlay) close();
    });

    const escHandler = (evt) => {
      if (evt.key === 'Escape') close();
    };
    window.addEventListener('keydown', escHandler);
  }

  // small html escape util to avoid trivial injection
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});
