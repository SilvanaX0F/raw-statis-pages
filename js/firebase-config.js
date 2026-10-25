// Import fungsi Firebase SDK versi modular via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Konfigurasi Firebase dari proyek Anda
const firebaseConfig = {
  apiKey: "AIzaSyAAQK1Ne1tGHgpbaPr74Ow_NNaYdJo12wY",
  authDomain: "yayasan-padang-wulan.firebaseapp.com",
  projectId: "yayasan-padang-wulan",
  storageBucket: "yayasan-padang-wulan.firebasestorage.app",
  messagingSenderId: "141849378609",
  appId: "1:141849378609:web:6d345b9d33efb12419a210",
  measurementId: "G-H23MVN8DPC"
};

// Inisialisasi Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, query, orderBy, serverTimestamp };