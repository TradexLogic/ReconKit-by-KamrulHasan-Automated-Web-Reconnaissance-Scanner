import { ActiveView, ScanData } from '../App';

type Props = {
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  scanData: ScanData | null;
  isScanning: boolean;
};

const nav = [
  {
    label: 'MAIN',
    items: [
      { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
      { id: 'scan', icon: '◈', label: 'New Scan' },
      { id: 'history', icon: '◷', label: 'Scan History' },
    ]
  },
  {
    label: 'RECONNAISSANCE',
    items: [
      { id: 'subdomains', icon: '◎', label: 'Subdomains' },
      { id: 'urls', icon: '⊹', label: 'URLs' },
    ]
  },
  {
    label: 'VULNERABILITIES',
    items: [
      { id: 'nuclei', icon: '▸', label: 'Nuclei Findings' },
      { id: 'xss', icon: '▸', label: 'XSS' },
      { id: 'sqli', icon: '▸', label: 'SQL Injection' },
      { id: 'lfi', icon: '▸', label: 'LFI' },
      { id: 'ssrf', icon: '▸', label: 'SSRF' },
      { id: 'redirect', icon: '▸', label: 'Open Redirect' },
      { id: 'rce', icon: '▸', label: 'RCE' },
    ]
  },
];

export default function Sidebar({ activeView, setActiveView, scanData, isScanning }: Props) {
  return (
    <aside style={{
      width: '220px', minWidth: '220px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px', color: 'var(--accent)',
          letterSpacing: '3px', marginBottom: '4px',
        }}>RECON</div>
        <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          ScanKit
        </div>
        {scanData && (
          <div style={{
            marginTop: '8px', padding: '4px 8px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent)',
            borderRadius: '4px', fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--accent)', wordBreak: 'break-all',
          }}>{scanData.domain}</div>
        )}
      </div>

      {/* Scanning indicator */}
      {isScanning && (
        <div
          onClick={() => setActiveView('scan')}
          style={{
            padding: '10px 20px',
            background: 'var(--warning-dim)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--warning)',
            animation: 'pulse 1s infinite',
          }} />
          <span style={{
            fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--warning)',
          }}>SCAN RUNNING</span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {nav.map(section => (
          <div key={section.label} style={{ marginBottom: '4px' }}>
            <div style={{
              padding: '8px 20px 4px',
              fontSize: '9px', fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '2px', color: 'var(--text-muted)',
            }}>{section.label}</div>

            {section.items.map(item => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as ActiveView)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: '10px', padding: '9px 20px',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    border: 'none',
                    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '13px', fontFamily: 'Syne, sans-serif',
                    fontWeight: active ? '600' : '400',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '14px', opacity: 0.7 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status */}
      <div style={{
        padding: '14px 20px', borderTop: '1px solid var(--border)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px', color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--success)', boxShadow: '0 0 6px var(--success)',
          }} />
          API CONNECTED
        </div>
      </div>
    </aside>
  );
}