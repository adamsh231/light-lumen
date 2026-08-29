/**
 * Atelier Lumen — Interactive Studio Switch Controller
 */
import { AppStore } from './state.js';
import { AppAudio } from './audio.js';
import { AppColorExtractor } from './colorExtractor.js';
import { AppToast } from './toast.js';

function getStore() {
  return window.AppStore || AppStore;
}

function getAudio() {
  return window.AppAudio || AppAudio || { playSwitchSound: () => {} };
}

function getColorExtractor() {
  return window.AppColorExtractor || AppColorExtractor || { extractColorsFromImage: () => {}, applyGlowPalette: () => {} };
}

function getToast() {
  return window.AppToast || AppToast || { showToast: () => {} };
}

export function updateLighting(targetBrightness) {
  const { state } = getStore();
  state.brightness = targetBrightness;
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

  if (brightnessSlider) brightnessSlider.value = targetBrightness;
  if (brightnessValue) brightnessValue.textContent = `${targetBrightness}%`;
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
    updateLighting(target);
    playSwitchSound('on');
  } else {
    body.classList.remove('lamp-is-on');
    if (powerText) powerText.textContent = 'OFF';
    updateLighting(0);
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
  const { showToast } = getToast();
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

  const offSrc = lamp.offImage || (lamp.images && lamp.images[0] ? lamp.images[0].url : '');
  const onSrc = lamp.onImage || (lamp.images && lamp.images[1] ? lamp.images[1].url : offSrc);

  if (imgOff) imgOff.src = offSrc;
  if (imgOn) imgOn.src = onSrc;

  if (state.colorSource === 'auto') {
    if (imgOn && imgOn.complete) {
      applyGlowPalette(extractColorsFromImage(imgOn));
    } else if (imgOn) {
      imgOn.onload = () => applyGlowPalette(extractColorsFromImage(imgOn));
    }
  }

  if (window.AppDrawer && window.AppDrawer.updateDrawerActiveCard) {
    window.AppDrawer.updateDrawerActiveCard();
  }

  if (showNotification) {
    showToast(`Memuat: ${lamp.shortTitle || lamp.title}`);
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

  // Switch Clicks
  if (rockerSwitchBtn) {
    rockerSwitchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLight();
    });
  }

  if (pushSwitchBtn) {
    pushSwitchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLight();
    });
  }

  if (leverSwitchBtn) {
    leverSwitchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLight();
    });
    leverSwitchBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLight();
      }
    });
  }

  if (sconceLamp) {
    sconceLamp.addEventListener('click', () => toggleLight());
    sconceLamp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLight();
      }
    });
  }

  // Switch Mode Tabs
  switchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const mode = tab.dataset.switch;
      state.currentSwitchMode = mode;

      if (rockerView) rockerView.style.display = mode === 'rocker' ? 'flex' : 'none';
      if (pushView) pushView.style.display = mode === 'push' ? 'flex' : 'none';
      if (leverView) leverView.style.display = mode === 'lever' ? 'flex' : 'none';
    });
  });

  // Dimmer Range Slider
  if (brightnessSlider) {
    brightnessSlider.addEventListener('input', function (e) {
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
      updateLighting(val);
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
  toggleLight,
  setGradientEnabled,
  updateColorSource,
  loadLampIntoStudio
};

if (typeof window !== 'undefined') {
  window.AppStudio = AppStudio;
}

export default AppStudio;
