import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  Eye,
  FileCode2,
  FlipHorizontal2,
  Layers,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Swords,
  X,
  ZoomIn,
} from 'lucide-react';
import { GROUND_Y, NATIVE_HEIGHT, NATIVE_WIDTH } from '../game/combatEngine';
import {
  CHARACTER_ANIMATION_DOSSIERS,
  ensureSpriteAtlasLoaded,
  getFighterScale,
  getRawSheetImage,
  getSheetCanvas,
  MASTER_SHEETS_CATALOG,
  subscribeSpriteAtlas,
  type CharacterAnimationDossier,
  type CharacterAnimationSequenceSpec,
  type MasterSheetCatalogEntry,
  type SheetKey,
  type SpriteFrameDef,
} from '../game/spriteAtlas';
import { ensureStageArtLoaded, getStageCanvas320 } from '../game/stageArt';
import type { FighterState, StageId } from '../types/game';

interface SpriteSheetsStudioProps {
  onTestFighterInArena: (stage: StageId, skin: FighterState['skin']) => void;
}

type StudioActorId = CharacterAnimationDossier['actorId'];
type PreviewBackdropMode = 'arena' | 'magenta' | 'checker';
type ViewportZoomMode = 'game_1x' | 'closeup' | 'macro';
type PoseDurationMs = 1200 | 750 | 420 | 180;
type SheetCategoryFilter = 'all' | 'players' | 'bosses' | 'minions' | 'stages' | 'animations';
type PresentationViewMode = 'character_repertoire' | 'rolls_comparison';
type StageGalleryViewMode = 'all_six' | 'interactive_camera';
type LightboxZoomMode = 'fit' | 'pixel_1x' | 'pixel_2x';

interface LightboxTarget {
  title: string;
  subtitle: string;
  url: string;
  fileName: string;
  isWidePanorama?: boolean;
  linkedActorId?: StudioActorId;
}

interface StageWorldGallerySpec {
  actNumber: number;
  stageId: StageId;
  actTitle: string;
  regionLabel: string;
  bossLabel: string;
  bossSkin: FighterState['skin'];
  panoramaUrl: string;
  panoramaFileName: string;
  arenaUrl: string;
  arenaFileName: string;
  notes: string;
}

const SHEET_ACTOR_LINKS: Record<string, readonly { actorId: StudioActorId; label: string }[]> = {
  krom_unified: [{ actorId: 'krom', label: 'Krom (J1)' }],
  rival_aka: [{ actorId: 'rival_aka', label: 'Rival AKA (J2)' }],
  boss_gorgar: [{ actorId: 'gorgar', label: 'Gorgar' }],
  boss_thalgrim: [{ actorId: 'thalgrim', label: 'Thalgrim' }],
  boss_vorgath: [{ actorId: 'vorgath', label: 'Vorgath' }],
  boss_malakor: [{ actorId: 'malakor', label: 'Malakor' }],
  boss_baelgor: [{ actorId: 'baelgor', label: 'Baelgor' }],
  boss_drax: [{ actorId: 'drax', label: 'Seigneur Drax' }],
  monsters_11_bestiary: [
    { actorId: 'goblin_scout', label: '1. Gobelin' },
    { actorId: 'orc_marauder', label: '2. Orque' },
    { actorId: 'undead_warrior', label: '3. Squelette' },
    { actorId: 'risen_zombie', label: '4. Zombie' },
    { actorId: 'dire_wolf', label: '5. Loup' },
    { actorId: 'cave_bat', label: '6. Chauve-Souris' },
    { actorId: 'spectral_wraith', label: '7. Spectre' },
    { actorId: 'skeleton_mage', label: '8. Mage Squelette' },
    { actorId: 'imperial_halberdier', label: '9. Hallebardier' },
    { actorId: 'stone_golem', label: '10. Golem' },
    { actorId: 'abyssal_demon', label: '11. Démon' },
  ],
  minions_zones: [
    { actorId: 'wolf_raider', label: 'Pillard Loup-Gris' },
    { actorId: 'monolith_spearman', label: 'Garde Monolithes' },
    { actorId: 'cult_acolyte', label: 'Fanatique Obsidienne' },
    { actorId: 'crypt_skeleton', label: 'Squelette Légion' },
    { actorId: 'pit_thrall', label: 'Écorcheur Sables' },
    { actorId: 'drax_acolyte', label: 'Sentinelle Spectrale' },
  ],
  goblin_and_fx: [
    { actorId: 'goblin', label: 'Grik le Gobelin' },
    { actorId: 'stage_fx', label: 'Décors & FX Animés' },
  ],
};

const SIX_STAGE_WORLDS: readonly StageWorldGallerySpec[] = [
  {
    actNumber: 1,
    stageId: 'forest',
    actTitle: 'Acte I · Les Clairières Cendrées',
    regionLabel: 'Sentier des Chênes, Pont Moussu & Portail Runique',
    bossLabel: 'Gorgar le Briseur',
    bossSkin: 'gorgar',
    panoramaUrl: '/sheets/panorama_acte1_foret.png',
    panoramaFileName: 'panorama_acte1_foret.png',
    arenaUrl: '/sheets/decor_acte1_foret_320x240.png',
    arenaFileName: 'decor_acte1_foret_320x240.png',
    notes: 'Forêt profonde aux chênes géants, pont de pierre moussu, ruines envahies et arche runique cyan.',
  },
  {
    actNumber: 2,
    stageId: 'caverns',
    actTitle: 'Acte II · Les Cavernes de Cristal',
    regionLabel: 'Cascades Souterraines, Sceau d’Azur & Mines',
    bossLabel: 'Thalgrim des Cristaux',
    bossSkin: 'thalgrim',
    panoramaUrl: '/sheets/panorama_acte2_cavernes.png',
    panoramaFileName: 'panorama_acte2_cavernes.png',
    arenaUrl: '/sheets/decor_acte2_cavernes_320x240.png',
    arenaFileName: 'decor_acte2_cavernes_320x240.png',
    notes: 'Descente rocheuse, chutes d’eau souterraines, grand Sceau d’Azur luminescent et galerie minière à cristaux.',
  },
  {
    actNumber: 3,
    stageId: 'crypt',
    actTitle: 'Acte III · Les Cryptes d’Obsidienne',
    regionLabel: 'Geôles d’Ossements & Cascades de Lave',
    bossLabel: 'Vorgath le Bourreau',
    bossSkin: 'vorgath',
    panoramaUrl: '/sheets/panorama_acte3_crypte.png',
    panoramaFileName: 'panorama_acte3_crypte.png',
    arenaUrl: '/sheets/decor_acte3_crypte_320x240.png',
    arenaFileName: 'decor_acte3_crypte_320x240.png',
    notes: 'Transition graduelle des cachots sombres aux rivières de magma et au pont du billot ardent.',
  },
  {
    actNumber: 4,
    stageId: 'arena',
    actTitle: 'Acte IV · L’Arène des Ossements',
    regionLabel: 'Remparts de Siège Ocrés & Porte au Crâne',
    bossLabel: 'Malakor l’Écorcheur',
    bossSkin: 'malakor',
    panoramaUrl: '/sheets/panorama_acte4_arene.png',
    panoramaFileName: 'panorama_acte4_arene.png',
    arenaUrl: '/sheets/decor_acte4_arene_320x240.png',
    arenaFileName: 'decor_acte4_arene_320x240.png',
    notes: 'Tour de guet, machines de siège le long de la muraille ensoleillée et entrée monumentale du Colisée.',
  },
  {
    actNumber: 5,
    stageId: 'inferno',
    actTitle: 'Acte V · La Citadelle Infernale',
    regionLabel: 'Pont Fortifié Nocturne & Cages Ardentes',
    bossLabel: 'Baelgor des Braises',
    bossSkin: 'baelgor',
    panoramaUrl: '/sheets/panorama_acte5_citadelle.png',
    panoramaFileName: 'panorama_acte5_citadelle.png',
    arenaUrl: '/sheets/decor_acte5_citadelle_320x240.png',
    arenaFileName: 'decor_acte5_citadelle_320x240.png',
    notes: 'Bastion sous la pleine lune, grand viaduc au-dessus des montagnes pourpres et cages suspendues sur la lave.',
  },
  {
    actNumber: 6,
    stageId: 'sanctuary',
    actTitle: 'Acte VI · Le Sanctuaire de Drax',
    regionLabel: 'Viaduc d’Orage & Autel du Cœur d’Acier',
    bossLabel: 'Seigneur Drax',
    bossSkin: 'drax',
    panoramaUrl: '/sheets/panorama_acte6_sanctuaire.png',
    panoramaFileName: 'panorama_acte6_sanctuaire.png',
    arenaUrl: '/sheets/decor_acte6_sanctuaire_320x240.png',
    arenaFileName: 'decor_acte6_sanctuaire_320x240.png',
    notes: 'Traversée sous la tempête d’éclairs pourpres jusqu’au pentagramme royal où palpite le Cœur d’Acier.',
  },
];

function isContinuousLoopSequence(seqId: string): boolean {
  return (
    seqId === 'idle' ||
    seqId === 'walk_fwd' ||
    seqId === 'gob_walk' ||
    seqId.startsWith('fx_')
  );
}

/**
 * Deterministic millisecond-based pose clock for human-readable animation playback:
 * - Every pose stays visibly on screen for the full `poseDurationMs` (e.g. 750ms or 1200ms).
 * - Non-continuous sequences (attacks, rolls, jumps, hits, deaths, decapitations) hold
 *   their final pose for `2 × poseDurationMs` so the eye clearly registers the completion
 *   before looping back to Pose #1.
 */
function computeSequenceFrameIndexAtMs(
  elapsedMs: number,
  poseDurationMs: number,
  frameCount: number,
  continuousLoop: boolean
): number {
  if (frameCount <= 1) return 0;
  const dur = Math.max(120, poseDurationMs);
  if (continuousLoop) {
    const cycleMs = frameCount * dur;
    const t = ((elapsedMs % cycleMs) + cycleMs) % cycleMs;
    return Math.min(frameCount - 1, Math.floor(t / dur));
  }
  const holdExtraSlots = 1; // Final pose lasts 2 * dur (1 normal slot + 1 extra hold slot)
  const totalSlots = frameCount + holdExtraSlots;
  const cycleMs = totalSlots * dur;
  const t = ((elapsedMs % cycleMs) + cycleMs) % cycleMs;
  const slot = Math.floor(t / dur);
  return Math.min(frameCount - 1, slot);
}

function getDefaultShowcasePresetIdx(dossier: CharacterAnimationDossier): number {
  const slashIdx = dossier.sequences.findIndex(
    (s) => s.id === 'slash_high' || s.id === 'cleave_overhead'
  );
  if (slashIdx >= 0) return slashIdx;
  return 0;
}

function computeViewportSpriteScale(
  dossier: CharacterAnimationDossier,
  actorId: StudioActorId,
  frames: SpriteFrameDef[],
  zoomMode: ViewportZoomMode
): { scale: number; groundY: number } {
  const maxW = Math.max(...frames.map((f) => f.w), 1);
  const maxH = Math.max(...frames.map((f) => f.h), 1);

  const baseGameScale = dossier.skin
    ? getFighterScale(dossier.skin)
    : actorId === 'goblin'
    ? 0.36
    : Math.min(1.1, 88 / maxH);

  if (zoomMode === 'game_1x') {
    return { scale: baseGameScale, groundY: GROUND_Y };
  }

  if (zoomMode === 'macro') {
    const rawMacro = Math.max(baseGameScale * 2.25, Math.min(2.6, 150 / maxH));
    const clampedMacro = Math.min(rawMacro, 198 / maxH, 294 / maxW);
    return { scale: clampedMacro, groundY: 224 };
  }

  // 'closeup' (Default): generous, clear close-up inside 320x240 without clipping
  const rawCloseup = Math.max(baseGameScale * 1.65, Math.min(2.0, 116 / maxH));
  const clampedCloseup = Math.min(rawCloseup, 170 / maxH, 276 / maxW);
  return { scale: clampedCloseup, groundY: 216 };
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function triggerDirectUrlDownload(url: string, fileName: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function rgb888ToRgb565Hex(r: number, g: number, b: number, a: number): string {
  if (a < 32) {
    return '0xF81F';
  }
  const r5 = (r >> 3) & 0x1f;
  const g6 = (g >> 2) & 0x3f;
  const b5 = (b >> 3) & 0x1f;
  let val = (r5 << 11) | (g6 << 5) | b5;
  if (val === 0xf81f) {
    val = 0xf81e;
  }
  return '0x' + val.toString(16).toUpperCase().padStart(4, '0');
}

interface FrameThumbnailProps {
  frame: SpriteFrameDef;
  index: number;
  selected: boolean;
  atlasVersion: number;
  onSelect: () => void;
}

function FrameThumbnail({
  frame,
  index,
  selected,
  atlasVersion,
  onSelect,
}: FrameThumbnailProps) {
  const thumbRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = thumbRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    for (let y = 0; y < H; y += 8) {
      for (let x = 0; x < W; x += 8) {
        ctx.fillStyle = ((x + y) >> 3) % 2 === 0 ? '#11151d' : '#181e29';
        ctx.fillRect(x, y, 8, 8);
      }
    }

    const sheet = getSheetCanvas(frame.sheet, false);
    if (!sheet) return;

    const pad = 6;
    const fitScale = Math.min((W - pad * 2) / frame.w, (H - pad * 2) / frame.h);
    const dw = Math.max(1, Math.round(frame.w * fitScale));
    const dh = Math.max(1, Math.round(frame.h * fitScale));
    const dx = Math.round((W - dw) * 0.5);
    const dy = Math.round(H - pad - dh);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sheet, frame.x, frame.y, frame.w, frame.h, dx, dy, dw, dh);
  }, [frame, atlasVersion]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
        selected
          ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
          : 'bg-[#0C0E12] border-slate-800 hover:border-slate-600 text-slate-300'
      }`}
    >
      <canvas
        ref={thumbRef}
        width={76}
        height={76}
        className="w-[76px] h-[76px] rounded bg-[#0C0E12] [image-rendering:pixelated]"
      />
      <span className="mt-1.5 text-[11px] font-mono tabular-nums whitespace-nowrap font-semibold">
        Pose #{index + 1}
      </span>
      <span className="text-[10px] text-slate-400 font-mono tabular-nums whitespace-nowrap">
        {frame.w}×{frame.h}
      </span>
    </button>
  );
}

interface StaticPoseMiniCanvasProps {
  frame: SpriteFrameDef;
  poseIndex: number;
  atlasVersion: number;
  onClick?: () => void;
}

function StaticPoseMiniCanvas({
  frame,
  poseIndex,
  atlasVersion,
  onClick,
}: StaticPoseMiniCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d1118';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, H - 6, W, 1);

    const sheet = getSheetCanvas(frame.sheet, false);
    if (!sheet) return;

    const pad = 5;
    const fitScale = Math.min((W - pad * 2) / frame.w, (H - pad * 2 - 4) / frame.h);
    const dw = Math.max(1, Math.round(frame.w * fitScale));
    const dh = Math.max(1, Math.round(frame.h * fitScale));
    const dx = Math.round((W - dw) * 0.5);
    const dy = Math.round(H - 6 - dh);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sheet, frame.x, frame.y, frame.w, frame.h, dx, dy, dw, dh);
  }, [frame, atlasVersion]);

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Inspecter la Pose #${poseIndex + 1} dans la grande image`}
      className="flex flex-col items-center shrink-0 group cursor-pointer"
    >
      <canvas
        ref={ref}
        width={64}
        height={64}
        className="w-16 h-16 rounded border border-slate-800/80 group-hover:border-amber-500/70 bg-[#0d1118] transition-colors [image-rendering:pixelated]"
      />
      <span className="mt-1 text-[10px] text-slate-400 group-hover:text-amber-300 font-mono tabular-nums whitespace-nowrap">
        #{poseIndex + 1}
      </span>
    </button>
  );
}

interface LiveSequenceLoopCanvasProps {
  seqId: string;
  frames: SpriteFrameDef[];
  poseDurationMs: PoseDurationMs;
  atlasVersion: number;
  isJump?: boolean;
  onInspect: () => void;
}

function computeJumpElevationPx(idx: number, total: number, maxLift: number): number {
  if (total <= 2) return idx === 1 ? -maxLift : 0;
  if (idx === 0 || idx === total - 1) return 0;
  const t = idx / (total - 1);
  return -Math.round(Math.sin(t * Math.PI) * maxLift);
}

function LiveSequenceLoopCanvas({
  seqId,
  frames,
  poseDurationMs,
  atlasVersion,
  isJump = false,
  onInspect,
}: LiveSequenceLoopCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elapsedMsRef = useRef<number>(0);
  const paramsRef = useRef({ seqId, frames, poseDurationMs, isJump, atlasVersion });
  paramsRef.current = { seqId, frames, poseDurationMs, isJump, atlasVersion };

  useEffect(() => {
    elapsedMsRef.current = 0;
  }, [seqId]);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.max(0, Math.min(80, now - lastTime));
      lastTime = now;

      const {
        seqId: currentSeqId,
        frames: currentFrames,
        poseDurationMs: durMs,
        isJump: jumpFlag,
      } = paramsRef.current;

      elapsedMsRef.current += dt;

      const canvas = canvasRef.current;
      if (canvas && currentFrames.length > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const W = canvas.width;
          const H = canvas.height;

          for (let y = 0; y < H; y += 10) {
            for (let x = 0; x < W; x += 10) {
              ctx.fillStyle = ((x + y) / 10) % 2 === 0 ? '#0e131b' : '#151c27';
              ctx.fillRect(x, y, 10, 10);
            }
          }
          ctx.fillStyle = '#293548';
          ctx.fillRect(0, H - 10, W, 1);

          const continuous = isContinuousLoopSequence(currentSeqId);
          const idx = computeSequenceFrameIndexAtMs(
            elapsedMsRef.current,
            durMs,
            currentFrames.length,
            continuous
          );
          const frame = currentFrames[idx] ?? currentFrames[0];
          const sheet = getSheetCanvas(frame.sheet, false);

          if (sheet) {
            const maxH = Math.max(...currentFrames.map((f) => f.h), 1);
            const maxW = Math.max(...currentFrames.map((f) => f.w), 1);
            const fitScale = Math.min((W - 16) / maxW, (H - 24) / maxH);
            const dw = Math.max(1, Math.round(frame.w * fitScale));
            const dh = Math.max(1, Math.round(frame.h * fitScale));
            const ax = Math.round(frame.ax * fitScale);
            const oyPx = Math.round((frame.oy ?? 0) * fitScale);
            const jumpOffsetY = jumpFlag
              ? computeJumpElevationPx(idx, currentFrames.length, 12)
              : 0;
            const shadowW = jumpFlag
              ? Math.max(16, 32 + Math.round(jumpOffsetY * 0.9))
              : 32;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.fillRect(Math.round(W * 0.5 - shadowW * 0.5), H - 11, shadowW, 3);

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
              sheet,
              frame.x,
              frame.y,
              frame.w,
              frame.h,
              Math.round(W * 0.5) - ax,
              H - 10 - dh + jumpOffsetY + oyPx,
              dw,
              dh
            );
          }
        }
      }

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <button
      type="button"
      onClick={onInspect}
      title="Cliquer pour jouer en grand dans l’écran 320×240"
      className="relative rounded-lg border border-slate-800 hover:border-amber-500 transition-colors shrink-0 cursor-pointer overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        width={108}
        height={88}
        className="w-[108px] h-[88px] block bg-[#0e131b] [image-rendering:pixelated]"
      />
    </button>
  );
}

export function SpriteSheetsStudio({ onTestFighterInArena }: SpriteSheetsStudioProps) {
  const [selectedActor, setSelectedActor] = useState<StudioActorId>('krom');
  // Start on Krom's signature attack (Taille Haute, 5 poses) so the big preview animates unmistakably right away
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(() =>
    getDefaultShowcasePresetIdx(CHARACTER_ANIMATION_DOSSIERS[0])
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [displayFrameIdx, setDisplayFrameIdx] = useState<number>(0);
  // Default 750ms per pose (0.75s full visibility per frame + 1.5s hold on final pose)
  const [poseDurationMs, setPoseDurationMs] = useState<PoseDurationMs>(750);
  const [backdropMode, setBackdropMode] = useState<PreviewBackdropMode>('arena');
  const [flipLeft, setFlipLeft] = useState<boolean>(false);
  const [zoomMode, setZoomMode] = useState<ViewportZoomMode>('closeup');
  const [presentationMode, setPresentationMode] =
    useState<PresentationViewMode>('character_repertoire');
  const [categoryFilter, setCategoryFilter] = useState<SheetCategoryFilter>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [lightboxTarget, setLightboxTarget] = useState<LightboxTarget | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<LightboxZoomMode>('fit');
  const [atlasVersion, setAtlasVersion] = useState<number>(0);
  const [exportStatusMsg, setExportStatusMsg] = useState<string>('');

  // Direct 6 Panoramas & 6 Arenas Explorer State
  const [stageGalleryMode, setStageGalleryMode] = useState<StageGalleryViewMode>('all_six');
  const [selectedWorldIdx, setSelectedWorldIdx] = useState<number>(0);
  const [cameraX, setCameraX] = useState<number>(0);
  const [autoTravelling, setAutoTravelling] = useState<boolean>(false);

  const previewSectionRef = useRef<HTMLElement | null>(null);
  const stageExplorerRef = useRef<HTMLElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const panoramaStripCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraWindowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedPanoramaImgRef = useRef<HTMLImageElement | null>(null);
  const [panoramaLoadedTick, setPanoramaLoadedTick] = useState<number>(0);

  // Persistent animation clock ref — NEVER reset by React state updates!
  const playbackClockRef = useRef<{ elapsedMs: number; currentIdx: number }>({
    elapsedMs: 0,
    currentIdx: 0,
  });

  useEffect(() => {
    ensureSpriteAtlasLoaded();
    ensureStageArtLoaded();
    return subscribeSpriteAtlas(() => {
      setAtlasVersion((v) => v + 1);
    });
  }, []);

  const activeWorld = SIX_STAGE_WORLDS[selectedWorldIdx] ?? SIX_STAGE_WORLDS[0];

  // Load selected world's 1800x240 panorama image for the interactive 320x240 camera window
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      loadedPanoramaImgRef.current = img;
      setPanoramaLoadedTick((t) => t + 1);
    };
    img.src = activeWorld.panoramaUrl;
  }, [activeWorld.panoramaUrl]);

  // Optional smooth auto-travelling across 0..1480px
  useEffect(() => {
    if (!autoTravelling || stageGalleryMode !== 'interactive_camera') return;
    let rafId = 0;
    let dir = 1;
    let pos = cameraX;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      pos += dir * (dt * 0.09);
      if (pos >= 1480) {
        pos = 1480;
        dir = -1;
      } else if (pos <= 0) {
        pos = 0;
        dir = 1;
      }
      setCameraX(Math.round(pos));
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTravelling, stageGalleryMode, selectedWorldIdx]);

  // Draw synchronized 1800x240 Strip + 320x240 Gamebuino AKA Camera Window
  useEffect(() => {
    const img = loadedPanoramaImgRef.current;

    const stripCanvas = panoramaStripCanvasRef.current;
    if (stripCanvas) {
      const sctx = stripCanvas.getContext('2d');
      if (sctx) {
        sctx.imageSmoothingEnabled = false;
        sctx.fillStyle = '#090b10';
        sctx.fillRect(0, 0, 1800, 240);
        if (img && img.naturalWidth > 0) {
          sctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, 1800, 240);
        }
        sctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
        sctx.fillRect(cameraX, 0, 320, 240);
        sctx.strokeStyle = '#fbbf24';
        sctx.lineWidth = 4;
        sctx.strokeRect(cameraX + 2, 2, 316, 236);
      }
    }

    const canvas = cameraWindowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#090b10';
    ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    if (img && img.naturalWidth > 0) {
      const srcH = img.naturalHeight;
      const scaleRatio = srcH / NATIVE_HEIGHT;
      const sx = Math.max(
        0,
        Math.min(img.naturalWidth - NATIVE_WIDTH * scaleRatio, cameraX * scaleRatio)
      );
      const sw = Math.min(img.naturalWidth - sx, NATIVE_WIDTH * scaleRatio);
      ctx.drawImage(img, sx, 0, sw, srcH, 0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
    }
  }, [cameraX, panoramaLoadedTick, selectedWorldIdx, stageGalleryMode]);

  const openLightbox = useCallback((target: LightboxTarget) => {
    setLightboxTarget(target);
    setLightboxZoom(target.isWidePanorama ? 'pixel_1x' : 'fit');
  }, []);

  const activeDossier = useMemo(
    () =>
      CHARACTER_ANIMATION_DOSSIERS.find((d) => d.actorId === selectedActor) ??
      CHARACTER_ANIMATION_DOSSIERS[0],
    [selectedActor]
  );

  const presets = activeDossier.sequences;
  const safePresetIdx = Math.min(selectedPresetIdx, Math.max(0, presets.length - 1));
  const activePreset = presets[safePresetIdx] ?? presets[0];

  const selectActorAndPlay = useCallback(
    (id: StudioActorId, explicitPresetIdx?: number, scrollToPlayer = false) => {
      const dossier =
        CHARACTER_ANIMATION_DOSSIERS.find((d) => d.actorId === id) ??
        CHARACTER_ANIMATION_DOSSIERS[0];
      const nextIdx =
        explicitPresetIdx !== undefined
          ? Math.max(0, Math.min(explicitPresetIdx, dossier.sequences.length - 1))
          : getDefaultShowcasePresetIdx(dossier);

      playbackClockRef.current = { elapsedMs: 0, currentIdx: 0 };
      setSelectedActor(id);
      setSelectedPresetIdx(nextIdx);
      setDisplayFrameIdx(0);
      setIsPlaying(true);

      if (scrollToPlayer) {
        previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    []
  );

  const handleSelectPreset = useCallback((idx: number) => {
    playbackClockRef.current = { elapsedMs: 0, currentIdx: 0 };
    setSelectedPresetIdx(idx);
    setDisplayFrameIdx(0);
    setIsPlaying(true);
  }, []);

  const handleInspectSequenceInViewport = useCallback(
    (actorId: StudioActorId, seqId: string, freezePoseIdx?: number) => {
      const dossier = CHARACTER_ANIMATION_DOSSIERS.find((d) => d.actorId === actorId);
      if (!dossier) return;
      const seqIdx = Math.max(
        0,
        dossier.sequences.findIndex((s) => s.id === seqId)
      );

      if (freezePoseIdx !== undefined) {
        playbackClockRef.current = {
          elapsedMs: freezePoseIdx * poseDurationMs,
          currentIdx: freezePoseIdx,
        };
        setSelectedActor(actorId);
        setSelectedPresetIdx(seqIdx);
        setDisplayFrameIdx(freezePoseIdx);
        setIsPlaying(false);
      } else {
        playbackClockRef.current = { elapsedMs: 0, currentIdx: 0 };
        setSelectedActor(actorId);
        setSelectedPresetIdx(seqIdx);
        setDisplayFrameIdx(0);
        setIsPlaying(true);
      }

      previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [poseDurationMs]
  );

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        playbackClockRef.current.elapsedMs =
          playbackClockRef.current.currentIdx * poseDurationMs;
      }
      return next;
    });
  }, [poseDurationMs]);

  const handleRestartSequence = useCallback(() => {
    playbackClockRef.current = { elapsedMs: 0, currentIdx: 0 };
    setDisplayFrameIdx(0);
    setIsPlaying(true);
  }, []);

  const handleStepFrame = useCallback(
    (delta: number) => {
      const len = Math.max(1, activePreset.frames.length);
      const nextIdx = (playbackClockRef.current.currentIdx + delta + len) % len;
      playbackClockRef.current = {
        elapsedMs: nextIdx * poseDurationMs,
        currentIdx: nextIdx,
      };
      setIsPlaying(false);
      setDisplayFrameIdx(nextIdx);
    },
    [activePreset.frames.length, poseDurationMs]
  );

  const handleSelectManualPose = useCallback(
    (poseIdx: number) => {
      playbackClockRef.current = {
        elapsedMs: poseIdx * poseDurationMs,
        currentIdx: poseIdx,
      };
      setIsPlaying(false);
      setDisplayFrameIdx(poseIdx);
    },
    [poseDurationMs]
  );

  const handleChangePoseDuration = useCallback((newDurationMs: PoseDurationMs) => {
    playbackClockRef.current.elapsedMs =
      playbackClockRef.current.currentIdx * newDurationMs;
    setPoseDurationMs(newDurationMs);
  }, []);

  // Keep latest render parameters in a ref so the persistent 60Hz rAF loop NEVER resets its clock
  const previewParamsRef = useRef({
    activeDossier,
    activePreset,
    selectedActor,
    isPlaying,
    poseDurationMs,
    backdropMode,
    flipLeft,
    zoomMode,
    atlasVersion,
  });
  previewParamsRef.current = {
    activeDossier,
    activePreset,
    selectedActor,
    isPlaying,
    poseDurationMs,
    backdropMode,
    flipLeft,
    zoomMode,
    atlasVersion,
  };

  // Single Uninterrupted 320x240 Pixel-Art Animation Loop (Zero useEffect reset!)
  useEffect(() => {
    let rafId = 0;
    let lastNow = performance.now();

    const renderPreview = (now: number) => {
      const dt = Math.max(0, Math.min(80, now - lastNow));
      lastNow = now;

      const {
        activeDossier: dossier,
        activePreset: preset,
        selectedActor: actorId,
        isPlaying: playing,
        poseDurationMs: durMs,
        backdropMode: bgMode,
        flipLeft: mirror,
        zoomMode: zm,
      } = previewParamsRef.current;

      const frames = preset.frames;
      const continuous = isContinuousLoopSequence(preset.id);

      let frameIdx = 0;
      if (frames.length > 1) {
        if (playing) {
          playbackClockRef.current.elapsedMs += dt;
          frameIdx = computeSequenceFrameIndexAtMs(
            playbackClockRef.current.elapsedMs,
            durMs,
            frames.length,
            continuous
          );
          playbackClockRef.current.currentIdx = frameIdx;
        } else {
          frameIdx = playbackClockRef.current.currentIdx % frames.length;
        }
      } else {
        playbackClockRef.current.currentIdx = 0;
        frameIdx = 0;
      }

      // Sync thumbnail highlight ONLY when the visible pose index changes (~every 750ms)
      setDisplayFrameIdx((prev) => (prev === frameIdx ? prev : frameIdx));

      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.imageSmoothingEnabled = false;

          const { scale, groundY } = computeViewportSpriteScale(
            dossier,
            actorId,
            frames,
            zm
          );

          if (bgMode === 'magenta') {
            ctx.fillStyle = '#FF00FF';
            ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
            ctx.fillRect(0, groundY, NATIVE_WIDTH, 1);
          } else if (bgMode === 'checker') {
            for (let y = 0; y < NATIVE_HEIGHT; y += 12) {
              for (let x = 0; x < NATIVE_WIDTH; x += 12) {
                ctx.fillStyle = ((x + y) / 12) % 2 === 0 ? '#10141c' : '#181e29';
                ctx.fillRect(x, y, 12, 12);
              }
            }
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(0, groundY, NATIVE_WIDTH, 1);
          } else {
            const stageCanvas = getStageCanvas320(dossier.stage);
            if (stageCanvas) {
              ctx.drawImage(stageCanvas, 0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
            } else {
              ctx.fillStyle = '#141822';
              ctx.fillRect(0, 0, NATIVE_WIDTH, groundY);
              ctx.fillStyle = '#25211d';
              ctx.fillRect(0, groundY, NATIVE_WIDTH, NATIVE_HEIGHT - groundY);
            }
          }

          const frame = frames[frameIdx] ?? frames[0];
          const sheetSource =
            bgMode === 'magenta'
              ? getRawSheetImage(frame.sheet) ?? getSheetCanvas(frame.sheet, false)
              : getSheetCanvas(frame.sheet, false);

          if (sheetSource && frame) {
            const dw = Math.max(1, Math.round(frame.w * scale));
            const dh = Math.max(1, Math.round(frame.h * scale));
            const ax = Math.round(frame.ax * scale);
            const oyPx = Math.round((frame.oy ?? 0) * scale);

            const cx = Math.round(NATIVE_WIDTH * 0.5);
            const cy = groundY;
            const maxJumpLift = zm === 'macro' ? 30 : zm === 'closeup' ? 26 : 20;
            const jumpOffsetY = preset.isJump
              ? computeJumpElevationPx(frameIdx, frames.length, maxJumpLift)
              : 0;
            const baseShadowW = zm === 'macro' ? 54 : zm === 'closeup' ? 46 : 36;
            const shadowW = preset.isJump
              ? Math.max(18, baseShadowW + Math.round(jumpOffsetY * 0.7))
              : baseShadowW;

            if (bgMode !== 'magenta') {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
              ctx.fillRect(Math.round(cx - shadowW * 0.5), cy - 2, shadowW, 4);
            }

            ctx.save();
            ctx.translate(cx, cy + 2 + jumpOffsetY + oyPx);
            if (mirror) {
              ctx.scale(-1, 1);
            }
            ctx.drawImage(
              sheetSource,
              frame.x,
              frame.y,
              frame.w,
              frame.h,
              -ax,
              -dh,
              dw,
              dh
            );
            ctx.restore();
          }

          ctx.restore();
        }
      }

      rafId = window.requestAnimationFrame(renderPreview);
    };

    rafId = window.requestAnimationFrame(renderPreview);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const handleExportCurrentStripPng = useCallback(() => {
    const frames = activePreset.frames;
    if (!frames.length) return;

    const gap = 8;
    const maxH = Math.max(...frames.map((f) => f.h));
    const totalW = frames.reduce((acc, f) => acc + f.w, 0) + gap * (frames.length + 1);
    const totalH = maxH + gap * 2;

    const out = document.createElement('canvas');
    out.width = totalW;
    out.height = totalH;
    const ctx = out.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    if (backdropMode === 'magenta') {
      ctx.fillStyle = '#FF00FF';
      ctx.fillRect(0, 0, totalW, totalH);
    }

    let cursorX = gap;
    for (const f of frames) {
      const sheet = getSheetCanvas(f.sheet, false);
      if (sheet) {
        const dy = totalH - gap - f.h;
        ctx.drawImage(sheet, f.x, f.y, f.w, f.h, cursorX, dy, f.w, f.h);
      }
      cursorX += f.w + gap;
    }

    out.toBlob((blob) => {
      if (!blob) return;
      const fileSlug = `${selectedActor}_${activePreset.id}_strip.png`;
      triggerBlobDownload(blob, fileSlug);
      setExportStatusMsg(`Bande PNG exportée : ${fileSlug}`);
    }, 'image/png');
  }, [activePreset, backdropMode, selectedActor]);

  const handleDownloadTransparentSheet = useCallback((entry: MasterSheetCatalogEntry) => {
    if (!entry.sheetKey) {
      triggerDirectUrlDownload(entry.downloadUrl, entry.fileName);
      return;
    }
    const canvas = getSheetCanvas(entry.sheetKey as SheetKey, false);
    if (!canvas) {
      triggerDirectUrlDownload(entry.downloadUrl, entry.fileName);
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) return;
      const transparentName = entry.fileName.replace(/\.png$/i, '_transparent.png');
      triggerBlobDownload(blob, transparentName);
      setExportStatusMsg(`Planche détourée exportée : ${transparentName}`);
    }, 'image/png');
  }, []);

  const handleExportRgb565Header = useCallback((entry: MasterSheetCatalogEntry) => {
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    if (entry.sheetKey) {
      const src = getSheetCanvas(entry.sheetKey, false);
      if (!src) {
        setExportStatusMsg('Chargement de la planche en cours, réessayez dans une seconde.');
        return;
      }
      const targetW = Math.max(16, Math.round(src.width * 0.25));
      const targetH = Math.max(16, Math.round(src.height * 0.25));
      exportCanvas.width = targetW;
      exportCanvas.height = targetH;
      ctx.drawImage(src, 0, 0, targetW, targetH);
    } else {
      const stageCanvas = getStageCanvas320('forest');
      if (!stageCanvas) {
        setExportStatusMsg('Chargement du décor 320×240 en cours…');
        return;
      }
      exportCanvas.width = 160;
      exportCanvas.height = 120;
      ctx.drawImage(stageCanvas, 0, 0, 160, 120);
    }

    const w = exportCanvas.width;
    const h = exportCanvas.height;
    const data = ctx.getImageData(0, 0, w, h).data;
    const hexRows: string[] = [];

    for (let y = 0; y < h; y++) {
      const rowValues: string[] = [];
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        rowValues.push(rgb888ToRgb565Hex(data[idx], data[idx + 1], data[idx + 2], data[idx + 3]));
      }
      hexRows.push('  ' + rowValues.join(', '));
    }

    const guard = `${entry.cHeaderSymbol}_H`;
    const headerContent = [
      `#ifndef ${guard}`,
      `#define ${guard}`,
      '',
      '#include <stdint.h>',
      '',
      `// Planche : ${entry.title} (ESP32-S3 Gamebuino AKA ST7789V 320x240)`,
      `// Couleur de transparence Gamebuino AKA RGB565 (#FF00FF) : 0xF81F`,
      `#define ${entry.cHeaderSymbol}_WIDTH ${w}`,
      `#define ${entry.cHeaderSymbol}_HEIGHT ${h}`,
      `#define ${entry.cHeaderSymbol}_COLORKEY 0xF81F`,
      '',
      `static const uint16_t ${entry.cHeaderSymbol}_DATA[${w * h}] = {`,
      hexRows.join(',\n'),
      '};',
      '',
      `#endif // ${guard}`,
      '',
    ].join('\n');

    const headerFileName = `${entry.cHeaderSymbol.toLowerCase()}_rgb565.h`;
    const blob = new Blob([headerContent], { type: 'text/plain;charset=utf-8' });
    triggerBlobDownload(blob, headerFileName);
    setExportStatusMsg(`En-tête C++ RGB565 généré : ${headerFileName}`);
  }, []);

  const rollComparisonItems = useMemo(() => {
    return CHARACTER_ANIMATION_DOSSIERS.filter((d) => Boolean(d.skin)).map((dossier) => {
      const evadeSeq =
        dossier.sequences.find((s) => s.isRollOrEvade) ?? dossier.sequences[0];
      return { dossier, seq: evadeSeq };
    });
  }, []);

  const filteredCatalog = useMemo(() => {
    if (categoryFilter === 'all') return MASTER_SHEETS_CATALOG;
    return MASTER_SHEETS_CATALOG.filter((item) => item.category === categoryFilter);
  }, [categoryFilter]);

  const currentDisplayFrameIdx =
    displayFrameIdx % Math.max(1, activePreset.frames.length);
  const currentFrameObj =
    activePreset.frames[currentDisplayFrameIdx] ?? activePreset.frames[0];

  const durationOptions: readonly { value: PoseDurationMs; label: string }[] = [
    { value: 1200, label: '1,2 s · Très lent' },
    { value: 750, label: '0,75 s · Confort' },
    { value: 420, label: '0,42 s · Modéré' },
    { value: 180, label: '0,18 s · Vitesse jeu' },
  ];

  const zoomOptions: readonly { value: ViewportZoomMode; label: string }[] = [
    { value: 'game_1x', label: 'Jeu 1×' },
    { value: 'closeup', label: 'Gros Plan' },
    { value: 'macro', label: 'Macro' },
  ];

  const renderSequenceCard = (
    dossier: CharacterAnimationDossier,
    seq: CharacterAnimationSequenceSpec,
    showCharacterTitle: boolean
  ) => {
    const isCurrentlyLoaded =
      dossier.actorId === selectedActor && activePreset.id === seq.id;

    return (
      <article
        key={`${dossier.actorId}-${seq.id}`}
        className={`bg-[#151921] border rounded-xl p-5 flex flex-col justify-between gap-4 transition-colors ${
          isCurrentlyLoaded
            ? 'border-amber-500/80'
            : 'border-slate-800/90 hover:border-slate-700'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              {showCharacterTitle && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-medium">
                  <span>{dossier.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {dossier.hasAcrobaticRoll
                      ? 'Roulade 360° Armée'
                      : 'Esquive Lourde / Aérienne'}
                  </span>
                </div>
              )}
              <h3 className="text-base font-bold text-white leading-snug">
                {seq.label}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                <span>
                  {seq.frames.length} pose{seq.frames.length > 1 ? 's' : ''}
                </span>
                <span aria-hidden="true">·</span>
                <span>{seq.inputHint}</span>
                <span aria-hidden="true">·</span>
                <span>{(poseDurationMs / 1000).toFixed(2).replace('.', ',')} s / pose</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleInspectSequenceInViewport(dossier.actorId, seq.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isCurrentlyLoaded
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-200 bg-[#0C0E12] hover:bg-amber-500 hover:text-slate-950 border border-slate-700'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isCurrentlyLoaded ? 'En lecture' : 'Jouer en grand'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{seq.notes}</p>

          {/* Live Loop + Full Frame-by-Frame Filmstrip Decomposition */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-4">
            <LiveSequenceLoopCanvas
              seqId={seq.id}
              frames={seq.frames}
              poseDurationMs={poseDurationMs}
              atlasVersion={atlasVersion}
              isJump={Boolean(seq.isJump)}
              onInspect={() => handleInspectSequenceInViewport(dossier.actorId, seq.id)}
            />

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {seq.frames.map((frame, fIdx) => (
                <StaticPoseMiniCanvas
                  key={`${dossier.actorId}-${seq.id}-${fIdx}`}
                  frame={frame}
                  poseIndex={fIdx}
                  atlasVersion={atlasVersion}
                  onClick={() =>
                    handleInspectSequenceInViewport(dossier.actorId, seq.id, fIdx)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-12">
      {/* Section 1: Header & Real-Time 320x240 Pixel-Art Animation Inspector */}
      <section ref={previewSectionRef} className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800/90 pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Planches Pixel-Art, Lecteur d’Animations & Galerie des 6 Mondes
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Chaque pose s’affiche clairement dans le grand écran <code className="font-mono text-amber-300">320×240</code> à la durée choisie (<code className="font-mono text-amber-300">0,75 s</code> ou <code className="font-mono text-amber-300">1,2 s</code> par pose avec maintien sur la pose finale). Cliquez sur n’importe quel personnage, planche ou pose pour l’examiner en détail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {exportStatusMsg && (
              <p className="text-xs font-mono text-amber-300 whitespace-nowrap">
                {exportStatusMsg}
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                stageExplorerRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Voir les 6 Panoramas & 6 Arènes</span>
            </button>
          </div>
        </div>

        {/* Character Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#141821] border border-slate-800/90 rounded-xl">
          {CHARACTER_ANIMATION_DOSSIERS.map((dossier) => {
            const active = selectedActor === dossier.actorId;
            return (
              <button
                key={dossier.actorId}
                type="button"
                onClick={() => selectActorAndPlay(dossier.actorId)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {dossier.name.split(' · ')[0]}
              </button>
            );
          })}
        </div>

        {/* Character Continuity & Evasion Summary Strip */}
        <div className="bg-[#151921] border border-slate-800/90 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-400">
              Arme & Continuité Vérifiées
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              {activeDossier.weaponSummary}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-400">
              Tenue & Armure Constantes
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              {activeDossier.outfitSummary}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-400">
              Doctrine de Roulade / Esquive
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              {activeDossier.evasionDoctrine}
            </p>
          </div>
        </div>

        {/* 2-Column Live Animation Player + Sequence Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: 320x240 Live Pixel Viewport */}
          <div className="lg:col-span-6 bg-[#151921] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                <span className="text-white font-semibold">
                  {activeDossier.name.split(' · ')[0]}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-semibold">{activePreset.label}</span>
                <span aria-hidden="true">·</span>
                <span className="text-white font-semibold">
                  Pose {currentDisplayFrameIdx + 1} / {activePreset.frames.length}
                </span>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#0C0E12] border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setBackdropMode('arena')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    backdropMode === 'arena'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Arène 320×240
                </button>
                <button
                  type="button"
                  onClick={() => setBackdropMode('checker')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    backdropMode === 'checker'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Damier Alpha
                </button>
                <button
                  type="button"
                  onClick={() => setBackdropMode('magenta')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    backdropMode === 'magenta'
                      ? 'bg-[#d900d9] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  #FF00FF
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-[4/3] bg-[#090b10] rounded-lg overflow-hidden border border-slate-800">
              <canvas
                ref={previewCanvasRef}
                width={NATIVE_WIDTH}
                height={NATIVE_HEIGHT}
                className="w-full h-full block [image-rendering:pixelated]"
              />
            </div>

            {/* Interactive Step-by-Step Pose Progress Bar */}
            <div
              role="group"
              aria-label="Progression des poses de l’animation"
              className="flex items-center gap-1.5"
            >
              {activePreset.frames.map((_, idx) => {
                const isActive = idx === currentDisplayFrameIdx;
                return (
                  <button
                    key={`${activePreset.id}-step-${idx}`}
                    type="button"
                    onClick={() => handleSelectManualPose(idx)}
                    className={`flex-1 min-w-0 py-1.5 px-2 rounded text-[11px] font-mono tabular-nums transition-colors cursor-pointer truncate ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#0C0E12] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Pose {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>{isPlaying ? 'Pause' : 'Lecture'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestartSequence}
                    title="Rejouer depuis la Pose #1"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#0C0E12] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dès Pose #1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStepFrame(-1)}
                    aria-label="Pose précédente"
                    className="inline-flex items-center justify-center p-2 text-slate-200 bg-[#0C0E12] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStepFrame(1)}
                    aria-label="Pose suivante"
                    className="inline-flex items-center justify-center p-2 text-slate-200 bg-[#0C0E12] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipLeft((f) => !f)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      flipLeft
                        ? 'bg-slate-800 border-amber-500/60 text-amber-300'
                        : 'bg-[#0C0E12] border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <FlipHorizontal2 className="w-3.5 h-3.5" />
                    <span>Miroir</span>
                  </button>
                </div>

                {/* Viewport Scale Selector */}
                <div className="flex items-center gap-1 p-1 bg-[#0C0E12] border border-slate-800 rounded-lg">
                  <ZoomIn className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5 shrink-0" />
                  {zoomOptions.map((zm) => (
                    <button
                      key={zm.value}
                      type="button"
                      onClick={() => setZoomMode(zm.value)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        zoomMode === zm.value
                          ? 'bg-slate-800 text-amber-300 font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {zm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explicit Pose Duration Control */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
                <span className="text-xs text-slate-300 font-medium">
                  Durée d’affichage par pose :
                </span>
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0C0E12] border border-slate-800 rounded-lg">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChangePoseDuration(opt.value)}
                      className={`px-2.5 py-1 text-[11px] font-mono tabular-nums rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        poseDurationMs === opt.value
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Authentic Character Animation Picker + Frame-by-Frame Strip */}
          <div className="lg:col-span-6 bg-[#151921] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-bold text-white">
                  Animations de {activeDossier.name.split(' · ')[0]} ({presets.length})
                </h2>
                {currentFrameObj && (
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    x:{currentFrameObj.x} · y:{currentFrameObj.y} · {currentFrameObj.w}×
                    {currentFrameObj.h}px · axe:{currentFrameObj.ax}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presets.map((preset, idx) => {
                  const selected = idx === safePresetIdx;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(idx)}
                      className={`px-3 py-2 text-left text-xs font-medium rounded-lg border transition-colors whitespace-nowrap truncate cursor-pointer ${
                        selected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-[#0C0E12] border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      {preset.label} ({preset.frames.length})
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                <span className="text-amber-400 font-semibold">{activePreset.label}</span>
                {' · '}
                <span className="text-slate-400 font-mono">{activePreset.inputHint}</span>
                {' — '}
                {activePreset.notes}
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Découpage image par image (en surbrillance en direct · cliquez pour figer)
                </span>
                <span className="font-mono tabular-nums text-amber-300">
                  Pose {currentDisplayFrameIdx + 1} sur {activePreset.frames.length}
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                {activePreset.frames.map((frame, fIdx) => (
                  <FrameThumbnail
                    key={`${activePreset.id}-${fIdx}`}
                    frame={frame}
                    index={fIdx}
                    selected={currentDisplayFrameIdx === fIdx}
                    atlasVersion={atlasVersion}
                    onSelect={() => handleSelectManualPose(fIdx)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleExportCurrentStripPng}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-100 bg-[#0C0E12] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Exporter cette séquence (.PNG)</span>
              </button>

              {activeDossier.skin && (
                <button
                  type="button"
                  onClick={() =>
                    onTestFighterInArena(
                      activeDossier.stage,
                      activeDossier.skin === 'krom' ? 'gorgar' : activeDossier.skin!
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>
                    {activeDossier.skin === 'krom'
                      ? 'Jouer Krom dans l’Arène'
                      : `Affronter ${activeDossier.name.split(' · ')[0]}`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 1B: Direct Interactive Explorer for All 6 Panoramas (1800x240) & 6 Boss Arenas (320x240) */}
      <section ref={stageExplorerRef} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/90 pb-4">
          <div className="space-y-1 max-w-2xl">
            <p className="text-xs font-semibold text-amber-400">
              Inspection Directe dans le Navigateur · Zéro Téléchargement Requis
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Galerie des 6 Panoramas (1800×240) & des 6 Arènes de Boss (320×240)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Parcourez les six fresques horizontales continues et leurs six arènes finales à résolution native, testez le travelling caméra <code className="font-mono text-amber-300">320×240</code> ou ouvrez n’importe quel décor en plein écran pixel-art.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#141821] border border-slate-800 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => {
                setAutoTravelling(false);
                setStageGalleryMode('all_six');
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                stageGalleryMode === 'all_six'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Vue d’Ensemble (6 Panoramas & 6 Arènes)
            </button>
            <button
              type="button"
              onClick={() => setStageGalleryMode('interactive_camera')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                stageGalleryMode === 'interactive_camera'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Caméra Interactive 320×240 par Acte
            </button>
          </div>
        </div>

        {stageGalleryMode === 'all_six' ? (
          <div className="space-y-6">
            {SIX_STAGE_WORLDS.map((world, idx) => (
              <article
                key={world.stageId}
                className="bg-[#151921] border border-slate-800/90 rounded-xl p-5 space-y-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {world.actTitle}{' '}
                      <span className="text-slate-400 font-normal text-sm">
                        · {world.regionLabel}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">{world.notes}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWorldIdx(idx);
                        setCameraX(0);
                        setStageGalleryMode('interactive_camera');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-200 bg-[#0C0E12] hover:bg-slate-800 border border-amber-700/60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Caméra 320×240</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onTestFighterInArena(world.stageId, world.bossSkin)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Jouer ({world.bossLabel})</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                  {/* Left (8 cols): Scrollable 1800x240 Panorama */}
                  <div className="lg:col-span-8 bg-[#090b10] border border-slate-800 rounded-lg p-3 flex flex-col justify-between space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-200 font-semibold">
                        Panorama Continu · 1800×240 px (faites défiler horizontalement)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          openLightbox({
                            title: `${world.actTitle} — Panorama 1800×240`,
                            subtitle: `${world.regionLabel} · Défilement horizontal pixel-art`,
                            url: world.panoramaUrl,
                            fileName: world.panoramaFileName,
                            isWidePanorama: true,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Plein écran 1800×240</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded border border-slate-800/90 bg-black">
                      <img
                        src={world.panoramaUrl}
                        alt={`${world.actTitle} Panorama 1800x240`}
                        referrerPolicy="no-referrer"
                        className="h-[150px] sm:h-[186px] w-auto max-w-none block [image-rendering:pixelated]"
                      />
                    </div>
                  </div>

                  {/* Right (4 cols): Native 320x240 Boss Arena */}
                  <div className="lg:col-span-4 bg-[#090b10] border border-slate-800 rounded-lg p-3 flex flex-col justify-between space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-200 font-semibold truncate">
                        Arène Boss · 320×240 px
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          openLightbox({
                            title: `${world.actTitle} — Arène 320×240 (${world.bossLabel})`,
                            subtitle: `Résolution native Gamebuino AKA 320×240`,
                            url: world.arenaUrl,
                            fileName: world.arenaFileName,
                            isWidePanorama: false,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Plein écran</span>
                      </button>
                    </div>

                    <div className="aspect-[4/3] w-full rounded border border-slate-800/90 bg-black overflow-hidden">
                      <img
                        src={world.arenaUrl}
                        alt={`${world.actTitle} Arène 320x240`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain block [image-rendering:pixelated]"
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-[#151921] border border-slate-800/90 rounded-xl p-5 space-y-6">
            {/* Act I..VI Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0C0E12] border border-slate-800 rounded-lg">
                {SIX_STAGE_WORLDS.map((world, idx) => (
                  <button
                    key={world.stageId}
                    type="button"
                    onClick={() => {
                      setSelectedWorldIdx(idx);
                      setCameraX(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      selectedWorldIdx === idx
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Acte {world.actNumber} · {world.stageId.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoTravelling((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {autoTravelling ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>{autoTravelling ? 'Stopper Travelling' : 'Travelling Auto'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openLightbox({
                      title: `${activeWorld.actTitle} — Panorama 1800×240`,
                      subtitle: activeWorld.regionLabel,
                      url: activeWorld.panoramaUrl,
                      fileName: activeWorld.panoramaFileName,
                      isWidePanorama: true,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0C0E12] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Panorama Plein Écran</span>
                </button>
              </div>
            </div>

            {/* Full 1800x240 Strip with Camera Scrubbing */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-white">
                  {activeWorld.actTitle} — {activeWorld.regionLabel}
                </span>
                <span className="font-mono text-amber-300 tabular-nums">
                  Fenêtre caméra AKA : x = {cameraX}..{cameraX + 320} px / 1800 px
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={1480}
                step={4}
                value={cameraX}
                onChange={(e) => {
                  setAutoTravelling(false);
                  setCameraX(Number(e.target.value));
                }}
                aria-label="Position horizontale de la caméra dans le panorama 1800 pixels"
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#090b10] p-2">
                <canvas
                  ref={panoramaStripCanvasRef}
                  width={1800}
                  height={240}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    if (rect.width <= 0) return;
                    const ratio = (e.clientX - rect.left) / rect.width;
                    const targetX = Math.max(
                      0,
                      Math.min(1480, Math.round(ratio * 1800 - 160))
                    );
                    setAutoTravelling(false);
                    setCameraX(targetX);
                  }}
                  className="h-[180px] sm:h-[220px] w-auto max-w-none block cursor-pointer [image-rendering:pixelated]"
                />
              </div>
            </div>

            {/* Side-by-Side 320x240 Camera Window vs 320x240 Boss Arena */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#090b10] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-amber-300">
                    Vue Traversée Gamebuino AKA (320×240 à x={cameraX}px)
                  </span>
                  <span className="font-mono text-slate-400">Herses : 600px & 1200px</span>
                </div>
                <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border border-slate-800 bg-black">
                  <canvas
                    ref={cameraWindowCanvasRef}
                    width={NATIVE_WIDTH}
                    height={NATIVE_HEIGHT}
                    className="w-full h-full block [image-rendering:pixelated]"
                  />
                </div>
              </div>

              <div className="bg-[#090b10] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-white">
                    Arène du Boss Finale · {activeWorld.bossLabel} (320×240)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      openLightbox({
                        title: `${activeWorld.actTitle} — Arène 320×240`,
                        subtitle: `Boss : ${activeWorld.bossLabel}`,
                        url: activeWorld.arenaUrl,
                        fileName: activeWorld.arenaFileName,
                        isWidePanorama: false,
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 rounded transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Plein écran</span>
                  </button>
                </div>
                <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border border-slate-800 bg-black">
                  <img
                    src={activeWorld.arenaUrl}
                    alt={`${activeWorld.actTitle} Arène Boss`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain block [image-rendering:pixelated]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Full Visual Presentation of Animations Per Character + Roll Comparison */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              {presentationMode === 'rolls_comparison'
                ? `Comparatif Direct des Roulades & Esquives (${rollComparisonItems.length} Combattants)`
                : `Présentation Complète : ${activeDossier.name}`}
            </h2>
            <p className="text-xs text-slate-400">
              {presentationMode === 'rolls_comparison'
                ? 'Krom, Rival AKA, Malakor et Baelgor exécutent une roulade avant 360° armée ; les colosses Gorgar, Thalgrim, Vorgath et Drax utilisent une esquive accroupie ou un bond aérien.'
                : `${activeDossier.subtitle} — ${activeDossier.sequences.length} séquences distinctes jouées à ${(poseDurationMs / 1000).toFixed(2).replace('.', ',')} s par pose (cliquez sur une animation pour la voir dans la grande image).`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#141821] border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setPresentationMode('character_repertoire')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                presentationMode === 'character_repertoire'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Toutes les animations ({activeDossier.sequences.length})
            </button>
            <button
              type="button"
              onClick={() => setPresentationMode('rolls_comparison')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                presentationMode === 'rolls_comparison'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Comparatif Roulades & Esquives ({rollComparisonItems.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {presentationMode === 'rolls_comparison'
            ? rollComparisonItems.map(({ dossier, seq }) =>
                renderSequenceCard(dossier, seq, true)
              )
            : activeDossier.sequences.map((seq) =>
                renderSequenceCard(activeDossier, seq, false)
              )}
        </div>
      </section>

      {/* Section 3: Complete Master Sprite Sheets & 320x240 Stage Atlas Catalog */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Catalogue des Planches Complètes ({MASTER_SHEETS_CATALOG.length})
            </h2>
            <p className="text-xs text-slate-400">
              Cliquez sur « Jouer les animations » sur n’importe quelle planche pour animer le personnage dans la grande image 320×240, ou ouvrez la planche complète en plein écran.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#141821] border border-slate-800 rounded-lg">
            {(
              [
                { id: 'all', label: `Toutes (${MASTER_SHEETS_CATALOG.length})` },
                {
                  id: 'players',
                  label: `Joueurs (${MASTER_SHEETS_CATALOG.filter((e) => e.category === 'players').length})`,
                },
                {
                  id: 'bosses',
                  label: `Boss (${MASTER_SHEETS_CATALOG.filter((e) => e.category === 'bosses').length})`,
                },
                {
                  id: 'minions',
                  label: `Sbires (${MASTER_SHEETS_CATALOG.filter((e) => e.category === 'minions').length})`,
                },
                {
                  id: 'stages',
                  label: `Décors & Zones (${MASTER_SHEETS_CATALOG.filter((e) => e.category === 'stages').length})`,
                },
                {
                  id: 'animations',
                  label: `Animations & Gobelin (${MASTER_SHEETS_CATALOG.filter((e) => e.category === 'animations').length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCatalog.map((entry) => {
            const imgFailed = Boolean(failedImages[entry.id]);
            const linkedActors = SHEET_ACTOR_LINKS[entry.id] ?? [];
            const primaryActor = linkedActors[0];

            return (
              <article
                key={entry.id}
                className="bg-[#151921] border border-slate-800/90 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[3/2] bg-[#090b10] border-b border-slate-800/90 overflow-hidden group">
                    {imgFailed ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 to-stone-900">
                        <Layers className="w-8 h-8 text-amber-500 mb-2" />
                        <span className="text-sm font-semibold text-slate-200">
                          {entry.title}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          {entry.dimensionsLabel}
                        </span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={entry.downloadUrl}
                          alt={entry.title}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [entry.id]: true }))
                          }
                          onClick={() => {
                            if (primaryActor) {
                              selectActorAndPlay(primaryActor.actorId, undefined, true);
                            } else {
                              openLightbox({
                                title: entry.title,
                                subtitle: `${entry.dimensionsLabel} · ${entry.frameCountLabel} · ${entry.colorKeyLabel}`,
                                url: entry.downloadUrl,
                                fileName: entry.fileName,
                                isWidePanorama: entry.fileName.includes('panorama'),
                              });
                            }
                          }}
                          className="w-full h-full object-contain cursor-pointer [image-rendering:pixelated]"
                        />
                        <div className="absolute bottom-3 right-3 flex flex-wrap items-center gap-2">
                          {primaryActor && (
                            <button
                              type="button"
                              onClick={() =>
                                selectActorAndPlay(primaryActor.actorId, undefined, true)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Jouer les animations</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              openLightbox({
                                title: entry.title,
                                subtitle: `${entry.dimensionsLabel} · ${entry.frameCountLabel} · ${entry.colorKeyLabel}`,
                                url: entry.downloadUrl,
                                fileName: entry.fileName,
                                isWidePanorama: entry.fileName.includes('panorama'),
                                linkedActorId: primaryActor?.actorId,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-950/90 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Planche plein écran</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400/90 font-medium">
                      <span>{entry.roleLabel}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug">
                      {entry.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                      <span>{entry.dimensionsLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.frameCountLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.colorKeyLabel}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {entry.description}
                    </p>

                    {linkedActors.length > 1 && (
                      <div className="pt-3 space-y-2">
                        <span className="block text-xs font-semibold text-slate-200">
                          Jouer les animations d’une créature dans la grande image 320×240 :
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {linkedActors.map((act) => (
                            <button
                              key={act.actorId}
                              type="button"
                              onClick={() =>
                                selectActorAndPlay(act.actorId, undefined, true)
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-200 bg-[#0C0E12] hover:bg-amber-500 hover:text-slate-950 border border-slate-700 rounded-md transition-colors cursor-pointer"
                            >
                              <Play className="w-3 h-3" />
                              <span>{act.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.subDownloads && entry.subDownloads.length > 0 && (
                      <div className="pt-3 space-y-2">
                        <span className="block text-xs font-semibold text-slate-200">
                          Voir en direct ou télécharger individuellement :
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {entry.subDownloads.map((sub) => (
                            <div
                              key={sub.fileName}
                              className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-[#0C0E12] border border-slate-800 rounded-lg"
                            >
                              <span className="text-xs font-medium text-slate-200 truncate">
                                {sub.label}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openLightbox({
                                      title: sub.label,
                                      subtitle: sub.fileName.includes('panorama')
                                        ? 'Panorama 1800×240 px · Défilement horizontal'
                                        : 'Décor d’Arène 320×240 px',
                                      url: sub.url,
                                      fileName: sub.fileName,
                                      isWidePanorama: sub.fileName.includes('panorama'),
                                    })
                                  }
                                  title="Aperçu plein écran sans télécharger"
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500 hover:text-slate-950 rounded transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Voir</span>
                                </button>
                                <a
                                  href={sub.url}
                                  download={sub.fileName}
                                  title={`Télécharger ${sub.fileName}`}
                                  className="inline-flex items-center justify-center p-1 text-slate-400 hover:text-white rounded transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 bg-[#10141c] border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                  {primaryActor && (
                    <button
                      type="button"
                      onClick={() =>
                        selectActorAndPlay(primaryActor.actorId, undefined, true)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Jouer les animations</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      openLightbox({
                        title: entry.title,
                        subtitle: `${entry.dimensionsLabel} · ${entry.frameCountLabel}`,
                        url: entry.downloadUrl,
                        fileName: entry.fileName,
                        isWidePanorama: entry.fileName.includes('panorama'),
                        linkedActorId: primaryActor?.actorId,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Voir Planche</span>
                  </button>

                  <a
                    href={entry.downloadUrl}
                    download={entry.fileName}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Télécharger PNG</span>
                  </a>

                  {entry.sheetKey && (
                    <button
                      type="button"
                      onClick={() => handleDownloadTransparentSheet(entry)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>PNG Transparent</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleExportRgb565Header(entry)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Export .h RGB565</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Full-Resolution Pixel-Art Sheet & Panorama Lightbox */}
      {lightboxTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxTarget(null)}
        >
          <div
            className="bg-[#12161E] border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">
                  {lightboxTarget.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono tabular-nums">
                  {lightboxTarget.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {lightboxTarget.linkedActorId && (
                  <button
                    type="button"
                    onClick={() => {
                      const actor = lightboxTarget.linkedActorId!;
                      setLightboxTarget(null);
                      selectActorAndPlay(actor, undefined, true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Jouer l’animation en grand</span>
                  </button>
                )}

                <div className="flex items-center gap-1 p-1 bg-[#090b10] border border-slate-800 rounded-lg">
                  {(
                    [
                      { id: 'fit', label: 'Ajuster' },
                      { id: 'pixel_1x', label: 'Pixel 1×' },
                      { id: 'pixel_2x', label: 'Pixel 2×' },
                    ] as const
                  ).map((zm) => (
                    <button
                      key={zm.id}
                      type="button"
                      onClick={() => setLightboxZoom(zm.id)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                        lightboxZoom === zm.id
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {zm.label}
                    </button>
                  ))}
                </div>

                <a
                  href={lightboxTarget.url}
                  download={lightboxTarget.fileName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Télécharger PNG</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxTarget(null)}
                  aria-label="Fermer l’aperçu"
                  className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className={`flex-1 overflow-auto p-4 bg-[#07090d] flex ${
                lightboxZoom === 'fit'
                  ? 'items-center justify-center'
                  : 'items-center justify-start'
              }`}
            >
              <img
                src={lightboxTarget.url}
                alt={lightboxTarget.title}
                referrerPolicy="no-referrer"
                className={
                  lightboxZoom === 'fit'
                    ? 'max-w-full max-h-[74vh] w-auto h-auto object-contain [image-rendering:pixelated]'
                    : lightboxZoom === 'pixel_2x'
                    ? 'h-[480px] w-auto max-w-none [image-rendering:pixelated]'
                    : lightboxTarget.isWidePanorama
                    ? 'h-[240px] sm:h-[300px] w-auto max-w-none [image-rendering:pixelated]'
                    : 'max-w-none w-auto max-h-[74vh] [image-rendering:pixelated]'
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
