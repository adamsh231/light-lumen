/**
 * Atelier Lumen — Interactive Studio Switch Controller
 * Animated Dimmer Slider following cubic-bezier(0.25, 1, 0.5, 1) over 2.0s
 */
import { AppStore } from './state.js';
import { AppAudio } from './audio.js';
import { AppColorExtractor } from './colorExtractor.js';

function getStore() {
  return window.AppStore || AppStore;
}

function getAudio() {
  return window.AppAudio || AppAudio || { playSwitchSound: () => {} };
}

function getColorExtractor() {
  return window.AppColorExtractor || AppColorExtractor || { extractColorsFromImage: () => {}, applyGlowPalette: () => {} };
}

// Cubic Bezier (0.25, 1, 0.5, 1) timing solver
function createCubicBezier(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  function sampleCurveX(t) { return ((ax * t + bx) * t + cx) * t; }
  function sampleCurveY(t) { return ((ay * t + by) * t + cy) * t; }

  function solveCurveX(x) {
    let t0 = 0, t1 = 1, t2 = x, i;
    for (i = 0; i < 8; i++) {
      const x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < 1e-4) return t2;
      const d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
      if (Math.abs(d2) < 1e-5) break;
      t2 = t2 - x2 / d2;
    }
    while (t0 < t1) {
      const x2 = sampleCurveX(t2);
      if (Math.abs(x2 - x) < 1e-4) return t2;
      if (x > x2) t0 = t2;
      else t1 = t2;
      t2 = (t1 + t0) * 0.5;
    }
    return t2;
  }

  return function (x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return sampleCurveY(solveCurveX(x));
  };
}

const studioEase = createCubicBezier(0.25, 1, 0.5, 1);
let brightnessAnimationId = null;

export function updateLighting(targetBrightness, updateState = true) {
  const { state } = getStore();
  if (updateState) {
    state.brightness = Math.round(targetBrightness);
  }
  const normalized = targetBrightness / 100;

  const imgOn = document.getElementById('imgOn');
  const ambientHalo = document.getElementById('ambientHalo');
  const brightnessSlider = document.getElementById('brightnessSlider');
  const brightnessValue = document.getElementById('brightnessValue');

  if (imgOn) {
    imgOn.style.opacity = normalized.toFixed(3);
  }

  if (ambientHalo) {
    if (state.gradientEnabled && normalized > 0) {
      const extraGlow = (normalized * 0.9).toFixed(2);
      ambientHalo.style.opacity = extraGlow;
      ambientHalo.style.transform = `translate(-50%, -20%) scale(${1 + normalized * 0.06})`;
    } else {
      ambientHalo.style.opacity = '0';
      ambientHalo.style.transform = 'translate(-50%, -20%) scale(1)';
    }
  }

  if (brightnessSlider) brightnessSlider.value = Math.round(targetBrightness);
  if (brightnessValue) brightnessValue.textContent = `${Math.round(targetBrightness)}%`;
}

export function animateBrightnessTo(targetVal, duration = 2000) {
  const { state } = getStore();
  const brightnessSlider = document.getElementById('brightnessSlider');
  const fromVal = brightnessSlider ? parseFloat(brightnessSlider.value) || 0 : (state.brightness || 0);

  if (brightnessAnimationId) {
    cancelAnimationFrame(brightnessAnimationId);
    brightnessAnimationId = null;
  }

  if (Math.abs(fromVal - targetVal) < 0.5) {
    updateLighting(targetVal, true);
    return;
  }

  const startTimestamp = (typeof window !== 'undefined' && window.performance && typeof window.performance.now === 'function')
    ? window.performance.now()
    : Date.now();

  function step(now) {
    const currentNow = (typeof now === 'number' && !isNaN(now))
      ? now
      : ((typeof window !== 'undefined' && window.performance && typeof window.performance.now === 'function')
          ? window.performance.now()
          : Date.now());
    const elapsed = currentNow - startTimestamp;
    const progress = Math.min(1, Math.max(0, elapsed / duration));
    const eased = studioEase(progress);
    const currentVal = fromVal + (targetVal - fromVal) * eased;

    updateLighting(currentVal, false);

    if (progress < 1) {
      brightnessAnimationId = requestAnimationFrame(step);
    } else {
      updateLighting(targetVal, true);
      brightnessAnimationId = null;
    }
  }

  brightnessAnimationId = requestAnimationFrame(step);
}

export function toggleLight(forceState = null) {
  const { state } = getStore();
  const { playSwitchSound } = getAudio();
  const nextState = forceState !== null ? forceState : !state.isOn;
  if (state.isOn === nextState && forceState !== null) return;

  state.isOn = nextState;
  const body = document.body;
  const powerText = document.getElementById('powerText');

  if (state.isOn) {
    body.classList.add('lamp-is-on');
    if (powerText) powerText.textContent = 'ON';
    const target = state.brightness === 0 ? 100 : state.brightness;
    animateBrightnessTo(target, 2000);
    playSwitchSound('on');
  } else {
    body.classList.remove('lamp-is-on');
    if (powerText) powerText.textContent = 'OFF';
    animateBrightnessTo(0, 2000);
    playSwitchSound('off');
  }
}

export function setGradientEnabled(enabled) {
  const { state } = getStore();
  state.gradientEnabled = enabled;
  const gradientToggleCheckbox = document.getElementById('gradientToggle');
  const gradientStateText = document.getElementById('gradientStateText');
  const body = document.body;

  if (gradientToggleCheckbox) gradientToggleCheckbox.checked = enabled;
  if (gradientStateText) {
    gradientStateText.textContent = enabled ? 'ON' : 'OFF';
    gradientStateText.style.color = enabled ? '#10b981' : '#888';
  }

  if (enabled) {
    body.classList.remove('gradient-disabled');
  } else {
    body.classList.add('gradient-disabled');
  }

  updateLighting(state.brightness);
}

export function updateColorSource(source) {
  const { state, colorPalettes } = getStore();
  const { extractColorsFromImage, applyGlowPalette } = getColorExtractor();
  const imgOn = document.getElementById('imgOn');
  const colorPresetBtns = document.querySelectorAll('.color-preset-pills .color-btn');

  state.colorSource = source;
  colorPresetBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.source === source);
  });

  if (source === 'auto') {
    if (imgOn && imgOn.complete) {
      applyGlowPalette(extractColorsFromImage(imgOn));
    } else if (imgOn) {
      imgOn.onload = () => applyGlowPalette(extractColorsFromImage(imgOn));
    }
  } else if (colorPalettes && colorPalettes[source]) {
    applyGlowPalette(colorPalettes[source]);
  }
}

export function loadLampIntoStudio(index, updateRoute = false, showNotification = false) {
  const { catalog, state } = getStore();
  const { extractColorsFromImage, applyGlowPalette } = getColorExtractor();

  if (index < 0 || index >= catalog.length) return;
  state.activeLampIndex = index;
  const lamp = catalog[index];

  if (updateRoute && window.AppRouter && lamp && lamp.handle) {
    window.AppRouter.navigate('/studio/' + lamp.handle);
  }

  const stageCategory = document.getElementById('stageCategory');
  const stageTitle = document.getElementById('stageTitle');
  const stagePrice = document.getElementById('stagePrice');
  const imgOff = document.getElementById('imgOff');
  const imgOn = document.getElementById('imgOn');

  if (stageCategory) stageCategory.textContent = lamp.category.toUpperCase();
  if (stageTitle) stageTitle.textContent = lamp.shortTitle || lamp.title;
  if (stagePrice) stagePrice.textContent = lamp.price;

  function fixAssetUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('/')) {
      return url;
    }
    return '/' + url;
  }

  const offSrc = fixAssetUrl(lamp.offImage || (lamp.images && lamp.images[0] ? lamp.images[0].url : ''));
  const onSrc = fixAssetUrl(lamp.onImage || (lamp.images && lamp.images[1] ? lamp.images[1].url : offSrc));

  if (imgOff) imgOff.src = offSrc;
  if (imgOn) imgOn.src = onSrc;

  const stageCounterBadge = document.getElementById('stageCounterBadge');
  if (stageCounterBadge) {
    stageCounterBadge.textContent = `${index + 1} / ${catalog.length}`;
  }

  if (state.colorSource === 'auto') {
    if (imgOn && imgOn.complete) {
      applyGlowPalette(extractColorsFromImage(imgOn));
    } else if (imgOn) {
      imgOn.onload = () => applyGlowPalette(extractColorsFromImage(imgOn));
    }
  }
}

export function initStudio() {
  const { catalog, state } = getStore();
  const body = document.body;

  const sconceLamp = document.getElementById('sconceLamp');
  const prevLampBtn = document.getElementById('prevLampBtn');
  const nextLampBtn = document.getElementById('nextLampBtn');
  const switchTabs = document.querySelectorAll('.switch-mode-tabs .tab-btn');
  const rockerView = document.getElementById('rockerView');
  const pushView = document.getElementById('pushView');
  const leverView = document.getElementById('leverView');
  const rockerSwitchBtn = document.getElementById('rockerSwitchBtn');
  const pushSwitchBtn = document.getElementById('pushSwitchBtn');
  const leverSwitchBtn = document.getElementById('leverSwitchBtn');
  const brightnessSlider = document.getElementById('brightnessSlider');
  const powerText = document.getElementById('powerText');
  const gradientToggleCheckbox = document.getElementById('gradientToggle');
  const colorPresetBtns = document.querySelectorAll('.color-preset-pills .color-btn');

  // Studio Dock Dropdown & Popover Elements
  const switchStyleDropdownBtn = document.getElementById('switchStyleDropdownBtn');
  const switchStyleDropdownMenu = document.getElementById('switchStyleDropdownMenu');
  const switchStyleBtnLabel = document.getElementById('switchStyleBtnLabel');
  const studioAmbienceBtn = document.getElementById('studioAmbienceBtn');
  const studioAmbiencePopover = document.getElementById('studioAmbiencePopover');

  // Previous & Next Navigation
  if (prevLampBtn) {
    prevLampBtn.addEventListener('click', () => {
      const nextIdx = (state.activeLampIndex - 1 + catalog.length) % catalog.length;
      loadLampIntoStudio(nextIdx, true, true);
    });
  }

  if (nextLampBtn) {
    nextLampBtn.addEventListener('click', () => {
      const nextIdx = (state.activeLampIndex + 1) % catalog.length;
      loadLampIntoStudio(nextIdx, true, true);
    });
  }

  // Switch Clicks (with stopPropagation to avoid double-toggle bubbling to sconceLamp)
  if (rockerSwitchBtn) {
    rockerSwitchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLight();
    });
  }

  if (pushSwitchBtn) {
    pushSwitchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLight();
    });
  }

  if (leverSwitchBtn) {
    leverSwitchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLight();
    });
    leverSwitchBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        toggleLight();
      }
    });
  }

  const seamlessSwitchStage = document.getElementById('seamlessSwitchStage');
  if (seamlessSwitchStage) {
    seamlessSwitchStage.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (sconceLamp) {
    sconceLamp.addEventListener('click', (e) => {
      // Only toggle if clicking the canvas background or lamp image itself
      if (e.target.closest('#seamlessSwitchStage')) return;
      toggleLight();
    });
    sconceLamp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLight();
      }
    });
  }

  // Switch Style Popover Trigger
  if (switchStyleDropdownBtn && switchStyleDropdownMenu) {
    switchStyleDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (studioAmbiencePopover) studioAmbiencePopover.classList.remove('open');
      const isOpen = switchStyleDropdownMenu.classList.toggle('open');
      switchStyleDropdownBtn.classList.toggle('active', isOpen);
      switchStyleDropdownBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Ambience Popover Trigger
  if (studioAmbienceBtn && studioAmbiencePopover) {
    studioAmbienceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (switchStyleDropdownMenu) switchStyleDropdownMenu.classList.remove('open');
      const isOpen = studioAmbiencePopover.classList.toggle('open');
      studioAmbienceBtn.classList.toggle('active', isOpen);
      studioAmbienceBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Close Studio Popovers on Click Outside
  document.addEventListener('click', (e) => {
    if (switchStyleDropdownMenu && !switchStyleDropdownMenu.contains(e.target) && !switchStyleDropdownBtn?.contains(e.target)) {
      switchStyleDropdownMenu.classList.remove('open');
      if (switchStyleDropdownBtn) switchStyleDropdownBtn.classList.remove('active');
    }
    if (studioAmbiencePopover && !studioAmbiencePopover.contains(e.target) && !studioAmbienceBtn?.contains(e.target)) {
      studioAmbiencePopover.classList.remove('open');
      if (studioAmbienceBtn) studioAmbienceBtn.classList.remove('active');
    }
  });

  // Switch Mode Tabs (Inside Dock Menu)
  switchTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      switchTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const mode = tab.dataset.switch;
      state.currentSwitchMode = mode;

      if (switchStyleBtnLabel) {
        const labelMap = { rocker: 'Rocker', push: 'Push Button', lever: 'Toggle Lever' };
        switchStyleBtnLabel.textContent = labelMap[mode] || 'Rocker';
      }

      if (rockerView) rockerView.style.display = mode === 'rocker' ? 'flex' : 'none';
      if (pushView) pushView.style.display = mode === 'push' ? 'flex' : 'none';
      if (leverView) leverView.style.display = mode === 'lever' ? 'flex' : 'none';

      if (switchStyleDropdownMenu) switchStyleDropdownMenu.classList.remove('open');
      if (switchStyleDropdownBtn) switchStyleDropdownBtn.classList.remove('active');
    });
  });

  // Dimmer Range Slider
  if (brightnessSlider) {
    brightnessSlider.addEventListener('input', function (e) {
      if (brightnessAnimationId) {
        cancelAnimationFrame(brightnessAnimationId);
        brightnessAnimationId = null;
      }

      const val = parseInt(e.target.value, 10);
      if (val > 0 && !state.isOn) {
        state.isOn = true;
        body.classList.add('lamp-is-on');
        if (powerText) powerText.textContent = 'ON';
        getAudio().playSwitchSound('on');
      } else if (val === 0 && state.isOn) {
        state.isOn = false;
        body.classList.remove('lamp-is-on');
        if (powerText) powerText.textContent = 'OFF';
        getAudio().playSwitchSound('off');
      }
      updateLighting(val, true);
    });
  }

  // Gradient Toggle & Color Preset Buttons
  if (gradientToggleCheckbox) {
    gradientToggleCheckbox.addEventListener('change', (e) => {
      setGradientEnabled(e.target.checked);
    });
  }

  colorPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      updateColorSource(btn.dataset.source);
    });
  });

  // Startup lamp load
  loadLampIntoStudio(state.activeLampIndex, false, false);
  updateLighting(0);
}

export const AppStudio = {
  initStudio,
  updateLighting,
  animateBrightnessTo,
  toggleLight,
  setGradientEnabled,
  updateColorSource,
  loadLampIntoStudio
};

if (typeof window !== 'undefined') {
  window.AppStudio = AppStudio;
}

export default AppStudio;
