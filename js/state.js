/**
 * In Common With — Application State Store
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AppStore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const catalog = window.LAMP_CATALOG || [];

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
    gallerySort: 'name-asc',
    galleryGridCols: 4,
    galleryMasterOn: false,
    litLamps: new Set()
  };

  // Set initial index to Luca Wall Sconce
  const lucaIdx = catalog.findIndex(l => l.handle && l.handle.includes('luca-wall-sconce-anthracite'));
  if (lucaIdx !== -1) {
    state.activeLampIndex = lucaIdx;
  }

  const colorPalettes = {
    '2200k': { core: '255, 160, 60', mid: '240, 110, 20', outer: '200, 70, 10' },
    '2700k': { core: '255, 195, 115', mid: '255, 160, 65', outer: '255, 130, 45' },
    '3500k': { core: '255, 235, 190', mid: '255, 205, 140', outer: '245, 175, 100' }
  };

  return {
    catalog,
    state,
    colorPalettes
  };
}));
