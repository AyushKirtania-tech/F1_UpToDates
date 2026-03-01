// F1 Schedule Page - Premium 2026 Update

const API_SOURCES = [
  'https://api.jolpi.ca/ergast/f1',
  'http://api.jolpi.ca/ergast/f1'
];

let allRaces = [];
let currentFilter = 'upcoming'; 

// CONFIRMED 2026 SCHEDULE
const FALLBACK_SCHEDULE = [
  { round: "1", raceName: "Australian Grand Prix", Circuit: { circuitName: "Albert Park Circuit", Location: { locality: "Melbourne", country: "Australia" } }, date: "2026-03-08", time: "04:00:00Z" },
  { round: "2", raceName: "Chinese Grand Prix", Circuit: { circuitName: "Shanghai International Circuit", Location: { locality: "Shanghai", country: "China" } }, date: "2026-03-15", time: "07:00:00Z", Sprint: { date: "2026-03-14", time: "03:30:00Z" } },
  { round: "3", raceName: "Japanese Grand Prix", Circuit: { circuitName: "Suzuka Circuit", Location: { locality: "Suzuka", country: "Japan" } }, date: "2026-03-29", time: "05:00:00Z" },
  { round: "4", raceName: "Bahrain Grand Prix", Circuit: { circuitName: "Bahrain International Circuit", Location: { locality: "Sakhir", country: "Bahrain" } }, date: "2026-04-12", time: "15:00:00Z" },
  { round: "5", raceName: "Saudi Arabian Grand Prix", Circuit: { circuitName: "Jeddah Corniche Circuit", Location: { locality: "Jeddah", country: "Saudi Arabia" } }, date: "2026-04-19", time: "17:00:00Z" },
  { round: "6", raceName: "Miami Grand Prix", Circuit: { circuitName: "Miami International Autodrome", Location: { locality: "Miami", country: "USA" } }, date: "2026-05-03", time: "20:00:00Z", Sprint: { date: "2026-05-02", time: "16:00:00Z" } },
  { round: "7", raceName: "Canadian Grand Prix", Circuit: { circuitName: "Circuit Gilles Villeneuve", Location: { locality: "Montreal", country: "Canada" } }, date: "2026-05-24", time: "18:00:00Z", Sprint: { date: "2026-05-23", time: "17:00:00Z" } },
  { round: "8", raceName: "Monaco Grand Prix", Circuit: { circuitName: "Circuit de Monaco", Location: { locality: "Monte-Carlo", country: "Monaco" } }, date: "2026-06-07", time: "13:00:00Z" },
  { round: "9", raceName: "Spanish Grand Prix", Circuit: { circuitName: "Circuit de Barcelona-Catalunya", Location: { locality: "Montmeló", country: "Spain" } }, date: "2026-06-14", time: "13:00:00Z" },
  { round: "10", raceName: "Austrian Grand Prix", Circuit: { circuitName: "Red Bull Ring", Location: { locality: "Spielberg", country: "Austria" } }, date: "2026-06-28", time: "13:00:00Z" },
  { round: "11", raceName: "British Grand Prix", Circuit: { circuitName: "Silverstone Circuit", Location: { locality: "Silverstone", country: "UK" } }, date: "2026-07-05", time: "14:00:00Z", Sprint: { date: "2026-07-04", time: "10:30:00Z" } },
  { round: "12", raceName: "Belgian Grand Prix", Circuit: { circuitName: "Circuit de Spa-Francorchamps", Location: { locality: "Spa", country: "Belgium" } }, date: "2026-07-19", time: "13:00:00Z" },
  { round: "13", raceName: "Hungarian Grand Prix", Circuit: { circuitName: "Hungaroring", Location: { locality: "Budapest", country: "Hungary" } }, date: "2026-07-26", time: "13:00:00Z" },
  { round: "14", raceName: "Dutch Grand Prix", Circuit: { circuitName: "Circuit Zandvoort", Location: { locality: "Zandvoort", country: "Netherlands" } }, date: "2026-08-23", time: "13:00:00Z", Sprint: { date: "2026-08-22", time: "10:30:00Z" } },
  { round: "15", raceName: "Italian Grand Prix", Circuit: { circuitName: "Autodromo Nazionale di Monza", Location: { locality: "Monza", country: "Italy" } }, date: "2026-09-06", time: "13:00:00Z" },
  { round: "16", raceName: "Madrid Grand Prix", Circuit: { circuitName: "IFEMA Madrid Circuit", Location: { locality: "Madrid", country: "Spain" } }, date: "2026-09-13", time: "13:00:00Z" },
  { round: "17", raceName: "Azerbaijan Grand Prix", Circuit: { circuitName: "Baku City Circuit", Location: { locality: "Baku", country: "Azerbaijan" } }, date: "2026-09-26", time: "11:00:00Z" },
  { round: "18", raceName: "Singapore Grand Prix", Circuit: { circuitName: "Marina Bay Street Circuit", Location: { locality: "Singapore", country: "Singapore" } }, date: "2026-10-11", time: "12:00:00Z", Sprint: { date: "2026-10-10", time: "09:30:00Z" } },
  { round: "19", raceName: "United States Grand Prix", Circuit: { circuitName: "Circuit of the Americas", Location: { locality: "Austin", country: "USA" } }, date: "2026-10-25", time: "19:00:00Z" },
  { round: "20", raceName: "Mexico City Grand Prix", Circuit: { circuitName: "Autódromo Hermanos Rodríguez", Location: { locality: "Mexico City", country: "Mexico" } }, date: "2026-11-01", time: "20:00:00Z" },
  { round: "21", raceName: "São Paulo Grand Prix", Circuit: { circuitName: "Autódromo José Carlos Pace", Location: { locality: "São Paulo", country: "Brazil" } }, date: "2026-11-08", time: "17:00:00Z" },
  { round: "22", raceName: "Las Vegas Grand Prix", Circuit: { circuitName: "Las Vegas Street Circuit", Location: { locality: "Las Vegas", country: "USA" } }, date: "2026-11-21", time: "06:00:00Z" },
  { round: "23", raceName: "Qatar Grand Prix", Circuit: { circuitName: "Lusail International Circuit", Location: { locality: "Lusail", country: "Qatar" } }, date: "2026-11-29", time: "15:00:00Z" },
  { round: "24", raceName: "Abu Dhabi Grand Prix", Circuit: { circuitName: "Yas Marina Circuit", Location: { locality: "Abu Dhabi", country: "UAE" } }, date: "2026-12-06", time: "13:00:00Z" }
];

async function fetchRaceSchedule() {
  const now = new Date();
  for (const apiBase of API_SOURCES) {
    try {
      const response = await fetch(`${apiBase}/current.json`);
      if (response.ok) {
        const data = await response.json();
        const races = data.MRData.RaceTable.Races;
        if (races && races.length > 0 && data.MRData.RaceTable.season === "2026") {
          const season = data.MRData.RaceTable.season;
          document.getElementById('season-title').textContent = `${season} F1 Race Calendar`;
          return races;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${apiBase}:`, error);
    }
  }
  document.getElementById('season-title').textContent = `2026 F1 Race Calendar`;
  return FALLBACK_SCHEDULE;
}

// Formats date nicely (e.g., "15 Mar")
function formatShortDate(dateString) {
  const date = new Date(dateString);
  const day = date.toLocaleDateString('en-US', { day: 'numeric' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return `${day} ${month}`;
}

// Formats full date for hover/titles
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatTime(timeString) {
  if (!timeString) return 'TBA';
  return timeString.substring(0, 5);
}

function isPastRace(dateString, timeString) {
  const timeToUse = timeString ? timeString.substring(0, 8) : '23:59:59';
  const raceDateTimeString = `${dateString}T${timeToUse}Z`;
  const raceDateTime = new Date(raceDateTimeString);
  const now = new Date();
  if (isNaN(raceDateTime.getTime())) return false;
  const raceEndTime = new Date(raceDateTime.getTime() + (3 * 60 * 60 * 1000));
  return raceEndTime < now;
}

function hasSprint(race) {
  return race.Sprint !== undefined;
}

function createSessionCard(label, date, time, isPrimary = false) {
  if (!date) return '';
  return `
    <div class="session-card ${isPrimary ? 'primary' : ''}">
      <div class="session-info">
        <span class="session-label">${label}</span>
        <span class="session-date">${formatShortDate(date)}</span>
      </div>
      <div class="session-time" title="${formatDate(date)}">
        ${formatTime(time)}
      </div>
    </div>
  `;
}

function createRaceCard(race, index) {
  const { round, raceName, Circuit, date, time, Sprint } = race;
  const isPast = isPastRace(date, time);
  const sprint = hasSprint(race);
  
  // Create staggered animation delay based on index
  const animDelay = (index * 0.05) + 's';
  
  return `
    <div class="race-card ${isPast ? 'past' : ''}" style="animation-delay: ${animDelay};" data-status="${isPast ? 'completed' : 'upcoming'}" data-sprint="${sprint}">
      
      <div class="race-header">
        <div class="race-round">Round ${round}</div>
        <div class="race-badges">
          ${sprint ? '<span class="badge sprint">⚡ Sprint</span>' : ''}
          ${isPast ? '<span class="badge past">✓ Done</span>' : '<span class="badge upcoming">● Next</span>'}
        </div>
      </div>
      
      <div class="race-info">
        <h2>${raceName}</h2>
        <div class="circuit-details">
          <p class="circuit-name"><span class="icon">🏎️</span> ${Circuit.circuitName}</p>
          <p class="circuit-location"><span class="icon">📍</span> ${Circuit.Location.locality}, ${Circuit.Location.country}</p>
        </div>
      </div>
      
      <div class="sessions-grid">
        ${createSessionCard('Main Race', date, time, true)}
        ${Sprint ? createSessionCard('Sprint Race', Sprint.date, Sprint.time) : ''}
      </div>
      
    </div>
  `;
}

function renderScheduleCards(races) {
  const container = document.getElementById('schedule-container');
  container.innerHTML = races.map((race, index) => createRaceCard(race, index)).join('');
}

function updateStats(races) {
  const totalRaces = races.length;
  const completed = races.filter(r => isPastRace(r.date, r.time)).length;
  const upcoming = totalRaces - completed;
  const sprint = races.filter(r => hasSprint(r)).length;

  const totalEl = document.getElementById('total-races');
  const completedEl = document.getElementById('completed-races');
  const upcomingEl = document.getElementById('upcoming-races');
  const sprintEl = document.getElementById('sprint-count'); // Maps to highlight value in HTML
  
  if (totalEl) totalEl.textContent = totalRaces;
  if (completedEl) completedEl.textContent = completed;
  if (upcomingEl) upcomingEl.textContent = upcoming;
  if (sprintEl) sprintEl.textContent = sprint;
}

function filterRaces(filter) {
  currentFilter = filter;
  const cards = document.querySelectorAll('.race-card');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) btn.classList.add('active');
  });

  cards.forEach(card => {
    const status = card.dataset.status;
    const sprint = card.dataset.sprint === 'true';
    let show = false;
    switch(filter) {
      case 'all': show = true; break;
      case 'upcoming': show = status === 'upcoming'; break;
      case 'completed': show = status === 'completed'; break;
      case 'sprint': show = sprint; break;
    }
    if (show) card.classList.remove('hidden'); else card.classList.add('hidden');
  });
}

function showError() {
  const loading = document.getElementById('loading');
  loading.innerHTML = `<div class="error" style="text-align:center; color: #ff4500;"><h3>⚠️ Unable to load schedule</h3><p>Using offline schedule data...</p></div>`;
}

function showNotice(message) {
  const notice = document.getElementById('notice');
  if(!notice) return;
  
  // Injects the message with a sleek icon
  notice.innerHTML = `<span style="font-size: 1.6rem; line-height: 1;">🏁</span> <span>${message}</span>`;
  
  // Shows the notice
  notice.classList.add('show');
  
  // I REMOVED the setTimeout here! 
  // The notice will now stay beautifully pinned to the top of your schedule.
}

async function initSchedule() {
  const loading = document.getElementById('loading');
  try {
    allRaces = await fetchRaceSchedule();
    loading.style.display = 'none';
    
    if (allRaces.length === 0) {
      showError();
      return;
    }
    
    renderScheduleCards(allRaces);
    updateStats(allRaces);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => filterRaces(btn.dataset.filter));
    });
    
    filterRaces(currentFilter);
    
    const nextRace = allRaces.find(r => !isPastRace(r.date, r.time));
    if (nextRace) {
      setTimeout(() => {
          showNotice(` Next Up: ${nextRace.raceName} (${formatShortDate(nextRace.date)})`);
      }, 1000);
    }
  } catch (error) {
    showError();
  }
}

document.addEventListener('DOMContentLoaded', initSchedule);



// Mobile Click to open Schedule Details
document.addEventListener('click', function(e) {
  const card = e.target.closest('.race-card');
  if (!card || window.innerWidth > 768) return; // Only trigger on mobile

  const raceName = card.querySelector('h2').innerText;
  const round = card.querySelector('.race-round').innerText;
  const circuitDetails = card.querySelector('.circuit-details').innerHTML;
  const sessions = card.querySelector('.sessions-grid').innerHTML;

  showMobileModal(`
    <div style="margin-bottom: 12px;"><span style="background: rgba(225,6,0,0.1); color: #e10600; padding: 4px 8px; font-size: 0.8rem; border-radius: 0 8px 0 0;">${round}</span></div>
    <h2>${raceName}</h2>
    <div style="color: #aaa; font-size: 0.95rem; border-bottom: 1px solid #333; padding-bottom: 16px;">
      ${circuitDetails}
    </div>
    <div class="sessions-grid">
      ${sessions}
    </div>
  `);
});