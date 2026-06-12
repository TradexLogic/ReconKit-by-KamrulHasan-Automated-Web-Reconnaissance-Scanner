import { useEffect, useRef } from 'react';
import { ActiveView, ScanData } from '../App';

type Props = {
  setScanData: (d: ScanData | ((prev: ScanData | null) => ScanData | null)) => void;
  setActiveView: (v: ActiveView) => void;
  isScanning: boolean;
  setIsScanning: (v: boolean) => void;
  scanLogs: string[];
  setScanLogs: (logs: string[] | ((prev: string[]) => string[])) => void;
  currentScanId: number | null;
  setCurrentScanId: (id: number | null) => void;
  updateLiveResult: (data_type: string, data: any) => void;
};

export default function ScanPanel({
  setScanData, setActiveView,
  isScanning, setIsScanning,
  scanLogs, setScanLogs,
  currentScanId, setCurrentScanId,
  updateLiveResult,
}: Props) {
  const logRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const domainRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [scanLogs]);

  const addLog = (msg: string) => {
    setScanLogs((prev: string[]) => [...prev, msg]);
  };

  const connectWebSocket = (sid: number) => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        if (msg.type === 'log') {
          addLog(msg.message);
        } else if (msg.type === 'data') {
          // Live data update
          updateLiveResult(msg.data_type, msg.data);
        } else if (msg.type === 'done') {
          addLog('[✓] Scan complete!');
          setIsScanning(false);
          fetchResults(sid);
        }
      } catch {}
    };

    ws.onerror = () => addLog('[!] WebSocket error');
  };

  const fetchResults = async (sid: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/scan/${sid}`);
      const data = await res.json();
      setScanData(data);
    } catch {
      addLog('[!] Failed to fetch results');
    }
  };

  const startScan = async () => {
    const domain = domainRef.current?.value.trim();
    if (!domain) return;

    setScanLogs([]);
    setIsScanning(true);

    try {
      const res = await fetch('http://localhost:8000/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();

      if (data.error) {
        addLog(`[!] Error: ${data.error}`);
        setIsScanning(false);
        return;
      }

      // ScanData initialize করো domain দিয়ে
      setScanData({
        scan_id: data.scan_id,
        domain: data.domain,
        status: 'running',
        results: {},
      });

      setCurrentScanId(data.scan_id);
      addLog(`[*] Scan started — ID: ${data.scan_id}`);
      connectWebSocket(data.scan_id);

    } catch {
      addLog('[!] Backend connect করতে পারছে না');
      setIsScanning(false);
    }
  };

  const stopScan = async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    addLog('[!] Scan stopped by user');
    setIsScanning(false);
    setCurrentScanId(null);
  };

  const clearLogs = () => {
    setScanLogs([]);
    setCurrentScanId(null);
  };

  const getLogColor = (line: string) => {
    if (line.startsWith('[✓]')) return 'var(--accent)';
    if (line.startsWith('[+]')) return 'var(--success)';
    if (line.startsWith('[!]')) return 'var(--danger)';
    if (line.startsWith('[*]')) return 'var(--warning)';
    return 'var(--text-secondary)';
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px', color: 'var(--accent)',
          letterSpacing: '3px', marginBottom: '8px',
        }}>NEW SCAN</div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>
          Target Configuration
        </h1>
      </div>

      {/* Input */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px', padding: '24px',
        marginBottom: '20px',
      }}>
        <label style={{
          display: 'block', fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '10px',
        }}>TARGET DOMAIN</label>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            ref={domainRef}
            type="text"
            onKeyDown={e => e.key === 'Enter' && !isScanning && startScan()}
            placeholder="example.com"
            disabled={isScanning}
            style={{
              flex: 1, padding: '12px 16px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px', color: 'var(--text-primary)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px', outline: 'none',
            }}
          />
          {!isScanning ? (
            <button
              onClick={startScan}
              style={{
                padding: '12px 28px',
                background: 'var(--accent)', color: '#000',
                border: 'none', borderRadius: '8px',
                fontFamily: 'Syne, sans-serif',
                fontWeight: '700', fontSize: '14px',
                cursor: 'pointer', minWidth: '130px',
              }}
            >▶ Start Scan</button>
          ) : (
            <button
              onClick={stopScan}
              style={{
                padding: '12px 28px',
                background: 'var(--danger-dim)',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
                borderRadius: '8px',
                fontFamily: 'Syne, sans-serif',
                fontWeight: '700', fontSize: '14px',
                cursor: 'pointer', minWidth: '130px',
              }}
            >■ Stop Scan</button>
          )}
        </div>
      </div>

      {/* Live Terminal */}
      {scanLogs.length > 0 && (
        <div style={{
          background: '#050709',
          border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
            <span style={{
              marginLeft: '8px', fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px', color: 'var(--text-muted)',
            }}>scan terminal</span>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isScanning && (
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px', color: 'var(--warning)',
                }}>● LIVE</span>
              )}
              {!isScanning && (
                <>
                  <button
                    onClick={clearLogs}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-muted)',
                      padding: '2px 10px', borderRadius: '4px',
                      fontSize: '10px', fontFamily: 'JetBrains Mono, monospace',
                      cursor: 'pointer',
                    }}
                  >clear</button>
                  <button
                    onClick={() => setActiveView('dashboard')}
                    style={{
                      background: 'var(--accent-dim)',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      padding: '2px 10px', borderRadius: '4px',
                      fontSize: '10px', fontFamily: 'JetBrains Mono, monospace',
                      cursor: 'pointer',
                    }}
                  >view results</button>
                </>
              )}
            </div>
          </div>

          <div
            ref={logRef}
            style={{
              padding: '16px', height: '420px',
              overflowY: 'auto',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px', lineHeight: '1.8',
            }}
          >
            {scanLogs.map((line, i) => (
              <div key={i} style={{ color: getLogColor(line) }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>
                  {String(i + 1).padStart(3, '0')}
                </span>
                {line}
              </div>
            ))}
            {isScanning && (
              <div style={{ color: 'var(--accent)', marginTop: '4px' }}>▌</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}