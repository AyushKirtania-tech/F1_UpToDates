// F1 Racing Website - Clean JavaScript

// Utility functions
const $ = (selector) => document.querySelector(selector);

// Race data
const upcomingRaces = [
  {
    name: "Singapore Grand Prix",
    circuit: "Marina Bay Street Circuit",
    date: new Date('2025-10-15T14:00:00'),
    location: "Singapore"
  },
  {
    name: "Japanese Grand Prix", 
    circuit: "Suzuka International Racing Course",
    date: new Date('2025-10-29T14:00:00'),
    location: "Suzuka, Japan"
  },
  {
    name: "United States Grand Prix",
    circuit: "Circuit of the Americas",
    date: new Date('2025-11-12T14:00:00'),
    location: "Austin, Texas"
  }
];

// Next race functionality
function setupNextRace() {
  const now = new Date();
  const nextRace = upcomingRaces.find(race => race.date > now) || upcomingRaces[0];
  
  updateNextRaceDisplay(nextRace);
  startCountdown(nextRace.date);
}

function updateNextRaceDisplay(race) {
  const nameEl = $('#nr-name');
  const circuitEl = $('#nr-circuit');
  const dateEl = $('#nr-date');

  if (nameEl) nameEl.textContent = race.name;
  if (circuitEl) circuitEl.textContent = race.circuit;
  if (dateEl) {
    dateEl.textContent = race.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// Countdown timer
function startCountdown(targetDate) {
  const daysEl = $('#cd-days');
  const hoursEl = $('#cd-hours');
  const minsEl = $('#cd-mins');
  const secsEl = $('#cd-secs');

  if (!daysEl) return;

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      const countdownEl = $('#countdown');
      if (countdownEl) {
        countdownEl.innerHTML = '<div style="text-align: center; color: var(--accent); font-weight: 900; font-size: 1.2rem; padding: 20px;">🏁 RACE IS LIVE! 🏁</div>';
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minsEl) minsEl.textContent = minutes.toString().padStart(2, '0');
    if (secsEl) secsEl.textContent = seconds.toString().padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Newsletter functionality
function setupNewsletter() {
  const form = $('#newsletter-form');
  const emailInput = $('#email');
  const messageEl = $('#newsletter-msg');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      showMessage('Please enter your email address.', 'error');
      return;
    }
    
    if (!emailRegex.test(email)) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }

    // Simulate subscription
    showMessage('🏁 Welcome to the Paddock Club! Confirmation sent to ' + email, 'success');
    emailInput.value = '';
  });

  function showMessage(message, type) {
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.style.color = type === 'error' ? '#ff4757' : '#2ed573';
    
    setTimeout(() => {
      messageEl.textContent = '';
    }, 5000);
  }
}

// Set current year in footer
function setCurrentYear() {
  const yearElement = $('#year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏁 F1 Racing Website Loaded!');
  
  setCurrentYear();
  setupNextRace();
  setupNewsletter();
});