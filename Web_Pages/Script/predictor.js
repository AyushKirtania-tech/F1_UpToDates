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
    btnAi.classList.remove("active");
    fanContainer.style.display = "block";
    aiContainer.style.display = "none";
  });

  btnAi.addEventListener("click", () => {
    btnAi.classList.add("active");
    btnFan.classList.remove("active");
    fanContainer.style.display = "none";
    aiContainer.style.display = "block";
    runAiModel();
  });

  /* =====================
     FAN MODE
  ===================== */

  function generateFanRanking(selectedId=null) {
    let results = drivers.map(d => ({
      ...d,
      percent: Math.random()*20+5
    }));

    let sum = results.reduce((a,b)=>a+b.percent,0);
    results = results.map(r=>({
      ...r,
      percent: ((r.percent/sum)*100).toFixed(1)
    })).sort((a,b)=>b.percent-a.percent);

    renderTower(results, selectedId);
  }

  function renderTower(data, selectedId) {
    rankingTower.innerHTML = "";

    data.forEach((d,index)=>{
      rankingTower.innerHTML += `
        <div class="tower-row" data-id="${d.id}">
          <div class="tower-pos">${index+1}</div>
          <div class="tower-driver">
            <img src="${d.img}">
            <div>
              <div class="tower-name">${d.name}</div>
              <div class="tower-team">${d.team}</div>
            </div>
          </div>
          <div class="tower-percent">${d.percent}%</div>
        </div>
      `;
    });

    document.querySelectorAll(".tower-row").forEach(row=>{
      row.addEventListener("click",()=>{
        generateFanRanking(row.dataset.id);
      });
    });
  }

  generateFanRanking();

  /* =====================
     AI MODEL
  ===================== */

  function runAiModel() {

    let results = drivers.map(d=>({
      ...d,
      percent: Math.random()*30+10
    }));

    let sum = results.reduce((a,b)=>a+b.percent,0);
    results = results.map(r=>({
      ...r,
      percent: ((r.percent/sum)*100).toFixed(1)
    })).sort((a,b)=>b.percent-a.percent);

    aiBarsContainer.innerHTML = "";

    results.forEach(r=>{
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

    setTimeout(()=>{
      document.querySelectorAll(".ai-fill").forEach(bar=>{
        bar.style.width = bar.dataset.width;
      });
    },100);
  }

});