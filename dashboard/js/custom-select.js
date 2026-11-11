// Komponen dropdown custom yang bersih & responsif (Bottom Sheet di Mobile, Popover di Desktop)

const CHEVRON_SVG = '<svg class="cs-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
const CLOSE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const SEARCH_SVG = '<svg class="cs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

let activeController = null;

function getDotClass(value) {
  const lower = String(value || '').trim().toLowerCase();
  if (!lower) return '';
  if (lower.startsWith('zakat')) return 'cs-dot--emerald';
  if (lower.startsWith('infaq')) return 'cs-dot--blue';
  if (lower.startsWith('shodaqoh') || lower.startsWith('wakaf')) return 'cs-dot--amber';
  if (lower.startsWith('belanja') || lower.startsWith('uang')) return 'cs-dot--rose';
  if (lower === 'kegiatan' || lower === 'sosial' || lower === 'semua') return 'cs-dot--emerald';
  if (lower === 'program' || lower === 'kemanusiaan') return 'cs-dot--blue';
  if (lower === 'informasi' || lower === 'lainnya') return 'cs-dot--amber';
  return 'cs-dot--emerald';
}

function getLabelTextForSelect(selectEl) {
  if (selectEl.id) {
    const label = document.querySelector(`label[for="${CSS.escape(selectEl.id)}"]`);
    if (label && label.textContent.trim()) {
      return label.textContent.trim();
    }
  }
  const placeholderOpt = Array.from(selectEl.options).find((o) => o.disabled || o.value === '');
  if (placeholderOpt && placeholderOpt.textContent.trim()) {
    return placeholderOpt.textContent.trim();
  }
  return 'Pilih Opsi';
}

function buildOptionItems(selectEl) {
  return Array.from(selectEl.options)
    .filter((opt) => !(opt.disabled && opt.value === ''))
    .map((opt) => ({
      value: opt.value,
      label: opt.textContent.trim(),
      disabled: opt.disabled,
    }));
}

export function pasangCustomSelect(selectEl, config = {}) {
  if (!selectEl || selectEl.dataset.csReady === '1') return null;
  selectEl.dataset.csReady = '1';

  const parent = selectEl.parentNode;
  const wrapper = document.createElement('div');
  wrapper.className = 'cs-wrapper';
  parent.insertBefore(wrapper, selectEl);
  wrapper.appendChild(selectEl);

  const inlineStyleWidth = selectEl.style.maxWidth;
  if (inlineStyleWidth) wrapper.style.maxWidth = inlineStyleWidth;

  const isCompact = Boolean(config.compact || selectEl.dataset.compact === 'true');
  const titleText = config.title || getLabelTextForSelect(selectEl);
  const searchPlaceholder = config.searchPlaceholder || 'Cari kategori...';

  selectEl.classList.add('cs-native-select');
  selectEl.tabIndex = -1;
  selectEl.setAttribute('aria-hidden', 'true');

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'cs-trigger';
  if (isCompact) {
    trigger.style.padding = '0.6rem 0.95rem';
  }
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', titleText);

  const triggerValWrap = document.createElement('span');
  triggerValWrap.className = 'cs-trigger-value';

  const triggerDot = document.createElement('span');
  triggerDot.className = 'cs-dot';
  triggerDot.style.display = 'none';

  const triggerText = document.createElement('span');
  triggerText.className = 'cs-trigger-text';

  triggerValWrap.appendChild(triggerDot);
  triggerValWrap.appendChild(triggerText);
  trigger.appendChild(triggerValWrap);
  trigger.insertAdjacentHTML('beforeend', CHEVRON_SVG);
  wrapper.appendChild(trigger);

  function syncTrigger() {
    const selectedOpt = selectEl.options[selectEl.selectedIndex];
    const hasValue = Boolean(selectedOpt && !(selectedOpt.disabled && selectedOpt.value === '') && selectEl.value !== '');
    const placeholderOpt = Array.from(selectEl.options).find((o) => o.value === '' && o.disabled);

    if (hasValue && selectedOpt) {
      triggerText.textContent = selectedOpt.textContent.trim();
      trigger.classList.remove('is-placeholder');
      trigger.classList.remove('is-invalid');
      const dotCls = getDotClass(selectedOpt.value);
      triggerDot.className = `cs-dot ${dotCls}`;
      triggerDot.style.display = dotCls ? 'inline-block' : 'none';
    } else if (selectedOpt && selectedOpt.value !== '') {
      triggerText.textContent = selectedOpt.textContent.trim();
      trigger.classList.remove('is-placeholder');
      const dotCls = getDotClass(selectedOpt.value);
      triggerDot.className = `cs-dot ${dotCls}`;
      triggerDot.style.display = dotCls ? 'inline-block' : 'none';
    } else {
      triggerText.textContent = (placeholderOpt || selectedOpt)?.textContent.trim() || titleText;
      trigger.classList.add('is-placeholder');
      triggerDot.style.display = 'none';
    }
  }

  // Intercept property value getter/setter agar assignment `selectEl.value = ...` langsung sinkron ke UI
  const nativeDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  if (nativeDescriptor && nativeDescriptor.get && nativeDescriptor.set) {
    Object.defineProperty(selectEl, 'value', {
      configurable: true,
      enumerable: true,
      get() {
        return nativeDescriptor.get.call(selectEl);
      },
      set(val) {
        nativeDescriptor.set.call(selectEl, val);
        syncTrigger();
      },
    });
  }

  selectEl.addEventListener('change', syncTrigger);
  selectEl.addEventListener('invalid', () => {
    trigger.classList.add('is-invalid');
  });

  if (selectEl.form) {
    selectEl.form.addEventListener('reset', () => {
      requestAnimationFrame(syncTrigger);
    });
  }

  if (selectEl.id) {
    const labelEl = document.querySelector(`label[for="${CSS.escape(selectEl.id)}"]`);
    if (labelEl) {
      labelEl.addEventListener('click', (e) => {
        e.preventDefault();
        openPicker();
      });
    }
  }

  const observer = new MutationObserver(() => syncTrigger());
  observer.observe(selectEl, { childList: true, subtree: true, attributes: true });

  syncTrigger();

  function openPicker() {
    if (activeController) {
      const sameTrigger = activeController.trigger === trigger;
      activeController.close(false);
      if (sameTrigger) return;
    }

    const allOptions = buildOptionItems(selectEl);
    const isMobile = window.innerWidth <= 768;

    const backdrop = document.createElement('div');
    backdrop.className = 'cs-backdrop';

    const panel = document.createElement('div');
    panel.className = isMobile ? 'cs-panel' : 'cs-panel cs-panel--popover';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', isMobile ? 'true' : 'false');
    panel.setAttribute('aria-label', titleText);

    if (isMobile) {
      const handle = document.createElement('div');
      handle.className = 'cs-handle';
      panel.appendChild(handle);
    }

    const head = document.createElement('div');
    head.className = 'cs-panel-head';

    const headInfo = document.createElement('div');
    const headTitle = document.createElement('h4');
    headTitle.className = 'cs-panel-title';
    headTitle.textContent = titleText;
    const headSub = document.createElement('p');
    headSub.className = 'cs-panel-sub';
    headSub.textContent = `${allOptions.length} pilihan tersedia`;
    headInfo.appendChild(headTitle);
    headInfo.appendChild(headSub);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cs-close';
    closeBtn.setAttribute('aria-label', 'Tutup daftar');
    closeBtn.innerHTML = CLOSE_SVG;

    head.appendChild(headInfo);
    head.appendChild(closeBtn);
    panel.appendChild(head);

    let searchInput = null;
    if (allOptions.length >= 7) {
      const searchWrap = document.createElement('div');
      searchWrap.className = 'cs-search-wrap';

      const searchBox = document.createElement('div');
      searchBox.className = 'cs-search-box';
      searchBox.insertAdjacentHTML('beforeend', SEARCH_SVG);

      searchInput = document.createElement('input');
      searchInput.type = 'search';
      searchInput.className = 'cs-search-input';
      searchInput.placeholder = searchPlaceholder;
      searchInput.setAttribute('aria-label', searchPlaceholder);
      searchInput.autocomplete = 'off';

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'cs-search-clear';
      clearBtn.setAttribute('aria-label', 'Hapus pencarian');
      clearBtn.innerHTML = CLOSE_SVG;

      searchBox.appendChild(searchInput);
      searchBox.appendChild(clearBtn);
      searchWrap.appendChild(searchBox);
      panel.appendChild(searchWrap);

      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('is-visible');
        renderOptions('');
        searchInput.focus();
      });

      searchInput.addEventListener('input', () => {
        const q = searchInput.value;
        clearBtn.classList.toggle('is-visible', q.length > 0);
        renderOptions(q);
      });
    }

    const listEl = document.createElement('div');
    listEl.className = 'cs-options';
    listEl.setAttribute('role', 'listbox');
    listEl.setAttribute('aria-label', titleText);
    panel.appendChild(listEl);

    let focusedIdx = -1;

    function getVisibleButtons() {
      return Array.from(listEl.querySelectorAll('.cs-option:not(:disabled)'));
    }

    function setFocusedIndex(nextIdx) {
      const btns = getVisibleButtons();
      btns.forEach((b) => b.classList.remove('is-focused'));
      if (btns.length === 0) {
        focusedIdx = -1;
        return;
      }
      focusedIdx = (nextIdx + btns.length) % btns.length;
      btns[focusedIdx].classList.add('is-focused');
      btns[focusedIdx].scrollIntoView({ block: 'nearest' });
    }

    function selectValue(val) {
      const prevVal = selectEl.value;
      selectEl.value = val;
      trigger.classList.remove('is-invalid');
      if (prevVal !== val) {
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
      close(true);
    }

    function renderOptions(keyword = '') {
      const q = keyword.trim().toLowerCase();
      const filtered = q
        ? allOptions.filter((o) => o.label.toLowerCase().includes(q))
        : allOptions;

      listEl.innerHTML = '';
      focusedIdx = -1;

      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'cs-empty';
        empty.textContent = `Tidak ditemukan pilihan untuk "${keyword.trim()}"`;
        listEl.appendChild(empty);
        return;
      }

      const currentVal = selectEl.value;
      const frag = document.createDocumentFragment();

      filtered.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cs-option';
        btn.setAttribute('role', 'option');
        const isSelected = opt.value === currentVal;
        btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        if (isSelected) btn.classList.add('is-selected');
        if (opt.disabled) btn.disabled = true;

        const left = document.createElement('span');
        left.className = 'cs-option-left';

        const dot = document.createElement('span');
        const dotCls = getDotClass(opt.value);
        dot.className = `cs-dot ${dotCls}`;

        const lbl = document.createElement('span');
        lbl.className = 'cs-option-label';
        lbl.textContent = opt.label;

        left.appendChild(dot);
        left.appendChild(lbl);

        const check = document.createElement('span');
        check.className = 'cs-option-check';
        check.innerHTML = CHECK_SVG;

        btn.appendChild(left);
        btn.appendChild(check);

        btn.addEventListener('click', () => selectValue(opt.value));
        frag.appendChild(btn);
      });

      listEl.appendChild(frag);
    }

    renderOptions('');
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);

    if (!isMobile) {
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(Math.max(rect.width, 250), window.innerWidth - 24);
      const left = Math.min(rect.left, window.innerWidth - width - 12);
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;

      panel.style.left = `${Math.max(12, left)}px`;
      panel.style.width = `${width}px`;

      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        panel.style.bottom = `${window.innerHeight - rect.top + 6}px`;
        panel.style.top = 'auto';
        panel.style.maxHeight = `${Math.min(340, spaceAbove)}px`;
      } else {
        panel.style.top = `${rect.bottom + 6}px`;
        panel.style.bottom = 'auto';
        panel.style.maxHeight = `${Math.min(340, Math.max(220, spaceBelow))}px`;
      }
    } else {
      document.body.classList.add('cs-lock-scroll');
    }

    trigger.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');

    requestAnimationFrame(() => {
      backdrop.classList.add('is-open');
      const selectedBtn = listEl.querySelector('.cs-option.is-selected');
      if (selectedBtn) {
        selectedBtn.scrollIntoView({ block: 'nearest' });
      }
      if (!isMobile && searchInput) {
        searchInput.focus();
      }
    });

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(focusedIdx + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(focusedIdx <= 0 ? getVisibleButtons().length - 1 : focusedIdx - 1);
      } else if (e.key === 'Enter' && focusedIdx >= 0) {
        const btns = getVisibleButtons();
        if (btns[focusedIdx]) {
          e.preventDefault();
          btns[focusedIdx].click();
        }
      }
    }

    function onDesktopScrollOrResize(e) {
      if (!isMobile) {
        if (e.type === 'scroll' && panel.contains(e.target)) return;
        close(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    if (!isMobile) {
      window.addEventListener('scroll', onDesktopScrollOrResize, true);
      window.addEventListener('resize', onDesktopScrollOrResize);
    }

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close(true);
    });
    closeBtn.addEventListener('click', () => close(true));

    let closed = false;
    function close(restoreFocus = false) {
      if (closed) return;
      closed = true;
      activeController = null;
      document.removeEventListener('keydown', onKeyDown);
      if (!isMobile) {
        window.removeEventListener('scroll', onDesktopScrollOrResize, true);
        window.removeEventListener('resize', onDesktopScrollOrResize);
      } else {
        document.body.classList.remove('cs-lock-scroll');
      }
      trigger.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('is-open');
      setTimeout(() => {
        backdrop.remove();
      }, 220);
      if (restoreFocus && (!isMobile || document.activeElement !== trigger)) {
        trigger.focus({ preventScroll: true });
      }
    }

    activeController = { trigger, close };
  }

  trigger.addEventListener('click', openPicker);

  return { sync: syncTrigger, open: openPicker };
}

export function pasangSemuaCustomSelect(daftarConfig = []) {
  return daftarConfig.map((cfg) => {
    const el = typeof cfg.selector === 'string' ? document.querySelector(cfg.selector) : cfg.selector;
    return pasangCustomSelect(el, cfg);
  });
}
