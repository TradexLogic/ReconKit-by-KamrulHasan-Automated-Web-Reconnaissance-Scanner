import { ActiveView, ScanData } from '../App';

type Props = {
  setActiveView: (v: ActiveView) => void;
  scanData: ScanData | null;
};

export default function Dashboard({ setActiveView, scanData }: Props) {
  const r = scanData?.results ?? {};
  const nuclei = r.nuclei ?? {};
  const active = r.subdomains_active ?? [];
  const allSubs = r.subdomains_raw ?? [];
  const urls = r.urls_all ?? [];
  const params = r.urls_params ?? [];
  const categorized = r.urls_categorized ?? {};
  const xss = r.xss ?? [];
  const sqli = r.sqli ?? [];

  const nucleiTotal =
    (nuclei.critical?.length ?? 0) +
    (nuclei.high?.length ?? 0) +
    (nuclei.medium?.length ?? 0) +
    (nuclei.low?.length ?? 0) +
    (nuclei.info?.length ?? 0);

  const stats = [
    { label: 'Subdomains', value: allSubs.length, sub: `${active.length} active`, color: 'var(--accent)', view: 'subdomains' as ActiveView },
    { label: 'Total URLs', value: urls.length, sub: `${params.length} with params`, color: 'var(--success)', view: 'urls' as ActiveView },
    { label: 'Nuclei', value: nucleiTotal, sub: `${nuclei.critical?.length ?? 0} critical`, color: 'var(--danger)', view: 'nuclei' as ActiveView },
    { label: 'XSS', value: xss.length, sub: 'findings', color: 'var(--warning)', view: 'xss' as ActiveView },
    { label: 'SQLi', value: sqli.length, sub: 'findings', color: 'var(--danger)', view: 'sqli' as ActiveView },
  ];

  const urlCategories = [
    { key: 'xss', label: 'XSS', color: 'var(--warning)', view: 'xss' as ActiveView },
    { key: 'sqli', label: 'SQLi', color: 'var(--danger)', view: 'sqli' as ActiveView },
    { key: 'lfi', label: 'LFI', color: '#ff6b35', view: 'lfi' as ActiveView },
    { key: 'ssrf', label: 'SSRF', color: '#c678dd', view: 'ssrf' as ActiveView },
    { key: 'redirect', label: 'Redirect', color: '#56b6c2', view: 'redirect' as ActiveView },
    { key: 'rce', label: 'RCE', color: '#ff2244', view: 'rce' as ActiveView },
    { key: 'idor', label: 'IDOR', color: '#e5c07b', view: 'urls' as ActiveView },
    { key: 'ssti', label: 'SSTI', color: '#98c379', view: 'urls' as ActiveView },
  ];

  const nucleiSeverities = [
    { key: 'critical', label: 'Critical', color: '#ff2244' },
    { key: 'high', label: 'High', color: 'var(--danger)' },
    { key: 'medium', label: 'Medium', color: 'var(--warning)' },
    { key: 'low', label: 'Low', color: 'var(--success)' },
    { key: 'info', label: 'Info', color: 'var(--accent)' },
  ];

  const isScanning = scanData?.status === 'running';

  return (
    <div style={{ padding: '40px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px', color: 'var(--accent)',
            letterSpacing: '3px', marginBottom: '8px',
          }}>OVERVIEW</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>
            {scanData ? scanData.domain : 'Ready to Scan'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
            {scanData
              ? `Scan #${scanData.scan_id} · ${scanData.status}`
              : 'Start a new scan to see results'}
          </p>
        </div>
        {isScanning && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px',
            background: 'var(--warning-dim)',
            border: '1px solid var(--warning)',
            borderRadius: '8px',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--warning)',
            }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--warning)' }}>
              LIVE SCAN RUNNING
            </span>
          </div>
        )}
      </div>

      {/* Main Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px', marginBottom: '24px',
      }}>
        {stats.map(stat => (
          <button
            key={stat.label}
            onClick={() => scanData && setActiveView(stat.view)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px 16px',
              cursor: scanData ? 'pointer' : 'default',
              textAlign: 'left',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => {
              if (scanData) (e.currentTarget as HTMLElement).style.borderColor = stat.color;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            }}
          >
            <div style={{
              fontSize: '28px', fontWeight: '800',
              color: stat.color, fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '4px',
            }}>{stat.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>{stat.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{stat.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* URL Categories Live */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px',
        }}>
          <div style={{
            fontSize: '10px', fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            URL CATEGORIES
            {isScanning && <span style={{ color: 'var(--warning)', fontSize: '9px' }}>● LIVE</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {urlCategories.map(cat => {
              const count = categorized[cat.key]?.length ?? 0;
              const maxCount = Math.max(...urlCategories.map(c => categorized[c.key]?.length ?? 0), 1);
              const pct = Math.round((count / maxCount) * 100);
              return (
                <button
                  key={cat.key}
                  onClick={() => count > 0 && scanData && setActiveView(cat.view)}
                  style={{
                    background: 'transparent', border: 'none',
                    padding: '0', cursor: count > 0 ? 'pointer' : 'default',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: cat.color, minWidth: '50px' }}>
                      {cat.label}
                    </span>
                    <div style={{ flex: 1, height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: cat.color,
                        borderRadius: '2px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: cat.color, minWidth: '30px', textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nuclei Severity Live */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px',
        }}>
          <div style={{
            fontSize: '10px', fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            NUCLEI SEVERITY
            {isScanning && <span style={{ color: 'var(--warning)', fontSize: '9px' }}>● LIVE</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nucleiSeverities.map(s => {
              const count = nuclei[s.key]?.length ?? 0;
              const maxCount = Math.max(...nucleiSeverities.map(n => nuclei[n.key]?.length ?? 0), 1);
              const pct = Math.round((count / maxCount) * 100);
              return (
                <button
                  key={s.key}
                  onClick={() => count > 0 && setActiveView('nuclei')}
                  style={{
                    background: 'transparent', border: 'none',
                    padding: '0', cursor: count > 0 ? 'pointer' : 'default',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: s.color, minWidth: '60px' }}>
                      {s.label}
                    </span>
                    <div style={{ flex: 1, height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: s.color, borderRadius: '2px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: s.color, minWidth: '30px', textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px', padding: '20px',
      }}>
        <div style={{
          fontSize: '10px', fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '14px',
        }}>QUICK ACTIONS</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveView('scan')}
            style={{
              padding: '10px 20px', background: 'var(--accent)', color: '#000',
              border: 'none', borderRadius: '8px',
              fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '13px',
              cursor: 'pointer',
            }}
          >+ New Scan</button>
          {scanData && (
            <>
              {(['subdomains', 'urls', 'nuclei', 'xss', 'sqli', 'lfi', 'ssrf', 'redirect', 'rce'] as ActiveView[]).map(v => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  style={{
                    padding: '10px 20px', background: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    fontFamily: 'Syne, sans-serif', fontWeight: '600', fontSize: '13px',
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >{v}</button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}