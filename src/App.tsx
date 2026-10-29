import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Flame,
  GitBranch,
  HardDrive,
  Layers,
  Swords,
} from 'lucide-react';
import {
  CAMPAIGN_ACTS,
  DEFAULT_PROGRESSION,
  FORGE_UPGRADES,
  HERO_BANNER_IMAGE,
  MINION_ARCHETYPES,
  SWORD_TECHNIQUES,
  type UpgradeSpec,
} from './data/campaign';
import { CUTSCENES, type CutsceneSfxKind } from './data/cutscenes';
import {
  computeBossAIInput,
  createInitialMatch,
  createZoneTraversal,
  EMPTY_INPUT,
  resetForNextRound,
  stepMatch,
  stepZoneTraversal,
  syncFighterWithProgression,
} from './game/combatEngine';
import { renderGamebuinoFrame } from './game/pixelRenderer';
import { akaAudio } from './game/sound';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './i18n/translations';
import { useWifiMultiplayer } from './hooks/useWifiMultiplayer';
import { useWebSerialAKA } from './hooks/useWebSerialAKA';
import { GamebuinoShell } from './components/GamebuinoShell';
import { CombatGuidePanel } from './components/CombatGuidePanel';
import { CampaignChronicle } from './components/CampaignChronicle';
import { ProgressionForge } from './components/ProgressionForge';
import { MultiplayerPanel } from './components/MultiplayerPanel';
import { SpriteSheetsStudio } from './components/SpriteSheetsStudio';
import type {
  AkaCodexUiState,
  AkaCutsceneUiState,
  AkaForgeUiState,
  AkaMenuOverlayState,
  AkaSystemSettings,
  BootloaderState,
  CutsceneId,
  FighterSkin,
  GameMode,
  GoreMode,
  InputState,
  MatchState,
  MinionSkin,
  ProgressionState,
  ScreenFlowState,
  StageId,
  TechniqueId,
  ZoneTraversalState,
} from './types/game';

const STORAGE_KEY = 'krom_gamebuino_aka_save_v2';
const SETTINGS_KEY = 'krom_gamebuino_aka_sys_v2';

type NavSection = 'arena' | 'sheets' | 'chronicle' | 'forge' | 'multiplayer';
type CampaignEntryMode = 'full' | 'zone_direct' | 'boss_direct';

function isMinionSkin(skin: FighterSkin): skin is MinionSkin {
  return Object.prototype.hasOwnProperty.call(MINION_ARCHETYPES, skin);
}

function loadSavedProgression(): ProgressionState {
  if (typeof window === 'undefined') return DEFAULT_PROGRESSION;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESSION;
    const parsed = JSON.parse(raw) as Partial<ProgressionState>;
    return {
      ...DEFAULT_PROGRESSION,
      ...parsed,
      highScore: typeof parsed.highScore === 'number' ? parsed.highScore : 0,
      totalMinionsSlain:
        typeof parsed.totalMinionsSlain === 'number' ? parsed.totalMinionsSlain : 0,
      unlockedTechniques: Array.isArray(parsed.unlockedTechniques)
        ? parsed.unlockedTechniques
        : ['whirlwind_edge'],
    };
  } catch {
    return DEFAULT_PROGRESSION;
  }
}

function loadSavedSettings(): AkaSystemSettings {
  if (typeof window === 'undefined') {
    return { sfxVolume: 75, musicVolume: 45, language: 'fr', goreMode: 'normal' };
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return { sfxVolume: 75, musicVolume: 45, language: 'fr', goreMode: 'normal' };
    }
    const p = JSON.parse(raw) as Partial<AkaSystemSettings>;
    const goreMode: GoreMode =
      p.goreMode === 'soft' || p.goreMode === 'normal' || p.goreMode === 'gore'
        ? p.goreMode
        : 'normal';
    return {
      sfxVolume: typeof p.sfxVolume === 'number' ? p.sfxVolume : 75,
      musicVolume: typeof p.musicVolume === 'number' ? p.musicVolume : 45,
      language: p.language ?? 'fr',
      goreMode,
    };
  } catch {
    return { sfxVolume: 75, musicVolume: 45, language: 'fr', goreMode: 'normal' };
  }
}

function readGamepadInput(): InputState | null {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
  const pads = navigator.getGamepads();
  const gp = pads[0];
  if (!gp) return null;
  const axX = gp.axes[0] ?? 0;
  const axY = gp.axes[1] ?? 0;
  return {
    left: Boolean(gp.buttons[14]?.pressed),
    right: Boolean(gp.buttons[15]?.pressed),
    up: Boolean(gp.buttons[12]?.pressed),
    down: Boolean(gp.buttons[13]?.pressed),
    joyX: Math.abs(axX) > 0.2 ? axX : 0,
    joyY: Math.abs(axY) > 0.2 ? axY : 0,
    btnA: Boolean(gp.buttons[0]?.pressed),
    btnB: Boolean(gp.buttons[1]?.pressed),
    btnC: Boolean(gp.buttons[3]?.pressed),
    btnD: Boolean(gp.buttons[2]?.pressed),
    btnL1: Boolean(gp.buttons[4]?.pressed),
    btnR1: Boolean(gp.buttons[5]?.pressed),
    btnMenu: Boolean(gp.buttons[8]?.pressed),
    btnRun: Boolean(gp.buttons[9]?.pressed),
  };
}

function mergeInputs(a: InputState, b: InputState, c?: InputState | null): InputState {
  const jx =
    Math.abs(a.joyX) > 0.05
      ? a.joyX
      : Math.abs(b.joyX) > 0.05
      ? b.joyX
      : c?.joyX ?? 0;
  const jy =
    Math.abs(a.joyY) > 0.05
      ? a.joyY
      : Math.abs(b.joyY) > 0.05
      ? b.joyY
      : c?.joyY ?? 0;

  return {
    left: a.left || b.left || Boolean(c?.left),
    right: a.right || b.right || Boolean(c?.right),
    up: a.up || b.up || Boolean(c?.up),
    down: a.down || b.down || Boolean(c?.down),
    joyX: jx,
    joyY: jy,
    btnA: a.btnA || b.btnA || Boolean(c?.btnA),
    btnB: a.btnB || b.btnB || Boolean(c?.btnB),
    btnC: a.btnC || b.btnC || Boolean(c?.btnC),
    btnD: a.btnD || b.btnD || Boolean(c?.btnD),
    btnL1: a.btnL1 || b.btnL1 || Boolean(c?.btnL1),
    btnR1: a.btnR1 || b.btnR1 || Boolean(c?.btnR1),
    btnMenu: a.btnMenu || b.btnMenu || Boolean(c?.btnMenu),
    btnRun: a.btnRun || b.btnRun || Boolean(c?.btnRun),
  };
}

export default function App() {
  const [activeNav, setActiveNav] = useState<NavSection>('arena');
  const [shellStyle, setShellStyle] = useState<'aka_console' | 'pc_arcade'>('aka_console');
  const [screenState, setScreenState] = useState<ScreenFlowState>('TITLE_MENU');
  const [progression, setProgression] = useState<ProgressionState>(loadSavedProgression);
  const [settings, setSettings] = useState<AkaSystemSettings>(loadSavedSettings);
  const [activeActIndex, setActiveActIndex] = useState<number>(0);
  const [selectedStage, setSelectedStage] = useState<StageId>('forest');
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [activeInputPreview, setActiveInputPreview] = useState<InputState>(EMPTY_INPUT);

  const wifi = useWifiMultiplayer();
  const usb = useWebSerialAKA();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const shellHardwareRef = useRef<InputState>({ ...EMPTY_INPUT });
  const prevHardwareRef = useRef<InputState>({ ...EMPTY_INPUT });

  // Non-touch in-screen cursors & system menu refs for deterministic 60Hz loop
  const screenStateRef = useRef<ScreenFlowState>(screenState);
  screenStateRef.current = screenState;

  const settingsRef = useRef<AkaSystemSettings>(settings);
  settingsRef.current = settings;

  const progressionRef = useRef<ProgressionState>(progression);
  progressionRef.current = progression;

  const titleCursorRef = useRef<number>(0);
  const akaMenuRef = useRef<AkaMenuOverlayState>({ open: false, cursor: 0 });
  const forgeUiRef = useRef<AkaForgeUiState>({
    cursor: 0,
    sparkTick: 0,
    feedbackText: '',
    continueLabel: 'Retour',
  });
  const codexUiRef = useRef<AkaCodexUiState>({ page: 0, tick: 0 });
  const cutsceneUiRef = useRef<AkaCutsceneUiState>({
    cutsceneId: 'act1_opening',
    shotIndex: 0,
    shotTick: 0,
    textRevealed: false,
  });
  const cutsceneNextScreenRef = useRef<ScreenFlowState>('ZONE_TRAVERSAL');
  const overlayReturnScreenRef = useRef<ScreenFlowState>('TITLE_MENU');
  const forgeNextActAfterRef = useRef<number | null>(null);
  const bootloaderRef = useRef<BootloaderState>({ selectedSlot: 0, bootProgress: 0 });

  const roundAdvanceTimerRef = useRef<number>(0);
  const rewardGrantedForMatchRef = useRef<boolean>(false);
  const zoneRewardGrantedRef = useRef<boolean>(false);
  const prevRemoteSnapshotRef = useRef<{ p1Hp: number; p2Hp: number; decap: boolean }>({
    p1Hp: 115,
    p2Hp: 115,
    decap: false,
  });

  const kromMaxHp = 100 + progression.vitalityRank * 15;
  const kromMaxStamina = 100 + progression.staminaRank * 12;
  const kromDamageMult = 1 + progression.bladeRank * 0.12;
  const kromDecapBonus = progression.executionerRank * 0.06;

  const zoneRef = useRef<ZoneTraversalState | null>(
    createZoneTraversal({
      stage: CAMPAIGN_ACTS[0].id,
      actIndex: 0,
      zoneTitle: CAMPAIGN_ACTS[0].zoneTitle,
      waves: CAMPAIGN_ACTS[0].zoneWaves,
      initialScore: 0,
      p1MaxHp: kromMaxHp,
      p1MaxStamina: kromMaxStamina,
      p1DamageMult: kromDamageMult,
      p1DecapBonus: kromDecapBonus,
    })
  );

  const matchRef = useRef<MatchState>(
    createInitialMatch({
      stage: 'forest',
      mode: 'campaign',
      actIndex: 0,
      p1MaxHp: kromMaxHp,
      p1MaxStamina: kromMaxStamina,
      p1DamageMult: kromDamageMult,
      p1DecapBonus: kromDecapBonus,
      p2Name: CAMPAIGN_ACTS[0].bossName.toUpperCase(),
      p2Skin: CAMPAIGN_ACTS[0].bossSkin,
      p2MaxHp: CAMPAIGN_ACTS[0].bossHp,
      p2DamageMult: CAMPAIGN_ACTS[0].bossDamageMultiplier,
    })
  );

  // Immediately apply Forge attribute upgrades to Krom's active FighterState!
  useEffect(() => {
    const m = matchRef.current;
    if (m.mode === 'campaign' || m.mode === 'quick_ai') {
      syncFighterWithProgression(
        m.p1,
        kromMaxHp,
        kromMaxStamina,
        kromDamageMult,
        kromDecapBonus
      );
    }
    if (zoneRef.current) {
      syncFighterWithProgression(
        zoneRef.current.p1,
        kromMaxHp,
        kromMaxStamina,
        kromDamageMult,
        kromDecapBonus
      );
    }
  }, [kromDamageMult, kromDecapBonus, kromMaxHp, kromMaxStamina]);

  const startCutscene = useCallback(
    (cutsceneId: CutsceneId, afterScreen: ScreenFlowState) => {
      setActiveNav('arena');
      akaMenuRef.current.open = false;
      akaAudio.setMusicPaused(false);
      cutsceneUiRef.current = {
        cutsceneId,
        shotIndex: 0,
        shotTick: 0,
        textRevealed: false,
      };
      cutsceneNextScreenRef.current = afterScreen;
      akaAudio.setMusicTrack(CUTSCENES[cutsceneId].musicTrack);
      setScreenState('CUTSCENE');
    },
    []
  );

  const openAkaForge = useCallback(
    (returnTo: ScreenFlowState, nextActAfter: number | null = null) => {
      setActiveNav('arena');
      akaMenuRef.current.open = false;
      akaAudio.setMusicPaused(false);
      overlayReturnScreenRef.current = returnTo;
      forgeNextActAfterRef.current = nextActAfter;
      forgeUiRef.current.feedbackText = '';
      forgeUiRef.current.continueLabel =
        nextActAfter !== null
          ? `Acte ${nextActAfter + 1}`
          : returnTo === 'STORY_BOSS_PRELUDE' || returnTo === 'PLAYING'
          ? 'Arène Boss'
          : returnTo === 'ZONE_TRAVERSAL'
          ? 'Lancer Zone'
          : returnTo === 'GAME_OVER'
          ? 'Revanche'
          : 'Retour';
      setScreenState('AKA_FORGE');
    },
    []
  );

  const openAkaCodex = useCallback((returnTo: ScreenFlowState) => {
    setActiveNav('arena');
    akaMenuRef.current.open = false;
    akaAudio.setMusicPaused(false);
    overlayReturnScreenRef.current = returnTo;
    setScreenState('AKA_CODEX');
  }, []);

  // Sync audio volumes & pause state when settings or menu/bootloader change
  useEffect(() => {
    akaAudio.setVolumes(settings.sfxVolume, settings.musicVolume);
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage error
    }
  }, [settings]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progression));
    } catch {
      // Ignore storage error
    }
  }, [progression]);

  const audioCallbacks = useRef({
    onSwing: (heavy: boolean) => akaAudio.playSwing(heavy),
    onClash: (perfect: boolean) => akaAudio.playClash(perfect),
    onHit: (critical: boolean) => akaAudio.playHit(critical),
    onDecapitate: () => akaAudio.playDecapitation(),
    onGoblinLaugh: () => akaAudio.playGoblinLaugh(),
    onMagicCast: () => akaAudio.playMagicCast(),
    onRoll: () => akaAudio.playRoll(),
    onJump: () => akaAudio.playJump(),
    onKnockdown: () => akaAudio.playKnockdown(),
    onThunder: () => akaAudio.playThunder(),
    onRoundEnd: (p1Won: boolean) => akaAudio.playFanfare(p1Won),
  });

  // Dynamically switch soundtrack composition between Title ("Anvil of Krom") and the 4 Stage Themes!
  useEffect(() => {
    if (screenState === 'CUTSCENE') {
      akaAudio.setMusicTrack(CUTSCENES[cutsceneUiRef.current.cutsceneId].musicTrack);
    } else if (
      screenState === 'TITLE_MENU' ||
      screenState === 'AKA_FORGE' ||
      screenState === 'AKA_CODEX' ||
      screenState === 'STORY_INTRO' ||
      screenState === 'STORY_ACT_EPILOGUE'
    ) {
      akaAudio.setMusicTrack('title');
    } else if (screenState === 'ZONE_TRAVERSAL' && zoneRef.current) {
      akaAudio.setMusicTrack(zoneRef.current.stage);
    } else if (screenState === 'STORY_BOSS_PRELUDE' || screenState === 'PLAYING') {
      akaAudio.setMusicTrack(matchRef.current.stage);
    }
  }, [screenState, selectedStage, activeActIndex]);

  const startCampaignAtAct = useCallback(
    (actIdx: number, entryMode: CampaignEntryMode = 'full', carryScore = 0) => {
      const safeIdx = Math.max(0, Math.min(CAMPAIGN_ACTS.length - 1, actIdx));
      const act = CAMPAIGN_ACTS[safeIdx];
      const tr = TRANSLATIONS[settingsRef.current.language];
      setActiveActIndex(safeIdx);
      setSelectedStage(act.id);
      setActiveNav('arena');
      akaMenuRef.current.open = false;
      rewardGrantedForMatchRef.current = false;
      zoneRewardGrantedRef.current = false;
      roundAdvanceTimerRef.current = 0;

      zoneRef.current = createZoneTraversal({
        stage: act.id,
        actIndex: safeIdx,
        zoneTitle: act.zoneTitle,
        waves: act.zoneWaves,
        initialScore: carryScore,
        p1MaxHp: kromMaxHp,
        p1MaxStamina: kromMaxStamina,
        p1DamageMult: kromDamageMult,
        p1DecapBonus: kromDecapBonus,
      });

      matchRef.current = createInitialMatch({
        stage: act.id,
        mode: 'campaign',
        actIndex: safeIdx,
        initialScore: carryScore,
        p1Name: 'KROM',
        p1MaxHp: kromMaxHp,
        p1MaxStamina: kromMaxStamina,
        p1DamageMult: kromDamageMult,
        p1DecapBonus: kromDecapBonus,
        p2Name: act.bossName.toUpperCase(),
        p2Skin: act.bossSkin,
        p2MaxHp: act.bossHp,
        p2DamageMult: act.bossDamageMultiplier,
        bannerText: `${tr.roundBannerPrefix} 1 · ${tr.fightWord}`,
      });

      if (entryMode === 'boss_direct') {
        setScreenState('PLAYING');
      } else if (entryMode === 'zone_direct') {
        setScreenState('ZONE_TRAVERSAL');
      } else {
        const openingIds: readonly CutsceneId[] = [
          'act1_opening',
          'act2_opening',
          'act3_opening',
          'act4_opening',
        ];
        startCutscene(openingIds[safeIdx] ?? 'act1_opening', 'ZONE_TRAVERSAL');
      }
    },
    [kromDamageMult, kromDecapBonus, kromMaxHp, kromMaxStamina, startCutscene]
  );

  const startModeMatch = useCallback(
    (mode: GameMode, stage: StageId) => {
      const tr = TRANSLATIONS[settingsRef.current.language];
      setActiveNav('arena');
      akaMenuRef.current.open = false;
      rewardGrantedForMatchRef.current = false;
      zoneRewardGrantedRef.current = false;
      roundAdvanceTimerRef.current = 0;

      const stageBoss =
        CAMPAIGN_ACTS.find((a) => a.id === stage) ?? CAMPAIGN_ACTS[0];

      matchRef.current = createInitialMatch({
        stage,
        mode,
        actIndex: stageBoss.actNumber - 1,
        p1Name: mode === 'usb_serial' ? 'KROM PC' : 'KROM',
        p1MaxHp: kromMaxHp,
        p1MaxStamina: kromMaxStamina,
        p1DamageMult: mode === 'local_2p' || mode === 'usb_serial' ? 1 : kromDamageMult,
        p1DecapBonus: mode === 'local_2p' || mode === 'usb_serial' ? 0 : kromDecapBonus,
        p2Name:
          mode === 'quick_ai'
            ? stageBoss.bossName.toUpperCase()
            : mode === 'usb_serial'
            ? 'AKA USB'
            : 'RIVAL J2',
        p2Skin: mode === 'quick_ai' ? stageBoss.bossSkin : 'rival_aka',
        p2MaxHp: mode === 'quick_ai' ? stageBoss.bossHp : kromMaxHp,
        p2DamageMult: mode === 'quick_ai' ? stageBoss.bossDamageMultiplier : 1,
        bannerText: `${tr.roundBannerPrefix} 1 · ${tr.fightWord}`,
      });

      setScreenState('PLAYING');
    },
    [kromDamageMult, kromDecapBonus, kromMaxHp, kromMaxStamina]
  );

  const startStudioFighterTest = useCallback(
    (stage: StageId, skin: FighterSkin) => {
      const tr = TRANSLATIONS[settingsRef.current.language];
      setSelectedStage(stage);
      setActiveNav('arena');
      akaMenuRef.current.open = false;
      rewardGrantedForMatchRef.current = false;
      zoneRewardGrantedRef.current = false;
      roundAdvanceTimerRef.current = 0;

      if (skin === 'rival_aka') {
        startModeMatch('local_2p', stage);
        return;
      }

      if (isMinionSkin(skin)) {
        const minion = MINION_ARCHETYPES[skin];
        const actIdx = Math.max(
          0,
          CAMPAIGN_ACTS.findIndex((a) => a.id === stage)
        );
        matchRef.current = createInitialMatch({
          stage,
          mode: 'quick_ai',
          actIndex: actIdx,
          p1Name: 'KROM',
          p1MaxHp: kromMaxHp,
          p1MaxStamina: kromMaxStamina,
          p1DamageMult: kromDamageMult,
          p1DecapBonus: kromDecapBonus,
          p2Name: minion.shortName,
          p2Skin: skin,
          p2MaxHp: Math.max(54, minion.hp * 2),
          p2DamageMult: minion.damageMultiplier,
          bannerText: `${minion.shortName} · ${tr.fightWord}`,
        });
        setScreenState('PLAYING');
        return;
      }

      const bossAct =
        CAMPAIGN_ACTS.find((a) => a.bossSkin === skin) ??
        CAMPAIGN_ACTS.find((a) => a.id === stage) ??
        CAMPAIGN_ACTS[0];

      matchRef.current = createInitialMatch({
        stage: bossAct.id,
        mode: 'quick_ai',
        actIndex: bossAct.actNumber - 1,
        p1Name: 'KROM',
        p1MaxHp: kromMaxHp,
        p1MaxStamina: kromMaxStamina,
        p1DamageMult: kromDamageMult,
        p1DecapBonus: kromDecapBonus,
        p2Name: bossAct.bossName.toUpperCase(),
        p2Skin: bossAct.bossSkin,
        p2MaxHp: bossAct.bossHp,
        p2DamageMult: bossAct.bossDamageMultiplier,
        bannerText: `${tr.roundBannerPrefix} 1 · ${tr.fightWord}`,
      });
      setScreenState('PLAYING');
    },
    [kromDamageMult, kromDecapBonus, kromMaxHp, kromMaxStamina, startModeMatch]
  );

  // Keyboard Listeners (AZERTY ZQSD + QWERTY WASD + Arrows + AKA A/B/C/D/L1/R1/MENU/RUN)
  useEffect(() => {
    const blockedCodes = new Set([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Space',
    ]);

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      akaAudio.unlockAudio();
      if (blockedCodes.has(e.code)) {
        e.preventDefault();
      }
      keysPressedRef.current.add(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.code);
    };

    const onBlur = () => {
      keysPressedRef.current.clear();
      shellHardwareRef.current = { ...EMPTY_INPUT };
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const readLocalInputs = useCallback(
    (mode: GameMode): { p1: InputState; p2: InputState } => {
      const keys = keysPressedRef.current;
      const shell = shellHardwareRef.current;
      const gpad = readGamepadInput();

      // Physical WASD codes correspond automatically to ZQSD on French AZERTY!
      const wasdInput: InputState = {
        left: keys.has('KeyA'),
        right: keys.has('KeyD'),
        up: keys.has('KeyW'),
        down: keys.has('KeyS'),
        joyX: 0,
        joyY: 0,
        btnA: keys.has('KeyF') || keys.has('Space'),
        btnB: keys.has('KeyG'),
        btnC: keys.has('KeyR'),
        btnD: keys.has('KeyE'),
        btnL1: keys.has('ShiftLeft') || keys.has('KeyQ'),
        btnR1: keys.has('KeyT'),
        btnMenu: keys.has('Escape') || keys.has('KeyM'),
        btnRun: keys.has('Enter'),
      };

      const arrowInput: InputState = {
        left: keys.has('ArrowLeft'),
        right: keys.has('ArrowRight'),
        up: keys.has('ArrowUp'),
        down: keys.has('ArrowDown'),
        joyX: 0,
        joyY: 0,
        btnA: keys.has('KeyJ') || keys.has('Numpad1'),
        btnB: keys.has('KeyK') || keys.has('Numpad2'),
        btnC: keys.has('KeyL') || keys.has('Numpad3'),
        btnD: keys.has('KeyO') || keys.has('Numpad4'),
        btnL1: keys.has('KeyU') || keys.has('ShiftRight'),
        btnR1: keys.has('KeyI') || keys.has('Numpad5'),
        btnMenu: false,
        btnRun: keys.has('NumpadEnter'),
      };

      if (mode === 'local_2p' && screenStateRef.current === 'PLAYING' && !akaMenuRef.current.open) {
        return {
          p1: mergeInputs(wasdInput, shell, gpad),
          p2: arrowInput,
        };
      }

      const combined = mergeInputs(mergeInputs(wasdInput, arrowInput), shell, gpad);
      return {
        p1: combined,
        p2: { ...EMPTY_INPUT },
      };
    },
    []
  );

  const handleAwardZoneOutcome = useCallback((zone: ZoneTraversalState) => {
    if (zoneRewardGrantedRef.current) return;
    zoneRewardGrantedRef.current = true;

    setProgression((prev) => ({
      ...prev,
      steelShards: prev.steelShards + zone.shardsCollected + (zone.zoneCompleted ? 8 : 0),
      renownXp: prev.renownXp + zone.slainCount * 8,
      highScore: Math.max(prev.highScore, zone.score),
      totalMinionsSlain: prev.totalMinionsSlain + zone.slainCount,
      totalDecapitations: prev.totalDecapitations + zone.decapCount,
    }));
  }, []);

  const handleAwardMatchOutcome = useCallback((m: MatchState) => {
    if (rewardGrantedForMatchRef.current || !m.matchOver) return;
    rewardGrantedForMatchRef.current = true;

    const p1Won = m.winner === 'p1';
    const act = CAMPAIGN_ACTS[m.actIndex] ?? CAMPAIGN_ACTS[0];

    setProgression((prev) => {
      const bestScore = Math.max(prev.highScore, m.score);

      if (m.mode === 'campaign' && p1Won) {
        const nextUnlocked = Math.min(
          CAMPAIGN_ACTS.length - 1,
          Math.max(prev.currentAct, m.actIndex + 1)
        );
        const finishedAll =
          m.actIndex >= CAMPAIGN_ACTS.length - 1 || prev.completedCampaign;
        return {
          ...prev,
          currentAct: nextUnlocked,
          completedCampaign: finishedAll,
          highScore: bestScore,
          steelShards:
            prev.steelShards + act.rewardShards + (m.wasDecapitation ? 15 : 0),
          renownXp: prev.renownXp + act.rewardXp,
          totalWins: prev.totalWins + 1,
          totalDecapitations:
            prev.totalDecapitations + (m.wasDecapitation ? 1 : 0),
        };
      }

      if (p1Won) {
        return {
          ...prev,
          highScore: bestScore,
          steelShards: prev.steelShards + 25 + (m.wasDecapitation ? 10 : 0),
          renownXp: prev.renownXp + 65,
          totalWins: prev.totalWins + 1,
          totalDecapitations:
            prev.totalDecapitations + (m.wasDecapitation ? 1 : 0),
        };
      }

      return {
        ...prev,
        highScore: bestScore,
        steelShards: prev.steelShards + 10,
        renownXp: prev.renownXp + 20,
      };
    });
  }, []);

  // Main 60Hz Gamebuino AKA Hardware & Combat Simulation Loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let accumulator = 0;
    const STEP_MS = 1000 / 60;
    let previewCounter = 0;

    const loop = (now: number) => {
      const dt = Math.min(64, now - lastTime);
      lastTime = now;
      accumulator += dt;

      while (accumulator >= STEP_MS) {
        accumulator -= STEP_MS;

        const m = matchRef.current;
        const inputs = readLocalInputs(m.mode);
        const cur = inputs.p1;
        const prev = prevHardwareRef.current;

        const curUp = cur.up || cur.joyY < -0.5;
        const prevUp = prev.up || prev.joyY < -0.5;
        const curDown = cur.down || cur.joyY > 0.5;
        const prevDown = prev.down || prev.joyY > 0.5;
        const curLeft = cur.left || cur.joyX < -0.5;
        const prevLeft = prev.left || prev.joyX < -0.5;
        const curRight = cur.right || cur.joyX > 0.5;
        const prevRight = prev.right || prev.joyX > 0.5;

        const edgeUp = curUp && !prevUp;
        const edgeDown = curDown && !prevDown;
        const edgeLeft = curLeft && !prevLeft;
        const edgeRight = curRight && !prevRight;
        const edgeA = cur.btnA && !prev.btnA;
        const edgeB = cur.btnB && !prev.btnB;
        const edgeC = cur.btnC && !prev.btnC;
        const edgeD = cur.btnD && !prev.btnD;
        const edgeL1 = cur.btnL1 && !prev.btnL1;
        const edgeR1 = cur.btnR1 && !prev.btnR1;
        const edgeRun = cur.btnRun && !prev.btnRun;
        const edgeMenu = cur.btnMenu && !prev.btnMenu;

        prevHardwareRef.current = { ...cur };

        const st = screenStateRef.current;

        // 1. BOOTLOADER & FIRMWARE FLASH SEQUENCE
        if (st === 'BOOTLOADER') {
          akaAudio.setMusicPaused(true);
          if (edgeA || edgeRun) {
            akaAudio.playMenuBlip(true);
            bootloaderRef.current.bootProgress = 0;
            setScreenState('BOOTING_FIRMWARE');
          }
          continue;
        }

        if (st === 'BOOTING_FIRMWARE') {
          bootloaderRef.current.bootProgress += 3;
          if (bootloaderRef.current.bootProgress >= 100) {
            bootloaderRef.current.bootProgress = 100;
            akaAudio.setMusicPaused(false);
            setScreenState('TITLE_MENU');
          }
          continue;
        }

        // 2. HARDWARE 'MENU' BUTTON TOGGLE (Pauses game until return!)
        if (edgeMenu) {
          akaMenuRef.current.open = !akaMenuRef.current.open;
          akaMenuRef.current.cursor = 0;
          akaAudio.setMusicPaused(akaMenuRef.current.open);
          akaAudio.playMenuBlip(true);
          continue;
        }

        // 3. SYSTEM MENU OVERLAY NAVIGATION (Non-Touch, 7 Rows: Resume, Guide, Gore Mode, SFX, Music, Lang, Loader)
        if (akaMenuRef.current.open) {
          if (edgeUp) {
            akaMenuRef.current.cursor = (akaMenuRef.current.cursor + 6) % 7;
            akaAudio.playMenuBlip(false);
          } else if (edgeDown) {
            akaMenuRef.current.cursor = (akaMenuRef.current.cursor + 1) % 7;
            akaAudio.playMenuBlip(false);
          } else if (edgeB) {
            akaMenuRef.current.open = false;
            akaAudio.setMusicPaused(false);
            akaAudio.playMenuBlip(false);
          } else {
            const row = akaMenuRef.current.cursor;
            if (row === 0 && (edgeA || edgeRun)) {
              akaMenuRef.current.open = false;
              akaAudio.setMusicPaused(false);
              akaAudio.playMenuBlip(true);
            } else if (row === 1 && (edgeA || edgeRun)) {
              akaAudio.playMenuBlip(true);
              const resumeTarget =
                st === 'AKA_CODEX' || st === 'AKA_FORGE'
                  ? overlayReturnScreenRef.current
                  : st;
              openAkaCodex(resumeTarget);
            } else if (row === 2 && (edgeLeft || edgeRight || edgeA || edgeRun)) {
              const modes: readonly GoreMode[] = ['soft', 'normal', 'gore'];
              setSettings((s) => {
                const curIdx = modes.indexOf(s.goreMode);
                const delta = edgeLeft ? -1 : 1;
                const nextIdx = (curIdx + delta + modes.length) % modes.length;
                akaAudio.playMenuBlip(true);
                return { ...s, goreMode: modes[nextIdx] };
              });
            } else if (row === 3 && (edgeLeft || edgeRight)) {
              setSettings((s) => {
                const next = Math.max(
                  0,
                  Math.min(100, s.sfxVolume + (edgeRight ? 10 : -10))
                );
                akaAudio.setVolumes(next, s.musicVolume);
                akaAudio.playMenuBlip(false);
                return { ...s, sfxVolume: next };
              });
            } else if (row === 4 && (edgeLeft || edgeRight)) {
              setSettings((s) => {
                const next = Math.max(
                  0,
                  Math.min(100, s.musicVolume + (edgeRight ? 10 : -10))
                );
                akaAudio.setVolumes(s.sfxVolume, next);
                akaAudio.playMenuBlip(false);
                return { ...s, musicVolume: next };
              });
            } else if (row === 5 && (edgeLeft || edgeRight || edgeA || edgeRun)) {
              setSettings((s) => {
                const curIdx = SUPPORTED_LANGUAGES.findIndex(
                  (l) => l.code === s.language
                );
                const delta = edgeLeft ? -1 : 1;
                const nextIdx =
                  (curIdx + delta + SUPPORTED_LANGUAGES.length) %
                  SUPPORTED_LANGUAGES.length;
                akaAudio.playMenuBlip(true);
                return { ...s, language: SUPPORTED_LANGUAGES[nextIdx].code };
              });
            } else if (row === 6 && (edgeA || edgeRun)) {
              akaMenuRef.current.open = false;
              akaAudio.setMusicPaused(true);
              akaAudio.playMenuBlip(true);
              setScreenState('BOOTLOADER');
            }
          }
          continue;
        }

        // 4. NON-TOUCH TITLE MENU NAVIGATION (6 Options + D for Forge / L1 for Guide)
        if (st === 'TITLE_MENU') {
          m.tick += 1;
          if (edgeUp) {
            titleCursorRef.current = (titleCursorRef.current + 5) % 6;
            akaAudio.playMenuBlip(false);
          } else if (edgeDown) {
            titleCursorRef.current = (titleCursorRef.current + 1) % 6;
            akaAudio.playMenuBlip(false);
          } else if (edgeD) {
            akaAudio.playMenuBlip(true);
            openAkaForge('TITLE_MENU', null);
          } else if (edgeL1) {
            akaAudio.playMenuBlip(true);
            openAkaCodex('TITLE_MENU');
          } else if (edgeA || edgeRun) {
            akaAudio.playMenuBlip(true);
            const choice = titleCursorRef.current;
            if (choice === 0) startCampaignAtAct(progression.currentAct, 'full', 0);
            else if (choice === 1) startModeMatch('quick_ai', selectedStage);
            else if (choice === 2) openAkaForge('TITLE_MENU', null);
            else if (choice === 3) openAkaCodex('TITLE_MENU');
            else if (choice === 4) startModeMatch('local_2p', selectedStage);
            else setActiveNav('multiplayer');
          }
          continue;
        }

        // 4B. IN-SCREEN 320x240 CAMPFIRE FORGE & BOTTES SECRÈTES
        if (st === 'AKA_FORGE') {
          m.tick += 1;
          if (forgeUiRef.current.sparkTick > 0) {
            forgeUiRef.current.sparkTick -= 1;
          }

          if (edgeUp) {
            forgeUiRef.current.cursor = (forgeUiRef.current.cursor + 6) % 7;
            forgeUiRef.current.feedbackText = '';
            akaAudio.playMenuBlip(false);
          } else if (edgeDown) {
            forgeUiRef.current.cursor = (forgeUiRef.current.cursor + 1) % 7;
            forgeUiRef.current.feedbackText = '';
            akaAudio.playMenuBlip(false);
          } else if (edgeL1) {
            akaAudio.playMenuBlip(true);
            setScreenState('AKA_CODEX');
          } else if (edgeA) {
            const idx = forgeUiRef.current.cursor;
            const curProg = progressionRef.current;
            if (idx < 4) {
              const up = FORGE_UPGRADES[idx];
              const rank = curProg[up.key];
              const cost = up.baseCost + rank * up.costStep;
              if (rank >= 4) {
                forgeUiRef.current.feedbackText = `${up.title} est déjà au rang maximum (4/4).`;
                akaAudio.playMenuBlip(false);
              } else if (curProg.steelShards >= cost) {
                setProgression((prev) => ({
                  ...prev,
                  steelShards: prev.steelShards - cost,
                  [up.key]: prev[up.key] + 1,
                }));
                forgeUiRef.current.sparkTick = 28;
                forgeUiRef.current.feedbackText = `Forgé : ${up.title} -> ${up.formatEffect(rank + 1)} !`;
                akaAudio.playClash(true);
              } else {
                forgeUiRef.current.feedbackText = `Il manque ${cost - curProg.steelShards} Éclats d’Acier (tuez des sbires ou boss).`;
                akaAudio.playMenuBlip(false);
              }
            } else {
              const tech = SWORD_TECHNIQUES[idx - 4];
              const unlocked = curProg.unlockedTechniques.includes(tech.id);
              if (unlocked) {
                setProgression((prev) => ({
                  ...prev,
                  equippedTechnique: tech.id,
                }));
                forgeUiRef.current.sparkTick = 18;
                forgeUiRef.current.feedbackText = `Botte équipée : ${tech.name} (${tech.inputHint}) !`;
                akaAudio.playClash(true);
              } else if (curProg.steelShards >= tech.unlockCost) {
                setProgression((prev) => ({
                  ...prev,
                  steelShards: prev.steelShards - tech.unlockCost,
                  unlockedTechniques: [...prev.unlockedTechniques, tech.id],
                  equippedTechnique: tech.id,
                }));
                forgeUiRef.current.sparkTick = 32;
                forgeUiRef.current.feedbackText = `Botte apprise & équipée : ${tech.name} !`;
                akaAudio.playClash(true);
              } else {
                forgeUiRef.current.feedbackText = `Il manque ${tech.unlockCost - curProg.steelShards} Éclats pour apprendre ${tech.name}.`;
                akaAudio.playMenuBlip(false);
              }
            }
          } else if (edgeB || edgeRun) {
            akaAudio.playMenuBlip(true);
            const nextAct = forgeNextActAfterRef.current;
            if (nextAct !== null) {
              forgeNextActAfterRef.current = null;
              startCampaignAtAct(nextAct, 'full', m.score);
            } else {
              setScreenState(overlayReturnScreenRef.current);
            }
          }
          continue;
        }

        // 4C. IN-SCREEN 320x240 COMBAT & PARRY CODEX (4 PAGES)
        if (st === 'AKA_CODEX') {
          m.tick += 1;
          codexUiRef.current.tick += 1;
          if (edgeLeft || edgeUp) {
            codexUiRef.current.page = (codexUiRef.current.page + 3) % 4;
            codexUiRef.current.tick = 0;
            akaAudio.playMenuBlip(false);
          } else if (edgeRight || edgeDown || edgeA || edgeR1) {
            codexUiRef.current.page = (codexUiRef.current.page + 1) % 4;
            codexUiRef.current.tick = 0;
            akaAudio.playMenuBlip(false);
          } else if (edgeD) {
            akaAudio.playMenuBlip(true);
            setScreenState('AKA_FORGE');
          } else if (edgeB || edgeRun) {
            akaAudio.playMenuBlip(true);
            setScreenState(overlayReturnScreenRef.current);
          }
          continue;
        }

        // 4D. SKIPPABLE 16-BIT STORY CUTSCENES (B/RUN: Skip All, A: Fast-Reveal / Next Shot, D: Forge)
        if (st === 'CUTSCENE') {
          m.tick += 1;
          const cs = cutsceneUiRef.current;
          const def = CUTSCENES[cs.cutsceneId] ?? CUTSCENES.act1_opening;
          const shot = def.shots[cs.shotIndex] ?? def.shots[0];

          if (edgeB || edgeRun) {
            akaAudio.playMenuBlip(true);
            setScreenState(cutsceneNextScreenRef.current);
            continue;
          }
          if (edgeD) {
            akaAudio.playMenuBlip(true);
            openAkaForge(cutsceneNextScreenRef.current, null);
            continue;
          }
          if (edgeL1) {
            akaAudio.playMenuBlip(true);
            openAkaCodex('CUTSCENE');
            continue;
          }

          if (Math.floor(cs.shotTick * 1.6) >= shot.text.length) {
            cs.textRevealed = true;
          }

          if (edgeA || edgeC) {
            if (!cs.textRevealed) {
              cs.textRevealed = true;
              akaAudio.playMenuBlip(false);
            } else if (cs.shotIndex < def.shots.length - 1) {
              cs.shotIndex += 1;
              cs.shotTick = 0;
              cs.textRevealed = false;
              akaAudio.playMenuBlip(false);
            } else {
              akaAudio.playMenuBlip(true);
              setScreenState(cutsceneNextScreenRef.current);
            }
            continue;
          }

          if (shot.sfxCues) {
            for (const cue of shot.sfxCues) {
              if (cue.tick === cs.shotTick) {
                const k: CutsceneSfxKind = cue.kind;
                if (k === 'swing_heavy') akaAudio.playSwing(true);
                else if (k === 'clash') akaAudio.playClash(true);
                else if (k === 'thunder') akaAudio.playThunder();
                else if (k === 'magic') akaAudio.playMagicCast();
                else if (k === 'drum') akaAudio.playKnockdown();
                else if (k === 'fanfare') akaAudio.playFanfare(true);
              }
            }
          }

          cs.shotTick += 1;
          if (cs.shotTick >= shot.durationTicks) {
            if (cs.shotIndex < def.shots.length - 1) {
              cs.shotIndex += 1;
              cs.shotTick = 0;
              cs.textRevealed = false;
            } else {
              setScreenState(cutsceneNextScreenRef.current);
            }
          }
          continue;
        }

        // 5. ILLUSTRATED STORY INTRO -> ZONE TRAVERSAL ('C' BOSS DIRECT, 'D' FORGE, 'L1' GUIDE)
        if (st === 'STORY_INTRO') {
          m.tick += 1;
          if (edgeA || edgeRun) {
            akaAudio.playMenuBlip(true);
            setScreenState('ZONE_TRAVERSAL');
          } else if (edgeC) {
            akaAudio.playMenuBlip(true);
            setScreenState('PLAYING');
          } else if (edgeD) {
            akaAudio.playMenuBlip(true);
            openAkaForge('STORY_INTRO', null);
          } else if (edgeL1) {
            akaAudio.playMenuBlip(true);
            openAkaCodex('STORY_INTRO');
          } else if (edgeB) {
            akaAudio.playMenuBlip(false);
            setScreenState('TITLE_MENU');
          }
          continue;
        }

        // 5B. SIDE-SCROLLING ZONE TRAVERSAL (960x240 Double Dragon / Barbarian Transition!)
        if (st === 'ZONE_TRAVERSAL') {
          const trZone = TRANSLATIONS[settingsRef.current.language];
          const zone = zoneRef.current;
          if (!zone) {
            setScreenState('PLAYING');
            continue;
          }

          stepZoneTraversal(
            zone,
            cur,
            progression.equippedTechnique,
            audioCallbacks.current,
            trZone.zoneClearBanner,
            settingsRef.current.goreMode
          );

          if (zone.zoneCompleted) {
            handleAwardZoneOutcome(zone);
            const act = CAMPAIGN_ACTS[zone.actIndex] ?? CAMPAIGN_ACTS[0];
            matchRef.current = createInitialMatch({
              stage: act.id,
              mode: 'campaign',
              actIndex: zone.actIndex,
              initialScore: zone.score,
              p1Name: 'KROM',
              p1MaxHp: kromMaxHp,
              p1StartHp: zone.p1.hp,
              p1StartRage: zone.p1.rage,
              p1MaxStamina: kromMaxStamina,
              p1DamageMult: kromDamageMult,
              p1DecapBonus: kromDecapBonus,
              p2Name: act.bossName.toUpperCase(),
              p2Skin: act.bossSkin,
              p2MaxHp: act.bossHp,
              p2DamageMult: act.bossDamageMultiplier,
              bannerText: `${trZone.roundBannerPrefix} 1 · ${trZone.fightWord}`,
            });
            roundAdvanceTimerRef.current = 0;
            const bossIntroIds: readonly CutsceneId[] = [
              'boss1_intro',
              'boss2_intro',
              'boss3_intro',
              'boss4_intro',
            ];
            startCutscene(bossIntroIds[zone.actIndex] ?? 'boss1_intro', 'PLAYING');
            continue;
          }

          if (zone.playerDefeated) {
            roundAdvanceTimerRef.current += 1;
            if (roundAdvanceTimerRef.current > 65) {
              handleAwardZoneOutcome(zone);
              matchRef.current.score = zone.score;
              roundAdvanceTimerRef.current = 0;
              setScreenState('GAME_OVER');
            }
          }
          continue;
        }

        // 5C. BOSS PRELUDE STORY SCREEN -> ENTER 320x240 BOSS ARENA (OR 'D' FORGE!)
        if (st === 'STORY_BOSS_PRELUDE') {
          m.tick += 1;
          if (edgeA || edgeRun) {
            akaAudio.playMenuBlip(true);
            setScreenState('PLAYING');
          } else if (edgeD) {
            akaAudio.playMenuBlip(true);
            openAkaForge('STORY_BOSS_PRELUDE', null);
          } else if (edgeL1) {
            akaAudio.playMenuBlip(true);
            openAkaCodex('STORY_BOSS_PRELUDE');
          } else if (edgeB) {
            akaAudio.playMenuBlip(false);
            setScreenState('TITLE_MENU');
          }
          continue;
        }

        // 5D. ACT EPILOGUE STORY BRIDGE -> CAMPFIRE FORGE STOP BEFORE NEXT ACT!
        if (st === 'STORY_ACT_EPILOGUE') {
          m.tick += 1;
          if (edgeA || edgeRun || edgeD) {
            akaAudio.playMenuBlip(true);
            if (activeActIndex < CAMPAIGN_ACTS.length - 1) {
              openAkaForge('TITLE_MENU', activeActIndex + 1);
            } else if (edgeD) {
              openAkaForge('STORY_ACT_EPILOGUE', null);
            } else {
              setScreenState('MATCH_VICTORY');
            }
          } else if (edgeL1) {
            akaAudio.playMenuBlip(true);
            openAkaCodex('STORY_ACT_EPILOGUE');
          } else if (edgeB) {
            akaAudio.playMenuBlip(false);
            setScreenState('TITLE_MENU');
          }
          continue;
        }

        // 6. NON-TOUCH VICTORY / GAME OVER NAVIGATION ('D' FORGE TO SPEND SHARDS!)
        if (st === 'MATCH_VICTORY' || st === 'GAME_OVER') {
          m.tick += 1;
          const canAdvance =
            st === 'MATCH_VICTORY' &&
            m.mode === 'campaign' &&
            activeActIndex < CAMPAIGN_ACTS.length - 1;

          if (edgeD) {
            akaAudio.playMenuBlip(true);
            openAkaForge(st, null);
          } else if (edgeL1) {
            akaAudio.playMenuBlip(true);
            openAkaCodex(st);
          } else if (edgeA || edgeRun) {
            akaAudio.playMenuBlip(true);
            if (canAdvance) {
              openAkaForge('MATCH_VICTORY', activeActIndex + 1);
            } else if (m.mode === 'wifi_multi' && wifi.roomCode) {
              wifi.requestRematch();
              setScreenState('PLAYING');
            } else if (m.mode === 'campaign') {
              startCampaignAtAct(activeActIndex, 'zone_direct', 0);
            } else {
              startModeMatch(m.mode, m.stage);
            }
          } else if (edgeC) {
            akaAudio.playMenuBlip(true);
            if (m.mode === 'wifi_multi' && wifi.roomCode) {
              wifi.requestRematch();
              setScreenState('PLAYING');
            } else if (m.mode === 'campaign') {
              startCampaignAtAct(activeActIndex, 'zone_direct', 0);
            } else {
              startModeMatch(m.mode, m.stage);
            }
          } else if (edgeB) {
            akaAudio.playMenuBlip(false);
            setScreenState('TITLE_MENU');
          }
          continue;
        }

        // 7. ACTIVE 320x240 SWORD COMBAT (SOLO, 2P, USB SERIAL, OR WIFI WEBSOCKET)
        const tr = TRANSLATIONS[settingsRef.current.language];
        const isWifiActive = m.mode === 'wifi_multi' && Boolean(wifi.roomCode);

        if (isWifiActive) {
          wifi.sendInput(cur);
          if (wifi.remoteMatch) {
            const rm = wifi.remoteMatch;
            const prevSnap = prevRemoteSnapshotRef.current;
            if (rm.wasDecapitation && !prevSnap.decap) {
              akaAudio.playDecapitation();
            } else if (rm.p1.hp < prevSnap.p1Hp || rm.p2.hp < prevSnap.p2Hp) {
              akaAudio.playHit(false);
            }
            prevRemoteSnapshotRef.current = {
              p1Hp: rm.p1.hp,
              p2Hp: rm.p2.hp,
              decap: rm.wasDecapitation,
            };
            matchRef.current = rm;

            if (rm.matchOver) {
              const localWon =
                (wifi.role === 'pc' && rm.winner === 'p1') ||
                (wifi.role === 'aka' && rm.winner === 'p2');
              setScreenState(localWon ? 'MATCH_VICTORY' : 'GAME_OVER');
            }
          }
        } else {
          let p2Input = inputs.p2;
          if (m.mode === 'campaign' || m.mode === 'quick_ai') {
            const act = CAMPAIGN_ACTS[m.actIndex] ?? CAMPAIGN_ACTS[0];
            const aiAggression = isMinionSkin(m.p2.skin)
              ? MINION_ARCHETYPES[m.p2.skin].aggression
              : act.bossAggression;
            p2Input = computeBossAIInput(m, aiAggression);
          } else if (m.mode === 'usb_serial') {
            p2Input = usb.akaInputRef.current;
          }

          stepMatch(
            m,
            cur,
            p2Input,
            progression.equippedTechnique,
            audioCallbacks.current,
            tr.perfectParryBanner,
            tr.fatalDecapBanner,
            settingsRef.current.goreMode
          );

          if (m.mode === 'usb_serial' && usb.connected) {
            usb.pushArenaStateToUsb(m);
          }

          if (m.roundOver) {
            roundAdvanceTimerRef.current += 1;
            if (m.matchOver && roundAdvanceTimerRef.current > 105) {
              handleAwardMatchOutcome(m);
              if (m.mode === 'campaign' && m.winner === 'p1') {
                if (m.actIndex >= CAMPAIGN_ACTS.length - 1) {
                  startCutscene('campaign_ending', 'MATCH_VICTORY');
                } else {
                  setScreenState('STORY_ACT_EPILOGUE');
                }
              } else {
                setScreenState(m.winner === 'p1' ? 'MATCH_VICTORY' : 'GAME_OVER');
              }
            } else if (!m.matchOver && roundAdvanceTimerRef.current > 115) {
              roundAdvanceTimerRef.current = 0;
              resetForNextRound(m, tr.roundBannerPrefix, tr.fightWord);
            }
          }
        }
      }

      // Render 320x240 Non-Touch Framebuffer
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderGamebuinoFrame(ctx, {
            state: matchRef.current,
            zoneState: zoneRef.current,
            screenState: screenStateRef.current,
            titleCursor: titleCursorRef.current,
            activeAct: CAMPAIGN_ACTS[activeActIndex] ?? CAMPAIGN_ACTS[0],
            hasNextAct: activeActIndex < CAMPAIGN_ACTS.length - 1,
            progression: progressionRef.current,
            forgeUi: forgeUiRef.current,
            codexUi: codexUiRef.current,
            cutsceneUi: cutsceneUiRef.current,
            akaMenu: akaMenuRef.current,
            settings: settingsRef.current,
            bootloader: bootloaderRef.current,
          });
        }
      }

      previewCounter += 1;
      if (previewCounter % 3 === 0) {
        const latest = readLocalInputs(matchRef.current.mode).p1;
        setActiveInputPreview(latest);
      }

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    activeActIndex,
    handleAwardMatchOutcome,
    handleAwardZoneOutcome,
    kromDamageMult,
    kromDecapBonus,
    kromMaxHp,
    kromMaxStamina,
    openAkaCodex,
    openAkaForge,
    progression.currentAct,
    progression.equippedTechnique,
    readLocalInputs,
    selectedStage,
    startCampaignAtAct,
    startCutscene,
    startModeMatch,
    usb,
    wifi,
  ]);

  const handleShellButtonChange = useCallback(
    (
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
    ) => {
      if (pressed) akaAudio.unlockAudio();
      shellHardwareRef.current = {
        ...shellHardwareRef.current,
        [key]: pressed,
      };
    },
    []
  );

  const handleJoystickMove = useCallback((jx: number, jy: number) => {
    akaAudio.unlockAudio();
    shellHardwareRef.current = {
      ...shellHardwareRef.current,
      joyX: jx,
      joyY: jy,
    };
  }, []);

  const handlePurchaseUpgrade = (key: UpgradeSpec['key'], cost: number) => {
    setProgression((prev) => {
      if (prev.steelShards < cost || prev[key] >= 4) return prev;
      return {
        ...prev,
        steelShards: prev.steelShards - cost,
        [key]: prev[key] + 1,
      };
    });
  };

  const handleUnlockTechnique = (id: TechniqueId, cost: number) => {
    setProgression((prev) => {
      if (prev.steelShards < cost || prev.unlockedTechniques.includes(id)) return prev;
      return {
        ...prev,
        steelShards: prev.steelShards - cost,
        unlockedTechniques: [...prev.unlockedTechniques, id],
        equippedTechnique: id,
      };
    });
  };

  const handleEquipTechnique = (id: TechniqueId) => {
    setProgression((prev) => ({
      ...prev,
      equippedTechnique: id,
    }));
  };

  const t = TRANSLATIONS[settings.language];
  const activeAct = CAMPAIGN_ACTS[activeActIndex] ?? CAMPAIGN_ACTS[0];
  const wifiBannerText =
    matchRef.current.mode === 'wifi_multi' && wifi.roomCode
      ? `WIFI ${wifi.roomCode} · ${wifi.role === 'aka' ? 'AKA' : 'PC'}`
      : matchRef.current.mode === 'usb_serial'
      ? `USB AKA · ${usb.connected ? '115200B' : 'OFF'}`
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0E12] text-[#F1F5F9]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/90 bg-[#0C0E12]/95 sticky top-0 z-30">
        {/* Zone 1: Single Text Element Wordmark */}
        <button
          type="button"
          onClick={() => setActiveNav('arena')}
          className="font-display text-lg sm:text-xl font-bold tracking-wide text-white hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {t.brandTitle}
        </button>

        {/* Zone 2: 5 Concise Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setActiveNav('arena')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeNav === 'arena'
                ? 'text-amber-400 underline underline-offset-8 decoration-amber-500'
                : 'hover:text-white'
            }`}
          >
            {t.navArena}
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('sheets')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeNav === 'sheets'
                ? 'text-amber-400 underline underline-offset-8 decoration-amber-500'
                : 'hover:text-white'
            }`}
          >
            {t.navSheets}
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('chronicle')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeNav === 'chronicle'
                ? 'text-amber-400 underline underline-offset-8 decoration-amber-500'
                : 'hover:text-white'
            }`}
          >
            {t.navChronicle}
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('forge')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeNav === 'forge'
                ? 'text-amber-400 underline underline-offset-8 decoration-amber-500'
                : 'hover:text-white'
            }`}
          >
            {t.navForge}
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('multiplayer')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeNav === 'multiplayer'
                ? 'text-amber-400 underline underline-offset-8 decoration-amber-500'
                : 'hover:text-white'
            }`}
          >
            {t.navMultiplayer}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              akaAudio.unlockAudio();
              if (activeNav !== 'arena') {
                setActiveNav('arena');
              } else {
                startCampaignAtAct(progression.currentAct, 'full', 0);
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {(screenState === 'PLAYING' ||
              screenState === 'ZONE_TRAVERSAL' ||
              screenState === 'CUTSCENE' ||
              screenState === 'STORY_INTRO' ||
              screenState === 'STORY_BOSS_PRELUDE' ||
              screenState === 'STORY_ACT_EPILOGUE') &&
            activeNav !== 'arena'
              ? t.ctaResumeDuel
              : `${t.ctaPlayAct} ${progression.currentAct + 1}`}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden items-center justify-around gap-2 px-4 py-2.5 border-b border-slate-800/80 bg-[#12161E] text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveNav('arena')}
          className={`whitespace-nowrap shrink-0 ${
            activeNav === 'arena' ? 'text-amber-400 font-semibold' : 'text-slate-300'
          }`}
        >
          AKA 320×240
        </button>
        <button
          type="button"
          onClick={() => setActiveNav('sheets')}
          className={`whitespace-nowrap shrink-0 ${
            activeNav === 'sheets' ? 'text-amber-400 font-semibold' : 'text-slate-300'
          }`}
        >
          {t.navSheets}
        </button>
        <button
          type="button"
          onClick={() => setActiveNav('chronicle')}
          className={`whitespace-nowrap shrink-0 ${
            activeNav === 'chronicle' ? 'text-amber-400 font-semibold' : 'text-slate-300'
          }`}
        >
          Boss
        </button>
        <button
          type="button"
          onClick={() => setActiveNav('forge')}
          className={`whitespace-nowrap shrink-0 ${
            activeNav === 'forge' ? 'text-amber-400 font-semibold' : 'text-slate-300'
          }`}
        >
          Forge
        </button>
        <button
          type="button"
          onClick={() => setActiveNav('multiplayer')}
          className={`whitespace-nowrap shrink-0 ${
            activeNav === 'multiplayer' ? 'text-amber-400 font-semibold' : 'text-slate-300'
          }`}
        >
          GitHub & AKA
        </button>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeNav === 'arena' && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_330px] gap-8 items-start">
            <div className="space-y-6">
              <GamebuinoShell
                canvasRef={canvasRef}
                shellStyle={shellStyle}
                onChangeShellStyle={setShellStyle}
                settings={settings}
                onChangeGoreMode={(mode) => {
                  akaAudio.unlockAudio();
                  akaAudio.playMenuBlip(true);
                  setSettings((s) => ({ ...s, goreMode: mode }));
                }}
                activeInputPreview={activeInputPreview}
                onButtonChange={handleShellButtonChange}
                onJoystickMove={handleJoystickMove}
                wifiBanner={wifiBannerText}
              />

              <CombatGuidePanel
                progression={progression}
                onOpenAkaCodexScreen={() => {
                  akaAudio.unlockAudio();
                  const ret =
                    screenState === 'AKA_CODEX' || screenState === 'AKA_FORGE'
                      ? overlayReturnScreenRef.current
                      : screenState;
                  openAkaCodex(ret);
                }}
                onOpenAkaForgeScreen={() => {
                  akaAudio.unlockAudio();
                  const ret =
                    screenState === 'AKA_CODEX' || screenState === 'AKA_FORGE'
                      ? overlayReturnScreenRef.current
                      : screenState;
                  openAkaForge(ret, null);
                }}
                onEquipTechnique={(id) => {
                  akaAudio.unlockAudio();
                  akaAudio.playClash(true);
                  handleEquipTechnique(id);
                }}
              />
            </div>

            {/* Companion Panel: Bootloader / System Menu Quick Info & GitHub Link */}
            <aside className="space-y-6">
              <div className="bg-[#151921] border border-slate-800/90 rounded-xl overflow-hidden">
                {heroImgFailed ? (
                  <div className="h-36 bg-gradient-to-br from-stone-900 to-amber-950/50 flex flex-col items-center justify-center p-4 text-center">
                    <Swords className="w-7 h-7 text-amber-500 mb-1.5" />
                    <span className="text-xs font-semibold text-slate-200">
                      Gamebuino AKA · 320×240
                    </span>
                  </div>
                ) : (
                  <div className="relative h-36 overflow-hidden bg-slate-950">
                    <img
                      src={HERO_BANNER_IMAGE}
                      alt="Duel barbare à l’épée dans l’arène aux flambeaux"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151921] via-black/35 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-xs text-amber-300 font-semibold">
                      {activeAct.title}
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">
                      Système Gamebuino AKA
                    </h3>
                    <p className="text-xs text-slate-400 tabular-nums">
                      {kromMaxHp} PV · +{progression.bladeRank * 12}% Acier ·{' '}
                      {progression.steelShards} Éclats
                    </p>
                    <p className="text-xs font-mono text-amber-300/90 tabular-nums">
                      Record {progression.highScore.toLocaleString('fr-FR')} PTS ·{' '}
                      {progression.totalMinionsSlain} Sbires vaincus
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Appuyez sur <strong>MENU</strong> (<code className="font-mono text-amber-300">Échap</code>) pour la Pause, l’<strong>Aide Coups & Parades</strong> et le mode d’impact (<strong>Soft / Normal / Gore</strong>). Les cinématiques se passent à tout moment avec <strong>B</strong> ou <strong>RUN</strong>.
                  </p>

                  <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        akaAudio.unlockAudio();
                        const ret =
                          screenState === 'AKA_CODEX' || screenState === 'AKA_FORGE'
                            ? overlayReturnScreenRef.current
                            : screenState;
                        openAkaCodex(ret);
                      }}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-sky-200 bg-[#0C0E12] hover:bg-slate-800 border border-sky-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      <span>Guide Coups & Parades (Écran AKA)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        akaAudio.unlockAudio();
                        const ret =
                          screenState === 'AKA_CODEX' || screenState === 'AKA_FORGE'
                            ? overlayReturnScreenRef.current
                            : screenState;
                        openAkaForge(ret, null);
                      }}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-amber-200 bg-[#0C0E12] hover:bg-slate-800 border border-amber-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Forge & Bottes ({progression.steelShards} Éclats)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNav('sheets')}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-200 bg-[#0C0E12] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>Planches Sprites, Décors & Animations</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        akaMenuRef.current.open = false;
                        akaAudio.setMusicPaused(true);
                        setScreenState('BOOTLOADER');
                      }}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-200 bg-[#0C0E12] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                      <span>Voir le Bootloader (/Firmware)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNav('multiplayer')}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>GitHub Release & Liaison AKA</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeNav === 'sheets' && (
          <SpriteSheetsStudio
            onTestFighterInArena={(stage, skin) => {
              akaAudio.unlockAudio();
              startStudioFighterTest(stage, skin);
            }}
          />
        )}

        {activeNav === 'chronicle' && (
          <CampaignChronicle
            progression={progression}
            onSelectActToPlay={(idx, entryMode) => {
              akaAudio.unlockAudio();
              startCampaignAtAct(idx, entryMode, 0);
            }}
            onPlayCutscene={(cutsceneId, actIdx) => {
              akaAudio.unlockAudio();
              if (cutsceneId === 'campaign_ending') {
                setActiveActIndex(3);
                setSelectedStage(CAMPAIGN_ACTS[3].id);
                startCutscene('campaign_ending', 'TITLE_MENU');
              } else {
                startCampaignAtAct(actIdx, 'full', 0);
              }
            }}
          />
        )}

        {activeNav === 'forge' && (
          <ProgressionForge
            progression={progression}
            onPurchaseUpgrade={handlePurchaseUpgrade}
            onUnlockTechnique={handleUnlockTechnique}
            onEquipTechnique={handleEquipTechnique}
            onResetProgression={() => setProgression(DEFAULT_PROGRESSION)}
            onReturnToArena={() => setActiveNav('arena')}
          />
        )}

        {activeNav === 'multiplayer' && (
          <MultiplayerPanel
            wifi={wifi}
            usb={usb}
            selectedStage={selectedStage}
            onSelectStage={setSelectedStage}
            onLaunchWifiArena={(asRole) => {
              setActiveNav('arena');
              akaMenuRef.current.open = false;
              if (asRole === 'aka') {
                setShellStyle('aka_console');
              }
              matchRef.current = createInitialMatch({
                stage: selectedStage,
                mode: 'wifi_multi',
                p1Name: 'KROM PC',
                p2Name: 'RIVAL AKA',
                p2Skin: 'rival_aka',
                p1MaxHp: 115,
                p2MaxHp: 115,
              });
              setScreenState('PLAYING');
            }}
            onLaunchUsbArena={() => startModeMatch('usb_serial', selectedStage)}
            onLaunchLocal2P={() => startModeMatch('local_2p', selectedStage)}
          />
        )}
      </main>

      <footer className="border-t border-slate-800/80 px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <span>
          Krom : Le Glaive d’Acier · Gamebuino AKA 320×240 Non-Tactile · /Krom_Barbarian/Firmware
        </span>
        <span>
          Joystick · Pavé · A/B/C/D · L1/R1 · MENU (6 Langues, Volumes, Pause, Loader) · RUN · GitHub Release Workflow
        </span>
      </footer>
    </div>
  );
}
