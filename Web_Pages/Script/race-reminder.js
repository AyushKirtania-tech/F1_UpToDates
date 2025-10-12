// race-reminder.js - Race Reminder System
// This replaces the newsletter functionality with actual useful features

const API_BASE = 'https://api.jolpi.ca/ergast/f1';

class RaceReminderSystem {
  constructor() {
    this.nextRace = null;
    this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    this.countdownInterval = null;
    this.reminderKey = 'f1_race_reminder';
    this.notificationKey = 'f1_notification_sent';
  }

  // Initialize the system
  async init() {
    console.log('🏁 Initializing Race Reminder System...');
    
    // Fetch next race
    await this.fetchNextRace();
    
    if (this.nextRace) {
      this.renderUI();
      this.startCountdown();
      this.checkReminder();
      this.setupEventListeners();
      this.checkAndTriggerNotification();
    } else {
      this.showError();
    }
  }

  // Fetch the next upcoming race from the API
  async fetchNextRace() {
    try {
      const response = await fetch(`${API_BASE}/current.json`);
      if (!response.ok) throw new Error('Failed to fetch races');
      
      const data = await response.json();
      const races = data.MRData.RaceTable.Races;
      
      if (!races || races.length === 0) {
        console.warn('No races found');
        return;
      }

      // Find next race (race date is in the future)
      const now = new Date();
      this.nextRace = races.find(race => {
        const raceDateTime = new Date(`${race.date}T${race.time || '14:00:00Z'}`);
        return raceDateTime > now;
      });

      // If no future race found, use the last race (season ended)
      if (!this.nextRace) {
        this.nextRace = races[races.length - 1];
        this.nextRace.isPast = true;
      }

      console.log('✅ Next race found:', this.nextRace.raceName);
    } catch (error) {
      console.error('❌ Error fetching next race:', error);
      this.nextRace = null;
    }
  }

  // Render the UI
  renderUI() {
    const container = document.getElementById('race-reminder-system');
    if (!container) {
      console.error('Container #race-reminder-system not found');
      return;
    }

    const race = this.nextRace;
    const reminderSet = this.isReminderSet();
    const isPast = race.isPast || false;

    container.innerHTML = `
      <div class="race-reminder-container">
        <!-- Hero Section -->
        <div class="race-reminder-hero">
          <div class="race-badge">${isPast ? '🏁 LAST RACE' : '🏁 NEXT RACE'}</div>
          <h2 class="race-title">${this.escapeHtml(race.raceName)}</h2>
          <p class="race-circuit">
            <span class="circuit-icon">🏎️</span>
            ${this.escapeHtml(race.Circuit.circuitName)}
          </p>
          <p class="race-location">
            <span class="location-icon">📍</span>
            ${this.escapeHtml(race.Circuit.Location.locality)}, ${this.escapeHtml(race.Circuit.Location.country)}
          </p>
        </div>

        ${!isPast ? `
        <!-- Countdown -->
        <div class="race-countdown">
          <h3 class="countdown-title">Race Starts In</h3>
          <div class="countdown-grid">
            <div class="countdown-item">
              <div class="countdown-value" id="countdown-days">00</div>
              <div class="countdown-label">Days</div>
            </div>
            <div class="countdown-item">
              <div class="countdown-value" id="countdown-hours">00</div>
              <div class="countdown-label">Hours</div>
            </div>
            <div class="countdown-item">
              <div class="countdown-value" id="countdown-minutes">00</div>
              <div class="countdown-label">Minutes</div>
            </div>
            <div class="countdown-item">
              <div class="countdown-value" id="countdown-seconds">00</div>
              <div class="countdown-label">Seconds</div>
            </div>
          </div>
        </div>
        ` : `
        <div class="race-countdown">
          <p class="season-ended">The ${new Date().getFullYear()} season has concluded. Check back for next season!</p>
        </div>
        `}

        <!-- Action Buttons -->
        <div class="reminder-actions">
          <button id="set-reminder-btn" class="btn-reminder ${reminderSet ? 'reminder-active' : ''}" ${isPast ? 'disabled' : ''}>
            <span class="btn-icon">${reminderSet ? '✓' : '🔔'}</span>
            <span class="btn-text">${reminderSet ? 'Reminder Set!' : 'Set Reminder'}</span>
          </button>
          
          <button id="download-calendar-btn" class="btn-calendar" ${isPast ? 'disabled' : ''}>
            <span class="btn-icon">📅</span>
            <span class="btn-text">Add to Calendar</span>
          </button>
        </div>

        <!-- Race Details -->
        <div class="race-details-grid">
          <div class="detail-card">
            <div class="detail-icon">📅</div>
            <div class="detail-label">Race Date</div>
            <div class="detail-value">${this.formatDate(race.date)}</div>
          </div>
          
          <div class="detail-card">
            <div class="detail-icon">⏰</div>
            <div class="detail-label">Race Time</div>
            <div class="detail-value">${this.formatTime(race.time || '14:00:00Z')}</div>
          </div>
          
          <div class="detail-card">
            <div class="detail-icon">🏁</div>
            <div class="detail-label">Round</div>
            <div class="detail-value">Round ${race.round}</div>
          </div>
        </div>

        ${!isPast && race.Qualifying ? `
        <!-- Weekend Schedule -->
        <div class="weekend-schedule">
          <h3 class="schedule-title">Weekend Schedule</h3>
          <div class="schedule-list">
            ${race.FirstPractice ? `
            <div class="schedule-item">
              <span class="schedule-session">FP1</span>
              <span class="schedule-time">${this.formatDateTime(race.FirstPractice.date, race.FirstPractice.time)}</span>
            </div>` : ''}
            
            ${race.SecondPractice ? `
            <div class="schedule-item">
              <span class="schedule-session">FP2</span>
              <span class="schedule-time">${this.formatDateTime(race.SecondPractice.date, race.SecondPractice.time)}</span>
            </div>` : ''}
            
            ${race.ThirdPractice ? `
            <div class="schedule-item">
              <span class="schedule-session">FP3</span>
              <span class="schedule-time">${this.formatDateTime(race.ThirdPractice.date, race.ThirdPractice.time)}</span>
            </div>` : ''}
            
            ${race.Sprint ? `
            <div class="schedule-item sprint">
              <span class="schedule-session">Sprint ⚡</span>
              <span class="schedule-time">${this.formatDateTime(race.Sprint.date, race.Sprint.time)}</span>
            </div>` : ''}
            
            ${race.Qualifying ? `
            <div class="schedule-item">
              <span class="schedule-session">Qualifying</span>
              <span class="schedule-time">${this.formatDateTime(race.Qualifying.date, race.Qualifying.time)}</span>
            </div>` : ''}
            
            <div class="schedule-item race">
              <span class="schedule-session">Race 🏁</span>
              <span class="schedule-time">${this.formatDateTime(race.date, race.time || '14:00:00Z')}</span>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Tips -->
        <div class="reminder-tips">
          <div class="tip-icon">💡</div>
          <div class="tip-content">
            <strong>Pro Tip:</strong> Enable browser notifications to get reminded 1 hour before the race starts!
          </div>
        </div>

        <!-- Message Area -->
        <div id="reminder-message" class="reminder-message" style="display: none;"></div>
      </div>
    `;
  }

  // Start countdown timer
  startCountdown() {
    if (this.nextRace.isPast) return;

    const updateCountdown = () => {
      const raceDateTime = new Date(`${this.nextRace.date}T${this.nextRace.time || '14:00:00Z'}`);
      const now = new Date();
      const diff = raceDateTime - now;

      if (diff <= 0) {
        // Race has started or passed
        this.stopCountdown();
        this.showMessage('🏁 The race has started! Enjoy!', 'success');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      this.countdown = { days, hours, minutes, seconds };
      this.updateCountdownUI();
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  // Update countdown UI
  updateCountdownUI() {
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minutesEl = document.getElementById('countdown-minutes');
    const secondsEl = document.getElementById('countdown-seconds');

    if (daysEl) daysEl.textContent = String(this.countdown.days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(this.countdown.hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(this.countdown.minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(this.countdown.seconds).padStart(2, '0');
  }

  // Stop countdown
  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    const reminderBtn = document.getElementById('set-reminder-btn');
    const calendarBtn = document.getElementById('download-calendar-btn');

    if (reminderBtn) {
      reminderBtn.addEventListener('click', () => this.setReminder());
    }

    if (calendarBtn) {
      calendarBtn.addEventListener('click', () => this.downloadCalendar());
    }
  }

  // Set reminder
  async setReminder() {
    if (this.isReminderSet()) {
      this.showMessage('✓ Reminder already set for this race!', 'info');
      return;
    }

    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Save reminder
        const reminderData = {
          raceId: `${this.nextRace.season}_${this.nextRace.round}`,
          raceName: this.nextRace.raceName,
          date: this.nextRace.date,
          time: this.nextRace.time || '14:00:00Z',
          setAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.reminderKey, JSON.stringify(reminderData));
        
        // Update UI
        const btn = document.getElementById('set-reminder-btn');
        if (btn) {
          btn.classList.add('reminder-active');
          btn.innerHTML = '<span class="btn-icon">✓</span><span class="btn-text">Reminder Set!</span>';
        }
        
        // Show confirmation notification
        new Notification('🏁 Race Reminder Set!', {
          body: `We'll remind you 1 hour before ${this.nextRace.raceName}`,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🏎️</text></svg>',
          badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🏁</text></svg>'
        });
        
        this.showMessage('✓ Reminder set successfully! You\'ll get notified 1 hour before the race.', 'success');
      } else if (permission === 'denied') {
        this.showMessage('❌ Notifications blocked. Please enable them in your browser settings.', 'error');
      } else {
        this.showMessage('⚠️ Notification permission required to set reminders.', 'warning');
      }
    } else {
      this.showMessage('❌ Your browser doesn\'t support notifications.', 'error');
    }
  }

  // Check if reminder is set for current race
  isReminderSet() {
    const saved = localStorage.getItem(this.reminderKey);
    if (!saved) return false;

    try {
      const data = JSON.parse(saved);
      const currentRaceId = `${this.nextRace.season}_${this.nextRace.round}`;
      return data.raceId === currentRaceId;
    } catch (e) {
      return false;
    }
  }

  // Check reminder and trigger notification if needed
  checkReminder() {
    const saved = localStorage.getItem(this.reminderKey);
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      const currentRaceId = `${this.nextRace.season}_${this.nextRace.round}`;
      
      if (data.raceId === currentRaceId) {
        // Set up interval to check for 1 hour before race
        setInterval(() => this.checkAndTriggerNotification(), 60000); // Check every minute
      }
    } catch (e) {
      console.error('Error checking reminder:', e);
    }
  }

  // Check and trigger notification
  checkAndTriggerNotification() {
    const saved = localStorage.getItem(this.reminderKey);
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      const raceDateTime = new Date(`${data.date}T${data.time}`);
      const now = new Date();
      const oneHourBefore = new Date(raceDateTime.getTime() - (60 * 60 * 1000));
      
      // Check if we're within the notification window (1 hour before race)
      if (now >= oneHourBefore && now < raceDateTime) {
        // Check if notification already sent for this race
        const notificationSent = localStorage.getItem(this.notificationKey);
        if (notificationSent === data.raceId) return;

        // Send notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🏁 Race Starting Soon!', {
            body: `${data.raceName} starts in less than 1 hour!`,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🏎️</text></svg>',
            requireInteraction: true,
            tag: 'race-reminder'
          });

          // Mark notification as sent
          localStorage.setItem(this.notificationKey, data.raceId);
        }
      }
    } catch (e) {
      console.error('Error triggering notification:', e);
    }
  }

  // Download calendar file (.ics)
  downloadCalendar() {
    const race = this.nextRace;
    const startDate = new Date(`${race.date}T${race.time || '14:00:00Z'}`);
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration

    const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//F1 Racing//Race Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${race.season}-${race.round}@f1racing.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${race.raceName}
DESCRIPTION:Formula 1 ${race.raceName}\\n${race.Circuit.circuitName}
LOCATION:${race.Circuit.Location.locality}, ${race.Circuit.Location.country}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Race starts in 1 hour
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `f1-${race.raceName.toLowerCase().replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showMessage('✓ Calendar file downloaded! Open it to add to your calendar app.', 'success');
  }

  // Show message
  showMessage(text, type = 'info') {
    const messageEl = document.getElementById('reminder-message');
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.className = `reminder-message ${type}`;
    messageEl.style.display = 'block';

    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }

  // Show error state
  showError() {
    const container = document.getElementById('race-reminder-system');
    if (!container) return;

    container.innerHTML = `
      <div class="race-reminder-container">
        <div class="reminder-error">
          <div class="error-icon">⚠️</div>
          <h3>Unable to Load Race Information</h3>
          <p>Please check your internet connection and try again.</p>
          <button class="btn-reminder" onclick="location.reload()">Retry</button>
        </div>
      </div>
    `;
  }

  // Format date helper
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format time helper
  formatTime(timeString) {
    if (!timeString) return 'TBA';
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }

  // Format date and time together
  formatDateTime(dateString, timeString) {
    const dateTime = new Date(`${dateString}T${timeString || '00:00:00Z'}`);
    return dateTime.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }

  // Escape HTML
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Clean up
  destroy() {
    this.stopCountdown();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const reminderSystem = new RaceReminderSystem();
  reminderSystem.init();
});

// Store instance globally for debugging
window.raceReminderSystem = new RaceReminderSystem();