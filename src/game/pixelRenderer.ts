import {
  GROUND_Y,
  NATIVE_HEIGHT,
  NATIVE_WIDTH,
  ZONE_WALL_GATES,
  ZONE_WORLD_WIDTH,
} from './combatEngine';
import {
  ensureSpriteAtlasLoaded,
  getFighterScale,
  getPortraitSpec,
  getSheetCanvas,
  getSkinSheetCanvas,
  selectFighterSpriteFrame,
  selectFxSpriteFrame,
  selectGoblinSpriteFrame,
  type FxSpriteKind,
} from './spriteAtlas';
import {
  ensureStageArtLoaded,
  getStageCanvas320,
  getStoryInterludeCanvas320,
  getZoneScrollCanvas960,
} from './stageArt';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import {
  getLocalizedAct,
  getLocalizedCodex,
  getLocalizedCombatText,
  getLocalizedCutscene,
  getLocalizedForge,
} from '../i18n/gameContentLocale';
import {
  FORGE_UPGRADES,
  SWORD_TECHNIQUES,
  type CampaignAct,
} from '../data/campaign';
import { CUTSCENES } from '../data/cutscenes';
import type {
  AkaCodexUiState,
  AkaCutsceneUiState,
  AkaForgeUiState,
  AkaMenuOverlayState,
  AkaSystemSettings,
  BootloaderState,
  FighterAction,
  FighterSkin,
  FighterState,
  FloorDecal,
  GoreMode,
  ImpactEffect,
  LanguageCode,
  MatchState,
  ProgressionState,
  ScreenFlowState,
  SeveredHeadState,
  StageId,
  TechniqueId,
  ZoneTraversalState,
} from '../types/game';

function pxRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function drawCrispText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  sizePx = 10,
  align: CanvasTextAlign = 'left',
  bold = true,
  maxWidthPx?: number
): void {
  if (!text) return;
  ctx.save();
  let curSize = sizePx;
  ctx.font = `${bold ? '700' : '500'} ${curSize}px "JetBrains Mono", monospace`;
  if (maxWidthPx && maxWidthPx > 0) {
    while (curSize > 6 && ctx.measureText(text).width > maxWidthPx) {
      curSize -= 0.5;
      ctx.font = `${bold ? '700' : '500'} ${curSize}px "JetBrains Mono", monospace`;
    }
  }
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  ctx.fillStyle = '#05070a';
  if (maxWidthPx && maxWidthPx > 0) {
    ctx.fillText(text, ix + 1, iy + 1, maxWidthPx);
  } else {
    ctx.fillText(text, ix + 1, iy + 1);
  }
  ctx.fillStyle = color;
  if (maxWidthPx && maxWidthPx > 0) {
    ctx.fillText(text, ix, iy, maxWidthPx);
  } else {
    ctx.fillText(text, ix, iy);
  }
  ctx.restore();
}

function wrapTextPx(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidthPx: number,
  sizePx = 8,
  bold = false
): string[] {
  if (!text) return [];
  ctx.save();
  ctx.font = `${bold ? '700' : '500'} ${sizePx}px "JetBrains Mono", monospace`;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(candidate).width > maxWidthPx && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = candidate;
    }
  }
  if (cur) lines.push(cur);
  ctx.restore();
  return lines;
}

function formatScore6(score: number): string {
  return String(Math.max(0, Math.floor(score))).padStart(6, '0');
}

function drawAnimatedFlame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tick: number,
  scale = 1
): void {
  const phase = (tick + x * 3) % 12;
  const h = (phase < 6 ? 10 : 8) * scale;
  const sway = phase % 4 === 0 ? -1 : phase % 4 === 2 ? 1 : 0;

  ctx.fillStyle = 'rgba(251, 146, 60, 0.16)';
  ctx.fillRect(
    Math.floor(x - 10 * scale),
    Math.floor(y - 12 * scale),
    Math.floor(20 * scale),
    Math.floor(18 * scale)
  );

  pxRect(ctx, x - 3 * scale + sway, y - h, 6 * scale, h, '#ea580c');
  pxRect(ctx, x - 2 * scale + sway, y - h + 2, 4 * scale, Math.max(2, h - 3), '#facc15');
  pxRect(ctx, x - 1 * scale + sway, y - h + 3, 2 * scale, Math.max(2, h - 5), '#fef9c3');

  const emberY = y - h - ((tick + x * 5) % 18);
  const emberX = x + (((tick >> 2) + x) % 5) - 2;
  pxRect(ctx, emberX, emberY, 1, 1, '#fde047');
}

function drawFallbackProceduralStage(ctx: CanvasRenderingContext2D, stage: StageId): void {
  const sky =
    stage === 'forest'
      ? '#1d1930'
      : stage === 'caverns'
      ? '#0b2236'
      : stage === 'crypt'
      ? '#0e0c12'
      : stage === 'arena'
      ? '#451215'
      : stage === 'inferno'
      ? '#261029'
      : '#160b24';
  const floor =
    stage === 'forest'
      ? '#2b241d'
      : stage === 'caverns'
      ? '#1e303d'
      : stage === 'crypt'
      ? '#1c1d22'
      : stage === 'arena'
      ? '#8a5229'
      : stage === 'inferno'
      ? '#2c1c24'
      : '#1a1528';
  pxRect(ctx, 0, 0, NATIVE_WIDTH, GROUND_Y, sky);
  pxRect(ctx, 0, GROUND_Y, NATIVE_WIDTH, NATIVE_HEIGHT - GROUND_Y, floor);
}

function drawLightHalo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rgb: string,
  baseAlpha: number,
  tick: number,
  seed = 0
): void {
  if (x < -radius || x > NATIVE_WIDTH + radius) return;
  const pulse = Math.sin(tick * 0.14 + seed * 1.7) * 0.025;
  const alpha = Math.max(0.03, Math.min(0.24, baseAlpha + pulse));
  const r = Math.max(6, Math.round(radius));

  ctx.save();
  const grad = ctx.createRadialGradient(x, y, 1, x, y, r);
  grad.addColorStop(0, `rgba(${rgb}, ${alpha.toFixed(3)})`);
  grad.addColorStop(0.55, `rgba(${rgb}, ${(alpha * 0.42).toFixed(3)})`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFxProp(
  ctx: CanvasRenderingContext2D,
  kind: FxSpriteKind,
  x: number,
  y: number,
  scale: number,
  tick: number,
  topAnchored = false
): void {
  if (x < -56 || x > NATIVE_WIDTH + 56) return;
  const f = selectFxSpriteFrame(kind, tick);
  const sheet = getSheetCanvas(f.sheet, false);
  if (!sheet) {
    if (kind === 'torch' || kind === 'brazier' || kind === 'arcane_brazier') {
      drawAnimatedFlame(ctx, x, y, tick, 0.85);
    }
    return;
  }
  const dw = Math.max(4, Math.round(f.w * scale));
  const dh = Math.max(4, Math.round(f.h * scale));
  const dax = Math.round(f.ax * scale);
  const dx = Math.round(x - dax);
  const dy = topAnchored ? Math.round(y) : Math.round(y - dh);

  ctx.drawImage(sheet, f.x, f.y, f.w, f.h, dx, dy, dw, dh);
}

function drawForkedLightningBolt(
  ctx: CanvasRenderingContext2D,
  startX: number,
  seed: number
): void {
  let cx = startX;
  let cy = 6;
  for (let seg = 0; seg < 9; seg++) {
    const nx = cx + (((seed * (seg + 3) * 17) % 19) - 9);
    const ny = cy + 14;
    pxRect(ctx, Math.min(cx, nx) - 1, cy, Math.abs(nx - cx) + 3, 4, 'rgba(192, 132, 252, 0.45)');
    pxRect(ctx, cx, cy, 2, 8, '#f8fafc');
    pxRect(ctx, nx, cy + 7, 2, 8, '#e0f2fe');
    if (seg === 3 || seg === 5) {
      const bx = nx + (seg === 3 ? 12 : -14);
      pxRect(ctx, Math.min(nx, bx), ny, Math.abs(bx - nx), 1, '#bae6fd');
      pxRect(ctx, bx, ny + 1, 1, 9, '#bae6fd');
    }
    cx = nx;
    cy = ny;
  }
}

function drawPixelPortcullisGate320(
  ctx: CanvasRenderingContext2D,
  gateWorldX: number,
  isLocked: boolean,
  tick: number,
  camX: number
): void {
  const sx = Math.round(gateWorldX + 18 - camX);
  if (sx < -48 || sx > NATIVE_WIDTH + 48) return;

  // Grounded contact shadow beneath the riveted iron gateposts
  ctx.fillStyle = 'rgba(5, 7, 12, 0.45)';
  ctx.fillRect(sx - 28, GROUND_Y - 1, 56, 4);

  drawFxProp(
    ctx,
    isLocked ? 'portcullis_closed' : 'portcullis_open',
    sx,
    GROUND_Y + 2,
    0.18,
    tick
  );

  if (isLocked) {
    drawLightHalo(ctx, sx, GROUND_Y - 38, 18, '239, 68, 68', 0.12, tick, gateWorldX);
  }
}

function drawStageAtmosphericOverlay(
  ctx: CanvasRenderingContext2D,
  stage: StageId,
  tick: number,
  lightningFlash: number,
  crowdExcited: boolean,
  isZone = false,
  camX = 0
): void {
  if (stage === 'forest') {
    // Soft diagonal moonlight shimmer through misty pines
    const rayAlpha = (0.032 + Math.sin(tick * 0.04) * 0.012).toFixed(3);
    ctx.fillStyle = `rgba(186, 230, 253, ${rayAlpha})`;
    for (let r = 0; r < 3; r++) {
      const rx = 44 + r * 98 + Math.round(Math.sin(tick * 0.02 + r) * 4);
      for (let step = 0; step < 7; step++) {
        ctx.fillRect(rx + step * 5, 16 + step * 22, 16, 22);
      }
    }

    // Glowing Nordic Rune Monoliths placed in the ancient oak clearing & sanctuary approach
    const monoPositions = isZone ? [940, 1410] : [278];
    for (let idx = 0; idx < monoPositions.length; idx++) {
      const mx = monoPositions[idx] - (isZone ? camX : 0);
      if (mx >= -40 && mx <= NATIVE_WIDTH + 40) {
        drawLightHalo(ctx, mx, GROUND_Y - 26, 26, '56, 189, 248', 0.13, tick, idx);
        drawFxProp(ctx, 'monolith', mx, GROUND_Y + 2, 0.21, tick + idx * 9);
      }
    }

    // Warm Iron Bivouac Braziers along the deep woodland trail & runic gate
    const campBraziers = isZone ? [470, 1445, 1650] : [36];
    for (let idx = 0; idx < campBraziers.length; idx++) {
      const bx = campBraziers[idx] - (isZone ? camX : 0);
      if (bx >= -36 && bx <= NATIVE_WIDTH + 36) {
        drawLightHalo(ctx, bx, GROUND_Y - 18, 24, '251, 146, 60', 0.14, tick, idx + 4);
        drawFxProp(ctx, 'brazier', bx, GROUND_Y + 2, 0.18, tick + idx * 5);
      }
    }

    // Animated Crows gliding high across the night pines
    for (let c = 0; c < 2; c++) {
      const speed = c === 0 ? 0.88 : 0.62;
      const crowX = Math.floor((((tick * speed + c * 148) % (NATIVE_WIDTH + 64)) - 32));
      const crowY = (44 + c * 15) + Math.round(Math.sin(tick * 0.06 + c * 2) * 3);
      drawFxProp(ctx, 'crow', crowX, crowY + 8, c === 0 ? 0.15 : 0.12, tick + c * 7);
    }

    // Twinkling forest fireflies
    for (let i = 0; i < 8; i++) {
      const fx = Math.floor((i * 41 + tick * 0.32 + Math.sin(tick * 0.05 + i) * 8) % NATIVE_WIDTH);
      const fy = 98 + (((i * 23 - Math.floor(tick * 0.2)) % 84) + 84) % 84;
      if ((tick + i * 7) % 16 < 11) {
        drawLightHalo(ctx, fx, fy, 5, '250, 204, 21', 0.14, tick, i);
        pxRect(ctx, fx, fy, 1, 1, i % 2 === 0 ? '#fde68a' : '#bef264');
      }
    }
  } else if (stage === 'caverns') {
    // Subterranean cyan crystal & runic seal luminescence
    const crystalHalos = isZone ? [155, 670, 965, 1300, 1690] : [64, 160, 258];
    for (let idx = 0; idx < crystalHalos.length; idx++) {
      const hx = crystalHalos[idx] - (isZone ? camX : 0);
      if (hx >= -48 && hx <= NATIVE_WIDTH + 48) {
        drawLightHalo(ctx, hx, 108, 34, '34, 211, 238', 0.14, tick, idx + 2);
      }
    }

    // Warm miner torches & stone pillar braziers
    const cavernBraziers = isZone ? [310, 388, 882, 1055, 1495, 1760] : [34, 286];
    for (let idx = 0; idx < cavernBraziers.length; idx++) {
      const bx = cavernBraziers[idx] - (isZone ? camX : 0);
      if (bx >= -36 && bx <= NATIVE_WIDTH + 36) {
        drawLightHalo(ctx, bx, GROUND_Y - 22, 22, '251, 146, 60', 0.13, tick, idx);
        if (!isZone) {
          drawFxProp(ctx, 'brazier', bx, GROUND_Y + 2, 0.18, tick + idx * 6);
        }
      }
    }

    // Drifting bioluminescent crystal motes & waterfall mist
    for (let i = 0; i < 10; i++) {
      const mx = Math.floor((i * 33 + tick * 0.28 + Math.sin(tick * 0.05 + i) * 6) % NATIVE_WIDTH);
      const my = 52 + (((i * 29 - Math.floor(tick * 0.25)) % 128) + 128) % 128;
      if ((tick + i * 5) % 14 < 10) {
        drawLightHalo(ctx, mx, my, 5, '56, 189, 248', 0.15, tick, i);
        pxRect(ctx, mx, my, 1, 1, i % 2 === 0 ? '#67e8f9' : '#e0f2fe');
      }
    }
  } else if (stage === 'crypt') {
    // 16-bit Swaying Iron Dungeon Cages anchored to the vaulted stone ceiling arches
    const cagePositions = isZone ? [390, 810, 1290, 1640] : [74, 246];
    for (let idx = 0; idx < cagePositions.length; idx++) {
      const cx = cagePositions[idx] - (isZone ? camX : 0);
      drawFxProp(ctx, 'cage', cx, isZone ? 16 : 22, 0.22, tick + idx * 13, true);
    }

    // 16-bit Iron Wall Torches mounted directly on subterranean stone & obsidian columns
    const torchPositions = isZone ? [290, 680, 1080, 1490] : [29, 102, 242, 294];
    for (let idx = 0; idx < torchPositions.length; idx++) {
      const tx = torchPositions[idx] - (isZone ? camX : 0);
      const ty = isZone ? 114 : idx === 0 || idx === 3 ? 112 : 118;
      if (tx >= -36 && tx <= NATIVE_WIDTH + 36) {
        drawLightHalo(ctx, tx, ty - 14, 28, '251, 146, 60', 0.16, tick, idx);
        drawFxProp(ctx, 'torch', tx, ty, 0.19, tick + idx * 5);
      }
    }

    // Iron Braziers lighting the underground stairs, dark grotto & lava thresholds
    const cryptBraziers = isZone ? [190, 890, 1380, 1710] : [];
    for (let idx = 0; idx < cryptBraziers.length; idx++) {
      const bx = cryptBraziers[idx] - camX;
      if (bx >= -36 && bx <= NATIVE_WIDTH + 36) {
        drawLightHalo(ctx, bx, GROUND_Y - 18, 24, '249, 115, 22', 0.14, tick, idx + 3);
        drawFxProp(ctx, 'brazier', bx, GROUND_Y + 2, 0.18, tick + idx * 6);
      }
    }

    // Rising magma embers appear once Krom reaches the magma fissures & lava waterfalls!
    if (!isZone || camX > 880) {
      const emberCount = !isZone || camX > 1220 ? 9 : 4;
      for (let i = 0; i < emberCount; i++) {
        const ex = (i * 39 + tick) % NATIVE_WIDTH;
        const ey = GROUND_Y + 6 - ((tick + i * 19) % 104);
        pxRect(ctx, ex, ey, 1, 2, i % 2 === 0 ? '#fb923c' : '#fde047');
      }
    }
  } else if (stage === 'arena') {
    // 16-bit Tattered Crimson-and-Gold Gladiator Rune Banners along the perimeter coliseum walls
    const arenaBanners = isZone ? [660, 1005, 1510, 1695] : [50, 270];
    for (let idx = 0; idx < arenaBanners.length; idx++) {
      const bx = arenaBanners[idx] - (isZone ? camX : 0);
      if (!isZone) {
        drawFxProp(ctx, 'banner', bx, 84, 0.18, tick + idx * 11, true);
      } else {
        drawLightHalo(ctx, bx, 118, 18, '251, 146, 60', 0.08, tick, idx);
      }
    }

    // Heavy Iron Gladiator Braziers flanking the outer rampart walls & skull gate
    const brazierPositions = isZone ? [402, 830, 1002, 1228, 1425, 1775] : [24, 296];
    for (let idx = 0; idx < brazierPositions.length; idx++) {
      const bx = brazierPositions[idx] - (isZone ? camX : 0);
      if (bx >= -36 && bx <= NATIVE_WIDTH + 36) {
        drawLightHalo(ctx, bx, GROUND_Y - 20, 26, '251, 146, 60', 0.15, tick, idx);
        if (!isZone) {
          drawFxProp(ctx, 'brazier', bx, GROUND_Y + 2, 0.20, tick + idx * 4);
        }
      }
    }

    // Carrion Crows circling above the sunlit coliseum walls
    for (let c = 0; c < 2; c++) {
      const speed = c === 0 ? 0.82 : 0.58;
      const crowX = Math.floor((((tick * speed + c * 155) % (NATIVE_WIDTH + 64)) - 32));
      const crowY = (40 + c * 14) + Math.round(Math.sin(tick * 0.07 + c * 2.4) * 3);
      drawFxProp(ctx, 'crow', crowX, crowY + 8, 0.13, tick + c * 9);
    }

    if (!isZone) {
      drawLightHalo(ctx, 89, 108, 20, '251, 146, 60', 0.13, tick, 4);
      drawLightHalo(ctx, 231, 108, 20, '251, 146, 60', 0.13, tick, 7);
      drawAnimatedFlame(ctx, 89, 114, tick + 4, 0.65);
      drawAnimatedFlame(ctx, 231, 114, tick + 8, 0.65);

      for (let cx = 26; cx <= 104; cx += 11) {
        const cheer = crowdExcited ? (tick + cx) % 6 < 3 : (tick + cx * 3) % 32 < 4;
        if (cheer) {
          pxRect(ctx, cx, 98, 2, 4, '#1c120e');
          pxRect(ctx, NATIVE_WIDTH - cx, 98, 2, 4, '#1c120e');
        }
      }
    }

    // Wind-blown sand streaks & floating sunlit dust motes
    ctx.fillStyle = 'rgba(253, 230, 138, 0.32)';
    for (let i = 0; i < 7; i++) {
      const sx = Math.floor((i * 51 + tick * 2.3) % NATIVE_WIDTH);
      const sy = GROUND_Y + 4 + ((i * 7) % 24);
      ctx.fillRect(sx, sy, 4, 1);
    }
    for (let i = 0; i < 6; i++) {
      const dx = Math.floor((i * 59 + tick * 0.7) % NATIVE_WIDTH);
      const dy = 56 + ((i * 27 + Math.floor(tick * 0.3)) % 96);
      pxRect(ctx, dx, dy, 1, 1, 'rgba(254, 243, 199, 0.45)');
    }
  } else if (stage === 'inferno') {
    // Swaying Iron Cages & Crimson-Orange Hellfire Braziers along the Infernal Citadel viaduct
    const infernoCages = isZone ? [1448, 1538] : [64, 256];
    for (let idx = 0; idx < infernoCages.length; idx++) {
      const cx = infernoCages[idx] - (isZone ? camX : 0);
      if (!isZone) {
        drawFxProp(ctx, 'cage', cx, 18, 0.22, tick + idx * 11, true);
      }
    }

    const infernoGlows = isZone ? [132, 274, 814, 872, 1188, 1388, 1618, 1772] : [28, 160, 292];
    for (let idx = 0; idx < infernoGlows.length; idx++) {
      const gx = infernoGlows[idx] - (isZone ? camX : 0);
      if (gx >= -40 && gx <= NATIVE_WIDTH + 40) {
        drawLightHalo(ctx, gx, GROUND_Y - 24, 28, '249, 115, 22', 0.16, tick, idx);
        if (!isZone && idx !== 1) {
          drawFxProp(ctx, 'brazier', gx, GROUND_Y + 2, 0.19, tick + idx * 5);
        }
      }
    }

    // Rising hellfire embers across the moonlit bridge & lava chasm
    for (let i = 0; i < 11; i++) {
      const ex = (i * 31 + Math.floor(tick * 0.9)) % NATIVE_WIDTH;
      const ey = GROUND_Y + 8 - ((tick + i * 17) % 128);
      pxRect(ctx, ex, ey, 1, 2, i % 3 === 0 ? '#ef4444' : i % 2 === 0 ? '#fb923c' : '#fde047');
    }
  } else {
    // 16-bit Swaying Iron Citadel Cages anchored to castle arches & bridge columns
    const sanctCages = isZone ? [280, 740, 1290, 1640] : [58, 262];
    for (let idx = 0; idx < sanctCages.length; idx++) {
      const cx = sanctCages[idx] - (isZone ? camX : 0);
      drawFxProp(ctx, 'cage', cx, 18, 0.22, tick + idx * 15, true);
    }

    // 16-bit Tattered War Banners on the dark gothic fortress
    if (isZone) {
      const sanctBanners = [360, 910, 1420, 1695];
      for (let idx = 0; idx < sanctBanners.length; idx++) {
        drawFxProp(ctx, 'banner', sanctBanners[idx] - camX, 74, 0.16, tick + idx * 12, true);
      }
    }

    // 16-bit Gothic Violet-Flame Arcane Braziers lighting the storm bridge & dark sanctuary
    const sanctBraziers = isZone ? [195, 515, 840, 1140, 1465, 1710] : [26, 294];
    for (let idx = 0; idx < sanctBraziers.length; idx++) {
      const px = sanctBraziers[idx] - (isZone ? camX : 0);
      if (px >= -36 && px <= NATIVE_WIDTH + 36) {
        drawLightHalo(ctx, px, GROUND_Y - 22, 26, '168, 85, 247', 0.15, tick, idx);
        drawFxProp(ctx, 'arcane_brazier', px, GROUND_Y + 2, 0.20, tick + idx * 6);
      }
    }

    // Slanting storm rain + splashing raindrop ripples on the wet flagstones
    ctx.fillStyle = 'rgba(186, 230, 253, 0.30)';
    for (let i = 0; i < 26; i++) {
      const rx = (((i * 37 - tick * 3) % NATIVE_WIDTH) + NATIVE_WIDTH) % NATIVE_WIDTH;
      const ry = (i * 29 + tick * 6) % (GROUND_Y + 10);
      ctx.fillRect(rx, ry, 1, 5);
    }
    for (let r = 0; r < 6; r++) {
      const splashPhase = (tick + r * 11) % 16;
      if (splashPhase < 8) {
        const sx = (r * 57 + Math.floor((tick + r * 11) / 16) * 29) % (NATIVE_WIDTH - 16) + 8;
        const sy = GROUND_Y + 2 + (r % 3) * 8;
        const rw = 2 + splashPhase;
        pxRect(ctx, sx - Math.floor(rw / 2), sy, rw, 1, 'rgba(186, 230, 253, 0.42)');
      }
    }

    // Distant sheet-lightning shimmer + Jagged Forked Lightning Bolt on thunderclap
    if (lightningFlash > 0) {
      const boltX = 72 + ((tick * 13) % 176);
      drawForkedLightningBolt(ctx, boltX, tick);
      ctx.fillStyle = `rgba(240, 249, 255, ${(lightningFlash * 0.11).toFixed(2)})`;
      ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
    } else if (tick % 130 < 3) {
      ctx.fillStyle = 'rgba(192, 132, 252, 0.07)';
      ctx.fillRect(0, 0, NATIVE_WIDTH, GROUND_Y);
    }
  }
}

function drawStageBackground320(
  ctx: CanvasRenderingContext2D,
  stage: StageId,
  tick: number,
  lightningFlash: number,
  crowdExcited: boolean
): void {
  const stageCanvas = getStageCanvas320(stage);
  if (stageCanvas) {
    ctx.drawImage(stageCanvas, 0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
  } else {
    drawFallbackProceduralStage(ctx, stage);
  }
  drawStageAtmosphericOverlay(ctx, stage, tick, lightningFlash, crowdExcited, false, 0);
}

function getShortTechniqueBadge(
  tech: TechniqueId,
  lang: LanguageCode
): { label: string; color: string } {
  const fg = getLocalizedForge(lang);
  const label = fg.techniques[tech]?.shortBadge ?? fg.techniques.whirlwind_edge.shortBadge;
  if (tech === 'iron_riposte') {
    return { label, color: '#38bdf8' };
  }
  if (tech === 'sky_breaker') {
    return { label, color: '#fb923c' };
  }
  return { label, color: '#facc15' };
}

function drawFighter320(
  ctx: CanvasRenderingContext2D,
  f: FighterState,
  tick: number,
  offsetX = 0,
  alpha = 1,
  equippedTechnique?: TechniqueId
): void {
  const x = Math.round(f.x - offsetX);
  const y = Math.round(f.y);
  if (x < -64 || x > NATIVE_WIDTH + 64) return;

  const frame = selectFighterSpriteFrame(f, tick);
  const scale = getFighterScale(f.skin);
  const oyPx = Math.round((frame.oy ?? 0) * scale);

  const heightAboveGround = Math.max(0, GROUND_Y - y - oyPx);
  const shadowW = Math.max(10, 28 - Math.floor(heightAboveGround * 0.25));
  ctx.fillStyle = `rgba(0, 0, 0, ${(0.5 * alpha).toFixed(2)})`;
  ctx.fillRect(Math.floor(x - shadowW / 2), GROUND_Y - 2, shadowW, 4);

  const renderDir: 1 | -1 =
    f.action === 'spin_decap' && f.actionTick >= 6 && f.actionTick <= 14
      ? (-f.facing as 1 | -1)
      : f.facing;

  const hitFlash = f.action === 'hit_stun' && f.actionTick % 3 === 1;
  const sheetCanvas = getSkinSheetCanvas(frame.sheet, f.skin, hitFlash);

  if (!sheetCanvas) {
    pxRect(ctx, x - 9, y - 52, 18, 52, '#b45309');
    return;
  }

  const destW = Math.round(frame.w * scale);
  const destH = Math.round(frame.h * scale);
  const anchorOffsetPx = Math.round(frame.ax * scale);
  const footSink = 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.translate(x, y + footSink + oyPx);
  if (renderDir === -1) {
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    sheetCanvas,
    frame.x,
    frame.y,
    frame.w,
    frame.h,
    -anchorOffsetPx,
    -destH,
    destW,
    destH
  );

  // Distinct visual weapon auras for the 3 Bottes Secrètes!
  if (f.action === 'spin_decap' && f.actionTick >= 13 && f.actionTick <= 22) {
    const isWhirlwind = f.id === 'p1' && equippedTechnique === 'whirlwind_edge';
    ctx.fillStyle = isWhirlwind ? 'rgba(250, 204, 21, 0.88)' : 'rgba(254, 240, 138, 0.75)';
    ctx.fillRect(-38, -Math.round(destH * 0.72), isWhirlwind ? 84 : 74, isWhirlwind ? 4 : 3);
    if (isWhirlwind) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.72)';
      ctx.fillRect(-34, -Math.round(destH * 0.72) + 4, 78, 2);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-26, -Math.round(destH * 0.72) + 1, 64, 1);
  } else if (f.action === 'cleave_overhead' && f.actionTick >= 10 && f.actionTick <= 18) {
    const isSkyBreaker = f.id === 'p1' && equippedTechnique === 'sky_breaker';
    ctx.fillStyle = isSkyBreaker ? 'rgba(249, 115, 22, 0.88)' : 'rgba(251, 191, 36, 0.65)';
    ctx.fillRect(13, -destH - 6, isSkyBreaker ? 7 : 4, Math.round(destH * 0.82));
    if (isSkyBreaker) {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(15, -destH - 4, 3, Math.round(destH * 0.76));
    }
  } else if (
    f.action === 'block_high' &&
    f.id === 'p1' &&
    equippedTechnique === 'iron_riposte' &&
    f.actionTick <= 13
  ) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.82)';
    ctx.fillRect(8, -Math.round(destH * 0.82), 3, Math.round(destH * 0.48));
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(9, -Math.round(destH * 0.78), 1, Math.round(destH * 0.38));
  } else if (f.action === 'boss_cast') {
    const orbColor =
      f.skin === 'thalgrim'
        ? '#38bdf8'
        : f.skin === 'vorgath' || f.skin === 'baelgor'
        ? '#f97316'
        : '#c084fc';
    pxRect(ctx, 14, -Math.round(destH * 0.68), 8, 8, orbColor);
    pxRect(ctx, 16, -Math.round(destH * 0.68) + 2, 4, 4, '#ffffff');
  }

  ctx.restore();
}

function drawGoblinCleaner320(
  ctx: CanvasRenderingContext2D,
  state: MatchState,
  lang: LanguageCode
): void {
  const g = state.goblin;
  if (!g.active || g.phase === 'done') return;

  const gx = Math.round(g.x);
  const gy = GROUND_Y;
  pxRect(ctx, gx - 10, gy - 1, 20, 3, 'rgba(0,0,0,0.48)');

  const fxSheet = getSheetCanvas('goblinAndFx', false);
  if (fxSheet) {
    const frame = selectGoblinSpriteFrame(g.phase, g.tick);
    const scale = 0.28;
    const dw = Math.round(frame.w * scale);
    const dh = Math.round(frame.h * scale);
    const ax = Math.round(frame.ax * scale);

    const loser = state.winner === 'p1' ? state.p2 : state.p1;
    let facingRight = loser.x >= gx;
    if (g.phase === 'dragging') {
      facingRight = g.x >= NATIVE_WIDTH * 0.5;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(gx, gy + 2);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(fxSheet, frame.x, frame.y, frame.w, frame.h, -ax, -dh, dw, dh);
    ctx.restore();

    if (g.phase === 'laughing') {
      const ct = getLocalizedCombatText(lang);
      drawCrispText(ctx, ct.goblinLaugh, gx, gy - dh - 10, '#bef264', 8, 'center', true, 76);
    }
    return;
  }

  pxRect(ctx, gx - 6, gy - 30, 12, 30, '#65a30d');
}

function drawFloorDecals320(
  ctx: CanvasRenderingContext2D,
  decals: FloorDecal[],
  goreMode: GoreMode,
  camX = 0
): void {
  if (goreMode === 'soft' || decals.length === 0) return;

  for (const d of decals) {
    const sx = Math.round(d.x - camX);
    if (sx < -24 || sx > NATIVE_WIDTH + 24) continue;
    if (d.kind === 'pool') {
      const w = goreMode === 'gore' ? d.w : Math.max(8, Math.round(d.w * 0.65));
      pxRect(ctx, sx - Math.floor(w / 2), d.y, w, 4, '#450a0a');
      pxRect(ctx, sx - Math.floor(w * 0.38), d.y + 1, Math.floor(w * 0.76), 2, '#991b1b');
      if (goreMode === 'gore') {
        pxRect(ctx, sx - Math.floor(w * 0.2), d.y + 1, Math.floor(w * 0.4), 1, '#dc2626');
      }
    } else if (d.kind === 'splatter') {
      pxRect(ctx, sx - Math.floor(d.w / 2), d.y, d.w, 2, '#7f1d1d');
      pxRect(ctx, sx - 1, d.y, Math.max(2, d.w - 2), 1, '#b91c1c');
    } else {
      pxRect(ctx, sx, d.y, d.w, 1, '#7f1d1d');
    }
  }
}

function drawImpactEffects320(
  ctx: CanvasRenderingContext2D,
  impacts: ImpactEffect[],
  goreMode: GoreMode,
  tick: number,
  camX = 0
): void {
  if (impacts.length === 0) return;
  const fxSheet = getSheetCanvas('goblinAndFx', false);

  for (const imp of impacts) {
    const sx = Math.round(imp.x - camX);
    const sy = Math.round(imp.y);
    if (sx < -32 || sx > NATIVE_WIDTH + 32) continue;

    const progress = imp.tick / Math.max(1, imp.maxTicks);
    const d = imp.dir;

    // 1. Steel Clash & Guard Crush (always metallic/fiery sparks)
    if (imp.kind === 'parry_clash' || imp.kind === 'guard_crush') {
      const isCrush = imp.kind === 'guard_crush';
      drawLightHalo(
        ctx,
        sx,
        sy,
        isCrush ? 24 : 18,
        isCrush ? '249, 115, 22' : '56, 189, 248',
        0.24 * (1 - progress),
        tick,
        imp.id
      );
      if (fxSheet && imp.tick < 10) {
        const sp = selectFxSpriteFrame('sparks', imp.tick * 2);
        const sw = Math.round(sp.w * (isCrush ? 0.28 : 0.22));
        const sh = Math.round(sp.h * (isCrush ? 0.28 : 0.22));
        ctx.drawImage(
          fxSheet,
          sp.x,
          sp.y,
          sp.w,
          sp.h,
          sx - Math.round(sw / 2),
          sy - Math.round(sh / 2),
          sw,
          sh
        );
      }
      // Crisp pixel cross-starburst right at blade intersection
      const ray = Math.round(4 + imp.tick * 1.3);
      const col = isCrush ? '#fb923c' : '#fef08a';
      pxRect(ctx, sx - ray, sy, ray * 2 + 1, 1, col);
      pxRect(ctx, sx, sy - ray, 1, ray * 2 + 1, '#ffffff');
      continue;
    }

    // 2. SOFT MODE: Radiant Golden/Cyan Kinetic Slash Crescent (Zero Blood!)
    if (goreMode === 'soft') {
      drawLightHalo(ctx, sx, sy, 18, '250, 204, 21', 0.22 * (1 - progress), tick, imp.id);
      if (imp.kind === 'pierce_thrust') {
        const len = 14 + imp.tick * 2;
        pxRect(ctx, d > 0 ? sx - 4 : sx - len, sy - 1, len, 3, '#38bdf8');
        pxRect(ctx, d > 0 ? sx : sx - len + 4, sy, len - 4, 1, '#ffffff');
      } else {
        for (let seg = -4; seg <= 4; seg++) {
          const ax = sx + d * (6 - Math.abs(seg)) + seg * d;
          const ay = sy + seg * 3;
          pxRect(ctx, ax, ay, 3, 2, Math.abs(seg) <= 1 ? '#ffffff' : '#fde047');
          pxRect(ctx, ax - d * 2, ay + 1, 2, 1, '#38bdf8');
        }
      }
      continue;
    }

    // 3. NORMAL & GORE MODES: Localized Weapon Slash Gash + Directional Blood Spray!
    const isGore = goreMode === 'gore';

    if (imp.kind === 'decap_fountain') {
      // Pulsing arterial geyser from the severed neck!
      const heightBoost = isGore ? 26 : 15;
      const geyserStreams = isGore ? 7 : 4;
      for (let s = 0; s < geyserStreams; s++) {
        const phase = (imp.tick * 2 + s * 5) % 16;
        const gx = sx + ((s - Math.floor(geyserStreams / 2)) * 3) + d * Math.floor(phase * 0.35);
        const gy = sy - Math.round(Math.sin((phase / 16) * Math.PI) * heightBoost);
        pxRect(ctx, gx, gy, isGore ? 3 : 2, isGore ? 5 : 3, s % 2 === 0 ? '#dc2626' : '#991b1b');
        if (isGore && s % 2 === 0) {
          pxRect(ctx, gx + 1, gy, 1, 2, '#f87171');
        }
      }
      continue;
    }

    // Initial white-crimson steel wound flash during the first 5 frames of contact
    if (imp.tick < 6) {
      if (imp.kind === 'pierce_thrust') {
        const spearW = isGore ? 22 : 16;
        pxRect(ctx, d > 0 ? sx - 4 : sx - spearW + 4, sy - 1, spearW, 3, '#dc2626');
        pxRect(ctx, d > 0 ? sx - 2 : sx - spearW + 6, sy, spearW - 4, 1, '#fecaca');
      } else {
        const span = imp.kind === 'heavy_cleave' ? 5 : 4;
        for (let seg = -span; seg <= span; seg++) {
          const ax = sx + seg * d * 2;
          const ay = sy + seg * (imp.kind === 'heavy_cleave' ? 3 : 2);
          pxRect(
            ctx,
            ax,
            ay,
            isGore ? 3 : 2,
            isGore ? 3 : 2,
            imp.tick < 2 && Math.abs(seg) <= 2 ? '#ffffff' : '#ef4444'
          );
          if (isGore) {
            pxRect(ctx, ax + d, ay + 1, 2, 2, '#991b1b');
          }
        }
      }
    }

    // Fanning directional blood droplets erupting from the exact contact point!
    const dropletCount = isGore ? (imp.kind === 'heavy_cleave' ? 9 : 6) : 4;
    const travel = imp.tick * (isGore ? 2.1 : 1.6);
    for (let b = 0; b < dropletCount; b++) {
      const spreadAngle = -0.65 + (b / Math.max(1, dropletCount - 1)) * 1.15;
      const bx = Math.round(sx + d * Math.cos(spreadAngle) * travel * (0.8 + (b % 3) * 0.22));
      const by = Math.round(
        sy + Math.sin(spreadAngle) * travel * 0.85 + imp.tick * imp.tick * 0.08
      );
      const dropSize = isGore && b % 2 === 0 ? 3 : 2;
      pxRect(ctx, bx, by, dropSize, dropSize, b % 2 === 0 ? '#dc2626' : '#7f1d1d');
    }
  }
}

function drawSeveredHead320(
  ctx: CanvasRenderingContext2D,
  head: SeveredHeadState,
  goreMode: GoreMode
): void {
  if (!head.active || goreMode === 'soft') return;
  const hx = Math.round(head.x);
  const hy = Math.round(head.y);

  // Ground shadow
  pxRect(ctx, hx - 7, GROUND_Y - 1, 14, 3, 'rgba(0, 0, 0, 0.5)');

  const spec = getPortraitSpec(head.skin);
  const sheet = getSkinSheetCanvas(spec.sheet, head.skin, false);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(hx, hy - 6);
  // Quantized 90-degree pixel rotation steps keep pixel art razor-sharp
  const quarterTurns = Math.round(head.rot * 0.8) % 4;
  ctx.rotate(quarterTurns * (Math.PI / 2));

  if (sheet) {
    // Crop upper 78% of portrait (helmet/crown/face)
    ctx.drawImage(
      sheet,
      spec.x,
      spec.y,
      spec.w,
      Math.round(spec.h * 0.8),
      -8,
      -8,
      16,
      15
    );
  } else {
    pxRect(ctx, -6, -6, 12, 12, '#d6d3d1');
  }

  // Crimson collar edge
  pxRect(ctx, -5, 6, 10, goreMode === 'gore' ? 3 : 2, '#991b1b');
  if (goreMode === 'gore') {
    pxRect(ctx, -3, 7, 6, 2, '#ef4444');
  }
  ctx.restore();
}

function drawHudPortrait(
  ctx: CanvasRenderingContext2D,
  skin: FighterSkin,
  x: number,
  y: number,
  flipHorizontal: boolean
): void {
  pxRect(ctx, x, y, 24, 24, '#18181b');
  pxRect(ctx, x, y, 24, 1, '#b45309');
  pxRect(ctx, x, y + 23, 24, 1, '#78350f');
  pxRect(ctx, x, y, 1, 24, '#b45309');
  pxRect(ctx, x + 23, y, 1, 24, '#78350f');

  const spec = getPortraitSpec(skin);
  const sheet = getSkinSheetCanvas(spec.sheet, skin, false);
  if (!sheet) return;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (flipHorizontal) {
    ctx.translate(x + 23, y + 1);
    ctx.scale(-1, 1);
    ctx.drawImage(sheet, spec.x, spec.y, spec.w, spec.h, 0, 0, 22, 22);
  } else {
    ctx.drawImage(sheet, spec.x, spec.y, spec.w, spec.h, x + 1, y + 1, 22, 22);
  }
  ctx.restore();
}

function drawCombatHud320(
  ctx: CanvasRenderingContext2D,
  state: MatchState,
  equippedTechnique: TechniqueId,
  lang: LanguageCode
): void {
  pxRect(ctx, 0, 0, NATIVE_WIDTH, 32, 'rgba(9, 11, 16, 0.88)');
  pxRect(ctx, 0, 32, NATIVE_WIDTH, 1, '#78350f');
  pxRect(ctx, 0, 33, NATIVE_WIDTH, 1, '#09090b');

  drawHudPortrait(ctx, state.p1.skin, 4, 4, false);
  drawCrispText(ctx, state.p1.name.slice(0, 6), 32, 3, '#fef3c7', 8, 'left', true, 34);
  const techBadge = getShortTechniqueBadge(equippedTechnique, lang);
  drawCrispText(ctx, techBadge.label, 126, 4, techBadge.color, 7, 'right', true, 60);

  pxRect(ctx, 32, 14, 94, 8, '#1f2937');
  pxRect(ctx, 32, 14, 94, 1, '#4b5563');
  const p1W = Math.max(0, Math.round((state.p1.hp / state.p1.maxHp) * 92));
  if (p1W > 0) {
    pxRect(ctx, 33, 15, p1W, 6, state.p1.hp < state.p1.maxHp * 0.3 ? '#ef4444' : '#dc2626');
    pxRect(ctx, 33, 15, p1W, 2, '#f87171');
  }

  const p1StamW = Math.max(0, Math.round((state.p1.stamina / state.p1.maxStamina) * 58));
  pxRect(ctx, 32, 24, 58, 4, '#18181b');
  pxRect(ctx, 32, 24, p1StamW, 3, '#38bdf8');

  const p1RageW = Math.max(0, Math.round((state.p1.rage / 100) * 32));
  pxRect(ctx, 94, 24, 32, 4, '#18181b');
  pxRect(
    ctx,
    94,
    24,
    p1RageW,
    3,
    state.p1.rage >= 92 && state.tick % 8 < 4 ? '#fef08a' : '#f59e0b'
  );

  drawHudPortrait(ctx, state.p2.skin, NATIVE_WIDTH - 28, 4, true);
  drawCrispText(
    ctx,
    state.p2.name.slice(0, 12),
    NATIVE_WIDTH - 32,
    3,
    '#fef3c7',
    8,
    'right',
    true,
    92
  );

  pxRect(ctx, NATIVE_WIDTH - 126, 14, 94, 8, '#1f2937');
  pxRect(ctx, NATIVE_WIDTH - 126, 14, 94, 1, '#4b5563');
  const p2W = Math.max(0, Math.round((state.p2.hp / state.p2.maxHp) * 92));
  if (p2W > 0) {
    pxRect(ctx, NATIVE_WIDTH - 33 - p2W, 15, p2W, 6, '#dc2626');
    pxRect(ctx, NATIVE_WIDTH - 33 - p2W, 15, p2W, 2, '#f87171');
  }

  const p2StamW = Math.max(0, Math.round((state.p2.stamina / state.p2.maxStamina) * 58));
  pxRect(ctx, NATIVE_WIDTH - 90, 24, 58, 4, '#18181b');
  pxRect(ctx, NATIVE_WIDTH - 32 - p2StamW, 24, p2StamW, 3, '#38bdf8');

  const p2RageW = Math.max(0, Math.round((state.p2.rage / 100) * 32));
  pxRect(ctx, NATIVE_WIDTH - 126, 24, 32, 4, '#18181b');
  pxRect(ctx, NATIVE_WIDTH - 126, 24, p2RageW, 3, '#f59e0b');

  // Center Round Pips & Arcade Score
  for (let i = 0; i < 2; i++) {
    pxRect(ctx, 134 + i * 7, 15, 5, 6, state.p1.roundsWon > i ? '#facc15' : '#3f3f46');
    pxRect(ctx, 181 - i * 7, 15, 5, 6, state.p2.roundsWon > i ? '#facc15' : '#3f3f46');
  }
  drawCrispText(ctx, `R${state.round}`, 160, 3, '#fbbf24', 8, 'center');
  drawCrispText(ctx, formatScore6(state.score), 160, 22, '#e2e8f0', 7, 'center');

  if (state.bannerTimer > 0 && state.bannerText) {
    pxRect(ctx, 24, 42, NATIVE_WIDTH - 48, 20, 'rgba(12, 14, 18, 0.90)');
    pxRect(ctx, 24, 42, NATIVE_WIDTH - 48, 2, '#d97706');
    pxRect(ctx, 24, 60, NATIVE_WIDTH - 48, 2, '#92400e');
    drawCrispText(
      ctx,
      state.bannerText,
      160,
      47,
      '#fef08a',
      9,
      'center',
      true,
      NATIVE_WIDTH - 60
    );
  }
}

function drawZonePickup320(
  ctx: CanvasRenderingContext2D,
  kind: 'meat_heal' | 'steel_shard',
  screenX: number,
  screenY: number,
  tick: number
): void {
  const bob = Math.round(Math.sin(tick * 0.14) * 2);
  const py = Math.round(screenY + bob);
  pxRect(ctx, screenX - 7, GROUND_Y - 1, 14, 3, 'rgba(0,0,0,0.45)');

  if (kind === 'meat_heal') {
    // Pixel-art roasted meat haunch on bone
    pxRect(ctx, screenX - 9, py - 6, 18, 3, '#f8fafc');
    pxRect(ctx, screenX - 10, py - 7, 2, 5, '#e2e8f0');
    pxRect(ctx, screenX + 8, py - 7, 2, 5, '#e2e8f0');
    pxRect(ctx, screenX - 6, py - 10, 12, 9, '#9a3412');
    pxRect(ctx, screenX - 5, py - 9, 10, 6, '#c2410c');
    pxRect(ctx, screenX - 3, py - 8, 5, 2, '#fdba74');
  } else {
    // Pixel-art glowing steel shard crystal
    pxRect(ctx, screenX - 4, py - 12, 8, 11, '#0284c7');
    pxRect(ctx, screenX - 2, py - 14, 4, 13, '#38bdf8');
    pxRect(ctx, screenX - 1, py - 11, 2, 6, '#f0f9ff');
  }
}

function drawZoneTraversal320(
  ctx: CanvasRenderingContext2D,
  zone: ZoneTraversalState,
  settings: AkaSystemSettings,
  equippedTechnique: TechniqueId
): void {
  const t = TRANSLATIONS[settings.language];
  const ct = getLocalizedCombatText(settings.language);
  const goreMode = settings.goreMode;
  const camX = Math.round(zone.cameraX);

  ctx.save();
  if (zone.screenShake > 0) {
    const sx = ((zone.tick % 2) * 2 - 1) * Math.min(3, zone.screenShake);
    const sy = (((zone.tick >> 1) % 2) * 2 - 1) * 2;
    ctx.translate(sx, sy);
  }

  const scrollCanvas = getZoneScrollCanvas960(zone.stage);
  if (scrollCanvas) {
    ctx.drawImage(
      scrollCanvas,
      camX,
      0,
      NATIVE_WIDTH,
      NATIVE_HEIGHT,
      0,
      0,
      NATIVE_WIDTH,
      NATIVE_HEIGHT
    );
  } else {
    drawFallbackProceduralStage(ctx, zone.stage);
  }

  drawStageAtmosphericOverlay(ctx, zone.stage, zone.tick, zone.lightningFlash, false, true, camX);

  // Authentic 16-bit Pixel-Art Spiked Iron Portcullis Gates at the Bastion Thresholds & Boss Gate!
  for (const gateWorldX of ZONE_WALL_GATES) {
    const isLocked = zone.lockX <= gateWorldX + 4;
    drawPixelPortcullisGate320(ctx, gateWorldX, isLocked, zone.tick, camX);
  }
  drawPixelPortcullisGate320(
    ctx,
    ZONE_WORLD_WIDTH - 48,
    zone.lockX < ZONE_WORLD_WIDTH - 40,
    zone.tick,
    camX
  );

  // Persistent crimson floor splatters in Normal/Gore modes
  drawFloorDecals320(ctx, zone.floorDecals, goreMode, camX);

  // Pickups
  for (const pk of zone.pickups) {
    if (pk.collected) continue;
    const sx = Math.round(pk.x - camX);
    if (sx >= -16 && sx <= NATIVE_WIDTH + 16) {
      drawZonePickup320(ctx, pk.kind, sx, pk.y, zone.tick);
    }
  }

  // Draw fallen minions first so living fighters step cleanly in front
  for (const inst of zone.enemies) {
    if (inst.fighter.action === 'dead' || inst.fighter.action === 'decapitated') {
      const fade = inst.despawnTimer > 65 ? Math.max(0.2, 1 - (inst.despawnTimer - 65) / 30) : 1;
      drawFighter320(ctx, inst.fighter, zone.tick, camX, fade);
    }
  }

  // Draw living minions + compact overhead HP bar (gold-framed for Co-op Boss Finale!)
  for (const inst of zone.enemies) {
    if (inst.fighter.action !== 'dead' && inst.fighter.action !== 'decapitated') {
      drawFighter320(ctx, inst.fighter, zone.tick, camX, 1);
      const sx = Math.round(inst.fighter.x - camX);
      if (sx >= -14 && sx <= NATIVE_WIDTH + 14) {
        const isBoss = Boolean(inst.isBossFinale);
        const barW = isBoss ? 44 : 26;
        const flyLift =
          inst.fighter.skin === 'cave_bat'
            ? 14
            : inst.fighter.skin === 'spectral_wraith'
            ? 6
            : isBoss
            ? 8
            : 0;
        const barY = GROUND_Y - 66 - flyLift;
        const barX = sx - Math.floor(barW / 2);
        if (isBoss) {
          pxRect(ctx, barX - 1, barY - 1, barW + 2, 6, '#f59e0b');
          drawCrispText(ctx, inst.fighter.name, sx, barY - 10, '#fde047', 7, 'center', true, 72);
        }
        pxRect(ctx, barX, barY, barW, 4, '#090b10');
        const fillW = Math.max(1, Math.round((inst.fighter.hp / inst.fighter.maxHp) * (barW - 2)));
        pxRect(ctx, barX + 1, barY + 1, fillW, 2, isBoss ? '#f59e0b' : '#ef4444');
      }
    }
  }

  // Draw Co-op Partner (J2) & Krom (J1) with active Botte Secrète trails!
  if (zone.isCoop && zone.p2) {
    const p2Fade = zone.p2.hp <= 0 ? (zone.tick % 16 < 8 ? 0.55 : 0.85) : 1;
    drawFighter320(ctx, zone.p2, zone.tick, camX, p2Fade, 'iron_riposte');
  }

  const p1Fade =
    zone.isCoop && zone.p1.hp <= 0 ? (zone.tick % 16 < 8 ? 0.55 : 0.85) : 1;
  drawFighter320(ctx, zone.p1, zone.tick, camX, p1Fade, equippedTechnique);

  // Crisp J1 / J2 overhead tags & SOS revive prompt in Co-op!
  if (zone.isCoop && zone.p2) {
    const p1Sx = Math.round(zone.p1.x - camX);
    const p2Sx = Math.round(zone.p2.x - camX);
    if (p1Sx >= 6 && p1Sx <= NATIVE_WIDTH - 6) {
      drawCrispText(
        ctx,
        zone.p1.hp <= 0 ? 'SOS [D]' : 'J1',
        p1Sx,
        GROUND_Y - 68,
        zone.p1.hp <= 0 ? '#4ade80' : '#fbbf24',
        7,
        'center',
        true,
        44
      );
    }
    if (p2Sx >= 6 && p2Sx <= NATIVE_WIDTH - 6) {
      drawCrispText(
        ctx,
        zone.p2.hp <= 0 ? 'SOS [D]' : 'J2',
        p2Sx,
        GROUND_Y - 68,
        zone.p2.hp <= 0 ? '#4ade80' : '#38bdf8',
        7,
        'center',
        true,
        44
      );
    }
  }

  // Localized weapon contact slashes, sparks & arterial sprays!
  drawImpactEffects320(ctx, zone.impacts, goreMode, zone.tick, camX);

  // Particles & Floating Score Popups
  for (const p of zone.particles) {
    const px = Math.round(p.x - camX);
    if (px >= 0 && px < NATIVE_WIDTH) {
      pxRect(ctx, px, Math.round(p.y), p.size, p.size, p.color);
    }
  }

  for (const ft of zone.floatingTexts) {
    const fx = Math.round(ft.x - camX);
    if (fx >= 8 && fx <= NATIVE_WIDTH - 8) {
      drawCrispText(ctx, ft.text, fx, Math.round(ft.y), ft.color, 8, 'center', true, 120);
    }
  }

  ctx.restore();

  // Top Beat-'em-up Arcade HUD (Solo vs Dual Co-op 2P Layout)
  pxRect(ctx, 0, 0, NATIVE_WIDTH, 32, 'rgba(9, 11, 16, 0.88)');
  pxRect(ctx, 0, 32, NATIVE_WIDTH, 1, '#78350f');

  if (zone.isCoop && zone.p2) {
    // J1 (Krom) Compact HUD (x = 4..108)
    drawHudPortrait(ctx, 'krom', 4, 4, false);
    drawCrispText(ctx, 'J1 KROM', 30, 3, '#fef3c7', 7, 'left', true, 76);
    pxRect(ctx, 30, 13, 76, 8, '#1f2937');
    const p1W = Math.max(0, Math.round((zone.p1.hp / zone.p1.maxHp) * 74));
    if (p1W > 0) {
      pxRect(ctx, 31, 14, p1W, 6, '#dc2626');
      pxRect(ctx, 31, 14, p1W, 2, '#f87171');
    }
    const p1StamW = Math.max(0, Math.round((zone.p1.stamina / zone.p1.maxStamina) * 46));
    pxRect(ctx, 30, 23, 46, 4, '#18181b');
    pxRect(ctx, 30, 23, p1StamW, 3, '#38bdf8');
    const p1RageW = Math.max(0, Math.round((zone.p1.rage / 100) * 26));
    pxRect(ctx, 80, 23, 26, 4, '#18181b');
    pxRect(ctx, 80, 23, p1RageW, 3, '#f59e0b');

    // J2 (Kaelen / Allié AKA) Compact HUD (x = 112..216)
    drawHudPortrait(ctx, 'rival_aka', 112, 4, false);
    drawCrispText(ctx, `J2 ${zone.p2.name}`, 138, 3, '#7dd3fc', 7, 'left', true, 76);
    pxRect(ctx, 138, 13, 76, 8, '#1f2937');
    const p2W = Math.max(0, Math.round((zone.p2.hp / zone.p2.maxHp) * 74));
    if (p2W > 0) {
      pxRect(ctx, 139, 14, p2W, 6, '#0284c7');
      pxRect(ctx, 139, 14, p2W, 2, '#38bdf8');
    }
    const p2StamW = Math.max(0, Math.round((zone.p2.stamina / zone.p2.maxStamina) * 46));
    pxRect(ctx, 138, 23, 46, 4, '#18181b');
    pxRect(ctx, 138, 23, p2StamW, 3, '#4ade80');
    const p2RageW = Math.max(0, Math.round((zone.p2.rage / 100) * 26));
    pxRect(ctx, 188, 23, 26, 4, '#18181b');
    pxRect(ctx, 188, 23, p2RageW, 3, '#f59e0b');

    // Right Co-op Horde Counter & Shared Score (x = 220..314)
    drawCrispText(
      ctx,
      `COOP · ${formatScore6(zone.score)}`,
      NATIVE_WIDTH - 6,
      4,
      '#fef08a',
      7,
      'right',
      true,
      94
    );
    drawCrispText(
      ctx,
      `${t.zoneRemainingLabel} ${zone.slainCount}/${zone.totalEnemies}`,
      NATIVE_WIDTH - 6,
      17,
      '#cbd5e1',
      7,
      'right',
      true,
      94
    );
  } else {
    drawHudPortrait(ctx, 'krom', 4, 4, false);
    drawCrispText(ctx, 'KROM', 32, 3, '#fef3c7', 8, 'left', true, 30);
    const techBadge = getShortTechniqueBadge(equippedTechnique, settings.language);
    drawCrispText(ctx, techBadge.label, 120, 4, techBadge.color, 7, 'right', true, 56);
    pxRect(ctx, 32, 14, 88, 8, '#1f2937');
    const p1W = Math.max(0, Math.round((zone.p1.hp / zone.p1.maxHp) * 86));
    if (p1W > 0) {
      pxRect(ctx, 33, 15, p1W, 6, '#dc2626');
      pxRect(ctx, 33, 15, p1W, 2, '#f87171');
    }
    const p1StamW = Math.max(0, Math.round((zone.p1.stamina / zone.p1.maxStamina) * 52));
    pxRect(ctx, 32, 24, 52, 4, '#18181b');
    pxRect(ctx, 32, 24, p1StamW, 3, '#38bdf8');
    const p1RageW = Math.max(0, Math.round((zone.p1.rage / 100) * 32));
    pxRect(ctx, 88, 24, 32, 4, '#18181b');
    pxRect(ctx, 88, 24, p1RageW, 3, '#f59e0b');

    // Center Score & Combo
    drawCrispText(
      ctx,
      `${t.scoreLabel} ${formatScore6(zone.score)}`,
      166,
      4,
      '#fef08a',
      8,
      'center',
      true,
      84
    );
    if (zone.comboCount >= 2) {
      drawCrispText(ctx, `COMBO x${zone.comboCount}`, 166, 17, '#fb923c', 8, 'center', true, 84);
    } else {
      const progressPct = Math.min(100, Math.round((zone.p1.x / (ZONE_WORLD_WIDTH - 48)) * 100));
      pxRect(ctx, 130, 19, 72, 5, '#1f2937');
      pxRect(ctx, 131, 20, Math.round((70 * progressPct) / 100), 3, '#f59e0b');
    }

    // Right Zone Minion Counter (Localized Act Word & Remaining Label!)
    drawCrispText(
      ctx,
      `${ct.actWord} ${zone.actIndex + 1}`,
      NATIVE_WIDTH - 6,
      4,
      '#fbbf24',
      8,
      'right',
      true,
      96
    );
    drawCrispText(
      ctx,
      `${t.zoneRemainingLabel} ${zone.slainCount}/${zone.totalEnemies}`,
      NATIVE_WIDTH - 6,
      17,
      '#cbd5e1',
      8,
      'right',
      true,
      102
    );
  }

  // Flashing "GO / AVANCEZ ▶▶" Arrow when current arena pocket is clear!
  const anyAlive = zone.enemies.some(
    (e) => e.fighter.action !== 'dead' && e.fighter.action !== 'decapitated'
  );
  if ((!anyAlive || zone.goArrowTimer > 0) && !zone.zoneCompleted && zone.tick % 24 < 16) {
    pxRect(ctx, NATIVE_WIDTH - 96, 38, 90, 18, 'rgba(15, 23, 42, 0.92)');
    pxRect(ctx, NATIVE_WIDTH - 96, 38, 90, 2, '#4ade80');
    drawCrispText(ctx, t.zoneGoPrompt, NATIVE_WIDTH - 51, 43, '#4ade80', 8, 'center', true, 84);
  }

  if (zone.bannerTimer > 0 && zone.bannerText) {
    pxRect(ctx, 20, 42, NATIVE_WIDTH - 40, 20, 'rgba(12, 14, 18, 0.90)');
    pxRect(ctx, 20, 42, NATIVE_WIDTH - 40, 2, '#d97706');
    pxRect(ctx, 20, 60, NATIVE_WIDTH - 40, 2, '#92400e');
    drawCrispText(
      ctx,
      zone.bannerText,
      160,
      47,
      '#fef08a',
      8,
      'center',
      true,
      NATIVE_WIDTH - 52
    );
  }
}

function drawBootloaderScreen(
  ctx: CanvasRenderingContext2D,
  boot: BootloaderState,
  settings: AkaSystemSettings,
  isBooting: boolean
): void {
  const t = TRANSLATIONS[settings.language];
  pxRect(ctx, 0, 0, NATIVE_WIDTH, NATIVE_HEIGHT, '#090d16');
  pxRect(ctx, 0, 0, NATIVE_WIDTH, 26, '#141c2b');
  pxRect(ctx, 0, 26, NATIVE_WIDTH, 2, '#f59e0b');
  drawCrispText(ctx, t.bootloaderHeader, 10, 7, '#f8fafc', 9, 'left');

  pxRect(ctx, 18, 44, NATIVE_WIDTH - 36, 128, '#131926');
  pxRect(ctx, 18, 44, NATIVE_WIDTH - 36, 2, '#f59e0b');
  pxRect(ctx, 18, 170, NATIVE_WIDTH - 36, 2, '#f59e0b');
  pxRect(ctx, 18, 44, 2, 128, '#f59e0b');
  pxRect(ctx, NATIVE_WIDTH - 20, 44, 2, 128, '#f59e0b');

  pxRect(ctx, 30, 58, 48, 52, '#1e293b');
  const portraitSheet = getSkinSheetCanvas('heroPortrait', 'krom', false);
  if (portraitSheet) {
    ctx.drawImage(portraitSheet, 14, 4, 58, 64, 32, 60, 44, 48);
  } else {
    pxRect(ctx, 52, 68, 4, 24, '#e2e8f0');
    pxRect(ctx, 46, 86, 16, 3, '#f59e0b');
  }

  drawCrispText(ctx, t.brandTitle, 88, 58, '#fef08a', 11, 'left');
  drawCrispText(ctx, t.bootloaderDirectory, 88, 78, '#38bdf8', 8, 'left');
  drawCrispText(ctx, t.bootloaderBinaryName, 88, 94, '#cbd5e1', 8, 'left');
  drawCrispText(
    ctx,
    'SDK: gamebuino + aka_runtime + aka_font',
    88,
    112,
    '#94a3b8',
    7,
    'left',
    false
  );

  if (isBooting) {
    drawCrispText(ctx, t.bootloaderLoading, 32, 136, '#facc15', 8, 'left');
    pxRect(ctx, 32, 150, NATIVE_WIDTH - 64, 10, '#090d16');
    const barW = Math.round(((NATIVE_WIDTH - 68) * boot.bootProgress) / 100);
    pxRect(ctx, 34, 152, barW, 6, '#f59e0b');
  } else {
    drawCrispText(ctx, '▶ SD:/Krom_Barbarian/Firmware.bin [OTA_0]', 32, 144, '#4ade80', 8, 'left');
  }

  pxRect(ctx, 0, NATIVE_HEIGHT - 24, NATIVE_WIDTH, 24, '#111622');
  drawCrispText(
    ctx,
    t.bootloaderPrompt,
    160,
    NATIVE_HEIGHT - 17,
    '#e2e8f0',
    8,
    'center',
    true,
    NATIVE_WIDTH - 16
  );
}

function drawInScreenTitleMenu(
  ctx: CanvasRenderingContext2D,
  titleCursor: number,
  progression: ProgressionState,
  settings: AkaSystemSettings
): void {
  const t = TRANSLATIONS[settings.language];
  const fg = getLocalizedForge(settings.language);
  pxRect(ctx, 16, 16, NATIVE_WIDTH - 32, NATIVE_HEIGHT - 32, 'rgba(9, 11, 16, 0.88)');
  pxRect(ctx, 16, 16, NATIVE_WIDTH - 32, 2, '#d97706');
  pxRect(ctx, 16, NATIVE_HEIGHT - 18, NATIVE_WIDTH - 32, 2, '#d97706');

  drawCrispText(ctx, t.titleSubtitle, 160, 24, '#f59e0b', 7, 'center', true, 206);
  drawCrispText(
    ctx,
    `◀ ${settings.language.toUpperCase()} ▶`,
    NATIVE_WIDTH - 22,
    24,
    '#38bdf8',
    7,
    'right',
    true,
    46
  );
  drawCrispText(
    ctx,
    t.brandTitle.toUpperCase(),
    160,
    38,
    '#ffffff',
    11,
    'center',
    true,
    NATIVE_WIDTH - 48
  );

  const options = [
    t.titleMenuCampaign,
    t.titleMenuCoop2P,
    t.titleMenuQuickAi,
    `${t.titleMenuForge} (${progression.steelShards} ${fg.shardUnitShort})`,
    t.titleMenuCodex,
    t.titleMenuLocal2P,
    t.titleMenuWifiUsb,
  ];

  options.forEach((label, idx) => {
    const active = idx === titleCursor;
    const ry = 63 + idx * 18;
    if (active) {
      pxRect(ctx, 28, ry - 2, NATIVE_WIDTH - 56, 15, '#b45309');
    }
    drawCrispText(
      ctx,
      active ? `▶ ${label}` : `  ${label}`,
      36,
      ry,
      active
        ? '#ffffff'
        : idx === 1
        ? '#86efac'
        : idx === 3
        ? '#fde68a'
        : idx === 4
        ? '#7dd3fc'
        : '#cbd5e1',
      8,
      'left',
      true,
      NATIVE_WIDTH - 72
    );
  });

  drawCrispText(
    ctx,
    t.titleControlHint,
    160,
    204,
    '#94a3b8',
    7,
    'center',
    false,
    NATIVE_WIDTH - 44
  );
}

function drawAkaForgeScreen320(
  ctx: CanvasRenderingContext2D,
  progression: ProgressionState,
  forgeUi: AkaForgeUiState,
  tick: number,
  settings: AkaSystemSettings
): void {
  const fg = getLocalizedForge(settings.language);
  pxRect(ctx, 8, 8, NATIVE_WIDTH - 16, NATIVE_HEIGHT - 16, 'rgba(9, 11, 16, 0.95)');
  pxRect(ctx, 8, 8, NATIVE_WIDTH - 16, 2, '#f59e0b');
  pxRect(ctx, 8, NATIVE_HEIGHT - 10, NATIVE_WIDTH - 16, 2, '#f59e0b');

  // Animated Forge Brazier & Anvil Sparks on the top-right!
  drawLightHalo(ctx, 288, 36, 24, '251, 146, 60', 0.22, tick, 2);
  drawFxProp(ctx, 'brazier', 288, 52, 0.17, tick);
  if (forgeUi.sparkTick > 0) {
    for (let s = 0; s < 10; s++) {
      const sx = 278 + ((s * 7 + tick * 3) % 24) - 6;
      const sy = 34 - ((tick * 2 + s * 5) % 20);
      pxRect(ctx, sx, sy, 2, 2, s % 2 === 0 ? '#fef08a' : '#f97316');
    }
  }

  drawCrispText(ctx, fg.headerTitle, 16, 14, '#fef08a', 8, 'left', true, 246);
  drawCrispText(
    ctx,
    `${fg.shardsLabel} : ${progression.steelShards}`,
    16,
    27,
    '#38bdf8',
    8,
    'left',
    true,
    246
  );

  // 4 Upgrades (0..3) + 3 Secret Techniques (4..6)
  let selectedDesc = '';

  FORGE_UPGRADES.forEach((up, idx) => {
    const locUp = fg.upgrades[up.key];
    const active = forgeUi.cursor === idx;
    const rank = progression[up.key];
    const isMax = rank >= 4;
    const cost = up.baseCost + rank * up.costStep;
    const canAfford = !isMax && progression.steelShards >= cost;
    const y = 44 + idx * 17;

    if (active) {
      pxRect(ctx, 14, y - 1, NATIVE_WIDTH - 28, 15, '#1e293b');
      pxRect(ctx, 14, y - 1, 3, 15, '#f59e0b');
      selectedDesc = `${locUp.title} (${locUp.formatEffect(rank)}) : ${locUp.shortDesc}`;
    }

    const pips = '■'.repeat(rank) + '·'.repeat(4 - rank);
    drawCrispText(
      ctx,
      `${active ? '▶' : ' '} ${locUp.title} [${pips}]`,
      20,
      y + 1,
      active ? '#ffffff' : '#cbd5e1',
      8,
      'left',
      true,
      214
    );
    drawCrispText(
      ctx,
      isMax ? fg.maxTag : `${cost} ${fg.shardUnitShort}`,
      NATIVE_WIDTH - 18,
      y + 1,
      isMax ? '#4ade80' : canAfford ? '#fbbf24' : '#64748b',
      8,
      'right',
      true,
      64
    );
  });

  drawCrispText(ctx, fg.secretHeader, 16, 115, '#f59e0b', 7, 'left', true, 286);

  SWORD_TECHNIQUES.forEach((tech, tIdx) => {
    const locTech = fg.techniques[tech.id];
    const rowIdx = 4 + tIdx;
    const active = forgeUi.cursor === rowIdx;
    const unlocked = progression.unlockedTechniques.includes(tech.id);
    const equipped = progression.equippedTechnique === tech.id;
    const canAfford = !unlocked && progression.steelShards >= tech.unlockCost;
    const y = 126 + tIdx * 17;

    if (active) {
      pxRect(ctx, 14, y - 1, NATIVE_WIDTH - 28, 15, '#1e293b');
      pxRect(ctx, 14, y - 1, 3, 15, '#38bdf8');
      selectedDesc = `${locTech.inputHint} — ${locTech.shortSummary}`;
    }

    drawCrispText(
      ctx,
      `${active ? '▶' : ' '} ${locTech.name}`,
      20,
      y + 1,
      equipped ? '#fde047' : active ? '#ffffff' : '#cbd5e1',
      8,
      'left',
      true,
      196
    );

    const rightTag = equipped
      ? fg.equippedTag
      : unlocked
      ? fg.equipPrompt
      : `${tech.unlockCost} ${fg.shardUnitShort}`;
    const rightColor = equipped
      ? '#4ade80'
      : unlocked
      ? '#38bdf8'
      : canAfford
      ? '#fbbf24'
      : '#64748b';

    drawCrispText(
      ctx,
      rightTag,
      NATIVE_WIDTH - 18,
      y + 1,
      rightColor,
      8,
      'right',
      true,
      84
    );
  });

  // Bottom Description & Feedback Box (strictly bounded inside x = 14..306, inner maxWidth = 280px!)
  pxRect(ctx, 14, 180, NATIVE_WIDTH - 28, 34, '#0c1018');
  pxRect(ctx, 14, 180, NATIVE_WIDTH - 28, 1, '#334155');
  const infoText = forgeUi.feedbackText || selectedDesc;
  const lines = wrapTextPx(ctx, infoText, 280, 7, false).slice(0, 2);
  lines.forEach((ln, i) => {
    drawCrispText(
      ctx,
      ln,
      18,
      184 + i * 11,
      forgeUi.feedbackText ? '#4ade80' : '#e2e8f0',
      7,
      'left',
      false,
      280
    );
  });

  drawCrispText(
    ctx,
    fg.footerFormat(forgeUi.continueLabel),
    160,
    218,
    '#fbbf24',
    7,
    'center',
    true,
    NATIVE_WIDTH - 24
  );
}

function drawAkaCodexScreen320(
  ctx: CanvasRenderingContext2D,
  codexUi: AkaCodexUiState,
  equippedTechnique: TechniqueId,
  settings: AkaSystemSettings
): void {
  const cxLoc = getLocalizedCodex(settings.language);
  pxRect(ctx, 8, 8, NATIVE_WIDTH - 16, NATIVE_HEIGHT - 16, 'rgba(9, 11, 16, 0.95)');
  pxRect(ctx, 8, 8, NATIVE_WIDTH - 16, 2, '#38bdf8');
  pxRect(ctx, 8, NATIVE_HEIGHT - 10, NATIVE_WIDTH - 16, 2, '#38bdf8');

  drawCrispText(
    ctx,
    `◀ ${cxLoc.pageTitles[codexUi.page] ?? cxLoc.pageTitles[0]} ▶`,
    160,
    15,
    '#7dd3fc',
    8,
    'center',
    true,
    NATIVE_WIDTH - 28
  );
  pxRect(ctx, 16, 28, NATIVE_WIDTH - 32, 1, '#1e293b');

  // Right-side Live Animated Krom Demo Box (x = 226..306)
  pxRect(ctx, 226, 36, 80, 114, '#111622');
  pxRect(ctx, 226, 36, 80, 1, '#334155');
  pxRect(ctx, 226, 134, 80, 16, '#1e293b');

  const demoActionsByPage: FighterAction[][] = [
    ['walk_fwd', 'crouch', 'roll_fwd', 'jump'],
    ['slash_high', 'thrust_mid', 'sweep_low', 'cleave_overhead'],
    ['block_high', 'slash_high', 'roll_back'],
    ['spin_decap', 'cleave_overhead', 'block_high'],
  ];
  const cycle = demoActionsByPage[codexUi.page] ?? demoActionsByPage[0];
  const demoPeriod = 96;
  const demoAction = cycle[Math.floor(codexUi.tick / demoPeriod) % cycle.length];
  const subTick = codexUi.tick % demoPeriod;
  const jumpOffset =
    demoAction === 'jump'
      ? Math.round(Math.sin((Math.min(subTick, 64) / 64) * Math.PI) * 20)
      : 0;

  const dummyKrom: FighterState = {
    id: 'p1',
    name: 'KROM',
    skin: 'krom',
    x: 266,
    y: 134 - jumpOffset,
    vx: 0,
    vy: 0,
    facing: 1,
    hp: 100,
    maxHp: 100,
    stamina: 100,
    maxStamina: 100,
    rage: 100,
    action: demoAction,
    actionTick: Math.min(subTick >> 1, 24),
    actionDuration: 28,
    hitApplied: false,
    roundsWon: 0,
    damageMultiplier: 1,
    decapThresholdBonus: 0,
  };

  // Clip & draw Krom inside the live demo preview
  ctx.save();
  ctx.beginPath();
  ctx.rect(227, 37, 78, 112);
  ctx.clip();
  ctx.translate(0, 134 - GROUND_Y);
  dummyKrom.y = GROUND_Y - jumpOffset;
  drawFighter320(ctx, dummyKrom, codexUi.tick, 0, 1, equippedTechnique);
  ctx.restore();

  drawCrispText(
    ctx,
    cxLoc.demoLabels[demoAction] ?? 'Krom',
    266,
    138,
    '#fde047',
    7,
    'center',
    true,
    74
  );

  // Left-side Crisp Structured Move Rows strictly bounded in x = 16..220 (maxWidth = 204px!)
  const rows = cxLoc.pages[codexUi.page] ?? cxLoc.pages[0];
  rows.forEach((r, idx) => {
    const ry = 36 + idx * 29;
    drawCrispText(ctx, r.cmd, 16, ry, '#fbbf24', 8, 'left', true, 204);
    drawCrispText(ctx, r.desc, 16, ry + 11, '#e2e8f0', 7, 'left', false, 204);
  });

  // Tip box at bottom (x = 16..304, inner text at x = 22, maxWidth = 276px!)
  const badge = getShortTechniqueBadge(equippedTechnique, settings.language);
  pxRect(ctx, 16, 156, NATIVE_WIDTH - 32, 54, '#0c1018');
  pxRect(ctx, 16, 156, NATIVE_WIDTH - 32, 1, '#1e293b');
  drawCrispText(
    ctx,
    cxLoc.tipEquippedLine(badge.label),
    22,
    162,
    badge.color,
    7,
    'left',
    true,
    276
  );
  drawCrispText(
    ctx,
    cxLoc.tipForgeLine1,
    22,
    176,
    '#cbd5e1',
    7,
    'left',
    false,
    276
  );
  drawCrispText(
    ctx,
    cxLoc.tipForgeLine2,
    22,
    188,
    '#cbd5e1',
    7,
    'left',
    false,
    276
  );

  drawCrispText(
    ctx,
    cxLoc.footerHint,
    160,
    218,
    '#4ade80',
    7,
    'center',
    true,
    NATIVE_WIDTH - 24
  );
}

function drawIllustratedStoryScreen320(
  ctx: CanvasRenderingContext2D,
  kind: 'STORY_INTRO' | 'STORY_BOSS_PRELUDE' | 'STORY_ACT_EPILOGUE',
  act: CampaignAct,
  score: number,
  steelShards: number,
  settings: AkaSystemSettings
): void {
  const t = TRANSLATIONS[settings.language];
  const locAct = getLocalizedAct(act.actNumber - 1, settings.language);
  const fg = getLocalizedForge(settings.language);
  const ct = getLocalizedCombatText(settings.language);

  pxRect(ctx, 10, 10, NATIVE_WIDTH - 20, NATIVE_HEIGHT - 20, 'rgba(8, 10, 16, 0.94)');
  pxRect(ctx, 10, 10, NATIVE_WIDTH - 20, 2, '#d97706');
  pxRect(ctx, 10, NATIVE_HEIGHT - 12, NATIVE_WIDTH - 20, 2, '#d97706');

  // Top 284x58 Illustrated 16-bit Pixel-Art Story Strip!
  const artX = 18;
  const artY = 18;
  const artW = NATIVE_WIDTH - 36;
  const artH = 58;
  pxRect(ctx, artX - 1, artY - 1, artW + 2, artH + 2, '#78350f');

  if (kind === 'STORY_INTRO') {
    const zc = getZoneScrollCanvas960(act.id);
    if (zc) {
      ctx.drawImage(zc, 40, 36, artW, artH * 2, artX, artY, artW, artH);
    } else {
      drawFallbackProceduralStage(ctx, act.id);
    }
  } else if (kind === 'STORY_BOSS_PRELUDE') {
    const sc = getStageCanvas320(act.id);
    if (sc) {
      ctx.drawImage(sc, 18, 46, artW, artH * 2, artX, artY, artW, artH);
    }
  } else {
    const ic = getStoryInterludeCanvas320() ?? getStageCanvas320(act.id);
    if (ic) {
      ctx.drawImage(
        ic,
        0,
        20,
        Math.min(ic.width, artW),
        Math.min(ic.height - 20, artH * 2),
        artX,
        artY,
        artW,
        artH
      );
    }
  }

  let kicker = `${locAct.title} · ${steelShards} ${fg.shardWord}`;
  let heading = locAct.zoneTitle;
  let prose = locAct.zoneStoryIntro;
  let quote = `${ct.storyMinionsPrefix} : ${locAct.zoneSubtitle.split(' · ')[1] ?? locAct.zoneSubtitle} · ${ct.storyHelpHint}`;
  let footerPrompt = t.storyZoneStartPrompt;
  let portraitSkin: FighterSkin = act.zoneFeaturedMinions[0] ?? 'krom';

  if (kind === 'STORY_BOSS_PRELUDE') {
    kicker = `${t.scoreLabel} ${formatScore6(score)} · ${ct.storyShardsReady(steelShards)}`;
    heading = `${locAct.bossName} — ${locAct.bossTitle}`;
    prose = locAct.bossPreludeBody;
    quote = locAct.bossTaunt;
    footerPrompt = t.storyBossEnterPrompt;
    portraitSkin = act.bossSkin;
  } else if (kind === 'STORY_ACT_EPILOGUE') {
    kicker = ct.storyActCleared(steelShards);
    heading = locAct.interludeTitle;
    prose = locAct.interludeBody;
    quote = `${t.scoreLabel} : ${formatScore6(score)} · ${ct.storyShardsWon(act.rewardShards)}`;
    footerPrompt =
      act.actNumber < 6 ? t.storyInterludeNextPrompt : ct.storyFinishChroniclePrompt;
    portraitSkin = 'krom';
  }

  drawHudPortrait(ctx, portraitSkin, NATIVE_WIDTH - 44, 82, portraitSkin !== 'krom');
  drawCrispText(ctx, kicker, 20, 82, '#f59e0b', 8, 'left', true, 248);
  drawCrispText(ctx, heading, 20, 95, '#ffffff', 9, 'left', true, 248);

  const bodyLines = wrapTextPx(ctx, prose, 276, 7, false).slice(0, 5);
  bodyLines.forEach((line, idx) => {
    drawCrispText(ctx, line, 20, 111 + idx * 11, '#cbd5e1', 7, 'left', false, 276);
  });

  const quoteLines = wrapTextPx(ctx, quote, 276, 7, false).slice(0, 2);
  quoteLines.forEach((line, idx) => {
    drawCrispText(ctx, line, 20, 171 + idx * 11, '#fde68a', 7, 'left', false, 276);
  });

  drawCrispText(ctx, footerPrompt, 160, 210, '#4ade80', 7, 'center', true, NATIVE_WIDTH - 28);
}

function drawInScreenPostMatch(
  ctx: CanvasRenderingContext2D,
  victory: boolean,
  hasNextAct: boolean,
  isCampaign: boolean,
  score: number,
  steelShards: number,
  settings: AkaSystemSettings
): void {
  const t = TRANSLATIONS[settings.language];
  const fg = getLocalizedForge(settings.language);
  const ct = getLocalizedCombatText(settings.language);

  pxRect(ctx, 20, 40, NATIVE_WIDTH - 40, 158, 'rgba(9, 11, 16, 0.93)');
  pxRect(ctx, 20, 40, NATIVE_WIDTH - 40, 2, victory ? '#f59e0b' : '#dc2626');
  pxRect(ctx, 20, 196, NATIVE_WIDTH - 40, 2, victory ? '#f59e0b' : '#dc2626');

  drawCrispText(
    ctx,
    victory ? t.victoryTitle : t.defeatTitle,
    160,
    54,
    victory ? '#fef08a' : '#f87171',
    11,
    'center',
    true,
    NATIVE_WIDTH - 56
  );

  drawCrispText(
    ctx,
    `${t.scoreLabel} : ${formatScore6(score)} · ${steelShards} ${fg.shardWord.toUpperCase()}`,
    160,
    76,
    '#38bdf8',
    8,
    'center',
    true,
    NATIVE_WIDTH - 56
  );

  if (victory && isCampaign && hasNextAct) {
    drawCrispText(
      ctx,
      `▶ ${t.postMatchNextAct}`,
      160,
      102,
      '#4ade80',
      9,
      'center',
      true,
      NATIVE_WIDTH - 56
    );
  }
  drawCrispText(
    ctx,
    t.postMatchRematch,
    160,
    124,
    '#e2e8f0',
    8,
    'center',
    true,
    NATIVE_WIDTH - 56
  );
  drawCrispText(
    ctx,
    ct.postMatchForgeHint(steelShards),
    160,
    146,
    '#fbbf24',
    8,
    'center',
    true,
    NATIVE_WIDTH - 56
  );
  drawCrispText(
    ctx,
    t.postMatchTitleMenu,
    160,
    170,
    '#94a3b8',
    7,
    'center',
    false,
    NATIVE_WIDTH - 56
  );
}

function buildAsciiBar(percent: number): string {
  const filled = Math.round(Math.max(0, Math.min(100, percent)) / 10);
  return '[' + '■'.repeat(filled) + '·'.repeat(10 - filled) + `] ${percent}%`;
}

function drawHeartArtifact320(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  mode: 'stolen' | 'corrupted' | 'restored',
  tick: number
): void {
  const bob = Math.round(Math.sin(tick * 0.12) * 3);
  const cy = Math.round(y + bob);
  const cx = Math.round(x);

  const haloRgb =
    mode === 'restored'
      ? '56, 189, 248'
      : mode === 'corrupted'
      ? '168, 85, 247'
      : '245, 158, 11';
  drawLightHalo(ctx, cx, cy, mode === 'restored' ? 28 : 20, haloRgb, 0.24, tick, 3);

  const outer =
    mode === 'restored' ? '#0284c7' : mode === 'corrupted' ? '#6b21a8' : '#b45309';
  const mid =
    mode === 'restored' ? '#38bdf8' : mode === 'corrupted' ? '#c084fc' : '#f59e0b';
  const core = mode === 'restored' ? '#fef9c3' : '#fdf4ff';

  // Faceted pixel-art Heart of Steel diamond relic
  pxRect(ctx, cx - 2, cy - 9, 4, 18, outer);
  pxRect(ctx, cx - 5, cy - 5, 10, 10, outer);
  pxRect(ctx, cx - 3, cy - 6, 6, 12, mid);
  pxRect(ctx, cx - 4, cy - 3, 8, 6, mid);
  pxRect(ctx, cx - 1, cy - 4, 2, 7, core);
}

function drawCutsceneScreen320(
  ctx: CanvasRenderingContext2D,
  cutsceneUi: AkaCutsceneUiState,
  equippedTechnique: TechniqueId,
  settings: AkaSystemSettings,
  globalTick: number
): void {
  const t = TRANSLATIONS[settings.language];
  const def = CUTSCENES[cutsceneUi.cutsceneId] ?? CUTSCENES.act1_opening;
  const shotIndex = Math.max(0, Math.min(def.shots.length - 1, cutsceneUi.shotIndex));
  const shot = def.shots[shotIndex];
  const sTick = cutsceneUi.shotTick;
  const progress = Math.min(1, sTick / Math.max(1, shot.durationTicks));

  // Clear widescreen cinema frame
  pxRect(ctx, 0, 0, NATIVE_WIDTH, NATIVE_HEIGHT, '#06080d');

  // Camera pan & optional rumble/lightning triggers
  const camX =
    shot.backdrop === 'zone'
      ? Math.round(
          (shot.camStartX ?? 0) +
            ((shot.camEndX ?? shot.camStartX ?? 0) - (shot.camStartX ?? 0)) * progress
        )
      : 0;

  const isLightning = Boolean(
    shot.lightningTicks?.some((lt) => sTick >= lt && sTick < lt + 9)
  );
  const isShaking = Boolean(
    shot.shakeTicks?.some((st) => sTick >= st && sTick < st + 14)
  );

  // WIDESCREEN 16-BIT CINEMA VIEWPORT (y = 22 .. 172)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 22, NATIVE_WIDTH, 150);
  ctx.clip();

  if (isShaking) {
    const rx = ((sTick % 2) * 2 - 1) * 2;
    const ry = (((sTick >> 1) % 2) * 2 - 1) * 2;
    ctx.translate(rx, ry);
  }

  // Shift world up by 28px so GROUND_Y (196) sits cleanly at y = 168 inside the letterbox!
  ctx.translate(0, -28);

  if (shot.backdrop === 'zone') {
    const zc = getZoneScrollCanvas960(shot.stage);
    if (zc) {
      ctx.drawImage(
        zc,
        Math.max(0, Math.min(ZONE_WORLD_WIDTH - NATIVE_WIDTH, camX)),
        0,
        NATIVE_WIDTH,
        NATIVE_HEIGHT,
        0,
        0,
        NATIVE_WIDTH,
        NATIVE_HEIGHT
      );
    } else {
      drawFallbackProceduralStage(ctx, shot.stage);
    }
    drawStageAtmosphericOverlay(
      ctx,
      shot.stage,
      globalTick + sTick,
      isLightning ? 6 : 0,
      true,
      true,
      camX
    );
  } else {
    drawStageBackground320(
      ctx,
      shot.stage,
      globalTick + sTick,
      isLightning ? 6 : 0,
      true
    );
  }

  if (shot.skyTint) {
    ctx.fillStyle = shot.skyTint;
    ctx.fillRect(0, 20, NATIVE_WIDTH, GROUND_Y);
  }

  // Optional Heart of Steel Artifact
  if (shot.heartArtifact) {
    const rise = shot.heartArtifact.risePx
      ? Math.round(shot.heartArtifact.risePx * progress)
      : 0;
    const artScreenX =
      shot.backdrop === 'zone' ? shot.heartArtifact.x - camX : shot.heartArtifact.x;
    drawHeartArtifact320(
      ctx,
      artScreenX,
      shot.heartArtifact.y - rise,
      shot.heartArtifact.mode,
      globalTick + sTick
    );
  }

  // Choreographed Sprite Actors!
  shot.actors.forEach((actor, idx) => {
    const mStart = actor.moveStartTick ?? 0;
    const mEnd = Math.max(mStart + 1, actor.moveEndTick ?? 1);
    const moveT =
      actor.startX === actor.endX
        ? 1
        : Math.max(0, Math.min(1, (sTick - mStart) / (mEnd - mStart)));
    const curX = actor.startX + (actor.endX - actor.startX) * moveT;
    const isMoving =
      actor.startX !== actor.endX && sTick >= mStart && sTick < mEnd;

    let action: FighterAction = actor.baseAction ?? (isMoving ? 'walk_fwd' : 'idle');
    let actionTick = sTick;
    let actionDuration = 30;

    if (
      actor.poseAtTick &&
      sTick >= actor.poseAtTick.tick &&
      sTick < actor.poseAtTick.tick + actor.poseAtTick.duration
    ) {
      action = actor.poseAtTick.action;
      actionTick = sTick - actor.poseAtTick.tick;
      actionDuration = actor.poseAtTick.duration;
    } else if (actor.baseAction === 'dead') {
      action = 'dead';
      actionTick = 80;
      actionDuration = 999;
    }

    const facing: 1 | -1 =
      actor.flipAtTick !== undefined && sTick >= actor.flipAtTick
        ? (-actor.facing as 1 | -1)
        : actor.facing;

    const dummyFighter: FighterState = {
      id: actor.skin === 'krom' ? 'p1' : 'p2',
      name: actor.skin.toUpperCase(),
      skin: actor.skin,
      x: curX,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      facing,
      hp: 100,
      maxHp: 100,
      stamina: 100,
      maxStamina: 100,
      rage: 100,
      action,
      actionTick,
      actionDuration,
      hitApplied: false,
      roundsWon: 0,
      damageMultiplier: 1,
      decapThresholdBonus: 0,
    };

    drawFighter320(
      ctx,
      dummyFighter,
      globalTick + sTick + idx * 5,
      shot.backdrop === 'zone' ? camX : 0,
      1,
      actor.skin === 'krom' ? equippedTechnique : undefined
    );
  });

  // Subtle fade-in over first 10 frames of each shot
  if (sTick < 10) {
    ctx.fillStyle = `rgba(6, 8, 13, ${((10 - sTick) / 10).toFixed(2)})`;
    ctx.fillRect(0, 20, NATIVE_WIDTH, 200);
  }

  ctx.restore();

  const locCs = getLocalizedCutscene(cutsceneUi.cutsceneId, settings.language);
  const locShot = locCs.shots[shotIndex] ?? {
    speakerName: shot.speakerName,
    text: shot.text,
  };

  // TOP LETTERBOX BAR (y = 0 .. 22)
  pxRect(ctx, 0, 0, NATIVE_WIDTH, 21, '#06080d');
  pxRect(ctx, 0, 21, NATIVE_WIDTH, 1, '#b45309');
  drawCrispText(ctx, locCs.title, 8, 6, '#fbbf24', 7, 'left', true, 192);
  drawCrispText(
    ctx,
    `${shotIndex + 1}/${def.shots.length} · ${locCs.skipBadge}`,
    NATIVE_WIDTH - 8,
    6,
    '#4ade80',
    7,
    'right',
    true,
    108
  );

  // BOTTOM NARRATIVE DIALOGUE BAR (y = 172 .. 240)
  pxRect(ctx, 0, 172, NATIVE_WIDTH, 68, '#06080d');
  pxRect(ctx, 0, 172, NATIVE_WIDTH, 1, '#b45309');

  drawHudPortrait(
    ctx,
    shot.speakerSkin,
    8,
    178,
    shot.speakerSkin !== 'krom'
  );
  drawCrispText(ctx, locShot.speakerName, 38, 176, '#fde047', 8, 'left', true, 218);

  // Shot timeline progress bar on top-right of dialogue box
  pxRect(ctx, NATIVE_WIDTH - 54, 178, 46, 4, '#1e293b');
  pxRect(ctx, NATIVE_WIDTH - 53, 179, Math.round(44 * progress), 2, '#f59e0b');

  // Typewriter text reveal (~1.35 chars per tick, or full if textRevealed)
  const visibleChars = cutsceneUi.textRevealed
    ? locShot.text.length
    : Math.min(locShot.text.length, Math.floor(sTick * 1.35));
  const partialText = locShot.text.slice(0, visibleChars);
  const lines = wrapTextPx(ctx, partialText, 272, 7, false).slice(0, 4);
  lines.forEach((ln, idx) => {
    drawCrispText(ctx, ln, 38, 188 + idx * 9, '#f1f5f9', 7, 'left', false, 272);
  });

  drawCrispText(
    ctx,
    t.cutsceneSkipHint,
    160,
    229,
    '#94a3b8',
    7,
    'center',
    false,
    NATIVE_WIDTH - 16
  );
}

function getGoreModeLabel(mode: GoreMode, t: typeof TRANSLATIONS['fr']): { text: string; color: string } {
  if (mode === 'soft') return { text: `◀ ${t.goreSoftLabel} ▶`, color: '#38bdf8' };
  if (mode === 'gore') return { text: `◀ ${t.goreGoreLabel} ▶`, color: '#f87171' };
  return { text: `◀ ${t.goreNormalLabel} ▶`, color: '#fbbf24' };
}

function drawAkaSystemMenuOverlay(
  ctx: CanvasRenderingContext2D,
  akaMenu: AkaMenuOverlayState,
  settings: AkaSystemSettings
): void {
  const t = TRANSLATIONS[settings.language];
  const langObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === settings.language) ??
    SUPPORTED_LANGUAGES[0];
  const goreBadge = getGoreModeLabel(settings.goreMode, t);

  pxRect(ctx, 0, 0, NATIVE_WIDTH, NATIVE_HEIGHT, 'rgba(6, 8, 14, 0.88)');

  pxRect(ctx, 18, 12, NATIVE_WIDTH - 36, NATIVE_HEIGHT - 24, '#121824');
  pxRect(ctx, 18, 12, NATIVE_WIDTH - 36, 2, '#f59e0b');
  pxRect(ctx, 18, NATIVE_HEIGHT - 14, NATIVE_WIDTH - 36, 2, '#f59e0b');
  pxRect(ctx, 18, 12, 2, NATIVE_HEIGHT - 24, '#334155');
  pxRect(ctx, NATIVE_WIDTH - 20, 12, 2, NATIVE_HEIGHT - 24, '#334155');

  drawCrispText(ctx, t.sysMenuTitle, 160, 19, '#fef08a', 9, 'center', true, 268);
  drawCrispText(ctx, t.sysMenuPausedNotice, 160, 32, '#94a3b8', 7, 'center', false, 268);

  const rows = [
    { label: t.sysMenuResume, value: 'A / RUN', valColor: '#4ade80' },
    { label: t.sysMenuCodex, value: '4 Pages', valColor: '#7dd3fc' },
    { label: t.sysMenuGoreMode, value: goreBadge.text, valColor: goreBadge.color },
    { label: t.sysMenuSfxVol, value: buildAsciiBar(settings.sfxVolume), valColor: '#94a3b8' },
    { label: t.sysMenuMusicVol, value: buildAsciiBar(settings.musicVolume), valColor: '#94a3b8' },
    { label: t.sysMenuLanguage, value: `◀ ${langObj.nativeName} ▶`, valColor: '#fbbf24' },
    { label: t.sysMenuReturnLoader, value: 'OTA_1 Loader', valColor: '#94a3b8' },
  ];

  rows.forEach((r, idx) => {
    const selected = akaMenu.cursor === idx;
    const y = 48 + idx * 22;
    if (selected) {
      pxRect(ctx, 26, y - 3, NATIVE_WIDTH - 52, 17, '#1e293b');
      pxRect(ctx, 26, y - 3, 3, 17, '#f59e0b');
    }
    drawCrispText(
      ctx,
      selected ? `▶ ${r.label}` : `  ${r.label}`,
      34,
      y,
      selected ? '#ffffff' : idx === 1 ? '#7dd3fc' : '#cbd5e1',
      8,
      'left',
      true,
      146
    );
    drawCrispText(
      ctx,
      r.value,
      NATIVE_WIDTH - 30,
      y,
      selected && idx !== 2 ? '#fbbf24' : r.valColor,
      8,
      'right',
      true,
      110
    );
  });

  drawCrispText(ctx, t.sysMenuFooterHint, 160, 210, '#94a3b8', 7, 'center', false, 272);
}

export interface RenderAkaScreenParams {
  state: MatchState;
  zoneState: ZoneTraversalState | null;
  screenState: ScreenFlowState;
  titleCursor: number;
  activeAct: CampaignAct;
  hasNextAct: boolean;
  progression: ProgressionState;
  forgeUi: AkaForgeUiState;
  codexUi: AkaCodexUiState;
  cutsceneUi: AkaCutsceneUiState;
  akaMenu: AkaMenuOverlayState;
  settings: AkaSystemSettings;
  bootloader: BootloaderState;
}

export function renderGamebuinoFrame(
  ctx: CanvasRenderingContext2D,
  params: RenderAkaScreenParams
): void {
  ensureSpriteAtlasLoaded();
  ensureStageArtLoaded();

  const {
    state,
    zoneState,
    screenState,
    titleCursor,
    activeAct,
    hasNextAct,
    progression,
    forgeUi,
    codexUi,
    cutsceneUi,
    akaMenu,
    settings,
    bootloader,
  } = params;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (screenState === 'BOOTLOADER' || screenState === 'BOOTING_FIRMWARE') {
    drawBootloaderScreen(
      ctx,
      bootloader,
      settings,
      screenState === 'BOOTING_FIRMWARE'
    );
    ctx.restore();
    return;
  }

  // Widescreen Animated In-Engine Cutscenes (Skippable via B / RUN!)
  if (screenState === 'CUTSCENE') {
    drawCutsceneScreen320(
      ctx,
      cutsceneUi,
      progression.equippedTechnique,
      settings,
      state.tick
    );
    ctx.restore();
    if (akaMenu.open) {
      drawAkaSystemMenuOverlay(ctx, akaMenu, settings);
    }
    return;
  }

  // Side-scrolling transition zone!
  if (screenState === 'ZONE_TRAVERSAL' && zoneState) {
    drawZoneTraversal320(
      ctx,
      zoneState,
      settings,
      progression.equippedTechnique
    );
    ctx.restore();
    if (akaMenu.open) {
      drawAkaSystemMenuOverlay(ctx, akaMenu, settings);
    }
    return;
  }

  if (state.screenShake > 0 && !akaMenu.open) {
    const sx = ((state.tick % 2) * 2 - 1) * Math.min(3, state.screenShake);
    const sy = (((state.tick >> 1) % 2) * 2 - 1) * 2;
    ctx.translate(sx, sy);
  }

  const crowdExcited = state.bannerTimer > 0 || state.freezeFrames > 0;
  drawStageBackground320(
    ctx,
    state.stage,
    state.tick,
    state.lightningFlash,
    crowdExcited
  );

  // Persistent crimson floor stains/pools (Normal & Gore modes)
  drawFloorDecals320(ctx, state.floorDecals, settings.goreMode, 0);

  const fxSheet = getSheetCanvas('goblinAndFx', false);
  for (const proj of state.projectiles) {
    const px = Math.round(proj.x);
    const py = Math.round(proj.y);
    if (proj.kind === 'shockwave') {
      const isCrystal = proj.colorTheme === 'crystal';
      drawLightHalo(
        ctx,
        px,
        GROUND_Y - 10,
        18,
        isCrystal ? '56, 189, 248' : '249, 115, 22',
        0.2,
        state.tick,
        proj.id
      );
      pxRect(ctx, px - 10, GROUND_Y - 14, 20, 14, isCrystal ? '#0284c7' : '#c2410c');
      pxRect(ctx, px - 7, GROUND_Y - 22, 14, 20, isCrystal ? '#38bdf8' : '#f97316');
      pxRect(ctx, px - 3, GROUND_Y - 26, 6, 22, isCrystal ? '#e0f2fe' : '#fef08a');
    } else if (fxSheet) {
      const isHellfire = proj.colorTheme === 'hellfire';
      drawLightHalo(
        ctx,
        px,
        py,
        20,
        isHellfire ? '249, 115, 22' : '168, 85, 247',
        0.22,
        state.tick,
        proj.id
      );
      const fb = selectFxSpriteFrame('fireball', state.tick);
      const fw = Math.round(fb.w * 0.22);
      const fh = Math.round(fb.h * 0.22);
      const fax = Math.round(fb.ax * 0.22);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(px, py);
      if (proj.vx < 0) {
        ctx.scale(-1, 1);
      }
      ctx.drawImage(fxSheet, fb.x, fb.y, fb.w, fb.h, -fax, -Math.round(fh / 2), fw, fh);
      ctx.restore();
    } else {
      const isHellfire = proj.colorTheme === 'hellfire';
      pxRect(ctx, px - 9, py - 9, 18, 18, isHellfire ? 'rgba(234, 88, 12, 0.55)' : 'rgba(147, 51, 234, 0.55)');
      pxRect(ctx, px - 6, py - 6, 12, 12, isHellfire ? '#f97316' : '#a855f7');
      pxRect(ctx, px - 3, py - 3, 6, 6, isHellfire ? '#fef08a' : '#fdf4ff');
    }
  }

  if (state.p2.action === 'dead' || state.p2.action === 'decapitated') {
    drawFighter320(ctx, state.p2, state.tick);
    drawFighter320(ctx, state.p1, state.tick, 0, 1, progression.equippedTechnique);
  } else {
    drawFighter320(ctx, state.p1, state.tick, 0, 1, progression.equippedTechnique);
    drawFighter320(ctx, state.p2, state.tick);
  }

  // Severed head bouncing on arena floor (Normal & Gore modes)
  drawSeveredHead320(ctx, state.severedHead, settings.goreMode);

  // Localized weapon contact slashes, sparks & arterial blood sprays!
  drawImpactEffects320(ctx, state.impacts, settings.goreMode, state.tick, 0);

  drawGoblinCleaner320(ctx, state, settings.language);

  for (const p of state.particles) {
    pxRect(ctx, Math.round(p.x), Math.round(p.y), p.size, p.size, p.color);
  }

  ctx.restore();

  drawCombatHud320(ctx, state, progression.equippedTechnique, settings.language);

  if (screenState === 'TITLE_MENU') {
    drawInScreenTitleMenu(ctx, titleCursor, progression, settings);
  } else if (screenState === 'AKA_FORGE') {
    drawAkaForgeScreen320(ctx, progression, forgeUi, state.tick, settings);
  } else if (screenState === 'AKA_CODEX') {
    drawAkaCodexScreen320(ctx, codexUi, progression.equippedTechnique, settings);
  } else if (
    screenState === 'STORY_INTRO' ||
    screenState === 'STORY_BOSS_PRELUDE' ||
    screenState === 'STORY_ACT_EPILOGUE'
  ) {
    drawIllustratedStoryScreen320(
      ctx,
      screenState,
      activeAct,
      zoneState ? Math.max(state.score, zoneState.score) : state.score,
      progression.steelShards,
      settings
    );
  } else if (screenState === 'MATCH_VICTORY' || screenState === 'GAME_OVER') {
    drawInScreenPostMatch(
      ctx,
      screenState === 'MATCH_VICTORY',
      hasNextAct,
      state.mode === 'campaign',
      state.score,
      progression.steelShards,
      settings
    );
  }

  if (akaMenu.open) {
    drawAkaSystemMenuOverlay(ctx, akaMenu, settings);
  }
}
