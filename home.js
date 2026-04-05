import { db } from './firebase-config.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const matchesContainer = document.getElementById("matchesContainer");
const matchesCollection = collection(db, "matches");

// Real-time display
onSnapshot(matchesCollection, snapshot => {
  matchesContainer.innerHTML = "";
  snapshot.forEach(docSnap => {
    const match = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("match-card");
    div.innerHTML = `
      <p><strong>${match.league}</strong> - ${match.date} ${match.time}</p>
      <p>${match.homeTeam} ${match.homeScore} : ${match.awayScore} ${match.awayTeam}</p>
      <p>Status: ${match.status}</p>
    `;
    matchesContainer.appendChild(div);
  });
});
