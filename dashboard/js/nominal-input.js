/**
 * Utilitas pemformatan input nominal Rupiah dengan pemisah ribuan titik (mis. 12.300.000).
 */

/**
 * Mengubah nilai angka/string menjadi format ribuan bertitik tanpa awalan nol.
 * @param {string|number} nilai
 * @returns {string}
 */
export function formatRibuanTitik(nilai) {
  const digits = String(nilai ?? '').replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Mengambil nilai integer murni dari string berformat titik ribuan.
 * @param {string} teks
 * @returns {number}
 */
export function parseAngkaDariFormat(teks) {
  const digits = String(teks ?? '').replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

/**
 * Mengaitkan pemformatan titik ribuan otomatis pada elemen <input> sambil menjaga posisi kursor.
 * @param {HTMLInputElement|null} inputEl
 */
export function pasangFormatInputRibuan(inputEl) {
  if (!inputEl) return;

  inputEl.addEventListener('input', (e) => {
    const el = e.target;
    const posAwal = el.selectionStart ?? el.value.length;
    const digitsSebelumKursor = el.value.slice(0, posAwal).replace(/\D/g, '').replace(/^0+/, '').length;

    const terformat = formatRibuanTitik(el.value);
    el.value = terformat;

    // Kembalikan posisi kursor tepat setelah jumlah digit yang sama
    let countDigit = 0;
    let posBaru = 0;
    for (let i = 0; i < terformat.length; i++) {
      if (countDigit >= digitsSebelumKursor) break;
      if (/\d/.test(terformat[i])) countDigit++;
      posBaru = i + 1;
    }

    if (typeof el.setSelectionRange === 'function') {
      el.setSelectionRange(posBaru, posBaru);
    }
  });
}
