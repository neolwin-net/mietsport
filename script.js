import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const upcomingContainer = document.getElementById("upcomingMatches");
const previousContainer = document.getElementById("previousMatches");

const matchesRef = collection(db, "matches");

// Real-time listener (NO Firestore index required)
onSnapshot(matchesRef, (snapshot) => {
  const matches = [];

  snapshot.forEach((docSnap) => {
    matches.push({ id: docSnap.id, ...docSnap.data() });
  });

  // Sort in JavaScript instead of Firestore
  matches.sort((a, b) => {
    const leagueCompare = (a.league || "").localeCompare(b.league || "");
    if (leagueCompare !== 0) return leagueCompare;
    return Number(a.order || 0) - Number(b.order || 0);
  });

  renderMatches(matches);
}, (error) => {
  console.error("Firestore read error:", error);
});

function renderMatches(matches) {
  const upcoming = matches.filter(match => match.status === "Upcoming");
  const previous = matches.filter(match => match.status === "FT" || match.status === "Live");

  renderCategory(upcomingContainer, upcoming, true);
  renderCategory(previousContainer, previous, false);
}

function renderCategory(container, matches, isUpcoming) {
  container.innerHTML = "";

  if (matches.length === 0) {
    container.innerHTML = `<div class="no-match">No Match</div>`;
    return;
  }

  const grouped = groupByLeague(matches);

  for (const league in grouped) {
    const leagueTitle = document.createElement("h3");
    leagueTitle.className = "league-title";
    leagueTitle.textContent = league;
    container.appendChild(leagueTitle);

    grouped[league].forEach(match => {
      const card = document.createElement("div");
      card.className = "score-card";

      card.innerHTML = `
        <div class="score-header">
          <span class="match-date">${match.date}</span>
          <span class="match-status">${match.status}</span>
        </div>

        <div class="teams">
          <div class="team-row">
            <span>${match.homeTeam}</span>
            <strong>${isUpcoming ? "" : (match.homeScore === "" ? "-" : match.homeScore)}</strong>
          </div>
          <div class="team-row">
            <span>${match.awayTeam}</span>
            <strong>${isUpcoming ? "" : (match.awayScore === "" ? "-" : match.awayScore)}</strong>
          </div>
        </div>

        <div class="match-meta">
          <small>🕒 ${match.time}</small><br>
          <small>🔢 Order: ${match.order}</small>
        </div>
      `;

      container.appendChild(card);
    });
  }
}

function groupByLeague(matches) {
  return matches.reduce((groups, match) => {
    const league = match.league || "Other League";
    if (!groups[league]) groups[league] = [];
    groups[league].push(match);
    groups[league].sort((a, b) => Number(a.order) - Number(b.order));
    return groups;
  }, {});
}
