import crypto from 'crypto';
import express from 'express';
import fs from 'fs/promises';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import {
  createInitialMatch,
  EMPTY_INPUT,
  resetForNextRound,
  stepMatch,
} from './src/game/combatEngine.ts';
import type {
  FighterAction,
  InputState,
  MatchState,
  MultiplayerRoomSummary,
  StageId,
} from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RoomSession {
  roomCode: string;
  stage: StageId;
  createdAt: number;
  pcSocket: WebSocket | null;
  akaSocket: WebSocket | null;
  p1Input: InputState;
  p2Input: InputState;
  match: MatchState;
  roundCooldown: number;
}

const rooms = new Map<string, RoomSession>();

// In-memory encrypted session map for 3P GitHub OAuth publishing
const githubSessions = new Map<string, { token: string; login: string }>();

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = decodeURIComponent(part.slice(idx + 1).trim());
      out[k] = v;
    }
  }
  return out;
}

function getAppBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = req.headers.host || 'localhost:3000';
  return `${proto}://${host}`;
}

async function collectRepositoryFiles(
  dirPath: string,
  relPrefix = ''
): Promise<{ path: string; contentBase64: string }[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const ignored = new Set([
    'node_modules',
    'dist',
    'build',
    '.git',
    '.aistudio',
    '.env',
    '.DS_Store',
    'release_out',
    'managed_components',
  ]);
  const files: { path: string; contentBase64: string }[] = [];

  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const abs = path.join(dirPath, entry.name);
    const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      const sub = await collectRepositoryFiles(abs, rel);
      files.push(...sub);
    } else if (entry.isFile()) {
      const buf = await fs.readFile(abs);
      files.push({
        path: rel,
        contentBase64: buf.toString('base64'),
      });
    }
  }
  return files;
}

function actionToCompactCode(act: FighterAction): number {
  if (
    act === 'slash_high' ||
    act === 'thrust_mid' ||
    act === 'sweep_low' ||
    act === 'cleave_overhead' ||
    act === 'spin_decap'
  ) {
    return 1;
  }
  if (act === 'block_high') return 2;
  if (act === 'decapitated') return 9;
  return 0;
}

function buildCompactAkaLine(m: MatchState): string {
  return `S:${Math.round(m.p1.x)},${Math.round(m.p1.y)},${Math.round(
    m.p1.hp
  )},${actionToCompactCode(m.p1.action)},${Math.round(m.p2.x)},${Math.round(
    m.p2.y
  )},${Math.round(m.p2.hp)},${actionToCompactCode(m.p2.action)},${
    m.wasDecapitation ? 1 : 0
  }`;
}

function decodeButtonMask(mask: number): InputState {
  return {
    left: Boolean(mask & (1 << 0)),
    right: Boolean(mask & (1 << 1)),
    up: Boolean(mask & (1 << 2)),
    down: Boolean(mask & (1 << 3)),
    joyX: 0,
    joyY: 0,
    btnA: Boolean(mask & (1 << 4)),
    btnB: Boolean(mask & (1 << 5)),
    btnC: Boolean(mask & (1 << 6)),
    btnD: Boolean(mask & (1 << 7)),
    btnL1: Boolean(mask & (1 << 8)),
    btnR1: Boolean(mask & (1 << 9)),
    btnRun: Boolean(mask & (1 << 10)),
    btnMenu: false,
  };
}

function sanitizeInput(inp: Partial<InputState>): InputState {
  return {
    left: Boolean(inp.left),
    right: Boolean(inp.right),
    up: Boolean(inp.up),
    down: Boolean(inp.down),
    joyX: typeof inp.joyX === 'number' ? Math.max(-1, Math.min(1, inp.joyX)) : 0,
    joyY: typeof inp.joyY === 'number' ? Math.max(-1, Math.min(1, inp.joyY)) : 0,
    btnA: Boolean(inp.btnA),
    btnB: Boolean(inp.btnB),
    btnC: Boolean(inp.btnC),
    btnD: Boolean(inp.btnD),
    btnL1: Boolean(inp.btnL1),
    btnR1: Boolean(inp.btnR1),
    btnMenu: Boolean(inp.btnMenu),
    btnRun: Boolean(inp.btnRun),
  };
}

function generateRoomCode(): string {
  const words = ['KROM', 'DRAX', 'NORD', 'RUNE', 'AKA1', 'LAME'];
  const base = words[Math.floor(Math.random() * words.length)].slice(0, 3);
  const digit = Math.floor(Math.random() * 9) + 1;
  const candidate = `${base}${digit}`;
  if (!rooms.has(candidate)) return candidate;
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function createRoomSession(roomCode: string, stage: StageId = 'arena'): RoomSession {
  return {
    roomCode,
    stage,
    createdAt: Date.now(),
    pcSocket: null,
    akaSocket: null,
    p1Input: { ...EMPTY_INPUT },
    p2Input: { ...EMPTY_INPUT },
    match: createInitialMatch({
      stage,
      mode: 'wifi_multi',
      p1Name: 'KROM PC',
      p2Name: 'RIVAL AKA',
      p2Skin: 'rival_aka',
      p1MaxHp: 115,
      p2MaxHp: 115,
    }),
    roundCooldown: 0,
  };
}

function broadcastRoom(room: RoomSession, payload: unknown): void {
  const raw = JSON.stringify(payload);
  if (room.pcSocket && room.pcSocket.readyState === WebSocket.OPEN) {
    room.pcSocket.send(raw);
  }
  if (room.akaSocket && room.akaSocket.readyState === WebSocket.OPEN) {
    room.akaSocket.send(raw);
  }
}

function getPresencePayload(room: RoomSession) {
  return {
    type: 'room:presence',
    roomCode: room.roomCode,
    stage: room.stage,
    hasPc: Boolean(room.pcSocket && room.pcSocket.readyState === WebSocket.OPEN),
    hasAka: Boolean(room.akaSocket && room.akaSocket.readyState === WebSocket.OPEN),
  };
}

function getLocalLanAddresses(): string[] {
  const nets = os.networkInterfaces();
  const list: string[] = [];
  for (const name of Object.keys(nets)) {
    const entries = nets[name] ?? [];
    for (const net of entries) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254.')) {
        list.push(net.address);
      }
    }
  }
  return list;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  app.get('/api/rooms', (_req, res) => {
    const summaries: MultiplayerRoomSummary[] = [];
    for (const room of rooms.values()) {
      const hasPc = Boolean(room.pcSocket && room.pcSocket.readyState === WebSocket.OPEN);
      const hasAka = Boolean(room.akaSocket && room.akaSocket.readyState === WebSocket.OPEN);
      if (hasPc || hasAka) {
        summaries.push({
          roomCode: room.roomCode,
          stage: room.stage,
          hasPc,
          hasAka,
          createdAt: room.createdAt,
        });
      }
    }
    res.json({ rooms: summaries });
  });

  app.get('/api/network-info', (req, res) => {
    const lanIps = getLocalLanAddresses();
    const hostHeader = req.headers.host || 'localhost:3000';
    res.json({
      host: hostHeader,
      lanIps,
      appUrl: process.env.APP_URL || '',
    });
  });

  // =========================================================================
  // 3P GitHub OAuth Integration (Popup Flow + Repo Push + On-Demand Release)
  // =========================================================================
  app.get('/api/github/status', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const sid = cookies.gh_sid;
    const session = sid ? githubSessions.get(sid) : undefined;
    const oauthConfigured = Boolean(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    );
    res.json({
      oauthConfigured,
      authenticated: Boolean(session),
      username: session?.login || null,
      callbackUrl: `${getAppBaseUrl(req)}/auth/github/callback`,
    });
  });

  app.get('/api/github/auth-url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      res.status(400).json({
        error: 'GITHUB_CLIENT_ID non configuré dans les variables d’environnement.',
      });
      return;
    }
    const redirectUri = `${getAppBaseUrl(req)}/auth/github/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo workflow',
    });
    res.json({
      url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    });
  });

  const githubCallbackHandler = async (req: express.Request, res: express.Response) => {
    const code = String(req.query.code || '');
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code || !clientId || !clientSecret) {
      res.status(400).send('Paramètres OAuth GitHub manquants.');
      return;
    }

    try {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });
      const tokenData = (await tokenRes.json()) as { access_token?: string };
      if (!tokenData.access_token) {
        res.status(400).send('Échec de l’échange du jeton GitHub.');
        return;
      }

      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Krom-Gamebuino-AKA-Publisher',
        },
      });
      const userData = (await userRes.json()) as { login?: string };

      const sid = crypto.randomBytes(24).toString('hex');
      githubSessions.set(sid, {
        token: tokenData.access_token,
        login: userData.login || 'github-user',
      });

      res.cookie('gh_sid', sid, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 12,
      });

      res.send(`<!doctype html>
<html>
  <body style="background:#0c0e12;color:#f1f5f9;font-family:sans-serif;padding:24px;">
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
        window.close();
      } else {
        window.location.href = '/';
      }
    </script>
    <p>Authentification GitHub réussie. Cette fenêtre va se fermer automatiquement.</p>
  </body>
</html>`);
    } catch {
      res.status(500).send('Erreur lors de la connexion OAuth GitHub.');
    }
  };

  app.get(['/auth/github/callback', '/auth/github/callback/'], githubCallbackHandler);

  app.post('/api/github/publish', async (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const session = cookies.gh_sid ? githubSessions.get(cookies.gh_sid) : undefined;
    if (!session) {
      res.status(401).json({ error: 'Non connecté à GitHub.' });
      return;
    }

    const repoName = String(req.body?.repoName || 'krom-barbarian-gamebuino-aka')
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '-');
    const isPrivate = Boolean(req.body?.isPrivate);
    const triggerReleaseNow = Boolean(req.body?.triggerReleaseNow);
    const ghHeaders = {
      Authorization: `Bearer ${session.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Krom-Gamebuino-AKA-Publisher',
    };

    try {
      // 1. Check if repo exists or create it with auto_init so main branch exists
      const checkRes = await fetch(
        `https://api.github.com/repos/${session.login}/${repoName}`,
        { headers: ghHeaders }
      );
      if (checkRes.status === 404) {
        const createRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: ghHeaders,
          body: JSON.stringify({
            name: repoName,
            description:
              "Krom : Le Glaive d'Acier — Jeu style Barbarian pour Gamebuino AKA (320x240) & PC avec multijoueur WiFi/USB",
            private: isPrivate,
            auto_init: true,
          }),
        });
        if (!createRes.ok) {
          const errTxt = await createRes.text();
          res.status(400).json({ error: `Création du dépôt refusée : ${errTxt}` });
          return;
        }
        // Brief pause for GitHub initial commit initialization
        await new Promise((r) => setTimeout(r, 1200));
      }

      // 2. Get latest commit on default branch
      const repoInfoRes = await fetch(
        `https://api.github.com/repos/${session.login}/${repoName}`,
        { headers: ghHeaders }
      );
      const repoInfo = (await repoInfoRes.json()) as {
        default_branch?: string;
        html_url?: string;
      };
      const branch = repoInfo.default_branch || 'main';

      const refRes = await fetch(
        `https://api.github.com/repos/${session.login}/${repoName}/git/ref/heads/${branch}`,
        { headers: ghHeaders }
      );
      const refData = (await refRes.json()) as { object?: { sha?: string } };
      const parentCommitSha = refData.object?.sha;
      if (!parentCommitSha) {
        res.status(400).json({ error: 'Impossible de lire la branche principale du dépôt.' });
        return;
      }

      // 3. Upload all workspace files (including .github/workflows/release.yml and Krom_Barbarian/Firmware/Firmware.ino) as Git Blobs
      const files = await collectRepositoryFiles(__dirname);
      const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];

      for (const f of files) {
        const blobRes = await fetch(
          `https://api.github.com/repos/${session.login}/${repoName}/git/blobs`,
          {
            method: 'POST',
            headers: ghHeaders,
            body: JSON.stringify({
              content: f.contentBase64,
              encoding: 'base64',
            }),
          }
        );
        const blobJson = (await blobRes.json()) as { sha?: string };
        if (blobJson.sha) {
          treeItems.push({
            path: f.path,
            mode: '100644',
            type: 'blob',
            sha: blobJson.sha,
          });
        }
      }

      // 4. Create Git Tree, Commit & Update Ref
      const treeRes = await fetch(
        `https://api.github.com/repos/${session.login}/${repoName}/git/trees`,
        {
          method: 'POST',
          headers: ghHeaders,
          body: JSON.stringify({ tree: treeItems }),
        }
      );
      const treeJson = (await treeRes.json()) as { sha?: string };

      const commitRes = await fetch(
        `https://api.github.com/repos/${session.login}/${repoName}/git/commits`,
        {
          method: 'POST',
          headers: ghHeaders,
          body: JSON.stringify({
            message:
              'feat: Krom Gamebuino AKA (320x240) + Firmware + workflow release on-demand',
            tree: treeJson.sha,
            parents: [parentCommitSha],
          }),
        }
      );
      const commitJson = (await commitRes.json()) as { sha?: string };

      await fetch(
        `https://api.github.com/repos/${session.login}/${repoName}/git/refs/heads/${branch}`,
        {
          method: 'PATCH',
          headers: ghHeaders,
          body: JSON.stringify({ sha: commitJson.sha, force: true }),
        }
      );

      // 5. Optionally trigger on-demand workflow_dispatch release right away!
      let releaseDispatched = false;
      if (triggerReleaseNow) {
        await new Promise((r) => setTimeout(r, 1000));
        const dispRes = await fetch(
          `https://api.github.com/repos/${session.login}/${repoName}/actions/workflows/release.yml/dispatches`,
          {
            method: 'POST',
            headers: ghHeaders,
            body: JSON.stringify({
              ref: branch,
              inputs: {
                version: 'v1.0.0',
                release_title: "Krom : Le Glaive d'Acier — Gamebuino AKA v1.0.0",
                prerelease: false,
              },
            }),
          }
        );
        releaseDispatched = dispRes.ok;
      }

      res.json({
        ok: true,
        repoUrl: repoInfo.html_url || `https://github.com/${session.login}/${repoName}`,
        actionsUrl: `https://github.com/${session.login}/${repoName}/actions`,
        filesPushed: treeItems.length,
        releaseDispatched,
      });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Erreur lors du push GitHub.',
      });
    }
  });

  // WebSocket Multiplayer Handler (320x240 PC <-> Gamebuino AKA)
  wss.on('connection', (ws) => {
    let joinedRoomCode: string | null = null;
    let joinedRole: 'pc' | 'aka' | null = null;

    ws.on('message', (rawBuf) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(rawBuf.toString());
      } catch {
        return;
      }

      const type = String(msg.type || '');

      if (type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', ts: msg.ts }));
        return;
      }

      if (type === 'room:create') {
        const stage = (msg.stage as StageId) || 'arena';
        const code = generateRoomCode();
        const session = createRoomSession(code, stage);
        session.pcSocket = ws;
        rooms.set(code, session);
        joinedRoomCode = code;
        joinedRole = 'pc';

        ws.send(
          JSON.stringify({
            type: 'room:joined',
            roomCode: code,
            role: 'pc',
            stage: session.stage,
            match: session.match,
          })
        );
        broadcastRoom(session, getPresencePayload(session));
        return;
      }

      if (type === 'room:join') {
        const code = String(msg.roomCode || '')
          .trim()
          .toUpperCase()
          .slice(0, 6);
        if (!code) return;

        let session = rooms.get(code);
        if (!session) {
          session = createRoomSession(code, 'arena');
          rooms.set(code, session);
        }

        const requestedRole = msg.role === 'pc' ? 'pc' : 'aka';
        joinedRoomCode = code;
        joinedRole = requestedRole;

        if (requestedRole === 'pc') {
          session.pcSocket = ws;
        } else {
          session.akaSocket = ws;
        }

        if (session.pcSocket && session.akaSocket) {
          session.match = createInitialMatch({
            stage: session.stage,
            mode: 'wifi_multi',
            p1Name: 'KROM PC',
            p2Name: 'RIVAL AKA',
            p2Skin: 'rival_aka',
            p1MaxHp: 115,
            p2MaxHp: 115,
          });
        }

        ws.send(
          JSON.stringify({
            type: 'room:joined',
            roomCode: code,
            role: requestedRole,
            stage: session.stage,
            match: session.match,
          })
        );
        broadcastRoom(session, getPresencePayload(session));
        return;
      }

      const activeCode = String(msg.roomCode || joinedRoomCode || '').toUpperCase();
      const session = rooms.get(activeCode);
      if (!session) return;

      if (type === 'input:update' && msg.input) {
        const cleanInput = sanitizeInput(msg.input as Partial<InputState>);
        if (joinedRole === 'pc') {
          session.p1Input = cleanInput;
        } else {
          session.p2Input = cleanInput;
        }
        return;
      }

      if (type === 'aka:mask') {
        const mask = Number(msg.mask || 0);
        session.p2Input = decodeButtonMask(mask);
        return;
      }

      if (type === 'stage:change') {
        const nextStage = (msg.stage as StageId) || 'arena';
        session.stage = nextStage;
        session.match = createInitialMatch({
          stage: nextStage,
          mode: 'wifi_multi',
          p1Name: 'KROM PC',
          p2Name: 'RIVAL AKA',
          p2Skin: 'rival_aka',
          p1MaxHp: 115,
          p2MaxHp: 115,
        });
        broadcastRoom(session, {
          type: 'room:state',
          roomCode: session.roomCode,
          match: session.match,
          akaLine: buildCompactAkaLine(session.match),
        });
        return;
      }

      if (type === 'match:rematch') {
        session.match = createInitialMatch({
          stage: session.stage,
          mode: 'wifi_multi',
          p1Name: 'KROM PC',
          p2Name: 'RIVAL AKA',
          p2Skin: 'rival_aka',
          p1MaxHp: 115,
          p2MaxHp: 115,
        });
        session.roundCooldown = 0;
        broadcastRoom(session, {
          type: 'room:state',
          roomCode: session.roomCode,
          match: session.match,
          akaLine: buildCompactAkaLine(session.match),
        });
      }
    });

    ws.on('close', () => {
      if (!joinedRoomCode) return;
      const session = rooms.get(joinedRoomCode);
      if (!session) return;
      if (session.pcSocket === ws) {
        session.pcSocket = null;
        session.p1Input = { ...EMPTY_INPUT };
      }
      if (session.akaSocket === ws) {
        session.akaSocket = null;
        session.p2Input = { ...EMPTY_INPUT };
      }
      const stillActive =
        (session.pcSocket && session.pcSocket.readyState === WebSocket.OPEN) ||
        (session.akaSocket && session.akaSocket.readyState === WebSocket.OPEN);
      if (!stillActive) {
        rooms.delete(joinedRoomCode);
      } else {
        broadcastRoom(session, getPresencePayload(session));
      }
    });
  });

  setInterval(() => {
    for (const session of rooms.values()) {
      const hasPc = Boolean(session.pcSocket && session.pcSocket.readyState === WebSocket.OPEN);
      const hasAka = Boolean(session.akaSocket && session.akaSocket.readyState === WebSocket.OPEN);
      if (!hasPc && !hasAka) continue;

      stepMatch(session.match, session.p1Input, session.p2Input, 'whirlwind_edge');
      stepMatch(session.match, session.p1Input, session.p2Input, 'whirlwind_edge');

      if (session.match.roundOver && !session.match.matchOver) {
        session.roundCooldown += 1;
        if (session.roundCooldown > 75) {
          session.roundCooldown = 0;
          resetForNextRound(session.match);
        }
      } else {
        session.roundCooldown = 0;
      }

      broadcastRoom(session, {
        type: 'room:state',
        roomCode: session.roomCode,
        match: session.match,
        akaLine: buildCompactAkaLine(session.match),
      });
    }
  }, 33);

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur Krom Gamebuino AKA (320x240) prêt sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
