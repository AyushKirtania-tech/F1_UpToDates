// F1 Circuits Page

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
    image: 'https://source.unsplash.com/400x200/?melbourne,formula1'
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
    image: 'https://source.unsplash.com/400x200/?bahrain,racing'
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
    image: 'https://source.unsplash.com/400x200/?monaco,racing'
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
    image: 'https://source.unsplash.com/400x200/?silverstone,racing'
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
    image: 'https://source.unsplash.com/400x200/?spa,belgium,racing'
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
    image: 'https://source.unsplash.com/400x200/?monza,italy,racing'
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
    image: 'https://source.unsplash.com/400x200/?japan,racing'
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
    image: 'https://source.unsplash.com/400x200/?singapore,night,racing'
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
    image: 'https://source.unsplash.com/400x200/?brazil,racing'
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
    image: 'https://source.unsplash.com/400x200/?austria,mountains,racing'
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
    image: 'https://source.unsplash.com/400x200/?saudi,arabia,city'
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
    image: 'https://source.unsplash.com/400x200/?texas,racing'
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
    image: 'https://source.unsplash.com/400x200/?italy,racing'
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
    image: 'https://source.unsplash.com/400x200/?miami,racing'
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
    image: 'https://source.unsplash.com/400x200/?netherlands,racing'
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
    image: 'https://source.unsplash.com/400x200/?hungary,racing'
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
    image: 'https://source.unsplash.com/400x200/?baku,azerbaijan'
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
    image: 'https://source.unsplash.com/400x200/?lasvegas,night'
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
    image: 'https://source.unsplash.com/400x200/?shanghai,racing'
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
    image: 'https://source.unsplash.com/400x200/?canada,montreal'
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
    image: 'https://source.unsplash.com/400x200/?abudhabi,racing'
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
    image: 'https://source.unsplash.com/400x200/?mexico,racing'
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
    image: 'https://source.unsplash.com/400x200/?barcelona,racing'
  }
};

// Fetch circuits from Ergast API
async function fetchCircuits() {
  try {
    const response = await fetch(`${API_BASE}/current/circuits.json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch circuits');
    }
    
    const data = await response.json();
    return data.MRData.CircuitTable.Circuits;
  } catch (error) {
    console.error('Error fetching circuits:', error);
    showError();
    return [];
  }
}

// Get circuit details
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

// Create circuit card
function createCircuitCard(circuit) {
  const details = getCircuitDetails(circuit.circuitId);
  const { circuitName, Location } = circuit;
  const { locality, country } = Location;

  return `
    <div class="circuit-card" 
         data-type="${details.type}" 
         data-classic="${details.classic}"
         data-name="${circuitName.toLowerCase()}"
         data-country="${country.toLowerCase()}">
      
      <div class="circuit-image">
        <img src="${details.image}" alt="${circuitName}" loading="lazy">
        <span class="circuit-type ${details.type}">${details.type}</span>
      </div>

      <div class="circuit-content">
        <div class="circuit-header">
          <div class="gp-badge">${details.grandPrixName}</div>
          <h3 class="circuit-name">${circuitName}</h3>
          <p class="circuit-location">${locality}, ${country}</p>
        </div>

        <div class="circuit-info">
          <div class="info-item">
            <span class="info-label">Length</span>
            <span class="info-value">${details.length} km</span>
          </div>
          <div class="info-item">
            <span class="info-label">Turns</span>
            <span class="info-value">${details.turns}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Lap Record</span>
            <span class="info-value">${details.lapRecord}</span>
          </div>
          <div class="info-item">
            <span class="info-label">First Race</span>
            <span class="info-value">${details.firstRace}</span>
          </div>
        </div>

        <p class="circuit-description">${details.description}</p>
      </div>
    </div>
  `;
}

// Render circuits
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
    const name = card.dataset.name;
    const country = card.dataset.country;
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
        const lengthA = parseFloat(a.querySelector('.info-value').textContent);
        const lengthB = parseFloat(b.querySelector('.info-value').textContent);
        return lengthB - lengthA;
      default:
        return 0;
    }
  });

  cards.forEach(card => container.appendChild(card));
}

// Create featured circuit
function createFeaturedCircuit() {
  return `
    <div class="featured-header">
      <span class="featured-badge">Featured Circuit</span>
      <h2>Circuit de Monaco</h2>
      <p class="featured-location">Monte Carlo, Monaco</p>
    </div>
    
    <div class="featured-content">
      <div class="featured-image">
        <div style="width:100%;height:300px;background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);display:flex;align-items:center;justify-content:center;font-size:80px;border-radius:16px;">
          🏰
        </div>
      </div>
      
      <div class="featured-details">
        <h3>The Crown Jewel of Formula 1</h3>
        <p>
          Monaco is the most prestigious race on the F1 calendar. This legendary street circuit 
          winds through the narrow streets of Monte Carlo, offering no room for error. With barriers 
          just inches from the track and average speeds of 160 km/h, it's the ultimate test of 
          precision and concentration. Overtaking is nearly impossible, making qualifying crucial.
        </p>
        <p>
          Since 1950, Monaco has been synonymous with glamour, history, and the pinnacle of 
          motorsport achievement. Winning here is every driver's dream.
        </p>
        
        <div class="featured-stats">
          <div class="info-item">
            <span class="info-label">Circuit Length</span>
            <span class="info-value">3.337 km</span>
          </div>
          <div class="info-item">
            <span class="info-label">Number of Turns</span>
            <span class="info-value">19</span>
          </div>
          <div class="info-item">
            <span class="info-label">First GP</span>
            <span class="info-value">1950</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Update stats
function updateStats(circuits) {
  const countries = new Set(circuits.map(c => c.Location.country));
  
  document.getElementById('total-circuits').textContent = circuits.length;
  document.getElementById('total-countries').textContent = countries.size;
}

// Show error
function showError() {
  const loading = document.getElementById('loading');
  loading.innerHTML = `
    <div class="error">
      <h3>Unable to load circuits</h3>
      <p>Please check your internet connection and try again.</p>
      <button class="btn btn-primary" onclick="location.reload()">Retry</button>
    </div>
  `;
}

// Initialize circuits page
async function initCircuits() {
  console.log('Loading F1 Circuits...');
  
  const loading = document.getElementById('loading');
  
  // Fetch circuits
  allCircuits = await fetchCircuits();
  
  // Hide loading
  loading.style.display = 'none';
  
  if (allCircuits.length === 0) {
    return;
  }
  
  // Render circuits
  renderCircuits(allCircuits);
  
  // Update stats
  updateStats(allCircuits);
  
  // Render featured circuit
  const featuredSection = document.getElementById('featured-circuit');
  if (featuredSection) {
    featuredSection.innerHTML = createFeaturedCircuit();
  }
  
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