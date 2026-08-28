(function () {
  'use strict';

  const catalog = window.LAMP_CATALOG || [];
  console.log(`Loaded ${catalog.length} fixtures from catalog.`);

  // --- APPLICATION STATE ---
  const state = {
    isOn: false,
    brightness: 0,
    currentView: 'studio',
    currentSwitchMode: 'rocker',
    soundEnabled: true,
    isDarkMode: false,
    gradientEnabled: true,
    colorSource: 'auto',
    activeLampIndex: 0,
    galleryFilter: 'all',
    gallerySearch: '',
    gallerySort: 'featured'
  };

  // Set initial index to Luca Wall Sconce
  const lucaIdx = catalog.findIndex(l => l.handle.includes('luca-wall-sconce-anthracite'));
  if (lucaIdx !== -1) state.activeLampIndex = lucaIdx;

  // Color Palettes for Ambient Glow
  const colorPalettes = {
    '2200k': { core: '255, 160, 60', mid: '240, 110, 20', outer: '200, 70, 10' },
    '2700k': { core: '255, 195, 115', mid: '255, 160, 65', outer: '255, 130, 45' },
    '3500k': { core: '255, 235, 190', mid: '255, 205, 140', outer: '245, 175, 100' }
  };

  // --- DOM REFERENCES ---
  const body = document.body;
  const totalHeaderCount = document.getElementById('totalHeaderCount');
  if (totalHeaderCount) totalHeaderCount.textContent = catalog.length;

  // Header & Navigation
  const tabStudioBtn = document.getElementById('tabStudioBtn');
  const tabGalleryBtn = document.getElementById('tabGalleryBtn');
  const studioViewPanel = document.getElementById('studioViewPanel');
  const galleryViewPanel = document.getElementById('galleryViewPanel');
  const brandBtn = document.getElementById('brandBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const drawerTriggerBtn = document.getElementById('drawerTriggerBtn');

  // Studio Stage
  const stageCategory = document.getElementById('stageCategory');
  const stageTitle = document.getElementById('stageTitle');
  const stagePrice = document.getElementById('stagePrice');
  const sconceLamp = document.getElementById('sconceLamp');
  const ambientHalo = document.getElementById('ambientHalo');
  const imgOff = document.getElementById('imgOff');
  const imgOn = document.getElementById('imgOn');
  const officialStoreLink = document.getElementById('officialStoreLink');

  // Navigation Buttons
  const prevLampBtn = document.getElementById('prevLampBtn');
  const nextLampBtn = document.getElementById('nextLampBtn');
  const quickBrowseBtn = document.getElementById('quickBrowseBtn');

  // Switches & Control Deck
  const powerBadge = document.getElementById('powerBadge');
  const powerText = document.getElementById('powerText');
  const switchTabs = document.querySelectorAll('.switch-mode-tabs .tab-btn');
  const rockerView = document.getElementById('rockerView');
  const pushView = document.getElementById('pushView');
  const leverView = document.getElementById('leverView');
  const rockerSwitchBtn = document.getElementById('rockerSwitchBtn');
  const pushSwitchBtn = document.getElementById('pushSwitchBtn');
  const leverSwitchBtn = document.getElementById('leverSwitchBtn');

  // Dimmer
  const brightnessSlider = document.getElementById('brightnessSlider');
  const brightnessValue = document.getElementById('brightnessValue');

  // Gradient & Color Presets
  const gradientToggleCheckbox = document.getElementById('gradientToggle');
  const gradientStateText = document.getElementById('gradientStateText');
  const colorPresetBtns = document.querySelectorAll('.color-preset-pills .color-btn');

  // Gallery Elements
  const gallerySearchInput = document.getElementById('gallerySearchInput');
  const gallerySortSelect = document.getElementById('gallerySortSelect');
  const categoryPillsRow = document.getElementById('categoryPillsRow');
  const lampProductsGrid = document.getElementById('lampProductsGrid');
  const galleryResultsCounter = document.getElementById('galleryResultsCounter');

  // Drawer Elements
  const lampDrawerBackdrop = document.getElementById('lampDrawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerList = document.getElementById('drawerList');
  const drawerSearchInput = document.getElementById('drawerSearchInput');

  // Toast & Canvas
  const toastPill = document.getElementById('toastPill');
  const samplerCanvas = document.getElementById('colorSamplerCanvas');
  const samplerCtx = samplerCanvas.getContext('2d', { willReadFrequently: true });

  // --- WEB AUDIO API SYNTHESIZER ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSwitchSound(type) {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'on') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);

        // Sub bounce
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(400, now + 0.012);
        osc2.frequency.exponentialRampToValueAtTime(60, now + 0.06);
        gain2.gain.setValueAtTime(0.2, now + 0.012);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.012);
        osc2.stop(now + 0.065);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      }
    } catch (e) {
      console.warn('AudioContext error:', e);
    }
  }

  // --- TOAST NOTIFICATION ---
  let toastTimer = null;
  function showToast(text) {
    toastPill.textContent = text;
    toastPill.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastPill.classList.remove('show');
    }, 2000);
  }

  // --- COLOR EXTRACTION FROM GLOWING IMAGE ---
  function extractColorsFromImage(imgEl) {
    try {
      if (!imgEl.complete || imgEl.naturalWidth === 0) {
        return colorPalettes['2700k'];
      }
      samplerCanvas.width = 40;
      samplerCanvas.height = 40;
      samplerCtx.clearRect(0, 0, 40, 40);
      samplerCtx.drawImage(imgEl, 0, 0, 40, 40);

      const imgData = samplerCtx.getImageData(0, 0, 40, 40).data;
      let rSum = 0, gSum = 0, bSum = 0, count = 0;

      for (let i = 0; i < imgData.length; i += 4) {
        const a = imgData[i + 3];
        if (a > 50) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          if (r > 120 || (r + g + b) > 300) {
            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }
      }

      if (count > 0) {
        const avgR = Math.min(255, Math.max(160, Math.round(rSum / count)));
        const avgG = Math.min(240, Math.max(100, Math.round(gSum / count)));
        const avgB = Math.min(200, Math.max(40, Math.round(bSum / count)));
        return {
          core: `${avgR}, ${avgG}, ${avgB}`,
          mid: `${Math.round(avgR * 0.95)}, ${Math.round(avgG * 0.75)}, ${Math.round(avgB * 0.55)}`,
          outer: `${Math.round(avgR * 0.9)}, ${Math.round(avgG * 0.6)}, ${Math.round(avgB * 0.35)}`
        };
      }
      return colorPalettes['2700k'];
    } catch (err) {
      return colorPalettes['2700k'];
    }
  }

  function applyGlowPalette(palette) {
    document.documentElement.style.setProperty('--glow-rgb-core', palette.core);
    document.documentElement.style.setProperty('--glow-rgb-mid', palette.mid);
    document.documentElement.style.setProperty('--glow-rgb-outer', palette.outer);
  }

  function updateColorSource(source) {
    state.colorSource = source;
    colorPresetBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.source === source);
    });

    if (source === 'auto') {
      if (imgOn.complete) {
        applyGlowPalette(extractColorsFromImage(imgOn));
      } else {
        imgOn.onload = () => applyGlowPalette(extractColorsFromImage(imgOn));
      }
    } else if (colorPalettes[source]) {
      applyGlowPalette(colorPalettes[source]);
    }
  }

  // --- SMOOTH LIGHTING UPDATE ---
  function updateLighting(targetBrightness) {
    state.brightness = targetBrightness;
    const normalized = targetBrightness / 100;

    // Dissolve On-Layer smoothly
    imgOn.style.opacity = normalized.toFixed(3);

    // Ambient Bloom halo
    if (state.gradientEnabled && normalized > 0) {
      const extraGlow = (normalized * 0.9).toFixed(2);
      ambientHalo.style.opacity = extraGlow;
      ambientHalo.style.transform = `translate(-50%, -20%) scale(${1 + normalized * 0.12})`;
    } else {
      ambientHalo.style.opacity = '0';
      ambientHalo.style.transform = `translate(-50%, -20%) scale(1)`;
    }

    // Update Slider & Values
    brightnessSlider.value = targetBrightness;
    brightnessValue.textContent = `${targetBrightness}%`;
  }

  function toggleLight(forceState = null) {
    const nextState = forceState !== null ? forceState : !state.isOn;
    if (state.isOn === nextState && forceState !== null) return;

    state.isOn = nextState;

    if (state.isOn) {
      body.classList.add('lamp-is-on');
      powerText.textContent = 'ON';
      const target = state.brightness === 0 ? 100 : state.brightness;
      updateLighting(target);
      playSwitchSound('on');
    } else {
      body.classList.remove('lamp-is-on');
      powerText.textContent = 'OFF';
      updateLighting(0);
      playSwitchSound('off');
    }
  }

  // --- TOGGLE GRADIENT (ON / OFF) ---
  function setGradientEnabled(enabled) {
    state.gradientEnabled = enabled;
    gradientToggleCheckbox.checked = enabled;
    gradientStateText.textContent = enabled ? 'ON' : 'OFF';
    gradientStateText.style.color = enabled ? '#10b981' : '#888';

    if (enabled) {
      body.classList.remove('gradient-disabled');
    } else {
      body.classList.add('gradient-disabled');
    }

    updateLighting(state.brightness);
  }

  // --- LOAD LAMP INTO STUDIO ---
  function loadLampIntoStudio(index) {
    if (index < 0 || index >= catalog.length) return;
    state.activeLampIndex = index;
    const lamp = catalog[index];

    // Meta Info
    stageCategory.textContent = lamp.category.toUpperCase();
    stageTitle.textContent = lamp.shortTitle || lamp.title;
    stagePrice.textContent = lamp.price;
    officialStoreLink.href = lamp.url;

    // Image Paths
    const offSrc = lamp.offImage || (lamp.images[0] ? lamp.images[0].url : '');
    const onSrc = lamp.onImage || (lamp.images[1] ? lamp.images[1].url : offSrc);

    imgOff.src = offSrc;
    imgOn.src = onSrc;

    // Re-extract colors if auto
    if (state.colorSource === 'auto') {
      if (imgOn.complete) {
        applyGlowPalette(extractColorsFromImage(imgOn));
      } else {
        imgOn.onload = () => applyGlowPalette(extractColorsFromImage(imgOn));
      }
    }

    // Update Drawer Active Item
    updateDrawerActiveCard();

    showToast(`Memuat: ${lamp.shortTitle || lamp.title}`);
  }

  // --- GALLERY VIEW RENDERING (98 LAMPS) ---
  function renderGalleryGrid() {
    lampProductsGrid.innerHTML = '';

    let filtered = catalog.filter(lamp => {
      const matchCat = state.galleryFilter === 'all' || lamp.category.toLowerCase() === state.galleryFilter.toLowerCase();
      const q = state.gallerySearch.toLowerCase().trim();
      const matchSearch = !q || lamp.title.toLowerCase().includes(q) || lamp.category.toLowerCase().includes(q) || lamp.handle.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    // Sorting
    if (state.gallerySort === 'price-asc') {
      filtered.sort((a, b) => a.rawPrice - b.rawPrice);
    } else if (state.gallerySort === 'price-desc') {
      filtered.sort((a, b) => b.rawPrice - a.rawPrice);
    } else if (state.gallerySort === 'name-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    galleryResultsCounter.textContent = `Menampilkan ${filtered.length} dari ${catalog.length} koleksi`;

    if (filtered.length === 0) {
      lampProductsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary-light);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.5;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.8rem;">Tidak ada lampu yang cocok</h3>
          <p style="font-size: 0.85rem; margin-top: 0.5rem;">Coba sesuaikan filter kategori atau kata kunci pencarian Anda.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(lamp => {
      const card = document.createElement('div');
      card.className = 'lamp-card';
      card.dataset.lampId = lamp.id;

      const offUrl = lamp.offImage || (lamp.images[0] ? lamp.images[0].url : '');
      const onUrl = lamp.onImage || (lamp.images[1] ? lamp.images[1].url : offUrl);

      card.innerHTML = `
        <div class="card-thumbnail-viewport">
          <div class="card-ambient-glow"></div>
          <div class="card-badge-row">
            <span class="card-category-badge">${lamp.category}</span>
            <button class="card-light-toggle-btn" title="Toggle Nyala">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
            </button>
          </div>
          <img class="card-img-layer img-off" src="${offUrl}" alt="${lamp.title} Off" loading="lazy">
          <img class="card-img-layer img-on" src="${onUrl}" alt="${lamp.title} On" loading="lazy">
        </div>

        <div class="card-info-content">
          <h3 class="card-lamp-title">${lamp.shortTitle || lamp.title}</h3>
          <p class="card-lamp-subtitle">${lamp.subtitle || lamp.title}</p>
          
          <div class="card-price-row">
            <span class="card-price">${lamp.price}</span>
            <button class="card-launch-btn">
              <span>Studio</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      `;

      // Mini switch on card
      const miniToggle = card.querySelector('.card-light-toggle-btn');
      miniToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('is-lit');
        playSwitchSound(card.classList.contains('is-lit') ? 'on' : 'off');
      });

      // Card hover preview
      card.addEventListener('mouseenter', () => {
        if (!card.classList.contains('is-lit')) {
          const onImg = card.querySelector('.card-img-layer.img-on');
          const glow = card.querySelector('.card-ambient-glow');
          if (onImg) onImg.style.opacity = '1';
          if (glow) glow.style.opacity = '0.85';
        }
      });
      card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('is-lit')) {
          const onImg = card.querySelector('.card-img-layer.img-on');
          const glow = card.querySelector('.card-ambient-glow');
          if (onImg) onImg.style.opacity = '0';
          if (glow) glow.style.opacity = '0';
        }
      });

      // Open in studio click
      card.addEventListener('click', () => {
        const idx = catalog.findIndex(l => l.id === lamp.id);
        if (idx !== -1) {
          loadLampIntoStudio(idx);
          switchView('studio');
        }
      });

      lampProductsGrid.appendChild(card);
    });
  }

  // --- DRAWER RENDERING ---
  function renderDrawerList() {
    drawerList.innerHTML = '';
    const q = (drawerSearchInput.value || '').toLowerCase().trim();
    const filtered = catalog.filter(l => !q || l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q));

    filtered.forEach(lamp => {
      const originalIdx = catalog.findIndex(l => l.id === lamp.id);
      const item = document.createElement('div');
      item.className = `drawer-item-card ${originalIdx === state.activeLampIndex ? 'active' : ''}`;
      item.dataset.index = originalIdx;

      const thumbSrc = lamp.offImage || (lamp.images[0] ? lamp.images[0].url : '');

      item.innerHTML = `
        <img class="drawer-item-thumb" src="${thumbSrc}" alt="${lamp.title}" loading="lazy">
        <div style="flex:1; overflow:hidden;">
          <div style="font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: var(--amber-warm);">${lamp.category}</div>
          <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${lamp.shortTitle || lamp.title}</div>
          <div style="font-size: 0.72rem; color: var(--text-secondary-light);">${lamp.price}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        loadLampIntoStudio(originalIdx);
        lampDrawerBackdrop.classList.remove('open');
        if (state.currentView !== 'studio') switchView('studio');
      });

      drawerList.appendChild(item);
    });
  }

  function updateDrawerActiveCard() {
    document.querySelectorAll('.drawer-item-card').forEach(card => {
      card.classList.toggle('active', parseInt(card.dataset.index, 10) === state.activeLampIndex);
    });
  }

  // --- VIEW SWITCHING ---
  function switchView(viewName) {
    state.currentView = viewName;
    tabStudioBtn.classList.toggle('active', viewName === 'studio');
    tabGalleryBtn.classList.toggle('active', viewName === 'gallery');

    studioViewPanel.classList.toggle('active', viewName === 'studio');
    galleryViewPanel.classList.toggle('active', viewName === 'gallery');

    if (viewName === 'gallery') {
      renderGalleryGrid();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- EVENT HANDLERS ---
  
  // View Navigation
  tabStudioBtn.addEventListener('click', () => switchView('studio'));
  tabGalleryBtn.addEventListener('click', () => switchView('gallery'));
  brandBtn.addEventListener('click', () => switchView('studio'));
  quickBrowseBtn.addEventListener('click', () => switchView('gallery'));

  // Quick Nav Buttons
  prevLampBtn.addEventListener('click', () => {
    const nextIdx = (state.activeLampIndex - 1 + catalog.length) % catalog.length;
    loadLampIntoStudio(nextIdx);
  });
  nextLampBtn.addEventListener('click', () => {
    const nextIdx = (state.activeLampIndex + 1) % catalog.length;
    loadLampIntoStudio(nextIdx);
  });

  // EXACT ORIGINAL SWITCH CLICKS
  rockerSwitchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleLight();
  });

  pushSwitchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleLight();
  });

  leverSwitchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleLight();
  });

  leverSwitchBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleLight();
    }
  });

  sconceLamp.addEventListener('click', () => {
    toggleLight();
  });

  sconceLamp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleLight();
    }
  });

  // Switch Mode Tabs
  switchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const mode = tab.dataset.switch;
      state.currentSwitchMode = mode;

      rockerView.style.display = mode === 'rocker' ? 'flex' : 'none';
      pushView.style.display = mode === 'push' ? 'flex' : 'none';
      leverView.style.display = mode === 'lever' ? 'flex' : 'none';
    });
  });

  // Dimmer Slider
  brightnessSlider.addEventListener('input', function (e) {
    const val = parseInt(e.target.value, 10);
    if (val > 0 && !state.isOn) {
      state.isOn = true;
      body.classList.add('lamp-is-on');
      powerText.textContent = 'ON';
      playSwitchSound('on');
    } else if (val === 0 && state.isOn) {
      state.isOn = false;
      body.classList.remove('lamp-is-on');
      powerText.textContent = 'OFF';
      playSwitchSound('off');
    }
    updateLighting(val);
  });

  // Gradient Toggle & Color Preset Buttons
  gradientToggleCheckbox.addEventListener('change', (e) => {
    setGradientEnabled(e.target.checked);
  });

  colorPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      updateColorSource(btn.dataset.source);
    });
  });

  // Gallery Filter & Search
  categoryPillsRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-pill-btn');
    if (!btn) return;
    document.querySelectorAll('.category-pill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.galleryFilter = btn.dataset.cat;
    renderGalleryGrid();
  });

  gallerySearchInput.addEventListener('input', (e) => {
    state.gallerySearch = e.target.value;
    renderGalleryGrid();
  });

  gallerySortSelect.addEventListener('change', (e) => {
    state.gallerySort = e.target.value;
    renderGalleryGrid();
  });

  // Drawer Open/Close
  drawerTriggerBtn.addEventListener('click', () => {
    renderDrawerList();
    lampDrawerBackdrop.classList.add('open');
  });
  drawerCloseBtn.addEventListener('click', () => {
    lampDrawerBackdrop.classList.remove('open');
  });
  lampDrawerBackdrop.addEventListener('click', (e) => {
    if (e.target === lampDrawerBackdrop) {
      lampDrawerBackdrop.classList.remove('open');
    }
  });
  drawerSearchInput.addEventListener('input', () => {
    renderDrawerList();
  });

  // Sound & Theme Toggles
  soundToggleBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    soundToggleBtn.style.opacity = state.soundEnabled ? '1' : '0.4';
    soundToggleBtn.title = state.soundEnabled ? 'Suara Aktif' : 'Suara Dimatikan';
    showToast(state.soundEnabled ? 'Suara Saklar: Aktif' : 'Suara Saklar: Dimatikan');
  });

  themeToggleBtn.addEventListener('click', () => {
    state.isDarkMode = !state.isDarkMode;
    body.classList.toggle('dark-mode', state.isDarkMode);
    themeToggleBtn.title = state.isDarkMode ? 'Beralih ke Suasana Siang' : 'Beralih ke Suasana Malam';
    showToast(state.isDarkMode ? 'Suasana Malam (Dark Mode)' : 'Suasana Siang (Light Mode)');
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'o') {
      e.preventDefault();
      toggleLight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newVal = Math.min(100, state.brightness + 10);
      if (!state.isOn) toggleLight(true);
      updateLighting(newVal);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newVal = Math.max(0, state.brightness - 10);
      if (newVal === 0) toggleLight(false);
      else updateLighting(newVal);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevLampBtn.click();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextLampBtn.click();
    } else if (e.key.toLowerCase() === 'm') {
      soundToggleBtn.click();
    } else if (e.key.toLowerCase() === 'd') {
      themeToggleBtn.click();
    } else if (e.key.toLowerCase() === 'g') {
      switchView(state.currentView === 'studio' ? 'gallery' : 'studio');
    } else if (e.key === 'Escape') {
      lampDrawerBackdrop.classList.remove('open');
    }
  });

  // Initial Startup
  loadLampIntoStudio(state.activeLampIndex);
  updateLighting(0);

})();
