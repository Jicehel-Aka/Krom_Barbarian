// ============================================================================
// Krom : Le Glaive d'Acier — Standalone Native Firmware for Gamebuino AKA
// Target: ESP32-S3R8 (8MB PSRAM / 8MB Flash) · ST7789V 320x240 Non-Touch LCD
// SDK: Official Gamebuino-AKA + aka_runtime + aka_font
// ============================================================================

#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>

#include "esp_heap_caps.h"
#include "gamebuino.h"
#include "gb_audio_player.h"
#include "gb_audio_track_tone.h"
#include "gb_common.h"
#include "gb_core.h"
#include "gb_graphics.h"
#include "aka_runtime/aka_runtime.h"
#include "aka_font/gb_text_render.h"
#include "core/input.h"

#include "krom_assets.h"

// Required non-static globals referenced by aka_runtime.cpp and core/input.cpp
gb_core g_core;
gb_graphics gfx;

namespace {

// ============================================================================
// 1. AUDIO ENGINE — 4-Track Hardware Mixer + 16-Section Song Arrangement
//    Plays core Theme/Verse parts multiple times & inserts Calm/Epic Bridges
//    periodically before relaunching the Main Theme!
// ============================================================================

static gb_audio_player g_audio;
static gb_audio_track_tone g_trackLead;
static gb_audio_track_tone g_trackBass;
static gb_audio_track_tone g_trackDrums;
static gb_audio_track_tone g_trackSfx;

static float g_musicScale = 0.55f;
static float g_sfxScale = 0.80f;

static void applyAudioVolumes(uint8_t musicPct, uint8_t sfxPct) {
    g_musicScale = (musicPct > 100 ? 100 : musicPct) / 100.0f;
    g_sfxScale = (sfxPct > 100 ? 100 : sfxPct) / 100.0f;
    g_trackLead.set_track_volume(0.42f * g_musicScale);
    g_trackBass.set_track_volume(0.46f * g_musicScale);
    g_trackDrums.set_track_volume(0.34f * g_musicScale);
    g_trackSfx.set_track_volume(0.85f * g_sfxScale);
}

static void onSystemVolumeChanged(uint8_t musicVol, uint8_t sfxVol) {
    applyAudioVolumes(musicVol, sfxVol);
}

static inline float midiToFreq(uint8_t midi) {
    if (midi == 0) return 0.0f;
    return 440.0f * std::pow(2.0f, (static_cast<int>(midi) - 69) / 12.0f);
}

enum MusicId : uint8_t {
    MUS_TITLE = 0,
    MUS_FOREST = 1,
    MUS_CRYPT = 2,
    MUS_ARENA = 3,
    MUS_SANCTUARY = 4,
    MUS_COUNT = 5
};

enum SectionRole : uint8_t {
    ROLE_THEME = 0,
    ROLE_VERSE = 1,
    ROLE_BRIDGE_CALM = 2,
    ROLE_BRIDGE_EPIC = 3,
    ROLE_CLIMAX = 4,
    ROLE_CODA = 5
};

struct SongSlot {
    uint8_t part;       // 0..7 (each part = 32 steps)
    uint8_t role;       // SectionRole
    uint8_t leadWave;   // 0 = SQUARE, 1 = TRIANGLE, 2 = SINE
    bool withCounter;   // Weave bardic counter-notes in rests / bridges
    bool pickupFill;    // Drum/timpani roll in steps 24..31 to relaunch Theme A
};

struct SongData {
    uint16_t stepMs;
    SongSlot arrangement[16]; // 16 x 32 = 512 steps (~70-95s full song form!)
    uint8_t bass[256];        // 8 x 32-step parts
    uint8_t lead[256];        // 8 x 32-step parts
    uint8_t counter[64];      // Lute/harp counter-arpeggio
    const char* drumMain;     // 16-step groove
    const char* drumBridge;   // 16-step calm bridge groove
    const char* drumFill;     // 8-step relaunch fill
};

static const SongData SONGS[MUS_COUNT] = {
    // 0. TITLE — "Anvil of Krom" (~94s structured song)
    {
        184,
        {
            {0, ROLE_THEME, 0, false, false},       // Theme A
            {1, ROLE_THEME, 0, false, false},       // Answer A'
            {0, ROLE_THEME, 0, true,  false},       // Theme A + Counter
            {2, ROLE_VERSE, 1, true,  true},        // Verse B
            {0, ROLE_THEME, 0, false, false},       // Theme A
            {1, ROLE_THEME, 0, true,  false},       // Answer A'
            {3, ROLE_BRIDGE_CALM, 1, true, true},   // PONT 1 (Calm Lute Bridge -> Pickup!)
            {0, ROLE_THEME, 0, true,  false},       // Triumphant Return to Theme A!
            {2, ROLE_VERSE, 0, true,  false},       // Verse B (Brass)
            {4, ROLE_VERSE, 1, true,  true},        // Rising Storm B'
            {5, ROLE_CLIMAX, 0, true, false},       // Climax A''
            {0, ROLE_THEME, 1, true,  false},       // Theme A (Highland Horn)
            {6, ROLE_BRIDGE_EPIC, 1, true, true},   // PONT 2 (Counterpoint Bridge -> Pickup!)
            {0, ROLE_THEME, 0, false, false},       // Bold Return to Theme A
            {1, ROLE_THEME, 0, true,  false},       // Final Answer A'
            {7, ROLE_CODA,  0, false, false},       // Noble Coda & Breath
        },
        {
            38,0,38,38,45,0,38,0,41,0,41,43,45,0,38,0, 38,0,38,38,45,0,46,0,43,0,41,0,36,0,38,0,
            46,0,46,46,41,0,41,0,48,0,48,48,43,0,45,0, 39,0,39,41,43,0,36,0,38,38,45,0,38,0,26,0,
            46,0,53,0,46,0,45,0,41,0,48,0,41,0,40,0,   43,0,50,0,43,0,41,0,45,0,52,0,45,0,33,0,
            38,0,0,0,45,0,0,0,43,0,0,0,41,0,0,0,       36,0,0,0,43,0,0,0,33,0,0,0,45,0,33,0,
            43,0,43,50,43,0,41,0,39,0,39,46,39,0,38,0, 36,0,36,43,34,0,34,41,33,0,45,0,33,33,37,0,
            38,38,50,38,45,0,38,0,46,46,58,46,41,0,48,0, 43,43,55,43,36,0,48,0,45,0,33,0,38,0,50,0,
            38,0,45,0,36,0,43,0,34,0,41,0,33,0,40,0,   43,0,50,0,41,0,48,0,36,0,43,0,33,0,45,0,
            39,0,46,0,43,0,38,0,36,0,43,0,33,0,45,0,   38,0,45,0,50,0,38,0,26,0,0,0,0,0,0,0
        },
        {
            62,0,0,62,69,0,67,65,62,0,65,67,69,0,0,0,  62,0,0,69,74,0,72,70,69,0,67,65,64,0,62,0,
            70,0,70,72,74,0,69,0,72,0,72,74,76,0,73,0, 74,0,70,0,67,0,65,64,62,0,69,0,62,0,0,0,
            65,0,0,69,70,0,74,0,72,0,0,69,65,0,0,0,    67,0,70,74,72,0,69,67,69,0,0,0,64,0,0,0,
            74,0,69,0,65,0,69,0,71,0,67,0,65,0,0,0,    72,0,67,0,64,0,67,0,62,0,0,0,0,0,0,0,
            67,0,70,69,67,0,62,0,67,0,70,74,75,0,74,70, 72,0,67,65,65,0,70,69,69,0,73,76,73,0,0,0,
            74,0,0,74,81,0,79,77,74,0,77,79,81,0,77,0, 79,0,76,74,72,0,76,72,69,0,73,0,74,0,0,0,
            74,72,69,0,72,69,67,0,70,69,65,0,69,64,61,0, 67,0,70,74,72,0,69,65,67,0,64,60,69,0,0,0,
            70,0,67,65,67,0,62,0,64,0,67,64,61,0,69,0, 62,0,0,69,62,0,0,0,0,0,0,0,0,0,0,0
        },
        {
            0,57,62,0,0,57,65,0,0,57,60,0,0,57,62,0, 0,57,62,0,0,58,62,0,0,55,60,0,0,52,57,0,
            58,62,65,62,57,60,65,60,55,60,64,60,57,61,64,0, 50,57,62,65,50,57,62,0,48,55,60,64,50,57,62,0
        },
        "K..KK.T.K.T.S.T.", "K.....H...T...H.", "K.T.T.SS"
    },
    // 1. FOREST — "Wilderness of Doom" (~77s structured song)
    {
        150,
        {
            {0, ROLE_THEME, 1, false, false},
            {1, ROLE_THEME, 1, false, false},
            {0, ROLE_THEME, 1, true,  false},
            {2, ROLE_VERSE, 0, true,  true},
            {0, ROLE_THEME, 1, false, false},
            {1, ROLE_THEME, 1, true,  false},
            {3, ROLE_BRIDGE_CALM, 2, true, true},
            {0, ROLE_THEME, 0, true,  false},
            {2, ROLE_VERSE, 0, true,  false},
            {4, ROLE_VERSE, 1, true,  true},
            {5, ROLE_CLIMAX, 0, true, false},
            {0, ROLE_THEME, 1, false, false},
            {6, ROLE_BRIDGE_EPIC, 1, true, true},
            {0, ROLE_THEME, 1, true,  false},
            {1, ROLE_THEME, 0, true,  false},
            {7, ROLE_CODA,  1, false, false},
        },
        {
            38,38,50,38,38,48,38,45,38,38,50,38,41,0,43,0, 38,38,50,38,38,48,38,45,36,36,48,36,38,0,38,0,
            46,46,58,46,43,43,55,43,48,48,60,48,45,0,45,43, 41,41,53,41,39,39,51,39,45,45,33,33,38,0,38,0,
            41,0,41,53,36,0,36,48,43,0,43,55,38,0,45,0,   41,0,41,53,48,0,43,0,45,0,33,0,38,0,26,0,
            38,0,0,45,0,0,50,0,43,0,0,50,0,0,47,0,        36,0,0,43,0,0,48,0,33,0,45,0,33,0,40,0,
            38,0,50,0,47,0,43,0,36,0,48,0,45,0,43,40,     38,0,50,0,43,0,47,0,48,0,45,0,38,0,38,0,
            46,46,58,46,48,48,60,48,50,50,38,38,50,0,48,45, 43,43,55,43,41,41,53,41,45,45,33,33,38,38,50,0,
            38,0,45,38,36,0,43,36,43,0,50,43,41,0,48,41,  39,0,46,39,36,0,43,36,33,0,45,0,38,0,45,0,
            38,0,50,0,43,0,47,0,36,0,48,0,33,0,45,0,      38,0,45,0,38,0,0,0,26,0,0,0,0,0,0,0
        },
        {
            62,0,65,67,69,0,67,65,64,0,60,0,62,0,0,0,     62,0,65,67,74,0,72,69,71,0,67,69,62,0,0,0,
            70,0,69,67,65,0,62,0,72,0,70,69,69,0,73,0,    74,0,72,70,69,67,65,64,65,0,64,61,62,0,0,0,
            65,0,0,69,67,0,0,64,67,0,70,69,65,0,62,0,     65,0,69,72,76,0,74,72,69,0,67,64,62,0,0,0,
            74,0,69,0,71,0,67,0,69,0,62,0,67,0,0,0,       72,0,67,0,64,0,60,0,62,0,0,0,0,0,0,0,
            62,65,69,0,71,0,67,0,72,71,69,67,69,0,0,0,    74,0,71,69,67,69,71,74,76,0,72,69,74,0,0,0,
            70,0,74,77,76,0,72,67,74,0,77,81,79,0,76,74,  71,0,74,71,69,0,65,62,69,0,73,76,74,0,0,0,
            69,0,65,62,67,0,64,60,71,0,67,62,69,0,65,60,  67,65,63,62,64,0,60,0,61,0,64,69,62,0,0,0,
            62,0,69,0,71,0,67,0,64,0,67,64,61,0,64,0,     62,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0
        },
        {
            0,57,0,62,0,57,0,64,0,59,0,62,0,57,60,0,      50,57,62,57,48,55,60,55,47,55,59,55,50,57,62,0,
            0,62,65,0,0,60,64,0,0,59,62,0,0,57,61,0,      50,57,62,69,55,59,62,67,48,55,60,64,50,57,62,0
        },
        "K.H.T.H.K.T.S.T.", "K...H...T...H...", "T.T.K.SS"
    },
    // 2. CRYPT — "Catacombs of Vorgath" (~88s structured song)
    {
        172,
        {
            {0, ROLE_THEME, 0, false, false},
            {1, ROLE_THEME, 0, false, false},
            {0, ROLE_THEME, 0, true,  false},
            {2, ROLE_VERSE, 1, true,  true},
            {0, ROLE_THEME, 0, false, false},
            {1, ROLE_THEME, 1, true,  false},
            {3, ROLE_BRIDGE_CALM, 2, true, true},
            {0, ROLE_THEME, 0, true,  false},
            {2, ROLE_VERSE, 1, true,  false},
            {4, ROLE_VERSE, 1, true,  true},
            {5, ROLE_CLIMAX, 0, true, false},
            {0, ROLE_THEME, 0, false, false},
            {6, ROLE_BRIDGE_EPIC, 0, true, true},
            {0, ROLE_THEME, 0, true,  false},
            {1, ROLE_THEME, 0, true,  false},
            {7, ROLE_CODA,  0, false, false},
        },
        {
            36,0,36,48,37,0,36,0,36,0,43,0,41,0,37,0,     36,0,36,48,44,0,43,0,41,0,39,0,37,0,36,0,
            41,0,41,53,44,0,41,0,39,0,39,51,37,0,36,0,    43,0,44,0,41,0,37,0,36,36,43,0,36,0,24,0,
            41,0,44,0,46,0,49,0,39,0,43,0,44,0,32,0,      37,0,41,0,36,0,39,0,43,0,31,0,36,0,0,0,
            36,0,0,0,37,0,0,0,41,0,0,0,43,0,0,0,          44,0,0,0,37,0,0,0,31,0,0,0,36,0,0,0,
            44,0,51,0,39,0,46,0,41,0,48,0,43,0,31,0,      44,0,43,0,41,0,39,0,37,0,41,0,43,0,31,0,
            36,36,48,36,37,37,49,37,41,41,53,41,43,0,31,0, 44,44,56,44,41,41,53,41,43,0,37,0,36,0,48,0,
            41,0,48,41,39,0,46,39,37,0,44,37,36,0,43,36,  34,0,41,34,32,0,44,32,31,0,43,0,36,0,0,0,
            37,0,44,0,36,0,43,0,31,0,43,0,36,0,48,0,      36,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0
        },
        {
            60,0,61,64,67,0,65,64,61,0,60,0,0,0,58,0,     60,0,64,67,68,0,67,65,64,0,61,60,60,0,0,0,
            65,0,68,72,70,0,68,65,67,0,64,61,60,0,0,0,    67,68,67,65,64,0,61,0,60,0,67,0,60,0,0,0,
            65,68,72,68,70,73,70,65,67,70,75,70,68,72,68,63, 65,68,73,72,68,67,65,63,62,65,68,71,72,0,0,0,
            72,0,0,67,68,0,0,65,65,0,72,0,67,0,0,0,       68,0,65,0,61,0,65,0,64,0,0,0,60,0,0,0,
            68,0,0,72,75,0,70,0,72,0,68,65,67,0,0,0,      68,0,72,75,77,0,75,72,73,0,72,68,67,0,0,0,
            72,0,73,76,79,0,77,76,77,0,72,68,67,0,71,0,   72,0,77,76,73,0,72,68,67,0,64,61,60,0,0,0,
            77,72,68,72,75,70,67,70,73,68,65,68,72,67,64,67, 70,65,61,65,68,63,60,63,67,0,64,61,60,0,0,0,
            61,0,65,68,67,0,64,60,62,0,65,67,64,0,0,0,    60,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0
        },
        {
            0,55,60,0,0,56,61,0,0,55,60,0,0,53,56,0,      48,55,60,64,49,56,61,65,53,56,60,65,48,55,60,0,
            0,60,63,0,0,58,63,0,0,56,60,0,0,55,59,0,      49,56,61,0,48,55,60,0,47,55,59,0,48,55,60,0
        },
        "K...T.H.K..KS...", "K.......T...H...", "K...T.TS"
    },
    // 3. ARENA — "Blood & Sand Coliseum" (~70s structured song)
    {
        136,
        {
            {0, ROLE_THEME, 0, false, false},
            {1, ROLE_THEME, 0, false, false},
            {0, ROLE_THEME, 0, true,  false},
            {2, ROLE_VERSE, 1, true,  true},
            {0, ROLE_THEME, 0, false, false},
            {1, ROLE_THEME, 1, true,  false},
            {3, ROLE_BRIDGE_CALM, 2, true, true},
            {0, ROLE_THEME, 0, true,  false},
            {2, ROLE_VERSE, 1, true,  false},
            {4, ROLE_VERSE, 1, true,  true},
            {5, ROLE_CLIMAX, 0, true, false},
            {0, ROLE_THEME, 1, false, false},
            {6, ROLE_BRIDGE_EPIC, 0, true, true},
            {0, ROLE_THEME, 0, true,  false},
            {1, ROLE_THEME, 0, true,  false},
            {7, ROLE_CODA,  0, false, false},
        },
        {
            40,40,40,52,40,40,41,43,40,40,40,52,45,0,43,41, 40,40,40,52,40,40,47,45,43,43,41,41,40,0,40,0,
            45,45,57,45,43,43,55,43,41,41,53,41,40,0,47,0,  48,48,47,47,45,45,43,41,40,40,47,40,40,0,28,0,
            43,0,43,55,38,0,38,50,45,0,45,57,47,0,35,0,     48,0,48,60,43,0,43,55,47,0,47,35,40,0,0,0,
            40,0,52,0,0,40,43,0,40,0,52,0,41,0,43,0,        40,0,52,0,0,40,47,0,41,0,38,0,40,0,0,0,
            45,0,45,57,41,0,41,53,38,0,38,50,40,0,44,0,     45,0,47,0,48,0,45,0,41,0,38,0,40,40,44,0,
            40,40,52,40,43,43,55,43,45,45,57,45,48,0,47,0,  45,45,43,43,41,41,40,40,47,47,35,35,40,0,52,0,
            48,0,48,47,45,0,45,43,41,0,41,40,47,0,35,0,     43,0,45,0,47,0,48,0,41,0,47,0,40,0,0,0,
            41,0,48,0,40,0,47,0,41,0,38,0,40,0,52,0,        40,0,40,0,28,0,0,0,0,0,0,0,0,0,0,0
        },
        {
            64,0,64,65,67,0,71,0,69,67,65,64,65,0,0,0,      64,0,67,71,72,0,71,69,67,0,65,64,64,0,0,0,
            69,0,72,76,74,0,71,67,65,0,69,72,71,0,0,0,      72,71,69,67,69,67,65,64,65,67,71,0,64,0,0,0,
            67,0,71,74,74,0,69,0,72,0,69,64,71,0,0,0,       72,0,76,79,74,0,71,67,71,0,75,78,76,0,0,0,
            64,0,0,65,0,0,67,0,0,0,71,0,65,0,0,0,           64,0,0,72,0,0,71,0,65,0,62,0,64,0,0,0,
            69,0,0,72,76,0,72,69,74,0,71,69,68,0,0,0,       69,0,71,72,76,0,74,72,71,0,69,65,68,0,71,0,
            76,0,76,77,79,0,76,74,76,0,79,81,84,0,83,79,    81,79,76,74,72,71,69,67,71,0,75,0,76,0,0,0,
            76,72,69,0,74,71,67,0,72,69,65,0,71,68,64,0,    67,71,74,0,69,72,76,0,65,69,71,0,64,0,0,0,
            65,0,69,65,64,0,71,0,65,0,62,65,64,0,0,0,       64,0,52,0,64,0,0,0,0,0,0,0,0,0,0,0
        },
        {
            0,59,64,0,0,59,65,0,0,59,64,0,0,57,60,0,        52,59,64,59,55,59,62,59,57,60,64,60,52,56,59,0,
            0,64,67,0,0,62,66,0,0,60,64,0,0,59,63,0,        53,57,60,0,52,55,59,0,53,57,62,0,52,56,59,0
        },
        "K.T.S.T.K.K.S.TT", "K..T..T.K..T..H.", "T.TTK.SS"
    },
    // 4. SANCTUARY — "Altar of Seigneur Drax" (~66s structured song)
    {
        128,
        {
            {0, ROLE_THEME, 0, false, false},
            {1, ROLE_THEME, 0, false, false},
            {0, ROLE_THEME, 1, true,  false},
            {2, ROLE_VERSE, 1, true,  true},
            {0, ROLE_THEME, 0, false, false},
            {1, ROLE_THEME, 0, true,  false},
            {3, ROLE_BRIDGE_CALM, 2, true, true},
            {0, ROLE_THEME, 0, true,  false},
            {2, ROLE_VERSE, 1, true,  false},
            {4, ROLE_VERSE, 0, true,  true},
            {5, ROLE_CLIMAX, 0, true, false},
            {0, ROLE_THEME, 0, true,  false},
            {6, ROLE_BRIDGE_EPIC, 0, true, true},
            {0, ROLE_THEME, 1, true,  false},
            {1, ROLE_THEME, 0, true,  false},
            {7, ROLE_CODA,  0, false, false},
        },
        {
            42,42,54,42,42,54,45,42,41,41,53,41,37,37,49,37, 42,42,54,42,47,47,59,47,49,49,41,41,42,0,42,0,
            38,38,50,38,40,40,52,40,42,42,54,42,45,45,44,42, 47,47,45,45,44,44,41,41,42,42,49,42,42,0,30,0,
            45,0,45,57,40,0,40,52,38,0,38,50,37,0,49,0,      38,0,38,50,42,0,42,54,44,0,37,0,42,0,30,0,
            42,0,0,0,38,0,0,0,47,0,0,0,37,0,0,0,             42,0,0,0,40,0,0,0,38,0,37,0,42,0,0,0,
            47,0,47,59,49,0,37,49,50,0,38,50,49,0,37,49,     42,0,44,0,45,0,38,0,47,0,37,0,49,0,37,0,
            42,42,54,42,38,38,50,38,40,40,52,40,45,0,44,0,   47,47,59,47,42,42,54,42,37,37,49,37,42,0,54,0,
            42,0,54,42,40,0,52,40,38,0,50,38,37,0,49,37,     47,0,45,0,44,0,41,0,42,0,37,0,42,0,0,0,
            38,0,50,0,37,0,49,0,42,0,49,0,54,0,42,0,         30,0,42,0,30,0,0,0,0,0,0,0,0,0,0,0
        },
        {
            66,0,69,73,78,0,73,69,65,0,68,73,77,0,73,68,     66,0,73,78,76,74,73,71,73,0,68,65,66,0,0,0,
            74,0,71,69,76,0,73,71,78,0,73,69,81,0,80,78,     74,73,71,69,68,0,73,77,78,0,73,0,66,0,0,0,
            73,0,0,76,76,0,71,0,74,0,0,69,68,0,0,0,          74,0,78,76,73,0,69,66,68,0,73,77,78,0,0,0,
            78,0,73,0,74,0,69,0,71,0,66,0,68,0,0,0,          73,0,69,0,71,0,68,0,66,0,0,0,0,0,0,0,
            71,0,74,78,77,0,73,68,74,0,78,81,80,0,77,73,     78,0,76,0,73,0,74,0,71,0,77,0,73,0,0,0,
            78,0,0,78,81,0,78,74,76,0,80,76,73,0,76,0,       74,0,71,74,73,0,69,66,68,0,73,77,78,0,0,0,
            78,73,69,73,76,71,68,71,74,69,66,69,73,68,65,68, 71,74,78,0,68,73,77,0,78,0,73,68,66,0,0,0,
            74,0,69,66,68,0,65,0,66,0,73,0,78,0,0,0,         66,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0
        },
        {
            0,61,66,0,0,61,68,0,0,62,66,0,0,61,65,0,         54,61,66,61,50,57,62,57,52,56,59,56,49,56,61,0,
            0,66,69,0,0,64,68,0,0,62,66,0,0,61,65,0,         50,57,62,0,49,56,61,0,54,57,61,0,54,61,66,0
        },
        "K.K.S.K.K.T.S.TS", "K.......T.....H.", "K.T.S.SS"
    }
};

static MusicId g_curMusic = MUS_TITLE;
static uint32_t g_songStep = 0;
static uint32_t g_lastStepMs = 0;

static void setMusicTrack(MusicId id) {
    if (g_curMusic == id) return;
    g_curMusic = id;
    g_songStep = 0;
    g_lastStepMs = g_core.get_millis();
}

static void stepMusicSequencer(uint32_t nowMs) {
    if (g_musicScale <= 0.01f) return;
    const SongData& s = SONGS[g_curMusic];
    if (nowMs - g_lastStepMs < s.stepMs) return;
    g_lastStepMs = nowMs;

    const uint32_t totalSongSteps = 16 * 32;
    const uint32_t step = g_songStep % totalSongSteps;
    g_songStep = (g_songStep + 1) % totalSongSteps;

    const uint8_t slotIdx = (step / 32) & 15;
    const SongSlot& slot = s.arrangement[slotIdx];
    const uint8_t localStep = step & 31;
    const uint16_t partStep = static_cast<uint16_t>(slot.part) * 32 + localStep;

    const bool isCalmBridge = (slot.role == ROLE_BRIDGE_CALM);
    const bool isEpicBridge = (slot.role == ROLE_BRIDGE_EPIC);
    const bool isCodaTail = (slot.role == ROLE_CODA && localStep >= 20);

    // 1. Lead melody with multi-step legato hold
    uint8_t leadNote = s.lead[partStep];
    if (leadNote > 0) {
        uint8_t hold = 1;
        while (hold < 4 && (localStep + hold) < 32 && ((localStep + hold) & 7) != 0 &&
               s.lead[partStep + hold] == 0) {
            hold++;
        }
        uint16_t durMs = static_cast<uint16_t>(s.stepMs * hold * 0.90f);
        auto wave = gb_audio_track_tone::SQUARE;
        if (slot.leadWave == 1) wave = gb_audio_track_tone::TRIANGLE;
        else if (slot.leadWave == 2) wave = gb_audio_track_tone::SINE;
        float f = midiToFreq(leadNote);
        g_trackLead.play_tone(f, f * 0.998f, isCalmBridge ? 0.55f : 0.72f, 0.08f, durMs, wave);
    } else if (!isCodaTail && (slot.withCounter || isCalmBridge || isEpicBridge)) {
        // Weave delicate lute/harp counter-arpeggio into lead rests & bridges!
        uint8_t cntIdx = ((slotIdx & 1) * 32 + localStep) & 63;
        uint8_t cntNote = s.counter[cntIdx];
        if (cntNote > 0) {
            float cf = midiToFreq(cntNote);
            g_trackLead.play_tone(cf, cf, isCalmBridge ? 0.50f : 0.34f, 0.04f,
                                  static_cast<uint16_t>(s.stepMs * 1.3f),
                                  gb_audio_track_tone::TRIANGLE);
        }
    }

    // 2. Bassline with open-pedal sustain
    uint8_t bassNote = s.bass[partStep];
    if (bassNote > 0) {
        uint8_t hold = 1;
        while (hold < 4 && (localStep + hold) < 32 && ((localStep + hold) & 7) != 0 &&
               s.bass[partStep + hold] == 0) {
            hold++;
        }
        uint16_t durMs = static_cast<uint16_t>(s.stepMs * (0.85f + (hold - 1) * 0.65f));
        float bf = midiToFreq(bassNote);
        g_trackBass.play_tone(bf, bf * 0.99f, isCalmBridge ? 0.58f : 0.78f, 0.12f, durMs,
                              isCalmBridge ? gb_audio_track_tone::TRIANGLE : gb_audio_track_tone::SQUARE);
    }

    // 3. Dynamic Percussion & Bridge Relaunch Fills
    if (isCodaTail) {
        if (localStep == 20 || localStep == 24) {
            g_trackDrums.play_tone(92.0f, 34.0f, 0.70f, 0.02f, 130, gb_audio_track_tone::SINE);
        }
        return;
    }

    const bool inPickup = slot.pickupFill && (localStep >= 24);
    char d = '.';
    if (inPickup) {
        d = s.drumFill[localStep - 24];
    } else if (isCalmBridge) {
        d = s.drumBridge[localStep & 15];
    } else if (isEpicBridge) {
        d = s.drumBridge[(localStep + 8) & 15];
    } else {
        d = s.drumMain[localStep & 15];
    }

    if (d == 'K') {
        g_trackDrums.play_tone(96.0f, 36.0f, isCalmBridge ? 0.50f : 0.75f, 0.02f, 115,
                               gb_audio_track_tone::SINE);
    } else if (d == 'T') {
        float tp = ((localStep & 3) == 2) ? 142.0f : 114.0f;
        g_trackDrums.play_tone(tp, 54.0f, inPickup ? 0.72f : 0.52f, 0.02f, 95,
                               gb_audio_track_tone::SINE);
    } else if (d == 'S') {
        g_trackDrums.play_tone(1200.0f, 420.0f, 0.58f, 0.01f, 85, gb_audio_track_tone::NOISE);
    } else if (d == 'H') {
        g_trackDrums.play_tone(3200.0f, 1800.0f, 0.24f, 0.01f, 35, gb_audio_track_tone::NOISE);
    }
}

// Visceral Sword & Combat SFX
static void sfxMenu(bool confirm) {
    if (g_sfxScale <= 0.01f) return;
    if (confirm) {
        g_trackSfx.play_tone(587.0f, 1174.0f, 0.75f, 0.05f, 110, gb_audio_track_tone::TRIANGLE);
    } else {
        g_trackSfx.play_tone(523.0f, 784.0f, 0.55f, 0.04f, 55, gb_audio_track_tone::TRIANGLE);
    }
}

static void sfxSwing(bool heavy) {
    if (g_sfxScale <= 0.01f) return;
    g_trackSfx.play_tone(heavy ? 520.0f : 860.0f, heavy ? 170.0f : 280.0f,
                         heavy ? 0.80f : 0.60f, 0.02f, heavy ? 155 : 95,
                         gb_audio_track_tone::NOISE);
}

static void sfxClash(bool perfectParry) {
    if (g_sfxScale <= 0.01f) return;
    g_trackSfx.play_tone(perfectParry ? 1480.0f : 980.0f, perfectParry ? 1960.0f : 740.0f,
                         0.92f, 0.05f, perfectParry ? 220 : 140,
                         gb_audio_track_tone::SQUARE);
}

static void sfxHit(bool critical) {
    if (g_sfxScale <= 0.01f) return;
    g_trackSfx.play_tone(critical ? 195.0f : 145.0f, 36.0f, 0.95f, 0.04f,
                         critical ? 190 : 130, gb_audio_track_tone::SQUARE);
    if (critical) {
        g_audio.vibrator(45);
    }
}

static void sfxDecapitate() {
    if (g_sfxScale <= 0.01f) return;
    g_trackSfx.play_tone(1680.0f, 220.0f, 1.0f, 0.08f, 340, gb_audio_track_tone::SQUARE);
    g_audio.vibrator(90);
}

static void sfxGoblinLaugh() {
    if (g_sfxScale <= 0.01f) return;
    g_trackSfx.play_tone(460.0f, 330.0f, 0.72f, 0.05f, 150, gb_audio_track_tone::SQUARE);
}

// ============================================================================
// 2. PSRAM ASSET UNPACKER & FAST 320x240 BLITTER (WITH HORIZONTAL MIRRORING)
// ============================================================================

struct UnpackedSprite {
    uint16_t w;
    uint16_t h;
    int16_t ax;
    uint16_t* pixels;
};

static uint16_t* g_stageBuffers[4] = {nullptr, nullptr, nullptr, nullptr};
static UnpackedSprite g_sprites[TOTAL_PACKED_SPRITES];

static void* allocAssetRam(size_t bytes) {
    void* p = heap_caps_malloc(bytes, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT);
    if (!p) p = std::malloc(bytes);
    return p;
}

static void unpackAllAssetsToPsram() {
    for (int s = 0; s < 4; ++s) {
        constexpr size_t totalPx = 320 * 240;
        uint16_t* buf = static_cast<uint16_t*>(allocAssetRam(totalPx * sizeof(uint16_t)));
        const uint16_t* pal = PACKED_STAGES[s].palette256;
        const uint8_t* rle = PACKED_STAGES[s].rleIndices;
        const uint32_t rleLen = PACKED_STAGES[s].rleLen;
        if (buf) {
            size_t outIdx = 0;
            uint32_t rPos = 0;
            while (rPos < rleLen && outIdx < totalPx) {
                uint8_t tag = rle[rPos++];
                if (tag < 0x80) {
                    uint32_t run = static_cast<uint32_t>(tag) + 1;
                    if (rPos >= rleLen) break;
                    uint16_t col = pal[rle[rPos++]];
                    while (run-- && outIdx < totalPx) buf[outIdx++] = col;
                } else {
                    uint32_t run = static_cast<uint32_t>(tag - 0x80) + 1;
                    while (run-- && outIdx < totalPx && rPos < rleLen) {
                        buf[outIdx++] = pal[rle[rPos++]];
                    }
                }
            }
            while (outIdx < totalPx) buf[outIdx++] = pal[0];
        }
        g_stageBuffers[s] = buf;
    }

    for (int id = 0; id < TOTAL_PACKED_SPRITES; ++id) {
        const PackedSpriteRle& src = PACKED_SPRITES[id];
        const size_t count = static_cast<size_t>(src.w) * src.h;
        uint16_t* px = static_cast<uint16_t*>(allocAssetRam(count * sizeof(uint16_t)));
        g_sprites[id] = {src.w, src.h, src.ax, px};
        if (!px) continue;

        size_t outIdx = 0;
        uint32_t rPos = 0;
        while (rPos < src.rleLen && outIdx < count) {
            uint8_t tag = src.rleData[rPos++];
            if (tag < 0x80) {
                uint32_t run = static_cast<uint32_t>(tag) + 1;
                while (run-- && outIdx < count) px[outIdx++] = KROM_TRANSPARENT;
            } else if (tag < 0xC0) {
                uint32_t run = static_cast<uint32_t>(tag - 0x80) + 1;
                uint16_t col = src.rleData[rPos] | (static_cast<uint16_t>(src.rleData[rPos + 1]) << 8);
                rPos += 2;
                while (run-- && outIdx < count) px[outIdx++] = col;
            } else {
                uint32_t run = static_cast<uint32_t>(tag - 0xC0) + 1;
                while (run-- && outIdx < count && rPos + 1 < src.rleLen) {
                    uint16_t col = src.rleData[rPos] | (static_cast<uint16_t>(src.rleData[rPos + 1]) << 8);
                    rPos += 2;
                    px[outIdx++] = col;
                }
            }
        }
        while (outIdx < count) px[outIdx++] = KROM_TRANSPARENT;
    }
}

static void drawStageBackground(int stageIdx, int scrollX = 0) {
    const uint16_t* bg = g_stageBuffers[stageIdx & 3];
    if (!bg) {
        gfx.clear(lcd_color_rgb(12, 14, 18));
        return;
    }
    int sxOff = scrollX % 320;
    if (sxOff < 0) sxOff += 320;
    if (sxOff == 0) {
        std::memcpy(framebuffer, bg, 320 * 240 * sizeof(uint16_t));
    } else {
        const int firstW = 320 - sxOff;
        for (int y = 0; y < 240; ++y) {
            uint16_t* dst = &framebuffer[y * 320];
            const uint16_t* srcRow = &bg[y * 320];
            std::memcpy(dst, srcRow + sxOff, firstW * sizeof(uint16_t));
            std::memcpy(dst + firstW, srcRow, sxOff * sizeof(uint16_t));
        }
    }
}

// Blits unpacked sprite anchored at foot (footX, footY). Master sheets face RIGHT (facing = +1).
static void drawSpriteAnchored(uint16_t spriteId, int footX, int footY, int facing, bool flashWhite = false) {
    if (spriteId >= TOTAL_PACKED_SPRITES) return;
    const UnpackedSprite& sp = g_sprites[spriteId];
    if (!sp.pixels) return;

    const bool flipX = (facing < 0);
    const int drawX = flipX ? (footX - (sp.w - sp.ax)) : (footX - sp.ax);
    const int drawY = footY - sp.h;
    const uint16_t white = lcd_color_rgb(255, 245, 220);

    for (int dy = 0; dy < sp.h; ++dy) {
        int py = drawY + dy;
        if (py < 0 || py >= 240) continue;
        const uint16_t* row = &sp.pixels[dy * sp.w];
        uint16_t* dstRow = &framebuffer[py * 320];
        for (int dx = 0; dx < sp.w; ++dx) {
            int px = drawX + dx;
            if (px < 0 || px >= 320) continue;
            int sx = flipX ? (sp.w - 1 - dx) : dx;
            uint16_t c = row[sx];
            if (c != KROM_TRANSPARENT) {
                dstRow[px] = flashWhite ? white : c;
            }
        }
    }
}

static inline void drawUtf8Text(int x, int y, const char* txt, uint16_t col, bool shadow = true) {
    if (shadow) {
        const uint16_t blk = lcd_color_rgb(6, 8, 12);
        gb_text::draw_utf8(x + 1, y + 1, txt, [blk](int px, int py) {
            if (static_cast<unsigned>(px) < 320u && static_cast<unsigned>(py) < 240u) {
                framebuffer[py * 320 + px] = blk;
            }
        });
    }
    gb_text::draw_utf8(x, y, txt, [col](int px, int py) {
        if (static_cast<unsigned>(px) < 320u && static_cast<unsigned>(py) < 240u) {
            framebuffer[py * 320 + px] = col;
        }
    });
}

static inline void drawUtf8Centered(int y, const char* txt, uint16_t col, bool shadow = true) {
    int w = gb_text::utf8_width(txt);
    drawUtf8Text((320 - w) / 2, y, txt, col, shadow);
}

// ============================================================================
// 3. GAME STATE, CUTSCENES, FORGE, GUIDE & SOFT/NORMAL/GORE IMPACT SYSTEM
// ============================================================================

enum ImpactMode : uint8_t {
    IMPACT_SOFT = 0,
    IMPACT_NORMAL = 1,
    IMPACT_GORE = 2
};

enum AppScreen : uint8_t {
    SCR_TITLE = 0,
    SCR_CUTSCENE = 1,
    SCR_TRAVERSAL = 2,
    SCR_DUEL = 3,
    SCR_FORGE = 4,
    SCR_GUIDE = 5,
    SCR_QUICK_SELECT = 6
};

enum FighterAct : uint8_t {
    ACT_IDLE = 0,
    ACT_WALK = 1,
    ACT_JUMP = 2,
    ACT_CROUCH = 3,
    ACT_ROLL = 4,
    ACT_BLOCK = 5,
    ACT_SLASH = 6,
    ACT_SWEEP = 7,
    ACT_CLEAVE = 8,
    ACT_SPIN_DECAP = 9,
    ACT_HIT = 10,
    ACT_DEAD = 11,
    ACT_DECAPITATED = 12,
    ACT_VICTORY = 13
};

struct Fighter {
    float x;
    float y;
    float vy;
    int facing;
    int hp;
    int maxHp;
    SkinId skin;
    FighterAct act;
    int timer;
    int hitFlash;
    int parryWindow;
    int riposteBuff;
    bool hitApplied;
};

struct Particle {
    float x, y, vx, vy;
    uint16_t col;
    int life;
    uint8_t size;
    bool leavesStain;
};

struct FloorStain {
    int16_t x, y, w;
    uint16_t col;
};

struct CutsceneShot {
    uint8_t stageIdx;
    SkinId leftSkin;
    SkinId rightSkin;
    const char* title;
    const char* line1;
    const char* line2;
};

struct CutsceneDef {
    CutsceneShot shots[2];
    AppScreen nextScreen;
    uint8_t nextAct;
};

static const CutsceneDef CUTSCENES[9] = {
    // 0: Intro Act 1
    {{{0, SKIN_KROM, SKIN_RAIDER, "ACTE I - CLAIRIERES CENDREES",
       "Les pillards de Drax brulent le Nord.", "Krom saisit le Glaive d'Acier."},
      {0, SKIN_KROM, SKIN_GORGAR, "LA PISTE DE GORGAR",
       "Traversez les bois embrases et brisez", "la horde avant l'arene des menhirs !"}},
     SCR_TRAVERSAL, 0},
    // 1: Boss 1 Gorgar
    {{{0, SKIN_KROM, SKIN_GORGAR, "GORGAR LE BRiseur D'OS",
       "\"Ta tete ornera mon totem, barbare !\"", "Attention a son fendoir brise-garde."},
      {0, SKIN_KROM, SKIN_GORGAR, "DUEL AU CERCLE DE PIERRE",
       "L1 au dernier instant : Parade Parfaite !", "C pres du cou : Moulinet Decapitant !"}},
     SCR_DUEL, 0},
    // 2: Intro Act 2
    {{{1, SKIN_KROM, SKIN_SKELETON, "ACTE II - CRYPTES D'OBSIDIENNE",
       "Gorgar terrasse, Krom descend sous terre.", "Les squelettes gardent les tombeaux."},
      {1, SKIN_KROM, SKIN_VORGATH, "LES CATACOMBES",
       "Astuce : pressez D au campement pour", "forger votre lame avec vos eclats !"}},
     SCR_TRAVERSAL, 1},
    // 3: Boss 2 Vorgath
    {{{1, SKIN_KROM, SKIN_VORGATH, "BOURREAU VORGATH",
       "Sa hache noire fauche tout sur son passage.", "Esquivez d'une roulade avec D !"},
      {1, SKIN_KROM, SKIN_VORGATH, "CHAMBRE DES SUPPLICES",
       "Punissez ses ouvertures par un estoc vif.", "Que l'acier chante dans l'ombre !"}},
     SCR_DUEL, 1},
    // 4: Intro Act 3
    {{{2, SKIN_KROM, SKIN_PIT_BEAST, "ACTE III - ARENE DES OSSEMENTS",
       "Les tambours grondent sous le soleil rouge.", "Les fauves de fosse bondissent !"},
      {2, SKIN_KROM, SKIN_MALAKOR, "LE COLISEE SANGLANT",
       "Frayez un chemin jusqu'au champion", "invaincu : Malakor le Flamboyant."}},
     SCR_TRAVERSAL, 2},
    // 5: Boss 3 Malakor
    {{{2, SKIN_KROM, SKIN_MALAKOR, "CHAMPION MALAKOR",
       "Rapide comme l'eclair, maitre de l'esquive.", "Balayez ses appuis avec B !"},
      {2, SKIN_KROM, SKIN_MALAKOR, "SOUS LES CLAMEURS",
       "Une parade parfaite dorée ouvre la voie", "a une riposte devastatrice !"}},
     SCR_DUEL, 2},
    // 6: Intro Act 4
    {{{3, SKIN_KROM, SKIN_DARK_GUARD, "ACTE IV - SANCTUAIRE DE DRAX",
       "La garde noire protege l'autel maudit.", "La foudre dechaine les cieux."},
      {3, SKIN_KROM, SKIN_DRAX, "DERNIERE MONTEE",
       "Utilisez vos eclats d'acier a la Forge (D)", "avant d'affronter le Seigneur Drax !"}},
     SCR_TRAVERSAL, 3},
    // 7: Boss 4 Seigneur Drax
    {{{3, SKIN_KROM, SKIN_DRAX, "SEIGNEUR SORCIER DRAX",
       "\"Nul mortel ne brise le pacte d'obsidienne !\"", "Son glaive runique frappe sans pitie."},
      {3, SKIN_KROM, SKIN_DRAX, "COMBAT ULTIME",
       "Toutes vos bottes secretes seront mises", "a l'epreuve. Tranchez le mal !"}},
     SCR_DUEL, 3},
    // 8: Victory Epilogue
    {{{3, SKIN_KROM, SKIN_KROM, "TRIOMPHE DU GLAIVE D'ACIER",
       "Drax s'effondre ! Le sortilege se dissipe", "sur les terres liberees du Nord."},
      {0, SKIN_KROM, SKIN_KROM, "LEGENDE ETERNELLE",
       "Les bardes chanteront le nom de KROM !", "Merci d'avoir joue sur Gamebuino AKA."}},
     SCR_TITLE, 0}
};

static constexpr int GROUND_Y = 212;
static constexpr int MAX_PARTICLES = 48;
static constexpr int MAX_STAINS = 24;

static AppScreen g_screen = SCR_TITLE;
static ImpactMode g_impactMode = IMPACT_NORMAL;
static int g_titleCursor = 0;
static int g_quickStage = 2;
static int g_quickEnemyIdx = 0;
static int g_guidePage = 0;
static int g_forgeCursor = 0;
static AppScreen g_returnFromSubScreen = SCR_TITLE;

// Campaign progression & Forge upgrades
static bool g_isCampaign = true;
static uint8_t g_actIdx = 0;
static uint32_t g_score = 0;
static int g_shards = 30;
static uint8_t g_bladeLvl = 0;   // +damage
static uint8_t g_armorLvl = 0;   // +maxHp
static uint8_t g_secretLvl = 0;  // unlocks secret moves

// Cutscene state
static uint8_t g_cutsceneId = 0;
static uint8_t g_cutsceneShot = 0;
static uint32_t g_cutsceneTick = 0;

// Traversal state
struct MinionUnit {
    bool active;
    Fighter f;
};
static float g_camX = 0.0f;
static MinionUnit g_minions[6];
static int g_minionsRemaining = 0;

// Duel state
static Fighter g_p1;
static Fighter g_p2;
static int g_p1Rounds = 0;
static int g_p2Rounds = 0;
static int g_roundEndTimer = 0;
static int g_hitstop = 0;
static int g_shake = 0;
static const char* g_bannerMsg = "";
static int g_bannerTimer = 0;

// Severed head + Goblin cleaner!
static bool g_headActive = false;
static float g_headX = 0, g_headY = 0, g_headVx = 0, g_headVy = 0;
static bool g_goblinActive = false;
static float g_goblinX = -30.0f;
static int g_goblinTick = 0;

static Particle g_particles[MAX_PARTICLES];
static FloorStain g_stains[MAX_STAINS];
static int g_stainCount = 0;
static uint32_t g_frameTick = 0;

static void returnToTitleCallback() {
    g_screen = SCR_TITLE;
    setMusicTrack(MUS_TITLE);
}

static void clearArenaFx() {
    for (int i = 0; i < MAX_PARTICLES; ++i) g_particles[i].life = 0;
    g_stainCount = 0;
    g_headActive = false;
    g_goblinActive = false;
}

static void showBanner(const char* msg, int frames = 75) {
    g_bannerMsg = msg;
    g_bannerTimer = frames;
}

// Spawn localized impact particles right at the weapon contact coordinates!
static void spawnWeaponImpact(float wx, float wy, int dir, bool heavy, bool parrySpark = false) {
    if (parrySpark || g_impactMode == IMPACT_SOFT) {
        int count = heavy ? 14 : 9;
        for (int i = 0; i < MAX_PARTICLES && count > 0; ++i) {
            if (g_particles[i].life > 0) continue;
            float sp = 1.4f + (std::rand() % 30) * 0.1f;
            g_particles[i] = {
                wx, wy,
                dir * sp * (0.4f + (std::rand() % 10) * 0.1f) + ((std::rand() % 11) - 5) * 0.25f,
                -1.2f - (std::rand() % 25) * 0.12f,
                parrySpark ? lcd_color_rgb(255, 225, 90)
                           : ((i & 1) ? lcd_color_rgb(130, 220, 255) : lcd_color_rgb(245, 250, 255)),
                10 + (std::rand() % 10),
                static_cast<uint8_t>(heavy ? 3 : 2),
                false
            };
            count--;
        }
        return;
    }

    const bool gore = (g_impactMode == IMPACT_GORE);
    int count = gore ? (heavy ? 24 : 15) : (heavy ? 12 : 8);
    for (int i = 0; i < MAX_PARTICLES && count > 0; ++i) {
        if (g_particles[i].life > 0) continue;
        bool spark = (!gore && (count <= 3));
        uint16_t col = spark ? lcd_color_rgb(255, 210, 95)
                             : ((count & 1) ? lcd_color_rgb(215, 22, 28) : lcd_color_rgb(145, 10, 16));
        g_particles[i] = {
            wx, wy,
            dir * (1.2f + (std::rand() % 28) * 0.12f) + ((std::rand() % 9) - 4) * 0.25f,
            -1.6f - (std::rand() % 30) * 0.12f,
            col,
            14 + (std::rand() % (gore ? 18 : 10)),
            static_cast<uint8_t>((gore && (count % 3 == 0)) ? 3 : 2),
            gore && !spark
        };
        count--;
    }
}

static void updateParticles() {
    for (int i = 0; i < MAX_PARTICLES; ++i) {
        Particle& p = g_particles[i];
        if (p.life <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28f;
        p.life--;
        if (p.y >= GROUND_Y) {
            p.y = GROUND_Y;
            if (p.leavesStain && g_stainCount < MAX_STAINS) {
                g_stains[g_stainCount++] = {
                    static_cast<int16_t>(p.x),
                    static_cast<int16_t>(GROUND_Y + (std::rand() % 5)),
                    static_cast<int16_t>(4 + (std::rand() % 6)),
                    lcd_color_rgb(125, 10, 16)
                };
            }
            p.life = 0;
        }
    }
}

static void drawAmbientStageLights(int stageIdx, int camOffX) {
    // Flickering torches / embers / lightning runes per stage
    const int flicker = (g_frameTick / 4) & 3;
    if (stageIdx == 0) {
        // Forest floating fireflies / embers
        for (int i = 0; i < 8; ++i) {
            int ex = ((i * 53 + static_cast<int>(g_frameTick) / 2 - camOffX / 2) % 320 + 320) % 320;
            int ey = 60 + ((i * 37 + static_cast<int>(g_frameTick) / 3) % 120);
            uint16_t c = (i & 1) ? lcd_color_rgb(255, 175, 55) : lcd_color_rgb(255, 110, 30);
            gfx.setColor(c);
            gfx.fillRect(ex, ey, 2, 2);
        }
    } else if (stageIdx == 1 || stageIdx == 2) {
        // Crypt / Arena wall-torch warm glow halos
        const int tx[2] = {68 - (camOffX % 60), 252 - (camOffX % 60)};
        for (int t = 0; t < 2; ++t) {
            if (tx[t] < 10 || tx[t] > 310) continue;
            gfx.setColor(lcd_color_rgb(255, 150 + flicker * 20, 40));
            gfx.fillCircle(tx[t], 86 - (flicker & 1), 3 + (flicker & 1));
            gfx.setColor(lcd_color_rgb(255, 235, 140));
            gfx.fillRect(tx[t] - 1, 85, 2, 2);
        }
    } else if (stageIdx == 3) {
        // Sanctuary arcane altar pulse
        uint16_t runeCol = lcd_color_rgb(165 + flicker * 22, 60, 240);
        gfx.setColor(runeCol);
        gfx.drawFastHLine(136, 176 - (flicker & 1), 48);
    }
}

static uint16_t getFighterSpriteId(const Fighter& f) {
    // 0:IDLE0, 1:IDLE1, 2..5:WALK0..3, 6:ATK0, 7:ATK1, 8:CLEAVE, 9:SWEEP,
    // 10:BLOCK, 11:CROUCH, 12:JUMP, 13:HIT, 14:DEAD0, 15:DEAD1, 16:DECAP0, 17:DECAP1, 18:VICTORY
    int slot = 0;
    switch (f.act) {
        case ACT_IDLE: slot = ((g_frameTick / 16) & 1) ? 1 : 0; break;
        case ACT_WALK: slot = 2 + ((g_frameTick / 6) & 3); break;
        case ACT_JUMP: slot = 12; break;
        case ACT_CROUCH:
        case ACT_ROLL: slot = 11; break;
        case ACT_BLOCK: slot = 10; break;
        case ACT_SLASH: slot = (f.timer > 8) ? 6 : 7; break;
        case ACT_SWEEP: slot = 9; break;
        case ACT_CLEAVE: slot = (f.timer > 11) ? 6 : 8; break;
        case ACT_SPIN_DECAP: slot = (f.timer > 12) ? 6 : ((f.timer > 6) ? 8 : 7); break;
        case ACT_HIT: slot = 13; break;
        case ACT_DEAD: slot = (f.timer > 15) ? 14 : 15; break;
        case ACT_DECAPITATED: slot = (f.timer > 18) ? 16 : 17; break;
        case ACT_VICTORY: slot = 18; break;
    }
    return SKIN_ANIM_FRAMES[f.skin][slot];
}

static int getKromMaxHp() { return 115 + g_armorLvl * 18; }
static int getKromBonusDmg() { return g_bladeLvl * 4; }

static void initFighter(Fighter& f, SkinId skin, float x, int facing, int maxHp) {
    f = {x, static_cast<float>(GROUND_Y), 0.0f, facing, maxHp, maxHp, skin, ACT_IDLE, 0, 0, 0, 0, false};
}

static void startCutscene(uint8_t id) {
    g_cutsceneId = id;
    g_cutsceneShot = 0;
    g_cutsceneTick = 0;
    g_screen = SCR_CUTSCENE;
    uint8_t stg = CUTSCENES[id].shots[0].stageIdx;
    setMusicTrack(static_cast<MusicId>(MUS_FOREST + (stg & 3)));
}

static void startTraversal(uint8_t act) {
    g_actIdx = act & 3;
    g_screen = SCR_TRAVERSAL;
    clearArenaFx();
    g_camX = 0.0f;
    initFighter(g_p1, SKIN_KROM, 54.0f, 1, getKromMaxHp());

    SkinId mSkin = SKIN_RAIDER;
    int mHp = 28;
    if (g_actIdx == 1) { mSkin = SKIN_SKELETON; mHp = 34; }
    else if (g_actIdx == 2) { mSkin = SKIN_PIT_BEAST; mHp = 40; }
    else if (g_actIdx == 3) { mSkin = SKIN_DARK_GUARD; mHp = 48; }

    g_minionsRemaining = 6;
    for (int i = 0; i < 6; ++i) {
        g_minions[i].active = true;
        initFighter(g_minions[i].f, mSkin, 195.0f + i * 118.0f, -1, mHp);
    }
    setMusicTrack(static_cast<MusicId>(MUS_FOREST + g_actIdx));
    showBanner("TRAVERSEE : ELIMINEZ L'AVANT-GARDE !", 75);
}

static void startDuel(SkinId enemySkin, uint8_t stageIdx, bool campaignDuel) {
    g_isCampaign = campaignDuel;
    g_actIdx = stageIdx & 3;
    g_screen = SCR_DUEL;
    clearArenaFx();
    g_p1Rounds = 0;
    g_p2Rounds = 0;
    g_roundEndTimer = 0;

    int enemyHp = 115 + g_actIdx * 20;
    if (enemySkin == SKIN_DRAX) enemyHp = 185;
    initFighter(g_p1, SKIN_KROM, 92.0f, 1, getKromMaxHp());
    initFighter(g_p2, enemySkin, 228.0f, -1, enemyHp);
    setMusicTrack(static_cast<MusicId>(MUS_FOREST + g_actIdx));
    showBanner("MANCHE 1 - EN GARDE !", 70);
}

// ============================================================================
// 4. COMBAT MECHANICS (PLAYER INPUT, SECRET MOVES, PARRY, AI, DECAPITATION)
// ============================================================================

static inline bool justPressed(uint32_t mask) { return (g_keys.pressed & mask) != 0; }

static void controlPlayerFighter(Fighter& p, float minX, float maxX) {
    if (p.act == ACT_DEAD || p.act == ACT_DECAPITATED || p.act == ACT_VICTORY) return;
    if (p.parryWindow > 0) p.parryWindow--;
    if (p.riposteBuff > 0) p.riposteBuff--;
    if (p.hitFlash > 0) p.hitFlash--;

    if (p.timer > 0) {
        p.timer--;
        if (p.act == ACT_ROLL) {
            p.x += p.facing * 3.8f;
        }
        if (p.timer == 0 && p.act != ACT_DEAD && p.act != ACT_DECAPITATED) {
            p.act = ACT_IDLE;
        }
    }

    // Gravity
    if (p.y < GROUND_Y || p.vy != 0.0f) {
        p.y += p.vy;
        p.vy += 0.55f;
        if (p.y >= GROUND_Y) {
            p.y = GROUND_Y;
            p.vy = 0.0f;
            if (p.act == ACT_JUMP) p.act = ACT_IDLE;
        }
    }

    if (p.act == ACT_HIT || p.act == ACT_ROLL || p.act == ACT_SLASH ||
        p.act == ACT_SWEEP || p.act == ACT_CLEAVE || p.act == ACT_SPIN_DECAP) {
        if (p.x < minX) p.x = minX;
        if (p.x > maxX) p.x = maxX;
        return;
    }

    // L1 High Guard + Perfect Parry window on initial press
    if (g_keys.L1) {
        if (justPressed(EXPANDER_KEY_L1)) {
            p.parryWindow = 9;
        }
        p.act = ACT_BLOCK;
        return;
    }

    const bool forwardHeld = (p.facing > 0) ? g_keys.right : g_keys.left;

    // Attack inputs + Forge Secret Moves!
    if (justPressed(EXPANDER_KEY_C)) {
        p.act = ACT_SPIN_DECAP;
        p.timer = (g_secretLvl >= 2 && g_keys.up) ? 20 : 22;
        p.hitApplied = false;
        if (g_secretLvl >= 2 && g_keys.up) {
            p.vy = -5.4f;
            showBanner("BOTTE : TOURBILLON DU NORD !", 40);
        }
        sfxSwing(true);
        return;
    }
    if (justPressed(EXPANDER_KEY_R1)) {
        p.act = ACT_CLEAVE;
        p.timer = 19;
        p.hitApplied = false;
        if (g_secretLvl >= 1 && forwardHeld) {
            p.x += p.facing * 14.0f;
            showBanner("BOTTE : BRIS D'ENCLUME !", 40);
        }
        sfxSwing(true);
        return;
    }
    if (justPressed(EXPANDER_KEY_A)) {
        p.act = ACT_SLASH;
        p.timer = 14;
        p.hitApplied = false;
        if (p.riposteBuff > 0 && g_secretLvl >= 3) {
            showBanner("RIPOSTE ECLAIR !", 40);
        }
        sfxSwing(false);
        return;
    }
    if (justPressed(EXPANDER_KEY_B)) {
        p.act = ACT_SWEEP;
        p.timer = 15;
        p.hitApplied = false;
        sfxSwing(false);
        return;
    }
    if (justPressed(EXPANDER_KEY_D)) {
        if (g_keys.left) p.facing = -1;
        else if (g_keys.right) p.facing = 1;
        p.act = ACT_ROLL;
        p.timer = 12;
        sfxMenu(false);
        return;
    }

    if (g_keys.up && p.y >= GROUND_Y) {
        p.vy = -6.8f;
        p.act = ACT_JUMP;
        return;
    }
    if (g_keys.down && p.y >= GROUND_Y) {
        p.act = ACT_CROUCH;
        return;
    }

    if (g_keys.left) {
        p.x -= 2.3f;
        p.facing = -1;
        if (p.y >= GROUND_Y) p.act = ACT_WALK;
    } else if (g_keys.right) {
        p.x += 2.3f;
        p.facing = 1;
        if (p.y >= GROUND_Y) p.act = ACT_WALK;
    } else if (p.y >= GROUND_Y) {
        p.act = ACT_IDLE;
    }

    if (p.x < minX) p.x = minX;
    if (p.x > maxX) p.x = maxX;
}

static void checkAttackHit(Fighter& atk, Fighter& def, bool isMinionTarget) {
    if (atk.hitApplied) return;
    bool inActiveFrame = false;
    float reach = 46.0f;
    int dmg = 14;
    bool lowAttack = false;
    bool guardBreak = false;
    bool canDecap = false;
    float contactHeight = 36.0f; // chest/shoulder height above ground

    if (atk.act == ACT_SLASH && atk.timer == 7) {
        inActiveFrame = true; reach = 50.0f; dmg = 14; contactHeight = 38.0f;
    } else if (atk.act == ACT_SWEEP && atk.timer == 7) {
        inActiveFrame = true; reach = 48.0f; dmg = 12; lowAttack = true; contactHeight = 14.0f;
    } else if (atk.act == ACT_CLEAVE && atk.timer == 8) {
        inActiveFrame = true; reach = 54.0f; dmg = 24; guardBreak = true; contactHeight = 42.0f;
    } else if (atk.act == ACT_SPIN_DECAP && atk.timer == 9) {
        inActiveFrame = true; reach = 52.0f; dmg = 28; canDecap = true; contactHeight = 48.0f;
    }
    if (!inActiveFrame) return;

    if (&atk == &g_p1) {
        dmg += getKromBonusDmg();
        if (atk.riposteBuff > 0) {
            dmg += 12;
            atk.riposteBuff = 0;
        }
    }

    if (def.act == ACT_DEAD || def.act == ACT_DECAPITATED || def.act == ACT_ROLL) return;
    if (lowAttack && def.y < GROUND_Y - 12.0f) return; // Jumped over low sweep!
    if (canDecap && def.act == ACT_CROUCH) return;     // Ducked under high spin!

    float dx = (def.x - atk.x) * atk.facing;
    if (dx < -8.0f || dx > reach) return;

    atk.hitApplied = true;
    const float hitX = atk.x + atk.facing * (dx * 0.72f);
    const float hitY = def.y - contactHeight;

    // Check High Guard & Perfect Parry
    if (def.act == ACT_BLOCK && !lowAttack && !guardBreak) {
        if (def.parryWindow > 0) {
            sfxClash(true);
            spawnWeaponImpact(hitX, hitY, -atk.facing, true, true);
            atk.act = ACT_HIT;
            atk.timer = 16;
            def.riposteBuff = 45;
            g_hitstop = 5;
            showBanner("PARADE PARFAITE !", 45);
        } else {
            sfxClash(false);
            spawnWeaponImpact(hitX, hitY, -atk.facing, false, true);
            def.x += atk.facing * 5.0f;
        }
        return;
    }

    // Instant Decapitation check (Barbarian 1987 iconic neck-chop!)
    const bool lethalOrVulnerable = (def.hp <= (isMinionTarget ? 28 : 48)) || (def.act == ACT_HIT);
    if (canDecap && lethalOrVulnerable && dx >= 22.0f && dx <= 52.0f) {
        def.hp = 0;
        def.act = ACT_DECAPITATED;
        def.timer = 60;
        sfxDecapitate();
        spawnWeaponImpact(def.x, def.y - 48.0f, atk.facing, true, false);
        g_hitstop = 8;
        g_shake = 8;
        if (!isMinionTarget) {
            g_headActive = true;
            g_headX = def.x;
            g_headY = def.y - 48.0f;
            g_headVx = atk.facing * 2.8f;
            g_headVy = -5.2f;
            showBanner("DECAPITATION !!", 85);
            if (&atk == &g_p1) { g_score += 500; g_shards += 18; }
        } else {
            g_score += 180;
            g_shards += 6;
        }
        return;
    }

    // Standard / Heavy Blade Hit
    def.hp -= dmg;
    def.hitFlash = 5;
    def.x += atk.facing * (guardBreak ? 10.0f : 6.0f);
    sfxHit(guardBreak || canDecap);
    spawnWeaponImpact(hitX, hitY, atk.facing, guardBreak || canDecap, false);
    g_hitstop = guardBreak ? 4 : 2;
    if (guardBreak) g_shake = 4;

    if (def.hp <= 0) {
        def.hp = 0;
        def.act = ACT_DEAD;
        def.timer = 50;
        if (&atk == &g_p1) {
            g_score += isMinionTarget ? 100 : 300;
            g_shards += isMinionTarget ? 4 : 12;
        }
    } else {
        def.act = ACT_HIT;
        def.timer = 10;
    }
}

static void stepEnemyAi(Fighter& ai, const Fighter& target, int aggression, float minX, float maxX) {
    if (ai.act == ACT_DEAD || ai.act == ACT_DECAPITATED || ai.act == ACT_VICTORY) return;
    if (ai.hitFlash > 0) ai.hitFlash--;
    if (ai.parryWindow > 0) ai.parryWindow--;

    if (ai.timer > 0) {
        ai.timer--;
        if (ai.act == ACT_ROLL) ai.x += ai.facing * 3.4f;
        if (ai.timer == 0 && ai.act != ACT_DEAD && ai.act != ACT_DECAPITATED) {
            ai.act = ACT_IDLE;
        }
        if (ai.x < minX) ai.x = minX;
        if (ai.x > maxX) ai.x = maxX;
        return;
    }

    ai.facing = (target.x < ai.x) ? -1 : 1;
    float dist = std::fabs(target.x - ai.x);

    if (dist > 46.0f) {
        ai.x += ai.facing * (1.35f + aggression * 0.22f);
        ai.act = ACT_WALK;
    } else {
        int r = std::rand() % 100;
        if ((target.act == ACT_SLASH || target.act == ACT_SPIN_DECAP) && r < 22 + aggression * 6) {
            ai.act = ACT_BLOCK;
            ai.timer = 12;
        } else if (r < 16 + aggression * 5) {
            ai.act = ACT_SLASH;
            ai.timer = 15;
            ai.hitApplied = false;
            sfxSwing(false);
        } else if (r < 24 + aggression * 6) {
            ai.act = (r & 1) ? ACT_SWEEP : ACT_CLEAVE;
            ai.timer = 18;
            ai.hitApplied = false;
            sfxSwing(ai.act == ACT_CLEAVE);
        } else if (aggression >= 2 && r < 30 + aggression * 5) {
            ai.act = ACT_SPIN_DECAP;
            ai.timer = 22;
            ai.hitApplied = false;
            sfxSwing(true);
        } else {
            ai.act = ACT_IDLE;
        }
    }
    if (ai.x < minX) ai.x = minX;
    if (ai.x > maxX) ai.x = maxX;
}

// ============================================================================
// 5. SCREEN RENDERERS & STATE UPDATES
// ============================================================================

static void drawHpBar(int x, int y, int w, int hp, int maxHp, const char* name, uint16_t fillCol) {
    drawUtf8Text(x, y - 10, name, lcd_color_rgb(240, 232, 210));
    gfx.setColor(lcd_color_rgb(20, 24, 32));
    gfx.fillRect(x, y, w, 7);
    int fw = (maxHp > 0) ? ((hp * (w - 2)) / maxHp) : 0;
    if (fw < 0) fw = 0;
    if (fw > 0) {
        gfx.setColor(fillCol);
        gfx.fillRect(x + 1, y + 1, fw, 5);
    }
    gfx.setColor(lcd_color_rgb(190, 155, 80));
    gfx.drawRect(x, y, w, 7);
}

static void updateAndDrawTitle() {
    static const char* ITEMS[5] = {
        "CAMPAGNE SCENARISEE (4 ACTES)",
        "DUEL D'ARENE RAPIDE",
        "FORGE & BOTTES SECRETES (D)",
        "GUIDE DE COMBAT & PARADES",
        ""
    };
    if (justPressed(EXPANDER_KEY_UP)) { g_titleCursor = (g_titleCursor + 4) % 5; sfxMenu(false); }
    if (justPressed(EXPANDER_KEY_DOWN)) { g_titleCursor = (g_titleCursor + 1) % 5; sfxMenu(false); }
    if (g_titleCursor == 4 && (justPressed(EXPANDER_KEY_LEFT) || justPressed(EXPANDER_KEY_RIGHT))) {
        int dir = justPressed(EXPANDER_KEY_RIGHT) ? 1 : 2;
        g_impactMode = static_cast<ImpactMode>((g_impactMode + dir) % 3);
        sfxMenu(false);
    }
    if (justPressed(EXPANDER_KEY_D)) {
        g_returnFromSubScreen = SCR_TITLE;
        g_screen = SCR_FORGE;
        sfxMenu(true);
        return;
    }
    if (justPressed(EXPANDER_KEY_A) || justPressed(EXPANDER_KEY_RUN)) {
        sfxMenu(true);
        if (g_titleCursor == 0) {
            g_score = 0;
            startCutscene(0);
            return;
        } else if (g_titleCursor == 1) {
            g_screen = SCR_QUICK_SELECT;
            return;
        } else if (g_titleCursor == 2) {
            g_returnFromSubScreen = SCR_TITLE;
            g_screen = SCR_FORGE;
            return;
        } else if (g_titleCursor == 3) {
            g_guidePage = 0;
            g_returnFromSubScreen = SCR_TITLE;
            g_screen = SCR_GUIDE;
            return;
        } else {
            g_impactMode = static_cast<ImpactMode>((g_impactMode + 1) % 3);
        }
    }

    drawStageBackground(3, 0);
    drawAmbientStageLights(3, 0);

    // Heroic showcase fighters on title screen
    drawSpriteAnchored(SKIN_ANIM_FRAMES[SKIN_KROM][(g_frameTick / 20) & 1], 68, 218, 1);
    drawSpriteAnchored(SKIN_ANIM_FRAMES[SKIN_DRAX][(g_frameTick / 20) & 1], 254, 218, -1);

    // Dark translucent title plaque
    gfx.setColor(lcd_color_rgb(10, 12, 18));
    gfx.fillRect(22, 12, 276, 46);
    gfx.setColor(lcd_color_rgb(235, 175, 55));
    gfx.drawRect(22, 12, 276, 46);
    drawUtf8Centered(20, "KROM : LE GLAIVE D'ACIER", lcd_color_rgb(255, 205, 70));
    drawUtf8Centered(36, "EDITION GAMEBUINO AKA 320x240", lcd_color_rgb(195, 205, 220));

    gfx.setColor(lcd_color_rgb(12, 15, 22));
    gfx.fillRect(24, 72, 272, 126);
    gfx.setColor(lcd_color_rgb(120, 95, 45));
    gfx.drawRect(24, 72, 272, 126);

    const char* impLabels[3] = {"IMPACT : SOFT (ETINCELLES)", "IMPACT : NORMAL", "IMPACT : GORE"};
    for (int i = 0; i < 5; ++i) {
        const bool sel = (i == g_titleCursor);
        int ry = 82 + i * 22;
        if (sel) {
            gfx.setColor(lcd_color_rgb(75, 48, 16));
            gfx.fillRect(30, ry - 3, 260, 16);
        }
        const char* label = (i == 4) ? impLabels[g_impactMode] : ITEMS[i];
        drawUtf8Text(38, ry, label, sel ? lcd_color_rgb(255, 215, 90) : lcd_color_rgb(215, 220, 230));
    }

    drawUtf8Centered(224, "A:Valider  D:Forge  MENU:Systeme AKA", lcd_color_rgb(180, 190, 205));
}

static void updateAndDrawQuickSelect() {
    static const SkinId ENEMIES[5] = {SKIN_RIVAL, SKIN_GORGAR, SKIN_VORGATH, SKIN_MALAKOR, SKIN_DRAX};
    static const char* ENEMY_NAMES[5] = {"RIVAL AKA", "GORGAR", "VORGATH", "MALAKOR", "SEIGNEUR DRAX"};
    static const char* STAGE_NAMES[4] = {"FORET CENDREE", "CRYPTE NOIRE", "ARENE SABLE", "SANCTUAIRE"};

    if (justPressed(EXPANDER_KEY_LEFT)) { g_quickEnemyIdx = (g_quickEnemyIdx + 4) % 5; sfxMenu(false); }
    if (justPressed(EXPANDER_KEY_RIGHT)) { g_quickEnemyIdx = (g_quickEnemyIdx + 1) % 5; sfxMenu(false); }
    if (justPressed(EXPANDER_KEY_UP) || justPressed(EXPANDER_KEY_DOWN)) {
        g_quickStage = (g_quickStage + 1) & 3;
        sfxMenu(false);
    }
    if (justPressed(EXPANDER_KEY_B) || justPressed(EXPANDER_KEY_C)) {
        g_screen = SCR_TITLE;
        sfxMenu(false);
        return;
    }
    if (justPressed(EXPANDER_KEY_A) || justPressed(EXPANDER_KEY_RUN)) {
        sfxMenu(true);
        startDuel(ENEMIES[g_quickEnemyIdx], static_cast<uint8_t>(g_quickStage), false);
        return;
    }

    drawStageBackground(g_quickStage, 0);
    gfx.setColor(lcd_color_rgb(10, 12, 18));
    gfx.fillRect(20, 14, 280, 44);
    gfx.setColor(lcd_color_rgb(225, 170, 55));
    gfx.drawRect(20, 14, 280, 44);
    drawUtf8Centered(22, "DUEL D'ARENE RAPIDE", lcd_color_rgb(255, 205, 75));
    char buf[48];
    std::snprintf(buf, sizeof(buf), "< ADVERSAIRE : %s >", ENEMY_NAMES[g_quickEnemyIdx]);
    drawUtf8Centered(38, buf, lcd_color_rgb(235, 240, 248));

    drawSpriteAnchored(SKIN_ANIM_FRAMES[SKIN_KROM][0], 95, 204, 1);
    drawSpriteAnchored(SKIN_ANIM_FRAMES[ENEMIES[g_quickEnemyIdx]][0], 225, 204, -1);

    std::snprintf(buf, sizeof(buf), "Haut/Bas Arene : %s", STAGE_NAMES[g_quickStage]);
    drawUtf8Centered(212, buf, lcd_color_rgb(255, 205, 85));
    drawUtf8Centered(226, "A:Combattre   B:Retour Titre", lcd_color_rgb(185, 195, 210));
}

static void updateAndDrawCutscene() {
    g_cutsceneTick++;
    const CutsceneDef& cs = CUTSCENES[g_cutsceneId];
    const CutsceneShot& sh = cs.shots[g_cutsceneShot];

    // B or RUN skips the entire cutscene immediately!
    if (justPressed(EXPANDER_KEY_B) || justPressed(EXPANDER_KEY_RUN)) {
        sfxMenu(true);
        if (cs.nextScreen == SCR_TRAVERSAL) startTraversal(cs.nextAct);
        else if (cs.nextScreen == SCR_DUEL) {
            static const SkinId BOSSES[4] = {SKIN_GORGAR, SKIN_VORGATH, SKIN_MALAKOR, SKIN_DRAX};
            startDuel(BOSSES[cs.nextAct & 3], cs.nextAct, true);
        } else {
            g_screen = SCR_TITLE;
            setMusicTrack(MUS_TITLE);
        }
        return;
    }
    if (justPressed(EXPANDER_KEY_D)) {
        g_returnFromSubScreen = SCR_CUTSCENE;
        g_screen = SCR_FORGE;
        sfxMenu(true);
        return;
    }
    if (justPressed(EXPANDER_KEY_A) || g_cutsceneTick > 260) {
        g_cutsceneTick = 0;
        if (g_cutsceneShot == 0) {
            g_cutsceneShot = 1;
            sfxMenu(false);
        } else {
            sfxMenu(true);
            if (cs.nextScreen == SCR_TRAVERSAL) startTraversal(cs.nextAct);
            else if (cs.nextScreen == SCR_DUEL) {
                static const SkinId BOSSES[4] = {SKIN_GORGAR, SKIN_VORGATH, SKIN_MALAKOR, SKIN_DRAX};
                startDuel(BOSSES[cs.nextAct & 3], cs.nextAct, true);
            } else {
                g_screen = SCR_TITLE;
                setMusicTrack(MUS_TITLE);
            }
            return;
        }
    }

    drawStageBackground(sh.stageIdx, static_cast<int>(g_cutsceneTick / 3));
    drawAmbientStageLights(sh.stageIdx, 0);
    drawSpriteAnchored(SKIN_ANIM_FRAMES[sh.leftSkin][(g_frameTick / 16) & 1], 92, 186, 1);
    if (g_cutsceneId != 8) {
        drawSpriteAnchored(SKIN_ANIM_FRAMES[sh.rightSkin][(g_frameTick / 16) & 1], 228, 186, -1);
    }

    // Widescreen 16-bit cinema bars
    gfx.setColor(lcd_color_rgb(8, 10, 14));
    gfx.fillRect(0, 0, 320, 30);
    gfx.fillRect(0, 184, 320, 56);
    gfx.setColor(lcd_color_rgb(205, 155, 55));
    gfx.drawFastHLine(0, 30, 320);
    gfx.drawFastHLine(0, 184, 320);

    drawUtf8Centered(10, sh.title, lcd_color_rgb(255, 205, 75));
    drawUtf8Centered(192, sh.line1, lcd_color_rgb(235, 240, 248));
    drawUtf8Centered(206, sh.line2, lcd_color_rgb(215, 225, 238));
    drawUtf8Centered(224, "A:Suite   D:Forge   B/RUN:Passer", lcd_color_rgb(175, 185, 200));
}

static void updateAndDrawForge() {
    if (justPressed(EXPANDER_KEY_UP)) { g_forgeCursor = (g_forgeCursor + 2) % 3; sfxMenu(false); }
    if (justPressed(EXPANDER_KEY_DOWN)) { g_forgeCursor = (g_forgeCursor + 1) % 3; sfxMenu(false); }
    if (justPressed(EXPANDER_KEY_B) || justPressed(EXPANDER_KEY_C) || justPressed(EXPANDER_KEY_D)) {
        g_screen = g_returnFromSubScreen;
        sfxMenu(false);
        return;
    }

    int cost[3] = {12 + g_bladeLvl * 10, 12 + g_armorLvl * 10, 15 + g_secretLvl * 12};
    if (justPressed(EXPANDER_KEY_A)) {
        if (g_forgeCursor == 0 && g_bladeLvl < 3 && g_shards >= cost[0]) {
            g_shards -= cost[0]; g_bladeLvl++; sfxClash(true);
        } else if (g_forgeCursor == 1 && g_armorLvl < 3 && g_shards >= cost[1]) {
            g_shards -= cost[1]; g_armorLvl++; sfxClash(true);
        } else if (g_forgeCursor == 2 && g_secretLvl < 3 && g_shards >= cost[2]) {
            g_shards -= cost[2]; g_secretLvl++; sfxClash(true);
        } else {
            sfxMenu(false);
        }
    }

    drawStageBackground(0, 0);
    gfx.setColor(lcd_color_rgb(12, 14, 20));
    gfx.fillRect(14, 14, 292, 212);
    gfx.setColor(lcd_color_rgb(230, 165, 50));
    gfx.drawRect(14, 14, 292, 212);

    char buf[52];
    drawUtf8Centered(24, "FORGE DU CAMPEMENT", lcd_color_rgb(255, 205, 75));
    std::snprintf(buf, sizeof(buf), "Eclats d'Acier disponibles : %d", g_shards);
    drawUtf8Centered(42, buf, lcd_color_rgb(130, 225, 255));

    const char* titles[3] = {"ACIER TREMPE (+4 Degats)", "HARNOIS NORDIQUE (+18 PV)", "BOTTES SECRETES"};
    uint8_t lvls[3] = {g_bladeLvl, g_armorLvl, g_secretLvl};
    for (int i = 0; i < 3; ++i) {
        int ry = 68 + i * 38;
        if (g_forgeCursor == i) {
            gfx.setColor(lcd_color_rgb(70, 44, 14));
            gfx.fillRect(22, ry - 4, 276, 30);
        }
        std::snprintf(buf, sizeof(buf), "%s [Niv %d/3]", titles[i], lvls[i]);
        drawUtf8Text(28, ry, buf, lcd_color_rgb(255, 220, 120));
        if (lvls[i] >= 3) std::snprintf(buf, sizeof(buf), "MAITRISE MAXIMALE");
        else std::snprintf(buf, sizeof(buf), "Cout : %d eclats (A pour forger)", cost[i]);
        drawUtf8Text(28, ry + 13, buf, lcd_color_rgb(200, 210, 225));
    }

    drawUtf8Centered(190, "Bottes : R1+Av | C+Haut | L1 Parfaite->A", lcd_color_rgb(225, 185, 95));
    drawUtf8Centered(208, "B / D : Quitter la Forge", lcd_color_rgb(180, 190, 205));
}

static void updateAndDrawGuide() {
    if (justPressed(EXPANDER_KEY_LEFT)) { g_guidePage = (g_guidePage + 3) & 3; sfxMenu(false); }
    if (justPressed(EXPANDER_KEY_RIGHT) || justPressed(EXPANDER_KEY_A)) {
        g_guidePage = (g_guidePage + 1) & 3; sfxMenu(false);
    }
    if (justPressed(EXPANDER_KEY_B) || justPressed(EXPANDER_KEY_C)) {
        g_screen = g_returnFromSubScreen; sfxMenu(false); return;
    }

    gfx.clear(lcd_color_rgb(12, 15, 22));
    gfx.setColor(lcd_color_rgb(225, 170, 55));
    gfx.drawRect(10, 10, 300, 220);

    static const char* PAGES[4][6] = {
        {"GUIDE 1/4 : COMMANDES DE BASE",
         "Stick / Croix : Marche, Saut, Accroupi",
         "A : Taille Vive / Estoc rapide",
         "B : Balayage Bas (touche sous la garde)",
         "D : Roulade d'esquive invulnerable",
         "MENU : Pause, Volumes, 6 Langues, Loader"},
        {"GUIDE 2/4 : ATTAQUES LOURDES",
         "R1 : Fendant Brise-Garde (brise L1 !)",
         "C : Moulinet Decapitant 360 degres",
         "-> Decapite net un ennemi affaibli !",
         "-> Attention : un ennemi accroupi",
         "   esquive le moulinet haut !"},
        {"GUIDE 3/4 : GARDE & PARADE PARFAITE",
         "Maintenir L1 : Garde Haute standard",
         "Presser L1 juste a l'impact :",
         "-> PARADE PARFAITE DOREE !",
         "-> Etourdit l'adversaire et charge",
         "   votre prochaine attaque (+12 degats)"},
        {"GUIDE 4/4 : FORGE & BOTTES SECRETES",
         "Ramassez des Eclats d'Acier en combat.",
         "Ouvrez la Forge avec D sur la carte :",
         "Niv 1 : R1 + Avant = Bris d'Enclume",
         "Niv 2 : C + Haut = Tourbillon Bondissant",
         "Niv 3 : Parade Parfaite -> A = Riposte"}
    };

    drawUtf8Centered(24, PAGES[g_guidePage][0], lcd_color_rgb(255, 205, 75));
    for (int l = 1; l < 6; ++l) {
        drawUtf8Text(22, 52 + (l - 1) * 26, PAGES[g_guidePage][l], lcd_color_rgb(225, 232, 242));
    }
    drawUtf8Centered(208, "Gauche/Droite : Page   B : Fermer", lcd_color_rgb(180, 195, 215));
}

static void updateAndDrawTraversal() {
    if (justPressed(EXPANDER_KEY_RUN)) {
        g_returnFromSubScreen = SCR_TRAVERSAL;
        g_screen = SCR_FORGE;
        sfxMenu(true);
        return;
    }

    if (g_hitstop > 0) {
        g_hitstop--;
    } else {
        controlPlayerFighter(g_p1, g_camX + 24.0f, 920.0f);
        if (g_p1.x - g_camX > 150.0f && g_camX < 640.0f) {
            g_camX = g_p1.x - 150.0f;
            if (g_camX > 640.0f) g_camX = 640.0f;
        }

        int alive = 0;
        for (int i = 0; i < 6; ++i) {
            MinionUnit& m = g_minions[i];
            if (!m.active) continue;
            if (m.f.act == ACT_DEAD || m.f.act == ACT_DECAPITATED) {
                if (m.f.timer > 0) m.f.timer--;
                else m.active = false;
                continue;
            }
            alive++;
            if (std::fabs(m.f.x - g_p1.x) < 260.0f) {
                stepEnemyAi(m.f, g_p1, 1 + (g_actIdx / 2), 20.0f, 930.0f);
                checkAttackHit(g_p1, m.f, true);
                checkAttackHit(m.f, g_p1, false);
            }
        }
        g_minionsRemaining = alive;
        updateParticles();

        if (g_p1.hp <= 0 && g_p1.timer <= 2) {
            // Respawn Krom at start of zone with full HP
            startTraversal(g_actIdx);
            return;
        }
        if (g_minionsRemaining == 0 && g_p1.x >= 865.0f) {
            // Reached Boss Arena! Trigger Boss Cutscene
            startCutscene(static_cast<uint8_t>(g_actIdx * 2 + 1));
            return;
        }
    }

    drawStageBackground(g_actIdx, static_cast<int>(g_camX));
    drawAmbientStageLights(g_actIdx, static_cast<int>(g_camX));

    // Persistent floor stains (Gore mode)
    for (int i = 0; i < g_stainCount; ++i) {
        int sx = g_stains[i].x - static_cast<int>(g_camX);
        if (sx >= 0 && sx < 316) {
            gfx.setColor(g_stains[i].col);
            gfx.fillRect(sx, g_stains[i].y, g_stains[i].w, 2);
        }
    }

    for (int i = 0; i < 6; ++i) {
        if (!g_minions[i].active) continue;
        int sx = static_cast<int>(g_minions[i].f.x - g_camX);
        if (sx < -40 || sx > 360) continue;
        drawSpriteAnchored(getFighterSpriteId(g_minions[i].f), sx, static_cast<int>(g_minions[i].f.y),
                           g_minions[i].f.facing, g_minions[i].f.hitFlash > 0);
    }

    drawSpriteAnchored(getFighterSpriteId(g_p1), static_cast<int>(g_p1.x - g_camX),
                       static_cast<int>(g_p1.y), g_p1.facing, g_p1.hitFlash > 0);

    for (int i = 0; i < MAX_PARTICLES; ++i) {
        if (g_particles[i].life <= 0) continue;
        int px = static_cast<int>(g_particles[i].x - g_camX);
        int py = static_cast<int>(g_particles[i].y);
        if (px >= 0 && px < 318 && py >= 0 && py < 238) {
            gfx.setColor(g_particles[i].col);
            gfx.fillRect(px, py, g_particles[i].size, g_particles[i].size);
        }
    }

    drawHpBar(10, 16, 108, g_p1.hp, g_p1.maxHp, "KROM", lcd_color_rgb(235, 175, 45));
    char hud[48];
    std::snprintf(hud, sizeof(hud), "SCORE %lu  ECLATS %d", static_cast<unsigned long>(g_score), g_shards);
    drawUtf8Text(132, 8, hud, lcd_color_rgb(240, 232, 210));
    if (g_minionsRemaining == 0) {
        drawUtf8Text(142, 20, "AVANCEZ VERS LE BOSS >>", lcd_color_rgb(120, 255, 145));
    } else {
        std::snprintf(hud, sizeof(hud), "ENNEMIS : %d  (RUN:Forge)", g_minionsRemaining);
        drawUtf8Text(132, 20, hud, lcd_color_rgb(210, 215, 225));
    }

    if (g_bannerTimer > 0) {
        g_bannerTimer--;
        drawUtf8Centered(42, g_bannerMsg, lcd_color_rgb(255, 215, 85));
    }
}

static void updateAndDrawDuel() {
    if (g_hitstop > 0) {
        g_hitstop--;
    } else {
        const bool roundOver = (g_p1.hp <= 0 || g_p2.hp <= 0);
        if (!roundOver) {
            // Auto-face opponent when idle/walking
            if (g_p1.act == ACT_IDLE || g_p1.act == ACT_WALK) {
                g_p1.facing = (g_p2.x >= g_p1.x) ? 1 : -1;
            }
            controlPlayerFighter(g_p1, 22.0f, 298.0f);
            stepEnemyAi(g_p2, g_p1, 1 + g_actIdx, 22.0f, 298.0f);
            checkAttackHit(g_p1, g_p2, false);
            checkAttackHit(g_p2, g_p1, false);
        } else {
            if (g_roundEndTimer == 0) {
                if (g_p2.hp <= 0) {
                    g_p1Rounds++;
                    g_p1.act = ACT_VICTORY;
                    g_goblinActive = true;
                    g_goblinX = -24.0f;
                    g_goblinTick = 0;
                    sfxGoblinLaugh();
                } else {
                    g_p2Rounds++;
                    g_p2.act = ACT_VICTORY;
                }
            }
            g_roundEndTimer++;

            // Goblin cleaner trots in & drags fallen fighter!
            if (g_goblinActive) {
                g_goblinTick++;
                if (g_goblinX < g_p2.x - 28.0f) g_goblinX += 2.2f;
            }

            if (g_roundEndTimer > 135) {
                if (g_p1Rounds >= 2) {
                    if (g_isCampaign) {
                        if (g_actIdx < 3) startCutscene(static_cast<uint8_t>((g_actIdx + 1) * 2));
                        else startCutscene(8);
                    } else {
                        g_screen = SCR_TITLE;
                        setMusicTrack(MUS_TITLE);
                    }
                    return;
                } else if (g_p2Rounds >= 2) {
                    g_screen = SCR_TITLE;
                    setMusicTrack(MUS_TITLE);
                    return;
                } else {
                    clearArenaFx();
                    g_roundEndTimer = 0;
                    initFighter(g_p1, SKIN_KROM, 92.0f, 1, getKromMaxHp());
                    initFighter(g_p2, g_p2.skin, 228.0f, -1, g_p2.maxHp);
                    showBanner("MANCHE SUIVANTE !", 65);
                }
            }
        }

        // Bouncing severed head physics
        if (g_headActive) {
            g_headX += g_headVx;
            g_headY += g_headVy;
            g_headVy += 0.34f;
            if (g_headY >= GROUND_Y - 5.0f) {
                g_headY = GROUND_Y - 5.0f;
                g_headVy = -g_headVy * 0.48f;
                g_headVx *= 0.72f;
                if (std::fabs(g_headVy) < 0.8f) g_headVy = 0.0f;
            }
        }
        updateParticles();
    }

    int shakeX = 0;
    if (g_shake > 0) {
        shakeX = ((g_shake & 1) ? 3 : -3);
        g_shake--;
    }

    drawStageBackground(g_actIdx, shakeX);
    drawAmbientStageLights(g_actIdx, 0);

    for (int i = 0; i < g_stainCount; ++i) {
        gfx.setColor(g_stains[i].col);
        gfx.fillRect(g_stains[i].x, g_stains[i].y, g_stains[i].w, 2);
    }

    if (g_goblinActive) {
        int gobSlot = (g_goblinX < g_p2.x - 30.0f) ? ((g_goblinTick / 6) & 1) : 2;
        drawSpriteAnchored(GOBLIN_ANIM_FRAMES[gobSlot], static_cast<int>(g_goblinX), GROUND_Y, 1);
    }

    drawSpriteAnchored(getFighterSpriteId(g_p2), static_cast<int>(g_p2.x) + shakeX,
                       static_cast<int>(g_p2.y), g_p2.facing, g_p2.hitFlash > 0);
    drawSpriteAnchored(getFighterSpriteId(g_p1), static_cast<int>(g_p1.x) + shakeX,
                       static_cast<int>(g_p1.y), g_p1.facing, g_p1.hitFlash > 0);

    if (g_headActive) {
        gfx.setColor(lcd_color_rgb(215, 165, 130));
        gfx.fillCircle(static_cast<int>(g_headX), static_cast<int>(g_headY), 5);
        gfx.setColor(lcd_color_rgb(65, 45, 35));
        gfx.fillRect(static_cast<int>(g_headX) - 4, static_cast<int>(g_headY) - 5, 8, 3);
    }

    for (int i = 0; i < MAX_PARTICLES; ++i) {
        if (g_particles[i].life <= 0) continue;
        int px = static_cast<int>(g_particles[i].x);
        int py = static_cast<int>(g_particles[i].y);
        if (px >= 0 && px < 318 && py >= 0 && py < 238) {
            gfx.setColor(g_particles[i].col);
            gfx.fillRect(px, py, g_particles[i].size, g_particles[i].size);
        }
    }

    static const char* SKIN_LABELS[SKIN_COUNT] = {
        "KROM", "RIVAL AKA", "GORGAR", "VORGATH", "MALAKOR", "SEIGNEUR DRAX",
        "PILLARD", "SQUELETTE", "FAUVE", "GARDE NOIR"
    };
    drawHpBar(10, 16, 122, g_p1.hp, g_p1.maxHp, "KROM", lcd_color_rgb(235, 175, 45));
    drawHpBar(188, 16, 122, g_p2.hp, g_p2.maxHp, SKIN_LABELS[g_p2.skin], lcd_color_rgb(215, 48, 52));

    char scoreMid[16];
    std::snprintf(scoreMid, sizeof(scoreMid), "%d - %d", g_p1Rounds, g_p2Rounds);
    drawUtf8Centered(14, scoreMid, lcd_color_rgb(255, 220, 110));

    if (g_bannerTimer > 0) {
        g_bannerTimer--;
        drawUtf8Centered(42, g_bannerMsg, lcd_color_rgb(255, 215, 85));
    }
}

} // namespace

// ============================================================================
// 6. ESP-IDF ENTRY POINT (Gamebuino AKA Official Lifecycle)
// ============================================================================

static const char* const CONTROL_KEYS[] = {
    "CTRL_1", "CTRL_2", "CTRL_3", "CTRL_4", "CTRL_5", "CTRL_6", "CTRL_7", nullptr
};

extern "C" void app_main(void) {
    g_core.init();
    g_core.buttons.set_run_power_off(false);
    gfx.set_backlight_percent(85);
    gfx.clear(lcd_color_rgb(10, 12, 18));
    drawUtf8Centered(112, "CHARGEMENT DU GLAIVE D'ACIER...", lcd_color_rgb(245, 195, 70));
    gfx.update();

    input_init();
    akaRuntime.begin("Krom_Barbarian");
    akaRuntime.setCredits("Krom : Le Glaive d'Acier", "Studio Krom AKA", "MIT",
                          "https://github.com");
    akaRuntime.setControlsKeys(CONTROL_KEYS);
    akaRuntime.setGameMenuCallback(returnToTitleCallback);
    akaRuntime.setVolumeChangedCallback(onSystemVolumeChanged);

    // Initialize 4-channel Gamebuino AKA audio mixer
    g_audio.set_master_volume(215);
    g_audio.add_track(&g_trackLead, 0.42f);
    g_audio.add_track(&g_trackBass, 0.46f);
    g_audio.add_track(&g_trackDrums, 0.34f);
    g_audio.add_track(&g_trackSfx, 0.85f);
    applyAudioVolumes(akaRuntime.getMusicVolume(), akaRuntime.getSfxVolume());

    // Unpack cleaned sprites & 320x240 stage backgrounds into ESP32-S3 PSRAM
    unpackAllAssetsToPsram();
    g_lastStepMs = g_core.get_millis();

    while (true) {
        const uint32_t frameStart = g_core.get_millis();

        // Single I2C/ADC reader per frame via input_poll(g_keys)
        input_poll(g_keys);

        // Official AKA System Menu (MENU button / RUN+MENU return to OTA_1 Loader)
        if (!akaRuntime.update(g_keys)) {
            g_audio.pool();
            g_core.delay_ms(16);
            continue;
        }

        g_frameTick++;
        stepMusicSequencer(frameStart);

        switch (g_screen) {
            case SCR_TITLE:        updateAndDrawTitle(); break;
            case SCR_QUICK_SELECT: updateAndDrawQuickSelect(); break;
            case SCR_CUTSCENE:     updateAndDrawCutscene(); break;
            case SCR_FORGE:        updateAndDrawForge(); break;
            case SCR_GUIDE:        updateAndDrawGuide(); break;
            case SCR_TRAVERSAL:    updateAndDrawTraversal(); break;
            case SCR_DUEL:         updateAndDrawDuel(); break;
        }

        gfx.update();
        g_audio.pool();

        const uint32_t elapsed = g_core.get_millis() - frameStart;
        if (elapsed < 16) {
            g_core.delay_ms(16 - elapsed);
        }
    }
}
