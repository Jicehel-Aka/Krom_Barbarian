import type {
  CutsceneId,
  FighterAction,
  LanguageCode,
  MinionSkin,
  StageId,
  TechniqueId,
} from '../types/game';
import type { UpgradeSpec } from '../data/campaign.ts';
import { CUTSCENES_BY_LANG } from './cutscenesLocaleData.ts';
import { MINIONS_BY_LANG } from './minionsLocaleData.ts';
import { ACTS_BY_LANG } from './actsLocaleData.ts';

export interface LocalizedUpgradeText {
  title: string;
  unitLabel: string;
  description: string;
  shortDesc: string;
  formatEffect: (rank: number) => string;
}

export interface LocalizedTechniqueText {
  name: string;
  inputHint: string;
  shortBadge: string;
  summary: string;
  shortSummary: string;
}

export interface LocalizedForgeStrings {
  headerTitle: string;
  shardsLabel: string;
  shardUnitShort: string;
  shardWord: string;
  secretHeader: string;
  maxTag: string;
  equippedTag: string;
  equipPrompt: string;
  footerFormat: (continueLabel: string) => string;
  continueLabels: {
    nextAct: (actNum: number) => string;
    bossArena: string;
    startZone: string;
    rematch: string;
    back: string;
  };
  feedback: {
    maxRank: (title: string) => string;
    forged: (title: string, effect: string) => string;
    needShards: (missing: number) => string;
    equipped: (name: string, hint: string) => string;
    learned: (name: string) => string;
    needTechShards: (missing: number, name: string) => string;
  };
  upgrades: Record<UpgradeSpec['key'], LocalizedUpgradeText>;
  techniques: Record<TechniqueId, LocalizedTechniqueText>;
}

export interface LocalizedCodexStrings {
  pageTitles: [string, string, string, string];
  demoLabels: Partial<Record<FighterAction, string>>;
  pages: { cmd: string; desc: string }[][];
  tipEquippedLine: (badgeLabel: string) => string;
  tipForgeLine1: string;
  tipForgeLine2: string;
  footerHint: string;
}

export interface LocalizedCutsceneStrings {
  title: string;
  skipBadge: string;
  shots: { speakerName: string; text: string }[];
}

export interface LocalizedMinionStrings {
  name: string;
  shortName: string;
  factionLabel: string;
  weaponLabel: string;
  hitsToKillLabel: string;
  summary: string;
}

export interface LocalizedActStrings {
  title: string;
  regionName: string;
  zoneTitle: string;
  zoneSubtitle: string;
  zoneStoryIntro: string;
  bossPreludeTitle: string;
  bossPreludeBody: string;
  bossName: string;
  bossTitle: string;
  bossSpecialLabel: string;
  tacticalHint: string;
  bossTaunt: string;
  victoryEpilogue: string;
  interludeTitle: string;
  interludeBody: string;
}

export interface LocalizedCombatStrings {
  actWord: string;
  wallBreachedBanner: string;
  skyBreakerBanner: string;
  ironRiposteBanner: string;
  softFatalBanner: string;
  whirlwindFatalBanner: string;
  whirlwindPopup: (pts: number) => string;
  fatalPopup: (pts: number) => string;
  guardBreakPopup: (pts: number) => string;
  ripostePopup: string;
  parryPopup: string;
  healPopup: (hp: number) => string;
  shardsPopup: (count: number) => string;
  goblinLaugh: string;
  postMatchForgeHint: (shards: number) => string;
  storyMinionsPrefix: string;
  storyHelpHint: string;
  storyShardsReady: (shards: number) => string;
  storyActCleared: (shards: number) => string;
  storyShardsWon: (shards: number) => string;
  storyFinishChroniclePrompt: string;
  coopRevivePopup: string;
  coopAllyDownBanner: string;
  coopBossArrivalBanner: (bossName: string) => string;
}

export interface LocalizedWebUiStrings {
  // GamebuinoShell
  impactsLabel: string;
  langLabel: string;
  l1Button: string;
  r1Button: string;
  dpadLabel: string;
  menuBtnLabel: string;
  menuInlineBtn: string;
  runBtnLabel: string;
  btnCMove: string;
  btnDMove: string;
  btnAMove: string;
  btnBMove: string;
  legendCol1Title: string;
  legendCol1Body: string;
  legendCol2Title: string;
  legendCol2Body: string;
  legendCol3Title: string;
  legendCol3Body: string;
  legendCol4Title: string;
  legendCol4Body: string;
  // App.tsx sidebar & footer
  sidebarSystemTitle: string;
  sidebarStatsLine: (hp: number, steelPct: number, shards: number) => string;
  sidebarRecordLine: (score: string, minions: number) => string;
  sidebarHelpBody: string;
  sidebarBtnCodex: string;
  sidebarBtnForge: (shards: number) => string;
  sidebarBtnSheets: string;
  sidebarBtnLoader: string;
  sidebarBtnGithub: string;
  mobileNavBoss: string;
  footerLeft: string;
  footerRight: string;
  // CombatGuidePanel
  guideKicker: (techName: string, hint: string) => string;
  guideTitle: string;
  guideBtnAkaCodex: string;
  guideBtnAkaForge: (shards: number) => string;
  guideTab1: string;
  guideTab2: string;
  guideTab3: string;
  guideMoves: { title: string; input: string; body: string }[];
  guideFatalMove: { title: string; input: string; body: string };
  guideDefenseCards: { title: string; input: string; body: string }[];
  guideForgeWhenTitle: string;
  guideForgeWhenBody: string;
  guideActiveHudTag: string;
  guideUnlockedTag: string;
  guideCostTag: (cost: number) => string;
  guideEquipBtn: string;
  guideUnlockInForgeBtn: string;
  // ProgressionForge
  forgePageKicker: string;
  forgePageTitle: string;
  forgePageIntro: string;
  forgeBestScoreLabel: string;
  forgeHuntLabel: string;
  forgeHuntValue: (minions: number, bosses: number, decaps: number) => string;
  forgeReturnCombatBtn: string;
  forgeSection1Title: string;
  forgeRankLabel: (rank: number, max: number) => string;
  forgeMaxMasteryBtn: string;
  forgeBuyBtn: (cost: number) => string;
  forgeSection2Title: string;
  forgeCommandPrefix: string;
  forgeActiveStyleLabel: string;
  forgeEquippedBtn: string;
  forgeLearnBtn: (cost: number) => string;
  forgeSaveNotice: string;
  forgeResetBtn: string;
  // CampaignChronicle
  chronicleKicker: string;
  chronicleTitle: string;
  chronicleIntro: string;
  chronicleMinionsSlainLabel: string;
  chronicleZoneLabel: string;
  chronicleMinionsCount: (n: number) => string;
  chronicleArenaLabel: string;
  chronicleStatusCleared: string;
  chronicleStatusUnlocked: string;
  chronicleStatusLocked: string;
  chronicleMinionsSection: string;
  chronicleBossTechLabel: string;
  chronicleParryHintLabel: string;
  chronicleNextBridgeLabel: string;
  chronicleCutsceneBtn: string;
  chronicleEpilogueBtn: string;
  chronicleBossDirectBtn: string;
  chronicleReplayBtn: (boss: string) => string;
  chroniclePlayBtn: (boss: string) => string;
  chronicleLockedBtn: (prevBoss: string) => string;
  chroniclePrologueKicker: string;
  chroniclePrologueTitle: string;
  chroniclePrologueBody: string;
  chronicleWatchPrologueBtn: string;
  chronicleConclusionKicker: string;
  chronicleConclusionTitle: string;
  chronicleConclusionBody: string;
  chronicleWatchConclusionBtn: string;
  stageNames: Record<StageId, string>;
}

const FORGE_BY_LANG: Record<LanguageCode, LocalizedForgeStrings> = {
  fr: {
    headerTitle: 'FORGE DE BIVOUAC & BOTTES',
    shardsLabel: 'ÉCLATS D’ACIER',
    shardUnitShort: 'Écl.',
    shardWord: 'Éclats',
    secretHeader: 'BOTTES SECRÈTES (1 ACTIVE EN COMBAT)',
    maxTag: 'MAX',
    equippedTag: '★ ÉQUIPÉE',
    equipPrompt: 'A: ÉQUIPER',
    footerFormat: (cont) => `▲/▼: Choisir · A: Forger · L1: Aide · B: ${cont}`,
    continueLabels: {
      nextAct: (n) => `Acte ${n}`,
      bossArena: 'Boss',
      startZone: 'Zone',
      rematch: 'Revanche',
      back: 'Retour',
    },
    feedback: {
      maxRank: (t) => `${t} : rang max atteint (4/4).`,
      forged: (t, eff) => `Forgé : ${t} -> ${eff} !`,
      needShards: (m) => `Manque ${m} Éclats (abattez sbires ou boss).`,
      equipped: (n, h) => `Botte équipée : ${n} (${h})`,
      learned: (n) => `Apprise & équipée : ${n} !`,
      needTechShards: (m, n) => `Manque ${m} Éclats pour ${n}.`,
    },
    upgrades: {
      vitalityRank: {
        title: 'Vigueur du Nord',
        unitLabel: 'Points de Vie',
        description: 'Renforce la constitution de Krom pour traverser les zones et encaisser les boss.',
        shortDesc: 'Augmente les PV max de Krom en zone et face aux boss.',
        formatEffect: (r) => `${100 + r * 15} PV max`,
      },
      bladeRank: {
        title: 'Trempe du Glaive',
        unitLabel: 'Tranchant',
        description: 'Affûte l’acier ancestral afin d’abattre les éclaireurs et percer les boss.',
        shortDesc: 'Augmente les dégâts de tous les coups d’épée.',
        formatEffect: (r) => `+${r * 12}% dégâts`,
      },
      staminaRank: {
        title: 'Souffle de Guerre',
        unitLabel: 'Endurance',
        description: 'Accélère la récupération du souffle après roulades, sauts et parades.',
        shortDesc: 'Plus de Souffle pour roulades, sauts et enchaînements.',
        formatEffect: (r) => `${100 + r * 12} Souffle`,
      },
      executionerRank: {
        title: 'Instinct du Bourreau',
        unitLabel: 'Coup Fatal',
        description: 'Élargit la fenêtre de décapitation du Moulinet (Bouton C) sur sbires et boss.',
        shortDesc: 'Décapite plus tôt avec le Moulinet [C].',
        formatEffect: (r) => `Fatal <= ${35 + r * 6}% PV`,
      },
    },
    techniques: {
      whirlwind_edge: {
        name: 'Moulinet du Loup',
        inputHint: 'C / ◀+A',
        shortBadge: 'MOULINET [C]',
        summary: 'Rotation 360° (+10px portée, +15% dégâts, seuil fatal +10% sur les Boss et bonus de score).',
        shortSummary: '[C] Portée +10px, dégâts +15% & seuil fatal +10%.',
      },
      iron_riposte: {
        name: 'Riposte de Fer',
        inputHint: 'L1 Parfaite',
        shortBadge: 'RIPOSTE [L1]',
        summary: 'Élargit la Parade Parfaite L1 : inflige -12 PV immédiats, étourdit l’ennemi et rend +28 Souffle.',
        shortSummary: '[L1] Parade élargie : contre -12 PV + étourdit !',
      },
      sky_breaker: {
        name: 'Fendoir Brise-Garde',
        inputHint: 'R1 / ▲+A',
        shortBadge: 'BRISE-GARDE [R1]',
        summary: 'Enflamme le Fendoir R1 (+22% dégâts) : fracasse la garde haute adverse en infligeant 58% de dégâts.',
        shortSummary: '[R1] +22% dégâts & fracasse la garde haute !',
      },
    },
  },
  en: {
    headerTitle: 'CAMPFIRE FORGE & SECRET ARTS',
    shardsLabel: 'STEEL SHARDS',
    shardUnitShort: 'Shd.',
    shardWord: 'Shards',
    secretHeader: 'SECRET SWORD ARTS (1 EQUIPPED)',
    maxTag: 'MAX',
    equippedTag: '★ EQUIPPED',
    equipPrompt: 'A: EQUIP',
    footerFormat: (cont) => `▲/▼: Select · A: Forge · L1: Guide · B: ${cont}`,
    continueLabels: {
      nextAct: (n) => `Act ${n}`,
      bossArena: 'Boss',
      startZone: 'Zone',
      rematch: 'Rematch',
      back: 'Back',
    },
    feedback: {
      maxRank: (t) => `${t} is already at max rank (4/4).`,
      forged: (t, eff) => `Forged: ${t} -> ${eff}!`,
      needShards: (m) => `Need ${m} more Shards (slay foes or bosses).`,
      equipped: (n, h) => `Equipped Art: ${n} (${h})`,
      learned: (n) => `Learned & equipped: ${n}!`,
      needTechShards: (m, n) => `Need ${m} more Shards for ${n}.`,
    },
    upgrades: {
      vitalityRank: {
        title: 'Northern Vigor',
        unitLabel: 'Max Health',
        description: 'Hardens Krom’s constitution to survive long zones and heavy warlord blows.',
        shortDesc: 'Increases Krom’s max HP in zones and boss duels.',
        formatEffect: (r) => `${100 + r * 15} max HP`,
      },
      bladeRank: {
        title: 'Tempered Greatsword',
        unitLabel: 'Blade Edge',
        description: 'Sharpens ancestral steel to cut down scouts faster and pierce boss armor.',
        shortDesc: 'Boosts damage across all sword strikes.',
        formatEffect: (r) => `+${r * 12}% damage`,
      },
      staminaRank: {
        title: 'Battle Breath',
        unitLabel: 'Stamina',
        description: 'Expands stamina reserves and recovery after rolls, jumps, and parries.',
        shortDesc: 'More stamina for rolls, jumps, and combos.',
        formatEffect: (r) => `${100 + r * 12} Stamina`,
      },
      executionerRank: {
        title: 'Executioner Instinct',
        unitLabel: 'Fatal Blow',
        description: 'Widens the Spin Decapitation [C] threshold on weakened minions and bosses.',
        shortDesc: 'Decapitate foes earlier with Spin [C].',
        formatEffect: (r) => `Fatal <= ${35 + r * 6}% HP`,
      },
    },
    techniques: {
      whirlwind_edge: {
        name: 'Wolf Whirlwind',
        inputHint: 'C / ◀+A',
        shortBadge: 'WHIRLWIND [C]',
        summary: '360° blade arc (+10px reach, +15% spin damage, +10% fatal decapitation threshold & score bonus).',
        shortSummary: '[C] +10px reach, +15% dmg & +10% fatal threshold.',
      },
      iron_riposte: {
        name: 'Iron Riposte',
        inputHint: 'Timed L1',
        shortBadge: 'RIPOSTE [L1]',
        summary: 'Widens Perfect Parry L1 window: deals 12 counter HP, stuns the attacker & restores +28 Stamina.',
        shortSummary: '[L1] Wider parry: -12 HP counter & heavy stun!',
      },
      sky_breaker: {
        name: 'Sky Breaker Cleave',
        inputHint: 'R1 / ▲+A',
        shortBadge: 'BREAKER [R1]',
        summary: 'Ignites heavy cleave R1 (+22% damage & knockdown): shatters high guard for 58% piercing damage.',
        shortSummary: '[R1] +22% dmg & shatters enemy high guard!',
      },
    },
  },
  pt: {
    headerTitle: 'FORJA DE ACAMPAMENTO & TÉCNICAS',
    shardsLabel: 'FRAGMENTOS DE AÇO',
    shardUnitShort: 'Frag.',
    shardWord: 'Fragmentos',
    secretHeader: 'TÉCNICAS SECRETAS (1 EQUIPADA)',
    maxTag: 'MÁX',
    equippedTag: '★ EQUIPADA',
    equipPrompt: 'A: EQUIPAR',
    footerFormat: (cont) => `▲/▼: Mover · A: Forjar · L1: Guia · B: ${cont}`,
    continueLabels: {
      nextAct: (n) => `Ato ${n}`,
      bossArena: 'Chefe',
      startZone: 'Zona',
      rematch: 'Revanche',
      back: 'Voltar',
    },
    feedback: {
      maxRank: (t) => `${t} já está no nível máximo (4/4).`,
      forged: (t, eff) => `Forjado: ${t} -> ${eff}!`,
      needShards: (m) => `Faltam ${m} Fragmentos (derrote inimigos).`,
      equipped: (n, h) => `Equipada: ${n} (${h})`,
      learned: (n) => `Aprendida e equipada: ${n}!`,
      needTechShards: (m, n) => `Faltam ${m} Fragmentos para ${n}.`,
    },
    upgrades: {
      vitalityRank: {
        title: 'Vigor do Norte',
        unitLabel: 'Pontos de Vida',
        description: 'Fortalece o corpo de Krom para sobreviver às zonas e aos golpes dos chefes.',
        shortDesc: 'Aumenta o PV máximo nas zonas e nos chefes.',
        formatEffect: (r) => `${100 + r * 15} PV máx`,
      },
      bladeRank: {
        title: 'Têmpera da Espada',
        unitLabel: 'Corte',
        description: 'Afia o aço ancestral para abater batedores rápido e perfurar chefes.',
        shortDesc: 'Aumenta o dano de todos os golpes de espada.',
        formatEffect: (r) => `+${r * 12}% dano`,
      },
      staminaRank: {
        title: 'Fôlego de Guerra',
        unitLabel: 'Vigor',
        description: 'Acelera a recuperação de fôlego após rolamentos, saltos e defesas.',
        shortDesc: 'Mais fôlego para rolamentos, saltos e combos.',
        formatEffect: (r) => `${100 + r * 12} Fôlego`,
      },
      executionerRank: {
        title: 'Instinto do Carrasco',
        unitLabel: 'Golpe Fatal',
        description: 'Amplia a janela de decapitação do Giro [C] em lacaios e chefes feridos.',
        shortDesc: 'Decapita mais cedo com o Giro [C].',
        formatEffect: (r) => `Fatal <= ${35 + r * 6}% PV`,
      },
    },
    techniques: {
      whirlwind_edge: {
        name: 'Giro do Lobo',
        inputHint: 'C / ◀+A',
        shortBadge: 'GIRO [C]',
        summary: 'Rotação 360° (+10px alcance, +15% dano de giro e +10% no limite de decapitação em Chefes).',
        shortSummary: '[C] +10px alcance, +15% dano e +10% limite fatal.',
      },
      iron_riposte: {
        name: 'Riposta de Ferro',
        inputHint: 'L1 Perfeita',
        shortBadge: 'RIPOSTA [L1]',
        summary: 'Amplia a Defesa Perfeita L1: causa -12 PV imediatos, atordoa o inimigo e restaura +28 Fôlego.',
        shortSummary: '[L1] Defesa ampla: contra-ataque -12 PV + atordoa!',
      },
      sky_breaker: {
        name: 'Rachador de Guarda',
        inputHint: 'R1 / ▲+A',
        shortBadge: 'RACHADOR [R1]',
        summary: 'Incendeia o golpe pesado R1 (+22% dano): estilhaça a guarda alta causando 58% de dano.',
        shortSummary: '[R1] +22% dano e quebra a guarda alta inimiga!',
      },
    },
  },
  es: {
    headerTitle: 'FORJA DE VIVAC Y TÉCNICAS',
    shardsLabel: 'ESQUIRLAS DE ACERO',
    shardUnitShort: 'Esq.',
    shardWord: 'Esquirlas',
    secretHeader: 'TÉCNICAS SECRETAS (1 EQUIPADA)',
    maxTag: 'MÁX',
    equippedTag: '★ EQUIPADA',
    equipPrompt: 'A: EQUIPAR',
    footerFormat: (cont) => `▲/▼: Elegir · A: Forjar · L1: Guía · B: ${cont}`,
    continueLabels: {
      nextAct: (n) => `Acto ${n}`,
      bossArena: 'Jefe',
      startZone: 'Zona',
      rematch: 'Revancha',
      back: 'Volver',
    },
    feedback: {
      maxRank: (t) => `${t} ya está al rango máximo (4/4).`,
      forged: (t, eff) => `¡Forjado: ${t} -> ${eff}!`,
      needShards: (m) => `Faltan ${m} Esquirlas (vence esbirros o jefes).`,
      equipped: (n, h) => `Equipada: ${n} (${h})`,
      learned: (n) => `¡Aprendida y equipada: ${n}!`,
      needTechShards: (m, n) => `Faltan ${m} Esquirlas para ${n}.`,
    },
    upgrades: {
      vitalityRank: {
        title: 'Vigor del Norte',
        unitLabel: 'Puntos de Vida',
        description: 'Refuerza la constitución de Krom para cruzar zonas y resistir a los jefes.',
        shortDesc: 'Aumenta los PV máx en zonas y duelos de jefe.',
        formatEffect: (r) => `${100 + r * 15} PV máx`,
      },
      bladeRank: {
        title: 'Temple de Espada',
        unitLabel: 'Filo',
        description: 'Afila el acero ancestral para abatir exploradores y perforar armaduras.',
        shortDesc: 'Aumenta el daño de todos los golpes de espada.',
        formatEffect: (r) => `+${r * 12}% daño`,
      },
      staminaRank: {
        title: 'Aliento de Guerra',
        unitLabel: 'Aguante',
        description: 'Acelera la recuperación de aliento tras rodar, saltar y parar golpes.',
        shortDesc: 'Más aguante para rodar, saltar y encadenar.',
        formatEffect: (r) => `${100 + r * 12} Aguante`,
      },
      executionerRank: {
        title: 'Instinto de Verdugo',
        unitLabel: 'Golpe Fatal',
        description: 'Amplía el umbral de decapitación del Torbellino [C] ante jefes y esbirros.',
        shortDesc: 'Decapita antes con el Torbellino [C].',
        formatEffect: (r) => `Fatal <= ${35 + r * 6}% PV`,
      },
    },
    techniques: {
      whirlwind_edge: {
        name: 'Torbellino del Lobo',
        inputHint: 'C / ◀+A',
        shortBadge: 'TORBELLINO [C]',
        summary: 'Giro de 360° (+10px alcance, +15% daño de giro y +10% umbral fatal contra Jefes).',
        shortSummary: '[C] +10px alcance, +15% daño y +10% umbral fatal.',
      },
      iron_riposte: {
        name: 'Riposta de Hierro',
        inputHint: 'L1 Perfecta',
        shortBadge: 'RIPOSTA [L1]',
        summary: 'Amplía la Parada Perfecta L1: inflige -12 PV al instante, aturde y recupera +28 Aguante.',
        shortSummary: '[L1] Parada amplia: daña -12 PV y aturde.',
      },
      sky_breaker: {
        name: 'Tajo Rompeguardia',
        inputHint: 'R1 / ▲+A',
        shortBadge: 'ROMPEGUARDIA [R1]',
        summary: 'Enciende el tajo pesado R1 (+22% daño): destroza la guardia alta causando 58% de daño.',
        shortSummary: '[R1] +22% daño y rompe la guardia alta.',
      },
    },
  },
  it: {
    headerTitle: 'FORGIA DA CAMPO E TECNICHE',
    shardsLabel: 'SCHEGGE D’ACCIAIO',
    shardUnitShort: 'Sch.',
    shardWord: 'Schegge',
    secretHeader: 'TECNICHE SEGRETE (1 EQUIPAGGIATA)',
    maxTag: 'MAX',
    equippedTag: '★ ATTIVA',
    equipPrompt: 'A: EQUIP.',
    footerFormat: (cont) => `▲/▼: Scelta · A: Forgia · L1: Guida · B: ${cont}`,
    continueLabels: {
      nextAct: (n) => `Atto ${n}`,
      bossArena: 'Boss',
      startZone: 'Zona',
      rematch: 'Rivincita',
      back: 'Indietro',
    },
    feedback: {
      maxRank: (t) => `${t} è già al grado massimo (4/4).`,
      forged: (t, eff) => `Forgiato: ${t} -> ${eff}!`,
      needShards: (m) => `Mancano ${m} Schegge (sconfiggi nemici).`,
      equipped: (n, h) => `Attiva: ${n} (${h})`,
      learned: (n) => `Appresa e attiva: ${n}!`,
      needTechShards: (m, n) => `Mancano ${m} Schegge per ${n}.`,
    },
    upgrades: {
      vitalityRank: {
        title: 'Vigore del Nord',
        unitLabel: 'Punti Vita',
        description: 'Rafforza la tempra di Krom per superare le zone e reggere i colpi dei boss.',
        shortDesc: 'Aumenta i PV massimi nelle zone e contro i boss.',
        formatEffect: (r) => `${100 + r * 15} PV max`,
      },
      bladeRank: {
        title: 'Tempra della Lama',
        unitLabel: 'Taglio',
        description: 'Affila l’acciaio ancestrale per abbattere gli esploratori e ferire i boss.',
        shortDesc: 'Aumenta i danni di tutti i colpi di spada.',
        formatEffect: (r) => `+${r * 12}% danni`,
      },
      staminaRank: {
        title: 'Fiato di Guerra',
        unitLabel: 'Vigore',
        description: 'Accelera il recupero del fiato dopo capriole, salti e parate.',
        shortDesc: 'Più vigore per capriole, salti e attacchi.',
        formatEffect: (r) => `${100 + r * 12} Vigore`,
      },
      executionerRank: {
        title: 'Istinto del Boia',
        unitLabel: 'Colpo Fatale',
        description: 'Amplia la soglia di decapitazione del Mulinetto [C] su sgherri e boss.',
        shortDesc: 'Decapita prima con il Mulinetto [C].',
        formatEffect: (r) => `Fatale <= ${35 + r * 6}% PV`,
      },
    },
    techniques: {
      whirlwind_edge: {
        name: 'Mulinetto del Lupo',
        inputHint: 'C / ◀+A',
        shortBadge: 'MULINETTO [C]',
        summary: 'Rotazione 360° (+10px portata, +15% danni e +10% soglia fatale contro i Boss).',
        shortSummary: '[C] +10px portata, +15% danni e +10% soglia fatale.',
      },
      iron_riposte: {
        name: 'Risposta di Ferro',
        inputHint: 'L1 Perfetta',
        shortBadge: 'RISPOSTA [L1]',
        summary: 'Amplia la Parata Perfetta L1: infligge -12 PV immediati, stordisce e ridà +28 Vigore.',
        shortSummary: '[L1] Parata ampia: contrattacco -12 PV + stordisce!',
      },
      sky_breaker: {
        name: 'Fendente Spezzaguardia',
        inputHint: 'R1 / ▲+A',
        shortBadge: 'SPEZZAGUARDIA [R1]',
        summary: 'Infiamma il fendente R1 (+22% danni): spezza la guardia alta infliggendo il 58% dei danni.',
        shortSummary: '[R1] +22% danni e infrange la guardia alta!',
      },
    },
  },
  de: {
    headerTitle: 'FELDSCHMIEDE & GEHEIMTECHNIKEN',
    shardsLabel: 'STAHLSPLITTER',
    shardUnitShort: 'Spl.',
    shardWord: 'Splitter',
    secretHeader: 'GEHEIMTECHNIKEN (1 AKTIV IM KAMPF)',
    maxTag: 'MAX',
    equippedTag: '★ AKTIV',
    equipPrompt: 'A: WÄHLEN',
    footerFormat: (cont) => `▲/▼: Wahl · A: Schmieden · L1: Hilfe · B: ${cont}`,
    continueLabels: {
      nextAct: (n) => `Akt ${n}`,
      bossArena: 'Boss',
      startZone: 'Zone',
      rematch: 'Revanche',
      back: 'Zurück',
    },
    feedback: {
      maxRank: (t) => `${t} ist bereits auf Maximalstufe (4/4).`,
      forged: (t, eff) => `Geschmiedet: ${t} -> ${eff}!`,
      needShards: (m) => `Es fehlen ${m} Splitter (besiege Feinde).`,
      equipped: (n, h) => `Aktiviert: ${n} (${h})`,
      learned: (n) => `Erlernt & aktiv: ${n}!`,
      needTechShards: (m, n) => `Es fehlen ${m} Splitter für ${n}.`,
    },
    upgrades: {
      vitalityRank: {
        title: 'Nordische Lebenskraft',
        unitLabel: 'Lebenspunkte',
        description: 'Stärkt Kroms Konstitution für lange Zonen und harte Bosskämpfe.',
        shortDesc: 'Erhöht Kroms maximale LP in Zonen und Duellen.',
        formatEffect: (r) => `${100 + r * 15} max LP`,
      },
      bladeRank: {
        title: 'Klingenhärtung',
        unitLabel: 'Schärfe',
        description: 'Schärft den Ahnenstahl, um Späher rasch zu fällen und Bosse zu durchdringen.',
        shortDesc: 'Erhöht den Schaden aller Schwerthiebe.',
        formatEffect: (r) => `+${r * 12}% Schaden`,
      },
      staminaRank: {
        title: 'Kriegsatem',
        unitLabel: 'Ausdauer',
        description: 'Beschleunigt die Ausdauererholung nach Rollen, Sprüngen und Paraden.',
        shortDesc: 'Mehr Ausdauer für Rollen, Sprünge und Kombos.',
        formatEffect: (r) => `${100 + r * 12} Ausdauer`,
      },
      executionerRank: {
        title: 'Henkerinstinkt',
        unitLabel: 'Todesschlag',
        description: 'Erweitert das Enthauptungsfenster des Wirbels [C] gegen Schergen und Bosse.',
        shortDesc: 'Frühere Enthauptung mit dem Wirbel [C].',
        formatEffect: (r) => `Fatal <= ${35 + r * 6}% LP`,
      },
    },
    techniques: {
      whirlwind_edge: {
        name: 'Wolfswirbel',
        inputHint: 'C / ◀+A',
        shortBadge: 'WIRBEL [C]',
        summary: '360°-Drehhieb (+10px Reichweite, +15% Schaden & +10% Enthauptungsschwelle bei Bossen).',
        shortSummary: '[C] +10px Reichweite, +15% Schaden & +10% Fatal.',
      },
      iron_riposte: {
        name: 'Eisenriposte',
        inputHint: 'Perfekte L1',
        shortBadge: 'RIPOSTE [L1]',
        summary: 'Erweitert Perfekte Parade L1: verursacht sofort -12 LP, betäubt stark & gibt +28 Ausdauer.',
        shortSummary: '[L1] Breite Parade: -12 LP Konter & Betäubung!',
      },
      sky_breaker: {
        name: 'Schildbrecher-Spalter',
        inputHint: 'R1 / ▲+A',
        shortBadge: 'BRECHER [R1]',
        summary: 'Entflammt den Spalter R1 (+22% Schaden): durchbricht hohe Deckung mit 58% Schaden.',
        shortSummary: '[R1] +22% Schaden & bricht hohe Deckung!',
      },
    },
  },
};

const CODEX_BY_LANG: Record<LanguageCode, LocalizedCodexStrings> = {
  fr: {
    pageTitles: [
      '1/4 · MOUVEMENTS & ESQUIVES',
      '2/4 · COUPS D’ÉPÉE OFFENSIFS',
      '3/4 · GARDE, PARADES & BOSS',
      '4/4 · BOTTES SECRÈTES & FATAL',
    ],
    demoLabels: {
      walk_fwd: 'Marche',
      crouch: 'Accroupi',
      roll_fwd: 'Roulade D',
      roll_back: 'Recul D',
      jump: 'Saut ▲',
      slash_high: 'Taille A',
      thrust_mid: 'Estoc ▶+A',
      sweep_low: 'Balayage B',
      cleave_overhead: 'Fendoir R1',
      block_high: 'Parade L1',
      spin_decap: 'Moulinet C',
    },
    pages: [
      [
        { cmd: '◀ / ▶ (Q / D)', desc: 'Approcher ou reculer en garde' },
        { cmd: '▲ Haut (Z / W)', desc: 'Saut : évite Balayage & Onde' },
        { cmd: '▼ Bas (S)', desc: 'Accroupi : évite Taille & C' },
        { cmd: 'Bouton D (E)', desc: 'Roulade invincible d’esquive' },
      ],
      [
        { cmd: 'Bouton A (F)', desc: 'Taille Haute vive et rapide' },
        { cmd: '▶ Avant + A', desc: 'Estoc médian longue portée' },
        { cmd: 'Bouton B / ▼+A', desc: 'Balayage Bas : sous la garde' },
        { cmd: 'R1 (T) / ▲+A', desc: 'Fendoir Lourd vertical' },
      ],
      [
        { cmd: 'Maintenir L1', desc: 'Garde Haute (coups hauts/méd.)' },
        { cmd: 'L1 à l’impact', desc: 'PARADE PARFAITE : étourdit !' },
        { cmd: 'Ondes Basses', desc: 'Sautez (▲) sur cristal/lave' },
        { cmd: 'Orbes Maudits', desc: 'Roulez (D) à travers l’orbe' },
      ],
      [
        { cmd: 'Bouton C / ◀+A', desc: 'FATAL : décapite PV bas/Rage' },
        { cmd: '★ Moulinet Loup', desc: '[C] +10px portée & +10% fatal' },
        { cmd: '★ Riposte Fer', desc: '[L1] Contre -12 PV + étourdit' },
        { cmd: '★ Brise-Garde', desc: '[R1] Fracasse la garde haute' },
      ],
    ],
    tipEquippedLine: (badge) => `BOTTE ACTIVE : ${badge} (Forge : touche D)`,
    tipForgeLine1: 'Forge ouverte entre 2 Actes, avant un Boss (D)',
    tipForgeLine2: 'ou après défaite pour dépenser vos Éclats !',
    footerHint: '◀/▶ : Page 1..4 · D : Forge · B/RUN : Retour',
  },
  en: {
    pageTitles: [
      '1/4 · MOVEMENT & DODGES',
      '2/4 · OFFENSIVE SWORD STRIKES',
      '3/4 · GUARD, PARRY & BOSSES',
      '4/4 · SECRET ARTS & FATAL BLOW',
    ],
    demoLabels: {
      walk_fwd: 'Walk',
      crouch: 'Crouch',
      roll_fwd: 'Roll D',
      roll_back: 'Back Roll',
      jump: 'Jump ▲',
      slash_high: 'Slash A',
      thrust_mid: 'Thrust ▶+A',
      sweep_low: 'Sweep B',
      cleave_overhead: 'Cleave R1',
      block_high: 'Parry L1',
      spin_decap: 'Spin C',
    },
    pages: [
      [
        { cmd: '◀ / ▶ (A / D)', desc: 'Advance or retreat on guard' },
        { cmd: '▲ Up (W)', desc: 'Jump: dodges Sweep & Wave' },
        { cmd: '▼ Down (S)', desc: 'Crouch: ducks Slash & Spin' },
        { cmd: 'Button D (E)', desc: 'Invincible tactical dodge roll' },
      ],
      [
        { cmd: 'Button A (F)', desc: 'Fast High Slash (reliable)' },
        { cmd: '▶ Forward + A', desc: 'Long-range Mid Lunge Thrust' },
        { cmd: 'Button B / ▼+A', desc: 'Low Sweep: trips under guard' },
        { cmd: 'R1 (T) / ▲+A', desc: 'Heavy Overhead Cleave' },
      ],
      [
        { cmd: 'Hold L1 (Shift)', desc: 'High Guard: blocks high/mid' },
        { cmd: 'Timed L1 hit', desc: 'PERFECT PARRY: stuns foe!' },
        { cmd: 'Floor Waves', desc: 'Jump (▲) over crystal/magma' },
        { cmd: 'Boss Orbs', desc: 'Roll (D) right through orbs' },
      ],
      [
        { cmd: 'Button C / ◀+A', desc: 'FATAL: decapitates low HP/Rage' },
        { cmd: '★ Wolf Spin', desc: '[C] +10px reach & +10% fatal' },
        { cmd: '★ Iron Riposte', desc: '[L1] -12 HP counter & stun' },
        { cmd: '★ Sky Breaker', desc: '[R1] Shatters enemy guard' },
      ],
    ],
    tipEquippedLine: (badge) => `EQUIPPED ART: ${badge} (Forge: key D)`,
    tipForgeLine1: 'Open Forge between Acts, before Bosses (D)',
    tipForgeLine2: 'or after defeat to spend your Steel Shards!',
    footerHint: '◀/▶: Page 1..4 · D: Forge · B/RUN: Back',
  },
  pt: {
    pageTitles: [
      '1/4 · MOVIMENTO E ESQUIVAS',
      '2/4 · GOLPES DE ESPADA',
      '3/4 · GUARDA, DEFESA E CHEFES',
      '4/4 · TÉCNICAS E GOLPE FATAL',
    ],
    demoLabels: {
      walk_fwd: 'Andar',
      crouch: 'Agachar',
      roll_fwd: 'Rolar D',
      roll_back: 'Recuo D',
      jump: 'Salto ▲',
      slash_high: 'Corte A',
      thrust_mid: 'Estocada',
      sweep_low: 'Rasteira B',
      cleave_overhead: 'Rachador R1',
      block_high: 'Defesa L1',
      spin_decap: 'Giro C',
    },
    pages: [
      [
        { cmd: '◀ / ▶ (A / D)', desc: 'Avançar ou recuar em guarda' },
        { cmd: '▲ Cima (W)', desc: 'Salto: evita Rasteira e Onda' },
        { cmd: '▼ Baixo (S)', desc: 'Agachar: evita Corte alto e C' },
        { cmd: 'Botão D (E)', desc: 'Rolamento invencível de esquiva' },
      ],
      [
        { cmd: 'Botão A (F)', desc: 'Corte Alto rápido e preciso' },
        { cmd: '▶ Frente + A', desc: 'Estocada média de longo alcance' },
        { cmd: 'Botão B / ▼+A', desc: 'Rasteira: derruba sob a guarda' },
        { cmd: 'R1 (T) / ▲+A', desc: 'Golpe Pesado vertical' },
      ],
      [
        { cmd: 'Segurar L1', desc: 'Guarda Alta (golpes altos/méd.)' },
        { cmd: 'L1 no impacto', desc: 'DEFESA PERFEITA: atordoa!' },
        { cmd: 'Ondas no Chão', desc: 'Salte (▲) sobre cristal/lava' },
        { cmd: 'Orbes Mágicos', desc: 'Role (D) através do projétil' },
      ],
      [
        { cmd: 'Botão C / ◀+A', desc: 'FATAL: decapita PV baixo/Fúria' },
        { cmd: '★ Giro do Lobo', desc: '[C] +10px alcance e +10% fatal' },
        { cmd: '★ Riposta Ferro', desc: '[L1] Contra -12 PV + atordoa' },
        { cmd: '★ Rachador', desc: '[R1] Estilhaça a guarda alta' },
      ],
    ],
    tipEquippedLine: (badge) => `TÉCNICA ATIVA: ${badge} (Forja: tecla D)`,
    tipForgeLine1: 'Use a Forja entre Atos, antes do Chefe (D)',
    tipForgeLine2: 'ou após derrota para gastar seus Fragmentos!',
    footerHint: '◀/▶: Pág 1..4 · D: Forja · B/RUN: Voltar',
  },
  es: {
    pageTitles: [
      '1/4 · MOVIMIENTO Y ESQUIVAS',
      '2/4 · GOLPES OFENSIVOS',
      '3/4 · GUARDIA, PARADAS Y JEFES',
      '4/4 · TÉCNICAS Y GOLPE FATAL',
    ],
    demoLabels: {
      walk_fwd: 'Avance',
      crouch: 'Agachado',
      roll_fwd: 'Rodar D',
      roll_back: 'Retiro D',
      jump: 'Salto ▲',
      slash_high: 'Tajo A',
      thrust_mid: 'Estocada',
      sweep_low: 'Barrido B',
      cleave_overhead: 'Mandoble R1',
      block_high: 'Parada L1',
      spin_decap: 'Giro C',
    },
    pages: [
      [
        { cmd: '◀ / ▶ (A / D)', desc: 'Avanzar o retroceder en guardia' },
        { cmd: '▲ Arriba (W)', desc: 'Salto: evita Barrido y Onda' },
        { cmd: '▼ Abajo (S)', desc: 'Agacharse: esquiva Tajo y Giro' },
        { cmd: 'Botón D (E)', desc: 'Rodada invencible de esquiva' },
      ],
      [
        { cmd: 'Botón A (F)', desc: 'Tajo Alto veloz y seguro' },
        { cmd: '▶ Adelante + A', desc: 'Estocada media de gran alcance' },
        { cmd: 'Botón B / ▼+A', desc: 'Barrido Bajo: derriba guardia' },
        { cmd: 'R1 (T) / ▲+A', desc: 'Mandoble Pesado descendente' },
      ],
      [
        { cmd: 'Mantener L1', desc: 'Guardia Alta (altos y medios)' },
        { cmd: 'L1 al impacto', desc: '¡PARADA PERFECTA: aturde!' },
        { cmd: 'Ondas Bajas', desc: 'Salta (▲) sobre cristal/lava' },
        { cmd: 'Orbes Oscuros', desc: 'Rueda (D) a través del orbe' },
      ],
      [
        { cmd: 'Botón C / ◀+A', desc: 'FATAL: decapita PV bajo/Furia' },
        { cmd: '★ Giro del Lobo', desc: '[C] +10px alcance y +10% fatal' },
        { cmd: '★ Riposta Hierro', desc: '[L1] Contra -12 PV y aturde' },
        { cmd: '★ Rompeguardia', desc: '[R1] Destroza la guardia alta' },
      ],
    ],
    tipEquippedLine: (badge) => `TÉCNICA ACTIVA: ${badge} (Forja: tecla D)`,
    tipForgeLine1: 'Abre la Forja entre Actos, antes de Jefes (D)',
    tipForgeLine2: 'o tras caer para gastar tus Esquirlas de Acero.',
    footerHint: '◀/▶: Pág 1..4 · D: Forja · B/RUN: Volver',
  },
  it: {
    pageTitles: [
      '1/4 · MOVIMENTO E SCHIVATE',
      '2/4 · COLPI DI SPADA OFFENSIVI',
      '3/4 · GUARDIA, PARATE E BOSS',
      '4/4 · TECNICHE E COLPO FATALE',
    ],
    demoLabels: {
      walk_fwd: 'Marcia',
      crouch: 'Accov.',
      roll_fwd: 'Capriola D',
      roll_back: 'Indietro D',
      jump: 'Salto ▲',
      slash_high: 'Taglio A',
      thrust_mid: 'Affondo',
      sweep_low: 'Spazzata B',
      cleave_overhead: 'Fendente R1',
      block_high: 'Parata L1',
      spin_decap: 'Mulinetto C',
    },
    pages: [
      [
        { cmd: '◀ / ▶ (A / D)', desc: 'Avanza o arretra in guardia' },
        { cmd: '▲ Su (W)', desc: 'Salto: evita Spazzata e Onda' },
        { cmd: '▼ Giù (S)', desc: 'Accovacciato: schiva Taglio/C' },
        { cmd: 'Tasto D (E)', desc: 'Capriola invincibile tattica' },
      ],
      [
        { cmd: 'Tasto A (F)', desc: 'Taglio Alto rapido e preciso' },
        { cmd: '▶ Avanti + A', desc: 'Affondo medio a lunga portata' },
        { cmd: 'Tasto B / ▼+A', desc: 'Spazzata Bassa: sotto guardia' },
        { cmd: 'R1 (T) / ▲+A', desc: 'Fendente Pesante verticale' },
      ],
      [
        { cmd: 'Tieni L1', desc: 'Guardia Alta (colpi alti/medi)' },
        { cmd: 'L1 all’impatto', desc: 'PARATA PERFETTA: stordisce!' },
        { cmd: 'Onde Basse', desc: 'Salta (▲) su cristallo/lava' },
        { cmd: 'Globi Maledetti', desc: 'Rotola (D) oltre il proiettile' },
      ],
      [
        { cmd: 'Tasto C / ◀+A', desc: 'FATALE: decapita PV bassi/Ira' },
        { cmd: '★ Mulinetto Lupo', desc: '[C] +10px portata e +10% fat.' },
        { cmd: '★ Risposta Ferro', desc: '[L1] -12 PV e stordimento' },
        { cmd: '★ Spezzaguardia', desc: '[R1] Infrange la guardia alta' },
      ],
    ],
    tipEquippedLine: (badge) => `TECNICA ATTIVA: ${badge} (Forgia: tasto D)`,
    tipForgeLine1: 'Usa la Forgia tra gli Atti, prima dei Boss (D)',
    tipForgeLine2: 'o dopo una sconfitta per usare le Schegge!',
    footerHint: '◀/▶: Pag 1..4 · D: Forgia · B/RUN: Indietro',
  },
  de: {
    pageTitles: [
      '1/4 · BEWEGUNG & AUSWEICHEN',
      '2/4 · ANGRIFFSHIEBE',
      '3/4 · DECKUNG, PARADE & BOSSE',
      '4/4 · GEHEIMTECHNIKEN & FATAL',
    ],
    demoLabels: {
      walk_fwd: 'Schritt',
      crouch: 'Ducken',
      roll_fwd: 'Rolle D',
      roll_back: 'Rückrolle',
      jump: 'Sprung ▲',
      slash_high: 'Hieb A',
      thrust_mid: 'Stich ▶+A',
      sweep_low: 'Feger B',
      cleave_overhead: 'Spalter R1',
      block_high: 'Parade L1',
      spin_decap: 'Wirbel C',
    },
    pages: [
      [
        { cmd: '◀ / ▶ (A / D)', desc: 'Vorrücken oder zurückweichen' },
        { cmd: '▲ Auf (W)', desc: 'Sprung: meidet Feger & Welle' },
        { cmd: '▼ Ab (S)', desc: 'Ducken: unter Hieb & Wirbel C' },
        { cmd: 'Taste D (E)', desc: 'Unverwundbare Ausweichrolle' },
      ],
      [
        { cmd: 'Taste A (F)', desc: 'Schneller hoher Schwerthieb' },
        { cmd: '▶ Vor + A', desc: 'Weiter Ausfallstich (Mitte)' },
        { cmd: 'Taste B / ▼+A', desc: 'Fußfeger: trifft unter Deckung' },
        { cmd: 'R1 (T) / ▲+A', desc: 'Schwerer Überkopf-Spalter' },
      ],
      [
        { cmd: 'L1 halten', desc: 'Hohe Deckung (hoch & mittel)' },
        { cmd: 'L1 beim Treffer', desc: 'PERFEKTE PARADE: betäubt!' },
        { cmd: 'Bodenwellen', desc: 'Springe (▲) über Kristall/Lava' },
        { cmd: 'Boss-Geschosse', desc: 'Rolle (D) durch das Geschoss' },
      ],
      [
        { cmd: 'Taste C / ◀+A', desc: 'FATAL: enthauptet bei Wut/LP' },
        { cmd: '★ Wolfswirbel', desc: '[C] +10px Weite & +10% Fatal' },
        { cmd: '★ Eisenriposte', desc: '[L1] -12 LP Konter & Stun' },
        { cmd: '★ Schildbrecher', desc: '[R1] Zerschmettert Deckung' },
      ],
    ],
    tipEquippedLine: (badge) => `AKTIVE TECHNIK: ${badge} (Schmiede: D)`,
    tipForgeLine1: 'Schmiede zwischen Akten, vor Bossen (Taste D)',
    tipForgeLine2: 'oder nach Niederlagen für Stahlsplitter nutzen!',
    footerHint: '◀/▶: Seite 1..4 · D: Schmiede · B/RUN: Zurück',
  },
};

const COMBAT_STRINGS_BY_LANG: Record<LanguageCode, LocalizedCombatStrings> = {
  fr: {
    actWord: 'ACTE',
    wallBreachedBanner: 'HERSE OUVERTE · AVANCEZ ▶▶',
    skyBreakerBanner: 'FENDOIR BRISE-GARDE !',
    ironRiposteBanner: 'RIPOSTE DE FER ! -12 PV',
    softFatalBanner: 'COUP FATAL · ÉCLAIR D’ACIER !',
    whirlwindFatalBanner: 'MOULINET DU LOUP · FATAL !',
    whirlwindPopup: (pts) => `MOULINET +${pts}`,
    fatalPopup: (pts) => `FATAL +${pts}`,
    guardBreakPopup: (pts) => `BRISE-GARDE +${pts}`,
    ripostePopup: 'RIPOSTE -14 PV',
    parryPopup: 'PARADE +80',
    healPopup: (hp) => `+${hp} PV`,
    shardsPopup: (n) => `+${n} ÉCLATS`,
    goblinLaugh: 'HI HI !',
    postMatchForgeHint: (s) => `D : Forge (${s} Écl.) · L1 : Guide`,
    storyMinionsPrefix: 'Zone',
    storyHelpHint: 'L1 : Aide',
    storyShardsReady: (s) => `${s} ÉCLATS DISPO`,
    storyActCleared: (s) => `ACTE ACCOMPLI · ${s} ÉCLATS`,
    storyShardsWon: (s) => `+${s} Éclats gagnés !`,
    storyFinishChroniclePrompt: 'A/RUN : Conclure · D : Forge',
    coopRevivePopup: 'SECOND SOUFFLE !',
    coopAllyDownBanner: 'ALLIÉ À TERRE · APPROCHEZ / D !',
    coopBossArrivalBanner: (b) => `GARDE FINALE · ${b.toUpperCase()} !`,
  },
  en: {
    actWord: 'ACT',
    wallBreachedBanner: 'GATE BREACHED · ADVANCE ▶▶',
    skyBreakerBanner: 'SKY BREAKER · GUARD CRUSH!',
    ironRiposteBanner: 'IRON RIPOSTE! -12 HP',
    softFatalBanner: 'FATAL BLOW · STEEL FLASH!',
    whirlwindFatalBanner: 'WOLF WHIRLWIND · FATAL!',
    whirlwindPopup: (pts) => `WHIRLWIND +${pts}`,
    fatalPopup: (pts) => `FATAL +${pts}`,
    guardBreakPopup: (pts) => `GUARD BREAK +${pts}`,
    ripostePopup: 'RIPOSTE -14 HP',
    parryPopup: 'PARRY +80',
    healPopup: (hp) => `+${hp} HP`,
    shardsPopup: (n) => `+${n} SHARDS`,
    goblinLaugh: 'HEH HEH!',
    postMatchForgeHint: (s) => `D: Forge (${s} Shd.) · L1: Guide`,
    storyMinionsPrefix: 'Zone',
    storyHelpHint: 'L1: Guide',
    storyShardsReady: (s) => `${s} SHARDS READY`,
    storyActCleared: (s) => `ACT CLEARED · ${s} SHARDS`,
    storyShardsWon: (s) => `+${s} Steel Shards won!`,
    storyFinishChroniclePrompt: 'A/RUN: Finish · D: Forge',
    coopRevivePopup: 'SECOND WIND!',
    coopAllyDownBanner: 'ALLY DOWN · STAND CLOSE / D!',
    coopBossArrivalBanner: (b) => `FINAL STAND · ${b.toUpperCase()}!`,
  },
  pt: {
    actWord: 'ATO',
    wallBreachedBanner: 'PORTÃO ABERTO · AVANCE ▶▶',
    skyBreakerBanner: 'RACHADOR · GUARDA QUEBRADA!',
    ironRiposteBanner: 'RIPOSTA DE FERRO! -12 PV',
    softFatalBanner: 'GOLPE FATAL · RAIO DE AÇO!',
    whirlwindFatalBanner: 'GIRO DO LOBO · FATAL!',
    whirlwindPopup: (pts) => `GIRO +${pts}`,
    fatalPopup: (pts) => `FATAL +${pts}`,
    guardBreakPopup: (pts) => `QUEBRA +${pts}`,
    ripostePopup: 'RIPOSTA -14 PV',
    parryPopup: 'DEFESA +80',
    healPopup: (hp) => `+${hp} PV`,
    shardsPopup: (n) => `+${n} FRAG.`,
    goblinLaugh: 'HEH HEH!',
    postMatchForgeHint: (s) => `D: Forja (${s} Frag.) · L1: Guia`,
    storyMinionsPrefix: 'Zona',
    storyHelpHint: 'L1: Guia',
    storyShardsReady: (s) => `${s} FRAG. PRONTOS`,
    storyActCleared: (s) => `ATO VENCIDO · ${s} FRAG.`,
    storyShardsWon: (s) => `+${s} Fragmentos ganhos!`,
    storyFinishChroniclePrompt: 'A/RUN: Concluir · D: Forja',
    coopRevivePopup: 'SEGUNDO FÔLEGO!',
    coopAllyDownBanner: 'ALIADO CAÍDO · APROXIME / D!',
    coopBossArrivalBanner: (b) => `GUARDA FINAL · ${b.toUpperCase()}!`,
  },
  es: {
    actWord: 'ACTO',
    wallBreachedBanner: '¡RASTRILLO ABIERTO · AVANZA ▶▶!',
    skyBreakerBanner: '¡TAJO ROMPEGUARDIA!',
    ironRiposteBanner: '¡RIPOSTA DE HIERRO! -12 PV',
    softFatalBanner: '¡GOLPE FATAL · RAYO DE ACERO!',
    whirlwindFatalBanner: '¡TORBELLINO DEL LOBO · FATAL!',
    whirlwindPopup: (pts) => `GIRO +${pts}`,
    fatalPopup: (pts) => `FATAL +${pts}`,
    guardBreakPopup: (pts) => `ROMPE +${pts}`,
    ripostePopup: 'RIPOSTA -14 PV',
    parryPopup: 'PARADA +80',
    healPopup: (hp) => `+${hp} PV`,
    shardsPopup: (n) => `+${n} ESQ.`,
    goblinLaugh: '¡JE JE!',
    postMatchForgeHint: (s) => `D: Forja (${s} Esq.) · L1: Guía`,
    storyMinionsPrefix: 'Zona',
    storyHelpHint: 'L1: Guía',
    storyShardsReady: (s) => `${s} ESQ. LISTAS`,
    storyActCleared: (s) => `ACTO SUPERADO · ${s} ESQ.`,
    storyShardsWon: (s) => `¡+${s} Esquirlas ganadas!`,
    storyFinishChroniclePrompt: 'A/RUN: Concluir · D: Forja',
    coopRevivePopup: '¡SEGUNDO ALIENTO!',
    coopAllyDownBanner: '¡ALIADO CAÍDO · ACÉRCATE / D!',
    coopBossArrivalBanner: (b) => `¡GUARDIA FINAL · ${b.toUpperCase()}!`,
  },
  it: {
    actWord: 'ATTO',
    wallBreachedBanner: 'VARCO APERTO · AVANTI ▶▶',
    skyBreakerBanner: 'FENDENTE SPEZZAGUARDIA!',
    ironRiposteBanner: 'RISPOSTA DI FERRO! -12 PV',
    softFatalBanner: 'COLPO FATALE · LAMPO D’ACCIAIO!',
    whirlwindFatalBanner: 'MULINETTO DEL LUPO · FATALE!',
    whirlwindPopup: (pts) => `MULINETTO +${pts}`,
    fatalPopup: (pts) => `FATALE +${pts}`,
    guardBreakPopup: (pts) => `SPEZZA +${pts}`,
    ripostePopup: 'RISPOSTA -14 PV',
    parryPopup: 'PARATA +80',
    healPopup: (hp) => `+${hp} PV`,
    shardsPopup: (n) => `+${n} SCH.`,
    goblinLaugh: 'EH EH!',
    postMatchForgeHint: (s) => `D: Forgia (${s} Sch.) · L1: Guida`,
    storyMinionsPrefix: 'Zona',
    storyHelpHint: 'L1: Guida',
    storyShardsReady: (s) => `${s} SCH. PRONTE`,
    storyActCleared: (s) => `ATTO COMPIUTO · ${s} SCH.`,
    storyShardsWon: (s) => `+${s} Schegge ottenute!`,
    storyFinishChroniclePrompt: 'A/RUN: Concludi · D: Forgia',
    coopRevivePopup: 'SECONDO RESPIRO!',
    coopAllyDownBanner: 'ALLEATO A TERRA · AVVICINATI / D!',
    coopBossArrivalBanner: (b) => `GUARDIA FINALE · ${b.toUpperCase()}!`,
  },
  de: {
    actWord: 'AKT',
    wallBreachedBanner: 'TOR OFFEN · WEITER ▶▶',
    skyBreakerBanner: 'SCHILDBRECHER-SPALTER!',
    ironRiposteBanner: 'EISENRIPOSTE! -12 LP',
    softFatalBanner: 'TODESSCHLAG · STAHLBLITZ!',
    whirlwindFatalBanner: 'WOLFSWIRBEL · FATAL!',
    whirlwindPopup: (pts) => `WIRBEL +${pts}`,
    fatalPopup: (pts) => `FATAL +${pts}`,
    guardBreakPopup: (pts) => `BRECHER +${pts}`,
    ripostePopup: 'RIPOSTE -14 LP',
    parryPopup: 'PARADE +80',
    healPopup: (hp) => `+${hp} LP`,
    shardsPopup: (n) => `+${n} SPL.`,
    goblinLaugh: 'HEH HEH!',
    postMatchForgeHint: (s) => `D: Schmiede (${s} Spl.) · L1: Hilfe`,
    storyMinionsPrefix: 'Zone',
    storyHelpHint: 'L1: Hilfe',
    storyShardsReady: (s) => `${s} SPL. BEREIT`,
    storyActCleared: (s) => `AKT GESCHAFFT · ${s} SPL.`,
    storyShardsWon: (s) => `+${s} Stahlsplitter erhalten!`,
    storyFinishChroniclePrompt: 'A/RUN: Abschluss · D: Schmiede',
    coopRevivePopup: 'ZWEITER ATEM!',
    coopAllyDownBanner: 'GEFÄHRTE AM BODEN · NÄHERN / D!',
    coopBossArrivalBanner: (b) => `ENDWACHE · ${b.toUpperCase()}!`,
  },
};

const WEB_UI_BY_LANG: Record<LanguageCode, LocalizedWebUiStrings> = {
  fr: {
    impactsLabel: 'Impacts :',
    langLabel: 'Langue :',
    l1Button: 'L1 · GARDE / PARADE',
    r1Button: 'R1 · FENDOIR LOURD',
    dpadLabel: 'PAVÉ DIR.',
    menuBtnLabel: 'MENU (Échap)',
    menuInlineBtn: '[Bouton MENU]',
    runBtnLabel: 'RUN (Entrée)',
    btnCMove: 'MOULINET',
    btnDMove: 'ROULADE',
    btnAMove: 'GLAIVE',
    btnBMove: 'BALAYAGE',
    legendCol1Title: 'Joystick & Pavé Directionnel',
    legendCol1Body: 'Clavier ZQSD / WASD ou Flèches · Haut : Saut · Bas : Esquive basse',
    legendCol2Title: 'Boutons A, B, C, D',
    legendCol2Body: 'A (F/Espace) : Glaive · B (G) : Balayage · C (R) : Décapiter · D (E) : Roulade',
    legendCol3Title: 'Gâchettes L1 & R1',
    legendCol3Body: 'L1 (Maj / U) : Garde & Parade Parfaite · R1 (T / I) : Fendoir Brise-Garde',
    legendCol4Title: 'MENU, Forge & Cinématiques',
    legendCol4Body: 'MENU (Échap) : Langue, Aide & Soft/Gore · B/RUN : Passer · D : Forge',
    sidebarSystemTitle: 'Système Gamebuino AKA',
    sidebarStatsLine: (hp, pct, sh) => `${hp} PV · +${pct}% Acier · ${sh} Éclats`,
    sidebarRecordLine: (sc, min) => `Record ${sc} PTS · ${min} Sbires vaincus`,
    sidebarHelpBody: 'Appuyez sur MENU (Échap) ou sur les boutons ci-dessus pour changer la langue (FR/EN/PT/ES/IT/DE), ouvrir le Guide Coups & Parades ou régler les impacts Soft / Normal / Gore.',
    sidebarBtnCodex: 'Guide Coups & Parades (Écran AKA)',
    sidebarBtnForge: (sh) => `Forge & Bottes (${sh} Éclats)`,
    sidebarBtnSheets: 'Planches Sprites, Décors & Animations',
    sidebarBtnLoader: 'Voir le Bootloader (/Firmware)',
    sidebarBtnGithub: 'GitHub Release & Liaison AKA',
    mobileNavBoss: 'Boss',
    footerLeft: 'Krom : Le Glaive d’Acier · Gamebuino AKA 320×240 Non-Tactile · /Krom_Barbarian/Firmware',
    footerRight: 'Joystick · Pavé · A/B/C/D · L1/R1 · MENU (6 Langues, Volumes, Pause, Loader) · RUN',
    guideKicker: (name, hint) => `Manuel d’Armes Intégré · Botte active : ${name} (${hint})`,
    guideTitle: 'Contrôles, Coups d’Épée, Parades & Forge de Bivouac',
    guideBtnAkaCodex: 'Afficher dans l’écran AKA (4 pages)',
    guideBtnAkaForge: (sh) => `Forge dans l’écran AKA (${sh} Éclats)`,
    guideTab1: '1. Coups Offensifs & Coup Fatal',
    guideTab2: '2. Garde, Parades, Esquives & Boss',
    guideTab3: '3. Forge & Bottes Secrètes',
    guideMoves: [
      {
        title: 'Taille Haute Vive',
        input: 'Bouton A · Clavier F / Espace',
        body: 'Frappe rapide à hauteur d’épaule (14 dégâts). Idéale pour interrompre un sbire ou toucher les chauves-souris.',
      },
      {
        title: 'Fente d’Estoc',
        input: 'Avant + A · Clavier D/Flèche + F',
        body: 'Pas glissé vers l’avant suivi d’une pointe médiane longue portée (16 dégâts). Touche même un ennemi accroupi.',
      },
      {
        title: 'Balayage Bas Faucheur',
        input: 'Bouton B (ou Bas + A) · Clavier G',
        body: 'Fauche sous la garde haute ! Attention : si vous répétez B en boucle, les Boss et gladiateurs bondissent par-dessus pour contre-attaquer.',
      },
      {
        title: 'Fendoir Lourd Descendant',
        input: 'Gâchette R1 (ou Haut + A) · Clavier T',
        body: 'Coup vertical lourd à deux mains (23 dégâts). Avec la Botte Fendoir Brise-Garde équipée, il fracasse net la garde haute !',
      },
    ],
    guideFatalMove: {
      title: 'Moulinet Décapitant 360° (Coup Fatal Barbarian)',
      input: 'Bouton C (ou Arrière + A) · Clavier R',
      body: 'Rotation complète à hauteur de nuque (frappe devant et derrière Krom dans les zones !). Décapite instantanément un Boss sous le seuil fatal ou lorsque votre Rage dorée est pleine.',
    },
    guideDefenseCards: [
      {
        title: 'Garde Haute & Parade Parfaite',
        input: 'L1 · Clavier Maj / Q',
        body: 'Maintenir L1 bloque les coups hauts et médians. Presser L1 juste à l’impact déclenche une Parade Parfaite qui étourdit l’ennemi et restaure votre Souffle.',
      },
      {
        title: 'Roulade Tactique Invincible',
        input: 'Bouton D · Clavier E',
        body: 'Krom plonge au sol pour passer dans le dos de l’adversaire ou reculer. Traverse sans dégâts les coups hauts, moulinets et projectiles !',
      },
      {
        title: 'Esquive Accroupie & Saut d’Assaut',
        input: 'Bas (S) · Haut (Z / W)',
        body: 'Bas : passe sous les Tailles Hautes et tentatives de Décapitation. Haut : saute par-dessus les Balayages Bas et les ondes de cristal ou de lave.',
      },
      {
        title: 'Contrer les 6 Boss & Anti-Bourrinage',
        input: 'Actes I à VI',
        body: 'Thalgrim & Vorgath : sautez par-dessus l’onde basse. Baelgor & Drax : roulez (D) à travers les orbes. Ne bourrinez pas B : variez Parades L1, Estocs et Fendoirs R1 !',
      },
    ],
    guideForgeWhenTitle: 'Quand et comment utiliser la Forge sur la console Gamebuino AKA ?',
    guideForgeWhenBody: 'La Forge s’ouvre automatiquement au bivouac entre deux Actes et reste accessible à tout moment via le Bouton D (touche E) avant un Boss, après une défaite ou depuis le Menu Titre.',
    guideActiveHudTag: 'Active dans le HUD 320×240',
    guideUnlockedTag: 'Débloquée',
    guideCostTag: (c) => `Forge : ${c} Éclats`,
    guideEquipBtn: 'Équiper',
    guideUnlockInForgeBtn: 'Débloquer à la Forge →',
    forgePageKicker: 'Progression de Krom · Sauvegarde Locale Automatique',
    forgePageTitle: 'La Forge des Hautes-Brumes',
    forgePageIntro: 'Dépensez vos Éclats d’Acier récoltés dans les zones fortifiées et sur les Boss. Vos améliorations et votre Botte Secrète s’appliquent immédiatement à Krom.',
    forgeBestScoreLabel: 'Meilleur Score',
    forgeHuntLabel: 'Tableau de Chasse',
    forgeHuntValue: (m, b, d) => `${m} Sbires · ${b} Boss · ${d} Décap.`,
    forgeReturnCombatBtn: 'Retourner au Combat',
    forgeSection1Title: '01. Attributs du Guerrier & Trempe de l’Acier',
    forgeRankLabel: (r, max) => `Rang ${r}/${max}`,
    forgeMaxMasteryBtn: 'Maîtrise Maximale',
    forgeBuyBtn: (c) => `Forger (${c} Éclats)`,
    forgeSection2Title: '02. Bottes Secrètes & Style d’Escrime',
    forgeCommandPrefix: 'Commande :',
    forgeActiveStyleLabel: 'Style actif en combat',
    forgeEquippedBtn: 'Équipée',
    forgeLearnBtn: (c) => `Apprendre (${c} Éclats)`,
    forgeSaveNotice: 'Votre progression, votre meilleur score et vos Éclats d’Acier sont enregistrés automatiquement sur cet appareil.',
    forgeResetBtn: 'Réinitialiser la sauvegarde',
    chronicleKicker: 'Campagne en 6 Actes · Cinématiques 16-Bit, Panoramas 1800 px & Six Champions',
    chronicleTitle: 'La Chronique du Cœur d’Acier',
    chronicleIntro: 'Chaque Acte s’ouvre sur une cinématique animée 320×240, suivie d’une traversée panoramique continue (1800 px) jalonnée de herses et de 17 types de monstres avant le duel contre le Boss.',
    chronicleMinionsSlainLabel: 'Sbires fauchés',
    chronicleZoneLabel: 'Zone',
    chronicleMinionsCount: (n) => `${n} sbires`,
    chronicleArenaLabel: 'Arène',
    chronicleStatusCleared: 'Vaincu',
    chronicleStatusUnlocked: 'Accessible',
    chronicleStatusLocked: 'Verrouillé',
    chronicleMinionsSection: 'Monstres de la traversée (Score & Rage)',
    chronicleBossTechLabel: 'Technique du Boss :',
    chronicleParryHintLabel: 'Conseil tactique :',
    chronicleNextBridgeLabel: 'Transition suivante :',
    chronicleCutsceneBtn: 'Cinématique',
    chronicleEpilogueBtn: 'Épilogue',
    chronicleBossDirectBtn: 'Duel Boss Direct',
    chronicleReplayBtn: (b) => `Rejouer Zone + ${b}`,
    chroniclePlayBtn: (b) => `Traverser Zone + ${b}`,
    chronicleLockedBtn: (b) => `Battez ${b} d’abord`,
    chroniclePrologueKicker: 'Prologue de la Saga · Les Hautes-Brumes en Flammes',
    chroniclePrologueTitle: 'Le Serment sur l’Acier Brisé',
    chroniclePrologueBody:
      'Par une nuit d’éclipse écarlate, les légions du Sorcier-Roi Drax réduisirent en cendres le village natal de Krom et arrachèrent le Cœur d’Acier de son sanctuaire ancestral. Seul debout parmi les braises, le Barbare retrempa le glaive de son père dans la neige rougie et jura d’abattre les six Seigneurs de Guerre.',
    chronicleWatchPrologueBtn: 'Voir l’Introduction Animée',
    chronicleConclusionKicker: 'Dénouement Héroïque · Le Retour de l’Aube',
    chronicleConclusionTitle: 'L’Héritage du Cœur d’Acier',
    chronicleConclusionBody:
      'Lorsque les chaînes d’ombre se brisent sur l’autel de Drax, une vague d’or pur dissipe l’orage éternel au-dessus de Valéria. Sans réclamer ni couronne ni trône, Krom rend la relique sacrée aux forges libres des Hautes-Brumes et reprend la route des cimes, gardien silencieux d’un monde libéré.',
    chronicleWatchConclusionBtn: 'Voir la Conclusion Animée',
    stageNames: {
      forest: 'Clairières Cendrées',
      caverns: 'Cavernes de Cristal',
      crypt: 'Cryptes d’Obsidienne',
      arena: 'Arène des Ossements',
      inferno: 'Citadelle Infernale',
      sanctuary: 'Sanctuaire de Drax',
    },
  },
  en: {
    impactsLabel: 'Impacts:',
    langLabel: 'Lang:',
    l1Button: 'L1 · GUARD / PARRY',
    r1Button: 'R1 · HEAVY CLEAVE',
    dpadLabel: 'D-PAD',
    menuBtnLabel: 'MENU (Esc)',
    menuInlineBtn: '[MENU Button]',
    runBtnLabel: 'RUN (Enter)',
    btnCMove: 'WHIRLWIND',
    btnDMove: 'ROLL',
    btnAMove: 'SLASH',
    btnBMove: 'SWEEP',
    legendCol1Title: 'Joystick & D-Pad',
    legendCol1Body: 'WASD / ZQSD or Arrow keys · Up: Jump · Down: Low Crouch Dodge',
    legendCol2Title: 'Buttons A, B, C, D',
    legendCol2Body: 'A (F/Space): Slash · B (G): Low Sweep · C (R): Decapitate · D (E): Roll',
    legendCol3Title: 'Shoulders L1 & R1',
    legendCol3Body: 'L1 (Shift / U): High Guard & Perfect Parry · R1 (T / I): Heavy Cleave',
    legendCol4Title: 'MENU, Forge & Cutscenes',
    legendCol4Body: 'MENU (Esc): Language, Guide & Soft/Gore · B/RUN: Skip · D: Forge',
    sidebarSystemTitle: 'Gamebuino AKA System',
    sidebarStatsLine: (hp, pct, sh) => `${hp} HP · +${pct}% Steel · ${sh} Shards`,
    sidebarRecordLine: (sc, min) => `High Score ${sc} PTS · ${min} Foes Slain`,
    sidebarHelpBody: 'Press MENU (Esc) or use the language bar above to switch languages (FR/EN/PT/ES/IT/DE), open the 4-page Combat Guide, or toggle Soft / Normal / Gore impact FX.',
    sidebarBtnCodex: 'Combat & Parry Guide (AKA Screen)',
    sidebarBtnForge: (sh) => `Forge & Secret Arts (${sh} Shards)`,
    sidebarBtnSheets: 'Sprite Sheets, Stages & Animations',
    sidebarBtnLoader: 'Open SD Bootloader (/Firmware)',
    sidebarBtnGithub: 'GitHub Release & AKA Link',
    mobileNavBoss: 'Bosses',
    footerLeft: 'Krom: Blade of Steel · Gamebuino AKA 320×240 Non-Touch · /Krom_Barbarian/Firmware',
    footerRight: 'Joystick · D-Pad · A/B/C/D · L1/R1 · MENU (6 Languages, Volume, Pause, Loader) · RUN',
    guideKicker: (name, hint) => `Built-in Combat Manual · Active Art: ${name} (${hint})`,
    guideTitle: 'Controls, Sword Strikes, Parries & Campfire Forge',
    guideBtnAkaCodex: 'Open on AKA Screen (4 pages)',
    guideBtnAkaForge: (sh) => `Forge on AKA Screen (${sh} Shards)`,
    guideTab1: '1. Offensive Strikes & Fatal Blow',
    guideTab2: '2. Guard, Parries, Dodges & Bosses',
    guideTab3: '3. Campfire Forge & Secret Arts',
    guideMoves: [
      {
        title: 'Quick High Slash',
        input: 'Button A · Key F / Space',
        body: 'Fast shoulder-height cut (14 damage). Ideal to interrupt scouts or swat airborne cave bats.',
      },
      {
        title: 'Mid Lunge Thrust',
        input: 'Forward + A · Key D/Arrow + F',
        body: 'Forward step into a long-reach mid thrust (16 damage). Hits crouching foes cleanly.',
      },
      {
        title: 'Reaping Low Sweep',
        input: 'Button B (or Down + A) · Key G',
        body: 'Sweeps ankles under high guard! Watch out: if you spam B repeatedly, bosses and gladiators will jump over your blade and counterattack.',
      },
      {
        title: 'Heavy Overhead Cleave',
        input: 'Trigger R1 (or Up + A) · Key T',
        body: 'Two-handed vertical cleave (23 damage). With Sky Breaker equipped, it shatters enemy high guard!',
      },
    ],
    guideFatalMove: {
      title: '360° Spin Decapitation (Barbarian Fatal Blow)',
      input: 'Button C (or Back + A) · Key R',
      body: 'Full neck-level rotation hitting both in front of and behind Krom! Instantly decapitates bosses below the fatal HP threshold or when your golden Rage bar is full.',
    },
    guideDefenseCards: [
      {
        title: 'High Guard & Perfect Parry',
        input: 'L1 · Key Shift / Q',
        body: 'Holding L1 blocks high and mid strikes. Pressing L1 right at impact triggers a Perfect Parry that stuns the attacker and restores Stamina.',
      },
      {
        title: 'Invincible Tactical Roll',
        input: 'Button D · Key E',
        body: 'Dive forward behind the enemy or roll backward. Passes safely through high slashes, spins, and dark projectiles!',
      },
      {
        title: 'Crouch Dodge & Assault Jump',
        input: 'Down (S) · Up (W)',
        body: 'Down: ducks cleanly beneath High Slashes and Spin Decapitations. Up: jumps over Low Sweeps and floor crystal or magma waves.',
      },
      {
        title: 'Six Boss Counters & Anti-Spam AI',
        input: 'Acts I to VI',
        body: 'Thalgrim & Vorgath: jump over floor waves. Baelgor & Drax: roll (D) through orbs. Mix L1 parries, lunges, and R1 cleaves instead of spamming B!',
      },
    ],
    guideForgeWhenTitle: 'When and how to use the Forge on Gamebuino AKA?',
    guideForgeWhenBody: 'The Campfire Forge opens automatically between Acts and is always reachable via Button D (key E) before Boss arenas, on Game Over, or from the Title Screen.',
    guideActiveHudTag: 'Active in 320×240 HUD',
    guideUnlockedTag: 'Unlocked',
    guideCostTag: (c) => `Forge: ${c} Shards`,
    guideEquipBtn: 'Equip',
    guideUnlockInForgeBtn: 'Unlock in Forge →',
    forgePageKicker: 'Krom Progression · Automatic Local Save',
    forgePageTitle: 'The High-Mists Forge',
    forgePageIntro: 'Spend Steel Shards earned across fortified zones and Warlord duels. All upgrades and your equipped Secret Art apply immediately.',
    forgeBestScoreLabel: 'High Score',
    forgeHuntLabel: 'Battle Tally',
    forgeHuntValue: (m, b, d) => `${m} Foes · ${b} Bosses · ${d} Decap.`,
    forgeReturnCombatBtn: 'Return to Combat',
    forgeSection1Title: '01. Warrior Attributes & Steel Tempering',
    forgeRankLabel: (r, max) => `Rank ${r}/${max}`,
    forgeMaxMasteryBtn: 'Max Mastery',
    forgeBuyBtn: (c) => `Forge (${c} Shards)`,
    forgeSection2Title: '02. Secret Sword Arts & Fighting Style',
    forgeCommandPrefix: 'Input:',
    forgeActiveStyleLabel: 'Active combat style',
    forgeEquippedBtn: 'Equipped',
    forgeLearnBtn: (c) => `Learn (${c} Shards)`,
    forgeSaveNotice: 'Your progression, high score, and Steel Shards are saved automatically on this device.',
    forgeResetBtn: 'Reset Save Data',
    chronicleKicker: '6-Act Story Campaign · 16-Bit Cutscenes, 1800px Panoramas & Six Champions',
    chronicleTitle: 'Chronicle of the Heart of Steel',
    chronicleIntro: 'Each Act opens with an animated 320×240 cutscene, followed by a seamless 1800px side-scrolling gauntlet featuring 17 monster archetypes and gated walls before the Warlord duel.',
    chronicleMinionsSlainLabel: 'Foes Slain',
    chronicleZoneLabel: 'Zone',
    chronicleMinionsCount: (n) => `${n} foes`,
    chronicleArenaLabel: 'Arena',
    chronicleStatusCleared: 'Cleared',
    chronicleStatusUnlocked: 'Unlocked',
    chronicleStatusLocked: 'Locked',
    chronicleMinionsSection: 'Zone Garrison Foes (Score & Rage)',
    chronicleBossTechLabel: 'Boss Signature:',
    chronicleParryHintLabel: 'Tactical Counter:',
    chronicleNextBridgeLabel: 'Next Transition:',
    chronicleCutsceneBtn: 'Cutscene',
    chronicleEpilogueBtn: 'Epilogue',
    chronicleBossDirectBtn: 'Direct Boss Duel',
    chronicleReplayBtn: (b) => `Replay Zone + ${b}`,
    chroniclePlayBtn: (b) => `Play Zone + ${b}`,
    chronicleLockedBtn: (b) => `Defeat ${b} first`,
    chroniclePrologueKicker: 'Saga Prologue · The High-Mists in Flames',
    chroniclePrologueTitle: 'Oath Upon Tempered Steel',
    chroniclePrologueBody:
      'Under a blood-red eclipse, Sorcerer-King Drax’s legions burned Krom’s northern homeland to ash and tore the sacred Heart of Steel from its mountain shrine. Standing alone amid dying embers, Krom quenched his father’s greatsword in crimson snow and swore to fell all six Warlords.',
    chronicleWatchPrologueBtn: 'Watch Animated Intro',
    chronicleConclusionKicker: 'Heroic Finale · Return of the Dawn',
    chronicleConclusionTitle: 'Legacy of the Heart of Steel',
    chronicleConclusionBody:
      'When the shadow chains shatter upon Drax’s storm altar, a tide of pure golden dawn sweeps the eternal tempest from Valeria. Claiming neither crown nor throne, Krom restores the sacred relic to the free forges of the High-Mists and walks once more toward the northern peaks.',
    chronicleWatchConclusionBtn: 'Watch Animated Ending',
    stageNames: {
      forest: 'Ashen Glades',
      caverns: 'Crystal Caverns',
      crypt: 'Obsidian Crypts',
      arena: 'Arena of Bones',
      inferno: 'Infernal Citadel',
      sanctuary: 'Sanctuary of Drax',
    },
  },
  pt: {
    impactsLabel: 'Impacto:',
    langLabel: 'Idioma:',
    l1Button: 'L1 · GUARDA / DEFESA',
    r1Button: 'R1 · GOLPE PESADO',
    dpadLabel: 'D-PAD',
    menuBtnLabel: 'MENU (Esc)',
    menuInlineBtn: '[Botão MENU]',
    runBtnLabel: 'RUN (Enter)',
    btnCMove: 'GIRO',
    btnDMove: 'ROLAR',
    btnAMove: 'ESPADA',
    btnBMove: 'RASTEIRA',
    legendCol1Title: 'Joystick e D-Pad',
    legendCol1Body: 'Teclado WASD / ZQSD ou Setas · Cima: Salto · Baixo: Agachar',
    legendCol2Title: 'Botões A, B, C, D',
    legendCol2Body: 'A (F/Espaço): Espada · B (G): Rasteira · C (R): Decapitar · D (E): Rolar',
    legendCol3Title: 'Gatilhos L1 e R1',
    legendCol3Body: 'L1 (Shift / U): Guarda e Defesa Perfeita · R1 (T / I): Rachador',
    legendCol4Title: 'MENU, Forja e Cenas',
    legendCol4Body: 'MENU (Esc): Idioma, Guia e Soft/Gore · B/RUN: Pular cena · D: Forja',
    sidebarSystemTitle: 'Sistema Gamebuino AKA',
    sidebarStatsLine: (hp, pct, sh) => `${hp} PV · +${pct}% Aço · ${sh} Frag.`,
    sidebarRecordLine: (sc, min) => `Recorde ${sc} PTS · ${min} Inimigos`,
    sidebarHelpBody: 'Pressione MENU (Esc) ou use a barra de idiomas acima para mudar todo o jogo (FR/EN/PT/ES/IT/DE), abrir o Guia de Golpes ou ajustar os impactos Soft / Normal / Gore.',
    sidebarBtnCodex: 'Guia de Golpes e Defesas (Tela AKA)',
    sidebarBtnForge: (sh) => `Forja e Técnicas (${sh} Frag.)`,
    sidebarBtnSheets: 'Pranchas de Sprites e Cenários',
    sidebarBtnLoader: 'Ver Bootloader (/Firmware)',
    sidebarBtnGithub: 'GitHub Release e Conexão AKA',
    mobileNavBoss: 'Chefes',
    footerLeft: 'Krom: A Espada de Aço · Gamebuino AKA 320×240 Não Tátil · /Krom_Barbarian/Firmware',
    footerRight: 'Joystick · D-Pad · A/B/C/D · L1/R1 · MENU (6 Idiomas, Volumes, Pausa, Loader) · RUN',
    guideKicker: (name, hint) => `Manual de Armas · Técnica ativa: ${name} (${hint})`,
    guideTitle: 'Controles, Golpes de Espada, Defesas e Forja',
    guideBtnAkaCodex: 'Abrir na tela AKA (4 páginas)',
    guideBtnAkaForge: (sh) => `Forja na tela AKA (${sh} Frag.)`,
    guideTab1: '1. Golpes Ofensivos e Fatal',
    guideTab2: '2. Guarda, Defesas, Esquivas e Chefes',
    guideTab3: '3. Forja e Técnicas Secretas',
    guideMoves: [
      {
        title: 'Corte Alto Rápido',
        input: 'Botão A · Tecla F / Espaço',
        body: 'Golpe veloz na altura do ombro (14 de dano). Ideal para deter lacaios e atingir morcegos.',
      },
      {
        title: 'Estocada de Avanço',
        input: 'Frente + A · Tecla D/Seta + F',
        body: 'Passo à frente com estocada média de longo alcance (16 de dano). Atinge inimigos agachados.',
      },
      {
        title: 'Rasteira Baixa',
        input: 'Botão B (ou Baixo + A) · Tecla G',
        body: 'Derruba por baixo da guarda alta! Atenção: se repetir B sem parar, chefes e gladiadores saltarão por cima para contra-atacar.',
      },
      {
        title: 'Golpe Pesado Descendente',
        input: 'Gatilho R1 (ou Cima + A) · Tecla T',
        body: 'Corte vertical pesado com duas mãos (23 de dano). Com Rachador equipado, quebra a guarda alta!',
      },
    ],
    guideFatalMove: {
      title: 'Giro Decapitador 360° (Golpe Fatal)',
      input: 'Botão C (ou Trás + A) · Tecla R',
      body: 'Giro completo na altura do pescoço! Decapita instantaneamente Chefes com PV baixo ou quando a barra de Fúria dourada está cheia.',
    },
    guideDefenseCards: [
      {
        title: 'Guarda Alta e Defesa Perfeita',
        input: 'L1 · Tecla Shift / Q',
        body: 'Segurar L1 bloqueia golpes altos e médios. Pressionar L1 no impacto ativa a Defesa Perfeita, atordoando o inimigo.',
      },
      {
        title: 'Rolamento Tático Invencível',
        input: 'Botão D · Tecla E',
        body: 'Mergulha para passar pelas costas do inimigo ou recuar sem sofrer dano de golpes altos ou projéteis!',
      },
      {
        title: 'Esquiva Agachada e Salto',
        input: 'Baixo (S) · Cima (W)',
        body: 'Baixo: escapa de Cortes Altos e Giros. Cima: salta sobre Rasteiras e ondas de cristal ou lava.',
      },
      {
        title: 'Seis Chefes e IA Anti-Repetição',
        input: 'Atos I a VI',
        body: 'Thalgrim e Vorgath: salte sobre as ondas. Baelgor e Drax: role (D) pelos orbes. Varie defesas L1, estocadas e R1 em vez de repetir B!',
      },
    ],
    guideForgeWhenTitle: 'Quando e como usar a Forja no Gamebuino AKA?',
    guideForgeWhenBody: 'A Forja abre entre dois Atos e pode ser aberta a qualquer momento com o Botão D (tecla E) antes de um Chefe, após derrota ou no Menu Inicial.',
    guideActiveHudTag: 'Ativa no HUD 320×240',
    guideUnlockedTag: 'Desbloqueada',
    guideCostTag: (c) => `Forja: ${c} Frag.`,
    guideEquipBtn: 'Equipar',
    guideUnlockInForgeBtn: 'Desbloquear na Forja →',
    forgePageKicker: 'Progressão de Krom · Salvamento Local Automático',
    forgePageTitle: 'A Forja das Altas-Brumas',
    forgePageIntro: 'Gaste seus Fragmentos de Aço obtidos nas zonas muradas e contra Chefes. As melhorias aplicam-se imediatamente.',
    forgeBestScoreLabel: 'Melhor Pontuação',
    forgeHuntLabel: 'Histórico de Combate',
    forgeHuntValue: (m, b, d) => `${m} Lacaios · ${b} Chefes · ${d} Decap.`,
    forgeReturnCombatBtn: 'Voltar ao Combate',
    forgeSection1Title: '01. Atributos do Guerreiro e Têmpera do Aço',
    forgeRankLabel: (r, max) => `Nível ${r}/${max}`,
    forgeMaxMasteryBtn: 'Maestria Máxima',
    forgeBuyBtn: (c) => `Forjar (${c} Frag.)`,
    forgeSection2Title: '02. Técnicas Secretas de Espada',
    forgeCommandPrefix: 'Comando:',
    forgeActiveStyleLabel: 'Estilo ativo em combate',
    forgeEquippedBtn: 'Equipada',
    forgeLearnBtn: (c) => `Aprender (${c} Frag.)`,
    forgeSaveNotice: 'Seu progresso, recorde e Fragmentos de Aço são salvos automaticamente neste dispositivo.',
    forgeResetBtn: 'Redefinir progresso',
    chronicleKicker: 'Campanha em 6 Atos · Cenas 16-Bit, Panoramas 1800 px e Seis Campeões',
    chronicleTitle: 'A Crônica do Coração de Aço',
    chronicleIntro: 'Cada Ato começa com uma cena animada 320×240, seguida por uma travessia contínua de 1800 px com 17 tipos de monstros e grades antes do duelo contra o Chefe.',
    chronicleMinionsSlainLabel: 'Inimigos abatidos',
    chronicleZoneLabel: 'Zona',
    chronicleMinionsCount: (n) => `${n} inimigos`,
    chronicleArenaLabel: 'Arena',
    chronicleStatusCleared: 'Vencido',
    chronicleStatusUnlocked: 'Disponível',
    chronicleStatusLocked: 'Bloqueado',
    chronicleMinionsSection: 'Monstros da travessia (Pontos e Fúria)',
    chronicleBossTechLabel: 'Técnica do Chefe:',
    chronicleParryHintLabel: 'Tática recomendada:',
    chronicleNextBridgeLabel: 'Próxima transição:',
    chronicleCutsceneBtn: 'Cena',
    chronicleEpilogueBtn: 'Epílogo',
    chronicleBossDirectBtn: 'Chefe Direto',
    chronicleReplayBtn: (b) => `Rejogar Zona + ${b}`,
    chroniclePlayBtn: (b) => `Jogar Zona + ${b}`,
    chronicleLockedBtn: (b) => `Derrote ${b} primeiro`,
    chroniclePrologueKicker: 'Prólogo da Saga · As Altas-Brumas em Chamas',
    chroniclePrologueTitle: 'O Juramento sobre o Aço',
    chroniclePrologueBody:
      'Sob um eclipse escarlate, as legiões do Rei-Feiticeiro Drax reduziram a cinzas a aldeia natal de Krom e arrancaram o Coração de Aço de seu santuário ancestral. Erguendo a espada do pai entre as brasas, o Bárbaro jurou derrubar os seis Senhores da Guerra.',
    chronicleWatchPrologueBtn: 'Ver Introdução Animada',
    chronicleConclusionKicker: 'Desfecho Heroico · O Retorno da Aurora',
    chronicleConclusionTitle: 'O Legado do Coração de Aço',
    chronicleConclusionBody:
      'Quando as correntes sombrias se partem no altar de Drax, uma onda de luz dourada dissipa a tempestade eterna sobre Valéria. Sem reclamar coroa nem trono, Krom devolve a relíquia às forjas livres das Altas-Brumas e segue rumo aos picos do Norte.',
    chronicleWatchConclusionBtn: 'Ver Conclusão Animada',
    stageNames: {
      forest: 'Clareiras Cinzentas',
      caverns: 'Cavernas de Cristal',
      crypt: 'Criptas de Obsidiana',
      arena: 'Arena dos Ossos',
      inferno: 'Cidadela Infernal',
      sanctuary: 'Santuário de Drax',
    },
  },
  es: {
    impactsLabel: 'Impactos:',
    langLabel: 'Idioma:',
    l1Button: 'L1 · GUARDIA / PARADA',
    r1Button: 'R1 · MANDOBLE PESADO',
    dpadLabel: 'CRUCETA',
    menuBtnLabel: 'MENU (Esc)',
    menuInlineBtn: '[Botón MENU]',
    runBtnLabel: 'RUN (Intro)',
    btnCMove: 'TORBELLINO',
    btnDMove: 'RODAR',
    btnAMove: 'ESPADA',
    btnBMove: 'BARRIDO',
    legendCol1Title: 'Joystick y Cruceta',
    legendCol1Body: 'Teclado WASD / ZQSD o Flechas · Arriba: Salto · Abajo: Esquiva baja',
    legendCol2Title: 'Botones A, B, C, D',
    legendCol2Body: 'A (F/Espacio): Espada · B (G): Barrido · C (R): Decapitar · D (E): Rodar',
    legendCol3Title: 'Gatillos L1 y R1',
    legendCol3Body: 'L1 (Mayús / U): Guardia y Parada Perfecta · R1 (T / I): Tajo Rompeguardia',
    legendCol4Title: 'MENU, Forja y Cinemáticas',
    legendCol4Body: 'MENU (Esc): Idioma, Guía y Soft/Gore · B/RUN: Saltar · D: Forja',
    sidebarSystemTitle: 'Sistema Gamebuino AKA',
    sidebarStatsLine: (hp, pct, sh) => `${hp} PV · +${pct}% Acero · ${sh} Esq.`,
    sidebarRecordLine: (sc, min) => `Récord ${sc} PTS · ${min} Esbirros`,
    sidebarHelpBody: 'Pulsa MENU (Esc) o usa el selector superior para cambiar el idioma de todo el juego (FR/EN/PT/ES/IT/DE), abrir la Guía de Combate o ajustar impactos Soft / Normal / Gore.',
    sidebarBtnCodex: 'Guía de Golpes y Paradas (Pantalla AKA)',
    sidebarBtnForge: (sh) => `Forja y Técnicas (${sh} Esq.)`,
    sidebarBtnSheets: 'Láminas de Sprites y Escenarios',
    sidebarBtnLoader: 'Ver Bootloader (/Firmware)',
    sidebarBtnGithub: 'GitHub Release y Enlace AKA',
    mobileNavBoss: 'Jefes',
    footerLeft: 'Krom: La Espada de Acero · Gamebuino AKA 320×240 Sin Táctil · /Krom_Barbarian/Firmware',
    footerRight: 'Joystick · Cruceta · A/B/C/D · L1/R1 · MENU (6 Idiomas, Volumen, Pausa, Loader) · RUN',
    guideKicker: (name, hint) => `Manual de Armas · Técnica activa: ${name} (${hint})`,
    guideTitle: 'Controles, Golpes de Espada, Paradas y Forja',
    guideBtnAkaCodex: 'Ver en pantalla AKA (4 páginas)',
    guideBtnAkaForge: (sh) => `Forja en pantalla AKA (${sh} Esq.)`,
    guideTab1: '1. Golpes Ofensivos y Fatal',
    guideTab2: '2. Guardia, Paradas, Esquivas y Jefes',
    guideTab3: '3. Forja y Técnicas Secretas',
    guideMoves: [
      {
        title: 'Tajo Alto Veloz',
        input: 'Botón A · Tecla F / Espacio',
        body: 'Corte rápido a la altura del hombro (14 de daño). Ideal para frenar esbirros y murciélagos.',
      },
      {
        title: 'Estocada en Fondo',
        input: 'Adelante + A · Tecla D/Flecha + F',
        body: 'Paso adelante con punta media de largo alcance (16 de daño). Alcanza rivales agachados.',
      },
      {
        title: 'Barrido Bajo Segador',
        input: 'Botón B (o Abajo + A) · Tecla G',
        body: 'Derriba bajo la guardia alta. ¡Cuidado: si repites B sin parar, los jefes y gladiadores saltarán por encima para contraatacar!',
      },
      {
        title: 'Mandoble Pesado Descendente',
        input: 'Gatillo R1 (o Arriba + A) · Tecla T',
        body: 'Tajo vertical a dos manos (23 de daño). Con Tajo Rompeguardia destroza la guardia alta.',
      },
    ],
    guideFatalMove: {
      title: 'Torbellino Decapitador 360° (Golpe Fatal)',
      input: 'Botón C (o Atrás + A) · Tecla R',
      body: 'Giro completo a la altura del cuello. Decapita al instante a Jefes con PV bajo o cuando la Furia dorada está al máximo.',
    },
    guideDefenseCards: [
      {
        title: 'Guardia Alta y Parada Perfecta',
        input: 'L1 · Tecla Mayús / Q',
        body: 'Mantener L1 bloquea golpes altos y medios. Pulsar L1 justo al impacto logra una Parada Perfecta que aturde al rival.',
      },
      {
        title: 'Rodada Táctica Invencible',
        input: 'Botón D · Tecla E',
        body: 'Rueda tras la espalda del enemigo o hacia atrás atravesando sin daño tajos altos y proyectiles.',
      },
      {
        title: 'Esquiva Agachada y Salto',
        input: 'Abajo (S) · Arriba (W)',
        body: 'Abajo: esquiva Tajos Altos y Giros. Arriba: salta sobre Barridos Bajos y ondas de cristal o lava.',
      },
      {
        title: 'Seis Jefes e IA Antibarrido',
        input: 'Actos I a VI',
        body: 'Thalgrim y Vorgath: salta sus ondas bajas. Baelgor y Drax: rueda (D) a través de los orbes. ¡Alterna L1, estocadas y R1!',
      },
    ],
    guideForgeWhenTitle: '¿Cuándo y cómo usar la Forja en Gamebuino AKA?',
    guideForgeWhenBody: 'La Forja se abre entre Actos y está disponible en todo momento con el Botón D (tecla E) antes de un Jefe, tras caer o desde el Menú Inicial.',
    guideActiveHudTag: 'Activa en el HUD 320×240',
    guideUnlockedTag: 'Desbloqueada',
    guideCostTag: (c) => `Forja: ${c} Esquirlas`,
    guideEquipBtn: 'Equipar',
    guideUnlockInForgeBtn: 'Desbloquear en Forja →',
    forgePageKicker: 'Progreso de Krom · Guardado Local Automático',
    forgePageTitle: 'La Forja de las Altas Brumas',
    forgePageIntro: 'Gasta tus Esquirlas de Acero ganadas en las zonas amuralladas y contra los Jefes. Tus mejoras se aplican al instante.',
    forgeBestScoreLabel: 'Mejor Puntuación',
    forgeHuntLabel: 'Registro de Caza',
    forgeHuntValue: (m, b, d) => `${m} Esbirros · ${b} Jefes · ${d} Decap.`,
    forgeReturnCombatBtn: 'Volver al Combate',
    forgeSection1Title: '01. Atributos del Guerrero y Temple del Acero',
    forgeRankLabel: (r, max) => `Rango ${r}/${max}`,
    forgeMaxMasteryBtn: 'Maestría Máxima',
    forgeBuyBtn: (c) => `Forjar (${c} Esq.)`,
    forgeSection2Title: '02. Técnicas Secretas de Espada',
    forgeCommandPrefix: 'Comando:',
    forgeActiveStyleLabel: 'Estilo activo en combate',
    forgeEquippedBtn: 'Equipada',
    forgeLearnBtn: (c) => `Aprender (${c} Esq.)`,
    forgeSaveNotice: 'Tu progreso, récord y Esquirlas de Acero se guardan automáticamente en este dispositivo.',
    forgeResetBtn: 'Reiniciar partida guardada',
    chronicleKicker: 'Campaña en 6 Actos · Cinemáticas 16-Bit, Panoramas 1800 px y Seis Campeones',
    chronicleTitle: 'La Crónica del Corazón de Acero',
    chronicleIntro: 'Cada Acto comienza con una cinemática 320×240, seguida de una travesía continua de 1800 px con 17 tipos de monstruos y rastrillos antes del duelo contra el Jefe.',
    chronicleMinionsSlainLabel: 'Esbirros abatidos',
    chronicleZoneLabel: 'Zona',
    chronicleMinionsCount: (n) => `${n} esbirros`,
    chronicleArenaLabel: 'Arena',
    chronicleStatusCleared: 'Vencido',
    chronicleStatusUnlocked: 'Disponible',
    chronicleStatusLocked: 'Bloqueado',
    chronicleMinionsSection: 'Monstruos de la travesía (Puntos y Furia)',
    chronicleBossTechLabel: 'Técnica del Jefe:',
    chronicleParryHintLabel: 'Consejo táctico:',
    chronicleNextBridgeLabel: 'Siguiente transición:',
    chronicleCutsceneBtn: 'Cinemática',
    chronicleEpilogueBtn: 'Epílogo',
    chronicleBossDirectBtn: 'Jefe Directo',
    chronicleReplayBtn: (b) => `Rejugar Zona + ${b}`,
    chroniclePlayBtn: (b) => `Jugar Zona + ${b}`,
    chronicleLockedBtn: (b) => `Vence a ${b} primero`,
    chroniclePrologueKicker: 'Prólogo de la Saga · Las Altas Brumas en Llamas',
    chroniclePrologueTitle: 'El Juramento sobre el Acero',
    chroniclePrologueBody:
      'Bajo un eclipse escarlata, las legiones del Rey Brujo Drax redujeron a cenizas la aldea natal de Krom y arrancaron el Corazón de Acero de su santuario ancestral. Alzando el mandoble paterno entre las brasas, el Bárbaro juró abatir a los seis Señores de la Guerra.',
    chronicleWatchPrologueBtn: 'Ver Introducción Animada',
    chronicleConclusionKicker: 'Desenlace Heroico · El Regreso del Alba',
    chronicleConclusionTitle: 'El Legado del Corazón de Acero',
    chronicleConclusionBody:
      'Cuando las cadenas de sombra estallan en el altar de Drax, una ola dorada disipa la tormenta eterna sobre Valeria. Sin reclamar corona ni trono, Krom devuelve la reliquia a las fraguas libres de las Altas Brumas y retoma el sendero de las cumbres.',
    chronicleWatchConclusionBtn: 'Ver Conclusión Animada',
    stageNames: {
      forest: 'Claros Cenicientos',
      caverns: 'Cavernas de Cristal',
      crypt: 'Criptas de Obsidiana',
      arena: 'Arena de los Huesos',
      inferno: 'Ciudadela Infernal',
      sanctuary: 'Santuario de Drax',
    },
  },
  it: {
    impactsLabel: 'Impatti:',
    langLabel: 'Lingua:',
    l1Button: 'L1 · GUARDIA / PARATA',
    r1Button: 'R1 · FENDENTE PESANTE',
    dpadLabel: 'CROCE DIR.',
    menuBtnLabel: 'MENU (Esc)',
    menuInlineBtn: '[Tasto MENU]',
    runBtnLabel: 'RUN (Invio)',
    btnCMove: 'MULINETTO',
    btnDMove: 'CAPRIOLA',
    btnAMove: 'SPADA',
    btnBMove: 'SPAZZATA',
    legendCol1Title: 'Joystick e Croce Direzionale',
    legendCol1Body: 'Tastiera WASD / ZQSD o Frecce · Su: Salto · Giù: Schivata bassa',
    legendCol2Title: 'Tasti A, B, C, D',
    legendCol2Body: 'A (F/Spazio): Spada · B (G): Spazzata · C (R): Decapita · D (E): Capriola',
    legendCol3Title: 'Dorsali L1 e R1',
    legendCol3Body: 'L1 (Maiusc / U): Guardia e Parata Perfetta · R1 (T / I): Spezzaguardia',
    legendCol4Title: 'MENU, Forgia e Filmati',
    legendCol4Body: 'MENU (Esc): Lingua, Guida e Soft/Gore · B/RUN: Salta · D: Forgia',
    sidebarSystemTitle: 'Sistema Gamebuino AKA',
    sidebarStatsLine: (hp, pct, sh) => `${hp} PV · +${pct}% Acciaio · ${sh} Sch.`,
    sidebarRecordLine: (sc, min) => `Record ${sc} PT · ${min} Sgherri`,
    sidebarHelpBody: 'Premi MENU (Esc) o usa la barra lingua in alto per tradurre tutto il gioco (FR/EN/PT/ES/IT/DE), aprire la Guida Colpi e Parate o regolare gli impatti Soft / Normal / Gore.',
    sidebarBtnCodex: 'Guida Colpi e Parate (Schermo AKA)',
    sidebarBtnForge: (sh) => `Forgia e Tecniche (${sh} Sch.)`,
    sidebarBtnSheets: 'Tavole Sprite, Fondali e Animazioni',
    sidebarBtnLoader: 'Apri Bootloader (/Firmware)',
    sidebarBtnGithub: 'GitHub Release e Link AKA',
    mobileNavBoss: 'Boss',
    footerLeft: 'Krom: La Spada d’Acciaio · Gamebuino AKA 320×240 Non Touch · /Krom_Barbarian/Firmware',
    footerRight: 'Joystick · D-Pad · A/B/C/D · L1/R1 · MENU (6 Lingue, Volumi, Pausa, Loader) · RUN',
    guideKicker: (name, hint) => `Manuale d’Armi · Tecnica attiva: ${name} (${hint})`,
    guideTitle: 'Comandi, Colpi di Spada, Parate e Forgia da Campo',
    guideBtnAkaCodex: 'Mostra sullo schermo AKA (4 pagine)',
    guideBtnAkaForge: (sh) => `Forgia sullo schermo AKA (${sh} Sch.)`,
    guideTab1: '1. Colpi Offensivi e Fatale',
    guideTab2: '2. Guardia, Parate, Schivate e Boss',
    guideTab3: '3. Forgia e Tecniche Segrete',
    guideMoves: [
      {
        title: 'Taglio Alto Rapido',
        input: 'Tasto A · Tastiera F / Spazio',
        body: 'Colpo veloce ad altezza spalla (14 danni). Ideale per fermare esploratori e pipistrelli.',
      },
      {
        title: 'Affondo in Avanti',
        input: 'Avanti + A · Tastiera D/Freccia + F',
        body: 'Passo in avanti con stoccata media a lunga portata (16 danni). Colpisce anche chi è accovacciato.',
      },
      {
        title: 'Spazzata Bassa Falciante',
        input: 'Tasto B (o Giù + A) · Tastiera G',
        body: 'Colpisce sotto la guardia alta! Attenzione: se ripeti B di continuo, Boss e gladiatori salteranno sopra la lama per contrattaccare.',
      },
      {
        title: 'Fendente Pesante Verticale',
        input: 'Dorsale R1 (o Su + A) · Tastiera T',
        body: 'Colpo verticale a due mani (23 danni). Con Spezzaguardia infrange la guardia alta nemica!',
      },
    ],
    guideFatalMove: {
      title: 'Mulinetto Decapitante 360° (Colpo Fatale)',
      input: 'Tasto C (o Indietro + A) · Tastiera R',
      body: 'Rotazione completa ad altezza collo! Decapita all’istante i Boss sotto la soglia fatale o con la barra Ira dorata piena.',
    },
    guideDefenseCards: [
      {
        title: 'Guardia Alta e Parata Perfetta',
        input: 'L1 · Tastiera Maiusc / Q',
        body: 'Tenere L1 blocca i colpi alti e medi. Premere L1 all’impatto attiva una Parata Perfetta che stordisce il nemico.',
      },
      {
        title: 'Capriola Tattica Invincibile',
        input: 'Tasto D · Tastiera E',
        body: 'Passa dietro il nemico o arretra attraversando indenne tagli alti, mulinetti e globi oscuri!',
      },
      {
        title: 'Schivata Bassa e Salto',
        input: 'Giù (S) · Su (W)',
        body: 'Giù: passa sotto i Tagli Alti e i Mulinetti. Su: salta sopra le Spazzate Basse e le onde di cristallo o lava.',
      },
      {
        title: 'Sei Boss e IA Anti-Ripetizione',
        input: 'Atti da I a VI',
        body: 'Thalgrim e Vorgath: salta le onde basse. Baelgor e Drax: rotola (D) oltre i globi. Alterna L1, affondi e R1!',
      },
    ],
    guideForgeWhenTitle: 'Quando e come usare la Forgia su Gamebuino AKA?',
    guideForgeWhenBody: 'La Forgia si apre tra gli Atti ed è sempre accessibile col Tasto D (tasto E) prima dei Boss, dopo una sconfitta o dal Menu Titolo.',
    guideActiveHudTag: 'Attiva nell’HUD 320×240',
    guideUnlockedTag: 'Sbloccata',
    guideCostTag: (c) => `Forgia: ${c} Schegge`,
    guideEquipBtn: 'Equipaggia',
    guideUnlockInForgeBtn: 'Sblocca nella Forgia →',
    forgePageKicker: 'Progressione di Krom · Salvataggio Locale Automatico',
    forgePageTitle: 'La Forgia delle Alte Brume',
    forgePageIntro: 'Spendi le Schegge d’Acciaio raccolte nelle zone fortificate e contro i Boss. I potenziamenti hanno effetto immediato.',
    forgeBestScoreLabel: 'Miglior Punteggio',
    forgeHuntLabel: 'Bottino di Guerra',
    forgeHuntValue: (m, b, d) => `${m} Sgherri · ${b} Boss · ${d} Decap.`,
    forgeReturnCombatBtn: 'Torna al Combattimento',
    forgeSection1Title: '01. Attributi del Guerriero e Tempra dell’Acciaio',
    forgeRankLabel: (r, max) => `Grado ${r}/${max}`,
    forgeMaxMasteryBtn: 'Maestria Massima',
    forgeBuyBtn: (c) => `Forgia (${c} Sch.)`,
    forgeSection2Title: '02. Tecniche Segrete di Scherma',
    forgeCommandPrefix: 'Comando:',
    forgeActiveStyleLabel: 'Stile attivo in combattimento',
    forgeEquippedBtn: 'Attiva',
    forgeLearnBtn: (c) => `Apprendi (${c} Sch.)`,
    forgeSaveNotice: 'Progressi, record e Schegge d’Acciaio vengono salvati automaticamente su questo dispositivo.',
    forgeResetBtn: 'Ripristina salvataggio',
    chronicleKicker: 'Campagna in 6 Atti · Filmati 16-Bit, Panorami 1800 px e Sei Campioni',
    chronicleTitle: 'La Cronaca del Cuore d’Acciaio',
    chronicleIntro: 'Ogni Atto inizia con un filmato 320×240, seguito da una traversata continua di 1800 px con 17 tipi di mostri e saracinesche prima del duello col Boss.',
    chronicleMinionsSlainLabel: 'Sgherri abbattuti',
    chronicleZoneLabel: 'Zona',
    chronicleMinionsCount: (n) => `${n} nemici`,
    chronicleArenaLabel: 'Arena',
    chronicleStatusCleared: 'Sconfitto',
    chronicleStatusUnlocked: 'Accessibile',
    chronicleStatusLocked: 'Bloccato',
    chronicleMinionsSection: 'Mostri della traversata (Punti e Ira)',
    chronicleBossTechLabel: 'Tecnica del Boss:',
    chronicleParryHintLabel: 'Consiglio tattico:',
    chronicleNextBridgeLabel: 'Transizione successiva:',
    chronicleCutsceneBtn: 'Filmato',
    chronicleEpilogueBtn: 'Epilogo',
    chronicleBossDirectBtn: 'Boss Diretto',
    chronicleReplayBtn: (b) => `Rigioca Zona + ${b}`,
    chroniclePlayBtn: (b) => `Gioca Zona + ${b}`,
    chronicleLockedBtn: (b) => `Batti prima ${b}`,
    chroniclePrologueKicker: 'Prologo della Saga · Le Alte Brume in Fiamme',
    chroniclePrologueTitle: 'Il Giuramento sull’Acciaio',
    chroniclePrologueBody:
      'Sotto un’eclissi scarlatta, le legioni del Re Stregone Drax ridussero in cenere il villaggio natale di Krom e strapparono il Cuore d’Acciaio dal santuario ancestrale. Sollevando la spada paterna tra le braci, il Barbaro giurò di abbattere i sei Signori della Guerra.',
    chronicleWatchPrologueBtn: 'Guarda Introduzione Animata',
    chronicleConclusionKicker: 'Epilogo Eroico · Il Ritorno dell’Alba',
    chronicleConclusionTitle: 'L’Eredità del Cuore d’Acciaio',
    chronicleConclusionBody:
      'Quando le catene d’ombra si spezzano sull’altare di Drax, un’onda dorata dissolve la tempesta eterna su Valeria. Senza reclamare corona né trono, Krom restituisce la reliquia alle fucine libere delle Alte Brume e riprende la via delle vette.',
    chronicleWatchConclusionBtn: 'Guarda Conclusione Animata',
    stageNames: {
      forest: 'Radure Cineree',
      caverns: 'Caverne di Cristallo',
      crypt: 'Cripte d’Ossidiana',
      arena: 'Arena delle Ossa',
      inferno: 'Cittadella Infernale',
      sanctuary: 'Santuario di Drax',
    },
  },
  de: {
    impactsLabel: 'Treffer:',
    langLabel: 'Sprache:',
    l1Button: 'L1 · DECKUNG / PARADE',
    r1Button: 'R1 · SCHWERER SPALTER',
    dpadLabel: 'STEUERKREUZ',
    menuBtnLabel: 'MENU (Esc)',
    menuInlineBtn: '[MENU-Taste]',
    runBtnLabel: 'RUN (Enter)',
    btnCMove: 'WIRBEL',
    btnDMove: 'ROLLE',
    btnAMove: 'KLINGE',
    btnBMove: 'FEGER',
    legendCol1Title: 'Joystick & Steuerkreuz',
    legendCol1Body: 'WASD / ZQSD oder Pfeiltasten · Auf: Sprung · Ab: Tiefes Ducken',
    legendCol2Title: 'Tasten A, B, C, D',
    legendCol2Body: 'A (F/Leertaste): Hieb · B (G): Fußfeger · C (R): Enthaupten · D (E): Rolle',
    legendCol3Title: 'Schultertasten L1 & R1',
    legendCol3Body: 'L1 (Shift / U): Deckung & Perfekte Parade · R1 (T / I): Schildbrecher',
    legendCol4Title: 'MENU, Schmiede & Szenen',
    legendCol4Body: 'MENU (Esc): Sprache, Hilfe & Soft/Gore · B/RUN: Überspringen · D: Schmiede',
    sidebarSystemTitle: 'Gamebuino AKA System',
    sidebarStatsLine: (hp, pct, sh) => `${hp} LP · +${pct}% Stahl · ${sh} Splitter`,
    sidebarRecordLine: (sc, min) => `Rekord ${sc} PKT · ${min} Feinde besiegt`,
    sidebarHelpBody: 'Drücke MENU (Esc) oder wähle oben die Sprache (FR/EN/PT/ES/IT/DE), öffne das Kampfbuch oder stelle Soft / Normal / Gore ein.',
    sidebarBtnCodex: 'Kampf- & Paradehilfe (AKA-Bildschirm)',
    sidebarBtnForge: (sh) => `Schmiede & Techniken (${sh} Spl.)`,
    sidebarBtnSheets: 'Sprite-Bögen, Kulissen & Animationen',
    sidebarBtnLoader: 'SD-Bootloader öffnen (/Firmware)',
    sidebarBtnGithub: 'GitHub Release & AKA-Link',
    mobileNavBoss: 'Bosse',
    footerLeft: 'Krom: Klinge aus Stahl · Gamebuino AKA 320×240 Non-Touch · /Krom_Barbarian/Firmware',
    footerRight: 'Joystick · D-Pad · A/B/C/D · L1/R1 · MENU (6 Sprachen, Lautstärke, Pause, Loader) · RUN',
    guideKicker: (name, hint) => `Integriertes Waffenhandbuch · Aktive Technik: ${name} (${hint})`,
    guideTitle: 'Steuerung, Schwerthiebe, Paraden & Feldschmiede',
    guideBtnAkaCodex: 'Auf AKA-Bildschirm zeigen (4 Seiten)',
    guideBtnAkaForge: (sh) => `Schmiede auf AKA-Bildschirm (${sh} Spl.)`,
    guideTab1: '1. Angriffshiebe & Todesschlag',
    guideTab2: '2. Deckung, Paraden, Ausweichen & Bosse',
    guideTab3: '3. Feldschmiede & Geheimtechniken',
    guideMoves: [
      {
        title: 'Schneller Hoher Hieb',
        input: 'Taste A · Tastatur F / Leertaste',
        body: 'Rascher Schulterhieb (14 Schaden). Ideal gegen Späher und fliegende Fledermäuse.',
      },
      {
        title: 'Weiter Ausfallstich',
        input: 'Vor + A · Tastatur D/Pfeil + F',
        body: 'Vorwärtsschritt mit langem Mittelstich (16 Schaden). Trifft auch geduckte Gegner.',
      },
      {
        title: 'Tiefer Fußfeger',
        input: 'Taste B (oder Ab + A) · Tastatur G',
        body: 'Fegt unter hoher Deckung durch! Achtung: Wer B dauernd spammt, wird von Bossen und Gladiatoren übersprungen und hart gekontert.',
      },
      {
        title: 'Schwerer Überkopf-Spalter',
        input: 'Schulter R1 (oder Auf + A) · Tastatur T',
        body: 'Wuchtiger Zweihandspalter (23 Schaden). Mit Schildbrecher zerschmettert er hohe Deckung!',
      },
    ],
    guideFatalMove: {
      title: '360°-Enthauptungswirbel (Barbarian-Todesschlag)',
      input: 'Taste C (oder Zurück + A) · Tastatur R',
      body: 'Volle Drehung auf Halshöhe! Enthauptet Bosse unter der Todesschwelle oder bei voller goldener Wutleiste sofort.',
    },
    guideDefenseCards: [
      {
        title: 'Hohe Deckung & Perfekte Parade',
        input: 'L1 · Tastatur Shift / Q',
        body: 'L1 halten blockt hohe und mittlere Hiebe. L1 exakt beim Treffer löst eine Perfekte Parade aus, die betäubt und Ausdauer gibt.',
      },
      {
        title: 'Unverwundbare Taktikrolle',
        input: 'Taste D · Tastatur E',
        body: 'Rollt durch hohe Hiebe, Wirbel und Schattenorbs hindurch hinter den Gegner oder zurück!',
      },
      {
        title: 'Ducken & Angriffssprung',
        input: 'Ab (S) · Auf (W)',
        body: 'Ab: taucht unter hohen Hieben und Wirbeln weg. Auf: springt über Fußfeger sowie Kristall- und Lavawellen.',
      },
      {
        title: 'Sechs Bosse & Anti-Spam-KI',
        input: 'Akte I bis VI',
        body: 'Thalgrim & Vorgath: über Bodenwellen springen. Baelgor & Drax: durch Orbs rollen (D). Kombiniere L1, Stiche und R1!',
      },
    ],
    guideForgeWhenTitle: 'Wann und wie nutzt man die Schmiede auf dem Gamebuino AKA?',
    guideForgeWhenBody: 'Die Feldschmiede öffnet sich zwischen zwei Akten automatisch und ist jederzeit über Taste D (Taste E) vor Bossen, nach Niederlagen oder im Titelmenü erreichbar.',
    guideActiveHudTag: 'Aktiv im 320×240 HUD',
    guideUnlockedTag: 'Freigeschaltet',
    guideCostTag: (c) => `Schmiede: ${c} Splitter`,
    guideEquipBtn: 'Ausrüsten',
    guideUnlockInForgeBtn: 'In der Schmiede lernen →',
    forgePageKicker: 'Kroms Fortschritt · Automatische Lokale Speicherung',
    forgePageTitle: 'Die Schmiede von Hochnebel',
    forgePageIntro: 'Investiere Stahlsplitter aus befestigten Zonen und Bossduellen. Alle Verbesserungen wirken sofort im Kampf.',
    forgeBestScoreLabel: 'Bestpunktzahl',
    forgeHuntLabel: 'Kampfbilanz',
    forgeHuntValue: (m, b, d) => `${m} Schergen · ${b} Bosse · ${d} Enth.`,
    forgeReturnCombatBtn: 'Zurück zum Kampf',
    forgeSection1Title: '01. Kriegerattribute & Klingenhärtung',
    forgeRankLabel: (r, max) => `Stufe ${r}/${max}`,
    forgeMaxMasteryBtn: 'Maximale Meisterschaft',
    forgeBuyBtn: (c) => `Schmieden (${c} Spl.)`,
    forgeSection2Title: '02. Geheime Schwerttechniken',
    forgeCommandPrefix: 'Eingabe:',
    forgeActiveStyleLabel: 'Aktiver Kampfstil',
    forgeEquippedBtn: 'Aktiv',
    forgeLearnBtn: (c) => `Lernen (${c} Spl.)`,
    forgeSaveNotice: 'Fortschritt, Rekord und Stahlsplitter werden auf diesem Gerät automatisch gespeichert.',
    forgeResetBtn: 'Spielstand zurücksetzen',
    chronicleKicker: '6-Akte-Kampagne · 16-Bit-Szenen, 1800px-Panoramen & Sechs Champions',
    chronicleTitle: 'Die Chronik des Stahlherzens',
    chronicleIntro: 'Jeder Akt beginnt mit einer 320×240-Szene, gefolgt von einem nahtlosen 1800px-Marsch mit 17 Monsterarten und Fallgittern vor dem Bossduell.',
    chronicleMinionsSlainLabel: 'Besiegte Schergen',
    chronicleZoneLabel: 'Zone',
    chronicleMinionsCount: (n) => `${n} Feinde`,
    chronicleArenaLabel: 'Arena',
    chronicleStatusCleared: 'Besiegt',
    chronicleStatusUnlocked: 'Verfügbar',
    chronicleStatusLocked: 'Gesperrt',
    chronicleMinionsSection: 'Monster der Zone (Punkte & Wut)',
    chronicleBossTechLabel: 'Boss-Technik:',
    chronicleParryHintLabel: 'Taktik-Tipp:',
    chronicleNextBridgeLabel: 'Nächster Übergang:',
    chronicleCutsceneBtn: 'Szene',
    chronicleEpilogueBtn: 'Epilog',
    chronicleBossDirectBtn: 'Direktes Bossduell',
    chronicleReplayBtn: (b) => `Zone + ${b} wiederholen`,
    chroniclePlayBtn: (b) => `Zone + ${b} spielen`,
    chronicleLockedBtn: (b) => `Besiege zuerst ${b}`,
    chroniclePrologueKicker: 'Prolog der Saga · Hochnebel in Flammen',
    chroniclePrologueTitle: 'Der Schwur auf den Stahl',
    chroniclePrologueBody:
      'Unter einer blutroten Finsternis brannten die Legionen des Hexerkönigs Drax Kroms Heimatdorf nieder und entrissen das Stahlherz seinem Bergheiligtum. Allein zwischen glimmenden Ruinen schwor Krom auf das Schwert seines Vaters, alle sechs Kriegsherren zu fällen.',
    chronicleWatchPrologueBtn: 'Animiertes Intro ansehen',
    chronicleConclusionKicker: 'Heldenhaftes Finale · Rückkehr der Morgenröte',
    chronicleConclusionTitle: 'Das Vermächtnis des Stahlherzens',
    chronicleConclusionBody:
      'Als die Schattenketten auf Drax’ Altar zerbersten, vertreibt goldenes Morgenlicht den ewigen Sturm über Valeria. Ohne Krone oder Thron zu fordern, gibt Krom das Heiligtum den freien Schmieden von Hochnebel zurück und zieht weiter zu den Nordgipfeln.',
    chronicleWatchConclusionBtn: 'Animiertes Finale ansehen',
    stageNames: {
      forest: 'Aschelichtungen',
      caverns: 'Kristallkavernen',
      crypt: 'Obsidiangrüfte',
      arena: 'Arena der Knochen',
      inferno: 'Höllenzitadelle',
      sanctuary: 'Heiligtum von Drax',
    },
  },
};

export function getLocalizedForge(lang: LanguageCode): LocalizedForgeStrings {
  return FORGE_BY_LANG[lang] ?? FORGE_BY_LANG.fr;
}

export function getLocalizedCodex(lang: LanguageCode): LocalizedCodexStrings {
  return CODEX_BY_LANG[lang] ?? CODEX_BY_LANG.fr;
}

export function getLocalizedCutscene(
  id: CutsceneId,
  lang: LanguageCode
): LocalizedCutsceneStrings {
  const table = CUTSCENES_BY_LANG[lang] ?? CUTSCENES_BY_LANG.fr;
  return table[id] ?? CUTSCENES_BY_LANG.fr[id];
}

export function getLocalizedMinion(
  skin: MinionSkin,
  lang: LanguageCode
): LocalizedMinionStrings {
  const table = MINIONS_BY_LANG[lang] ?? MINIONS_BY_LANG.fr;
  return table[skin] ?? MINIONS_BY_LANG.fr[skin];
}

export function getLocalizedAct(
  actIndex: number,
  lang: LanguageCode
): LocalizedActStrings {
  const table = ACTS_BY_LANG[lang] ?? ACTS_BY_LANG.fr;
  const idx = Math.max(0, Math.min(table.length - 1, actIndex));
  return table[idx];
}

export function getLocalizedCombatText(lang: LanguageCode): LocalizedCombatStrings {
  return COMBAT_STRINGS_BY_LANG[lang] ?? COMBAT_STRINGS_BY_LANG.fr;
}

export function getLocalizedWebUi(lang: LanguageCode): LocalizedWebUiStrings {
  return WEB_UI_BY_LANG[lang] ?? WEB_UI_BY_LANG.fr;
}
