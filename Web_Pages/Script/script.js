// F1 Racing Website - 2026 Bento Dashboard Logic

const $ = (selector) => document.querySelector(selector);
const API_SOURCES = ['https://api.jolpi.ca/ergast/f1'];

// Helper Function: Fetch with LocalStorage Caching
async function fetchWithCache(url, cacheKey, ttlMs = 3600000) { 
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    const parsedData = JSON.parse(cachedData);
    if (Date.now() - parsedData.timestamp < ttlMs) {
      return parsedData.data;
    }
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error('API fetching failed');
  const data = await response.json();
  localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
  return data;
}

const FALLBACK_RACES = [{
  raceName: "Australian Grand Prix",
  Circuit: { circuitName: "Albert Park Circuit", Location: { locality: "Melbourne", country: "Australia" } },
  date: "2026-03-08", time: "04:00:00Z"
}];

async function fetchNextRace() {
  const now = new Date();
  try {
    const data = await fetchWithCache(`${API_SOURCES[0]}/current.json`, 'f1_current_season');
    const races = data.MRData.RaceTable.Races;
    if (races && races.length > 0) {
      const nextRace = races.find(race => {
        const timeToUse = race.time ? race.time.substring(0, 8) : '14:00:00';
        const raceDate = new Date(`${race.date}T${timeToUse}Z`);
        return raceDate > now;
      });
      if (nextRace) return nextRace;
    }
  } catch (error) { console.warn(`Failed to fetch from Jolpi:`, error); }
  return FALLBACK_RACES[0];
}

function updateNextRaceDisplay(race) {
  const nameEl = $('#nr-name');
  const circuitEl = $('#nr-circuit');
  const dateEl = $('#nr-date');

  if (nameEl) nameEl.textContent = race.raceName;
  if (circuitEl) circuitEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${race.Circuit.circuitName}, ${race.Circuit.Location.country}`;
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
    if (!isNaN(raceDateTime.getTime())) startCountdown(raceDateTime);
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

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function setupDriverCarousel() {
  const grid = document.getElementById('driversGrid');
  const dotsContainer = document.getElementById('carouselDots');
  if (!grid || !dotsContainer) return;
  
  const cards = document.querySelectorAll('.driver-portrait');
  const totalCards = cards.length;
  let cardsPerView = window.innerWidth <= 640 ? 1 : (window.innerWidth <= 1100 ? 2 : 4);
  let maxSlideIndex = Math.max(0, totalCards - cardsPerView);
  let currentSlide = 0; 
  let autoplayInterval;

  dotsContainer.innerHTML = '';
  for (let i = 0; i <= maxSlideIndex; i++) {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  function calculateDimensions() {
    const gap = 20; 
    cardsPerView = window.innerWidth <= 640 ? 1 : (window.innerWidth <= 1100 ? 2 : 4);
    maxSlideIndex = Math.max(0, totalCards - cardsPerView);
    const containerWidth = grid.parentElement.offsetWidth;
    const cardWidth = (containerWidth - (gap * (cardsPerView - 1))) / cardsPerView;
    cards.forEach(card => card.style.width = `${cardWidth}px`);
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => { dot.style.display = index <= maxSlideIndex ? 'block' : 'none'; });
  }

  function updateDots() {
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
  }
  
  function goToSlide(index) { 
    currentSlide = index; 
    const gap = 20;
    const cardWidth = cards[0].offsetWidth;
    const offset = currentSlide * (cardWidth + gap);
    grid.scrollTo({ left: offset, behavior: 'smooth' });
    updateDots();
    resetAutoplay(); 
  }

  function nextSlide() { 
    if (currentSlide >= maxSlideIndex) goToSlide(0);
    else {
        let nextIndex = currentSlide + cardsPerView;
        if (nextIndex > maxSlideIndex) nextIndex = maxSlideIndex;
        goToSlide(nextIndex);
    }
  }
  
  function startAutoplay() { autoplayInterval = setInterval(nextSlide, 3500); }
  function resetAutoplay() { clearInterval(autoplayInterval); startAutoplay(); }

  grid.addEventListener('scroll', () => {
    const gap = 20;
    const cardWidth = cards[0].offsetWidth;
    const newSlide = Math.round(grid.scrollLeft / (cardWidth + gap));
    if (newSlide !== currentSlide && newSlide <= maxSlideIndex) {
      currentSlide = newSlide;
      updateDots();
    }
  }, { passive: true });

  calculateDimensions(); 
  startAutoplay();
  
  grid.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  grid.addEventListener('mouseleave', startAutoplay);
  grid.addEventListener('touchstart', () => clearInterval(autoplayInterval), { passive: true });
  grid.addEventListener('touchend', startAutoplay, { passive: true });
  window.addEventListener('resize', debounce(() => { calculateDimensions(); goToSlide(currentSlide); }, 100));
}

// 1. Mouse Drag to Scroll for Driver Carousel
function initDragScroll() {
  const slider = document.getElementById('driversGrid');
  if (!slider) return;
  let isDown = false, startX, scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true; slider.classList.add('active-drag');
    startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => { isDown = false; slider.classList.remove('active-drag'); });
  slider.addEventListener('mouseup', () => { isDown = false; slider.classList.remove('active-drag'); });
  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    slider.scrollLeft = scrollLeft - ((x - startX) * 2);
  });
  slider.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => { if (slider.classList.contains('active-drag') && isDown) e.preventDefault(); });
  });
}

// 2. 3D Tilt Effect on Bento Cards
function initInteractiveTilt() {
  const cards = document.querySelectorAll('.bento-card');
  if (window.matchMedia("(max-width: 768px)").matches) return; 
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const centerX = rect.width / 2, centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3; 
      const rotateY = ((x - centerX) / centerX) * 3;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
      card.style.boxShadow = `${-(x - centerX) / 10}px ${-(y - centerY) / 10}px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.boxShadow = 'var(--card-shadow)';
    });
  });
}

// 3. Dynamic Cursor-Following Background Glow
function initCursorGlow() {
  const glow1 = document.querySelector('.glow-1'), glow2 = document.querySelector('.glow-2');
  if (!glow1 || !glow2 || window.matchMedia("(max-width: 768px)").matches) return;
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let glow1X = mouseX, glow1Y = mouseY, glow2X = mouseX, glow2Y = mouseY;
  
  document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

  function animateGlow() {
    glow1X += (mouseX - glow1X) * 0.04; glow1Y += (mouseY - glow1Y) * 0.04;
    glow2X += ((window.innerWidth - mouseX) - glow2X) * 0.02; glow2Y += ((window.innerHeight - mouseY) - glow2Y) * 0.02;
    glow1.style.transform = `translate(${glow1X - 300}px, ${glow1Y - 300}px)`; 
    glow2.style.transform = `translate(${glow2X - 250}px, ${glow2Y - 250}px)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

// 4. GLOBAL BUTTON MICRO-INTERACTION (Sleek Loading Spinner on clicks)
function initGlobalButtonInteractions() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (btn && btn.tagName === 'A' && btn.href && btn.getAttribute('target') !== '_blank' && !btn.href.includes('#')) {
      e.preventDefault(); 
      btn.classList.add('is-loading'); 
      setTimeout(() => { window.location.href = btn.href; }, 350); 
    }
  });
}

/* =========================================================
   MOBILE "NATIVE APP" JAVASCRIPT LOGIC
   ========================================================= */
window.initMobileEnhancements = function() {
  if (window.innerWidth > 768) return;

  // 1. Scroll Reveal for Cards
  const cards = document.querySelectorAll('.bento-card, .driver-card, .circuit-card, .team-card');
  cards.forEach(card => card.classList.add('mobile-fade-up'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

  cards.forEach(card => observer.observe(card));

  // 2. Swipe Down to Close Bottom Sheets
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  let activeModal = null;
  
  document.addEventListener('touchstart', (e) => {
    const modal = e.target.closest('.driver-modal') || e.target.closest('.mobile-modal') || e.target.closest('.team-modal');
    if (!modal) return;
    
    if (e.target.closest('.modal-pull-indicator') || e.target.closest('.driver-modal-close') || e.target.closest('.team-modal-close') || modal.scrollTop === 0) {
      startY = e.touches[0].clientY;
      isDragging = true;
      activeModal = modal;
      activeModal.style.transition = 'none'; 
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || !activeModal) return;
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0) { activeModal.style.transform = `translateY(${diff}px)`; }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!isDragging || !activeModal) return;
    isDragging = false;
    const diff = currentY - startY;
    activeModal.style.transition = 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)';
    
    if (diff > 120) { 
      const overlay = activeModal.closest('.driver-modal-overlay') || activeModal.closest('.mobile-modal-overlay') || activeModal.closest('.team-modal-overlay');
      if(overlay) {
          overlay.classList.remove('visible');
          overlay.classList.remove('active');
          if (history.state && history.state.modalOpen) history.back();
      }
      setTimeout(() => { activeModal.style.transform = ''; }, 400);
    } else {
      activeModal.style.transform = 'translateY(0)';
    }
    activeModal = null;
  });
};

document.addEventListener('DOMContentLoaded', () => {
  setupNextRace();
  setupDriverCarousel();
  initDragScroll();
  initInteractiveTilt();
  initCursorGlow();
  initStandingsTabs(); 
  loadMiniStandings();
  initBackToTop();
  initGlobalButtonInteractions(); 
  setTimeout(window.initMobileEnhancements, 300);
});

function initBackToTop() {
  const backBtn = document.getElementById('backToTopBtn');
  if(!backBtn) return;
  window.addEventListener('scroll', () => {
    if(window.scrollY > 400) backBtn.classList.add('show');
    else backBtn.classList.remove('show');
  }, { passive: true });
  backBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

/* =========================================================
   ADD TO CALENDAR (WITH MICRO-INTERACTION)
   ========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  const btn = document.getElementById('addToCalendarBtn');
  if (!btn) return;
  try {
    const data = await fetchWithCache('https://api.jolpi.ca/ergast/f1/current/next.json', 'f1_next_race_cal');
    const nextRace = data?.MRData?.RaceTable?.Races?.[0];
    if (!nextRace || !nextRace.date || !nextRace.time) return;

    const raceName = nextRace.raceName;
    const [year, month, day] = nextRace.date.split('-').map(Number);
    const [hours, mins, secs] = nextRace.time.replace('Z', '').split(':').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, day, hours, mins, secs));
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); 

    const formatGCalDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=🏎️+F1:+${encodeURIComponent(raceName)}&dates=${formatGCalDate(startDate)}/${formatGCalDate(endDate)}&details=Don't+miss+the+${encodeURIComponent(raceName)}!&location=${encodeURIComponent(nextRace.Circuit.circuitName)}`;

    btn.style.display = 'inline-flex';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.add('is-loading'); // Show Spinner
      setTimeout(() => {
        btn.classList.remove('is-loading');
        window.open(gCalUrl, '_blank');
      }, 500); // 500ms tactile delay
    });

  } catch (error) { console.error("Could not load Calendar data:", error); }
});

/* =========================================================
   TABBED STANDINGS WIDGET FOR HOMEPAGE
   ========================================================= */
const miniTeamColors = {
  "red_bull": "#1e3a8a", "ferrari": "#dc2626", "mercedes": "#00d2be", "mclaren": "#ff8c00", "aston_martin": "#006a4e", "williams": "#00a0de", "alpine": "#0084c7", "racing_bulls": "#0f172a", "rb": "#0f172a", "haas": "#ffffff", "audi": "#ff0000", "sauber": "#ff0000", "cadillac": "#a2a2a2"
};
const miniTeamNames = {
  "red_bull": "Red Bull", "ferrari": "Ferrari", "mercedes": "Mercedes", "mclaren": "McLaren", "aston_martin": "Aston Martin", "williams": "Williams", "alpine": "Alpine", "racing_bulls": "Racing Bulls", "rb": "Racing Bulls", "haas": "Haas", "audi": "Audi", "sauber": "Sauber", "cadillac": "Cadillac"
};

function initStandingsTabs() {
  const tabs = document.querySelectorAll('.standings-tab');
  const views = document.querySelectorAll('.standings-view');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.style.display = 'none');
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).style.display = 'block';
    });
  });
}

async function loadMiniStandings() {
  const dContainer = document.getElementById('mini-driver-standings');
  const cContainer = document.getElementById('mini-constructor-standings');
  if (!dContainer || !cContainer) return;

  // Skeleton Rows
  const skeletonRows = Array(5).fill(`<div class="mini-row skeleton-box" style="height: 44px; margin-bottom: 6px; border-radius: 8px;"></div>`).join('');
  dContainer.innerHTML = skeletonRows;
  cContainer.innerHTML = skeletonRows;

  try {
    const [dData, cData] = await Promise.all([
      fetchWithCache('https://api.jolpi.ca/ergast/f1/current/driverStandings.json', 'f1_drivers_std'),
      fetchWithCache('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json', 'f1_const_std')
    ]);

    const dLists = dData.MRData.StandingsTable.StandingsLists;
    const cLists = cData.MRData.StandingsTable.StandingsLists;

    if (!dLists.length || !cLists.length) {
       dContainer.innerHTML = '<p style="text-align:center;color:#aaa;padding:20px;">No data yet for 2026.</p>';
       cContainer.innerHTML = '<p style="text-align:center;color:#aaa;padding:20px;">No data yet for 2026.</p>';
       return;
    }

    dContainer.innerHTML = dLists[0].DriverStandings.slice(0, 10).map(d => {
      const cId = d.Constructors[0]?.constructorId || 'unknown';
      return `
        <div class="mini-row">
          <span class="mini-pos">${d.position}</span>
          <div class="mini-name-col">
            <span class="mini-color" style="background: ${miniTeamColors[cId] || '#cccccc'};"></span>
            <span class="mini-name">${d.Driver.givenName} ${d.Driver.familyName} <span class="mini-team-sub">${miniTeamNames[cId] || d.Constructors[0]?.name || ''}</span></span>
          </div>
          <span class="mini-pts">${d.points}</span>
        </div>
      `;
    }).join('');

    cContainer.innerHTML = cLists[0].ConstructorStandings.slice(0, 10).map(c => `
        <div class="mini-row">
          <span class="mini-pos">${c.position}</span>
          <div class="mini-name-col">
            <span class="mini-color" style="background: ${miniTeamColors[c.Constructor.constructorId] || '#cccccc'};"></span>
            <span class="mini-name">${c.Constructor.name}</span>
          </div>
          <span class="mini-pts">${c.points}</span>
        </div>
      `).join('');

  } catch (error) {
    dContainer.innerHTML = '<p style="text-align:center;color:#e10600;padding:20px;">API Error</p>';
    cContainer.innerHTML = '<p style="text-align:center;color:#e10600;padding:20px;">API Error</p>';
  }
}