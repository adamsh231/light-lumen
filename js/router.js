/**
 * Atelier Lumen — HTML5 History API SPA Router (Clean URLs without '#')
 * Provides clean paths: '/' (Collection Grid) and '/studio/:handle' (Interactive Studio)
 * Guarantees active studio lamp persistence across page reloads.
 */
import { AppStore } from './state.js';
import { AppStudio } from './studio.js';
import { AppGallery } from './gallery.js';

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

  const studioViewPanel = document.getElementById('studioViewPanel');
  const galleryViewPanel = document.getElementById('galleryViewPanel');

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
      } else {
        state.activeLampIndex = 0;
      }
    } else {
      state.activeLampIndex = 0;
    }

    state.currentView = 'studio';
    document.documentElement.classList.add('route-studio');
    document.documentElement.classList.remove('route-gallery');

    if (studioViewPanel) studioViewPanel.classList.add('active');
    if (galleryViewPanel) galleryViewPanel.classList.remove('active');

    if (window.AppStudio && window.AppStudio.loadLampIntoStudio) {
      window.AppStudio.loadLampIntoStudio(state.activeLampIndex, false, false);
    } else if (AppStudio && AppStudio.loadLampIntoStudio) {
      AppStudio.loadLampIntoStudio(state.activeLampIndex, false, false);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Default: Gallery Collection View
    state.currentView = 'gallery';
    document.documentElement.classList.add('route-gallery');
    document.documentElement.classList.remove('route-studio');

    if (studioViewPanel) studioViewPanel.classList.remove('active');
    if (galleryViewPanel) galleryViewPanel.classList.add('active');

    if (window.AppGallery && window.AppGallery.renderGalleryGrid) {
      window.AppGallery.renderGalleryGrid();
    } else if (AppGallery && AppGallery.renderGalleryGrid) {
      AppGallery.renderGalleryGrid();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
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
