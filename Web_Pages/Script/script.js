document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("schedule-table");

  fetch("https://ergast.com/api/f1/2024.json")
    .then(response => response.json())
    .then(data => {
      const races = data.MRData.RaceTable.Races;

      races.forEach(race => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${race.round}</td>
          <td>${race.date}</td>
          <td>${race.raceName}</td>
          <td>${race.Circuit.Location.locality}, ${race.Circuit.Location.country}</td>
        `;
        table.appendChild(row);
      });
    })
    .catch(error => console.error("Error fetching schedule:", error));
});
