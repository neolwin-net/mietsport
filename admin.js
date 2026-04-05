let matches = [];

async function loadAdminScores() {
  try {
    const response = await fetch("scores.json");
    matches = await response.json();
    renderAdminMatches();
  } catch (error) {
    console.error("Error loading scores:", error);
  }
}

function renderAdminMatches() {
  const container = document.getElementById("adminMatches");
  container.innerHTML = "";

  matches.forEach(match => {
    const card = document.createElement("div");
    card.className = "match-card";

    card.innerHTML = `
      <h3>${match.league}</h3>
      <p><strong>Date:</strong> ${match.date}</p>
      <p><strong>Time:</strong> ${match.time}</p>
      <div class="score-line">
        ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}
      </div>
      <span class="status ${match.status}">${match.status}</span>

      <div class="card-actions">
        <button class="edit-btn" onclick="editMatch(${match.id})">Edit</button>
        <button class="delete-btn" onclick="deleteMatch(${match.id})">Delete</button>
      </div>
    `;

    container.appendChild(card);
  });
}

document.getElementById("matchForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const id = document.getElementById("matchId").value;
  const newMatch = {
    id: id ? Number(id) : Date.now(),
    league: document.getElementById("league").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    homeTeam: document.getElementById("homeTeam").value,
    awayTeam: document.getElementById("awayTeam").value,
    homeScore: Number(document.getElementById("homeScore").value),
    awayScore: Number(document.getElementById("awayScore").value),
    status: document.getElementById("status").value
  };

  if (id) {
    matches = matches.map(match => match.id === Number(id) ? newMatch : match);
  } else {
    matches.push(newMatch);
  }

  this.reset();
  document.getElementById("matchId").value = "";
  renderAdminMatches();
});

function editMatch(id) {
  const match = matches.find(m => m.id === id);
  if (!match) return;

  document.getElementById("matchId").value = match.id;
  document.getElementById("league").value = match.league;
  document.getElementById("date").value = match.date;
  document.getElementById("time").value = match.time;
  document.getElementById("homeTeam").value = match.homeTeam;
  document.getElementById("awayTeam").value = match.awayTeam;
  document.getElementById("homeScore").value = match.homeScore;
  document.getElementById("awayScore").value = match.awayScore;
  document.getElementById("status").value = match.status;
}

function deleteMatch(id) {
  matches = matches.filter(match => match.id !== id);
  renderAdminMatches();
}

document.getElementById("exportBtn").addEventListener("click", function() {
  const dataStr = JSON.stringify(matches, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "scores.json";
  a.click();

  URL.revokeObjectURL(url);
});

loadAdminScores();
