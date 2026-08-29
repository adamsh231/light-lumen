/**
 * Atelier Lumen — Main Application Orchestrator
 */
import { AppStore } from './state.js';
import { AppStudio } from './studio.js';
import { AppGallery } from './gallery.js';
import { AppRouter } from './router.js';

function getStore() {
  return window.AppStore || AppStore;
}

export function switchView(viewName, updateRoute = true) {
  const { catalog, state } = getStore();
  state.currentView = viewName;

  if (updateRoute && window.AppRouter && window.AppRouter.navigate) {
    if (viewName === 'gallery') {
      window.AppRouter.navigate('/');
    } else if (viewName === 'studio') {
      const activeLamp = catalog[state.activeLampIndex];
      window.AppRouter.navigate('/studio/' + (activeLamp ? activeLamp.handle : ''));
    }
  }

  const studioViewPanel = document.getElementById('studioViewPanel');
  const galleryViewPanel = document.getElementById('galleryViewPanel');

  if (studioViewPanel) studioViewPanel.classList.toggle('active', viewName === 'studio');
  if (galleryViewPanel) galleryViewPanel.classList.toggle('active', viewName === 'gallery');

  if (viewName === 'gallery') {
    if (window.AppGallery && window.AppGallery.renderGalleryGrid) {
      window.AppGallery.renderGalleryGrid();
    } else if (AppGallery && AppGallery.renderGalleryGrid) {
      AppGallery.renderGalleryGrid();
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function initApp() {
  const { catalog, state } = getStore();
  const body = document.body;

  const brandBtn = document.getElementById('brandBtn');
  const studioBackBtn = document.getElementById('studioBackBtn');
  const quickBrowseBtn = document.getElementById('quickBrowseBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const totalHeaderCount = document.getElementById('totalHeaderCount');

  if (totalHeaderCount) {
    totalHeaderCount.textContent = catalog.length;
  }

  // Brand and Back Navigation
  if (brandBtn) {
    brandBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.AppRouter && window.AppRouter.navigate) {
        window.AppRouter.navigate('/');
      } else {
        switchView('gallery');
      }
    });
  }

  if (studioBackBtn) {
    studioBackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.AppRouter && window.AppRouter.navigate) {
        window.AppRouter.navigate('/');
      } else {
        switchView('gallery');
      }
    });
  }

  if (quickBrowseBtn) {
    quickBrowseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.AppRouter && window.AppRouter.navigate) {
        window.AppRouter.navigate('/');
      } else {
        switchView('gallery');
      }
    });
  }

  // Sound & Theme Toggles (Silent and clean)
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundToggleBtn.style.opacity = state.soundEnabled ? '1' : '0.4';
      soundToggleBtn.title = state.soundEnabled ? 'Switch Sound: Enabled (M)' : 'Switch Sound: Muted (M)';
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      state.isDarkMode = !state.isDarkMode;
      body.classList.toggle('dark-mode', state.isDarkMode);
      themeToggleBtn.title = state.isDarkMode ? 'Switch to Day Mood (D)' : 'Switch to Night Mood (D)';
    });
  }

  // Initialize Submodules
  if (window.AppStudio && window.AppStudio.initStudio) {
    window.AppStudio.initStudio();
  } else if (AppStudio && AppStudio.initStudio) {
    AppStudio.initStudio();
  }

  if (window.AppGallery && window.AppGallery.initGallery) {
    window.AppGallery.initGallery();
  } else if (AppGallery && AppGallery.initGallery) {
    AppGallery.initGallery();
  }

  // Initialize SPA Router
  if (window.AppRouter && window.AppRouter.initRouter) {
    window.AppRouter.initRouter();
  } else if (AppRouter && AppRouter.initRouter) {
    AppRouter.initRouter();
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
      if (state.currentView === 'studio') {
        if (window.AppRouter) window.AppRouter.navigate('/');
        else switchView('gallery');
      } else {
        const lamp = catalog[state.activeLampIndex];
        if (window.AppRouter && lamp) window.AppRouter.navigate('/studio/' + lamp.handle);
        else switchView('studio');
      }
    }
  });
}

export const AppMain = {
  initApp,
  switchView
};

if (typeof window !== 'undefined') {
  window.AppMain = AppMain;
}

// Auto-init on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}

export default AppMain;
