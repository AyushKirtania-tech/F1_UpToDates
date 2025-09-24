// F1 Racing Website - Main JavaScript File (Simplified)
// ========================================================

// Utility Functions
// -----------------
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Debounce function for performance optimization
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Main App Class
// --------------
class F1App {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.startAnimations();
  }

  // Initialize the application
  init() {
    this.setCurrentYear();
    this.setupNextRaceData();
    this.startCountdown();
    this.initRevealAnimations();
    this.showBackToTopButton();
  }

  // Set current year in footer
  setCurrentYear() {
    const yearElement = $('#yr');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // Setup Next Race Information
  setupNextRaceData() {
    // Sample race data - in a real app, this would come from an API
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

    // Find next upcoming race
    const now = new Date();
    const nextRace = upcomingRaces.find(race => race.date > now) || upcomingRaces[0];
    
    this.updateNextRaceDisplay(nextRace);
    this.nextRaceDate = nextRace.date;
  }

  // Update next race display
  updateNextRaceDisplay(race) {
    const nameElement = $('#nr-name');
    const circuitElement = $('#nr-circuit');
    const dateElement = $('#nr-date');

    if (nameElement) nameElement.textContent = race.name;
    if (circuitElement) circuitElement.textContent = race.circuit;
    if (dateElement) {
      dateElement.textContent = race.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  // Countdown Timer
  startCountdown() {
    if (!this.nextRaceDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = this.nextRaceDate.getTime() - now;

      if (distance < 0) {
        this.displayCountdownFinished();
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.updateCountdownDisplay(days, hours, minutes, seconds);
    };

    // Update immediately and then every second
    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  updateCountdownDisplay(days, hours, minutes, seconds) {
    const daysEl = $('#cd-days');
    const hoursEl = $('#cd-hours');
    const minsEl = $('#cd-mins');
    const secsEl = $('#cd-secs');

    if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minsEl) minsEl.textContent = minutes.toString().padStart(2, '0');
    if (secsEl) secsEl.textContent = seconds.toString().padStart(2, '0');
  }

  displayCountdownFinished() {
    const countdownEl = $('#countdown');
    if (countdownEl) {
      countdownEl.innerHTML = '<div class="race-live" style="text-align: center; color: var(--accent); font-weight: 900; font-size: 1.2rem; padding: 20px;">🏁 RACE IS LIVE! 🏁</div>';
    }
    clearInterval(this.countdownInterval);
  }

  // Reveal Animations (Intersection Observer)
  initRevealAnimations() {
    const revealElements = $$('.reveal');
    
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  }

  // Back to Top Button
  showBackToTopButton() {
    const backToTopBtn = $('#backToTop');
    if (!backToTopBtn) return;

    const toggleVisibility = debounce(() => {
      if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'flex';
        setTimeout(() => {
          backToTopBtn.style.opacity = '1';
          backToTopBtn.style.transform = 'translateY(0)';
        }, 10);
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.transform = 'translateY(10px)';
        setTimeout(() => {
          if (backToTopBtn.style.opacity === '0') {
            backToTopBtn.style.display = 'none';
          }
        }, 300);
      }
    }, 100);

    window.addEventListener('scroll', toggleVisibility);
    
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Newsletter Subscription
  handleNewsletterSubmission() {
    const form = $('#newsletterForm');
    const emailInput = $('#email');
    const messageEl = $('#newsletter-msg');

    if (!form || !emailInput || !messageEl) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = emailInput.value.trim();
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email) {
        this.showNewsletterMessage('Please enter your email address.', 'error');
        return;
      }
      
      if (!emailRegex.test(email)) {
        this.showNewsletterMessage('Please enter a valid email address.', 'error');
        return;
      }

      // Simulate API call
      this.simulateNewsletterSubscription(email);
    });
  }

  simulateNewsletterSubscription(email) {
    const messageEl = $('#newsletter-msg');
    const submitBtn = $('#newsletterForm button');
    
    if (submitBtn) {
      submitBtn.textContent = 'Subscribing...';
      submitBtn.disabled = true;
    }

    // Simulate API delay
    setTimeout(() => {
      this.showNewsletterMessage(
        `🏁 Welcome to the Paddock Club! Confirmation sent to ${email}`, 
        'success'
      );
      
      $('#email').value = '';
      
      if (submitBtn) {
        submitBtn.textContent = 'Subscribe Now';
        submitBtn.disabled = false;
      }
    }, 2000);
  }

  showNewsletterMessage(message, type) {
    const messageEl = $('#newsletter-msg');
    if (!messageEl) return;

    messageEl.textContent = message;
    messageEl.style.color = type === 'error' ? '#ff4757' : '#2ed573';
    messageEl.style.fontWeight = '600';
    
    // Clear message after 5 seconds
    setTimeout(() => {
      messageEl.textContent = '';
    }, 5000);
  }

  // Team and Driver Interactions
  initInteractiveElements() {
    // Team slides hover effects
    const teamSlides = $$('.team-slide');
    teamSlides.forEach((slide) => {
      slide.addEventListener('click', () => {
        const teamName = slide.dataset.team;
        this.showTeamInfo(teamName);
      });
    });

    // Driver cards hover effects  
    const driverCards = $$('.card-grid li');
    driverCards.forEach((card) => {
      card.addEventListener('click', () => {
        const driverName = card.dataset.driver;
        this.showDriverInfo(driverName);
      });
    });
  }

  showTeamInfo(teamName) {
    // In a real app, this would show a modal or navigate to team page
    console.log(`Showing info for team: ${teamName}`);
    
    // Simple toast notification
    this.showToast(`Loading ${teamName} team information...`);
  }

  showDriverInfo(driverName) {
    // In a real app, this would show driver details
    console.log(`Showing info for driver: ${driverName}`);
    
    this.showToast(`Loading ${driverName} driver profile...`);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--gradient-primary);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-weight: 600;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Slide in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Performance optimizations
  initPerformanceOptimizations() {
    // Lazy load images when they come into view
    const images = $$('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.src || img.dataset.src;
            img.classList.remove('loading');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => {
        img.classList.add('loading');
        imageObserver.observe(img);
      });
    }
  }

  // Navigation enhancements
  enhanceNavigation() {
    const navLinks = $$('.main-nav a');
    
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');
        
        // Smooth scroll for anchor links
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#login') {
          e.preventDefault();
          const target = $(href);
          if (target) {
            target.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  // Start background animations
  startAnimations() {
    // Add subtle parallax effect to hero section
    const hero = $('.hero');
    if (hero) {
      window.addEventListener('scroll', debounce(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.1;
        hero.style.transform = `translateY(${rate}px)`;
      }, 10));
    }

    // Animate team slides on scroll
    const teamSlides = $$('.team-slide');
    if (teamSlides.length) {
      window.addEventListener('scroll', debounce(() => {
        teamSlides.forEach((slide, index) => {
          const rect = slide.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isVisible) {
            slide.style.animationDelay = `${index * 0.1}s`;
            slide.classList.add('animate-in');
          }
        });
      }, 100));
    }
  }

  // Setup all event listeners
  setupEventListeners() {
    // Newsletter form
    this.handleNewsletterSubmission();
    
    // Interactive elements
    this.initInteractiveElements();
    
    // Navigation
    this.enhanceNavigation();
    
    // Performance optimizations
    this.initPerformanceOptimizations();
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
      // Recalculate any position-dependent elements
      this.handleResize();
    }, 250));
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause animations when page is not visible
        clearInterval(this.countdownInterval);
      } else {
        // Resume animations when page becomes visible
        this.startCountdown();
      }
    });
  }

  handleResize() {
    // Handle responsive adjustments
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Mobile-specific optimizations
      this.optimizeForMobile();
    } else {
      // Desktop optimizations
      this.optimizeForDesktop();
    }
  }

  optimizeForMobile() {
    // Reduce animation complexity on mobile
    const reveals = $$('.reveal');
    reveals.forEach(el => {
      el.style.transition = 'opacity 0.3s ease';
    });
  }

  optimizeForDesktop() {
    // Restore full animations on desktop
    const reveals = $$('.reveal');
    reveals.forEach(el => {
      el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
    });
  }

  // Cleanup method
  destroy() {
    clearInterval(this.countdownInterval);
    // Remove event listeners if needed
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏁 F1 Racing Website Loaded!');
  new F1App();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  // Cleanup any intervals or ongoing processes
});

// Error handling
window.addEventListener('error', (e) => {
  console.error('F1 App Error:', e.error);
});

// Performance monitoring (optional)
if ('performance' in window) {
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`🏎️ Page loaded in ${Math.round(loadTime)}ms`);
  });
}