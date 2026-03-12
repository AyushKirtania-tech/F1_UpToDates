/* Script/analytics.js - Bulletproof F1 Telemetry Processing (Auto-Loading) */

(() => {
  const API_ROOT = 'https://api.jolpi.ca/ergast/f1';
  const $ = id => document.getElementById(id);

  // UI Elements mapping (Removed loadBtn)
  const ui = {
    season: $('seasonSelect'), race: $('raceSelect'),
    dashboard: $('analyticsDashboard'), loading: $('loading'), error: $('error'),
    fastestName: $('fastestLapDriver'), fastestTime: $('fastestLapTime'), fastestSpeed: $('fastestLapSpeed'),
    winnerName: $('raceWinner'), winnerTeam: $('raceWinnerTeam'), winnerTime: $('winnerTime'), winnerGrid: $('winnerGrid'), winnerPoints: $('winnerPoints'),
    teamList: $('teamPointsList'), moversList: $('moversList'),
    completionRate: $('completionRate'), finishCount: $('finishCount'), dnfCount: $('dnfCount'), totalGridCount: $('totalGridCount'), statusGrid: $('statusBreakdown'), retirementsLog: $('retirementsLog')
  };

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Error');
    return res.json();
  }

  async function init() {
    ui.loading.hidden = false;
    try {
      const sJson = await fetchJson(`${API_ROOT}/seasons.json?limit=100`);
      let seasons = sJson.MRData.SeasonTable.Seasons.map(s => s.season).sort((a,b) => b - a);
      seasons.forEach(s => ui.season.appendChild(new Option(s, s)));
      ui.season.value = seasons[0];

      await loadRaces(seasons[0]);
      // Auto-load analytics for the latest completed race on initial page load
      await fetchAndDisplayAnalytics();
    } catch(e) {
      showError('Failed to establish API uplink.');
    }
  }

  async function loadRaces(season) {
    const rJson = await fetchJson(`${API_ROOT}/${season}/races.json`);
    const races = rJson.MRData.RaceTable.Races;
    ui.race.innerHTML = '';
    const today = new Date().toISOString().slice(0, 10);
    
    races.forEach(r => ui.race.appendChild(new Option(`${r.round} - ${r.raceName}`, r.round)));
    
    // Select most recent completed race
    const completed = races.filter(r => r.date <= today).sort((a,b) => b.round - a.round);
    if(completed.length > 0) ui.race.value = completed[0].round;
  }

  function showError(msg) {
    ui.error.hidden = false; ui.error.textContent = msg;
    ui.dashboard.hidden = true;
    ui.loading.hidden = true;
  }

  async function fetchAndDisplayAnalytics() {
    ui.dashboard.hidden = true; ui.error.hidden = true; ui.loading.hidden = false;
    try {
      const data = await fetchJson(`${API_ROOT}/${ui.season.value}/${ui.race.value}/results.json`);
      const results = data.MRData.RaceTable.Races[0]?.Results;
      if (!results || results.length === 0) throw new Error('Official classification not yet available for this session.');
      
      buildDashboard(results);
      ui.dashboard.hidden = false;
    } catch(e) {
      showError(e.message);
    } finally {
      ui.loading.hidden = true;
    }
  }

  /* =========================================================
     AUTO-LOAD EVENT LISTENERS (No Button Needed)
     ========================================================= */
     
  // When user changes the YEAR
  ui.season.addEventListener('change', async (e) => {
    ui.dashboard.hidden = true; ui.loading.hidden = false;
    await loadRaces(e.target.value); // Load the tracks for that year
    await fetchAndDisplayAnalytics(); // Automatically fetch data for the most recent race of that year
  });

  // When user changes the RACE
  ui.race.addEventListener('change', fetchAndDisplayAnalytics);

  /* =========================================================
     DASHBOARD BUILDER LOGIC
     ========================================================= */

  function buildDashboard(results) {
    // 1. RACE WINNER
    const winner = results.find(r => r.position === "1");
    if (winner) {
      ui.winnerName.textContent = `${winner.Driver.givenName} ${winner.Driver.familyName}`;
      ui.winnerTeam.textContent = winner.Constructor.name;
      ui.winnerTime.textContent = winner.Time?.time || "Time N/A";
      ui.winnerGrid.textContent = `Started P${winner.grid}`;
      ui.winnerPoints.textContent = `${winner.points} PTS`;
    } else {
      ui.winnerName.textContent = "Data Unavailable";
      ui.winnerTeam.textContent = "—"; ui.winnerTime.textContent = "—"; ui.winnerGrid.textContent = "—"; ui.winnerPoints.textContent = "0 PTS";
    }

    // 2. FASTEST LAP
    const fastest = results.find(r => r.FastestLap?.rank === "1");
    if (fastest && fastest.FastestLap) {
      ui.fastestName.textContent = `${fastest.Driver.givenName} ${fastest.Driver.familyName}`;
      const lapTime = fastest.FastestLap.Time?.time || 'Time N/A';
      const lapSpeed = fastest.FastestLap.AverageSpeed?.speed ? `${fastest.FastestLap.AverageSpeed.speed} km/h` : '';
      const lapNum = fastest.FastestLap.lap ? `(Lap ${fastest.FastestLap.lap})` : '';
      ui.fastestTime.textContent = lapTime;
      ui.fastestSpeed.textContent = `${lapNum} ${lapSpeed}`;
    } else {
      ui.fastestName.textContent = "Data Unavailable";
      ui.fastestTime.textContent = "—"; ui.fastestSpeed.textContent = "";
    }

    // 3. TEAM POINTS CHART
    const teams = {};
    results.forEach(r => {
      const tName = r.Constructor?.name || 'Unknown';
      const pts = parseFloat(r.points) || 0;
      teams[tName] = (teams[tName] || 0) + pts;
    });

    const sortedTeams = Object.entries(teams).sort((a,b) => b[1] - a[1]).filter(t => t[1] > 0);
    const maxPts = sortedTeams.length > 0 ? sortedTeams[0][1] : 44; 

    ui.teamList.innerHTML = sortedTeams.map(([team, pts], index) => {
      const pct = (pts / maxPts) * 100;
      const barColor = index === 0 ? 'var(--f1-red, #e10600)' : '#fff';
      return `
        <div class="bar-row">
          <div class="bar-label">${team}</div>
          <div class="bar-track"><div class="bar-fill" style="width: 0%; background: ${barColor};" data-target="${pct}%"></div></div>
          <div class="bar-value">${pts}</div>
        </div>
      `;
    }).join('') || '<div class="stat-sub">No constructors scored points.</div>';

    // 4. GRID MOVERS
    const movers = results.map(r => {
      const grid = parseInt(r.grid);
      const pos = parseInt(r.position);
      let delta = 0;
      if (!isNaN(grid) && grid > 0 && !isNaN(pos)) delta = grid - pos;
      return {
        name: r.Driver?.familyName || 'Unknown', 
        team: r.Constructor?.name || 'Unknown',
        delta: delta,
        status: r.status
      };
    })
    .filter(m => m.delta !== 0 && (m.status === 'Finished' || m.status.includes('Lap')))
    .sort((a,b) => b.delta - a.delta); 

    const displayMovers = [...movers.slice(0, 2)];
    if (movers.length > 2 && movers[movers.length-1].delta < 0) {
        displayMovers.push(movers[movers.length-1]);
    }

    ui.moversList.innerHTML = displayMovers.map(m => `
      <div class="list-item">
        <div class="li-info">
          <div class="li-main">${m.name}</div>
          <div class="li-sub">${m.team}</div>
        </div>
        <div class="delta-box ${m.delta > 0 ? 'up' : 'down'}">
          ${m.delta > 0 ? '▲ +'+m.delta : '▼ '+Math.abs(m.delta)}
        </div>
      </div>
    `).join('') || '<div class="stat-sub">Grid order remained largely static.</div>';

    // 5. GRID ATTRITION & RETIREMENTS LOG
    let finished = 0;
    let dnf = 0;
    const reasons = {};
    const retirementsList = [];

    results.forEach(r => {
      let s = r.status || "Unknown";
      if (s === "Finished" || s.includes('Lap')) {
        finished++;
      } else {
        dnf++;
        reasons[s] = (reasons[s] || 0) + 1;
        
        const driverInitial = r.Driver?.givenName ? r.Driver.givenName.charAt(0) + '.' : '';
        const driverName = r.Driver?.familyName || 'Unknown';
        retirementsList.push({
          name: `${driverInitial} ${driverName}`,
          reason: s,
          lap: r.laps ? `Lap ${r.laps}` : 'Lap 0'
        });
      }
    });

    const totalDrivers = finished + dnf;
    const compRate = totalDrivers > 0 ? Math.round((finished / totalDrivers) * 100) : 0;

    ui.completionRate.textContent = `${compRate}%`;
    ui.finishCount.textContent = finished;
    ui.dnfCount.textContent = dnf;
    ui.totalGridCount.textContent = totalDrivers;

    ui.statusGrid.innerHTML = Object.entries(reasons).sort((a,b) => b[1] - a[1]).map(([reason, count]) => `
      <div class="status-pill">
        <span>${reason}</span><span class="badge-count">${count}</span>
      </div>
    `).join('') || '';

    if (retirementsList.length > 0) {
      ui.retirementsLog.innerHTML = retirementsList.map(ret => `
        <div class="ret-item">
          <span class="ret-driver" title="${ret.name}">${ret.name}</span>
          <span class="ret-reason">${ret.reason}</span>
          <span class="ret-lap">${ret.lap}</span>
        </div>
      `).join('');
    } else {
      ui.retirementsLog.innerHTML = `<div class="stat-sub" style="text-align:center; padding: 20px 0; color: #00ff88; font-weight:800; border: 1px dashed rgba(0,255,136,0.3); border-radius: 8px;">100% Reliability. No retirements!</div>`;
    }

    // Trigger Animations
    setTimeout(() => {
      document.querySelectorAll('.bar-fill').forEach(bar => { bar.style.width = bar.dataset.target; });
    }, 50);
  }

  document.addEventListener('DOMContentLoaded', init);
})();