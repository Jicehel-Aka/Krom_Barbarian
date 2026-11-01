#include "aka_runtime/aka_runtime.h"
#include "core/input.h"
#include "gb_core.h"
#include "gb_common.h"      // GB_KEY_RUN / GB_KEY_MENU / EXPANDER_KEY_*
#include "gb_graphics.h"
#include "gb_ll_lcd.h"
#include "esp_partition.h"
#include "esp_ota_ops.h"
#include "esp_system.h"
#include "esp_timer.h"
#include "esp_log.h"
#include <sys/stat.h>
#include <errno.h>
#include <cstdio>
#include <cstring>

extern gb_core g_core;   // defini dans main.cpp
static const char* TAG = "aka_runtime";

extern gb_graphics gfx;

AkaRuntime akaRuntime;

static uint8_t s_musicVolume = 80, s_sfxVolume = 70;
static bool s_helpRequested = false;
static void (*s_volumeChangedCallback)(uint8_t musicVol, uint8_t sfxVol) = nullptr;

// ---------------------------------------------------------------------
// settings.json : langue + volumes, commun a TOUS les jeux (un seul
// fichier, sous /sdcard/AKA/ -- pas de repertoire par jeu ici, le choix de
// langue/volume est un reglage de l'appareil, pas du jeu).
// ---------------------------------------------------------------------
static void save_settings(const char* langCode) {
    FILE* f = fopen("/sdcard/AKA/settings.json", "wb");
    if (!f) { ESP_LOGE(TAG, "save_settings: fopen ECHEC"); return; }
    fprintf(f, "{\n  \"language\": \"%s\",\n  \"musicVolume\": %d,\n  \"sfxVolume\": %d\n}\n",
            langCode, s_musicVolume, s_sfxVolume);
    fclose(f);
}

// Analyseur minimal (meme principe que load_language_file_append) : cherche
// "cle": valeur (chaine ou nombre) sans dependance a une bibliotheque JSON.
static bool load_settings(char* outLang, size_t outLangSize, uint8_t& outMusicVol, uint8_t& outSfxVol) {
    FILE* f = fopen("/sdcard/AKA/settings.json", "rb");
    if (!f) { ESP_LOGI(TAG, "load_settings: absent (premier demarrage ?)"); return false; }
    char buf[256];
    size_t n = fread(buf, 1, sizeof(buf) - 1, f);
    fclose(f);
    buf[n] = '\0';

    const char* p = strstr(buf, "\"language\"");
    if (p) {
        p = strchr(p, ':'); if (p) { p = strchr(p, '"'); if (p) {
            ++p; const char* start = p;
            while (*p && *p != '"') ++p;
            size_t len = (size_t)(p - start);
            if (len > 0 && len < outLangSize) { memcpy(outLang, start, len); outLang[len] = '\0'; }
        }}
    }
    p = strstr(buf, "\"musicVolume\"");
    if (p) { p = strchr(p, ':'); if (p) outMusicVol = (uint8_t)atoi(p + 1); }
    p = strstr(buf, "\"sfxVolume\"");
    if (p) { p = strchr(p, ':'); if (p) outSfxVol = (uint8_t)atoi(p + 1); }
    ESP_LOGI(TAG, "load_settings: langue=%s musique=%d sons=%d", outLang, outMusicVol, outSfxVol);
    return true;
}

// ---------------------------------------------------------------------
// Langues : table en memoire, chargee depuis DEUX fichiers par langue --
// /sdcard/AKA/lang/<code>.json (COMMUN, partage par tous les jeux : libelles
// du menu systeme) PUIS /sdcard/<gameId>/lang/<code>.json (SPECIFIQUE au
// jeu : commandes, credits...). Recherche en ordre INVERSE (le plus
// recemment charge -- donc le specifique au jeu -- gagne en cas de cle en
// double). Format volontairement simple ({"CLE": "texte"}, pas de JSON
// imbrique) pour eviter une dependance a une bibliotheque JSON complete.
// ---------------------------------------------------------------------
#define LANG_MAX_ENTRIES 96
#define LANG_KEY_LEN     24
#define LANG_VAL_LEN     96
static char s_langKeys[LANG_MAX_ENTRIES][LANG_KEY_LEN];
static char s_langVals[LANG_MAX_ENTRIES][LANG_VAL_LEN];
static int  s_langCount = 0;

static void load_language_file_append(const char* path) {
    FILE* f = fopen(path, "rb");
    if (!f) { ESP_LOGE(TAG, "load_language_file(%s) -> ECHEC (fichier absent)", path); return; }

    char buf[4096];
    size_t n = fread(buf, 1, sizeof(buf) - 1, f);
    fclose(f);
    buf[n] = '\0';

    int added = 0;
    const char* p = buf;
    while (*p && s_langCount < LANG_MAX_ENTRIES) {
        while (*p && *p != '"') ++p;
        if (!*p) break;
        ++p;
        const char* keyStart = p;
        while (*p && *p != '"') ++p;
        if (!*p) break;
        size_t keyLen = (size_t)(p - keyStart);
        ++p;
        while (*p && *p != ':') ++p;
        if (!*p) break;
        ++p;
        while (*p && *p != '"') ++p;
        if (!*p) break;
        ++p;
        const char* valStart = p;
        while (*p && *p != '"') {
            if (*p == '\\' && *(p+1)) ++p;   // ignore les echappements simples
            ++p;
        }
        if (!*p) break;
        size_t valLen = (size_t)(p - valStart);
        ++p;

        if (keyLen > 0 && keyLen < LANG_KEY_LEN && valLen < LANG_VAL_LEN) {
            memcpy(s_langKeys[s_langCount], keyStart, keyLen);
            s_langKeys[s_langCount][keyLen] = '\0';
            memcpy(s_langVals[s_langCount], valStart, valLen);
            s_langVals[s_langCount][valLen] = '\0';
            ++s_langCount; ++added;
        }
    }
    ESP_LOGI(TAG, "load_language_file(%s) -> %d entrees ajoutees", path, added);
}

static void load_language(const char* gameId, const char* code) {
    s_langCount = 0;
    char pathCommon[64], pathGame[96];
    snprintf(pathCommon, sizeof pathCommon, "/sdcard/AKA/lang/%s.json", code);
    snprintf(pathGame, sizeof pathGame, "/sdcard/%s/lang/%s.json", gameId, code);
    load_language_file_append(pathCommon);
    load_language_file_append(pathGame);
}

// ---------------------------------------------------------------------

static bool sd_mkdir(const char* path) {
    if (mkdir(path, 0777) == 0) { ESP_LOGI(TAG, "mkdir(%s) -> cree", path); return true; }
    if (errno == EEXIST) { ESP_LOGI(TAG, "mkdir(%s) -> deja present", path); return true; }
    ESP_LOGE(TAG, "mkdir(%s) -> ECHEC (errno=%d, %s)", path, errno, strerror(errno));
    return false;
}

void AkaRuntime::begin(const char* gameId) {
    snprintf(m_gameId, sizeof(m_gameId), "%s", gameId);
    snprintf(m_gamePath, sizeof(m_gamePath), "/sdcard/%s", gameId);

    struct stat st;
    bool sd_ok = (stat("/sdcard", &st) == 0);
    ESP_LOGI(TAG, "verif /sdcard : %s (errno=%d si echec)", sd_ok ? "monte" : "ABSENT/PAS MONTE", sd_ok ? 0 : errno);

    sd_mkdir("/sdcard/AKA");
    sd_mkdir("/sdcard/AKA/lang");
    sd_mkdir(m_gamePath);
    char langGameDir[80]; snprintf(langGameDir, sizeof langGameDir, "%s/lang", m_gamePath);
    sd_mkdir(langGameDir);
    char shotGameDir[80]; snprintf(shotGameDir, sizeof shotGameDir, "%s/screenshots", m_gamePath);
    sd_mkdir(shotGameDir);
    char musicDir[80]; snprintf(musicDir, sizeof musicDir, "%s/music", m_gamePath);
    sd_mkdir(musicDir);

    // Charge les reglages persistants (langue/volumes) s'ils existent deja ;
    // sinon garde les defauts (fr, 80/70) et les ecrit pour la prochaine fois.
    if (load_settings(m_language, sizeof(m_language), s_musicVolume, s_sfxVolume)) {
        load_language(m_gameId, m_language);
    } else {
        load_language(m_gameId, m_language);
        save_settings(m_language);
    }
}

void AkaRuntime::setCredits(const char* title, const char* author,
                             const char* license, const char* sourceUrl) {
    m_title = title; m_author = author; m_license = license; m_sourceUrl = sourceUrl;
}

void AkaRuntime::setControlsKeys(const char* const* keys) {
    m_controlsKeys = keys;
}

void AkaRuntime::setGameMenuCallback(void (*callback)()) {
    m_gameMenuCallback = callback;
}

static void check_return_to_loader(bool run_held, bool menu_held) {
    static uint32_t combo_start = 0;
    uint32_t now = (uint32_t)(esp_timer_get_time() / 1000);
    if (run_held && menu_held) {
        if (!combo_start) { combo_start = now; ESP_LOGI(TAG, "RUN+MENU maintenus..."); }
        else if (now - combo_start >= 500) {
            ESP_LOGI(TAG, "-> retour au loader");
            const esp_partition_t* loader = esp_partition_find_first(
                ESP_PARTITION_TYPE_APP, ESP_PARTITION_SUBTYPE_APP_OTA_1, nullptr);
            if (!loader) { ESP_LOGE(TAG, "partition loader (OTA_1) introuvable !"); return; }
            esp_ota_set_boot_partition(loader);
            esp_restart();
        }
    } else combo_start = 0;
}

// =======================================================================
// Menu systeme (RUNTIME_SPEC.md) -- rendu direct via gb_graphics,
// independant de l'etat d'affichage du jeu.
// =======================================================================
enum class MenuState : uint8_t { Closed, Main, Controls, Language, Credits, Volume };
static MenuState s_menuState = MenuState::Closed;
static int8_t s_menuSel = 0;
static int8_t s_langSel = 0;
static int8_t s_volumeSel = 0;   // 0 = musique, 1 = sons

enum class MenuAction : uint8_t { Resume, GameSelect, Controls, Language, Credits, Volume, ReturnLoader };
static const char* s_menuKeys[7];
static MenuAction  s_menuActions[7];
static int         s_menuCount = 0;

static void rebuild_main_menu(bool hasGameMenu) {
    int i = 0;
    s_menuKeys[i] = "MENU_RESUME";        s_menuActions[i] = MenuAction::Resume;       ++i;
    if (hasGameMenu) {
        s_menuKeys[i] = "MENU_GAME_SELECT"; s_menuActions[i] = MenuAction::GameSelect; ++i;
    }
    s_menuKeys[i] = "MENU_CONTROLS";      s_menuActions[i] = MenuAction::Controls;     ++i;
    s_menuKeys[i] = "MENU_LANGUAGE";      s_menuActions[i] = MenuAction::Language;     ++i;
    s_menuKeys[i] = "MENU_VOLUME";        s_menuActions[i] = MenuAction::Volume;       ++i;
    s_menuKeys[i] = "MENU_CREDITS";       s_menuActions[i] = MenuAction::Credits;      ++i;
    s_menuKeys[i] = "MENU_RETURN_LOADER"; s_menuActions[i] = MenuAction::ReturnLoader; ++i;
    s_menuCount = i;
}

static const char* const kLangCodes[] = { "fr", "en", "pt", "es", "it", "de" };
static const char* const kLangNames[] = { "Francais", "English", "Portugues", "Espanol", "Italiano", "Deutsch" };
static const int kLangCount = 6;

// Tronque un texte pour qu'il tienne dans la largeur de la boite du menu --
// evite tout debordement hors du cadre (24..296) quelle que soit la langue.
static char s_truncBuf[3][40];
static const char* truncate_to_fit(const char* s, int maxChars, int bufIdx) {
    char* buf = s_truncBuf[bufIdx];
    size_t len = strlen(s);
    if ((int)len <= maxChars) { snprintf(buf, 40, "%s", s); return buf; }
    int keep = maxChars - 2; if (keep < 0) keep = 0;
    memcpy(buf, s, keep);
    buf[keep] = '.';
    buf[keep+1] = '.';
    buf[keep+2] = '\0';
    return buf;
}

static void menu_frame(const char* titleKey) {
    gfx.setColor(gfx.makeColor(10, 10, 30));
    gfx.fillRect(24, 18, 272, 204);
    gfx.setColor(gfx.makeColor(255, 255, 255));
    gfx.drawRect(24, 18, 272, 204);
    gfx.setColor(gfx.makeColor(255, 220, 0));
    gfx.move_cursor(34, 26);
    gfx.print_str(truncate_to_fit(akaRuntime.translate(titleKey), 31, 0));
    gfx.setColor(gfx.makeColor(255, 255, 255));

    // Legende des touches en bas du cadre
    gfx.setColor(gfx.makeColor(160, 160, 160));
    gfx.move_cursor(34, 208);
    gfx.print_str(truncate_to_fit(akaRuntime.translate("MENU_LEGEND"), 31, 1));
    gfx.setColor(gfx.makeColor(255, 255, 255));
}

void AkaRuntime::menuDrawMain() {
    menu_frame("MENU_TITLE");
    for (int i = 0; i < s_menuCount; ++i) {
        int y = 48 + i * 16;
        bool sel = (i == s_menuSel);
        gfx.setColor(sel ? gfx.makeColor(255, 220, 0) : gfx.makeColor(255, 255, 255));
        gfx.move_cursor(34, y);
        gfx.print_str(sel ? ">" : " ");
        gfx.move_cursor(46, y);
        gfx.print_str(truncate_to_fit(translate(s_menuKeys[i]), 30, 0));
    }
}

void AkaRuntime::menuDrawControls() {
    menu_frame("MENU_CONTROLS");
    int y = 48;
    if (m_controlsKeys) {
        for (int i = 0; m_controlsKeys[i] != nullptr && y < 200; ++i, y += 16) {
            gfx.move_cursor(34, y);
            gfx.print_str(truncate_to_fit(translate(m_controlsKeys[i]), 31, 0));
        }
    }
}

void AkaRuntime::menuDrawLanguage() {
    menu_frame("MENU_LANGUAGE");
    for (int i = 0; i < kLangCount; ++i) {
        int y = 48 + i * 16;
        bool sel = (i == s_langSel);
        bool active = (strcmp(m_language, kLangCodes[i]) == 0);
        gfx.setColor(sel ? gfx.makeColor(255, 220, 0)
                         : (active ? gfx.makeColor(120, 240, 140) : gfx.makeColor(255, 255, 255)));
        gfx.move_cursor(34, y);
        gfx.print_str(sel ? ">" : (active ? "*" : " "));
        gfx.move_cursor(46, y);
        gfx.print_str(kLangNames[i]);
    }
}

void AkaRuntime::menuDrawCredits() {
    menu_frame("MENU_CREDITS");
    int y = 48;
    gfx.move_cursor(34, y); gfx.print_str(truncate_to_fit(m_title, 31, 0)); y += 16;
    gfx.move_cursor(34, y); gfx.print_str(truncate_to_fit(translate("CREDITS_AUTHOR"), 31, 0)); y += 12;
    gfx.move_cursor(42, y); gfx.print_str(truncate_to_fit(m_author, 30, 0)); y += 20;
    gfx.move_cursor(34, y); gfx.print_str(truncate_to_fit(translate("CREDITS_LICENSE"), 31, 0)); y += 12;
    gfx.move_cursor(42, y); gfx.print_str(truncate_to_fit(m_license, 30, 0)); y += 20;
    gfx.move_cursor(34, y); gfx.print_str(truncate_to_fit(translate("CREDITS_SOURCE"), 31, 0)); y += 12;
    size_t srcLen = strlen(m_sourceUrl);
    if (srcLen > 30) {
        char line1[31]; memcpy(line1, m_sourceUrl, 30); line1[30] = '\0';
        gfx.move_cursor(42, y); gfx.print_str(line1); y += 12;
        gfx.move_cursor(42, y); gfx.print_str(truncate_to_fit(m_sourceUrl + 30, 30, 1));
    } else {
        gfx.move_cursor(42, y); gfx.print_str(m_sourceUrl);
    }
}

void AkaRuntime::menuDrawVolume() {
    menu_frame("MENU_VOLUME");
    const char* rowKeys[2] = { "MENU_VOL_MUSIC", "MENU_VOL_SFX" };
    uint8_t vols[2] = { s_musicVolume, s_sfxVolume };
    for (int i = 0; i < 2; ++i) {
        int y = 55 + i * 32;
        bool sel = (i == s_volumeSel);
        gfx.setColor(sel ? gfx.makeColor(255, 220, 0) : gfx.makeColor(255, 255, 255));
        gfx.move_cursor(34, y);
        gfx.print_str(sel ? ">" : " ");
        gfx.move_cursor(46, y);
        gfx.print_str(truncate_to_fit(translate(rowKeys[i]), 30, 0));
        // barre de progression simple (0-100 -> 0-200 px)
        int barY = y + 13, barW = (vols[i] * 200) / 100;
        gfx.setColor(gfx.makeColor(80, 80, 80));
        gfx.fillRect(46, barY, 200, 6);
        gfx.setColor(gfx.makeColor(80, 220, 80));
        gfx.fillRect(46, barY, barW, 6);
    }
}

static void clear_menu_box() {
    gfx.setColor(gfx.makeColor(0, 0, 0));
    gfx.fillRect(24, 18, 272, 204);
    gfx.update();
}

// Renvoie true si le menu doit rester ouvert (le jeu ne doit rien faire
// d'autre ce tour-ci), false quand il vient de se fermer (le jeu reprend
// la main a partir du tour SUIVANT).
bool AkaRuntime::menuHandleInput(const Keys& k) {
    bool up = k.pressed & EXPANDER_KEY_UP, down = k.pressed & EXPANDER_KEY_DOWN;
    bool a  = k.pressed & GB_KEY_A, c = k.pressed & GB_KEY_C;
    bool menuShort = false;
    static bool s_wasMenuHeld = false;
    if (k.MENU) { s_wasMenuHeld = true; }
    else if (s_wasMenuHeld) { menuShort = true; s_wasMenuHeld = false; }

    switch (s_menuState) {
        case MenuState::Closed:
            return false;   // ne devrait pas arriver (appele seulement si menu ouvert)

        case MenuState::Main:
            if (up)   s_menuSel = (int8_t)((s_menuSel + s_menuCount - 1) % s_menuCount);
            if (down) s_menuSel = (int8_t)((s_menuSel + 1) % s_menuCount);
            if (c || menuShort) { clear_menu_box(); s_menuState = MenuState::Closed; return false; }
            if (a) {
                switch (s_menuActions[s_menuSel]) {
                    case MenuAction::Resume:       clear_menu_box(); s_menuState = MenuState::Closed; return false;
                    case MenuAction::GameSelect:    if (m_gameMenuCallback) m_gameMenuCallback();
                                                     clear_menu_box(); s_menuState = MenuState::Closed; return false;
                    case MenuAction::Controls:     s_menuState = MenuState::Controls; break;
                    case MenuAction::Language: {
                        s_menuState = MenuState::Language;
                        s_langSel = 0;
                        for (int li = 0; li < kLangCount; ++li) {
                            if (strcmp(m_language, kLangCodes[li]) == 0) {
                                s_langSel = (int8_t)li;
                                break;
                            }
                        }
                        break;
                    }
                    case MenuAction::Volume:       s_menuState = MenuState::Volume; s_volumeSel = 0; break;
                    case MenuAction::Credits:      s_menuState = MenuState::Credits; break;
                    case MenuAction::ReturnLoader: returnToLoader(); break;
                }
            }
            menuDrawMain();
            gfx.update();
            return true;

        case MenuState::Controls:
            if (a || c || menuShort) { s_menuState = MenuState::Main; }
            menuDrawControls();
            gfx.update();
            return true;

        case MenuState::Language:
            if (up)   s_langSel = (int8_t)((s_langSel + kLangCount - 1) % kLangCount);
            if (down) s_langSel = (int8_t)((s_langSel + 1) % kLangCount);
            if (c || menuShort) { s_menuState = MenuState::Main; }
            if (a) { setLanguage(kLangCodes[s_langSel]); s_menuState = MenuState::Main; }
            menuDrawLanguage();
            gfx.update();
            return true;

        case MenuState::Credits:
            if (a || c || menuShort) { s_menuState = MenuState::Main; }
            menuDrawCredits();
            gfx.update();
            return true;

        case MenuState::Volume: {
            if (up)   s_volumeSel = (int8_t)((s_volumeSel + 1) % 2);
            if (down) s_volumeSel = (int8_t)((s_volumeSel + 1) % 2);
            bool left = k.pressed & EXPANDER_KEY_LEFT, right = k.pressed & EXPANDER_KEY_RIGHT;
            if (left || right) {
                int delta = right ? 10 : -10;
                if (s_volumeSel == 0) {
                    int v = (int)s_musicVolume + delta;
                    if (v < 0) v = 0;
                    if (v > 100) v = 100;
                    setMusicVolume((uint8_t)v);
                } else {
                    int v = (int)s_sfxVolume + delta;
                    if (v < 0) v = 0;
                    if (v > 100) v = 100;
                    setSfxVolume((uint8_t)v);
                }
            }
            if (c || menuShort) { s_menuState = MenuState::Main; }
            menuDrawVolume();
            gfx.update();
            return true;
        }
    }
    return true;
}

bool AkaRuntime::update(const Keys& k) {
    // RUN+MENU maintenus -> retour au loader (lu directement sur g_core.buttons).
    uint32_t s = g_core.buttons.state();
    check_return_to_loader(s & GB_KEY_RUN, s & GB_KEY_MENU);

    // Menu deja ouvert : il prend la main entierement ce tour-ci.
    if (s_menuState != MenuState::Closed) {
        return !menuHandleInput(k);   // update() renvoie FAUX tant que le menu est ouvert
    }

    static uint32_t s_menu_start = 0;
    static bool     s_shot_done  = false;
    static bool     s_was_held   = false;
    uint32_t now = (uint32_t)(esp_timer_get_time() / 1000);
    if (k.MENU && !k.RUN) {
        if (!s_menu_start) { s_menu_start = now; s_shot_done = false; }
        else if (!s_shot_done && now - s_menu_start >= 500) {
            s_shot_done = true;
            bool ok = takeScreenshot();
            ESP_LOGI(TAG, "capture ecran : %s", ok ? "OK" : "ECHEC");
        }
        s_was_held = true;
    } else {
        if (s_was_held && !s_shot_done && s_menu_start != 0) {
            rebuild_main_menu(m_gameMenuCallback != nullptr);
            s_menuState = MenuState::Main;
            s_menuSel = 0;
            ESP_LOGI(TAG, "MENU (appui court) -> menu systeme ouvert");
        }
        s_menu_start = 0; s_shot_done = false; s_was_held = false;
    }
    return true;
}

bool AkaRuntime::helpRequested() {
    bool r = s_helpRequested;
    s_helpRequested = false;
    return r;
}

bool AkaRuntime::isMenuOpen() const { return s_menuState != MenuState::Closed; }

const char* AkaRuntime::gamePath()       const { return m_gamePath; }
const char* AkaRuntime::settingsPath()   const { return "/sdcard/AKA/settings.json"; }
const char* AkaRuntime::screenshotPath() const {
    static char buf[80];
    snprintf(buf, sizeof buf, "%s/screenshots", m_gamePath);
    return buf;
}

bool AkaRuntime::takeScreenshot() {
    char kDir[80]; snprintf(kDir, sizeof kDir, "%s/screenshots", m_gamePath);
    bool mkOk = sd_mkdir(kDir);
    ESP_LOGI(TAG, "takeScreenshot: mkdir(%s) -> %s", kDir, mkOk ? "ok" : "ECHEC");

    char path[112];
    int shot_num = -1;
    for (int i = 0; i < 10000; ++i) {
        snprintf(path, sizeof(path), "%s/%04d.BMP", kDir, i);
        FILE* test = fopen(path, "rb");
        if (!test) { shot_num = i; break; }
        fclose(test);
    }
    if (shot_num < 0) { ESP_LOGE(TAG, "takeScreenshot: pas de nom de fichier libre"); return false; }
    ESP_LOGI(TAG, "takeScreenshot: chemin = %s", path);

    FILE* f = fopen(path, "wb");
    if (!f) { ESP_LOGE(TAG, "takeScreenshot: fopen ECHEC (%s)", path); return false; }

    const int W = 320, H = 240;
    const int row_bytes   = W * 3;
    const int row_padding = (4 - (row_bytes % 4)) % 4;
    const int row_stride  = row_bytes + row_padding;
    const uint32_t data_size = (uint32_t)row_stride * H;
    const uint32_t file_size = 14 + 40 + data_size;

    uint8_t header[54] = {0};
    header[0]='B'; header[1]='M';
    header[2]=(uint8_t)file_size;       header[3]=(uint8_t)(file_size>>8);
    header[4]=(uint8_t)(file_size>>16); header[5]=(uint8_t)(file_size>>24);
    header[10]=54;
    header[14]=40;
    header[18]=(uint8_t)W;  header[19]=(uint8_t)(W>>8);
    header[22]=(uint8_t)H;  header[23]=(uint8_t)(H>>8);
    header[26]=1; header[28]=24;
    header[34]=(uint8_t)data_size;       header[35]=(uint8_t)(data_size>>8);
    header[36]=(uint8_t)(data_size>>16); header[37]=(uint8_t)(data_size>>24);
    fwrite(header, 1, 54, f);

    uint8_t row[320 * 3 + 3] = {0};
    for (int y = H - 1; y >= 0; --y) {
        for (int x = 0; x < W; ++x) {
            gb_pixel v = lcd_getpixel((uint16_t)x, (uint16_t)y);
            uint8_t r5 =  v        & 0x1F;
            uint8_t g6 = (v >> 5)  & 0x3F;
            uint8_t b5 = (v >> 11) & 0x1F;
            row[x*3+0] = (uint8_t)((b5 * 255) / 31);
            row[x*3+1] = (uint8_t)((g6 * 255) / 63);
            row[x*3+2] = (uint8_t)((r5 * 255) / 31);
        }
        for (int p = 0; p < row_padding; ++p) row[row_bytes + p] = 0;
        fwrite(row, 1, row_stride, f);
    }
    fclose(f);
    ESP_LOGI(TAG, "takeScreenshot: ecrit avec succes (%s)", path);
    return true;
}

void AkaRuntime::returnToLoader() {
    const esp_partition_t* loader = esp_partition_find_first(
        ESP_PARTITION_TYPE_APP, ESP_PARTITION_SUBTYPE_APP_OTA_1, nullptr);
    if (loader) { esp_ota_set_boot_partition(loader); esp_restart(); }
}

uint8_t AkaRuntime::getMusicVolume() const { return s_musicVolume; }
uint8_t AkaRuntime::getSfxVolume()   const { return s_sfxVolume; }
void    AkaRuntime::setMusicVolume(uint8_t v) {
    s_musicVolume = v;
    save_settings(m_language);
    if (s_volumeChangedCallback) s_volumeChangedCallback(s_musicVolume, s_sfxVolume);
}
void    AkaRuntime::setSfxVolume(uint8_t v) {
    s_sfxVolume = v;
    save_settings(m_language);
    if (s_volumeChangedCallback) s_volumeChangedCallback(s_musicVolume, s_sfxVolume);
}
void    AkaRuntime::setVolumeChangedCallback(void (*callback)(uint8_t, uint8_t)) {
    s_volumeChangedCallback = callback;
}

const char* AkaRuntime::getLanguage() const { return m_language; }

void AkaRuntime::setLanguage(const char* code) {
    snprintf(m_language, sizeof(m_language), "%s", code);
    load_language(m_gameId, m_language);
    save_settings(m_language);
}

struct BuiltinLangEntry {
    const char* key;
    const char* vals[6]; // 0:fr, 1:en, 2:pt, 3:es, 4:it, 5:de
};

static const BuiltinLangEntry kBuiltinLangTable[] = {
    {"MENU_TITLE", {"MENU SYSTEME AKA", "AKA SYSTEM MENU", "MENU DO SISTEMA AKA", "MENU DEL SISTEMA AKA", "MENU DI SISTEMA AKA", "AKA-SYSTEMMENU"}},
    {"MENU_RESUME", {"Reprendre la partie", "Resume game", "Voltar ao jogo", "Volver al juego", "Torna al gioco", "Zuruck zum Spiel"}},
    {"MENU_GAME_SELECT", {"Ecran Titre", "Title Screen", "Tela Inicial", "Pantalla Titulo", "Schermata Titolo", "Titelbildschirm"}},
    {"MENU_CONTROLS", {"Commandes", "Controls", "Controles", "Controles", "Comandi", "Steuerung"}},
    {"MENU_LANGUAGE", {"Langue", "Language", "Idioma", "Idioma", "Lingua", "Sprache"}},
    {"MENU_VOLUME", {"Volume audio", "Audio volume", "Volume de audio", "Volumen de audio", "Volume audio", "Lautstarke"}},
    {"MENU_VOL_MUSIC", {"Musique", "Music", "Musica", "Musica", "Musica", "Musik"}},
    {"MENU_VOL_SFX", {"Effets sonores", "Sound effects", "Efeitos sonoros", "Efectos de sonido", "Effetti sonori", "Soundeffekte"}},
    {"MENU_CREDITS", {"Credits", "Credits", "Creditos", "Creditos", "Crediti", "Credits"}},
    {"MENU_RETURN_LOADER", {"Retourner au Loader", "Return to Loader", "Voltar ao Loader", "Volver al Loader", "Torna al Loader", "Zuruck zum Loader"}},
    {"MENU_LEGEND", {"A:Valider  C/MENU:Retour", "A:Confirm  C/MENU:Back", "A:OK  C/MENU:Voltar", "A:Aceptar  C/MENU:Volver", "A:OK  C/MENU:Indietro", "A:OK  C/MENU:Zuruck"}},
    {"CREDITS_AUTHOR", {"Auteur :", "Author:", "Autor:", "Autor:", "Autore:", "Autor:"}},
    {"CREDITS_LICENSE", {"Licence :", "License:", "Licenca:", "Licencia:", "Licenza:", "Lizenz:"}},
    {"CREDITS_SOURCE", {"Code & Release :", "Source & Release:", "Codigo & Release:", "Codigo y Release:", "Codice e Release:", "Quellcode & Release:"}},
    {"CTRL_1", {"DPad/Stick: Marche/Saut/Bas", "DPad/Stick: Move/Jump/Duck", "DPad/Stick: Mover/Pulo/Ag.", "DPad/Stick: Mover/Salto/Ab.", "DPad/Stick: Muovi/Salta/Giu", "DPad/Stick: Lauf/Sprung/Ab"}},
    {"CTRL_2", {"A : Taille Vive / Estoc", "A: Quick Slash / Thrust", "A: Corte Rapido / Estocada", "A: Tajo Veloz / Estocada", "A: Fendente / Affondo", "A: Schneller Hieb / Stich"}},
    {"CTRL_3", {"B : Balayage Bas", "B: Low Sweep", "B: Rasteira Baixa", "B: Barrido Bajo", "B: Spazzata Bassa", "B: Tiefer Feger"}},
    {"CTRL_4", {"C : Moulinet Decapitant", "C: 360 Decapitating Spin", "C: Giro Decapitador 360", "C: Giro Decapitador 360", "C: Giro Decapitante 360", "C: 360-Enthauptungswirbel"}},
    {"CTRL_5", {"D : Roulade / Forge", "D: Dodge Roll / Forge", "D: Rolamento / Forja", "D: Rodar / Forja", "D: Capriola / Forgia", "D: Ausweichrolle / Schmiede"}},
    {"CTRL_6", {"L1: Parade  |  R1: Fendoir", "L1: Parry | R1: Heavy Chop", "L1: Defesa | R1: Golpe Pes.", "L1: Parada | R1: Fendiente", "L1: Parata | R1: Colpo Pes.", "L1: Parade | R1: Spalter"}},
    {"CTRL_7", {"MENU: Pause | +RUN: Loader", "MENU: Pause | +RUN: Loader", "MENU: Pausa | +RUN: Loader", "MENU: Pausa | +RUN: Loader", "MENU: Pausa | +RUN: Loader", "MENU: Pause | +RUN: Loader"}},
};

const char* AkaRuntime::translate(const char* key) const {
    for (int i = s_langCount - 1; i >= 0; --i)   // ordre inverse : specifique au jeu prioritaire
        if (strcmp(s_langKeys[i], key) == 0) return s_langVals[i];

    int langIdx = 0;
    for (int li = 0; li < kLangCount; ++li) {
        if (strcmp(m_language, kLangCodes[li]) == 0) {
            langIdx = li;
            break;
        }
    }
    const int nBuiltin = (int)(sizeof(kBuiltinLangTable) / sizeof(kBuiltinLangTable[0]));
    for (int bi = 0; bi < nBuiltin; ++bi) {
        if (strcmp(kBuiltinLangTable[bi].key, key) == 0) {
            return kBuiltinLangTable[bi].vals[langIdx];
        }
    }
    return key;
}
