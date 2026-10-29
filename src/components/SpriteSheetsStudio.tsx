import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileCode2,
  FlipHorizontal2,
  Layers,
  Maximize2,
  Pause,
  Play,
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
type SheetCategoryFilter = 'all' | 'players' | 'bosses' | 'minions' | 'stages' | 'animations';
type PresentationViewMode = 'character_repertoire' | 'rolls_comparison';

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
          ? 'bg-amber-500/15 border-amber-500 text-amber-300'
          : 'bg-[#0C0E12] border-slate-800 hover:border-slate-600 text-slate-300'
      }`}
    >
      <canvas
        ref={thumbRef}
        width={76}
        height={76}
        className="w-[76px] h-[76px] rounded bg-[#0C0E12] [image-rendering:pixelated]"
      />
      <span className="mt-1.5 text-[11px] font-mono tabular-nums whitespace-nowrap">
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
}

function StaticPoseMiniCanvas({
  frame,
  poseIndex,
  atlasVersion,
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
    <div className="flex flex-col items-center shrink-0">
      <canvas
        ref={ref}
        width={64}
        height={64}
        className="w-16 h-16 rounded bg-[#0d1118] [image-rendering:pixelated]"
      />
      <span className="mt-1 text-[10px] text-slate-400 font-mono tabular-nums whitespace-nowrap">
        #{poseIndex + 1}
      </span>
    </div>
  );
}

interface LiveSequenceLoopCanvasProps {
  frames: SpriteFrameDef[];
  ticksPerFrame: number;
  speedMultiplier: number;
  atlasVersion: number;
  isJump?: boolean;
}

function computeJumpElevationPx(idx: number, total: number, maxLift: number): number {
  if (total <= 2) return idx === 1 ? -maxLift : 0;
  if (idx === 0 || idx === total - 1) return 0;
  const t = idx / (total - 1);
  return -Math.round(Math.sin(t * Math.PI) * maxLift);
}

function LiveSequenceLoopCanvas({
  frames,
  ticksPerFrame,
  speedMultiplier,
  atlasVersion,
  isJump = false,
}: LiveSequenceLoopCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let rafId = 0;
    let tickAcc = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(64, now - lastTime);
      lastTime = now;
      tickAcc += (dt / (1000 / 60)) * speedMultiplier;

      const canvas = canvasRef.current;
      if (canvas && frames.length > 0) {
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

          const idx = Math.floor(tickAcc / Math.max(2, ticksPerFrame)) % frames.length;
          const frame = frames[idx] ?? frames[0];
          const sheet = getSheetCanvas(frame.sheet, false);

          if (sheet) {
            const maxH = Math.max(...frames.map((f) => f.h), 1);
            const maxW = Math.max(...frames.map((f) => f.w), 1);
            const fitScale = Math.min((W - 16) / maxW, (H - 24) / maxH);
            const dw = Math.max(1, Math.round(frame.w * fitScale));
            const dh = Math.max(1, Math.round(frame.h * fitScale));
            const ax = Math.round(frame.ax * fitScale);
            const jumpOffsetY = isJump ? computeJumpElevationPx(idx, frames.length, 12) : 0;
            const shadowW = isJump ? Math.max(16, 32 + Math.round(jumpOffsetY * 0.9)) : 32;

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
              H - 10 - dh + jumpOffsetY,
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
  }, [frames, isJump, ticksPerFrame, speedMultiplier, atlasVersion]);

  return (
    <canvas
      ref={canvasRef}
      width={108}
      height={88}
      className="w-[108px] h-[88px] rounded-lg bg-[#0e131b] shrink-0 [image-rendering:pixelated]"
    />
  );
}

export function SpriteSheetsStudio({ onTestFighterInArena }: SpriteSheetsStudioProps) {
  const [selectedActor, setSelectedActor] = useState<StudioActorId>('krom');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [manualFrameIdx, setManualFrameIdx] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<0.15 | 0.25 | 0.5 | 1>(0.5);
  const [backdropMode, setBackdropMode] = useState<PreviewBackdropMode>('arena');
  const [flipLeft, setFlipLeft] = useState<boolean>(false);
  const [zoom2x, setZoom2x] = useState<boolean>(false);
  const [presentationMode, setPresentationMode] =
    useState<PresentationViewMode>('character_repertoire');
  const [categoryFilter, setCategoryFilter] = useState<SheetCategoryFilter>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [lightboxEntry, setLightboxEntry] = useState<MasterSheetCatalogEntry | null>(null);
  const [atlasVersion, setAtlasVersion] = useState<number>(0);
  const [exportStatusMsg, setExportStatusMsg] = useState<string>('');

  const previewSectionRef = useRef<HTMLElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    ensureSpriteAtlasLoaded();
    ensureStageArtLoaded();
    return subscribeSpriteAtlas(() => {
      setAtlasVersion((v) => v + 1);
    });
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

  const handleSelectActor = (id: StudioActorId) => {
    setSelectedActor(id);
    setSelectedPresetIdx(0);
    setManualFrameIdx(0);
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    setManualFrameIdx(0);
  };

  const handleInspectSequenceInViewport = (actorId: StudioActorId, seqId: string) => {
    const dossier = CHARACTER_ANIMATION_DOSSIERS.find((d) => d.actorId === actorId);
    if (!dossier) return;
    const seqIdx = Math.max(
      0,
      dossier.sequences.findIndex((s) => s.id === seqId)
    );
    setSelectedActor(actorId);
    setSelectedPresetIdx(seqIdx);
    setManualFrameIdx(0);
    setIsPlaying(true);
    previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Real-time 60Hz Pixel-Art Animation Viewport
  useEffect(() => {
    let rafId = 0;
    let tickAccumulator = 0;
    let lastNow = performance.now();

    const renderPreview = (now: number) => {
      const dt = Math.min(64, now - lastNow);
      lastNow = now;

      const frames = activePreset.frames;
      if (isPlaying && frames.length > 1) {
        tickAccumulator += (dt / (1000 / 60)) * speedMultiplier;
        const nextFrame =
          Math.floor(tickAccumulator / activePreset.ticksPerFrame) % frames.length;
        setManualFrameIdx((prev) => (prev === nextFrame ? prev : nextFrame));
      }

      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.imageSmoothingEnabled = false;

          if (backdropMode === 'magenta') {
            ctx.fillStyle = '#FF00FF';
            ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
            ctx.fillRect(0, GROUND_Y, NATIVE_WIDTH, 1);
          } else if (backdropMode === 'checker') {
            for (let y = 0; y < NATIVE_HEIGHT; y += 12) {
              for (let x = 0; x < NATIVE_WIDTH; x += 12) {
                ctx.fillStyle = ((x + y) / 12) % 2 === 0 ? '#10141c' : '#181e29';
                ctx.fillRect(x, y, 12, 12);
              }
            }
            ctx.fillStyle = '#27303f';
            ctx.fillRect(0, GROUND_Y, NATIVE_WIDTH, 1);
          } else {
            const stageCanvas = getStageCanvas320(activeDossier.stage);
            if (stageCanvas) {
              ctx.drawImage(stageCanvas, 0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
            } else {
              ctx.fillStyle = '#141822';
              ctx.fillRect(0, 0, NATIVE_WIDTH, GROUND_Y);
              ctx.fillStyle = '#25211d';
              ctx.fillRect(0, GROUND_Y, NATIVE_WIDTH, NATIVE_HEIGHT - GROUND_Y);
            }
          }

          const frameIdx = isPlaying
            ? Math.floor(tickAccumulator / activePreset.ticksPerFrame) % frames.length
            : manualFrameIdx % frames.length;
          const frame = frames[frameIdx] ?? frames[0];

          const sheetCanvas =
            backdropMode === 'magenta'
              ? getRawSheetImage(frame.sheet) ?? getSheetCanvas(frame.sheet, false)
              : getSheetCanvas(frame.sheet, false);

          if (sheetCanvas && frame) {
            const baseScale = activeDossier.skin
              ? getFighterScale(activeDossier.skin)
              : selectedActor === 'goblin'
              ? 0.34
              : 0.45;
            const scale = zoom2x ? baseScale * 1.45 : baseScale;
            const dw = Math.max(1, Math.round(frame.w * scale));
            const dh = Math.max(1, Math.round(frame.h * scale));
            const ax = Math.round(frame.ax * scale);

            const cx = Math.round(NATIVE_WIDTH * 0.5);
            const cy = zoom2x ? GROUND_Y + 18 : GROUND_Y;
            const jumpOffsetY = activePreset.isJump
              ? computeJumpElevationPx(frameIdx, frames.length, zoom2x ? 26 : 20)
              : 0;
            const shadowW = activePreset.isJump
              ? Math.max(16, 36 + Math.round(jumpOffsetY * 0.65))
              : 36;

            if (backdropMode !== 'magenta') {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
              ctx.fillRect(Math.round(cx - shadowW * 0.5), cy - 2, shadowW, 4);
            }

            ctx.save();
            ctx.translate(cx, cy + 2 + jumpOffsetY);
            if (flipLeft) {
              ctx.scale(-1, 1);
            }
            ctx.drawImage(
              sheetCanvas,
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
  }, [
    activeDossier.skin,
    activeDossier.stage,
    activePreset,
    backdropMode,
    flipLeft,
    isPlaying,
    manualFrameIdx,
    selectedActor,
    speedMultiplier,
    zoom2x,
  ]);

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

  const currentDisplayFrameIdx = manualFrameIdx % Math.max(1, activePreset.frames.length);
  const currentFrameObj =
    activePreset.frames[currentDisplayFrameIdx] ?? activePreset.frames[0];

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
                <span>{seq.frames.length} pose{seq.frames.length > 1 ? 's' : ''}</span>
                <span aria-hidden="true">·</span>
                <span>{seq.inputHint}</span>
                <span aria-hidden="true">·</span>
                <span>Cadence {seq.ticksPerFrame} ticks</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleInspectSequenceInViewport(dossier.actorId, seq.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#0C0E12] hover:bg-amber-500 hover:text-slate-950 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspecter</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{seq.notes}</p>

          {/* Live Loop + Full Frame-by-Frame Filmstrip Decomposition */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-4">
            <LiveSequenceLoopCanvas
              frames={seq.frames}
              ticksPerFrame={seq.ticksPerFrame}
              speedMultiplier={speedMultiplier}
              atlasVersion={atlasVersion}
              isJump={Boolean(seq.isJump)}
            />

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {seq.frames.map((frame, fIdx) => (
                <StaticPoseMiniCanvas
                  key={`${dossier.actorId}-${seq.id}-${fIdx}`}
                  frame={frame}
                  poseIndex={fIdx}
                  atlasVersion={atlasVersion}
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
              Planches Pixel-Art & Présentation des Animations par Personnage
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Vérifiez en direct chaque animation, chaque roulade 360° et la continuité des armes image par image, ou exportez les planches en PNG (<code className="font-mono text-amber-300">#FF00FF</code> / transparent) et C++ <code className="font-mono text-amber-300">RGB565</code>.
            </p>
          </div>

          {exportStatusMsg && (
            <p className="text-xs font-mono text-amber-300 whitespace-nowrap shrink-0">
              {exportStatusMsg}
            </p>
          )}
        </div>

        {/* Character Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#141821] border border-slate-800/90 rounded-xl">
          {CHARACTER_ANIMATION_DOSSIERS.map((dossier) => {
            const active = selectedActor === dossier.actorId;
            return (
              <button
                key={dossier.actorId}
                type="button"
                onClick={() => handleSelectActor(dossier.actorId)}
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

        {/* Character Continuity & Evasion Summary Strip (Unboxed Clean Typography) */}
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
                <span>{activePreset.label}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Pose {currentDisplayFrameIdx + 1}/{activePreset.frames.length}
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

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Lecture'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setManualFrameIdx(
                      (i) =>
                        (i - 1 + activePreset.frames.length) % activePreset.frames.length
                    );
                  }}
                  aria-label="Pose précédente"
                  className="inline-flex items-center justify-center p-2 text-slate-200 bg-[#0C0E12] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setManualFrameIdx((i) => (i + 1) % activePreset.frames.length);
                  }}
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

                <button
                  type="button"
                  onClick={() => setZoom2x((z) => !z)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    zoom2x
                      ? 'bg-slate-800 border-amber-500/60 text-amber-300'
                      : 'bg-[#0C0E12] border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Loupe</span>
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#0C0E12] border border-slate-800 rounded-lg">
                {([0.15, 0.25, 0.5, 1] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeedMultiplier(spd)}
                    className={`px-2.5 py-1 text-[11px] font-mono tabular-nums rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      speedMultiplier === spd
                        ? 'bg-slate-800 text-amber-300 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Authentic Character Animation Picker + Frame-by-Frame Strip */}
          <div className="lg:col-span-6 bg-[#151921] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-bold text-white">
                  Animations propres à ce personnage ({presets.length})
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
                <span>Découpage image par image (cliquez sur une pose pour figer)</span>
                <span className="font-mono tabular-nums">
                  {activePreset.frames.length} pose{activePreset.frames.length > 1 ? 's' : ''}
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
                    onSelect={() => {
                      setIsPlaying(false);
                      setManualFrameIdx(fIdx);
                    }}
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

      {/* Section 2: Full Visual Presentation of Animations Per Character + Roll Comparison */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              {presentationMode === 'rolls_comparison'
                ? 'Comparatif Direct des Roulades & Esquives (6 Combattants)'
                : `Présentation Complète : ${activeDossier.name}`}
            </h2>
            <p className="text-xs text-slate-400">
              {presentationMode === 'rolls_comparison'
                ? 'Krom, Rival AKA et Malakor exécutent une vraie roulade avant 360° armée ; les colosses Gorgar, Vorgath et Drax utilisent une esquive accroupie ou un bond aérien.'
                : `${activeDossier.subtitle} — ${activeDossier.sequences.length} séquences distinctes décomposées pose par pose.`}
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
              Comparatif Roulades & Esquives (6)
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
              Toutes les planches joueurs, adversaires, décors 320×240 et animations prêtes pour Aseprite, GitHub Release ou carte SD Gamebuino AKA.
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
                          className="w-full h-full object-contain [image-rendering:pixelated]"
                        />
                        <button
                          type="button"
                          onClick={() => setLightboxEntry(entry)}
                          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-950/90 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Plein écran</span>
                        </button>
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

                    {entry.subDownloads && entry.subDownloads.length > 0 && (
                      <div className="pt-3 space-y-2">
                        <span className="block text-xs font-semibold text-slate-200">
                          Télécharger chaque décor 320×240 individuellement :
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {entry.subDownloads.map((sub) => (
                            <a
                              key={sub.fileName}
                              href={sub.url}
                              download={sub.fileName}
                              className="inline-flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0C0E12] hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap truncate"
                            >
                              <span className="truncate">{sub.label}</span>
                              <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 bg-[#10141c] border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                  <a
                    href={entry.downloadUrl}
                    download={entry.fileName}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
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

      {/* Full-Resolution Pixel-Art Sheet Lightbox */}
      {lightboxEntry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxEntry(null)}
        >
          <div
            className="bg-[#12161E] border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">
                  {lightboxEntry.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono tabular-nums">
                  {lightboxEntry.dimensionsLabel} · {lightboxEntry.frameCountLabel} ·{' '}
                  {lightboxEntry.colorKeyLabel}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={lightboxEntry.downloadUrl}
                  download={lightboxEntry.fileName}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger PNG</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxEntry(null)}
                  aria-label="Fermer l’aperçu"
                  className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#07090d] flex items-center justify-center">
              <img
                src={lightboxEntry.downloadUrl}
                alt={lightboxEntry.title}
                referrerPolicy="no-referrer"
                className="max-w-none w-auto max-h-[76vh] [image-rendering:pixelated]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
