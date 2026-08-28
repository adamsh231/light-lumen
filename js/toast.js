/**
 * In Common With — Toast Notification Pill
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AppToast = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let toastTimer = null;
  const toastPill = document.getElementById('toastPill');

  function showToast(text) {
    if (!toastPill) return;
    toastPill.textContent = text;
    toastPill.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastPill.classList.remove('show');
    }, 2200);
  }

  return {
    showToast
  };
}));
