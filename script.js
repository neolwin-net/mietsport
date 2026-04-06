import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =====================
// YOUR FIREBASE CONFIG
// =====================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const upcomingContainer = document.getElementById("upcomingMatches");
const previousContainer = document.getElementById("previousMatches");

// Listen to matches in real-time
const matchesRef = collection(db, "matches");
const q = query(matchesRef, orderBy("league"), orderBy("order"));

onSnapshot(q, (snapshot) => {
  const matches = [];

  snapshot.forEach((doc) => {
    matches.push({ id: doc.id, ...doc.data() });
  });

  renderMatches(matches);
});

function renderMatches(matches) {
  const upcoming = matches.filter(match => match.status === "upcoming");
  const previous = matches.filter(match => match.status === "previous");

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
      card.className = "match-card";

      const scoreDisplay = isUpcoming
        ? "- : -"
        : `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`;

      card.innerHTML = `
        <div class="match-row">
          <div class="teams">${match.homeTeam} vs ${match.awayTeam}</div>
          <div class="score">${scoreDisplay}</div>
        </div>
        <div class="match-info">
          📅 ${match.date} | ⏰ ${match.time} | 🔢 Order: ${match.order}
        </div>
      `;

      container.appendChild(card);
    });
  }
}

function groupByLeague(matches) {
  return matches.reduce((groups, match) => {
    const league = match.league || "Other League";
    if (!groups[league]) {
      groups[league] = [];
    }
    groups[league].push(match);

    // Sort by admin order inside each league
    groups[league].sort((a, b) => Number(a.order) - Number(b.order));

    return groups;
  }, {});
}
