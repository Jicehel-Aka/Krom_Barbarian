import heroDuelImg from '../assets/images/hero_barbarian_duel_1793118532070.jpg';
import stageForestImg from '../assets/images/stage_forest_pixel_1793121003697.jpg';
import stageCryptImg from '../assets/images/stage_crypt_pixel_1793121006436.jpg';
import stageArenaImg from '../assets/images/stage_arena_pixel_1793121009126.jpg';
import stageSanctuaryImg from '../assets/images/stage_sanctuary_pixel_1793121025789.jpg';
import zone1TrailImg from '../assets/images/zone1_misty_monolith_trail_1793183421592.jpg';
import zone2CryptDescentImg from '../assets/images/zone2_obsidian_crypt_descent_1793183422836.jpg';
import zone3GladiatorTunnelImg from '../assets/images/zone3_gladiator_bone_tunnel_1793183425359.jpg';
import zone4StormBridgeImg from '../assets/images/zone4_storm_citadel_bridge_1793183427257.jpg';
import storyChronicleImg from '../assets/images/story_interlude_chronicle_art_1793183427577.jpg';
import type {
  FighterSkin,
  MinionSkin,
  ProgressionState,
  StageId,
  TechniqueId,
  ZoneWaveEnemySpec,
} from '../types/game';

export const HERO_BANNER_IMAGE = heroDuelImg;
export const STORY_CHRONICLE_IMAGE = storyChronicleImg;

export interface MinionArchetype {
  skin: MinionSkin;
  name: string;
  shortName: string;
  factionLabel: string;
  weaponLabel: string;
  hp: number;
  hitsToKillLabel: string;
  scoreValue: number;
  damageMultiplier: number;
  aggression: number;
  moveSpeed: number;
  summary: string;
}

export const MINION_ARCHETYPES: Record<MinionSkin, MinionArchetype> = {
  wolf_raider: {
    skin: 'wolf_raider',
    name: 'Pillard Loup-Gris',
    shortName: 'PILLARD',
    factionLabel: 'Acte I · Avant-Garde des Brumes',
    weaponLabel: 'Hachette nordique à un fer',
    hp: 20,
    hitsToKillLabel: '1 à 2 coups',
    scoreValue: 150,
    damageMultiplier: 0.36,
    aggression: 0.24,
    moveSpeed: 1.55,
    summary:
      'Éclaireur en pelisse de loup sans casque cornu. Fonce imprudemment la hache levée : un seul Moulinet ou deux tailles suffisent à l’abattre.',
  },
  monolith_spearman: {
    skin: 'monolith_spearman',
    name: 'Garde des Monolithes',
    shortName: 'GARDE RUNE',
    factionLabel: 'Actes I & II · Veilleurs des Menhirs',
    weaponLabel: 'Glaive givré des tertres',
    hp: 34,
    hitsToKillLabel: '2 à 3 coups',
    scoreValue: 250,
    damageMultiplier: 0.42,
    aggression: 0.28,
    moveSpeed: 1.65,
    summary:
      'Fantassin aux peintures runiques cyan protégeant les sentiers sacrés. Tente parfois une parade haute que le balayage bas fauche net.',
  },
  cult_acolyte: {
    skin: 'cult_acolyte',
    name: 'Fanatique d’Obsidienne',
    shortName: 'FANATIQUE',
    factionLabel: 'Actes II & IV · Secte du Feu Noir',
    weaponLabel: 'Fendoir rituel volcanique',
    hp: 24,
    hitsToKillLabel: '1 à 2 coups',
    scoreValue: 200,
    damageMultiplier: 0.40,
    aggression: 0.27,
    moveSpeed: 1.60,
    summary:
      'Zélote encapuchonné de pourpre aux yeux d’ambre incandescent. Frappe avec ferveur mais sa robe sans armure cède dès le premier fendoir lourd.',
  },
  crypt_skeleton: {
    skin: 'crypt_skeleton',
    name: 'Squelette Légionnaire',
    shortName: 'SQUELETTE',
    factionLabel: 'Actes II & III · Catacombes & Fosses',
    weaponLabel: 'Lame antique ébréchée',
    hp: 36,
    hitsToKillLabel: '2 à 3 coups',
    scoreValue: 300,
    damageMultiplier: 0.44,
    aggression: 0.31,
    moveSpeed: 1.72,
    summary:
      'Guerrier d’os ivoire réanimé par les runes de Drax. Avance sans crainte dans les couloirs souterrains avant de voler en éclats sous l’acier.',
  },
  pit_thrall: {
    skin: 'pit_thrall',
    name: 'Écorcheur des Sables',
    shortName: 'GLADIATEUR',
    factionLabel: 'Actes III & IV · Fosse Impériale',
    weaponLabel: 'Sabre dentelé d’arène',
    hp: 48,
    hitsToKillLabel: '3 à 4 coups',
    scoreValue: 400,
    damageMultiplier: 0.48,
    aggression: 0.35,
    moveSpeed: 1.85,
    summary:
      'Gladiateur asservi au cimier de bronze et pagne turquoise. Plus vif que les pillards du Nord, il garde l’entrée du Colisée des Ossements.',
  },
  drax_acolyte: {
    skin: 'drax_acolyte',
    name: 'Sentinelle Spectrale',
    shortName: 'SENTINELLE',
    factionLabel: 'Acte IV · Pont de la Citadelle',
    weaponLabel: 'Épée d’ombre cyan',
    hp: 64,
    hitsToKillLabel: '4 à 5 coups',
    scoreValue: 550,
    damageMultiplier: 0.52,
    aggression: 0.39,
    moveSpeed: 1.92,
    summary:
      'Chevalier-spectre sans couronne forgé dans la foudre bleue du Sanctuaire. Dernier rempart d’élite avant le trône du Sorcier-Roi Drax.',
  },
};

export interface CampaignAct {
  actNumber: number;
  id: StageId;
  title: string;
  regionName: string;
  image: string;
  zoneTitle: string;
  zoneSubtitle: string;
  zoneImage: string;
  zoneStoryIntro: string;
  storyLead: string;
  storyBody: string;
  bossPreludeTitle: string;
  bossPreludeBody: string;
  bossName: string;
  bossTitle: string;
  bossSkin: FighterSkin;
  bossHp: number;
  bossDamageMultiplier: number;
  bossAggression: number; // 0.35 .. 0.90
  bossSpecialLabel: string;
  tacticalHint: string;
  bossTaunt: string;
  victoryEpilogue: string;
  interludeTitle: string;
  interludeBody: string;
  interludeImage: string;
  zoneFeaturedMinions: MinionSkin[];
  zoneWaves: ZoneWaveEnemySpec[];
  rewardShards: number;
  rewardXp: number;
}

export const CAMPAIGN_ACTS: CampaignAct[] = [
  {
    actNumber: 1,
    id: 'forest',
    title: 'Acte I · Les Clairières Cendrées',
    regionName: 'Cercle des Monolithes Nordiques',
    image: stageForestImg,
    zoneTitle: 'Sentier des Brumes & Menhirs',
    zoneSubtitle: 'Approche des Clairières · 6 Éclaireurs Nordiques (1 à 3 coups)',
    zoneImage: zone1TrailImg,
    zoneStoryIntro:
      'Les villages des Hautes-Brumes brûlent encore sous la cendre. Krom saisit le glaive ancestral et s’engage sur le Sentier des Menhirs, où rôdent les Pillards Loup-Gris et les Gardes Runiques chargés d’abattre les survivants.',
    storyLead: 'Le serment forgé dans les cendres du clan.',
    storyBody:
      'Les légions du Sorcier-Roi Drax ont incendié les villages des Hautes-Brumes et dérobé le Cœur d’Acier. Devant l’arche runique des Clairières Cendrées, Gorgar le Briseur barre la route à quiconque ose défier la Citadelle.',
    bossPreludeTitle: 'L’Arche des Monolithes · Gorgar s’avance !',
    bossPreludeBody:
      'Les éclaireurs du sentier gisent dans la mousse. Au bout de la clairière sacrée, le colosse cornu Gorgar fait tournoyer sa hache double devant les pierres runiques.',
    bossName: 'Gorgar',
    bossTitle: 'Garde-Frontière des Monolithes',
    bossSkin: 'gorgar',
    bossHp: 105,
    bossDamageMultiplier: 0.95,
    bossAggression: 0.44,
    bossSpecialLabel: 'Fendoir Brise-Bouclier',
    tacticalHint:
      'Observez l’élan de son casque à cornes : accroupissez-vous sous ses tailles hautes ou parez avec L1 juste avant l’impact pour le déséquilibrer.',
    bossTaunt: '« Ton glaive rouillé se brisera sur mes pierres sacrées, barbare ! »',
    victoryEpilogue:
      'Gorgar s’effondre au pied des menhirs. Les corbeaux s’envolent vers les profondeurs volcaniques : la porte des Cryptes d’Obsidienne est ouverte.',
    interludeTitle: 'Transition · La Faille des Chaînes Ardentes',
    interludeBody:
      'Derrière le menhir brisé de Gorgar s’ouvre un gouffre basaltique illuminé par le magma. Guidé par les chants funèbres des captifs, Krom s’enfonce sous la montagne vers les Cryptes d’Obsidienne.',
    interludeImage: storyChronicleImg,
    zoneFeaturedMinions: ['wolf_raider', 'monolith_spearman'],
    zoneWaves: [
      { skin: 'wolf_raider', triggerX: 20, spawnX: 285, gateX: 340 },
      { skin: 'wolf_raider', triggerX: 90, spawnX: 350, gateX: 340, dropKind: 'steel_shard' },
      { skin: 'wolf_raider', triggerX: 250, spawnX: 540, gateX: 620 },
      { skin: 'monolith_spearman', triggerX: 290, spawnX: 605, gateX: 620, dropKind: 'meat_heal' },
      { skin: 'wolf_raider', triggerX: 530, spawnX: 810, gateX: 920 },
      { skin: 'monolith_spearman', triggerX: 575, spawnX: 875, gateX: 920, dropKind: 'steel_shard' },
    ],
    rewardShards: 45,
    rewardXp: 120,
  },
  {
    actNumber: 2,
    id: 'crypt',
    title: 'Acte II · Les Cryptes d’Obsidienne',
    regionName: 'Souterrains des Chaînes Ardentes',
    image: stageCryptImg,
    zoneTitle: 'Descente des Geôles de Basalte',
    zoneSubtitle: 'Ponts de Lave · 7 Fanatiques & Squelettes (1 à 3 coups)',
    zoneImage: zone2CryptDescentImg,
    zoneStoryIntro:
      'La chaleur des rivières de lave étouffe les souterrains. Sur les arches d’obsidienne, les Fanatiques en robe cramoisie réveillent d’anciens Squelettes Légionnaires pour barrer l’accès au pont du Bourreau.',
    storyLead: 'Sous la roche noire résonne le marteau du geôlier.',
    storyBody:
      'Guidé par la lueur des fissures de lave, Krom descend dans les geôles où croupissent les guerriers captifs. Au centre du pont de basalte veille Vorgath, le Bourreau sans visage, dont le couperet a tranché cent serments.',
    bossPreludeTitle: 'Le Pont du Billot · Vorgath lève son couperet !',
    bossPreludeBody:
      'Les derniers ossements retombent dans le magma. Au milieu des chaînes ardentes, la silhouette massive de Vorgath frappe la dalle et fait jaillir une gerbe de feu.',
    bossName: 'Vorgath',
    bossTitle: 'Le Bourreau des Basaltes',
    bossSkin: 'vorgath',
    bossHp: 130,
    bossDamageMultiplier: 1.12,
    bossAggression: 0.58,
    bossSpecialLabel: 'Onde Sismique de Lave',
    tacticalHint:
      'Lorsqu’il lève son couperet à deux mains, sautez (Haut) par-dessus l’onde ardente qui court au sol, puis punissez sa récupération.',
    bossTaunt: '« Nul ne franchit la fosse sans laisser sa tête sur le billot ! »',
    victoryEpilogue:
      'Les chaînes des cachots se rompent. Avant de rendre son dernier souffle, Vorgath désigne l’escalier sanglant menant au Colisée des Ossements.',
    interludeTitle: 'Transition · L’Escalier vers le Soleil de Sang',
    interludeBody:
      'Les prisonniers libérés acclament le nom de Krom tandis qu’il gravit les marches de pierre brûlante. Au sommet retentit le grondement assourdissant des tambours du Colisée Impérial.',
    interludeImage: storyChronicleImg,
    zoneFeaturedMinions: ['cult_acolyte', 'crypt_skeleton', 'monolith_spearman'],
    zoneWaves: [
      { skin: 'cult_acolyte', triggerX: 20, spawnX: 280, gateX: 340 },
      { skin: 'cult_acolyte', triggerX: 85, spawnX: 345, gateX: 340, dropKind: 'steel_shard' },
      { skin: 'crypt_skeleton', triggerX: 245, spawnX: 530, gateX: 630 },
      { skin: 'monolith_spearman', triggerX: 295, spawnX: 595, gateX: 630, dropKind: 'meat_heal' },
      { skin: 'cult_acolyte', triggerX: 520, spawnX: 775, gateX: 920 },
      { skin: 'crypt_skeleton', triggerX: 560, spawnX: 835, gateX: 920 },
      { skin: 'crypt_skeleton', triggerX: 600, spawnX: 885, gateX: 920, dropKind: 'steel_shard' },
    ],
    rewardShards: 70,
    rewardXp: 210,
  },
  {
    actNumber: 3,
    id: 'arena',
    title: 'Acte III · L’Arène des Ossements',
    regionName: 'Fosse Impériale de Sang-Sable',
    image: stageArenaImg,
    zoneTitle: 'Couloir des Fauves & Gladiateurs',
    zoneSubtitle: 'Galerie de Sang-Sable · 7 Squelettes & Écorcheurs (2 à 4 coups)',
    zoneImage: zone3GladiatorTunnelImg,
    zoneStoryIntro:
      'Avant de fouler le sable central du Colisée, tout condamné doit survivre au Couloir des Ossements. Sous les herses de fer, les Écorcheurs des Sables et les Légionnaires Déchus cherchent la gloire et l’or.',
    storyLead: 'Mille clameurs réclament le sang du dernier homme libre.',
    storyBody:
      'Pour atteindre la tour du Sorcier-Roi, la Loi Ancienne impose de survivre au jugement du Colisée. Sous le regard féroce de la foule, Malakor l’Écorcheur bondit dans le sable ocre avec une célérité meurtrière.',
    bossPreludeTitle: 'La Herse s’ouvre · Malakor salue la foule !',
    bossPreludeBody:
      'Krom émerge en plein soleil sous une pluie de clameurs. Au centre de l’arène, le champion invaincu Malakor fait tournoyer sa lame dentelée.',
    bossName: 'Malakor',
    bossTitle: 'Champion Invaincu de la Fosse',
    bossSkin: 'malakor',
    bossHp: 145,
    bossDamageMultiplier: 1.2,
    bossAggression: 0.72,
    bossSpecialLabel: 'Roulade Éclair & Moulinet Croisé',
    tacticalHint:
      'Malakor roule fréquemment dans votre dos. Utilisez le balayage bas (Bas + A ou B) pour couper ses esquives et gardez votre Rage pour un Coup Fatal.',
    bossTaunt: '« La foule scande déjà mon nom ! Ton crâne ornera mon trône ! »',
    victoryEpilogue:
      'Le Colisée se fige dans un silence stupéfait. Au sommet des remparts, un éclair écarlate déchire les nuages : Drax vous attend dans son Sanctuaire.',
    interludeTitle: 'Transition · L’Ascension de la Tour Foudroyée',
    interludeBody:
      'Nul gladiateur n’ose plus croiser le regard du Barbare. Krom franchit la porte impériale et s’engage sur la chaussée vertigineuse battue par la foudre qui mène au Sanctuaire de Drax.',
    interludeImage: storyChronicleImg,
    zoneFeaturedMinions: ['crypt_skeleton', 'pit_thrall'],
    zoneWaves: [
      { skin: 'crypt_skeleton', triggerX: 20, spawnX: 285, gateX: 350 },
      { skin: 'pit_thrall', triggerX: 95, spawnX: 355, gateX: 350, dropKind: 'steel_shard' },
      { skin: 'crypt_skeleton', triggerX: 255, spawnX: 540, gateX: 640 },
      { skin: 'pit_thrall', triggerX: 305, spawnX: 605, gateX: 640, dropKind: 'meat_heal' },
      { skin: 'crypt_skeleton', triggerX: 530, spawnX: 780, gateX: 920 },
      { skin: 'pit_thrall', triggerX: 575, spawnX: 840, gateX: 920 },
      { skin: 'pit_thrall', triggerX: 615, spawnX: 890, gateX: 920, dropKind: 'steel_shard' },
    ],
    rewardShards: 100,
    rewardXp: 340,
  },
  {
    actNumber: 4,
    id: 'sanctuary',
    title: 'Acte IV · Le Sanctuaire de Drax',
    regionName: 'Citadelle Foudroyée du Sorcier-Roi',
    image: stageSanctuaryImg,
    zoneTitle: 'Pont Foudroyé de la Citadelle',
    zoneSubtitle: 'Rempart des Tempêtes · 7 Gardes d’Ombre & Zélotes (2 à 5 coups)',
    zoneImage: zone4StormBridgeImg,
    zoneStoryIntro:
      'Les éclairs pourpres frappent le viaduc cyclopéen de la Citadelle. Pour atteindre l’autel où le Cœur d’Acier est scellé, Krom doit tailler sa route à travers la garde personnelle du Sorcier-Roi : les Sentinelles Spectrales.',
    storyLead: 'L’acier mortel face à la sorcellerie immortelle.',
    storyBody:
      'Sous une tempête d’éclairs pourpres, Krom gravit l’autel suprême où la prêtresse Valéria et le Cœur d’Acier sont scellés. Le Seigneur Drax dégaine sa lame runique et invoque le feu noir des anciens tyrans.',
    bossPreludeTitle: 'L’Autel Suprême · Seigneur Drax descend du trône !',
    bossPreludeBody:
      'Les Sentinelles Spectrales se dissipent en poussière d’éther. Devant le pentagramme ardent, le Sorcier-Roi Drax lève son épée runique sous un tonnerre assourdissant.',
    bossName: 'Seigneur Drax',
    bossTitle: 'Sorcier-Roi de la Citadelle',
    bossSkin: 'drax',
    bossHp: 175,
    bossDamageMultiplier: 1.32,
    bossAggression: 0.85,
    bossSpecialLabel: 'Orbe de Feu Noir & Pas d’Ombre',
    tacticalHint:
      'Roulez (Bouton D) à travers ses orbes runiques pour fondre sur lui. En Phase 2, parez sa première attaque après téléportation avant de déclencher le Moulinet Décapitant !',
    bossTaunt: '« Incline-toi, mortel ! La foudre et l’ombre obéissent à ma couronne ! »',
    victoryEpilogue:
      'D’un revers fulgurant, le glaive de Krom brise la couronne maudite de Drax ! La tempête se dissipe sur les terres du Nord : Valéria est libre et le Cœur d’Acier flamboie à nouveau.',
    interludeTitle: 'Épilogue · L’Aube du Cœur d’Acier',
    interludeBody:
      'La Citadelle sombre s’écroule dans les nuages tandis que l’aube dorée éclaire à nouveau les Hautes-Brumes. Le nom de Krom et la légende de son Glaive d’Acier résonneront à jamais dans les chants du Nord !',
    interludeImage: storyChronicleImg,
    zoneFeaturedMinions: ['cult_acolyte', 'pit_thrall', 'drax_acolyte'],
    zoneWaves: [
      { skin: 'cult_acolyte', triggerX: 20, spawnX: 280, gateX: 350 },
      { skin: 'drax_acolyte', triggerX: 90, spawnX: 350, gateX: 350, dropKind: 'steel_shard' },
      { skin: 'pit_thrall', triggerX: 255, spawnX: 540, gateX: 645 },
      { skin: 'drax_acolyte', triggerX: 310, spawnX: 610, gateX: 645, dropKind: 'meat_heal' },
      { skin: 'cult_acolyte', triggerX: 525, spawnX: 775, gateX: 920 },
      { skin: 'pit_thrall', triggerX: 570, spawnX: 835, gateX: 920, dropKind: 'meat_heal' },
      { skin: 'drax_acolyte', triggerX: 615, spawnX: 890, gateX: 920, dropKind: 'steel_shard' },
    ],
    rewardShards: 160,
    rewardXp: 550,
  },
];

export interface UpgradeSpec {
  key: 'vitalityRank' | 'bladeRank' | 'staminaRank' | 'executionerRank';
  title: string;
  unitLabel: string;
  description: string;
  baseCost: number;
  costStep: number;
  formatEffect: (rank: number) => string;
}

export const FORGE_UPGRADES: UpgradeSpec[] = [
  {
    key: 'vitalityRank',
    title: 'Vigueur du Nord',
    unitLabel: 'Points de Vie',
    description: 'Renforce la constitution de Krom pour traverser les zones et encaisser les boss.',
    baseCost: 35,
    costStep: 30,
    formatEffect: (rank) => `${100 + rank * 15} PV max`,
  },
  {
    key: 'bladeRank',
    title: 'Trempe du Glaive',
    unitLabel: 'Tranchant',
    description: 'Affûte l’acier ancestral afin d’abattre les éclaireurs en un coup et percer les boss.',
    baseCost: 40,
    costStep: 35,
    formatEffect: (rank) => `+${rank * 12}% dégâts`,
  },
  {
    key: 'staminaRank',
    title: 'Souffle de Guerre',
    unitLabel: 'Endurance',
    description: 'Accélère la récupération du souffle après les roulades, sauts et parades.',
    baseCost: 30,
    costStep: 25,
    formatEffect: (rank) => `${100 + rank * 12} Souffle`,
  },
  {
    key: 'executionerRank',
    title: 'Instinct du Bourreau',
    unitLabel: 'Coup Fatal',
    description: 'Élargit la fenêtre de décapitation du Moulinet (Bouton C) sur sbires et boss.',
    baseCost: 50,
    costStep: 40,
    formatEffect: (rank) => `Seuil Coup Fatal ${35 + rank * 6}% PV`,
  },
];

export interface TechniqueSpec {
  id: TechniqueId;
  name: string;
  inputHint: string;
  unlockCost: number;
  summary: string;
}

export const SWORD_TECHNIQUES: TechniqueSpec[] = [
  {
    id: 'whirlwind_edge',
    name: 'Moulinet du Loup',
    inputHint: 'Bouton C / Arrière + A',
    unlockCost: 0,
    summary:
      'Rotation complète à 360° (+10 px de portée, +15% dégâts de moulinet, traînée sang-or). Élargit de +10% le seuil de décapitation fatale sur les Boss et accorde un bonus de score à l’exécution.',
  },
  {
    id: 'iron_riposte',
    name: 'Riposte de Fer',
    inputHint: 'Parade L1 juste à l’impact',
    unlockCost: 65,
    summary:
      'Élargit la Parade Parfaite à 13 frames (lueur cyan sur la lame) : renvoie une onde d’acier qui inflige 12 PV de contre-dégâts immédiats, étourdit sévèrement l’assaillant et restaure +28 Souffle & +22 Rage.',
  },
  {
    id: 'sky_breaker',
    name: 'Fendoir Brise-Garde',
    inputHint: 'R1 / Haut + A',
    unlockCost: 90,
    summary:
      'Enflamme le Fendoir lourd (+22% de dégâts et mise à terre sur coup net) : fracasse complètement la garde haute adverse en infligeant 58% de dégâts perçants et un étourdissement de garde.',
  },
];

export const DEFAULT_PROGRESSION: ProgressionState = {
  currentAct: 0,
  completedCampaign: false,
  steelShards: 30,
  renownXp: 0,
  highScore: 0,
  totalMinionsSlain: 0,
  totalWins: 0,
  totalDecapitations: 0,
  vitalityRank: 0,
  bladeRank: 0,
  staminaRank: 0,
  executionerRank: 0,
  unlockedTechniques: ['whirlwind_edge'],
  equippedTechnique: 'whirlwind_edge',
};
