export type LanguageCode = 'fr' | 'en' | 'pt' | 'es' | 'it' | 'de';

export type GoreMode = 'soft' | 'normal' | 'gore';

export type CutsceneId =
  | 'act1_opening'
  | 'boss1_intro'
  | 'act2_opening'
  | 'boss2_intro'
  | 'act3_opening'
  | 'boss3_intro'
  | 'act4_opening'
  | 'boss4_intro'
  | 'campaign_ending';

export type StageId = 'forest' | 'crypt' | 'arena' | 'sanctuary';

export type GameMode =
  | 'campaign'
  | 'quick_ai'
  | 'local_2p'
  | 'wifi_multi'
  | 'usb_serial';

export type ScreenFlowState =
  | 'BOOTLOADER'
  | 'BOOTING_FIRMWARE'
  | 'TITLE_MENU'
  | 'AKA_FORGE'
  | 'AKA_CODEX'
  | 'CUTSCENE'
  | 'STORY_INTRO'
  | 'ZONE_TRAVERSAL'
  | 'STORY_BOSS_PRELUDE'
  | 'PLAYING'
  | 'STORY_ACT_EPILOGUE'
  | 'MATCH_VICTORY'
  | 'GAME_OVER';

export type MinionSkin =
  | 'wolf_raider'
  | 'monolith_spearman'
  | 'cult_acolyte'
  | 'crypt_skeleton'
  | 'pit_thrall'
  | 'drax_acolyte';

export type FighterSkin =
  | 'krom'
  | 'rival_aka'
  | 'gorgar'
  | 'vorgath'
  | 'malakor'
  | 'drax'
  | MinionSkin;

export type FighterAction =
  | 'idle'
  | 'walk_fwd'
  | 'walk_back'
  | 'jump'
  | 'crouch'
  | 'block_high'
  | 'roll_fwd'
  | 'roll_back'
  | 'slash_high'
  | 'thrust_mid'
  | 'sweep_low'
  | 'cleave_overhead'
  | 'spin_decap'
  | 'boss_cast'
  | 'hit_stun'
  | 'parried_stun'
  | 'knockdown'
  | 'decapitated'
  | 'dead'
  | 'victory';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  joyX: number; // -1.0 .. +1.0 analog joystick X
  joyY: number; // -1.0 .. +1.0 analog joystick Y
  btnA: boolean;
  btnB: boolean;
  btnC: boolean;
  btnD: boolean;
  btnL1: boolean;
  btnR1: boolean;
  btnMenu: boolean;
  btnRun: boolean;
}

export interface AkaSystemSettings {
  sfxVolume: number; // 0..100
  musicVolume: number; // 0..100
  language: LanguageCode;
  goreMode: GoreMode; // 'soft' | 'normal' | 'gore'
}

export interface AkaMenuOverlayState {
  open: boolean;
  cursor: number; // 0: Resume, 1: Combat Guide, 2: Gore/Impact Mode, 3: SFX Vol, 4: Music Vol, 5: Language, 6: Return to Loader
}

export interface AkaForgeUiState {
  cursor: number; // 0..3 Upgrades, 4..6 Secret Techniques
  sparkTick: number;
  feedbackText: string;
  continueLabel: string;
}

export interface AkaCodexUiState {
  page: number; // 0..3
  tick: number;
}

export interface AkaCutsceneUiState {
  cutsceneId: CutsceneId;
  shotIndex: number;
  shotTick: number;
  textRevealed: boolean;
}

export interface BootloaderState {
  selectedSlot: number; // 0: /Krom_Barbarian/Firmware.bin
  bootProgress: number; // 0..100 when launching Firmware.bin
}

export interface FighterState {
  id: 'p1' | 'p2';
  name: string;
  skin: FighterSkin;
  x: number; // 0..320 in arena or 0..960 in scrolling zone
  y: number; // ground is 196
  vx: number;
  vy: number;
  facing: 1 | -1; // 1 = right, -1 = left
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  rage: number; // 0..100
  action: FighterAction;
  actionTick: number;
  actionDuration: number;
  hitApplied: boolean;
  roundsWon: number;
  damageMultiplier: number;
  decapThresholdBonus: number;
}

export interface Projectile {
  id: number;
  owner: 'p1' | 'p2';
  kind: 'shockwave' | 'dark_orb';
  x: number;
  y: number;
  vx: number;
  damage: number;
  lowOnly: boolean;
  tick: number;
}

export interface PixelParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: 1 | 2 | 3;
  leavesStain?: boolean;
}

export type ImpactEffectKind =
  | 'slash_wound'
  | 'heavy_cleave'
  | 'pierce_thrust'
  | 'parry_clash'
  | 'guard_crush'
  | 'decap_fountain';

export interface ImpactEffect {
  id: number;
  x: number;
  y: number;
  dir: 1 | -1;
  kind: ImpactEffectKind;
  tick: number;
  maxTicks: number;
}

export interface FloorDecal {
  x: number;
  y: number;
  w: number;
  kind: 'drop' | 'splatter' | 'pool';
}

export interface SeveredHeadState {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  skin: FighterSkin;
}

export interface GoblinCleanerState {
  active: boolean;
  x: number;
  phase: 'entering' | 'laughing' | 'dragging' | 'done';
  tick: number;
  targetSide: 'p1' | 'p2';
}

export interface MatchState {
  tick: number;
  stage: StageId;
  mode: GameMode;
  actIndex: number; // 0..3
  round: number;
  score: number;
  bannerText: string;
  bannerTimer: number;
  freezeFrames: number;
  screenShake: number;
  lightningFlash: number;
  p1: FighterState;
  p2: FighterState;
  projectiles: Projectile[];
  particles: PixelParticle[];
  impacts: ImpactEffect[];
  floorDecals: FloorDecal[];
  severedHead: SeveredHeadState;
  goblin: GoblinCleanerState;
  roundOver: boolean;
  matchOver: boolean;
  winner: 'p1' | 'p2' | null;
  wasDecapitation: boolean;
}

export interface ZoneWaveEnemySpec {
  skin: MinionSkin;
  triggerX: number; // Camera/player X threshold that spawns this minion
  spawnX: number; // World X position (0..960)
  gateX: number; // Camera lock X while this wave is active
  dropKind?: 'meat_heal' | 'steel_shard';
}

export interface ZoneEnemyInstance {
  uid: number;
  fighter: FighterState;
  scoreValue: number;
  aggression: number;
  moveSpeed: number;
  attackCooldown: number;
  gateX: number;
  dropKind?: 'meat_heal' | 'steel_shard';
  despawnTimer: number; // Counts up once dead/decapitated, fades out cleanly
}

export interface ZonePickup {
  id: number;
  kind: 'meat_heal' | 'steel_shard';
  x: number;
  y: number;
  vy: number;
  collected: boolean;
  tick: number;
}

export interface FloatingScoreText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface ZoneTraversalState {
  stage: StageId;
  actIndex: number;
  zoneTitle: string;
  tick: number;
  worldWidth: number; // 960px (3x Gamebuino AKA 320px screens)
  cameraX: number; // 0..640
  lockX: number; // Current wave lock boundary in world coordinates
  goArrowTimer: number;
  p1: FighterState;
  alreadyHitUids: number[];
  enemies: ZoneEnemyInstance[];
  pendingWaves: ZoneWaveEnemySpec[];
  pickups: ZonePickup[];
  floatingTexts: FloatingScoreText[];
  particles: PixelParticle[];
  impacts: ImpactEffect[];
  floorDecals: FloorDecal[];
  freezeFrames: number;
  screenShake: number;
  lightningFlash: number;
  score: number;
  shardsCollected: number;
  decapCount: number;
  comboCount: number;
  comboTimer: number;
  slainCount: number;
  totalEnemies: number;
  zoneCompleted: boolean;
  playerDefeated: boolean;
  bannerText: string;
  bannerTimer: number;
}

export type TechniqueId = 'whirlwind_edge' | 'iron_riposte' | 'sky_breaker';

export interface ProgressionState {
  currentAct: number; // 0..3 unlocked
  completedCampaign: boolean;
  steelShards: number;
  renownXp: number;
  highScore: number;
  totalMinionsSlain: number;
  totalWins: number;
  totalDecapitations: number;
  vitalityRank: number; // 0..4
  bladeRank: number; // 0..4
  staminaRank: number; // 0..4
  executionerRank: number; // 0..4
  unlockedTechniques: TechniqueId[];
  equippedTechnique: TechniqueId;
}

export interface MultiplayerRoomSummary {
  roomCode: string;
  stage: StageId;
  hasPc: boolean;
  hasAka: boolean;
  createdAt: number;
}
