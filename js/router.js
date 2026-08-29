/**
 * Atelier Lumen — Client-Side SPA Hash Router
 * Handles hash routes (e.g. #/ for collection, #/studio/:handle for lamp studio)
 * Guarantees view and active lamp persistence on page refresh.
 */
import { AppStore } from './state.js';

function getStore() {
  return window.AppStore || AppStore;
}

export function parseHash() {
  if (typeof window === 'undefined') return { path: 'gallery', param: null };
  let hash = window.location.hash.trim();
  if (hash.startsWith('#')) {
    hash = hash.substring(1);
  }
  if (!hash || hash === '/') {
    return { path: 'gallery', param: null };
  }

  const segments = hash.split('/').filter(Boolean);
  if (segments.length === 0) {
    return { path: 'gallery', param: null };
  }

  if (segments[0] === 'studio' || segments[0] === 'lamp') {
    return { path: 'studio', param: segments[1] || null };
  }

  if (segments[0] === 'gallery' || segments[0] === 'collection') {
    return { path: 'gallery', param: null };
  }

  return { path: 'gallery', param: null };
}

export function navigate(path) {
  if (typeof window === 'undefined') return;
  if (!path.startsWith('#')) {
    path = '#' + (path.startsWith('/') ? path : '/' + path);
  }
  if (window.location.hash === path) {
    handleRouteChange();
  } else {
    window.location.hash = path;
  }
}

export function handleRouteChange() {
  const route = parseHash();
  const { catalog, state } = getStore();

  if (route.path === 'studio') {
    // Find lamp by handle or numeric ID or default
    if (route.param) {
      const decodedParam = decodeURIComponent(route.param).toLowerCase();
      let lampIndex = catalog.findIndex(l => 
        (l.handle && l.handle.toLowerCase() === decodedParam) || 
        String(l.id) === decodedParam ||
        (l.shortTitle && l.shortTitle.toLowerCase().replace(/\s+/g, '-') === decodedParam)
      );

      if (lampIndex !== -1) {
        state.activeLampIndex = lampIndex;
      }
    }

    if (window.AppStudio && window.AppStudio.loadLampIntoStudio) {
      window.AppStudio.loadLampIntoStudio(state.activeLampIndex, false, false);
    }

    if (window.AppMain && window.AppMain.switchView) {
      window.AppMain.switchView('studio', false);
    }
  } else {
    // Default: Gallery Collection View
    if (window.AppMain && window.AppMain.switchView) {
      window.AppMain.switchView('gallery', false);
    }
  }
}

export function initRouter() {
  if (typeof window === 'undefined') return;
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}

export const AppRouter = {
  initRouter,
  navigate,
  parseHash,
  handleRouteChange
};

if (typeof window !== 'undefined') {
  window.AppRouter = AppRouter;
}

export default AppRouter;
