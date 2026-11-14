import { auth } from '../../js/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Ambil sesi login dari localStorage
export function getStoredSession() {
  try {
    const raw = localStorage.getItem('ybu_auth_session');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Gagal membaca sesi lokal:', e);
  }
  return null;
}

export function isMasterAdmin() {
  const session = getStoredSession();
  if (!session) return false;
  return session.role === 'master' || (session.email && session.email.toLowerCase() === 'master@admin1');
}

// Proteksi Halaman & Visibilitas Role
function applyRoleProtection(userEmail = '') {
  let session = getStoredSession();
  if (!session && userEmail) {
    const isMaster = userEmail.toLowerCase() === 'master@admin1';
    session = {
      email: userEmail,
      role: isMaster ? 'master' : 'admin',
      displayName: isMaster ? 'Master Administrator' : 'Staff Admin'
    };
    localStorage.setItem('ybu_auth_session', JSON.stringify(session));
  }

  const path = window.location.pathname.toLowerCase();
  const isPengaturanPage = path.endsWith('pengaturan.html');
  const isMaster = isMasterAdmin();

  // 1. Proteksi Halaman Pengaturan: Hanya untuk Master Admin
  if (isPengaturanPage && !isMaster) {
    alert('Akses Ditolak: Halaman Pengaturan hanya dapat diakses oleh Master Admin (master@admin1). Anda akan dialihkan ke Ringkasan Utama.');
    window.location.replace('index.html');
    return;
  }

  // 2. Kontrol Visibilitas Menu Pengaturan di Sidebar
  const linksPengaturan = document.querySelectorAll('a[href*="pengaturan.html"], [data-role="master"]');
  linksPengaturan.forEach(link => {
    if (!isMaster) {
      link.style.display = 'none';
      link.setAttribute('aria-hidden', 'true');
    } else {
      link.style.display = 'flex';
      link.removeAttribute('aria-hidden');
      if (!link.querySelector('.badge-master-tag')) {
        const badge = document.createElement('span');
        badge.className = 'badge-master-tag';
        badge.textContent = 'Master';
        badge.style.cssText = 'background: rgba(245, 158, 11, 0.22); color: #f59e0b; font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 9999px; margin-left: auto; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(245, 158, 11, 0.35);';
        link.appendChild(badge);
      }
    }
  });

  // Tampilkan body halaman setelah verifikasi selesai
  document.body.style.display = "block";
}

// 1. Mencegat pengguna yang belum login
const session = getStoredSession();
if (session) {
  // Sesi lokal tersedia (misal master@admin1)
  applyRoleProtection(session.email);
} else {
  // Cek sesi Firebase Auth
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.replace('../login.html');
    } else {
      applyRoleProtection(user.email);
    }
  });
}

// 2. Fungsi Logout Global
window.prosesLogout = async function() {
  const konfirmasi = confirm("Apakah Anda yakin ingin keluar dari Dashboard?");
  if (konfirmasi) {
    try {
      localStorage.removeItem('ybu_auth_session');
      try {
        await signOut(auth);
      } catch (errAuth) {}
      window.location.replace('../login.html');
    } catch (error) {
      console.error("Gagal logout:", error);
      alert("Terjadi kesalahan saat logout.");
    }
  }
};
