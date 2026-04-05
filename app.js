import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let matches = [];

const scoresContainer = document.getElementById("scoresContainer");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

function displayMatches(data) {
  scoresContainer.innerHTML = "";

  if (data.length === 0) {
    scoresContainer.innerHTML = "<p>No matches found.</p>";
    return;
  }

  data.forEach(match => {
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
    `;

    scoresContainer.appendChild(card);
  });
}

function applyFilters() {
  const searchValue = searchInput.value.toLowerCase();
  const statusValue = statusFilter.value;

  const filtered = matches.filter(match => {
    const matchesSearch =
      match.homeTeam.toLowerCase().includes(searchValue) ||
      match.awayTeam.toLowerCase().includes(searchValue) ||
      match.league.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusValue === "All" || match.status === statusValue;

    return matchesSearch && matchesStatus;
  });

  displayMatches(filtered);
}

function loadMatches() {
  const q = query(collection(db, "matches"), orderBy("date", "desc"));

  onSnapshot(q, (snapshot) => {
    matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    applyFilters();
  }, (error) => {
    console.error("Firestore read error:", error);
  });
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);

loadMatches();
