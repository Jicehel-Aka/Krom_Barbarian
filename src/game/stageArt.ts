import stageForestUrl from '../assets/images/stage_forest_pixel_1793121003697.jpg';
import stageCavernsUrl from '../assets/images/stage_caverns_arena_1793402526129.jpg';
import stageCryptUrl from '../assets/images/stage_crypt_pixel_1793121006436.jpg';
import stageArenaUrl from '../assets/images/stage_arena_pixel_1793121009126.jpg';
import stageInfernoUrl from '../assets/images/stage_inferno_arena_1793402530359.jpg';
import stageSanctuaryUrl from '../assets/images/stage_sanctuary_pixel_1793121025789.jpg';
import zone1BastionUrl from '../assets/images/zone1_nordic_wall_bastion_1793396239379.jpg';
import zone2BastionUrl from '../assets/images/zone2_crypt_wall_bastion_1793396242672.jpg';
import zone3BastionUrl from '../assets/images/zone3_arena_wall_bastion_1793396244640.jpg';
import zone4BastionUrl from '../assets/images/zone4_citadel_wall_bastion_1793396248276.jpg';
import storyInterludeUrl from '../assets/images/story_interlude_chronicle_art_1793183427577.jpg';
import type { StageId } from '../types/game';
import { NATIVE_HEIGHT, NATIVE_WIDTH } from './combatEngine';

export const ZONE_WORLD_WIDTH = 1800;

export const STAGE_IMAGE_URLS: Record<StageId, string> = {
  forest: stageForestUrl,
  caverns: stageCavernsUrl,
  crypt: stageCryptUrl,
  arena: stageArenaUrl,
  inferno: stageInfernoUrl,
  sanctuary: stageSanctuaryUrl,
};

export const ZONE_BASTION_IMAGE_URLS: Record<StageId, string> = {
  forest: zone1BastionUrl,
  caverns: stageCavernsUrl,
  crypt: zone2BastionUrl,
  arena: zone3BastionUrl,
  inferno: stageInfernoUrl,
  sanctuary: zone4BastionUrl,
};

export const ZONE_SCROLL_IMAGE_URLS: Record<StageId, string> = {
  forest: '/sheets/panorama_acte1_foret.png?v16',
  caverns: '/sheets/panorama_acte2_cavernes.png?v16',
  crypt: '/sheets/panorama_acte3_crypte.png?v16',
  arena: '/sheets/panorama_acte4_arene.png?v16',
  inferno: '/sheets/panorama_acte5_citadelle.png?v16',
  sanctuary: '/sheets/panorama_acte6_sanctuaire.png?v16',
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
    const shade = py < dimUpperY ? 0.92 : 1.0;
    d[i] = quantizeChannel(d[i] * shade, 32);
    d[i + 1] = quantizeChannel(d[i + 1] * shade, 64);
    d[i + 2] = quantizeChannel(d[i + 2] * shade, 32);
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function bakeDirectPanoramaCanvas(img: HTMLImageElement): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = ZONE_WORLD_WIDTH;
  canvas.height = NATIVE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, ZONE_WORLD_WIDTH, NATIVE_HEIGHT);
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
    const pImg = new Image();
    pImg.decoding = 'async';
    pImg.onload = () => {
      const baked = bakeDirectPanoramaCanvas(pImg);
      if (baked) zoneScrollCanvasCache[stage] = baked;
    };
    pImg.onerror = () => {
      // Resilient fallback using the generated 16-bit bastion panorama asset
      const fbImg = new Image();
      fbImg.decoding = 'async';
      fbImg.onload = () => {
        const baked = bakeRgb565Canvas(fbImg, ZONE_WORLD_WIDTH, NATIVE_HEIGHT, 182);
        if (baked) zoneScrollCanvasCache[stage] = baked;
      };
      fbImg.src = ZONE_BASTION_IMAGE_URLS[stage];
    };
    pImg.src = ZONE_SCROLL_IMAGE_URLS[stage];
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
