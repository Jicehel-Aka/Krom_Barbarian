import stageForestUrl from '../assets/images/stage_forest_pixel_1793121003697.jpg';
import stageCryptUrl from '../assets/images/stage_crypt_pixel_1793121006436.jpg';
import stageArenaUrl from '../assets/images/stage_arena_pixel_1793121009126.jpg';
import stageSanctuaryUrl from '../assets/images/stage_sanctuary_pixel_1793121025789.jpg';
import zone1TrailUrl from '../assets/images/zone1_misty_monolith_trail_1793183421592.jpg';
import zone2CryptUrl from '../assets/images/zone2_obsidian_crypt_descent_1793183422836.jpg';
import zone3TunnelUrl from '../assets/images/zone3_gladiator_bone_tunnel_1793183425359.jpg';
import zone4BridgeUrl from '../assets/images/zone4_storm_citadel_bridge_1793183427257.jpg';
import storyInterludeUrl from '../assets/images/story_interlude_chronicle_art_1793183427577.jpg';
import type { StageId } from '../types/game';
import { NATIVE_HEIGHT, NATIVE_WIDTH } from './combatEngine';

export const ZONE_WORLD_WIDTH = 960;

export const STAGE_IMAGE_URLS: Record<StageId, string> = {
  forest: stageForestUrl,
  crypt: stageCryptUrl,
  arena: stageArenaUrl,
  sanctuary: stageSanctuaryUrl,
};

export const ZONE_SCROLL_IMAGE_URLS: Record<StageId, string> = {
  forest: zone1TrailUrl,
  crypt: zone2CryptUrl,
  arena: zone3TunnelUrl,
  sanctuary: zone4BridgeUrl,
};

const stageCanvasCache: Partial<Record<StageId, HTMLCanvasElement>> = {};
const zoneScrollCanvasCache: Partial<Record<StageId, HTMLCanvasElement>> = {};
let storyInterludeCanvas: HTMLCanvasElement | null = null;
let stageLoadStarted = false;

function quantizeChannel(v: number, levels: number): number {
  const step = 255 / (levels - 1);
  return Math.round(Math.round(v / step) * step);
}

function bakeRgb565Canvas(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  dimUpperY = 182
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const py = Math.floor(i / 4 / targetW);
    const shade = py < dimUpperY ? 0.91 : 1.0;
    d[i] = quantizeChannel(d[i] * shade, 32);
    d[i + 1] = quantizeChannel(d[i + 1] * shade, 64);
    d[i + 2] = quantizeChannel(d[i + 2] * shade, 32);
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

export function ensureStageArtLoaded(): void {
  if (stageLoadStarted || typeof window === 'undefined') return;
  stageLoadStarted = true;

  (Object.keys(STAGE_IMAGE_URLS) as StageId[]).forEach((stage) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const baked = bakeRgb565Canvas(img, NATIVE_WIDTH, NATIVE_HEIGHT, 182);
      if (baked) stageCanvasCache[stage] = baked;
    };
    img.src = STAGE_IMAGE_URLS[stage];
  });

  (Object.keys(ZONE_SCROLL_IMAGE_URLS) as StageId[]).forEach((stage) => {
    const zImg = new Image();
    zImg.decoding = 'async';
    zImg.onload = () => {
      // Build seamless 960x240 scrolling strip (2x mirrored/blended 480x240 16:9 pixel-art tiles)
      if (typeof document === 'undefined') return;
      const raw = document.createElement('canvas');
      raw.width = ZONE_WORLD_WIDTH;
      raw.height = NATIVE_HEIGHT;
      const rctx = raw.getContext('2d');
      if (!rctx) return;
      rctx.imageSmoothingEnabled = false;
      // Draw 3 panoramic segments (426 + 426 + 426 cropped/tiled cleanly across 960x240)
      rctx.drawImage(zImg, 0, 0, 480, NATIVE_HEIGHT);
      rctx.save();
      rctx.translate(960, 0);
      rctx.scale(-1, 1);
      rctx.drawImage(zImg, 0, 0, 480, NATIVE_HEIGHT);
      rctx.restore();

      // Ground path continuity band so the walkable stone/earth floor reads clearly at y=196..240
      const imgData = rctx.getImageData(0, 0, ZONE_WORLD_WIDTH, NATIVE_HEIGHT);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const py = Math.floor(i / 4 / ZONE_WORLD_WIDTH);
        const shade = py < 180 ? 0.88 : py > 196 ? 0.94 : 1.0;
        d[i] = quantizeChannel(d[i] * shade, 32);
        d[i + 1] = quantizeChannel(d[i + 1] * shade, 64);
        d[i + 2] = quantizeChannel(d[i + 2] * shade, 32);
      }
      rctx.putImageData(imgData, 0, 0);
      zoneScrollCanvasCache[stage] = raw;
    };
    zImg.src = ZONE_SCROLL_IMAGE_URLS[stage];
  });

  const sImg = new Image();
  sImg.decoding = 'async';
  sImg.onload = () => {
    const baked = bakeRgb565Canvas(sImg, NATIVE_WIDTH, 180, 999);
    if (baked) storyInterludeCanvas = baked;
  };
  sImg.src = storyInterludeUrl;
}

export function getStageCanvas320(stage: StageId): HTMLCanvasElement | null {
  ensureStageArtLoaded();
  return stageCanvasCache[stage] ?? null;
}

export function getZoneScrollCanvas960(stage: StageId): HTMLCanvasElement | null {
  ensureStageArtLoaded();
  return zoneScrollCanvasCache[stage] ?? null;
}

export function getStoryInterludeCanvas320(): HTMLCanvasElement | null {
  ensureStageArtLoaded();
  return storyInterludeCanvas;
}
