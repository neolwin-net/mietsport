import { db } from './firebase-config.js';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

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
const adminMatchesDiv = document.getElementById("adminMatches");
const exportBtn = document.getElementById("exportBtn");

const matchesCollection = collection(db, "matches");

// Real-time render
onSnapshot(matchesCollection, snapshot => {
  adminMatchesDiv.innerHTML = "";
  snapshot.forEach(docSnap => {
    const match = docSnap.data();
    const id = docSnap.id;
    const div = document.createElement("div");
    div.classList.add("match-card");
    div.innerHTML = `
      <p><strong>${match.league}</strong> - ${match.date} ${match.time}</p>
      <p>${match.homeTeam} ${match.homeScore ?? ""} : ${match.awayScore ?? ""} ${match.awayTeam}</p>
      <p>Status: ${match.status}</p>
      <button class="edit-btn" data-id="${id}">Edit</button>
      <button class="delete-btn" data-id="${id}">Delete</button>
    `;
    adminMatchesDiv.appendChild(div);
  });

  // Edit
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.target.dataset.id;
      const docSnap = await getDoc(doc(db, "matches", id));
      const match = docSnap.data();
      matchIdInput.value = id;
      leagueInput.value = match.league;
      dateInput.value = match.date;
      timeInput.value = match.time;
      homeTeamInput.value = match.homeTeam;
      awayTeamInput.value = match.awayTeam;
      homeScoreInput.value = match.homeScore ?? "";
      awayScoreInput.value = match.awayScore ?? "";
      statusInput.value = match.status;
    });
  });

  // Delete
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const id = e.target.dataset.id;
      if (confirm("Delete this match?")) {
        await deleteDoc(doc(db, "matches", id));
      }
    });
  });
});

// Add / Update
matchForm.addEventListener("submit", async e => {
  e.preventDefault();
  const matchData = {
    league: leagueInput.value,
    date: dateInput.value,
    time: timeInput.value,
    homeTeam: homeTeamInput.value,
    awayTeam: awayTeamInput.value,
    homeScore: homeScoreInput.value ? parseInt(homeScoreInput.value) : null,
    awayScore: awayScoreInput.value ? parseInt(awayScoreInput.value) : null,
    status: statusInput.value
  };

  const id = matchIdInput.value;
  if (id) {
    await updateDoc(doc(db, "matches", id), matchData);
  } else {
    await addDoc(matchesCollection, matchData);
  }

  matchForm.reset();
  matchIdInput.value = "";
});

// Export JSON
exportBtn.addEventListener("click", async () => {
  const snapshot = await getDocs(matchesCollection);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "football_matches.json";
  a.click();
  URL.revokeObjectURL(url);
});
