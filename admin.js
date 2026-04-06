import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ============================
// DOM ELEMENTS
// ============================
const matchForm = document.getElementById("matchForm");
const matchIdInput = document.getElementById("matchId");
const leagueInput = document.getElementById("league");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const homeTeamInput = document.getElementById("homeTeam");
const awayTeamInput = document.getElementById("awayTeam");
const homeScoreInput = document.getElementById("homeScore");
const awayScoreInput = document.getElementById("awayScore");
const statusInput = document.getElementById("status");
const orderInput = document.getElementById("order");
const adminMatches = document.getElementById("adminMatches");
const cancelEditBtn = document.getElementById("cancelEdit");
const exportBtn = document.getElementById("exportBtn");

const matchesRef = collection(db, "matches");

// ============================
// SAVE / UPDATE MATCH
// ============================
matchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = statusInput.value;

  const matchData = {
    league: leagueInput.value.trim(),
    date: dateInput.value,
    time: timeInput.value,
    homeTeam: homeTeamInput.value.trim(),
    awayTeam: awayTeamInput.value.trim(),
    homeScore: status === "Upcoming" ? "" : (homeScoreInput.value === "" ? "" : Number(homeScoreInput.value)),
    awayScore: status === "Upcoming" ? "" : (awayScoreInput.value === "" ? "" : Number(awayScoreInput.value)),
    status: status,
    order: Number(orderInput.value)
  };

  try {
    if (matchIdInput.value) {
      const matchDoc = doc(db, "matches", matchIdInput.value);
      await updateDoc(matchDoc, matchData);
      alert("Match updated successfully!");
    } else {
      await addDoc(matchesRef, matchData);
      alert("Match added successfully!");
    }

    resetForm();
  } catch (error) {
    console.error("Error saving match:", error);
    alert("Error saving match! Open F12 > Console.");
  }
});

// ============================
// CANCEL EDIT
// ============================
cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

// ============================
// AUTO CLEAR SCORE IF UPCOMING
// ============================
statusInput.addEventListener("change", () => {
  if (statusInput.value === "Upcoming") {
    homeScoreInput.value = "";
    awayScoreInput.value = "";
  }
});

// ============================
// REAL-TIME MATCH LIST
// ============================
onSnapshot(matchesRef, (snapshot) => {
  const matches = [];

  snapshot.forEach((docSnap) => {
    matches.push({ id: docSnap.id, ...docSnap.data() });
  });

  // Sort in JavaScript
  matches.sort((a, b) => {
    const leagueCompare = (a.league || "").localeCompare(b.league || "");
    if (leagueCompare !== 0) return leagueCompare;
    return Number(a.order || 0) - Number(b.order || 0);
  });

  renderAdminMatches(matches);
}, (error) => {
  console.error("Firestore read error:", error);
});

// ============================
// RENDER MATCHES
// ============================
function renderAdminMatches(matches) {
  adminMatches.innerHTML = "";

  if (matches.length === 0) {
    adminMatches.innerHTML = `<div class="no-match">No matches added yet.</div>`;
    return;
  }

  const grouped = groupByLeague(matches);

  for (const league in grouped) {
    const leagueBlock = document.createElement("div");
    leagueBlock.className = "league-block";

    leagueBlock.innerHTML = `<h3 class="league-title">${league}</h3>`;

    grouped[league].forEach((match) => {
      const card = document.createElement("div");
      card.className = "score-card";

      card.innerHTML = `
        <div class="score-header">
          <span class="match-date">${match.date}</span>
          <span class="match-status">${match.status === "Upcoming" ? "Upcoming" : "Played"}</span>
        </div>

        <div class="teams">
          <div class="team-row">
            <span>${match.homeTeam}</span>
            <strong>${match.status === "Upcoming" ? "" : (match.homeScore === "" ? "-" : match.homeScore)}</strong>
          </div>
          <div class="team-row">
            <span>${match.awayTeam}</span>
            <strong>${match.status === "Upcoming" ? "" : (match.awayScore === "" ? "-" : match.awayScore)}</strong>
          </div>
        </div>

        <div class="match-meta">
          <small>🕒 ${match.time}</small><br>
          <small>🔢 Order: ${match.order}</small>
        </div>

        <div class="card-actions">
          <button class="edit-btn" data-id="${match.id}">Edit</button>
          <button class="delete-btn" data-id="${match.id}">Delete</button>
        </div>
      `;

      leagueBlock.appendChild(card);
    });

    adminMatches.appendChild(leagueBlock);
  }

  attachButtons(matches);
}

// ============================
// EDIT + DELETE BUTTONS
// ============================
function attachButtons(matches) {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const match = matches.find((m) => m.id === id);
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

// ============================
// LOAD MATCH INTO FORM
// ============================
function loadMatchForEdit(match) {
  matchIdInput.value = match.id;
  leagueInput.value = match.league || "";
  dateInput.value = match.date || "";
  timeInput.value = match.time || "";
  homeTeamInput.value = match.homeTeam || "";
  awayTeamInput.value = match.awayTeam || "";
  homeScoreInput.value = match.homeScore ?? "";
  awayScoreInput.value = match.awayScore ?? "";
  statusInput.value = match.status || "Upcoming";
  orderInput.value = match.order ?? "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================
// RESET FORM
// ============================
function resetForm() {
  matchForm.reset();
  matchIdInput.value = "";
  statusInput.value = "Upcoming";
  homeScoreInput.value = "";
  awayScoreInput.value = "";
}

// ============================
// GROUP BY LEAGUE
// ============================
function groupByLeague(matches) {
  return matches.reduce((groups, match) => {
    const league = match.league || "Other League";

    if (!groups[league]) {
      groups[league] = [];
    }

    groups[league].push(match);

    groups[league].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    return groups;
  }, {});
}

// ============================
// EXPORT JSON
// ============================
exportBtn.addEventListener("click", async () => {
  try {
    const snapshot = await getDocs(matchesRef);
    const allMatches = [];

    snapshot.forEach((docSnap) => {
      allMatches.push({ id: docSnap.id, ...docSnap.data() });
    });

    const blob = new Blob([JSON.stringify(allMatches, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "football-matches.json";
    a.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export error:", error);
    alert("Failed to export JSON.");
  }
});
