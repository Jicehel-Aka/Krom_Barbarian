import type {
  FighterAction,
  FighterSkin,
  FighterState,
  FloorDecal,
  GameMode,
  GoreMode,
  ImpactEffect,
  ImpactEffectKind,
  InputState,
  MatchState,
  MinionSkin,
  PixelParticle,
  StageId,
  TechniqueId,
  ZoneEnemyInstance,
  ZoneTraversalState,
  ZoneWaveEnemySpec,
} from '../types/game';

// Native 320x240 QVGA Gamebuino AKA Non-Touch Display Coordinates
export const NATIVE_WIDTH = 320;
export const NATIVE_HEIGHT = 240;
export const GROUND_Y = 196;
export const ARENA_MIN_X = 28;
export const ARENA_MAX_X = 292;
export const ZONE_WORLD_WIDTH = 960;

export interface CombatAudioCallbacks {
  onSwing?: (heavy: boolean) => void;
  onClash?: (perfect: boolean) => void;
  onHit?: (critical: boolean) => void;
  onDecapitate?: () => void;
  onGoblinLaugh?: () => void;
  onMagicCast?: () => void;
  onRoll?: () => void;
  onJump?: () => void;
  onKnockdown?: () => void;
  onThunder?: () => void;
  onRoundEnd?: (p1Won: boolean) => void;
}

export const EMPTY_INPUT: InputState = {
  left: false,
  right: false,
  up: false,
  down: false,
  joyX: 0,
  joyY: 0,
  btnA: false,
  btnB: false,
  btnC: false,
  btnD: false,
  btnL1: false,
  btnR1: false,
  btnMenu: false,
  btnRun: false,
};

interface AttackSpec {
  duration: number;
  activeStart: number;
  activeEnd: number;
  range: number;
  damage: number;
  staminaCost: number;
  heightZone: 'high' | 'mid' | 'low' | 'neck';
  knockback: number;
  causesKnockdown?: boolean;
}

const ATTACK_SPECS: Record<
  'slash_high' | 'thrust_mid' | 'sweep_low' | 'cleave_overhead' | 'spin_decap',
  AttackSpec
> = {
  slash_high: {
    duration: 18,
    activeStart: 7,
    activeEnd: 11,
    range: 54,
    damage: 14,
    staminaCost: 14,
    heightZone: 'high',
    knockback: 8,
  },
  thrust_mid: {
    duration: 20,
    activeStart: 8,
    activeEnd: 13,
    range: 62,
    damage: 16,
    staminaCost: 17,
    heightZone: 'mid',
    knockback: 10,
  },
  sweep_low: {
    duration: 22,
    activeStart: 9,
    activeEnd: 14,
    range: 56,
    damage: 13,
    staminaCost: 18,
    heightZone: 'low',
    knockback: 6,
    causesKnockdown: true,
  },
  cleave_overhead: {
    duration: 26,
    activeStart: 12,
    activeEnd: 17,
    range: 58,
    damage: 23,
    staminaCost: 24,
    heightZone: 'high',
    knockback: 14,
  },
  spin_decap: {
    duration: 32,
    activeStart: 15,
    activeEnd: 21,
    range: 62,
    damage: 28,
    staminaCost: 30,
    heightZone: 'neck',
    knockback: 16,
  },
};

const MINION_COMBAT_SPECS: Record<
  MinionSkin,
  {
    shortName: string;
    hp: number;
    scoreValue: number;
    damageMultiplier: number;
    aggression: number;
    moveSpeed: number;
  }
> = {
  wolf_raider: {
    shortName: 'PILLARD',
    hp: 20,
    scoreValue: 150,
    damageMultiplier: 0.36,
    aggression: 0.24,
    moveSpeed: 1.55,
  },
  monolith_spearman: {
    shortName: 'GARDE RUNE',
    hp: 34,
    scoreValue: 250,
    damageMultiplier: 0.42,
    aggression: 0.28,
    moveSpeed: 1.65,
  },
  cult_acolyte: {
    shortName: 'FANATIQUE',
    hp: 24,
    scoreValue: 200,
    damageMultiplier: 0.40,
    aggression: 0.27,
    moveSpeed: 1.60,
  },
  crypt_skeleton: {
    shortName: 'SQUELETTE',
    hp: 36,
    scoreValue: 300,
    damageMultiplier: 0.44,
    aggression: 0.31,
    moveSpeed: 1.72,
  },
  pit_thrall: {
    shortName: 'GLADIATEUR',
    hp: 48,
    scoreValue: 400,
    damageMultiplier: 0.48,
    aggression: 0.35,
    moveSpeed: 1.85,
  },
  drax_acolyte: {
    shortName: 'SENTINELLE',
    hp: 64,
    scoreValue: 550,
    damageMultiplier: 0.52,
    aggression: 0.39,
    moveSpeed: 1.92,
  },
};

export interface CreateMatchOptions {
  stage: StageId;
  mode: GameMode;
  actIndex?: number;
  initialScore?: number;
  p1Name?: string;
  p1StartHp?: number;
  p1MaxHp?: number;
  p1MaxStamina?: number;
  p1StartRage?: number;
  p1DamageMult?: number;
  p1DecapBonus?: number;
  p2Name?: string;
  p2Skin?: FighterSkin;
  p2MaxHp?: number;
  p2DamageMult?: number;
  bannerText?: string;
}

export function createFighter(
  id: 'p1' | 'p2',
  name: string,
  skin: FighterSkin,
  maxHp: number,
  maxStamina: number,
  damageMultiplier: number,
  decapThresholdBonus = 0
): FighterState {
  return {
    id,
    name,
    skin,
    x: id === 'p1' ? 88 : 232,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    facing: id === 'p1' ? 1 : -1,
    hp: maxHp,
    maxHp,
    stamina: maxStamina,
    maxStamina,
    rage: 0,
    action: 'idle',
    actionTick: 0,
    actionDuration: 0,
    hitApplied: false,
    roundsWon: 0,
    damageMultiplier,
    decapThresholdBonus,
  };
}

export function syncFighterWithProgression(
  fighter: FighterState,
  nextMaxHp: number,
  nextMaxStamina: number,
  nextDamageMult: number,
  nextDecapBonus: number
): void {
  const hpGain = Math.max(0, nextMaxHp - fighter.maxHp);
  const stamGain = Math.max(0, nextMaxStamina - fighter.maxStamina);
  fighter.maxHp = nextMaxHp;
  if (fighter.hp > 0) {
    fighter.hp = Math.min(nextMaxHp, fighter.hp + hpGain);
  }
  fighter.maxStamina = nextMaxStamina;
  fighter.stamina = Math.min(nextMaxStamina, fighter.stamina + stamGain);
  fighter.damageMultiplier = nextDamageMult;
  fighter.decapThresholdBonus = nextDecapBonus;
}

export function createInitialMatch(opts: CreateMatchOptions): MatchState {
  const p1MaxHp = opts.p1MaxHp ?? 100;
  const p1MaxStamina = opts.p1MaxStamina ?? 100;
  const p2MaxHp = opts.p2MaxHp ?? 105;

  const p1 = createFighter(
    'p1',
    opts.p1Name ?? 'KROM',
    'krom',
    p1MaxHp,
    p1MaxStamina,
    opts.p1DamageMult ?? 1,
    opts.p1DecapBonus ?? 0
  );
  if (typeof opts.p1StartHp === 'number') {
    p1.hp = Math.max(35, Math.min(p1MaxHp, Math.round(opts.p1StartHp)));
  }
  if (typeof opts.p1StartRage === 'number') {
    p1.rage = Math.max(0, Math.min(100, Math.round(opts.p1StartRage)));
  }

  return {
    tick: 0,
    stage: opts.stage,
    mode: opts.mode,
    actIndex: opts.actIndex ?? 0,
    round: 1,
    score: opts.initialScore ?? 0,
    bannerText: opts.bannerText ?? 'MANCHE 1 · EN GARDE !',
    bannerTimer: 70,
    freezeFrames: 0,
    screenShake: 0,
    lightningFlash: 0,
    p1,
    p2: createFighter(
      'p2',
      opts.p2Name ?? 'GORGAR',
      opts.p2Skin ?? 'gorgar',
      p2MaxHp,
      100,
      opts.p2DamageMult ?? 1,
      0
    ),
    projectiles: [],
    particles: [],
    impacts: [],
    floorDecals: [],
    severedHead: {
      active: false,
      x: 160,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      rot: 0,
      skin: opts.p2Skin ?? 'gorgar',
    },
    goblin: {
      active: false,
      x: -28,
      phase: 'entering',
      tick: 0,
      targetSide: 'p2',
    },
    roundOver: false,
    matchOver: false,
    winner: null,
    wasDecapitation: false,
  };
}

export function resetForNextRound(
  state: MatchState,
  roundPrefix = 'MANCHE',
  fightWord = 'EN GARDE !'
): void {
  state.round += 1;
  state.roundOver = false;
  state.wasDecapitation = false;
  state.projectiles = [];
  state.particles = [];
  state.impacts = [];
  state.floorDecals = [];
  state.severedHead.active = false;
  state.goblin.active = false;
  state.bannerText = `${roundPrefix} ${state.round} · ${fightWord}`;
  state.bannerTimer = 65;

  const resetF = (f: FighterState, x: number, facing: 1 | -1) => {
    f.x = x;
    f.y = GROUND_Y;
    f.vx = 0;
    f.vy = 0;
    f.facing = facing;
    f.hp = f.maxHp;
    f.stamina = f.maxStamina;
    f.action = 'idle';
    f.actionTick = 0;
    f.actionDuration = 0;
    f.hitApplied = false;
  };

  resetF(state.p1, 88, 1);
  resetF(state.p2, 232, -1);
}

function pushParticles(
  particles: PixelParticle[],
  x: number,
  y: number,
  color: string,
  count: number,
  speed = 4.0,
  dirBias = 0,
  leavesStain = false
): void {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const mag = 0.8 + Math.random() * speed;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * mag * (dirBias !== 0 ? 0.65 : 1) + dirBias * (1.2 + Math.random() * 2.4),
      vy: Math.sin(angle) * mag - (leavesStain ? 1.9 : 1.4),
      color,
      life: 18 + Math.floor(Math.random() * 18),
      maxLife: 36,
      size: Math.random() > 0.45 ? 2 : 3,
      leavesStain,
    });
  }
  if (particles.length > 130) {
    particles.splice(0, particles.length - 130);
  }
}

function spawnParticles(
  state: MatchState,
  x: number,
  y: number,
  color: string,
  count: number,
  speed = 4.0
): void {
  pushParticles(state.particles, x, y, color, count, speed);
}

function pushFloorDecal(
  decals: FloorDecal[],
  x: number,
  w: number,
  kind: FloorDecal['kind'],
  maxCount = 56
): void {
  const jitterY = ((Math.abs(Math.round(x * 7)) + decals.length * 3) % 7) - 1;
  decals.push({
    x: Math.round(x),
    y: GROUND_Y + jitterY,
    w,
    kind,
  });
  if (decals.length > maxCount) {
    decals.splice(0, decals.length - maxCount);
  }
}

function emitWeaponImpact(
  impacts: ImpactEffect[],
  particles: PixelParticle[],
  floorDecals: FloorDecal[],
  x: number,
  y: number,
  dir: 1 | -1,
  kind: ImpactEffectKind,
  goreMode: GoreMode,
  seedTick: number
): void {
  const maxTicks =
    kind === 'decap_fountain'
      ? goreMode === 'gore'
        ? 44
        : goreMode === 'normal'
        ? 26
        : 18
      : kind === 'heavy_cleave' || kind === 'guard_crush'
      ? 14
      : 11;

  impacts.push({
    id: seedTick * 19 + impacts.length,
    x: Math.round(x),
    y: Math.round(y),
    dir,
    kind,
    tick: 0,
    maxTicks,
  });
  if (impacts.length > 16) {
    impacts.splice(0, impacts.length - 16);
  }

  // Steel-on-steel clashes & guard crushes always emit metallic sparks
  if (kind === 'parry_clash') {
    pushParticles(particles, x, y, '#fef08a', 12, 4.2, -dir * 0.4, false);
    pushParticles(particles, x, y, '#38bdf8', 8, 3.8, dir * 0.4, false);
    return;
  }
  if (kind === 'guard_crush') {
    pushParticles(particles, x, y, '#f97316', 16, 4.6, dir * 0.7, false);
    pushParticles(particles, x, y, '#fef08a', 10, 4.0, -dir * 0.3, false);
    return;
  }

  // Soft mode: crisp kinetic golden/cyan sparks & shockburst, zero blood!
  if (goreMode === 'soft') {
    const sparkCount = kind === 'decap_fountain' ? 24 : kind === 'heavy_cleave' ? 16 : 11;
    pushParticles(particles, x, y, '#fef08a', sparkCount, 4.2, dir * 0.7, false);
    pushParticles(particles, x, y, '#38bdf8', Math.ceil(sparkCount * 0.5), 3.6, dir * 0.4, false);
    return;
  }

  // Normal mode: localized blade flash + measured directional crimson spray
  if (goreMode === 'normal') {
    if (kind === 'decap_fountain') {
      pushParticles(particles, x, y, '#ef4444', 18, 4.6, dir * 0.6, true);
      pushParticles(particles, x, y, '#991b1b', 10, 3.8, -dir * 0.2, true);
      pushFloorDecal(floorDecals, x + dir * 8, 12, 'pool');
    } else {
      const count = kind === 'heavy_cleave' ? 14 : 9;
      pushParticles(particles, x, y, '#ef4444', count, 3.8, dir * 0.75, false);
      pushParticles(particles, x, y, '#b91c1c', 4, 3.2, dir * 0.55, true);
    }
    return;
  }

  // Gore mode: visceral arterial arcs, heavy crimson mist, and persistent floor pools/splatters!
  if (kind === 'decap_fountain') {
    pushParticles(particles, x, y, '#ef4444', 26, 5.2, dir * 0.7, true);
    pushParticles(particles, x, y, '#991b1b', 18, 4.4, -dir * 0.25, true);
    pushParticles(particles, x, y - 4, '#fca5a5', 8, 3.6, dir * 0.4, false);
    pushFloorDecal(floorDecals, x, 20, 'pool');
    pushFloorDecal(floorDecals, x + dir * 16, 12, 'splatter');
  } else {
    const baseCount = kind === 'heavy_cleave' ? 20 : 13;
    pushParticles(particles, x, y, '#ef4444', baseCount, 4.4, dir * 0.85, true);
    pushParticles(particles, x, y, '#7f1d1d', Math.ceil(baseCount * 0.6), 3.6, dir * 0.6, true);
    if (kind === 'heavy_cleave') {
      pushFloorDecal(floorDecals, x + dir * 10, 9, 'splatter');
    }
  }
}

function stepImpactsAndParticles(
  impacts: ImpactEffect[],
  particles: PixelParticle[],
  floorDecals: FloorDecal[],
  goreMode: GoreMode,
  maxDecals: number
): void {
  for (let i = impacts.length - 1; i >= 0; i--) {
    const imp = impacts[i];
    imp.tick += 1;
    // Continuous arterial spurt on decapitation in Normal & Gore modes!
    if (
      imp.kind === 'decap_fountain' &&
      goreMode !== 'soft' &&
      imp.tick < (goreMode === 'gore' ? 36 : 18) &&
      imp.tick % (goreMode === 'gore' ? 3 : 5) === 0
    ) {
      pushParticles(
        particles,
        imp.x,
        imp.y + 4,
        imp.tick % 2 === 0 ? '#dc2626' : '#991b1b',
        goreMode === 'gore' ? 4 : 2,
        goreMode === 'gore' ? 3.8 : 2.8,
        imp.dir * 0.35,
        goreMode === 'gore'
      );
    }
    if (imp.tick >= imp.maxTicks) {
      impacts.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.24;
    p.life -= 1;

    if (p.leavesStain && p.y >= GROUND_Y - 1) {
      if (goreMode !== 'soft') {
        pushFloorDecal(
          floorDecals,
          p.x,
          goreMode === 'gore' ? 3 + (Math.abs(Math.round(p.x)) % 5) : 2 + (Math.abs(Math.round(p.x)) % 2),
          goreMode === 'gore' ? 'splatter' : 'drop',
          maxDecals
        );
      }
      particles.splice(i, 1);
      continue;
    }

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function isAttackAction(
  a: FighterAction
): a is 'slash_high' | 'thrust_mid' | 'sweep_low' | 'cleave_overhead' | 'spin_decap' {
  return (
    a === 'slash_high' ||
    a === 'thrust_mid' ||
    a === 'sweep_low' ||
    a === 'cleave_overhead' ||
    a === 'spin_decap'
  );
}

function canInterruptAction(a: FighterAction): boolean {
  return (
    a === 'idle' ||
    a === 'walk_fwd' ||
    a === 'walk_back' ||
    a === 'crouch' ||
    a === 'block_high'
  );
}

function applyFighterInput(
  fighter: FighterState,
  opponent: FighterState | null,
  input: InputState,
  audio?: CombatAudioCallbacks,
  freeFacing = false,
  onStartAttack?: () => void
): void {
  if (
    fighter.action === 'dead' ||
    fighter.action === 'decapitated' ||
    fighter.action === 'victory'
  ) {
    return;
  }

  const dirLeft = input.left || input.joyX < -0.35;
  const dirRight = input.right || input.joyX > 0.35;
  const dirUp = input.up || input.joyY < -0.45;
  const dirDown = input.down || input.joyY > 0.45;

  if (canInterruptAction(fighter.action) && fighter.y >= GROUND_Y) {
    if (freeFacing) {
      if (dirRight && !dirLeft) fighter.facing = 1;
      else if (dirLeft && !dirRight) fighter.facing = -1;
      else if (opponent && (input.btnA || input.btnB || input.btnC || input.btnR1)) {
        fighter.facing = opponent.x >= fighter.x ? 1 : -1;
      }
    } else if (opponent) {
      fighter.facing = opponent.x >= fighter.x ? 1 : -1;
    }
  }

  const movingToward = freeFacing
    ? dirLeft || dirRight
    : (fighter.facing === 1 && dirRight) || (fighter.facing === -1 && dirLeft);
  const movingAway = freeFacing
    ? false
    : (fighter.facing === 1 && dirLeft) || (fighter.facing === -1 && dirRight);

  if (!canInterruptAction(fighter.action)) {
    return;
  }

  let chosenAttack:
    | 'slash_high'
    | 'thrust_mid'
    | 'sweep_low'
    | 'cleave_overhead'
    | 'spin_decap'
    | null = null;

  if (input.btnC) {
    chosenAttack = 'spin_decap';
  } else if (input.btnR1) {
    chosenAttack = 'cleave_overhead';
  } else if (input.btnA) {
    if (movingAway) chosenAttack = 'spin_decap';
    else if (dirDown) chosenAttack = 'sweep_low';
    else if (dirUp) chosenAttack = 'cleave_overhead';
    else if (movingToward) chosenAttack = 'thrust_mid';
    else chosenAttack = 'slash_high';
  } else if (input.btnB && !input.btnL1) {
    chosenAttack = dirUp ? 'cleave_overhead' : 'sweep_low';
  }

  if (chosenAttack) {
    const spec = ATTACK_SPECS[chosenAttack];
    if (fighter.stamina >= Math.min(10, spec.staminaCost)) {
      fighter.stamina = Math.max(0, fighter.stamina - spec.staminaCost);
      fighter.action = chosenAttack;
      fighter.actionTick = 0;
      fighter.actionDuration = spec.duration;
      fighter.hitApplied = false;
      fighter.vx =
        chosenAttack === 'thrust_mid'
          ? fighter.facing * 2.8
          : chosenAttack === 'spin_decap'
          ? fighter.facing * 2.5
          : 0;
      onStartAttack?.();
      audio?.onSwing?.(
        chosenAttack === 'cleave_overhead' || chosenAttack === 'spin_decap'
      );
      return;
    }
  }

  if (input.btnD) {
    if (movingAway && fighter.stamina >= 14) {
      fighter.stamina -= 14;
      fighter.action = 'roll_back';
      fighter.actionTick = 0;
      fighter.actionDuration = 15;
      fighter.vx = -fighter.facing * 4.5;
      audio?.onRoll?.();
      return;
    }
    if (fighter.stamina >= 14) {
      fighter.stamina -= 14;
      fighter.action = 'roll_fwd';
      fighter.actionTick = 0;
      fighter.actionDuration = 16;
      fighter.vx = fighter.facing * 4.8;
      audio?.onRoll?.();
      return;
    }
  }

  if (input.btnL1) {
    if (movingToward && !freeFacing && fighter.stamina >= 16) {
      fighter.stamina -= 16;
      fighter.action = 'roll_fwd';
      fighter.actionTick = 0;
      fighter.actionDuration = 16;
      fighter.vx = fighter.facing * 4.8;
      audio?.onRoll?.();
      return;
    }
    if (fighter.action !== 'block_high') {
      fighter.action = 'block_high';
      fighter.actionTick = 0;
      fighter.actionDuration = 999;
    }
    fighter.vx = 0;
    return;
  } else if (fighter.action === 'block_high') {
    fighter.action = 'idle';
    fighter.actionTick = 0;
  }

  if (dirUp && fighter.y >= GROUND_Y && fighter.stamina >= 10) {
    fighter.stamina -= 10;
    fighter.action = 'jump';
    fighter.actionTick = 0;
    fighter.actionDuration = 24;
    fighter.vy = -8.2;
    fighter.vx = movingToward
      ? fighter.facing * 2.7
      : movingAway
      ? -fighter.facing * 2.2
      : 0;
    audio?.onJump?.();
    return;
  }

  if (dirDown && fighter.y >= GROUND_Y) {
    fighter.action = 'crouch';
    fighter.vx = 0;
    return;
  }

  const analogMag = Math.max(0.65, Math.min(1, Math.abs(input.joyX) || 1));
  if (movingToward) {
    fighter.action = 'walk_fwd';
    fighter.vx = fighter.facing * (freeFacing ? 2.65 : 2.5) * analogMag;
  } else if (movingAway) {
    fighter.action = 'walk_back';
    fighter.vx = -fighter.facing * 1.9 * analogMag;
  } else {
    fighter.action = 'idle';
    fighter.vx = 0;
  }
}

export function computeBossAIInput(
  state: MatchState,
  aggression = 0.55
): InputState {
  const ai = state.p2;
  const target = state.p1;
  const out: InputState = { ...EMPTY_INPUT };

  if (state.roundOver || state.bannerTimer > 35) return out;
  if (!canInterruptAction(ai.action)) return out;

  const dist = Math.abs(target.x - ai.x);
  const towardKey = ai.facing === 1 ? 'right' : 'left';
  const awayKey = ai.facing === 1 ? 'left' : 'right';
  const phase2 = ai.hp < ai.maxHp * 0.55;

  const roll =
    ((state.tick * 37 + Math.floor(ai.x * 5) + ai.hp * 13) % 100) / 100;

  if (
    (ai.skin === 'vorgath' || ai.skin === 'drax') &&
    dist > 88 &&
    ai.stamina >= 28 &&
    state.projectiles.length === 0 &&
    state.tick % (phase2 ? 75 : 115) === 0
  ) {
    ai.stamina -= 24;
    ai.action = 'boss_cast';
    ai.actionTick = 0;
    ai.actionDuration = 24;
    ai.hitApplied = false;
    ai.vx = 0;
    return out;
  }

  if (
    ai.skin === 'drax' &&
    phase2 &&
    (ai.x < 56 || ai.x > 264) &&
    dist < 64 &&
    state.tick % 50 === 0
  ) {
    spawnParticles(state, ai.x, ai.y - 32, '#a855f7', 14, 4.2);
    ai.x = target.x > 160 ? 76 : 244;
    ai.facing = target.x >= ai.x ? 1 : -1;
    spawnParticles(state, ai.x, ai.y - 32, '#ef4444', 14, 4.2);
    return out;
  }

  if (isAttackAction(target.action) && dist < 72) {
    if (target.action === 'spin_decap' && roll < aggression * 0.78) {
      out.down = true;
      return out;
    }
    if (target.action === 'sweep_low' && roll < aggression * 0.65) {
      out.up = true;
      return out;
    }
    if (roll < aggression * 0.62) {
      out.btnL1 = true;
      return out;
    }
  }

  if (dist > 62) {
    if (ai.skin === 'malakor' && dist > 96 && roll < 0.09) {
      out.btnD = true;
      return out;
    }
    if (ai.skin === 'drax' && dist > 96 && roll < 0.08) {
      out.up = true;
      out[towardKey] = true;
      return out;
    }
    out[towardKey] = true;
    return out;
  }

  if (state.tick % Math.max(8, Math.floor(24 - aggression * 14)) === 0) {
    if (target.action === 'block_high' && roll < 0.55) {
      out.down = true;
      out.btnA = true;
    } else if (target.hp < target.maxHp * 0.35 && roll < aggression * 0.45) {
      out.btnC = true;
    } else if (roll < 0.28) {
      out.btnR1 = true;
    } else if (roll < 0.62) {
      out[towardKey] = true;
      out.btnA = true;
    } else {
      out.btnA = true;
    }
  } else if (dist < 32) {
    out[awayKey] = true;
  }

  return out;
}

function stepFighterPhysicsBounds(
  f: FighterState,
  minX: number,
  maxX: number,
  staminaRate = 0.36
): void {
  f.actionTick += 1;

  if (
    f.action === 'idle' ||
    f.action === 'walk_fwd' ||
    f.action === 'walk_back' ||
    f.action === 'crouch'
  ) {
    f.stamina = Math.min(f.maxStamina, f.stamina + staminaRate);
  } else if (f.action === 'block_high') {
    f.stamina = Math.min(f.maxStamina, f.stamina + 0.14);
  }

  f.x += f.vx;
  f.y += f.vy;

  if (f.y < GROUND_Y) {
    f.vy += 0.68;
  }
  if (f.y >= GROUND_Y) {
    f.y = GROUND_Y;
    f.vy = 0;
    if (f.action === 'jump') {
      f.action = 'idle';
      f.vx = 0;
    }
  }

  if (
    f.action !== 'walk_fwd' &&
    f.action !== 'walk_back' &&
    f.action !== 'roll_fwd' &&
    f.action !== 'roll_back' &&
    f.action !== 'jump'
  ) {
    f.vx *= 0.78;
    if (Math.abs(f.vx) < 0.12) f.vx = 0;
  }

  f.x = Math.max(minX, Math.min(maxX, f.x));

  if (
    f.actionDuration > 0 &&
    f.actionTick >= f.actionDuration &&
    f.action !== 'dead' &&
    f.action !== 'decapitated' &&
    f.action !== 'victory' &&
    f.action !== 'block_high'
  ) {
    f.action = 'idle';
    f.actionTick = 0;
    f.actionDuration = 0;
    f.vx = 0;
  }
}

function stepFighterPhysics(
  f: FighterState,
  state: MatchState,
  audio?: CombatAudioCallbacks
): void {
  if (f.action === 'boss_cast' && f.actionTick === 12 && !f.hitApplied) {
    f.hitApplied = true;
    const isVorgath = f.skin === 'vorgath';
    state.projectiles.push({
      id: state.tick + (f.id === 'p1' ? 1 : 2),
      owner: f.id,
      kind: isVorgath ? 'shockwave' : 'dark_orb',
      x: f.x + f.facing * 24,
      y: isVorgath ? GROUND_Y - 6 : GROUND_Y - 32,
      vx: f.facing * (isVorgath ? 4.2 : 5.0),
      damage: isVorgath ? 16 : 19,
      lowOnly: isVorgath,
      tick: 0,
    });
    spawnParticles(
      state,
      f.x + f.facing * 24,
      GROUND_Y - 24,
      isVorgath ? '#f97316' : '#c084fc',
      12,
      3.5
    );
    audio?.onMagicCast?.();
  }

  stepFighterPhysicsBounds(f, ARENA_MIN_X, ARENA_MAX_X, 0.36);
}

function resolveSwordAttack(
  attacker: FighterState,
  defender: FighterState,
  state: MatchState,
  p1Technique: TechniqueId,
  goreMode: GoreMode,
  audio?: CombatAudioCallbacks,
  parryBanner = 'PARADE PARFAITE !',
  decapBanner = 'COUP FATAL · DÉCAPITATION !'
): void {
  if (!isAttackAction(attacker.action) || attacker.hitApplied) return;
  if (defender.action === 'dead' || defender.action === 'decapitated') return;

  const spec = ATTACK_SPECS[attacker.action];
  if (attacker.actionTick < spec.activeStart || attacker.actionTick > spec.activeEnd) {
    return;
  }

  const whirlwindBoost =
    attacker.id === 'p1' &&
    p1Technique === 'whirlwind_edge' &&
    attacker.action === 'spin_decap';
  const effectiveRange = spec.range + (whirlwindBoost ? 10 : 0);

  const dx = (defender.x - attacker.x) * attacker.facing;
  if (dx < -8 || dx > effectiveRange) return;

  if (isAttackAction(defender.action)) {
    const defSpec = ATTACK_SPECS[defender.action];
    if (
      defender.actionTick >= defSpec.activeStart - 2 &&
      defender.actionTick <= defSpec.activeEnd + 2
    ) {
      attacker.hitApplied = true;
      defender.hitApplied = true;
      attacker.vx = -attacker.facing * 4.6;
      defender.vx = -defender.facing * 4.6;
      attacker.action = 'parried_stun';
      attacker.actionTick = 0;
      attacker.actionDuration = 12;
      defender.action = 'parried_stun';
      defender.actionTick = 0;
      defender.actionDuration = 12;
      state.freezeFrames = 4;
      state.screenShake = 5;
      emitWeaponImpact(
        state.impacts,
        state.particles,
        state.floorDecals,
        (attacker.x + defender.x) * 0.5,
        GROUND_Y - 36,
        attacker.facing,
        'parry_clash',
        goreMode,
        state.tick
      );
      audio?.onClash?.(true);
      return;
    }
  }

  if (defender.action === 'roll_fwd' || defender.action === 'roll_back') {
    if (spec.heightZone !== 'low') return;
  }
  if (
    defender.action === 'crouch' &&
    (spec.heightZone === 'high' || spec.heightZone === 'neck')
  ) {
    return;
  }
  if (defender.y < GROUND_Y - 14 && spec.heightZone === 'low') {
    return;
  }
  if (defender.action === 'knockdown') {
    return;
  }

  attacker.hitApplied = true;
  // Exact weapon contact coordinates: clash between crossed blades vs wound on struck target!
  const clashX = attacker.x + attacker.facing * Math.min(28, Math.abs(defender.x - attacker.x) * 0.55);
  const woundX = defender.x - attacker.facing * 5;
  const hitY =
    spec.heightZone === 'low'
      ? GROUND_Y - 13
      : spec.heightZone === 'mid'
      ? GROUND_Y - 30
      : spec.heightZone === 'neck'
      ? GROUND_Y - 46
      : GROUND_Y - 38;

  if (defender.action === 'block_high' && spec.heightZone !== 'low') {
    const isIronRiposte =
      defender.id === 'p1' &&
      p1Technique === 'iron_riposte' &&
      defender.actionTick <= 13;

    const isPerfectParry =
      isIronRiposte ||
      (defender.id === 'p1' ? defender.actionTick <= 6 : defender.actionTick <= 7);

    const skyBreakerCrush =
      attacker.id === 'p1' &&
      p1Technique === 'sky_breaker' &&
      attacker.action === 'cleave_overhead';

    if (skyBreakerCrush) {
      const crushDmg = Math.max(
        8,
        Math.round(spec.damage * attacker.damageMultiplier * 0.58)
      );
      defender.hp = Math.max(1, defender.hp - crushDmg);
      defender.action = 'parried_stun';
      defender.actionTick = 0;
      defender.actionDuration = 24;
      defender.vx = attacker.facing * 5.2;
      attacker.rage = Math.min(100, attacker.rage + 16);
      state.score += 140;
      state.freezeFrames = 6;
      state.screenShake = 7;
      state.bannerText = 'FENDOIR BRISE-GARDE !';
      state.bannerTimer = 46;
      emitWeaponImpact(
        state.impacts,
        state.particles,
        state.floorDecals,
        woundX,
        hitY,
        attacker.facing,
        'guard_crush',
        goreMode,
        state.tick
      );
      audio?.onHit?.(true);
      return;
    }

    if (isPerfectParry) {
      attacker.action = 'parried_stun';
      attacker.actionTick = 0;
      attacker.actionDuration = isIronRiposte ? 30 : 22;
      attacker.vx = -attacker.facing * (isIronRiposte ? 6.2 : 5.0);
      defender.stamina = Math.min(
        defender.maxStamina,
        defender.stamina + (isIronRiposte ? 28 : 22)
      );
      defender.rage = Math.min(100, defender.rage + (isIronRiposte ? 22 : 16));
      emitWeaponImpact(
        state.impacts,
        state.particles,
        state.floorDecals,
        clashX,
        hitY,
        defender.facing,
        'parry_clash',
        goreMode,
        state.tick
      );
      if (isIronRiposte) {
        attacker.hp = Math.max(1, attacker.hp - 12);
        state.score += 180;
        state.screenShake = 5;
        state.bannerText = 'RIPOSTE DE FER ! -12 PV';
        emitWeaponImpact(
          state.impacts,
          state.particles,
          state.floorDecals,
          attacker.x - defender.facing * 5,
          GROUND_Y - 34,
          defender.facing,
          'slash_wound',
          goreMode,
          state.tick + 1
        );
      } else {
        if (defender.id === 'p1') state.score += 120;
        state.bannerText = parryBanner;
      }
      state.freezeFrames = 5;
      state.bannerTimer = 42;
      audio?.onClash?.(true);
      return;
    }

    const chipDmg = Math.max(2, Math.round(spec.damage * attacker.damageMultiplier * 0.15));
    defender.hp = Math.max(1, defender.hp - chipDmg);
    defender.vx = attacker.facing * (spec.knockback * 0.45);
    emitWeaponImpact(
      state.impacts,
      state.particles,
      state.floorDecals,
      clashX,
      hitY,
      attacker.facing,
      'parry_clash',
      goreMode,
      state.tick
    );
    audio?.onClash?.(false);
    return;
  }

  const decapHpRatio =
    0.35 + attacker.decapThresholdBonus + (whirlwindBoost ? 0.1 : 0);
  const canDecapitate =
    attacker.action === 'spin_decap' &&
    (defender.hp / defender.maxHp <= decapHpRatio || attacker.rage >= 92);

  if (canDecapitate) {
    defender.hp = 0;
    // Soft mode performs a clean, bloodless lightning-steel knockout!
    defender.action = goreMode === 'soft' ? 'dead' : 'decapitated';
    defender.actionTick = 0;
    defender.actionDuration = 999;
    defender.vx = 0;
    attacker.rage = 0;
    if (attacker.id === 'p1') {
      state.score += whirlwindBoost ? 1250 : 1000;
    }

    state.wasDecapitation = goreMode !== 'soft';
    state.freezeFrames = 10;
    state.screenShake = goreMode === 'gore' ? 12 : 9;
    state.bannerText =
      goreMode === 'soft'
        ? 'COUP FATAL · ÉCLAIR D’ACIER !'
        : whirlwindBoost
        ? 'MOULINET DU LOUP · FATAL !'
        : decapBanner;
    state.bannerTimer = 110;

    if (goreMode !== 'soft') {
      state.severedHead = {
        active: true,
        x: defender.x,
        y: GROUND_Y - 46,
        vx: attacker.facing * 3.8,
        vy: -6.2,
        rot: 0,
        skin: defender.skin,
      };
    }

    emitWeaponImpact(
      state.impacts,
      state.particles,
      state.floorDecals,
      defender.x,
      GROUND_Y - 44,
      attacker.facing,
      'decap_fountain',
      goreMode,
      state.tick
    );
    audio?.onDecapitate?.();
    finishRound(state, attacker.id, audio);
    return;
  }

  const skyBreakerDirect =
    attacker.id === 'p1' &&
    p1Technique === 'sky_breaker' &&
    attacker.action === 'cleave_overhead';

  const techDamageMult = skyBreakerDirect ? 1.22 : whirlwindBoost ? 1.15 : 1;
  const rawDamage = Math.round(spec.damage * attacker.damageMultiplier * techDamageMult);
  defender.hp = Math.max(0, defender.hp - rawDamage);
  attacker.rage = Math.min(100, attacker.rage + 16);
  defender.rage = Math.min(100, defender.rage + 10);
  defender.vx = attacker.facing * (spec.knockback * (skyBreakerDirect ? 0.72 : 0.55));
  if (attacker.id === 'p1') {
    state.score += skyBreakerDirect || whirlwindBoost ? 100 : 75;
  }

  const impactKind: ImpactEffectKind =
    attacker.action === 'thrust_mid'
      ? 'pierce_thrust'
      : attacker.action === 'cleave_overhead' || attacker.action === 'spin_decap'
      ? 'heavy_cleave'
      : 'slash_wound';

  state.freezeFrames =
    attacker.action === 'cleave_overhead' || attacker.action === 'spin_decap' ? 4 : 2;
  state.screenShake = skyBreakerDirect ? 8 : attacker.action === 'cleave_overhead' ? 6 : 3;
  emitWeaponImpact(
    state.impacts,
    state.particles,
    state.floorDecals,
    woundX,
    hitY,
    attacker.facing,
    impactKind,
    goreMode,
    state.tick
  );
  audio?.onHit?.(rawDamage >= 20);

  if (defender.hp <= 0) {
    defender.action = 'dead';
    defender.actionTick = 0;
    defender.actionDuration = 999;
    if (attacker.id === 'p1') {
      state.score += 450;
    }
    audio?.onKnockdown?.();
    finishRound(state, attacker.id, audio);
  } else if (spec.causesKnockdown) {
    defender.action = 'knockdown';
    defender.actionTick = 0;
    defender.actionDuration = 24;
    audio?.onKnockdown?.();
  } else {
    defender.action = 'hit_stun';
    defender.actionTick = 0;
    defender.actionDuration = 13;
  }
}

function finishRound(
  state: MatchState,
  roundWinner: 'p1' | 'p2',
  audio?: CombatAudioCallbacks
): void {
  if (state.roundOver) return;
  state.roundOver = true;

  const winnerFighter = roundWinner === 'p1' ? state.p1 : state.p2;
  winnerFighter.roundsWon += 1;
  winnerFighter.action = 'victory';
  winnerFighter.actionTick = 0;
  winnerFighter.vx = 0;

  state.goblin = {
    active: true,
    x: roundWinner === 'p1' ? NATIVE_WIDTH + 24 : -24,
    phase: 'entering',
    tick: 0,
    targetSide: roundWinner === 'p1' ? 'p2' : 'p1',
  };

  if (winnerFighter.roundsWon >= 2) {
    state.matchOver = true;
    state.winner = roundWinner;
    if (!state.wasDecapitation) {
      state.bannerText = `${winnerFighter.name} !`;
      state.bannerTimer = 120;
    }
  } else if (!state.wasDecapitation) {
    state.bannerText = `${winnerFighter.name}`;
    state.bannerTimer = 95;
  }

  audio?.onRoundEnd?.(roundWinner === 'p1');
}

function stepProjectilesAndEffects(
  state: MatchState,
  goreMode: GoreMode,
  audio?: CombatAudioCallbacks
): void {
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const proj = state.projectiles[i];
    proj.x += proj.vx;
    proj.tick += 1;

    const target = proj.owner === 'p1' ? state.p2 : state.p1;
    if (
      target.action !== 'dead' &&
      target.action !== 'decapitated' &&
      Math.abs(proj.x - target.x) < 18
    ) {
      const jumpedOver = proj.lowOnly && target.y < GROUND_Y - 14;
      const rolledThrough =
        !proj.lowOnly &&
        (target.action === 'roll_fwd' || target.action === 'roll_back');

      if (!jumpedOver && !rolledThrough) {
        const projDir: 1 | -1 = proj.vx >= 0 ? 1 : -1;
        if (target.action === 'block_high' && !proj.lowOnly) {
          target.hp = Math.max(1, target.hp - 4);
          emitWeaponImpact(
            state.impacts,
            state.particles,
            state.floorDecals,
            proj.x,
            proj.y,
            projDir,
            'parry_clash',
            goreMode,
            state.tick
          );
          audio?.onClash?.(false);
        } else {
          target.hp = Math.max(0, target.hp - proj.damage);
          target.action = target.hp <= 0 ? 'dead' : 'hit_stun';
          target.actionTick = 0;
          target.actionDuration = target.hp <= 0 ? 999 : 14;
          state.screenShake = 5;
          emitWeaponImpact(
            state.impacts,
            state.particles,
            state.floorDecals,
            target.x - projDir * 4,
            proj.y,
            projDir,
            'heavy_cleave',
            goreMode,
            state.tick
          );
          audio?.onHit?.(true);
          if (target.hp <= 0) {
            finishRound(state, proj.owner, audio);
          }
        }
        state.projectiles.splice(i, 1);
        continue;
      }
    }

    if (proj.x < -20 || proj.x > NATIVE_WIDTH + 20) {
      state.projectiles.splice(i, 1);
    }
  }

  if (state.severedHead.active) {
    const h = state.severedHead;
    h.x += h.vx;
    h.y += h.vy;
    h.vy += 0.52;
    h.rot += h.vx * 0.25;
    if (h.y >= GROUND_Y - 6) {
      h.y = GROUND_Y - 6;
      if (Math.abs(h.vy) > 1.5 && goreMode === 'gore') {
        pushFloorDecal(state.floorDecals, h.x, 6, 'splatter');
      }
      h.vy = -h.vy * 0.45;
      h.vx *= 0.72;
      if (Math.abs(h.vy) < 0.7) h.vy = 0;
    }
    h.x = Math.max(16, Math.min(NATIVE_WIDTH - 16, h.x));
  }

  if (state.goblin.active) {
    const g = state.goblin;
    const fallen = g.targetSide === 'p1' ? state.p1 : state.p2;
    g.tick += 1;

    if (g.phase === 'entering') {
      const dir = fallen.x > g.x ? 1 : -1;
      g.x += dir * 2.6;
      if (Math.abs(g.x - fallen.x) < 18) {
        g.phase = 'laughing';
        g.tick = 0;
        audio?.onGoblinLaugh?.();
      }
    } else if (g.phase === 'laughing') {
      if (g.tick > 28) {
        g.phase = 'dragging';
        g.tick = 0;
      }
    } else if (g.phase === 'dragging') {
      const exitDir = fallen.x > 160 ? 1 : -1;
      g.x += exitDir * 1.8;
      fallen.x += exitDir * 1.8;
      if (state.severedHead.active && Math.abs(g.x - state.severedHead.x) < 18) {
        state.severedHead.vx = exitDir * 4.8;
        state.severedHead.vy = -3.4;
      }
      if (g.x < -36 || g.x > NATIVE_WIDTH + 36) {
        g.phase = 'done';
      }
    }
  }

  stepImpactsAndParticles(
    state.impacts,
    state.particles,
    state.floorDecals,
    goreMode,
    56
  );
}

export function stepMatch(
  state: MatchState,
  p1Input: InputState,
  p2Input: InputState,
  p1Technique: TechniqueId = 'whirlwind_edge',
  audio?: CombatAudioCallbacks,
  parryBanner?: string,
  decapBanner?: string,
  goreMode: GoreMode = 'normal'
): void {
  state.tick += 1;
  if (state.bannerTimer > 0) state.bannerTimer -= 1;
  if (state.screenShake > 0) state.screenShake -= 1;

  if (state.stage === 'sanctuary' && state.tick % 190 === 40) {
    state.lightningFlash = 6;
    audio?.onThunder?.();
  } else if (state.lightningFlash > 0) {
    state.lightningFlash -= 1;
  }

  if (state.freezeFrames > 0) {
    state.freezeFrames -= 1;
    return;
  }

  if (!state.roundOver) {
    applyFighterInput(state.p1, state.p2, p1Input, audio, false);
    applyFighterInput(state.p2, state.p1, p2Input, audio, false);
  }

  stepFighterPhysics(state.p1, state, audio);
  stepFighterPhysics(state.p2, state, audio);

  const rolling =
    state.p1.action === 'roll_fwd' ||
    state.p2.action === 'roll_fwd' ||
    state.roundOver;
  const minDist = 26;
  const gap = state.p2.x - state.p1.x;
  if (!rolling && Math.abs(gap) < minDist) {
    const push = (minDist - Math.abs(gap)) * 0.5;
    if (gap >= 0) {
      state.p1.x = Math.max(ARENA_MIN_X, state.p1.x - push);
      state.p2.x = Math.min(ARENA_MAX_X, state.p2.x + push);
    } else {
      state.p1.x = Math.min(ARENA_MAX_X, state.p1.x + push);
      state.p2.x = Math.max(ARENA_MIN_X, state.p2.x - push);
    }
  }

  if (!state.roundOver) {
    resolveSwordAttack(
      state.p1,
      state.p2,
      state,
      p1Technique,
      goreMode,
      audio,
      parryBanner,
      decapBanner
    );
    resolveSwordAttack(
      state.p2,
      state.p1,
      state,
      'whirlwind_edge',
      goreMode,
      audio,
      parryBanner,
      decapBanner
    );
  }

  stepProjectilesAndEffects(state, goreMode, audio);
}

// ============================================================================
// SIDE-SCROLLING ZONE TRAVERSAL ENGINE (Double Dragon / Golden Axe Style!)
// ============================================================================
export interface CreateZoneOptions {
  stage: StageId;
  actIndex: number;
  zoneTitle: string;
  waves: ZoneWaveEnemySpec[];
  initialScore?: number;
  p1MaxHp: number;
  p1MaxStamina: number;
  p1DamageMult: number;
  p1DecapBonus: number;
}

export function createZoneTraversal(opts: CreateZoneOptions): ZoneTraversalState {
  const p1 = createFighter(
    'p1',
    'KROM',
    'krom',
    opts.p1MaxHp,
    opts.p1MaxStamina,
    opts.p1DamageMult,
    opts.p1DecapBonus
  );
  p1.x = 58;
  p1.facing = 1;

  return {
    stage: opts.stage,
    actIndex: opts.actIndex,
    zoneTitle: opts.zoneTitle,
    tick: 0,
    worldWidth: ZONE_WORLD_WIDTH,
    cameraX: 0,
    lockX: ZONE_WORLD_WIDTH,
    goArrowTimer: 60,
    p1,
    alreadyHitUids: [],
    enemies: [],
    pendingWaves: opts.waves.map((w) => ({ ...w })),
    pickups: [],
    floatingTexts: [],
    particles: [],
    impacts: [],
    floorDecals: [],
    freezeFrames: 0,
    screenShake: 0,
    lightningFlash: 0,
    score: opts.initialScore ?? 0,
    shardsCollected: 0,
    decapCount: 0,
    comboCount: 0,
    comboTimer: 0,
    slainCount: 0,
    totalEnemies: opts.waves.length,
    zoneCompleted: false,
    playerDefeated: false,
    bannerText: opts.zoneTitle.toUpperCase(),
    bannerTimer: 75,
  };
}

function addFloatingScore(
  zone: ZoneTraversalState,
  x: number,
  y: number,
  text: string,
  color: string
): void {
  zone.floatingTexts.push({
    id: zone.tick * 17 + zone.floatingTexts.length,
    x,
    y,
    text,
    color,
    life: 44,
  });
}

function spawnWaveMinion(zone: ZoneTraversalState, spec: ZoneWaveEnemySpec, uid: number): void {
  const stats = MINION_COMBAT_SPECS[spec.skin];
  const f = createFighter(
    'p2',
    stats.shortName,
    spec.skin,
    stats.hp,
    80,
    stats.damageMultiplier,
    0
  );
  f.x = Math.max(zone.cameraX + NATIVE_WIDTH + 16, spec.spawnX);
  f.facing = -1;
  zone.enemies.push({
    uid,
    fighter: f,
    scoreValue: stats.scoreValue,
    aggression: stats.aggression,
    moveSpeed: stats.moveSpeed,
    attackCooldown: 32 + (uid % 2) * 24,
    gateX: spec.gateX,
    dropKind: spec.dropKind,
    despawnTimer: 0,
  });
}

export function stepZoneTraversal(
  zone: ZoneTraversalState,
  p1Input: InputState,
  p1Technique: TechniqueId = 'whirlwind_edge',
  audio?: CombatAudioCallbacks,
  clearBannerText = 'VOIE LIBRE · AVANCEZ VERS L’ARÈNE !',
  goreMode: GoreMode = 'normal'
): void {
  zone.tick += 1;
  if (zone.bannerTimer > 0) zone.bannerTimer -= 1;
  if (zone.screenShake > 0) zone.screenShake -= 1;
  if (zone.goArrowTimer > 0) zone.goArrowTimer -= 1;

  if (zone.comboTimer > 0) {
    zone.comboTimer -= 1;
    if (zone.comboTimer === 0) zone.comboCount = 0;
  }

  if (zone.stage === 'sanctuary' && zone.tick % 180 === 50) {
    zone.lightningFlash = 5;
    audio?.onThunder?.();
  } else if (zone.lightningFlash > 0) {
    zone.lightningFlash -= 1;
  }

  if (zone.freezeFrames > 0) {
    zone.freezeFrames -= 1;
    return;
  }

  // Spawn pending minions when Krom advances past triggerX (at most 2 living minions on screen at once for clean arcade pacing!)
  const livingEnemies = zone.enemies.filter(
    (e) => e.fighter.action !== 'dead' && e.fighter.action !== 'decapitated'
  );

  if (livingEnemies.length < 2 && zone.pendingWaves.length > 0) {
    const nextWave = zone.pendingWaves[0];
    if (zone.p1.x >= nextWave.triggerX || zone.cameraX >= nextWave.triggerX - 40) {
      zone.pendingWaves.shift();
      const uid = zone.totalEnemies - zone.pendingWaves.length;
      spawnWaveMinion(zone, nextWave, uid);
    }
  }

  // Recompute active wave gate lockX
  const activeLiving = zone.enemies.filter(
    (e) => e.fighter.action !== 'dead' && e.fighter.action !== 'decapitated'
  );
  if (activeLiving.length > 0) {
    zone.lockX = Math.min(...activeLiving.map((e) => e.gateX));
  } else if (zone.pendingWaves.length > 0) {
    zone.lockX = ZONE_WORLD_WIDTH;
  } else {
    zone.lockX = ZONE_WORLD_WIDTH;
  }

  // Nearest living enemy for auto-facing on neutral attack
  let nearestEnemy: FighterState | null = null;
  let nearestDist = 9999;
  for (const inst of activeLiving) {
    const d = Math.abs(inst.fighter.x - zone.p1.x);
    if (d < nearestDist) {
      nearestDist = d;
      nearestEnemy = inst.fighter;
    }
  }

  if (!zone.playerDefeated && !zone.zoneCompleted) {
    applyFighterInput(zone.p1, nearestEnemy, p1Input, audio, true, () => {
      zone.alreadyHitUids = [];
    });
  }

  const minPlayerX = Math.max(24, zone.cameraX + 20);
  const maxPlayerX = Math.min(ZONE_WORLD_WIDTH - 20, zone.lockX);
  stepFighterPhysicsBounds(zone.p1, minPlayerX, maxPlayerX, 0.48);

  // Smooth horizontal camera tracking (clamped by lockX)
  const targetCamX = Math.max(
    0,
    Math.min(ZONE_WORLD_WIDTH - NATIVE_WIDTH, Math.min(zone.lockX - NATIVE_WIDTH, zone.p1.x - 112))
  );
  if (targetCamX > zone.cameraX) {
    zone.cameraX = Math.min(targetCamX, zone.cameraX + 2.8);
  }

  // Step Minion AI (Double Dragon etiquette: only the closest minion attacks while the 2nd circles!)
  let attackerAssigned = false;
  const sortedByProximity = [...activeLiving].sort(
    (a, b) => Math.abs(a.fighter.x - zone.p1.x) - Math.abs(b.fighter.x - zone.p1.x)
  );

  for (const inst of sortedByProximity) {
    const m = inst.fighter;
    if (inst.attackCooldown > 0) inst.attackCooldown = Math.max(0, inst.attackCooldown - 1);

    const aiInput: InputState = { ...EMPTY_INPUT };
    if (!zone.playerDefeated && canInterruptAction(m.action)) {
      m.facing = zone.p1.x >= m.x ? 1 : -1;
      const dist = Math.abs(zone.p1.x - m.x);
      const towardKey = m.facing === 1 ? 'right' : 'left';
      const awayKey = m.facing === 1 ? 'left' : 'right';

      if (!attackerAssigned) {
        attackerAssigned = true;
        if (dist > 48) {
          aiInput[towardKey] = true;
          m.action = 'walk_fwd';
          m.vx = m.facing * inst.moveSpeed;
        } else if (inst.attackCooldown <= 0) {
          const r = (zone.tick * 19 + inst.uid * 31) % 100;
          if (r < 22 && inst.aggression > 0.26) {
            aiInput.btnL1 = true;
          } else {
            aiInput.btnA = true;
          }
          inst.attackCooldown = Math.max(36, Math.round(68 - inst.aggression * 60));
        } else if (dist < 28) {
          aiInput[awayKey] = true;
        }
      } else {
        // Flanking minion waits patiently at ~82px distance!
        if (dist > 92) {
          aiInput[towardKey] = true;
        } else if (dist < 68) {
          aiInput[awayKey] = true;
        }
      }

      applyFighterInput(m, zone.p1, aiInput, audio, false);
      if (m.action === 'walk_fwd') {
        m.vx = m.facing * inst.moveSpeed;
      }
    }

    stepFighterPhysicsBounds(m, Math.max(16, zone.cameraX - 24), ZONE_WORLD_WIDTH + 48, 0.35);
  }

  // Resolve Krom's sword attacks against ALL living minions in sword reach!
  if (isAttackAction(zone.p1.action) && !zone.playerDefeated) {
    const spec = ATTACK_SPECS[zone.p1.action];
    if (zone.p1.actionTick >= spec.activeStart && zone.p1.actionTick <= spec.activeEnd) {
      for (const inst of activeLiving) {
        if (zone.alreadyHitUids.includes(inst.uid)) continue;
        const def = inst.fighter;
        const whirlwindZone =
          p1Technique === 'whirlwind_edge' && zone.p1.action === 'spin_decap';
        const skyBreakerZone =
          p1Technique === 'sky_breaker' && zone.p1.action === 'cleave_overhead';

        // Spin decap hits in BOTH directions around Krom (360° blade arc!)
        const dx =
          zone.p1.action === 'spin_decap'
            ? Math.abs(def.x - zone.p1.x)
            : (def.x - zone.p1.x) * zone.p1.facing;
        const minDx = zone.p1.action === 'spin_decap' ? 0 : -12;
        if (dx < minDx || dx > spec.range + (whirlwindZone ? 14 : 6)) continue;

        zone.alreadyHitUids.push(inst.uid);
        const strikeDir: 1 | -1 = def.x >= zone.p1.x ? 1 : -1;
        const woundX = def.x - strikeDir * 5;
        const clashX = (zone.p1.x + def.x) * 0.5;
        const hitY =
          spec.heightZone === 'low'
            ? GROUND_Y - 13
            : spec.heightZone === 'mid'
            ? GROUND_Y - 30
            : spec.heightZone === 'neck'
            ? GROUND_Y - 46
            : GROUND_Y - 36;

        if (
          def.action === 'block_high' &&
          spec.heightZone !== 'low' &&
          zone.p1.action !== 'cleave_overhead'
        ) {
          def.action = 'parried_stun';
          def.actionTick = 0;
          def.actionDuration = 14;
          def.vx = strikeDir * 4.5;
          emitWeaponImpact(
            zone.impacts,
            zone.particles,
            zone.floorDecals,
            clashX,
            hitY,
            strikeDir,
            'parry_clash',
            goreMode,
            zone.tick
          );
          audio?.onClash?.(false);
          continue;
        }

        const techMult = skyBreakerZone ? 1.25 : whirlwindZone ? 1.15 : 1;
        const rawDamage = Math.round(spec.damage * zone.p1.damageMultiplier * techMult);
        const lethalSpin =
          zone.p1.action === 'spin_decap' &&
          (def.hp - rawDamage <= 0 ||
            def.hp / def.maxHp <= 0.68 + zone.p1.decapThresholdBonus + (whirlwindZone ? 0.12 : 0) ||
            zone.p1.rage >= 75);

        zone.comboCount += 1;
        zone.comboTimer = 135;
        const comboMult = Math.min(3, 1 + Math.floor((zone.comboCount - 1) / 3) * 0.5);

        if (lethalSpin) {
          def.hp = 0;
          def.action = goreMode === 'soft' ? 'dead' : 'decapitated';
          def.actionTick = 0;
          def.actionDuration = 999;
          def.vx = 0;
          zone.p1.rage = Math.min(100, zone.p1.rage + 14);
          if (goreMode !== 'soft') {
            zone.decapCount += 1;
          }
          zone.slainCount += 1;

          const pts = Math.round((inst.scoreValue + (whirlwindZone ? 350 : 300)) * comboMult);
          zone.score += pts;
          zone.freezeFrames = 6;
          zone.screenShake = goreMode === 'gore' ? 9 : 7;
          addFloatingScore(
            zone,
            def.x,
            GROUND_Y - 58,
            whirlwindZone ? `MOULINET +${pts}` : `FATAL +${pts}`,
            '#fef08a'
          );
          emitWeaponImpact(
            zone.impacts,
            zone.particles,
            zone.floorDecals,
            def.x,
            GROUND_Y - 44,
            strikeDir,
            'decap_fountain',
            goreMode,
            zone.tick
          );
          audio?.onDecapitate?.();
        } else {
          def.hp = Math.max(0, def.hp - rawDamage);
          zone.p1.rage = Math.min(100, zone.p1.rage + 12);
          def.vx = strikeDir * (spec.knockback * 0.65);
          zone.freezeFrames = skyBreakerZone ? 4 : 2;
          zone.screenShake = skyBreakerZone ? 5 : 3;
          const zoneImpactKind: ImpactEffectKind =
            zone.p1.action === 'thrust_mid'
              ? 'pierce_thrust'
              : zone.p1.action === 'cleave_overhead' || zone.p1.action === 'spin_decap'
              ? 'heavy_cleave'
              : 'slash_wound';
          emitWeaponImpact(
            zone.impacts,
            zone.particles,
            zone.floorDecals,
            woundX,
            hitY,
            strikeDir,
            zoneImpactKind,
            goreMode,
            zone.tick
          );
          audio?.onHit?.(rawDamage >= 20);

          if (def.hp <= 0) {
            def.action = 'dead';
            def.actionTick = 0;
            def.actionDuration = 999;
            zone.slainCount += 1;
            const pts = Math.round(inst.scoreValue * comboMult);
            zone.score += pts;
            addFloatingScore(
              zone,
              def.x,
              GROUND_Y - 52,
              skyBreakerZone ? `BRISE-GARDE +${pts}` : `+${pts}`,
              '#fbbf24'
            );
            audio?.onKnockdown?.();
          } else {
            def.action = spec.causesKnockdown || skyBreakerZone ? 'knockdown' : 'hit_stun';
            def.actionTick = 0;
            def.actionDuration = spec.causesKnockdown || skyBreakerZone ? 22 : 15;
            zone.score += 25;
          }
        }

        // Spawn pickup if this slain minion carried supplies or steel shards!
        if (def.hp <= 0 && inst.dropKind) {
          zone.pickups.push({
            id: zone.tick * 13 + inst.uid,
            kind: inst.dropKind,
            x: Math.max(36, Math.min(ZONE_WORLD_WIDTH - 36, def.x)),
            y: GROUND_Y - 18,
            vy: -3.6,
            collected: false,
            tick: 0,
          });
        }
      }
    }
  }

  // Resolve Minion attacks against Krom (low, fair damage!)
  for (const inst of activeLiving) {
    const m = inst.fighter;
    if (!isAttackAction(m.action) || m.hitApplied || zone.playerDefeated) continue;
    const spec = ATTACK_SPECS[m.action];
    if (m.actionTick < spec.activeStart || m.actionTick > spec.activeEnd) continue;

    const dx = (zone.p1.x - m.x) * m.facing;
    if (dx < -6 || dx > spec.range - 6) continue;
    if (zone.p1.action === 'roll_fwd' || zone.p1.action === 'roll_back') continue;
    if (zone.p1.action === 'crouch' && spec.heightZone === 'high') continue;
    if (zone.p1.y < GROUND_Y - 14 && spec.heightZone === 'low') continue;

    m.hitApplied = true;
    const clashX = (m.x + zone.p1.x) * 0.5;

    if (zone.p1.action === 'block_high' && spec.heightZone !== 'low') {
      const isRiposte = p1Technique === 'iron_riposte' && zone.p1.actionTick <= 14;
      const perfect = isRiposte || zone.p1.actionTick <= 8;
      if (perfect) {
        m.action = 'parried_stun';
        m.actionTick = 0;
        m.actionDuration = isRiposte ? 30 : 24;
        m.vx = -m.facing * (isRiposte ? 5.8 : 4.5);
        zone.p1.stamina = Math.min(zone.p1.maxStamina, zone.p1.stamina + (isRiposte ? 28 : 20));
        zone.p1.rage = Math.min(100, zone.p1.rage + (isRiposte ? 20 : 15));

        emitWeaponImpact(
          zone.impacts,
          zone.particles,
          zone.floorDecals,
          clashX,
          GROUND_Y - 36,
          zone.p1.facing,
          'parry_clash',
          goreMode,
          zone.tick
        );

        if (isRiposte) {
          m.hp = Math.max(0, m.hp - 14);
          zone.score += 140;
          addFloatingScore(zone, zone.p1.x, GROUND_Y - 56, 'RIPOSTE -14 PV', '#38bdf8');
          emitWeaponImpact(
            zone.impacts,
            zone.particles,
            zone.floorDecals,
            m.x - zone.p1.facing * 5,
            GROUND_Y - 34,
            zone.p1.facing,
            'slash_wound',
            goreMode,
            zone.tick + 1
          );
          if (m.hp <= 0) {
            m.action = 'dead';
            m.actionTick = 0;
            m.actionDuration = 999;
            zone.slainCount += 1;
            zone.score += inst.scoreValue;
            addFloatingScore(zone, m.x, GROUND_Y - 46, `+${inst.scoreValue}`, '#fbbf24');
          }
        } else {
          zone.score += 80;
          addFloatingScore(zone, zone.p1.x, GROUND_Y - 56, 'PARADE +80', '#38bdf8');
        }
        audio?.onClash?.(true);
      } else {
        zone.p1.hp = Math.max(1, zone.p1.hp - 2);
        emitWeaponImpact(
          zone.impacts,
          zone.particles,
          zone.floorDecals,
          clashX,
          GROUND_Y - 36,
          m.facing,
          'parry_clash',
          goreMode,
          zone.tick
        );
        audio?.onClash?.(false);
      }
      continue;
    }

    const dmg = Math.max(4, Math.round(spec.damage * m.damageMultiplier));
    zone.p1.hp = Math.max(0, zone.p1.hp - dmg);
    zone.p1.rage = Math.min(100, zone.p1.rage + 12);
    zone.comboCount = 0;
    zone.screenShake = 3;
    emitWeaponImpact(
      zone.impacts,
      zone.particles,
      zone.floorDecals,
      zone.p1.x - m.facing * 5,
      GROUND_Y - 34,
      m.facing,
      'slash_wound',
      goreMode,
      zone.tick
    );
    audio?.onHit?.(false);

    if (zone.p1.hp <= 0) {
      zone.p1.action = 'dead';
      zone.p1.actionTick = 0;
      zone.p1.actionDuration = 999;
      zone.playerDefeated = true;
      audio?.onRoundEnd?.(false);
    } else {
      zone.p1.action = 'hit_stun';
      zone.p1.actionTick = 0;
      zone.p1.actionDuration = 10;
    }
  }

  // Step fallen corpses & trigger "AVANCEZ >>" prompt when wave clears
  let anyJustCleared = false;
  for (let i = zone.enemies.length - 1; i >= 0; i--) {
    const inst = zone.enemies[i];
    if (inst.fighter.action === 'dead' || inst.fighter.action === 'decapitated') {
      inst.fighter.actionTick += 1;
      inst.despawnTimer += 1;
      if (inst.despawnTimer === 12) {
        anyJustCleared = true;
      }
      if (inst.despawnTimer > 95) {
        zone.enemies.splice(i, 1);
      }
    }
  }

  const remainingAlive = zone.enemies.some(
    (e) => e.fighter.action !== 'dead' && e.fighter.action !== 'decapitated'
  );
  if (anyJustCleared && !remainingAlive) {
    zone.goArrowTimer = 140;
    if (zone.pendingWaves.length === 0) {
      zone.bannerText = clearBannerText;
      zone.bannerTimer = 110;
    }
  }

  // Step Pickups (Roast Meat +32 PV & Steel Shards +5 Shards/+120 PTS)
  for (const pk of zone.pickups) {
    if (pk.collected) continue;
    pk.tick += 1;
    pk.y += pk.vy;
    if (pk.y < GROUND_Y - 4) {
      pk.vy += 0.35;
    } else {
      pk.y = GROUND_Y - 4;
      pk.vy = 0;
    }

    if (Math.abs(zone.p1.x - pk.x) < 22 && !zone.playerDefeated) {
      pk.collected = true;
      if (pk.kind === 'meat_heal') {
        const heal = 32;
        zone.p1.hp = Math.min(zone.p1.maxHp, zone.p1.hp + heal);
        zone.score += 100;
        addFloatingScore(zone, pk.x, GROUND_Y - 46, `+${heal} PV`, '#4ade80');
      } else {
        zone.shardsCollected += 6;
        zone.score += 150;
        addFloatingScore(zone, pk.x, GROUND_Y - 46, '+6 ÉCLATS', '#38bdf8');
      }
      pushParticles(zone.particles, pk.x, GROUND_Y - 12, '#fde047', 10, 3.0);
      audio?.onClash?.(true);
    }
  }

  // Floating score popups, localized impact effects & floor decals
  for (let i = zone.floatingTexts.length - 1; i >= 0; i--) {
    const ft = zone.floatingTexts[i];
    ft.y -= 0.45;
    ft.life -= 1;
    if (ft.life <= 0) zone.floatingTexts.splice(i, 1);
  }

  stepImpactsAndParticles(
    zone.impacts,
    zone.particles,
    zone.floorDecals,
    goreMode,
    80
  );

  // Check Boss Gate arrival at far right of the 960px zone!
  if (
    !remainingAlive &&
    zone.pendingWaves.length === 0 &&
    zone.p1.x >= ZONE_WORLD_WIDTH - 48 &&
    !zone.zoneCompleted
  ) {
    zone.zoneCompleted = true;
    zone.score += 500;
    // Warrior's Second Wind before entering the Boss Arena (+35% HP restored!)
    zone.p1.hp = Math.min(zone.p1.maxHp, zone.p1.hp + Math.round(zone.p1.maxHp * 0.35));
    zone.p1.stamina = zone.p1.maxStamina;
    audio?.onRoundEnd?.(true);
  }
}
