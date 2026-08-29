# Website Resmi [NAMA YAYASAN]

Website profil statis untuk yayasan — dibangun dengan HTML, CSS, dan JavaScript murni (tanpa framework, tanpa backend, tanpa database). Siap di-deploy ke hosting static seperti **Cloudflare Pages** atau **GitHub Pages**.

## Struktur Folder

```
/
├── index.html          Beranda
├── tentang.html         Profil, sejarah, visi & misi
├── organisasi.html      Struktur organisasi & tim
├── program.html         Daftar program
├── berita.html          Berita & kegiatan
├── galeri.html          Galeri foto (filter + lightbox)
├── publikasi.html       Dokumen publik (unduhan)
├── kontak.html           Info kontak, peta, form
├── donasi.html           Info donasi ("Dukung Kami")
├── css/style.css        Satu file stylesheet utama (design tokens di :root)
├── js/main.js            Semua interaksi (menu, filter, lightbox, dll)
├── images/               Gambar (logo, hero, team/, programs/, news/, gallery/)
└── documents/             Dokumen PDF yang bisa diunduh publik
```

Semua gambar saat ini adalah **placeholder SVG** yang dibuat otomatis (bukan foto asli), dan dokumen di `/documents/` adalah **PDF placeholder**. Keduanya wajib diganti sebelum situs digunakan secara publik.

## 1. Menjalankan Secara Lokal

Karena situs ini murni file statis, cukup buka `index.html` langsung di browser, atau — lebih disarankan — jalankan local server sederhana agar path relatif (gambar, link antar halaman) berjalan normal:

```bash
# Dengan Python (biasanya sudah terpasang)
cd yayasan-website
python3 -m http.server 8000
# lalu buka http://localhost:8000 di browser

# Atau dengan Node.js
npx serve .
```

## 2. Mengganti Logo

1. Siapkan logo dalam format SVG atau PNG (disarankan latar transparan).
2. Ganti file `images/logo.svg` (logo untuk navbar, warna gelap) dan `images/logo-white.svg` (versi putih untuk footer).
3. Jika menggunakan PNG, ubah referensinya di setiap file HTML — cari baris:
   ```html
   <img src="images/logo.svg" alt="Logo [NAMA YAYASAN]" width="160" height="40">
   ```
   lalu sesuaikan `src`, `width`, dan `height`.
4. Favicon memakai file yang sama (`<link rel="icon" href="images/logo.svg" ...>` di `<head>` setiap halaman) — ganti bila diperlukan.

## 3. Mengganti Warna

Semua warna diatur lewat CSS variables di bagian atas `css/style.css` (`:root`). Ubah nilainya, dan seluruh situs otomatis menyesuaikan:

```css
:root {
  --primary: #1f7a4d;        /* hijau utama */
  --primary-dark: #145c38;
  --primary-light: #e3f2e8;
  --secondary: #1b3a5c;      /* navy pendukung */
  --dark: #0f2438;           /* footer / area gelap */
  --light: #f6f8f7;          /* background section abu-abu */
  --text: #202b28;
  --muted: #5c6b66;
}
```

## 4. Mengganti Konten Teks

Semua teks placeholder ditulis dalam tanda kurung siku, contoh: `[NAMA YAYASAN]`, `[DESKRIPSI YAYASAN]`, `[VISI YAYASAN]`, `[Nama Ketua]`, `[ALAMAT]`, dsb.

Cara tercepat mengganti semua sekaligus:

1. Buka folder project di code editor (VS Code, Sublime, dll).
2. Gunakan fitur **Find & Replace in Files** (`Ctrl/Cmd + Shift + F`).
3. Cari misalnya `[NAMA YAYASAN]`, ganti dengan nama resmi yayasan Anda, lalu **Replace All**.
4. Ulangi untuk setiap placeholder lain (`[DESKRIPSI YAYASAN]`, `[ALAMAT]`, `[EMAIL]`, nomor telepon/WhatsApp, dst).

Placeholder nomor rekening donasi di `donasi.html` diberi komentar HTML khusus — **wajib diganti dengan data resmi setelah disetujui pengurus yayasan**, jangan gunakan rekening asli sebelum diverifikasi.

## 5. Menambahkan Berita Baru

Buka `berita.html`, cari salah satu blok `<article class="card news-card">` di dalam `<div class="grid grid-3">`, lalu **duplikasi** blok tersebut dan ubah isinya:

```html
<article class="card news-card" data-reveal>
  <div class="news-card__media">
    <span class="news-card__category">Kategori</span>
    <img src="images/news/nama-file.jpg" alt="Deskripsi foto" width="480" height="320" loading="lazy">
  </div>
  <div class="news-card__body">
    <span class="news-card__date">Tanggal</span>
    <h3>Judul Berita</h3>
    <p>Ringkasan singkat berita.</p>
    <a href="#" class="link-arrow">Baca Selengkapnya →</a>
  </div>
</article>
```

Letakkan berita terbaru di paling atas grid. Untuk homepage (`index.html`), cukup tampilkan 3 berita terbaru saja pada section "Kegiatan & Berita".

> Catatan: karena situs ini statis, setiap berita adalah satu blok HTML (bukan halaman detail terpisah). Jika nanti dibutuhkan halaman detail per berita, buat file baru seperti `berita-nama-artikel.html` mengikuti struktur `page-banner` + konten yang sama seperti halaman lain, lalu arahkan link "Baca Selengkapnya" ke file tersebut.

## 6. Menambahkan Anggota / Tim

Buka `organisasi.html` (atau bagian tim di `index.html`), cari blok `.team-card`, lalu duplikasi:

```html
<div class="card team-card" data-reveal>
  <div class="img-frame img-frame--sm team-card__photo">
    <img src="images/team/nama-file.jpg" alt="Foto Nama Anggota" width="200" height="220" loading="lazy">
  </div>
  <h3>Nama Anggota</h3>
  <p class="team-card__role">Jabatan</p>
  <p>Deskripsi singkat tugas/peran.</p>
</div>
```

Simpan foto anggota baru ke `images/team/`.

## 7. Menambahkan Dokumen Publik

1. Simpan file PDF ke folder `/documents/`.
2. Buka `publikasi.html`, duplikasi salah satu blok `.doc-item`:

```html
<div class="card doc-item" data-reveal>
  <div class="doc-item__icon"><!-- ikon PDF --></div>
  <div class="doc-item__info">
    <h3>Judul Dokumen</h3>
    <p class="doc-item__meta">PDF · Ukuran file</p>
  </div>
  <a class="btn btn-secondary btn-sm doc-item__action" href="documents/nama-file.pdf" download>Unduh</a>
</div>
```

3. Pastikan nama file di atribut `href` sama persis dengan nama file di folder `/documents/`.

## 8. Menambahkan / Mengubah Program

Buka `program.html`, duplikasi blok `.program-card--full` di dalam `.grid.grid-2`, lalu sesuaikan foto, nama, deskripsi, tujuan, sasaran, lokasi, dan status (`status-pill--berjalan`, `status-pill--selesai`, atau `status-pill--segera`).

## 9. Deploy ke Cloudflare Pages

1. Push seluruh folder project ini ke sebuah repository Git (GitHub/GitLab).
2. Masuk ke dashboard **Cloudflare Pages** → **Create a project** → **Connect to Git**.
3. Pilih repository yang berisi project ini.
4. Pada pengaturan build:
   - **Build command**: kosongkan (tidak perlu build, situs sudah berupa HTML statis).
   - **Build output directory**: `/` (root project, tempat `index.html` berada).
5. Klik **Save and Deploy**. Cloudflare akan otomatis men-deploy situs dan memberi Anda URL `*.pages.dev`.
6. (Opsional) Hubungkan domain kustom yayasan melalui menu **Custom domains** di project Cloudflare Pages Anda.

Alternatif — deploy manual tanpa Git: gunakan [Wrangler CLI](https://developers.cloudflare.com/pages/get-started/direct-upload/) untuk upload folder langsung (`wrangler pages deploy .`).

### Deploy ke GitHub Pages (alternatif)

1. Push project ke repository GitHub.
2. Buka **Settings → Pages** pada repository.
3. Pilih branch (misalnya `main`) dan folder root (`/`) sebagai sumber.
4. Simpan — GitHub akan memberi URL `https://namauser.github.io/nama-repo/`.

## Catatan Pengembangan Selanjutnya

Struktur situs ini sengaja dibuat sederhana dan terpisah antara konten (HTML) dan tampilan (CSS variables), sehingga di kemudian hari dapat lebih mudah dimigrasikan ke Static Site Generator atau backend/CMS tanpa perlu merombak desain dari awal. Setiap komponen (navbar, card, footer, dll.) ditulis dengan class CSS yang konsisten dan dapat diduplikasi.
