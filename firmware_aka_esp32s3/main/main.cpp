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
    uint8_t part;
    uint8_t role;
    uint8_t leadWave;
    bool withCounter;
    bool pickupFill;
};

struct SongData {
    uint16_t stepMs;
    SongSlot arrangement[16];
    uint8_t bass[256];
    uint8_t lead[256];
    uint8_t counter[64];
    const char* drumMain;
    const char* drumBridge;
    const char* drumFill;
};

static const SongData SONGS[MUS_COUNT] = {
    // 0. TITLE — "Anvil of Krom"
    {
        184,
        {
            {0, ROLE_THEME, 0, false, false},
            {1, ROLE_THEME, 0, false, false},
            {0, ROLE_THEME, 0, true,  false},
            {2, ROLE_VERSE, 1, true,  true},
            {0, ROLE_THEME, 0, false, false},
            {1, ROLE_THEME, 0, true,  false},
            {3, ROLE_BRIDGE_CALM, 1, true, true},
            {0, ROLE_THEME, 0, true,  false},
            {2, ROLE_VERSE, 0, true,  false},
            {4, ROLE_VERSE, 1, true,  true},
            {5, ROLE_CLIMAX, 0, true, false},
            {0, ROLE_THEME, 1, true,  false},
            {6, ROLE_BRIDGE_EPIC, 1, true, true},
            {0, ROLE_THEME, 0, false, false},
            {1, ROLE_THEME, 0, true,  false},
            {7, ROLE_CODA,  0, false, false},
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
    // 1. FOREST — "Wilderness of Doom"
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
    // 2. CRYPT — "Catacombs of Vorgath"
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
    // 3. ARENA — "Blood & Sand Coliseum"
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
    // 4. SANCTUARY — "Altar of Seigneur Drax"
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
        uint8_t cntIdx = ((slotIdx & 1) * 32 + localStep) & 63;
        uint8_t cntNote = s.counter[cntIdx];
        if (cntNote > 0) {
            float cf = midiToFreq(cntNote);
            g_trackLead.play_tone(cf, cf, isCalmBridge ? 0.50f : 0.34f, 0.04f,
                                  static_cast<uint16_t>(s.stepMs * 1.3f),
                                  gb_audio_track_tone::TRIANGLE);
        }
    }

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
// 2. COMPLETE 6-LANGUAGE LOCALIZATION PACK (FR, EN, PT, ES, IT, DE)
//    Every line strictly <= 32 UTF-8 chars so ZERO text overflows 320x240!
// ============================================================================

enum LangId : uint8_t {
    LANG_FR = 0,
    LANG_EN = 1,
    LANG_PT = 2,
    LANG_ES = 3,
    LANG_IT = 4,
    LANG_DE = 5,
    LANG_COUNT = 6
};

enum BannerId : uint8_t {
    BNR_NONE = 0,
    BNR_CLEAR_VANGUARD = 1,
    BNR_WALL_BREACHED = 2,
    BNR_ROUND_1 = 3,
    BNR_NEXT_ROUND = 4,
    BNR_PERFECT_PARRY = 5,
    BNR_DECAPITATION = 6,
    BNR_SKILL_WHIRLWIND = 7,
    BNR_SKILL_ANVIL = 8,
    BNR_SKILL_RIPOSTE = 9,
    BNR_COUNT = 10
};

struct CutsceneShotText {
    const char* title;
    const char* line1;
    const char* line2;
};

struct LocalePack {
    const char* code;
    const char* creditsTitle;
    const char* titleMain;
    const char* titleSub;
    const char* titleItems[4];
    const char* impactLabels[3];
    const char* langRowLabel;
    const char* titleFooter;
    const char* quickTitle;
    const char* quickFoeFmt;     // "< ... : %s >"
    const char* stageNames[4];
    const char* quickArenaFmt;   // "... : %s"
    const char* quickFooter;
    const char* cutsceneFooter;
    const char* forgeTitle;
    const char* forgeShardsFmt;
    const char* forgeItems[3];   // <= 19 chars so "+ [Lv 3/3]" fits cleanly!
    const char* forgeLvlTag;     // "Niv", "Lv", "Nv", "St"
    const char* forgeMaxed;
    const char* forgeCostFmt;
    const char* forgeBoots1;     // <= 31 chars!
    const char* forgeBoots2;     // <= 31 chars!
    const char* forgeExit;
    const char* guidePages[4][6]; // All <= 32 chars!
    const char* guideFooter;
    const char* hudPtsShardsFmt;
    const char* hudPathClear;
    const char* hudFoesFmt;
    const char* skinNames[SKIN_COUNT];
    const char* banners[BNR_COUNT];
    CutsceneShotText cutscenes[9][2];
};

static const LocalePack LOCALES[LANG_COUNT] = {
    // -------------------- 0: FRANCAIS (fr) --------------------
    {
        "fr",
        "Krom : Le Glaive d'Acier",
        "KROM : LE GLAIVE D'ACIER",
        "EDITION GAMEBUINO AKA 320x240",
        {
            "CAMPAGNE (4 ACTES + BOSS)",
            "DUEL D'ARENE RAPIDE",
            "FORGE & BOTTES SECRETES (D)",
            "GUIDE DE COMBAT & PARADES"
        },
        {"< IMPACT : SOFT (ECLATS) >", "< IMPACT : NORMAL >", "< IMPACT : GORE >"},
        "< LANGUE : FRANCAIS >",
        "A:Valider  D:Forge  MENU:Pause",
        "DUEL D'ARENE RAPIDE",
        "< ADVERSAIRE : %s >",
        {"FORET CENDREE", "CRYPTE NOIRE", "ARENE SABLE", "SANCTUAIRE"},
        "Haut/Bas Arene : %s",
        "A:Combattre   B:Retour Titre",
        "A:Suite  D:Forge  B/RUN:Passer",
        "FORGE DU CAMPEMENT",
        "Eclats d'Acier dispo : %d",
        {"ACIER TREMPE (+4)", "HARNOIS NORD (+18)", "BOTTES SECRETES"},
        "Niv",
        "MAITRISE MAXIMALE",
        "Cout: %d eclats (A:Forger)",
        "Bottes: 1:R1+Av | 2:C+Haut",
        "3:Parade L1->A (Riposte +12)",
        "B / D : Quitter la Forge",
        {
            {"1/4 : COMMANDES DE BASE",
             "Stick/DPad: Marche, Saut, Bas",
             "A : Taille Vive / Estoc",
             "B : Balayage Bas (fauche)",
             "D : Roulade d'esquive",
             "MENU : Pause, Langue, Loader"},
            {"2/4 : ATTAQUES LOURDES",
             "R1 : Fendoir Brise-Garde",
             "C : Moulinet 360 Decapitant",
             "-> Decapite un ennemi affaibli",
             "-> Ennemi accroupi : esquive",
             "   le moulinet haut !"},
            {"3/4 : GARDE & PARADES",
             "Maintenir L1 : Garde Haute",
             "L1 juste a l'impact :",
             "-> PARADE PARFAITE DOREE !",
             "-> Etourdit l'ennemi + bonus",
             "   de +12 degats au coup !"},
            {"4/4 : FORGE & BOTTES",
             "Gagnez des Eclats en combat.",
             "Ouvrez la Forge (D ou RUN) :",
             "Niv1 : R1+Avant Bris d'Enclume",
             "Niv2 : C+Haut Tourbillon Nord",
             "Niv3 : Parade L1->A Riposte"}
        },
        "Gauche/Droite:Page   B:Fermer",
        "PTS %lu  ECLATS %d",
        "VOIE LIBRE : BOSS >>",
        "ENNEMIS:%d  RUN:Forge",
        {"KROM", "RIVAL AKA", "GORGAR", "VORGATH", "MALAKOR", "SEIGNEUR DRAX",
         "PILLARD", "SQUELETTE", "FAUVE", "GARDE NOIR"},
        {"", "ELIMINEZ L'AVANT-GARDE !", "MUR FRANCHI : AVANCEZ !",
         "MANCHE 1 - EN GARDE !", "MANCHE SUIVANTE !", "PARADE PARFAITE !",
         "DECAPITATION !!", "TOURBILLON DU NORD !", "BRIS D'ENCLUME !", "RIPOSTE ECLAIR !"},
        {
            {{"ACTE I - CLAIRIERES CENDREES", "Les pillards brulent le Nord.", "Krom saisit le Glaive d'Acier."},
             {"LA PISTE DE GORGAR", "Franchissez les murs et brisez", "la horde avant les menhirs !"}},
            {{"GORGAR LE BRISEUR", "\"Ta tete ornera mon totem !\"", "Gare a son lourd fendoir."},
             {"CERCLE DE PIERRE", "L1 a l'impact : Parade doree", "C au cou : Decapitation !"}},
            {{"ACTE II - CRYPTES NOIRES", "Gorgar vaincu, Krom descend", "dans les geoles d'obsidienne."},
             {"LES CATACOMBES", "Pressez D pour forger votre", "glaive avec vos eclats !"}},
            {{"BOURREAU VORGATH", "Sa hache noire fauche tout.", "Esquivez d'une roulade (D) !"},
             {"PONT DU BILLOT", "Sautez ses coups bas et", "frappez dans l'ouverture !"}},
            {{"ACTE III - ARENE D'OS", "Les tambours grondent au", "colisee de sang et de sable !"},
             {"MURS DU COLISEE", "Percez chaque muraille jusqu'a", "Malakor le champion invaincu !"}},
            {{"CHAMPION MALAKOR", "Vif comme l'eclair d'arene.", "Variez vos coups pour percer !"},
             {"SOUS LES CLAMEURS", "Une parade parfaite ouvre", "une riposte devastatrice !"}},
            {{"ACTE IV - CITADELLE DRAX", "La garde noire defend l'autel", "sous la foudre pourpre."},
             {"DERNIER REMPART", "Forgez vos armes (touche D)", "avant le Seigneur Drax !"}},
            {{"SEIGNEUR SORCIER DRAX", "\"Nul mortel ne me vaincra !\"", "Son glaive runique flamboie."},
             {"COMBAT ULTIME", "Toutes vos bottes secretes", "decideront du sort du Nord !"}},
            {{"TRIOMPHE DE L'ACIER", "Drax tombe ! La tempete noire", "se dissipe sur le Nord libre."},
             {"LEGENDE ETERNELLE", "Les bardes chantent KROM !", "Merci d'avoir joue sur AKA."}}
        }
    },

    // -------------------- 1: ENGLISH (en) --------------------
    {
        "en",
        "Krom: Blade of Steel",
        "KROM: BLADE OF STEEL",
        "GAMEBUINO AKA 320x240 EDITION",
        {
            "STORY CAMPAIGN (4 ACTS)",
            "QUICK ARENA DUEL",
            "FORGE & SECRET ARTS (D)",
            "COMBAT & PARRY GUIDE"
        },
        {"< IMPACT: SOFT (SPARKS) >", "< IMPACT: NORMAL >", "< IMPACT: GORE >"},
        "< LANGUAGE: ENGLISH >",
        "A:Select  D:Forge  MENU:Pause",
        "QUICK ARENA DUEL",
        "< OPPONENT: %s >",
        {"ASHEN FOREST", "DARK CRYPT", "BLOOD ARENA", "SANCTUARY"},
        "Up/Down Stage: %s",
        "A:Fight   B:Title Screen",
        "A:Next  D:Forge  B/RUN:Skip",
        "CAMPFIRE FORGE",
        "Steel Shards owned: %d",
        {"TEMPERED BLADE (+4)", "NORTH ARMOR (+18)", "SECRET SWORD ARTS"},
        "Lv",
        "MAXIMUM MASTERY",
        "Cost: %d shards (A:Forge)",
        "Arts: 1:R1+Fwd | 2:C+Up",
        "3:Parry L1->A (Riposte +12)",
        "B / D : Exit Forge",
        {
            {"1/4 : BASIC CONTROLS",
             "Stick/DPad: Move, Jump, Duck",
             "A : Quick Slash / Thrust",
             "B : Low Sweep (trips guard)",
             "D : Invincible Dodge Roll",
             "MENU : Pause, Lang, Loader"},
            {"2/4 : HEAVY STRIKES",
             "R1 : Guard-Break Overhead",
             "C : 360 Decapitating Spin",
             "-> Beheads weakened foes!",
             "-> Crouching foes duck under",
             "   high spin slashes!"},
            {"3/4 : GUARD & PARRY",
             "Hold L1 : High Sword Guard",
             "Tap L1 right on impact :",
             "-> GOLDEN PERFECT PARRY!",
             "-> Stuns attacker & boosts",
             "   next strike (+12 damage)"},
            {"4/4 : FORGE & SECRET ARTS",
             "Earn Steel Shards in battle.",
             "Open Forge with D or RUN :",
             "Lv1 : R1+Fwd = Anvil Breaker",
             "Lv2 : C+Up = North Whirlwind",
             "Lv3 : Parry L1->A = Riposte"}
        },
        "Left/Right:Page   B:Close",
        "PTS %lu  SHARDS %d",
        "PATH CLEAR: BOSS >>",
        "FOES:%d  RUN:Forge",
        {"KROM", "AKA RIVAL", "GORGAR", "VORGATH", "MALAKOR", "LORD DRAX",
         "RAIDER", "SKELETON", "PIT BEAST", "DARK GUARD"},
        {"", "DEFEAT THE VANGUARD!", "WALL BREACHED: ADVANCE!",
         "ROUND 1 - FIGHT!", "NEXT ROUND!", "PERFECT PARRY!",
         "DECAPITATION!!", "NORTH WHIRLWIND!", "ANVIL BREAKER!", "FLASH RIPOSTE!"},
        {
            {{"ACT I - ASHEN GLADES", "Drax's raiders burn the North.", "Krom draws the Blade of Steel."},
             {"GORGAR'S TRAIL", "Break through the stone walls", "before the menhir arena!"}},
            {{"GORGAR THE BONEBREAKER", "\"Your skull joins my totem!\"", "Beware his heavy guard-crush."},
             {"STONE CIRCLE DUEL", "L1 on impact: Golden Parry!", "C at neck: Decapitation!"}},
            {{"ACT II - OBSIDIAN CRYPTS", "Past fallen Gorgar, Krom", "descends into magma dungeons."},
             {"DARK CATACOMBS", "Press D at camp to temper", "your sword with shards!"}},
            {{"EXECUTIONER VORGATH", "His black axe reaps all foes.", "Roll past his strikes with D!"},
             {"THE CHOPPING BRIDGE", "Mix high and low strikes to", "shatter his iron defense!"}},
            {{"ACT III - BONE COLISEUM", "War drums thunder beneath", "the scorching crimson sun!"},
             {"ARENA BASTIONS", "Breach every arena wall to", "face unbeaten Malakor!"}},
            {{"CHAMPION MALAKOR", "Swift master of the blood pit.", "Time your parries carefully!"},
             {"ROAR OF THE CROWD", "A Perfect Parry opens a", "devastating counter-slash!"}},
            {{"ACT IV - DRAX SANCTUARY", "Dark sentinels guard the bridge", "beneath purple lightning."},
             {"FINAL ASCENT", "Spend your shards at Forge (D)", "before facing Lord Drax!"}},
            {{"SORCERER-KING DRAX", "\"No mortal breaks my crown!\"", "His runic blade blazes dark."},
             {"ULTIMATE DUEL", "Unleash every secret art to", "free the Northern realm!"}},
            {{"TRIUMPH OF STEEL", "Drax falls! Dark storm clouds", "vanish over the free North."},
             {"ETERNAL LEGEND", "Bards sing of mighty KROM!", "Thanks for playing on AKA."}}
        }
    },

    // -------------------- 2: PORTUGUES (pt) --------------------
    {
        "pt",
        "Krom: Espada de Aco",
        "KROM: A ESPADA DE ACO",
        "EDICAO GAMEBUINO AKA 320x240",
        {
            "CAMPANHA (4 ATOS + CHEFES)",
            "DUELO RAPIDO DE ARENA",
            "FORJA & TECNICAS (D)",
            "GUIA DE GOLPES & DEFESA"
        },
        {"< IMPACTO: SOFT (FAISCAS) >", "< IMPACTO: NORMAL >", "< IMPACTO: GORE >"},
        "< IDIOMA: PORTUGUES >",
        "A:OK  D:Forja  MENU:Sistema",
        "DUELO RAPIDO DE ARENA",
        "< INIMIGO: %s >",
        {"FLORESTA CINZA", "CRIPTA NEGRA", "ARENA SANGUE", "SANTUARIO"},
        "Cima/Baixo Arena: %s",
        "A:Lutar   B:Tela Inicial",
        "A:Seguir  D:Forja  B/RUN:Pular",
        "FORJA DO ACAMPAMENTO",
        "Fragmentos de Aco: %d",
        {"ACO TEMPERADO (+4)", "ARMADURA NORTE(+18)", "TECNICAS SECRETAS"},
        "Nv",
        "MAESTRIA MAXIMA",
        "Custo: %d frag. (A:Forjar)",
        "Tecn.: 1:R1+Frente | 2:C+Cima",
        "3:Defesa L1->A (Riposte +12)",
        "B / D : Sair da Forja",
        {
            {"1/4 : CONTROLES BASICOS",
             "Stick/DPad: Andar, Pulo, Ag.",
             "A : Corte Rapido / Estocada",
             "B : Rasteira Baixa",
             "D : Rolamento invencivel",
             "MENU : Pausa, Idioma, Loader"},
            {"2/4 : GOLPES PESADOS",
             "R1 : Golpe Quebra-Guarda",
             "C : Giro Decapitador 360",
             "-> Decapita inimigo fraco!",
             "-> Inimigo agachado escapa",
             "   do giro alto!"},
            {"3/4 : GUARDA & DEFESA",
             "Segurar L1 : Guarda Alta",
             "L1 bem no impacto :",
             "-> DEFESA PERFEITA DOURADA!",
             "-> Atordoa e da +12 de dano",
             "   no proximo golpe!"},
            {"4/4 : FORJA & TECNICAS",
             "Ganhe Fragmentos lutando.",
             "Abra a Forja com D ou RUN :",
             "Nv1 : R1+Frente Quebra-Bigorna",
             "Nv2 : C+Cima Turbilhao Norte",
             "Nv3 : Defesa L1->A Riposte"}
        },
        "Esq/Dir:Pagina   B:Fechar",
        "PTS %lu  FRAG %d",
        "CAMINHO LIVRE: CHEFE >>",
        "INIMIGOS:%d  RUN:Forja",
        {"KROM", "RIVAL AKA", "GORGAR", "VORGATH", "MALAKOR", "SENHOR DRAX",
         "SAQUEADOR", "ESQUELETO", "FERA", "GUARDA NEGRO"},
        {"", "DERROTE A VANGUARDA!", "MURO VENCIDO: AVANCE!",
         "ASSALTO 1 - LUTEM!", "PROXIMO ASSALTO!", "DEFESA PERFEITA!",
         "DECAPITACAO!!", "TURBILHAO DO NORTE!", "QUEBRA-BIGORNA!", "RIPOSTE RELAMPAGO!"},
        {
            {{"ATO I - CLAREIRAS CINZAS", "Saqueadores queimam o Norte.", "Krom ergue a Espada de Aco."},
             {"TRILHA DE GORGAR", "Cruze as muralhas e vencca", "a horda antes dos menires!"}},
            {{"GORGAR QUEBRA-OSSOS", "\"Seu cranio sera meu trofeu!\"", "Cuidado com seu golpe pesado."},
             {"CIRCULO DE PEDRA", "L1 no impacto: Defesa Perfeita", "C no pescoco: Decapitacao!"}},
            {{"ATO II - CRIPTAS NEGRAS", "Gorgar cai; Krom desce as", "masmorras de obsidiana."},
             {"AS CATACUMBAS", "Aperte D para forjar sua", "espada com seus fragmentos!"}},
            {{"CARRASCO VORGATH", "Seu machado negro corta tudo.", "Role com D para esquivar!"},
             {"PONTE DE LAVA", "Alterne golpes altos e baixos", "para abrir sua guarda!"}},
            {{"ATO III - ARENA DE OSSOS", "Tambores ecoam sob o sol", "vermelho do grande coliseu!"},
             {"MURALHAS DA ARENA", "Rompa os muros entre arenas", "ate o campeao Malakor!"}},
            {{"CAMPEAO MALAKOR", "Veloz como um raio na areia.", "Domine o tempo da defesa!"},
             {"SOB OS GRITOS", "Uma Defesa Perfeita abre um", "contra-ataque devastador!"}},
            {{"ATO IV - SANTUARIO DRAX", "A guarda negra protege o altar", "sob raios purpuras."},
             {"ULTIMA SUBIDA", "Use seus fragmentos na Forja", "antes de enfrentar Drax!"}},
            {{"REI FEITICEIRO DRAX", "\"Nenhum mortal me vencera!\"", "Sua lamina runica queima."},
             {"DUELO FINAL", "Use todas as tecnicas secretas", "para libertar o Norte!"}},
            {{"TRIUNFO DO ACO", "Drax tomba! A tempestade", "some das terras do Norte."},
             {"LENDA ETERNA", "Os bardos cantam o grande KROM", "Obrigado por jogar no AKA!"}}
        }
    },

    // -------------------- 3: ESPANOL (es) --------------------
    {
        "es",
        "Krom: Espada de Acero",
        "KROM: LA ESPADA DE ACERO",
        "EDICION GAMEBUINO AKA 320x240",
        {
            "CAMPANA (4 ACTOS + JEFES)",
            "DUELO RAPIDO DE ARENA",
            "FORJA Y TECNICAS (D)",
            "GUIA DE GOLPES Y PARADAS"
        },
        {"< IMPACTO: SOFT (CHISPAS) >", "< IMPACTO: NORMAL >", "< IMPACTO: GORE >"},
        "< IDIOMA: ESPANOL >",
        "A:Aceptar  D:Forja  MENU:Pausa",
        "DUELO RAPIDO DE ARENA",
        "< RIVAL: %s >",
        {"BOSQUE CENIZA", "CRIPTA NEGRA", "ARENA SANGRE", "SANTUARIO"},
        "Arriba/Abajo Arena: %s",
        "A:Luchar   B:Menu Inicial",
        "A:Sigue  D:Forja  B/RUN:Saltar",
        "FORJA DEL CAMPAMENTO",
        "Esquirlas de Acero: %d",
        {"ACERO TEMPLADO (+4)", "ARMADURA NORTE(+18)", "TECNICAS SECRETAS"},
        "Nv",
        "MAESTRIA MAXIMA",
        "Costo: %d esq. (A:Forjar)",
        "Tecn.: 1:R1+Adel. | 2:C+Arr.",
        "3:Parada L1->A (Riposte +12)",
        "B / D : Salir de la Forja",
        {
            {"1/4 : CONTROLES BASICOS",
             "Stick/DPad: Mover, Salto, Ab.",
             "A : Tajo Veloz / Estocada",
             "B : Barrido Bajo",
             "D : Rodar invencible",
             "MENU : Pausa, Idioma, Loader"},
            {"2/4 : ATAQUES PESADOS",
             "R1 : Fendiente Rompeguardia",
             "C : Giro Decapitador 360",
             "-> Decapita al rival herido!",
             "-> Agacharse esquiva el giro",
             "   decapitador alto!"},
            {"3/4 : GUARDIA Y PARADA",
             "Mantener L1 : Guardia Alta",
             "Pulsar L1 justo al impacto:",
             "-> PARADA PERFECTA DORADA!",
             "-> Aturde al rival y suma",
             "   +12 dano al siguiente tajo"},
            {"4/4 : FORJA Y TECNICAS",
             "Gana Esquirlas combatiendo.",
             "Abre la Forja con D o RUN :",
             "Nv1 : R1+Adel. Rompeyunque",
             "Nv2 : C+Arriba Torbellino",
             "Nv3 : Parada L1->A Riposte"}
        },
        "Izq/Der:Pagina   B:Cerrar",
        "PTS %lu  ESQ %d",
        "PASO LIBRE: JEFE >>",
        "ENEMIGOS:%d  RUN:Forja",
        {"KROM", "RIVAL AKA", "GORGAR", "VORGATH", "MALAKOR", "SENOR DRAX",
         "SAQUEADOR", "ESQUELETO", "FIERA", "GUARDIA NEGRO"},
        {"", "ELIMINA LA VANGUARDIA!", "MURO ABIERTO: AVANZA!",
         "RONDA 1 - EN GUARDIA!", "SIGUIENTE RONDA!", "PARADA PERFECTA!",
         "DECAPITACION!!", "TORBELLINO DEL NORTE!", "ROMPEYUNQUE!", "RIPOSTE RELAMPAGO!"},
        {
            {{"ACTO I - CLAROS DE CENIZA", "Los saqueadores queman todo.", "Krom alza la Espada de Acero."},
             {"SENDA DE GORGAR", "Cruza los muros de piedra y", "vence a la horda del Norte!"}},
            {{"GORGAR ROMPEHUESOS", "\"Tu craneo ornara mi totem!\"", "Cuidado con su golpe pesado."},
             {"CIRCULO DE PIEDRA", "L1 al impacto: Parada Dorada", "C al cuello: Decapitacion!"}},
            {{"ACTO II - CRIPTAS NEGRAS", "Vencido Gorgar, Krom baja a", "las mazmorras de obsidiana."},
             {"LAS CATACUMBAS", "Pulsa D para forjar tu hoja", "con esquirlas de acero!"}},
            {{"VERDUGO VORGATH", "Su hacha negra todo lo siega.", "Rueda con D para esquivar!"},
             {"PUENTE DE LAVA", "Alterna tajos altos y bajos", "para romper su defensa!"}},
            {{"ACTO III - ARENA DE HUESOS", "Retumban tambores bajo el", "sol rojo del gran coliseo!"},
             {"MUROS DEL COLISEO", "Supera cada muralla entre", "arenas hasta hallar Malakor!"}},
            {{"CAMPEON MALAKOR", "Veloz maestro de la arena.", "Mide bien cada parada L1!"},
             {"CLAMOR DEL COLISEO", "Una Parada Perfecta abre un", "contraataque demoledor!"}},
            {{"ACTO IV - ALTAR DE DRAX", "La guardia negra protege el", "puente bajo rayos purpuras."},
             {"ULTIMO BASTION", "Gasta tus esquirlas en Forja", "antes de retar a Lord Drax!"}},
            {{"REY BRUJO DRAX", "\"Ningun mortal me vencera!\"", "Su espada runica arde oscura."},
             {"DUELO SUPREMO", "Usa todas tus tecnicas para", "liberar las tierras del Norte!"}},
            {{"TRIUNFO DEL ACERO", "Drax cae! La tormenta oscura", "se disipa sobre el Norte."},
             {"LEYENDA ETERNA", "Los bardos cantan a KROM!", "Gracias por jugar en AKA."}}
        }
    },

    // -------------------- 4: ITALIANO (it) --------------------
    {
        "it",
        "Krom: Spada d'Acciaio",
        "KROM: LA SPADA D'ACCIAIO",
        "EDIZIONE GAMEBUINO AKA 320x240",
        {
            "CAMPAGNA (4 ATTI + BOSS)",
            "DUELLO RAPIDO ARENA",
            "FORGIA E TECNICHE (D)",
            "GUIDA COLPI E PARATE"
        },
        {"< IMPATTO: SOFT (SCINTILLE) >", "< IMPATTO: NORMALE >", "< IMPATTO: GORE >"},
        "< LINGUA: ITALIANO >",
        "A:OK  D:Forgia  MENU:Pausa",
        "DUELLO RAPIDO ARENA",
        "< NEMICO: %s >",
        {"FORESTA CENERE", "CRIPTA NERA", "ARENA SABBIA", "SANTUARIO"},
        "Su/Giu Arena: %s",
        "A:Combatti   B:Titolo",
        "A:Avanti  D:Forgia  B/RUN:Salta",
        "FORGIA DA CAMPO",
        "Schegge d'Acciaio: %d",
        {"ACCIAIO TEMPRATO(+4)", "CORAZZA NORD (+18)", "TECNICHE SEGRETE"},
        "Lv",
        "MAESTRIA MASSIMA",
        "Costo: %d schegge (A:Forgia)",
        "Tecn.: 1:R1+Avanti | 2:C+Su",
        "3:Parata L1->A (Risposta +12)",
        "B / D : Esci dalla Forgia",
        {
            {"1/4 : COMANDI DI BASE",
             "Stick/DPad: Muovi, Salta, Giu",
             "A : Fendente / Affondo",
             "B : Spazzata Bassa",
             "D : Capriola invincibile",
             "MENU : Pausa, Lingua, Loader"},
            {"2/4 : ATTACCHI PESANTI",
             "R1 : Colpo Spezzaguardia",
             "C : Giro Decapitante 360",
             "-> Decapita il nemico ferito!",
             "-> Chi si abbassa schiva il",
             "   giro decapitante alto!"},
            {"3/4 : GUARDIA E PARATA",
             "Tieni L1 : Guardia Alta",
             "Premi L1 giusto all'impatto:",
             "-> PARATA PERFETTA DORATA!",
             "-> Stordisce il nemico e da",
             "   +12 danni al colpo dopo!"},
            {"4/4 : FORGIA E TECNICHE",
             "Ottieni Schegge in battaglia.",
             "Apri la Forgia con D o RUN :",
             "Lv1 : R1+Avanti Spezzincudine",
             "Lv2 : C+Su Turbine del Nord",
             "Lv3 : Parata L1->A Risposta"}
        },
        "Sin/Des:Pagina   B:Chiudi",
        "PTS %lu  SCHEGGE %d",
        "VIA LIBERA: BOSS >>",
        "NEMICI:%d  RUN:Forgia",
        {"KROM", "RIVALE AKA", "GORGAR", "VORGATH", "MALAKOR", "SIGNOR DRAX",
         "PREDONE", "SCHELETRO", "BELVA", "GUARDIA NERA"},
        {"", "ELIMINA L'AVANGUARDIA!", "MURO SUPERATO: AVANTI!",
         "ROUND 1 - IN GUARDIA!", "PROSSIMO ROUND!", "PARATA PERFETTA!",
         "DECAPITAZIONE!!", "TURBINE DEL NORD!", "SPEZZINCUDINE!", "RISPOSTA LAMPO!"},
        {
            {{"ATTO I - RADURE DI CENERE", "I predoni bruciano il Nord.", "Krom impugna la Spada."},
             {"SENTIERO DI GORGAR", "Supera le mura di pietra fino", "al cerchio dei menhir!"}},
            {{"GORGAR SPEZZAOSSA", "\"Il tuo teschio sara mio!\"", "Attento al colpo pesante."},
             {"CERCHIO DI PIETRA", "L1 all'impatto: Parata d'Oro", "C al collo: Decapitazione!"}},
            {{"ATTO II - CRIPTE NERE", "Sconfitto Gorgar, Krom scende", "nelle prigioni d'ossidiana."},
             {"LE CATACOMBE", "Premi D per forgiare la lama", "con le schegge raccolte!"}},
            {{"CARNEFICE VORGATH", "La sua scure nera falcia tutto", "Rotola con D per schivare!"},
             {"PONTE DI LAVA", "Alterna colpi alti e bassi", "per spezzare la sua guardia!"}},
            {{"ATTO III - ARENA D'OSSA", "I tamburi tuonano sotto il", "sole rosso del colosseo!"},
             {"MURA DEL COLOSSEO", "Varca ogni muraglia tra le", "arene fino al grande Malakor!"}},
            {{"CAMPIONE MALAKOR", "Rapido signore della sabbia.", "Calibra bene ogni parata!"},
             {"URLO DELLA FOLLA", "Una Parata Perfetta apre un", "contrattacco devastante!"}},
            {{"ATTO IV - SANTUARIO DRAX", "La guardia nera difende il", "ponte sotto lampi purpurei."},
             {"ULTIMA ASCESA", "Usa le schegge alla Forgia", "prima di sfidare Lord Drax!"}},
            {{"RE STREGONE DRAX", "\"Nessun mortale mi pieghera!\"", "La sua lama runica brucia."},
             {"DUELLO FINALE", "Scatena le tecniche segrete", "per liberare tutto il Nord!"}},
            {{"TRIONFO D'ACCIAIO", "Drax cade! La tempesta nera", "svanisce sulle terre libere."},
             {"LEGGENDA ETERNA", "I bardi cantano il gran KROM!", "Grazie per aver giocato!"}}
        }
    },

    // -------------------- 5: DEUTSCH (de) --------------------
    {
        "de",
        "Krom: Klinge aus Stahl",
        "KROM: KLINGE AUS STAHL",
        "GAMEBUINO AKA 320x240 EDITION",
        {
            "KAMPAGNE (4 AKTE + BOSSE)",
            "SCHNELLES ARENA-DUELL",
            "SCHMIEDE & TECHNIKEN (D)",
            "KAMPF- & PARADE-GUIDE"
        },
        {"< TREFFER: SOFT (FUNKEN) >", "< TREFFER: NORMAL >", "< TREFFER: GORE >"},
        "< SPRACHE: DEUTSCH >",
        "A:OK  D:Schmiede  MENU:Pause",
        "SCHNELLES ARENA-DUELL",
        "< GEGNER: %s >",
        {"ASCHEWALD", "DUNKLE KRYPTA", "BLUTARENA", "HEILIGTUM"},
        "Auf/Ab Arena: %s",
        "A:Kampf   B:Titelbild",
        "A:Weiter D:Schmiede B/RUN:Skip",
        "LAGERSCHMIEDE",
        "Stahlsplitter: %d",
        {"HARTSTAHL (+4 Dmg)", "NORDPANZER (+18 LP)", "GEHEIMTECHNIKEN"},
        "St",
        "MEISTERSCHAFT MAX",
        "Kosten: %d Spl. (A:Schmieden)",
        "Techn.: 1:R1+Vor | 2:C+Auf",
        "3:Parade L1->A (Konter +12)",
        "B / D : Schmiede verlassen",
        {
            {"1/4 : GRUNDSTEUERUNG",
             "Stick/DPad: Lauf, Sprung, Ab",
             "A : Schneller Hieb / Stich",
             "B : Tiefer Feger",
             "D : Ausweichrolle",
             "MENU : Pause, Sprache, Loader"},
            {"2/4 : SCHWERE ANGRIFFE",
             "R1 : Deckungsbrecher-Spalter",
             "C : 360-Enthauptungswirbel",
             "-> Enthauptet schwache Feinde",
             "-> Geduckte Gegner meiden",
             "   den hohen Wirbelhieb!"},
            {"3/4 : DECKUNG & PARADE",
             "L1 halten : Hohe Deckung",
             "L1 genau beim Treffer :",
             "-> GOLDENE PERFEKTE PARADE!",
             "-> Betaubt Feind & gibt +12",
             "   Schaden beim Konter!"},
            {"4/4 : SCHMIEDE & TECHNIK",
             "Sammle Splitter im Kampf.",
             "Schmiede mit D oder RUN :",
             "St1 : R1+Vor Ambossbrecher",
             "St2 : C+Auf Nordwirbel",
             "St3 : Parade L1->A Blitzkonter"}
        },
        "Links/Rechts:Seite   B:Zuruck",
        "PKT %lu  SPL %d",
        "WEG FREI: BOSS >>",
        "FEINDE:%d  RUN:Schmiede",
        {"KROM", "AKA-RIVALE", "GORGAR", "VORGATH", "MALAKOR", "FURST DRAX",
         "PLUNDERER", "SKELETT", "BESTIE", "SCHATTENGARDE"},
        {"", "BESIEGE DIE VORHUT!", "MAUER DURCHBROCHEN: WEITER!",
         "RUNDE 1 - AUF DIE KLINGE!", "NACHSTE RUNDE!", "PERFEKTE PARADE!",
         "ENTHAUPTUNG!!", "NORDWIRBEL!", "AMBOSSBRECHER!", "BLITZKONTER!"},
        {
            {{"AKT I - ASCHELICHTUNGEN", "Plunderer verbrennen den Nord.", "Krom zieht die Stahlklinge."},
             {"GORGARS PFAD", "Durchbrich die Steinmauern", "vor dem Menhir-Steinkreis!"}},
            {{"GORGAR KNOCHENBRECHER", "\"Dein Schadel ziert mein Mal!\"", "Vorsicht vor seinem Spalter!"},
             {"DUELL AM STEINKREIS", "L1 beim Treffer: Goldparade!", "C am Hals: Enthauptung!"}},
            {{"AKT II - OBSIDIANKRYPTA", "Gorgar fiel; Krom steigt in", "die Lavaverliese hinab."},
             {"DIE KATAKOMBEN", "Drucke D, um dein Schwert", "mit Splittern zu hartet!"}},
            {{"HENKER VORGATH", "Seine schwarze Axt maht alles.", "Rolle mit D durch Hiebe!"},
             {"DIE BLUTBRUCKE", "Wechsle hohe und tiefe Hiebe,", "um seine Deckung zu brechen!"}},
            {{"AKT III - KNOCHENARENA", "Kriegstrommeln dronen unter", "der blutroten Arenasomne!"},
             {"ARENA-FESTUNGSMAUERN", "Erstürme jede Mauer zwischen", "den Arenen bis zu Malakor!"}},
            {{"CHAMPION MALAKOR", "Blitzschneller Herr im Sand.", "Plane jede Parade prazise!"},
             {"JUBEL DES KOLOSSEUMS", "Eine Perfekte Parade offnet", "einen vernichtenden Konter!"}},
            {{"AKT IV - DRAX-HEILIGTUM", "Schattengarden schutzen den", "Altar im purpurnen Gewitter."},
             {"LETZTER AUFSTIEG", "Nutze die Schmiede (Taste D)", "vor dem Kampf gegen Drax!"}},
            {{"HEXENKONIG DRAX", "\"Kein Sterblicher bricht mich\"", "Seine Runenklinge lodert."},
             {"ENDSCHLACHT", "Nutze alle Geheimtechniken,", "um den Norden zu befreien!"}},
            {{"TRIUMPH DES STAHLS", "Drax fallt! Der dunkle Sturm", "weicht dem freien Morgenrot."},
             {"EWIGE LEGENDE", "Barden besingen Held KROM!", "Danke fürs Spielen auf AKA!"}}
        }
    }
};

static LangId g_lastSyncedLang = LANG_COUNT;

static LangId getLangId() {
    const char* code = akaRuntime.getLanguage();
    if (!code) return LANG_FR;
    if (std::strcmp(code, "en") == 0) return LANG_EN;
    if (std::strcmp(code, "pt") == 0) return LANG_PT;
    if (std::strcmp(code, "es") == 0) return LANG_ES;
    if (std::strcmp(code, "it") == 0) return LANG_IT;
    if (std::strcmp(code, "de") == 0) return LANG_DE;
    return LANG_FR;
}

static const LocalePack& loc() {
    LangId id = getLangId();
    if (id != g_lastSyncedLang) {
        g_lastSyncedLang = id;
        akaRuntime.setCredits(LOCALES[id].creditsTitle, "Studio Krom AKA", "MIT",
                              "https://github.com");
    }
    return LOCALES[id];
}

static void cycleLanguage(int delta) {
    int cur = static_cast<int>(getLangId());
    int next = (cur + delta + static_cast<int>(LANG_COUNT)) % static_cast<int>(LANG_COUNT);
    akaRuntime.setLanguage(LOCALES[next].code);
    loc();
}

// ============================================================================
// 3. PSRAM ASSET UNPACKER & MULTI-SEGMENT NON-LOOPING WORLD RENDERER
// ============================================================================

struct UnpackedSprite {
    uint16_t w;
    uint16_t h;
    int16_t ax;
    uint16_t* pixels;
};

static uint16_t* g_stageBuffers[4] = {nullptr, nullptr, nullptr, nullptr};
static uint16_t* g_panoramaBuf = nullptr;
static int g_loadedPanoramaAct = -1;
static UnpackedSprite g_sprites[TOTAL_PACKED_SPRITES];

static void* allocAssetRam(size_t bytes) {
    void* p = heap_caps_malloc(bytes, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT);
    if (!p) p = std::malloc(bytes);
    return p;
}

static bool unpackStageLz256Into(const PackedStageAsset& asset, uint16_t* buf) {
    if (!buf) return false;
    const size_t totalPx = static_cast<size_t>(asset.w) * asset.h;
    const uint16_t* pal = asset.palette256;
    const uint8_t* lz = asset.lzIndices;
    const uint32_t lzLen = asset.lzLen;
    size_t outIdx = 0;
    uint32_t rPos = 0;
    while (rPos < lzLen && outIdx < totalPx) {
        uint8_t tag = lz[rPos++];
        if (tag < 0x80) {
            uint32_t run = static_cast<uint32_t>(tag) + 1;
            while (run-- && outIdx < totalPx && rPos < lzLen) {
                buf[outIdx++] = pal[lz[rPos++]];
            }
        } else {
            if (rPos >= lzLen) break;
            uint32_t len = (static_cast<uint32_t>(tag - 0x80) >> 4) + 3;
            uint32_t off = ((static_cast<uint32_t>(tag & 0x0F) << 8) | lz[rPos++]) + 1;
            while (len-- && outIdx < totalPx) {
                buf[outIdx] = (outIdx >= off) ? buf[outIdx - off] : pal[0];
                outIdx++;
            }
        }
    }
    while (outIdx < totalPx) buf[outIdx++] = pal[0];
    return true;
}

static uint16_t* unpackStageLz256Alloc(const PackedStageAsset& asset) {
    const size_t totalPx = static_cast<size_t>(asset.w) * asset.h;
    uint16_t* buf = static_cast<uint16_t*>(allocAssetRam(totalPx * sizeof(uint16_t)));
    if (!buf) return nullptr;
    unpackStageLz256Into(asset, buf);
    return buf;
}

static void ensurePanoramaLoaded(int actIdx) {
    const int idx = actIdx & 3;
    if (!g_panoramaBuf) {
        g_panoramaBuf = static_cast<uint16_t*>(allocAssetRam(2560 * 240 * sizeof(uint16_t)));
    }
    if (g_panoramaBuf && g_loadedPanoramaAct != idx) {
        unpackStageLz256Into(PACKED_PANORAMAS[idx], g_panoramaBuf);
        g_loadedPanoramaAct = idx;
    }
}

static void unpackAllAssetsToPsram() {
    for (int s = 0; s < 4; ++s) {
        g_stageBuffers[s] = unpackStageLz256Alloc(PACKED_STAGES[s]);
    }
    ensurePanoramaLoaded(0);

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

// Seamless 2560x240 pixel-art panorama blit directly from PSRAM (zero runtime splicing or mirroring!)
static void drawTraversalBackdrop1600(int actIdx, int camX) {
    ensurePanoramaLoaded(actIdx);
    if (!g_panoramaBuf) {
        drawStageBackground(actIdx, camX);
        return;
    }
    int cx = camX;
    if (cx < 0) cx = 0;
    if (cx > 2560 - 320) cx = 2560 - 320;
    for (int y = 0; y < 240; ++y) {
        std::memcpy(&framebuffer[y * 320], &g_panoramaBuf[y * 2560 + cx], 320 * sizeof(uint16_t));
    }
}

static void drawSpriteAnchored(uint16_t spriteId, int footX, int footY, int facing, bool flashWhite = false) {
    if (spriteId >= TOTAL_PACKED_SPRITES) return;
    const UnpackedSprite& sp = g_sprites[spriteId];
    if (!sp.pixels) return;

    const bool flipX = (facing < 0);
    const int drawX = flipX ? (footX - (sp.w - sp.ax)) : (footX - sp.ax);
    const int drawY = footY - sp.h;
    const uint16_t whiteHalf = (lcd_color_rgb(255, 245, 220) & 0xF7DEu) >> 1;

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
                dstRow[px] = flashWhite ? static_cast<uint16_t>(((c & 0xF7DEu) >> 1) + whiteHalf) : c;
            }
        }
    }
}

static void drawSpriteTopAnchored(uint16_t spriteId, int topX, int topY, int facing = 1) {
    if (spriteId >= TOTAL_PACKED_SPRITES) return;
    const UnpackedSprite& sp = g_sprites[spriteId];
    if (!sp.pixels) return;

    const bool flipX = (facing < 0);
    const int drawX = flipX ? (topX - (sp.w - sp.ax)) : (topX - sp.ax);
    const int drawY = topY;

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
                dstRow[px] = c;
            }
        }
    }
}

static inline void drawUtf8Clipped(int x, int y, int minX, int maxX, const char* txt, uint16_t col,
                                   bool shadow = true) {
    const int lo = (minX < 0) ? 0 : minX;
    const int hi = (maxX > 320) ? 320 : maxX;
    if (shadow) {
        const uint16_t blk = lcd_color_rgb(6, 8, 12);
        gb_text::draw_utf8(x + 1, y + 1, txt, [blk, lo, hi](int px, int py) {
            if (px >= lo && px < hi && static_cast<unsigned>(py) < 240u) {
                framebuffer[py * 320 + px] = blk;
            }
        });
    }
    gb_text::draw_utf8(x, y, txt, [col, lo, hi](int px, int py) {
        if (px >= lo && px < hi && static_cast<unsigned>(py) < 240u) {
            framebuffer[py * 320 + px] = col;
        }
    });
}

static inline void drawUtf8CenteredBox(int boxX, int boxW, int y, const char* txt, uint16_t col,
                                       bool shadow = true) {
    int w = gb_text::utf8_width(txt);
    int tx = boxX + (boxW - w) / 2;
    if (tx < boxX + 4) tx = boxX + 4;
    drawUtf8Clipped(tx, y, boxX + 3, boxX + boxW - 3, txt, col, shadow);
}

static inline void drawUtf8Centered(int y, const char* txt, uint16_t col, bool shadow = true) {
    drawUtf8CenteredBox(2, 316, y, txt, col, shadow);
}

// ============================================================================
// 4. GAME STATE, EXTENDED 1600px WALL ZONES & DECOR ANIMATIONS
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

struct CutsceneMetaShot {
    uint8_t stageIdx;
    SkinId leftSkin;
    SkinId rightSkin;
};

struct CutsceneMeta {
    CutsceneMetaShot shots[2];
    AppScreen nextScreen;
    uint8_t nextAct;
};

static const CutsceneMeta CUTSCENE_META[9] = {
    {{{0, SKIN_KROM, SKIN_RAIDER},     {0, SKIN_KROM, SKIN_GORGAR}},  SCR_TRAVERSAL, 0},
    {{{0, SKIN_KROM, SKIN_GORGAR},     {0, SKIN_KROM, SKIN_GORGAR}},  SCR_DUEL,      0},
    {{{1, SKIN_KROM, SKIN_SKELETON},   {1, SKIN_KROM, SKIN_VORGATH}}, SCR_TRAVERSAL, 1},
    {{{1, SKIN_KROM, SKIN_VORGATH},    {1, SKIN_KROM, SKIN_VORGATH}}, SCR_DUEL,      1},
    {{{2, SKIN_KROM, SKIN_PIT_BEAST},  {2, SKIN_KROM, SKIN_MALAKOR}}, SCR_TRAVERSAL, 2},
    {{{2, SKIN_KROM, SKIN_MALAKOR},    {2, SKIN_KROM, SKIN_MALAKOR}}, SCR_DUEL,      2},
    {{{3, SKIN_KROM, SKIN_DARK_GUARD}, {3, SKIN_KROM, SKIN_DRAX}},    SCR_TRAVERSAL, 3},
    {{{3, SKIN_KROM, SKIN_DRAX},       {3, SKIN_KROM, SKIN_DRAX}},    SCR_DUEL,      3},
    {{{3, SKIN_KROM, SKIN_KROM},       {0, SKIN_KROM, SKIN_KROM}},    SCR_TITLE,     0}
};

static constexpr int GROUND_Y = 212;
static constexpr float TRAVERSAL_WORLD_W = 2560.0f;
static constexpr int MAX_MINIONS = 11;
static constexpr int MAX_PARTICLES = 48;
static constexpr int MAX_STAINS = 28;

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
static uint8_t g_bladeLvl = 0;
static uint8_t g_armorLvl = 0;
static uint8_t g_secretLvl = 0;

// Cutscene state
static uint8_t g_cutsceneId = 0;
static uint8_t g_cutsceneShot = 0;
static uint32_t g_cutsceneTick = 0;

// Traversal state (8 minions across 3 Arena Pockets separated by 2 Fortified Wall Zones!)
struct MinionUnit {
    bool active;
    uint8_t waveIdx; // 0: Arena 1 (x<620), 1: Arena 2 (x<1120), 2: Arena 3 (x<1560)
    Fighter f;
};
static float g_camX = 0.0f;
static MinionUnit g_minions[MAX_MINIONS];
static int g_minionsRemaining = 0;
static uint8_t g_clearedWallStage = 0; // 0 -> 1 when Wave 0 cleared -> 2 when Wave 1 cleared

// Duel & anti-spam state
static Fighter g_p1;
static Fighter g_p2;
static int g_p1Rounds = 0;
static int g_p2Rounds = 0;
static int g_roundEndTimer = 0;
static int g_hitstop = 0;
static int g_shake = 0;
static uint8_t g_playerSweepStreak = 0;
static BannerId g_bannerId = BNR_NONE;
static int g_bannerTimer = 0;

// Severed head + Goblin cleaner
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

static void showBanner(BannerId id, int frames = 75) {
    g_bannerId = id;
    g_bannerTimer = frames;
}

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

// ============================================================================
// AUTHENTIC 16-BIT PIXEL-ART PORTCULLIS GATES & MULTI-LEVEL ANIMATED DECORS
// ============================================================================

static void drawPixelPortcullisGate(int gateWorldCenter, int camOffX, bool gateClosed) {
    const int sx = gateWorldCenter - camOffX;
    if (sx < -44 || sx > 364) return;
    const uint16_t gateSprite = FX_PORTCULLIS_FRAMES[gateClosed ? 0 : 1];
    drawSpriteAnchored(gateSprite, sx, GROUND_Y + 2, 1);
}

static void drawStageDecorAnimations(int stageIdx, int camOffX, bool isTraversal, bool crowdExcited) {
    const uint32_t tick = g_frameTick;
    const uint16_t torch0 = FX_TORCH_FRAMES[(tick / 5) % 6];
    const uint16_t torch1 = FX_TORCH_FRAMES[(tick / 5 + 3) % 6];
    const uint16_t braz0 = FX_BRAZIER_FRAMES[(tick / 6) % 4];
    const uint16_t braz1 = FX_BRAZIER_FRAMES[(tick / 6 + 2) % 4];
    const uint16_t mono0 = FX_MONO_FRAMES[(tick / 8) % 4];
    const uint16_t crow0 = FX_CROW_FRAMES[(tick / 6) % 4];
    const uint16_t crow1 = FX_CROW_FRAMES[(tick / 6 + 2) % 4];
    const uint16_t banner0 = FX_BANNER_FRAMES[(tick / 8) % 4];
    const uint16_t banner1 = FX_BANNER_FRAMES[(tick / 8 + 2) % 4];
    const uint16_t cage0 = FX_CAGE_FRAMES[(tick / 10) % 4];
    const uint16_t cage1 = FX_CAGE_FRAMES[(tick / 10 + 2) % 4];
    const uint16_t arcBraz0 = FX_ARCANE_BRAZIER_FRAMES[(tick / 6) % 4];
    const uint16_t arcBraz1 = FX_ARCANE_BRAZIER_FRAMES[(tick / 6 + 2) % 4];

    if (stageIdx == 0) {
        // ACT 1 (FOREST): Rune monoliths near oak clearing & sanctuary, camp braziers, clan banners, crows & fireflies
        if (isTraversal) {
            const int monoWorld[2] = {1390, 2190};
            for (int i = 0; i < 2; ++i) {
                int sx = monoWorld[i] - camOffX;
                if (sx > -32 && sx < 352) drawSpriteAnchored(mono0, sx, GROUND_Y + 2, 1);
            }
            const int brazWorld[6] = {260, 740, 1140, 1610, 1980, 2380};
            for (int i = 0; i < 6; ++i) {
                int sx = brazWorld[i] - camOffX;
                if (sx > -32 && sx < 352) drawSpriteAnchored((i & 1) ? braz1 : braz0, sx, GROUND_Y + 2, 1);
            }
            const int bannerWorld[2] = {1120, 1945};
            for (int i = 0; i < 2; ++i) {
                int sx = bannerWorld[i] - camOffX;
                if (sx > -32 && sx < 352) drawSpriteTopAnchored((i & 1) ? banner1 : banner0, sx, 74, 1);
            }
        } else {
            drawSpriteAnchored(mono0, 278, GROUND_Y + 2, -1);
            drawSpriteAnchored(braz0, 36, GROUND_Y + 2, 1);
        }

        int cx1 = static_cast<int>((tick + 40) % 380) - 30;
        int cx2 = 350 - static_cast<int>((tick * 2 / 3 + 160) % 380);
        drawSpriteAnchored(crow0, cx1, 62 + static_cast<int>((tick / 12) & 3), 1);
        drawSpriteAnchored(crow1, cx2, 80, -1);

        for (int i = 0; i < 8; ++i) {
            int ex = ((i * 53 + static_cast<int>(tick) / 2 - camOffX / 2) % 320 + 320) % 320;
            int ey = 64 + ((i * 37 + static_cast<int>(tick) / 3) % 116);
            gfx.setColor((i & 1) ? lcd_color_rgb(255, 205, 85) : lcd_color_rgb(155, 235, 195));
            gfx.fillRect(ex, ey, 2, 2);
        }
    } else if (stageIdx == 1) {
        // ACT 2 (CRYPT): Swaying iron cages, subterranean torches, braziers & lava embers (after dark grotto!)
        if (isTraversal) {
            const int cageWorld[5] = {480, 890, 1310, 1790, 2240};
            for (int i = 0; i < 5; ++i) {
                int sx = cageWorld[i] - camOffX;
                if (sx > -32 && sx < 352) drawSpriteTopAnchored((i & 1) ? cage1 : cage0, sx, 16, 1);
            }
            const int torchWorld[5] = {355, 760, 1180, 1610, 2080};
            for (int i = 0; i < 5; ++i) {
                int sx = torchWorld[i] - camOffX;
                if (sx > -28 && sx < 348) drawSpriteAnchored((i & 1) ? torch1 : torch0, sx, 120, 1);
            }
            const int brazWorld[4] = {220, 1060, 1740, 2390};
            for (int i = 0; i < 4; ++i) {
                int sx = brazWorld[i] - camOffX;
                if (sx > -32 && sx < 352) drawSpriteAnchored((i & 1) ? braz1 : braz0, sx, GROUND_Y + 2, 1);
            }
        } else {
            drawSpriteTopAnchored(cage0, 74, 22, 1);
            drawSpriteTopAnchored(cage1, 246, 22, 1);
            drawSpriteAnchored(torch0, 34, 124, 1);
            drawSpriteAnchored(torch1, 108, 128, 1);
            drawSpriteAnchored(torch0, 212, 128, -1);
            drawSpriteAnchored(torch1, 286, 124, -1);
        }
        if (!isTraversal || camOffX > 1320) {
            const int emberCnt = (!isTraversal || camOffX > 1820) ? 8 : 4;
            for (int i = 0; i < emberCnt; ++i) {
                int ex = ((i * 47 + static_cast<int>(tick) / 3 - camOffX) % 320 + 320) % 320;
                int ey = 186 - ((i * 29 + static_cast<int>(tick) / 2) % 118);
                gfx.setColor((i & 1) ? lcd_color_rgb(255, 145, 45) : lcd_color_rgb(255, 215, 95));
                gfx.fillRect(ex, ey, 1, 2);
            }
        }
    } else if (stageIdx == 2) {
        // ACT 3 (BONE COLISEUM): Dark cell cage, perimeter rampart banners & braziers, crows & cheering crowd!
        if (isTraversal) {
            int cageSx = 92 - camOffX;
            if (cageSx > -32 && cageSx < 352) drawSpriteTopAnchored(cage0, cageSx, 18, 1);

            const int bannerWorld[5] = {520, 1080, 1460, 1820, 2160};
            for (int i = 0; i < 5; ++i) {
                int sx = bannerWorld[i] - camOffX;
                if (sx > -32 && sx < 352) drawSpriteTopAnchored((i & 1) ? banner1 : banner0, sx, 52, 1);
            }
            const int brazPos[6] = {380, 780, 1240, 1640, 2040, 2410};
            for (int i = 0; i < 6; ++i) {
                int sx = brazPos[i] - camOffX;
                if (sx > -32 && sx < 352) {
                    drawSpriteAnchored((i & 1) ? braz1 : braz0, sx, GROUND_Y + 2, 1);
                }
            }
        } else {
            drawSpriteAnchored(braz0, 24, GROUND_Y + 2, 1);
            drawSpriteAnchored(braz1, 296, GROUND_Y + 2, -1);
            drawSpriteAnchored(torch0, 88, 122, 1);
            drawSpriteAnchored(torch1, 232, 122, -1);
            drawSpriteTopAnchored(banner0, 50, 84, 1);
            drawSpriteTopAnchored(banner1, 270, 84, -1);
        }

        if (!isTraversal) {
            for (int cx = 28; cx <= 104; cx += 14) {
                bool cheer = crowdExcited ? (((tick / 4 + cx) & 1) != 0) : (((tick / 10 + cx) & 3) == 0);
                if (cheer) {
                    gfx.setColor(lcd_color_rgb(38, 22, 18));
                    gfx.fillRect(cx, 104, 3, 4);
                    gfx.fillRect(320 - cx, 104, 3, 4);
                }
            }
        }

        int crowX = static_cast<int>((tick * 3 / 4 + 90) % 380) - 30;
        drawSpriteAnchored(crow0, crowX, 56, 1);

        gfx.setColor(lcd_color_rgb(238, 198, 125));
        for (int i = 0; i < 7; ++i) {
            int sx = ((i * 51 + static_cast<int>(tick) * 2 - camOffX) % 320 + 320) % 320;
            int sy = GROUND_Y + 4 + ((i * 7) % 20);
            gfx.fillRect(sx, sy, 4, 1);
        }
    } else {
        // ACT 4 (SANCTUARY): Cages, banners & violet braziers on ochre castle & black bridge (clear neutral ridge!)
        if (isTraversal) {
            const int cageWorld[4] = {340, 960, 1890, 2310};
            for (int i = 0; i < 4; ++i) {
                int sx = cageWorld[i] - camOffX;
                if (sx > -32 && sx < 352) drawSpriteTopAnchored((i & 1) ? cage1 : cage0, sx, 18, 1);
            }
            const int bannerWorld[4] = {430, 790, 1990, 2385};
            for (int i = 0; i < 4; ++i) {
                int sx = bannerWorld[i] - camOffX;
                if (sx > -32 && sx < 352) drawSpriteTopAnchored((i & 1) ? banner1 : banner0, sx, 74, 1);
            }
            const int brazWorld[6] = {245, 620, 985, 1875, 2180, 2440};
            for (int i = 0; i < 6; ++i) {
                int sx = brazWorld[i] - camOffX;
                if (sx > -32 && sx < 352) {
                    drawSpriteAnchored((i & 1) ? arcBraz1 : arcBraz0, sx, GROUND_Y + 2, 1);
                }
            }
        } else {
            drawSpriteTopAnchored(cage0, 58, 18, 1);
            drawSpriteTopAnchored(cage1, 262, 18, 1);
            drawSpriteAnchored(arcBraz0, 26, GROUND_Y + 2, 1);
            drawSpriteAnchored(arcBraz1, 294, GROUND_Y + 2, -1);
        }

        gfx.setColor(lcd_color_rgb(155, 205, 245));
        for (int i = 0; i < 16; ++i) {
            int rx = ((i * 43 - static_cast<int>(tick) * 3 - camOffX / 2) % 320 + 320) % 320;
            int ry = (i * 31 + static_cast<int>(tick) * 5) % (GROUND_Y + 4);
            gfx.fillRect(rx, ry, 1, 4);
        }
        for (int r = 0; r < 4; ++r) {
            int ph = (static_cast<int>(tick) + r * 9) & 15;
            if (ph < 7) {
                int rx = (r * 73 + (static_cast<int>(tick) / 16) * 29) % 296 + 12;
                gfx.fillRect(rx - ph / 2, GROUND_Y + 3 + r * 4, 2 + ph, 1);
            }
        }

        if ((tick % 180) < 4) {
            int bx = 70 + static_cast<int>((tick * 17) % 180);
            int by = 8;
            gfx.setColor(lcd_color_rgb(235, 245, 255));
            for (int seg = 0; seg < 7; ++seg) {
                int nx = bx + (((seg * 13 + static_cast<int>(tick)) % 15) - 7);
                gfx.fillRect(bx, by, 2, 10);
                bx = nx;
                by += 10;
            }
        }
    }

    // Authentic 16-bit spiked iron portcullis gates at the bastion thresholds & Boss Gate!
    if (isTraversal) {
        drawPixelPortcullisGate(838, camOffX, g_clearedWallStage < 1);
        drawPixelPortcullisGate(1698, camOffX, g_clearedWallStage < 2);
        drawPixelPortcullisGate(2530, camOffX, g_minionsRemaining > 0);
    }
}

static uint16_t getFighterSpriteId(const Fighter& f) {
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
    uint8_t stg = CUTSCENE_META[id].shots[0].stageIdx;
    setMusicTrack(static_cast<MusicId>(MUS_FOREST + (stg & 3)));
}

static void startTraversal(uint8_t act) {
    g_actIdx = act & 3;
    ensurePanoramaLoaded(g_actIdx);
    g_screen = SCR_TRAVERSAL;
    clearArenaFx();
    g_camX = 0.0f;
    g_clearedWallStage = 0;
    g_playerSweepStreak = 0;
    initFighter(g_p1, SKIN_KROM, 54.0f, 1, getKromMaxHp());

    SkinId mSkinA = SKIN_RAIDER;
    SkinId mSkinB = SKIN_SKELETON;
    int mHp = 30;
    if (g_actIdx == 0) { mSkinA = SKIN_RAIDER; mSkinB = SKIN_RAIDER; mHp = 28; }
    else if (g_actIdx == 1) { mSkinA = SKIN_SKELETON; mSkinB = SKIN_RAIDER; mHp = 35; }
    else if (g_actIdx == 2) { mSkinA = SKIN_PIT_BEAST; mSkinB = SKIN_SKELETON; mHp = 42; }
    else { mSkinA = SKIN_DARK_GUARD; mSkinB = SKIN_PIT_BEAST; mHp = 50; }

    // 11 enemies placed across 3 long 2560px narrative zones separated by Portcullis Gates at x=838 & x=1698!
    static const float SPAWN_X[MAX_MINIONS] = {
        340.0f, 545.0f, 755.0f,
        1060.0f, 1255.0f, 1445.0f, 1625.0f,
        1920.0f, 2115.0f, 2305.0f, 2470.0f
    };
    static const uint8_t WAVE_IDX[MAX_MINIONS] = {0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2};

    g_minionsRemaining = MAX_MINIONS;
    for (int i = 0; i < MAX_MINIONS; ++i) {
        g_minions[i].active = true;
        g_minions[i].waveIdx = WAVE_IDX[i];
        SkinId sk = ((i % 3) == 1) ? mSkinB : mSkinA;
        initFighter(g_minions[i].f, sk, SPAWN_X[i], -1, mHp + (WAVE_IDX[i] * 4));
    }
    setMusicTrack(static_cast<MusicId>(MUS_FOREST + g_actIdx));
    showBanner(BNR_CLEAR_VANGUARD, 75);
}

static void startDuel(SkinId enemySkin, uint8_t stageIdx, bool campaignDuel) {
    g_isCampaign = campaignDuel;
    g_actIdx = stageIdx & 3;
    g_screen = SCR_DUEL;
    clearArenaFx();
    g_p1Rounds = 0;
    g_p2Rounds = 0;
    g_roundEndTimer = 0;
    g_playerSweepStreak = 0;

    int enemyHp = 120 + g_actIdx * 22;
    if (enemySkin == SKIN_DRAX) enemyHp = 190;
    initFighter(g_p1, SKIN_KROM, 92.0f, 1, getKromMaxHp());
    initFighter(g_p2, enemySkin, 228.0f, -1, enemyHp);
    setMusicTrack(static_cast<MusicId>(MUS_FOREST + g_actIdx));
    showBanner(BNR_ROUND_1, 70);
}

// ============================================================================
// 5. COMBAT MECHANICS (ANTI-B-SPAM AI, SECRET MOVES, PARRY, DECAPITATION)
// ============================================================================

static inline bool justPressed(uint32_t mask) { return (g_keys.pressed & mask) != 0; }

static void controlPlayerFighter(Fighter& p, float minX, float maxX) {
    if (p.parryWindow > 0) p.parryWindow--;
    if (p.riposteBuff > 0) p.riposteBuff--;
    if (p.hitFlash > 0) p.hitFlash--;
    if (p.act == ACT_DEAD || p.act == ACT_DECAPITATED || p.act == ACT_VICTORY) {
        if (p.timer > 0) p.timer--;
        if (p.y < GROUND_Y || p.vy != 0.0f) {
            p.y += p.vy;
            p.vy += 0.55f;
            if (p.y >= GROUND_Y) {
                p.y = GROUND_Y;
                p.vy = 0.0f;
            }
        }
        return;
    }

    if (p.timer > 0) {
        p.timer--;
        if (p.act == ACT_ROLL) {
            p.x += p.facing * 3.8f;
        }
        if (p.timer == 0 && p.act != ACT_DEAD && p.act != ACT_DECAPITATED) {
            p.act = ACT_IDLE;
        }
    }

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

    if (g_keys.L1) {
        if (justPressed(EXPANDER_KEY_L1)) {
            p.parryWindow = 9;
        }
        p.act = ACT_BLOCK;
        return;
    }

    const bool forwardHeld = (p.facing > 0) ? g_keys.right : g_keys.left;

    if (justPressed(EXPANDER_KEY_C)) {
        p.act = ACT_SPIN_DECAP;
        p.timer = (g_secretLvl >= 2 && g_keys.up) ? 20 : 22;
        p.hitApplied = false;
        g_playerSweepStreak = 0;
        if (g_secretLvl >= 2 && g_keys.up) {
            p.vy = -5.4f;
            showBanner(BNR_SKILL_WHIRLWIND, 40);
        }
        sfxSwing(true);
        return;
    }
    if (justPressed(EXPANDER_KEY_R1)) {
        p.act = ACT_CLEAVE;
        p.timer = 19;
        p.hitApplied = false;
        g_playerSweepStreak = 0;
        if (g_secretLvl >= 1 && forwardHeld) {
            p.x += p.facing * 14.0f;
            showBanner(BNR_SKILL_ANVIL, 40);
        }
        sfxSwing(true);
        return;
    }
    if (justPressed(EXPANDER_KEY_A)) {
        p.act = ACT_SLASH;
        p.timer = 14;
        p.hitApplied = false;
        if (g_playerSweepStreak > 0) g_playerSweepStreak--;
        if (p.riposteBuff > 0 && g_secretLvl >= 3) {
            showBanner(BNR_SKILL_RIPOSTE, 40);
        }
        sfxSwing(false);
        return;
    }
    if (justPressed(EXPANDER_KEY_B)) {
        p.act = ACT_SWEEP;
        p.timer = 16;
        p.hitApplied = false;
        if (g_playerSweepStreak < 8) g_playerSweepStreak++;
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
    float contactHeight = 36.0f;

    if (atk.act == ACT_SLASH && atk.timer == 7) {
        inActiveFrame = true; reach = 50.0f; dmg = 14; contactHeight = 38.0f;
    } else if (atk.act == ACT_SWEEP && atk.timer == 8) {
        inActiveFrame = true; reach = 48.0f; dmg = 11; lowAttack = true; contactHeight = 14.0f;
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
    if (lowAttack && def.y < GROUND_Y - 10.0f) return; // Jumped cleanly over low sweep!
    if (canDecap && def.act == ACT_CROUCH) return;     // Ducked under high spin!

    float dx = (def.x - atk.x) * atk.facing;
    if (dx < -8.0f || dx > reach) return;

    atk.hitApplied = true;
    const float hitX = atk.x + atk.facing * (dx * 0.72f);
    const float hitY = def.y - contactHeight;

    if (def.act == ACT_BLOCK && !lowAttack && !guardBreak) {
        if (def.parryWindow > 0) {
            sfxClash(true);
            spawnWeaponImpact(hitX, hitY, -atk.facing, true, true);
            atk.act = ACT_HIT;
            atk.timer = 16;
            def.riposteBuff = 45;
            g_hitstop = 5;
            showBanner(BNR_PERFECT_PARRY, 45);
        } else {
            sfxClash(false);
            spawnWeaponImpact(hitX, hitY, -atk.facing, false, true);
            def.x += atk.facing * 5.0f;
        }
        return;
    }

    const bool lethalOrVulnerable = (def.hp <= (isMinionTarget ? 28 : 48)) || (def.act == ACT_HIT);
    if (canDecap && lethalOrVulnerable && dx >= 22.0f && dx <= 52.0f) {
        def.hp = 0;
        def.hitFlash = 2;
        def.act = ACT_DECAPITATED;
        def.timer = 60;
        sfxDecapitate();
        spawnWeaponImpact(def.x, def.y - 48.0f, atk.facing, true, false);
        g_hitstop = 8;
        g_shake = 8;
        if (!isMinionTarget) {
            if (g_impactMode != IMPACT_SOFT) {
                g_headActive = true;
                g_headX = def.x;
                g_headY = def.y - 48.0f;
                g_headVx = atk.facing * 2.8f;
                g_headVy = -5.2f;
            }
            showBanner(BNR_DECAPITATION, 85);
            if (&atk == &g_p1) { g_score += 500; g_shards += 18; }
        } else {
            g_score += 180;
            g_shards += 6;
        }
        return;
    }

    def.hp -= dmg;
    def.x += atk.facing * (guardBreak ? 10.0f : 6.0f);
    sfxHit(guardBreak || canDecap);
    spawnWeaponImpact(hitX, hitY, atk.facing, guardBreak || canDecap, false);
    g_hitstop = guardBreak ? 4 : 2;
    if (guardBreak) g_shake = 4;

    if (def.hp <= 0) {
        def.hp = 0;
        def.hitFlash = 2;
        def.act = ACT_DEAD;
        def.timer = 50;
        if (&atk == &g_p1) {
            g_score += isMinionTarget ? 100 : 300;
            g_shards += isMinionTarget ? 4 : 12;
        }
    } else {
        def.hitFlash = 3;
        def.act = ACT_HIT;
        def.timer = 10;
    }
}

static void stepEnemyAi(Fighter& ai, const Fighter& target, int aggression, float minX, float maxX) {
    if (ai.hitFlash > 0) ai.hitFlash--;
    if (ai.parryWindow > 0) ai.parryWindow--;

    // Full vertical gravity for AI jumps & knockbacks!
    bool justLanded = false;
    if (ai.y < GROUND_Y || ai.vy != 0.0f) {
        ai.y += ai.vy;
        ai.vy += 0.56f;
        if (ai.act == ACT_JUMP) {
            ai.x += ai.facing * 1.15f;
        }
        if (ai.y >= GROUND_Y) {
            ai.y = GROUND_Y;
            ai.vy = 0.0f;
            justLanded = (ai.act == ACT_JUMP);
        }
    }

    if (ai.act == ACT_DEAD || ai.act == ACT_DECAPITATED || ai.act == ACT_VICTORY) {
        if (ai.timer > 0) ai.timer--;
        return;
    }

    ai.facing = (target.x < ai.x) ? -1 : 1;
    float dist = std::fabs(target.x - ai.x);

    // Punish B-spam immediately upon landing from a sweep-evade jump!
    if (justLanded) {
        if (dist < 56.0f) {
            ai.act = (aggression >= 2) ? ACT_CLEAVE : ACT_SLASH;
            ai.timer = (ai.act == ACT_CLEAVE) ? 17 : 13;
            ai.hitApplied = false;
            sfxSwing(ai.act == ACT_CLEAVE);
            return;
        }
        ai.act = ACT_IDLE;
        ai.timer = 0;
    }

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

    // Reactive anti-B-spam: jump over repeated low sweeps and counterattack!
    if (target.act == ACT_SWEEP && target.timer >= 8 && dist < 66.0f && ai.y >= GROUND_Y) {
        int jumpChance = (g_playerSweepStreak >= 2) ? (72 + aggression * 6) : (30 + aggression * 10);
        if ((std::rand() % 100) < jumpChance) {
            ai.vy = -6.3f;
            ai.act = ACT_JUMP;
            ai.timer = 18;
            return;
        }
    }

    // Reactive duck under telegraphed 360 decapitation spin!
    if (target.act == ACT_SPIN_DECAP && target.timer >= 10 && dist < 62.0f && ai.y >= GROUND_Y) {
        if ((std::rand() % 100) < (24 + aggression * 11)) {
            ai.act = ACT_CROUCH;
            ai.timer = 14;
            return;
        }
    }

    if (dist > 46.0f) {
        ai.x += ai.facing * (1.38f + aggression * 0.24f);
        ai.act = ACT_WALK;
    } else {
        int r = std::rand() % 100;
        if ((target.act == ACT_SLASH || target.act == ACT_CLEAVE) && r < 24 + aggression * 7) {
            ai.act = ACT_BLOCK;
            ai.parryWindow = (aggression >= 3 && (r & 1)) ? 6 : 0;
            ai.timer = 12;
        } else if (target.act == ACT_BLOCK && r < 30 + aggression * 8) {
            // Punish passive turtling with a low sweep or guard-break cleave!
            ai.act = (r & 1) ? ACT_SWEEP : ACT_CLEAVE;
            ai.timer = 17;
            ai.hitApplied = false;
            sfxSwing(ai.act == ACT_CLEAVE);
        } else if (r < 18 + aggression * 5) {
            ai.act = ACT_SLASH;
            ai.timer = 15;
            ai.hitApplied = false;
            sfxSwing(false);
        } else if (r < 28 + aggression * 6) {
            ai.act = (r & 1) ? ACT_SWEEP : ACT_CLEAVE;
            ai.timer = 18;
            ai.hitApplied = false;
            sfxSwing(ai.act == ACT_CLEAVE);
        } else if (aggression >= 2 && r < 34 + aggression * 6) {
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
// 6. SCREEN RENDERERS & FULLY LOCALIZED UI
// ============================================================================

static void drawHpBar(int x, int y, int w, int hp, int maxHp, const char* name, uint16_t fillCol,
                      bool rightAlignName = false) {
    int nameX = x;
    if (rightAlignName) {
        int nw = gb_text::utf8_width(name);
        nameX = x + w - nw;
        if (nameX < x) nameX = x;
    }
    drawUtf8Clipped(nameX, y - 10, x, x + w + 2, name, lcd_color_rgb(240, 232, 210));
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
    loc();

    if (justPressed(EXPANDER_KEY_UP)) { g_titleCursor = (g_titleCursor + 5) % 6; sfxMenu(false); }
    if (justPressed(EXPANDER_KEY_DOWN)) { g_titleCursor = (g_titleCursor + 1) % 6; sfxMenu(false); }

    if (g_titleCursor == 4 && (justPressed(EXPANDER_KEY_LEFT) || justPressed(EXPANDER_KEY_RIGHT))) {
        int dir = justPressed(EXPANDER_KEY_RIGHT) ? 1 : 2;
        g_impactMode = static_cast<ImpactMode>((g_impactMode + dir) % 3);
        sfxMenu(false);
    } else if (g_titleCursor == 5 && (justPressed(EXPANDER_KEY_LEFT) || justPressed(EXPANDER_KEY_RIGHT))) {
        cycleLanguage(justPressed(EXPANDER_KEY_RIGHT) ? 1 : -1);
        sfxMenu(true);
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
        } else if (g_titleCursor == 4) {
            g_impactMode = static_cast<ImpactMode>((g_impactMode + 1) % 3);
        } else {
            cycleLanguage(1);
        }
    }

    const LocalePack& L2 = loc();
    drawStageBackground(3, 0);
    drawStageDecorAnimations(3, 0, false, false);

    drawSpriteAnchored(SKIN_ANIM_FRAMES[SKIN_KROM][(g_frameTick / 20) & 1], 56, 218, 1);
    drawSpriteAnchored(SKIN_ANIM_FRAMES[SKIN_DRAX][(g_frameTick / 20) & 1], 266, 218, -1);

    // Top title plaque
    gfx.setColor(lcd_color_rgb(10, 12, 18));
    gfx.fillRect(14, 8, 292, 42);
    gfx.setColor(lcd_color_rgb(235, 175, 55));
    gfx.drawRect(14, 8, 292, 42);
    drawUtf8CenteredBox(14, 292, 15, L2.titleMain, lcd_color_rgb(255, 205, 70));
    drawUtf8CenteredBox(14, 292, 31, L2.titleSub, lcd_color_rgb(195, 205, 220));

    // 6-row non-touch menu box (Campaign, Quick Duel, Forge, Guide, Impact, Language)
    gfx.setColor(lcd_color_rgb(12, 15, 22));
    gfx.fillRect(14, 56, 292, 154);
    gfx.setColor(lcd_color_rgb(120, 95, 45));
    gfx.drawRect(14, 56, 292, 154);

    for (int i = 0; i < 6; ++i) {
        const bool sel = (i == g_titleCursor);
        int ry = 65 + i * 23;
        if (sel) {
            gfx.setColor(lcd_color_rgb(75, 48, 16));
            gfx.fillRect(20, ry - 3, 280, 15);
        }
        const char* label = (i < 4) ? L2.titleItems[i]
                                    : ((i == 4) ? L2.impactLabels[g_impactMode] : L2.langRowLabel);
        uint16_t col = sel ? lcd_color_rgb(255, 215, 90)
                           : ((i == 5) ? lcd_color_rgb(130, 225, 255) : lcd_color_rgb(215, 220, 230));
        drawUtf8Clipped(26, ry, 20, 300, label, col);
    }

    drawUtf8Centered(222, L2.titleFooter, lcd_color_rgb(180, 190, 205));
}

static void updateAndDrawQuickSelect() {
    static const SkinId ENEMIES[5] = {SKIN_RIVAL, SKIN_GORGAR, SKIN_VORGATH, SKIN_MALAKOR, SKIN_DRAX};
    const LocalePack& L = loc();

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
    drawStageDecorAnimations(g_quickStage, 0, false, false);

    gfx.setColor(lcd_color_rgb(10, 12, 18));
    gfx.fillRect(14, 12, 292, 46);
    gfx.setColor(lcd_color_rgb(225, 170, 55));
    gfx.drawRect(14, 12, 292, 46);
    drawUtf8CenteredBox(14, 292, 20, L.quickTitle, lcd_color_rgb(255, 205, 75));

    char buf[64];
    std::snprintf(buf, sizeof(buf), L.quickFoeFmt, L.skinNames[ENEMIES[g_quickEnemyIdx]]);
    drawUtf8CenteredBox(14, 292, 36, buf, lcd_color_rgb(235, 240, 248));

    drawSpriteAnchored(SKIN_ANIM_FRAMES[SKIN_KROM][0], 95, 200, 1);
    drawSpriteAnchored(SKIN_ANIM_FRAMES[ENEMIES[g_quickEnemyIdx]][0], 225, 200, -1);

    gfx.setColor(lcd_color_rgb(10, 12, 18));
    gfx.fillRect(14, 204, 292, 30);
    gfx.setColor(lcd_color_rgb(140, 110, 48));
    gfx.drawRect(14, 204, 292, 30);
    std::snprintf(buf, sizeof(buf), L.quickArenaFmt, L.stageNames[g_quickStage]);
    drawUtf8CenteredBox(14, 292, 209, buf, lcd_color_rgb(255, 205, 85));
    drawUtf8CenteredBox(14, 292, 222, L.quickFooter, lcd_color_rgb(185, 195, 210));
}

static void updateAndDrawCutscene() {
    g_cutsceneTick++;
    const CutsceneMeta& cs = CUTSCENE_META[g_cutsceneId];
    const CutsceneMetaShot& sh = cs.shots[g_cutsceneShot];
    const LocalePack& L = loc();
    const CutsceneShotText& tx = L.cutscenes[g_cutsceneId][g_cutsceneShot];

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
    drawStageDecorAnimations(sh.stageIdx, 0, false, true);
    drawSpriteAnchored(SKIN_ANIM_FRAMES[sh.leftSkin][(g_frameTick / 16) & 1], 92, 184, 1);
    if (g_cutsceneId != 8) {
        drawSpriteAnchored(SKIN_ANIM_FRAMES[sh.rightSkin][(g_frameTick / 16) & 1], 228, 184, -1);
    }

    gfx.setColor(lcd_color_rgb(8, 10, 14));
    gfx.fillRect(0, 0, 320, 30);
    gfx.fillRect(0, 184, 320, 56);
    gfx.setColor(lcd_color_rgb(205, 155, 55));
    gfx.drawFastHLine(0, 30, 320);
    gfx.drawFastHLine(0, 184, 320);

    drawUtf8CenteredBox(4, 312, 10, tx.title, lcd_color_rgb(255, 205, 75));
    drawUtf8CenteredBox(4, 312, 192, tx.line1, lcd_color_rgb(235, 240, 248));
    drawUtf8CenteredBox(4, 312, 206, tx.line2, lcd_color_rgb(215, 225, 238));
    drawUtf8CenteredBox(4, 312, 224, L.cutsceneFooter, lcd_color_rgb(175, 185, 200));
}

static void updateAndDrawForge() {
    const LocalePack& L = loc();

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
    gfx.fillRect(8, 10, 304, 220);
    gfx.setColor(lcd_color_rgb(230, 165, 50));
    gfx.drawRect(8, 10, 304, 220);

    char buf[64];
    drawUtf8CenteredBox(8, 304, 18, L.forgeTitle, lcd_color_rgb(255, 205, 75));
    std::snprintf(buf, sizeof(buf), L.forgeShardsFmt, g_shards);
    drawUtf8CenteredBox(8, 304, 34, buf, lcd_color_rgb(130, 225, 255));

    uint8_t lvls[3] = {g_bladeLvl, g_armorLvl, g_secretLvl};
    for (int i = 0; i < 3; ++i) {
        int ry = 56 + i * 38;
        if (g_forgeCursor == i) {
            gfx.setColor(lcd_color_rgb(70, 44, 14));
            gfx.fillRect(14, ry - 4, 292, 30);
        }
        std::snprintf(buf, sizeof(buf), "%s [%s %d/3]", L.forgeItems[i], L.forgeLvlTag, lvls[i]);
        drawUtf8Clipped(18, ry, 14, 306, buf, lcd_color_rgb(255, 220, 120));
        if (lvls[i] >= 3) std::snprintf(buf, sizeof(buf), "%s", L.forgeMaxed);
        else std::snprintf(buf, sizeof(buf), L.forgeCostFmt, cost[i]);
        drawUtf8Clipped(18, ry + 13, 14, 306, buf, lcd_color_rgb(200, 210, 225));
    }

    // Two clean, centered lines for Secret Boots so ZERO characters overflow!
    gfx.setColor(lcd_color_rgb(22, 26, 36));
    gfx.fillRect(14, 172, 292, 30);
    drawUtf8CenteredBox(14, 292, 175, L.forgeBoots1, lcd_color_rgb(235, 195, 95));
    drawUtf8CenteredBox(14, 292, 189, L.forgeBoots2, lcd_color_rgb(195, 225, 245));
    drawUtf8CenteredBox(8, 304, 212, L.forgeExit, lcd_color_rgb(180, 190, 205));
}

static void updateAndDrawGuide() {
    const LocalePack& L = loc();

    if (justPressed(EXPANDER_KEY_LEFT)) { g_guidePage = (g_guidePage + 3) & 3; sfxMenu(false); }
    if (justPressed(EXPANDER_KEY_RIGHT) || justPressed(EXPANDER_KEY_A)) {
        g_guidePage = (g_guidePage + 1) & 3; sfxMenu(false);
    }
    if (justPressed(EXPANDER_KEY_B) || justPressed(EXPANDER_KEY_C)) {
        g_screen = g_returnFromSubScreen; sfxMenu(false); return;
    }

    gfx.clear(lcd_color_rgb(12, 15, 22));
    gfx.setColor(lcd_color_rgb(225, 170, 55));
    gfx.drawRect(8, 10, 304, 220);

    drawUtf8CenteredBox(8, 304, 22, L.guidePages[g_guidePage][0], lcd_color_rgb(255, 205, 75));
    for (int l = 1; l < 6; ++l) {
        drawUtf8Clipped(18, 50 + (l - 1) * 26, 12, 308, L.guidePages[g_guidePage][l],
                        lcd_color_rgb(225, 232, 242));
    }
    drawUtf8CenteredBox(8, 304, 208, L.guideFooter, lcd_color_rgb(180, 195, 215));
}

static void updateAndDrawTraversal() {
    const LocalePack& L = loc();

    if (justPressed(EXPANDER_KEY_RUN)) {
        g_returnFromSubScreen = SCR_TRAVERSAL;
        g_screen = SCR_FORGE;
        sfxMenu(true);
        return;
    }

    if (g_hitstop > 0) {
        g_hitstop--;
    } else {
        // Compute wave gate lock at the fortified inter-arena masonry walls!
        int waveAlive[3] = {0, 0, 0};
        for (int i = 0; i < MAX_MINIONS; ++i) {
            const MinionUnit& m = g_minions[i];
            if (!m.active) continue;
            if (m.f.act != ACT_DEAD && m.f.act != ACT_DECAPITATED) {
                waveAlive[m.waveIdx & 3]++;
            }
        }

        if (g_clearedWallStage == 0 && waveAlive[0] == 0) {
            g_clearedWallStage = 1;
            sfxClash(true);
            showBanner(BNR_WALL_BREACHED, 65);
        } else if (g_clearedWallStage == 1 && waveAlive[1] == 0) {
            g_clearedWallStage = 2;
            sfxClash(true);
            showBanner(BNR_WALL_BREACHED, 65);
        }

        float maxWalkX = TRAVERSAL_WORLD_W - 28.0f;
        if (waveAlive[0] > 0) maxWalkX = 820.0f;        // Locked before Portcullis Gate 1 (x=838)
        else if (waveAlive[1] > 0) maxWalkX = 1680.0f;  // Locked before Portcullis Gate 2 (x=1698)

        controlPlayerFighter(g_p1, g_camX + 22.0f, maxWalkX);

        float maxCamX = maxWalkX - 280.0f;
        if (maxCamX < 0.0f) maxCamX = 0.0f;
        if (maxCamX > TRAVERSAL_WORLD_W - 320.0f) maxCamX = TRAVERSAL_WORLD_W - 320.0f;
        if (g_p1.x - g_camX > 148.0f && g_camX < maxCamX) {
            g_camX = g_p1.x - 148.0f;
            if (g_camX > maxCamX) g_camX = maxCamX;
        }

        int aliveAfter = 0;
        for (int i = 0; i < MAX_MINIONS; ++i) {
            MinionUnit& m = g_minions[i];
            if (!m.active) continue;
            if (m.f.act == ACT_DEAD || m.f.act == ACT_DECAPITATED) {
                if (m.f.hitFlash > 0) m.f.hitFlash--;
                if (m.f.y < GROUND_Y || m.f.vy != 0.0f) {
                    m.f.y += m.f.vy;
                    m.f.vy += 0.55f;
                    if (m.f.y >= GROUND_Y) {
                        m.f.y = GROUND_Y;
                        m.f.vy = 0.0f;
                    }
                }
                if (m.f.timer > 0) m.f.timer--;
                else m.active = false;
                continue;
            }
            aliveAfter++;
            if (std::fabs(m.f.x - g_p1.x) < 260.0f) {
                float arenaMin = (m.waveIdx == 0) ? 40.0f : ((m.waveIdx == 1) ? 875.0f : 1735.0f);
                float arenaMax = (m.waveIdx == 0) ? 812.0f : ((m.waveIdx == 1) ? 1672.0f : 2505.0f);
                stepEnemyAi(m.f, g_p1, 1 + (g_actIdx / 2), arenaMin, arenaMax);
                checkAttackHit(g_p1, m.f, true);
                checkAttackHit(m.f, g_p1, false);
            }
        }
        g_minionsRemaining = aliveAfter;
        updateParticles();

        if (g_p1.hp <= 0 && g_p1.timer <= 2) {
            startTraversal(g_actIdx);
            return;
        }
        if (g_minionsRemaining == 0 && g_p1.x >= TRAVERSAL_WORLD_W - 55.0f) {
            startCutscene(static_cast<uint8_t>(g_actIdx * 2 + 1));
            return;
        }
    }

    const int camI = static_cast<int>(g_camX);
    drawTraversalBackdrop1600(g_actIdx, camI);
    drawStageDecorAnimations(g_actIdx, camI, true, g_bannerTimer > 0);

    for (int i = 0; i < g_stainCount; ++i) {
        int sx = g_stains[i].x - camI;
        if (sx >= 0 && sx < 316) {
            gfx.setColor(g_stains[i].col);
            gfx.fillRect(sx, g_stains[i].y, g_stains[i].w, 2);
        }
    }

    for (int i = 0; i < MAX_MINIONS; ++i) {
        if (!g_minions[i].active) continue;
        int sx = static_cast<int>(g_minions[i].f.x) - camI;
        if (sx < -40 || sx > 360) continue;
        drawSpriteAnchored(getFighterSpriteId(g_minions[i].f), sx, static_cast<int>(g_minions[i].f.y),
                           g_minions[i].f.facing, g_minions[i].f.hitFlash > 0);
    }

    drawSpriteAnchored(getFighterSpriteId(g_p1), static_cast<int>(g_p1.x) - camI,
                       static_cast<int>(g_p1.y), g_p1.facing, g_p1.hitFlash > 0);

    for (int i = 0; i < MAX_PARTICLES; ++i) {
        if (g_particles[i].life <= 0) continue;
        int px = static_cast<int>(g_particles[i].x) - camI;
        int py = static_cast<int>(g_particles[i].y);
        if (px >= 0 && px < 318 && py >= 0 && py < 238) {
            gfx.setColor(g_particles[i].col);
            gfx.fillRect(px, py, g_particles[i].size, g_particles[i].size);
        }
    }

    drawHpBar(8, 16, 102, g_p1.hp, g_p1.maxHp, L.skinNames[SKIN_KROM], lcd_color_rgb(235, 175, 45));
    char hud[56];
    std::snprintf(hud, sizeof(hud), L.hudPtsShardsFmt, static_cast<unsigned long>(g_score), g_shards);
    drawUtf8Clipped(118, 7, 116, 316, hud, lcd_color_rgb(240, 232, 210));
    if (g_minionsRemaining == 0) {
        drawUtf8Clipped(118, 19, 116, 316, L.hudPathClear, lcd_color_rgb(120, 255, 145));
    } else {
        std::snprintf(hud, sizeof(hud), L.hudFoesFmt, g_minionsRemaining);
        drawUtf8Clipped(118, 19, 116, 316, hud, lcd_color_rgb(210, 215, 225));
    }

    if (g_bannerTimer > 0 && g_bannerId < BNR_COUNT) {
        g_bannerTimer--;
        drawUtf8Centered(42, L.banners[g_bannerId], lcd_color_rgb(255, 215, 85));
    }
}

static void updateAndDrawDuel() {
    const LocalePack& L = loc();

    if (g_hitstop > 0) {
        g_hitstop--;
    } else {
        const bool roundOver = (g_p1.hp <= 0 || g_p2.hp <= 0);
        if (!roundOver) {
            if (g_p1.act == ACT_IDLE || g_p1.act == ACT_WALK) {
                g_p1.facing = (g_p2.x >= g_p1.x) ? 1 : -1;
            }
            controlPlayerFighter(g_p1, 22.0f, 298.0f);
            stepEnemyAi(g_p2, g_p1, 2 + g_actIdx, 22.0f, 298.0f);
            checkAttackHit(g_p1, g_p2, false);
            checkAttackHit(g_p2, g_p1, false);
        } else {
            if (g_roundEndTimer == 0) {
                if (g_p2.hp <= 0) {
                    g_p1Rounds++;
                    g_p1.act = ACT_VICTORY;
                    g_p1.hitFlash = 0;
                    g_goblinActive = true;
                    g_goblinX = -24.0f;
                    g_goblinTick = 0;
                    sfxGoblinLaugh();
                } else {
                    g_p2Rounds++;
                    g_p2.act = ACT_VICTORY;
                    g_p2.hitFlash = 0;
                }
            }
            controlPlayerFighter(g_p1, 22.0f, 298.0f);
            stepEnemyAi(g_p2, g_p1, 2 + g_actIdx, 22.0f, 298.0f);
            g_roundEndTimer++;

            if (g_goblinActive) {
                g_goblinTick++;
                if (g_goblinTick < 75 && g_goblinX < g_p2.x - 28.0f) {
                    g_goblinX += 2.2f;
                } else if (g_goblinTick >= 75) {
                    g_goblinX -= 1.6f;
                    g_p2.x -= 1.6f;
                }
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
                    g_playerSweepStreak = 0;
                    initFighter(g_p1, SKIN_KROM, 92.0f, 1, getKromMaxHp());
                    initFighter(g_p2, g_p2.skin, 228.0f, -1, g_p2.maxHp);
                    showBanner(BNR_NEXT_ROUND, 65);
                }
            }
        }

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
    drawStageDecorAnimations(g_actIdx, 0, false, g_bannerTimer > 0 || g_hitstop > 0);

    for (int i = 0; i < g_stainCount; ++i) {
        gfx.setColor(g_stains[i].col);
        gfx.fillRect(g_stains[i].x, g_stains[i].y, g_stains[i].w, 2);
    }

    if (g_goblinActive) {
        int gobSlot = (g_goblinTick >= 75) ? 3 : ((g_goblinX < g_p2.x - 30.0f) ? ((g_goblinTick / 6) & 1) : 2);
        int gobFacing = (g_goblinTick >= 75) ? -1 : 1;
        drawSpriteAnchored(GOBLIN_ANIM_FRAMES[gobSlot], static_cast<int>(g_goblinX), GROUND_Y, gobFacing);
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

    drawHpBar(10, 16, 122, g_p1.hp, g_p1.maxHp, L.skinNames[SKIN_KROM], lcd_color_rgb(235, 175, 45));
    drawHpBar(188, 16, 122, g_p2.hp, g_p2.maxHp, L.skinNames[g_p2.skin], lcd_color_rgb(215, 48, 52), true);

    char scoreMid[16];
    std::snprintf(scoreMid, sizeof(scoreMid), "%d - %d", g_p1Rounds, g_p2Rounds);
    drawUtf8Centered(14, scoreMid, lcd_color_rgb(255, 220, 110));

    if (g_bannerTimer > 0 && g_bannerId < BNR_COUNT) {
        g_bannerTimer--;
        drawUtf8Centered(42, L.banners[g_bannerId], lcd_color_rgb(255, 215, 85));
    }
}

} // namespace

// ============================================================================
// 7. ESP-IDF ENTRY POINT (Gamebuino AKA Official Lifecycle)
// ============================================================================

static const char* const CONTROL_KEYS[] = {
    "CTRL_1", "CTRL_2", "CTRL_3", "CTRL_4", "CTRL_5", "CTRL_6", "CTRL_7", nullptr
};

extern "C" void app_main(void) {
    g_core.init();
    g_core.buttons.set_run_power_off(false);
    gfx.set_backlight_percent(85);

    input_init();
    akaRuntime.begin("Krom_Barbarian");

    // Immediately display boot splash in the saved device language!
    gfx.clear(lcd_color_rgb(10, 12, 18));
    drawUtf8Centered(112, loc().titleMain, lcd_color_rgb(245, 195, 70));
    gfx.update();

    akaRuntime.setControlsKeys(CONTROL_KEYS);
    akaRuntime.setGameMenuCallback(returnToTitleCallback);
    akaRuntime.setVolumeChangedCallback(onSystemVolumeChanged);

    g_audio.set_master_volume(215);
    g_audio.add_track(&g_trackLead, 0.42f);
    g_audio.add_track(&g_trackBass, 0.46f);
    g_audio.add_track(&g_trackDrums, 0.34f);
    g_audio.add_track(&g_trackSfx, 0.85f);
    applyAudioVolumes(akaRuntime.getMusicVolume(), akaRuntime.getSfxVolume());

    unpackAllAssetsToPsram();
    g_lastStepMs = g_core.get_millis();

    while (true) {
        const uint32_t frameStart = g_core.get_millis();

        input_poll(g_keys);

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
