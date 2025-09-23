/* schedule.js - robust fetch with CORS fallback and friendly UI updates */

const ergastURL = 'https://ergast.com/api/f1/current.json?limit=1000';
const corsProxy = (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;

const $ = sel => document.querySelector(sel);
const setText = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };

async function fetchJsonWithFallback(url) {
  // try direct fetch first
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('Direct fetch failed, trying proxy', err);
    const res2 = await fetch(corsProxy(url));
    if (!res2.ok) throw new Error('Proxy error ' + res2.status);
    return await res2.json();
  }
}

function formatLocal(dateStr, timeStr) {
  try {
    if (timeStr) {
      const dt = new Date(`${dateStr}T${timeStr}Z`);
      return dt.toLocaleString();
    } else {
      return new Date(dateStr).toLocaleDateString();
    }
  } catch {
    return dateStr;
  }
}

function startCountdownTo(targetDate) {
  const daysEl = $('#cd-days'), hrsEl = $('#cd-hours'), minsEl = $('#cd-mins'), secsEl = $('#cd-secs');
  if (!daysEl) return;

  function tick() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      daysEl.textContent = '0'; hrsEl.textContent = '00'; minsEl.textContent = '00'; secsEl.textContent = '00';
      clearInterval(interval);
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    daysEl.textContent = days;
    hrsEl.textContent = String(hours).padStart(2,'0');
    minsEl.textContent = String(mins).padStart(2,'0');
    secsEl.textContent = String(secs).padStart(2,'0');
  }
  tick();
  const interval = setInterval(tick, 1000);
}

async function loadAndShowNextRace() {
  setText('#nr-name', 'Loading...');
  try {
    const data = await fetchJsonWithFallback(ergastURL);
    const races = data?.MRData?.RaceTable?.Races || [];
    const now = new Date();
    const next = races.find(r => {
      if (!r.date) return false;
      const dt = r.time ? new Date(`${r.date}T${r.time}Z`) : new Date(r.date);
      return dt > now;
    });
    if (!next) {
      setText('#nr-name', 'No upcoming race found');
      $('#countdown').style.display = 'none';
      setText('#nr-circuit', '');
      setText('#nr-date', '');
      return;
    }
    setText('#nr-name', next.raceName);
    setText('#nr-circuit', `${next.Circuit.circuitName} — ${next.Circuit.Location.locality}, ${next.Circuit.Location.country}`);
    setText('#nr-date', formatLocal(next.date, next.time));
    $('#nr-link').href = 'schedule.html';
    const target = next.time ? new Date(`${next.date}T${next.time}Z`) : new Date(next.date);
    startCountdownTo(target);
  } catch (err) {
    console.error('Failed to load schedule:', err);
    setText('#nr-name', 'Unable to load next race');
    $('#countdown').style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ensure elements exist on the page before calling
  if (document.querySelector('#nr-name')) {
    loadAndShowNextRace();
  }
});
