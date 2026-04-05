import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("matchForm");
const adminMatches = document.getElementById("adminMatches");

let matches = [];

async function loadMatches() {
  try {
    const querySnapshot = await getDocs(collection(db, "matches"));
    matches = [];

    querySnapshot.forEach((docSnap) => {
      matches.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    renderAdminMatches();
  } catch (error) {
    console.error("Error loading matches:", error);
  }
}

function renderAdminMatches() {
  adminMatches.innerHTML = "";

  if (matches.length === 0) {
    adminMatches.innerHTML = "<p>No matches available.</p>";
    return;
  }

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
        <button class="edit-btn" onclick="editMatch('${match.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteMatch('${match.id}')">Delete</button>
      </div>
    `;

    adminMatches.appendChild(card);
  });
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const matchId = document.getElementById("matchId").value;

  const matchData = {
    league: document.getElementById("league").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    homeTeam: document.getElementById("homeTeam").value,
    awayTeam: document.getElementById("awayTeam").value,
    homeScore: Number(document.getElementById("homeScore").value),
    awayScore: Number(document.getElementById("awayScore").value),
    status: document.getElementById("status").value
  };

  try {
    if (matchId) {
      await updateDoc(doc(db, "matches", matchId), matchData);
    } else {
      await addDoc(collection(db, "matches"), matchData);
    }

    form.reset();
    document.getElementById("matchId").value = "";
    loadMatches();
  } catch (error) {
    console.error("Error saving match:", error);
  }
});

window.editMatch = function (id) {
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
};

window.deleteMatch = async function (id) {
  if (!confirm("Delete this match?")) return;

  try {
    await deleteDoc(doc(db, "matches", id));
    loadMatches();
  } catch (error) {
    console.error("Error deleting match:", error);
  }
};

loadMatches();
