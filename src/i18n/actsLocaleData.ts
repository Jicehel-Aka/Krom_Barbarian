import type { LanguageCode } from '../types/game';
import type { LocalizedActStrings } from './gameContentLocale';

export const ACTS_BY_LANG: Record<LanguageCode, LocalizedActStrings[]> = {
  fr: [
    {
      title: 'ACTE I · LES CLAIRIÈRES CENDRÉES',
      regionName: 'Forêt des Monolithes',
      zoneTitle: 'TRAVERSÉE · SENTIER DES CHÊNES & RUINES',
      zoneSubtitle: 'Franchissez le pont moussu, les ruines anciennes et les deux herses jusqu’au portail runique.',
      zoneStoryIntro:
        'Sous les chênes foudroyés où flotte encore la cendre des Hautes-Brumes, Krom marche seul. Gobelins éclaireurs, loups affamés et lanciers de Gorgar tiennent les ruines moussues sur mille huit cents pas.',
      bossPreludeTitle: 'PORTAIL RUNIQUE DE GORGAR',
      bossPreludeBody:
        'Les cors sylvestres se taisent enfin. Devant l’arche de granit baignée de lueurs cyan, Gorgar le Briseur fend la brume et lève sa hache à double fer pour barrer l’accès au monde souterrain.',
      bossName: 'Gorgar le Briseur',
      bossTitle: 'Chef de Guerre des Clairières',
      bossSpecialLabel: 'Fendoir Brise-Garde & Allonge Brutale',
      tacticalHint:
        'Parez (L1) ses tailles hautes puis punissez sa récupération lente avec une Fente (▶+A).',
      bossTaunt: '« Ton glaive se brisera sur mes pierres sacrées, chien du Nord ! »',
      victoryEpilogue:
        'Gorgar s’écroule au pied des monolithes ! Les runes cyan s’écartent dans un grondement sourd, dévoilant sous les racines géantes l’escalier oublié des Cavernes de Cristal.',
      interludeTitle: 'VERS LES CAVERNES DE CRISTAL',
      interludeBody:
        'Quittant le crépuscule des bois brûlés, Krom descend sous la montagne où chantent les cascades souterraines et les géodes d’azur.',
    },
    {
      title: 'ACTE II · LES CAVERNES DE CRISTAL',
      regionName: 'Gouffre Azuré & Mines Runiques',
      zoneTitle: 'TRAVERSÉE · CASCADES, SCEAU BLEU & MINES',
      zoneSubtitle: 'Traversez les ponts souterrains, le Sceau d’Azur et les galeries minières de Thalgrim.',
      zoneStoryIntro:
        'Des cathédrales de quartz bleu plongent dans l’écume glacée. Jadis sanctuaire des maîtres-forgerons, ces galeries résonnent désormais du vol des chauves-souris géantes, des pas d’orques et des golems éveillés.',
      bossPreludeTitle: 'LA CHAMBRE GÉODIQUE',
      bossPreludeBody:
        'Au cœur de la voûte étincelante, le roi déchu Thalgrim martèle son enclume de cristal vivant. Aveuglé par l’orgueil des runes d’ombre, il jure d’ensevelir le Barbare sous la roche.',
      bossName: 'Thalgrim des Cristaux',
      bossTitle: 'Roi-Forgeron des Profondeurs',
      bossSpecialLabel: 'Onde Cristalline Basse & Marteau Runique',
      tacticalHint:
        'Sautez (▲) par-dessus son onde cristalline au sol et frappez haut contre les chauves-souris en zone !',
      bossTaunt: '« Mes cristaux éternels enseveliront ton acier mortel sous la montagne ! »',
      victoryEpilogue:
        'Le marteau runique de Thalgrim vole en mille éclats d’azur ! En se fendant, le socle géodique découvre un gouffre de basalte rougeoyant : le chemin des Cryptes d’Obsidienne.',
      interludeTitle: 'DESCENTE AUX CRYPTES D’OBSIDIENNE',
      interludeBody:
        'La brume fraîche des cascades s’évapore dans une haleine de soufre et de braise : tout en bas grondent les charniers ardents de Vorgath.',
    },
    {
      title: 'ACTE III · LES CRYPTES D’OBSIDIENNE',
      regionName: 'Nécropole Volcanique',
      zoneTitle: 'TRAVERSÉE · GEÔLES D’OS & CASCADES DE LAVE',
      zoneSubtitle: 'Brisez les herses des charniers et franchissez les ponts ardents jusqu’au billot.',
      zoneStoryIntro:
        'Ici dorment sans repos les guerriers vaincus par l’armée de Drax, enchaînés dans la pierre noire au-dessus d’un fleuve de magma. Squelettes, morts-vivants et zélotes gardent chaque pont brûlant.',
      bossPreludeTitle: 'LE PONT DU BILLOT',
      bossPreludeBody:
        'Sur l’arche centrale léchée par les cascades de lave, Vorgath le Bourreau sans visage essuie le fil de sa hache noire. Mille chaînes d’airain tintent au rythme de son pas lourd.',
      bossName: 'Vorgath le Bourreau',
      bossTitle: 'Geôlier des Cryptes Ardentes',
      bossSpecialLabel: 'Onde de Choc Magmatique au Sol',
      tacticalHint:
        'Sautez (▲) au-dessus de la vague de lave basse et évitez de bourriner B : Vorgath bondit et contre !',
      bossTaunt: '« Nul ne franchit la fosse sans laisser sa tête sur le billot ! »',
      victoryEpilogue:
        'Vorgath bascule dans l’abîme incandescent ! Les lourdes grilles des geôles cèdent enfin, libérant l’escalier de grès qui remonte vers la clameur brûlante du Colisée.',
      interludeTitle: 'L’ASCENSION VERS LE COLISÉE',
      interludeBody:
        'Après la nuit souterraine, un soleil fauve aveugle Krom : dix mille tambours saluent son arrivée au pied des remparts de l’Arène des Ossements.',
    },
    {
      title: 'ACTE IV · L’ARÈNE DES OSSEMENTS',
      regionName: 'Remparts de Siège & Colisée',
      zoneTitle: 'TRAVERSÉE · MACHINES DE SIÈGE & PORTE AU CRÂNE',
      zoneSubtitle: 'Longez les hauts remparts ocrés et forcez la garnison impériale jusqu’au sable.',
      zoneStoryIntro:
        'Sous un ciel d’or et de poussière, d’immenses tours de siège bordent la muraille impériale. Hallebardiers d’élite, orques cuirassés et gladiateurs défendent la Porte au Crâne.',
      bossPreludeTitle: 'LA PORTE AU CRÂNE DU COLISÉE',
      bossPreludeBody:
        'Les herses de bronze se lèvent sur le sable rougi par cent duels. Malakor l’Écorcheur, idole cruelle des gradins, fait tournoyer ses lames en réclamant la tête du Loup du Nord.',
      bossName: 'Malakor l’Écorcheur',
      bossTitle: 'Champion Invaincu de l’Arène',
      bossSpecialLabel: 'Roulade 360° & Enchaînements Rapides',
      tacticalHint:
        'Malakor roule dans votre dos et saute par-dessus les balayages répétés : visez la Parade Parfaite (L1) !',
      bossTaunt: '« La foule scande déjà mon nom ! Ton crâne ornera mon trône d’ivoire ! »',
      victoryEpilogue:
        'Un silence de pierre saisit le Colisée lorsque Malakor mord la poussière ! Au-delà des crêtes pourpres, la pleine lune dévoile enfin les tours noires de la Citadelle Infernale.',
      interludeTitle: 'LA ROUTE DE LA CITADELLE INFERNALE',
      interludeBody:
        'Laissant derrière lui l’arène conquise, Krom marche sous la lune blafarde vers le grand pont fortifié qui enjambe l’Abîme.',
    },
    {
      title: 'ACTE V · LA CITADELLE INFERNALE',
      regionName: 'Pont des Forteresses & Abîme',
      zoneTitle: 'TRAVERSÉE · REMPARTS NOCTURNES & VIADUC DE FEU',
      zoneSubtitle: 'Franchissez le pont fortifié sous la lune et les cages suspendues au-dessus du magma.',
      zoneStoryIntro:
        'Des remparts baignés de lune aux cages de fer suspendues sur l’abîme de feu, la route du trône n’est plus qu’un champ de bataille. Mages d’os, gardes noirs et démons ailés fondent sur Krom.',
      bossPreludeTitle: 'LA HERSE DES CAGES ARDENTES',
      bossPreludeBody:
        'Devant le portail au crâne cornu, l’Archonte Baelgor tire du brasier son espadon ardent. Dernier rempart du Sorcier-Roi, son armure même respire le feu des Abysses.',
      bossName: 'Baelgor des Braises',
      bossTitle: 'Archonte de la Citadelle Infernale',
      bossSpecialLabel: 'Orbe de Feu Infernal & Roulade Offensive',
      tacticalHint:
        'Roulez (D) à travers son orbe ardent et surveillez ses fendoirs après esquive !',
      bossTaunt: '« Les flammes de l’Abîme consumeront tes os avant le trône de Drax ! »',
      victoryEpilogue:
        'La cuirasse embrasée de Baelgor s’éteint dans la cendre noire ! Les chaînes du pont-levis se rompent, ouvrant le dernier viaduc battu par la foudre vers le Sanctuaire de Drax.',
      interludeTitle: 'LE DERNIER VIADUC DE DRAX',
      interludeBody:
        'Sous un ciel déchiré d’éclairs pourpres, Krom essuie son glaive ébréché : au bout des colonnades maudites bat le Cœur d’Acier.',
    },
    {
      title: 'ACTE VI · LE SANCTUAIRE DE DRAX',
      regionName: 'Citadelle Pourpre & Autel Noir',
      zoneTitle: 'TRAVERSÉE · VIADUC D’ORAGE & COLONNADES MAUDITES',
      zoneSubtitle: 'Traversez la tempête pourpre et terrassez la garde spectrale jusqu’au Cœur d’Acier.',
      zoneStoryIntro:
        'La foudre frappe chaque colonne du Sanctuaire cyclopéen. Spectres hurleurs, seigneurs démons et sentinelles immortelles se jettent dans la mêlée pour protéger le rituel final de Drax.',
      bossPreludeTitle: 'L’AUTEL DU CŒUR D’ACIER',
      bossPreludeBody:
        'Au centre du pentagramme d’orage où palpite le Cœur d’Acier enchaîné, le Seigneur Drax se dresse. Toute la colère des Hautes-Brumes brûle désormais sur le tranchant du glaive de Krom.',
      bossName: 'Seigneur Drax',
      bossTitle: 'Sorcier-Roi de la Couronne d’Ombre',
      bossSpecialLabel: 'Orbe d’Ombre Maudite & Fendoir Royal',
      tacticalHint:
        'Roulez (D) à travers les orbes d’ombre, parez (L1) son fendoir et achevez-le avec le Moulinet [C] !',
      bossTaunt: '« Incline-toi, mortel ! La foudre et le Cœur d’Acier m’appartiennent ! »',
      victoryEpilogue:
        'Le Sorcier-Roi s’effondre et ses chaînes d’ombre volent en éclats ! Libéré, le Cœur d’Acier embrase l’horizon d’une aube d’or pur : les clans de Valéria et des Hautes-Brumes sont libres !',
      interludeTitle: 'LÉGENDE DU CŒUR D’ACIER',
      interludeBody:
        'Des forêts cendrées à l’autel des tempêtes, le Glaive de Krom est entré à jamais dans le chant des bardes du Nord.',
    },
  ],
  en: [
    {
      title: 'ACT I · THE ASHEN GLADES',
      regionName: 'Forest of Monoliths',
      zoneTitle: 'GAUNTLET · ANCIENT OAKS & MOSSY RUINS',
      zoneSubtitle: 'Cross the mossy bridge, ruined arches, and two iron gates to reach the rune portal.',
      zoneStoryIntro:
        'Beneath lightning-scarred oaks still drifting with Highland ash, Krom walks alone. Goblin scouts, starved dire wolves, and Gorgar’s spearmen hold the mossy ruins for eighteen hundred paces.',
      bossPreludeTitle: 'GORGAR’S RUNE PORTAL',
      bossPreludeBody:
        'The woodland war horns fall silent at last. Before the cyan-lit granite arch, Gorgar the Breaker steps from the mist and hefts his twin-bladed greataxe to bar the subterranean road.',
      bossName: 'Gorgar the Breaker',
      bossTitle: 'Warlord of the Glades',
      bossSpecialLabel: 'Guard-Crushing Cleave & Heavy Reach',
      tacticalHint:
        'Timed Parry (L1) his high swings, then punish his slow recovery with a Mid Lunge (▶+A).',
      bossTaunt: '"Your blade will shatter upon my sacred stones, northern hound!"',
      victoryEpilogue:
        'Gorgar crashes down beside the monoliths! With a deep tremor, the cyan runes part beneath giant roots, unveiling the forgotten stairway to the Crystal Caverns.',
      interludeTitle: 'INTO THE CRYSTAL CAVERNS',
      interludeBody:
        'Leaving the scorched woodland dusk behind, Krom descends beneath the mountain where subterranean waterfalls and azure geodes sing.',
    },
    {
      title: 'ACT II · THE CRYSTAL CAVERNS',
      regionName: 'Azure Chasm & Runic Mines',
      zoneTitle: 'GAUNTLET · WATERFALLS, AZURE SEAL & MINES',
      zoneSubtitle: 'Cross subterranean bridges, the glowing Seal, and Thalgrim’s crystal mine shafts.',
      zoneStoryIntro:
        'Cathedrals of blue quartz plunge into icy spray. Once a sanctuary of master smiths, these galleries now echo with giant cave bats, orc marauders, and awakened runic golems.',
      bossPreludeTitle: 'THE GEODE CHAMBER',
      bossPreludeBody:
        'In the heart of the glittering vault, fallen runesmith king Thalgrim hammers his living crystal anvil. Blinded by shadow-bound pride, he vows to entomb the Barbarian in stone.',
      bossName: 'Thalgrim of the Crystals',
      bossTitle: 'Runesmith King of the Depths',
      bossSpecialLabel: 'Low Crystal Shockwave & Runic Warhammer',
      tacticalHint:
        'Jump (▲) over his floor crystal shockwave, and use high slashes against airborne cave bats!',
      bossTaunt: '"My eternal crystals will bury your mortal steel beneath the mountain!"',
      victoryEpilogue:
        'Thalgrim’s runic hammer shatters into a thousand azure shards! As the geode dais splits open, a glowing basalt chasm yawns toward the Obsidian Crypts.',
      interludeTitle: 'DESCENT TO THE OBSIDIAN CRYPTS',
      interludeBody:
        'Cool cavern mist evaporates into sulfur and ember heat: far below roar the blazing charnel pits of Vorgath.',
    },
    {
      title: 'ACT III · THE OBSIDIAN CRYPTS',
      regionName: 'Volcanic Necropolis',
      zoneTitle: 'GAUNTLET · CHARNEL CELLS & LAVA FALLS',
      zoneSubtitle: 'Shatter the prison gates and cross blazing magma bridges toward the execution block.',
      zoneStoryIntro:
        'Here the warriors broken by Drax’s host know no rest, chained in black stone above rivers of magma. Skeletons, risen dead, and obsidian zealots contest every burning bridge.',
      bossPreludeTitle: 'BRIDGE OF THE EXECUTION BLOCK',
      bossPreludeBody:
        'Upon the central arch licked by lava falls, faceless executioner Vorgath wipes his black headsman’s axe. A thousand iron chains rattle in time with his heavy stride.',
      bossName: 'Vorgath the Executioner',
      bossTitle: 'Warden of the Blazing Crypts',
      bossSpecialLabel: 'Ground Magma Shockwave',
      tacticalHint:
        'Jump (▲) cleanly over his floor magma wave — and never spam B, or Vorgath will leap and counter!',
      bossTaunt: '"None cross the pit without leaving their head upon the block!"',
      victoryEpilogue:
        'Vorgath plunges into the incandescent abyss! The prison portcullises give way at last, unlocking the sandstone stairs toward the sunlit roar of the Colosseum.',
      interludeTitle: 'ASCENT TO THE COLOSSEUM',
      interludeBody:
        'Emerging from subterranean night into fierce golden sun, Krom hears ten thousand war drums beneath the Arena of Bones.',
    },
    {
      title: 'ACT IV · ARENA OF BONES',
      regionName: 'Siege Ramparts & Colosseum',
      zoneTitle: 'GAUNTLET · SIEGE ENGINES & THE SKULL GATE',
      zoneSubtitle: 'March along sunlit siege walls and break the imperial garrison guarding the sand.',
      zoneStoryIntro:
        'Under a sky of gold and dust, towering siege engines line the imperial rampart. Elite halberdiers, armored assault orcs, and pit gladiators guard the road to the Skull Gate.',
      bossPreludeTitle: 'THE COLOSSEUM SKULL GATE',
      bossPreludeBody:
        'Bronze grates rise onto sand crimsoned by a hundred duels. Cruel crowd-idol Malakor the Flayer whirls his steel, demanding the Northern Wolf’s head.',
      bossName: 'Malakor the Flayer',
      bossTitle: 'Undefeated Champion of the Pit',
      bossSpecialLabel: '360° Combat Roll & Relentless Combos',
      tacticalHint:
        'Malakor rolls behind you and jumps repeated low sweeps: bait his flurry and land a Perfect Parry (L1)!',
      bossTaunt: '"The crowd already chants my name! Your skull will grace my ivory throne!"',
      victoryEpilogue:
        'Stone-cold silence grips the Colosseum as Malakor hits the sand! Beyond purple peaks, the full moon unveils the dark spires of the Infernal Citadel.',
      interludeTitle: 'ROAD TO THE INFERNAL CITADEL',
      interludeBody:
        'Leaving the conquered arena behind, Krom strides beneath pale moonlight onto the fortified bridge spanning the Abyss.',
    },
    {
      title: 'ACT V · THE INFERNAL CITADEL',
      regionName: 'Fortress Bridge & Abyssal Gate',
      zoneTitle: 'GAUNTLET · MOONLIT RAMPARTS & MAGMA VIADUCT',
      zoneSubtitle: 'Storm the moonlit fortress bridge and hanging iron cages above the lava chasm.',
      zoneStoryIntro:
        'From moonlit battlements to iron cages swaying over lakes of fire, the throne road is pure war. Bone pyromancers, dark sentinels, and winged Abyssal demons descend upon Krom.',
      bossPreludeTitle: 'PORTCULLIS OF BLAZING CAGES',
      bossPreludeBody:
        'Before the horned skull gate, Archon Baelgor draws his ember-forged greatsword from the brazier. Last shield of the Sorcerer-King, his very armor breathes Abyssal flame.',
      bossName: 'Baelgor of the Embers',
      bossTitle: 'Archon of the Infernal Citadel',
      bossSpecialLabel: 'Hellfire Orb & Aggressive Roll Slash',
      tacticalHint:
        'Roll (D) right through his mid-air hellfire orb and guard high against his roll-in cleave!',
      bossTaunt: '"The flames of the Abyss will turn your bones to ash before Drax’s throne!"',
      victoryEpilogue:
        'Baelgor’s fiery plate cools in black ash! The drawbridge chains snap, opening the final lightning-lashed viaduct toward Drax’s Sanctuary.',
      interludeTitle: 'THE FINAL VIADUCT OF DRAX',
      interludeBody:
        'Beneath a sky torn by crimson lightning, Krom wipes his notched greatsword: at the end of the cursed colonnade beats the Heart of Steel.',
    },
    {
      title: 'ACT VI · SANCTUARY OF DRAX',
      regionName: 'Crimson Citadel & Dark Altar',
      zoneTitle: 'GAUNTLET · STORM VIADUCT & CURSED COLONNADES',
      zoneSubtitle: 'Cleave through the crimson storm and spectral host to reclaim the Heart of Steel.',
      zoneStoryIntro:
        'Lightning lashes every pillar of the cyclopean Sanctuary. Wailing wraiths, demon lords, and undying sentinels hurl themselves forward to shield Drax’s final ritual.',
      bossPreludeTitle: 'ALTAR OF THE HEART OF STEEL',
      bossPreludeBody:
        'At the center of the storm pentagram where the chained Heart of Steel pulses, Lord Drax stands ready. All the wrath of the High-Mists burns upon Krom’s blade.',
      bossName: 'Lord Drax',
      bossTitle: 'Sorcerer-King of the Shadow Crown',
      bossSpecialLabel: 'Cursed Shadow Orb & Royal Cleave',
      tacticalHint:
        'Roll (D) through dark orbs, Perfect Parry (L1) his heavy swings, and finish him with Spin [C]!',
      bossTaunt: '"Kneel, mortal! Lightning and the Heart of Steel belong to me!"',
      victoryEpilogue:
        'The Sorcerer-King falls and his shadow chains shatter! Unbound, the Heart of Steel ignites a golden dawn across Valeria and the High-Mists — the northern clans are free!',
      interludeTitle: 'LEGEND OF THE HEART OF STEEL',
      interludeBody:
        'From ashen woods to the storm-swept altar, Krom’s Blade of Steel lives forever in the songs of the North.',
    },
  ],
  pt: [
    {
      title: 'ATO I · AS CLAREIRAS CINZENTAS',
      regionName: 'Floresta dos Monólitos',
      zoneTitle: 'TRAVESSIA · TRILHA DOS CARVALHOS E RUÍNAS',
      zoneSubtitle: 'Cruze a ponte musgosa, as ruínas antigas e duas grades até o portal rúnico.',
      zoneStoryIntro:
        'Sob carvalhos feridos por raios onde ainda paira a cinza das Altas-Brumas, Krom avança só. Goblins batedores, lobos negros e lanceiros de Gorgar guardam mil e oitocentos passos de ruínas.',
      bossPreludeTitle: 'PORTAL RÚNICO DE GORGAR',
      bossPreludeBody:
        'As trompas da mata calam-se enfim. Diante do arco iluminado por runas azuis, Gorgar o Quebrador surge da névoa e ergue seu machado duplo.',
      bossName: 'Gorgar o Quebrador',
      bossTitle: 'Senhor da Guerra das Clareiras',
      bossSpecialLabel: 'Golpe Quebra-Guarda e Alcance Brutal',
      tacticalHint:
        'Use Defesa Perfeita (L1) nos cortes altos e puna a lentidão dele com Estocada (▶+A).',
      bossTaunt: '« Sua lâmina vai quebrar em minhas pedras sagradas, cão do Norte! »',
      victoryEpilogue:
        'Gorgar tomba junto aos monólitos! As runas azuis abrem sob raízes gigantes a escadaria esquecida para as Cavernas de Cristal.',
      interludeTitle: 'RUMO ÀS CAVERNAS DE CRISTAL',
      interludeBody:
        'Deixando o crepúsculo da floresta queimada, Krom desce sob a montanha onde cantam cascatas e geodos azuis.',
    },
    {
      title: 'ATO II · AS CAVERNAS DE CRISTAL',
      regionName: 'Abismo Azul e Minas Rúnicas',
      zoneTitle: 'TRAVESSIA · CASCATAS, SELO AZUL E MINAS',
      zoneSubtitle: 'Atravesse pontes subterrâneas, o Selo Azul e as galerias de Thalgrim.',
      zoneStoryIntro:
        'Catedrais de quartzo azul mergulham na espuma gelada. Antigo santuário de mestres-ferreiros, as minas ecoam agora com morcegos gigantes, orcs e golens rúnicos.',
      bossPreludeTitle: 'A CÂMARA GEÓDICA',
      bossPreludeBody:
        'No coração da abóbada reluzente, o rei caído Thalgrim martela sua bigorna de cristal vivo, jurando sepultar o Bárbaro sob a montanha.',
      bossName: 'Thalgrim dos Cristais',
      bossTitle: 'Rei-Ferreiro das Profundezas',
      bossSpecialLabel: 'Onda Cristalina Baixa e Martelo Rúnico',
      tacticalHint:
        'Salte (▲) sobre a onda cristalina no chão e use golpes altos contra os morcegos!',
      bossTaunt: '« Meus cristais eternos sepultarão seu aço mortal sob a montanha! »',
      victoryEpilogue:
        'O martelo rúnico de Thalgrim parte-se em mil lascas azuis, revelando o poço vulcânico rumo às Criptas de Obsidiana!',
      interludeTitle: 'DESCIDA ÀS CRIPTAS DE OBSIDIANA',
      interludeBody:
        'O frescor das cascatas evapora no sopro de enxofre e brasa: lá embaixo rugem os ossários ardentes de Vorgath.',
    },
    {
      title: 'ATO III · AS CRIPTAS DE OBSIDIANA',
      regionName: 'Necrópole Vulcânica',
      zoneTitle: 'TRAVESSIA · MASMORRAS DE OSSO E CASCATAS DE LAVA',
      zoneSubtitle: 'Quebre as grades dos ossários e cruze pontes ardentes até o cepo.',
      zoneStoryIntro:
        'Aqui vagam sem paz os guerreiros vencidos por Drax, acorrentados na pedra negra sobre rios de magma. Esqueletos, zumbis e fanáticos guardam cada ponte em chamas.',
      bossPreludeTitle: 'PONTE DO CEPO DE EXECUÇÃO',
      bossPreludeBody:
        'Sobre o arco central banhado por lava, Vorgath o Carrasco sem rosto limpa o fio de seu machado negro ao som de mil correntes.',
      bossName: 'Vorgath o Carrasco',
      bossTitle: 'Carcereiro das Criptas Ardentes',
      bossSpecialLabel: 'Onda de Choque de Magma no Chão',
      tacticalHint:
        'Salte (▲) sobre a onda de lava e evite repetir B sem parar: Vorgath salta e contra-ataca!',
      bossTaunt: '« Ninguém cruza o fosso sem deixar a cabeça no cepo! »',
      victoryEpilogue:
        'Vorgath despenca no abismo em brasa! Os portões superiores cedem, abrindo a escadaria rumo ao clamor ensolarado do Coliseu.',
      interludeTitle: 'SUBIDA AO COLISEU',
      interludeBody:
        'Após a noite subterrânea, o sol dourado recebe Krom ao som de dez mil tambores diante da Arena dos Ossos.',
    },
    {
      title: 'ATO IV · A ARENA DOS OSSOS',
      regionName: 'Muralhas de Cerco e Coliseu',
      zoneTitle: 'TRAVESSIA · MÁQUINAS DE CERCO E PORTÃO DO CRÂNIO',
      zoneSubtitle: 'Percorra as muralhas douradas e rompa a guarnição imperial até a areia.',
      zoneStoryIntro:
        'Sob um céu de ouro e poeira, imensas torres de cerco ladeiam a muralha imperial. Alabardeiros de elite, orcs couraçados e gladiadores protegem o Portão do Crânio.',
      bossPreludeTitle: 'PORTÃO DO CRÂNIO DO COLISEU',
      bossPreludeBody:
        'As grades de bronze erguem-se sobre a areia rubra. Malakor o Esfolador, ídolo cruel das arquibancadas, gira suas lâminas exigindo a cabeça do Lobo do Norte.',
      bossName: 'Malakor o Esfolador',
      bossTitle: 'Campeão Invicto da Arena',
      bossSpecialLabel: 'Rolamento 360° e Combos Velozes',
      tacticalHint:
        'Malakor rola para suas costas e salta sobre rasteiras repetidas: busque a Defesa Perfeita (L1)!',
      bossTaunt: '« A multidão já grita meu nome! Seu crânio adornará meu trono! »',
      victoryEpilogue:
        'Um silêncio profundo toma o Coliseu quando Malakor tomba na areia! Além dos picos púrpura, a lua cheia revela as torres negras da Cidadela Infernal.',
      interludeTitle: 'ESTRADA DA CIDADELA INFERNAL',
      interludeBody:
        'Deixando a arena vencida para trás, Krom marcha sob o luar pálido até a grande ponte fortificada sobre o Abismo.',
    },
    {
      title: 'ATO V · A CIDADELA INFERNAL',
      regionName: 'Ponte das Fortezzas e Abismo',
      zoneTitle: 'TRAVESSIA · MURALHAS NOTURNAS E VIADUTO DE MAGMA',
      zoneSubtitle: 'Cruze a ponte fortificada sob o luar e as jaulas suspensas sobre a lava.',
      zoneStoryIntro:
        'Das muralhas banhadas pelo luar às jaulas suspensas sobre o fogo, a estrada do trono é pura guerra. Magos esqueletos, guardas negros e demônios alados atacam Krom.',
      bossPreludeTitle: 'GRADE DAS JAULAS ARDENTES',
      bossPreludeBody:
        'Diante do portão chifrudo, o Arconte Baelgor ergue do braseiro seu espadão incandescente, último escudo antes do Rei-Feiticeiro.',
      bossName: 'Baelgor das Brasas',
      bossTitle: 'Arconte da Cidadela Infernal',
      bossSpecialLabel: 'Orbe de Fogo Infernal e Rolamento Ofensivo',
      tacticalHint:
        'Role (D) através do orbe ardente e defenda os cortes pesados após o rolamento dele!',
      bossTaunt: '« As chamas do Abismo consumirão seus ossos antes do trono de Drax! »',
      victoryEpilogue:
        'A couraça em brasa de Baelgor apaga na cinza negra, abrindo o último viaduto açoitado por raios rumo ao Santuário de Drax!',
      interludeTitle: 'O ÚLTIMO VIADUTO DE DRAX',
      interludeBody:
        'Sob relâmpagos púrpura, Krom limpa sua espada marcada: no fim das colunatas malditas pulsa o Coração de Aço.',
    },
    {
      title: 'ATO VI · O SANTUÁRIO DE DRAX',
      regionName: 'Cidadela Púrpura e Altar Negro',
      zoneTitle: 'TRAVESSIA · VIADUTO DA TEMPESTADE E COLUNATAS',
      zoneSubtitle: 'Atravesse a tempestade púrpura e derrote a guarda espectral até o Coração de Aço.',
      zoneStoryIntro:
        'Raios atingem cada coluna do Santuário ciclópico. Espectros uivantes, lordes demônios e sentinelas imortais lançam-se para proteger o ritual final de Drax.',
      bossPreludeTitle: 'ALTAR DO CORAÇÃO DE AÇO',
      bossPreludeBody:
        'No centro do pentagrama da tempestade onde pulsa o Coração de Aço cativo, Lorde Drax ergue-se. Toda a ira das Altas-Brumas arde no fio da espada de Krom.',
      bossName: 'Lorde Drax',
      bossTitle: 'Rei-Feiticeiro da Coroa Sombria',
      bossSpecialLabel: 'Orbe de Sombra Maldita e Golpe Real',
      tacticalHint:
        'Role (D) pelos orbes sombrios, faça Defesa Perfeita (L1) e finalize com o Giro [C]!',
      bossTaunt: '« Ajoelhe-se, mortal! O raio e o Coração de Aço pertencem a mim! »',
      victoryEpilogue:
        'O Rei-Feiticeiro cai e suas correntes sombrias se partem! Liberto, o Coração de Aço devolve a aurora dourada a Valéria e às Altas-Brumas!',
      interludeTitle: 'LENDA DO CORAÇÃO DE AÇO',
      interludeBody:
        'Das matas cinzentas ao altar das tempestades, a Espada de Krom viverá para sempre nos cantos dos bardos do Norte.',
    },
  ],
  es: [
    {
      title: 'ACTO I · LOS CLAROS CENICIENTOS',
      regionName: 'Bosque de los Monolitos',
      zoneTitle: 'TRAVESÍA · SENDERO DE ROBLES Y RUINAS',
      zoneSubtitle: 'Cruza el puente musgoso, las ruinas antiguas y dos rastrillos hasta el portal rúnico.',
      zoneStoryIntro:
        'Bajo robles heridos por el rayo donde aún flota la ceniza de las Altas Brumas, Krom camina solo. Goblins exploradores, lobos negros y lanceros de Gorgar guardan mil ochocientos pasos.',
      bossPreludeTitle: 'PORTAL RÚNICO DE GORGAR',
      bossPreludeBody:
        'Los cuernos del bosque callan al fin. Ante el arco de granito bañado en runas cian, Gorgar el Quebrantador surge de la bruma con su hacha doble.',
      bossName: 'Gorgar el Quebrantador',
      bossTitle: 'Señor de la Guerra de los Claros',
      bossSpecialLabel: 'Tajo Rompeguardia y Alcance Brutal',
      tacticalHint:
        'Haz Parada Perfecta (L1) ante sus tajos altos y castiga su lentitud con Estocada (▶+A).',
      bossTaunt: '«¡Tu espada se romperá contra mis piedras sagradas, perro del Norte!»',
      victoryEpilogue:
        '¡Gorgar se desploma junto a los monolitos! Las runas cian se abren bajo raíces gigantes revelando la escalinata hacia las Cavernas de Cristal.',
      interludeTitle: 'HACIA LAS CAVERNAS DE CRISTAL',
      interludeBody:
        'Dejando atrás el ocaso del bosque quemado, Krom desciende bajo la montaña donde cantan cascadas y geodas azules.',
    },
    {
      title: 'ACTO II · LAS CAVERNAS DE CRISTAL',
      regionName: 'Abismo Azul y Minas Rúnicas',
      zoneTitle: 'TRAVESÍA · CASCADAS, SELLO AZUL Y MINAS',
      zoneSubtitle: 'Cruza puentes subterráneos, el Sello Azul y las galerías mineras de Thalgrim.',
      zoneStoryIntro:
        'Catedrales de cuarzo azul se hunden en la espuma helada. Antiguo santuario de maestros herreros, las galerías resuenan hoy con murciélagos gigantes, orcos y gólems rúnicos.',
      bossPreludeTitle: 'LA CÁMARA GEÓDICA',
      bossPreludeBody:
        'En el corazón de la bóveda brillante, el rey caído Thalgrim martilla su yunque de cristal vivo jurando sepultar al Bárbaro bajo la roca.',
      bossName: 'Thalgrim de los Cristales',
      bossTitle: 'Rey Herrero de las Profundidades',
      bossSpecialLabel: 'Onda Cristalina Baja y Martillo Rúnico',
      tacticalHint:
        '¡Salta (▲) sobre su onda cristalina a ras del suelo y golpea alto contra los murciélagos!',
      bossTaunt: '«¡Mis cristales eternos sepultarán tu acero mortal bajo la montaña!»',
      victoryEpilogue:
        '¡El martillo rúnico de Thalgrim estalla en mil esquirlas azules, abriendo el pozo de basalto ardiente hacia las Criptas de Obsidiana!',
      interludeTitle: 'DESCENSO A LAS CRIPTAS DE OBSIDIANA',
      interludeBody:
        'El frescor de las cascadas se evapora entre azufre y brasas: allá abajo rugen los osarios ardientes de Vorgath.',
    },
    {
      title: 'ACTO III · LAS CRIPTAS DE OBSIDIANA',
      regionName: 'Necrópolis Volcánica',
      zoneTitle: 'TRAVESÍA · CELDAS DE HUESO Y CASCADAS DE LAVA',
      zoneSubtitle: 'Rompe los rastrillos de los osarios y cruza los puentes ardientes hasta el tajo.',
      zoneStoryIntro:
        'Aquí vagan sin descanso los guerreros vencidos por Drax, encadenados en piedra negra sobre ríos de magma. Esqueletos, zombis y fanáticos defienden cada puente en llamas.',
      bossPreludeTitle: 'EL PUENTE DEL TAJO',
      bossPreludeBody:
        'Sobre el arco central lamido por cascadas de lava, Vorgath el Verdugo sin rostro limpia el filo de su hacha negra entre el clamor de mil cadenas.',
      bossName: 'Vorgath el Verdugo',
      bossTitle: 'Carcelero de las Criptas Ardientes',
      bossSpecialLabel: 'Onda de Choque Magmática Baja',
      tacticalHint:
        '¡Salta (▲) sobre la ola de lava y no abuses del barrido B: Vorgath saltará para contraatacar!',
      bossTaunt: '«¡Nadie cruza la fosa sin dejar su cabeza sobre el tajo!»',
      victoryEpilogue:
        '¡Vorgath cae al abismo incandescente! Las rejas superiores ceden al fin, abriendo la escalera de arenisca hacia el rugido soleado del Coliseo.',
      interludeTitle: 'ASCENSO AL COLISEO',
      interludeBody:
        'Tras la noche subterránea, un sol dorado recibe a Krom al ritmo de diez mil tambores ante la Arena de los Huesos.',
    },
    {
      title: 'ACTO IV · LA ARENA DE LOS HUESOS',
      regionName: 'Murallas de Asedio y Coliseo',
      zoneTitle: 'TRAVESÍA · MÁQUINAS DE ASEDIO Y PUERTA DEL CRÁNEO',
      zoneSubtitle: 'Recorre las altas murallas ocres y supera la guarnición imperial hasta la arena.',
      zoneStoryIntro:
        'Bajo un cielo de oro y polvo, enormes torres de asedio bordean la muralla imperial. Alabarderos de élite, orcos acorazados y gladiadores custodian la Puerta del Cráneo.',
      bossPreludeTitle: 'LA PUERTA DEL CRÁNEO',
      bossPreludeBody:
        'Las rejas de bronce se alzan sobre la arena teñida por cien duelos. Malakor el Desollador, ídolo cruel del graderío, reclama la cabeza del Lobo del Norte.',
      bossName: 'Malakor el Desollador',
      bossTitle: 'Campeón Invicto de la Arena',
      bossSpecialLabel: 'Rodada 360° y Combos Veloces',
      tacticalHint:
        'Malakor rueda tras tu espalda y salta los barridos repetidos: ¡busca la Parada Perfecta (L1)!',
      bossTaunt: '«¡La multitud ya corea mi nombre! ¡Tu cráneo adornará mi trono!»',
      victoryEpilogue:
        '¡Un silencio sepulcral cae sobre el Coliseo cuando Malakor muerde el polvo! Más allá de las cumbres púrpura, la luna llena revela la Ciudadela Infernal.',
      interludeTitle: 'CAMINO DE LA CIUDADELA INFERNAL',
      interludeBody:
        'Dejando atrás la arena conquistada, Krom avanza bajo la luna pálida hacia el gran puente fortificado sobre el Abismo.',
    },
    {
      title: 'ACTO V · LA CIUDADELA INFERNAL',
      regionName: 'Puente de Fortalezas y Abismo',
      zoneTitle: 'TRAVESÍA · MURALLAS NOCTURNAS Y VIADUCTO DE FUEGO',
      zoneSubtitle: 'Cruza el puente fortificado bajo la luna y las jaulas colgantes sobre el magma.',
      zoneStoryIntro:
        'Desde almenas bañadas por la luna hasta jaulas de hierro sobre el fuego, el camino al trono es guerra pura. Magos de hueso, guardias oscuros y demonios alados atacan a Krom.',
      bossPreludeTitle: 'RASTRILLO DE LAS JAULAS ARDIENTES',
      bossPreludeBody:
        'Ante el portal cornudo, el Arconte Baelgor alza del brasero su mandoble ardiente, último escudo antes del trono del Rey Brujo.',
      bossName: 'Baelgor de las Brasas',
      bossTitle: 'Arconte de la Ciudadela Infernal',
      bossSpecialLabel: 'Orbe de Fuego Infernal y Rodada Ofensiva',
      tacticalHint:
        '¡Rueda (D) a través de su orbe ardiente y cubre arriba tras sus esquivas rodadas!',
      bossTaunt: '«¡Las llamas del Abismo consumirán tus huesos antes del trono de Drax!»',
      victoryEpilogue:
        '¡La coraza ígnea de Baelgor se apaga en ceniza negra, abriendo el último viaducto azotado por rayos hacia el Santuario de Drax!',
      interludeTitle: 'EL ÚLTIMO VIADUCTO DE DRAX',
      interludeBody:
        'Bajo relámpagos púrpura, Krom limpia su espada mellada: al final de las columnatas malditas late el Corazón de Acero.',
    },
    {
      title: 'ACTO VI · EL SANTUARIO DE DRAX',
      regionName: 'Ciudadela Púrpura y Altar Negro',
      zoneTitle: 'TRAVESÍA · VIADUCTO DE TORMENTA Y COLUMNATAS',
      zoneSubtitle: 'Cruza la tormenta púrpura y vence a la guardia espectral hasta el Corazón de Acero.',
      zoneStoryIntro:
        'El rayo golpea cada columna del Santuario ciclópeo. Espectros aulladores, señores demonio y centinelas inmortales se lanzan para proteger el ritual final de Drax.',
      bossPreludeTitle: 'EL ALTAR DEL CORAZÓN DE ACERO',
      bossPreludeBody:
        'En el centro del pentagrama de tormenta donde late el Corazón de Acero cautivo, el Señor Drax aguarda. Toda la furia de las Altas Brumas arde en el acero de Krom.',
      bossName: 'Señor Drax',
      bossTitle: 'Rey Brujo de la Corona Sombría',
      bossSpecialLabel: 'Orbe de Sombra Maldita y Mandoble Real',
      tacticalHint:
        '¡Rueda (D) a través de los orbes oscuros, para (L1) su mandoble y remátalo con Torbellino [C]!',
      bossTaunt: '«¡Arrodíllate, mortal! ¡El rayo y el Corazón de Acero me pertenecen!»',
      victoryEpilogue:
        '¡El Rey Brujo cae y sus cadenas de sombra estallan! ¡Liberado, el Corazón de Acero devuelve el alba dorada a Valeria y a las Altas Brumas!',
      interludeTitle: 'LEYENDA DEL CORAZÓN DE ACERO',
      interludeBody:
        'De los bosques cenicientos al altar de las tormentas, la Espada de Krom vivirá por siempre en los cantos del Norte.',
    },
  ],
  it: [
    {
      title: 'ATTO I · LE RADURE CINEREE',
      regionName: 'Foresta dei Monoliti',
      zoneTitle: 'TRAVERSATA · SENTIERO DELLE QUERCE E ROVINE',
      zoneSubtitle: 'Supera il ponte muschioso, le rovine antiche e due saracinesche fino al portale runico.',
      zoneStoryIntro:
        'Sotto querce squarciate dai fulmini dove aleggia la cenere delle Alte Brume, Krom avanza solo. Goblin esploratori, lupi neri e lancieri di Gorgar presidiano milleottocento passi di rovine.',
      bossPreludeTitle: 'PORTALE RUNICO DI GORGAR',
      bossPreludeBody:
        'I corni del bosco tacciono infine. Davanti all’arco di granito acceso di rune ciano, Gorgar lo Spezzatore emerge dalla nebbia con la sua scure bipenne.',
      bossName: 'Gorgar lo Spezzatore',
      bossTitle: 'Signore della Guerra delle Radure',
      bossSpecialLabel: 'Fendente Spezzaguardia e Portata Brutale',
      tacticalHint:
        'Esegui una Parata Perfetta (L1) sui tagli alti e punisci la sua lentezza con un Affondo (▶+A).',
      bossTaunt: '« La tua lama si spezzerà sulle mie pietre sacre, cane del Nord! »',
      victoryEpilogue:
        'Gorgar crolla ai piedi dei monoliti! Le rune ciano si aprono sotto radici giganti svelando la scalinata dimenticata verso le Caverne di Cristallo.',
      interludeTitle: 'VERSO LE CAVERNE DI CRISTALLO',
      interludeBody:
        'Lasciato il crepuscolo del bosco bruciato, Krom scende sotto la montagna dove cantano cascate e geodi azzurri.',
    },
    {
      title: 'ATTO II · LE CAVERNE DI CRISTALLO',
      regionName: 'Abisso Azzurro e Miniere Runiche',
      zoneTitle: 'TRAVERSATA · CASCATE, SIGILLO AZZURRO E MINIERE',
      zoneSubtitle: 'Attraversa ponti sotterranei, il Sigillo Azzurro e le gallerie minerarie di Thalgrim.',
      zoneStoryIntro:
        'Cattedrali di quarzo blu sprofondano nella schiuma gelida. Antico santuario di maestri fabbri, le gallerie risuonano ora di pipistrelli giganti, orchi e golem runici.',
      bossPreludeTitle: 'LA CAMERA GEODICA',
      bossPreludeBody:
        'Nel cuore della volta lucente, il re caduto Thalgrim martella la sua incudine di cristallo vivo giurando di seppellire il Barbaro sotto la roccia.',
      bossName: 'Thalgrim dei Cristalli',
      bossTitle: 'Re-Fabbro delle Profondità',
      bossSpecialLabel: 'Onda Cristallina Bassa e Martello Runico',
      tacticalHint:
        'Salta (▲) sopra l’onda cristallina rasoterra e colpisci alto contro i pipistrelli!',
      bossTaunt: '« I miei cristalli eterni seppelliranno il tuo acciaio mortale sotto la montagna! »',
      victoryEpilogue:
        'Il martello runico di Thalgrim esplode in mille schegge azzurre, aprendo il pozzo di basalto ardente verso le Cripte d’Ossidiana!',
      interludeTitle: 'DISCESA ALLE CRIPTE D’OSSIDIANA',
      interludeBody:
        'La frescura delle cascate svanisce nel soffio di zolfo e brace: laggiù ruggiscono gli ossari ardenti di Vorgath.',
    },
    {
      title: 'ATTO III · LE CRIPTE D’OSSIDIANA',
      regionName: 'Necropoli Vulcanica',
      zoneTitle: 'TRAVERSATA · CELLE D’OSSA E CASCATE DI LAVA',
      zoneSubtitle: 'Sfondate le saracinesche degli ossari e superate i ponti ardenti fino al ceppo.',
      zoneStoryIntro:
        'Qui vagano senza pace i guerrieri piegati da Drax, incatenati nella pietra nera sopra fiumi di magma. Scheletri, non-morti e zeloti difendono ogni ponte infuocato.',
      bossPreludeTitle: 'IL PONTE DEL CEPPO',
      bossPreludeBody:
        'Sull’arco centrale lambito dalla lava, Vorgath il Carnefice senza volto pulisce la scure nera al tintinnio di mille catene.',
      bossName: 'Vorgath il Carnefice',
      bossTitle: 'Carceriere delle Cripte Ardenti',
      bossSpecialLabel: 'Onda d’Urto Magmatica a Terra',
      tacticalHint:
        'Salta (▲) sopra l’onda di lava ed evita di premere solo B: Vorgath balza e contrattacca!',
      bossTaunt: '« Nessuno supera la fossa senza lasciare la testa sul ceppo! »',
      victoryEpilogue:
        'Vorgath precipita nell’abisso incandescente! Le grate superiori cedono infine, aprendo i gradini verso il boato assolato del Colosseo.',
      interludeTitle: 'ASCESA AL COLOSSEO',
      interludeBody:
        'Dopo la notte sotterranea, un sole dorato accoglie Krom al ritmo di diecimila tamburi sotto l’Arena delle Ossa.',
    },
    {
      title: 'ATTO IV · L’ARENA DELLE OSSA',
      regionName: 'Mura d’Assedio e Colosseo',
      zoneTitle: 'TRAVERSATA · MACCHINE D’ASSEDIO E PORTA DEL TESCHIO',
      zoneSubtitle: 'Costeggia gli alti bastioni ocra e travolgi la guarnigione imperiale fino alla sabbia.',
      zoneStoryIntro:
        'Sotto un cielo d’oro e polvere, imponenti torri d’assedio fiancheggiano le mura imperiali. Alabardieri scelti, orchi corazzati e gladiatori difendono la Porta del Teschio.',
      bossPreludeTitle: 'PORTA DEL TESCHIO DEL COLOSSEO',
      bossPreludeBody:
        'Le grate di bronzo si alzano sulla sabbia arrossata da cento duelli. Malakor lo Scorticatore, idolo crudele degli spalti, reclama la testa del Lupo del Nord.',
      bossName: 'Malakor lo Scorticatore',
      bossTitle: 'Campione Imbattuto dell’Arena',
      bossSpecialLabel: 'Capriola 360° e Attacchi Rapidi',
      tacticalHint:
        'Malakor rotola alle tue spalle e salta le spazzate ripetute: cerca la Parata Perfetta (L1)!',
      bossTaunt: '« La folla acclama già il mio nome! Il tuo teschio ornerà il mio trono! »',
      victoryEpilogue:
        'Un silenzio di pietra cala sul Colosseo quando Malakor morde la sabbia! Oltre le vette purpuree, la luna piena svela la Cittadella Infernale.',
      interludeTitle: 'LA VIA DELLA CITTADELLA INFERNALE',
      interludeBody:
        'Lasciata l’arena conquistata, Krom avanza sotto la luna pallida sul grande ponte fortificato sopra l’Abisso.',
    },
    {
      title: 'ATTO V · LA CITTADELLA INFERNALE',
      regionName: 'Ponte delle Fortezze e Abisso',
      zoneTitle: 'TRAVERSATA · BASTIONI NOTTURNI E VIADOTTO DI FUOCO',
      zoneSubtitle: 'Supera il ponte fortificato sotto la luna e le gabbie sospese sopra il magma.',
      zoneStoryIntro:
        'Dai bastioni illuminati dalla luna alle gabbie di ferro sospese sul fuoco, la via del trono è pura battaglia. Maghi d’ossa, guardie nere e demoni alati piombano su Krom.',
      bossPreludeTitle: 'SARACINESCA DELLE GABBIE ARDENTI',
      bossPreludeBody:
        'Davanti al portale cornuto, l’Arconte Baelgor estrae dal braciere il suo spadone ardente, ultimo scudo prima del Re Stregone.',
      bossName: 'Baelgor delle Braci',
      bossTitle: 'Arconte della Cittadella Infernale',
      bossSpecialLabel: 'Globo di Fuoco Infernale e Capriola Offensiva',
      tacticalHint:
        'Rotola (D) attraverso il globo ardente e para in alto i suoi fendenti dopo la schivata!',
      bossTaunt: '« Le fiamme dell’Abisso consumeranno le tue ossa prima del trono di Drax! »',
      victoryEpilogue:
        'La corazza ardente di Baelgor si spegne nella cenere nera, aprendo l’ultimo viadotto battuto dai fulmini verso il Santuario di Drax!',
      interludeTitle: 'L’ULTIMO VIADOTTO DI DRAX',
      interludeBody:
        'Sotto lampi purpurei, Krom pulisce la spada segnata: in fondo ai colonnati maledetti batte il Cuore d’Acciaio.',
    },
    {
      title: 'ATTO VI · IL SANTUARIO DI DRAX',
      regionName: 'Cittadella Purpurea e Altare Nero',
      zoneTitle: 'TRAVERSATA · VIADOTTO DELLA TEMPESTA E COLONNATI',
      zoneSubtitle: 'Attraversa la tempesta purpurea e sconfiggi la guardia spettrale fino al Cuore d’Acciaio.',
      zoneStoryIntro:
        'La folgore colpisce ogni colonna del Santuario ciclopico. Spettri urlanti, signori demoni e sentinelle immortali si lanciano per difendere il rituale finale di Drax.',
      bossPreludeTitle: 'ALTARE DEL CUORE D’ACCIAIO',
      bossPreludeBody:
        'Al centro del pentagramma di tempesta dove pulsa il Cuore d’Acciaio in catene, il Signore Drax attende. Tutta l’ira delle Alte Brume brucia sulla lama di Krom.',
      bossName: 'Signore Drax',
      bossTitle: 'Re Stregone della Corona d’Ombra',
      bossSpecialLabel: 'Globo d’Ombra Maledetta e Fendente Reale',
      tacticalHint:
        'Rotola (D) oltre i globi oscuri, para (L1) il suo fendente e finiscilo col Mulinetto [C]!',
      bossTaunt: '« Inchinati, mortale! Il fulmine e il Cuore d’Acciaio mi appartengono! »',
      victoryEpilogue:
        'Il Re Stregone cade e le catene d’ombra vanno in frantumi! Liberato, il Cuore d’Acciaio riporta l’alba dorata su Valeria e sulle Alte Brume!',
      interludeTitle: 'LEGGENDA DEL CUORE D’ACCIAIO',
      interludeBody:
        'Dai boschi cinerei all’altare delle tempeste, la Spada di Krom vivrà per sempre nei canti dei bardi del Nord.',
    },
  ],
  de: [
    {
      title: 'AKT I · DIE ASCHELICHTUNGEN',
      regionName: 'Wald der Monolithen',
      zoneTitle: 'MARSCH · EICHENPFAD & MOOSRUINEN',
      zoneSubtitle: 'Überquere die Moosbrücke, alte Ruinen und zwei Fallgitter bis zum Runentor.',
      zoneStoryIntro:
        'Unter blitzgespaltenen Eichen, durch die noch Hochnebel-Asche weht, schreitet Krom allein. Goblin-Späher, Schattenwölfe und Gorgars Speerträger halten den 1800 Schritt langen Pfad.',
      bossPreludeTitle: 'GORGARS RUNENTOR',
      bossPreludeBody:
        'Die Waldhörner verstummen endlich. Vor dem blau leuchtenden Granitbogen tritt Gorgar der Brecher aus dem Nebel und hebt seine gewaltige Doppelaxt.',
      bossName: 'Gorgar der Brecher',
      bossTitle: 'Kriegsherr der Lichtungen',
      bossSpecialLabel: 'Schildbrecher-Spalter & Wuchtige Reichweite',
      tacticalHint:
        'Pariere (L1) seine hohen Hiebe perfekt und bestrafe ihn mit einem Ausfallstich (▶+A).',
      bossTaunt: '„Deine Klinge zerschellt an meinen heiligen Steinen, Nordhund!“',
      victoryEpilogue:
        'Gorgar stürzt vor den Monolithen! Unter Riesenwurzeln weichen die blauen Runen zurück und geben die vergessene Treppe in die Kristallkavernen frei.',
      interludeTitle: 'HINAB IN DIE KRISTALLKAVERNEN',
      interludeBody:
        'Hinter sich lässt Krom die verbrannten Wälder und steigt hinab, wo unterirdische Kaskaden und blaue Geoden singen.',
    },
    {
      title: 'AKT II · DIE KRISTALLKAVERNEN',
      regionName: 'Azur-Abgrund & Runenminen',
      zoneTitle: 'MARSCH · KASKADEN, AZURSIEGEL & MINEN',
      zoneSubtitle: 'Durchquere unterirdische Brücken, das blaue Siegel und Thalgrims Stollen.',
      zoneStoryIntro:
        'Kathedralen aus blauem Quarz tauchen in eisige Gischt. Einst ein Heiligtum edler Schmiede, hallen die Stollen nun wider von Riesenfledermäusen, Orks und Runengolems.',
      bossPreludeTitle: 'DIE GEODENKAMMER',
      bossPreludeBody:
        'Im Herzen des funkelnden Gewölbes schlägt der gefallene König Thalgrim auf seinen lebenden Kristallamboss und schwört, den Barbaren unter Fels zu begraben.',
      bossName: 'Thalgrim der Kristalle',
      bossTitle: 'Runenschmied-König der Tiefe',
      bossSpecialLabel: 'Tiefe Kristallwelle & Runenhammer',
      tacticalHint:
        'Springe (▲) über seine Boden-Kristallwelle und schlage hoch gegen fliegende Fledermäuse!',
      bossTaunt: '„Meine ewigen Kristalle begraben deinen sterblichen Stahl unter dem Berg!“',
      victoryEpilogue:
        'Thalgrims Runenhammer zerspringt in tausend blaue Splitter und legt den glühenden Basaltabgrund zu den Obsidiangrüften frei!',
      interludeTitle: 'ABSTIEG IN DIE OBSIDIANGRÜFTE',
      interludeBody:
        'Kühler Nebel verdampft in Schwefel und Glut: Tief unten dröhnen die brennenden Beinhäuser von Vorgath.',
    },
    {
      title: 'AKT III · DIE OBSIDIANGRÜFTE',
      regionName: 'Vulkanische Nekropole',
      zoneTitle: 'MARSCH · KNOCHENKERKER & LAVAFÄLLE',
      zoneSubtitle: 'Durchbrich die Gitter der Beinhäuser und überquere glühende Brücken zum Richtblock.',
      zoneStoryIntro:
        'Hier finden die von Drax gebrochenen Krieger keine Ruhe, angekettet über Magmaströmen. Skelette, Untote und Obsidian-Zeloten verteidigen jede glühende Brücke.',
      bossPreludeTitle: 'BRÜCKE DES RICHTBLOCKS',
      bossPreludeBody:
        'Auf dem von Lavafällen umspülten Bogen wischt der gesichtslose Henker Vorgath sein schwarzes Richtbeil, begleitet vom Rasseln tausender Ketten.',
      bossName: 'Vorgath der Henker',
      bossTitle: 'Kerkermeister der Glutgrüfte',
      bossSpecialLabel: 'Boden-Magmawelle',
      tacticalHint:
        'Springe (▲) über die Lavawelle und spamme niemals B: Vorgath springt darüber und kontert hart!',
      bossTaunt: '„Niemand überquert die Grube, ohne seinen Kopf auf dem Block zu lassen!“',
      victoryEpilogue:
        'Vorgath stürzt in den glühenden Abgrund! Die oberen Kerkerroste weichen zurück und öffnen die Stufen hinauf ins grelle Sonnenlicht des Kolosseums.',
      interludeTitle: 'AUFSTIEG ZUM KOLOSSEUM',
      interludeBody:
        'Nach der Nacht unter Tage empfängt gleißende Sonne Krom zum Dröhnen zehntausender Trommeln vor der Arena der Knochen.',
    },
    {
      title: 'AKT IV · DIE ARENA DER KNOCHEN',
      regionName: 'Belagerungsmauern & Kolosseum',
      zoneTitle: 'MARSCH · BELAGERUNGSWERKE & SCHÄDELTOR',
      zoneSubtitle: 'Marschiere längs der Sandsteinwälle und durchbrich die kaiserliche Garnison.',
      zoneStoryIntro:
        'Unter goldenem Staubhimmel säumen gewaltige Belagerungstürme den Kaiserwall. Elite-Hellebardiere, Sturm-Orks und Gladiatoren bewachen das Schädeltor.',
      bossPreludeTitle: 'DAS SCHÄDELTOR DES KOLOSSEUMS',
      bossPreludeBody:
        'Bronzegitter heben sich über blutgetränktem Sand. Malakor der Schinder, grausames Idol der Ränge, fordert wirbelnd den Kopf des Nordwolfs.',
      bossName: 'Malakor der Schinder',
      bossTitle: 'Unbesiegter Champion der Arena',
      bossSpecialLabel: '360°-Kampfrolle & Schnelle Kombos',
      tacticalHint:
        'Malakor rollt hinter dich und überspringt Dauer-Fußfeger: Kontere ihn mit Perfekter Parade (L1)!',
      bossTaunt: '„Die Menge ruft schon meinen Namen! Dein Schädel wird meinen Thron zieren!“',
      victoryEpilogue:
        'Eisige Stille fällt über das Kolosseum, als Malakor in den Sand sinkt! Hinter purpurnen Gipfeln enthüllt der Vollmond die Türme der Höllenzitadelle.',
      interludeTitle: 'WEG ZUR HÖLLENZITADELLE',
      interludeBody:
        'Die besiegte Arena im Rücken schreitet Krom im fahlen Mondlicht auf die Festungsbrücke über den Abgrund.',
    },
    {
      title: 'AKT V · DIE HÖLLENZITADELLE',
      regionName: 'Festungsbrücke & Abgrundtor',
      zoneTitle: 'MARSCH · NACHTWÄLLE & MAGMAVIADUKT',
      zoneSubtitle: 'Erstürme die mondbeschienene Brücke und die hängenden Käfige über der Lava.',
      zoneStoryIntro:
        'Von mondhellen Zinnen bis zu Eisenkäfigen über dem Feuersee ist der Thronweg reiner Krieg. Knochenmagier, dunkle Wächter und geflügelte Dämonen stürzen sich auf Krom.',
      bossPreludeTitle: 'FALLGITTER DER GLUTKÄFIGE',
      bossPreludeBody:
        'Vor dem gehörnten Schädeltor zieht Archon Baelgor sein glühendes Großschwert aus dem Feuerbecken — letzter Schild vor dem Hexerkönig.',
      bossName: 'Baelgor der Glut',
      bossTitle: 'Archon der Höllenzitadelle',
      bossSpecialLabel: 'Höllenfeuer-Orb & Roll-Spalter',
      tacticalHint:
        'Rolle (D) durch seinen feurigen Orb und blocke hoch nach seinen schnellen Vorwärtsrollen!',
      bossTaunt: '„Die Flammen des Abgrunds verzehren deine Knochen noch vor Drax’ Thron!“',
      victoryEpilogue:
        'Baelgors Glutpanzer erlischt in schwarzer Asche und gibt das letzte blitzgepeitschte Viadukt zu Drax’ Heiligtum frei!',
      interludeTitle: 'DAS LETZTE VIADUKT VON DRAX',
      interludeBody:
        'Unter purpurnen Blitzen wischt Krom seine schartige Klinge ab: Am Ende der Fluchkolonnaden schlägt das Stahlherz.',
    },
    {
      title: 'AKT VI · DAS HEILIGTUM VON DRAX',
      regionName: 'Purpurzitadelle & Schwarzer Altar',
      zoneTitle: 'MARSCH · STURMVIADUKT & FLUCHKOLONNADEN',
      zoneSubtitle: 'Durchschlage den Purpursturm und die Geistergarde bis zum Stahlherz.',
      zoneStoryIntro:
        'Blitze peitschen jede Säule des zyklopischen Heiligtums. Heulende Gespenster, Dämonenfürsten und unsterbliche Wächter werfen sich Krom verzweifelt entgegen.',
      bossPreludeTitle: 'ALTAR DES STAHLHERZENS',
      bossPreludeBody:
        'Im Zentrum des Sturmpentagramms, wo das gefesselte Stahlherz pulsiert, erhebt sich Fürst Drax.Aller Zorn von Hochnebel brennt nun auf Kroms Klinge.',
      bossName: 'Fürst Drax',
      bossTitle: 'Hexerkönig der Schattenkrone',
      bossSpecialLabel: 'Schattenfluch-Orb & Königsspalter',
      tacticalHint:
        'Rolle (D) durch Schattenorbs, pariere (L1) seinen Spalter und vollende mit dem Wirbel [C]!',
      bossTaunt: '„Knie nieder, Sterblicher! Blitz und Stahlherz gehören mir allein!“',
      victoryEpilogue:
        'Der Hexerkönig fällt und seine Schattenketten bersten! Befreit entzündet das Stahlherz eine goldene Morgenröte über Valeria und Hochnebel!',
      interludeTitle: 'LEGENDE DES STAHLHERZENS',
      interludeBody:
        'Von den Aschewäldern bis zum Sturmaltar lebt Kroms Klinge aus Stahl für immer in den Liedern des Nordens.',
    },
  ],
};
