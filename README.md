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
- **Organisation Bootloader** : Le programme de la console est rangé dans `/Krom_Barbarian/Firmware` (`Krom_Barbarian/Firmware/Firmware.ino`).

## Lancer une Release sur demande sur GitHub

Ce dépôt inclut le workflow `.github/workflows/release.yml` configuré avec `workflow_dispatch` :

1. Ouvrez l'onglet **Actions** de votre dépôt GitHub.
2. Sélectionnez **Release Gamebuino AKA & PC (On-Demand)** dans la colonne de gauche.
3. Cliquez sur **Run workflow**, indiquez le tag souhaité (ex. `v1.0.0`) puis validez.
4. GitHub compile automatiquement l'application, vérifie `/Krom_Barbarian/Firmware` et publie une **GitHub Release** contenant l'archive prête pour la carte SD de la Gamebuino AKA ainsi que le bundle serveur PC.

## Développement local (PC & Serveur Multijoueur)

```bash
npm install
npm run dev
```

Ouvrez ensuite `http://localhost:3000`.
