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
  camStartX?: number; // 0..1480 when backdrop === 'zone'
  camEndX?: number;
  durationTicks: number; // ~290..360 ticks (~5..6s per shot for comfortable reading)
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
  // ACTE I — PROLOGUE & OUVERTURE : LE SERMENT DES CENDRES (4 PLANS)
  // ==========================================================================
  act1_opening: {
    id: 'act1_opening',
    title: 'PROLOGUE · LE SERMENT DES HAUTES-BRUMES',
    musicTrack: 'title',
    shots: [
      {
        stage: 'forest',
        backdrop: 'arena',
        durationTicks: 325,
        speakerName: 'CHANT DES ANCIENS',
        speakerSkin: 'krom',
        text: 'Jadis, sous les chênes d’argent des Hautes-Brumes, le Cœur d’Acier veillait en paix, forgé dans une étoile tombée au premier âge des rois.',
        skyTint: 'rgba(56, 189, 248, 0.10)',
        heartArtifact: { x: 160, y: 118, mode: 'restored' },
        sfxCues: [{ tick: 24, kind: 'magic' }],
        actors: [
          {
            skin: 'krom',
            startX: 116,
            endX: 132,
            moveStartTick: 0,
            moveEndTick: 160,
            facing: 1,
          },
        ],
      },
      {
        stage: 'forest',
        backdrop: 'zone',
        camStartX: 60,
        camEndX: 230,
        durationTicks: 335,
        speakerName: 'CHRONIQUE DU NORD',
        speakerSkin: 'gorgar',
        text: 'Mais quand la lune vira au sang, la horde de Gorgar livra les foyers aux flammes, profana l’autel et emporta la princesse Valéria enchaînée vers l’ombre.',
        skyTint: 'rgba(220, 38, 38, 0.18)',
        heartArtifact: { x: 368, y: 140, mode: 'stolen' },
        sfxCues: [{ tick: 20, kind: 'drum' }],
        actors: [
          {
            skin: 'goblin_scout',
            startX: 205,
            endX: 330,
            moveStartTick: 0,
            moveEndTick: 240,
            facing: 1,
          },
          {
            skin: 'gorgar',
            startX: 270,
            endX: 395,
            moveStartTick: 0,
            moveEndTick: 250,
            facing: 1,
            poseAtTick: { tick: 195, action: 'victory', duration: 95 },
          },
          {
            skin: 'dire_wolf',
            startX: 335,
            endX: 460,
            moveStartTick: 0,
            moveEndTick: 245,
            facing: 1,
          },
        ],
      },
      {
        stage: 'forest',
        backdrop: 'zone',
        camStartX: 40,
        camEndX: 115,
        durationTicks: 330,
        speakerName: 'KROM LE BARBARE',
        speakerSkin: 'krom',
        text: 'Seul debout dans la cendre tiède des siens, Krom lève le glaive ancestral : « Par les mânes du Nord, ni pierre ni démon ne garderont Valéria captive ! »',
        sfxCues: [
          { tick: 110, kind: 'swing_heavy' },
          { tick: 128, kind: 'clash' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 100,
            endX: 205,
            moveStartTick: 0,
            moveEndTick: 105,
            facing: 1,
            poseAtTick: { tick: 108, action: 'victory', duration: 160 },
          },
        ],
      },
      {
        stage: 'forest',
        backdrop: 'zone',
        camStartX: 155,
        camEndX: 295,
        durationTicks: 310,
        speakerName: 'GOBELIN ÉCLAIREUR',
        speakerSkin: 'goblin_scout',
        text: 'Déjà les cors gobelins déchirent la brume matinale : « Un survivant marche sur le pont moussu ! Lâchez les loups noirs avant l’arche de Gorgar ! »',
        sfxCues: [{ tick: 85, kind: 'swing_heavy' }],
        actors: [
          {
            skin: 'krom',
            startX: 215,
            endX: 292,
            moveStartTick: 0,
            moveEndTick: 150,
            facing: 1,
            poseAtTick: { tick: 155, action: 'slash_high', duration: 26 },
          },
          {
            skin: 'dire_wolf',
            startX: 475,
            endX: 398,
            moveStartTick: 15,
            moveEndTick: 165,
            facing: -1,
          },
          {
            skin: 'goblin_scout',
            startX: 530,
            endX: 455,
            moveStartTick: 30,
            moveEndTick: 185,
            facing: -1,
            poseAtTick: { tick: 190, action: 'block_high', duration: 75 },
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
        durationTicks: 290,
        speakerName: 'GORGAR LE BRISEUR',
        speakerSkin: 'gorgar',
        text: '« Tu arrives trop tard, loup solitaire ! Le convoi de Drax a déjà franchi les racines du monde, et ma hache boira ton sang sur ces pierres ! »',
        shakeTicks: [110],
        sfxCues: [
          { tick: 95, kind: 'swing_heavy' },
          { tick: 110, kind: 'drum' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 34,
            endX: 92,
            moveStartTick: 0,
            moveEndTick: 95,
            facing: 1,
          },
          {
            skin: 'gorgar',
            startX: 274,
            endX: 226,
            moveStartTick: 0,
            moveEndTick: 85,
            facing: -1,
            poseAtTick: { tick: 90, action: 'cleave_overhead', duration: 30 },
          },
        ],
      },
      {
        stage: 'forest',
        backdrop: 'arena',
        durationTicks: 275,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: '« Chaque cendre de mon village réclame justice, Gorgar. Ouvre ce portail ou tombe devant lui ! »',
        sfxCues: [{ tick: 55, kind: 'clash' }],
        actors: [
          {
            skin: 'krom',
            startX: 92,
            endX: 92,
            facing: 1,
            poseAtTick: { tick: 45, action: 'block_high', duration: 110 },
          },
          {
            skin: 'gorgar',
            startX: 226,
            endX: 226,
            facing: -1,
            poseAtTick: { tick: 65, action: 'victory', duration: 120 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE II — OUVERTURE : LES CAVERNES DE CRISTAL
  // ==========================================================================
  act2_opening: {
    id: 'act2_opening',
    title: 'ACTE II · LES LARMES DE QUARTZ',
    musicTrack: 'caverns',
    shots: [
      {
        stage: 'caverns',
        backdrop: 'zone',
        camStartX: 0,
        camEndX: 180,
        durationTicks: 315,
        speakerName: 'CHRONIQUE',
        speakerSkin: 'krom',
        text: 'Sous l’arche vaincue de Gorgar s’enfonce un escalier oublié des hommes. Un pan déchiré du manteau de Valéria accroché au roc guide Krom vers l’abîme d’azur.',
        sfxCues: [{ tick: 28, kind: 'drum' }],
        actors: [
          {
            skin: 'krom',
            startX: 48,
            endX: 255,
            moveStartTick: 0,
            moveEndTick: 230,
            facing: 1,
          },
        ],
      },
      {
        stage: 'caverns',
        backdrop: 'zone',
        camStartX: 710,
        camEndX: 920,
        durationTicks: 310,
        speakerName: 'ORQUE MARAUDEUR',
        speakerSkin: 'orc_marauder',
        text: '« L’homme du Nord suit la trace de la captive ! Éveillez les golems du Sceau Bleu et lâchez les nuées noires des voûtes ! »',
        sfxCues: [{ tick: 85, kind: 'swing_heavy' }],
        actors: [
          {
            skin: 'orc_marauder',
            startX: 985,
            endX: 935,
            moveStartTick: 0,
            moveEndTick: 115,
            facing: -1,
            poseAtTick: { tick: 120, action: 'cleave_overhead', duration: 30 },
          },
          {
            skin: 'cave_bat',
            startX: 1050,
            endX: 965,
            moveStartTick: 25,
            moveEndTick: 185,
            facing: -1,
          },
          {
            skin: 'stone_golem',
            startX: 1115,
            endX: 1045,
            moveStartTick: 40,
            moveEndTick: 215,
            facing: -1,
          },
        ],
      },
      {
        stage: 'caverns',
        backdrop: 'arena',
        durationTicks: 305,
        speakerName: 'THALGRIM DES CRISTAUX',
        speakerSkin: 'thalgrim',
        text: 'Jadis roi-forgeron respecté, Thalgrim a vendu son serment à Drax contre l’immortalité froide du cristal vivant qui chante sous son marteau…',
        shakeTicks: [110],
        sfxCues: [
          { tick: 95, kind: 'magic' },
          { tick: 110, kind: 'clash' },
        ],
        actors: [
          {
            skin: 'thalgrim',
            startX: 220,
            endX: 188,
            moveStartTick: 0,
            moveEndTick: 90,
            facing: -1,
            poseAtTick: { tick: 95, action: 'boss_cast', duration: 36 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE II — ENTRÉE DE BOSS : THALGRIM
  // ==========================================================================
  boss2_intro: {
    id: 'boss2_intro',
    title: 'FACE-À-FACE · LA CHAMBRE GÉODIQUE',
    musicTrack: 'caverns',
    shots: [
      {
        stage: 'caverns',
        backdrop: 'arena',
        durationTicks: 290,
        speakerName: 'THALGRIM',
        speakerSkin: 'thalgrim',
        text: '« La chair vieillit et trahit, guerrier, mais le quartz demeure éternel ! Deviens statue de givre dans ma galerie royale ! »',
        shakeTicks: [105],
        sfxCues: [
          { tick: 90, kind: 'magic' },
          { tick: 105, kind: 'drum' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 38,
            endX: 88,
            moveStartTick: 0,
            moveEndTick: 85,
            facing: 1,
          },
          {
            skin: 'thalgrim',
            startX: 268,
            endX: 232,
            moveStartTick: 0,
            moveEndTick: 80,
            facing: -1,
            poseAtTick: { tick: 88, action: 'boss_cast', duration: 30 },
          },
        ],
      },
      {
        stage: 'caverns',
        backdrop: 'arena',
        durationTicks: 275,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: '« Un roi qui livre des innocents aux fers n’est plus qu’un geôlier de pierre. En garde, Thalgrim ! »',
        sfxCues: [{ tick: 60, kind: 'swing_heavy' }],
        actors: [
          {
            skin: 'krom',
            startX: 88,
            endX: 88,
            facing: 1,
            poseAtTick: { tick: 55, action: 'slash_high', duration: 24 },
          },
          {
            skin: 'thalgrim',
            startX: 232,
            endX: 232,
            facing: -1,
            poseAtTick: { tick: 65, action: 'block_high', duration: 95 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE III — OUVERTURE : LES CRYPTES D’OBSIDIENNE
  // ==========================================================================
  act3_opening: {
    id: 'act3_opening',
    title: 'ACTE III · LE FLEUVE DES ÂMES ENCHAÎNÉES',
    musicTrack: 'crypt',
    shots: [
      {
        stage: 'crypt',
        backdrop: 'zone',
        camStartX: 0,
        camEndX: 175,
        durationTicks: 315,
        speakerName: 'CHRONIQUE',
        speakerSkin: 'krom',
        text: 'La fraîcheur des eaux bleues meurt dans un souffle de soufre et de braise. Sous la montagne s’étendent les Cryptes où gémissent mille vaincus.',
        sfxCues: [{ tick: 28, kind: 'drum' }],
        actors: [
          {
            skin: 'krom',
            startX: 55,
            endX: 250,
            moveStartTick: 0,
            moveEndTick: 225,
            facing: 1,
          },
        ],
      },
      {
        stage: 'crypt',
        backdrop: 'zone',
        camStartX: 540,
        camEndX: 735,
        durationTicks: 310,
        speakerName: 'FANATIQUE D’OBSIDIENNE',
        speakerSkin: 'cult_acolyte',
        text: '« Par le masque de fer de Vorgath, ouvrez les fosses ardentes ! Que les morts sans repos engloutissent ce porteur d’acier ! »',
        sfxCues: [{ tick: 85, kind: 'magic' }],
        actors: [
          {
            skin: 'cult_acolyte',
            startX: 785,
            endX: 755,
            moveStartTick: 0,
            moveEndTick: 80,
            facing: -1,
            poseAtTick: { tick: 85, action: 'cleave_overhead', duration: 32 },
          },
          {
            skin: 'risen_zombie',
            startX: 855,
            endX: 802,
            moveStartTick: 35,
            moveEndTick: 200,
            facing: -1,
          },
          {
            skin: 'undead_warrior',
            startX: 925,
            endX: 862,
            moveStartTick: 50,
            moveEndTick: 220,
            facing: -1,
          },
        ],
      },
      {
        stage: 'crypt',
        backdrop: 'arena',
        durationTicks: 305,
        speakerName: 'VORGATH LE BOURREAU',
        speakerSkin: 'vorgath',
        text: 'Sur l’arche battue par les vagues de lave, Vorgath le Sans-Visage caresse le fil de son couperet rougi par cent royaumes brisés…',
        shakeTicks: [108],
        sfxCues: [
          { tick: 95, kind: 'magic' },
          { tick: 108, kind: 'drum' },
        ],
        actors: [
          {
            skin: 'vorgath',
            startX: 215,
            endX: 185,
            moveStartTick: 0,
            moveEndTick: 90,
            facing: -1,
            poseAtTick: { tick: 95, action: 'boss_cast', duration: 34 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE III — ENTRÉE DE BOSS : VORGATH LE BOURREAU
  // ==========================================================================
  boss3_intro: {
    id: 'boss3_intro',
    title: 'FACE-À-FACE · LE PONT DU BILLOT',
    musicTrack: 'crypt',
    shots: [
      {
        stage: 'crypt',
        backdrop: 'arena',
        durationTicks: 290,
        speakerName: 'VORGATH',
        speakerSkin: 'vorgath',
        text: '« J’ai vu passer la fille des Brumes en larmes vers le Colisée… mais toi, barbare, ta route s’achève sur mon billot de basalte ! »',
        shakeTicks: [105],
        sfxCues: [
          { tick: 90, kind: 'magic' },
          { tick: 105, kind: 'drum' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 38,
            endX: 88,
            moveStartTick: 0,
            moveEndTick: 85,
            facing: 1,
          },
          {
            skin: 'vorgath',
            startX: 268,
            endX: 232,
            moveStartTick: 0,
            moveEndTick: 80,
            facing: -1,
            poseAtTick: { tick: 88, action: 'boss_cast', duration: 30 },
          },
        ],
      },
      {
        stage: 'crypt',
        backdrop: 'arena',
        durationTicks: 275,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: '« Tes paroles viennent de sceller ton sort, bourreau. La lave engloutira ton masque et tes chaînes ! »',
        sfxCues: [{ tick: 58, kind: 'swing_heavy' }],
        actors: [
          {
            skin: 'krom',
            startX: 88,
            endX: 88,
            facing: 1,
            poseAtTick: { tick: 52, action: 'slash_high', duration: 24 },
          },
          {
            skin: 'vorgath',
            startX: 232,
            endX: 232,
            facing: -1,
            poseAtTick: { tick: 62, action: 'block_high', duration: 95 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE IV — OUVERTURE : L’ARÈNE DES OSSEMENTS
  // ==========================================================================
  act4_opening: {
    id: 'act4_opening',
    title: 'ACTE IV · LES REMPARTS DU SANG-SABLE',
    musicTrack: 'arena',
    shots: [
      {
        stage: 'arena',
        backdrop: 'zone',
        camStartX: 0,
        camEndX: 180,
        durationTicks: 310,
        speakerName: 'CHRONIQUE',
        speakerSkin: 'krom',
        text: 'Émergé des ténèbres volcaniques sous un ciel d’ocre embrasé, Krom découvre les titanesques murailles du Colisée Impérial battues par les tambours.',
        sfxCues: [{ tick: 24, kind: 'drum' }],
        actors: [
          {
            skin: 'krom',
            startX: 52,
            endX: 255,
            moveStartTick: 0,
            moveEndTick: 220,
            facing: 1,
          },
        ],
      },
      {
        stage: 'arena',
        backdrop: 'zone',
        camStartX: 760,
        camEndX: 955,
        durationTicks: 310,
        speakerName: 'GARDE HALLEBARDIER',
        speakerSkin: 'imperial_halberdier',
        text: '« C’est le loup des Hautes-Brumes qui a brisé Vorgath ! Formez le mur d’acier devant la Porte au Crâne et lâchez les fauves de la fosse ! »',
        sfxCues: [{ tick: 90, kind: 'clash' }],
        actors: [
          {
            skin: 'imperial_halberdier',
            startX: 1055,
            endX: 995,
            moveStartTick: 0,
            moveEndTick: 135,
            facing: -1,
            poseAtTick: { tick: 140, action: 'slash_high', duration: 26 },
          },
          {
            skin: 'pit_thrall',
            startX: 1125,
            endX: 1058,
            moveStartTick: 25,
            moveEndTick: 170,
            facing: -1,
          },
        ],
      },
      {
        stage: 'arena',
        backdrop: 'arena',
        durationTicks: 305,
        speakerName: 'MALAKOR L’ÉCORCHEUR',
        speakerSkin: 'malakor',
        text: 'Seul chemin vers le pont de la Citadelle : traverser le sable rouge où règne Malakor, prince déchu ivre d’ovations et de duels à mort.',
        sfxCues: [{ tick: 75, kind: 'swing_heavy' }],
        actors: [
          {
            skin: 'malakor',
            startX: 235,
            endX: 175,
            moveStartTick: 0,
            moveEndTick: 90,
            facing: -1,
            poseAtTick: { tick: 95, action: 'victory', duration: 140 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE IV — ENTRÉE DE BOSS : MALAKOR L’ÉCORCHEUR
  // ==========================================================================
  boss4_intro: {
    id: 'boss4_intro',
    title: 'FACE-À-FACE · JUGEMENT DU COLISÉE',
    musicTrack: 'arena',
    shots: [
      {
        stage: 'arena',
        backdrop: 'arena',
        durationTicks: 290,
        speakerName: 'MALAKOR',
        speakerSkin: 'malakor',
        text: '« Entends-tu rugir cent mille gorges, barbare ? Cent rois ont mordu cette poussière sous mon épée dentelée — offre-leur un beau trépas ! »',
        sfxCues: [{ tick: 55, kind: 'swing_heavy' }],
        actors: [
          {
            skin: 'krom',
            startX: 42,
            endX: 88,
            moveStartTick: 0,
            moveEndTick: 85,
            facing: 1,
          },
          {
            skin: 'malakor',
            startX: 280,
            endX: 228,
            moveStartTick: 20,
            moveEndTick: 90,
            facing: -1,
            poseAtTick: { tick: 48, action: 'roll_fwd', duration: 30 },
          },
        ],
      },
      {
        stage: 'arena',
        backdrop: 'arena',
        durationTicks: 275,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: '« Garde tes saluts pour les gradins, cabotin d’or. Mon glaive ne danse pas : il tranche ! »',
        sfxCues: [{ tick: 60, kind: 'clash' }],
        actors: [
          {
            skin: 'krom',
            startX: 88,
            endX: 88,
            facing: 1,
            poseAtTick: { tick: 55, action: 'thrust_mid', duration: 24 },
          },
          {
            skin: 'malakor',
            startX: 228,
            endX: 228,
            facing: -1,
            poseAtTick: { tick: 52, action: 'block_high', duration: 80 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE V — OUVERTURE : LA CITADELLE INFERNALE
  // ==========================================================================
  act5_opening: {
    id: 'act5_opening',
    title: 'ACTE V · LE PONT DES LÉGIONS MAUDITES',
    musicTrack: 'inferno',
    shots: [
      {
        stage: 'inferno',
        backdrop: 'zone',
        camStartX: 0,
        camEndX: 190,
        durationTicks: 315,
        speakerName: 'CHRONIQUE',
        speakerSkin: 'krom',
        text: 'Le silence tombe sur le Colisée vaincu tandis que se lève une lune blafarde. Devant Krom s’étire le pont nocturne menant aux tours de braise.',
        sfxCues: [{ tick: 28, kind: 'drum' }],
        actors: [
          {
            skin: 'krom',
            startX: 48,
            endX: 260,
            moveStartTick: 0,
            moveEndTick: 225,
            facing: 1,
          },
        ],
      },
      {
        stage: 'inferno',
        backdrop: 'zone',
        camStartX: 1120,
        camEndX: 1330,
        durationTicks: 310,
        speakerName: 'MAGE SQUELETTE',
        speakerSkin: 'skeleton_mage',
        text: '« Le rituel du Seigneur Drax approche de son terme ! Démons des Abysses, embrasez le viaduc avant que cet homme n’atteigne la herse ! »',
        sfxCues: [{ tick: 80, kind: 'magic' }],
        actors: [
          {
            skin: 'skeleton_mage',
            startX: 1410,
            endX: 1365,
            moveStartTick: 0,
            moveEndTick: 125,
            facing: -1,
            poseAtTick: { tick: 130, action: 'slash_high', duration: 28 },
          },
          {
            skin: 'abyssal_demon',
            startX: 1495,
            endX: 1428,
            moveStartTick: 20,
            moveEndTick: 165,
            facing: -1,
          },
        ],
      },
      {
        stage: 'inferno',
        backdrop: 'arena',
        durationTicks: 310,
        speakerName: 'BAELGOR DES BRAISES',
        speakerSkin: 'baelgor',
        text: 'Sous les cages de fer suspendues au magma veille l’Archonte Baelgor, général immortel dont l’armure bat du feu même des Enfers…',
        shakeTicks: [105],
        sfxCues: [
          { tick: 90, kind: 'swing_heavy' },
          { tick: 105, kind: 'magic' },
        ],
        actors: [
          {
            skin: 'baelgor',
            startX: 232,
            endX: 188,
            moveStartTick: 0,
            moveEndTick: 90,
            facing: -1,
            poseAtTick: { tick: 95, action: 'victory', duration: 140 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE V — ENTRÉE DE BOSS : BAELGOR
  // ==========================================================================
  boss5_intro: {
    id: 'boss5_intro',
    title: 'FACE-À-FACE · LA PORTE DES BRAISES',
    musicTrack: 'inferno',
    shots: [
      {
        stage: 'inferno',
        backdrop: 'arena',
        durationTicks: 290,
        speakerName: 'BAELGOR',
        speakerSkin: 'baelgor',
        text: '« Quatre champions sont tombés sous ta lame, mortel, mais l’acier humain fond devant le souffle de l’Abîme ! »',
        shakeTicks: [100],
        sfxCues: [
          { tick: 85, kind: 'magic' },
          { tick: 100, kind: 'drum' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 40,
            endX: 88,
            moveStartTick: 0,
            moveEndTick: 85,
            facing: 1,
          },
          {
            skin: 'baelgor',
            startX: 274,
            endX: 230,
            moveStartTick: 15,
            moveEndTick: 85,
            facing: -1,
            poseAtTick: { tick: 90, action: 'boss_cast', duration: 30 },
          },
        ],
      },
      {
        stage: 'inferno',
        backdrop: 'arena',
        durationTicks: 275,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: '« Mon cœur brûle d’un feu plus ancien que tes forges, Baelgor. Livre-moi le passage vers Drax ! »',
        sfxCues: [{ tick: 58, kind: 'clash' }],
        actors: [
          {
            skin: 'krom',
            startX: 88,
            endX: 88,
            facing: 1,
            poseAtTick: { tick: 52, action: 'cleave_overhead', duration: 26 },
          },
          {
            skin: 'baelgor',
            startX: 230,
            endX: 230,
            facing: -1,
            poseAtTick: { tick: 50, action: 'block_high', duration: 90 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE VI — OUVERTURE : LE SANCTUAIRE DE DRAX
  // ==========================================================================
  act6_opening: {
    id: 'act6_opening',
    title: 'ACTE VI · LA COURONNE D’OMBRE ET DE FOUDRE',
    musicTrack: 'sanctuary',
    shots: [
      {
        stage: 'sanctuary',
        backdrop: 'zone',
        camStartX: 0,
        camEndX: 185,
        durationTicks: 315,
        speakerName: 'CHRONIQUE',
        speakerSkin: 'krom',
        text: 'Blessé mais indomptable, Krom franchit le dernier viaduc cyclopéen. Le ciel se fend d’éclairs violets au-dessus du Sanctuaire interdit.',
        lightningTicks: [38, 175],
        sfxCues: [{ tick: 38, kind: 'thunder' }],
        actors: [
          {
            skin: 'krom',
            startX: 48,
            endX: 255,
            moveStartTick: 0,
            moveEndTick: 225,
            facing: 1,
          },
        ],
      },
      {
        stage: 'sanctuary',
        backdrop: 'zone',
        camStartX: 860,
        camEndX: 1055,
        durationTicks: 310,
        speakerName: 'SENTINELLE SPECTRALE',
        speakerSkin: 'drax_acolyte',
        text: '« Les spectres des rois déchus gardent ces colonnades ! Nulle âme vivante ne troublera les noces d’ombre du Seigneur Drax ! »',
        lightningTicks: [95],
        sfxCues: [
          { tick: 65, kind: 'magic' },
          { tick: 95, kind: 'thunder' },
        ],
        actors: [
          {
            skin: 'spectral_wraith',
            startX: 1125,
            endX: 1055,
            moveStartTick: 0,
            moveEndTick: 145,
            facing: -1,
          },
          {
            skin: 'drax_acolyte',
            startX: 1195,
            endX: 1125,
            moveStartTick: 20,
            moveEndTick: 165,
            facing: -1,
            poseAtTick: { tick: 170, action: 'slash_high', duration: 26 },
          },
        ],
      },
      {
        stage: 'sanctuary',
        backdrop: 'arena',
        durationTicks: 320,
        speakerName: 'SEIGNEUR DRAX',
        speakerSkin: 'drax',
        text: '« Contemple ton impuissance, fils des Brumes ! Dès que sonnera minuit, le souffle de Valéria scellera le Cœur d’Acier à ma couronne pour l’éternité ! »',
        lightningTicks: [45, 190],
        heartArtifact: { x: 160, y: 122, mode: 'corrupted' },
        sfxCues: [
          { tick: 45, kind: 'thunder' },
          { tick: 110, kind: 'magic' },
        ],
        actors: [
          {
            skin: 'drax',
            startX: 235,
            endX: 205,
            moveStartTick: 0,
            moveEndTick: 90,
            facing: -1,
            poseAtTick: { tick: 95, action: 'victory', duration: 155 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ACTE VI — ENTRÉE DE BOSS : SEIGNEUR DRAX
  // ==========================================================================
  boss6_intro: {
    id: 'boss6_intro',
    title: 'ULTIME DUEL · LE JUGEMENT DE L’ACIER',
    musicTrack: 'sanctuary',
    shots: [
      {
        stage: 'sanctuary',
        backdrop: 'arena',
        durationTicks: 300,
        speakerName: 'SEIGNEUR DRAX',
        speakerSkin: 'drax',
        text: '« À genoux devant un dieu naissant ! La foudre, les morts et la nuit obéissent à ma voix — que pèse une simple lame de fer ? »',
        lightningTicks: [30, 145],
        heartArtifact: { x: 160, y: 118, mode: 'corrupted' },
        sfxCues: [
          { tick: 30, kind: 'thunder' },
          { tick: 95, kind: 'magic' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 36,
            endX: 88,
            moveStartTick: 0,
            moveEndTick: 85,
            facing: 1,
          },
          {
            skin: 'drax',
            startX: 272,
            endX: 232,
            moveStartTick: 0,
            moveEndTick: 80,
            facing: -1,
            poseAtTick: { tick: 90, action: 'boss_cast', duration: 30 },
          },
        ],
      },
      {
        stage: 'sanctuary',
        backdrop: 'arena',
        durationTicks: 285,
        speakerName: 'KROM',
        speakerSkin: 'krom',
        text: '« Elle porte la mémoire d’un peuple libre et l’amour d’un serment invaincu. En garde, Drax ! »',
        sfxCues: [{ tick: 60, kind: 'clash' }],
        actors: [
          {
            skin: 'krom',
            startX: 88,
            endX: 88,
            facing: 1,
            poseAtTick: { tick: 52, action: 'victory', duration: 120 },
          },
          {
            skin: 'drax',
            startX: 232,
            endX: 232,
            facing: -1,
            poseAtTick: { tick: 58, action: 'block_high', duration: 105 },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // CONCLUSION ÉPIQUE — L’AUBE DU CŒUR D’ACIER (4 PLANS)
  // ==========================================================================
  campaign_ending: {
    id: 'campaign_ending',
    title: 'ÉPILOGUE · LE CHANT DE L’AUBE RETROUVÉE',
    musicTrack: 'title',
    shots: [
      {
        stage: 'sanctuary',
        backdrop: 'arena',
        durationTicks: 335,
        speakerName: 'CHRONIQUE',
        speakerSkin: 'drax',
        text: 'Fendu par l’ultime revers de Krom, le glaive maudit de Drax vole en éclats ! Sa couronne d’ombre roule sur la dalle tandis que s’écroule son trône.',
        lightningTicks: [26],
        shakeTicks: [26],
        sfxCues: [
          { tick: 26, kind: 'thunder' },
          { tick: 80, kind: 'clash' },
        ],
        actors: [
          {
            skin: 'krom',
            startX: 118,
            endX: 140,
            moveStartTick: 0,
            moveEndTick: 80,
            facing: 1,
            poseAtTick: { tick: 85, action: 'victory', duration: 185 },
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
        durationTicks: 340,
        speakerName: 'KROM & VALÉRIA',
        speakerSkin: 'krom',
        text: 'D’un coup franc, Krom brise les chaînes d’obsidienne de Valéria. Entre leurs mains réunies, le Cœur d’Acier rejette la nuit et chante d’une lueur pure !',
        skyTint: 'rgba(251, 191, 36, 0.22)',
        heartArtifact: { x: 166, y: 138, mode: 'restored', risePx: 28 },
        sfxCues: [{ tick: 40, kind: 'fanfare' }],
        actors: [
          {
            skin: 'krom',
            startX: 130,
            endX: 148,
            moveStartTick: 0,
            moveEndTick: 75,
            facing: 1,
            poseAtTick: { tick: 80, action: 'victory', duration: 195 },
          },
        ],
      },
      {
        stage: 'forest',
        backdrop: 'zone',
        camStartX: 240,
        camEndX: 60,
        durationTicks: 335,
        speakerName: 'CHRONIQUE DU RETOUR',
        speakerSkin: 'krom',
        text: 'Les nuées pourpres s’effacent devant l’aurore. Sur le chemin du retour, les brasiers maudits s’éteignent et le vent tiède éveille les bourgeons d’argent.',
        skyTint: 'rgba(253, 224, 71, 0.14)',
        sfxCues: [{ tick: 30, kind: 'magic' }],
        actors: [
          {
            skin: 'krom',
            startX: 390,
            endX: 195,
            moveStartTick: 0,
            moveEndTick: 240,
            facing: -1,
          },
        ],
      },
      {
        stage: 'forest',
        backdrop: 'arena',
        durationTicks: 360,
        speakerName: 'LÉGENDE DES HAUTES-BRUMES',
        speakerSkin: 'krom',
        text: 'Les foyers du Nord renaissent autour de Valéria et de son libérateur. Tant que brilleront les étoiles d’hiver, les bardes chanteront Krom et le Glaive d’Acier !',
        skyTint: 'rgba(253, 224, 71, 0.18)',
        heartArtifact: { x: 274, y: 120, mode: 'restored', risePx: 10 },
        sfxCues: [{ tick: 24, kind: 'fanfare' }],
        actors: [
          {
            skin: 'krom',
            startX: 88,
            endX: 160,
            moveStartTick: 0,
            moveEndTick: 115,
            facing: 1,
            poseAtTick: { tick: 120, action: 'victory', duration: 205 },
          },
        ],
      },
    ],
  },
};
