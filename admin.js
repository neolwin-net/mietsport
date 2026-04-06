import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =====================
// YOUR FIREBASE CONFIG
// =====================


const firebaseConfig = {
  apiKey: "AIzaSyA7GIr9HxNnYCxlNxVU0k2_iDqongpf5JI",
  authDomain: "mietsport-219e0.firebaseapp.com",
  projectId: "mietsport-219e0",
  storageBucket: "mietsport-219e0.firebasestorage.app",
  messagingSenderId: "887875051700",
  appId: "1:887875051700:web:937aa6380b44a6dc8a37e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const matchForm = document.getElementById("matchForm");
const matchIdInput = document.getElementById("matchId");
const leagueInput = document.getElementById("league");
const homeTeamInput = document.getElementById("homeTeam");
const awayTeamInput = document.getElementById("awayTeam");
const dateInput = document.getElementById("matchDate");
const timeInput = document.getElementById("matchTime");
const homeScoreInput = document.getElementById("homeScore");
const awayScoreInput = document.getElementById("awayScore");
const statusInput = document.getElementById("status");
const orderInput = document.getElementById("order");
const adminMatches = document.getElementById("adminMatches");
const cancelEditBtn = document.getElementById("cancelEdit");

// Add / Update Match
matchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const matchData = {
    league: leagueInput.value.trim(),
    homeTeam: homeTeamInput.value.trim(),
    awayTeam: awayTeamInput.value.trim(),
    date: dateInput.value,
    time: timeInput.value,
    homeScore: homeScoreInput.value === "" ? "" : Number(homeScoreInput.value),
    awayScore: awayScoreInput.value === "" ? "" : Number(awayScoreInput.value),
    status: statusInput.value,
    order: Number(orderInput.value)
  };

  try {
    if (matchIdInput.value) {
      const matchRef = doc(db, "matches", matchIdInput.value);
      await updateDoc(matchRef, matchData);
      alert("Match updated successfully!");
    } else {
      await addDoc(collection(db, "matches"), matchData);
      alert("Match added successfully!");
    }

    resetForm();
  } catch (error) {
    console.error("Error saving match:", error);
    alert("Error saving match!");
  }
});

// Cancel Edit
cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

// Real-time match list
const q = query(collection(db, "matches"), orderBy("league"), orderBy("order"));

onSnapshot(q, (snapshot) => {
  const matches = [];
  snapshot.forEach((docSnap) => {
    matches.push({ id: docSnap.id, ...docSnap.data() });
  });

  renderAdminMatches(matches);
});

function renderAdminMatches(matches) {
  adminMatches.innerHTML = "";

  if (matches.length === 0) {
    adminMatches.innerHTML = `<div class="no-match">No matches added yet.</div>`;
    return;
  }

  const grouped = groupByLeague(matches);

  for (const league in grouped) {
    const leagueTitle = document.createElement("h3");
    leagueTitle.className = "league-title";
    leagueTitle.textContent = league;
    adminMatches.appendChild(leagueTitle);

    grouped[league].forEach((match) => {
      const card = document.createElement("div");
      card.className = "admin-card";

      const scoreText =
        match.status === "upcoming"
          ? "- : -"
          : `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`;

      card.innerHTML = `
        <div class="match-row">
          <div class="teams">${match.homeTeam} vs ${match.awayTeam}</div>
          <div class="score">${scoreText}</div>
        </div>
        <div class="match-info">
          🏆 ${match.league} <br>
          📅 ${match.date} | ⏰ ${match.time} <br>
          📌 Status: ${match.status} <br>
          🔢 Order: ${match.order}
        </div>
        <div class="admin-actions">
          <button class="edit-btn" data-id="${match.id}">Edit</button>
          <button class="delete-btn" data-id="${match.id}">Delete</button>
        </div>
      `;

      adminMatches.appendChild(card);
    });
  }

  attachButtons(matches);
}

function attachButtons(matches) {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const match = matches.find(m => m.id === id);
      if (match) loadMatchForEdit(match);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmDelete = confirm("Are you sure you want to delete this match?");
      if (!confirmDelete) return;

      try {
        await deleteDoc(doc(db, "matches", id));
        alert("Match deleted successfully!");
      } catch (error) {
        console.error("Error deleting match:", error);
        alert("Error deleting match!");
      }
    });
  });
}

function loadMatchForEdit(match) {
  matchIdInput.value = match.id;
  leagueInput.value = match.league || "";
  homeTeamInput.value = match.homeTeam || "";
  awayTeamInput.value = match.awayTeam || "";
  dateInput.value = match.date || "";
  timeInput.value = match.time || "";
  homeScoreInput.value = match.homeScore ?? "";
  awayScoreInput.value = match.awayScore ?? "";
  statusInput.value = match.status || "upcoming";
  orderInput.value = match.order ?? "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  matchForm.reset();
  matchIdInput.value = "";
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
