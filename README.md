# Krom : Le Glaive d'Acier — Gamebuino AKA (320×240) & PC

Jeu d'aventure et de duel à l'épée en pixel art hommage à *Barbarian (1987)* conçu pour la **Gamebuino AKA** et le **PC**, avec campagne scénarisée en 4 actes, forge de progression, boss redoutables et multijoueur local **PC ↔ Gamebuino AKA** (WiFi WebSocket ou Câble USB 115200 bauds).

## Spécifications Matérielles Gamebuino AKA prises en charge

- **Écran** : TFT `320×240` pixels **non tactile** (navigation 100 % matérielle).
- **Contrôles physiques** :
  - **Joystick analogique** & **Pavé directionnel (D-Pad)** : Déplacement, saut, esquive basse, navigation dans les menus.
  - **A** : Taille vive / Estoc avant / Balayage bas.
  - **B** : Fendoir lourd / Retour dans les menus.
  - **C** : **Moulinet Décapitant 360°** (*Coup Fatal* instantané si l'adversaire est affaibli ou si la Rage est à 100 %).
  - **D** : Roulade tactique d'assaut ou de retrait.
  - **L1** : Garde haute d'acier & Parade parfaite.
  - **R1** : Frappe brise-garde.
  - **RUN** : Démarrer / Valider.
  - **MENU** : Ouvre le **Menu Système AKA** qui met immédiatement la partie en pause jusqu'au retour, règle le **volume des sons** et le **volume de la musique**, permet de **retourner au Loader (Bootloader)** ou de choisir la langue parmi **Français, Anglais, Portugais, Espagnol, Italien et Allemand**.
- **Organisation Bootloader SD** : Le binaire ESP32-S3 compilé par GitHub Actions (ESP-IDF `v5.4.1`) est généré dans `/Krom_Barbarian/Firmware.bin` aux côtés de `config.ini` et des traductions `lang/*.json`.

## Compilation automatique de `Firmware.bin` sur GitHub

1. **À chaque push sur `main` / `master`** (`.github/workflows/ci.yml`) : GitHub Actions compile le jeu Web/PC et le firmware natif `/firmware_aka_esp32s3` via **ESP-IDF `v5.4.1`**, dépose `Krom_Barbarian/Firmware.bin` dans le dépôt, publie l'artefact `Krom_Barbarian_Gamebuino_AKA_Firmware` et met à jour la Release **`latest`**.
2. **Release versionnée à la demande** (`.github/workflows/release.yml`) : dans l'onglet **Actions** → **Release Gamebuino AKA & PC (On-Demand)** → **Run workflow**, indiquez un tag (ex. `v1.0.0`) pour publier une Release complète avec `Firmware.bin`, l'archive microSD Gamebuino AKA et le serveur PC.

## Développement local (PC & Serveur Multijoueur)

```bash
npm install
npm run dev
```

Ouvrez ensuite `http://localhost:3000`.
