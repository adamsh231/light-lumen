/**
 * Atelier Lumen — HTML5 History API SPA Router (Clean URLs without '#')
 * Provides clean paths: '/' (Collection Grid) and '/studio/:handle' (Interactive Studio)
 */
import { AppStore } from './state.js';

function getStore() {
  return window.AppStore || AppStore;
}

export function parsePath(pathname = (typeof window !== 'undefined' ? window.location.pathname : '/')) {
  if (typeof window === 'undefined') return { path: 'gallery', param: null };

  let path = pathname.trim();
  // Support migration if user opens legacy hash URL
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    path = window.location.hash.substring(1);
  }

  // Remove trailing slash
  path = path.replace(/\/+$/, '');
  if (!path || path === '') {
    return { path: 'gallery', param: null };
  }

  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) {
    return { path: 'gallery', param: null };
  }

  if (segments[0] === 'studio' || segments[0] === 'lamp') {
    return { path: 'studio', param: segments[1] || null };
  }

  return { path: 'gallery', param: null };
}

export function navigate(targetPath, replace = false) {
  if (typeof window === 'undefined') return;

  // Clean path format (e.g. /studio/lamp-handle or /)
  let cleanPath = targetPath.startsWith('#') ? targetPath.substring(1) : targetPath;
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  if (window.location.pathname !== cleanPath) {
    if (replace) {
      window.history.replaceState({}, '', cleanPath);
    } else {
      window.history.pushState({}, '', cleanPath);
    }
  }

  handleRouteChange();
}

export function handleRouteChange() {
  const route = parsePath();
  const { catalog, state } = getStore();

  if (route.path === 'studio') {
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

  window.addEventListener('popstate', handleRouteChange);

  // Convert legacy hash to clean URL if present
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    const clean = window.location.hash.substring(1);
    window.history.replaceState({}, '', clean);
  }

  handleRouteChange();
}

export const AppRouter = {
  initRouter,
  navigate,
  parsePath,
  handleRouteChange
};

if (typeof window !== 'undefined') {
  window.AppRouter = AppRouter;
}

export default AppRouter;
