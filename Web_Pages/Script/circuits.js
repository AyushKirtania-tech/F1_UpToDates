// Script/circuits.js — complete and ready to use
const API_BASE = 'https://api.jolpi.ca/ergast/f1';

let allCircuits = [];

// Circuit data with additional information
const circuitDetails = {
  'albert_park': {
    type: 'street',
    classic: false,
    length: '5.278',
    turns: '14',
    lapRecord: '1:20.260',
    firstRace: '1996',
    grandPrixName: 'Australian Grand Prix',
    description: 'A stunning street circuit around Albert Park Lake, combining high-speed sections with technical corners.',
    image: 'images/circuits/australian.webp'
  },
  'bahrain': {
    type: 'permanent',
    classic: false,
    length: '5.412',
    turns: '15',
    lapRecord: '1:31.447',
    firstRace: '2004',
    grandPrixName: 'Bahrain Grand Prix',
    description: 'A modern desert circuit known for incredible battles and spectacular floodlit night racing.',
    image: 'images/circuits/bahrain.jpg'
  },
  'monaco': {
    type: 'street',
    classic: true,
    length: '3.337',
    turns: '19',
    lapRecord: '1:12.909',
    firstRace: '1950',
    grandPrixName: 'Monaco Grand Prix',
    description: 'The jewel in F1\'s crown - the most prestigious and challenging street circuit in motorsport.',
    image: 'images/circuits/monaco.jpg'
  },
  'silverstone': {
    type: 'permanent',
    classic: true,
    length: '5.891',
    turns: '18',
    lapRecord: '1:27.097',
    firstRace: '1950',
    grandPrixName: 'British Grand Prix',
    description: 'The home of British motorsport with fast, flowing corners and rich F1 heritage.',
    image: 'images/circuits/british.jpeg'
  },
  'spa': {
    type: 'permanent',
    classic: true,
    length: '7.004',
    turns: '19',
    lapRecord: '1:46.286',
    firstRace: '1950',
    grandPrixName: 'Belgian Grand Prix',
    description: 'The longest and most challenging circuit - a true driver\'s favorite with legendary corners.',
    image: 'images/circuits/belgian.avif'
  },
  'monza': {
    type: 'permanent',
    classic: true,
    length: '5.793',
    turns: '11',
    lapRecord: '1:21.046',
    firstRace: '1950',
    grandPrixName: 'Italian Grand Prix',
    description: 'The Temple of Speed - F1\'s fastest circuit with passionate Italian fans.',
    image: 'images/circuits/monza.jpg'
  },
  'suzuka': {
    type: 'permanent',
    classic: true,
    length: '5.807',
    turns: '18',
    lapRecord: '1:30.983',
    firstRace: '1987',
    grandPrixName: 'Japanese Grand Prix',
    description: 'A unique figure-eight layout with the iconic 130R corner and passionate Japanese fans.',
    image: 'images/circuits/japan.webp'
  },
  'marina_bay': {
    type: 'street',
    classic: false,
    length: '4.940',
    turns: '23',
    lapRecord: '1:35.867',
    firstRace: '2008',
    grandPrixName: 'Singapore Grand Prix',
    description: 'F1\'s first night race - a spectacular street circuit under the lights of Singapore.',
    image: 'images/circuits/singapore.jpg'
  },
  'interlagos': {
    type: 'permanent',
    classic: true,
    length: '4.309',
    turns: '15',
    lapRecord: '1:10.540',
    firstRace: '1973',
    grandPrixName: 'São Paulo Grand Prix',
    description: 'An anti-clockwise circuit with incredible atmosphere and unpredictable weather.',
    image: 'images/circuits/sao_paulo.webp'
  },
  'red_bull_ring': {
    type: 'permanent',
    classic: false,
    length: '4.318',
    turns: '10',
    lapRecord: '1:05.619',
    firstRace: '1970',
    grandPrixName: 'Austrian Grand Prix',
    description: 'A short, fast circuit in the stunning Austrian mountains with aggressive racing.',
    image: 'images/circuits/austrian.jpg'
  },
  'jeddah': {
    type: 'street',
    classic: false,
    length: '6.174',
    turns: '27',
    lapRecord: '1:30.734',
    firstRace: '2021',
    grandPrixName: 'Saudi Arabian Grand Prix',
    description: 'The fastest street circuit in F1 with long straights and high-speed corners.',
    image: 'images/circuits/saudi.webp'
  },
  'americas': {
    type: 'permanent',
    classic: false,
    length: '5.513',
    turns: '20',
    lapRecord: '1:36.169',
    firstRace: '2012',
    grandPrixName: 'United States Grand Prix',
    description: 'A modern circuit in Texas with multiple overtaking opportunities and great facilities.',
    image: 'images/circuits/americas.avif'
  },
  'imola': {
    type: 'permanent',
    classic: true,
    length: '4.909',
    turns: '19',
    lapRecord: '1:15.484',
    firstRace: '1980',
    grandPrixName: 'Emilia Romagna Grand Prix',
    description: 'Named after Enzo and Dino Ferrari, this historic circuit offers challenging corners.',
    image: 'images/circuits/imola.avif'
  },
  'miami': {
    type: 'street',
    classic: false,
    length: '5.410',
    turns: '19',
    lapRecord: '1:29.708',
    firstRace: '2022',
    grandPrixName: 'Miami Grand Prix',
    description: 'A modern street circuit around the Hard Rock Stadium with an American atmosphere.',
    image: 'images/circuits/miami.avif'
  },
  'zandvoort': {
    type: 'permanent',
    classic: true,
    length: '4.259',
    turns: '14',
    lapRecord: '1:11.097',
    firstRace: '1952',
    grandPrixName: 'Dutch Grand Prix',
    description: 'A historic Dutch circuit known for its banked corners and passionate orange fans.',
    image: 'images/circuits/dutch.jpeg'
  },
  'hungaroring': {
    type: 'permanent',
    classic: false,
    length: '4.381',
    turns: '14',
    lapRecord: '1:16.627',
    firstRace: '1986',
    grandPrixName: 'Hungarian Grand Prix',
    description: 'A tight and twisty circuit near Budapest, often compared to Monaco without walls.',
    image: 'images/circuits/hungarian.webp'
  },
  'baku': {
    type: 'street',
    classic: false,
    length: '6.003',
    turns: '20',
    lapRecord: '1:43.009',
    firstRace: '2016',
    grandPrixName: 'Azerbaijan Grand Prix',
    description: 'A spectacular street circuit combining medieval old town with modern architecture.',
    image: 'images/circuits/azerbaijan.jpg'
  },
  'vegas': {
    type: 'street',
    classic: false,
    length: '6.120',
    turns: '17',
    lapRecord: 'N/A',
    firstRace: '2023',
    grandPrixName: 'Las Vegas Grand Prix',
    description: 'A glamorous night race on the Las Vegas Strip with incredible entertainment.',
    image: 'images/circuits/las_vegas.jpg'
  },
  'shanghai': {
    type: 'permanent',
    classic: false,
    length: '5.451',
    turns: '16',
    lapRecord: '1:32.238',
    firstRace: '2004',
    grandPrixName: 'Chinese Grand Prix',
    description: 'A modern circuit with a unique layout and long back straight.',
    image: 'images/circuits/chinese.jpeg'
  },
  'villeneuve': {
    type: 'permanent',
    classic: true,
    length: '4.361',
    turns: '14',
    lapRecord: '1:13.078',
    firstRace: '1978',
    grandPrixName: 'Canadian Grand Prix',
    description: 'A semi-permanent circuit on Île Notre-Dame with the famous Wall of Champions.',
    image: 'images/circuits/canadian.jpg'
  },
  'yas_marina': {
    type: 'permanent',
    classic: false,
    length: '5.281',
    turns: '16',
    lapRecord: '1:26.103',
    firstRace: '2009',
    grandPrixName: 'Abu Dhabi Grand Prix',
    description: 'A spectacular twilight race at the Yas Marina complex in Abu Dhabi.',
    image: 'images/circuits/abu_dhabi.avif'
  },
  'rodriguez': {
    type: 'permanent',
    classic: true,
    length: '4.304',
    turns: '17',
    lapRecord: '1:17.774',
    firstRace: '1963',
    grandPrixName: 'Mexico City Grand Prix',
    description: 'High altitude circuit with passionate fans and unique challenges due to thin air.',
    image: 'images/circuits/mexico.jpg'
  },
  'catalunya': {
    type: 'permanent',
    classic: false,
    length: '4.675',
    turns: '16',
    lapRecord: '1:18.149',
    firstRace: '1991',
    grandPrixName: 'Spanish Grand Prix',
    description: 'The Spanish Grand Prix venue, known for testing and technical sections.',
    image: 'images/circuits/spanish.jpg'
  },
  'losail': {
    type: 'permanent',
    classic: false,
    length: '5.419',
    turns: '16',
    lapRecord: '1:22.384',
    firstRace: '2021',
    grandPrixName: 'Qatar Grand Prix',
    description: 'Held at the Lusail (Losail) International Circuit — a modern, high-speed permanent track with a long main straight and 16 corners. Often run under lights, it challenges tyres and top speed setups.',
    image: 'images/circuits/qatar.webp'
  },
};

// Helper: escape HTML special characters
function escapeHtml (str = '') {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// Helper: safely build results page URL for a circuit (defaults to season 2025)
function buildResultsUrlForCircuit({ circuitId, season = '2025' } = {}) {
  const q = new URLSearchParams();
  if (season) q.set('season', String(season));
  if (circuitId) q.set('circuit', String(circuitId));
  return `results.html?${q.toString()}`;
}

// Get circuit details (fallback)
function getCircuitDetails(circuitId) {
  return circuitDetails[circuitId] || {
    type: 'permanent',
    classic: false,
    length: 'N/A',
    turns: 'N/A',
    lapRecord: 'N/A',
    firstRace: 'N/A',
    grandPrixName: 'Grand Prix',
    description: 'A challenging Formula 1 racing circuit.',
    image: 'https://source.unsplash.com/400x200/?racing,circuit'
  };
}

// Create circuit card (includes View 2025 Results button)
function createCircuitCard(circuit) {
  const details = getCircuitDetails(circuit.circuitId);
  const { circuitName, Location } = circuit;
  const { locality, country } = Location;

  const resultsUrl = buildResultsUrlForCircuit({ circuitId: circuit.circuitId, season: '2025' });

  return `
    <div class="circuit-card" 
         data-type="${details.type}" 
         data-classic="${details.classic}"
         data-name="${escapeHtml(circuitName.toLowerCase())}"
         data-country="${escapeHtml(country.toLowerCase())}">
      
      <div class="circuit-image">
        <img src="${details.image}" alt="${escapeHtml(circuitName)}" loading="lazy">
        <span class="circuit-type ${details.type}">${details.type}</span>
      </div>

      <div class="circuit-content">
        <div class="circuit-header">
          <div class="gp-badge">${escapeHtml(details.grandPrixName)}</div>
          <h3 class="circuit-name">${escapeHtml(circuitName)}</h3>
          <p class="circuit-location">${escapeHtml(locality)}, ${escapeHtml(country)}</p>
        </div>

        <div class="circuit-info">
          <div class="info-item">
            <span class="info-label">Length</span>
            <span class="info-value">${escapeHtml(details.length)} km</span>
          </div>
          <div class="info-item">
            <span class="info-label">Turns</span>
            <span class="info-value">${escapeHtml(details.turns)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Lap Record</span>
            <span class="info-value">${escapeHtml(details.lapRecord)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">First Race</span>
            <span class="info-value">${escapeHtml(details.firstRace)}</span>
          </div>
        </div>

        <p class="circuit-description">${escapeHtml(details.description)}</p>

        <div class="circuit-actions" style="margin-top:12px;">
          <a class="btn small" href="${resultsUrl}" title="View 2025 results for ${escapeHtml(circuitName)}">
            View 2025 Results
          </a>
        </div>
      </div>
    </div>
  `;
}

// Render circuits into DOM
function renderCircuits(circuits) {
  const container = document.getElementById('circuits-container');
  container.innerHTML = circuits.map(circuit => createCircuitCard(circuit)).join('');
}

// Filter circuits
function filterCircuits(filter) {
  const cards = document.querySelectorAll('.circuit-card');
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  cards.forEach(card => {
    let show = false;
    
    switch(filter) {
      case 'all':
        show = true;
        break;
      case 'street':
        show = card.dataset.type === 'street';
        break;
      case 'permanent':
        show = card.dataset.type === 'permanent';
        break;
      case 'classic':
        show = card.dataset.classic === 'true';
        break;
    }
    
    card.classList.toggle('hidden', !show);
  });
}

// Search circuits
function searchCircuits(query) {
  const cards = document.querySelectorAll('.circuit-card');
  const searchTerm = query.toLowerCase();

  cards.forEach(card => {
    const name = card.dataset.name || '';
    const country = card.dataset.country || '';
    const matches = name.includes(searchTerm) || country.includes(searchTerm);
    
    card.classList.toggle('hidden', !matches);
  });
}

// Sort circuits
function sortCircuits(sortBy) {
  const container = document.getElementById('circuits-container');
  const cards = Array.from(container.querySelectorAll('.circuit-card'));

  cards.sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.dataset.name.localeCompare(b.dataset.name);
      case 'country':
        return a.dataset.country.localeCompare(b.dataset.country);
      case 'length':
        const getLength = node => {
          const vals = Array.from(node.querySelectorAll('.info-value'));
          for (let v of vals) {
            if (v.textContent.includes('km')) return parseFloat(v.textContent) || 0;
          }
          return 0;
        };
        return getLength(b) - getLength(a);
      default:
        return 0;
    }
  });

  cards.forEach(card => container.appendChild(card));
}

// Update stats in hero
function updateStats(circuits) {
  const countries = new Set(circuits.map(c => c.Location.country));
  const totalCircuitsEl = document.getElementById('total-circuits');
  const totalCountriesEl = document.getElementById('total-countries');
  if (totalCircuitsEl) totalCircuitsEl.textContent = circuits.length;
  if (totalCountriesEl) totalCountriesEl.textContent = countries.size;
}

// Show error UI in loading area
function showError() {
  const loading = document.getElementById('loading');
  if (!loading) return;
  loading.innerHTML = `
    <div class="error">
      <h3>Unable to load circuits</h3>
      <p>Please check your internet connection and try again.</p>
      <button class="btn btn-primary" onclick="location.reload()">Retry</button>
    </div>
  `;
}

// Fetch circuits from Ergast API
async function fetchCircuits() {
  try {
    const response = await fetch(`${API_BASE}/current/circuits.json`);
    if (!response.ok) throw new Error('Failed to fetch circuits');
    const data = await response.json();
    return data.MRData.CircuitTable.Circuits || [];
  } catch (error) {
    console.error('Error fetching circuits:', error);
    showError();
    return [];
  }
}

// Initialize circuits page
async function initCircuits() {
  console.log('Loading F1 Circuits...');
  const loading = document.getElementById('loading');

  // Show loading spinner (if present)
  if (loading) loading.style.display = '';

  allCircuits = await fetchCircuits();

  // Hide loading area
  if (loading) loading.style.display = 'none';

  if (!allCircuits || allCircuits.length === 0) {
    return;
  }

  renderCircuits(allCircuits);
  updateStats(allCircuits);

  // Setup filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterCircuits(btn.dataset.filter);
    });
  });

  // Setup search
  const searchInput = document.getElementById('circuit-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchCircuits(e.target.value);
    });
  }

  // Setup sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortCircuits(e.target.value);
    });
  }

  console.log('Circuits loaded successfully!');
}

// Load on page ready
document.addEventListener('DOMContentLoaded', initCircuits);
