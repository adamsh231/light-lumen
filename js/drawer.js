/**
 * In Common With — Quick Lamp Selector Drawer Controller
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AppDrawer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // DOM Elements
  const lampDrawerBackdrop = document.getElementById('lampDrawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerList = document.getElementById('drawerList');
  const drawerSearchInput = document.getElementById('drawerSearchInput');
  const drawerTriggerBtn = document.getElementById('drawerTriggerBtn');

  function getStore() {
    return window.AppStore || { state: {}, catalog: [] };
  }

  function renderDrawerList() {
    if (!drawerList) return;
    const { catalog, state } = getStore();

    drawerList.innerHTML = '';
    const q = (drawerSearchInput ? drawerSearchInput.value : '').toLowerCase().trim();
    const filtered = catalog.filter(l => !q || l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q));

    filtered.forEach(lamp => {
      const originalIdx = catalog.findIndex(l => l.id === lamp.id);
      const item = document.createElement('div');
      item.className = `drawer-item-card ${originalIdx === state.activeLampIndex ? 'active' : ''}`;
      item.dataset.index = originalIdx;

      const thumbSrc = lamp.offImage || (lamp.images && lamp.images[0] ? lamp.images[0].url : '');

      item.innerHTML = `
        <img class="drawer-item-thumb" src="${thumbSrc}" alt="${lamp.title}" loading="lazy">
        <div style="flex:1; overflow:hidden;">
          <div style="font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: var(--amber-warm);">${lamp.category}</div>
          <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${lamp.shortTitle || lamp.title}</div>
          <div style="font-size: 0.72rem; color: var(--text-secondary-light);">${lamp.price}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        if (window.AppStudio && window.AppStudio.loadLampIntoStudio) {
          window.AppStudio.loadLampIntoStudio(originalIdx);
        }
        if (lampDrawerBackdrop) lampDrawerBackdrop.classList.remove('open');
        if (window.AppMain && window.AppMain.switchView) {
          window.AppMain.switchView('studio');
        }
      });

      drawerList.appendChild(item);
    });
  }

  function updateDrawerActiveCard() {
    const { state } = getStore();
    document.querySelectorAll('.drawer-item-card').forEach(card => {
      card.classList.toggle('active', parseInt(card.dataset.index, 10) === state.activeLampIndex);
    });
  }

  function initDrawer() {
    if (drawerTriggerBtn) {
      drawerTriggerBtn.addEventListener('click', () => {
        renderDrawerList();
        if (lampDrawerBackdrop) lampDrawerBackdrop.classList.add('open');
      });
    }

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', () => {
        if (lampDrawerBackdrop) lampDrawerBackdrop.classList.remove('open');
      });
    }

    if (lampDrawerBackdrop) {
      lampDrawerBackdrop.addEventListener('click', (e) => {
        if (e.target === lampDrawerBackdrop) {
          lampDrawerBackdrop.classList.remove('open');
        }
      });
    }

    if (drawerSearchInput) {
      drawerSearchInput.addEventListener('input', () => {
        renderDrawerList();
      });
    }
  }

  return {
    initDrawer,
    renderDrawerList,
    updateDrawerActiveCard
  };
}));
