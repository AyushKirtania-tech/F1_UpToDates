// Keyboard shortcuts for navigation
(function() {
  'use strict';

  const shortcuts = {
    'h': 'index.html',     // Home
    'd': 'drivers.html',   // Drivers
    't': 'teams.html',     // Teams
    'c': 'circuits.html',  // Circuits
    's': 'schedule.html',  // Schedule
    'r': 'results.html',   // Results
    'a': 'about.html',     // About
    '/': null,             // Focus search (future)
    '?': null              // Show shortcuts modal
  };

  let modalOpen = false;

  document.addEventListener('keydown', (e) => {
    // Don't trigger if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key.toLowerCase();

    // Show shortcuts help
    if (key === '?') {
      showShortcutsModal();
      return;
    }

    // Navigate
    if (shortcuts[key] && shortcuts[key] !== null) {
      e.preventDefault();
      window.location.href = shortcuts[key];
    }
  });

  function showShortcutsModal() {
    if (modalOpen) {
      closeShortcutsModal();
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'shortcuts-modal';
    modal.innerHTML = `
      <div class="shortcuts-overlay">
        <div class="shortcuts-content">
          <button class="shortcuts-close" aria-label="Close">&times;</button>
          <h2>⌨️ Keyboard Shortcuts</h2>
          <div class="shortcuts-grid">
            <div class="shortcut-item">
              <kbd>H</kbd>
              <span>Home</span>
            </div>
            <div class="shortcut-item">
              <kbd>D</kbd>
              <span>Drivers</span>
            </div>
            <div class="shortcut-item">
              <kbd>T</kbd>
              <span>Teams</span>
            </div>
            <div class="shortcut-item">
              <kbd>C</kbd>
              <span>Circuits</span>
            </div>
            <div class="shortcut-item">
              <kbd>S</kbd>
              <span>Schedule</span>
            </div>
            <div class="shortcut-item">
              <kbd>R</kbd>
              <span>Results</span>
            </div>
            <div class="shortcut-item">
              <kbd>A</kbd>
              <span>About</span>
            </div>
            <div class="shortcut-item">
              <kbd>?</kbd>
              <span>Show this help</span>
            </div>
            <div class="shortcut-item">
              <kbd>ESC</kbd>
              <span>Close modal</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modalOpen = true;

    // Close on click outside or ESC
    modal.querySelector('.shortcuts-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('shortcuts-overlay')) {
        closeShortcutsModal();
      }
    });

    modal.querySelector('.shortcuts-close').addEventListener('click', closeShortcutsModal);

    document.addEventListener('keydown', handleEscape);
  }

  function handleEscape(e) {
    if (e.key === 'Escape' && modalOpen) {
      closeShortcutsModal();
    }
  }

  function closeShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
      modal.remove();
      modalOpen = false;
      document.removeEventListener('keydown', handleEscape);
    }
  }

  // Show hint on first visit
  if (!localStorage.getItem('shortcuts-hint-shown')) {
    setTimeout(() => {
      const hint = document.createElement('div');
      hint.className = 'shortcuts-hint';
      hint.innerHTML = `
        <span>💡 Press <kbd>?</kbd> for keyboard shortcuts</span>
        <button aria-label="Dismiss">x</button>
      `;
      document.body.appendChild(hint);

      hint.querySelector('button').addEventListener('click', () => {
        hint.remove();
        localStorage.setItem('shortcuts-hint-shown', 'true');
      });

      setTimeout(() => hint.remove(), 5000);
    }, 2000);
  }
})();