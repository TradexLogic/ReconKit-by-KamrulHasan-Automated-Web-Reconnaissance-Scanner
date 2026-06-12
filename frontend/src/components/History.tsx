import { useState, useEffect } from 'react';
import { ActiveView, ScanData } from '../App';

type Props = {
  setScanData: (d: ScanData) => void;
  setActiveView: (v: ActiveView) => void;
};

export default function History({ setScanData, setActiveView }: Props) {
  const [scans, setScans] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/scans')
      .then(r => r.json())
      .then(d => setScans(d.scans ?? []));
  }, []);

  const loadScan = async (id: number) => {
    const res = await fetch(`http://localhost:8000/api/scan/${id}`);
    const data = await res.json();
    setScanData(data);
    setActiveView('dashboard');
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'var(--success)';
    if (status === 'running') return 'var(--accent)';
    if (status === 'failed') return 'var(--danger)';
    return 'var(--text-muted)';
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px', color: 'var(--accent)',
          letterSpacing: '3px', marginBottom: '8px',
        }}>HISTORY</div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>
          Scan History
        </h1>
      </div>

      {scans.length === 0
        ? <div style={{
            background: 'var(--bg-card)',
            border: '1px dashed var(--border-light)',
            borderRadius: '12px', padding: '48px',
            textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px',
          }}>No scans yet</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scans.map(scan => (
              <div
                key={scan.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '16px',
                }}
              >
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px', color: 'var(--text-muted)',
                  minWidth: '30px',
                }}>#{scan.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{scan.domain}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                    {new Date(scan.created_at).toLocaleString()}
                  </div>
                </div>
                <span style={{
                  padding: '3px 10px',
                  background: getStatusColor(scan.status) + '22',
                  color: getStatusColor(scan.status),
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                  border: `1px solid ${getStatusColor(scan.status)}44`,
                }}>{scan.status}</span>
                <button
                  onClick={() => loadScan(scan.id)}
                  style={{
                    padding: '6px 16px',
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >Load</button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}