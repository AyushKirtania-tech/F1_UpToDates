// Script/circuits.js — 2026 Season
const API_BASE = 'https://api.jolpi.ca/ergast/f1';

let allCircuits = [];

// Circuit data with additional information
const circuitDetails = {
  'albert_park': { type: 'street', classic: false, length: '5.278', turns: '14', lapRecord: '1:20.260', firstRace: '1996', grandPrixName: 'Australian Grand Prix', description: 'A stunning street circuit around Albert Park Lake, combining high-speed sections with technical corners.', image: 'images/circuits/australian.webp' },
  'bahrain': { type: 'permanent', classic: false, length: '5.412', turns: '15', lapRecord: '1:31.447', firstRace: '2004', grandPrixName: 'Bahrain Grand Prix', description: 'A modern desert circuit known for incredible battles and spectacular floodlit night racing.', image: 'images/circuits/bahrain.jpg' },
  'monaco': { type: 'street', classic: true, length: '3.337', turns: '19', lapRecord: '1:12.909', firstRace: '1950', grandPrixName: 'Monaco Grand Prix', description: 'The jewel in F1\'s crown - the most prestigious and challenging street circuit in motorsport.', image: 'images/circuits/monaco.jpg' },
  'silverstone': { type: 'permanent', classic: true, length: '5.891', turns: '18', lapRecord: '1:27.097', firstRace: '1950', grandPrixName: 'British Grand Prix', description: 'The home of British motorsport with fast, flowing corners and rich F1 heritage.', image: 'images/circuits/british.jpeg' },
  'spa': { type: 'permanent', classic: true, length: '7.004', turns: '19', lapRecord: '1:46.286', firstRace: '1950', grandPrixName: 'Belgian Grand Prix', description: 'The longest and most challenging circuit - a true driver\'s favorite with legendary corners.', image: 'images/circuits/belgian.avif' },
  'monza': { type: 'permanent', classic: true, length: '5.793', turns: '11', lapRecord: '1:21.046', firstRace: '1950', grandPrixName: 'Italian Grand Prix', description: 'The Temple of Speed - F1\'s fastest circuit with passionate Italian fans.', image: 'images/circuits/monza.jpg' },
  'suzuka': { type: 'permanent', classic: true, length: '5.807', turns: '18', lapRecord: '1:30.983', firstRace: '1987', grandPrixName: 'Japanese Grand Prix', description: 'A unique figure-eight layout with the iconic 130R corner and passionate Japanese fans.', image: 'images/circuits/japan.webp' },
  'marina_bay': { type: 'street', classic: false, length: '4.940', turns: '23', lapRecord: '1:35.867', firstRace: '2008', grandPrixName: 'Singapore Grand Prix', description: 'F1\'s first night race - a spectacular street circuit under the lights of Singapore.', image: 'images/circuits/singapore.jpg' },
  'interlagos': { type: 'permanent', classic: true, length: '4.309', turns: '15', lapRecord: '1:10.540', firstRace: '1973', grandPrixName: 'São Paulo Grand Prix', description: 'An anti-clockwise circuit with incredible atmosphere and unpredictable weather.', image: 'images/circuits/sao_paulo.webp' },
  'red_bull_ring': { type: 'permanent', classic: false, length: '4.318', turns: '10', lapRecord: '1:05.619', firstRace: '1970', grandPrixName: 'Austrian Grand Prix', description: 'A short, fast circuit in the stunning Austrian mountains with aggressive racing.', image: 'images/circuits/austrian.jpg' },
  'jeddah': { type: 'street', classic: false, length: '6.174', turns: '27', lapRecord: '1:30.734', firstRace: '2021', grandPrixName: 'Saudi Arabian Grand Prix', description: 'The fastest street circuit in F1 with long straights and high-speed corners.', image: 'images/circuits/saudi.webp' },
  'americas': { type: 'permanent', classic: false, length: '5.513', turns: '20', lapRecord: '1:36.169', firstRace: '2012', grandPrixName: 'United States Grand Prix', description: 'A modern circuit in Texas with multiple overtaking opportunities and great facilities.', image: 'images/circuits/americas.avif' },

  // MADRID Mapping
  'madrid': { type: 'street', classic: false, length: '5.474', turns: '20', lapRecord: 'N/A', firstRace: '2026', grandPrixName: 'Spanish Grand Prix', description: 'A brand-new hybrid street circuit built around the IFEMA exhibition centre and Valdebebas, bringing F1 back to the Spanish capital.', image: 'images/circuits/madrid.avif' },

  'miami': { type: 'street', classic: false, length: '5.410', turns: '19', lapRecord: '1:29.708', firstRace: '2022', grandPrixName: 'Miami Grand Prix', description: 'A modern street circuit around the Hard Rock Stadium with an American atmosphere.', image: 'images/circuits/miami.avif' },
  'zandvoort': { type: 'permanent', classic: true, length: '4.259', turns: '14', lapRecord: '1:11.097', firstRace: '1952', grandPrixName: 'Dutch Grand Prix', description: 'A historic Dutch circuit known for its banked corners and passionate orange fans.', image: 'images/circuits/dutch.jpeg' },
  'hungaroring': { type: 'permanent', classic: false, length: '4.381', turns: '14', lapRecord: '1:16.627', firstRace: '1986', grandPrixName: 'Hungarian Grand Prix', description: 'A tight and twisty circuit near Budapest, often compared to Monaco without walls.', image: 'images/circuits/hungarian.webp' },
  'baku': { type: 'street', classic: false, length: '6.003', turns: '20', lapRecord: '1:43.009', firstRace: '2016', grandPrixName: 'Azerbaijan Grand Prix', description: 'A spectacular street circuit combining medieval old town with modern architecture.', image: 'images/circuits/azerbaijan.jpg' },
  'vegas': { type: 'street', classic: false, length: '6.120', turns: '17', lapRecord: 'N/A', firstRace: '2023', grandPrixName: 'Las Vegas Grand Prix', description: 'A glamorous night race on the Las Vegas Strip with incredible entertainment.', image: 'images/circuits/las_vegas.jpg' },
  'shanghai': { type: 'permanent', classic: false, length: '5.451', turns: '16', lapRecord: '1:32.238', firstRace: '2004', grandPrixName: 'Chinese Grand Prix', description: 'A modern circuit with a unique layout and long back straight.', image: 'images/circuits/chinese.jpeg' },
  'villeneuve': { type: 'permanent', classic: true, length: '4.361', turns: '14', lapRecord: '1:13.078', firstRace: '1978', grandPrixName: 'Canadian Grand Prix', description: 'A semi-permanent circuit on Île Notre-Dame with the famous Wall of Champions.', image: 'images/circuits/canadian.jpg' },
  'yas_marina': { type: 'permanent', classic: false, length: '5.281', turns: '16', lapRecord: '1:26.103', firstRace: '2009', grandPrixName: 'Abu Dhabi Grand Prix', description: 'A spectacular twilight race at the Yas Marina complex in Abu Dhabi.', image: 'images/circuits/abu_dhabi.avif' },
  'rodriguez': { type: 'permanent', classic: true, length: '4.304', turns: '17', lapRecord: '1:17.774', firstRace: '1963', grandPrixName: 'Mexico City Grand Prix', description: 'High altitude circuit with passionate fans and unique challenges due to thin air.', image: 'images/circuits/mexico.jpg' },

  // BARCELONA Mapping
  'catalunya': { type: 'permanent', classic: false, length: '4.657', turns: '14', lapRecord: '1:16.330', firstRace: '1991', grandPrixName: 'Barcelona Grand Prix', description: 'Continuing its long F1 legacy alongside the Madrid entry, this sweeping technical circuit now hosts the Barcelona Grand Prix.', image: 'images/circuits/spanish.jpg' },

  'losail': { type: 'permanent', classic: false, length: '5.419', turns: '16', lapRecord: '1:22.384', firstRace: '2021', grandPrixName: 'Qatar Grand Prix', description: 'Held at the Lusail (Losail) International Circuit — a modern, high-speed permanent track.', image: 'images/circuits/qatar.webp' }
};

// 2026 Fallback Array
const fallback2026Circuits = [
  { circuitId: "albert_park", circuitName: "Albert Park Circuit", Location: { locality: "Melbourne", country: "Australia" } },
  { circuitId: "shanghai", circuitName: "Shanghai International Circuit", Location: { locality: "Shanghai", country: "China" } },
  { circuitId: "suzuka", circuitName: "Suzuka Circuit", Location: { locality: "Suzuka", country: "Japan" } },
  { circuitId: "bahrain", circuitName: "Bahrain International Circuit", Location: { locality: "Sakhir", country: "Bahrain" } },
  { circuitId: "jeddah", circuitName: "Jeddah Corniche Circuit", Location: { locality: "Jeddah", country: "Saudi Arabia" } },
  { circuitId: "miami", circuitName: "Miami International Autodrome", Location: { locality: "Miami", country: "USA" } },
  { circuitId: "catalunya", circuitName: "Circuit de Barcelona-Catalunya", Location: { locality: "Montmeló", country: "Spain" } },
  { circuitId: "villeneuve", circuitName: "Circuit Gilles Villeneuve", Location: { locality: "Montreal", country: "Canada" } },
  { circuitId: "monaco", circuitName: "Circuit de Monaco", Location: { locality: "Monte-Carlo", country: "Monaco" } },
  { circuitId: "madrid", circuitName: "IFEMA Madrid Circuit", Location: { locality: "Madrid", country: "Spain" } },
  { circuitId: "red_bull_ring", circuitName: "Red Bull Ring", Location: { locality: "Spielberg", country: "Austria" } },
  { circuitId: "silverstone", circuitName: "Silverstone Circuit", Location: { locality: "Silverstone", country: "UK" } },
  { circuitId: "spa", circuitName: "Circuit de Spa-Francorchamps", Location: { locality: "Spa", country: "Belgium" } },
  { circuitId: "hungaroring", circuitName: "Hungaroring", Location: { locality: "Budapest", country: "Hungary" } },
  { circuitId: "zandvoort", circuitName: "Circuit Zandvoort", Location: { locality: "Zandvoort", country: "Netherlands" } },
  { circuitId: "monza", circuitName: "Autodromo Nazionale di Monza", Location: { locality: "Monza", country: "Italy" } },
  { circuitId: "baku", circuitName: "Baku City Circuit", Location: { locality: "Baku", country: "Azerbaijan" } },
  { circuitId: "marina_bay", circuitName: "Marina Bay Street Circuit", Location: { locality: "Singapore", country: "Singapore" } },
  { circuitId: "americas", circuitName: "Circuit of the Americas", Location: { locality: "Austin", country: "USA" } },
  { circuitId: "rodriguez", circuitName: "Autódromo Hermanos Rodríguez", Location: { locality: "Mexico City", country: "Mexico" } },
  { circuitId: "interlagos", circuitName: "Autódromo José Carlos Pace", Location: { locality: "São Paulo", country: "Brazil" } },
  { circuitId: "vegas", circuitName: "Las Vegas Street Circuit", Location: { locality: "Las Vegas", country: "USA" } },
  { circuitId: "losail", circuitName: "Lusail International Circuit", Location: { locality: "Lusail", country: "Qatar" } },
  { circuitId: "yas_marina", circuitName: "Yas Marina Circuit", Location: { locality: "Abu Dhabi", country: "UAE" } }
];

function escapeHtml(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildResultsUrlForCircuit({ circuitId, season = '2026' } = {}) {
  const q = new URLSearchParams();
  if (season) q.set('season', String(season));
  if (circuitId) q.set('circuit', String(circuitId));
  return `results.html?${q.toString()}`;
}

// ULTRA-SMART MATCHER
function getCircuitDetails(circuit) {
  let cid = circuit.circuitId;
  const nameLower = (circuit.circuitName || '').toLowerCase();
  const locLower = (circuit.Location?.locality || '').toLowerCase();

  if (nameLower.includes('madrid') || locLower.includes('madrid')) cid = 'madrid';
  else if (nameLower.includes('barcelona') || nameLower.includes('catalunya') || locLower.includes('montmeló')) cid = 'catalunya';

  return circuitDetails[cid] || {
    type: 'permanent', classic: false, length: 'N/A', turns: 'N/A', lapRecord: 'N/A', firstRace: 'N/A', grandPrixName: 'Grand Prix',
    description: 'A challenging Formula 1 racing circuit.', image: 'https://source.unsplash.com/400x200/?racing,circuit'
  };
}

function createCircuitCard(circuit) {
  const details = getCircuitDetails(circuit);
  const { circuitName, Location } = circuit;
  const { locality, country } = Location;
  const resultsUrl = buildResultsUrlForCircuit({ circuitId: circuit.circuitId, season: '2026' });

  // Fallback string logs the error to your console so you can see exactly what path failed
  const fallbackStr = `console.error('Failed to load image:', this.src); this.onerror=null; this.src='https://source.unsplash.com/400x200/?racing,circuit';`;

  return `
    <div class="circuit-card" 
         data-type="${details.type}" 
         data-classic="${details.classic}"
         data-name="${escapeHtml(circuitName.toLowerCase())}"
         data-country="${escapeHtml(country.toLowerCase())}">
      
      <div class="circuit-image">
        <img src="${details.image}" alt="${escapeHtml(circuitName)}" loading="lazy" onerror="${fallbackStr}">
        <span class="circuit-type ${details.type}">${details.type}</span>
      </div>

      <div class="circuit-content">
        <div class="circuit-header">
          <div class="gp-badge">${escapeHtml(details.grandPrixName)}</div>
          <h3 class="circuit-name">${escapeHtml(circuitName)}</h3>
          <p class="circuit-location">${escapeHtml(locality)}, ${escapeHtml(country)}</p>
        </div>

        <div class="circuit-info">
          <div class="info-item"><span class="info-label">Length</span><span class="info-value">${escapeHtml(details.length)} km</span></div>
          <div class="info-item"><span class="info-label">Turns</span><span class="info-value">${escapeHtml(details.turns)}</span></div>
          <div class="info-item"><span class="info-label">Lap Record</span><span class="info-value">${escapeHtml(details.lapRecord)}</span></div>
          <div class="info-item"><span class="info-label">First Race</span><span class="info-value">${escapeHtml(details.firstRace)}</span></div>
        </div>
        <p class="circuit-description">${escapeHtml(details.description)}</p>
        <div class="circuit-actions" style="margin-top:12px;">
          <a class="btn small" href="${resultsUrl}" title="View 2026 results for ${escapeHtml(circuitName)}">View 2026 Results</a>
        </div>
      </div>
    </div>
  `;
}

function renderCircuits(circuits) {
  const container = document.getElementById('circuits-container');
  container.innerHTML = circuits.map(circuit => createCircuitCard(circuit)).join('');
}

function filterCircuits(filter) {
  const cards = document.querySelectorAll('.circuit-card');
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
  cards.forEach(card => {
    let show = false;
    switch (filter) {
      case 'all': show = true; break;
      case 'street': show = card.dataset.type === 'street'; break;
      case 'permanent': show = card.dataset.type === 'permanent'; break;
      case 'classic': show = card.dataset.classic === 'true'; break;
    }
    card.classList.toggle('hidden', !show);
  });
}

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

function sortCircuits(sortBy) {
  const container = document.getElementById('circuits-container');
  const cards = Array.from(container.querySelectorAll('.circuit-card'));
  cards.sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.dataset.name.localeCompare(b.dataset.name);
      case 'country': return a.dataset.country.localeCompare(b.dataset.country);
      case 'length':
        const getLength = node => {
          const vals = Array.from(node.querySelectorAll('.info-value'));
          for (let v of vals) if (v.textContent.includes('km')) return parseFloat(v.textContent) || 0;
          return 0;
        };
        return getLength(b) - getLength(a);
      default: return 0;
    }
  });
  cards.forEach(card => container.appendChild(card));
}

function updateStats(circuits) {
  const countries = new Set(circuits.map(c => c.Location.country));
  document.getElementById('total-circuits').textContent = circuits.length;
  document.getElementById('total-countries').textContent = countries.size;
}

async function fetchCircuits() {
  try {
    const response = await fetch(`${API_BASE}/2026/circuits.json`);
    if (!response.ok) throw new Error('API failed');
    const data = await response.json();
    const circuits = data.MRData.CircuitTable.Circuits;
    if (!circuits || circuits.length === 0) return fallback2026Circuits;
    return circuits;
  } catch (error) {
    return fallback2026Circuits;
  }
}

async function initCircuits() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = '';
  allCircuits = await fetchCircuits();
  if (loading) loading.style.display = 'none';

  if (!allCircuits || allCircuits.length === 0) return;

  renderCircuits(allCircuits);
  updateStats(allCircuits);

  document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => filterCircuits(btn.dataset.filter)));
  const searchInput = document.getElementById('circuit-search');
  if (searchInput) searchInput.addEventListener('input', (e) => searchCircuits(e.target.value));
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.addEventListener('change', (e) => sortCircuits(e.target.value));
}

document.addEventListener('DOMContentLoaded', initCircuits);