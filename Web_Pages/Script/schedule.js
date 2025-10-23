// F1 Schedule Page - Multiple API fallbacks with CORS handling
// DEFAULT VIEW: UPCOMING RACES

const API_SOURCES = [
  'https://api.jolpi.ca/ergast/f1',
  'http://api.jolpi.ca/ergast/f1'
];

let allRaces = [];
let currentFilter = 'upcoming'; // Default filter

// Hardcoded 2024 F1 Schedule as ultimate fallback
const FALLBACK_SCHEDULE = [
  {
    round: "1",
    raceName: "Bahrain Grand Prix",
    Circuit: {
      circuitName: "Bahrain International Circuit",
      Location: { locality: "Sakhir", country: "Bahrain" }
    },
    date: "2024-03-02",
    time: "15:00:00Z",
    FirstPractice: { date: "2024-02-29", time: "11:30:00Z" },
    SecondPractice: { date: "2024-02-29", time: "15:00:00Z" },
    ThirdPractice: { date: "2024-03-01", time: "12:30:00Z" },
    Qualifying: { date: "2024-03-01", time: "16:00:00Z" }
  },
  {
    round: "2",
    raceName: "Saudi Arabian Grand Prix",
    Circuit: {
      circuitName: "Jeddah Corniche Circuit",
      Location: { locality: "Jeddah", country: "Saudi Arabia" }
    },
    date: "2024-03-09",
    time: "17:00:00Z",
    FirstPractice: { date: "2024-03-07", time: "13:30:00Z" },
    SecondPractice: { date: "2024-03-07", time: "17:00:00Z" },
    ThirdPractice: { date: "2024-03-08", time: "13:30:00Z" },
    Qualifying: { date: "2024-03-08", time: "17:00:00Z" }
  },
  {
    round: "3",
    raceName: "Australian Grand Prix",
    Circuit: {
      circuitName: "Albert Park Circuit",
      Location: { locality: "Melbourne", country: "Australia" }
    },
    date: "2024-03-24",
    time: "05:00:00Z",
    FirstPractice: { date: "2024-03-22", time: "01:30:00Z" },
    SecondPractice: { date: "2024-03-22", time: "05:00:00Z" },
    ThirdPractice: { date: "2024-03-23", time: "01:30:00Z" },
    Qualifying: { date: "2024-03-23", time: "05:00:00Z" }
  },
  {
    round: "4",
    raceName: "Japanese Grand Prix",
    Circuit: {
      circuitName: "Suzuka Circuit",
      Location: { locality: "Suzuka", country: "Japan" }
    },
    date: "2024-04-07",
    time: "05:00:00Z",
    FirstPractice: { date: "2024-04-05", time: "02:30:00Z" },
    SecondPractice: { date: "2024-04-05", time: "06:00:00Z" },
    ThirdPractice: { date: "2024-04-06", time: "02:30:00Z" },
    Qualifying: { date: "2024-04-06", time: "06:00:00Z" }
  },
  {
    round: "5",
    raceName: "Chinese Grand Prix",
    Circuit: {
      circuitName: "Shanghai International Circuit",
      Location: { locality: "Shanghai", country: "China" }
    },
    date: "2024-04-21",
    time: "07:00:00Z",
    FirstPractice: { date: "2024-04-19", time: "03:30:00Z" },
    Qualifying: { date: "2024-04-19", time: "07:00:00Z" },
    Sprint: { date: "2024-04-20", time: "03:00:00Z" },
    SecondPractice: { date: "2024-04-20", time: "07:30:00Z" }
  },
  {
    round: "6",
    raceName: "Miami Grand Prix",
    Circuit: {
      circuitName: "Miami International Autodrome",
      Location: { locality: "Miami", country: "USA" }
    },
    date: "2024-05-05",
    time: "19:30:00Z",
    FirstPractice: { date: "2024-05-03", time: "16:30:00Z" },
    Qualifying: { date: "2024-05-03", time: "20:00:00Z" },
    Sprint: { date: "2024-05-04", time: "16:00:00Z" },
    SecondPractice: { date: "2024-05-04", time: "20:30:00Z" }
  },
  {
    round: "7",
    raceName: "Emilia Romagna Grand Prix",
    Circuit: {
      circuitName: "Autodromo Enzo e Dino Ferrari",
      Location: { locality: "Imola", country: "Italy" }
    },
    date: "2024-05-19",
    time: "13:00:00Z",
    FirstPractice: { date: "2024-05-17", time: "11:30:00Z" },
    SecondPractice: { date: "2024-05-17", time: "15:00:00Z" },
    ThirdPractice: { date: "2024-05-18", time: "10:30:00Z" },
    Qualifying: { date: "2024-05-18", time: "14:00:00Z" }
  },
  {
    round: "8",
    raceName: "Monaco Grand Prix",
    Circuit: {
      circuitName: "Circuit de Monaco",
      Location: { locality: "Monte-Carlo", country: "Monaco" }
    },
    date: "2024-05-26",
    time: "13:00:00Z",
    FirstPractice: { date: "2024-05-24", time: "11:30:00Z" },
    SecondPractice: { date: "2024-05-24", time: "15:00:00Z" },
    ThirdPractice: { date: "2024-05-25", time: "10:30:00Z" },
    Qualifying: { date: "2024-05-25", time: "14:00:00Z" }
  },
  {
    round: "9",
    raceName: "Canadian Grand Prix",
    Circuit: {
      circuitName: "Circuit Gilles Villeneuve",
      Location: { locality: "Montreal", country: "Canada" }
    },
    date: "2024-06-09",
    time: "18:00:00Z",
    FirstPractice: { date: "2024-06-07", time: "17:30:00Z" },
    SecondPractice: { date: "2024-06-07", time: "21:00:00Z" },
    ThirdPractice: { date: "2024-06-08", time: "16:30:00Z" },
    Qualifying: { date: "2024-06-08", time: "20:00:00Z" }
  },
  {
    round: "10",
    raceName: "Spanish Grand Prix",
    Circuit: {
      circuitName: "Circuit de Barcelona-Catalunya",
      Location: { locality: "Montmeló", country: "Spain" }
    },
    date: "2024-06-23",
    time: "13:00:00Z",
    FirstPractice: { date: "2024-06-21", time: "11:30:00Z" },
    SecondPractice: { date: "2024-06-21", time: "15:00:00Z" },
    ThirdPractice: { date: "2024-06-22", time: "10:30:00Z" },
    Qualifying: { date: "2024-06-22", time: "14:00:00Z" }
  },
  {
    round: "11",
    raceName: "Austrian Grand Prix",
    Circuit: {
      circuitName: "Red Bull Ring",
      Location: { locality: "Spielberg", country: "Austria" }
    },
    date: "2024-06-30",
    time: "13:00:00Z",
    FirstPractice: { date: "2024-06-28", time: "10:30:00Z" },
    Qualifying: { date: "2024-06-28", time: "14:00:00Z" },
    Sprint: { date: "2024-06-29", time: "10:00:00Z" },
    SecondPractice: { date: "2024-06-29", time: "14:30:00Z" }
  },
  {
    round: "12",
    raceName: "British Grand Prix",
    Circuit: {
      circuitName: "Silverstone Circuit",
      Location: { locality: "Silverstone", country: "UK" }
    },
    date: "2024-07-07",
    time: "14:00:00Z",
    FirstPractice: { date: "2024-07-05", time: "11:30:00Z" },
    SecondPractice: { date: "2024-07-05", time: "15:00:00Z" },
    ThirdPractice: { date: "2024-07-06", time: "10:30:00Z" },
    Qualifying: { date: "2024-07-06", time: "14:00:00Z" }
  },
  {
    round: "13",
    raceName: "Hungarian Grand Prix",
    Circuit: {
      circuitName: "Hungaroring",
      Location: { locality: "Budapest", country: "Hungary" }
    },
    date: "2024-07-21",
    time: "13:00:00Z",
    FirstPractice: { date: "2024-07-19", time: "11:30:00Z" },
    SecondPractice: { date: "2024-07-19", time: "15:00:00Z" },
    ThirdPractice: { date: "2024-07-20", time: "10:30:00Z" },
    Qualifying: { date: "2024-07-20", time: "14:00:00Z" }
  },
  {
    round: "14",
    raceName: "Belgian Grand Prix",
    Circuit: {
      circuitName: "Circuit de Spa-Francorchamps",
      Location: { locality: "Spa", country: "Belgium" }
    },
    date: "2024-07-28",
    time: "13:00:00Z",
    FirstPractice: { date: "2024-07-26", time: "11:30:00Z" },
    SecondPractice: { date: "2024-07-26", time: "15:00:00Z" },
    ThirdPractice: { date: "2024-07-27", time: "10:30:00Z" },
    Qualifying: { date: "2024-07-27", time: "14:00:00Z" }
  },
  {
    round: "15",
    raceName: "Dutch Grand Prix",
    Circuit: {
      circuitName: "Circuit Zandvoort",
      Location: { locality: "Zandvoort", country: "Netherlands" }
    },
    date: "2024-08-25",
    time: "13:00:00Z",
    FirstPractice: { date: "2024-08-23", time: "10:30:00Z" },
    SecondPractice: { date: "2024-08-23", time: "14:00:00Z" },
    ThirdPractice: { date: "2024-08-24", time: "09:30:00Z" },
    Qualifying: { date: "2024-08-24", time: "13:00:00Z" }
  },
  {
    round: "16",
    raceName: "Italian Grand Prix",
    Circuit: {
      circuitName: "Autodromo Nazionale di Monza",
      Location: { locality: "Monza", country: "Italy" }
    },
    date: "2024-09-01",
    time: "13:00:00Z",
    FirstPractice: { date: "2024-08-30", time: "11:30:00Z" },
    SecondPractice: { date: "2024-08-30", time: "15:00:00Z" },
    ThirdPractice: { date: "2024-08-31", time: "10:30:00Z" },
    Qualifying: { date: "2024-08-31", time: "14:00:00Z" }
  },
  {
    round: "17",
    raceName: "Azerbaijan Grand Prix",
    Circuit: {
      circuitName: "Baku City Circuit",
      Location: { locality: "Baku", country: "Azerbaijan" }
    },
    date: "2024-09-15",
    time: "11:00:00Z",
    FirstPractice: { date: "2024-09-13", time: "09:30:00Z" },
    SecondPractice: { date: "2024-09-13", time: "13:00:00Z" },
    ThirdPractice: { date: "2024-09-14", time: "08:30:00Z" },
    Qualifying: { date: "2024-09-14", time: "12:00:00Z" }
  },
  {
    round: "18",
    raceName: "Singapore Grand Prix",
    Circuit: {
      circuitName: "Marina Bay Street Circuit",
      Location: { locality: "Singapore", country: "Singapore" }
    },
    date: "2024-09-22",
    time: "12:00:00Z",
    FirstPractice: { date: "2024-09-20", time: "09:30:00Z" },
    SecondPractice: { date: "2024-09-20", time: "13:00:00Z" },
    ThirdPractice: { date: "2024-09-21", time: "09:30:00Z" },
    Qualifying: { date: "2024-09-21", time: "13:00:00Z" }
  },
  {
    round: "19",
    raceName: "United States Grand Prix",
    Circuit: {
      circuitName: "Circuit of the Americas",
      Location: { locality: "Austin", country: "USA" }
    },
    date: "2024-10-20",
    time: "19:00:00Z",
    FirstPractice: { date: "2024-10-18", time: "16:30:00Z" },
    Qualifying: { date: "2024-10-18", time: "20:00:00Z" },
    Sprint: { date: "2024-10-19", time: "18:00:00Z" },
    SecondPractice: { date: "2024-10-19", time: "22:30:00Z" }
  },
  {
    round: "20",
    raceName: "Mexico City Grand Prix",
    Circuit: {
      circuitName: "Autódromo Hermanos Rodríguez",
      Location: { locality: "Mexico City", country: "Mexico" }
    },
    date: "2024-10-27",
    time: "20:00:00Z",
    FirstPractice: { date: "2024-10-25", time: "17:30:00Z" },
    SecondPractice: { date: "2024-10-25", time: "21:00:00Z" },
    ThirdPractice: { date: "2024-10-26", time: "16:30:00Z" },
    Qualifying: { date: "2024-10-26", time: "20:00:00Z" }
  },
  {
    round: "21",
    raceName: "São Paulo Grand Prix",
    Circuit: {
      circuitName: "Autódromo José Carlos Pace",
      Location: { locality: "São Paulo", country: "Brazil" }
    },
    date: "2024-11-03",
    time: "17:00:00Z",
    FirstPractice: { date: "2024-11-01", time: "14:30:00Z" },
    Qualifying: { date: "2024-11-01", time: "18:00:00Z" },
    Sprint: { date: "2024-11-02", time: "14:00:00Z" },
    SecondPractice: { date: "2024-11-02", time: "18:30:00Z" }
  },
  {
    round: "22",
    raceName: "Las Vegas Grand Prix",
    Circuit: {
      circuitName: "Las Vegas Street Circuit",
      Location: { locality: "Las Vegas", country: "USA" }
    },
    date: "2024-11-24",
    time: "06:00:00Z",
    FirstPractice: { date: "2024-11-22", time: "02:30:00Z" },
    SecondPractice: { date: "2024-11-22", time: "06:00:00Z" },
    ThirdPractice: { date: "2024-11-23", time: "02:30:00Z" },
    Qualifying: { date: "2024-11-23", time: "06:00:00Z" }
  },
  {
    round: "23",
    raceName: "Qatar Grand Prix",
    Circuit: {
      circuitName: "Lusail International Circuit",
      Location: { locality: "Lusail", country: "Qatar" }
    },
    date: "2024-12-01",
    time: "15:00:00Z",
    FirstPractice: { date: "2024-11-29", time: "11:30:00Z" },
    Qualifying: { date: "2024-11-29", time: "15:00:00Z" },
    Sprint: { date: "2024-11-30", time: "13:00:00Z" },
    SecondPractice: { date: "2024-11-30", time: "16:30:00Z" }
  },
  {
    round: "24",
    raceName: "Abu Dhabi Grand Prix",
    Circuit: {
      circuitName: "Yas Marina Circuit",
      Location: { locality: "Abu Dhabi", country: "UAE" }
    },
    date: "2024-12-08",
    time: "13:00:00Z",
    FirstPractice: { date: "2024-12-06", time: "09:30:00Z" },
    SecondPractice: { date: "2024-12-06", time: "13:00:00Z" },
    ThirdPractice: { date: "2024-12-07", time: "10:30:00Z" },
    Qualifying: { date: "2024-12-07", time: "14:00:00Z" }
  }
];

// Try multiple API sources with fallback
async function fetchRaceSchedule() {
  // Try each API source
  for (const apiBase of API_SOURCES) {
    try {
      console.log(`Trying API: ${apiBase}`);
      const response = await fetch(`${apiBase}/current.json`);
      
      if (response.ok) {
        const data = await response.json();
        const races = data.MRData.RaceTable.Races;
        
        if (races && races.length > 0) {
          const season = data.MRData.RaceTable.season;
          document.getElementById('season-title').textContent = `${season} F1 Race Calendar`;
          console.log(`✅ Loaded ${races.length} races from ${apiBase}`);
          return races;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${apiBase}:`, error);
    }
  }
  
  // If all APIs fail, use fallback data
  console.log('📦 Using fallback schedule data');
  showNotice('⚠️ Using offline schedule data - Live updates unavailable');
  return FALLBACK_SCHEDULE;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format time
function formatTime(timeString) {
  if (!timeString) return 'TBA';
  return timeString.substring(0, 5);
}

// Check if race is in the past
function isPastRace(dateString, timeString) {
  const timeToUse = timeString ? timeString.substring(0, 8) : '23:59:59';
  const raceDateTimeString = `${dateString}T${timeToUse}Z`;
  const raceDateTime = new Date(raceDateTimeString);
  const now = new Date();
  
  if (isNaN(raceDateTime.getTime())) {
    console.warn(`Invalid date: ${raceDateTimeString}`);
    return false;
  }
  
  const raceEndTime = new Date(raceDateTime.getTime() + (3 * 60 * 60 * 1000));
  return raceEndTime < now;
}

// Check if race has sprint
function hasSprint(race) {
  return race.Sprint !== undefined;
}

// Create session card
function createSessionCard(label, date, time, isPrimary = false) {
  if (!date) return '';
  
  return `
    <div class="session-card ${isPrimary ? 'primary' : ''}">
      <div class="session-label">${label}</div>
      <div class="session-date">${formatDate(date)}</div>
      <div class="session-time">⏱️ ${formatTime(time)}</div>
    </div>
  `;
}

// Create race card
function createRaceCard(race) {
  const {
    round,
    raceName,
    Circuit,
    date,
    time,
    FirstPractice,
    SecondPractice,
    ThirdPractice,
    Qualifying,
    Sprint
  } = race;

  const isPast = isPastRace(date, time);
  const sprint = hasSprint(race);
  
  return `
    <div class="race-card ${isPast ? 'past' : ''}" data-status="${isPast ? 'completed' : 'upcoming'}" data-sprint="${sprint}">
      <div class="race-header">
        <div class="race-round">Round ${round}</div>
      </div>
      
      <div class="race-info">
        <h2>${raceName}</h2>
        <p class="circuit-name">🏎️ ${Circuit.circuitName}</p>
        <p class="circuit-location">${Circuit.Location.locality}, ${Circuit.Location.country}</p>
      </div>

      <div class="sessions-grid">
        ${FirstPractice ? createSessionCard('Free Practice 1', FirstPractice.date, FirstPractice.time) : ''}
        ${SecondPractice ? createSessionCard('Free Practice 2', SecondPractice.date, SecondPractice.time) : ''}
        ${Sprint ? createSessionCard('Sprint Race', Sprint.date, Sprint.time) : ''}
        ${ThirdPractice ? createSessionCard('Free Practice 3', ThirdPractice.date, ThirdPractice.time) : ''}
        ${Qualifying ? createSessionCard('Qualifying', Qualifying.date, Qualifying.time) : ''}
        ${createSessionCard('Race', date, time, true)}
      </div>

      ${sprint ? '<div class="sprint-badge">⚡ Sprint</div>' : ''}
      ${isPast ? '<div class="past-badge">✓ Completed</div>' : '<div class="upcoming-badge">● Live Soon</div>'}
    </div>
  `;
}

// Render schedule in card view
function renderScheduleCards(races) {
  const container = document.getElementById('schedule-container');
  container.innerHTML = races.map(race => createRaceCard(race)).join('');
}

// Update statistics
function updateStats(races) {
  const totalRaces = races.length;
  const completed = races.filter(r => isPastRace(r.date, r.time)).length;
  const upcoming = totalRaces - completed;
  const sprint = races.filter(r => hasSprint(r)).length;

  // Update stats if elements exist
  const totalEl = document.getElementById('total-races');
  const completedEl = document.getElementById('completed-races');
  const upcomingEl = document.getElementById('upcoming-races');
  const sprintEl = document.getElementById('sprint-races');
  
  if (totalEl) totalEl.textContent = totalRaces;
  if (completedEl) completedEl.textContent = completed;
  if (upcomingEl) upcomingEl.textContent = upcoming;
  if (sprintEl) sprintEl.textContent = sprint;

  // Update season stats
  const seasonRacesEl = document.getElementById('season-races');
  const sprintCountEl = document.getElementById('sprint-count');
  
  if (seasonRacesEl) seasonRacesEl.textContent = totalRaces;
  if (sprintCountEl) sprintCountEl.textContent = sprint;
}

// Filter races
function filterRaces(filter) {
  currentFilter = filter;
  const cards = document.querySelectorAll('.race-card');
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });

  // Filter cards
  cards.forEach(card => {
    const status = card.dataset.status;
    const sprint = card.dataset.sprint === 'true';
    
    let show = false;
    
    switch(filter) {
      case 'all':
        show = true;
        break;
      case 'upcoming':
        show = status === 'upcoming';
        break;
      case 'completed':
        show = status === 'completed';
        break;
      case 'sprint':
        show = sprint;
        break;
    }
    
    if (show) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// Show error
function showError() {
  const loading = document.getElementById('loading');
  loading.innerHTML = `
    <div class="error">
      <h3>⚠️ Unable to load schedule</h3>
      <p>Loading offline schedule data...</p>
    </div>
  `;
}

// Show notice
function showNotice(message) {
  const notice = document.getElementById('notice');
  notice.textContent = message;
  notice.classList.add('show');
  
  setTimeout(() => {
    notice.classList.remove('show');
  }, 5000);
}

// Initialize
async function initSchedule() {
  console.log('🏎️ Loading F1 Schedule...');
  
  const loading = document.getElementById('loading');
  
  try {
    allRaces = await fetchRaceSchedule();
    
    loading.style.display = 'none';
    
    if (allRaces.length === 0) {
      showError();
      return;
    }
    
    // Render all race cards
    renderScheduleCards(allRaces);
    
    // Update statistics
    updateStats(allRaces);
    
    // Setup filter buttons BEFORE applying filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterRaces(btn.dataset.filter);
      });
    });
    
    // Apply default filter (upcoming races)
    filterRaces(currentFilter);
    
    // Show next race notification
    const nextRace = allRaces.find(r => !isPastRace(r.date, r.time));
    if (nextRace) {
      showNotice(`🏁 Next Race: ${nextRace.raceName} on ${formatDate(nextRace.date)}`);
    }
    
    console.log('✅ Schedule loaded successfully! Showing upcoming races by default.');
  } catch (error) {
    console.error('Error initializing schedule:', error);
    showError();
  }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initSchedule);