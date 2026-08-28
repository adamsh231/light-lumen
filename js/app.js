/**
 * In Common With — Main Application Orchestrator
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AppMain = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // DOM Elements
  const body = document.body;
  const tabStudioBtn = document.getElementById('tabStudioBtn');
  const tabGalleryBtn = document.getElementById('tabGalleryBtn');
  const studioViewPanel = document.getElementById('studioViewPanel');
  const galleryViewPanel = document.getElementById('galleryViewPanel');
  const brandBtn = document.getElementById('brandBtn');
  const quickBrowseBtn = document.getElementById('quickBrowseBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const totalHeaderCount = document.getElementById('totalHeaderCount');

  function getStore() {
    return window.AppStore || { state: {}, catalog: [] };
  }

  function getToast() {
    return window.AppToast || { showToast: () => {} };
  }

  function switchView(viewName) {
    const { state } = getStore();
    state.currentView = viewName;

    if (tabStudioBtn) tabStudioBtn.classList.toggle('active', viewName === 'studio');
    if (tabGalleryBtn) tabGalleryBtn.classList.toggle('active', viewName === 'gallery');

    if (studioViewPanel) studioViewPanel.classList.toggle('active', viewName === 'studio');
    if (galleryViewPanel) galleryViewPanel.classList.toggle('active', viewName === 'gallery');

    if (viewName === 'gallery' && window.AppGallery && window.AppGallery.renderGalleryGrid) {
      window.AppGallery.renderGalleryGrid();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initApp() {
    const { catalog, state } = getStore();
    const { showToast } = getToast();

    if (totalHeaderCount) {
      totalHeaderCount.textContent = catalog.length;
    }

    // View Navigation Tabs
    if (tabStudioBtn) tabStudioBtn.addEventListener('click', () => switchView('studio'));
    if (tabGalleryBtn) tabGalleryBtn.addEventListener('click', () => switchView('gallery'));
    if (brandBtn) brandBtn.addEventListener('click', () => switchView('studio'));
    if (quickBrowseBtn) quickBrowseBtn.addEventListener('click', () => switchView('gallery'));

    // Sound & Theme Toggles
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        soundToggleBtn.style.opacity = state.soundEnabled ? '1' : '0.4';
        soundToggleBtn.title = state.soundEnabled ? 'Suara Aktif' : 'Suara Dimatikan';
        showToast(state.soundEnabled ? 'Suara Saklar: Aktif' : 'Suara Saklar: Dimatikan');
      });
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        state.isDarkMode = !state.isDarkMode;
        body.classList.toggle('dark-mode', state.isDarkMode);
        themeToggleBtn.title = state.isDarkMode ? 'Beralih ke Suasana Siang' : 'Beralih ke Suasana Malam';
        showToast(state.isDarkMode ? 'Suasana Malam (Dark Mode)' : 'Suasana Siang (Light Mode)');
      });
    }

    // Initialize Submodules
    if (window.AppStudio && window.AppStudio.initStudio) {
      window.AppStudio.initStudio();
    }

    if (window.AppGallery && window.AppGallery.initGallery) {
      window.AppGallery.initGallery();
    }

    if (window.AppDrawer && window.AppDrawer.initDrawer) {
      window.AppDrawer.initDrawer();
    }

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'o') {
        e.preventDefault();
        if (state.currentView === 'studio' && window.AppStudio) {
          window.AppStudio.toggleLight();
        } else if (state.currentView === 'gallery' && window.AppGallery) {
          window.AppGallery.toggleMasterGallerySwitch();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (window.AppStudio) {
          const newVal = Math.min(100, state.brightness + 10);
          if (!state.isOn) window.AppStudio.toggleLight(true);
          window.AppStudio.updateLighting(newVal);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (window.AppStudio) {
          const newVal = Math.max(0, state.brightness - 10);
          if (newVal === 0) window.AppStudio.toggleLight(false);
          else window.AppStudio.updateLighting(newVal);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevBtn = document.getElementById('prevLampBtn');
        if (prevBtn) prevBtn.click();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextBtn = document.getElementById('nextLampBtn');
        if (nextBtn) nextBtn.click();
      } else if (e.key.toLowerCase() === 'm') {
        if (soundToggleBtn) soundToggleBtn.click();
      } else if (e.key.toLowerCase() === 'd') {
        if (themeToggleBtn) themeToggleBtn.click();
      } else if (e.key.toLowerCase() === 'g') {
        switchView(state.currentView === 'studio' ? 'gallery' : 'studio');
      } else if (e.key === 'Escape') {
        const backdrop = document.getElementById('lampDrawerBackdrop');
        if (backdrop) backdrop.classList.remove('open');
      }
    });
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  return {
    initApp,
    switchView
  };
}));
