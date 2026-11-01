import heroDuelImg from '../assets/images/hero_barbarian_duel_1793118532070.jpg';
import stageForestImg from '../assets/images/stage_forest_pixel_1793121003697.jpg';
import stageCavernsImg from '../assets/images/stage_caverns_arena_1793402526129.jpg';
import stageCryptImg from '../assets/images/stage_crypt_pixel_1793121006436.jpg';
import stageArenaImg from '../assets/images/stage_arena_pixel_1793121009126.jpg';
import stageInfernoImg from '../assets/images/stage_inferno_arena_1793402530359.jpg';
import stageSanctuaryImg from '../assets/images/stage_sanctuary_pixel_1793121025789.jpg';
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
    factionLabel: 'Actes III & V · Secte du Feu Noir',
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
    factionLabel: 'Actes III & IV · Catacombes & Fosses',
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
    factionLabel: 'Actes IV & V · Fosse Impériale',
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
    factionLabel: 'Acte VI · Pont du Sanctuaire',
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
  goblin_scout: {
    skin: 'goblin_scout',
    name: 'Gobelin Éclaireur',
    shortName: 'GOBELIN',
    factionLabel: 'Actes I & II · Rôdeurs des Racines',
    weaponLabel: 'Coutelas courbe & rondache',
    hp: 18,
    hitsToKillLabel: '1 à 2 coups',
    scoreValue: 140,
    damageMultiplier: 0.34,
    aggression: 0.26,
    moveSpeed: 1.78,
    summary:
      'Petit pillard sournois armé d’un coutelas et d’un bouclier de bois cerclé. Très vif sur ses appuis mais balayé dès le premier coup franc.',
  },
  orc_marauder: {
    skin: 'orc_marauder',
    name: 'Orque Maraudeur',
    shortName: 'ORQUE',
    factionLabel: 'Actes II & IV · Clans des Profondeurs',
    weaponLabel: 'Massue cloutée de fer',
    hp: 42,
    hitsToKillLabel: '3 coups',
    scoreValue: 320,
    damageMultiplier: 0.46,
    aggression: 0.30,
    moveSpeed: 1.52,
    summary:
      'Brute à la peau verdâtre brandissant un lourd gourdin hérissé de pointes. Ses coups écrasants punissent les gardes tardives.',
  },
  undead_warrior: {
    skin: 'undead_warrior',
    name: 'Guerrier Squelette',
    shortName: 'OS-FER',
    factionLabel: 'Acte III · Légion des Sépulcres',
    weaponLabel: 'Épée droite & écu rouillé',
    hp: 38,
    hitsToKillLabel: '2 à 3 coups',
    scoreValue: 290,
    damageMultiplier: 0.44,
    aggression: 0.31,
    moveSpeed: 1.68,
    summary:
      'Fantassin squelettique discipliné levant son bouclier avant de fendre l’air d’un revers tranchant.',
  },
  risen_zombie: {
    skin: 'risen_zombie',
    name: 'Zombie des Fosses',
    shortName: 'ZOMBIE',
    factionLabel: 'Acte III · Charniers d’Obsidienne',
    weaponLabel: 'Griffes putrides & morsure',
    hp: 32,
    hitsToKillLabel: '2 coups',
    scoreValue: 220,
    damageMultiplier: 0.40,
    aggression: 0.23,
    moveSpeed: 1.28,
    summary:
      'Cadavre titubant tiré des geôles souterraines. Lent mais tenace, il se jette en avant toutes griffes dehors.',
  },
  dire_wolf: {
    skin: 'dire_wolf',
    name: 'Loup Noir des Brumes',
    shortName: 'LOUP NOIR',
    factionLabel: 'Acte I · Meute Sauvage',
    weaponLabel: 'Crocs acérés & bond',
    hp: 26,
    hitsToKillLabel: '1 à 2 coups',
    scoreValue: 210,
    damageMultiplier: 0.39,
    aggression: 0.33,
    moveSpeed: 2.05,
    summary:
      'Grand loup au pelage sombre et aux yeux rouges qui bondit à ras du sol. Utilisez l’Estoc ou le Balayage pour briser son élan.',
  },
  cave_bat: {
    skin: 'cave_bat',
    name: 'Chauve-Souris Géante',
    shortName: 'CHAUVE-S.',
    factionLabel: 'Acte II · Voûtes Cristallines',
    weaponLabel: 'Piqué aérien & crocs',
    hp: 16,
    hitsToKillLabel: '1 coup haut',
    scoreValue: 160,
    damageMultiplier: 0.33,
    aggression: 0.30,
    moveSpeed: 2.10,
    summary:
      'Prédateur ailé planant au-dessus du sol : les Balayages Bas passent sous ses ailes ! Frappez-la avec une Taille Haute (A) ou un Fendoir (R1).',
  },
  spectral_wraith: {
    skin: 'spectral_wraith',
    name: 'Fantôme Hurleur',
    shortName: 'FANTÔME',
    factionLabel: 'Acte VI · Nécropole Foudroyée',
    weaponLabel: 'Griffe d’ectoplasme glacé',
    hp: 46,
    hitsToKillLabel: '3 coups',
    scoreValue: 440,
    damageMultiplier: 0.48,
    aggression: 0.37,
    moveSpeed: 1.95,
    summary:
      'Esprit tourmenté flottant dans une lueur spectrale bleutée. Glisse rapidement vers Krom pour déchirer sa garde.',
  },
  skeleton_mage: {
    skin: 'skeleton_mage',
    name: 'Mage Squelette',
    shortName: 'MAGE OS',
    factionLabel: 'Actes V & VI · Cabale Pyromancienne',
    weaponLabel: 'Bâton rubis & jet de flamme',
    hp: 34,
    hitsToKillLabel: '2 à 3 coups',
    scoreValue: 360,
    damageMultiplier: 0.50,
    aggression: 0.34,
    moveSpeed: 1.58,
    summary:
      'Nécromancien drapé d’écarlate canalisant le feu infernal au bout de son sceptre osseux. Roulez sous sa décharge pour le trancher.',
  },
  imperial_halberdier: {
    skin: 'imperial_halberdier',
    name: 'Garde Hallebardier',
    shortName: 'GARDE FER',
    factionLabel: 'Actes IV & V · Légion de Fer',
    weaponLabel: 'Hallebarde d’acier & pavois',
    hp: 52,
    hitsToKillLabel: '3 à 4 coups',
    scoreValue: 420,
    damageMultiplier: 0.49,
    aggression: 0.35,
    moveSpeed: 1.66,
    summary:
      'Soldat lourd en armure de plates complète et écu armorié. Sa longue hallebarde impose de parer (L1) ou briser sa garde (R1).',
  },
  stone_golem: {
    skin: 'stone_golem',
    name: 'Golem de Pierre Runique',
    shortName: 'GOLEM',
    factionLabel: 'Actes II & IV · Gardiens Anciens',
    weaponLabel: 'Poing monolithique sismique',
    hp: 62,
    hitsToKillLabel: '4 à 5 coups',
    scoreValue: 480,
    damageMultiplier: 0.54,
    aggression: 0.25,
    moveSpeed: 1.22,
    summary:
      'Colosse de granit moussu animé par un cœur runique azur. Très lent mais extrêmement résistant : enchaînez les Fendoirs R1 et Moulinets C.',
  },
  abyssal_demon: {
    skin: 'abyssal_demon',
    name: 'Démon des Abysses',
    shortName: 'DÉMON',
    factionLabel: 'Actes V & VI · Légion Infernale',
    weaponLabel: 'Espadon de braise ardente',
    hp: 58,
    hitsToKillLabel: '4 coups',
    scoreValue: 500,
    damageMultiplier: 0.53,
    aggression: 0.38,
    moveSpeed: 1.88,
    summary:
      'Guerrier ailé à la peau écarlate maniant une lame chauffée à blanc. Bondit par-dessus les balayages répétés et frappe avec fureur.',
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
    regionName: 'Forêt Ancienne & Portail Runique',
    image: stageForestImg,
    zoneTitle: 'Futaies Profondes, Ruines & Arche Runique',
    zoneSubtitle: 'Panorama Forestier · 11 Gobelins, Loups & Pillards',
    zoneImage: '/sheets/panorama_acte1_foret.png?v16',
    zoneStoryIntro:
      'Les villages des Hautes-Brumes fument encore sous la cendre. Krom s’engage sous les chênes géants, franchit le vieux pont de pierre moussu et taille sa route jusqu’au portail runique.',
    storyLead: 'Le serment forgé dans les cendres du clan.',
    storyBody:
      'Les légions du Sorcier-Roi Drax ont incendié les villages des Hautes-Brumes et dérobé le Cœur d’Acier. Devant l’arche runique des Clairières, Gorgar le Briseur barre la route vers les profondeurs.',
    bossPreludeTitle: 'L’Arche des Monolithes · Gorgar s’avance !',
    bossPreludeBody:
      'Les meutes de loups et les éclaireurs gisent dans la mousse. Devant le portail illuminé de runes bleues, le colosse cornu Gorgar fait tournoyer sa hache double.',
    bossName: 'Gorgar',
    bossTitle: 'Garde-Frontière des Monolithes',
    bossSkin: 'gorgar',
    bossHp: 105,
    bossDamageMultiplier: 0.95,
    bossAggression: 0.44,
    bossSpecialLabel: 'Fendoir Brise-Bouclier & Saut Contre-Balayage',
    tacticalHint:
      'Variez vos hauteurs d’attaque : si vous répétez le Balayage Bas (B), Gorgar sautera par-dessus votre lame pour vous punir !',
    bossTaunt: '« Ton glaive rouillé se brisera sur mes pierres sacrées, barbare ! »',
    victoryEpilogue:
      'Gorgar s’effondre au pied des menhirs. Le portail runique s’entrouvre sur un escalier plongeant vers les Cavernes de Cristal.',
    interludeTitle: 'Transition · Les Marches des Gouffres Azur',
    interludeBody:
      'Franchissant l’arche runique conquise, Krom descend les marches de pierre envahies de racines jusqu’aux vastes cavernes souterraines illuminées de cristaux.',
    interludeImage: storyChronicleImg,
    zoneFeaturedMinions: ['goblin_scout', 'dire_wolf', 'wolf_raider', 'monolith_spearman'],
    zoneWaves: [
      { skin: 'goblin_scout', triggerX: 20, spawnX: 300, gateX: 600 },
      { skin: 'dire_wolf', triggerX: 110, spawnX: 430, gateX: 600, dropKind: 'steel_shard' },
      { skin: 'wolf_raider', triggerX: 220, spawnX: 545, gateX: 600 },
      { skin: 'goblin_scout', triggerX: 620, spawnX: 880, gateX: 1200 },
      { skin: 'dire_wolf', triggerX: 730, spawnX: 990, gateX: 1200, dropKind: 'meat_heal' },
      { skin: 'wolf_raider', triggerX: 830, spawnX: 1085, gateX: 1200 },
      { skin: 'monolith_spearman', triggerX: 910, spawnX: 1155, gateX: 1200, dropKind: 'steel_shard' },
      { skin: 'dire_wolf', triggerX: 1230, spawnX: 1470, gateX: 1752 },
      { skin: 'goblin_scout', triggerX: 1320, spawnX: 1560, gateX: 1752, dropKind: 'meat_heal' },
      { skin: 'wolf_raider', triggerX: 1400, spawnX: 1635, gateX: 1752 },
      { skin: 'monolith_spearman', triggerX: 1460, spawnX: 1705, gateX: 1752, dropKind: 'steel_shard' },
    ],
    rewardShards: 45,
    rewardXp: 120,
  },
  {
    actNumber: 2,
    id: 'caverns',
    title: 'Acte II · Les Cavernes de Cristal',
    regionName: 'Abîmes des Cascades & Sceau Runique',
    image: stageCavernsImg,
    zoneTitle: 'Escalier Moussu, Cascades & Galerie des Cristaux',
    zoneSubtitle: 'Grotte Souterraine · 11 Chauves-Souris, Orques & Golems',
    zoneImage: '/sheets/panorama_acte2_cavernes.png?v16',
    zoneStoryIntro:
      'Sous les racines de la forêt s’étend un gouffre baigné d’une lueur turquoise. Entre cascades souterraines, sceau runique ancien et chariots de mine, les clans orques et les golems veillent.',
    storyLead: 'Sous les voûtes d’azur résonne le marteau de cristal.',
    storyBody:
      'Pour atteindre les fournaises d’obsidienne, Krom doit traverser les anciennes mines royales. Au cœur de la chambre géodique, le seigneur de guerre Thalgrim forge ses armes dans le cristal vivant.',
    bossPreludeTitle: 'La Chambre Géodique · Thalgrim lève son marteau !',
    bossPreludeBody:
      'Les derniers éclats du golem roulent sur la pierre humide. Devant le grand sceau turquoise, le roi-forgeron Thalgrim frappe l’enclume runique et fait trembler la voûte.',
    bossName: 'Thalgrim',
    bossTitle: 'Seigneur des Cristaux Runiques',
    bossSkin: 'thalgrim',
    bossHp: 120,
    bossDamageMultiplier: 1.05,
    bossAggression: 0.52,
    bossSpecialLabel: 'Onde Cristalline Basse & Marteau Brise-Roc',
    tacticalHint:
      'Sautez (Haut) par-dessus son onde de cristal azur au sol, et utilisez des Tailles Hautes (A) contre les chauves-souris de la grotte !',
    bossTaunt: '« Mes cristaux éternels enseveliront ton acier mortel sous la montagne ! »',
    victoryEpilogue:
      'L’armure runique de Thalgrim se fend dans un éclat aveuglant. Au fond de la galerie minière s’ouvre le puits ardent menant aux Cryptes d’Obsidienne.',
    interludeTitle: 'Transition · Le Puits des Chaînes Ardentes',
    interludeBody:
      'La fraîcheur azurée des cascades cède place à une chaleur étouffante. Krom s’engage dans les galeries volcaniques où résonnent les fers des captifs.',
    interludeImage: storyChronicleImg,
    zoneFeaturedMinions: ['cave_bat', 'orc_marauder', 'stone_golem', 'goblin_scout'],
    zoneWaves: [
      { skin: 'goblin_scout', triggerX: 20, spawnX: 300, gateX: 600 },
      { skin: 'cave_bat', triggerX: 115, spawnX: 430, gateX: 600, dropKind: 'steel_shard' },
      { skin: 'orc_marauder', triggerX: 220, spawnX: 545, gateX: 600 },
      { skin: 'cave_bat', triggerX: 620, spawnX: 880, gateX: 1200 },
      { skin: 'orc_marauder', triggerX: 730, spawnX: 990, gateX: 1200, dropKind: 'meat_heal' },
      { skin: 'monolith_spearman', triggerX: 830, spawnX: 1085, gateX: 1200 },
      { skin: 'stone_golem', triggerX: 910, spawnX: 1155, gateX: 1200, dropKind: 'steel_shard' },
      { skin: 'cave_bat', triggerX: 1230, spawnX: 1470, gateX: 1752 },
      { skin: 'orc_marauder', triggerX: 1320, spawnX: 1560, gateX: 1752, dropKind: 'meat_heal' },
      { skin: 'goblin_scout', triggerX: 1400, spawnX: 1635, gateX: 1752 },
      { skin: 'stone_golem', triggerX: 1460, spawnX: 1705, gateX: 1752, dropKind: 'steel_shard' },
    ],
    rewardShards: 60,
    rewardXp: 170,
  },
  {
    actNumber: 3,
    id: 'crypt',
    title: 'Acte III · Les Cryptes d’Obsidienne',
    regionName: 'Souterrains des Chaînes Ardentes',
    image: stageCryptImg,
    zoneTitle: 'Catacombes Sombres, Charniers & Cascades de Lave',
    zoneSubtitle: 'Grotte Obscure & Magma · 12 Zombies, Squelettes & Zélotes',
    zoneImage: '/sheets/panorama_acte3_crypte.png?v16',
    zoneStoryIntro:
      'Krom descend dans les catacombes obscures où titubent les morts sans repos, puis longe les premières failles incandescentes jusqu’aux cascades de lave en fusion.',
    storyLead: 'Sous la roche noire résonne le couperet du geôlier.',
    storyBody:
      'Guidé par la lueur des rivières de magma, Krom atteint les geôles où croupissent les guerriers captifs. Au centre du pont de basalte veille Vorgath, le Bourreau sans visage.',
    bossPreludeTitle: 'Le Pont du Billot · Vorgath lève son couperet !',
    bossPreludeBody:
      'Les ossements brisés retombent dans le magma. Au milieu des chaînes ardentes, la silhouette massive de Vorgath frappe la dalle et fait jaillir une gerbe de feu.',
    bossName: 'Vorgath',
    bossTitle: 'Le Bourreau des Basaltes',
    bossSkin: 'vorgath',
    bossHp: 135,
    bossDamageMultiplier: 1.12,
    bossAggression: 0.60,
    bossSpecialLabel: 'Onde Sismique de Lave',
    tacticalHint:
      'Lorsqu’il lève son couperet à deux mains, sautez (Haut) par-dessus l’onde ardente au sol et alternez parades L1 et estocs sans bourriner B.',
    bossTaunt: '« Nul ne franchit la fosse sans laisser sa tête sur le billot ! »',
    victoryEpilogue:
      'Les chaînes des cachots se rompent. Avant de rendre son dernier souffle, Vorgath désigne la rampe fortifiée menant au bastion du Colisée.',
    interludeTitle: 'Transition · La Rampe vers le Soleil de Sang',
    interludeBody:
      'Les captifs libérés acclament Krom tandis qu’il émerge au pied des immenses murailles de grès baignées par le couchant.',
    interludeImage: storyChronicleImg,
    zoneFeaturedMinions: ['risen_zombie', 'undead_warrior', 'crypt_skeleton', 'cult_acolyte'],
    zoneWaves: [
      { skin: 'risen_zombie', triggerX: 20, spawnX: 300, gateX: 600 },
      { skin: 'undead_warrior', triggerX: 110, spawnX: 410, gateX: 600, dropKind: 'steel_shard' },
      { skin: 'cult_acolyte', triggerX: 190, spawnX: 495, gateX: 600 },
      { skin: 'crypt_skeleton', triggerX: 260, spawnX: 555, gateX: 600 },
      { skin: 'risen_zombie', triggerX: 620, spawnX: 880, gateX: 1200 },
      { skin: 'undead_warrior', triggerX: 725, spawnX: 985, gateX: 1200, dropKind: 'meat_heal' },
      { skin: 'cult_acolyte', triggerX: 825, spawnX: 1080, gateX: 1200 },
      { skin: 'crypt_skeleton', triggerX: 910, spawnX: 1155, gateX: 1200, dropKind: 'steel_shard' },
      { skin: 'undead_warrior', triggerX: 1230, spawnX: 1470, gateX: 1752 },
      { skin: 'risen_zombie', triggerX: 1315, spawnX: 1555, gateX: 1752, dropKind: 'meat_heal' },
      { skin: 'cult_acolyte', triggerX: 1395, spawnX: 1630, gateX: 1752 },
      { skin: 'crypt_skeleton', triggerX: 1460, spawnX: 1705, gateX: 1752, dropKind: 'steel_shard' },
    ],
    rewardShards: 80,
    rewardXp: 240,
  },
  {
    actNumber: 4,
    id: 'arena',
    title: 'Acte IV · L’Arène des Ossements',
    regionName: 'Remparts de Sang-Sable & Porte au Crâne',
    image: stageArenaImg,
    zoneTitle: 'Tour de Guet, Longs Murs de Siège & Porte du Colisée',
    zoneSubtitle: 'Murailles Ensoleillées · 12 Hallebardiers, Gladiateurs & Orques',
    zoneImage: '/sheets/panorama_acte4_arene.png?v16',
    zoneStoryIntro:
      'Sous un soleil d’ocre brûlant, Krom dépasse les tours de guet et longe les remparts crénelés garnis d’engins de siège jusqu’à la monumentale Porte au Crâne Cornu.',
    storyLead: 'Mille clameurs réclament le sang du dernier homme libre.',
    storyBody:
      'Pour franchir la forteresse impériale, la Loi Ancienne impose de survivre au jugement du Colisée. Sous les ovations féroces, Malakor l’Écorcheur bondit dans le sable avec une célérité mortelle.',
    bossPreludeTitle: 'La Herse au Crâne s’ouvre · Malakor salue la foule !',
    bossPreludeBody:
      'Krom pénètre dans le cirque inondé de soleil. Au centre du sable, le champion invaincu Malakor fait tournoyer sa lame dentelée.',
    bossName: 'Malakor',
    bossTitle: 'Champion Invaincu de la Fosse',
    bossSkin: 'malakor',
    bossHp: 150,
    bossDamageMultiplier: 1.20,
    bossAggression: 0.72,
    bossSpecialLabel: 'Roulade Éclair & Bond Punisseur',
    tacticalHint:
      'Malakor saute par-dessus les Balayages Bas (B) répétés ! Parez avec L1 puis contre-attaquez au Fendoir R1 ou au Moulinet C.',
    bossTaunt: '« La foule scande déjà mon nom ! Ton crâne ornera mon trône ! »',
    victoryEpilogue:
      'Le Colisée se fige dans un silence stupéfait. Au loin, sous la lune blafarde, se dresse le pont fortifié menant à la Citadelle Infernale.',
    interludeTitle: 'Transition · La Chaussée du Crépuscule Pourpre',
    interludeBody:
      'La nuit tombe sur les remparts vaincus. Krom franchit le pont des forteresses sous une pleine lune glacée, en marche vers les fosses de feu de la Citadelle.',
    interludeImage: storyChronicleImg,
    zoneFeaturedMinions: ['imperial_halberdier', 'pit_thrall', 'orc_marauder', 'stone_golem'],
    zoneWaves: [
      { skin: 'orc_marauder', triggerX: 20, spawnX: 300, gateX: 600 },
      { skin: 'pit_thrall', triggerX: 110, spawnX: 410, gateX: 600, dropKind: 'steel_shard' },
      { skin: 'imperial_halberdier', triggerX: 190, spawnX: 495, gateX: 600 },
      { skin: 'pit_thrall', triggerX: 260, spawnX: 555, gateX: 600 },
      { skin: 'imperial_halberdier', triggerX: 620, spawnX: 880, gateX: 1200 },
      { skin: 'orc_marauder', triggerX: 725, spawnX: 985, gateX: 1200, dropKind: 'meat_heal' },
      { skin: 'pit_thrall', triggerX: 825, spawnX: 1080, gateX: 1200 },
      { skin: 'stone_golem', triggerX: 910, spawnX: 1155, gateX: 1200, dropKind: 'steel_shard' },
      { skin: 'pit_thrall', triggerX: 1230, spawnX: 1470, gateX: 1752 },
      { skin: 'imperial_halberdier', triggerX: 1315, spawnX: 1555, gateX: 1752, dropKind: 'meat_heal' },
      { skin: 'stone_golem', triggerX: 1395, spawnX: 1630, gateX: 1752 },
      { skin: 'imperial_halberdier', triggerX: 1460, spawnX: 1705, gateX: 1752, dropKind: 'steel_shard' },
    ],
    rewardShards: 105,
    rewardXp: 340,
  },
  {
    actNumber: 5,
    id: 'inferno',
    title: 'Acte V · La Citadelle Infernale',
    regionName: 'Bastion Lunaire & Pont des Laves',
    image: stageInfernoImg,
    zoneTitle: 'Bastion de Lune, Arche des Statues & Pont de Magma',
    zoneSubtitle: 'Viaduc Nocturne & Brasier · 12 Démons, Mages & Gardes',
    zoneImage: '/sheets/panorama_acte5_citadelle.png?v16',
    zoneStoryIntro:
      'Quittant le bastion éclairé par la pleine lune, Krom franchit le viaduc surplombant la forteresse lointaine, longe la colonnade des statues anciennes et traverse le pont suspendu au-dessus d’une chute de lave.',
    storyLead: 'Le fer mortel contre le seigneur des braises.',
    storyBody:
      'Devant la herse ardente qui protège la haute tour de Drax veille Baelgor, l’Archonte des Braises, un titan en armure noire forgée dans le magma des Abysses.',
    bossPreludeTitle: 'La Porte des Cages · Baelgor embrase son espadon !',
    bossPreludeBody:
      'Les démons ailés se replient dans la fumée. Sur l’arche surplombant le gouffre de lave, Baelgor fend la pierre de son espadon incandescent.',
    bossName: 'Baelgor',
    bossTitle: 'Archonte de la Citadelle Infernale',
    bossSkin: 'baelgor',
    bossHp: 165,
    bossDamageMultiplier: 1.26,
    bossAggression: 0.79,
    bossSpecialLabel: 'Orbe de Feu Infernal & Roulade Blindée',
    tacticalHint:
      'Roulez (Bouton D) à travers ses orbes de braise ! Baelgor peut aussi fondre sur vous en roulade avant : parez-le avec L1 au redressement.',
    bossTaunt: '« Les flammes de l’Abîme consumeront tes os avant que tu n’approches le maître ! »',
    victoryEpilogue:
      'L’espadon de magma s’éteint dans un fracas métallique. La herse au crâne ardent cède enfin, dévoilant l’escalier foudroyé du Sanctuaire Suprême.',
    interludeTitle: 'Transition · L’Ascension vers la Tempête Pourpre',
    interludeBody:
      'Au-delà des brasiers vaincus s’élève le dernier sommet battu par les éclairs, où le Sorcier-Roi Drax retient Valéria et le Cœur d’Acier.',
    interludeImage: storyChronicleImg,
    zoneFeaturedMinions: ['abyssal_demon', 'skeleton_mage', 'imperial_halberdier', 'cult_acolyte'],
    zoneWaves: [
      { skin: 'imperial_halberdier', triggerX: 20, spawnX: 300, gateX: 600 },
      { skin: 'skeleton_mage', triggerX: 110, spawnX: 410, gateX: 600, dropKind: 'steel_shard' },
      { skin: 'cult_acolyte', triggerX: 190, spawnX: 495, gateX: 600 },
      { skin: 'abyssal_demon', triggerX: 260, spawnX: 555, gateX: 600 },
      { skin: 'skeleton_mage', triggerX: 620, spawnX: 880, gateX: 1200 },
      { skin: 'abyssal_demon', triggerX: 725, spawnX: 985, gateX: 1200, dropKind: 'meat_heal' },
      { skin: 'imperial_halberdier', triggerX: 825, spawnX: 1080, gateX: 1200 },
      { skin: 'abyssal_demon', triggerX: 910, spawnX: 1155, gateX: 1200, dropKind: 'steel_shard' },
      { skin: 'skeleton_mage', triggerX: 1230, spawnX: 1470, gateX: 1752 },
      { skin: 'abyssal_demon', triggerX: 1315, spawnX: 1555, gateX: 1752, dropKind: 'meat_heal' },
      { skin: 'imperial_halberdier', triggerX: 1395, spawnX: 1630, gateX: 1752 },
      { skin: 'abyssal_demon', triggerX: 1460, spawnX: 1705, gateX: 1752, dropKind: 'steel_shard' },
    ],
    rewardShards: 135,
    rewardXp: 450,
  },
  {
    actNumber: 6,
    id: 'sanctuary',
    title: 'Acte VI · Le Sanctuaire de Drax',
    regionName: 'Autel Foudroyé du Sorcier-Roi',
    image: stageSanctuaryImg,
    zoneTitle: 'Remparts d’Orage, Pont Noir & Nef Spectrale',
    zoneSubtitle: 'Viaduc Foudroyé · 12 Fantômes, Démons & Sentinelles',
    zoneImage: '/sheets/panorama_acte6_sanctuaire.png?v16',
    zoneStoryIntro:
      'Sous un déluge d’éclairs pourpres, Krom traverse la crête battue par la tempête et franchit le pont noir runique défendu par les fantômes hurleurs et la garde spectrale de Drax.',
    storyLead: 'L’acier mortel face à la sorcellerie immortelle.',
    storyBody:
      'Au sommet de la Citadelle foudroyée, Krom gravit l’autel suprême où la prêtresse Valéria et le Cœur d’Acier sont scellés. Le Seigneur Drax dégaine sa lame runique et invoque le feu noir.',
    bossPreludeTitle: 'L’Autel Suprême · Seigneur Drax descend du trône !',
    bossPreludeBody:
      'Les spectres et sentinelles se dissipent dans l’éther. Devant le pentagramme ardent, le Sorcier-Roi Drax lève son épée runique sous un tonnerre assourdissant.',
    bossName: 'Seigneur Drax',
    bossTitle: 'Sorcier-Roi de la Citadelle',
    bossSkin: 'drax',
    bossHp: 185,
    bossDamageMultiplier: 1.34,
    bossAggression: 0.86,
    bossSpecialLabel: 'Orbe d’Ombre, Téléportation & Contre Aérien',
    tacticalHint:
      'Roulez (Bouton D) à travers ses orbes runiques. En Phase 2, parez sa frappe après téléportation avec L1 avant de déclencher le Moulinet Décapitant !',
    bossTaunt: '« Incline-toi, mortel ! La foudre et l’ombre obéissent à ma couronne ! »',
    victoryEpilogue:
      'D’un revers fulgurant, le glaive de Krom brise la couronne maudite de Drax ! La tempête se dissipe sur les terres du Nord : Valéria est libre et le Cœur d’Acier flamboie à nouveau.',
    interludeTitle: 'Épilogue · L’Aube du Cœur d’Acier',
    interludeBody:
      'La Citadelle sombre s’écroule dans les nuages tandis que l’aube dorée éclaire à nouveau les Hautes-Brumes. Le nom de Krom et la légende de son Glaive d’Acier résonneront à jamais dans les chants du Nord !',
    interludeImage: storyChronicleImg,
    zoneFeaturedMinions: ['spectral_wraith', 'abyssal_demon', 'drax_acolyte', 'skeleton_mage'],
    zoneWaves: [
      { skin: 'spectral_wraith', triggerX: 20, spawnX: 300, gateX: 600 },
      { skin: 'skeleton_mage', triggerX: 110, spawnX: 410, gateX: 600, dropKind: 'steel_shard' },
      { skin: 'drax_acolyte', triggerX: 190, spawnX: 495, gateX: 600 },
      { skin: 'spectral_wraith', triggerX: 260, spawnX: 555, gateX: 600 },
      { skin: 'abyssal_demon', triggerX: 620, spawnX: 880, gateX: 1200 },
      { skin: 'spectral_wraith', triggerX: 725, spawnX: 985, gateX: 1200, dropKind: 'meat_heal' },
      { skin: 'drax_acolyte', triggerX: 825, spawnX: 1080, gateX: 1200 },
      { skin: 'drax_acolyte', triggerX: 910, spawnX: 1155, gateX: 1200, dropKind: 'steel_shard' },
      { skin: 'skeleton_mage', triggerX: 1230, spawnX: 1470, gateX: 1752 },
      { skin: 'abyssal_demon', triggerX: 1315, spawnX: 1555, gateX: 1752, dropKind: 'meat_heal' },
      { skin: 'spectral_wraith', triggerX: 1395, spawnX: 1630, gateX: 1752 },
      { skin: 'drax_acolyte', triggerX: 1460, spawnX: 1705, gateX: 1752, dropKind: 'steel_shard' },
    ],
    rewardShards: 180,
    rewardXp: 600,
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
