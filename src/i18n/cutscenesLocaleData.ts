import type { CutsceneId, LanguageCode } from '../types/game';
import type { LocalizedCutsceneStrings } from './gameContentLocale';

export const CUTSCENES_BY_LANG: Record<
  LanguageCode,
  Record<CutsceneId, LocalizedCutsceneStrings>
> = {
  fr: {
    act1_opening: {
      title: 'PROLOGUE · LE SERMENT DES HAUTES-BRUMES',
      skipBadge: '[B/RUN] PASSER',
      shots: [
        {
          speakerName: 'CHANT DES ANCIENS',
          text: 'Jadis, sous les chênes d’argent des Hautes-Brumes, le Cœur d’Acier veillait en paix, forgé dans une étoile tombée au premier âge des rois.',
        },
        {
          speakerName: 'CHRONIQUE DU NORD',
          text: 'Mais quand la lune vira au sang, la horde de Gorgar livra les foyers aux flammes, profana l’autel et emporta la princesse Valéria enchaînée vers l’ombre.',
        },
        {
          speakerName: 'KROM LE BARBARE',
          text: 'Seul debout dans la cendre tiède des siens, Krom lève le glaive ancestral : « Par les mânes du Nord, ni pierre ni démon ne garderont Valéria captive ! »',
        },
        {
          speakerName: 'GOBELIN ÉCLAIREUR',
          text: 'Déjà les cors gobelins déchirent la brume matinale : « Un survivant marche sur le pont moussu ! Lâchez les loups noirs avant l’arche de Gorgar ! »',
        },
      ],
    },
    boss1_intro: {
      title: 'FACE-À-FACE · L’ARCHE DE GORGAR',
      skipBadge: '[B/RUN] COMBATTRE',
      shots: [
        {
          speakerName: 'GORGAR LE BRISEUR',
          text: '« Tu arrives trop tard, loup solitaire ! Le convoi de Drax a déjà franchi les racines du monde, et ma hache boira ton sang sur ces pierres ! »',
        },
        {
          speakerName: 'KROM',
          text: '« Chaque cendre de mon village réclame justice, Gorgar. Ouvre ce portail ou tombe devant lui ! »',
        },
      ],
    },
    act2_opening: {
      title: 'ACTE II · LES LARMES DE QUARTZ',
      skipBadge: '[B/RUN] PASSER',
      shots: [
        {
          speakerName: 'CHRONIQUE',
          text: 'Sous l’arche vaincue de Gorgar s’enfonce un escalier oublié des hommes. Un pan déchiré du manteau de Valéria accroché au roc guide Krom vers l’abîme d’azur.',
        },
        {
          speakerName: 'ORQUE MARAUDEUR',
          text: '« L’homme du Nord suit la trace de la captive ! Éveillez les golems du Sceau Bleu et lâchez les nuées noires des voûtes ! »',
        },
        {
          speakerName: 'THALGRIM DES CRISTAUX',
          text: 'Jadis roi-forgeron respecté, Thalgrim a vendu son serment à Drax contre l’immortalité froide du cristal vivant qui chante sous son marteau…',
        },
      ],
    },
    boss2_intro: {
      title: 'FACE-À-FACE · LA CHAMBRE GÉODIQUE',
      skipBadge: '[B/RUN] COMBATTRE',
      shots: [
        {
          speakerName: 'THALGRIM',
          text: '« La chair vieillit et trahit, guerrier, mais le quartz demeure éternel ! Deviens statue de givre dans ma galerie royale ! »',
        },
        {
          speakerName: 'KROM',
          text: '« Un roi qui livre des innocents aux fers n’est plus qu’un geôlier de pierre. En garde, Thalgrim ! »',
        },
      ],
    },
    act3_opening: {
      title: 'ACTE III · LE FLEUVE DES ÂMES ENCHAÎNÉES',
      skipBadge: '[B/RUN] PASSER',
      shots: [
        {
          speakerName: 'CHRONIQUE',
          text: 'La fraîcheur des eaux bleues meurt dans un souffle de soufre et de braise. Sous la montagne s’étendent les Cryptes où gémissent mille vaincus.',
        },
        {
          speakerName: 'FANATIQUE D’OBSIDIENNE',
          text: '« Par le masque de fer de Vorgath, ouvrez les fosses ardentes ! Que les morts sans repos engloutissent ce porteur d’acier ! »',
        },
        {
          speakerName: 'VORGATH LE BOURREAU',
          text: 'Sur l’arche battue par les vagues de lave, Vorgath le Sans-Visage caresse le fil de son couperet rougi par cent royaumes brisés…',
        },
      ],
    },
    boss3_intro: {
      title: 'FACE-À-FACE · LE PONT DU BILLOT',
      skipBadge: '[B/RUN] COMBATTRE',
      shots: [
        {
          speakerName: 'VORGATH',
          text: '« J’ai vu passer la fille des Brumes en larmes vers le Colisée… mais toi, barbare, ta route s’achève sur mon billot de basalte ! »',
        },
        {
          speakerName: 'KROM',
          text: '« Tes paroles viennent de sceller ton sort, bourreau. La lave engloutira ton masque et tes chaînes ! »',
        },
      ],
    },
    act4_opening: {
      title: 'ACTE IV · LES REMPARTS DU SANG-SABLE',
      skipBadge: '[B/RUN] PASSER',
      shots: [
        {
          speakerName: 'CHRONIQUE',
          text: 'Émergé des ténèbres volcaniques sous un ciel d’ocre embrasé, Krom découvre les titanesques murailles du Colisée Impérial battues par les tambours.',
        },
        {
          speakerName: 'GARDE HALLEBARDIER',
          text: '« C’est le loup des Hautes-Brumes qui a brisé Vorgath ! Formez le mur d’acier devant la Porte au Crâne et lâchez les fauves de la fosse ! »',
        },
        {
          speakerName: 'MALAKOR L’ÉCORCHEUR',
          text: 'Seul chemin vers le pont de la Citadelle : traverser le sable rouge où règne Malakor, prince déchu ivre d’ovations et de duels à mort.',
        },
      ],
    },
    boss4_intro: {
      title: 'FACE-À-FACE · JUGEMENT DU COLISÉE',
      skipBadge: '[B/RUN] COMBATTRE',
      shots: [
        {
          speakerName: 'MALAKOR',
          text: '« Entends-tu rugir cent mille gorges, barbare ? Cent rois ont mordu cette poussière sous mon épée dentelée — offre-leur un beau trépas ! »',
        },
        {
          speakerName: 'KROM',
          text: '« Garde tes saluts pour les gradins, cabotin d’or. Mon glaive ne danse pas : il tranche ! »',
        },
      ],
    },
    act5_opening: {
      title: 'ACTE V · LE PONT DES LÉGIONS MAUDITES',
      skipBadge: '[B/RUN] PASSER',
      shots: [
        {
          speakerName: 'CHRONIQUE',
          text: 'Le silence tombe sur le Colisée vaincu tandis que se lève une lune blafarde. Devant Krom s’étire le pont nocturne menant aux tours de braise.',
        },
        {
          speakerName: 'MAGE SQUELETTE',
          text: '« Le rituel du Seigneur Drax approche de son terme ! Démons des Abysses, embrasez le viaduc avant que cet homme n’atteigne la herse ! »',
        },
        {
          speakerName: 'BAELGOR DES BRAISES',
          text: 'Sous les cages de fer suspendues au magma veille l’Archonte Baelgor, général immortel dont l’armure bat du feu même des Enfers…',
        },
      ],
    },
    boss5_intro: {
      title: 'FACE-À-FACE · LA PORTE DES BRAISES',
      skipBadge: '[B/RUN] COMBATTRE',
      shots: [
        {
          speakerName: 'BAELGOR',
          text: '« Quatre champions sont tombés sous ta lame, mortel, mais l’acier humain fond devant le souffle de l’Abîme ! »',
        },
        {
          speakerName: 'KROM',
          text: '« Mon cœur brûle d’un feu plus ancien que tes forges, Baelgor. Livre-moi le passage vers Drax ! »',
        },
      ],
    },
    act6_opening: {
      title: 'ACTE VI · LA COURONNE D’OMBRE ET DE FOUDRE',
      skipBadge: '[B/RUN] PASSER',
      shots: [
        {
          speakerName: 'CHRONIQUE',
          text: 'Blessé mais indomptable, Krom franchit le dernier viaduc cyclopéen. Le ciel se fend d’éclairs violets au-dessus du Sanctuaire interdit.',
        },
        {
          speakerName: 'SENTINELLE SPECTRALE',
          text: '« Les spectres des rois déchus gardent ces colonnades ! Nulle âme vivante ne troublera les noces d’ombre du Seigneur Drax ! »',
        },
        {
          speakerName: 'SEIGNEUR DRAX',
          text: '« Contemple ton impuissance, fils des Brumes ! Dès que sonnera minuit, le souffle de Valéria scellera le Cœur d’Acier à ma couronne pour l’éternité ! »',
        },
      ],
    },
    boss6_intro: {
      title: 'ULTIME DUEL · LE JUGEMENT DE L’ACIER',
      skipBadge: '[B/RUN] COMBATTRE',
      shots: [
        {
          speakerName: 'SEIGNEUR DRAX',
          text: '« À genoux devant un dieu naissant ! La foudre, les morts et la nuit obéissent à ma voix — que pèse une simple lame de fer ? »',
        },
        {
          speakerName: 'KROM',
          text: '« Elle porte la mémoire d’un peuple libre et l’amour d’un serment invaincu. En garde, Drax ! »',
        },
      ],
    },
    campaign_ending: {
      title: 'ÉPILOGUE · LE CHANT DE L’AUBE RETROUVÉE',
      skipBadge: '[B/RUN] TERMINER',
      shots: [
        {
          speakerName: 'CHRONIQUE',
          text: 'Fendu par l’ultime revers de Krom, le glaive maudit de Drax vole en éclats ! Sa couronne d’ombre roule sur la dalle tandis que s’écroule son trône.',
        },
        {
          speakerName: 'KROM & VALÉRIA',
          text: 'D’un coup franc, Krom brise les chaînes d’obsidienne de Valéria. Entre leurs mains réunies, le Cœur d’Acier rejette la nuit et chante d’une lueur pure !',
        },
        {
          speakerName: 'CHRONIQUE DU RETOUR',
          text: 'Les nuées pourpres s’effacent devant l’aurore. Sur le chemin du retour, les brasiers maudits s’éteignent et le vent tiède éveille les bourgeons d’argent.',
        },
        {
          speakerName: 'LÉGENDE DES HAUTES-BRUMES',
          text: 'Les foyers du Nord renaissent autour de Valéria et de son libérateur. Tant que brilleront les étoiles d’hiver, les bardes chanteront Krom et le Glaive d’Acier !',
        },
      ],
    },
  },
  en: {
    act1_opening: {
      title: 'PROLOGUE · OATH OF THE HIGH-MISTS',
      skipBadge: '[B/RUN] SKIP',
      shots: [
        {
          speakerName: 'SONG OF THE ELDERS',
          text: 'Long ago beneath the silver oaks of High-Mists, the Heart of Steel shone in peace, forged from a fallen star in the first age of kings.',
        },
        {
          speakerName: 'NORTHERN CHRONICLE',
          text: 'Yet under a blood-red moon, Gorgar’s warband burned the hearths, defiled the shrine, and dragged Princess Valeria in chains toward the shadowlands.',
        },
        {
          speakerName: 'KROM THE BARBARIAN',
          text: 'Standing alone in the warm ashes of his kin, Krom raises his father’s greatsword: "By the spirits of the North, neither stone nor demon shall keep Valeria bound!"',
        },
        {
          speakerName: 'GOBLIN SCOUT',
          text: 'Already goblin horns tear the morning mist: "A lone survivor strides onto the mossy bridge! Unleash the dire wolves before Gorgar’s arch!"',
        },
      ],
    },
    boss1_intro: {
      title: 'SHOWDOWN · GORGAR’S RUNE ARCH',
      skipBadge: '[B/RUN] FIGHT',
      shots: [
        {
          speakerName: 'GORGAR THE BREAKER',
          text: '"You come too late, lone wolf! Drax’s caravan has already passed beneath the roots of the world, and my axe will drink your blood on these stones!"',
        },
        {
          speakerName: 'KROM',
          text: '"Every ash of my village cries out for justice, Gorgar. Open this portal or fall before it!"',
        },
      ],
    },
    act2_opening: {
      title: 'ACT II · TEARS OF LIVING QUARTZ',
      skipBadge: '[B/RUN] SKIP',
      shots: [
        {
          speakerName: 'CHRONICLE',
          text: 'Beyond Gorgar’s fallen arch winds a stairway forgotten by men. A torn ribbon from Valeria’s cloak guides Krom down into the azure chasm.',
        },
        {
          speakerName: 'ORC MARAUDER',
          text: '"The northern swordsman tracks the captive! Awaken the golems of the Blue Seal and loose the cave swarms from the vaults!"',
        },
        {
          speakerName: 'THALGRIM OF THE CRYSTALS',
          text: 'Once an honored smith-king, Thalgrim sold his oath to Drax for the cold immortality of living crystal ringing beneath his runic hammer…',
        },
      ],
    },
    boss2_intro: {
      title: 'SHOWDOWN · THE GEODE CHAMBER',
      skipBadge: '[B/RUN] FIGHT',
      shots: [
        {
          speakerName: 'THALGRIM',
          text: '"Flesh withers and betrays, warrior, yet quartz endures forever! Stand frozen as a trophy in my royal gallery!"',
        },
        {
          speakerName: 'KROM',
          text: '"A king who trades the innocent into chains is naught but a jailer of stone. Raise your hammer, Thalgrim!"',
        },
      ],
    },
    act3_opening: {
      title: 'ACT III · RIVER OF CHAINED SOULS',
      skipBadge: '[B/RUN] SKIP',
      shots: [
        {
          speakerName: 'CHRONICLE',
          text: 'The cool spray of waterfalls dies into sulfur and ash. Deep beneath the mountain stretch the Obsidian Crypts where a thousand captives groan.',
        },
        {
          speakerName: 'OBSIDIAN ZEALOT',
          text: '"By Vorgath’s iron mask, unseal the charnel pits! Let the restless dead drown this bearer of steel in black fire!"',
        },
        {
          speakerName: 'VORGATH THE HEADSMAN',
          text: 'Upon the bridge lashed by magma waves, faceless Vorgath tests the edge of a headsman’s axe stained by a hundred broken realms…',
        },
      ],
    },
    boss3_intro: {
      title: 'SHOWDOWN · THE EXECUTIONER’S BRIDGE',
      skipBadge: '[B/RUN] FIGHT',
      shots: [
        {
          speakerName: 'VORGATH',
          text: '"I watched the maiden of the Mists pass in chains toward the Coliseum… yet your march ends here upon my basalt block!"',
        },
        {
          speakerName: 'KROM',
          text: '"Your own words have sealed your doom, headsman. The magma will swallow your mask and your chains alike!"',
        },
      ],
    },
    act4_opening: {
      title: 'ACT IV · RAMPARTS OF BLOOD AND SAND',
      skipBadge: '[B/RUN] SKIP',
      shots: [
        {
          speakerName: 'CHRONICLE',
          text: 'Rising from volcanic night beneath a blazing ochre sky, Krom beholds the towering siege walls of the Imperial Coliseum thundering with war drums.',
        },
        {
          speakerName: 'IMPERIAL HALBERDIER',
          text: '"It is the wolf of High-Mists who slew Vorgath! Lock halberds before the Skull Gate and unleash the pit gladiators!"',
        },
        {
          speakerName: 'MALAKOR THE FLAYER',
          text: 'Only one road leads to the Citadel bridge: across the crimson sand ruled by Malakor, a fallen prince drunk on glory and bloodsport.',
        },
      ],
    },
    boss4_intro: {
      title: 'SHOWDOWN · JUDGMENT OF THE ARENA',
      skipBadge: '[B/RUN] FIGHT',
      shots: [
        {
          speakerName: 'MALAKOR',
          text: '"Do you hear a hundred thousand throats roar, barbarian? A hundred kings bit this dust beneath my serrated blade — grant them a worthy death!"',
        },
        {
          speakerName: 'KROM',
          text: '"Save your bows for the bleachers, gilded butcher. My blade does not dance — it cleaves!"',
        },
      ],
    },
    act5_opening: {
      title: 'ACT V · BRIDGE OF CURSED LEGIONS',
      skipBadge: '[B/RUN] SKIP',
      shots: [
        {
          speakerName: 'CHRONICLE',
          text: 'Silence falls upon the conquered Coliseum as a pale moon rises. Ahead stretches the fortress viaduct toward towers of living ember.',
        },
        {
          speakerName: 'SKELETON MAGE',
          text: '"Lord Drax’s ritual nears midnight! Demons of the Abyss, set the viaduct ablaze before this mortal reaches the portcullis!"',
        },
        {
          speakerName: 'BAELGOR OF THE EMBERS',
          text: 'Beneath iron cages hung above the lava stands Archon Baelgor, immortal general whose armor beats with the very fire of Hell…',
        },
      ],
    },
    boss5_intro: {
      title: 'SHOWDOWN · GATE OF BURNING CAGES',
      skipBadge: '[B/RUN] FIGHT',
      shots: [
        {
          speakerName: 'BAELGOR',
          text: '"Four warlords have fallen to your sword, mortal, yet human steel melts before the breath of the Abyss!"',
        },
        {
          speakerName: 'KROM',
          text: '"My heart burns with a fire older than your infernal forges, Baelgor. Yield the road to Drax!"',
        },
      ],
    },
    act6_opening: {
      title: 'ACT VI · CROWN OF SHADOW AND THUNDER',
      skipBadge: '[B/RUN] SKIP',
      shots: [
        {
          speakerName: 'CHRONICLE',
          text: 'Scarred yet unbroken, Krom crosses the final cyclopean viaduct as purple lightning splits the heavens above the forbidden Sanctuary.',
        },
        {
          speakerName: 'SPECTRAL SENTINEL',
          text: '"Wraiths of fallen kings guard these colonnades! No living soul shall disturb Lord Drax’s dark rite!"',
        },
        {
          speakerName: 'LORD DRAX',
          text: '"Behold your helplessness, son of the Mists! At the stroke of midnight, Valeria’s life-breath binds the Heart of Steel to my crown forever!"',
        },
      ],
    },
    boss6_intro: {
      title: 'FINAL DUEL · JUDGMENT OF STEEL',
      skipBadge: '[B/RUN] FIGHT',
      shots: [
        {
          speakerName: 'LORD DRAX',
          text: '"Kneel before a rising god! Lightning, the dead, and the night obey my voice — what is one mortal blade against eternity?"',
        },
        {
          speakerName: 'KROM',
          text: '"It carries the memory of a free people and an unbroken oath. On guard, Drax!"',
        },
      ],
    },
    campaign_ending: {
      title: 'EPILOGUE · SONG OF THE RESTORED DAWN',
      skipBadge: '[B/RUN] FINISH',
      shots: [
        {
          speakerName: 'CHRONICLE',
          text: 'Shattered by Krom’s final backhand cleave, Drax’s cursed greatsword bursts into fragments as his shadow crown rolls across the cracked altar!',
        },
        {
          speakerName: 'KROM & VALERIA',
          text: 'With one clean stroke, Krom severs Valeria’s obsidian chains. Held between their united hands, the Heart of Steel casts off the night and sings with pure gold!',
        },
        {
          speakerName: 'CHRONICLE OF RETURN',
          text: 'Purple stormclouds part before the first dawn. Along the homeward trail, cursed braziers fade and a warm wind awakens silver buds upon the oaks.',
        },
        {
          speakerName: 'LEGEND OF HIGH-MISTS',
          text: 'The hearths of the North rise anew around Valeria and her liberator. Long as winter stars shine, bards shall sing of Krom and the Blade of Steel!',
        },
      ],
    },
  },
  pt: {
    act1_opening: {
      title: 'PRÓLOGO · O JURAMENTO DAS ALTAS-BRUMAS',
      skipBadge: '[B/RUN] PULAR',
      shots: [
        {
          speakerName: 'CANTO DOS ANCIÃOS',
          text: 'Outrora, sob os carvalhos prateados das Altas-Brumas, o Coração de Aço brilhava em paz, forjado de uma estrela caída na primeira era dos reis.',
        },
        {
          speakerName: 'CRÔNICA DO NORTE',
          text: 'Mas sob a lua de sangue, a horda de Gorgar incendiou os lares, profanou o altar e levou a princesa Valéria acorrentada rumo às sombras.',
        },
        {
          speakerName: 'KROM O BÁRBARO',
          text: 'Sozinho entre as cinzas mornas de seu povo, Krom ergue a espada ancestral: «Pelos espíritos do Norte, nem pedra nem demônio manterão Valéria cativa!»',
        },
        {
          speakerName: 'GOBLIN BATEDOR',
          text: 'Já as trompas goblins rasgam a neblina: «Um sobrevivente avança pela ponte musgosa! Soltem os lobos negros antes do arco de Gorgar!»',
        },
      ],
    },
    boss1_intro: {
      title: 'CONFRONTO · O ARCO DE GORGAR',
      skipBadge: '[B/RUN] LUTAR',
      shots: [
        {
          speakerName: 'GORGAR O QUEBRADOR',
          text: '«Chegas tarde demais, lobo solitário! A escolta de Drax já desceu sob as raízes do mundo, e meu machado beberá teu sangue!»',
        },
        {
          speakerName: 'KROM',
          text: '«Cada cinza da minha aldeia clama por justiça, Gorgar. Abre este portal ou cai diante dele!»',
        },
      ],
    },
    act2_opening: {
      title: 'ATO II · AS LÁGRIMAS DE QUARTZO',
      skipBadge: '[B/RUN] PULAR',
      shots: [
        {
          speakerName: 'CRÔNICA',
          text: 'Além do arco vencido de Gorgar desce uma escadaria esquecida. Um pedaço rasgado do manto de Valéria guia Krom ao abismo azul.',
        },
        {
          speakerName: 'ORC SAQUEADOR',
          text: '«O guerreiro do Norte segue o rastro da cativa! Despertem os golens do Selo Azul e soltem os morcegos das abóbadas!»',
        },
        {
          speakerName: 'THALGRIM DOS CRISTAIS',
          text: 'Outrora rei-ferreiro honrado, Thalgrim vendeu sua honra a Drax pela fria imortalidade do cristal vivo que ressoa sob seu martelo…',
        },
      ],
    },
    boss2_intro: {
      title: 'CONFRONTO · A CÂMARA GEÓDICA',
      skipBadge: '[B/RUN] LUTAR',
      shots: [
        {
          speakerName: 'THALGRIM',
          text: '«A carne envelhece e trai, guerreiro, mas o quartzo é eterno! Torna-te estátua de gelo em minha galeria real!»',
        },
        {
          speakerName: 'KROM',
          text: '«Um rei que entrega inocentes aos grilhões não passa de um carcereiro de pedra. Em guarda, Thalgrim!»',
        },
      ],
    },
    act3_opening: {
      title: 'ATO III · O RIO DAS ALMAS ACORRENTADAS',
      skipBadge: '[B/RUN] PULAR',
      shots: [
        {
          speakerName: 'CRÔNICA',
          text: 'O frescor das cascatas morre num sopro de enxofre e brasa. Sob a montanha estendem-se as Criptas onde gemem mil cativos.',
        },
        {
          speakerName: 'FANÁTICO DE OBSIDIANA',
          text: '«Pela máscara de ferro de Vorgath, abram os fossos ardentes! Que os mortos sem descanso afoguem este portador de aço!»',
        },
        {
          speakerName: 'VORGATH O CARRASCO',
          text: 'Sobre a ponte açoitada pelo magma, Vorgath Sem-Rosto acaricia o fio de seu machado tingido por cem reinos partidos…',
        },
      ],
    },
    boss3_intro: {
      title: 'CONFRONTO · A PONTE DO CEPO',
      skipBadge: '[B/RUN] LUTAR',
      shots: [
        {
          speakerName: 'VORGATH',
          text: '«Vi a filha das Brumas passar em lágrimas rumo ao Coliseu… mas tua marcha termina aqui no meu cepo de basalto!»',
        },
        {
          speakerName: 'KROM',
          text: '«Tuas palavras selaram teu destino, carrasco. A lava engolirá tua máscara e tuas correntes!»',
        },
      ],
    },
    act4_opening: {
      title: 'ATO IV · MURALHAS DE SANGUE E AREIA',
      skipBadge: '[B/RUN] PULAR',
      shots: [
        {
          speakerName: 'CRÔNICA',
          text: 'Emergindo das trevas vulcânicas sob um céu ocre em chamas, Krom avista as muralhas titânicas do Coliseu Imperial ao som de tambores.',
        },
        {
          speakerName: 'GUARDA ALABARDEIRO',
          text: '«É o lobo das Altas-Brumas que derrotou Vorgath! Fechem as alabardas diante do Portão da Caveira e soltem os gladiadores!»',
        },
        {
          speakerName: 'MALAKOR O ESFOLADOR',
          text: 'Só há um caminho até a ponte da Cidadela: cruzar a areia rubra onde reina Malakor, príncipe decaído ébrio de glória e sangue.',
        },
      ],
    },
    boss4_intro: {
      title: 'CONFRONTO · JULGAMENTO DO COLISEU',
      skipBadge: '[B/RUN] LUTAR',
      shots: [
        {
          speakerName: 'MALAKOR',
          text: '«Ouves cem mil gargantas rugirem, bárbaro? Cem reis morderam esta poeira sob minha lâmina serrilhada — oferece-lhes uma bela morte!»',
        },
        {
          speakerName: 'KROM',
          text: '«Guarda tuas reverências para as arquibancadas, campeão dourado. Minha espada não dança: ela corta!»',
        },
      ],
    },
    act5_opening: {
      title: 'ATO V · A PONTE DAS LEGIÕES MALDITAS',
      skipBadge: '[B/RUN] PULAR',
      shots: [
        {
          speakerName: 'CRÔNICA',
          text: 'O silêncio cai sobre o Coliseu vencido enquanto nasce uma lua pálida. Adiante estende-se a ponte rumo às torres de brasa.',
        },
        {
          speakerName: 'MAGO ESQUELETO',
          text: '«O ritual de Lorde Drax chega ao fim! Demônios do Abismo, incendeiem o viaduto antes que este mortal alcance o portão!»',
        },
        {
          speakerName: 'BAELGOR DAS BRASAS',
          text: 'Sob jaulas de ferro suspensas sobre o magma vigia o Arconte Baelgor, general imortal cuja armadura pulsa com o fogo do Inferno…',
        },
      ],
    },
    boss5_intro: {
      title: 'CONFRONTO · PORTÃO DAS BRASAS',
      skipBadge: '[B/RUN] LUTAR',
      shots: [
        {
          speakerName: 'BAELGOR',
          text: '«Quatro senhores caíram sob tua espada, mortal, mas o aço humano derrete diante do sopro do Abismo!»',
        },
        {
          speakerName: 'KROM',
          text: '«Meu coração arde com um fogo mais antigo que tuas forjas, Baelgor. Abre passagem para Drax!»',
        },
      ],
    },
    act6_opening: {
      title: 'ATO VI · COROA DE SOMBRA E TROVÃO',
      skipBadge: '[B/RUN] PULAR',
      shots: [
        {
          speakerName: 'CRÔNICA',
          text: 'Ferido mas indomável, Krom cruza o último viaduto ciclópico enquanto raios púrpuras rasgam o céu sobre o Santuário proibido.',
        },
        {
          speakerName: 'SENTINELA ESPECTRAL',
          text: '«Os espectros dos reis caídos guardam estas colunas! Nenhuma alma viva perturbará o rito sombrio de Lorde Drax!»',
        },
        {
          speakerName: 'LORDE DRAX',
          text: '«Contempla tua impotência, filho das Brumas! À meia-noite, o sopro de Valéria selará o Coração de Aço à minha coroa para sempre!»',
        },
      ],
    },
    boss6_intro: {
      title: 'DUELO FINAL · O JULGAMENTO DO AÇO',
      skipBadge: '[B/RUN] LUTAR',
      shots: [
        {
          speakerName: 'LORDE DRAX',
          text: '«Ajoelha-te perante um deus nascente! O raio, os mortos e a noite obedecem à minha voz — que vale uma simples lâmina de ferro?»',
        },
        {
          speakerName: 'KROM',
          text: '«Ela traz a memória de um povo livre e um juramento invicto. Em guarda, Drax!»',
        },
      ],
    },
    campaign_ending: {
      title: 'EPÍLOGO · O CANTO DA AURORA RESTAURADA',
      skipBadge: '[B/RUN] CONCLUIR',
      shots: [
        {
          speakerName: 'CRÔNICA',
          text: 'Partida pelo golpe final de Krom, a espada maldita de Drax estilhaça-se! Sua coroa de sombra rola sobre a laje enquanto seu trono desaba.',
        },
        {
          speakerName: 'KROM & VALÉRIA',
          text: 'Com um golpe certeiro, Krom rompe os grilhões de Valéria. Entre suas mãos unidas, o Coração de Aço afasta a noite e canta em ouro puro!',
        },
        {
          speakerName: 'CRÔNICA DO RETORNO',
          text: 'As nuvens púrpuras abrem-se diante da aurora. No caminho de volta, os braseiros apagam-se e a brisa desperta brotos de prata nos carvalhos.',
        },
        {
          speakerName: 'LENDA DAS ALTAS-BRUMAS',
          text: 'Os lares do Norte renascem junto a Valéria e seu libertador. Enquanto brilharem as estrelas de inverno, os bardos cantarão Krom e a Espada de Aço!',
        },
      ],
    },
  },
  es: {
    act1_opening: {
      title: 'PRÓLOGO · EL JURAMENTO DE LAS ALTAS BRUMAS',
      skipBadge: '[B/RUN] SALTAR',
      shots: [
        {
          speakerName: 'CANTO DE LOS ANCIANOS',
          text: 'Antaño, bajo los robles plateados de las Altas Brumas, el Corazón de Acero velaba en paz, forjado de una estrella caída en la primera edad.',
        },
        {
          speakerName: 'CRÓNICA DEL NORTE',
          text: 'Pero bajo una luna de sangre, la horda de Gorgar entregó los hogares al fuego, profanó el altar y se llevó encadenada a la princesa Valeria.',
        },
        {
          speakerName: 'KROM EL BÁRBARO',
          text: 'Solo en pie entre las cenizas tibias de los suyos, Krom alza el mandoble ancestral: «¡Por el Norte, ni piedra ni demonio mantendrán cautiva a Valeria!»',
        },
        {
          speakerName: 'GOBLIN EXPLORADOR',
          text: 'Ya los cuernos goblins rasgan la bruma matinal: «¡Un superviviente pisa el puente musgoso! ¡Soltad a los lobos negros antes del arco de Gorgar!»',
        },
      ],
    },
    boss1_intro: {
      title: 'CARA A CARA · EL ARCO DE GORGAR',
      skipBadge: '[B/RUN] LUCHAR',
      shots: [
        {
          speakerName: 'GORGAR EL QUEBRANTADOR',
          text: '«¡Llegas tarde, lobo solitario! La escolta de Drax ya cruzó las raíces del mundo, ¡y mi hacha beberá tu sangre sobre estas piedras!»',
        },
        {
          speakerName: 'KROM',
          text: '«Cada ceniza de mi aldea clama justicia, Gorgar. ¡Abre este portal o cae frente a él!»',
        },
      ],
    },
    act2_opening: {
      title: 'ACTO II · LÁGRIMAS DE CUARZO VIVO',
      skipBadge: '[B/RUN] SALTAR',
      shots: [
        {
          speakerName: 'CRÓNICA',
          text: 'Tras el arco vencido de Gorgar desciende una escalera olvidada. Un jirón del manto de Valeria en la roca guía a Krom hacia el abismo azul.',
        },
        {
          speakerName: 'ORCO MERODEADOR',
          text: '«¡El norteño sigue el rastro de la cautiva! ¡Despertad a los gólems del Sello Azul y soltad a los murciélagos de las bóvedas!»',
        },
        {
          speakerName: 'THALGRIM DE LOS CRISTALES',
          text: 'Antaño rey herrero venerado, Thalgrim vendió su honor a Drax a cambio de la fría inmortalidad del cristal vivo que canta bajo su martillo…',
        },
      ],
    },
    boss2_intro: {
      title: 'CARA A CARA · LA CÁMARA GEÓDICA',
      skipBadge: '[B/RUN] LUCHAR',
      shots: [
        {
          speakerName: 'THALGRIM',
          text: '«¡La carne envejece y traiciona, guerrero, pero el cuarzo es eterno! ¡Quedarás esculpido en escarcha en mi galería real!»',
        },
        {
          speakerName: 'KROM',
          text: '«Un rey que entrega inocentes a las cadenas no es más que un carcelero de piedra. ¡En guardia, Thalgrim!»',
        },
      ],
    },
    act3_opening: {
      title: 'ACTO III · EL RÍO DE LAS ALMAS ENCADENADAS',
      skipBadge: '[B/RUN] SALTAR',
      shots: [
        {
          speakerName: 'CRÓNICA',
          text: 'El frescor de las cascadas muere en un aliento de azufre y brasa. Bajo la montaña se abren las Criptas donde gimen mil cautivos.',
        },
        {
          speakerName: 'FANÁTICO DE OBSIDIANA',
          text: '«¡Por la máscara de hierro de Vorgath, abrid las fosas ardientes! ¡Que los muertos sin reposo ahoguen a este portador de acero!»',
        },
        {
          speakerName: 'VORGATH EL VERDUGO',
          text: 'Sobre el puente azotado por el magma, Vorgath el Sin Rostro acaricia el filo de su hacha teñida por cien reinos quebrados…',
        },
      ],
    },
    boss3_intro: {
      title: 'CARA A CARA · EL PUENTE DEL TAJO',
      skipBadge: '[B/RUN] LUCHAR',
      shots: [
        {
          speakerName: 'VORGATH',
          text: '«Vi pasar entre lágrimas a la doncella de las Brumas rumbo al Coliseo… ¡pero tu camino termina hoy sobre mi tajo de basalto!»',
        },
        {
          speakerName: 'KROM',
          text: '«Tus palabras acaban de sellar tu condena, verdugo. ¡La lava tragará tu máscara y tus cadenas!»',
        },
      ],
    },
    act4_opening: {
      title: 'ACTO IV · MURALLAS DE SANGRE Y ARENA',
      skipBadge: '[B/RUN] SALTAR',
      shots: [
        {
          speakerName: 'CRÓNICA',
          text: 'Emergiendo de la noche volcánica bajo un cielo ocre encendido, Krom contempla las titánicas murallas del Coliseo Imperial al son de tambores.',
        },
        {
          speakerName: 'GUARDIA ALABARDERO',
          text: '«¡Es el lobo de las Altas Brumas que abatió a Vorgath! ¡Cerrad alabardas ante la Puerta del Cráneo y soltad a los gladiadores!»',
        },
        {
          speakerName: 'MALAKOR EL DESOLLADOR',
          text: 'Solo hay un paso hacia el puente de la Ciudadela: cruzar la arena roja donde reina Malakor, príncipe caído ebrio de ovaciones y sangre.',
        },
      ],
    },
    boss4_intro: {
      title: 'CARA A CARA · JUICIO DEL COLISEO',
      skipBadge: '[B/RUN] LUCHAR',
      shots: [
        {
          speakerName: 'MALAKOR',
          text: '«¿Oyes rugir cien mil gargantas, bárbaro? Cien reyes mordieron este polvo bajo mi hoja dentada: ¡ofréceles una hermosa muerte!»',
        },
        {
          speakerName: 'KROM',
          text: '«Guarda tus reverencias para las gradas, campeón dorado. ¡Mi espada no baila: cercena!»',
        },
      ],
    },
    act5_opening: {
      title: 'ACTO V · EL PUENTE DE LAS LEGIONES MALDITAS',
      skipBadge: '[B/RUN] SALTAR',
      shots: [
        {
          speakerName: 'CRÓNICA',
          text: 'El silencio cae sobre el Coliseo vencido mientras se alza una luna pálida. Ante Krom se tiende el puente nocturno hacia las torres de brasa.',
        },
        {
          speakerName: 'MAGO ESQUELETO',
          text: '«¡El ritual de Lord Drax roza la medianoche! ¡Demonios del Abismo, incendiad el viaducto antes de que este mortal alcance el rastrillo!»',
        },
        {
          speakerName: 'BAELGOR DE LAS BRASAS',
          text: 'Bajo jaulas de hierro colgadas sobre el magma aguarda el Arconte Baelgor, general inmortal cuya armadura late con fuego infernal…',
        },
      ],
    },
    boss5_intro: {
      title: 'CARA A CARA · PUERTA DE LAS BRASAS',
      skipBadge: '[B/RUN] LUCHAR',
      shots: [
        {
          speakerName: 'BAELGOR',
          text: '«Cuatro señores cayeron bajo tu hoja, mortal, ¡pero el acero humano se funde ante el aliento del Abismo!»',
        },
        {
          speakerName: 'KROM',
          text: '«Mi corazón arde con un fuego más antiguo que tus fraguas, Baelgor. ¡Cede el paso hacia Drax!»',
        },
      ],
    },
    act6_opening: {
      title: 'ACTO VI · CORONA DE SOMBRA Y TRUENO',
      skipBadge: '[B/RUN] SALTAR',
      shots: [
        {
          speakerName: 'CRÓNICA',
          text: 'Herido pero indomable, Krom cruza el último viaducto ciclópeo mientras rayos púrpuras rasgan el cielo sobre el Santuario prohibido.',
        },
        {
          speakerName: 'CENTINELA ESPECTRAL',
          text: '«¡Los espectros de reyes caídos guardan estas columnatas! ¡Ningún alma viva turbará el rito sombrío de Lord Drax!»',
        },
        {
          speakerName: 'LORD DRAX',
          text: '«¡Contempla tu impotencia, hijo de las Brumas! ¡A medianoche, el aliento de Valeria sellará el Corazón de Acero a mi corona por la eternidad!»',
        },
      ],
    },
    boss6_intro: {
      title: 'DUELO FINAL · EL JUICIO DEL ACERO',
      skipBadge: '[B/RUN] LUCHAR',
      shots: [
        {
          speakerName: 'LORD DRAX',
          text: '«¡De rodillas ante un dios naciente! El rayo, los muertos y la noche obedecen mi voz: ¿qué pesa una simple hoja de hierro?»',
        },
        {
          speakerName: 'KROM',
          text: '«Lleva la memoria de un pueblo libre y un juramento invicto. ¡En guardia, Drax!»',
        },
      ],
    },
    campaign_ending: {
      title: 'EPÍLOGO · EL CANTO DEL ALBA RECOBRADA',
      skipBadge: '[B/RUN] FIN',
      shots: [
        {
          speakerName: 'CRÓNICA',
          text: '¡Partida por el último revés de Krom, la espada maldita de Drax salta en pedazos y su corona de sombra rueda sobre el altar quebrado!',
        },
        {
          speakerName: 'KROM Y VALERIA',
          text: 'De un tajo limpio, Krom rompe los grilletes de Valeria. ¡Entre sus manos unidas, el Corazón de Acero disipa la noche y canta con luz dorada!',
        },
        {
          speakerName: 'CRÓNICA DEL REGRESO',
          text: 'Las nubes púrpuras se abren ante la aurora. En el camino de vuelta, los braseros malditos se apagan y la brisa despierta brotes de plata.',
        },
        {
          speakerName: 'LEYENDA DE LAS ALTAS BRUMAS',
          text: 'Los hogares del Norte renacen junto a Valeria y su libertador. ¡Mientras brillen las estrellas de invierno, los bardos cantarán a Krom!',
        },
      ],
    },
  },
  it: {
    act1_opening: {
      title: 'PROLOGO · IL GIURAMENTO DELLE ALTE BRUME',
      skipBadge: '[B/RUN] SALTA',
      shots: [
        {
          speakerName: 'CANTO DEGLI ANTICHI',
          text: 'Un tempo, sotto le querce d’argento delle Alte Brume, il Cuore d’Acciaio vegliava in pace, forgiato da una stella caduta nella prima era.',
        },
        {
          speakerName: 'CRONACA DEL NORD',
          text: 'Ma sotto una luna di sangue, l’orda di Gorgar diede alle fiamme i focolari, profanò l’altare e trascinò in catene la principessa Valeria.',
        },
        {
          speakerName: 'KROM IL BARBARO',
          text: 'Solo tra le ceneri tiepide dei suoi, Krom leva la spada ancestrale: «Per gli spiriti del Nord, né pietra né demone terranno Valeria prigioniera!»',
        },
        {
          speakerName: 'GOBLIN ESPLORATORE',
          text: 'Già i corni goblin squarciano la nebbia: «Un superstite avanza sul ponte muschioso! Sciogliete i lupi neri prima dell’arco di Gorgar!»',
        },
      ],
    },
    boss1_intro: {
      title: 'CONFRONTO · L’ARCO DI GORGAR',
      skipBadge: '[B/RUN] COMBATTI',
      shots: [
        {
          speakerName: 'GORGAR LO SPEZZATORE',
          text: '«Arrivi troppo tardi, lupo solitario! La scorta di Drax ha già varcato le radici del mondo, e la mia ascia berrà il tuo sangue!»',
        },
        {
          speakerName: 'KROM',
          text: '«Ogni cenere del mio villaggio grida giustizia, Gorgar. Apri questo portale o cadi davanti ad esso!»',
        },
      ],
    },
    act2_opening: {
      title: 'ATTO II · LACRIME DI QUARZO VIVO',
      skipBadge: '[B/RUN] SALTA',
      shots: [
        {
          speakerName: 'CRONACA',
          text: 'Oltre l’arco infranto di Gorgar scende una scala dimenticata. Un lembo strappato del manto di Valeria guida Krom nell’abisso azzurro.',
        },
        {
          speakerName: 'ORCO PREDONE',
          text: '«L’uomo del Nord segue le tracce della prigioniera! Risvegliate i golem del Sigillo Azzurro e liberate gli sciami delle volte!»',
        },
        {
          speakerName: 'THALGRIM DEI CRISTALLI',
          text: 'Un tempo re-fabbro onorato, Thalgrim vendette il suo giuramento a Drax per la fredda immortalità del cristallo vivo sotto il suo martello…',
        },
      ],
    },
    boss2_intro: {
      title: 'CONFRONTO · LA CAMERA GEODICA',
      skipBadge: '[B/RUN] COMBATTI',
      shots: [
        {
          speakerName: 'THALGRIM',
          text: '«La carne invecchia e tradisce, guerriero, ma il quarzo è eterno! Diventa statua di gelo nella mia galleria reale!»',
        },
        {
          speakerName: 'KROM',
          text: '«Un re che consegna gli innocenti alle catene è solo un carceriere di pietra. In guardia, Thalgrim!»',
        },
      ],
    },
    act3_opening: {
      title: 'ATTO III · IL FIUME DELLE ANIME INCATENATE',
      skipBadge: '[B/RUN] SALTA',
      shots: [
        {
          speakerName: 'CRONACA',
          text: 'La frescura delle cascate muore in un soffio di zolfo e brace. Sotto la montagna si aprono le Cripte dove gemono mille prigionieri.',
        },
        {
          speakerName: 'FANATICO D’OSSIDIANA',
          text: '«Per la maschera di ferro di Vorgath, aprite le fosse ardenti! Che i morti senza pace travolgano questo portatore d’acciaio!»',
        },
        {
          speakerName: 'VORGATH IL CARNEFICE',
          text: 'Sul ponte battuto dal magma, Vorgath Senza-Volto sfiora il filo della mannaia arrossata da cento regni spezzati…',
        },
      ],
    },
    boss3_intro: {
      title: 'CONFRONTO · IL PONTE DEL CEPPO',
      skipBadge: '[B/RUN] COMBATTI',
      shots: [
        {
          speakerName: 'VORGATH',
          text: '«Ho visto passare in lacrime la fanciulla delle Brume verso il Colosseo… ma il tuo cammino finisce sul mio ceppo di basalto!»',
        },
        {
          speakerName: 'KROM',
          text: '«Le tue parole hanno segnato la tua fine, carnefice. La lava inghiottirà la tua maschera e le tue catene!»',
        },
      ],
    },
    act4_opening: {
      title: 'ATTO IV · BASTIONI DI SANGUE E SABBIA',
      skipBadge: '[B/RUN] SALTA',
      shots: [
        {
          speakerName: 'CRONACA',
          text: 'Emerso dalla notte vulcanica sotto un cielo d’ocra infuocato, Krom scorge le titaniche mura del Colosseo Imperiale scosse dai tamburi.',
        },
        {
          speakerName: 'GUARDIA ALABARDIERE',
          text: '«È il lupo delle Alte Brume che ha abbattuto Vorgath! Serrate le alabarde davanti alla Porta del Teschio e liberate i gladiatori!»',
        },
        {
          speakerName: 'MALAKOR LO SCUOIATORE',
          text: 'Un solo varco porta al ponte della Cittadella: attraversare la sabbia rossa dove regna Malakor, principe caduto ebbro di gloria.',
        },
      ],
    },
    boss4_intro: {
      title: 'CONFRONTO · GIUDIZIO DEL COLOSSEO',
      skipBadge: '[B/RUN] COMBATTI',
      shots: [
        {
          speakerName: 'MALAKOR',
          text: '«Senti ruggire centomila gole, barbaro? Cento re hanno morso questa polvere sotto la mia lama dentata: offri loro una bella morte!»',
        },
        {
          speakerName: 'KROM',
          text: '«Serba gli inchini per gli spalti, campione dorato. La mia spada non danza: fende!»',
        },
      ],
    },
    act5_opening: {
      title: 'ATTO V · IL PONTE DELLE LEGIONI MALEDETTE',
      skipBadge: '[B/RUN] SALTA',
      shots: [
        {
          speakerName: 'CRONACA',
          text: 'Il silenzio cala sul Colosseo sconfitto mentre sorge una luna pallida. Davanti a Krom si stende il ponte verso le torri di brace.',
        },
        {
          speakerName: 'MAGO SCHELETRO',
          text: '«Il rito di Lord Drax tocca la mezzanotte! Demoni dell’Abisso, incendiate il viadotto prima che questo mortale raggiunga la grata!»',
        },
        {
          speakerName: 'BAELGOR DELLE BRACI',
          text: 'Sotto gabbie di ferro sospese sul magma veglia l’Arconte Baelgor, generale immortale la cui armatura pulsa del fuoco degli Inferi…',
        },
      ],
    },
    boss5_intro: {
      title: 'CONFRONTO · PORTA DELLE BRACI',
      skipBadge: '[B/RUN] COMBATTI',
      shots: [
        {
          speakerName: 'BAELGOR',
          text: '«Quattro signori sono caduti sotto la tua lama, mortale, ma l’acciaio umano fonde davanti al soffio dell’Abisso!»',
        },
        {
          speakerName: 'KROM',
          text: '«Il mio cuore brucia di un fuoco più antico delle tue fucine, Baelgor. Cedimi il passo verso Drax!»',
        },
      ],
    },
    act6_opening: {
      title: 'ATTO VI · CORONA D’OMBRA E DI FULMINE',
      skipBadge: '[B/RUN] SALTA',
      shots: [
        {
          speakerName: 'CRONACA',
          text: 'Ferito ma indomito, Krom varca l’ultimo viadotto ciclopico mentre lampi purpurei squarciano il cielo sopra il Santuario proibito.',
        },
        {
          speakerName: 'SENTINELLA SPETTRALE',
          text: '«Gli spettri dei re caduti vegliano su questi colonnati! Nessun vivente turberà il rito oscuro di Lord Drax!»',
        },
        {
          speakerName: 'SIGNORE DRAX',
          text: '«Contempla la tua impotenza, figlio delle Brume! A mezzanotte, il respiro di Valeria legherà il Cuore d’Acciaio alla mia corona in eterno!»',
        },
      ],
    },
    boss6_intro: {
      title: 'DUELLO FINALE · IL GIUDIZIO DELL’ACCIAIO',
      skipBadge: '[B/RUN] COMBATTI',
      shots: [
        {
          speakerName: 'SIGNORE DRAX',
          text: '«In ginocchio davanti a un dio nascente! Il fulmine, i morti e la notte obbediscono alla mia voce: cosa può una semplice lama di ferro?»',
        },
        {
          speakerName: 'KROM',
          text: '«Porta la memoria di un popolo libero e un giuramento invitto. In guardia, Drax!»',
        },
      ],
    },
    campaign_ending: {
      title: 'EPILOGO · IL CANTO DELL’ALBA RITROVATA',
      skipBadge: '[B/RUN] FINE',
      shots: [
        {
          speakerName: 'CRONACA',
          text: 'Infranta dall’ultimo rovescio di Krom, la spada maledetta di Drax vola in frantumi mentre la sua corona d’ombra rotola sull’altare spezzato!',
        },
        {
          speakerName: 'KROM & VALERIA',
          text: 'Con un colpo netto, Krom spezza le catene d’ossidiana di Valeria. Tra le loro mani unite, il Cuore d’Acciaio scaccia la notte e brilla d’oro puro!',
        },
        {
          speakerName: 'CRONACA DEL RITORNO',
          text: 'Le nubi purpuree si aprono davanti all’aurora. Sulla via del ritorno i bracieri si spengono e il vento tiepido risveglia gemme d’argento.',
        },
        {
          speakerName: 'LEGGENDA DELLE ALTE BRUME',
          text: 'I focolari del Nord rinascono attorno a Valeria e al suo liberatore. Finché brilleranno le stelle d’inverno, i bardi canteranno Krom!',
        },
      ],
    },
  },
  de: {
    act1_opening: {
      title: 'PROLOG · DER SCHWUR VON HOCHNEBEL',
      skipBadge: '[B/RUN] WEITER',
      shots: [
        {
          speakerName: 'LIED DER ALTEN',
          text: 'Einst wachte unter den Silbereichen von Hochnebel das Stahlherz in Frieden, geschmiedet aus einem gefallenen Stern im ersten Zeitalter.',
        },
        {
          speakerName: 'CHRONIK DES NORDENS',
          text: 'Doch unter blutrotem Mond legte Gorgars Horde die Hallen in Asche, entweihte den Altar und verschleppte Prinzessin Valeria in Ketten.',
        },
        {
          speakerName: 'KROM DER BARBAR',
          text: 'Allein in der warmen Asche seines Volkes erhebt Krom das Ahnenschwert: „Bei den Geistern des Nordens, weder Fels noch Dämon hält Valeria gefangen!“',
        },
        {
          speakerName: 'GOBLIN-SPÄHER',
          text: 'Schon zerreißen Goblinhörner den Morgennebel: „Ein Überlebender betritt die Moosbrücke! Hetzt die Schattenwölfe vor Gorgars Tor auf ihn!“',
        },
      ],
    },
    boss1_intro: {
      title: 'DUELL · GORGARS RUNENTOR',
      skipBadge: '[B/RUN] KAMPF',
      shots: [
        {
          speakerName: 'GORGAR DER BRECHER',
          text: '„Du kommst zu spät, einsamer Wolf! Drax’ Zug ist längst unter den Wurzeln der Welt verschwunden, und meine Axt trinkt dein Blut!“',
        },
        {
          speakerName: 'KROM',
          text: '„Jedes Aschekorn meines Dorfes verlangt Vergeltung, Gorgar. Öffne das Portal oder falle davor!“',
        },
      ],
    },
    act2_opening: {
      title: 'AKT II · TRÄNEN AUS LEBENDEM QUARZ',
      skipBadge: '[B/RUN] WEITER',
      shots: [
        {
          speakerName: 'CHRONIK',
          text: 'Hinter Gorgars gebrochenem Bogen führt eine vergessene Treppe hinab. Ein abgerissenes Band von Valerias Mantel weist Krom in den Azurschlund.',
        },
        {
          speakerName: 'ORK-PLÜNDERER',
          text: '„Der Nordmann folgt der Spur der Gefangenen! Weckt die Golems des Blauen Siegels und hetzt die Höhlenfledermäuse auf ihn!“',
        },
        {
          speakerName: 'THALGRIM DER KRISTALLE',
          text: 'Einst ein geehrter Schmiedekönig, verkaufte Thalgrim seine Ehre an Drax für die kalte Unsterblichkeit des lebenden Kristalls…',
        },
      ],
    },
    boss2_intro: {
      title: 'DUELL · DIE GEODENKAMMER',
      skipBadge: '[B/RUN] KAMPF',
      shots: [
        {
          speakerName: 'THALGRIM',
          text: '„Fleisch altert und verrät, Krieger, doch Quarz währt ewig! Erstarre als Trophäe in meiner Königshalle!“',
        },
        {
          speakerName: 'KROM',
          text: '„Ein König, der Unschuldige in Ketten legt, ist nur ein Kerkermeister aus Stein. Auf in den Kampf, Thalgrim!“',
        },
      ],
    },
    act3_opening: {
      title: 'AKT III · STROM DER GEKETTETEN SEELEN',
      skipBadge: '[B/RUN] WEITER',
      shots: [
        {
          speakerName: 'CHRONIK',
          text: 'Die Kühle der Kaskaden stirbt in Schwefel und Glut. Tief unter dem Berg öffnen sich die Grüfte, wo tausend Gefangene stöhnen.',
        },
        {
          speakerName: 'OBSIDIAN-ZELOT',
          text: '„Bei Vorgaths Eisenmaske, öffnet die Knochengruben! Mögen die ruhelosen Toten diesen Schwertträger im Schwarzfeuer ertränken!“',
        },
        {
          speakerName: 'VORGATH DER HENKER',
          text: 'Auf der von Magma umtosten Brücke prüft der gesichtslose Vorgath die Schneide seines Beils, gerötet von hundert gebrochenen Reichen…',
        },
      ],
    },
    boss3_intro: {
      title: 'DUELL · DIE RICHTBLOCK-BRÜCKE',
      skipBadge: '[B/RUN] KAMPF',
      shots: [
        {
          speakerName: 'VORGATH',
          text: '„Ich sah die Tochter der Nebel weinend zum Kolosseum ziehen… doch dein Weg endet hier auf meinem Basaltblock!“',
        },
        {
          speakerName: 'KROM',
          text: '„Deine Worte haben dein Urteil gesprochen, Henker. Die Lava wird deine Maske samt deinen Ketten verschlingen!“',
        },
      ],
    },
    act4_opening: {
      title: 'AKT IV · MAUERN AUS BLUT UND SAND',
      skipBadge: '[B/RUN] WEITER',
      shots: [
        {
          speakerName: 'CHRONIK',
          text: 'Aus vulkanischer Nacht unter glühendem Ockerhimmel aufgestiegen, erblickt Krom die titanischen Wälle des Kaiserlichen Kolosseums.',
        },
        {
          speakerName: 'KAISERLICHER HELLEBARDIER',
          text: '„Es ist der Wolf von Hochnebel, der Vorgath erschlug! Kreuzt die Hellebarden vor dem Schädeltor und lasst die Gladiatoren los!“',
        },
        {
          speakerName: 'MALAKOR DER SCHINDER',
          text: 'Nur ein Pfad führt zur Brücke der Zitadelle: über den roten Sand Malakors, eines gefallenen Prinzen berauscht von Ruhm und Blut.',
        },
      ],
    },
    boss4_intro: {
      title: 'DUELL · GERICHT DER ARENA',
      skipBadge: '[B/RUN] KAMPF',
      shots: [
        {
          speakerName: 'MALAKOR',
          text: '„Hörst du hunderttausend Kehlen brüllen, Barbar? Hundert Könige bissen unter meiner gezackten Klinge in diesen Staub — stirb ehrenvoll!“',
        },
        {
          speakerName: 'KROM',
          text: '„Spar dir deine Verbeugungen für die Ränge, goldener Schlächter. Mein Schwert tanzt nicht — es spaltet!“',
        },
      ],
    },
    act5_opening: {
      title: 'AKT V · BRÜCKE DER VERFLUCHTEN LEGIONEN',
      skipBadge: '[B/RUN] WEITER',
      shots: [
        {
          speakerName: 'CHRONIK',
          text: 'Stille senkt sich über das bezwungene Kolosseum, als ein fahler Mond aufgeht. Vor Krom spannt sich die Brücke zu den Gluttürmen.',
        },
        {
          speakerName: 'SKELETTMAGIER',
          text: '„Fürst Drax’ Ritual naht der Mitternacht! Dämonen des Abgrunds, setzt das Viadukt in Brand, ehe dieser Sterbliche das Tor erreicht!“',
        },
        {
          speakerName: 'BAELGOR DER GLUT',
          text: 'Unter Eisenkäfigen über der Lava wacht Archon Baelgor, unsterblicher Feldherr, dessen Rüstung vom Feuer der Hölle schlägt…',
        },
      ],
    },
    boss5_intro: {
      title: 'DUELL · TOR DER GLUTKÄFIGE',
      skipBadge: '[B/RUN] KAMPF',
      shots: [
        {
          speakerName: 'BAELGOR',
          text: '„Vier Kriegsherren fielen deiner Klinge zum Opfer, Sterblicher, doch Menschenstahl schmilzt vor dem Atem des Abgrunds!“',
        },
        {
          speakerName: 'KROM',
          text: '„Mein Herz brennt von einem älteren Feuer als deine Höllenschmieden, Baelgor. Gib den Weg zu Drax frei!“',
        },
      ],
    },
    act6_opening: {
      title: 'AKT VI · KRONE AUS SCHATTEN UND BLITZ',
      skipBadge: '[B/RUN] WEITER',
      shots: [
        {
          speakerName: 'CHRONIK',
          text: 'Verwundet doch ungebrochen stürmt Krom über das letzte Zyklopenviadukt, während purpurne Blitze den Himmel über dem Heiligtum spalten.',
        },
        {
          speakerName: 'SPEKTRALWÄCHTER',
          text: '„Die Geister gefallener Könige hüten diese Säulen! Keine lebende Seele stört Fürst Drax’ dunkle Vermählung!“',
        },
        {
          speakerName: 'FÜRST DRAX',
          text: '„Sieh deine Ohnmacht, Sohn der Nebel! Um Mitternacht bindet Valerias Atem das Stahlherz für alle Ewigkeit an meine Krone!“',
        },
      ],
    },
    boss6_intro: {
      title: 'ENDKAMPF · DAS URTEIL DES STAHLS',
      skipBadge: '[B/RUN] KAMPF',
      shots: [
        {
          speakerName: 'FÜRST DRAX',
          text: '„Knie vor einem erwachenden Gott! Blitz, Tote und Nacht gehorchen meiner Stimme — was wiegt da eine schlichte Eisenklinge?“',
        },
        {
          speakerName: 'KROM',
          text: '„Sie trägt das Gedächtnis eines freien Volkes und einen ungebrochenen Schwur. Auf die Klinge, Drax!“',
        },
      ],
    },
    campaign_ending: {
      title: 'EPILOG · LIED DER WIEDERGEBORENEN MORGENRÖTE',
      skipBadge: '[B/RUN] ENDE',
      shots: [
        {
          speakerName: 'CHRONIK',
          text: 'Von Kroms letztem Rückhandschlag gespalten, zerspringt Drax’ Fluchklinge, während seine Schattenkrone über den geborstenen Altar rollt!',
        },
        {
          speakerName: 'KROM & VALERIA',
          text: 'Mit einem klaren Hieb sprengt Krom Valerias Obsidianketten. Zwischen ihren vereinten Händen wirft das Stahlherz die Nacht ab und strahlt golden!',
        },
        {
          speakerName: 'CHRONIK DER HEIMKEHR',
          text: 'Die Purpurwolken weichen dem ersten Morgenlicht. Auf dem Heimweg erlöschen die Fluchfeuer und warmer Wind weckt silberne Knospen.',
        },
        {
          speakerName: 'LEGENDE VON HOCHNEBEL',
          text: 'Die Hallen des Nordens erblühen neu um Valeria und ihren Befreier. Solange Wintersterne leuchten, besingen Barden Krom und die Klinge aus Stahl!',
        },
      ],
    },
  },
};
