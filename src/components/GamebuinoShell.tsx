import React, { useRef, useState } from 'react';
import { Maximize2, Smartphone, Volume2 } from 'lucide-react';
import { NATIVE_HEIGHT, NATIVE_WIDTH } from '../game/combatEngine';
import { TRANSLATIONS } from '../i18n/translations';
import type { AkaSystemSettings, GoreMode, InputState } from '../types/game';

interface GamebuinoShellProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  shellStyle: 'aka_console' | 'pc_arcade';
  onChangeShellStyle: (style: 'aka_console' | 'pc_arcade') => void;
  settings: AkaSystemSettings;
  onChangeGoreMode: (mode: GoreMode) => void;
  activeInputPreview: InputState;
  onButtonChange: (
    key:
      | 'left'
      | 'right'
      | 'up'
      | 'down'
      | 'btnA'
      | 'btnB'
      | 'btnC'
      | 'btnD'
      | 'btnL1'
      | 'btnR1'
      | 'btnMenu'
      | 'btnRun',
    pressed: boolean
  ) => void;
  onJoystickMove: (jx: number, jy: number) => void;
  wifiBanner?: string | null;
}

export const GamebuinoShell: React.FC<GamebuinoShellProps> = ({
  canvasRef,
  shellStyle,
  onChangeShellStyle,
  settings,
  onChangeGoreMode,
  activeInputPreview,
  onButtonChange,
  onJoystickMove,
  wifiBanner,
}) => {
  const t = TRANSLATIONS[settings.language];
  const stickBaseRef = useRef<HTMLDivElement | null>(null);
  const [draggingStick, setDraggingStick] = useState(false);

  const bindHardwareBtn = (
    key:
      | 'left'
      | 'right'
      | 'up'
      | 'down'
      | 'btnA'
      | 'btnB'
      | 'btnC'
      | 'btnD'
      | 'btnL1'
      | 'btnR1'
      | 'btnMenu'
      | 'btnRun'
  ) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      onButtonChange(key, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      onButtonChange(key, false);
    },
    onPointerLeave: () => onButtonChange(key, false),
    onPointerCancel: () => onButtonChange(key, false),
  });

  const updateStickFromPointer = (clientX: number, clientY: number) => {
    const el = stickBaseRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.38;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    const scale = dist > maxR ? maxR / dist : 1;
    const nx = Math.max(-1, Math.min(1, (dx * scale) / maxR));
    const ny = Math.max(-1, Math.min(1, (dy * scale) / maxR));
    onJoystickMove(nx, ny);
  };

  // Visual deflection of analog joystick cap (either dragged or driven by keyboard/gamepad)
  const visJx =
    Math.abs(activeInputPreview.joyX) > 0.05
      ? activeInputPreview.joyX
      : activeInputPreview.left
      ? -0.8
      : activeInputPreview.right
      ? 0.8
      : 0;
  const visJy =
    Math.abs(activeInputPreview.joyY) > 0.05
      ? activeInputPreview.joyY
      : activeInputPreview.up
      ? -0.8
      : activeInputPreview.down
      ? 0.8
      : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Toolbar: Console Form Factor, Impact Mode (Soft/Normal/Gore) & Audio Readout */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#151921] border border-slate-800/90 rounded-lg">
            <button
              type="button"
              onClick={() => onChangeShellStyle('aka_console')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                shellStyle === 'aka_console'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.shellConsoleMode}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeShellStyle('pc_arcade')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                shellStyle === 'pc_arcade'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{t.shellPcMode}</span>
            </button>
          </div>

          <div
            className="flex items-center gap-1 p-1 bg-[#151921] border border-slate-800/90 rounded-lg"
            role="group"
            aria-label={t.sysMenuGoreMode}
          >
            <span className="px-2 text-xs text-slate-400 whitespace-nowrap shrink-0">
              Impacts :
            </span>
            <button
              type="button"
              title={t.goreSoftLabel}
              onClick={() => onChangeGoreMode('soft')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                settings.goreMode === 'soft'
                  ? 'bg-sky-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Soft
            </button>
            <button
              type="button"
              title={t.goreNormalLabel}
              onClick={() => onChangeGoreMode('normal')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                settings.goreMode === 'normal'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              title={t.goreGoreLabel}
              onClick={() => onChangeGoreMode('gore')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                settings.goreMode === 'gore'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Gore
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300 tabular-nums">
          {wifiBanner && (
            <span className="font-mono text-amber-300">{wifiBanner}</span>
          )}
          <span className="inline-flex items-center gap-1.5 font-mono text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            SFX {settings.sfxVolume}% · MUS {settings.musicVolume}% ·{' '}
            {settings.language.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Authentic Gamebuino AKA Hardware Unit */}
      <div className="bg-[#151921] border border-slate-800/90 rounded-2xl p-4 sm:p-6 space-y-4 select-none">
        {/* TOP SHOULDER TRIGGERS: L1 & R1 */}
        {shellStyle === 'aka_console' && (
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <button
              type="button"
              {...bindHardwareBtn('btnL1')}
              className={`px-6 py-2 text-xs font-mono font-bold rounded-tl-xl rounded-tr-md border transition-transform cursor-pointer whitespace-nowrap shrink-0 ${
                activeInputPreview.btnL1
                  ? 'bg-sky-500 text-slate-950 border-sky-300 translate-y-0.5'
                  : 'bg-[#222836] text-slate-200 border-slate-700 hover:bg-[#2a3142]'
              }`}
            >
              L1 · GARDE / PARADE
            </button>

            <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
              SD:/Krom_Barbarian/Firmware · 320×240 NON-TOUCH
            </span>

            <button
              type="button"
              {...bindHardwareBtn('btnR1')}
              className={`px-6 py-2 text-xs font-mono font-bold rounded-tr-xl rounded-tl-md border transition-transform cursor-pointer whitespace-nowrap shrink-0 ${
                activeInputPreview.btnR1
                  ? 'bg-amber-500 text-slate-950 border-amber-300 translate-y-0.5'
                  : 'bg-[#222836] text-slate-200 border-slate-700 hover:bg-[#2a3142]'
              }`}
            >
              R1 · FENDOIR LOURD
            </button>
          </div>
        )}

        {/* MAIN CONSOLE BODY: [Joystick + D-Pad + MENU] — [320x240 Non-Touch TFT] — [RUN + A/B/C/D] */}
        <div
          className={`grid items-center gap-6 ${
            shellStyle === 'aka_console'
              ? 'grid-cols-1 lg:grid-cols-[164px_minmax(0,1fr)_164px]'
              : 'grid-cols-1'
          }`}
        >
          {/* LEFT WING: Analog Joystick + Directional Pad + MENU Button */}
          {shellStyle === 'aka_console' && (
            <div className="order-2 lg:order-1 flex flex-row lg:flex-col items-center justify-around gap-5">
              {/* Analog Thumbstick */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  ref={stickBaseRef}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDraggingStick(true);
                    updateStickFromPointer(e.clientX, e.clientY);
                  }}
                  onPointerMove={(e) => {
                    if (draggingStick) {
                      updateStickFromPointer(e.clientX, e.clientY);
                    }
                  }}
                  onPointerUp={() => {
                    setDraggingStick(false);
                    onJoystickMove(0, 0);
                  }}
                  onPointerCancel={() => {
                    setDraggingStick(false);
                    onJoystickMove(0, 0);
                  }}
                  className="relative w-20 h-20 rounded-full bg-[#0d1017] border-2 border-slate-700 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner"
                  title="Joystick analogique Gamebuino AKA"
                >
                  <div
                    className="w-11 h-11 rounded-full bg-gradient-to-b from-slate-600 to-slate-800 border border-slate-400/50 shadow transition-transform duration-75"
                    style={{
                      transform: `translate(${Math.round(visJx * 16)}px, ${Math.round(
                        visJy * 16
                      )}px)`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">JOYSTICK</span>
              </div>

              {/* Physical Directional Pad (D-Pad) */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-28 h-28 shrink-0" aria-label="Pavé directionnel AKA">
                  <button
                    type="button"
                    {...bindHardwareBtn('up')}
                    aria-label="Haut"
                    className={`absolute top-0 left-9 w-10 h-10 border border-slate-700 rounded-t-md flex items-center justify-center text-xs font-bold cursor-pointer ${
                      activeInputPreview.up
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-[#222834] text-slate-200 hover:bg-[#2a3140]'
                    }`}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    {...bindHardwareBtn('down')}
                    aria-label="Bas"
                    className={`absolute bottom-0 left-9 w-10 h-10 border border-slate-700 rounded-b-md flex items-center justify-center text-xs font-bold cursor-pointer ${
                      activeInputPreview.down
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-[#222834] text-slate-200 hover:bg-[#2a3140]'
                    }`}
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    {...bindHardwareBtn('left')}
                    aria-label="Gauche"
                    className={`absolute left-0 top-9 w-10 h-10 border border-slate-700 rounded-l-md flex items-center justify-center text-xs font-bold cursor-pointer ${
                      activeInputPreview.left
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-[#222834] text-slate-200 hover:bg-[#2a3140]'
                    }`}
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    {...bindHardwareBtn('right')}
                    aria-label="Droite"
                    className={`absolute right-0 top-9 w-10 h-10 border border-slate-700 rounded-r-md flex items-center justify-center text-xs font-bold cursor-pointer ${
                      activeInputPreview.right
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-[#222834] text-slate-200 hover:bg-[#2a3140]'
                    }`}
                  >
                    ▶
                  </button>
                  <div className="absolute left-9 top-9 w-10 h-10 bg-[#1c212b] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">PAVÉ DIR.</span>
              </div>

              {/* Dedicated MENU System Button */}
              <button
                type="button"
                {...bindHardwareBtn('btnMenu')}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeInputPreview.btnMenu
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-[#1f2633] text-amber-300 border-amber-600/50 hover:bg-slate-800'
                }`}
              >
                MENU (Échap)
              </button>
            </div>
          )}

          {/* CENTER: NON-TOUCH 320x240 QVGA PIXEL SCREEN */}
          <div className="order-1 lg:order-2 flex flex-col items-center">
            <div className="w-full max-w-[700px] bg-[#090B0E] p-3 sm:p-4 rounded-xl border border-slate-800 shadow-inner">
              <div className="relative w-full aspect-[4/3] bg-black rounded overflow-hidden">
                {/* pointer-events-none strictly enforces non-touch TFT display behavior! */}
                <canvas
                  ref={canvasRef}
                  width={NATIVE_WIDTH}
                  height={NATIVE_HEIGHT}
                  className="w-full h-full block pixel-canvas pointer-events-none select-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2.5 px-1 text-[11px] font-mono text-slate-400 tabular-nums">
                <span>GAMEBUINO AKA · 320×240 TFT NON-TOUCH</span>
                <button
                  type="button"
                  {...bindHardwareBtn('btnMenu')}
                  className="text-amber-400 hover:text-amber-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  [Bouton MENU]
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              {t.nonTouchNotice}
            </p>
          </div>

          {/* RIGHT WING: RUN Button + 4 Action Buttons (A, B, C, D) */}
          {shellStyle === 'aka_console' && (
            <div className="order-3 flex flex-row lg:flex-col items-center justify-around gap-5">
              {/* Dedicated RUN Button */}
              <button
                type="button"
                {...bindHardwareBtn('btnRun')}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeInputPreview.btnRun
                    ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                    : 'bg-[#1f2633] text-emerald-300 border-emerald-600/50 hover:bg-slate-800'
                }`}
              >
                RUN (Entrée)
              </button>

              {/* 4-Button Diamond Layout: C (Top), D (Left), A (Right), B (Bottom) */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-36 h-36 shrink-0" aria-label="Boutons A, B, C, D">
                  {/* Top: C (Decapitation Spin!) */}
                  <button
                    type="button"
                    {...bindHardwareBtn('btnC')}
                    title="Bouton C — Moulinet Décapitant 360°"
                    className={`absolute top-0 left-11 w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow cursor-pointer ${
                      activeInputPreview.btnC
                        ? 'bg-amber-400 text-slate-950 border-amber-200 scale-95'
                        : 'bg-amber-700 text-white border-amber-500 hover:bg-amber-600'
                    }`}
                  >
                    <span className="text-sm font-bold leading-none">C</span>
                    <span className="text-[8px] opacity-90 mt-0.5">MOULINET</span>
                  </button>

                  {/* Left: D (Combat Roll) */}
                  <button
                    type="button"
                    {...bindHardwareBtn('btnD')}
                    title="Bouton D — Roulade d'Esquive"
                    className={`absolute top-11 left-0 w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow cursor-pointer ${
                      activeInputPreview.btnD
                        ? 'bg-sky-400 text-slate-950 border-sky-200 scale-95'
                        : 'bg-[#252c3b] text-white border-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold leading-none">D</span>
                    <span className="text-[8px] text-slate-300 mt-0.5">ROULADE</span>
                  </button>

                  {/* Right: A (Primary Sword / Confirm) */}
                  <button
                    type="button"
                    {...bindHardwareBtn('btnA')}
                    title="Bouton A — Taille Vive / Estoc / Valider"
                    className={`absolute top-11 right-0 w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow cursor-pointer ${
                      activeInputPreview.btnA
                        ? 'bg-red-400 text-slate-950 border-red-200 scale-95'
                        : 'bg-red-700 text-white border-red-500 hover:bg-red-600'
                    }`}
                  >
                    <span className="text-sm font-bold leading-none">A</span>
                    <span className="text-[8px] text-red-100 mt-0.5">GLAIVE</span>
                  </button>

                  {/* Bottom: B (Low Sweep / Heavy / Back) */}
                  <button
                    type="button"
                    {...bindHardwareBtn('btnB')}
                    title="Bouton B — Balayage / Fendoir / Retour"
                    className={`absolute bottom-0 left-11 w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow cursor-pointer ${
                      activeInputPreview.btnB
                        ? 'bg-slate-200 text-slate-950 border-white scale-95'
                        : 'bg-[#2c3446] text-white border-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold leading-none">B</span>
                    <span className="text-[8px] text-slate-300 mt-0.5">BALAYAGE</span>
                  </button>
                </div>
                <span className="text-[10px] font-mono text-slate-400">ACTION A·B·C·D</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hardware Controls & PC Keyboard Mapping Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-5 py-4 bg-[#151921] border border-slate-800/90 rounded-xl text-xs">
        <div>
          <p className="font-semibold text-white mb-0.5">Joystick & Pavé Directionnel</p>
          <p className="text-slate-400">
            Clavier ZQSD / WASD ou Flèches · Haut : Saut · Bas : Esquive basse
          </p>
        </div>
        <div>
          <p className="font-semibold text-white mb-0.5">Boutons A, B, C, D</p>
          <p className="text-slate-400">
            A (F/Espace) : Glaive · B (G) : Balayage · C (R) : Décapiter · D (E) : Roulade
          </p>
        </div>
        <div>
          <p className="font-semibold text-amber-400 mb-0.5">Gâchettes L1 & R1</p>
          <p className="text-slate-400">
            L1 (Maj / U) : Garde & Parade Parfaite · R1 (T / I) : Fendoir Brise-Garde
          </p>
        </div>
        <div>
          <p className="font-semibold text-emerald-400 mb-0.5">MENU, Forge & Cinématiques</p>
          <p className="text-slate-400">
            MENU (Échap) : Aide & Mode Soft/Gore · B/RUN : Passer cinématique · D : Forge
          </p>
        </div>
      </div>
    </div>
  );
};
