// ==========================================================================
// YAYASAN PADANG WULAN — CLIENT SITE INTEGRATION MODULE
// Menghubungkan Pengaturan Dashboard (Profil Lembaga, Rekening & QRIS,
// Pengumuman Marquee, Maintenance Mode, dan Sosmed) secara langsung
// dan otomatis ke halaman utama website (index.html, donasi.html, kontak.html).
// ==========================================================================

import { db, doc, getDoc } from './firebase-config.js';

export const STORAGE_KEY = 'ybu_admin_settings_v1';
export const FIRESTORE_COLLECTION = 'settings';
export const FIRESTORE_DOC_ID = 'config';

export const DEFAULT_SITE_SETTINGS = {
  profilYayasan: {
    nama: "Yayasan Bina Umat Padang Wulan Cipicung",
    singkatan: "YBU Padang Wulan",
    slogan: "Menebar Kebaikan, Memberdayakan Umat Melalui Aksi Nyata",
    deskripsiSingkat: "Yayasan Bina Umat Padang Wulan Cipicung — berkedudukan di Kabupaten Pangandaran, berfokus pada bidang sosial, kemanusiaan, dan keagamaan untuk membangun umat yang mandiri, cerdas, dan sejahtera.",
    skKemenkumham: "AHU-0012345.AH.01.04.Tahun 2020",
    alamat: "Dusun Cipicung RT. 015 RW. 008, Karangsari, Padaherang, Kab. Pangandaran, Jawa Barat",
    telepon: "+62 823-1234-5153",
    whatsapp: "082312345153",
    email: "info@ybu-padangwulan.or.id",
    jamOperasional: "Senin - Sabtu: 08.00 - 16.00 WIB",
    mapsUrl: "https://maps.google.com"
  },
  rekeningBank: [],
  qris: {
    imageUrl: "",
    nmId: "",
    instruksi: ""
  },
  mediaSosial: {
    facebook: "https://facebook.com/yayasanpadangwulan",
    instagram: "https://instagram.com/yayasanpadangwulan",
    youtube: "https://youtube.com/@yayasanpadangwulan",
    tiktok: "https://tiktok.com/@yayasanpadangwulan"
  },
  pengaturanSistem: {
    maintenanceMode: false,
    pesanMaintenance: "Website sedang dalam peningkatan sistem berkala. Mohon maaf atas ketidaknyamanan ini dan silakan kembali beberapa saat lagi.",
    bannerPengumuman: "📢 Selamat datang di website resmi Yayasan Bina Umat Padang Wulan Cipicung ✨ Silakan hubungi kontak kami melalui halaman Kontak untuk informasi lebih lanjut.",
    tampilkanBanner: true,
    minimalDonasi: 10000
  }
};

// 1. HELPER GET SETTINGS (LOKAL CACHE DULU, LALU SYNC FIRESTORE)
export function getLocalSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleanedBanks = Array.isArray(parsed.rekeningBank)
        ? parsed.rekeningBank.filter(b => {
            if (!b || !b.nomorRekening) return false;
            const no = String(b.nomorRekening).trim();
            return no !== '7123456789' && no !== '1300098765432';
          })
        : [];

      let qrisObj = { ...DEFAULT_SITE_SETTINGS.qris, ...(parsed.qris || {}) };
      if (qrisObj.nmId === 'ID1020030040050' || (qrisObj.imageUrl && qrisObj.imageUrl.includes('donasi-qris.svg'))) {
        qrisObj.imageUrl = '';
        qrisObj.nmId = '';
      }

      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        profilYayasan: { ...DEFAULT_SITE_SETTINGS.profilYayasan, ...(parsed.profilYayasan || {}) },
        mediaSosial: { ...DEFAULT_SITE_SETTINGS.mediaSosial, ...(parsed.mediaSosial || {}) },
        pengaturanSistem: { ...DEFAULT_SITE_SETTINGS.pengaturanSistem, ...(parsed.pengaturanSistem || {}) },
        qris: qrisObj,
        rekeningBank: cleanedBanks
      };
    }
  } catch (e) {
    console.warn('Gagal membaca cache lokal settings:', e);
  }
  return DEFAULT_SITE_SETTINGS;
}

// 2. APLIKASIKAN KE HALAMAN BERANDA (index.html)
function terapkanKeBeranda(settings) {
  const sis = settings.pengaturanSistem || {};
  const p = settings.profilYayasan || {};
  const s = settings.mediaSosial || {};

  // A. Banner Pengumuman / Marquee
  const marqueeWrap = document.querySelector('.home-marquee-wrap');
  if (marqueeWrap) {
    if (sis.tampilkanBanner && sis.bannerPengumuman) {
      marqueeWrap.style.display = 'block';
      const textDiv = marqueeWrap.querySelector('.home-marquee-text, marquee, div > div');
      if (textDiv) {
        textDiv.textContent = sis.bannerPengumuman;
        if (typeof textDiv.start === 'function') {
          try { textDiv.start(); } catch (_) {}
        }
      }
    } else {
      marqueeWrap.style.display = 'none';
    }
  }

  // B. Maintenance Banner Alert
  let maintAlert = document.getElementById('site-maintenance-banner');
  if (sis.maintenanceMode) {
    if (!maintAlert) {
      maintAlert = document.createElement('div');
      maintAlert.id = 'site-maintenance-banner';
      maintAlert.style.cssText = 'background: #dc2626; color: #ffffff; padding: 0.65rem 1rem; text-align: center; font-size: 0.85rem; font-weight: 700; position: sticky; top: 0; z-index: 10000; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
      document.body.prepend(maintAlert);
    }
    maintAlert.innerHTML = `⚠️ <span>Mode Pemeliharaan: ${sis.pesanMaintenance || 'Website sedang dalam peningkatan sistem.'}</span>`;
  } else if (maintAlert) {
    maintAlert.remove();
  }

  // C. Update Footer & Identitas Lembaga
  terapkanFooterDanKontak(settings);
}

// 3. APLIKASIKAN KE HALAMAN DONASI (donasi.html)
function terapkanKeDonasi(settings) {
  const rekList = Array.isArray(settings.rekeningBank) ? settings.rekeningBank : [];
  const qris = settings.qris || {};
  const p = settings.profilYayasan || {};

  // A. Render Daftar Rekening Bank
  const listEl = document.getElementById('donasi-rekening-list') || document.querySelector('.donation-bank-list');
  const rekNote = document.getElementById('donasi-rekening-note') || (listEl ? listEl.parentElement.querySelector('p.text-muted') : null);

  if (listEl) {
    if (rekList.length === 0) {
      if (rekNote) rekNote.style.display = 'none';
      listEl.innerHTML = `
        <div class="donation-empty-state" style="padding: 1.65rem 1.25rem; border-radius: 12px; background: rgba(15, 36, 56, 0.03); border: 1.5px dashed rgba(15, 36, 56, 0.16); text-align: center;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(15, 36, 56, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; color: var(--dark);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 22px; height: 22px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <h4 style="font-size: 0.98rem; font-weight: 700; color: #0f172a; margin-bottom: 0.35rem;">Rekening Donasi Sedang Disiapkan</h4>
          <p class="text-muted" style="font-size: var(--fs-xs); line-height: 1.5; margin: 0 0 0.85rem;">
            Nomor rekening resmi yayasan sedang dalam tahap penyesuaian oleh pengurus. Untuk informasi dan konfirmasi penyaluran donasi saat ini, silakan hubungi kami secara langsung.
          </p>
          <a href="kontak.html" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; padding: 0.45rem 1rem;">Hubungi Pengurus Yayasan</a>
        </div>
      `;
    } else {
      if (rekNote) rekNote.style.display = 'block';
      listEl.innerHTML = rekList.map((b) => {
        const isUtama = Boolean(b.utama);
        return `
          <div class="donation-bank" style="padding: 1.15rem; border-radius: 10px; border: 1.5px solid ${isUtama ? '#059669' : '#e2e8f0'}; background: ${isUtama ? '#f0fdf4' : '#ffffff'}; position: relative; margin-bottom: 0.75rem;">
            ${isUtama ? '<span style="position: absolute; top: -10px; right: 12px; background: #059669; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">Rekening Utama</span>' : ''}
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;">
              <div>
                <div class="donation-bank__name" style="font-weight: 800; font-size: 1.05rem; color: #0f172a;">${escapeHtml(b.namaBank)}</div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin: 0.35rem 0;">
                  <span class="donation-bank__number" style="font-family: monospace; font-size: 1.25rem; font-weight: 800; letter-spacing: 0.04em; color: #059669;">${escapeHtml(b.nomorRekening)}</span>
                  <button type="button" class="btn-salin-rekening" data-no="${escapeHtml(b.nomorRekening)}" style="background: #e2e8f0; border: none; border-radius: 6px; padding: 3px 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">Salin</button>
                </div>
                <div class="text-muted" style="font-size: var(--fs-sm);">
                  Atas Nama: <strong style="color: #0f172a;">${escapeHtml(b.atasNama)}</strong>
                  ${b.cabang ? ` • <span style="font-size: 0.8rem;">${escapeHtml(b.cabang)}</span>` : ''}
                </div>
                ${b.catatan ? `<div style="font-size: 0.76rem; color: #059669; margin-top: 0.35rem; font-weight: 600;">${escapeHtml(b.catatan)}</div>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Pasang event listener tombol salin
      listEl.querySelectorAll('.btn-salin-rekening').forEach(btn => {
        btn.addEventListener('click', function() {
          const no = this.getAttribute('data-no');
          navigator.clipboard.writeText(no).then(() => {
            const oriText = this.textContent;
            this.textContent = 'Tersalin!';
            this.style.background = '#059669';
            this.style.color = '#ffffff';
            setTimeout(() => {
              this.textContent = oriText;
              this.style.background = '#e2e8f0';
              this.style.color = 'inherit';
            }, 2000);
          });
        });
      });
    }
  }

  // B. Render QRIS Section
  const qrisBox = document.getElementById('donasi-qris-box');
  const hasValidQris = qris && qris.imageUrl && qris.imageUrl.trim() !== '' && !qris.imageUrl.includes('placeholder') && !qris.imageUrl.includes('donasi-qris.svg');

  if (qrisBox) {
    if (!hasValidQris) {
      qrisBox.innerHTML = `
        <div class="qris-empty-state" style="padding: 1.65rem 1.25rem; border-radius: 12px; background: rgba(15, 36, 56, 0.03); border: 1.5px dashed rgba(15, 36, 56, 0.16); text-align: center;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(15, 36, 56, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; color: var(--dark);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 22px; height: 22px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/></svg>
          </div>
          <h4 style="font-size: 0.98rem; font-weight: 700; color: #0f172a; margin-bottom: 0.35rem;">QRIS Sedang Disiapkan</h4>
          <p class="text-muted" style="font-size: var(--fs-xs); line-height: 1.5; margin: 0;">
            Metode pembayaran digital QRIS yayasan saat ini sedang dalam proses registrasi merchant resmi oleh pengurus.
          </p>
        </div>
      `;
    } else {
      qrisBox.innerHTML = `
        <div class="img-frame img-frame--sm" style="max-width: 240px; margin-inline: auto;">
          <img id="donasi-qris-img" src="${escapeHtml(qris.imageUrl)}" alt="Kode QRIS Donasi" width="280" height="280" loading="lazy" style="width: 100%; height: auto; border-radius: 8px;">
        </div>
        ${qris.nmId ? `<p id="donasi-qris-nmid" class="text-muted" style="font-size: var(--fs-xs); font-weight: 700; margin-top: 0.5rem; color: var(--text);">NMID: ${escapeHtml(qris.nmId)}</p>` : ''}
        <p id="donasi-qris-instruksi" class="text-muted" style="font-size: var(--fs-xs); margin-top: 0.35rem;">${escapeHtml(qris.instruksi || 'Pindai kode QRIS resmi di atas menggunakan aplikasi mobile banking atau dompet digital Anda.')}</p>
      `;
    }
  } else {
    // Fallback jika markup kartu lama masih ada
    const qrisImg = document.getElementById('donasi-qris-img');
    if (qrisImg) {
      if (hasValidQris) {
        qrisImg.src = qris.imageUrl;
      }
    }
  }

  // C. Update WhatsApp Konfirmasi
  const waBtn = document.querySelector('.donation-confirm-card a[href*="kontak.html"]');
  if (waBtn && p.whatsapp) {
    const waNomor = p.whatsapp.replace(/[^0-9]/g, '');
    const waClean = waNomor.startsWith('0') ? '62' + waNomor.slice(1) : waNomor;
    const pesanWA = encodeURIComponent(`Halo Admin ${p.nama || 'Yayasan'},\nSaya ingin melakukan konfirmasi donasi yang telah saya kirimkan. Mohon informasinya.`);
    waBtn.href = `https://wa.me/${waClean}?text=${pesanWA}`;
    waBtn.target = '_blank';
    waBtn.rel = 'noopener noreferrer';
    waBtn.textContent = 'Konfirmasi via WhatsApp';
  }

  terapkanFooterDanKontak(settings);
}

// 4. APLIKASIKAN FOOTER, ALAMAT, & KONTAK SECARA UMUM
function terapkanFooterDanKontak(settings) {
  const p = settings.profilYayasan || {};
  const s = settings.mediaSosial || {};

  // Footer Brand Text
  const footerBrandP = document.querySelector('.footer__brand p');
  if (footerBrandP && p.deskripsiSingkat) {
    footerBrandP.textContent = p.deskripsiSingkat;
  }

  // Footer Alamat
  const footerItems = document.querySelectorAll('.footer__contact-item');
  footerItems.forEach(item => {
    const text = item.textContent || '';
    if (text.includes('Alamat') && p.alamat) {
      const span = item.querySelector('span');
      if (span) {
        span.innerHTML = `Alamat Lengkap :<br>${escapeHtml(p.alamat)}`;
      }
    } else if (item.querySelector('a[href*="wa.me"]') && p.whatsapp) {
      const waLink = item.querySelector('a');
      const waNomor = p.whatsapp.replace(/[^0-9]/g, '');
      const waClean = waNomor.startsWith('0') ? '62' + waNomor.slice(1) : waNomor;
      waLink.href = `https://wa.me/${waClean}`;
      waLink.textContent = p.telepon || `+62 ${p.whatsapp}`;
    } else if (item.querySelector('a[href*="mailto:"]') && p.email) {
      const mailLink = item.querySelector('a');
      mailLink.href = `mailto:${p.email}`;
      mailLink.textContent = p.email;
    }
  });

  // Footer Social Media Links
  const fbLink = document.querySelector('.footer__social a[aria-label*="Facebook"]');
  if (fbLink && s.facebook) fbLink.href = s.facebook;

  const ttLink = document.querySelector('.footer__social a[aria-label*="TikTok"]');
  if (ttLink && s.tiktok) ttLink.href = s.tiktok;

  const igLink = document.querySelector('.footer__social a[aria-label*="Instagram"]');
  if (igLink && s.instagram) igLink.href = s.instagram;

  const ytLink = document.querySelector('.footer__social a[aria-label*="YouTube"]');
  if (ytLink && s.youtube) ytLink.href = s.youtube;

  // Footer Copyright
  const footerCopy = document.querySelector('.footer__bottom p');
  if (footerCopy && p.nama) {
    footerCopy.innerHTML = `&copy; ${new Date().getFullYear()} ${escapeHtml(p.nama)}. Semua hak cipta dilindungi.`;
  }

  // Halaman Kontak (kontak.html) info cards
  const contactCards = document.querySelectorAll('.contact-info-item');
  contactCards.forEach(card => {
    const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
    const pEl = card.querySelector('p');
    if (!pEl) return;
    if (title.includes('alamat') && p.alamat) {
      pEl.textContent = p.alamat;
    } else if (title.includes('whatsapp') && p.whatsapp) {
      pEl.textContent = p.telepon || `+62 ${p.whatsapp}`;
    } else if (title.includes('email') && p.email) {
      pEl.textContent = p.email;
    }
  });
}

// 5. HELPER ESCAPE HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 6. MAIN CONTROLLER
export async function initSiteSettings() {
  // 1. Terapkan seketika dari cache lokal untuk mencegah lag / layout shift
  const settings = getLocalSettings();
  const currentPath = window.location.pathname.toLowerCase();

  if (currentPath.endsWith('donasi.html')) {
    terapkanKeDonasi(settings);
  } else {
    terapkanKeBeranda(settings);
  }

  // 2. Sync latar belakang dari Firestore
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const dataFirestore = snap.data();
      const updated = {
        ...DEFAULT_SITE_SETTINGS,
        ...dataFirestore
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      if (currentPath.endsWith('donasi.html')) {
        terapkanKeDonasi(updated);
      } else {
        terapkanKeBeranda(updated);
      }
    }
  } catch (err) {
    console.warn('Latar belakang sync site settings:', err);
  }

  // 3. Dengarkan event lokal jika dashboard baru saja mengupdate settings
  window.addEventListener('ybu-settings-updated', (e) => {
    if (e.detail) {
      if (currentPath.endsWith('donasi.html')) {
        terapkanKeDonasi(e.detail);
      } else {
        terapkanKeBeranda(e.detail);
      }
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      const fresh = getLocalSettings();
      if (currentPath.endsWith('donasi.html')) {
        terapkanKeDonasi(fresh);
      } else {
        terapkanKeBeranda(fresh);
      }
    }
  });
}

// Jalankan otomatis saat DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteSettings);
} else {
  initSiteSettings();
}
