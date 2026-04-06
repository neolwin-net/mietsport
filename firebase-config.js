import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7GIr9HxNnYCxlNxVU0k2_iDqongpf5JI",
  authDomain: "mietsport-219e0.firebaseapp.com",
  projectId: "mietsport-219e0",
  storageBucket: "mietsport-219e0.firebasestorage.app",
  messagingSenderId: "887875051700",
  appId: "1:887875051700:web:1234567890abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
