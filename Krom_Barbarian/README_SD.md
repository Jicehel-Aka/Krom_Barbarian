# Krom : Le Glaive d'Acier — Dossier Carte microSD Gamebuino AKA (ESP32-S3)

Ce dossier correspond à l'arborescence officielle `/Krom_Barbarian/` attendue par le **Bootloader SD Gamebuino AKA** (ESP32-S3R8 · Écran ST7789V `320×240` non tactile).

## Arborescence sur la carte microSD (FAT32)

```text
/Krom_Barbarian/
  ├── Firmware.bin          # Binaire exécutable ESP32-S3 compilé via ESP-IDF v5.4.1
  ├── screen.bmp            # Vignette 160x120 (BMP 24 bits) affichée dans le Loader AKA
  ├── Picture.png           # Visuel 320x240 affiché sur le portail de téléchargement
  ├── config.ini            # Métadonnées Loader AKA
  └── lang/                 # Tables de traductions du Menu Système AKA (6 langues)
      ├── fr.json
      ├── en.json
      ├── pt.json
      ├── es.json
      ├── it.json
      └── de.json
```

## Comment récupérer `Firmware.bin` prêt à copier sur la microSD

1. **Via GitHub Releases (recommandé, zéro outil local à installer)** :
   - Poussez le dépôt sur GitHub et créez un tag `v2.0.0` (ou lancez manuellement l'action *Build & Release PC + Gamebuino AKA*).
   - Le workflow compile automatiquement `/firmware_aka_esp32s3` avec `espressif/esp-idf-ci-action@v1` (`target: esp32s3`, SDK officiel `gamebuino` + `aka_runtime` + `aka_font`) et publie :
     - `Firmware.bin` seul,
     - `Krom_Barbarian_Gamebuino_AKA_SD_<version>.zip` contenant `/Krom_Barbarian/Firmware.bin` et `/Krom_Barbarian/lang/*.json` prêts à décompresser à la racine de la carte microSD.

2. **Compilation locale ESP-IDF (ESP32-S3)** :
   ```bash
   cd firmware_aka_esp32s3
   idf.py set-target esp32s3
   idf.py build
   cp build/krom_barbarian_aka.bin ../Krom_Barbarian/Firmware.bin
   ```

## Spécificités matérielles Gamebuino AKA prises en charge
- **Écran ST7789V 320×240 non tactile** (`gb_graphics`, rendu 16 bits BGR565 fluide).
- **Bouton `MENU`** : ouvre le Menu Système officiel `aka_runtime` (Pause, Volume Musique/Sons, 6 Langues FR/EN/PT/ES/IT/DE, Commandes, Crédits, Retour au Loader `OTA_1`).
- **Maintien `RUN + MENU` (500 ms)** : retour direct au Loader SD (`OTA_1`).
- **Console USB-Serial-JTAG native** (`CONFIG_ESP_CONSOLE_USB_SERIAL_JTAG=y`) : préserve intégralement `GPIO43` pour le bus I2C de l'expander boutons.
