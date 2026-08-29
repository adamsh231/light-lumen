/**
 * Atelier Lumen — Application State Store
 */
import LAMP_CATALOG from '../lampCatalog.js';

const catalog = (typeof window !== 'undefined' && window.LAMP_CATALOG) || LAMP_CATALOG || [];

export const state = {
  isOn: false,
  brightness: 0,
  currentView: 'gallery',
  currentSwitchMode: 'rocker',
  soundEnabled: true,
  isDarkMode: false,
  gradientEnabled: true,
  colorSource: 'auto',
  activeLampIndex: 0,
  galleryFilter: 'all',
  gallerySearch: '',
  gallerySort: 'name-asc',
  galleryGridCols: 4,
  galleryMasterOn: false,
  litLamps: new Set(),
  // Custom Overlay Visibility (Default: ALL FALSE / HIDDEN)
  overlayConfig: {
    showTitle: false,
    showCategory: false,
    showPrice: false,
    showStudioBtn: false,
    showTopBar: false
  }
};

export const colorPalettes = {
  '2200k': { core: '255, 160, 60', mid: '240, 110, 20', outer: '200, 70, 10' },
  '2700k': { core: '255, 195, 115', mid: '255, 160, 65', outer: '255, 130, 45' },
  '3500k': { core: '255, 235, 190', mid: '255, 205, 140', outer: '245, 175, 100' }
};

export const AppStore = {
  catalog,
  state,
  colorPalettes
};

if (typeof window !== 'undefined') {
  window.AppStore = AppStore;
}

export default AppStore;
