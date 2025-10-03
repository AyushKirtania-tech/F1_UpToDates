// F1 Racing Website - Updated with Correct 2025 Schedule

const $ = (selector) => document.querySelector(selector);

const API_SOURCES = [
  //'https://ergast.com/api/f1',
  //'http://ergast.com/api/f1',
  'https://api.jolpi.ca/ergast/f1',
  'http://api.jolpi.ca/ergast/f1'
];

// Accurate 2025 F1 Race Schedule
const FALLBACK_RACES = [
  {
    raceName: "Singapore Grand Prix",
    Circuit: {
      circuitName: "Marina Bay Street Circuit",
      Location: { locality: "Singapore", country: "Singapore" }
    },
    date: "2025-10-05",
    time: "12:00:00Z"
  },
  {
    raceName: "United States Grand Prix",
    Circuit: {
      circuitName: "Circuit of the Americas",
      Location: { locality: "Austin", country: "USA" }
    },
    date: "2025-10-19",
    time: "19:00:00Z"
  },
  {
    raceName: "Mexico City Grand Prix",
    Circuit: {
      circuitName: "Autódromo Hermanos Rodríguez",
      Location: { locality: "Mexico City", country: "Mexico" }
    },
    date: "2025-10-26",
    time: "20:00:00Z"
  },
  {
    raceName: "São Paulo Grand Prix",
    Circuit: {
      circuitName: "Autódromo José Carlos Pace",
      Location: { locality: "São Paulo", country: "Brazil" }
    },
    date: "2025-11-02",
    time: "17:00:00Z"
  },
  {
    raceName: "Las Vegas Grand Prix",
    Circuit: {
      circuitName: "Las Vegas Street Circuit",
      Location: { locality: "Las Vegas", country: "USA" }
    },
    date: "2025-11-22",
    time: "06:00:00Z"
  },
  {
    raceName: "Qatar Grand Prix",
    Circuit: {
      circuitName: "Lusail International Circuit",
      Location: { locality: "Lusail", country: "Qatar" }
    },
    date: "2025-11-30",
    time: "15:00:00Z"
  },
  {
    raceName: "Abu Dhabi Grand Prix",
    Circuit: {
      circuitName: "Yas Marina Circuit",
      Location: { locality: "Abu Dhabi", country: "UAE" }
    },
    date: "2025-12-07",
    time: "13:00:00Z"
  }
];

// Fetch next race from API
async function fetchNextRace() {
  // Try each API source
  for (const apiBase of API_SOURCES) {
    try {
      console.log(`Fetching from: ${apiBase}`);
      const response = await fetch(`${apiBase}/current.json`);
      
      if (response.ok) {
        const data = await response.json();
        const races = data.MRData.RaceTable.Races;
        
        if (races && races.length > 0) {
          const now = new Date();
          const nextRace = races.find(race => {
            const timeToUse = race.time ? race.time.substring(0, 8) : '14:00:00';
            const raceDate = new Date(`${race.date}T${timeToUse}Z`);
            return raceDate > now;
          });
          
          if (nextRace) {
            console.log('✅ Next race found from API:', nextRace.raceName);
            return nextRace;
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${apiBase}:`, error);
    }
  }
  
  // Use fallback data
  console.log('📦 Using fallback race data');
  const now = new Date();
  const nextRace = FALLBACK_RACES.find(race => {
    const raceDate = new Date(`${race.date}T${race.time}`);
    return raceDate > now;
  });
  
  return nextRace || FALLBACK_RACES[0];
}

// Update next race display
function updateNextRaceDisplay(race) {
  const nameEl = $('#nr-name');
  const circuitEl = $('#nr-circuit');
  const dateEl = $('#nr-date');

  if (nameEl) nameEl.textContent = race.raceName;
  if (circuitEl) circuitEl.textContent = race.Circuit.circuitName;
  if (dateEl && race.date) {
    const timeToUse = race.time ? race.time.substring(0, 8) : '14:00:00';
    const raceDate = new Date(`${race.date}T${timeToUse}Z`);
    
    if (!isNaN(raceDate.getTime())) {
      dateEl.textContent = raceDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      dateEl.textContent = 'Date TBA';
    }
  }
}

// Setup next race functionality
async function setupNextRace() {
  const nextRace = await fetchNextRace();
  
  if (nextRace && nextRace.date) {
    updateNextRaceDisplay(nextRace);
    
    // Parse race date/time correctly
    const timeToUse = nextRace.time ? nextRace.time.substring(0, 8) : '14:00:00';
    const raceDateTime = new Date(`${nextRace.date}T${timeToUse}Z`);
    
    // Check if date is valid
    if (!isNaN(raceDateTime.getTime())) {
      startCountdown(raceDateTime);
    } else {
      console.error('Invalid race date:', nextRace.date, nextRace.time);
      const countdownEl = document.querySelector('.countdown');
      if (countdownEl) {
        countdownEl.innerHTML = '<div style="text-align: center; color: var(--muted); font-size: 1rem; padding: 20px; grid-column: 1 / -1;">⚠️ Date information unavailable</div>';
      }
    }
  }
}

// Countdown timer
function startCountdown(targetDate) {
  const daysEl = $('#cd-days');
  const hoursEl = $('#cd-hours');
  const minsEl = $('#cd-mins');
  const secsEl = $('#cd-secs');

  if (!daysEl || !targetDate || isNaN(targetDate.getTime())) {
    console.error('Invalid countdown target date');
    return;
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      const countdownEl = document.querySelector('.countdown');
      if (countdownEl) {
        countdownEl.innerHTML = '<div style="text-align: center; color: var(--accent); font-weight: 900; font-size: 1.2rem; padding: 20px; grid-column: 1 / -1;">🏁 RACE IS LIVE! 🏁</div>';
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

    showMessage('Welcome to the Paddock Club! Confirmation sent to ' + email, 'success');
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

// Driver Carousel functionality
function setupDriverCarousel() {
  const grid = document.getElementById('driversGrid');
  const dotsContainer = document.getElementById('carouselDots');
  
  if (!grid || !dotsContainer) return;
  
  const cards = document.querySelectorAll('.driver-card');
  const totalCards = cards.length;
  const cardsPerView = window.innerWidth <= 640 ? 1 : window.innerWidth <= 968 ? 2 : 3;
  const totalSlides = Math.ceil(totalCards / cardsPerView);
  let currentSlide = 0;
  let autoplayInterval;

  // Create dots
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  const dots = document.querySelectorAll('.carousel-dot');

  function updateCarousel() {
    const containerWidth = grid.parentElement.offsetWidth;
    const gap = 24;
    const totalGaps = (cardsPerView - 1) * gap;
    const cardWidth = (containerWidth - totalGaps) / cardsPerView;
    
    cards.forEach(card => {
      card.style.width = `${cardWidth}px`;
      card.style.minWidth = `${cardWidth}px`;
    });
    
    const offset = currentSlide * (cardWidth + gap) * cardsPerView;
    grid.style.transform = `translateX(-${offset}px)`;
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }

  function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
    resetAutoplay();
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 2000);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  updateCarousel();
  startAutoplay();

  grid.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  grid.addEventListener('mouseleave', startAutoplay);

  window.addEventListener('resize', updateCarousel);
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
  console.log('🏎️ F1 Racing Website Loaded!');
  
  setCurrentYear();
  setupNextRace();
  setupNewsletter();
  setupDriverCarousel();
});