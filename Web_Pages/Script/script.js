// F1 Racing Website - Updated for 2026 Transition

const $ = (selector) => document.querySelector(selector);

const API_SOURCES = [
  'https://api.jolpi.ca/ergast/f1',
  'http://api.jolpi.ca/ergast/f1'
];

// 2026 START DATES FOR COUNTDOWN
const FALLBACK_RACES = [
  {
    raceName: "Australian Grand Prix",
    Circuit: { circuitName: "Albert Park Circuit", Location: { locality: "Melbourne", country: "Australia" } },
    date: "2026-03-08", time: "05:00:00Z"
  },
  {
    raceName: "Chinese Grand Prix",
    Circuit: { circuitName: "Shanghai International Circuit", Location: { locality: "Shanghai", country: "China" } },
    date: "2026-03-15", time: "07:00:00Z"
  }
];

// 1. INJECT CHAMPIONSHIP DETAILS (NEW)
function injectChampionshipBanner() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const banner = document.createElement('div');
    banner.className = 'championship-banner';
    banner.style.cssText = `
        background: linear-gradient(90deg, #000 0%, #ff8000 100%);
        color: white;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(255, 128, 0, 0.3);
        border: 1px solid #ff8000;
    `;

    banner.innerHTML = `
        <h3 style="margin:0; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 2px;">🏆 2025 World Champions 🏆</h3>
        <div style="display: flex; justify-content: center; gap: 40px; margin-top: 15px; flex-wrap: wrap;">
            <div>
                <span style="display:block; font-size: 0.9rem; color: #ddd;">Driver's Champion</span>
                <strong style="font-size: 1.5rem;">Lando Norris 🇬🇧</strong>
                <div style="font-size: 0.9rem;">423 Points</div>
            </div>
            <div style="border-left: 1px solid rgba(255,255,255,0.3); padding-left: 40px;">
                <span style="display:block; font-size: 0.9rem; color: #ddd;">Constructor's Champion</span>
                <strong style="font-size: 1.5rem;">McLaren 🟧</strong>
                <div style="font-size: 0.9rem;">833 Points</div>
            </div>
        </div>
    `;

    heroSection.parentNode.insertBefore(banner, heroSection);
}


// Fetch next race logic
async function fetchNextRace() {
  // If 2025 is over, force fallback to 2026
  const now = new Date();
  if (now.getFullYear() === 2025 && now.getMonth() > 10) {
      return FALLBACK_RACES[0];
  }

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
  
  const nextRace = FALLBACK_RACES.find(race => {
    const raceDate = new Date(`${race.date}T${race.time}`);
    return raceDate > now;
  });
  return nextRace || FALLBACK_RACES[0];
}

function updateNextRaceDisplay(race) {
  const nameEl = $('#nr-name');
  const circuitEl = $('#nr-circuit');
  const dateEl = $('#nr-date');

  if (nameEl) nameEl.textContent = race.raceName;
  if (circuitEl) circuitEl.textContent = race.Circuit.circuitName;
  if (dateEl && race.date) {
    const [year, month, day] = race.date.split('-').map(Number);
    const raceDate = new Date(year, month - 1, day);
    if (!isNaN(raceDate.getTime())) {
      dateEl.textContent = raceDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } else {
      dateEl.textContent = 'Date TBA';
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
    } else {
      const countdownEl = document.querySelector('.countdown');
      if (countdownEl) countdownEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;">⚠️ Date TBA</div>';
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
      const countdownEl = document.querySelector('.countdown');
      if (countdownEl) countdownEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;">🏁 LIVE 🏁</div>';
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
    dots.forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
  }
  function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; updateCarousel(); }
  function goToSlide(index) { currentSlide = index; updateCarousel(); resetAutoplay(); }
  function startAutoplay() { autoplayInterval = setInterval(nextSlide, 2000); }
  function resetAutoplay() { clearInterval(autoplayInterval); startAutoplay(); }

  updateCarousel();
  startAutoplay();
  grid.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  grid.addEventListener('mouseleave', startAutoplay);
  window.addEventListener('resize', updateCarousel);
}

function updateRaceStats() {
    // Force reset for 2026 season start
    const completedEl = document.getElementById('races-completed');
    const remainingEl = document.getElementById('races-remaining');
    if (completedEl) completedEl.textContent = '24'; // 2025 Completed
    if (remainingEl) remainingEl.textContent = '0'; // 2025 Remaining
}

function setCurrentYear() {
  const yearElement = $('#year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  console.log(' F1 Racing Website Loaded!');
  setCurrentYear();
  setupNextRace();
  injectChampionshipBanner(); // New function called here
  setupDriverCarousel();
  updateRaceStats();
});