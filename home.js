import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const upcomingContainer = document.getElementById("upcomingMatches");
const previousContainer = document.getElementById("previousMatches");

const matchesRef = collection(db, "matches");

// Real-time listener
onSnapshot(matchesRef, (snapshot) => {
  const matches = [];

  snapshot.forEach((docSnap) => {
    matches.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  // Sort by league first, then order
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
  upcomingContainer.innerHTML = "";
  previousContainer.innerHTML = "";

  const upcomingMatches = matches.filter(match => match.status === "Upcoming");
  const previousMatches = matches.filter(match => match.status !== "Upcoming");

  // Render Upcoming Matches
  if (upcomingMatches.length === 0) {
    upcomingContainer.innerHTML = `<p>No upcoming matches.</p>`;
  } else {
    upcomingMatches.forEach((match) => {
      const div = document.createElement("div");
      div.classList.add("match-card");

      div.innerHTML = `
        <h3>${match.league || "Unknown League"}</h3>
        <p><strong>Date:</strong> ${match.date || "-"} ${match.time || ""}</p>
        <p><strong>${match.homeTeam || "Home"}</strong> vs <strong>${match.awayTeam || "Away"}</strong></p>
        <p><strong>Status:</strong> ${match.status || "Upcoming"}</p>
      `;

      upcomingContainer.appendChild(div);
    });
  }

  // Render Previous / Played / Live Matches
  if (previousMatches.length === 0) {
    previousContainer.innerHTML = `<p>No previous matches.</p>`;
  } else {
    previousMatches.forEach((match) => {
      const div = document.createElement("div");
      div.classList.add("match-card");

      div.innerHTML = `
        <h3>${match.league || "Unknown League"}</h3>
        <p><strong>Date:</strong> ${match.date || "-"} ${match.time || ""}</p>
        <p>
          <strong>${match.homeTeam || "Home"}</strong>
          ${match.homeScore === "" || match.homeScore === undefined ? "-" : match.homeScore}
          :
          ${match.awayScore === "" || match.awayScore === undefined ? "-" : match.awayScore}
          <strong>${match.awayTeam || "Away"}</strong>
        </p>
        <p><strong>Status:</strong> ${match.status || "Played"}</p>
      `;

      previousContainer.appendChild(div);
    });
  }
}
