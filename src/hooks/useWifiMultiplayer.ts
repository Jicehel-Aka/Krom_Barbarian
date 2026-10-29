import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY_INPUT } from '../game/combatEngine';
import type {
  InputState,
  MatchState,
  MultiplayerRoomSummary,
  StageId,
} from '../types/game';

export interface WifiMultiplayerController {
  connected: boolean;
  roomCode: string;
  role: 'pc' | 'aka' | null;
  hasPc: boolean;
  hasAka: boolean;
  latencyMs: number | null;
  remoteMatch: MatchState | null;
  openRooms: MultiplayerRoomSummary[];
  lanHostHint: string;
  createRoom: (stage: StageId) => void;
  joinRoom: (code: string, role: 'pc' | 'aka') => void;
  leaveRoom: () => void;
  sendInput: (input: InputState) => void;
  changeStage: (stage: StageId) => void;
  requestRematch: () => void;
  refreshOpenRooms: () => Promise<void>;
}

export function useWifiMultiplayer(): WifiMultiplayerController {
  const wsRef = useRef<WebSocket | null>(null);
  const lastSentInputKeyRef = useRef<string>('');
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [role, setRole] = useState<'pc' | 'aka' | null>(null);
  const [hasPc, setHasPc] = useState(false);
  const [hasAka, setHasAka] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [remoteMatch, setRemoteMatch] = useState<MatchState | null>(null);
  const [openRooms, setOpenRooms] = useState<MultiplayerRoomSummary[]>([]);
  const [lanHostHint, setLanHostHint] = useState<string>(
    typeof window !== 'undefined' ? window.location.host : 'localhost:3000'
  );

  const refreshOpenRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setOpenRooms(Array.isArray(data.rooms) ? data.rooms : []);
      }
    } catch {
      // Ignore transient errors
    }
  }, []);

  useEffect(() => {
    fetch('/api/network-info')
      .then((r) => (r.ok ? r.json() : null))
      .then((info) => {
        if (info) {
          if (Array.isArray(info.lanIps) && info.lanIps.length > 0) {
            setLanHostHint(`${info.lanIps[0]}:3000`);
          } else if (info.host) {
            setLanHostHint(info.host);
          }
        }
      })
      .catch(() => {});
    refreshOpenRooms();
  }, [refreshOpenRooms]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let unmounted = false;
    let reconnectTimer: number | undefined;
    let pingTimer: number | undefined;

    const connectSocket = () => {
      if (unmounted) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (unmounted) return;
        setConnected(true);
        pingTimer = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
          }
        }, 3000);
      };

      socket.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'pong' && typeof msg.ts === 'number') {
            setLatencyMs(Math.max(1, Date.now() - msg.ts));
          } else if (msg.type === 'room:joined') {
            setRoomCode(msg.roomCode);
            setRole(msg.role);
            if (msg.match) setRemoteMatch(msg.match);
          } else if (msg.type === 'room:presence') {
            setHasPc(Boolean(msg.hasPc));
            setHasAka(Boolean(msg.hasAka));
          } else if (msg.type === 'room:state' && msg.match) {
            setRemoteMatch(msg.match);
          }
        } catch {
          // Ignore malformed packet
        }
      };

      socket.onclose = () => {
        if (pingTimer) window.clearInterval(pingTimer);
        if (unmounted) return;
        setConnected(false);
        reconnectTimer = window.setTimeout(connectSocket, 2000);
      };
    };

    connectSocket();

    return () => {
      unmounted = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (pingTimer) window.clearInterval(pingTimer);
      wsRef.current?.close();
    };
  }, []);

  const createRoom = useCallback((stage: StageId) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    lastSentInputKeyRef.current = '';
    ws.send(JSON.stringify({ type: 'room:create', stage }));
  }, []);

  const joinRoom = useCallback((code: string, targetRole: 'pc' | 'aka') => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    lastSentInputKeyRef.current = '';
    ws.send(JSON.stringify({ type: 'room:join', roomCode: clean, role: targetRole }));
  }, []);

  const leaveRoom = useCallback(() => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && roomCode) {
      ws.send(JSON.stringify({ type: 'input:update', roomCode, input: EMPTY_INPUT }));
    }
    setRoomCode('');
    setRole(null);
    setHasPc(false);
    setHasAka(false);
    setRemoteMatch(null);
  }, [roomCode]);

  const sendInput = useCallback(
    (input: InputState) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !roomCode) return;
      const jx = Math.round(input.joyX * 10);
      const jy = Math.round(input.joyY * 10);
      const key = `${input.left ? 1 : 0}${input.right ? 1 : 0}${input.up ? 1 : 0}${
        input.down ? 1 : 0
      }|${jx},${jy}|${input.btnA ? 1 : 0}${input.btnB ? 1 : 0}${input.btnC ? 1 : 0}${
        input.btnD ? 1 : 0
      }${input.btnL1 ? 1 : 0}${input.btnR1 ? 1 : 0}${input.btnRun ? 1 : 0}`;
      if (key === lastSentInputKeyRef.current) return;
      lastSentInputKeyRef.current = key;
      ws.send(JSON.stringify({ type: 'input:update', roomCode, input }));
    },
    [roomCode]
  );

  const changeStage = useCallback(
    (stage: StageId) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !roomCode) return;
      ws.send(JSON.stringify({ type: 'stage:change', roomCode, stage }));
    },
    [roomCode]
  );

  const requestRematch = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !roomCode) return;
    ws.send(JSON.stringify({ type: 'match:rematch', roomCode }));
  }, [roomCode]);

  return {
    connected,
    roomCode,
    role,
    hasPc,
    hasAka,
    latencyMs,
    remoteMatch,
    openRooms,
    lanHostHint,
    createRoom,
    joinRoom,
    leaveRoom,
    sendInput,
    changeStage,
    requestRematch,
    refreshOpenRooms,
  };
}
