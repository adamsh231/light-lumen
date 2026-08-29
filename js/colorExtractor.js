/**
 * Atelier Lumen — Color Extractor (Auto Sample Glow Palette from Fixture Image)
 */

export function extractColorsFromImage(imgEl) {
  if (typeof document === 'undefined') {
    return { core: '255, 195, 115', mid: '255, 160, 65', outer: '255, 130, 45' };
  }
  const store = window.AppStore;
  const defaultPalette = (store && store.colorPalettes && store.colorPalettes['2700k']) || {
    core: '255, 195, 115',
    mid: '255, 160, 65',
    outer: '255, 130, 45'
  };

  try {
    const samplerCanvas = document.getElementById('colorSamplerCanvas');
    const samplerCtx = samplerCanvas ? samplerCanvas.getContext('2d', { willReadFrequently: true }) : null;

    if (!samplerCtx || !imgEl || !imgEl.complete || imgEl.naturalWidth === 0) {
      return defaultPalette;
    }
    samplerCanvas.width = 40;
    samplerCanvas.height = 40;
    samplerCtx.clearRect(0, 0, 40, 40);
    samplerCtx.drawImage(imgEl, 0, 0, 40, 40);

    const imgData = samplerCtx.getImageData(0, 0, 40, 40).data;
    let rSum = 0, gSum = 0, bSum = 0, count = 0;

    for (let i = 0; i < imgData.length; i += 4) {
      const a = imgData[i + 3];
      if (a > 50) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        if (r > 120 || (r + g + b) > 300) {
          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }
      }
    }

    if (count > 0) {
      const avgR = Math.min(255, Math.max(160, Math.round(rSum / count)));
      const avgG = Math.min(240, Math.max(100, Math.round(gSum / count)));
      const avgB = Math.min(200, Math.max(40, Math.round(bSum / count)));
      return {
        core: `${avgR}, ${avgG}, ${avgB}`,
        mid: `${Math.round(avgR * 0.95)}, ${Math.round(avgG * 0.75)}, ${Math.round(avgB * 0.55)}`,
        outer: `${Math.round(avgR * 0.9)}, ${Math.round(avgG * 0.6)}, ${Math.round(avgB * 0.35)}`
      };
    }
    return defaultPalette;
  } catch (err) {
    return defaultPalette;
  }
}

export function applyGlowPalette(palette) {
  if (!palette || typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--glow-rgb-core', palette.core);
  document.documentElement.style.setProperty('--glow-rgb-mid', palette.mid);
  document.documentElement.style.setProperty('--glow-rgb-outer', palette.outer);
}

export const AppColorExtractor = {
  extractColorsFromImage,
  applyGlowPalette
};

if (typeof window !== 'undefined') {
  window.AppColorExtractor = AppColorExtractor;
}

export default AppColorExtractor;
