export function buildAkaArduinoSketch(wsHost: string, roomCode: string): string {
  const safeRoom = (roomCode || 'KROM').toUpperCase().slice(0, 4);
  const safeHost = wsHost || '192.168.1.25:3000';
  const hostIp = safeHost.split(':')[0];
  const hostPort = safeHost.includes(':') ? safeHost.split(':')[1] : '3000';

  return `/*
 * ============================================================================
 *  RÉPERTOIRE DU JEU : /Krom_Barbarian/Firmware
 *  PROGRAMME         : Firmware (Firmware.ino)
 *  CONSOLE CIBLE     : Gamebuino AKA — Écran 320x240 TFT NON TACTILE
 *  CONTRÔLES AKA     : Joystick analogique, Pavé directionnel (D-Pad),
 *                      MENU, RUN, A, B, C, D, L1, R1 + Système Bootloader
 * ============================================================================
 *
 *  Menu Système appelé par le bouton MENU :
 *    - Met immédiatement le jeu en pause jusqu'au retour
 *    - Retourner au jeu
 *    - Régler le volume des sons (0..100%)
 *    - Régler le volume de la musique (0..100%)
 *    - Choisir la langue : Français, English, Português, Español, Italiano, Deutsch
 *    - Retourner au Loader (Bootloader Gamebuino AKA)
 *
 *  Liaison Multijoueur PC <-> Gamebuino AKA :
 *    - Câble USB Direct : 115200 bauds (BTN:<mask10bits> <-> S:<etat320x240>)
 *    - WiFi WebSocket   : ws://${hostIp}:${hostPort}/ws (Salon "${safeRoom}")
 */

#include <Arduino.h>

// Décommentez pour activer la liaison WiFi WebSocket en plus du câble USB :
// #define AKA_ENABLE_WIFI

#ifdef AKA_ENABLE_WIFI
  #include <WiFi.h>
  #include <WebSocketsClient.h>
  const char* WIFI_SSID     = "VOTRE_WIFI_LOCAL";
  const char* WIFI_PASSWORD = "VOTRE_MOT_DE_PASSE";
  const char* PC_HOST       = "${hostIp}";
  const uint16_t PC_PORT    = ${hostPort};
  const char* ROOM_CODE     = "${safeRoom}";
  WebSocketsClient webSocket;
  bool wifiReady = false;
#endif

static const int AKA_W = 320;
static const int AKA_H = 240;
static const int GROUND_Y = 196;

// Pins matériels Gamebuino AKA
#define PIN_JOY_X    1
#define PIN_JOY_Y    2
#define PIN_DPAD_L   3
#define PIN_DPAD_R   4
#define PIN_DPAD_U   5
#define PIN_DPAD_D   6
#define PIN_BTN_A    7
#define PIN_BTN_B    8
#define PIN_BTN_C    9
#define PIN_BTN_D    10
#define PIN_BTN_L1   11
#define PIN_BTN_R1   12
#define PIN_BTN_MENU 13
#define PIN_BTN_RUN  14

// 6 langues intégrées au Menu Système AKA
const char* LANG_LABELS[6] = {
  "Francais", "English", "Portugues", "Espanol", "Italiano", "Deutsch"
};

bool menuOpen = false;
uint8_t menuRow = 0; // 0: Jeu, 1: Sons, 2: Musique, 3: Langue, 4: Loader
uint8_t sfxVol = 75;
uint8_t musicVol = 55;
uint8_t langIdx = 0;

int p1X = 88, p1Y = GROUND_Y, p1Hp = 100, p1Act = 0;
int p2X = 232, p2Y = GROUND_Y, p2Hp = 100, p2Act = 0;
int decapFlag = 0;

uint16_t lastMask = 0xFFFF;
bool prevMenuBtn = false;
String rxLine = "";

void returnToBootloader() {
  Serial.println("BOOTLOADER:RETURN:/Krom_Barbarian/Firmware");
  Serial.flush();
#ifdef ESP32
  esp_restart();
#endif
}

uint16_t readHardwareButtons() {
  uint16_t m = 0;
  int jx = analogRead(PIN_JOY_X) - 2048;
  int jy = analogRead(PIN_JOY_Y) - 2048;
  if (!digitalRead(PIN_DPAD_L) || jx < -700) m |= (1 << 0);
  if (!digitalRead(PIN_DPAD_R) || jx >  700) m |= (1 << 1);
  if (!digitalRead(PIN_DPAD_U) || jy < -700) m |= (1 << 2);
  if (!digitalRead(PIN_DPAD_D) || jy >  700) m |= (1 << 3);
  if (!digitalRead(PIN_BTN_A))               m |= (1 << 4);
  if (!digitalRead(PIN_BTN_B))               m |= (1 << 5);
  if (!digitalRead(PIN_BTN_C))               m |= (1 << 6);
  if (!digitalRead(PIN_BTN_D))               m |= (1 << 7);
  if (!digitalRead(PIN_BTN_L1))              m |= (1 << 8);
  if (!digitalRead(PIN_BTN_R1))              m |= (1 << 9);
  if (!digitalRead(PIN_BTN_RUN))             m |= (1 << 10);
  return m;
}

void parseArenaPacket(const String& s) {
  if (!s.startsWith("S:")) return;
  int v[9] = {88, GROUND_Y, 100, 0, 232, GROUND_Y, 100, 0, 0};
  int i = 0, pos = 2;
  while (i < 9 && pos < (int)s.length()) {
    int comma = s.indexOf(',', pos);
    if (comma < 0) comma = s.length();
    v[i++] = s.substring(pos, comma).toInt();
    pos = comma + 1;
  }
  p1X = v[0]; p1Y = v[1]; p1Hp = v[2]; p1Act = v[3];
  p2X = v[4]; p2Y = v[5]; p2Hp = v[6]; p2Act = v[7];
  decapFlag = v[8];
}

void setup() {
  Serial.begin(115200);
  const int pins[] = {
    PIN_DPAD_L, PIN_DPAD_R, PIN_DPAD_U, PIN_DPAD_D,
    PIN_BTN_A, PIN_BTN_B, PIN_BTN_C, PIN_BTN_D,
    PIN_BTN_L1, PIN_BTN_R1, PIN_BTN_MENU, PIN_BTN_RUN
  };
  for (int p : pins) pinMode(p, INPUT_PULLUP);

#ifdef AKA_ENABLE_WIFI
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 6000) delay(150);
  if (WiFi.status() == WL_CONNECTED) {
    wifiReady = true;
    webSocket.begin(PC_HOST, PC_PORT, "/ws");
    webSocket.onEvent([](WStype_t t, uint8_t* payload, size_t len) {
      if (t == WStype_Connected) {
        webSocket.sendTXT(String("{\\"type\\":\\"room:join\\",\\"roomCode\\":\\"") + ROOM_CODE + "\\",\\"role\\":\\"aka\\"}");
      } else if (t == WStype_TEXT) {
        String msg((char*)payload);
        int idx = msg.indexOf("S:");
        if (idx >= 0) {
          int q = msg.indexOf('"', idx);
          parseArenaPacket(msg.substring(idx, q > idx ? q : msg.length()));
        }
      }
    });
  }
#endif
}

void loop() {
  bool menuBtn = !digitalRead(PIN_BTN_MENU);
  if (menuBtn && !prevMenuBtn) {
    menuOpen = !menuOpen;
    menuRow = 0;
  }
  prevMenuBtn = menuBtn;

  uint16_t mask = readHardwareButtons();
  uint16_t edge = mask & (~lastMask);

  if (menuOpen) {
    if (edge & (1 << 2)) menuRow = (menuRow + 4) % 5;
    if (edge & (1 << 3)) menuRow = (menuRow + 1) % 5;
    bool left  = (edge & (1 << 0)) != 0;
    bool right = (edge & (1 << 1)) != 0;
    bool ok    = (edge & ((1 << 4) | (1 << 10))) != 0;

    if (menuRow == 0 && ok) menuOpen = false;
    else if (menuRow == 1) {
      if (left && sfxVol >= 10) sfxVol -= 10;
      if (right && sfxVol <= 90) sfxVol += 10;
    } else if (menuRow == 2) {
      if (left && musicVol >= 10) musicVol -= 10;
      if (right && musicVol <= 90) musicVol += 10;
    } else if (menuRow == 3) {
      if (left) langIdx = (langIdx + 5) % 6;
      if (right || ok) langIdx = (langIdx + 1) % 6;
    } else if (menuRow == 4 && ok) {
      returnToBootloader();
    }
  } else if (mask != lastMask) {
    Serial.print("BTN:");
    Serial.println(mask);
#ifdef AKA_ENABLE_WIFI
    if (wifiReady) {
      webSocket.sendTXT(String("{\\"type\\":\\"aka:mask\\",\\"roomCode\\":\\"") + ROOM_CODE + "\\",\\"mask\\":" + String(mask) + "}");
    }
#endif
  }
  lastMask = mask;

  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\\n') {
      rxLine.trim();
      parseArenaPacket(rxLine);
      rxLine = "";
    } else if (rxLine.length() < 110) {
      rxLine += c;
    }
  }

#ifdef AKA_ENABLE_WIFI
  if (wifiReady) webSocket.loop();
#endif
  delay(16);
}
`;
}
