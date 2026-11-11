import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, initializeFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// === TAMBAHAN BARU: Import Firebase Storage ===
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAAQK1Ne1tGHgpbaPr74Ow_NNaYdJo12wY",
  authDomain: "yayasan-padang-wulan.firebaseapp.com",
  projectId: "yayasan-padang-wulan",
  storageBucket: "yayasan-padang-wulan.firebasestorage.app",
  messagingSenderId: "141849378609",
  appId: "1:141849378609:web:6d345b9d33efb12419a210",
  measurementId: "G-H23MVN8DPC"
};

const app = initializeApp(firebaseConfig);
let db;
try {
  // Deteksi otomatis long-polling agar koneksi Firestore stabil di browser mobile, Safari, & jaringan proxy
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    useFetchStreams: false,
  });
} catch (err) {
  db = getFirestore(app);
}
const auth = getAuth(app);
const storage = getStorage(app); // Inisialisasi Storage

// Export semua modul
export { db, auth, storage, firebaseConfig, ref, uploadBytesResumable, getDownloadURL, deleteObject, collection, addDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc };