document.addEventListener("DOMContentLoaded", () => {

  const rankingTower = document.getElementById("rankingTower");
  const aiBarsContainer = document.getElementById("aiBarsContainer");

  const btnFan = document.getElementById("btnFanView");
  const btnAi = document.getElementById("btnAiView");
  const fanContainer = document.getElementById("fanViewContainer");
  const aiContainer = document.getElementById("aiViewContainer");

  const drivers = [
    { id:"max", name:"Max Verstappen", team:"Red Bull", img:"images/drivers/max.jpg", color:"#1e3a8a" },
    { id:"norris", name:"Lando Norris", team:"McLaren", img:"images/drivers/lando.webp", color:"#ff8c00" },
    { id:"leclerc", name:"Charles Leclerc", team:"Ferrari", img:"images/drivers/leclerc.jpg", color:"#dc2626" },
    { id:"hamilton", name:"Lewis Hamilton", team:"Ferrari", img:"images/drivers/lewis.jpg", color:"#dc2626" },
    { id:"russell", name:"George Russell", team:"Mercedes", img:"images/drivers/george.jpg", color:"#00d2be" },
    { id:"piastri", name:"Oscar Piastri", team:"McLaren", img:"images/drivers/piastri.webp", color:"#ff8c00" }
  ];

  /* =====================
     VIEW TOGGLE
  ===================== */

  btnFan.addEventListener("click", () => {
    btnFan.classList.add("active");
    btnFan.setAttribute('aria-pressed', 'true');
    btnAi.classList.remove("active");
    btnAi.setAttribute('aria-pressed', 'false');
    fanContainer.style.display = "block";
    aiContainer.style.display = "none";
  });

  btnAi.addEventListener("click", () => {
    btnAi.classList.add("active");
    btnAi.setAttribute('aria-pressed', 'true');
    btnFan.classList.remove("active");
    btnFan.setAttribute('aria-pressed', 'false');
    fanContainer.style.display = "none";
    aiContainer.style.display = "block";
    runAiModel();
  });

  /* =====================
     FAN MODE (FIXED LOGIC)
  ===================== */
  
  // Track scores persistently instead of overriding entirely
  let currentFanScores = drivers.map(d => ({ ...d, score: Math.random() * 20 + 5 }));

  function generateFanRanking(selectedId = null) {
    if (selectedId) {
      // Fix: Boost the selected driver's score when clicked
      let selectedDriver = currentFanScores.find(d => d.id === selectedId);
      if (selectedDriver) {
        selectedDriver.score += (Math.random() * 10 + 5); // Add significant weight
      }
    }

    let sum = currentFanScores.reduce((a, b) => a + b.score, 0);
    
    // Map to original driver object format and calculate precise percent
    let results = currentFanScores.map(r => {
      const originalInfo = drivers.find(d => d.id === r.id);
      return {
        ...originalInfo,
        percent: ((r.score / sum) * 100).toFixed(1)
      };
    }).sort((a, b) => b.percent - a.percent);

    renderTower(results, selectedId);
  }

  function renderTower(data, selectedId) {
    rankingTower.innerHTML = "";

    data.forEach((d, index) => {
      rankingTower.innerHTML += `
        <div class="tower-row" data-id="${d.id}" style="${d.id === selectedId ? 'border-color: var(--accent);' : ''}">
          <div class="tower-pos">${index + 1}</div>
          <div class="tower-driver">
            <img src="${d.img}" alt="${d.name}">
            <div>
              <div class="tower-name">${d.name}</div>
              <div class="tower-team">${d.team}</div>
            </div>
          </div>
          <div class="tower-percent">${d.percent}%</div>
        </div>
      `;
    });

    document.querySelectorAll(".tower-row").forEach(row => {
      row.addEventListener("click", () => {
        generateFanRanking(row.dataset.id);
      });
    });
  }

  // Initialize Fan Mode
  generateFanRanking();

  /* =====================
     AI MODEL
  ===================== */

  function runAiModel() {
    let results = drivers.map(d => ({
      ...d,
      percent: Math.random() * 30 + 10
    }));

    let sum = results.reduce((a, b) => a + b.percent, 0);
    results = results.map(r => ({
      ...r,
      percent: ((r.percent / sum) * 100).toFixed(1)
    })).sort((a, b) => b.percent - a.percent);

    aiBarsContainer.innerHTML = "";

    results.forEach(r => {
      aiBarsContainer.innerHTML += `
        <div class="ai-bar-wrap">
          <div class="ai-bar-labels">
            <span>${r.name}</span>
            <span>${r.percent}%</span>
          </div>
          <div class="ai-track">
            <div class="ai-fill" style="background:${r.color};" data-width="${r.percent}%"></div>
          </div>
        </div>
      `;
    });

    setTimeout(() => {
      document.querySelectorAll(".ai-fill").forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    }, 100);
  }

});