import React, { useEffect, useMemo, useState } from 'react';
import {
  Wifi,
  Cable,
  Download,
  Copy,
  Check,
  RefreshCw,
  Users,
  GitBranch,
  ExternalLink,
} from 'lucide-react';
import { buildAkaArduinoSketch } from '../game/akaFirmware';
import type { WifiMultiplayerController } from '../hooks/useWifiMultiplayer';
import type { WebSerialAKAController } from '../hooks/useWebSerialAKA';
import type { StageId } from '../types/game';

interface MultiplayerPanelProps {
  wifi: WifiMultiplayerController;
  usb: WebSerialAKAController;
  selectedStage: StageId;
  onSelectStage: (stage: StageId) => void;
  onLaunchWifiArena: (asRole: 'pc' | 'aka') => void;
  onLaunchUsbArena: () => void;
  onLaunchLocal2P: () => void;
}

interface GithubStatus {
  oauthConfigured: boolean;
  authenticated: boolean;
  username: string | null;
  callbackUrl: string;
}

const STAGE_OPTIONS: { id: StageId; label: string }[] = [
  { id: 'forest', label: 'Clairières Cendrées' },
  { id: 'crypt', label: 'Cryptes d’Obsidienne' },
  { id: 'arena', label: 'Arène des Ossements' },
  { id: 'sanctuary', label: 'Sanctuaire de Drax' },
];

export const MultiplayerPanel: React.FC<MultiplayerPanelProps> = ({
  wifi,
  usb,
  selectedStage,
  onSelectStage,
  onLaunchWifiArena,
  onLaunchUsbArena,
  onLaunchLocal2P,
}) => {
  const [linkTab, setLinkTab] = useState<'wifi' | 'usb' | 'firmware' | 'github'>('github');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // GitHub OAuth & Repository Publisher State
  const [ghStatus, setGhStatus] = useState<GithubStatus | null>(null);
  const [repoName, setRepoName] = useState('krom-barbarian-gamebuino-aka');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [triggerReleaseNow, setTriggerReleaseNow] = useState(true);
  const [publishingGh, setPublishingGh] = useState(false);
  const [ghResult, setGhResult] = useState<{
    ok?: boolean;
    repoUrl?: string;
    actionsUrl?: string;
    filesPushed?: number;
    releaseDispatched?: boolean;
    error?: string;
  } | null>(null);

  const sketchSource = useMemo(
    () => buildAkaArduinoSketch(wifi.lanHostHint, wifi.roomCode || 'KROM'),
    [wifi.lanHostHint, wifi.roomCode]
  );

  const fetchGithubStatus = async () => {
    try {
      const res = await fetch('/api/github/status');
      if (res.ok) {
        const data = (await res.json()) as GithubStatus;
        setGhStatus(data);
      }
    } catch {
      // Ignore error
    }
  };

  useEffect(() => {
    fetchGithubStatus();
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchGithubStatus();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const handleConnectGithubOAuth = async () => {
    setGhResult(null);
    try {
      const res = await fetch('/api/github/auth-url');
      const data = await res.json();
      if (!res.ok || !data.url) {
        setGhResult({ error: data.error || 'OAuth GitHub non configuré.' });
        return;
      }
      window.open(data.url, 'github_oauth_popup', 'width=620,height=720');
    } catch {
      setGhResult({ error: 'Impossible d’ouvrir la fenêtre d’authentification GitHub.' });
    }
  };

  const handlePublishToGithub = async () => {
    setPublishingGh(true);
    setGhResult(null);
    try {
      const res = await fetch('/api/github/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          isPrivate: isPrivateRepo,
          triggerReleaseNow,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGhResult({ error: data.error || 'Échec de l’envoi sur GitHub.' });
      } else {
        setGhResult(data);
      }
    } catch {
      setGhResult({ error: 'Erreur réseau lors de la publication GitHub.' });
    } finally {
      setPublishingGh(false);
    }
  };

  const handleDownloadIno = () => {
    const blob = new Blob([sketchSource], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Firmware.ino';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySketch = async () => {
    try {
      await navigator.clipboard.writeText(sketchSource);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Ignore clipboard restriction
    }
  };

  return (
    <section className="space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-slate-800/90">
        <div className="max-w-2xl">
          <p className="text-xs text-amber-400 font-semibold mb-1">
            Liaison Matérielle Gamebuino AKA (320×240) & Dépôt GitHub
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-2"
            style={{ textWrap: 'balance' }}
          >
            Multijoueur WiFi / USB, Programme Firmware & Release GitHub
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Connectez votre Gamebuino AKA en WiFi ou par câble USB, récupérez le programme <code className="font-mono text-amber-300">/Krom_Barbarian/Firmware</code> pour le Bootloader SD, ou publiez l’intégralité du projet et son workflow de Release sur demande sur votre GitHub.
          </p>
        </div>

        {/* Interactive Transport & GitHub Selector */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#151921] border border-slate-800/90 rounded-lg">
          <button
            type="button"
            onClick={() => setLinkTab('github')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              linkTab === 'github'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub & Release</span>
          </button>
          <button
            type="button"
            onClick={() => setLinkTab('wifi')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              linkTab === 'wifi'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>WiFi Local</span>
          </button>
          <button
            type="button"
            onClick={() => setLinkTab('usb')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              linkTab === 'usb'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Cable className="w-3.5 h-3.5" />
            <span>Câble USB</span>
          </button>
          <button
            type="button"
            onClick={() => setLinkTab('firmware')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              linkTab === 'firmware'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Dossier Firmware</span>
          </button>
        </div>
      </div>

      {/* TAB 0: GITHUB REPOSITORY & ON-DEMAND RELEASE WORKFLOW */}
      {linkTab === 'github' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="p-6 bg-[#151921] border border-slate-800/90 rounded-xl flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <p className="text-xs font-mono text-amber-400">
                .github/workflows/release.yml · workflow_dispatch prêt
              </p>
              <h3 className="text-xl font-bold text-white">
                01. Workflows GitHub Actions déjà intégrés au projet
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Le dépôt contient déjà toute l’arborescence prête pour GitHub et la Gamebuino AKA :
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono pt-1">
                <li>· .github/workflows/release.yml (Compile ESP32-S3 via ESP-IDF & publie Firmware.bin)</li>
                <li>· .github/workflows/ci.yml (Vérification build Web & sources ESP32-S3)</li>
                <li>· firmware_aka_esp32s3/ (Firmware C++17 natif SDK officiel Gamebuino AKA)</li>
                <li>· Krom_Barbarian/config.ini + lang/*.json (Dossier SD Loader AKA + 6 langues)</li>
              </ul>
              <p className="text-xs text-slate-400 pt-2 leading-relaxed">
                Méthode directe : cliquez sur l’icône <strong>GitHub (Exporter vers GitHub)</strong> située dans la barre supérieure d’AI Studio pour pousser instantanément tous ces fichiers et workflows sur votre compte GitHub, puis lancez <strong>Release Gamebuino AKA & PC (On-Demand)</strong> dans l’onglet <em>Actions</em> de votre dépôt.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              Chaque exécution du workflow génère automatiquement la GitHub Release avec l’archive SD <code className="font-mono text-slate-200">Krom_Barbarian_Gamebuino_AKA_SD.zip</code> et l’archive Serveur PC.
            </div>
          </div>

          <div className="p-6 bg-[#151921] border border-slate-800/90 rounded-xl flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>Publication OAuth GitHub Directe</span>
                <span>
                  {ghStatus?.authenticated
                    ? `Connecté : @${ghStatus.username}`
                    : ghStatus?.oauthConfigured
                    ? 'Prêt à connecter'
                    : 'Variables OAuth requises'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                02. Pousser & Lancer la Release depuis l’application
              </h3>

              {!ghStatus?.oauthConfigured ? (
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>
                    Pour utiliser l’envoi OAuth intégré en plus du bouton d’export natif AI Studio, déclarez une OAuth App sur GitHub (<code className="font-mono text-amber-300">github.com/settings/developers</code>) avec l’URL de callback :
                  </p>
                  <p className="p-2.5 bg-[#0C0E12] rounded font-mono text-[11px] text-amber-300 break-all">
                    {ghStatus?.callbackUrl || `${window.location.origin}/auth/github/callback`}
                  </p>
                  <p className="text-slate-400">
                    Puis renseignez <code className="font-mono">GITHUB_CLIENT_ID</code> et <code className="font-mono">GITHUB_CLIENT_SECRET</code> dans les secrets AI Studio.
                  </p>
                </div>
              ) : !ghStatus.authenticated ? (
                <p className="text-sm text-slate-300">
                  Authentifiez votre compte GitHub (permissions <code className="font-mono">repo</code> et <code className="font-mono">workflow</code>) pour créer le dépôt et déclencher la première Release en un clic.
                </p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Nom du dépôt GitHub
                    </label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono bg-[#0C0E12] border border-slate-700 focus:border-amber-500 rounded-lg text-white outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivateRepo}
                      onChange={(e) => setIsPrivateRepo(e.target.checked)}
                    />
                    <span>Créer en dépôt privé</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={triggerReleaseNow}
                      onChange={(e) => setTriggerReleaseNow(e.target.checked)}
                    />
                    <span>Déclencher immédiatement le workflow de Release v1.0.0</span>
                  </label>
                </div>
              )}

              {ghResult?.error && (
                <p className="text-xs text-red-400">{ghResult.error}</p>
              )}

              {ghResult?.ok && (
                <div className="p-3 bg-[#0C0E12] border border-emerald-700/50 rounded-lg space-y-1.5 text-xs">
                  <p className="text-emerald-400 font-semibold">
                    {ghResult.filesPushed} fichiers publiés avec succès !
                    {ghResult.releaseDispatched
                      ? ' Workflow Release lancé !'
                      : ''}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-1">
                    {ghResult.repoUrl && (
                      <a
                        href={ghResult.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-amber-300 hover:underline"
                      >
                        <span>Ouvrir le dépôt GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {ghResult.actionsUrl && (
                      <a
                        href={ghResult.actionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sky-300 hover:underline"
                      >
                        <span>Voir l’exécution GitHub Actions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
              {ghStatus?.oauthConfigured && !ghStatus.authenticated && (
                <button
                  type="button"
                  onClick={handleConnectGithubOAuth}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Se connecter à GitHub
                </button>
              )}
              {ghStatus?.authenticated && (
                <button
                  type="button"
                  disabled={publishingGh || !repoName.trim()}
                  onClick={handlePublishToGithub}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {publishingGh
                    ? 'Publication sur GitHub…'
                    : 'Pousser sur mon GitHub'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stage Picker for WiFi / USB / 2P */}
      {(linkTab === 'wifi' || linkTab === 'usb') && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 mr-1">
              Décor de l’Arène 320×240 :
            </span>
            {STAGE_OPTIONS.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  onSelectStage(st.id);
                  if (wifi.roomCode) wifi.changeStage(st.id);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedStage === st.id
                    ? 'bg-slate-800 text-amber-300 border-amber-500/60'
                    : 'bg-[#151921] text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onLaunchLocal2P}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-[#151921] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Duel 2 Joueurs sur ce Clavier</span>
          </button>
        </div>
      )}

      {/* TAB 1: WIFI WEBSOCKET */}
      {linkTab === 'wifi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="p-6 bg-[#151921] border border-slate-800/90 rounded-xl flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 tabular-nums">
                <span>
                  Serveur WebSocket :{' '}
                  <strong className={wifi.connected ? 'text-emerald-400' : 'text-red-400'}>
                    {wifi.connected ? 'Actif (/ws)' : 'Reconnexion…'}
                  </strong>
                </span>
                {wifi.latencyMs !== null && <span>Latence : {wifi.latencyMs} ms</span>}
              </div>

              <h3 className="text-xl font-bold text-white">
                01. Héberger le Duel sur le PC (Joueur 1 · Krom)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Générez un code de salon pour relier votre PC et votre Gamebuino AKA en WiFi local (320×240 synchronisé à 60 Hz).
              </p>

              {wifi.roomCode && wifi.role === 'pc' && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <p className="text-xs text-slate-400">Code du Salon Actif</p>
                  <p className="text-3xl font-bold font-mono tracking-widest text-amber-400 tabular-nums">
                    {wifi.roomCode}
                  </p>
                  <p className="text-xs text-slate-300">
                    PC : <strong className="text-emerald-400">Prêt</strong> · Gamebuino AKA :{' '}
                    <strong className={wifi.hasAka ? 'text-emerald-400' : 'text-amber-300'}>
                      {wifi.hasAka ? 'Connectée !' : 'En attente…'}
                    </strong>
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                disabled={!wifi.connected}
                onClick={() => wifi.createRoom(selectedStage)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {wifi.roomCode && wifi.role === 'pc'
                  ? 'Nouveau Code Salon'
                  : 'Créer un Salon sur ce PC'}
              </button>

              {wifi.roomCode && wifi.role === 'pc' && (
                <button
                  type="button"
                  onClick={() => onLaunchWifiArena('pc')}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Entrer dans l’Arène (PC)
                </button>
              )}
            </div>
          </div>

          <div className="p-6 bg-[#151921] border border-slate-800/90 rounded-xl flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>Client Sans Fil · Rôle Console AKA (Joueur 2)</span>
                <button
                  type="button"
                  onClick={() => wifi.refreshOpenRooms()}
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Actualiser</span>
                </button>
              </div>

              <h3 className="text-xl font-bold text-white">
                02. Rejoindre depuis une AKA ou un Second Poste
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Entrez le code du salon depuis votre console AKA en WiFi ou testez la liaison depuis une seconde fenêtre simulée.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="Code ex. KRO4"
                  className="w-40 px-3 py-2 text-sm font-mono uppercase bg-[#0C0E12] border border-slate-700 focus:border-amber-500 rounded-lg text-white outline-none"
                />
                <button
                  type="button"
                  disabled={!wifi.connected || !joinCodeInput.trim()}
                  onClick={() => {
                    wifi.joinRoom(joinCodeInput, 'aka');
                    onLaunchWifiArena('aka');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Rejoindre comme AKA
                </button>
              </div>

              {wifi.openRooms.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <p className="text-xs text-slate-400">Salons ouverts :</p>
                  <div className="flex flex-wrap gap-2">
                    {wifi.openRooms.map((r) => (
                      <button
                        key={r.roomCode}
                        type="button"
                        onClick={() => {
                          wifi.joinRoom(r.roomCode, 'aka');
                          onLaunchWifiArena('aka');
                        }}
                        className="px-3 py-1.5 text-xs font-mono text-amber-300 bg-[#0C0E12] hover:bg-slate-900 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Rejoindre {r.roomCode}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
              Endpoint WebSocket : ws://{wifi.lanHostHint}/ws
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USB CABLE WEBSERIAL */}
      {linkTab === 'usb' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="p-6 bg-[#151921] border border-slate-800/90 rounded-xl flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs text-slate-400 tabular-nums">
                WebSerial 115200 bauds · Masque 11 bits (Joy/DPad + A/B/C/D + L1/R1 + RUN)
              </p>
              <h3 className="text-xl font-bold text-white">
                Liaison Câble USB Directe PC ↔ Gamebuino AKA
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Branchez la Gamebuino AKA par câble USB avec le programme <code className="font-mono text-amber-300">/Krom_Barbarian/Firmware</code> actif pour affronter le joueur PC sans aucune latence réseau.
              </p>

              {usb.errorMessage && (
                <p className="text-xs text-amber-300 pt-2">Note : {usb.errorMessage}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
              {!usb.connected ? (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await usb.connectUsbAka();
                    if (ok) onLaunchUsbArena();
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Connecter la Gamebuino AKA en USB
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onLaunchUsbArena}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Lancer le Duel USB
                  </button>
                  <button
                    type="button"
                    onClick={() => usb.disconnectUsbAka()}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Débrancher le port
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 bg-[#151921] border border-slate-800/90 rounded-xl flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between text-xs text-slate-400 tabular-nums">
              <span>Moniteur Série USB Gamebuino AKA</span>
              <span>Paquets reçus : {usb.packetsReceived}</span>
            </div>

            <div className="h-44 overflow-y-auto p-3 bg-[#0C0E12] rounded-lg font-mono text-xs text-slate-300 space-y-1">
              {usb.serialLog.length === 0 ? (
                <p className="text-slate-500">
                  En attente d’ouverture du port USB (115200 bauds)…
                </p>
              ) : (
                usb.serialLog.map((line, i) => <div key={i}>{line}</div>)
              )}
            </div>

            <p className="text-xs text-slate-400">
              Le bouton MENU de la console met localement l’AKA en pause et permet de retourner à tout moment au Bootloader SD.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: /Krom_Barbarian/Firmware SOURCE */}
      {linkTab === 'firmware' && (
        <div className="p-6 bg-[#151921] border border-slate-800/90 rounded-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Répertoire Carte SD : /Krom_Barbarian/Firmware/Firmware.ino
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Programme C++ nommé <code className="font-mono text-amber-300">Firmware</code> pour Gamebuino AKA (320×240 non-tactile, Joystick, D-Pad, A/B/C/D, L1/R1, MENU, RUN, Bootloader et 6 langues).
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopySketch}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Code copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier Firmware.ino</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadIno}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger Firmware.ino</span>
              </button>
            </div>
          </div>

          <pre className="max-h-96 overflow-auto p-4 bg-[#0C0E12] rounded-lg text-xs font-mono text-slate-300 leading-relaxed">
            <code>{sketchSource}</code>
          </pre>
        </div>
      )}
    </section>
  );
};
