// Dual-Bus Gamebuino AKA Dark-Fantasy FM & Physical-Modeled Audio Engine
// Independent SFX Volume & Multi-Movement Stage Soundtrack Volume (0..100%)

export type MusicTrackId = 'title' | 'forest' | 'crypt' | 'arena' | 'sanctuary';

// MIDI note helper (0 = rest)
function m2f(midi: number): number {
  if (midi <= 0) return 0;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

type LeadTimbre =
  | 'brass'
  | 'flute_horn'
  | 'organ'
  | 'guitar_fm'
  | 'harpsichord'
  | 'lute_bell';

interface SongSectionSlot {
  part: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // Index of 32-step part in bass/lead/padChords
  role: 'theme' | 'verse' | 'bridge_calm' | 'bridge_epic' | 'climax' | 'coda';
  timbre?: LeadTimbre; // Optional instrument hand-off on repeated sections
  withCounter?: boolean; // Weave lute/harp counter-arpeggio on selected repeats
  octaveLead?: number; // Subtle register lift (+12) for climax repeats
  pickupFill?: boolean; // War-drum / timpani pickup on last 8 steps to relaunch Theme A
}

interface TrackComposition {
  stepMs: number;
  // Default timbre for each of the 8 distinct 32-step musical parts (0..7)
  sectionTimbres: [
    LeadTimbre,
    LeadTimbre,
    LeadTimbre,
    LeadTimbre,
    LeadTimbre,
    LeadTimbre,
    LeadTimbre,
    LeadTimbre,
  ];
  // 16-part Song Arrangement (~70-95s): repeats core Theme/Verse parts & inserts Bridges periodically before resuming Theme A!
  arrangement: SongSectionSlot[];
  bass: number[]; // 8 parts × 32 steps = 256 steps
  lead: number[]; // 8 parts × 32 steps = 256 steps
  counter: number[]; // 64-step lute/harp counter-voice (0 = silent)
  padChords: [number, number, number][]; // 8 parts × 4 chords = 32 chords
  drumMain: string; // 16-step main battle groove
  drumBridge: string; // 16-step stripped atmospheric groove for bridges
  drumFill: string; // 8-step timpani/tom pickup fill before relaunching Main Theme
  useAnvil: boolean;
}

const TRACKS: Record<MusicTrackId, TrackComposition> = {
  // ============================================================================
  // 1. "ANVIL OF KROM" — Heroic Poledouris / Richard Joseph Saga (~47s cycle)
  //    8 Movements in D Dorian -> BbMaj7 -> F -> Gm -> C -> A7 -> Dm
  // ============================================================================
  title: {
    stepMs: 184,
    sectionTimbres: [
      'brass',      // Mvt 1: Horn call of the North
      'brass',      // Mvt 2: Heroic answer
      'flute_horn', // Mvt 3: Highland wind ballad (Bb -> F -> Gm -> A)
      'lute_bell',  // Mvt 4: Campfire bardic lute & anvil echoes (breathing bridge)
      'flute_horn', // Mvt 5: Gathering storm modulation (Gm -> Eb -> A7)
      'brass',      // Mvt 6: Grand Poledouris brass climax
      'lute_bell',  // Mvt 7: Harp-horn call & response
      'brass',      // Part 7: Noble cadence & resonant coda
    ],
    arrangement: [
      { part: 0, role: 'theme', withCounter: false },                                  // Thème A (exposé franc)
      { part: 1, role: 'theme', withCounter: false },                                  // Réponse A'
      { part: 0, role: 'theme', withCounter: true },                                   // Reprise du Thème A + harpe/luth
      { part: 2, role: 'verse', withCounter: true, pickupFill: true },                 // Couplet B (ballade nordique)
      { part: 0, role: 'theme', withCounter: false },                                  // Retour au Thème A
      { part: 1, role: 'theme', withCounter: true },                                   // Réponse A' enrichie
      { part: 3, role: 'bridge_calm', withCounter: true, pickupFill: true },           // PONT 1 (Accalmie luth & enclume) -> relance !
      { part: 0, role: 'theme', timbre: 'brass', withCounter: true },                  // Reprise triomphale du Thème A !
      { part: 2, role: 'verse', timbre: 'brass', withCounter: true },                  // Couplet B (cuivres nobles)
      { part: 4, role: 'verse', withCounter: true, pickupFill: true },                 // Montée dramatique B'
      { part: 5, role: 'climax', withCounter: true },                                  // Climax héroïque A''
      { part: 0, role: 'theme', timbre: 'flute_horn', withCounter: true },             // Thème A (cor des hautes terres)
      { part: 6, role: 'bridge_epic', timbre: 'lute_bell', withCounter: true, pickupFill: true }, // PONT 2 (Contrepoint épique) -> relance !
      { part: 0, role: 'theme', timbre: 'brass', withCounter: false },                 // Retour franc au Thème A
      { part: 1, role: 'theme', timbre: 'brass', withCounter: true },                  // Réponse finale A'
      { part: 7, role: 'coda', withCounter: false },                                   // Coda & respiration
    ],
    bass: [
      // Mvt 1 (0..31): D Dorian Noble March
      38, 0, 38, 38, 45, 0, 38, 0, 41, 0, 41, 43, 45, 0, 38, 0,
      38, 0, 38, 38, 45, 0, 46, 0, 43, 0, 41, 0, 36, 0, 38, 0,
      // Mvt 2 (32..63): Rising Fifths & Subtonic C
      46, 0, 46, 46, 41, 0, 41, 0, 48, 0, 48, 48, 43, 0, 45, 0,
      39, 0, 39, 41, 43, 0, 36, 0, 38, 38, 45, 0, 38, 0, 26, 0,
      // Mvt 3 (64..95): Lyrical Relative Major (Bb -> F -> Gm -> A)
      46, 0, 53, 0, 46, 0, 45, 0, 41, 0, 48, 0, 41, 0, 40, 0,
      43, 0, 50, 0, 43, 0, 41, 0, 45, 0, 52, 0, 45, 0, 33, 0,
      // Mvt 4 (96..127): Quiet Bardic Bridge (Sparse Pedal -> Dominant A Pickup into Theme A!)
      38, 0, 0, 0, 45, 0, 0, 0, 43, 0, 0, 0, 41, 0, 0, 0,
      36, 0, 0, 0, 43, 0, 0, 0, 33, 0, 0, 0, 45, 0, 33, 0,
      // Mvt 5 (128..159): Chromatic Tension Ascent (Gm -> Eb -> Asus4 -> A7)
      43, 0, 43, 50, 43, 0, 41, 0, 39, 0, 39, 46, 39, 0, 38, 0,
      36, 0, 36, 43, 34, 0, 34, 41, 33, 0, 45, 0, 33, 33, 37, 0,
      // Mvt 6 (160..191): Heroic Climax (Full Galloping Octave Bass)
      38, 38, 50, 38, 45, 0, 38, 0, 46, 46, 58, 46, 41, 0, 48, 0,
      43, 43, 55, 43, 36, 0, 48, 0, 45, 0, 33, 0, 38, 0, 50, 0,
      // Mvt 7 (192..223): Northern Saga Counterpoint (Dm -> C -> Bb -> A)
      38, 0, 45, 0, 36, 0, 43, 0, 34, 0, 41, 0, 33, 0, 40, 0,
      43, 0, 50, 0, 41, 0, 48, 0, 36, 0, 43, 0, 33, 0, 45, 0,
      // Mvt 8 (224..255): Final Resolution & Spacious Breathing Tail
      39, 0, 46, 0, 43, 0, 38, 0, 36, 0, 43, 0, 33, 0, 45, 0,
      38, 0, 45, 0, 50, 0, 38, 0, 26, 0, 0, 0, 0, 0, 0, 0,
    ],
    lead: [
      // Mvt 1: Iconic Horn Fifths
      62, 0, 0, 62, 69, 0, 67, 65, 62, 0, 65, 67, 69, 0, 0, 0,
      62, 0, 0, 69, 74, 0, 72, 70, 69, 0, 67, 65, 64, 0, 62, 0,
      // Mvt 2: Soaring Answer
      70, 0, 70, 72, 74, 0, 69, 0, 72, 0, 72, 74, 76, 0, 73, 0,
      74, 0, 70, 0, 67, 0, 65, 64, 62, 0, 69, 0, 62, 0, 0, 0,
      // Mvt 3: Lyrical Flute-Horn Saga (Long Singing Notes!)
      65, 0, 0, 69, 70, 0, 74, 0, 72, 0, 0, 69, 65, 0, 0, 0,
      67, 0, 70, 74, 72, 0, 69, 67, 69, 0, 0, 0, 64, 0, 0, 0,
      // Mvt 4: Delicate Bardic Lute Melody with Spacious Rests
      74, 0, 69, 0, 65, 0, 69, 0, 71, 0, 67, 0, 65, 0, 0, 0,
      72, 0, 67, 0, 64, 0, 67, 0, 62, 0, 0, 0, 0, 0, 0, 0,
      // Mvt 5: Gathering Storm Sequential Climb
      67, 0, 70, 69, 67, 0, 62, 0, 67, 0, 70, 74, 75, 0, 74, 70,
      72, 0, 67, 65, 65, 0, 70, 69, 69, 0, 73, 76, 73, 0, 0, 0,
      // Mvt 6: High Heroic Brass Climax
      74, 0, 0, 74, 81, 0, 79, 77, 74, 0, 77, 79, 81, 0, 77, 0,
      79, 0, 76, 74, 72, 0, 76, 72, 69, 0, 73, 0, 74, 0, 0, 0,
      // Mvt 7: Descending Northern Sequence
      74, 72, 69, 0, 72, 69, 67, 0, 70, 69, 65, 0, 69, 64, 61, 0,
      67, 0, 70, 74, 72, 0, 69, 65, 67, 0, 64, 60, 69, 0, 0, 0,
      // Mvt 8: Grand Anvil Cadence & Breathing Silence at End
      70, 0, 67, 65, 67, 0, 62, 0, 64, 0, 67, 64, 61, 0, 69, 0,
      62, 0, 0, 69, 62, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    counter: [
      0, 57, 62, 0, 0, 57, 65, 0, 0, 57, 60, 0, 0, 57, 62, 0,
      0, 57, 62, 0, 0, 58, 62, 0, 0, 55, 60, 0, 0, 52, 57, 0,
      58, 62, 65, 62, 57, 60, 65, 60, 55, 60, 64, 60, 57, 61, 64, 0,
      50, 57, 62, 65, 50, 57, 62, 0, 48, 55, 60, 64, 50, 57, 62, 0,
    ],
    padChords: [
      [50, 57, 62], [53, 57, 60], [50, 57, 62], [48, 55, 60],
      [46, 53, 58], [48, 55, 60], [51, 55, 58], [50, 57, 62],
      [46, 53, 58], [53, 57, 60], [43, 50, 55], [45, 52, 57],
      [50, 57, 62], [47, 55, 59], [48, 55, 60], [50, 57, 62],
      [43, 50, 55], [51, 55, 58], [48, 55, 60], [45, 52, 57],
      [50, 57, 62], [46, 53, 58], [43, 50, 55], [50, 57, 62],
      [50, 57, 62], [46, 53, 58], [43, 50, 55], [45, 52, 57],
      [51, 55, 58], [48, 55, 60], [50, 57, 62], [50, 57, 62],
    ],
    drumMain: 'K..KK.T.K.T.S.T.',
    drumBridge: 'K.....H...T...H.',
    drumFill: 'K.T.T.SS',
    useAnvil: true,
  },

  // ============================================================================
  // 2. "WILDERNESS OF DOOM" — 1987 Barbarian Forest & Mist Gallop (~38s cycle)
  // ============================================================================
  forest: {
    stepMs: 150,
    sectionTimbres: [
      'flute_horn',
      'flute_horn',
      'brass',
      'lute_bell',
      'flute_horn',
      'brass',
      'flute_horn',
      'lute_bell',
    ],
    arrangement: [
      { part: 0, role: 'theme', withCounter: false },                                  // Thème A (galop sauvage)
      { part: 1, role: 'theme', withCounter: false },                                  // Réponse A'
      { part: 0, role: 'theme', withCounter: true },                                   // Reprise Thème A + contre-chant
      { part: 2, role: 'verse', withCounter: true, pickupFill: true },                 // Couplet B (cuivres de chasse)
      { part: 0, role: 'theme', withCounter: false },                                  // Thème A
      { part: 1, role: 'theme', withCounter: true },                                   // Réponse A'
      { part: 3, role: 'bridge_calm', withCounter: true, pickupFill: true },           // PONT 1 (Clairière brumeuse au luth) -> relance !
      { part: 0, role: 'theme', timbre: 'brass', withCounter: true },                  // Retour héroïque au Thème A !
      { part: 2, role: 'verse', withCounter: true },                                   // Couplet B
      { part: 4, role: 'verse', withCounter: true, pickupFill: true },                 // Montée sylvestre B'
      { part: 5, role: 'climax', withCounter: true },                                  // Climax A''
      { part: 0, role: 'theme', withCounter: false },                                  // Rappel du Thème A
      { part: 6, role: 'bridge_epic', timbre: 'flute_horn', withCounter: true, pickupFill: true }, // PONT 2 (Contrepoint des vents) -> relance !
      { part: 0, role: 'theme', withCounter: true },                                   // Reprise du Thème A
      { part: 1, role: 'theme', timbre: 'brass', withCounter: true },                  // Réponse A' aux cuivres
      { part: 7, role: 'coda', withCounter: false },                                   // Coda & écho de forêt
    ],
    bass: [
      38, 38, 50, 38, 38, 48, 38, 45, 38, 38, 50, 38, 41, 0, 43, 0,
      38, 38, 50, 38, 38, 48, 38, 45, 36, 36, 48, 36, 38, 0, 38, 0,
      46, 46, 58, 46, 43, 43, 55, 43, 48, 48, 60, 48, 45, 0, 45, 43,
      41, 41, 53, 41, 39, 39, 51, 39, 45, 45, 33, 33, 38, 0, 38, 0,
      41, 0, 41, 53, 36, 0, 36, 48, 43, 0, 43, 55, 38, 0, 45, 0,
      41, 0, 41, 53, 48, 0, 43, 0, 45, 0, 33, 0, 38, 0, 26, 0,
      38, 0, 0, 45, 0, 0, 50, 0, 43, 0, 0, 50, 0, 0, 47, 0,
      36, 0, 0, 43, 0, 0, 48, 0, 33, 0, 45, 0, 33, 0, 40, 0,
      38, 0, 50, 0, 47, 0, 43, 0, 36, 0, 48, 0, 45, 0, 43, 40,
      38, 0, 50, 0, 43, 0, 47, 0, 48, 0, 45, 0, 38, 0, 38, 0,
      46, 46, 58, 46, 48, 48, 60, 48, 50, 50, 38, 38, 50, 0, 48, 45,
      43, 43, 55, 43, 41, 41, 53, 41, 45, 45, 33, 33, 38, 38, 50, 0,
      38, 0, 45, 38, 36, 0, 43, 36, 43, 0, 50, 43, 41, 0, 48, 41,
      39, 0, 46, 39, 36, 0, 43, 36, 33, 0, 45, 0, 38, 0, 45, 0,
      38, 0, 50, 0, 43, 0, 47, 0, 36, 0, 48, 0, 33, 0, 45, 0,
      38, 0, 45, 0, 38, 0, 0, 0, 26, 0, 0, 0, 0, 0, 0, 0,
    ],
    lead: [
      62, 0, 65, 67, 69, 0, 67, 65, 64, 0, 60, 0, 62, 0, 0, 0,
      62, 0, 65, 67, 74, 0, 72, 69, 71, 0, 67, 69, 62, 0, 0, 0,
      70, 0, 69, 67, 65, 0, 62, 0, 72, 0, 70, 69, 69, 0, 73, 0,
      74, 0, 72, 70, 69, 67, 65, 64, 65, 0, 64, 61, 62, 0, 0, 0,
      65, 0, 0, 69, 67, 0, 0, 64, 67, 0, 70, 69, 65, 0, 62, 0,
      65, 0, 69, 72, 76, 0, 74, 72, 69, 0, 67, 64, 62, 0, 0, 0,
      74, 0, 69, 0, 71, 0, 67, 0, 69, 0, 62, 0, 67, 0, 0, 0,
      72, 0, 67, 0, 64, 0, 60, 0, 62, 0, 0, 0, 0, 0, 0, 0,
      62, 65, 69, 0, 71, 0, 67, 0, 72, 71, 69, 67, 69, 0, 0, 0,
      74, 0, 71, 69, 67, 69, 71, 74, 76, 0, 72, 69, 74, 0, 0, 0,
      70, 0, 74, 77, 76, 0, 72, 67, 74, 0, 77, 81, 79, 0, 76, 74,
      71, 0, 74, 71, 69, 0, 65, 62, 69, 0, 73, 76, 74, 0, 0, 0,
      69, 0, 65, 62, 67, 0, 64, 60, 71, 0, 67, 62, 69, 0, 65, 60,
      67, 65, 63, 62, 64, 0, 60, 0, 61, 0, 64, 69, 62, 0, 0, 0,
      62, 0, 69, 0, 71, 0, 67, 0, 64, 0, 67, 64, 61, 0, 64, 0,
      62, 0, 0, 0, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    counter: [
      0, 57, 0, 62, 0, 57, 0, 64, 0, 59, 0, 62, 0, 57, 60, 0,
      50, 57, 62, 57, 48, 55, 60, 55, 47, 55, 59, 55, 50, 57, 62, 0,
      0, 62, 65, 0, 0, 60, 64, 0, 0, 59, 62, 0, 0, 57, 61, 0,
      50, 57, 62, 69, 55, 59, 62, 67, 48, 55, 60, 64, 50, 57, 62, 0,
    ],
    padChords: [
      [50, 57, 62], [50, 53, 57], [50, 57, 62], [48, 55, 60],
      [46, 53, 58], [48, 55, 60], [53, 57, 60], [45, 52, 57],
      [53, 57, 60], [48, 55, 60], [43, 50, 55], [50, 57, 62],
      [50, 57, 62], [43, 50, 59], [48, 55, 60], [50, 57, 62],
      [50, 57, 62], [43, 50, 59], [48, 55, 60], [50, 57, 62],
      [46, 53, 58], [48, 55, 60], [43, 50, 55], [45, 52, 57],
      [50, 57, 62], [43, 50, 59], [51, 55, 58], [45, 52, 57],
      [50, 57, 62], [48, 55, 60], [50, 57, 62], [50, 57, 62],
    ],
    drumMain: 'K.H.T.H.K.T.S.T.',
    drumBridge: 'K...H...T...H...',
    drumFill: 'T.T.K.SS',
    useAnvil: false,
  },

  // ============================================================================
  // 3. "CATACOMBS OF VORGATH" — Organ, Harpsichord & Crypt Bells (~44s cycle)
  // ============================================================================
  crypt: {
    stepMs: 172,
    sectionTimbres: [
      'organ',
      'organ',
      'harpsichord',
      'lute_bell',
      'flute_horn',
      'organ',
      'harpsichord',
      'organ',
    ],
    arrangement: [
      { part: 0, role: 'theme', withCounter: false },                                  // Thème A (orgue des cryptes)
      { part: 1, role: 'theme', withCounter: false },                                  // Réponse A'
      { part: 0, role: 'theme', withCounter: true },                                   // Reprise Thème A + carillon
      { part: 2, role: 'verse', withCounter: true, pickupFill: true },                 // Couplet B (clavecin baroque)
      { part: 0, role: 'theme', withCounter: false },                                  // Retour au Thème A
      { part: 1, role: 'theme', timbre: 'harpsichord', withCounter: true },            // Réponse A' au clavecin
      { part: 3, role: 'bridge_calm', withCounter: true, pickupFill: true },           // PONT 1 (Cloches souterraines & silence) -> relance !
      { part: 0, role: 'theme', timbre: 'organ', withCounter: true },                  // Retour solennel du Thème A !
      { part: 2, role: 'verse', withCounter: true },                                   // Couplet B
      { part: 4, role: 'verse', withCounter: true, pickupFill: true },                 // Montée spectrale B'
      { part: 5, role: 'climax', withCounter: true },                                  // Grand orgue Climax A''
      { part: 0, role: 'theme', withCounter: false },                                  // Thème A
      { part: 6, role: 'bridge_epic', timbre: 'harpsichord', withCounter: true, pickupFill: true }, // PONT 2 (Toccata clavecin) -> relance !
      { part: 0, role: 'theme', timbre: 'organ', withCounter: true },                  // Reprise du Thème A
      { part: 1, role: 'theme', timbre: 'organ', withCounter: true },                  // Réponse A'
      { part: 7, role: 'coda', withCounter: false },                                   // Coda funèbre & respiration
    ],
    bass: [
      36, 0, 36, 48, 37, 0, 36, 0, 36, 0, 43, 0, 41, 0, 37, 0,
      36, 0, 36, 48, 44, 0, 43, 0, 41, 0, 39, 0, 37, 0, 36, 0,
      41, 0, 41, 53, 44, 0, 41, 0, 39, 0, 39, 51, 37, 0, 36, 0,
      43, 0, 44, 0, 41, 0, 37, 0, 36, 36, 43, 0, 36, 0, 24, 0,
      41, 0, 44, 0, 46, 0, 49, 0, 39, 0, 43, 0, 44, 0, 32, 0,
      37, 0, 41, 0, 36, 0, 39, 0, 43, 0, 31, 0, 36, 0, 0, 0,
      36, 0, 0, 0, 37, 0, 0, 0, 41, 0, 0, 0, 43, 0, 0, 0,
      44, 0, 0, 0, 37, 0, 0, 0, 31, 0, 0, 0, 36, 0, 0, 0,
      44, 0, 51, 0, 39, 0, 46, 0, 41, 0, 48, 0, 43, 0, 31, 0,
      44, 0, 43, 0, 41, 0, 39, 0, 37, 0, 41, 0, 43, 0, 31, 0,
      36, 36, 48, 36, 37, 37, 49, 37, 41, 41, 53, 41, 43, 0, 31, 0,
      44, 44, 56, 44, 41, 41, 53, 41, 43, 0, 37, 0, 36, 0, 48, 0,
      41, 0, 48, 41, 39, 0, 46, 39, 37, 0, 44, 37, 36, 0, 43, 36,
      34, 0, 41, 34, 32, 0, 44, 32, 31, 0, 43, 0, 36, 0, 0, 0,
      37, 0, 44, 0, 36, 0, 43, 0, 31, 0, 43, 0, 36, 0, 48, 0,
      36, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    lead: [
      60, 0, 61, 64, 67, 0, 65, 64, 61, 0, 60, 0, 0, 0, 58, 0,
      60, 0, 64, 67, 68, 0, 67, 65, 64, 0, 61, 60, 60, 0, 0, 0,
      65, 0, 68, 72, 70, 0, 68, 65, 67, 0, 64, 61, 60, 0, 0, 0,
      67, 68, 67, 65, 64, 0, 61, 0, 60, 0, 67, 0, 60, 0, 0, 0,
      65, 68, 72, 68, 70, 73, 70, 65, 67, 70, 75, 70, 68, 72, 68, 63,
      65, 68, 73, 72, 68, 67, 65, 63, 62, 65, 68, 71, 72, 0, 0, 0,
      72, 0, 0, 67, 68, 0, 0, 65, 65, 0, 72, 0, 67, 0, 0, 0,
      68, 0, 65, 0, 61, 0, 65, 0, 64, 0, 0, 0, 60, 0, 0, 0,
      68, 0, 0, 72, 75, 0, 70, 0, 72, 0, 68, 65, 67, 0, 0, 0,
      68, 0, 72, 75, 77, 0, 75, 72, 73, 0, 72, 68, 67, 0, 0, 0,
      72, 0, 73, 76, 79, 0, 77, 76, 77, 0, 72, 68, 67, 0, 71, 0,
      72, 0, 77, 76, 73, 0, 72, 68, 67, 0, 64, 61, 60, 0, 0, 0,
      77, 72, 68, 72, 75, 70, 67, 70, 73, 68, 65, 68, 72, 67, 64, 67,
      70, 65, 61, 65, 68, 63, 60, 63, 67, 0, 64, 61, 60, 0, 0, 0,
      61, 0, 65, 68, 67, 0, 64, 60, 62, 0, 65, 67, 64, 0, 0, 0,
      60, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    counter: [
      0, 55, 60, 0, 0, 56, 61, 0, 0, 55, 60, 0, 0, 53, 56, 0,
      48, 55, 60, 64, 49, 56, 61, 65, 53, 56, 60, 65, 48, 55, 60, 0,
      0, 60, 63, 0, 0, 58, 63, 0, 0, 56, 60, 0, 0, 55, 59, 0,
      49, 56, 61, 0, 48, 55, 60, 0, 47, 55, 59, 0, 48, 55, 60, 0,
    ],
    padChords: [
      [48, 52, 55], [49, 53, 56], [48, 52, 55], [49, 53, 56],
      [53, 56, 60], [51, 55, 58], [49, 53, 56], [48, 52, 55],
      [53, 56, 60], [51, 55, 58], [49, 53, 56], [48, 52, 55],
      [48, 52, 55], [53, 56, 60], [49, 53, 56], [48, 52, 55],
      [56, 60, 63], [53, 56, 60], [56, 60, 63], [47, 55, 59],
      [48, 52, 55], [53, 56, 60], [49, 53, 56], [48, 52, 55],
      [53, 56, 60], [49, 53, 56], [46, 53, 58], [48, 52, 55],
      [49, 53, 56], [47, 55, 59], [48, 52, 55], [48, 52, 55],
    ],
    drumMain: 'K...T.H.K..KS...',
    drumBridge: 'K.......T...H...',
    drumFill: 'K...T.TS',
    useAnvil: true,
  },

  // ============================================================================
  // 4. "BLOOD & SAND COLISEUM" — Gladiator War-March & Breakdown (~35s cycle)
  // ============================================================================
  arena: {
    stepMs: 136,
    sectionTimbres: [
      'guitar_fm',
      'guitar_fm',
      'brass',
      'lute_bell',
      'flute_horn',
      'guitar_fm',
      'brass',
      'guitar_fm',
    ],
    arrangement: [
      { part: 0, role: 'theme', withCounter: false },                                  // Thème A (riff gladiateur)
      { part: 1, role: 'theme', withCounter: false },                                  // Réponse A'
      { part: 0, role: 'theme', withCounter: true },                                   // Reprise Thème A enrichie
      { part: 2, role: 'verse', withCounter: true, pickupFill: true },                 // Couplet B (fanfare d'arène)
      { part: 0, role: 'theme', withCounter: false },                                  // Retour au Thème A
      { part: 1, role: 'theme', timbre: 'brass', withCounter: true },                  // Réponse A' aux cuivres
      { part: 3, role: 'bridge_calm', withCounter: true, pickupFill: true },           // PONT 1 (Tension sous le sable & tambours sourds) -> relance !
      { part: 0, role: 'theme', timbre: 'guitar_fm', withCounter: true },              // Explosion du Thème A !
      { part: 2, role: 'verse', withCounter: true },                                   // Couplet B
      { part: 4, role: 'verse', withCounter: true, pickupFill: true },                 // Montée phrygienne B'
      { part: 5, role: 'climax', withCounter: true },                                  // Climax furieux A''
      { part: 0, role: 'theme', timbre: 'brass', withCounter: false },                 // Thème A aux cuivres de guerre
      { part: 6, role: 'bridge_epic', timbre: 'brass', withCounter: true, pickupFill: true }, // PONT 2 (Appel des tribunes) -> relance !
      { part: 0, role: 'theme', timbre: 'guitar_fm', withCounter: true },              // Reprise du Thème A
      { part: 1, role: 'theme', timbre: 'guitar_fm', withCounter: true },              // Réponse A'
      { part: 7, role: 'coda', withCounter: false },                                   // Coda martiale
    ],
    bass: [
      40, 40, 40, 52, 40, 40, 41, 43, 40, 40, 40, 52, 45, 0, 43, 41,
      40, 40, 40, 52, 40, 40, 47, 45, 43, 43, 41, 41, 40, 0, 40, 0,
      45, 45, 57, 45, 43, 43, 55, 43, 41, 41, 53, 41, 40, 0, 47, 0,
      48, 48, 47, 47, 45, 45, 43, 41, 40, 40, 47, 40, 40, 0, 28, 0,
      43, 0, 43, 55, 38, 0, 38, 50, 45, 0, 45, 57, 47, 0, 35, 0,
      48, 0, 48, 60, 43, 0, 43, 55, 47, 0, 47, 35, 40, 0, 0, 0,
      40, 0, 52, 0, 0, 40, 43, 0, 40, 0, 52, 0, 41, 0, 43, 0,
      40, 0, 52, 0, 0, 40, 47, 0, 41, 0, 38, 0, 40, 0, 0, 0,
      45, 0, 45, 57, 41, 0, 41, 53, 38, 0, 38, 50, 40, 0, 44, 0,
      45, 0, 47, 0, 48, 0, 45, 0, 41, 0, 38, 0, 40, 40, 44, 0,
      40, 40, 52, 40, 43, 43, 55, 43, 45, 45, 57, 45, 48, 0, 47, 0,
      45, 45, 43, 43, 41, 41, 40, 40, 47, 47, 35, 35, 40, 0, 52, 0,
      48, 0, 48, 47, 45, 0, 45, 43, 41, 0, 41, 40, 47, 0, 35, 0,
      43, 0, 45, 0, 47, 0, 48, 0, 41, 0, 47, 0, 40, 0, 0, 0,
      41, 0, 48, 0, 40, 0, 47, 0, 41, 0, 38, 0, 40, 0, 52, 0,
      40, 0, 40, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    lead: [
      64, 0, 64, 65, 67, 0, 71, 0, 69, 67, 65, 64, 65, 0, 0, 0,
      64, 0, 67, 71, 72, 0, 71, 69, 67, 0, 65, 64, 64, 0, 0, 0,
      69, 0, 72, 76, 74, 0, 71, 67, 65, 0, 69, 72, 71, 0, 0, 0,
      72, 71, 69, 67, 69, 67, 65, 64, 65, 67, 71, 0, 64, 0, 0, 0,
      67, 0, 71, 74, 74, 0, 69, 0, 72, 0, 69, 64, 71, 0, 0, 0,
      72, 0, 76, 79, 74, 0, 71, 67, 71, 0, 75, 78, 76, 0, 0, 0,
      64, 0, 0, 65, 0, 0, 67, 0, 0, 0, 71, 0, 65, 0, 0, 0,
      64, 0, 0, 72, 0, 0, 71, 0, 65, 0, 62, 0, 64, 0, 0, 0,
      69, 0, 0, 72, 76, 0, 72, 69, 74, 0, 71, 69, 68, 0, 0, 0,
      69, 0, 71, 72, 76, 0, 74, 72, 71, 0, 69, 65, 68, 0, 71, 0,
      76, 0, 76, 77, 79, 0, 76, 74, 76, 0, 79, 81, 84, 0, 83, 79,
      81, 79, 76, 74, 72, 71, 69, 67, 71, 0, 75, 0, 76, 0, 0, 0,
      76, 72, 69, 0, 74, 71, 67, 0, 72, 69, 65, 0, 71, 68, 64, 0,
      67, 71, 74, 0, 69, 72, 76, 0, 65, 69, 71, 0, 64, 0, 0, 0,
      65, 0, 69, 65, 64, 0, 71, 0, 65, 0, 62, 65, 64, 0, 0, 0,
      64, 0, 52, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    counter: [
      0, 59, 64, 0, 0, 59, 65, 0, 0, 59, 64, 0, 0, 57, 60, 0,
      52, 59, 64, 59, 55, 59, 62, 59, 57, 60, 64, 60, 52, 56, 59, 0,
      0, 64, 67, 0, 0, 62, 66, 0, 0, 60, 64, 0, 0, 59, 63, 0,
      53, 57, 60, 0, 52, 55, 59, 0, 53, 57, 62, 0, 52, 56, 59, 0,
    ],
    padChords: [
      [52, 55, 59], [53, 57, 60], [52, 55, 59], [50, 55, 59],
      [57, 60, 64], [53, 57, 60], [48, 52, 55], [52, 56, 59],
      [55, 59, 62], [50, 54, 57], [57, 60, 64], [47, 54, 59],
      [52, 55, 59], [52, 55, 59], [53, 57, 60], [52, 55, 59],
      [57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59],
      [52, 55, 59], [55, 59, 62], [57, 60, 64], [47, 54, 59],
      [48, 52, 55], [53, 57, 60], [55, 59, 62], [52, 56, 59],
      [53, 57, 60], [50, 53, 57], [52, 55, 59], [52, 55, 59],
    ],
    drumMain: 'K.T.S.T.K.K.S.TT',
    drumBridge: 'K..T..T.K..T..H.',
    drumFill: 'T.TTK.SS',
    useAnvil: false,
  },

  // ============================================================================
  // 5. "ALTAR OF SEIGNEUR DRAX" — Baroque Symphonic Final Boss Saga (~33s cycle)
  // ============================================================================
  sanctuary: {
    stepMs: 128,
    sectionTimbres: [
      'harpsichord',
      'organ',
      'flute_horn',
      'lute_bell',
      'organ',
      'brass',
      'harpsichord',
      'organ',
    ],
    arrangement: [
      { part: 0, role: 'theme', withCounter: false },                                  // Thème A (clavecin de Drax)
      { part: 1, role: 'theme', withCounter: false },                                  // Réponse A' (grand orgue)
      { part: 0, role: 'theme', timbre: 'organ', withCounter: true },                  // Reprise Thème A à l'orgue + harpe
      { part: 2, role: 'verse', withCounter: true, pickupFill: true },                 // Couplet B (incantation)
      { part: 0, role: 'theme', timbre: 'harpsichord', withCounter: false },           // Retour au Thème A
      { part: 1, role: 'theme', timbre: 'organ', withCounter: true },                  // Réponse A'
      { part: 3, role: 'bridge_calm', withCounter: true, pickupFill: true },           // PONT 1 (Silence rituel & cloches d'autel) -> relance !
      { part: 0, role: 'theme', timbre: 'brass', withCounter: true },                  // Retour impérial du Thème A !
      { part: 2, role: 'verse', withCounter: true },                                   // Couplet B
      { part: 4, role: 'verse', withCounter: true, pickupFill: true },                 // Montée symphonique B'
      { part: 5, role: 'climax', withCounter: true },                                  // Climax final A'' (cuivres)
      { part: 0, role: 'theme', timbre: 'harpsichord', withCounter: true },            // Thème A
      { part: 6, role: 'bridge_epic', timbre: 'harpsichord', withCounter: true, pickupFill: true }, // PONT 2 (Fugue baroque) -> relance !
      { part: 0, role: 'theme', timbre: 'organ', withCounter: true },                  // Reprise grandiose du Thème A
      { part: 1, role: 'theme', timbre: 'brass', withCounter: true },                  // Réponse A' aux cuivres
      { part: 7, role: 'coda', withCounter: false },                                   // Coda rituelle & respiration
    ],
    bass: [
      42, 42, 54, 42, 42, 54, 45, 42, 41, 41, 53, 41, 37, 37, 49, 37,
      42, 42, 54, 42, 47, 47, 59, 47, 49, 49, 41, 41, 42, 0, 42, 0,
      38, 38, 50, 38, 40, 40, 52, 40, 42, 42, 54, 42, 45, 45, 44, 42,
      47, 47, 45, 45, 44, 44, 41, 41, 42, 42, 49, 42, 42, 0, 30, 0,
      45, 0, 45, 57, 40, 0, 40, 52, 38, 0, 38, 50, 37, 0, 49, 0,
      38, 0, 38, 50, 42, 0, 42, 54, 44, 0, 37, 0, 42, 0, 30, 0,
      42, 0, 0, 0, 38, 0, 0, 0, 47, 0, 0, 0, 37, 0, 0, 0,
      42, 0, 0, 0, 40, 0, 0, 0, 38, 0, 37, 0, 42, 0, 0, 0,
      47, 0, 47, 59, 49, 0, 37, 49, 50, 0, 38, 50, 49, 0, 37, 49,
      42, 0, 44, 0, 45, 0, 38, 0, 47, 0, 37, 0, 49, 0, 37, 0,
      42, 42, 54, 42, 38, 38, 50, 38, 40, 40, 52, 40, 45, 0, 44, 0,
      47, 47, 59, 47, 42, 42, 54, 42, 37, 37, 49, 37, 42, 0, 54, 0,
      42, 0, 54, 42, 40, 0, 52, 40, 38, 0, 50, 38, 37, 0, 49, 37,
      47, 0, 45, 0, 44, 0, 41, 0, 42, 0, 37, 0, 42, 0, 0, 0,
      38, 0, 50, 0, 37, 0, 49, 0, 42, 0, 49, 0, 54, 0, 42, 0,
      30, 0, 42, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    lead: [
      66, 0, 69, 73, 78, 0, 73, 69, 65, 0, 68, 73, 77, 0, 73, 68,
      66, 0, 73, 78, 76, 74, 73, 71, 73, 0, 68, 65, 66, 0, 0, 0,
      74, 0, 71, 69, 76, 0, 73, 71, 78, 0, 73, 69, 81, 0, 80, 78,
      74, 73, 71, 69, 68, 0, 73, 77, 78, 0, 73, 0, 66, 0, 0, 0,
      73, 0, 0, 76, 76, 0, 71, 0, 74, 0, 0, 69, 68, 0, 0, 0,
      74, 0, 78, 76, 73, 0, 69, 66, 68, 0, 73, 77, 78, 0, 0, 0,
      78, 0, 73, 0, 74, 0, 69, 0, 71, 0, 66, 0, 68, 0, 0, 0,
      73, 0, 69, 0, 71, 0, 68, 0, 66, 0, 0, 0, 0, 0, 0, 0,
      71, 0, 74, 78, 77, 0, 73, 68, 74, 0, 78, 81, 80, 0, 77, 73,
      78, 0, 76, 0, 73, 0, 74, 0, 71, 0, 77, 0, 73, 0, 0, 0,
      78, 0, 0, 78, 81, 0, 78, 74, 76, 0, 80, 76, 73, 0, 76, 0,
      74, 0, 71, 74, 73, 0, 69, 66, 68, 0, 73, 77, 78, 0, 0, 0,
      78, 73, 69, 73, 76, 71, 68, 71, 74, 69, 66, 69, 73, 68, 65, 68,
      71, 74, 78, 0, 68, 73, 77, 0, 78, 0, 73, 68, 66, 0, 0, 0,
      74, 0, 69, 66, 68, 0, 65, 0, 66, 0, 73, 0, 78, 0, 0, 0,
      66, 0, 0, 0, 54, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    counter: [
      0, 61, 66, 0, 0, 61, 68, 0, 0, 62, 66, 0, 0, 61, 65, 0,
      54, 61, 66, 61, 50, 57, 62, 57, 52, 56, 59, 56, 49, 56, 61, 0,
      0, 66, 69, 0, 0, 64, 68, 0, 0, 62, 66, 0, 0, 61, 65, 0,
      50, 57, 62, 0, 49, 56, 61, 0, 54, 57, 61, 0, 54, 61, 66, 0,
    ],
    padChords: [
      [54, 57, 61], [53, 56, 61], [54, 57, 61], [49, 53, 56],
      [50, 54, 57], [52, 56, 59], [47, 50, 54], [54, 57, 61],
      [57, 61, 64], [52, 56, 59], [50, 54, 57], [49, 53, 56],
      [54, 57, 61], [50, 54, 57], [47, 54, 59], [49, 53, 56],
      [47, 54, 59], [49, 53, 56], [50, 54, 57], [49, 53, 56],
      [54, 57, 61], [50, 54, 57], [52, 56, 59], [57, 61, 64],
      [47, 54, 59], [54, 57, 61], [49, 53, 56], [54, 57, 61],
      [50, 54, 57], [49, 53, 56], [54, 57, 61], [54, 57, 61],
    ],
    drumMain: 'K.K.S.K.K.T.S.TS',
    drumBridge: 'K.......T.....H.',
    drumFill: 'K.T.S.SS',
    useAnvil: true,
  },
};

class GamebuinoAkaAudio {
  private ctx: AudioContext | null = null;
  private masterOut: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private reverbBus: ConvolverNode | null = null;
  private noiseBuf: AudioBuffer | null = null;

  private sfxVol = 0.75; // 0.0 .. 1.0
  private musicVol = 0.45; // 0.0 .. 1.0
  private musicPaused = false;
  private currentTrack: MusicTrackId = 'title';
  private stepIdx = 0;
  private nextNoteTime = 0;
  private schedulerId: number | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      this.ctx = ctx;

      // Master compressor prevents clipping during intense sword clashes + drums
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 18;
      comp.ratio.value = 4;
      comp.attack.value = 0.004;
      comp.release.value = 0.16;
      comp.connect(ctx.destination);

      this.masterOut = ctx.createGain();
      this.masterOut.gain.value = 0.92;
      this.masterOut.connect(comp);

      // Synthesize a dark stone-chamber stereo impulse response (1.1s decay)
      const irLen = Math.floor(ctx.sampleRate * 1.1);
      const irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const chData = irBuf.getChannelData(ch);
        let lp = 0;
        for (let i = 0; i < irLen; i++) {
          const env = Math.pow(1 - i / irLen, 2.8);
          const raw = (Math.random() * 2 - 1) * env;
          lp = lp * 0.72 + raw * 0.28; // warm dark stone damping
          chData[i] = lp * 0.45;
        }
      }
      this.reverbBus = ctx.createConvolver();
      this.reverbBus.buffer = irBuf;
      const revGain = ctx.createGain();
      revGain.gain.value = 0.28;
      this.reverbBus.connect(revGain);
      revGain.connect(this.masterOut);

      // Shared white-noise buffer (1.5s) for zero-allocation drum/slash/thunder synthesis
      const nLen = Math.floor(ctx.sampleRate * 1.5);
      this.noiseBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
      const nData = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < nLen; i++) {
        nData[i] = Math.random() * 2 - 1;
      }

      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = this.musicPaused ? 0 : this.musicVol;
      this.musicBus.connect(this.masterOut);
      this.musicBus.connect(this.reverbBus);

      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = this.sfxVol;
      this.sfxBus.connect(this.masterOut);
      this.sfxBus.connect(this.reverbBus);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.ensureSchedulerRunning();
    return this.ctx;
  }

  public unlockAudio(): void {
    this.ensureContext();
  }

  public setVolumes(sfxPercent: number, musicPercent: number): void {
    this.sfxVol = Math.max(0, Math.min(100, sfxPercent)) / 100;
    this.musicVol = Math.max(0, Math.min(100, musicPercent)) / 100;
    if (this.sfxBus && this.ctx) {
      this.sfxBus.gain.setTargetAtTime(this.sfxVol, this.ctx.currentTime, 0.02);
    }
    if (this.musicBus && this.ctx) {
      this.musicBus.gain.setTargetAtTime(
        this.musicPaused ? 0 : this.musicVol,
        this.ctx.currentTime,
        0.03
      );
    }
  }

  public setMusicPaused(paused: boolean): void {
    this.musicPaused = paused;
    if (this.musicBus && this.ctx) {
      this.musicBus.gain.setTargetAtTime(
        paused ? 0 : this.musicVol,
        this.ctx.currentTime,
        0.03
      );
    }
  }

  public setMusicTrack(track: MusicTrackId): void {
    if (this.currentTrack === track) return;
    this.currentTrack = track;
    this.stepIdx = 0;
  }

  private ensureSchedulerRunning(): void {
    if (this.schedulerId !== null || typeof window === 'undefined') return;
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }

    this.schedulerId = window.setInterval(() => {
      if (!this.ctx || !this.musicBus || this.ctx.state !== 'running') return;
      if (this.musicPaused || this.musicVol <= 0.01) {
        this.nextNoteTime = this.ctx.currentTime + 0.08;
        return;
      }

      const comp = TRACKS[this.currentTrack];
      const stepSec = comp.stepMs / 1000;
      const totalSongSteps = comp.arrangement.length * 32; // 512 steps (~70-95s structured song!)

      // Schedule lookahead window (110ms) for rock-solid groove
      while (this.nextNoteTime < this.ctx.currentTime + 0.11) {
        this.scheduleMusicStep(
          comp,
          this.stepIdx % totalSongSteps,
          this.nextNoteTime,
          stepSec
        );
        this.nextNoteTime += stepSec;
        this.stepIdx = (this.stepIdx + 1) % totalSongSteps;
      }
    }, 35);
  }

  private scheduleMusicStep(
    comp: TrackComposition,
    songStep: number,
    t: number,
    stepSec: number
  ): void {
    if (!this.ctx || !this.musicBus) return;
    const slotIdx = Math.floor(songStep / 32) % comp.arrangement.length;
    const slot = comp.arrangement[slotIdx];
    const localStep = songStep % 32; // 0..31 inside the 32-step part
    const partStep = slot.part * 32 + localStep; // 0..255 index inside bass/lead

    const isCalmBridge = slot.role === 'bridge_calm';
    const isEpicBridge = slot.role === 'bridge_epic';
    const isAnyBridge = isCalmBridge || isEpicBridge;
    const isFinalCodaTail = slot.role === 'coda' && localStep >= 20;

    // 1. Warm Analog-Filtered Bassline (holds longer on open pedal notes!)
    const bassMidi = comp.bass[partStep % comp.bass.length];
    if (bassMidi > 0) {
      let bassHold = 1;
      while (
        bassHold < 4 &&
        localStep + bassHold < 32 &&
        (localStep + bassHold) % 8 !== 0 &&
        comp.bass[(partStep + bassHold) % comp.bass.length] === 0
      ) {
        bassHold += 1;
      }
      const bassDur = stepSec * (0.88 + (bassHold - 1) * 0.72);
      const freq = m2f(bassMidi);
      const osc = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(freq * 0.5, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(
        freq * (isCalmBridge ? 3.0 : isEpicBridge ? 3.8 : 4.5),
        t
      );
      filter.frequency.exponentialRampToValueAtTime(freq * 1.35, t + bassDur * 0.92);
      filter.Q.value = 2.0;

      gain.gain.setValueAtTime(isCalmBridge ? 0.08 : 0.105, t);
      gain.gain.exponentialRampToValueAtTime(0.002, t + bassDur);

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicBus);

      osc.start(t);
      sub.start(t);
      osc.stop(t + bassDur + 0.01);
      sub.stop(t + bassDur + 0.01);
    }

    // 2. Lush Harmonic Pad / Choir Chords every 8 steps (4 chords per 32-step part)
    if (localStep % 8 === 0) {
      const chordIdx = slot.part * 4 + Math.floor(localStep / 8);
      const chord = comp.padChords[chordIdx % comp.padChords.length];
      const padDur = stepSec * 7.8;
      chord.forEach((midi, idx) => {
        if (!this.ctx || !this.musicBus) return;
        const osc = this.ctx.createOscillator();
        const flt = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        osc.type = idx === 1 ? 'triangle' : 'sawtooth';
        osc.detune.value = (idx - 1) * 7;
        osc.frequency.setValueAtTime(m2f(midi), t);

        flt.type = 'lowpass';
        flt.frequency.setValueAtTime(isCalmBridge ? 1200 : 920, t);

        const padPeak = isCalmBridge ? 0.034 : 0.029;
        g.gain.setValueAtTime(0.002, t);
        g.gain.linearRampToValueAtTime(padPeak, t + stepSec * 1.4);
        g.gain.setValueAtTime(padPeak * 0.86, t + padDur * 0.72);
        g.gain.exponentialRampToValueAtTime(0.001, t + padDur);

        osc.connect(flt);
        flt.connect(g);
        g.connect(this.musicBus);
        osc.start(t);
        osc.stop(t + padDur + 0.02);
      });
    }

    // 3. Delicate Lute / Harp Counter-Arpeggio (shimmers on enriched repeats & bridges!)
    const counterBankOffset = (slotIdx % 2) * 32 + localStep;
    const counterMidi = comp.counter[counterBankOffset % comp.counter.length];
    const leadRaw = comp.lead[partStep % comp.lead.length];
    if (
      counterMidi > 0 &&
      !isFinalCodaTail &&
      (slot.withCounter || isAnyBridge || leadRaw === 0)
    ) {
      this.triggerCounterPluck(
        m2f(counterMidi),
        t,
        stepSec * 1.65,
        isCalmBridge ? 0.046 : slot.withCounter ? 0.031 : 0.022
      );
    }

    // 4. Expressive Multi-Instrument Lead Melody with Multi-Step Legato Sustain!
    if (leadRaw > 0) {
      const leadMidi = leadRaw + (slot.octaveLead ?? 0);
      const freq = m2f(leadMidi);
      let holdSteps = 1;
      while (
        holdSteps < 4 &&
        localStep + holdSteps < 32 &&
        (localStep + holdSteps) % 8 !== 0 &&
        comp.lead[(partStep + holdSteps) % comp.lead.length] === 0
      ) {
        holdSteps += 1;
      }
      const dur = stepSec * (holdSteps > 1 ? holdSteps * 0.92 : 0.9);
      const activeTimbre = slot.timbre ?? comp.sectionTimbres[slot.part];
      this.triggerLeadVoice(freq, t, dur, activeTimbre);
    }

    // 5. Dynamic Percussion Arrangement (Main Groove vs Bridge vs Pickup Relaunch into Theme A!)
    if (isFinalCodaTail) {
      if (localStep === 20 || localStep === 24) {
        this.triggerWarDrum(t, 88, 34, 0.13);
      }
      return;
    }

    const isPickupFillWindow = Boolean(slot.pickupFill) && localStep >= 24;
    const drumChar = isPickupFillWindow
      ? comp.drumFill[localStep - 24]
      : isCalmBridge
      ? comp.drumBridge[localStep % comp.drumBridge.length]
      : isEpicBridge
      ? comp.drumBridge[(localStep + 8) % comp.drumBridge.length]
      : comp.drumMain[localStep % comp.drumMain.length];

    if (drumChar === 'K') {
      this.triggerWarDrum(t, 92, 36, isCalmBridge ? 0.095 : 0.135);
    } else if (drumChar === 'T') {
      const tomPitch = localStep % 4 === 2 ? 138 : 112;
      this.triggerWarDrum(t, tomPitch, 54, isPickupFillWindow ? 0.11 : 0.085);
    } else if (drumChar === 'S') {
      this.triggerSnareOrAnvil(
        t,
        comp.useAnvil && (localStep % 16 === 12 || (isPickupFillWindow && localStep === 31))
      );
    } else if (drumChar === 'H') {
      this.triggerShaker(t);
    }
  }

  private triggerCounterPluck(
    freq: number,
    t: number,
    dur: number,
    peakGain: number
  ): void {
    if (!this.ctx || !this.musicBus) return;
    const osc = this.ctx.createOscillator();
    const harm = this.ctx.createOscillator();
    const flt = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    harm.type = 'sine';
    harm.frequency.setValueAtTime(freq * 2, t);

    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(2400, t);
    flt.frequency.exponentialRampToValueAtTime(700, t + dur);

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(peakGain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(flt);
    harm.connect(flt);
    flt.connect(g);
    g.connect(this.musicBus);

    osc.start(t);
    harm.start(t);
    osc.stop(t + dur + 0.02);
    harm.stop(t + dur + 0.02);
  }

  private triggerLeadVoice(
    freq: number,
    t: number,
    dur: number,
    timbre: LeadTimbre
  ): void {
    if (!this.ctx || !this.musicBus) return;
    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const amp = this.ctx.createGain();

    // Gentle expressive vibrato on sustained notes
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 5.2;
    lfoGain.gain.setValueAtTime(0, t);
    if (dur > 0.24) {
      lfoGain.gain.linearRampToValueAtTime(freq * 0.0085, t + Math.min(dur * 0.5, 0.22));
    }
    lfo.connect(lfoGain);
    lfoGain.connect(carrier.frequency);

    let peakAmp = 0.072;

    if (timbre === 'brass') {
      carrier.type = 'sawtooth';
      mod.type = 'sine';
      mod.frequency.setValueAtTime(freq, t);
      modGain.gain.setValueAtTime(freq * 1.35, t);
      modGain.gain.exponentialRampToValueAtTime(freq * 0.28, t + dur);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, t);
      filter.frequency.linearRampToValueAtTime(2150, t + 0.048);
      filter.frequency.exponentialRampToValueAtTime(920, t + dur);
    } else if (timbre === 'organ') {
      carrier.type = 'square';
      mod.type = 'triangle';
      mod.frequency.setValueAtTime(freq * 2, t);
      modGain.gain.setValueAtTime(freq * 0.75, t);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1550, t);
      peakAmp = 0.064;
    } else if (timbre === 'harpsichord') {
      carrier.type = 'sawtooth';
      mod.type = 'square';
      mod.frequency.setValueAtTime(freq * 3, t);
      modGain.gain.setValueAtTime(freq * 1.65, t);
      modGain.gain.exponentialRampToValueAtTime(1, t + 0.09);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1750, t);
      filter.Q.value = 1.05;
      peakAmp = 0.066;
    } else if (timbre === 'lute_bell') {
      carrier.type = 'triangle';
      mod.type = 'sine';
      mod.frequency.setValueAtTime(freq * 2, t);
      modGain.gain.setValueAtTime(freq * 1.1, t);
      modGain.gain.exponentialRampToValueAtTime(1, t + 0.14);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, t);
      filter.frequency.exponentialRampToValueAtTime(850, t + dur);
      peakAmp = 0.082;
    } else if (timbre === 'guitar_fm') {
      carrier.type = 'sawtooth';
      mod.type = 'sawtooth';
      mod.frequency.setValueAtTime(freq * 2, t);
      modGain.gain.setValueAtTime(freq * 1.95, t);
      modGain.gain.exponentialRampToValueAtTime(freq * 0.38, t + dur);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2300, t);
      peakAmp = 0.068;
    } else {
      // 'flute_horn': Breathier Dorian solo wind/horn
      carrier.type = 'triangle';
      mod.type = 'sine';
      mod.frequency.setValueAtTime(freq * 2, t);
      modGain.gain.setValueAtTime(freq * 0.62, t);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1950, t);
      peakAmp = 0.078;
    }

    carrier.frequency.setValueAtTime(freq, t);
    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    amp.gain.setValueAtTime(0.002, t);
    amp.gain.linearRampToValueAtTime(peakAmp, t + (timbre === 'lute_bell' ? 0.008 : 0.02));
    if (dur > 0.25 && timbre !== 'harpsichord' && timbre !== 'lute_bell') {
      amp.gain.setValueAtTime(peakAmp * 0.85, t + dur * 0.65);
    }
    amp.gain.exponentialRampToValueAtTime(0.0015, t + dur);

    carrier.connect(filter);
    filter.connect(amp);
    amp.connect(this.musicBus);

    lfo.start(t);
    mod.start(t);
    carrier.start(t);
    lfo.stop(t + dur + 0.02);
    mod.stop(t + dur + 0.02);
    carrier.stop(t + dur + 0.02);
  }

  private triggerWarDrum(t: number, startHz: number, endHz: number, vol: number): void {
    if (!this.ctx || !this.musicBus) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startHz, t);
    osc.frequency.exponentialRampToValueAtTime(endHz, t + 0.16);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.002, t + 0.19);

    osc.connect(gain);
    gain.connect(this.musicBus);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private triggerSnareOrAnvil(t: number, anvilMetallic: boolean): void {
    if (!this.ctx || !this.musicBus || !this.noiseBuf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const flt = this.ctx.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(1400, t);
    flt.Q.value = 1.2;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.075, t);
    g.gain.exponentialRampToValueAtTime(0.002, t + 0.13);

    src.connect(flt);
    flt.connect(g);
    g.connect(this.musicBus);
    src.start(t, 0, 0.14);

    if (anvilMetallic) {
      // Conan-style Distant Anvil Strike!
      [1046, 1598, 2480].forEach((f) => {
        if (!this.ctx || !this.musicBus) return;
        const o = this.ctx.createOscillator();
        const og = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, t);
        og.gain.setValueAtTime(0.028, t);
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        o.connect(og);
        og.connect(this.musicBus);
        o.start(t);
        o.stop(t + 0.3);
      });
    }
  }

  private triggerShaker(t: number): void {
    if (!this.ctx || !this.musicBus || !this.noiseBuf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const flt = this.ctx.createBiquadFilter();
    flt.type = 'highpass';
    flt.frequency.setValueAtTime(5200, t);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.025, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    src.connect(flt);
    flt.connect(g);
    g.connect(this.musicBus);
    src.start(t, 0, 0.05);
  }

  // ==========================================================================
  // VISCERAL PHYSICAL-MODELED & FORMANT SOUND EFFECTS (SFX)
  // ==========================================================================

  public playMenuBlip(confirm = false): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus) return;
    const now = ctx.currentTime;

    // Crisp metallic sword-hilt UI click / chime
    const freqs = confirm ? [587.33, 880, 1174.66] : [523.25, 783.99];
    freqs.forEach((f, i) => {
      if (!this.sfxBus) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.022);
      g.gain.setValueAtTime(0.11, now + i * 0.022);
      g.gain.exponentialRampToValueAtTime(0.002, now + i * 0.022 + (confirm ? 0.14 : 0.06));
      osc.connect(g);
      g.connect(this.sfxBus);
      osc.start(now + i * 0.022);
      osc.stop(now + i * 0.022 + (confirm ? 0.15 : 0.07));
    });
  }

  public playSwing(heavy = false): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus || !this.noiseBuf) return;
    const now = ctx.currentTime;
    const dur = heavy ? 0.24 : 0.14;

    // 1. Air-cutting blade whoosh
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = heavy ? 2.4 : 3.2;
    bp.frequency.setValueAtTime(heavy ? 260 : 480, now);
    bp.frequency.exponentialRampToValueAtTime(heavy ? 1150 : 1680, now + dur * 0.45);
    bp.frequency.exponentialRampToValueAtTime(heavy ? 180 : 290, now + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.01, now);
    g.gain.linearRampToValueAtTime(heavy ? 0.34 : 0.24, now + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.002, now + dur);

    noise.connect(bp);
    bp.connect(g);
    g.connect(this.sfxBus);
    noise.start(now, Math.random() * 0.4, dur + 0.02);

    // 2. Subtle steel edge whistle
    const edge = ctx.createOscillator();
    const eg = ctx.createGain();
    edge.type = 'sine';
    edge.frequency.setValueAtTime(heavy ? 620 : 940, now);
    edge.frequency.exponentialRampToValueAtTime(heavy ? 310 : 520, now + dur);
    eg.gain.setValueAtTime(0.04, now);
    eg.gain.exponentialRampToValueAtTime(0.001, now + dur);
    edge.connect(eg);
    eg.connect(this.sfxBus);
    edge.start(now);
    edge.stop(now + dur + 0.01);
  }

  public playClash(parryPerfect = false): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus || !this.noiseBuf) return;
    const now = ctx.currentTime;

    // Inharmonic tempered-steel modal resonances!
    const baseHz = parryPerfect ? 960 : 790;
    const partials = [1.0, 1.47, 2.11, 2.79, 3.63];
    const ringDur = parryPerfect ? 0.48 : 0.26;

    partials.forEach((ratio, idx) => {
      if (!this.sfxBus) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseHz * ratio, now);
      osc.frequency.exponentialRampToValueAtTime(baseHz * ratio * 0.988, now + ringDur);

      const amp = (0.18 / (idx + 1)) * (parryPerfect ? 1.35 : 1.0);
      g.gain.setValueAtTime(amp, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + ringDur * (1 - idx * 0.12));

      osc.connect(g);
      g.connect(this.sfxBus);
      osc.start(now);
      osc.stop(now + ringDur + 0.02);
    });

    // Metallic transient impact snap
    const snap = ctx.createBufferSource();
    snap.buffer = this.noiseBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2400;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.28, now);
    sg.gain.exponentialRampToValueAtTime(0.002, now + 0.055);
    snap.connect(hp);
    hp.connect(sg);
    sg.connect(this.sfxBus);
    snap.start(now, 0, 0.06);
  }

  public playHit(critical = false): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus || !this.noiseBuf) return;
    const now = ctx.currentTime;

    // 1. Deep visceral body impact thud
    const body = ctx.createOscillator();
    const bg = ctx.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(critical ? 175 : 135, now);
    body.frequency.exponentialRampToValueAtTime(34, now + (critical ? 0.24 : 0.16));
    bg.gain.setValueAtTime(critical ? 0.42 : 0.32, now);
    bg.gain.exponentialRampToValueAtTime(0.002, now + (critical ? 0.26 : 0.18));
    body.connect(bg);
    bg.connect(this.sfxBus);
    body.start(now);
    body.stop(now + 0.28);

    // 2. Flesh/leather slash crunch
    const slice = ctx.createBufferSource();
    slice.buffer = this.noiseBuf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(critical ? 1350 : 950, now);
    flt.Q.value = 1.4;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(critical ? 0.32 : 0.22, now);
    sg.gain.exponentialRampToValueAtTime(0.002, now + 0.12);
    slice.connect(flt);
    flt.connect(sg);
    sg.connect(this.sfxBus);
    slice.start(now, 0.2, 0.13);

    // 3. Formant-Synthesized Barbarian Pain Grunt ("UGH!" / "AAARGH!")
    this.triggerBarbarianGrunt(now + 0.02, critical ? 108 : 122, critical ? 0.22 : 0.13);
  }

  private triggerBarbarianGrunt(t: number, pitchHz: number, dur: number): void {
    if (!this.ctx || !this.sfxBus) return;
    const glottis = this.ctx.createOscillator();
    glottis.type = 'sawtooth';
    glottis.frequency.setValueAtTime(pitchHz, t);
    glottis.frequency.exponentialRampToValueAtTime(pitchHz * 0.72, t + dur);

    // Two vocal tract formants (F1 ~ 620Hz, F2 ~ 1150Hz for open guttural "AAH/UGH")
    const f1 = this.ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.value = 620;
    f1.Q.value = 4.5;

    const f2 = this.ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.value = 1150;
    f2.Q.value = 5.0;

    const vg = this.ctx.createGain();
    vg.gain.setValueAtTime(0.01, t);
    vg.gain.linearRampToValueAtTime(0.18, t + 0.025);
    vg.gain.exponentialRampToValueAtTime(0.002, t + dur);

    glottis.connect(f1);
    glottis.connect(f2);
    f1.connect(vg);
    f2.connect(vg);
    vg.connect(this.sfxBus);

    glottis.start(t);
    glottis.stop(t + dur + 0.02);
  }

  public playRoll(): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus || !this.noiseBuf) return;
    const now = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(520, now);
    lp.frequency.exponentialRampToValueAtTime(180, now + 0.16);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.16, now);
    g.gain.exponentialRampToValueAtTime(0.002, now + 0.17);
    src.connect(lp);
    lp.connect(g);
    g.connect(this.sfxBus);
    src.start(now, 0.5, 0.18);
  }

  public playJump(): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus) return;
    const now = ctx.currentTime;
    this.triggerBarbarianGrunt(now, 136, 0.08);
  }

  public playKnockdown(): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus) return;
    const now = ctx.currentTime;
    this.triggerWarDrum(now, 105, 28, 0.35);
  }

  public playThunder(): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus || !this.noiseBuf) return;
    const now = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(980, now);
    lp.frequency.exponentialRampToValueAtTime(95, now + 0.85);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.28, now);
    g.gain.exponentialRampToValueAtTime(0.002, now + 0.9);

    src.connect(lp);
    lp.connect(g);
    g.connect(this.sfxBus);
    src.start(now, 0, 0.95);
  }

  public playDecapitation(): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus) return;
    const now = ctx.currentTime;

    // 1. Razor severing steel flash + sub drop
    this.playClash(true);
    this.triggerWarDrum(now, 140, 26, 0.45);
    this.triggerBarbarianGrunt(now + 0.03, 94, 0.38);

    // 2. Dramatic Dark-Brass Stinger (D minor -> Bb -> A5 -> D5!)
    const fanfare = [293.66, 349.23, 440.0, 587.33];
    fanfare.forEach((freq, i) => {
      if (!this.sfxBus) return;
      const osc = ctx.createOscillator();
      const flt = ctx.createBiquadFilter();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + 0.08 + i * 0.075);
      flt.type = 'lowpass';
      flt.frequency.value = 1900;
      g.gain.setValueAtTime(0.16, now + 0.08 + i * 0.075);
      g.gain.exponentialRampToValueAtTime(0.002, now + 0.08 + i * 0.075 + 0.38);
      osc.connect(flt);
      flt.connect(g);
      g.connect(this.sfxBus);
      osc.start(now + 0.08 + i * 0.075);
      osc.stop(now + 0.08 + i * 0.075 + 0.4);
    });
  }

  public playGoblinLaugh(): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus) return;
    const now = ctx.currentTime;

    // Raspy nasal goblin cackle ("HEH-HEH-HEH-HEH!")
    const pitches = [390, 470, 360, 455, 330];
    pitches.forEach((p, idx) => {
      if (!this.sfxBus) return;
      const t = now + idx * 0.085;
      const osc = ctx.createOscillator();
      const nasal = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(p, t);
      osc.frequency.exponentialRampToValueAtTime(p * 0.82, t + 0.065);

      nasal.type = 'bandpass';
      nasal.frequency.value = 1650;
      nasal.Q.value = 3.5;

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.002, t + 0.07);

      osc.connect(nasal);
      nasal.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(t);
      osc.stop(t + 0.075);
    });
  }

  public playMagicCast(): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus) return;
    const now = ctx.currentTime;

    [220, 277.18, 329.63].forEach((f, idx) => {
      if (!this.sfxBus) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 2.1, now + 0.26);
      g.gain.setValueAtTime(0.09, now + idx * 0.02);
      g.gain.exponentialRampToValueAtTime(0.002, now + 0.28);
      osc.connect(g);
      g.connect(this.sfxBus);
      osc.start(now + idx * 0.02);
      osc.stop(now + 0.3);
    });
  }

  public playFanfare(win: boolean): void {
    if (this.sfxVol <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus) return;
    const now = ctx.currentTime;
    const melody = win
      ? [293.66, 369.99, 440.0, 587.33]
      : [311.13, 293.66, 261.63, 220.0];
    melody.forEach((freq, i) => {
      if (!this.sfxBus) return;
      const t = now + i * 0.13;
      const osc = ctx.createOscillator();
      const flt = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      flt.type = 'lowpass';
      flt.frequency.value = 1800;
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.002, t + 0.34);
      osc.connect(flt);
      flt.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }
}

export const akaAudio = new GamebuinoAkaAudio();
