import { auth } from '../../js/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 1. Mencegat pengguna yang belum login
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Jika tidak ada data sesi login, tendang kembali ke halaman login
    window.location.replace('../login.html');
  } else {
    // Hapus kelas 'hidden' pada body jika user terverifikasi (mencegah kedipan UI)
    document.body.style.display = "block";
  }
});

// 2. Fungsi Logout Global
window.prosesLogout = async function() {
  const konfirmasi = confirm("Apakah Anda yakin ingin keluar dari Dashboard?");
  if (konfirmasi) {
    try {
      await signOut(auth);
      window.location.replace('../login.html');
    } catch (error) {
      console.error("Gagal logout:", error);
      alert("Terjadi kesalahan saat logout.");
    }
  }
};