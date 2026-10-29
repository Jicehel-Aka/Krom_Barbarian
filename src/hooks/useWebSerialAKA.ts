import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY_INPUT } from '../game/combatEngine';
import type { FighterAction, InputState, MatchState } from '../types/game';

interface WebSerialPort {
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  readable?: ReadableStream<Uint8Array>;
  writable?: WritableStream<Uint8Array>;
}

interface NavigatorWithSerial extends Navigator {
  serial?: {
    requestPort: () => Promise<WebSerialPort>;
  };
}

function actionToCode(act: FighterAction): number {
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

export interface WebSerialAKAController {
  supported: boolean;
  connected: boolean;
  errorMessage: string | null;
  akaInputRef: React.MutableRefObject<InputState>;
  serialLog: string[];
  packetsReceived: number;
  connectUsbAka: () => Promise<boolean>;
  disconnectUsbAka: () => Promise<void>;
  pushArenaStateToUsb: (match: MatchState) => void;
}

export function useWebSerialAKA(): WebSerialAKAController {
  const supported =
    typeof navigator !== 'undefined' &&
    Boolean((navigator as NavigatorWithSerial).serial);

  const [connected, setConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serialLog, setSerialLog] = useState<string[]>([]);
  const [packetsReceived, setPacketsReceived] = useState(0);

  const portRef = useRef<WebSerialPort | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const readerCancelRef = useRef<boolean>(false);
  const akaInputRef = useRef<InputState>({ ...EMPTY_INPUT });
  const lastTxTickRef = useRef<number>(0);

  const appendLog = useCallback((line: string) => {
    setSerialLog((prev) => [...prev.slice(-11), line]);
  }, []);

  const parseIncomingLine = useCallback(
    (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('BTN:')) {
        const mask = parseInt(trimmed.slice(4), 10);
        if (!Number.isNaN(mask)) {
          akaInputRef.current = {
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
          setPacketsReceived((c) => c + 1);
          appendLog(`AKA → PC : ${trimmed}`);
        }
      } else {
        appendLog(`AKA : ${trimmed.slice(0, 56)}`);
      }
    },
    [appendLog]
  );

  const connectUsbAka = useCallback(async (): Promise<boolean> => {
    setErrorMessage(null);
    const nav = navigator as NavigatorWithSerial;
    if (!nav.serial) {
      setErrorMessage(
        'WebSerial nécessite Chrome ou Edge sur ordinateur, ou utilisez le Mode WiFi local.'
      );
      return false;
    }

    try {
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      readerCancelRef.current = false;

      if (port.writable) {
        writerRef.current = port.writable.getWriter();
      }

      setConnected(true);
      appendLog('Port USB Gamebuino AKA (320x240) ouvert à 115200 bauds.');

      if (port.readable) {
        const reader = port.readable.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        (async () => {
          try {
            while (!readerCancelRef.current) {
              const { value, done } = await reader.read();
              if (done) break;
              if (value) {
                buffer += decoder.decode(value, { stream: true });
                let newlineIdx = buffer.indexOf('\n');
                while (newlineIdx !== -1) {
                  const singleLine = buffer.slice(0, newlineIdx);
                  buffer = buffer.slice(newlineIdx + 1);
                  parseIncomingLine(singleLine);
                  newlineIdx = buffer.indexOf('\n');
                }
              }
            }
          } catch {
            // Disconnected
          } finally {
            reader.releaseLock();
            setConnected(false);
          }
        })();
      }

      return true;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Impossible d’ouvrir le port série USB.';
      setErrorMessage(
        msg.includes('permissions policy') || msg.includes('SecurityError')
          ? 'L’accès USB direct est restreint dans un aperçu intégré : ouvrez l’application dans un onglet complet ou utilisez le Mode WiFi WebSocket.'
          : `Connexion USB annulée ou interrompue (${msg}).`
      );
      return false;
    }
  }, [appendLog, parseIncomingLine]);

  const disconnectUsbAka = useCallback(async () => {
    readerCancelRef.current = true;
    akaInputRef.current = { ...EMPTY_INPUT };
    try {
      if (writerRef.current) {
        writerRef.current.releaseLock();
        writerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch {
      // Ignore close error
    }
    setConnected(false);
    appendLog('Câble USB Gamebuino AKA déconnecté.');
  }, [appendLog]);

  const pushArenaStateToUsb = useCallback((m: MatchState) => {
    if (!writerRef.current || m.tick - lastTxTickRef.current < 3) return;
    lastTxTickRef.current = m.tick;

    const frame = `S:${Math.round(m.p1.x)},${Math.round(m.p1.y)},${Math.round(
      m.p1.hp
    )},${actionToCode(m.p1.action)},${Math.round(m.p2.x)},${Math.round(
      m.p2.y
    )},${Math.round(m.p2.hp)},${actionToCode(m.p2.action)},${
      m.wasDecapitation ? 1 : 0
    }\n`;

    const bytes = new TextEncoder().encode(frame);
    writerRef.current.write(bytes).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      readerCancelRef.current = true;
    };
  }, []);

  return {
    supported,
    connected,
    errorMessage,
    akaInputRef,
    serialLog,
    packetsReceived,
    connectUsbAka,
    disconnectUsbAka,
    pushArenaStateToUsb,
  };
}
