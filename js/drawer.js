/**
 * Atelier Lumen — Quick Lamp Selector Drawer Controller
 */
import { AppStore } from './state.js';

function getStore() {
  return window.AppStore || AppStore;
}

export function renderDrawerList() {
  const drawerList = document.getElementById('drawerList');
  const drawerSearchInput = document.getElementById('drawerSearchInput');
  const lampDrawerBackdrop = document.getElementById('lampDrawerBackdrop');
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

    function fixAssetUrl(url) {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('/')) {
        return url;
      }
      return '/' + url;
    }

    const thumbSrc = fixAssetUrl(lamp.offImage || (lamp.images && lamp.images[0] ? lamp.images[0].url : ''));

    item.innerHTML = `
      <img class="drawer-item-thumb" src="${thumbSrc}" alt="${lamp.title}" loading="lazy">
      <div style="flex:1; overflow:hidden;">
        <div style="font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: var(--amber-warm);">${lamp.category}</div>
        <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${lamp.shortTitle || lamp.title}</div>
        <div style="font-size: 0.72rem; color: var(--text-secondary-light);">${lamp.price}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      if (lampDrawerBackdrop) lampDrawerBackdrop.classList.remove('open');
      if (window.AppRouter && window.AppRouter.navigate && lamp.handle) {
        window.AppRouter.navigate('/studio/' + lamp.handle);
      } else {
        if (window.AppStudio && window.AppStudio.loadLampIntoStudio) {
          window.AppStudio.loadLampIntoStudio(originalIdx, false, true);
        }
        if (window.AppMain && window.AppMain.switchView) {
          window.AppMain.switchView('studio');
        }
      }
    });

    drawerList.appendChild(item);
  });
}

export function updateDrawerActiveCard() {
  const { state } = getStore();
  document.querySelectorAll('.drawer-item-card').forEach(card => {
    card.classList.toggle('active', parseInt(card.dataset.index, 10) === state.activeLampIndex);
  });
}

export function initDrawer() {
  const drawerTriggerBtn = document.getElementById('drawerTriggerBtn');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const lampDrawerBackdrop = document.getElementById('lampDrawerBackdrop');
  const drawerSearchInput = document.getElementById('drawerSearchInput');

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

export const AppDrawer = {
  initDrawer,
  renderDrawerList,
  updateDrawerActiveCard
};

if (typeof window !== 'undefined') {
  window.AppDrawer = AppDrawer;
}

export default AppDrawer;
