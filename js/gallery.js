/**
 * Atelier Lumen — All Lighting Collection (Full-Bleed Mosaic, Hover Flip, Master Switch, Overlay Visibility Config)
 */
import { AppStore } from './state.js';
import { AppAudio } from './audio.js';
import { AppToast } from './toast.js';

function getStore() {
  return window.AppStore || AppStore;
}

function getAudio() {
  return window.AppAudio || AppAudio || { playSwitchSound: () => {} };
}

function getToast() {
  return window.AppToast || AppToast || { showToast: () => {} };
}

export function updateMasterSwitchUI() {
  const { catalog, state } = getStore();
  const totalCount = catalog.length;
  const litCount = state.litLamps.size;
  const allLit = litCount === totalCount && totalCount > 0;
  const allOff = litCount === 0;

  const galleryMasterToggleBtn = document.getElementById('galleryMasterToggleBtn');

  if (galleryMasterToggleBtn) {
    galleryMasterToggleBtn.setAttribute('aria-checked', allLit ? 'true' : (allOff ? 'false' : 'mixed'));
    galleryMasterToggleBtn.classList.toggle('is-lit', allLit);
    galleryMasterToggleBtn.title = allLit ? 'Matikan Semua Lampu' : 'Nyalakan Semua Lampu';
  }
}

export function toggleMasterGallerySwitch() {
  const { catalog, state } = getStore();
  const { playSwitchSound } = getAudio();

  const totalCount = catalog.length;
  const allLit = state.litLamps.size === totalCount;
  const turnOn = !allLit;

  state.galleryMasterOn = turnOn;

  if (turnOn) {
    catalog.forEach(lamp => state.litLamps.add(lamp.id));
    playSwitchSound('on');
  } else {
    state.litLamps.clear();
    playSwitchSound('off');
  }

  // Update all existing DOM tiles in place for fast rendering
  document.querySelectorAll('.lamp-tile').forEach(tile => {
    const lampId = Number(tile.dataset.lampId);
    const isLit = state.litLamps.has(lampId);
    tile.classList.toggle('is-lit', isLit);

    const quickBtn = tile.querySelector('.tile-quick-toggle-btn');
    if (quickBtn) {
      quickBtn.title = isLit ? 'Matikan Lampu' : 'Nyalakan Lampu';
    }
  });

  updateMasterSwitchUI();
}

export function openLampInStudio(lampId) {
  const { catalog } = getStore();
  const lamp = catalog.find(l => l.id === lampId);
  if (lamp) {
    if (window.AppRouter && window.AppRouter.navigate) {
      window.AppRouter.navigate('/studio/' + lamp.handle);
    } else {
      const idx = catalog.indexOf(lamp);
      if (window.AppStudio && window.AppStudio.loadLampIntoStudio) {
        window.AppStudio.loadLampIntoStudio(idx);
      }
      if (window.AppMain && window.AppMain.switchView) {
        window.AppMain.switchView('studio');
      }
    }
  }
}

export function applyOverlayVisibilityConfig() {
  const { state } = getStore();
  const cfg = state.overlayConfig || {
    showTitle: false,
    showCategory: false,
    showPrice: false,
    showStudioBtn: false,
    showTopBar: false
  };

  const lampProductsGrid = document.getElementById('lampProductsGrid');
  if (lampProductsGrid) {
    lampProductsGrid.classList.toggle('show-title', !!cfg.showTitle);
    lampProductsGrid.classList.toggle('show-category', !!cfg.showCategory);
    lampProductsGrid.classList.toggle('show-price', !!cfg.showPrice);
    lampProductsGrid.classList.toggle('show-studio-btn', !!cfg.showStudioBtn);
    lampProductsGrid.classList.toggle('show-top-bar', !!cfg.showTopBar);
  }

  // Update Checkboxes in Popover if present
  const checkTitle = document.getElementById('overlayCheckTitle');
  const checkCategory = document.getElementById('overlayCheckCategory');
  const checkPrice = document.getElementById('overlayCheckPrice');
  const checkStudio = document.getElementById('overlayCheckStudio');
  const checkTopBar = document.getElementById('overlayCheckTopBar');
  const toggleAllBtn = document.getElementById('overlayToggleAllBtn');

  if (checkTitle) checkTitle.checked = !!cfg.showTitle;
  if (checkCategory) checkCategory.checked = !!cfg.showCategory;
  if (checkPrice) checkPrice.checked = !!cfg.showPrice;
  if (checkStudio) checkStudio.checked = !!cfg.showStudioBtn;
  if (checkTopBar) checkTopBar.checked = !!cfg.showTopBar;

  const allActive = cfg.showTitle && cfg.showCategory && cfg.showPrice && cfg.showStudioBtn && cfg.showTopBar;
  if (toggleAllBtn) {
    toggleAllBtn.textContent = allActive ? 'Sembunyikan Semua' : 'Tampilkan Semua';
  }
}

export function renderGalleryGrid() {
  const lampProductsGrid = document.getElementById('lampProductsGrid');
  if (!lampProductsGrid) return;
  const { catalog, state } = getStore();
  const { playSwitchSound } = getAudio();

  lampProductsGrid.innerHTML = '';

  let filtered = catalog.filter(lamp => {
    const matchCat = state.galleryFilter === 'all' || lamp.category.toLowerCase() === state.galleryFilter.toLowerCase();
    const q = state.gallerySearch.toLowerCase().trim();
    const matchSearch = !q || lamp.title.toLowerCase().includes(q) || lamp.category.toLowerCase().includes(q) || (lamp.handle && lamp.handle.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  // Sorting (By Name Only: A to Z or Z to A)
  if (state.gallerySort === 'name-desc') {
    filtered.sort((a, b) => b.title.localeCompare(a.title));
  } else {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  updateMasterSwitchUI();
  applyOverlayVisibilityConfig();

  if (filtered.length === 0) {
    lampProductsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 5rem 1.5rem; color: var(--text-secondary-light);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.5;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 2rem;">Tidak ada koleksi yang cocok</h3>
        <p style="font-size: 0.88rem; margin-top: 0.5rem;">Coba sesuaikan filter kategori atau kata kunci pencarian Anda.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(lamp => {
    const tile = document.createElement('div');
    const isLit = state.litLamps.has(lamp.id);
    tile.className = `lamp-tile ${isLit ? 'is-lit' : ''}`;
    tile.dataset.lampId = lamp.id;

    function fixAssetUrl(url) {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('/')) {
        return url;
      }
      return '/' + url;
    }

    const offUrl = fixAssetUrl(lamp.offImage || (lamp.images && lamp.images[0] ? lamp.images[0].url : ''));
    const onUrl = fixAssetUrl(lamp.onImage || (lamp.images && lamp.images[1] ? lamp.images[1].url : offUrl));

    tile.innerHTML = `
      <!-- Background Ambient Glow Bloom -->
      <div class="tile-ambient-glow"></div>

      <!-- Full-Bleed Image Viewport -->
      <div class="tile-img-viewport">
        <img class="tile-img-layer img-off" src="${offUrl}" alt="${lamp.title} Off" loading="lazy">
        <img class="tile-img-layer img-on" src="${onUrl}" alt="${lamp.title} On" loading="lazy">
      </div>

      <!-- Top Controls Overlay -->
      <div class="tile-top-bar">
        <span class="tile-category-pill">${lamp.category}</span>
        <button class="tile-quick-toggle-btn" title="${isLit ? 'Matikan Lampu' : 'Nyalakan Lampu'}" aria-label="Toggle Saklar Lampu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
        </button>
      </div>

      <!-- Bottom Content Overlay: Nama & Harga di Atas Gambar di Bawah -->
      <div class="tile-bottom-overlay">
        <div class="tile-category-label">${lamp.category}</div>
        <h3 class="tile-lamp-title" title="${lamp.title}">${lamp.shortTitle || lamp.title}</h3>
        
        <div class="tile-price-action-row">
          <span class="tile-price-tag">${lamp.price}</span>
          <button class="tile-studio-link-btn" title="Buka kontrol studio saklar">
            <span>Studio</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    `;

    // Quick mini switch on tile
    const miniToggle = tile.querySelector('.tile-quick-toggle-btn');
    if (miniToggle) {
      miniToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.litLamps.has(lamp.id)) {
          state.litLamps.delete(lamp.id);
          tile.classList.remove('is-lit');
          playSwitchSound('off');
        } else {
          state.litLamps.add(lamp.id);
          tile.classList.add('is-lit');
          playSwitchSound('on');
        }

        const nowLit = state.litLamps.has(lamp.id);
        miniToggle.title = nowLit ? 'Matikan Lampu' : 'Nyalakan Lampu';

        updateMasterSwitchUI();
      });
    }

    // Studio opener button click
    const studioBtn = tile.querySelector('.tile-studio-link-btn');
    if (studioBtn) {
      studioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLampInStudio(lamp.id);
      });
    }

    // Entire Tile Click
    tile.addEventListener('click', () => {
      openLampInStudio(lamp.id);
    });

    lampProductsGrid.appendChild(tile);
  });
}

export function setGridColumns(cols) {
  const { state } = getStore();
  state.galleryGridCols = cols;

  const lampProductsGrid = document.getElementById('lampProductsGrid');
  if (lampProductsGrid) {
    lampProductsGrid.style.setProperty('--gallery-grid-cols', cols);
  }

  document.querySelectorAll('.dock-grid-btn, .grid-col-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.cols, 10) === cols);
  });
}

export function initGallery() {
  const { state } = getStore();
  const lampProductsGrid = document.getElementById('lampProductsGrid');
  const gallerySearchInput = document.getElementById('gallerySearchInput');
  const galleryMasterToggleBtn = document.getElementById('galleryMasterToggleBtn');

  // Custom Category Dropdown Elements
  const categoryDropdownBtn = document.getElementById('categoryDropdownBtn');
  const categoryDropdownMenu = document.getElementById('categoryDropdownMenu');
  const categoryBtnLabel = document.getElementById('categoryBtnLabel');
  const categoryBtnBadge = document.getElementById('categoryBtnBadge');
  const categoryOptions = document.querySelectorAll('.dropdown-option');

  // Overlay Config UI Elements
  const overlayConfigTriggerBtn = document.getElementById('overlayConfigTriggerBtn');
  const overlayConfigPopover = document.getElementById('overlayConfigPopover');
  const overlayToggleAllBtn = document.getElementById('overlayToggleAllBtn');
  const checkTitle = document.getElementById('overlayCheckTitle');
  const checkCategory = document.getElementById('overlayCheckCategory');
  const checkPrice = document.getElementById('overlayCheckPrice');
  const checkStudio = document.getElementById('overlayCheckStudio');
  const checkTopBar = document.getElementById('overlayCheckTopBar');

  if (lampProductsGrid) {
    lampProductsGrid.style.setProperty('--gallery-grid-cols', state.galleryGridCols || 4);
  }

  // Grid Density buttons (Silent - No alert)
  document.querySelectorAll('.dock-grid-btn, .grid-col-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cols = parseInt(btn.dataset.cols, 10);
      if (cols >= 2 && cols <= 6) {
        setGridColumns(cols);
      }
    });
  });

  // Custom Category Dropdown Toggle & Selection
  if (categoryDropdownBtn && categoryDropdownMenu) {
    categoryDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (overlayConfigPopover) {
        overlayConfigPopover.classList.remove('open');
        if (overlayConfigTriggerBtn) overlayConfigTriggerBtn.classList.remove('active');
      }
      const isOpen = categoryDropdownMenu.classList.toggle('open');
      categoryDropdownBtn.classList.toggle('active', isOpen);
      categoryDropdownBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    categoryOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const cat = opt.dataset.cat;
        state.galleryFilter = cat;
        categoryOptions.forEach(o => {
          const isCurrent = o.dataset.cat === cat;
          o.classList.toggle('active', isCurrent);
          o.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        });

        const nameSpan = opt.querySelector('.option-name');
        const countSpan = opt.querySelector('.option-count');
        if (categoryBtnLabel && nameSpan) categoryBtnLabel.textContent = nameSpan.textContent;
        if (categoryBtnBadge && countSpan) categoryBtnBadge.textContent = countSpan.textContent;

        categoryDropdownMenu.classList.remove('open');
        categoryDropdownBtn.classList.remove('active');
        categoryDropdownBtn.setAttribute('aria-expanded', 'false');

        renderGalleryGrid();
      });
    });

    document.addEventListener('click', (e) => {
      if (!categoryDropdownMenu.contains(e.target) && e.target !== categoryDropdownBtn) {
        categoryDropdownMenu.classList.remove('open');
        categoryDropdownBtn.classList.remove('active');
        categoryDropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Overlay Popover Toggle
  if (overlayConfigTriggerBtn && overlayConfigPopover) {
    overlayConfigTriggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (categoryDropdownMenu) {
        categoryDropdownMenu.classList.remove('open');
        if (categoryDropdownBtn) categoryDropdownBtn.classList.remove('active');
      }
      const isOpen = overlayConfigPopover.classList.toggle('open');
      overlayConfigTriggerBtn.classList.toggle('active', isOpen);
      overlayConfigTriggerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!overlayConfigPopover.contains(e.target) && e.target !== overlayConfigTriggerBtn) {
        overlayConfigPopover.classList.remove('open');
        overlayConfigTriggerBtn.classList.remove('active');
        overlayConfigTriggerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Overlay Checkboxes
  function bindCheckbox(el, key) {
    if (!el) return;
    el.addEventListener('change', () => {
      state.overlayConfig[key] = el.checked;
      applyOverlayVisibilityConfig();
    });
  }

  bindCheckbox(checkTitle, 'showTitle');
  bindCheckbox(checkCategory, 'showCategory');
  bindCheckbox(checkPrice, 'showPrice');
  bindCheckbox(checkStudio, 'showStudioBtn');
  bindCheckbox(checkTopBar, 'showTopBar');

  if (overlayToggleAllBtn) {
    overlayToggleAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const cfg = state.overlayConfig;
      const allActive = cfg.showTitle && cfg.showCategory && cfg.showPrice && cfg.showStudioBtn && cfg.showTopBar;
      const newState = !allActive;
      cfg.showTitle = newState;
      cfg.showCategory = newState;
      cfg.showPrice = newState;
      cfg.showStudioBtn = newState;
      cfg.showTopBar = newState;
      applyOverlayVisibilityConfig();
    });
  }

  if (gallerySearchInput) {
    gallerySearchInput.addEventListener('input', (e) => {
      state.gallerySearch = e.target.value;
      renderGalleryGrid();
    });
  }

  if (galleryMasterToggleBtn) {
    galleryMasterToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMasterGallerySwitch();
    });
  }

  renderGalleryGrid();
}

export const AppGallery = {
  initGallery,
  renderGalleryGrid,
  setGridColumns,
  updateMasterSwitchUI,
  toggleMasterGallerySwitch,
  applyOverlayVisibilityConfig,
  openLampInStudio
};

if (typeof window !== 'undefined') {
  window.AppGallery = AppGallery;
}

export default AppGallery;
