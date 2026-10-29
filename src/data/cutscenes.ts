import type { CutsceneId, FighterAction, FighterSkin, StageId } from '../types/game';
import type { MusicTrackId } from '../game/sound';

export type CutsceneSfxKind =
  | 'swing_heavy'
  | 'clash'
  | 'thunder'
  | 'magic'
  | 'drum'
  | 'fanfare';

export interface CutsceneActorSpec {
  skin: FighterSkin;
  startX: number;
  endX: number;
  moveStartTick?: number;
  moveEndTick?: number;
  facing: 1 | -1;
  flipAtTick?: number;
  baseAction?: FighterAction;
  poseAtTick?: {
    tick: number;
    action: FighterAction;
    duration: number;
  };
}

export interface CutsceneShotSpec {
  stage: StageId;
  backdrop: 'zone' | 'arena';
  camStartX?: number; // 0..640 when backdrop === 'zone'
  camEndX?: number;
  durationTicks: number; // ~180..240 ticks (3..4s per shot)
  speakerName: string;
  speakerSkin: FighterSkin;
  text: string;
  skyTint?: string;
  lightningTicks?: number[];
  shakeTicks?: number[];
  heartArtifact?: {
    x: number;
    y: number;
    mode: 'stolen' | 'corrupted' | 'restored';
    risePx?: number;
  };
  sfxCues?: { tick: number; kind: CutsceneSfxKind }[];
  actors: CutsceneActorSpec[];
}

export interface CutsceneDefinition {
  id: CutsceneId;
  title: string;
  musicTrack: MusicTrackId;
  shots: CutsceneShotSpec[];
}

export const CUTSCENES: Record<CutsceneId, CutsceneDefinition> = {
  // ==========================================================================
  // ACTE I — OUVERTURE : LE SERMENT DES CENDRES
  // ==========================================================================
  act1_opening: {
    id: 'act1_opening',
    title: 'CINÉMATIQUE I · LE SERMENT DES CENDRES',
    musicTrack: 'title',
    shots: [
      {
        stage: 'forest',
        backdrop: 'zone',
        camStartX: 80,
        camEndX: 210,
        durationTicks: 230,
        speakerName: 'CHRONIQUE DU NORD',
        speakerSkin: 'gorgar',
        text: 'Sous un ciel rougi de cendres, la horde de Gorgar pille les Hautes-Brumes et dérobe le Cœur d’Acier sacré.',
        skyTint: 'rgba(220, 38, 38, 0.16)',
        heartArtifact: { x: 356, y: 142, mode: 'stolen' },
        sfxCues: [{ tick: 18, kind: 'drum' }],
        actors: [
          {
            skin: 'wolf_raider',
            startX: 220,
            endX: 330,
            moveStartTick: 0,
            moveEndTick: 190,
            facing: 1,
          },
          {
            skin: 'gorgar',
            startX: 270,
            endX: 385,
            moveStartTick: 0,
            moveEndTick: 200,
            facing: 1,
            poseAtTick: { tick: 150, action: 'victory', duration: 75 },
          },
          {
            skin: 'wolf_raider',
            startX: 325,
            endX: 435,
            moveStartTick: 0,
            moveEndTick: 195,
            facing: 1,
          },
        ],
      },
      {
        stage: 'forest',
        backdrop: 'zone',
        camStartX: 60,
        camEndX: 110,
        durationTicks: 225,
        speakerName: 'KROM LE BARBARE',
        speakerSkin: 'krom',
        text: '« Par le sang des anciens rois… ni pierre runique ni sorcellerie n’arrêteront mon glaive avant la délivrance de Valéria ! »',
        sfxCues: [
          { tick: 96, kind: 'swing_heavy' },
          { tick: 112, kind: 'clash' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 105,
            endX: 205,
            moveStartTick: 0,
            moveEndTick: 92,
            facing: 1,
            poseAtTick: { tick: 95, action: 'victory', duration: 125 },
          },
        ],
      },
      {
        stage: 'forest',
        backdrop: 'zone',
        camStartX: 140,
        camEndX: 240,
        durationTicks: 205,
        speakerName: 'ÉCLAIREUR LOUP-GRIS',
        speakerSkin: 'wolf_raider',
        text: '« Un survivant approche du cercle des menhirs ! Abattez-le avant qu’il n’atteigne le seigneur Gorgar ! »',
        sfxCues: [{ tick: 70, kind: 'swing_heavy' }],
        actors: [
          {
            skin: 'krom',
            startX: 195,
            endX: 255,
            moveStartTick: 0,
            moveEndTick: 120,
            facing: 1,
            poseAtTick: { tick: 125, action: 'slash_high', duration: 22 },
          },
          {
            skin: 'wolf_raider',
            startX: 435,
            endX: 375,
            moveStartTick: 15,
            moveEndTick: 135,
            facing: -1,
          },
          {
            skin: 'monolith_spearman',
            startX: 485,
            endX: 430,
            moveStartTick: 25,
            moveEndTick: 145,
            facing: -1,
            poseAtTick: { tick: 150, action: 'block_high', duration: 50 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE I — ENTRÉE DE BOSS : GORGAR LE BRISEUR
  // ==========================================================================
  boss1_intro: {
    id: 'boss1_intro',
    title: 'FACE-À-FACE · L’ARCHE DE GORGAR',
    musicTrack: 'forest',
    shots: [
      {
        stage: 'forest',
        backdrop: 'arena',
        durationTicks: 185,
        speakerName: 'GORGAR LE BRISEUR',
        speakerSkin: 'gorgar',
        text: '« Ton glaive rouillé se brisera sur mes pierres sacrées, barbare ! Nul mortel ne franchit cette arche ! »',
        shakeTicks: [98],
        sfxCues: [
          { tick: 85, kind: 'swing_heavy' },
          { tick: 98, kind: 'drum' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 34,
            endX: 92,
            moveStartTick: 0,
            moveEndTick: 85,
            facing: 1,
          },
          {
            skin: 'gorgar',
            startX: 274,
            endX: 226,
            moveStartTick: 0,
            moveEndTick: 75,
            facing: -1,
            poseAtTick: { tick: 80, action: 'cleave_overhead', duration: 28 },
          },
        ],
      },
      {
        stage: 'forest',
        backdrop: 'arena',
        durationTicks: 165,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: '« Écarte-toi du chemin des Cryptes, colosse, ou ta hache rejoindra la mousse ! »',
        sfxCues: [{ tick: 45, kind: 'clash' }],
        actors: [
          {
            skin: 'krom',
            startX: 92,
            endX: 92,
            facing: 1,
            poseAtTick: { tick: 35, action: 'block_high', duration: 90 },
          },
          {
            skin: 'gorgar',
            startX: 226,
            endX: 226,
            facing: -1,
            poseAtTick: { tick: 55, action: 'victory', duration: 95 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE II — OUVERTURE : LA FAILLE DES CHAÎNES ARDENTES
  // ==========================================================================
  act2_opening: {
    id: 'act2_opening',
    title: 'CINÉMATIQUE II · LES CRYPTES D’OBSIDIENNE',
    musicTrack: 'crypt',
    shots: [
      {
        stage: 'crypt',
        backdrop: 'zone',
        camStartX: 0,
        camEndX: 150,
        durationTicks: 220,
        speakerName: 'CHRONIQUE',
        speakerSkin: 'krom',
        text: 'Derrière le menhir fendu de Gorgar, Krom s’enfonce dans la fournaise basaltique où résonnent les fers des captifs.',
        sfxCues: [{ tick: 25, kind: 'drum' }],
        actors: [
          {
            skin: 'krom',
            startX: 55,
            endX: 245,
            moveStartTick: 0,
            moveEndTick: 185,
            facing: 1,
          },
        ],
      },
      {
        stage: 'crypt',
        backdrop: 'zone',
        camStartX: 250,
        camEndX: 390,
        durationTicks: 220,
        speakerName: 'FANATIQUE D’OBSIDIENNE',
        speakerSkin: 'cult_acolyte',
        text: '« Éveillez les légions d’os dans le feu noir ! Le sang de l’intrus nourrira les fosses de lave ! »',
        sfxCues: [{ tick: 75, kind: 'magic' }],
        actors: [
          {
            skin: 'cult_acolyte',
            startX: 470,
            endX: 445,
            moveStartTick: 0,
            moveEndTick: 65,
            facing: -1,
            poseAtTick: { tick: 70, action: 'cleave_overhead', duration: 30 },
          },
          {
            skin: 'crypt_skeleton',
            startX: 545,
            endX: 495,
            moveStartTick: 45,
            moveEndTick: 165,
            facing: -1,
          },
          {
            skin: 'crypt_skeleton',
            startX: 605,
            endX: 550,
            moveStartTick: 60,
            moveEndTick: 180,
            facing: -1,
          },
        ],
      },
      {
        stage: 'crypt',
        backdrop: 'arena',
        durationTicks: 205,
        speakerName: 'VORGATH LE BOURREAU',
        speakerSkin: 'vorgath',
        text: 'Au bout des ponts ardents, Vorgath le Bourreau sans visage attend déjà près du billot d’obsidienne…',
        shakeTicks: [95],
        sfxCues: [
          { tick: 85, kind: 'magic' },
          { tick: 95, kind: 'drum' },
        ],
        actors: [
          {
            skin: 'vorgath',
            startX: 215,
            endX: 185,
            moveStartTick: 0,
            moveEndTick: 75,
            facing: -1,
            poseAtTick: { tick: 80, action: 'boss_cast', duration: 32 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE II — ENTRÉE DE BOSS : VORGATH LE BOURREAU
  // ==========================================================================
  boss2_intro: {
    id: 'boss2_intro',
    title: 'FACE-À-FACE · LE PONT DU BILLOT',
    musicTrack: 'crypt',
    shots: [
      {
        stage: 'crypt',
        backdrop: 'arena',
        durationTicks: 185,
        speakerName: 'VORGATH',
        speakerSkin: 'vorgath',
        text: '« Nul ne franchit la fosse sans laisser sa tête sur le billot ! Sens gronder la lave sous tes bottes ! »',
        shakeTicks: [92],
        sfxCues: [
          { tick: 80, kind: 'magic' },
          { tick: 92, kind: 'drum' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 38,
            endX: 88,
            moveStartTick: 0,
            moveEndTick: 75,
            facing: 1,
          },
          {
            skin: 'vorgath',
            startX: 268,
            endX: 232,
            moveStartTick: 0,
            moveEndTick: 70,
            facing: -1,
            poseAtTick: { tick: 78, action: 'boss_cast', duration: 28 },
          },
        ],
      },
      {
        stage: 'crypt',
        backdrop: 'arena',
        durationTicks: 165,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: '« Tes chaînes sont brisées, geôlier. Aujourd’hui, c’est le bourreau qui goûtera à l’acier ! »',
        sfxCues: [{ tick: 50, kind: 'swing_heavy' }],
        actors: [
          {
            skin: 'krom',
            startX: 88,
            endX: 88,
            facing: 1,
            poseAtTick: { tick: 45, action: 'slash_high', duration: 22 },
          },
          {
            skin: 'vorgath',
            startX: 232,
            endX: 232,
            facing: -1,
            poseAtTick: { tick: 55, action: 'block_high', duration: 80 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE III — OUVERTURE : LES TAMBOURS DE SANG-SABLE
  // ==========================================================================
  act3_opening: {
    id: 'act3_opening',
    title: 'CINÉMATIQUE III · LE COLISÉE DES OSSEMENTS',
    musicTrack: 'arena',
    shots: [
      {
        stage: 'arena',
        backdrop: 'zone',
        camStartX: 0,
        camEndX: 165,
        durationTicks: 215,
        speakerName: 'CHRONIQUE',
        speakerSkin: 'krom',
        text: 'Émergé des profondeurs volcaniques, Krom pénètre dans la galerie impériale sous le tonnerre de mille tambours.',
        sfxCues: [{ tick: 20, kind: 'drum' }],
        actors: [
          {
            skin: 'krom',
            startX: 52,
            endX: 248,
            moveStartTick: 0,
            moveEndTick: 180,
            facing: 1,
          },
        ],
      },
      {
        stage: 'arena',
        backdrop: 'zone',
        camStartX: 270,
        camEndX: 410,
        durationTicks: 215,
        speakerName: 'ÉCORCHEUR DES SABLES',
        speakerSkin: 'pit_thrall',
        text: '« Le barbare du Nord est dans le couloir des fauves ! Celui qui rapportera son glaive sera couvert d’or ! »',
        sfxCues: [{ tick: 80, kind: 'clash' }],
        actors: [
          {
            skin: 'pit_thrall',
            startX: 525,
            endX: 465,
            moveStartTick: 0,
            moveEndTick: 110,
            facing: -1,
            poseAtTick: { tick: 115, action: 'slash_high', duration: 24 },
          },
          {
            skin: 'crypt_skeleton',
            startX: 590,
            endX: 525,
            moveStartTick: 20,
            moveEndTick: 135,
            facing: -1,
          },
        ],
      },
      {
        stage: 'arena',
        backdrop: 'arena',
        durationTicks: 205,
        speakerName: 'MALAKOR L’ÉCORCHEUR',
        speakerSkin: 'malakor',
        text: 'Au centre du sable brûlant, le champion invaincu Malakor fait déjà tournoyer sa lame dentelée sous les ovations.',
        sfxCues: [{ tick: 65, kind: 'swing_heavy' }],
        actors: [
          {
            skin: 'malakor',
            startX: 235,
            endX: 175,
            moveStartTick: 0,
            moveEndTick: 75,
            facing: -1,
            poseAtTick: { tick: 80, action: 'victory', duration: 110 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE III — ENTRÉE DE BOSS : MALAKOR L’ÉCORCHEUR
  // ==========================================================================
  boss3_intro: {
    id: 'boss3_intro',
    title: 'FACE-À-FACE · JUGEMENT DU COLISÉE',
    musicTrack: 'arena',
    shots: [
      {
        stage: 'arena',
        backdrop: 'arena',
        durationTicks: 185,
        speakerName: 'MALAKOR',
        speakerSkin: 'malakor',
        text: '« La foule scande déjà mon nom ! Admire la vitesse du maître de l’arène avant que ton crâne n’orne mon trône ! »',
        sfxCues: [{ tick: 45, kind: 'swing_heavy' }],
        actors: [
          {
            skin: 'krom',
            startX: 42,
            endX: 88,
            moveStartTick: 0,
            moveEndTick: 70,
            facing: 1,
          },
          {
            skin: 'malakor',
            startX: 280,
            endX: 228,
            moveStartTick: 20,
            moveEndTick: 75,
            facing: -1,
            poseAtTick: { tick: 40, action: 'roll_fwd', duration: 28 },
          },
        ],
      },
      {
        stage: 'arena',
        backdrop: 'arena',
        durationTicks: 165,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: '« Je ne combats pas pour ta foule, Malakor — je taille ma route jusqu’à la tour de Drax ! »',
        sfxCues: [{ tick: 55, kind: 'clash' }],
        actors: [
          {
            skin: 'krom',
            startX: 88,
            endX: 88,
            facing: 1,
            poseAtTick: { tick: 50, action: 'thrust_mid', duration: 22 },
          },
          {
            skin: 'malakor',
            startX: 228,
            endX: 228,
            facing: -1,
            poseAtTick: { tick: 48, action: 'block_high', duration: 60 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE IV — OUVERTURE : LE PONT DE LA FOUDRE
  // ==========================================================================
  act4_opening: {
    id: 'act4_opening',
    title: 'CINÉMATIQUE IV · LA CITADELLE DE DRAX',
    musicTrack: 'sanctuary',
    shots: [
      {
        stage: 'sanctuary',
        backdrop: 'zone',
        camStartX: 0,
        camEndX: 170,
        durationTicks: 220,
        speakerName: 'CHRONIQUE',
        speakerSkin: 'krom',
        text: 'Le Colisée réduit au silence, Krom gravit le viaduc cyclopéen de la Citadelle sous un déluge d’éclairs pourpres.',
        lightningTicks: [35, 145],
        sfxCues: [{ tick: 35, kind: 'thunder' }],
        actors: [
          {
            skin: 'krom',
            startX: 48,
            endX: 250,
            moveStartTick: 0,
            moveEndTick: 185,
            facing: 1,
          },
        ],
      },
      {
        stage: 'sanctuary',
        backdrop: 'zone',
        camStartX: 280,
        camEndX: 430,
        durationTicks: 215,
        speakerName: 'SENTINELLE SPECTRALE',
        speakerSkin: 'drax_acolyte',
        text: '« Par la couronne d’ombre, scellez le pont ! Aucun acier mortel ne profanera le Sanctuaire du Sorcier-Roi ! »',
        lightningTicks: [85],
        sfxCues: [
          { tick: 60, kind: 'magic' },
          { tick: 85, kind: 'thunder' },
        ],
        actors: [
          {
            skin: 'drax_acolyte',
            startX: 540,
            endX: 475,
            moveStartTick: 0,
            moveEndTick: 120,
            facing: -1,
            poseAtTick: { tick: 125, action: 'slash_high', duration: 24 },
          },
          {
            skin: 'cult_acolyte',
            startX: 605,
            endX: 540,
            moveStartTick: 15,
            moveEndTick: 135,
            facing: -1,
          },
        ],
      },
      {
        stage: 'sanctuary',
        backdrop: 'arena',
        durationTicks: 220,
        speakerName: 'SEIGNEUR DRAX',
        speakerSkin: 'drax',
        text: '« Viens donc, chien des Hautes-Brumes ! Le Cœur d’Acier bat désormais pour mon empire immortel ! »',
        lightningTicks: [40],
        heartArtifact: { x: 160, y: 122, mode: 'corrupted' },
        sfxCues: [
          { tick: 40, kind: 'thunder' },
          { tick: 95, kind: 'magic' },
        ],
        actors: [
          {
            skin: 'drax',
            startX: 235,
            endX: 205,
            moveStartTick: 0,
            moveEndTick: 70,
            facing: -1,
            poseAtTick: { tick: 75, action: 'victory', duration: 125 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE IV — ENTRÉE DE BOSS : SEIGNEUR DRAX
  // ==========================================================================
  boss4_intro: {
    id: 'boss4_intro',
    title: 'ULTIME DUEL · L’AUTEL DU SORCIER-ROI',
    musicTrack: 'sanctuary',
    shots: [
      {
        stage: 'sanctuary',
        backdrop: 'arena',
        durationTicks: 195,
        speakerName: 'SEIGNEUR DRAX',
        speakerSkin: 'drax',
        text: '« Incline-toi, mortel ! La foudre et l’ombre obéissent à ma couronne — ton serment s’achève ici ! »',
        lightningTicks: [28, 120],
        heartArtifact: { x: 160, y: 118, mode: 'corrupted' },
        sfxCues: [
          { tick: 28, kind: 'thunder' },
          { tick: 85, kind: 'magic' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 36,
            endX: 88,
            moveStartTick: 0,
            moveEndTick: 75,
            facing: 1,
          },
          {
            skin: 'drax',
            startX: 272,
            endX: 232,
            moveStartTick: 0,
            moveEndTick: 70,
            facing: -1,
            poseAtTick: { tick: 80, action: 'boss_cast', duration: 28 },
          },
        ],
      },
      {
        stage: 'sanctuary',
        backdrop: 'arena',
        durationTicks: 175,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: '« L’acier libre ne plie devant aucun tyran. En garde, Drax ! »',
        sfxCues: [{ tick: 55, kind: 'clash' }],
        actors: [
          {
            skin: 'krom',
            startX: 88,
            endX: 88,
            facing: 1,
            poseAtTick: { tick: 45, action: 'victory', duration: 95 },
          },
          {
            skin: 'drax',
            startX: 232,
            endX: 232,
            facing: -1,
            poseAtTick: { tick: 50, action: 'block_high', duration: 85 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ÉPILOGUE FINAL — L’AUBE DU CŒUR D’ACIER
  // ==========================================================================
  campaign_ending: {
    id: 'campaign_ending',
    title: 'ÉPILOGUE · L’AUBE DU CŒUR D’ACIER',
    musicTrack: 'title',
    shots: [
      {
        stage: 'sanctuary',
        backdrop: 'arena',
        durationTicks: 235,
        speakerName: 'CHRONIQUE',
        speakerSkin: 'drax',
        text: 'Sous le dernier revers de Krom, la couronne maudite de Drax vole en éclats et le pentagramme d’ombre se consume !',
        lightningTicks: [24],
        shakeTicks: [24],
        sfxCues: [
          { tick: 24, kind: 'thunder' },
          { tick: 70, kind: 'clash' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 118,
            endX: 138,
            moveStartTick: 0,
            moveEndTick: 65,
            facing: 1,
            poseAtTick: { tick: 70, action: 'victory', duration: 150 },
          },
          {
            skin: 'drax',
            startX: 224,
            endX: 224,
            facing: -1,
            baseAction: 'dead',
          },
        ],
      },
      {
        stage: 'sanctuary',
        backdrop: 'arena',
        durationTicks: 240,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: 'L’orage pourpre s’efface devant l’aube naissante. Libéré de ses chaînes noires, le Cœur d’Acier flamboie d’une lueur pure !',
        skyTint: 'rgba(251, 191, 36, 0.20)',
        heartArtifact: { x: 166, y: 138, mode: 'restored', risePx: 26 },
        sfxCues: [{ tick: 35, kind: 'fanfare' }],
        actors: [
          {
            skin: 'krom',
            startX: 132,
            endX: 146,
            moveStartTick: 0,
            moveEndTick: 60,
            facing: 1,
            poseAtTick: { tick: 65, action: 'victory', duration: 165 },
          },
        ],
      },
      {
        stage: 'forest',
        backdrop: 'arena',
        durationTicks: 260,
        speakerName: 'LÉGENDE DES HAUTES-BRUMES',
        speakerSkin: 'krom',
        text: 'Valéria est libre et la paix revient sur les Clairières sacrées. À jamais, les bardes chanteront Krom et le Glaive d’Acier !',
        skyTint: 'rgba(253, 224, 71, 0.16)',
        heartArtifact: { x: 278, y: 122, mode: 'restored', risePx: 8 },
        sfxCues: [{ tick: 20, kind: 'fanfare' }],
        actors: [
          {
            skin: 'krom',
            startX: 90,
            endX: 160,
            moveStartTick: 0,
            moveEndTick: 95,
            facing: 1,
            poseAtTick: { tick: 100, action: 'victory', duration: 155 },
          },
        ],
      },
    ],
  },
};
