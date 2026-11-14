// ==========================================================================
// YAYASAN PADANG WULAN — CENTRAL SETTINGS STORE & MASTER DATA MANAGER
// Mengelola Kategori Donasi, Uraian Program, Kategori Berita, Galeri,
// Profil Lembaga, Rekening Bank, Media Sosial, dan Pengaturan Sistem.
// Terintegrasi dengan Firebase Firestore + LocalStorage fallback.
// ==========================================================================

import { db, doc, getDoc, setDoc } from '../../js/firebase-config.js';

export const STORAGE_KEY = 'ybu_admin_settings_v1';
export const FIRESTORE_COLLECTION = 'settings';
export const FIRESTORE_DOC_ID = 'config';

// 1. DATA PENGATURAN DEFAULT (STANDAR PABRIK)
export const DEFAULT_SETTINGS = {
  kategoriDonasi: [
    "Zakat Mal",
    "Zakat Fitrah",
    "Infaq Pembangunan",
    "Infaq Sosial (Kematian)",
    "Infaq Sosial (Kepemudaan)",
    "Infaq Pendidikan (TPQ)",
    "Infaq Operasional (DKM)",
    "Infaq PHBI",
    "Infaq Majlis Taklim",
    "Infaq dari Sampah",
    "Infaq dari Sarpras",
    "Shodaqoh",
    "Wakaf"
  ],
  uraianProgram: [
    "Belanja Pegawai",
    "Belanja ATK",
    "Belanja Alat Kelistrikan",
    "Belanja Alat Kebersihan",
    "Belanja Konsumsi",
    "Belanja Pakaian/Seragam",
    "Belanja Pemeliharaan",
    "Belanja Jasa/Upah/Sewa",
    "Belanja Honorarium",
    "Belanja Material Bangunan",
    "Belanja Mesin/Elektronik",
    "Belanja Tanah",
    "Belanja Operasional",
    "Belanja Tak Terduga",
    "Belanja Lain-lain",
    "Uang yang diserahkan"
  ],
  kategoriBerita: [
    "Kegiatan",
    "Program",
    "Informasi"
  ],
  kategoriGaleri: [
    "Sosial",
    "Kemanusiaan",
    "Keagamaan"
  ],
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
  rekeningBank: [
    {
      id: "bank-bsi-1",
      namaBank: "Bank Syariah Indonesia (BSI)",
      nomorRekening: "7123456789",
      atasNama: "Yayasan Padang Wulan",
      cabang: "KCP Kuningan",
      utama: true,
      catatan: "Rekening Operasional & Penerimaan Infaq/Shodaqoh"
    },
    {
      id: "bank-mandiri-1",
      namaBank: "Bank Mandiri",
      nomorRekening: "1300098765432",
      atasNama: "Yayasan Bina Umat Padang Wulan",
      cabang: "KC Kuningan",
      utama: false,
      catatan: "Penerimaan Zakat Mal & Zakat Fitrah"
    }
  ],
  qris: {
    imageUrl: "../images/donasi-qris.svg",
    nmId: "ID1020030040050",
    instruksi: "Buka aplikasi m-Banking atau dompet digital (BSI, BCA, Mandiri, GoPay, OVO, ShopeePay, Dana, dll). Pindai kode QRIS dan masukkan nominal donasi. Kirim konfirmasi donasi ke WhatsApp admin kami."
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
    minimalDonasi: 10000,
    emailNotifikasi: "info@ybu-padangwulan.or.id"
  }
};

// 2. HELPER DEEP CLONE & MERGE
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mergeWithDefault(source) {
  const merged = deepClone(DEFAULT_SETTINGS);
  if (!source || typeof source !== 'object') return merged;

  if (Array.isArray(source.kategoriDonasi) && source.kategoriDonasi.length > 0) {
    merged.kategoriDonasi = [...source.kategoriDonasi];
  }
  if (Array.isArray(source.uraianProgram) && source.uraianProgram.length > 0) {
    merged.uraianProgram = [...source.uraianProgram];
  }
  if (Array.isArray(source.kategoriBerita) && source.kategoriBerita.length > 0) {
    merged.kategoriBerita = [...source.kategoriBerita];
  }
  if (Array.isArray(source.kategoriGaleri) && source.kategoriGaleri.length > 0) {
    merged.kategoriGaleri = [...source.kategoriGaleri];
  }
  if (source.profilYayasan && typeof source.profilYayasan === 'object') {
    merged.profilYayasan = { ...merged.profilYayasan, ...source.profilYayasan };
  }
  if (Array.isArray(source.rekeningBank)) {
    merged.rekeningBank = deepClone(source.rekeningBank);
  }
  if (source.qris && typeof source.qris === 'object') {
    merged.qris = { ...merged.qris, ...source.qris };
  }
  if (source.mediaSosial && typeof source.mediaSosial === 'object') {
    merged.mediaSosial = { ...merged.mediaSosial, ...source.mediaSosial };
  }
  if (source.pengaturanSistem && typeof source.pengaturanSistem === 'object') {
    merged.pengaturanSistem = { ...merged.pengaturanSistem, ...source.pengaturanSistem };
  }

  return merged;
}

// 3. SYNCHRONOUS CACHE GETTER
export function getSettingsSync() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return mergeWithDefault(parsed);
    }
  } catch (e) {
    console.warn('Gagal membaca cache pengaturan dari localStorage:', e);
  }
  return deepClone(DEFAULT_SETTINGS);
}

// 4. ASYNCHRONOUS LOAD SETTINGS (DENGAN SYNC FIRESTORE)
export async function loadSettings() {
  const cached = getSettingsSync();

  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const dataFirestore = snap.data();
      const merged = mergeWithDefault(dataFirestore);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } else {
      // Inisialisasi dokumen baru di Firestore jika belum ada
      try {
        await setDoc(docRef, cached, { merge: true });
      } catch (errInit) {
        console.warn('Inisialisasi Firestore settings dilewati:', errInit);
      }
      return cached;
    }
  } catch (err) {
    console.warn('Koneksi Firestore untuk pengaturan offline/terkendala, menggunakan cache lokal:', err);
    return cached;
  }
}

// 5. SIMPAN SEMUA ATAU SEBAGIAN PENGATURAN
export async function saveSettings(partialSettings) {
  const current = getSettingsSync();
  const updated = {
    ...current,
    ...partialSettings
  };

  // Simpan ke LocalStorage seketika untuk responsivitas cepat
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (errLocal) {
    console.error('Gagal menulis ke localStorage:', errLocal);
  }

  // Siarkan event lokal
  try {
    window.dispatchEvent(new CustomEvent('ybu-settings-updated', { detail: updated }));
  } catch (e) {}

  // Simpan ke Firestore
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    await setDoc(docRef, updated, { merge: true });
  } catch (errFirestore) {
    console.warn('Gagal menyinkronkan pengaturan ke Firestore:', errFirestore);
    // Masih sukses di localStorage
  }

  return updated;
}

// 6. HELPER GETTERS KHUSUS KATEGORI
export async function getKategoriDonasi() {
  const s = await loadSettings();
  return s.kategoriDonasi || DEFAULT_SETTINGS.kategoriDonasi;
}

export async function getUraianProgram() {
  const s = await loadSettings();
  return s.uraianProgram || DEFAULT_SETTINGS.uraianProgram;
}

export async function getKategoriBerita() {
  const s = await loadSettings();
  return s.kategoriBerita || DEFAULT_SETTINGS.kategoriBerita;
}

export async function getKategoriGaleri() {
  const s = await loadSettings();
  return s.kategoriGaleri || DEFAULT_SETTINGS.kategoriGaleri;
}

// 7. OPERASI CRUD KATEGORI (TAMBAH, EDIT, HAPUS, RESET)
export async function tambahItemKategori(tipe, namaItem) {
  const bersih = String(namaItem || '').trim();
  if (!bersih) {
    throw new Error('Nama kategori/uraian tidak boleh kosong.');
  }

  const settings = getSettingsSync();
  const list = settings[tipe] ? [...settings[tipe]] : [];

  const duplikat = list.some((item) => item.toLowerCase() === bersih.toLowerCase());
  if (duplikat) {
    throw new Error(`Item "${bersih}" sudah ada dalam daftar.`);
  }

  list.push(bersih);
  await saveSettings({ [tipe]: list });
  return list;
}

export async function editItemKategori(tipe, namaLama, namaBaru) {
  const bersihBaru = String(namaBaru || '').trim();
  const bersihLama = String(namaLama || '').trim();

  if (!bersihBaru) {
    throw new Error('Nama baru tidak boleh kosong.');
  }

  const settings = getSettingsSync();
  const list = settings[tipe] ? [...settings[tipe]] : [];

  const index = list.findIndex((item) => item.toLowerCase() === bersihLama.toLowerCase());
  if (index === -1) {
    throw new Error(`Item "${bersihLama}" tidak ditemukan.`);
  }

  // Jika nama diubah, pastikan tidak bentrok dengan yang lain
  if (bersihBaru.toLowerCase() !== bersihLama.toLowerCase()) {
    const duplikat = list.some((item, i) => i !== index && item.toLowerCase() === bersihBaru.toLowerCase());
    if (duplikat) {
      throw new Error(`Item "${bersihBaru}" sudah terdaftar.`);
    }
  }

  list[index] = bersihBaru;
  await saveSettings({ [tipe]: list });
  return list;
}

export async function hapusItemKategori(tipe, namaItem) {
  const bersih = String(namaItem || '').trim();
  const settings = getSettingsSync();
  const list = settings[tipe] ? [...settings[tipe]] : [];

  const filtered = list.filter((item) => item.toLowerCase() !== bersih.toLowerCase());
  if (filtered.length === list.length) {
    throw new Error(`Item "${bersih}" tidak ditemukan.`);
  }

  if (filtered.length === 0) {
    throw new Error(`Kategori tidak boleh kosong sama sekali. Sisakan minimal 1 kategori.`);
  }

  await saveSettings({ [tipe]: filtered });
  return filtered;
}

export async function resetKategori(tipe) {
  if (!DEFAULT_SETTINGS[tipe]) {
    throw new Error(`Tipe kategori ${tipe} tidak valid.`);
  }
  const defaultList = [...DEFAULT_SETTINGS[tipe]];
  await saveSettings({ [tipe]: defaultList });
  return defaultList;
}

// 8. OPERASI CRUD REKENING BANK DONASI
export async function tambahRekeningBank(rekening) {
  const settings = getSettingsSync();
  const list = settings.rekeningBank ? [...settings.rekeningBank] : [];

  const idBaru = 'bank-' + Date.now();
  const itemBaru = {
    id: idBaru,
    namaBank: String(rekening.namaBank || '').trim(),
    nomorRekening: String(rekening.nomorRekening || '').trim(),
    atasNama: String(rekening.atasNama || '').trim(),
    cabang: String(rekening.cabang || '').trim(),
    catatan: String(rekening.catatan || '').trim(),
    utama: Boolean(rekening.utama)
  };

  if (!itemBaru.namaBank || !itemBaru.nomorRekening || !itemBaru.atasNama) {
    throw new Error('Nama Bank, Nomor Rekening, dan Atas Nama wajib diisi.');
  }

  if (itemBaru.utama || list.length === 0) {
    list.forEach(b => b.utama = false);
    itemBaru.utama = true;
  }

  list.push(itemBaru);
  await saveSettings({ rekeningBank: list });
  return list;
}

export async function editRekeningBank(id, dataBaru) {
  const settings = getSettingsSync();
  const list = settings.rekeningBank ? [...settings.rekeningBank] : [];

  const idx = list.findIndex(b => b.id === id);
  if (idx === -1) {
    throw new Error('Rekening bank tidak ditemukan.');
  }

  if (dataBaru.utama) {
    list.forEach(b => b.utama = false);
  }

  list[idx] = {
    ...list[idx],
    namaBank: String(dataBaru.namaBank || list[idx].namaBank).trim(),
    nomorRekening: String(dataBaru.nomorRekening || list[idx].nomorRekening).trim(),
    atasNama: String(dataBaru.atasNama || list[idx].atasNama).trim(),
    cabang: String(dataBaru.cabang !== undefined ? dataBaru.cabang : list[idx].cabang).trim(),
    catatan: String(dataBaru.catatan !== undefined ? dataBaru.catatan : list[idx].catatan).trim(),
    utama: Boolean(dataBaru.utama)
  };

  // Pastikan tetap ada minimal satu rekening utama jika ada rekening
  if (!list.some(b => b.utama) && list.length > 0) {
    list[0].utama = true;
  }

  await saveSettings({ rekeningBank: list });
  return list;
}

export async function hapusRekeningBank(id) {
  const settings = getSettingsSync();
  let list = settings.rekeningBank ? [...settings.rekeningBank] : [];

  const target = list.find(b => b.id === id);
  if (!target) throw new Error('Rekening bank tidak ditemukan.');

  list = list.filter(b => b.id !== id);

  if (target.utama && list.length > 0) {
    list[0].utama = true;
  }

  await saveSettings({ rekeningBank: list });
  return list;
}

export async function setRekeningUtama(id) {
  const settings = getSettingsSync();
  const list = settings.rekeningBank ? [...settings.rekeningBank] : [];

  list.forEach(b => {
    b.utama = (b.id === id);
  });

  await saveSettings({ rekeningBank: list });
  return list;
}

// 9. HELPER POPULASI ELEMEN <select> SECARA DINAMIS
export function populateSelectOptions(selectEl, items = [], config = {}) {
  if (!selectEl) return;

  const placeholder = config.placeholder || null;
  const includeAllOption = Boolean(config.includeAllOption);
  const allLabel = config.allLabel || 'Semua';
  const selectedValue = config.selectedValue !== undefined ? config.selectedValue : selectEl.value;

  // Hapus semua opsi lama
  selectEl.innerHTML = '';

  if (includeAllOption) {
    const optAll = document.createElement('option');
    optAll.value = 'Semua';
    optAll.textContent = allLabel;
    selectEl.appendChild(optAll);
  } else if (placeholder) {
    const optPlaceholder = document.createElement('option');
    optPlaceholder.value = '';
    optPlaceholder.textContent = placeholder;
    optPlaceholder.disabled = true;
    optPlaceholder.selected = true;
    selectEl.appendChild(optPlaceholder);
  }

  items.forEach((item) => {
    const val = typeof item === 'object' ? (item.value || item.id) : item;
    const txt = typeof item === 'object' ? (item.label || item.nama) : item;

    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = txt;
    selectEl.appendChild(opt);
  });

  if (selectedValue) {
    selectEl.value = selectedValue;
  }
}

// 10. BACKUP & PEMULIHAN SISTEM (EKSPOR & IMPOR JSON)
export function exportSettingsJSON() {
  const settings = getSettingsSync();
  const exportPayload = {
    yayasan: "Yayasan Padang Wulan Cipicung",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    settings: settings
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `pengaturan-yayasan-padang-wulan-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importSettingsJSON(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    throw new Error('File tidak valid. Format harus berupa JSON yang benar.');
  }

  const rawSettings = parsed.settings || parsed;
  if (!rawSettings || typeof rawSettings !== 'object') {
    throw new Error('Format data pengaturan di dalam file tidak dikenali.');
  }

  const validated = mergeWithDefault(rawSettings);
  await saveSettings(validated);
  return validated;
}

export async function resetAllSettings() {
  const clean = deepClone(DEFAULT_SETTINGS);
  await saveSettings(clean);
  return clean;
}
