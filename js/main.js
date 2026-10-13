/**
 * [NAMA YAYASAN] — main.js
 * Vanilla JS, tanpa dependency eksternal.
 * Berisi: mobile menu, sticky navbar, active nav link,
 *         gallery filter + lightbox, scroll reveal, back-to-top.
 */

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initStickyNavbar();
  initActiveNavLink();
  initGalleryFilter();
  initLightbox();
  initScrollReveal();
  initBackToTop();
  initContactFormDemo();
});

/* ---------- Mobile menu toggle ---------- */
function initMobileMenu() {
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", function () {
    var isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    // Baris pengunci scroll di bawah ini dihapus/dikomen agar halaman tetap bisa di-scroll:
    // document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Tutup menu saat link diklik (mobile)
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      // document.body.style.overflow = "";
    });
  });

  // Tutup menu dengan tombol Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      // document.body.style.overflow = "";
    }
  });
}

/* ---------- Sticky navbar shadow saat scroll ---------- */
function initStickyNavbar() {
  var navbar = document.querySelector(".navbar");
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Menandai link navigasi aktif berdasarkan halaman ---------- */
function initActiveNavLink() {
  var links = document.querySelectorAll("[data-nav-menu] .navbar__links a");
  var current = window.location.pathname.split("/").pop() || "index.html";

  links.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

/* ---------- Filter galeri berdasarkan kategori ---------- */
function initGalleryFilter() {
  var buttons = document.querySelectorAll("[data-filter]");
  var items = document.querySelectorAll("[data-category]");
  if (!buttons.length || !items.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      buttons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      var filter = btn.getAttribute("data-filter");
      items.forEach(function (item) {
        var match = filter === "semua" || item.getAttribute("data-category") === filter;
        item.classList.toggle("is-hidden", !match);
      });
    });
  });
}

/* ---------- Lightbox galeri sederhana (tanpa library) ---------- */
function initLightbox() {
  var lightbox = document.querySelector("[data-lightbox]");
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  if (!lightbox || !galleryItems.length) return;

  var imgEl = lightbox.querySelector("[data-lightbox-img]");
  var captionEl = lightbox.querySelector("[data-lightbox-caption]");
  var closeBtn = lightbox.querySelector(".lightbox__close");
  var prevBtn = lightbox.querySelector(".lightbox__prev");
  var nextBtn = lightbox.querySelector(".lightbox__next");
  var currentIndex = 0;
  var lastFocused = null;

  function getVisibleItems() {
    return galleryItems.filter(function (item) {
      return !item.classList.contains("is-hidden");
    });
  }

  function open(index) {
    var visible = getVisibleItems();
    if (!visible.length) return;
    currentIndex = index;
    var item = visible[currentIndex];
    var fullSrc = item.getAttribute("data-full") || item.querySelector("img").src;
    imgEl.src = fullSrc;
    imgEl.alt = item.querySelector("img").alt || "";
    captionEl.textContent = item.getAttribute("data-caption") || item.querySelector("img").alt || "";
    lastFocused = document.activeElement;
    lightbox.classList.add("is-open");
    closeBtn.focus();
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function show(delta) {
    var visible = getVisibleItems();
    if (!visible.length) return;
    currentIndex = (currentIndex + delta + visible.length) % visible.length;
    var item = visible[currentIndex];
    var fullSrc = item.getAttribute("data-full") || item.querySelector("img").src;
    imgEl.src = fullSrc;
    imgEl.alt = item.querySelector("img").alt || "";
    captionEl.textContent = item.getAttribute("data-caption") || item.querySelector("img").alt || "";
  }

  galleryItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var visible = getVisibleItems();
      open(visible.indexOf(item));
    });
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () { show(-1); });
  nextBtn.addEventListener("click", function () { show(1); });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(1);
    if (e.key === "ArrowLeft") show(-1);
  });
}

/* ---------- Scroll reveal sederhana pakai IntersectionObserver ---------- */
function initScrollReveal() {
  var items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach(function (el) { observer.observe(el); });
}

/* ---------- Tombol kembali ke atas ---------- */
function initBackToTop() {
  var btn = document.querySelector("[data-back-to-top]");
  if (!btn) return;

  function onScroll() {
    btn.classList.toggle("is-visible", window.scrollY > 480);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- Form kontak demo (belum terhubung backend) ---------- */
function initContactFormDemo() {
  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var feedback = form.querySelector("[data-form-feedback]");
    if (feedback) {
      feedback.hidden = false;
      feedback.textContent =
        "Terima kasih! Ini masih tampilan demo — pesan Anda belum benar-benar terkirim karena form belum terhubung ke backend.";
      feedback.focus();
    }
    form.reset();
  });
}
