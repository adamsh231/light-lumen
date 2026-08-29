/**
 * Atelier Lumen — Toast Notification Pill
 */

let toastTimer = null;

export function showToast(text) {
  if (typeof document === 'undefined') return;
  const toastPill = document.getElementById('toastPill');
  if (!toastPill) return;
  toastPill.textContent = text;
  toastPill.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastPill.classList.remove('show');
  }, 2200);
}

export const AppToast = {
  showToast
};

if (typeof window !== 'undefined') {
  window.AppToast = AppToast;
}

export default AppToast;
