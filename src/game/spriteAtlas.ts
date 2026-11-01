import type { FighterAction, FighterSkin, FighterState, MinionSkin, StageId } from '../types/game';
import {
  DECOR_ANIM_COORDS,
  DRAX_COORDS,
  GOBLIN_FX_COORDS,
  GORGAR_COORDS,
  MALAKOR_COORDS,
  MINIONS_COORDS,
  RIVAL_COORDS,
  VERIFIED_SHEET_META,
  VORGATH_COORDS,
  type VerifiedSpriteBox,
} from './atlasCoords';
import {
  BAELGOR_COORDS,
  MONSTERS11_COORDS,
  NEW_SHEET_META,
  THALGRIM_COORDS,
} from './newAtlasCoords';

export type SheetKey =
  | 'kromHero'
  | 'heroPortrait'
  | 'rivalAka'
  | 'gorgarBoss'
  | 'thalgrimBoss'
  | 'vorgathBoss'
  | 'malakorBoss'
  | 'baelgorBoss'
  | 'draxBoss'
  | 'minionsSheet'
  | 'monsters11Sheet'
  | 'goblinAndFx'
  | 'decorAnim';

export interface SpriteFrameDef {
  sheet: SheetKey;
  x: number;
  y: number;
  w: number;
  h: number;
  ax: number; // Horizontal body anchor from left edge of frame (facing right)
  oy?: number;
}

const SHEET_CACHE_REV = 'v16';

export const SHEET_URLS: Record<SheetKey, string> = {
  kromHero: `/sheets/planche_j1_krom.png?${SHEET_CACHE_REV}`,
  heroPortrait: '/assets/aistudio/barbare_planche__1_1_ac713612.png',
  rivalAka: `/sheets/planche_j2_rival_aka.png?${SHEET_CACHE_REV}`,
  gorgarBoss: `/sheets/planche_boss1_gorgar.png?${SHEET_CACHE_REV}`,
  thalgrimBoss: `/sheets/planche_boss_thalgrim.png?${SHEET_CACHE_REV}`,
  vorgathBoss: `/sheets/planche_boss2_vorgath.png?${SHEET_CACHE_REV}`,
  malakorBoss: `/sheets/planche_boss3_malakor.png?${SHEET_CACHE_REV}`,
  baelgorBoss: `/sheets/planche_boss_baelgor.png?${SHEET_CACHE_REV}`,
  draxBoss: `/sheets/planche_boss4_seigneur_drax.png?${SHEET_CACHE_REV}`,
  minionsSheet: `/sheets/planche_sbires_zones.png?${SHEET_CACHE_REV}`,
  monsters11Sheet: `/sheets/planche_11_monstres.png?${SHEET_CACHE_REV}`,
  goblinAndFx: `/sheets/planche_gobelin_et_animations.png?${SHEET_CACHE_REV}`,
  decorAnim: `/sheets/planche_decors_animes.png?${SHEET_CACHE_REV}`,
};

function box(sheet: SheetKey, b: VerifiedSpriteBox, oy = 0): SpriteFrameDef {
  return oy !== 0
    ? { sheet, x: b.x, y: b.y, w: b.w, h: b.h, ax: b.ax, oy }
    : { sheet, x: b.x, y: b.y, w: b.w, h: b.h, ax: b.ax };
}

// ============================================================================
// 1. JOUEUR 1 — KROM LE BARBARE (Planche 1400×1320 Vérifiée — 0 Parasite)
// ============================================================================
const KROM_IDLE: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 8, y: 8, w: 116, h: 204, ax: 56 },
  { sheet: 'kromHero', x: 138, y: 17, w: 114, h: 195, ax: 54 },
  { sheet: 'kromHero', x: 266, y: 25, w: 111, h: 187, ax: 51 },
  { sheet: 'kromHero', x: 391, y: 16, w: 114, h: 196, ax: 54 },
];

const KROM_WALK: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 659, y: 24, w: 96, h: 188, ax: 45 },
  { sheet: 'kromHero', x: 769, y: 24, w: 96, h: 188, ax: 44 },
  { sheet: 'kromHero', x: 879, y: 26, w: 107, h: 186, ax: 47 },
  { sheet: 'kromHero', x: 1000, y: 24, w: 126, h: 188, ax: 48 },
];

const KROM_SLASH_HIGH: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 519, y: 27, w: 126, h: 185, ax: 55 },
  { sheet: 'kromHero', x: 8, y: 240, w: 148, h: 198, ax: 87 },
  { sheet: 'kromHero', x: 566, y: 270, w: 185, h: 168, ax: 76 },
  { sheet: 'kromHero', x: 780, y: 493, w: 223, h: 173, ax: 80 },
  { sheet: 'kromHero', x: 519, y: 27, w: 126, h: 185, ax: 55 },
];

const KROM_SPIN_DECAP: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 8, y: 240, w: 148, h: 198, ax: 87 },
  { sheet: 'kromHero', x: 604, y: 475, w: 160, h: 191, ax: 80 },
  { sheet: 'kromHero', x: 8, y: 475, w: 160, h: 191, ax: 80 },
  { sheet: 'kromHero', x: 566, y: 270, w: 185, h: 168, ax: 76 },
  { sheet: 'kromHero', x: 780, y: 493, w: 223, h: 173, ax: 80 },
];

const KROM_THRUST_MID: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 519, y: 27, w: 126, h: 185, ax: 55 },
  { sheet: 'kromHero', x: 170, y: 284, w: 151, h: 154, ax: 85 },
  { sheet: 'kromHero', x: 335, y: 263, w: 217, h: 175, ax: 78 },
  { sheet: 'kromHero', x: 170, y: 284, w: 151, h: 154, ax: 85 },
];

const KROM_SWEEP_LOW: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 8, y: 732, w: 173, h: 156, ax: 73 },
  { sheet: 'kromHero', x: 170, y: 284, w: 151, h: 154, ax: 85 },
  { sheet: 'kromHero', x: 424, y: 496, w: 164, h: 170, ax: 72 },
  { sheet: 'kromHero', x: 8, y: 732, w: 173, h: 156, ax: 73 },
];

const KROM_CLEAVE_OVERHEAD: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 8, y: 240, w: 148, h: 198, ax: 87 },
  { sheet: 'kromHero', x: 8, y: 475, w: 160, h: 191, ax: 80 },
  { sheet: 'kromHero', x: 184, y: 489, w: 224, h: 177, ax: 85 },
  { sheet: 'kromHero', x: 424, y: 496, w: 164, h: 170, ax: 72 },
  { sheet: 'kromHero', x: 8, y: 732, w: 173, h: 156, ax: 73 },
];

const KROM_BLOCK: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 765, y: 229, w: 115, h: 209, ax: 54 },
  { sheet: 'kromHero', x: 894, y: 229, w: 112, h: 209, ax: 48 },
  { sheet: 'kromHero', x: 1020, y: 238, w: 146, h: 200, ax: 83 },
];

const KROM_PARRIED_STUN: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 1020, y: 238, w: 146, h: 200, ax: 83 },
  { sheet: 'kromHero', x: 983, y: 710, w: 164, h: 178, ax: 89 },
  { sheet: 'kromHero', x: 1159, y: 710, w: 150, h: 178, ax: 81 },
];

const KROM_CROUCH: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 424, y: 496, w: 164, h: 170, ax: 72 },
  { sheet: 'kromHero', x: 8, y: 732, w: 173, h: 156, ax: 73 },
];

const KROM_JUMP: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 8, y: 732, w: 173, h: 156, ax: 73 },
  { sheet: 'kromHero', x: 193, y: 684, w: 124, h: 204, ax: 73 },
  { sheet: 'kromHero', x: 329, y: 700, w: 128, h: 188, ax: 88 },
  { sheet: 'kromHero', x: 8, y: 732, w: 173, h: 156, ax: 73 },
];

const KROM_ROLL: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 469, y: 767, w: 112, h: 121, ax: 52 },
  { sheet: 'kromHero', x: 593, y: 776, w: 121, h: 112, ax: 62 },
  { sheet: 'kromHero', x: 726, y: 767, w: 112, h: 121, ax: 58 },
  { sheet: 'kromHero', x: 850, y: 776, w: 121, h: 112, ax: 56 },
  { sheet: 'kromHero', x: 8, y: 732, w: 173, h: 156, ax: 73 },
];

const KROM_HIT_STUN: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 983, y: 710, w: 164, h: 178, ax: 89 },
  { sheet: 'kromHero', x: 1159, y: 710, w: 150, h: 178, ax: 81 },
];

const KROM_KNOCKDOWN: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 8, y: 930, w: 168, h: 130, ax: 67 },
  { sheet: 'kromHero', x: 190, y: 938, w: 168, h: 122, ax: 67 },
  { sheet: 'kromHero', x: 372, y: 952, w: 179, h: 108, ax: 74 },
  { sheet: 'kromHero', x: 565, y: 962, w: 194, h: 98, ax: 79 },
  { sheet: 'kromHero', x: 8, y: 732, w: 173, h: 156, ax: 73 },
];

const KROM_GISANT: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 773, y: 994, w: 217, h: 66, ax: 98 },
  { sheet: 'kromHero', x: 1004, y: 1000, w: 219, h: 60, ax: 99 },
];

const KROM_DEAD: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 8, y: 930, w: 168, h: 130, ax: 67 },
  { sheet: 'kromHero', x: 190, y: 938, w: 168, h: 122, ax: 67 },
  { sheet: 'kromHero', x: 372, y: 952, w: 179, h: 108, ax: 74 },
  { sheet: 'kromHero', x: 565, y: 962, w: 194, h: 98, ax: 79 },
  { sheet: 'kromHero', x: 773, y: 994, w: 217, h: 66, ax: 98 },
  { sheet: 'kromHero', x: 1004, y: 1000, w: 219, h: 60, ax: 99 },
];

const KROM_DECAPITATED: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 8, y: 1104, w: 163, h: 204, ax: 82 },
  { sheet: 'kromHero', x: 185, y: 1170, w: 197, h: 138, ax: 102 },
  { sheet: 'kromHero', x: 396, y: 1223, w: 236, h: 85, ax: 118 },
  { sheet: 'kromHero', x: 646, y: 1248, w: 248, h: 60, ax: 124 },
];

const KROM_VICTORY: SpriteFrameDef[] = [
  { sheet: 'kromHero', x: 908, y: 1121, w: 147, h: 187, ax: 82 },
  { sheet: 'kromHero', x: 1069, y: 1121, w: 146, h: 187, ax: 81 },
  { sheet: 'kromHero', x: 1229, y: 1100, w: 138, h: 208, ax: 71 },
  { sheet: 'kromHero', x: 1069, y: 1121, w: 146, h: 187, ax: 81 },
];

// ============================================================================
// 2. JOUEUR 2 — RIVAL AKA (Planche 1400×1008 Vérifiée — 0 Parasite + Décapitation)
// ============================================================================
const RIVAL_IDLE: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_IDLE_0),
  box('rivalAka', RIVAL_COORDS.R_IDLE_1),
  box('rivalAka', RIVAL_COORDS.R_IDLE_2),
  box('rivalAka', RIVAL_COORDS.R_IDLE_3),
];

const RIVAL_WALK: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_WALK_0),
  box('rivalAka', RIVAL_COORDS.R_WALK_1),
  box('rivalAka', RIVAL_COORDS.R_WALK_2),
  box('rivalAka', RIVAL_COORDS.R_WALK_3),
];

const RIVAL_SLASH_DIRECT: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_SLASH_0),
  box('rivalAka', RIVAL_COORDS.R_SLASH_1),
  box('rivalAka', RIVAL_COORDS.R_SLASH_2),
  box('rivalAka', RIVAL_COORDS.R_SLASH_0),
];

const RIVAL_THRUST: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_CROUCH_0),
  box('rivalAka', RIVAL_COORDS.R_SLASH_1),
  box('rivalAka', RIVAL_COORDS.R_SLASH_2),
  box('rivalAka', RIVAL_COORDS.R_CROUCH_0),
];

const RIVAL_CLEAVE: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_SLASH_0),
  box('rivalAka', RIVAL_COORDS.R_CLEAVE_1),
  box('rivalAka', RIVAL_COORDS.R_CLEAVE_2),
  box('rivalAka', RIVAL_COORDS.R_CROUCH_0),
];

const RIVAL_SWEEP_LOW: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_CROUCH_0),
  box('rivalAka', RIVAL_COORDS.R_CLEAVE_2),
  box('rivalAka', RIVAL_COORDS.R_SLASH_2),
  box('rivalAka', RIVAL_COORDS.R_CROUCH_1),
];

const RIVAL_SPIN_DECAP: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_SLASH_0),
  box('rivalAka', RIVAL_COORDS.R_SPIN_PIV),
  box('rivalAka', RIVAL_COORDS.R_SLASH_1),
  box('rivalAka', RIVAL_COORDS.R_SLASH_2),
];

const RIVAL_BLOCK: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_BLOCK_0),
  box('rivalAka', RIVAL_COORDS.R_BLOCK_1),
];

const RIVAL_CROUCH: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_CROUCH_0),
  box('rivalAka', RIVAL_COORDS.R_CROUCH_1),
];

const RIVAL_ROLL: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_ROLL_0),
  box('rivalAka', RIVAL_COORDS.R_ROLL_1),
  box('rivalAka', RIVAL_COORDS.R_ROLL_2),
  box('rivalAka', RIVAL_COORDS.R_ROLL_3),
];

const RIVAL_JUMP: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_CROUCH_0),
  box('rivalAka', RIVAL_COORDS.R_JUMP_0),
  box('rivalAka', RIVAL_COORDS.R_JUMP_1),
  box('rivalAka', RIVAL_COORDS.R_JUMP_2),
  box('rivalAka', RIVAL_COORDS.R_CROUCH_1),
];

const RIVAL_HIT: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_HIT_0),
  box('rivalAka', RIVAL_COORDS.R_HIT_1),
  box('rivalAka', RIVAL_COORDS.R_HIT_2),
];

const RIVAL_KNOCKDOWN: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_HIT_2),
  box('rivalAka', RIVAL_COORDS.R_DEAD_0),
  box('rivalAka', RIVAL_COORDS.R_DEAD_1),
  box('rivalAka', RIVAL_COORDS.R_ROLL_3),
];

const RIVAL_DEAD: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_HIT_2),
  box('rivalAka', RIVAL_COORDS.R_DEAD_0),
  box('rivalAka', RIVAL_COORDS.R_DEAD_1),
  box('rivalAka', RIVAL_COORDS.R_DEAD_2),
  box('rivalAka', RIVAL_COORDS.R_DEAD_3),
];

const RIVAL_GISANT: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_DEAD_2),
  box('rivalAka', RIVAL_COORDS.R_DEAD_3),
];

const RIVAL_DECAPITATED: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_DECAP_0),
  box('rivalAka', RIVAL_COORDS.R_DECAP_1),
  box('rivalAka', RIVAL_COORDS.R_DECAP_2),
  box('rivalAka', RIVAL_COORDS.R_DECAP_3),
];

const RIVAL_VICTORY: SpriteFrameDef[] = [
  box('rivalAka', RIVAL_COORDS.R_VIC_0),
  box('rivalAka', RIVAL_COORDS.R_VIC_1),
  box('rivalAka', RIVAL_COORDS.R_VIC_2),
  box('rivalAka', RIVAL_COORDS.R_VIC_1),
];

// ============================================================================
// 3. BOSS ACTE I — GORGAR (Planche 1520×1040 Vérifiée — 0 Parasite + Décapitation)
// ============================================================================
const GORGAR_IDLE: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_IDLE_0),
  box('gorgarBoss', GORGAR_COORDS.G_IDLE_1),
  box('gorgarBoss', GORGAR_COORDS.G_IDLE_2),
  box('gorgarBoss', GORGAR_COORDS.G_IDLE_3),
];

const GORGAR_WALK: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_WALK_0),
  box('gorgarBoss', GORGAR_COORDS.G_WALK_1),
  box('gorgarBoss', GORGAR_COORDS.G_WALK_2),
  box('gorgarBoss', GORGAR_COORDS.G_WALK_3),
];

const GORGAR_SLASH: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_CL_CHAMBER),
  box('gorgarBoss', GORGAR_COORDS.G_CL_ARC1),
  box('gorgarBoss', GORGAR_COORDS.G_CL_ARC2),
  box('gorgarBoss', GORGAR_COORDS.G_CL_LOW),
];

const GORGAR_CLEAVE: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_CL_CHAMBER),
  box('gorgarBoss', GORGAR_COORDS.G_CL_HIGH),
  box('gorgarBoss', GORGAR_COORDS.G_CL_ARC1),
  box('gorgarBoss', GORGAR_COORDS.G_CL_ARC2),
  box('gorgarBoss', GORGAR_COORDS.G_CL_LOW),
];

const GORGAR_SPIN: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_SPIN_0),
  box('gorgarBoss', GORGAR_COORDS.G_SPIN_1),
  box('gorgarBoss', GORGAR_COORDS.G_SPIN_2),
  box('gorgarBoss', GORGAR_COORDS.G_SPIN_3),
  box('gorgarBoss', GORGAR_COORDS.G_SPIN_4),
];

const GORGAR_SWEEP_LOW: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_CROUCH_0),
  box('gorgarBoss', GORGAR_COORDS.G_SPIN_2),
  box('gorgarBoss', GORGAR_COORDS.G_CL_LOW),
  box('gorgarBoss', GORGAR_COORDS.G_CROUCH_1),
];

const GORGAR_BLOCK: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_BLOCK_0),
  box('gorgarBoss', GORGAR_COORDS.G_BLOCK_1),
];

const GORGAR_CROUCH: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_CROUCH_0),
  box('gorgarBoss', GORGAR_COORDS.G_CROUCH_1),
];

const GORGAR_JUMP: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_CROUCH_1),
  box('gorgarBoss', GORGAR_COORDS.G_JUMP_0),
  box('gorgarBoss', GORGAR_COORDS.G_JUMP_1),
  box('gorgarBoss', GORGAR_COORDS.G_CROUCH_0),
];

const GORGAR_HIT: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_HIT_0),
  box('gorgarBoss', GORGAR_COORDS.G_HIT_1),
];

const GORGAR_KNOCKDOWN: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_HIT_1),
  box('gorgarBoss', GORGAR_COORDS.G_DEAD_0),
  box('gorgarBoss', GORGAR_COORDS.G_DEAD_1),
  box('gorgarBoss', GORGAR_COORDS.G_CROUCH_1),
];

const GORGAR_DEAD: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_DEAD_0),
  box('gorgarBoss', GORGAR_COORDS.G_DEAD_1),
  box('gorgarBoss', GORGAR_COORDS.G_DEAD_2),
  box('gorgarBoss', GORGAR_COORDS.G_DEAD_3),
];

const GORGAR_GISANT: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_DEAD_2),
  box('gorgarBoss', GORGAR_COORDS.G_DEAD_3),
];

const GORGAR_DECAPITATED: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_DECAP_0),
  box('gorgarBoss', GORGAR_COORDS.G_DECAP_1),
  box('gorgarBoss', GORGAR_COORDS.G_DECAP_2),
  box('gorgarBoss', GORGAR_COORDS.G_DECAP_3),
];

const GORGAR_VICTORY: SpriteFrameDef[] = [
  box('gorgarBoss', GORGAR_COORDS.G_VIC_0),
  box('gorgarBoss', GORGAR_COORDS.G_VIC_1),
  box('gorgarBoss', GORGAR_COORDS.G_IDLE_0),
  box('gorgarBoss', GORGAR_COORDS.G_VIC_1),
];

// ============================================================================
// 4. BOSS ACTE II — VORGATH (Planche 1408×1168 Vérifiée — 0 Parasite + Décapitation)
// ============================================================================
const VORGATH_IDLE: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_IDLE_0),
  box('vorgathBoss', VORGATH_COORDS.V_IDLE_1),
  box('vorgathBoss', VORGATH_COORDS.V_IDLE_2),
  box('vorgathBoss', VORGATH_COORDS.V_IDLE_3),
];

const VORGATH_WALK: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_WALK_0),
  box('vorgathBoss', VORGATH_COORDS.V_WALK_1),
  box('vorgathBoss', VORGATH_COORDS.V_WALK_2),
  box('vorgathBoss', VORGATH_COORDS.V_WALK_3),
];

const VORGATH_CLEAVE: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_CL_0),
  box('vorgathBoss', VORGATH_COORDS.V_CL_1),
  box('vorgathBoss', VORGATH_COORDS.V_SWEEP_ARC),
  box('vorgathBoss', VORGATH_COORDS.V_CL_LOW),
];

const VORGATH_CAST: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_CL_1),
  box('vorgathBoss', VORGATH_COORDS.V_CAST_SLAM),
  box('vorgathBoss', VORGATH_COORDS.V_CL_LOW),
  box('vorgathBoss', VORGATH_COORDS.V_CROUCH_0),
];

const VORGATH_SWEEP: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_CROUCH_0),
  box('vorgathBoss', VORGATH_COORDS.V_CL_0),
  box('vorgathBoss', VORGATH_COORDS.V_SWEEP_ARC),
  box('vorgathBoss', VORGATH_COORDS.V_CL_LOW),
];

const VORGATH_BLOCK: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_BLOCK_0),
  box('vorgathBoss', VORGATH_COORDS.V_BLOCK_1),
];

const VORGATH_CROUCH: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_CROUCH_0),
  box('vorgathBoss', VORGATH_COORDS.V_CROUCH_1),
];

const VORGATH_JUMP: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_CROUCH_1),
  box('vorgathBoss', VORGATH_COORDS.V_JUMP_0),
  box('vorgathBoss', VORGATH_COORDS.V_JUMP_1),
  box('vorgathBoss', VORGATH_COORDS.V_CROUCH_0),
];

const VORGATH_HIT: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_HIT_0),
  box('vorgathBoss', VORGATH_COORDS.V_HIT_1),
  box('vorgathBoss', VORGATH_COORDS.V_HIT_2),
];

const VORGATH_KNOCKDOWN: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_HIT_2),
  box('vorgathBoss', VORGATH_COORDS.V_DEAD_0),
  box('vorgathBoss', VORGATH_COORDS.V_DEAD_2),
  box('vorgathBoss', VORGATH_COORDS.V_CROUCH_1),
];

const VORGATH_DEAD: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_DEAD_0),
  box('vorgathBoss', VORGATH_COORDS.V_DEAD_1),
  box('vorgathBoss', VORGATH_COORDS.V_DEAD_2),
  box('vorgathBoss', VORGATH_COORDS.V_DEAD_3),
];

const VORGATH_GISANT: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_DEAD_2),
  box('vorgathBoss', VORGATH_COORDS.V_DEAD_3),
];

const VORGATH_DECAPITATED: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_DECAP_0),
  box('vorgathBoss', VORGATH_COORDS.V_DECAP_1),
  box('vorgathBoss', VORGATH_COORDS.V_DECAP_2),
  box('vorgathBoss', VORGATH_COORDS.V_DECAP_3),
];

const VORGATH_VICTORY: SpriteFrameDef[] = [
  box('vorgathBoss', VORGATH_COORDS.V_VIC_0),
  box('vorgathBoss', VORGATH_COORDS.V_VIC_1),
  box('vorgathBoss', VORGATH_COORDS.V_VIC_0),
];

// ============================================================================
// 5. BOSS ACTE III — MALAKOR (Planche 1568×1168 Vérifiée — Roulade 360° + Saut + Décap)
// ============================================================================
const MALAKOR_IDLE: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_IDLE_0),
  box('malakorBoss', MALAKOR_COORDS.M_IDLE_1),
  box('malakorBoss', MALAKOR_COORDS.M_IDLE_2),
  box('malakorBoss', MALAKOR_COORDS.M_IDLE_3),
];

const MALAKOR_WALK: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_WALK_0),
  box('malakorBoss', MALAKOR_COORDS.M_WALK_1),
  box('malakorBoss', MALAKOR_COORDS.M_WALK_2),
  box('malakorBoss', MALAKOR_COORDS.M_WALK_3),
];

const MALAKOR_SLASH: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_SLASH_0),
  box('malakorBoss', MALAKOR_COORDS.M_SLASH_1),
  box('malakorBoss', MALAKOR_COORDS.M_SLASH_2),
  box('malakorBoss', MALAKOR_COORDS.M_IDLE_1),
];

const MALAKOR_THRUST: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_CROUCH_0),
  box('malakorBoss', MALAKOR_COORDS.M_THRUST_1),
  box('malakorBoss', MALAKOR_COORDS.M_THRUST_2),
  box('malakorBoss', MALAKOR_COORDS.M_THRUST_1),
];

const MALAKOR_SWEEP: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_CROUCH_1),
  box('malakorBoss', MALAKOR_COORDS.M_SLASH_1),
  box('malakorBoss', MALAKOR_COORDS.M_THRUST_2),
  box('malakorBoss', MALAKOR_COORDS.M_CROUCH_0),
];

const MALAKOR_BLOCK: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_BLOCK_0),
  box('malakorBoss', MALAKOR_COORDS.M_BLOCK_1),
];

const MALAKOR_CROUCH: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_CROUCH_0),
  box('malakorBoss', MALAKOR_COORDS.M_CROUCH_1),
];

const MALAKOR_ROLL: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_ROLL_0),
  box('malakorBoss', MALAKOR_COORDS.M_ROLL_1),
  box('malakorBoss', MALAKOR_COORDS.M_ROLL_2),
  box('malakorBoss', MALAKOR_COORDS.M_ROLL_3),
];

const MALAKOR_JUMP: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_CROUCH_1),
  box('malakorBoss', MALAKOR_COORDS.M_JUMP_0),
  box('malakorBoss', MALAKOR_COORDS.M_JUMP_1),
  box('malakorBoss', MALAKOR_COORDS.M_CROUCH_0),
];

const MALAKOR_HIT: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_HIT_0),
  box('malakorBoss', MALAKOR_COORDS.M_HIT_1),
  box('malakorBoss', MALAKOR_COORDS.M_HIT_2),
];

const MALAKOR_KNOCKDOWN: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_HIT_2),
  box('malakorBoss', MALAKOR_COORDS.M_DEAD_0),
  box('malakorBoss', MALAKOR_COORDS.M_DEAD_1),
  box('malakorBoss', MALAKOR_COORDS.M_CROUCH_1),
];

const MALAKOR_DEAD: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_DEAD_0),
  box('malakorBoss', MALAKOR_COORDS.M_DEAD_1),
  box('malakorBoss', MALAKOR_COORDS.M_DEAD_2),
  box('malakorBoss', MALAKOR_COORDS.M_DEAD_3),
];

const MALAKOR_GISANT: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_DEAD_2),
  box('malakorBoss', MALAKOR_COORDS.M_DEAD_3),
];

const MALAKOR_DECAPITATED: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_DECAP_0),
  box('malakorBoss', MALAKOR_COORDS.M_DECAP_1),
  box('malakorBoss', MALAKOR_COORDS.M_DECAP_2),
  box('malakorBoss', MALAKOR_COORDS.M_DECAP_3),
];

const MALAKOR_VICTORY: SpriteFrameDef[] = [
  box('malakorBoss', MALAKOR_COORDS.M_VIC_0),
  box('malakorBoss', MALAKOR_COORDS.M_VIC_1),
  box('malakorBoss', MALAKOR_COORDS.M_VIC_0),
];

// ============================================================================
// 6. BOSS ACTE IV — SEIGNEUR DRAX (Planche 1504×1152 Vérifiée — Accroupi + Décap)
// ============================================================================
const DRAX_IDLE: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_IDLE_0),
  box('draxBoss', DRAX_COORDS.D_IDLE_1),
  box('draxBoss', DRAX_COORDS.D_IDLE_2),
  box('draxBoss', DRAX_COORDS.D_IDLE_3),
];

const DRAX_WALK: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_WALK_0),
  box('draxBoss', DRAX_COORDS.D_WALK_1),
  box('draxBoss', DRAX_COORDS.D_WALK_2),
  box('draxBoss', DRAX_COORDS.D_WALK_3),
  box('draxBoss', DRAX_COORDS.D_WALK_4),
];

const DRAX_SLASH: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_SLASH_0),
  box('draxBoss', DRAX_COORDS.D_SLASH_1),
  box('draxBoss', DRAX_COORDS.D_SLASH_2),
  box('draxBoss', DRAX_COORDS.D_SLASH_3),
];

const DRAX_SWEEP: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_CROUCH_0),
  box('draxBoss', DRAX_COORDS.D_SLASH_0),
  box('draxBoss', DRAX_COORDS.D_SLASH_3),
  box('draxBoss', DRAX_COORDS.D_CROUCH_1),
];

const DRAX_CAST: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_CAST_0),
  box('draxBoss', DRAX_COORDS.D_CAST_1),
  box('draxBoss', DRAX_COORDS.D_SLASH_3),
];

const DRAX_BLOCK: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_BLOCK_0),
  box('draxBoss', DRAX_COORDS.D_BLOCK_1),
];

const DRAX_CROUCH: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_CROUCH_0),
  box('draxBoss', DRAX_COORDS.D_CROUCH_1),
];

const DRAX_JUMP: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_CROUCH_1),
  box('draxBoss', DRAX_COORDS.D_JUMP_0),
  box('draxBoss', DRAX_COORDS.D_JUMP_1),
  box('draxBoss', DRAX_COORDS.D_JUMP_2),
  box('draxBoss', DRAX_COORDS.D_CROUCH_0),
];

const DRAX_HIT: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_HIT_0),
  box('draxBoss', DRAX_COORDS.D_HIT_1),
  box('draxBoss', DRAX_COORDS.D_HIT_2),
];

const DRAX_KNOCKDOWN: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_HIT_2),
  box('draxBoss', DRAX_COORDS.D_DEAD_0),
  box('draxBoss', DRAX_COORDS.D_DEAD_1),
  box('draxBoss', DRAX_COORDS.D_CROUCH_1),
];

const DRAX_DEAD: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_DEAD_0),
  box('draxBoss', DRAX_COORDS.D_DEAD_1),
  box('draxBoss', DRAX_COORDS.D_DEAD_2),
  box('draxBoss', DRAX_COORDS.D_DEAD_3),
];

const DRAX_GISANT: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_DEAD_2),
  box('draxBoss', DRAX_COORDS.D_DEAD_3),
];

const DRAX_DECAPITATED: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_DECAP_0),
  box('draxBoss', DRAX_COORDS.D_DECAP_1),
  box('draxBoss', DRAX_COORDS.D_DECAP_2),
  box('draxBoss', DRAX_COORDS.D_DECAP_3),
];

const DRAX_VICTORY: SpriteFrameDef[] = [
  box('draxBoss', DRAX_COORDS.D_VIC_0),
  box('draxBoss', DRAX_COORDS.D_VIC_1),
  box('draxBoss', DRAX_COORDS.D_VIC_0),
];

// ============================================================================
// 6B. BOSS ACTE II — THALGRIM (Planche 1200×896 Vérifiée — 34 Sprites Runiques)
// ============================================================================
const THALGRIM_IDLE: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_IDLE_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_IDLE_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_IDLE_2),
  box('thalgrimBoss', THALGRIM_COORDS.T_IDLE_3),
];

const THALGRIM_WALK: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_WALK_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_WALK_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_WALK_2),
  box('thalgrimBoss', THALGRIM_COORDS.T_WALK_3),
];

const THALGRIM_CLEAVE: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_CL_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_CL_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_CL_2),
  box('thalgrimBoss', THALGRIM_COORDS.T_CL_3),
];

const THALGRIM_CAST: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_CL_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_CL_2),
  box('thalgrimBoss', THALGRIM_COORDS.T_CL_3),
  box('thalgrimBoss', THALGRIM_COORDS.T_CROUCH_0),
];

const THALGRIM_BLOCK: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_BLOCK_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_BLOCK_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_BLOCK_2),
];

const THALGRIM_SWEEP: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_SWEEP_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_SWEEP_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_SWEEP_2),
  box('thalgrimBoss', THALGRIM_COORDS.T_SWEEP_3),
];

const THALGRIM_CROUCH: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_CROUCH_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_CROUCH_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_CROUCH_2),
];

const THALGRIM_JUMP: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_JUMP_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_JUMP_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_JUMP_2),
  box('thalgrimBoss', THALGRIM_COORDS.T_JUMP_3),
];

const THALGRIM_HIT: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_HIT_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_FALL_0),
];

const THALGRIM_KNOCKDOWN: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_HIT_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_FALL_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_FALL_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_CROUCH_2),
];

const THALGRIM_DEAD: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_HIT_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_FALL_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_FALL_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_DEAD_0),
];

const THALGRIM_GISANT: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_FALL_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_DEAD_0),
];

const THALGRIM_DECAPITATED: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_HIT_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_DECAP_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_DECAP_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_DECAP_1),
];

const THALGRIM_VICTORY: SpriteFrameDef[] = [
  box('thalgrimBoss', THALGRIM_COORDS.T_VIC_0),
  box('thalgrimBoss', THALGRIM_COORDS.T_VIC_1),
  box('thalgrimBoss', THALGRIM_COORDS.T_VIC_0),
];

// ============================================================================
// 6C. BOSS ACTE V — BAELGOR (Planche 1200×896 Vérifiée — 32 Sprites Infernaux)
// ============================================================================
const BAELGOR_IDLE: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_IDLE_0),
  box('baelgorBoss', BAELGOR_COORDS.B_IDLE_1),
  box('baelgorBoss', BAELGOR_COORDS.B_IDLE_2),
  box('baelgorBoss', BAELGOR_COORDS.B_IDLE_3),
];

const BAELGOR_WALK: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_WALK_0),
  box('baelgorBoss', BAELGOR_COORDS.B_WALK_1),
  box('baelgorBoss', BAELGOR_COORDS.B_WALK_2),
  box('baelgorBoss', BAELGOR_COORDS.B_WALK_3),
];

const BAELGOR_SLASH: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_SLASH_0),
  box('baelgorBoss', BAELGOR_COORDS.B_SLASH_1),
  box('baelgorBoss', BAELGOR_COORDS.B_THRUST_0),
  box('baelgorBoss', BAELGOR_COORDS.B_SLASH_0),
];

const BAELGOR_THRUST: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_CROUCH_0),
  box('baelgorBoss', BAELGOR_COORDS.B_THRUST_0),
  box('baelgorBoss', BAELGOR_COORDS.B_THRUST_1),
  box('baelgorBoss', BAELGOR_COORDS.B_CROUCH_0),
];

const BAELGOR_CAST: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_IDLE_3),
  box('baelgorBoss', BAELGOR_COORDS.B_THRUST_0),
  box('baelgorBoss', BAELGOR_COORDS.B_THRUST_1),
  box('baelgorBoss', BAELGOR_COORDS.B_IDLE_2),
];

const BAELGOR_SWEEP: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_CROUCH_0),
  box('baelgorBoss', BAELGOR_COORDS.B_CROUCH_1),
  box('baelgorBoss', BAELGOR_COORDS.B_SWEEP_0),
  box('baelgorBoss', BAELGOR_COORDS.B_CROUCH_0),
];

const BAELGOR_BLOCK: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_BLOCK_0),
  box('baelgorBoss', BAELGOR_COORDS.B_BLOCK_1),
];

const BAELGOR_CROUCH: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_CROUCH_0),
  box('baelgorBoss', BAELGOR_COORDS.B_CROUCH_1),
];

const BAELGOR_ROLL: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_ROLL_0),
  box('baelgorBoss', BAELGOR_COORDS.B_ROLL_1),
  box('baelgorBoss', BAELGOR_COORDS.B_ROLL_2),
  box('baelgorBoss', BAELGOR_COORDS.B_LEAP_0),
];

const BAELGOR_JUMP: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_CROUCH_1),
  box('baelgorBoss', BAELGOR_COORDS.B_JUMP_0),
  box('baelgorBoss', BAELGOR_COORDS.B_JUMP_1),
  box('baelgorBoss', BAELGOR_COORDS.B_JUMP_2),
];

const BAELGOR_HIT: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_HIT_0),
  box('baelgorBoss', BAELGOR_COORDS.B_FALL_0),
];

const BAELGOR_KNOCKDOWN: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_HIT_0),
  box('baelgorBoss', BAELGOR_COORDS.B_FALL_0),
  box('baelgorBoss', BAELGOR_COORDS.B_FALL_1),
  box('baelgorBoss', BAELGOR_COORDS.B_CROUCH_1),
];

const BAELGOR_DEAD: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_HIT_0),
  box('baelgorBoss', BAELGOR_COORDS.B_FALL_0),
  box('baelgorBoss', BAELGOR_COORDS.B_FALL_1),
  box('baelgorBoss', BAELGOR_COORDS.B_DEAD_0),
];

const BAELGOR_GISANT: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_FALL_1),
  box('baelgorBoss', BAELGOR_COORDS.B_DEAD_0),
];

const BAELGOR_DECAPITATED: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_HIT_0),
  box('baelgorBoss', BAELGOR_COORDS.B_DECAP_0),
  box('baelgorBoss', BAELGOR_COORDS.B_DECAP_1),
  box('baelgorBoss', BAELGOR_COORDS.B_DECAP_1),
];

const BAELGOR_VICTORY: SpriteFrameDef[] = [
  box('baelgorBoss', BAELGOR_COORDS.B_VIC_0),
  box('baelgorBoss', BAELGOR_COORDS.B_VIC_1),
  box('baelgorBoss', BAELGOR_COORDS.B_VIC_0),
];

// ============================================================================
// 7. LES 17 MONSTRES & SBIRES DES 6 ZONES (6 Sbires Historiques + 11 Monstres!)
// ============================================================================
type MinionPrefix = 'WR' | 'MS' | 'CA' | 'CS' | 'PT' | 'DA';

interface MinionSpriteBank {
  idle: SpriteFrameDef[];
  walk: SpriteFrameDef[];
  slash: SpriteFrameDef[];
  sweep: SpriteFrameDef[];
  block: SpriteFrameDef[];
  crouch: SpriteFrameDef[];
  jump: SpriteFrameDef[];
  hit: SpriteFrameDef[];
  knockdown: SpriteFrameDef[];
  dead: SpriteFrameDef[];
  gisant: SpriteFrameDef[];
  decapitated: SpriteFrameDef[];
  victory: SpriteFrameDef[];
}

function buildMinionBank(pfx: MinionPrefix): MinionSpriteBank {
  const m = (suffix: string): SpriteFrameDef => {
    const k = `${pfx}_${suffix}` as keyof typeof MINIONS_COORDS;
    return box('minionsSheet', MINIONS_COORDS[k]);
  };
  const idle = [m('IDLE_0'), m('IDLE_1')];
  const walk = [m('WALK_0'), m('WALK_1'), m('WALK_2'), m('WALK_3')];
  const slash = [m('ATK_0'), m('ATK_1'), m('ATK_2'), m('ATK_3')];
  const sweep = [m('CROUCH_0'), m('ATK_1'), m('ATK_2'), m('CROUCH_0')];
  const block = [m('BLK_0'), m('IDLE_0')];
  const crouch = [m('CROUCH_0'), m('IDLE_1')];
  const jump = [m('CROUCH_0'), m('ATK_0'), m('CROUCH_0')];
  const hit = [m('HIT_0'), m('HIT_1')];
  const knockdown = [m('HIT_1'), m('DEAD_0'), m('DEAD_1'), m('CROUCH_0')];
  const dead = [m('HIT_0'), m('DEAD_0'), m('DEAD_1'), m('DEAD_2')];
  const gisant = [m('DEAD_1'), m('DEAD_2')];
  const decapitated = [m('DECAP_0'), m('DECAP_1'), m('DECAP_2'), m('DECAP_3')];
  const victory = [m('ATK_0'), m('IDLE_0'), m('ATK_1'), m('IDLE_0')];
  return {
    idle,
    walk,
    slash,
    sweep,
    block,
    crouch,
    jump,
    hit,
    knockdown,
    dead,
    gisant,
    decapitated,
    victory,
  };
}

interface M11PoseMap {
  idle: number[];
  walk: number[];
  slash: number[];
  sweep: number[];
  block: number[];
  crouch: number[];
  jump: number[];
  hit: number[];
  knockdown: number[];
  dead: number[];
  gisant: number[];
  decap: number[];
  airOy?: number;
  airMaxIdx?: number;
}

function buildMonster11Bank(rowCode: string, cfg: M11PoseMap): MinionSpriteBank {
  const f = (idx: number): SpriteFrameDef => {
    const key = `${rowCode}_${idx}` as keyof typeof MONSTERS11_COORDS;
    const oy =
      cfg.airOy !== undefined && idx <= (cfg.airMaxIdx ?? 99) ? cfg.airOy : 0;
    return box('monsters11Sheet', MONSTERS11_COORDS[key], oy);
  };
  const mapList = (arr: number[]) => arr.map(f);
  return {
    idle: mapList(cfg.idle),
    walk: mapList(cfg.walk),
    slash: mapList(cfg.slash),
    sweep: mapList(cfg.sweep),
    block: mapList(cfg.block),
    crouch: mapList(cfg.crouch),
    jump: mapList(cfg.jump),
    hit: mapList(cfg.hit),
    knockdown: mapList(cfg.knockdown),
    dead: mapList(cfg.dead),
    gisant: mapList(cfg.gisant),
    decapitated: mapList(cfg.decap),
    victory: mapList([cfg.slash[0], cfg.idle[0], cfg.slash[1] ?? cfg.slash[0], cfg.idle[0]]),
  };
}

const MINION_BANKS: Record<MinionSkin, MinionSpriteBank> = {
  wolf_raider: buildMinionBank('WR'),
  monolith_spearman: buildMinionBank('MS'),
  cult_acolyte: buildMinionBank('CA'),
  crypt_skeleton: buildMinionBank('CS'),
  pit_thrall: buildMinionBank('PT'),
  drax_acolyte: buildMinionBank('DA'),
  goblin_scout: buildMonster11Bank('M01', {
    idle: [0, 1],
    walk: [2, 3, 4],
    slash: [5, 6, 7],
    sweep: [5, 7, 2],
    block: [1, 0],
    crouch: [2, 0],
    jump: [2, 6, 7],
    hit: [8, 9],
    knockdown: [9, 10, 11, 2],
    dead: [9, 10, 11, 12],
    gisant: [11, 12],
    decap: [8, 10, 11, 12],
  }),
  orc_marauder: buildMonster11Bank('M02', {
    idle: [0, 1],
    walk: [2, 3, 4],
    slash: [4, 5, 6],
    sweep: [2, 5, 6],
    block: [1, 0],
    crouch: [2, 0],
    jump: [2, 5, 6],
    hit: [7, 8],
    knockdown: [8, 9, 10, 2],
    dead: [7, 9, 10, 11],
    gisant: [10, 11],
    decap: [8, 9, 10, 11],
  }),
  undead_warrior: buildMonster11Bank('M03', {
    idle: [0, 1],
    walk: [2, 3, 4],
    slash: [5, 6, 7],
    sweep: [5, 7, 2],
    block: [1, 0],
    crouch: [2, 0],
    jump: [2, 6, 7],
    hit: [8, 9],
    knockdown: [8, 10, 11, 2],
    dead: [8, 10, 11, 12],
    gisant: [11, 12],
    decap: [9, 10, 11, 12],
  }),
  risen_zombie: buildMonster11Bank('M04', {
    idle: [0, 1],
    walk: [2, 3, 4],
    slash: [5, 6, 7],
    sweep: [4, 7, 2],
    block: [4, 1],
    crouch: [4, 1],
    jump: [4, 6, 7],
    hit: [8, 9],
    knockdown: [9, 10, 11, 4],
    dead: [8, 10, 11, 12],
    gisant: [11, 12],
    decap: [9, 10, 11, 12],
  }),
  dire_wolf: buildMonster11Bank('M05', {
    idle: [0, 1],
    walk: [2, 3, 4],
    slash: [4, 5, 2],
    sweep: [3, 5, 2],
    block: [6, 0],
    crouch: [3, 0],
    jump: [4, 5, 2],
    hit: [6, 7],
    knockdown: [7, 9, 3],
    dead: [7, 9, 10],
    gisant: [9, 10],
    decap: [7, 9, 10],
  }),
  cave_bat: buildMonster11Bank('M06', {
    idle: [0, 1],
    walk: [2, 3, 4, 5],
    slash: [6, 7, 5],
    sweep: [6, 7, 4],
    block: [4, 1],
    crouch: [4, 5],
    jump: [2, 3, 6],
    hit: [8, 9],
    knockdown: [8, 9, 10, 4],
    dead: [9, 10, 12, 13],
    gisant: [12, 13],
    decap: [8, 10, 11, 13],
    airOy: -22,
    airMaxIdx: 9,
  }),
  spectral_wraith: buildMonster11Bank('M07', {
    idle: [0, 1],
    walk: [2, 3, 4],
    slash: [4, 5, 6],
    sweep: [3, 6, 4],
    block: [1, 0],
    crouch: [3, 4],
    jump: [2, 5, 6],
    hit: [7, 8],
    knockdown: [8, 9, 3],
    dead: [8, 9, 10, 11],
    gisant: [10, 11],
    decap: [9, 10, 11],
    airOy: -8,
    airMaxIdx: 8,
  }),
  skeleton_mage: buildMonster11Bank('M08', {
    idle: [0, 1],
    walk: [2, 3, 1, 2],
    slash: [4, 5, 4],
    sweep: [3, 5, 2],
    block: [1, 0],
    crouch: [2, 0],
    jump: [2, 4, 5],
    hit: [6, 7],
    knockdown: [7, 8, 9, 2],
    dead: [7, 8, 9, 10],
    gisant: [9, 10],
    decap: [7, 8, 9, 10],
  }),
  imperial_halberdier: buildMonster11Bank('M09', {
    idle: [0, 1],
    walk: [2, 3, 1, 2],
    slash: [4, 5, 4],
    sweep: [4, 5, 2],
    block: [6, 0],
    crouch: [6, 2],
    jump: [2, 4, 5],
    hit: [7, 8],
    knockdown: [8, 9, 6],
    dead: [7, 8, 9, 10],
    gisant: [9, 10],
    decap: [8, 9, 10],
  }),
  stone_golem: buildMonster11Bank('M10', {
    idle: [0, 1],
    walk: [2, 3, 1, 2],
    slash: [4, 5, 4],
    sweep: [4, 5, 2],
    block: [2, 0],
    crouch: [2, 3],
    jump: [2, 4, 5],
    hit: [6, 7],
    knockdown: [7, 8, 2],
    dead: [6, 7, 8, 9],
    gisant: [8, 9],
    decap: [7, 8, 9],
  }),
  abyssal_demon: buildMonster11Bank('M11', {
    idle: [0, 1],
    walk: [2, 3, 1, 2],
    slash: [4, 5, 6],
    sweep: [3, 6, 2],
    block: [1, 0],
    crouch: [2, 3],
    jump: [4, 5, 6],
    hit: [7, 3],
    knockdown: [7, 8, 2],
    dead: [7, 8, 9],
    gisant: [8, 9],
    decap: [7, 8, 9],
  }),
};

export function isMinionSkin(skin: FighterSkin): skin is MinionSkin {
  return skin in MINION_BANKS;
}

// ============================================================================
// 8. GOBELIN GRIK & ANIMATIONS D'ARÈNE (Planche 1380×800 — 38 Sprites Isolés!)
// ============================================================================
export const GOBLIN_WALK_FRAMES: SpriteFrameDef[] = [
  box('goblinAndFx', GOBLIN_FX_COORDS.GOB_WALK_0),
  box('goblinAndFx', GOBLIN_FX_COORDS.GOB_WALK_1),
  box('goblinAndFx', GOBLIN_FX_COORDS.GOB_WALK_2),
  box('goblinAndFx', GOBLIN_FX_COORDS.GOB_WALK_3),
];

export const GOBLIN_LAUGH_FRAMES: SpriteFrameDef[] = [
  box('goblinAndFx', GOBLIN_FX_COORDS.GOB_LAUGH_0),
  box('goblinAndFx', GOBLIN_FX_COORDS.GOB_LAUGH_1),
  box('goblinAndFx', GOBLIN_FX_COORDS.GOB_LAUGH_2),
];

export const GOBLIN_DRAG_FRAMES: SpriteFrameDef[] = [
  box('goblinAndFx', GOBLIN_FX_COORDS.GOB_DRAG_0),
  box('goblinAndFx', GOBLIN_FX_COORDS.GOB_DRAG_1),
  box('goblinAndFx', GOBLIN_FX_COORDS.GOB_DRAG_2),
];

export const FX_TORCH_FRAMES: SpriteFrameDef[] = [
  box('goblinAndFx', GOBLIN_FX_COORDS.TORCH_0),
  box('goblinAndFx', GOBLIN_FX_COORDS.TORCH_1),
  box('goblinAndFx', GOBLIN_FX_COORDS.TORCH_2),
  box('goblinAndFx', GOBLIN_FX_COORDS.TORCH_3),
  box('goblinAndFx', GOBLIN_FX_COORDS.TORCH_4),
  box('goblinAndFx', GOBLIN_FX_COORDS.TORCH_5),
];

export const FX_LAVA_FRAMES: SpriteFrameDef[] = [
  box('goblinAndFx', GOBLIN_FX_COORDS.LAVA_0),
  box('goblinAndFx', GOBLIN_FX_COORDS.LAVA_1),
  box('goblinAndFx', GOBLIN_FX_COORDS.LAVA_2),
  box('goblinAndFx', GOBLIN_FX_COORDS.LAVA_3),
];

export const FX_FIREBALL_FRAMES: SpriteFrameDef[] = [
  box('goblinAndFx', GOBLIN_FX_COORDS.FIREBALL_0),
  box('goblinAndFx', GOBLIN_FX_COORDS.FIREBALL_1),
];

export const FX_SPARK_FRAMES: SpriteFrameDef[] = [
  box('goblinAndFx', GOBLIN_FX_COORDS.SPARK_0),
  box('goblinAndFx', GOBLIN_FX_COORDS.SPARK_1),
  box('goblinAndFx', GOBLIN_FX_COORDS.SPARK_2),
  box('goblinAndFx', GOBLIN_FX_COORDS.SPARK_3),
];

export const FX_CROW_FRAMES: SpriteFrameDef[] = [
  box('goblinAndFx', GOBLIN_FX_COORDS.CROW_0),
  box('goblinAndFx', GOBLIN_FX_COORDS.CROW_1),
  box('goblinAndFx', GOBLIN_FX_COORDS.CROW_2),
  box('goblinAndFx', GOBLIN_FX_COORDS.CROW_3),
];

export const FX_MONOLITH_FRAMES: SpriteFrameDef[] = [
  box('goblinAndFx', GOBLIN_FX_COORDS.MONO_0),
  box('goblinAndFx', GOBLIN_FX_COORDS.MONO_1),
  box('goblinAndFx', GOBLIN_FX_COORDS.MONO_2),
  box('goblinAndFx', GOBLIN_FX_COORDS.MONO_3),
];

export const FX_BRAZIER_FRAMES: SpriteFrameDef[] = [
  box('goblinAndFx', GOBLIN_FX_COORDS.BRAZIER_0),
  box('goblinAndFx', GOBLIN_FX_COORDS.BRAZIER_1),
  box('goblinAndFx', GOBLIN_FX_COORDS.BRAZIER_2),
  box('goblinAndFx', GOBLIN_FX_COORDS.BRAZIER_3),
];

export const FX_PORTCULLIS_CLOSED: SpriteFrameDef = box(
  'decorAnim',
  DECOR_ANIM_COORDS.PORTCULLIS_CLOSED
);

export const FX_PORTCULLIS_OPEN: SpriteFrameDef = box(
  'decorAnim',
  DECOR_ANIM_COORDS.PORTCULLIS_OPEN
);

export const FX_BANNER_FRAMES: SpriteFrameDef[] = [
  box('decorAnim', DECOR_ANIM_COORDS.BANNER_0),
  box('decorAnim', DECOR_ANIM_COORDS.BANNER_1),
  box('decorAnim', DECOR_ANIM_COORDS.BANNER_2),
  box('decorAnim', DECOR_ANIM_COORDS.BANNER_3),
  box('decorAnim', DECOR_ANIM_COORDS.BANNER_2),
  box('decorAnim', DECOR_ANIM_COORDS.BANNER_1),
];

export const FX_CAGE_FRAMES: SpriteFrameDef[] = [
  box('decorAnim', DECOR_ANIM_COORDS.CAGE_0),
  box('decorAnim', DECOR_ANIM_COORDS.CAGE_1),
  box('decorAnim', DECOR_ANIM_COORDS.CAGE_2),
  box('decorAnim', DECOR_ANIM_COORDS.CAGE_3),
  box('decorAnim', DECOR_ANIM_COORDS.CAGE_2),
  box('decorAnim', DECOR_ANIM_COORDS.CAGE_1),
];

export const FX_ARCANE_BRAZIER_FRAMES: SpriteFrameDef[] = [
  box('decorAnim', DECOR_ANIM_COORDS.ARCANE_BRAZIER_0),
  box('decorAnim', DECOR_ANIM_COORDS.ARCANE_BRAZIER_1),
  box('decorAnim', DECOR_ANIM_COORDS.ARCANE_BRAZIER_2),
  box('decorAnim', DECOR_ANIM_COORDS.ARCANE_BRAZIER_3),
];

// ============================================================================
// CHROMA-KEY PIPELINE (Preserves Interior Amethyst/Purple Runes!)
// ============================================================================
const rawImages: Partial<Record<SheetKey, HTMLImageElement>> = {};
const baseSheets: Partial<Record<SheetKey, HTMLCanvasElement>> = {};
const whiteFlashCache = new Map<string, HTMLCanvasElement>();
const loadListeners = new Set<() => void>();
let atlasLoadInitiated = false;

export function chromaKeyMagentaSheet(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx || w === 0 || h === 0) return canvas;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    if (
      (r > 195 && b > 190 && g < 85 && r + b - g * 2 > 225) ||
      (r > 155 && b > 155 && g < 48 && Math.abs(r - b) <= 16)
    ) {
      d[i + 3] = 0;
    }
  }

  for (let pass = 0; pass < 2; pass++) {
    const prevAlpha = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) prevAlpha[p] = d[p * 4 + 3];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pIdx = y * w + x;
        if (prevAlpha[pIdx] === 0) continue;

        const touchesBg =
          (x > 0 && prevAlpha[pIdx - 1] === 0) ||
          (x < w - 1 && prevAlpha[pIdx + 1] === 0) ||
          (y > 0 && prevAlpha[pIdx - w] === 0) ||
          (y < h - 1 && prevAlpha[pIdx + w] === 0);

        if (!touchesBg) continue;

        const idx = pIdx * 4;
        const r = d[idx];
        const g = d[idx + 1];
        const b = d[idx + 2];
        if (r > g + 42 && b > g + 42 && Math.abs(r - b) < 46) {
          if (r > 135 && b > 130 && g < 105) {
            d[idx + 3] = 0;
          } else if (pass === 1) {
            const lum = Math.round(g * 0.72 + Math.min(r, b) * 0.2);
            d[idx] = lum;
            d[idx + 1] = lum;
            d[idx + 2] = lum;
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function buildWhiteFlashCanvas(base: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = base.width;
  canvas.height = base.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return base;
  ctx.drawImage(base, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = '#fef2f2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

export function subscribeSpriteAtlas(listener: () => void): () => void {
  loadListeners.add(listener);
  ensureSpriteAtlasLoaded();
  return () => {
    loadListeners.delete(listener);
  };
}

export function ensureSpriteAtlasLoaded(): void {
  if (atlasLoadInitiated || typeof window === 'undefined') return;
  atlasLoadInitiated = true;

  (Object.keys(SHEET_URLS) as SheetKey[]).forEach((key) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      rawImages[key] = img;
      baseSheets[key] = chromaKeyMagentaSheet(img);
      loadListeners.forEach((fn) => fn());
    };
    img.src = SHEET_URLS[key];
  });
}

export function getRawSheetImage(sheet: SheetKey): HTMLImageElement | null {
  ensureSpriteAtlasLoaded();
  return rawImages[sheet] ?? null;
}

export function getSheetCanvas(sheet: SheetKey, hitFlash = false): HTMLCanvasElement | null {
  ensureSpriteAtlasLoaded();
  const base = baseSheets[sheet];
  if (!base) return null;

  if (hitFlash) {
    const fKey = `${sheet}:flash`;
    let flashCanvas = whiteFlashCache.get(fKey);
    if (!flashCanvas) {
      flashCanvas = buildWhiteFlashCanvas(base);
      whiteFlashCache.set(fKey, flashCanvas);
    }
    return flashCanvas;
  }

  return base;
}

export function getSkinSheetCanvas(
  sheet: SheetKey,
  _skin: FighterSkin,
  hitFlash = false
): HTMLCanvasElement | null {
  return getSheetCanvas(sheet, hitFlash);
}

export function getFighterScale(skin: FighterSkin): number {
  switch (skin) {
    case 'thalgrim':
      return 0.48; // ~68px tall runic crystal warden boss
    case 'baelgor':
      return 0.43; // ~72px tall infernal warlord boss
    case 'vorgath':
      return 0.39; // ~71px tall dungeon executioner boss
    case 'drax':
      return 0.40; // ~71px tall crowned Sorcerer-King boss
    case 'malakor':
      return 0.37; // ~70px tall coliseum champion boss
    case 'gorgar':
      return 0.42; // ~68px tall Viking horned boss
    case 'rival_aka':
      return 0.48; // ~65px tall braided sapphire warrior
    case 'wolf_raider':
      return 0.50;
    case 'monolith_spearman':
      return 0.51;
    case 'cult_acolyte':
      return 0.41;
    case 'crypt_skeleton':
      return 0.51;
    case 'pit_thrall':
      return 0.43;
    case 'drax_acolyte':
      return 0.45;
    case 'goblin_scout':
      return 0.76;
    case 'orc_marauder':
      return 0.68;
    case 'undead_warrior':
      return 0.74;
    case 'risen_zombie':
      return 0.74;
    case 'dire_wolf':
      return 0.66;
    case 'cave_bat':
      return 0.65;
    case 'spectral_wraith':
      return 0.64;
    case 'skeleton_mage':
      return 0.64;
    case 'imperial_halberdier':
      return 0.70;
    case 'stone_golem':
      return 0.74;
    case 'abyssal_demon':
      return 0.70;
    case 'krom':
    default:
      return 0.36; // ~67px tall unified Krom barbarian on 320x240
  }
}

function pickCycle(frames: SpriteFrameDef[], tick: number, ticksPerFrame: number): SpriteFrameDef {
  return frames[Math.floor(tick / ticksPerFrame) % frames.length];
}

function pickReverseCycle(
  frames: SpriteFrameDef[],
  tick: number,
  ticksPerFrame: number
): SpriteFrameDef {
  const revIdx =
    (frames.length - 1 - (Math.floor(tick / ticksPerFrame) % frames.length)) %
    frames.length;
  return frames[revIdx];
}

function pickProgress(
  frames: SpriteFrameDef[],
  actionTick: number,
  actionDuration: number
): SpriteFrameDef {
  const dur = Math.max(1, actionDuration);
  const idx = Math.min(
    frames.length - 1,
    Math.max(0, Math.floor((actionTick / dur) * frames.length))
  );
  return frames[idx];
}

export function getFighterAnimationFrames(
  skin: FighterSkin,
  action: FighterAction
): SpriteFrameDef[] {
  if (isMinionSkin(skin)) {
    const bank = MINION_BANKS[skin];
    switch (action) {
      case 'idle':
        return bank.idle;
      case 'walk_fwd':
      case 'walk_back':
        return bank.walk;
      case 'jump':
        return bank.jump;
      case 'crouch':
      case 'roll_fwd':
      case 'roll_back':
        return bank.crouch;
      case 'block_high':
        return bank.block;
      case 'slash_high':
      case 'cleave_overhead':
      case 'spin_decap':
      case 'boss_cast':
        return bank.slash;
      case 'thrust_mid':
      case 'sweep_low':
        return bank.sweep;
      case 'hit_stun':
      case 'parried_stun':
        return bank.hit;
      case 'knockdown':
        return bank.knockdown;
      case 'dead':
        return bank.dead;
      case 'decapitated':
        return bank.decapitated;
      case 'victory':
        return bank.victory;
    }
  }

  if (skin === 'rival_aka') {
    switch (action) {
      case 'idle':
        return RIVAL_IDLE;
      case 'walk_fwd':
      case 'walk_back':
        return RIVAL_WALK;
      case 'jump':
        return RIVAL_JUMP;
      case 'crouch':
        return RIVAL_CROUCH;
      case 'roll_fwd':
      case 'roll_back':
        return RIVAL_ROLL;
      case 'block_high':
        return RIVAL_BLOCK;
      case 'slash_high':
        return RIVAL_SLASH_DIRECT;
      case 'spin_decap':
        return RIVAL_SPIN_DECAP;
      case 'thrust_mid':
        return RIVAL_THRUST;
      case 'sweep_low':
        return RIVAL_SWEEP_LOW;
      case 'cleave_overhead':
      case 'boss_cast':
        return RIVAL_CLEAVE;
      case 'hit_stun':
        return RIVAL_HIT;
      case 'parried_stun':
        return [RIVAL_BLOCK[1], RIVAL_HIT[0], RIVAL_HIT[1]];
      case 'knockdown':
        return RIVAL_KNOCKDOWN;
      case 'dead':
        return RIVAL_DEAD;
      case 'decapitated':
        return RIVAL_DECAPITATED;
      case 'victory':
        return RIVAL_VICTORY;
    }
  }

  if (skin === 'gorgar') {
    switch (action) {
      case 'idle':
        return GORGAR_IDLE;
      case 'walk_fwd':
      case 'walk_back':
        return GORGAR_WALK;
      case 'jump':
        return GORGAR_JUMP;
      case 'crouch':
      case 'roll_fwd':
      case 'roll_back':
        return GORGAR_CROUCH;
      case 'block_high':
        return GORGAR_BLOCK;
      case 'slash_high':
        return GORGAR_SLASH;
      case 'cleave_overhead':
      case 'boss_cast':
        return GORGAR_CLEAVE;
      case 'sweep_low':
        return GORGAR_SWEEP_LOW;
      case 'thrust_mid':
      case 'spin_decap':
        return GORGAR_SPIN;
      case 'hit_stun':
        return GORGAR_HIT;
      case 'parried_stun':
        return [GORGAR_BLOCK[1], GORGAR_HIT[0], GORGAR_HIT[1]];
      case 'knockdown':
        return GORGAR_KNOCKDOWN;
      case 'dead':
        return GORGAR_DEAD;
      case 'decapitated':
        return GORGAR_DECAPITATED;
      case 'victory':
        return GORGAR_VICTORY;
    }
  }

  if (skin === 'vorgath') {
    switch (action) {
      case 'idle':
        return VORGATH_IDLE;
      case 'walk_fwd':
      case 'walk_back':
        return VORGATH_WALK;
      case 'jump':
        return VORGATH_JUMP;
      case 'crouch':
      case 'roll_fwd':
      case 'roll_back':
        return VORGATH_CROUCH;
      case 'block_high':
        return VORGATH_BLOCK;
      case 'slash_high':
      case 'cleave_overhead':
        return VORGATH_CLEAVE;
      case 'boss_cast':
        return VORGATH_CAST;
      case 'thrust_mid':
      case 'sweep_low':
      case 'spin_decap':
        return VORGATH_SWEEP;
      case 'hit_stun':
        return VORGATH_HIT;
      case 'parried_stun':
        return [VORGATH_BLOCK[1], VORGATH_HIT[0], VORGATH_HIT[1]];
      case 'knockdown':
        return VORGATH_KNOCKDOWN;
      case 'dead':
        return VORGATH_DEAD;
      case 'decapitated':
        return VORGATH_DECAPITATED;
      case 'victory':
        return VORGATH_VICTORY;
    }
  }

  if (skin === 'malakor') {
    switch (action) {
      case 'idle':
        return MALAKOR_IDLE;
      case 'walk_fwd':
      case 'walk_back':
        return MALAKOR_WALK;
      case 'jump':
        return MALAKOR_JUMP;
      case 'crouch':
        return MALAKOR_CROUCH;
      case 'roll_fwd':
      case 'roll_back':
        return MALAKOR_ROLL;
      case 'block_high':
        return MALAKOR_BLOCK;
      case 'slash_high':
      case 'cleave_overhead':
      case 'spin_decap':
      case 'boss_cast':
        return MALAKOR_SLASH;
      case 'thrust_mid':
        return MALAKOR_THRUST;
      case 'sweep_low':
        return MALAKOR_SWEEP;
      case 'hit_stun':
        return MALAKOR_HIT;
      case 'parried_stun':
        return [MALAKOR_BLOCK[1], MALAKOR_HIT[0], MALAKOR_HIT[1]];
      case 'knockdown':
        return MALAKOR_KNOCKDOWN;
      case 'dead':
        return MALAKOR_DEAD;
      case 'decapitated':
        return MALAKOR_DECAPITATED;
      case 'victory':
        return MALAKOR_VICTORY;
    }
  }

  if (skin === 'drax') {
    switch (action) {
      case 'idle':
        return DRAX_IDLE;
      case 'walk_fwd':
      case 'walk_back':
        return DRAX_WALK;
      case 'jump':
      case 'roll_fwd':
      case 'roll_back':
        return DRAX_JUMP;
      case 'crouch':
        return DRAX_CROUCH;
      case 'block_high':
        return DRAX_BLOCK;
      case 'boss_cast':
        return DRAX_CAST;
      case 'sweep_low':
        return DRAX_SWEEP;
      case 'slash_high':
      case 'thrust_mid':
      case 'cleave_overhead':
      case 'spin_decap':
        return DRAX_SLASH;
      case 'hit_stun':
        return DRAX_HIT;
      case 'parried_stun':
        return [DRAX_BLOCK[1], DRAX_HIT[0], DRAX_HIT[1]];
      case 'knockdown':
        return DRAX_KNOCKDOWN;
      case 'dead':
        return DRAX_DEAD;
      case 'decapitated':
        return DRAX_DECAPITATED;
      case 'victory':
        return DRAX_VICTORY;
    }
  }

  if (skin === 'thalgrim') {
    switch (action) {
      case 'idle':
        return THALGRIM_IDLE;
      case 'walk_fwd':
      case 'walk_back':
        return THALGRIM_WALK;
      case 'jump':
        return THALGRIM_JUMP;
      case 'crouch':
      case 'roll_fwd':
      case 'roll_back':
        return THALGRIM_CROUCH;
      case 'block_high':
        return THALGRIM_BLOCK;
      case 'slash_high':
      case 'cleave_overhead':
        return THALGRIM_CLEAVE;
      case 'boss_cast':
        return THALGRIM_CAST;
      case 'thrust_mid':
      case 'sweep_low':
      case 'spin_decap':
        return THALGRIM_SWEEP;
      case 'hit_stun':
        return THALGRIM_HIT;
      case 'parried_stun':
        return [THALGRIM_BLOCK[1], THALGRIM_HIT[0], THALGRIM_HIT[1]];
      case 'knockdown':
        return THALGRIM_KNOCKDOWN;
      case 'dead':
        return THALGRIM_DEAD;
      case 'decapitated':
        return THALGRIM_DECAPITATED;
      case 'victory':
        return THALGRIM_VICTORY;
    }
  }

  if (skin === 'baelgor') {
    switch (action) {
      case 'idle':
        return BAELGOR_IDLE;
      case 'walk_fwd':
      case 'walk_back':
        return BAELGOR_WALK;
      case 'jump':
        return BAELGOR_JUMP;
      case 'crouch':
        return BAELGOR_CROUCH;
      case 'roll_fwd':
      case 'roll_back':
        return BAELGOR_ROLL;
      case 'block_high':
        return BAELGOR_BLOCK;
      case 'slash_high':
      case 'cleave_overhead':
      case 'spin_decap':
        return BAELGOR_SLASH;
      case 'thrust_mid':
        return BAELGOR_THRUST;
      case 'boss_cast':
        return BAELGOR_CAST;
      case 'sweep_low':
        return BAELGOR_SWEEP;
      case 'hit_stun':
        return BAELGOR_HIT;
      case 'parried_stun':
        return [BAELGOR_BLOCK[1], BAELGOR_HIT[0], BAELGOR_HIT[1]];
      case 'knockdown':
        return BAELGOR_KNOCKDOWN;
      case 'dead':
        return BAELGOR_DEAD;
      case 'decapitated':
        return BAELGOR_DECAPITATED;
      case 'victory':
        return BAELGOR_VICTORY;
    }
  }

  switch (action) {
    case 'idle':
      return KROM_IDLE;
    case 'walk_fwd':
    case 'walk_back':
      return KROM_WALK;
    case 'jump':
      return KROM_JUMP;
    case 'crouch':
      return KROM_CROUCH;
    case 'roll_fwd':
    case 'roll_back':
      return KROM_ROLL;
    case 'block_high':
      return KROM_BLOCK;
    case 'slash_high':
      return KROM_SLASH_HIGH;
    case 'spin_decap':
      return KROM_SPIN_DECAP;
    case 'thrust_mid':
      return KROM_THRUST_MID;
    case 'sweep_low':
      return KROM_SWEEP_LOW;
    case 'cleave_overhead':
    case 'boss_cast':
      return KROM_CLEAVE_OVERHEAD;
    case 'hit_stun':
      return KROM_HIT_STUN;
    case 'parried_stun':
      return KROM_PARRIED_STUN;
    case 'knockdown':
      return KROM_KNOCKDOWN;
    case 'dead':
      return KROM_DEAD;
    case 'decapitated':
      return KROM_DECAPITATED;
    case 'victory':
      return KROM_VICTORY;
  }
}

export function selectFighterSpriteFrame(
  f: FighterState,
  globalTick: number
): SpriteFrameDef {
  const frames = getFighterAnimationFrames(f.skin, f.action);

  switch (f.action) {
    case 'idle':
      return pickCycle(frames, globalTick, 12);
    case 'walk_fwd':
      return pickCycle(frames, globalTick, 6);
    case 'walk_back':
      return pickReverseCycle(frames, globalTick, 7);
    case 'crouch':
      return frames.length > 1 && f.actionTick >= 5 ? frames[1] : frames[0];
    case 'block_high':
      return f.actionTick < 7 && frames.length > 1 ? frames[1] : frames[0];
    case 'victory':
      return pickCycle(frames, globalTick, 11);
    case 'knockdown':
      return pickProgress(frames, f.actionTick, f.actionDuration || 32);
    case 'dead':
      return frames[Math.min(frames.length - 1, Math.floor(f.actionTick / 7))];
    case 'decapitated':
      return frames[Math.min(frames.length - 1, Math.floor(f.actionTick / 9))];
    case 'roll_back': {
      const reversed = [...frames].reverse();
      return pickProgress(reversed, f.actionTick, f.actionDuration || 15);
    }
    default:
      return pickProgress(frames, f.actionTick, f.actionDuration || 20);
  }
}

export function selectGoblinSpriteFrame(
  phase: 'entering' | 'laughing' | 'dragging' | 'done',
  tick: number
): SpriteFrameDef {
  if (phase === 'laughing') {
    return pickCycle(GOBLIN_LAUGH_FRAMES, tick, 6);
  }
  if (phase === 'dragging') {
    return pickCycle(GOBLIN_DRAG_FRAMES, tick, 6);
  }
  return pickCycle(GOBLIN_WALK_FRAMES, tick, 5);
}

export type FxSpriteKind =
  | 'torch'
  | 'lava'
  | 'fireball'
  | 'sparks'
  | 'crow'
  | 'monolith'
  | 'brazier'
  | 'banner'
  | 'cage'
  | 'arcane_brazier'
  | 'portcullis_closed'
  | 'portcullis_open';

export function selectFxSpriteFrame(
  kind: FxSpriteKind,
  tick: number
): SpriteFrameDef {
  switch (kind) {
    case 'torch':
      return pickCycle(FX_TORCH_FRAMES, tick, 5);
    case 'lava':
      return pickCycle(FX_LAVA_FRAMES, tick, 8);
    case 'fireball':
      return pickCycle(FX_FIREBALL_FRAMES, tick, 4);
    case 'sparks':
      return pickCycle(FX_SPARK_FRAMES, tick, 3);
    case 'crow':
      return pickCycle(FX_CROW_FRAMES, tick, 6);
    case 'monolith':
      return pickCycle(FX_MONOLITH_FRAMES, tick, 10);
    case 'brazier':
      return pickCycle(FX_BRAZIER_FRAMES, tick, 5);
    case 'banner':
      return pickCycle(FX_BANNER_FRAMES, tick, 9);
    case 'cage':
      return pickCycle(FX_CAGE_FRAMES, tick, 11);
    case 'arcane_brazier':
      return pickCycle(FX_ARCANE_BRAZIER_FRAMES, tick, 5);
    case 'portcullis_closed':
      return FX_PORTCULLIS_CLOSED;
    case 'portcullis_open':
      return FX_PORTCULLIS_OPEN;
  }
}

export function getPortraitSpec(skin: FighterSkin): SpriteFrameDef {
  if (isMinionSkin(skin)) {
    const first = MINION_BANKS[skin].idle[0];
    const sz = Math.min(46, first.w, first.h);
    return {
      sheet: first.sheet,
      x: first.x + Math.max(0, Math.round(first.ax - sz * 0.45)),
      y: first.y + 2,
      w: sz,
      h: sz,
      ax: Math.round(sz / 2),
    };
  }

  switch (skin) {
    case 'rival_aka':
      return {
        sheet: 'rivalAka',
        x: RIVAL_COORDS.R_IDLE_0.x + 24,
        y: RIVAL_COORDS.R_IDLE_0.y,
        w: 50,
        h: 50,
        ax: 25,
      };
    case 'gorgar':
      return {
        sheet: 'gorgarBoss',
        x: GORGAR_COORDS.G_IDLE_0.x + 30,
        y: GORGAR_COORDS.G_IDLE_0.y + 2,
        w: 54,
        h: 54,
        ax: 27,
      };
    case 'thalgrim':
      return {
        sheet: 'thalgrimBoss',
        x: THALGRIM_COORDS.T_IDLE_0.x + 36,
        y: THALGRIM_COORDS.T_IDLE_0.y + 2,
        w: 54,
        h: 54,
        ax: 27,
      };
    case 'vorgath':
      return {
        sheet: 'vorgathBoss',
        x: VORGATH_COORDS.V_IDLE_0.x + 26,
        y: VORGATH_COORDS.V_IDLE_0.y + 18,
        w: 54,
        h: 54,
        ax: 27,
      };
    case 'malakor':
      return {
        sheet: 'malakorBoss',
        x: MALAKOR_COORDS.M_IDLE_0.x + 28,
        y: MALAKOR_COORDS.M_IDLE_0.y + 4,
        w: 54,
        h: 54,
        ax: 27,
      };
    case 'baelgor':
      return {
        sheet: 'baelgorBoss',
        x: BAELGOR_COORDS.B_IDLE_0.x + 24,
        y: BAELGOR_COORDS.B_IDLE_0.y + 4,
        w: 54,
        h: 54,
        ax: 27,
      };
    case 'drax':
      return {
        sheet: 'draxBoss',
        x: DRAX_COORDS.D_IDLE_0.x + 38,
        y: DRAX_COORDS.D_IDLE_0.y + 2,
        w: 52,
        h: 52,
        ax: 26,
      };
    case 'krom':
    default:
      return { sheet: 'kromHero', x: 42, y: 20, w: 54, h: 54, ax: 27 };
  }
}

// ============================================================================
// CATALOGUE DES PLANCHES & ANIMATIONS (100% Cohérentes — Armes, Sbires & Zones)
// ============================================================================
export interface MasterSheetCatalogEntry {
  id: string;
  category: 'players' | 'bosses' | 'minions' | 'stages' | 'animations';
  title: string;
  roleLabel: string;
  dimensionsLabel: string;
  frameCountLabel: string;
  colorKeyLabel: string;
  downloadUrl: string;
  fileName: string;
  cHeaderSymbol: string;
  sheetKey?: SheetKey;
  homeStage?: StageId;
  description: string;
  subDownloads?: { label: string; url: string; fileName: string }[];
}

export const MASTER_SHEETS_CATALOG: MasterSheetCatalogEntry[] = [
  {
    id: 'krom_unified',
    category: 'players',
    title: 'Krom · Planche Maîtresse Unifiée (J1)',
    roleLabel: 'Joueur 1 · Héros des Hautes-Brumes',
    dimensionsLabel: '1400 × 1320 px',
    frameCountLabel: '43 sprites',
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_j1_krom.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_j1_krom.png',
    cHeaderSymbol: 'SPRITE_KROM_UNIFIED',
    sheetKey: 'kromHero',
    homeStage: 'forest',
    description:
      'Planche intégrale espacée sans aucun débordement voisin : garde neutre à 4 poses avec flexion nette, marche à 4 pas utiles, fente d’estoc réordonnée, fendoir brise-garde fluide, moulinet décapitant 360°, esquive accroupie, saut à 4 poses, roulade 360°, chute, gisant et décapitation.',
  },
  {
    id: 'rival_aka',
    category: 'players',
    title: 'Rival AKA · Planche Maîtresse (J2)',
    roleLabel: 'Joueur 2 · Guerrier Saphir (PC ↔ AKA WiFi / USB)',
    dimensionsLabel: `${VERIFIED_SHEET_META.rivalAka.width} × ${VERIFIED_SHEET_META.rivalAka.height} px`,
    frameCountLabel: `${VERIFIED_SHEET_META.rivalAka.count} sprites`,
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_j2_rival_aka.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_j2_rival_aka.png',
    cHeaderSymbol: 'SPRITE_RIVAL_AKA',
    sheetKey: 'rivalAka',
    homeStage: 'arena',
    description:
      'Planche isolée zéro parasite : garde saphir respirante à 4 poses fléchies, pas de duel épuré, tailles et fendoir séparés, moulinet 360°, esquive accroupie à 2 phases, roulade avant 360° remise à l’endroit, saut propre, gisant, décapitation 4 poses et salut.',
  },
  {
    id: 'boss_gorgar',
    category: 'bosses',
    title: 'Gorgar · Garde-Frontière des Monolithes',
    roleLabel: 'Boss Acte I · Clairières Cendrées',
    dimensionsLabel: `${VERIFIED_SHEET_META.gorgarBoss.width} × ${VERIFIED_SHEET_META.gorgarBoss.height} px`,
    frameCountLabel: `${VERIFIED_SHEET_META.gorgarBoss.count} sprites`,
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_boss1_gorgar.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_boss1_gorgar.png',
    cHeaderSymbol: 'SPRITE_BOSS_GORGAR',
    sheetKey: 'gorgarBoss',
    homeStage: 'forest',
    description:
      'Planche reconstruite zéro parasite : garde respirante à 4 poses, marche lourde, fendoir vertical 5 phases, moulinet horizontal à une seule hache double, parade, esquive basse 2 phases, saut, chute orientée, gisant et décapitation dédiée en 4 poses.',
  },
  {
    id: 'boss_thalgrim',
    category: 'bosses',
    title: 'Thalgrim · Gardien des Profondeurs Cristallines',
    roleLabel: 'Boss Acte II · Cavernes Cristallines',
    dimensionsLabel: `${NEW_SHEET_META.thalgrimBoss.width} × ${NEW_SHEET_META.thalgrimBoss.height} px`,
    frameCountLabel: `${NEW_SHEET_META.thalgrimBoss.count} sprites`,
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_boss_thalgrim.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_boss_thalgrim.png',
    cHeaderSymbol: 'SPRITE_BOSS_THALGRIM',
    sheetKey: 'thalgrimBoss',
    homeStage: 'caverns',
    description:
      'Seigneur runique des Cavernes Cristallines armé d’un marteau-cristal cyan : garde respirante 4 poses, marche lourde, fendoir runique, onde sismique cristalline, parade 3 poses, flexion basse, bond souterrain, gisant et décapitation dédiée.',
  },
  {
    id: 'boss_vorgath',
    category: 'bosses',
    title: 'Vorgath · Le Bourreau des Basaltes',
    roleLabel: 'Boss Acte III · Cryptes d’Obsidienne',
    dimensionsLabel: `${VERIFIED_SHEET_META.vorgathBoss.width} × ${VERIFIED_SHEET_META.vorgathBoss.height} px`,
    frameCountLabel: `${VERIFIED_SHEET_META.vorgathBoss.count} sprites`,
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_boss2_vorgath.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_boss2_vorgath.png',
    cHeaderSymbol: 'SPRITE_BOSS_VORGATH',
    sheetKey: 'vorgathBoss',
    homeStage: 'crypt',
    description:
      'Planche reconstruite zéro parasite : respiration lourde à 4 poses, marche armée, frappe sismique de lave, grand revers horizontal nettoyé, parade murale, garde basse 2 poses, saut massif, impact, KO gisant et décapitation dédiée en 4 poses.',
  },
  {
    id: 'boss_malakor',
    category: 'bosses',
    title: 'Malakor · Champion Invaincu de la Fosse',
    roleLabel: 'Boss Acte IV · Arène des Ossements',
    dimensionsLabel: `${VERIFIED_SHEET_META.malakorBoss.width} × ${VERIFIED_SHEET_META.malakorBoss.height} px`,
    frameCountLabel: `${VERIFIED_SHEET_META.malakorBoss.count} sprites`,
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_boss3_malakor.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_boss3_malakor.png',
    cHeaderSymbol: 'SPRITE_BOSS_MALAKOR',
    sheetKey: 'malakorBoss',
    homeStage: 'arena',
    description:
      'Planche reconstruite zéro parasite à une seule épée dentelée : garde souple 4 poses, pas d’arène, tailles, estoc profond, parade, accroupissement 2 poses, vraie roulade 360° armée, saut aérien dédié, gisant et décapitation dédiée en 4 poses.',
  },
  {
    id: 'boss_baelgor',
    category: 'bosses',
    title: 'Baelgor · Archonte des Brasiers Infernaux',
    roleLabel: 'Boss Acte V · Citadelle des Brasiers',
    dimensionsLabel: `${NEW_SHEET_META.baelgorBoss.width} × ${NEW_SHEET_META.baelgorBoss.height} px`,
    frameCountLabel: `${NEW_SHEET_META.baelgorBoss.count} sprites`,
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_boss_baelgor.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_boss_baelgor.png',
    cHeaderSymbol: 'SPRITE_BOSS_BAELGOR',
    sheetKey: 'baelgorBoss',
    homeStage: 'inferno',
    description:
      'Seigneur de guerre infernal cornu brandissant son espadon de magma : garde ardente 4 poses, marche cuirassée, tailles et estocs flamboyants, roulade d’assaut 360°, saut volcanique, gisant et décapitation dédiée.',
  },
  {
    id: 'boss_drax',
    category: 'bosses',
    title: 'Seigneur Drax · Sorcier-Roi de la Citadelle',
    roleLabel: 'Boss Final Acte VI · Sanctuaire Foudroyé',
    dimensionsLabel: `${VERIFIED_SHEET_META.draxBoss.width} × ${VERIFIED_SHEET_META.draxBoss.height} px`,
    frameCountLabel: `${VERIFIED_SHEET_META.draxBoss.count} sprites`,
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_boss4_seigneur_drax.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_boss4_seigneur_drax.png',
    cHeaderSymbol: 'SPRITE_BOSS_DRAX',
    sheetKey: 'draxBoss',
    homeStage: 'sanctuary',
    description:
      'Planche reconstruite zéro parasite : présence royale respirante, marche à 5 pas, tailles runiques, invocation d’orbe noir épée en main, parade, vraie esquive accroupie au sol, bond d’ombre, KO gisant et décapitation dédiée en 4 poses.',
  },
  {
    id: 'monsters_11_bestiary',
    category: 'minions',
    title: 'Planche Bestiaire des 11 Monstres de Campagne',
    roleLabel: '11 Monstres Variés Répartis sur les 6 Actes (0 Texte Parasite)',
    dimensionsLabel: `${NEW_SHEET_META.monsters11Sheet.width} × ${NEW_SHEET_META.monsters11Sheet.height} px`,
    frameCountLabel: `${NEW_SHEET_META.monsters11Sheet.count} sprites (11 monstres)`,
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_11_monstres.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_11_monstres.png',
    cHeaderSymbol: 'SPRITE_MONSTERS_11',
    sheetKey: 'monsters11Sheet',
    homeStage: 'caverns',
    description:
      'Réunit 11 créatures pixel-art intégralement nettoyées de toute annotation texte : Gobelin Éclaireur, Orque Maraudeur, Guerrier Squelette, Zombie Putréfié, Loup Sinistre, Chauve-Souris Cavernicole, Spectre Hurlant, Mage Squelette, Hallebardier Impérial, Golem de Pierre et Démon Abyssal.',
  },
  {
    id: 'minions_zones',
    category: 'minions',
    title: 'Planche des 6 Sbires & Éclaireurs des Zones',
    roleLabel: '6 Ennemis de Faction façon Double Dragon (1 à 5 coups)',
    dimensionsLabel: `${VERIFIED_SHEET_META.minionsSheet.width} × ${VERIFIED_SHEET_META.minionsSheet.height} px`,
    frameCountLabel: `${VERIFIED_SHEET_META.minionsSheet.count} sprites (6 × 21)`,
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_sbires_zones.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_sbires_zones.png',
    cHeaderSymbol: 'SPRITE_ZONE_MINIONS',
    sheetKey: 'minionsSheet',
    homeStage: 'forest',
    description:
      'Réunit les 6 adversaires de faction régionaux : Pillard Loup-Gris, Garde des Monolithes, Fanatique d’Obsidienne, Squelette Légionnaire, Écorcheur des Sables et Sentinelle Spectrale — chacun doté de 21 poses incluant KO et décapitation 4 poses.',
  },
  {
    id: 'zones_scrolling_atlas',
    category: 'stages',
    title: 'Les 6 Panoramas Défilants Continus (1800×240)',
    roleLabel: '6 Zones Narratives Sans Raccord Visible (Actes I à VI)',
    dimensionsLabel: '6 × 1800 × 240 px',
    frameCountLabel: '6 panoramas pixel-art continus',
    colorKeyLabel: 'RGB565 Défilement Horizontal',
    downloadUrl: `/sheets/panorama_acte1_foret.png?${SHEET_CACHE_REV}`,
    fileName: 'panorama_acte1_foret.png',
    cHeaderSymbol: 'PANO_ACT1..PANO_ACT6',
    description:
      'Les 6 fresques panoramiques continues 1800×240 d’un seul tenant : Clairières & Portail Runique (Acte I), Escalier & Cavernes Cristallines (Acte II), Ruines Souterraines & Cryptes de Lave (Acte III), Forteresse du Crépuscule & Colisée (Acte IV), Remparts Lunaires & Citadelle des Brasiers (Acte V) et Viaduc Noir & Sanctuaire de Drax (Acte VI).',
    subDownloads: [
      {
        label: 'Acte I · Forêt & Portail (1800×240)',
        url: '/sheets/panorama_acte1_foret.png',
        fileName: 'panorama_acte1_foret.png',
      },
      {
        label: 'Acte II · Cavernes Cristallines (1800×240)',
        url: '/sheets/panorama_acte2_cavernes.png',
        fileName: 'panorama_acte2_cavernes.png',
      },
      {
        label: 'Acte III · Cryptes & Lave (1800×240)',
        url: '/sheets/panorama_acte3_crypte.png',
        fileName: 'panorama_acte3_crypte.png',
      },
      {
        label: 'Acte IV · Remparts & Arène (1800×240)',
        url: '/sheets/panorama_acte4_arene.png',
        fileName: 'panorama_acte4_arene.png',
      },
      {
        label: 'Acte V · Citadelle des Brasiers (1800×240)',
        url: '/sheets/panorama_acte5_citadelle.png',
        fileName: 'panorama_acte5_citadelle.png',
      },
      {
        label: 'Acte VI · Sanctuaire de Drax (1800×240)',
        url: '/sheets/panorama_acte6_sanctuaire.png',
        fileName: 'panorama_acte6_sanctuaire.png',
      },
    ],
  },
  {
    id: 'stages_atlas',
    category: 'stages',
    title: 'Planche des 6 Décors d’Arène (Atlas 3×2 · 320×240)',
    roleLabel: '6 Arènes de Boss Natives Écran TFT Gamebuino AKA',
    dimensionsLabel: '960 × 480 px (6 × 320×240)',
    frameCountLabel: '6 décors complets',
    colorKeyLabel: 'RGB565 Plein Écran 320×240',
    downloadUrl: `/sheets/planche_decors_320x240.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_decors_320x240.png',
    cHeaderSymbol: 'STAGE_ATLAS_320X240',
    description:
      'Réunit à l’échelle exacte 1:1 les 6 arènes 320×240 des duels de boss : Clairières Cendrées, Cavernes Cristallines, Cryptes d’Obsidienne, Arène des Ossements, Citadelle des Brasiers et Sanctuaire Foudroyé de Drax.',
    subDownloads: [
      {
        label: 'Acte I · Forêt (320×240)',
        url: '/sheets/decor_acte1_foret_320x240.png',
        fileName: 'decor_acte1_foret_320x240.png',
      },
      {
        label: 'Acte II · Cavernes (320×240)',
        url: '/sheets/decor_acte2_cavernes_320x240.png',
        fileName: 'decor_acte2_cavernes_320x240.png',
      },
      {
        label: 'Acte III · Crypte (320×240)',
        url: '/sheets/decor_acte3_crypte_320x240.png',
        fileName: 'decor_acte3_crypte_320x240.png',
      },
      {
        label: 'Acte IV · Arène (320×240)',
        url: '/sheets/decor_acte4_arene_320x240.png',
        fileName: 'decor_acte4_arene_320x240.png',
      },
      {
        label: 'Acte V · Citadelle (320×240)',
        url: '/sheets/decor_acte5_citadelle_320x240.png',
        fileName: 'decor_acte5_citadelle_320x240.png',
      },
      {
        label: 'Acte VI · Sanctuaire (320×240)',
        url: '/sheets/decor_acte6_sanctuaire_320x240.png',
        fileName: 'decor_acte6_sanctuaire_320x240.png',
      },
    ],
  },
  {
    id: 'goblin_and_fx',
    category: 'animations',
    title: 'Planche Grik le Gobelin & Animations d’Arène',
    roleLabel: 'PNJ Nettoyeur d’Arène, Projectiles & Décors Animés',
    dimensionsLabel: `${VERIFIED_SHEET_META.goblinAndFx.width} × ${VERIFIED_SHEET_META.goblinAndFx.height} px`,
    frameCountLabel: `${VERIFIED_SHEET_META.goblinAndFx.count} sprites`,
    colorKeyLabel: 'Fond #FF00FF (0xF81F)',
    downloadUrl: `/sheets/planche_gobelin_et_animations.png?${SHEET_CACHE_REV}`,
    fileName: 'planche_gobelin_et_animations.png',
    cHeaderSymbol: 'SPRITE_GOBLIN_AND_FX',
    sheetKey: 'goblinAndFx',
    homeStage: 'crypt',
    description:
      'Grik le Gobelin isolé sans chevauchement de corde (marche, rire « Heh Heh ! », traction du vaincu), torches détourées sans halo rose, lave en fusion, orbes noirs, étincelles de choc, corbeau, monolithes et braseros.',
  },
];

// ============================================================================
// PRÉSENTATION DÉTAILLÉE DES ANIMATIONS PAR PERSONNAGE & 17 MONSTRES
// ============================================================================
export interface CharacterAnimationSequenceSpec {
  id: string;
  label: string;
  inputHint: string;
  ticksPerFrame: number;
  isRollOrEvade?: boolean;
  isJump?: boolean;
  notes: string;
  frames: SpriteFrameDef[];
}

export interface CharacterAnimationDossier {
  actorId:
    | 'krom'
    | 'rival_aka'
    | 'gorgar'
    | 'thalgrim'
    | 'vorgath'
    | 'malakor'
    | 'baelgor'
    | 'drax'
    | MinionSkin
    | 'goblin'
    | 'stage_fx';
  name: string;
  subtitle: string;
  weaponSummary: string;
  outfitSummary: string;
  evasionDoctrine: string;
  hasAcrobaticRoll: boolean;
  stage: StageId;
  skin?: FighterSkin;
  sequences: CharacterAnimationSequenceSpec[];
}

function buildMinionDossier(
  skin: MinionSkin,
  name: string,
  subtitle: string,
  weaponSummary: string,
  outfitSummary: string,
  stage: StageId
): CharacterAnimationDossier {
  const b = MINION_BANKS[skin];
  return {
    actorId: skin,
    name,
    subtitle,
    weaponSummary,
    outfitSummary,
    evasionDoctrine:
      'Adversaire de traversée conçu pour le rythme beat-’em-up : garde lisible, attaques télégraphiées et chute/décapitation dédiées.',
    hasAcrobaticRoll: false,
    stage,
    skin,
    sequences: [
      { id: 'idle', label: 'Garde / Patrouille', inputHint: 'Patrouille', ticksPerFrame: 12, notes: 'Posture d’attente respirante sur la chaussée.', frames: b.idle },
      { id: 'walk_fwd', label: 'Approche en Zone', inputHint: 'IA Marche', ticksPerFrame: 8, notes: 'Cycle de déplacement vers Krom.', frames: b.walk },
      { id: 'slash_high', label: 'Attaque Principale', inputHint: 'IA Frappe', ticksPerFrame: 8, notes: 'Attaque télégraphiée laissant l’ouverture à la parade L1 ou à l’esquive.', frames: b.slash },
      { id: 'sweep_low', label: 'Assaut Bas', inputHint: 'IA Basse', ticksPerFrame: 8, notes: 'Engagement bas forçant la mobilité.', frames: b.sweep },
      { id: 'block_high', label: 'Garde Courte', inputHint: 'IA Défense', ticksPerFrame: 10, notes: 'Défense brève que le Fendoir ou le Balayage ouvre.', frames: b.block },
      { id: 'crouch', label: 'Posture Basse', inputHint: 'IA Esquive', ticksPerFrame: 10, isRollOrEvade: true, notes: 'Flexion compacte.', frames: b.crouch },
      { id: 'hit_stun', label: 'Impact Subi', inputHint: 'Dégâts', ticksPerFrame: 9, notes: 'Recul sous le glaive de Krom.', frames: b.hit },
      { id: 'dead', label: 'Chute & KO', inputHint: 'PV à 0', ticksPerFrame: 9, notes: 'Effondrement complet sur les dalles.', frames: b.dead },
      { id: 'gisant', label: 'Corps Gisant', inputHint: 'Au sol', ticksPerFrame: 14, notes: 'Étendu au sol avant disparition.', frames: b.gisant },
      { id: 'decapitated', label: 'Exécution Fatale (+300 PTS)', inputHint: 'Moulinet C', ticksPerFrame: 10, notes: 'Séquence d’exécution fatale avec bonus de score arcade !', frames: b.decapitated },
    ],
  };
}

export const CHARACTER_ANIMATION_DOSSIERS: CharacterAnimationDossier[] = [
  {
    actorId: 'krom',
    name: 'Krom le Barbare · Joueur 1',
    subtitle: 'Héros jouable · Campagne 6 Actes (Zones + Boss) & Duel Local',
    weaponSummary: 'Glaive d’acier lourd à deux mains (unique sur les 43 poses, zéro résidu voisin)',
    outfitSummary: 'Baudrier de cuir croisé, ceinture à crâne d’argent, pagne de fourrure brune et bottes fourrées',
    evasionDoctrine:
      'Roulade avant/arrière 360° complète en 5 poses nettoyées + esquive accroupie à 2 phases.',
    hasAcrobaticRoll: true,
    stage: 'forest',
    skin: 'krom',
    sequences: [
      { id: 'idle', label: 'Garde Neutre', inputHint: 'Repos', ticksPerFrame: 14, notes: '4 poses exclusives avec flexion de jambes et respiration nettes.', frames: KROM_IDLE },
      { id: 'walk_fwd', label: 'Marche d’Approche', inputHint: '← / →', ticksPerFrame: 9, notes: 'Cycle épuré aux 4 pas distincts.', frames: KROM_WALK },
      { id: 'slash_high', label: 'Taille Haute', inputHint: 'Bouton A', ticksPerFrame: 8, notes: 'Préparation, levée, grand arc horizontal, allonge et retour fluide.', frames: KROM_SLASH_HIGH },
      { id: 'spin_decap', label: 'Moulinet Décapitant 360°', inputHint: 'Bouton C', ticksPerFrame: 8, notes: 'Pivot complet à 360° fauchant simultanément les monstres à portée ou décapitant le boss.', frames: KROM_SPIN_DECAP },
      { id: 'thrust_mid', label: 'Fente d’Estoc', inputHint: 'Avant + A', ticksPerFrame: 8, notes: 'Poses réordonnées avec retour en garde propre.', frames: KROM_THRUST_MID },
      { id: 'sweep_low', label: 'Balayage Bas', inputHint: 'Bas + A / B', ticksPerFrame: 8, notes: 'Flexion basse, fente rasante, fauchage bas et reprise d’appui.', frames: KROM_SWEEP_LOW },
      { id: 'cleave_overhead', label: 'Fendoir Brise-Garde', inputHint: 'R1 / Haut + A', ticksPerFrame: 8, notes: 'Mouvement continu en 5 phases du haut vers le sol.', frames: KROM_CLEAVE_OVERHEAD },
      { id: 'block_high', label: 'Parade au Glaive', inputHint: 'Bouton L1', ticksPerFrame: 11, notes: 'Garde verticale à deux mains et contre-étincelles.', frames: KROM_BLOCK },
      { id: 'parried_stun', label: 'Garde Ouverte (Contré)', inputHint: 'Parade adverse', ticksPerFrame: 10, notes: 'Déséquilibre après un coup contré.', frames: KROM_PARRIED_STUN },
      { id: 'crouch', label: 'Esquive Accroupie', inputHint: 'Bas', ticksPerFrame: 11, notes: '2 poses : abaissement de garde puis flexion basse.', frames: KROM_CROUCH },
      { id: 'roll_fwd', label: 'Roulade Armée 360°', inputHint: 'Bouton D', ticksPerFrame: 8, isRollOrEvade: true, notes: '5 phases progressives avec sortie accroupie.', frames: KROM_ROLL },
      { id: 'jump', label: 'Saut d’Assaut', inputHint: 'Haut', ticksPerFrame: 9, isJump: true, notes: '4 poses complètes : appel fléchi, montée, sommet aérien et réception.', frames: KROM_JUMP },
      { id: 'hit_stun', label: 'Impact Encaissé', inputHint: 'Dégâts', ticksPerFrame: 10, notes: '2 poses de recul sous le choc.', frames: KROM_HIT_STUN },
      { id: 'knockdown', label: 'Mise au Tapis & Relevée', inputHint: 'Balayage subi', ticksPerFrame: 9, notes: 'Chute sur le dos suivie d’une reprise d’appui.', frames: KROM_KNOCKDOWN },
      { id: 'dead', label: 'Chute & KO Complet', inputHint: 'PV à 0', ticksPerFrame: 10, notes: 'Effondrement progressif en 6 étapes.', frames: KROM_DEAD },
      { id: 'gisant', label: 'Personnage Gisant (KO)', inputHint: 'Étendu au sol', ticksPerFrame: 16, notes: 'Étendu à plat dos sur le sol, glaive posé à ses côtés.', frames: KROM_GISANT },
      { id: 'decapitated', label: 'Décapitation Subie & Gisant', inputHint: 'Coup fatal C', ticksPerFrame: 12, notes: '4 étapes dédiées sans tête jusqu’au corps gisant.', frames: KROM_DECAPITATED },
      { id: 'victory', label: 'Triomphe Barbare', inputHint: 'Manche gagnée', ticksPerFrame: 12, notes: 'Cycle aller-retour brandissant le glaive.', frames: KROM_VICTORY },
    ],
  },
  {
    actorId: 'rival_aka',
    name: 'Rival AKA · Joueur 2',
    subtitle: 'Guerrier Saphir · Duel Multijoueur PC ↔ Gamebuino AKA',
    weaponSummary: 'Épée large d’acier (unique sur les 39 poses, zéro fragment parasite)',
    outfitSummary: 'Tresse blonde, peintures de guerre bleues, écharpe et pagne azur, bottes de cuir brun',
    evasionDoctrine:
      'Roulade acrobatique avant 360° en 4 poses corrigées + garde accroupie dédiée à 2 phases.',
    hasAcrobaticRoll: true,
    stage: 'arena',
    skin: 'rival_aka',
    sequences: [
      { id: 'idle', label: 'Garde Saphir', inputHint: 'Repos', ticksPerFrame: 12, notes: '4 poses respirantes avec flexion de genoux visible.', frames: RIVAL_IDLE },
      { id: 'walk_fwd', label: 'Pas de Duel', inputHint: '← / →', ticksPerFrame: 9, notes: '4 poses de pas utiles sans pose statique.', frames: RIVAL_WALK },
      { id: 'slash_high', label: 'Taille Horizontale', inputHint: 'Bouton A', ticksPerFrame: 8, notes: 'Armement arrière, grand arc horizontal, allonge directe et retour fluide.', frames: RIVAL_SLASH_DIRECT },
      { id: 'thrust_mid', label: 'Fente d’Estoc', inputHint: 'Avant + A', ticksPerFrame: 8, notes: 'Engagement fléchi et pointe tendue vers l’avant.', frames: RIVAL_THRUST },
      { id: 'sweep_low', label: 'Balayage Bas', inputHint: 'Bas + A / B', ticksPerFrame: 8, notes: 'Flexion basse enchaînée vers une coupe rasante aux tibias.', frames: RIVAL_SWEEP_LOW },
      { id: 'cleave_overhead', label: 'Fendoir Descendant', inputHint: 'R1 / Haut + A', ticksPerFrame: 9, notes: 'Préparation, coupe diagonale haute et abattage bas tranchant.', frames: RIVAL_CLEAVE },
      { id: 'spin_decap', label: 'Moulinet Décapitant 360°', inputHint: 'Bouton C', ticksPerFrame: 8, notes: 'Pivot complet à 360° et fauchage horizontal à hauteur de nuque.', frames: RIVAL_SPIN_DECAP },
      { id: 'block_high', label: 'Parade Haute', inputHint: 'Bouton L1', ticksPerFrame: 11, notes: 'Lame dressée verticalement devant le visage.', frames: RIVAL_BLOCK },
      { id: 'crouch', label: 'Garde Accroupie', inputHint: 'Bas', ticksPerFrame: 11, notes: '2 phases d’abaissement stable sur les bottes.', frames: RIVAL_CROUCH },
      { id: 'roll_fwd', label: 'Roulade Avant 360°', inputHint: 'Bouton D', ticksPerFrame: 8, isRollOrEvade: true, notes: '4 poses cohérentes remises dans le bon sens.', frames: RIVAL_ROLL },
      { id: 'jump', label: 'Bond Lame Haute', inputHint: 'Haut', ticksPerFrame: 8, isJump: true, notes: 'Appel fléchi, 3 poses aériennes nettoyées et réception.', frames: RIVAL_JUMP },
      { id: 'hit_stun', label: 'Impact Reçu', inputHint: 'Dégâts', ticksPerFrame: 9, notes: 'Recul en 3 poses sans lâcher l’épée.', frames: RIVAL_HIT },
      { id: 'knockdown', label: 'Mise au Tapis & Relevée', inputHint: 'Balayage subi', ticksPerFrame: 9, notes: 'Déséquilibre, chute au sable et relevée accroupie.', frames: RIVAL_KNOCKDOWN },
      { id: 'dead', label: 'Chute & KO au Sol', inputHint: 'PV à 0', ticksPerFrame: 10, notes: '5 étapes progressives jusqu’au KO complet.', frames: RIVAL_DEAD },
      { id: 'gisant', label: 'Personnage Gisant (KO)', inputHint: 'Étendu au sol', ticksPerFrame: 16, notes: 'Guerrier Saphir étendu immobile au sol.', frames: RIVAL_GISANT },
      { id: 'decapitated', label: 'Décapitation Subie & Gisant', inputHint: 'Coup fatal C', ticksPerFrame: 12, notes: '4 poses dédiées jusqu’au corps gisant décapité.', frames: RIVAL_DECAPITATED },
      { id: 'victory', label: 'Salut du Vainqueur', inputHint: 'Manche gagnée', ticksPerFrame: 12, notes: 'Cycle fluide nettoyé au-dessus de l’épée.', frames: RIVAL_VICTORY },
    ],
  },
  {
    actorId: 'gorgar',
    name: 'Gorgar · Boss Acte I',
    subtitle: 'Boss des Clairières Cendrées · Colosse Viking',
    weaponSummary: 'Une seule hache de guerre à double tranchant sur les 36 poses (0 parasite)',
    outfitSummary: 'Casque viking à cornes, cape en fourrure de loup grise, pagne d’écailles et bottes fourrées',
    evasionDoctrine:
      'Colosse lourd : esquive basse en 2 poses fléchies ou bond sauvage aérien.',
    hasAcrobaticRoll: false,
    stage: 'forest',
    skin: 'gorgar',
    sequences: [
      { id: 'idle', label: 'Garde Nordique', inputHint: 'IA Repos', ticksPerFrame: 12, notes: '4 poses respirantes avec flexion massive des épaules.', frames: GORGAR_IDLE },
      { id: 'walk_fwd', label: 'Marche Lourde', inputHint: 'IA Approche', ticksPerFrame: 8, notes: '4 pas pesants sans aucun artefact voisin.', frames: GORGAR_WALK },
      { id: 'slash_high', label: 'Taille de Hache', inputHint: 'Attaque Directe', ticksPerFrame: 7, notes: 'Armement latéral et grand arc tranchant.', frames: GORGAR_SLASH },
      { id: 'cleave_overhead', label: 'Fendoir Brise-Crâne', inputHint: 'Attaque Haute', ticksPerFrame: 7, notes: '5 poses continues d’abattage vertical.', frames: GORGAR_CLEAVE },
      { id: 'spin_decap', label: 'Moulinet Horizontal', inputHint: 'Attaque Circulaire', ticksPerFrame: 7, notes: '5 poses circulaires à une seule hache.', frames: GORGAR_SPIN },
      { id: 'sweep_low', label: 'Fauchage Bas', inputHint: 'Attaque Basse', ticksPerFrame: 8, notes: 'Flexion et coupe basse au ras des bottes.', frames: GORGAR_SWEEP_LOW },
      { id: 'block_high', label: 'Parade de Hache', inputHint: 'Défense IA', ticksPerFrame: 10, notes: '2 poses de blocage manche et fer croisés.', frames: GORGAR_BLOCK },
      { id: 'crouch', label: 'Esquive Basse Lourde', inputHint: 'Esquive Haute', ticksPerFrame: 10, isRollOrEvade: true, notes: '2 phases d’accroupissement lourd sous les tailles hautes.', frames: GORGAR_CROUCH },
      { id: 'jump', label: 'Bond Sauvage', inputHint: 'Esquive Basse', ticksPerFrame: 8, isJump: true, notes: '4 phases : appel, montée, sommet et réception.', frames: GORGAR_JUMP },
      { id: 'hit_stun', label: 'Choc Encaissé', inputHint: 'Dégâts', ticksPerFrame: 9, notes: '2 poses de recul hache en main.', frames: GORGAR_HIT },
      { id: 'knockdown', label: 'Mise au Tapis & Relevée', inputHint: 'Balayage subi', ticksPerFrame: 9, notes: 'Chute lourde et reprise sur les genoux.', frames: GORGAR_KNOCKDOWN },
      { id: 'dead', label: 'Chute Cohérente & KO', inputHint: 'PV à 0', ticksPerFrame: 10, notes: '4 poses tombant toutes dans la même direction.', frames: GORGAR_DEAD },
      { id: 'gisant', label: 'Colosse Gisant', inputHint: 'Étendu au sol', ticksPerFrame: 16, notes: 'Gorgar étendu au pied des monolithes.', frames: GORGAR_GISANT },
      { id: 'decapitated', label: 'Décapitation Subie & Gisant', inputHint: 'Coup fatal C', ticksPerFrame: 11, notes: '4 poses dédiées sans casque ni tête jusqu’au corps gisant !', frames: GORGAR_DECAPITATED },
      { id: 'victory', label: 'Rugissement Nordique', inputHint: 'Victoire Boss', ticksPerFrame: 11, notes: 'Hache levée à bout de bras.', frames: GORGAR_VICTORY },
    ],
  },
  {
    actorId: 'thalgrim',
    name: 'Thalgrim · Boss Acte II',
    subtitle: 'Boss des Cavernes Cristallines · Gardien Runique',
    weaponSummary: 'Marteau de guerre serti de cristal cyan sur les 34 poses (0 parasite)',
    outfitSummary: 'Barbe tressée d’argent, armure runique sombre incrustée de gemmes bleues',
    evasionDoctrine:
      'Rempart minéral : flexion basse à 3 poses sous les tailles hautes et saut d’impact brise-roche.',
    hasAcrobaticRoll: false,
    stage: 'caverns',
    skin: 'thalgrim',
    sequences: [
      { id: 'idle', label: 'Veille Cristalline', inputHint: 'IA Repos', ticksPerFrame: 12, notes: '4 poses respirantes marteau runique en main.', frames: THALGRIM_IDLE },
      { id: 'walk_fwd', label: 'Pas Souterrain', inputHint: 'IA Approche', ticksPerFrame: 8, notes: '4 pas lourds faisant vibrer la roche.', frames: THALGRIM_WALK },
      { id: 'cleave_overhead', label: 'Fracas de Cristal', inputHint: 'Attaque Haute', ticksPerFrame: 8, notes: '4 phases d’impact runique descendant.', frames: THALGRIM_CLEAVE },
      { id: 'boss_cast', label: 'Onde Sismique Cyan', inputHint: 'Spécial Boss', ticksPerFrame: 8, notes: 'Frappe la dalle et projette une onde cristalline au ras du sol.', frames: THALGRIM_CAST },
      { id: 'sweep_low', label: 'Balayage Minéral', inputHint: 'Attaque Basse', ticksPerFrame: 8, notes: '4 poses de fauchage horizontal lourd.', frames: THALGRIM_SWEEP },
      { id: 'block_high', label: 'Rempart Runique', inputHint: 'Défense IA', ticksPerFrame: 10, notes: '3 poses de garde renforcée.', frames: THALGRIM_BLOCK },
      { id: 'crouch', label: 'Ancrage Bas', inputHint: 'Esquive Haute', ticksPerFrame: 10, isRollOrEvade: true, notes: '3 poses d’accroupissement lourd.', frames: THALGRIM_CROUCH },
      { id: 'jump', label: 'Bond Brise-Voûte', inputHint: 'Esquive Basse', ticksPerFrame: 8, isJump: true, notes: '4 poses de saut massif.', frames: THALGRIM_JUMP },
      { id: 'hit_stun', label: 'Recul Sous Choc', inputHint: 'Dégâts', ticksPerFrame: 9, notes: 'Encaissement lourd.', frames: THALGRIM_HIT },
      { id: 'dead', label: 'Effondrement & KO', inputHint: 'PV à 0', ticksPerFrame: 10, notes: '4 étapes jusqu’au KO.', frames: THALGRIM_DEAD },
      { id: 'gisant', label: 'Gardien Gisant', inputHint: 'Étendu au sol', ticksPerFrame: 16, notes: 'Thalgrim étendu parmi les cristaux.', frames: THALGRIM_GISANT },
      { id: 'decapitated', label: 'Décapitation Subie', inputHint: 'Coup fatal C', ticksPerFrame: 11, notes: 'Exécution fatale sans tête jusqu’au gisant.', frames: THALGRIM_DECAPITATED },
      { id: 'victory', label: 'Serment des Profondeurs', inputHint: 'Victoire Boss', ticksPerFrame: 11, notes: 'Marteau runique brandi vers la voûte.', frames: THALGRIM_VICTORY },
    ],
  },
  {
    actorId: 'vorgath',
    name: 'Vorgath · Boss Acte III',
    subtitle: 'Boss des Cryptes d’Obsidienne · Bourreau des Basaltes',
    weaponSummary: 'Couperet rectangulaire d’obsidienne constant sur les 32 poses (0 parasite)',
    outfitSummary: 'Capuche noire à yeux rouges, épaulières à pointes, tabard noir bordé de rouge',
    evasionDoctrine:
      'Bourreau cuirassé : garde basse ancrée en 2 phases ou saut d’écrasement.',
    hasAcrobaticRoll: false,
    stage: 'crypt',
    skin: 'vorgath',
    sequences: [
      { id: 'idle', label: 'Veille du Bourreau', inputHint: 'IA Repos', ticksPerFrame: 12, notes: '4 poses respirantes couperet sur l’épaule.', frames: VORGATH_IDLE },
      { id: 'walk_fwd', label: 'Pas Implacable', inputHint: 'IA Approche', ticksPerFrame: 8, notes: '4 pas lourds sur la roche volcanique.', frames: VORGATH_WALK },
      { id: 'cleave_overhead', label: 'Exécution Verticale', inputHint: 'Frappe Lourde', ticksPerFrame: 8, notes: '4 phases d’abattage lourd.', frames: VORGATH_CLEAVE },
      { id: 'boss_cast', label: 'Frappe Sismique de Lave', inputHint: 'Spécial Boss', ticksPerFrame: 8, notes: 'Plante le couperet dans la dalle et lance une onde ardente.', frames: VORGATH_CAST },
      { id: 'sweep_low', label: 'Grand Revers Horizontal', inputHint: 'Balayage Large', ticksPerFrame: 8, notes: 'Large arc nettoyé couvrant toute la portée moyenne.', frames: VORGATH_SWEEP },
      { id: 'block_high', label: 'Mur d’Obsidienne', inputHint: 'Défense IA', ticksPerFrame: 10, notes: '2 poses utilisant la largeur du couperet comme bouclier.', frames: VORGATH_BLOCK },
      { id: 'crouch', label: 'Garde Basse Ancrée', inputHint: 'Esquive Haute', ticksPerFrame: 10, isRollOrEvade: true, notes: '2 poses d’ancrage bas au sol.', frames: VORGATH_CROUCH },
      { id: 'jump', label: 'Saut d’Écrasement', inputHint: 'Esquive Basse', ticksPerFrame: 8, isJump: true, notes: '4 phases complètes avec sommet aérien.', frames: VORGATH_JUMP },
      { id: 'hit_stun', label: 'Recul Sous Impact', inputHint: 'Dégâts', ticksPerFrame: 9, notes: '3 poses d’encaissement couperet en main.', frames: VORGATH_HIT },
      { id: 'dead', label: 'Chute & KO', inputHint: 'PV à 0', ticksPerFrame: 10, notes: '4 poses de chute au sol.', frames: VORGATH_DEAD },
      { id: 'gisant', label: 'Bourreau Gisant', inputHint: 'Étendu au sol', ticksPerFrame: 16, notes: 'Étendu sur le pont de basalte.', frames: VORGATH_GISANT },
      { id: 'decapitated', label: 'Décapitation Subie & Gisant', inputHint: 'Coup fatal C', ticksPerFrame: 11, notes: '4 poses dédiées sans capuche ni tête jusqu’au corps gisant !', frames: VORGATH_DECAPITATED },
      { id: 'victory', label: 'Sentence Accomplie', inputHint: 'Victoire Boss', ticksPerFrame: 11, notes: 'Poing levé puis couperet dressé.', frames: VORGATH_VICTORY },
    ],
  },
  {
    actorId: 'malakor',
    name: 'Malakor · Boss Acte IV',
    subtitle: 'Boss de l’Arène des Ossements · Gladiateur Acrobate',
    weaponSummary: 'Une seule épée dentelée de gladiateur sur les 36 poses (0 parasite)',
    outfitSummary: 'Crinière rouge, épaulière d’or, pagne cramoisi, genouillères dorées',
    evasionDoctrine:
      'Gladiateur agile doté d’une vraie roulade avant 360° en 4 poses + saut aérien dédié.',
    hasAcrobaticRoll: true,
    stage: 'arena',
    skin: 'malakor',
    sequences: [
      { id: 'idle', label: 'Garde du Gladiateur', inputHint: 'IA Repos', ticksPerFrame: 11, notes: '4 poses souples respirantes.', frames: MALAKOR_IDLE },
      { id: 'walk_fwd', label: 'Pas d’Arène', inputHint: 'IA Approche', ticksPerFrame: 7, notes: '4 pas rapides lame basse.', frames: MALAKOR_WALK },
      { id: 'slash_high', label: 'Tailles Fauves', inputHint: 'Combo Gladiateur', ticksPerFrame: 7, notes: '4 phases de coupe dorée.', frames: MALAKOR_SLASH },
      { id: 'thrust_mid', label: 'Estoc Perforant', inputHint: 'Allonge Directe', ticksPerFrame: 7, notes: '4 phases de fente profonde.', frames: MALAKOR_THRUST },
      { id: 'sweep_low', label: 'Fauchage du Sable', inputHint: 'Attaque Basse', ticksPerFrame: 7, notes: 'Coupe basse coupant les jambes.', frames: MALAKOR_SWEEP },
      { id: 'block_high', label: 'Parade Croisée', inputHint: 'Défense IA', ticksPerFrame: 10, notes: '2 poses de parade oblique.', frames: MALAKOR_BLOCK },
      { id: 'crouch', label: 'Garde Basse d’Arène', inputHint: 'Esquive Haute', ticksPerFrame: 10, notes: '2 poses d’accroupissement stable.', frames: MALAKOR_CROUCH },
      { id: 'roll_fwd', label: 'Roulade Gladiateur 360°', inputHint: 'Bond Acrobatique IA', ticksPerFrame: 7, isRollOrEvade: true, notes: '4 poses progressives 360° avec épée conservée.', frames: MALAKOR_ROLL },
      { id: 'jump', label: 'Bond du Colisée', inputHint: 'Saut Aérien', ticksPerFrame: 8, isJump: true, notes: '4 poses dédiées avec élévation nette.', frames: MALAKOR_JUMP },
      { id: 'hit_stun', label: 'Impact Reçu', inputHint: 'Dégâts', ticksPerFrame: 8, notes: '3 poses de recul nettoyées.', frames: MALAKOR_HIT },
      { id: 'dead', label: 'Chute dans le Sable', inputHint: 'PV à 0', ticksPerFrame: 10, notes: '4 poses jusqu’au KO complet.', frames: MALAKOR_DEAD },
      { id: 'gisant', label: 'Champion Gisant', inputHint: 'Étendu au sol', ticksPerFrame: 16, notes: 'Malakor étendu dans le sable.', frames: MALAKOR_GISANT },
      { id: 'decapitated', label: 'Décapitation Subie & Gisant', inputHint: 'Coup fatal C', ticksPerFrame: 11, notes: '4 poses chirurgicales sans tête ni crinière jusqu’au gisant !', frames: MALAKOR_DECAPITATED },
      { id: 'victory', label: 'Ovation du Colisée', inputHint: 'Victoire Boss', ticksPerFrame: 11, notes: 'Salut victorieux à une seule épée.', frames: MALAKOR_VICTORY },
    ],
  },
  {
    actorId: 'baelgor',
    name: 'Baelgor · Boss Acte V',
    subtitle: 'Boss de la Citadelle des Brasiers · Archonte Infernal',
    weaponSummary: 'Espadon dentelé de magma incandescent sur les 32 poses (0 parasite)',
    outfitSummary: 'Heaume démonique cornu, armure noire sillonnée de braises et cape écarlate',
    evasionDoctrine:
      'Seigneur de guerre agressif : roulade cuirassée 360° en 4 poses + bond volcanique.',
    hasAcrobaticRoll: true,
    stage: 'inferno',
    skin: 'baelgor',
    sequences: [
      { id: 'idle', label: 'Garde des Brasiers', inputHint: 'IA Repos', ticksPerFrame: 11, notes: '4 poses ardentes espadon au poing.', frames: BAELGOR_IDLE },
      { id: 'walk_fwd', label: 'Marche Infernale', inputHint: 'IA Approche', ticksPerFrame: 8, notes: '4 pas lourds sur la pierre calcinée.', frames: BAELGOR_WALK },
      { id: 'slash_high', label: 'Tailles de Magma', inputHint: 'Combo Ardent', ticksPerFrame: 7, notes: 'Grand arc flamboyant à deux mains.', frames: BAELGOR_SLASH },
      { id: 'thrust_mid', label: 'Estoc Incandescent', inputHint: 'Fente Longue', ticksPerFrame: 7, notes: 'Pointe brûlante projetée à pleine allonge.', frames: BAELGOR_THRUST },
      { id: 'boss_cast', label: 'Comète de Brasier', inputHint: 'Spécial Boss', ticksPerFrame: 8, notes: 'Projette un orbe de feu infernal à hauteur de torse.', frames: BAELGOR_CAST },
      { id: 'sweep_low', label: 'Fauchage de Braise', inputHint: 'Attaque Basse', ticksPerFrame: 7, notes: 'Revers rasant balayant la chaussée.', frames: BAELGOR_SWEEP },
      { id: 'block_high', label: 'Garde de Fer Noir', inputHint: 'Défense IA', ticksPerFrame: 10, notes: '2 poses de parade lourde.', frames: BAELGOR_BLOCK },
      { id: 'roll_fwd', label: 'Roulade Infernale 360°', inputHint: 'Charge IA', ticksPerFrame: 7, isRollOrEvade: true, notes: '4 poses de roulade offensive.', frames: BAELGOR_ROLL },
      { id: 'jump', label: 'Saut Volcanique', inputHint: 'Esquive Basse', ticksPerFrame: 8, isJump: true, notes: '4 poses d’élévation ardente.', frames: BAELGOR_JUMP },
      { id: 'hit_stun', label: 'Choc Subi', inputHint: 'Dégâts', ticksPerFrame: 8, notes: 'Recul sous l’acier de Krom.', frames: BAELGOR_HIT },
      { id: 'dead', label: 'Chute & KO', inputHint: 'PV à 0', ticksPerFrame: 10, notes: '4 étapes jusqu’au KO complet.', frames: BAELGOR_DEAD },
      { id: 'gisant', label: 'Archonte Gisant', inputHint: 'Étendu au sol', ticksPerFrame: 16, notes: 'Baelgor vaincu devant la herse ardente.', frames: BAELGOR_GISANT },
      { id: 'decapitated', label: 'Décapitation Subie', inputHint: 'Coup fatal C', ticksPerFrame: 11, notes: 'Heaume cornu tranché net jusqu’au gisant !', frames: BAELGOR_DECAPITATED },
      { id: 'victory', label: 'Rugissement du Brasier', inputHint: 'Victoire Boss', ticksPerFrame: 11, notes: 'Espadon dressé dans les flammes.', frames: BAELGOR_VICTORY },
    ],
  },
  {
    actorId: 'drax',
    name: 'Seigneur Drax · Boss Acte VI',
    subtitle: 'Boss Final du Sanctuaire Foudroyé · Sorcier-Roi',
    weaponSummary: 'Grande épée runique violette présente sur les 35 poses (0 parasite)',
    outfitSummary: 'Couronne d’or, visage spectral, armure d’améthyste à pointes, cape cramoisie',
    evasionDoctrine:
      'Vraie garde accroupie au sol en 2 phases + Bond d’Ombre aérien et Téléportation en Phase 2.',
    hasAcrobaticRoll: false,
    stage: 'sanctuary',
    skin: 'drax',
    sequences: [
      { id: 'idle', label: 'Présence Royale', inputHint: 'IA Repos', ticksPerFrame: 11, notes: '4 poses respirantes couronnées.', frames: DRAX_IDLE },
      { id: 'walk_fwd', label: 'Marche Souveraine', inputHint: 'IA Approche', ticksPerFrame: 8, notes: '5 pas implacables cape au vent.', frames: DRAX_WALK },
      { id: 'slash_high', label: 'Tailles Runiques', inputHint: 'Combo d’Épée', ticksPerFrame: 7, notes: '4 poses de coupe violette à grand arc.', frames: DRAX_SLASH },
      { id: 'boss_cast', label: 'Orbe de Feu Noir', inputHint: 'Magie Noire', ticksPerFrame: 8, notes: 'Projette l’orbe noir tout en gardant l’épée runique.', frames: DRAX_CAST },
      { id: 'block_high', label: 'Garde Runique', inputHint: 'Défense IA', ticksPerFrame: 10, notes: '2 poses de parade haute.', frames: DRAX_BLOCK },
      { id: 'crouch', label: 'Garde Basse Royale', inputHint: 'Esquive Haute', ticksPerFrame: 10, notes: '2 vraies poses accroupies au sol (distinctes du saut).', frames: DRAX_CROUCH },
      { id: 'jump', label: 'Bond d’Ombre Aérien', inputHint: 'Mobilité & Esquive', ticksPerFrame: 8, isRollOrEvade: true, isJump: true, notes: '5 phases : appel, 3 poses de lévitation cape déployée et réception.', frames: DRAX_JUMP },
      { id: 'hit_stun', label: 'Recul Spectral', inputHint: 'Dégâts', ticksPerFrame: 8, notes: '3 poses d’impact épée maintenue.', frames: DRAX_HIT },
      { id: 'dead', label: 'Chute du Tyran', inputHint: 'PV à 0', ticksPerFrame: 10, notes: '4 poses d’effondrement complet.', frames: DRAX_DEAD },
      { id: 'gisant', label: 'Tyran Gisant', inputHint: 'Étendu au sol', ticksPerFrame: 16, notes: 'Seigneur Drax vaincu sur l’autel.', frames: DRAX_GISANT },
      { id: 'decapitated', label: 'Décapitation Subie & Gisant', inputHint: 'Coup fatal C', ticksPerFrame: 11, notes: '4 poses dédiées tranchant la couronne maudite jusqu’au gisant !', frames: DRAX_DECAPITATED },
      { id: 'victory', label: 'Triomphe Noir', inputHint: 'Victoire Boss', ticksPerFrame: 11, notes: 'Épée runique chargée d’éclairs violets.', frames: DRAX_VICTORY },
    ],
  },
  buildMinionDossier(
    'goblin_scout',
    'Gobelin Éclaireur · Monstre Actes I–II',
    'Pillard Agile · 18 PV (1 à 2 coups) · +140 PTS',
    'Coutelas recourbé & rondache de bois',
    'Peau verte, casque pointu et pagne de cuir',
    'forest'
  ),
  buildMinionDossier(
    'dire_wolf',
    'Loup Sinistre · Monstre Acte I',
    'Fauve des Brumes · 24 PV (1 à 2 coups) · +210 PTS',
    'Crocs acérés & bond sauvage',
    'Pelage gris-noir hérissé et yeux rouges',
    'forest'
  ),
  buildMinionDossier(
    'cave_bat',
    'Chauve-Souris Géante · Monstre Acte II',
    'Prédateur Aérien · 18 PV (1 à 2 coups) · +190 PTS',
    'Piqué griffu en vol rasant',
    'Ailes membraneuses sombres et yeux écarlates',
    'caverns'
  ),
  buildMinionDossier(
    'orc_marauder',
    'Orque Maraudeur · Monstre Actes II & IV',
    'Brute de Choc · 42 PV (3 coups) · +320 PTS',
    'Massue cloutée massive',
    'Cuirasse tribale à pointes et musculature verte',
    'caverns'
  ),
  buildMinionDossier(
    'stone_golem',
    'Golem de Pierre · Monstre Actes II & IV',
    'Colosse Minéral · 66 PV (4 à 5 coups) · +520 PTS',
    'Poings monolithiques brise-dalles',
    'Granit moussu gravé d’un cœur runique cyan',
    'caverns'
  ),
  buildMinionDossier(
    'risen_zombie',
    'Zombie Putréfié · Monstre Acte III',
    'Captif Réanimé · 32 PV (2 coups) · +240 PTS',
    'Griffes nécrotiques',
    'Haillons de cachot et chair blême',
    'crypt'
  ),
  buildMinionDossier(
    'undead_warrior',
    'Guerrier Squelette · Monstre Acte III',
    'Fantassin d’Os · 34 PV (2 à 3 coups) · +280 PTS',
    'Épée droite & bouclier ferré',
    'Ossements ivoire et baudrier rouge',
    'crypt'
  ),
  buildMinionDossier(
    'imperial_halberdier',
    'Hallebardier Impérial · Monstre Actes IV–V',
    'Garde Lourd · 46 PV (3 à 4 coups) · +390 PTS',
    'Hallebarde d’acier & grand écu rouge',
    'Armure de plates complète et tabard impérial',
    'arena'
  ),
  buildMinionDossier(
    'skeleton_mage',
    'Mage Squelette · Monstre Actes V–VI',
    'Arcaniste du Feu Noir · 38 PV (2 à 3 coups) · +360 PTS',
    'Bâton solaire & trait de feu',
    'Robe pourpre brodée d’or',
    'inferno'
  ),
  buildMinionDossier(
    'abyssal_demon',
    'Démon Abyssal · Monstre Actes V–VI',
    'Exécuteur Ailé · 60 PV (4 à 5 coups) · +540 PTS',
    'Lame ardente des brasiers',
    'Ailes de cuir cramoisi et cornes noires',
    'inferno'
  ),
  buildMinionDossier(
    'spectral_wraith',
    'Spectre Hurlant · Monstre Acte VI',
    'Âme Damnée de Drax · 52 PV (3 à 4 coups) · +460 PTS',
    'Lame ectoplasmique glaciale',
    'Suaire éthéré cyan flottant au-dessus des dalles',
    'sanctuary'
  ),
  buildMinionDossier(
    'wolf_raider',
    'Pillard Loup-Gris · Sbire Acte I',
    'Éclaireur des Brumes · 20 PV (1 à 2 coups) · +150 PTS',
    'Hachette nordique à un fer',
    'Pelisse de loup brun-gris sans casque cornu, braies sombres et bottes fourrées',
    'forest'
  ),
  buildMinionDossier(
    'monolith_spearman',
    'Garde des Monolithes · Sbire Actes I–II',
    'Veilleur des Menhirs · 34 PV (2 à 3 coups) · +250 PTS',
    'Glaive givré des tertres',
    'Peintures runiques cyan pâle, tunique de givre et baudrier nordique',
    'forest'
  ),
  buildMinionDossier(
    'cult_acolyte',
    'Fanatique d’Obsidienne · Sbire Actes III & V',
    'Zélote du Feu Noir · 24 PV (1 à 2 coups) · +200 PTS',
    'Fendoir rituel volcanique',
    'Capuche cramoisie, yeux d’ambre incandescent et robe de basalte sans armure lourde',
    'crypt'
  ),
  buildMinionDossier(
    'crypt_skeleton',
    'Squelette Légionnaire · Sbire Acte III',
    'Guerrier d’Os Réanimé · 36 PV (2 à 3 coups) · +300 PTS',
    'Lame antique ébréchée',
    'Crâne ivoire aux orbites creuses, cage thoracique apparente et lambeaux d’armure rouillée',
    'crypt'
  ),
  buildMinionDossier(
    'pit_thrall',
    'Écorcheur des Sables · Sbire Acte IV',
    'Gladiateur de la Fosse · 48 PV (3 à 4 coups) · +400 PTS',
    'Sabre dentelé d’arène',
    'Cimier de bronze, épaulière cuivrée et ceinture turquoise de Sang-Sable',
    'arena'
  ),
  buildMinionDossier(
    'drax_acolyte',
    'Sentinelle Spectrale · Sbire Acte VI',
    'Garde d’Ombre du Pont Foudroyé · 64 PV (4 à 5 coups) · +550 PTS',
    'Épée d’ombre chargée de foudre cyan',
    'Heaume spectral sans couronne royale, armure ardoise et runes électriques bleues',
    'sanctuary'
  ),
  {
    actorId: 'goblin',
    name: 'Grik le Gobelin · PNJ',
    subtitle: 'Nettoyeur d’Arène Classique façon Barbarian (1987)',
    weaponSummary: 'Corde de halage tressée (aucune arme ni chevauchement voisin)',
    outfitSummary: 'Tunique brune déchirée sans manches, ceinture de corde, peau verte',
    evasionDoctrine: 'Intervient en fin de manche pour ricaner et tirer le vaincu hors de l’écran.',
    hasAcrobaticRoll: false,
    stage: 'arena',
    sequences: [
      { id: 'gob_walk', label: 'Entrée Furtive', inputHint: 'Fin de manche', ticksPerFrame: 6, notes: '4 poses de marche voûtée isolées.', frames: GOBLIN_WALK_FRAMES },
      { id: 'gob_laugh', label: 'Rire Moqueur', inputHint: '« Heh Heh ! »', ticksPerFrame: 7, notes: '3 poses pointant du doigt.', frames: GOBLIN_LAUGH_FRAMES },
      { id: 'gob_drag', label: 'Traction à la Corde', inputHint: 'Évacuation KO', ticksPerFrame: 7, notes: '3 poses tirant le vaincu sans chevaucher le sprite voisin.', frames: GOBLIN_DRAG_FRAMES },
    ],
  },
  {
    actorId: 'stage_fx',
    name: 'Décors & Effets Animés',
    subtitle: 'Éléments Dynamiques 60 Hz Superposés aux 6 Arènes & Zones',
    weaponSummary: 'Projectiles magiques & étincelles de choc d’acier',
    outfitSummary: 'Détourage propre sur fond #FF00FF pur (zéro halo rose)',
    evasionDoctrine: 'Animent en temps réel les 6 actes de la campagne.',
    hasAcrobaticRoll: false,
    stage: 'crypt',
    sequences: [
      { id: 'fx_torch', label: 'Torche Murale', inputHint: 'Cavernes & Crypte', ticksPerFrame: 5, notes: '6 poses de flamme vive sans disque rose.', frames: FX_TORCH_FRAMES },
      { id: 'fx_brazier', label: 'Brasero d’Arène', inputHint: 'Colisée & Citadelle', ticksPerFrame: 5, notes: '4 poses de vasque ardente.', frames: FX_BRAZIER_FRAMES },
      { id: 'fx_monolith', label: 'Monolithe Runique', inputHint: 'Clairières & Cavernes', ticksPerFrame: 9, notes: '4 niveaux d’illumination des gravures.', frames: FX_MONOLITH_FRAMES },
      { id: 'fx_fireball', label: 'Orbe de Feu Noir', inputHint: 'Sort de Boss', ticksPerFrame: 5, notes: '2 poses de comète arcanique.', frames: FX_FIREBALL_FRAMES },
      { id: 'fx_sparks', label: 'Étincelles de Parade', inputHint: 'Choc L1', ticksPerFrame: 4, notes: '4 éclats d’acier lors des parades.', frames: FX_SPARK_FRAMES },
      { id: 'fx_crow', label: 'Corbeau Noir', inputHint: 'Ciel Actes I & IV', ticksPerFrame: 6, notes: '4 poses de battement d’ailes.', frames: FX_CROW_FRAMES },
      { id: 'fx_lava', label: 'Lave en Fusion', inputHint: 'Fosse Actes III & V', ticksPerFrame: 8, notes: '4 étapes d’ébullition magmatique.', frames: FX_LAVA_FRAMES },
    ],
  },
];
