// F1 Racing Website - 2026 Bento Dashboard Logic

const $ = (selector) => document.querySelector(selector);

const API_SOURCES = [
  'https://api.jolpi.ca/ergast/f1',
  'http://api.jolpi.ca/ergast/f1'
];

// 2026 START DATES FOR COUNTDOWN FALLBACK
const FALLBACK_RACES = [
  {
    raceName: "Australian Grand Prix",
    Circuit: { circuitName: "Albert Park Circuit", Location: { locality: "Melbourne", country: "Australia" } },
    date: "2026-03-08", time: "04:00:00Z"
  }
];

// Fetch next race logic
async function fetchNextRace() {
  const now = new Date();
  
  for (const apiBase of API_SOURCES) {
    try {
      const response = await fetch(`${apiBase}/current.json`);
      if (response.ok) {
        const data = await response.json();
        const races = data.MRData.RaceTable.Races;
        if (races && races.length > 0) {
          const nextRace = races.find(race => {
            const timeToUse = race.time ? race.time.substring(0, 8) : '14:00:00';
            const raceDate = new Date(`${race.date}T${timeToUse}Z`);
            return raceDate > now;
          });
          if (nextRace) return nextRace;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${apiBase}:`, error);
    }
  }
  
  return FALLBACK_RACES[0];
}

function updateNextRaceDisplay(race) {
  const nameEl = $('#nr-name');
  const circuitEl = $('#nr-circuit');
  const dateEl = $('#nr-date');

  if (nameEl) nameEl.textContent = race.raceName;
  
  if (circuitEl) {
    circuitEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${race.Circuit.circuitName}, ${race.Circuit.Location.country}`;
  }
  
  if (dateEl && race.date) {
    const [year, month, day] = race.date.split('-').map(Number);
    const raceDate = new Date(year, month - 1, day);
    if (!isNaN(raceDate.getTime())) {
      dateEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${raceDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    }
  }
}

async function setupNextRace() {
  const nextRace = await fetchNextRace();
  if (nextRace && nextRace.date) {
    updateNextRaceDisplay(nextRace);
    const timeToUse = nextRace.time ? nextRace.time.substring(0, 8) : '14:00:00';
    const raceDateTime = new Date(`${nextRace.date}T${timeToUse}Z`);
    if (!isNaN(raceDateTime.getTime())) {
      startCountdown(raceDateTime);
    }
  }
}

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
      const countdownEl = document.querySelector('.countdown-grid');
      if (countdownEl) countdownEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;font-size:2rem;color:#10b981;font-weight:900;">🏁 RACE IS LIVE 🏁</div>';
      return;
    }
    
    daysEl.textContent = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    hoursEl.textContent = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    minsEl.textContent = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    secsEl.textContent = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Carousel Logic adapted for 22 Drivers & Bento Grid sizing
function setupDriverCarousel() {
  const grid = document.getElementById('driversGrid');
  const dotsContainer = document.getElementById('carouselDots');
  if (!grid || !dotsContainer) return;
  
  const cards = document.querySelectorAll('.driver-portrait');
  const totalCards = cards.length;
  
  let cardsPerView = window.innerWidth <= 640 ? 1 : (window.innerWidth <= 1100 ? 2 : 4);
  
  // Calculate maximum number of steps we can slide without showing empty space
  // E.g. 22 cards, view 4 -> max starting index is 22 - 4 = 18.
  let maxSlideIndex = Math.max(0, totalCards - cardsPerView);
  let currentSlide = 0; // Represents the index of the first visible card
  let autoplayInterval;

  // Generate dots (one dot per card, capped at maxSlideIndex)
  dotsContainer.innerHTML = '';
  for (let i = 0; i <= maxSlideIndex; i++) {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  function updateCarousel() {
    const gap = 20; // Matches CSS gap
    
    // Recalculate view dimensions
    cardsPerView = window.innerWidth <= 640 ? 1 : (window.innerWidth <= 1100 ? 2 : 4);
    maxSlideIndex = Math.max(0, totalCards - cardsPerView);
    
    if (currentSlide > maxSlideIndex) {
        currentSlide = maxSlideIndex; // Correct out of bounds on resize
    }
    
    const containerWidth = grid.parentElement.offsetWidth;
    const cardWidth = (containerWidth - (gap * (cardsPerView - 1))) / cardsPerView;
    
    cards.forEach(card => {
      card.style.width = `${cardWidth}px`;
    });
    
    // Calculate precise offset
    const offset = currentSlide * (cardWidth + gap);
    grid.style.transform = `translateX(-${offset}px)`;
    
    // Update active dot
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      if(index <= maxSlideIndex) {
        dot.style.display = 'block';
        dot.classList.toggle('active', index === currentSlide);
      } else {
        dot.style.display = 'none'; // Hide extra dots dynamically
      }
    });
  }
  
  function nextSlide() { 
    // Advance by cardsPerView if possible, otherwise jump to end, or wrap to start
    if (currentSlide === maxSlideIndex) {
        currentSlide = 0; // Wrap around to start
    } else {
        currentSlide += cardsPerView;
        if (currentSlide > maxSlideIndex) currentSlide = maxSlideIndex; // Cap to end
    }
    updateCarousel(); 
  }
  
  function goToSlide(index) { 
    currentSlide = index; 
    updateCarousel(); 
    resetAutoplay(); 
  }
  
  function startAutoplay() { 
    autoplayInterval = setInterval(nextSlide, 3500); 
  }
  
  function resetAutoplay() { 
    clearInterval(autoplayInterval); 
    startAutoplay(); 
  }

  // Init
  setTimeout(updateCarousel, 100); 
  startAutoplay();
  
  // Pause on hover
  grid.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  grid.addEventListener('mouseleave', startAutoplay);
  
  // Handle resize safely
  window.addEventListener('resize', () => {
      updateCarousel();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('F1 Bento Dashboard Loaded');
  setupNextRace();
  setupDriverCarousel();
});


/* =========================================================
   ADD TO CALENDAR (GOOGLE CALENDAR REMINDER)
   ========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  const btn = document.getElementById('addToCalendarBtn');
  if (!btn) return;

  try {
    // Fetch the Next Race details from the API
    const res = await fetch('https://api.jolpi.ca/ergast/f1/current/next.json');
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    const nextRace = data?.MRData?.RaceTable?.Races?.[0];
    
    // If there is no next race (season over), do nothing
    if (!nextRace || !nextRace.date || !nextRace.time) return;

    const raceName = nextRace.raceName;
    const raceDate = nextRace.date; 
    const raceTime = nextRace.time; 
    const circuit = nextRace.Circuit.circuitName;

    // Convert F1 API Time (UTC) to a valid Javascript Date Object
    const startDate = new Date(`${raceDate}T${raceTime}`);
    
    // Estimate race duration as 2 hours for the calendar block
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); 

    // Google Calendar requires a very specific Date format: YYYYMMDDTHHMMSSZ
    const formatGCalDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const gCalStart = formatGCalDate(startDate);
    const gCalEnd = formatGCalDate(endDate);

    // Build the dynamic URL
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=🏎️+F1:+${encodeURIComponent(raceName)}&dates=${gCalStart}/${gCalEnd}&details=Don't+miss+the+${encodeURIComponent(raceName)}!&location=${encodeURIComponent(circuit)}`;

    // Show the button now that the link is ready
    btn.style.display = 'inline-flex';
    
    // Open the Google Calendar tab when clicked
    btn.addEventListener('click', () => {
      window.open(gCalUrl, '_blank');
    });

  } catch (error) {
    console.error("Could not load Calendar data:", error);
  }
});