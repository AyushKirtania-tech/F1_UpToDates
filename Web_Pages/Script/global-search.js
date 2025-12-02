// Global search functionality
(function() {
  'use strict';

  const API_BASE = 'https://api.jolpi.ca/ergast/f1';
  let searchData = {
    drivers: [],
    teams: [],
    circuits: []
  };

  // Initialize search
  async function initSearch() {
    // Load data in background
    loadSearchData();

    // Create search UI
    createSearchUI();

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !isInputFocused()) {
        e.preventDefault();
        openSearch();
      }
    });
  }

  function isInputFocused() {
    return ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
  }

  async function loadSearchData() {
    try {
      // Load current season data
      const [driversRes, teamsRes, circuitsRes] = await Promise.all([
        fetch(`${API_BASE}/current/drivers.json`),
        fetch(`${API_BASE}/current/constructors.json`),
        fetch(`${API_BASE}/current/circuits.json`)
      ]);

      const driversData = await driversRes.json();
      const teamsData = await teamsRes.json();
      const circuitsData = await circuitsRes.json();

      searchData.drivers = driversData?.MRData?.DriverTable?.Drivers || [];
      searchData.teams = teamsData?.MRData?.ConstructorTable?.Constructors || [];
      searchData.circuits = circuitsData?.MRData?.CircuitTable?.Circuits || [];

      console.log('✅ Search data loaded:', {
        drivers: searchData.drivers.length,
        teams: searchData.teams.length,
        circuits: searchData.circuits.length
      });
    } catch (error) {
      console.error('Failed to load search data:', error);
    }
  }

  function createSearchUI() {
    const searchHTML = `
      <div id="global-search" class="global-search" hidden>
        <div class="search-overlay"></div>
        <div class="search-modal">
          <div class="search-header">
            <input 
              type="text" 
              id="search-input" 
              class="search-input" 
              placeholder="Search drivers, teams, circuits..."
              autocomplete="off"
            >
            <button class="search-close" aria-label="Close search">×</button>
          </div>
          <div class="search-hint">
            <span>💡 Try searching for "Max", "Ferrari", or "Monaco"</span>
          </div>
          <div class="search-results" id="search-results">
            <div class="search-empty">
              <span class="search-empty-icon">🔍</span>
              <p>Start typing to search...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', searchHTML);

    // Event listeners
    const searchContainer = document.getElementById('global-search');
    const searchInput = document.getElementById('search-input');
    const searchClose = searchContainer.querySelector('.search-close');
    const searchOverlay = searchContainer.querySelector('.search-overlay');

    searchInput.addEventListener('input', handleSearch);
    searchClose.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', closeSearch);

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !searchContainer.hidden) {
        closeSearch();
      }
    });
  }

  function openSearch() {
    const searchContainer = document.getElementById('global-search');
    const searchInput = document.getElementById('search-input');
    
    searchContainer.hidden = false;
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => searchInput.focus(), 100);
  }

  function closeSearch() {
    const searchContainer = document.getElementById('global-search');
    const searchInput = document.getElementById('search-input');
    
    searchContainer.hidden = true;
    document.body.style.overflow = '';
    searchInput.value = '';
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = `
      <div class="search-empty">
        <span class="search-empty-icon">🔍</span>
        <p>Start typing to search...</p>
      </div>
    `;
  }

  function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('search-results');

    if (query.length < 2) {
      resultsContainer.innerHTML = `
        <div class="search-empty">
          <span class="search-empty-icon">🔍</span>
          <p>Start typing to search...</p>
        </div>
      `;
      return;
    }

    const results = performSearch(query);
    displayResults(results);
  }

  function performSearch(query) {
    const results = {
      drivers: [],
      teams: [],
      circuits: []
    };

    // Search drivers
    results.drivers = searchData.drivers.filter(driver => {
      const fullName = `${driver.givenName} ${driver.familyName}`.toLowerCase();
      const code = driver.code?.toLowerCase() || '';
      return fullName.includes(query) || code.includes(query);
    }).slice(0, 5);

    // Search teams
    results.teams = searchData.teams.filter(team => {
      const name = team.name.toLowerCase();
      return name.includes(query);
    }).slice(0, 5);

    // Search circuits
    results.circuits = searchData.circuits.filter(circuit => {
      const circuitName = circuit.circuitName.toLowerCase();
      const location = `${circuit.Location.locality} ${circuit.Location.country}`.toLowerCase();
      return circuitName.includes(query) || location.includes(query);
    }).slice(0, 5);

    return results;
  }

  function displayResults(results) {
    const resultsContainer = document.getElementById('search-results');
    const totalResults = results.drivers.length + results.teams.length + results.circuits.length;

    if (totalResults === 0) {
      resultsContainer.innerHTML = `
        <div class="search-empty">
          <span class="search-empty-icon">❌</span>
          <p>No results found</p>
        </div>
      `;
      return;
    }

    let html = '';

    // Drivers section
    if (results.drivers.length > 0) {
      html += `
        <div class="search-section">
          <h3 class="search-section-title">👤 Drivers</h3>
          <div class="search-items">
            ${results.drivers.map(driver => `
              <a href="drivers.html" class="search-item">
                <span class="search-item-icon">🏎️</span>
                <div class="search-item-content">
                  <div class="search-item-title">${driver.givenName} ${driver.familyName}</div>
                  <div class="search-item-meta">${driver.nationality} • #${driver.permanentNumber || 'N/A'}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Teams section
    if (results.teams.length > 0) {
      html += `
        <div class="search-section">
          <h3 class="search-section-title">🏁 Teams</h3>
          <div class="search-items">
            ${results.teams.map(team => `
              <a href="teams.html" class="search-item">
                <span class="search-item-icon">🏆</span>
                <div class="search-item-content">
                  <div class="search-item-title">${team.name}</div>
                  <div class="search-item-meta">${team.nationality}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Circuits section
    if (results.circuits.length > 0) {
      html += `
        <div class="search-section">
          <h3 class="search-section-title">🗺️ Circuits</h3>
          <div class="search-items">
            ${results.circuits.map(circuit => `
              <a href="circuits.html" class="search-item">
                <span class="search-item-icon">🏁</span>
                <div class="search-item-content">
                  <div class="search-item-title">${circuit.circuitName}</div>
                  <div class="search-item-meta">${circuit.Location.locality}, ${circuit.Location.country}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    resultsContainer.innerHTML = html;
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }

  // Expose function for button click
  window.openGlobalSearch = openSearch;
})();