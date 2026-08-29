/**
 * Atelier Lumen — All Lighting Collection (Full-Bleed Mosaic, Hover Flip, Master Switch)
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

  const masterSwitchCard = document.querySelector('.gallery-master-switch-card');
  const masterSwitchStatusText = document.getElementById('masterSwitchStatusText');
  const masterSwitchBtnLabel = document.getElementById('masterSwitchBtnLabel');
  const galleryMasterToggleBtn = document.getElementById('galleryMasterToggleBtn');

  if (masterSwitchCard) {
    masterSwitchCard.classList.toggle('all-lit', allLit);
  }

  if (masterSwitchStatusText) {
    if (allLit) {
      masterSwitchStatusText.textContent = `SEMUA NYALA (${litCount}/${totalCount})`;
    } else if (allOff) {
      masterSwitchStatusText.textContent = `SEMUA MATI (0/${totalCount})`;
    } else {
      masterSwitchStatusText.textContent = `${litCount}/${totalCount} MENYALA`;
    }
  }

  if (masterSwitchBtnLabel) {
    masterSwitchBtnLabel.textContent = allLit ? 'MATIKAN SEMUA' : 'NYALAKAN SEMUA';
  }

  if (galleryMasterToggleBtn) {
    galleryMasterToggleBtn.setAttribute('aria-checked', allLit ? 'true' : (allOff ? 'false' : 'mixed'));
  }
}

export function toggleMasterGallerySwitch() {
  const { catalog, state } = getStore();
  const { playSwitchSound } = getAudio();
  const { showToast } = getToast();

  const totalCount = catalog.length;
  const allLit = state.litLamps.size === totalCount;
  const turnOn = !allLit;

  state.galleryMasterOn = turnOn;

  if (turnOn) {
    catalog.forEach(lamp => state.litLamps.add(lamp.id));
    playSwitchSound('on');
    showToast(`Master Switch: Menyalakan seluruh ${totalCount} lampu`);
  } else {
    state.litLamps.clear();
    playSwitchSound('off');
    showToast('Master Switch: Memadamkan semua lampu');
  }

  // Update all existing DOM tiles in place for fast rendering
  document.querySelectorAll('.lamp-tile').forEach(tile => {
    const lampId = Number(tile.dataset.lampId);
    const isLit = state.litLamps.has(lampId);
    tile.classList.toggle('is-lit', isLit);

    const pill = tile.querySelector('.tile-hover-state-pill');
    if (pill) {
      pill.textContent = isLit ? 'HOVER: SISI OFF' : 'HOVER: SISI ON';
    }

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
      window.AppRouter.navigate('#/studio/' + lamp.handle);
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

    const offUrl = lamp.offImage || (lamp.images && lamp.images[0] ? lamp.images[0].url : '');
    const onUrl = lamp.onImage || (lamp.images && lamp.images[1] ? lamp.images[1].url : offUrl);

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

      <!-- Hover State Floating Pill -->
      <div class="tile-hover-state-pill">${isLit ? 'HOVER: SISI OFF' : 'HOVER: SISI ON'}</div>

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

      const pill = tile.querySelector('.tile-hover-state-pill');
      const nowLit = state.litLamps.has(lamp.id);
      if (pill) pill.textContent = nowLit ? 'HOVER: SISI OFF' : 'HOVER: SISI ON';
      miniToggle.title = nowLit ? 'Matikan Lampu' : 'Nyalakan Lampu';

      updateMasterSwitchUI();
    });

    // Studio opener button click
    const studioBtn = tile.querySelector('.tile-studio-link-btn');
    studioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLampInStudio(lamp.id);
    });

    // Entire Tile Click
    tile.addEventListener('click', () => {
      openLampInStudio(lamp.id);
    });

    lampProductsGrid.appendChild(tile);
  });
}

export function setGridColumns(cols) {
  const { state } = getStore();
  const { showToast } = getToast();
  state.galleryGridCols = cols;

  const lampProductsGrid = document.getElementById('lampProductsGrid');
  if (lampProductsGrid) {
    lampProductsGrid.style.setProperty('--gallery-grid-cols', cols);
  }

  document.querySelectorAll('.grid-col-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.cols, 10) === cols);
  });

  showToast(`Tata Letak Grid: ${cols} Kolom`);
}

export function initGallery() {
  const { state } = getStore();
  const lampProductsGrid = document.getElementById('lampProductsGrid');
  const categoryPillsRow = document.getElementById('categoryPillsRow');
  const gallerySearchInput = document.getElementById('gallerySearchInput');
  const gallerySortSelect = document.getElementById('gallerySortSelect');
  const galleryMasterToggleBtn = document.getElementById('galleryMasterToggleBtn');

  if (lampProductsGrid) {
    lampProductsGrid.style.setProperty('--gallery-grid-cols', state.galleryGridCols || 4);
  }

  // Grid Density buttons
  document.querySelectorAll('.grid-col-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cols = parseInt(btn.dataset.cols, 10);
      if (cols >= 2 && cols <= 6) {
        setGridColumns(cols);
      }
    });
  });

  if (categoryPillsRow) {
    categoryPillsRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-pill-btn');
      if (!btn) return;
      document.querySelectorAll('.category-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.galleryFilter = btn.dataset.cat;
      renderGalleryGrid();
    });
  }

  if (gallerySearchInput) {
    gallerySearchInput.addEventListener('input', (e) => {
      state.gallerySearch = e.target.value;
      renderGalleryGrid();
    });
  }

  if (gallerySortSelect) {
    gallerySortSelect.addEventListener('change', (e) => {
      state.gallerySort = e.target.value;
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
  openLampInStudio
};

if (typeof window !== 'undefined') {
  window.AppGallery = AppGallery;
}

export default AppGallery;
