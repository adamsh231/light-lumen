/**
 * In Common With — Application Root Entrypoint
 * This file delegates to the modular architecture in js/
 */
(function () {
  'use strict';
  // If modules are already loaded via script tags, ensure init
  if (window.AppMain && window.AppMain.initApp && document.readyState !== 'loading') {
    window.AppMain.initApp();
  }
})();
