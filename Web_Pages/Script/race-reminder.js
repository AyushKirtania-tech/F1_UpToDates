// Script/race-reminder.js - Sleek Local Time Table for Bento Box

const API_BASE_RR = 'https://api.jolpi.ca/ergast/f1';

class LocalTimeTable {
  constructor() {
    this.containerId = 'race-reminder-container';
    // Get the user's local timezone abbreviation (e.g., IST, EST, GMT)
    this.userTimeZone = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ').pop();
  }

  async init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    try {
      const race = await this.fetchNextRace();
      
      if (!race) {
        container.innerHTML = `<p class="timetable-msg">No upcoming races found.</p>`;
        return;
      }

      this.renderTimeTable(race, container);
    } catch (error) {
      console.error('Error loading time table:', error);
      container.innerHTML = `<p class="timetable-msg error">Unable to load schedule.</p>`;
    }
  }

  async fetchNextRace() {
    const response = await fetch(`${API_BASE_RR}/current.json`);
    if (!response.ok) throw new Error('API fetch failed');
    
    const data = await response.json();
    const races = data.MRData.RaceTable.Races;
    const now = new Date();

    // Find the immediate next race
    return races.find(race => {
      const raceDateTime = new Date(`${race.date}T${race.time || '14:00:00Z'}`);
      return raceDateTime > now;
    });
  }

  formatLocalTime(dateStr, timeStr) {
    // If no time is provided by API, fallback to a standard 14:00 UTC
    const validTime = timeStr || '14:00:00Z';
    const dateTime = new Date(`${dateStr}T${validTime}`);
    
    // Convert to user's local timezone
    const day = dateTime.toLocaleDateString('en-US', { weekday: 'short' });
    const time = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    return { day, time, timestamp: dateTime.getTime() };
  }

  renderTimeTable(race, container) {
    // Gather all available sessions
    let sessions = [];

    if (race.FirstPractice) sessions.push({ name: 'FP1', ...this.formatLocalTime(race.FirstPractice.date, race.FirstPractice.time) });
    if (race.SecondPractice) sessions.push({ name: 'FP2', ...this.formatLocalTime(race.SecondPractice.date, race.SecondPractice.time) });
    if (race.ThirdPractice) sessions.push({ name: 'FP3', ...this.formatLocalTime(race.ThirdPractice.date, race.ThirdPractice.time) });
    if (race.Sprint) sessions.push({ name: 'Sprint', ...this.formatLocalTime(race.Sprint.date, race.Sprint.time), isSprint: true });
    if (race.Qualifying) sessions.push({ name: 'Qualifying', ...this.formatLocalTime(race.Qualifying.date, race.Qualifying.time), isQuali: true });
    
    // The main race
    sessions.push({ name: 'Race', ...this.formatLocalTime(race.date, race.time), isRace: true });

    // Sort chronologically just in case
    sessions.sort((a, b) => a.timestamp - b.timestamp);

    const now = new Date().getTime();

    // Generate HTML with the explicit timezone note
    let html = `
      <div class="tz-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        Converted to your local time (${this.userTimeZone})
      </div>
      <div class="timetable-list">
    `;
    
    sessions.forEach(session => {
      const isPast = session.timestamp < now;
      let extraClass = '';
      if (session.isRace) extraClass = 'session-race';
      if (session.isSprint) extraClass = 'session-sprint';
      if (session.isQuali) extraClass = 'session-quali';
      if (isPast) extraClass += ' session-past';

      html += `
        <div class="timetable-item ${extraClass}">
          <div class="tt-left">
            <span class="tt-name">${session.name}</span>
          </div>
          <div class="tt-right">
            <span class="tt-day">${session.day}</span>
            <div class="tt-time-wrapper">
              <span class="tt-time">${session.time}</span>
              <span class="tt-tz">${this.userTimeZone}</span>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const timeTable = new LocalTimeTable();
  timeTable.init();
});