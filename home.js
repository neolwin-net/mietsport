import { db } from './firebase-config.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const upcomingContainer = document.getElementById("upcomingMatches");
const previousContainer = document.getElementById("previousMatches");

const matchesCollection = collection(db, "matches");

onSnapshot(matchesCollection, snapshot => {
  upcomingContainer.innerHTML = "";
  previousContainer.innerHTML = "";

  snapshot.docs.forEach(docSnap => {
    const match = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("match-card");

    if (match.status === "Upcoming") {
      // Upcoming matches: blank scores
      div.innerHTML = `
        <p><strong>${match.league}</strong> - ${match.date} ${match.time}</p>
        <p>${match.homeTeam} : ${match.awayTeam}</p>
        <p>Status: Upcoming</p>
      `;
      upcomingContainer.appendChild(div);
    } else {
      // Previous matches: show scores
      div.innerHTML = `
        <p><strong>${match.league}</strong> - ${match.date} ${match.time}</p>
        <p>${match.homeTeam} ${match.homeScore ?? 0} : ${match.awayScore ?? 0} ${match.awayTeam}</p>
        <p>Status: Played</p>
      `;
      previousContainer.appendChild(div);
    }
  });
});
