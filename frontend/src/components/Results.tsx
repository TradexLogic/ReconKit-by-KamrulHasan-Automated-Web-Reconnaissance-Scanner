import { useState } from 'react';
import { ActiveView, ScanData } from '../App';

type Props = {
  activeView: ActiveView;
  scanData: ScanData | null;
};

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      padding: '2px 8px',
      background: color + '22',
      color: color,
      borderRadius: '4px',
      fontSize: '10px',
      fontFamily: 'JetBrains Mono, monospace',
      border: `1px solid ${color}44`,
    }}>{text}</span>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px dashed var(--border-light)',
      borderRadius: '12px',
      padding: '48px',
      textAlign: 'center',
      color: 'var(--text-secondary)',
      fontSize: '14px',
    }}>{msg}</div>
  );
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function DownloadBtn({ items, filename, color }: { items: string[]; filename: string; color: string }) {
  return (
    <button
      onClick={() => downloadText(items.join('\n'), filename)}
      disabled={items.length === 0}
      style={{
        background: 'transparent',
        border: `1px solid ${color}`,
        color: color,
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
        cursor: items.length === 0 ? 'not-allowed' : 'pointer',
        opacity: items.length === 0 ? 0.4 : 1,
      }}
    >
      ↓ download ({items.length})
    </button>
  );
}

function SubdomainsView({ data }: { data: any }) {
  const active = data?.subdomains_active ?? [];
  const raw = data?.subdomains_raw ?? [];
  const activeUrls = active.map((h: any) => h.url || h);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }} />
          <span style={{ fontWeight: '700' }}>Active Subdomains</span>
          <Badge text={String(active.length)} color="var(--success)" />
          <div style={{ marginLeft: 'auto' }}>
            <DownloadBtn items={activeUrls} filename="active_subdomains.txt" color="var(--success)" />
          </div>
        </div>
        <div style={{ padding: '12px' }}>
          {active.length === 0
            ? <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>None found yet...</div>
            : active.map((h: any, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '6px', marginBottom: '4px',
                background: 'var(--success-dim)',
              }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', flex: 1 }}>{h.url}</span>
                {h.status ? <Badge text={String(h.status)} color="var(--success)" /> : null}
                {h.webserver ? <Badge text={h.webserver} color="var(--accent)" /> : null}
                <button
                  onClick={() => window.open(h.url, '_blank')}
                  style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}
                >visit</button>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }} />
          <span style={{ fontWeight: '700' }}>All Discovered</span>
          <Badge text={String(raw.length)} color="var(--text-muted)" />
          <div style={{ marginLeft: 'auto' }}>
            <DownloadBtn items={raw} filename="all_subdomains.txt" color="var(--text-secondary)" />
          </div>
        </div>
        <div style={{ padding: '12px' }}>
          {raw.length === 0
            ? <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Scanning...</div>
            : raw.map((s: string, i: number) => (
              <div key={i} style={{
                padding: '8px 12px', borderRadius: '6px', marginBottom: '4px',
                background: 'var(--bg-hover)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px', color: 'var(--text-secondary)',
              }}>{s}</div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

function URLsView({ data }: { data: any }) {
  const all = data?.urls_all ?? [];
  const params = data?.urls_params ?? [];
  const categorized = data?.urls_categorized ?? {};
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const categories = [
    { key: 'xss', label: 'XSS', color: 'var(--warning)' },
    { key: 'sqli', label: 'SQLi', color: 'var(--danger)' },
    { key: 'lfi', label: 'LFI', color: '#ff6b35' },
    { key: 'ssrf', label: 'SSRF', color: '#c678dd' },
    { key: 'redirect', label: 'Redirect', color: '#56b6c2' },
    { key: 'rce', label: 'RCE', color: '#ff2244' },
    { key: 'idor', label: 'IDOR', color: '#e5c07b' },
    { key: 'ssti', label: 'SSTI', color: '#98c379' },
  ];

  const selectedUrls = selectedCat ? (categorized[selectedCat] ?? []) : params;
  const selectedColor = categories.find(c => c.key === selectedCat)?.color ?? 'var(--accent)';
  const selectedLabel = selectedCat ? categories.find(c => c.key === selectedCat)?.label : 'All Params';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)', fontFamily: 'JetBrains Mono, monospace' }}>{all.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Total URLs</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--warning)', fontFamily: 'JetBrains Mono, monospace' }}>{params.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>With Parameters</div>
        </div>
      </div>

      {/* Category Cards — clickable */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '14px' }}>
          GF PATTERN BREAKDOWN — click to view URLs
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* All params button */}
          <button
            onClick={() => setSelectedCat(null)}
            style={{
              padding: '10px 16px',
              background: selectedCat === null ? 'var(--accent-dim)' : 'var(--bg-primary)',
              border: `1px solid ${selectedCat === null ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '8px', textAlign: 'center',
              minWidth: '80px', cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
              {params.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>All Params</div>
          </button>

          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCat(selectedCat === cat.key ? null : cat.key)}
              style={{
                padding: '10px 16px',
                background: selectedCat === cat.key ? cat.color + '22' : 'var(--bg-primary)',
                border: `1px solid ${selectedCat === cat.key ? cat.color : cat.color + '33'}`,
                borderRadius: '8px', textAlign: 'center',
                minWidth: '80px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: '800', color: cat.color, fontFamily: 'JetBrains Mono, monospace' }}>
                {categorized[cat.key]?.length ?? 0}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* URL List */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '700' }}>{selectedLabel} URLs</span>
          <Badge text={String(selectedUrls.length)} color={selectedColor} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <DownloadBtn
              items={selectedUrls}
              filename={`${selectedCat ?? 'params'}_urls.txt`}
              color={selectedColor}
            />
          </div>
        </div>
        <div style={{ padding: '12px', maxHeight: '500px', overflowY: 'auto' }}>
          {selectedUrls.length === 0
            ? <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                {all.length === 0 ? 'Scanning...' : 'No URLs matched'}
              </div>
            : selectedUrls.slice(0, 300).map((url: string, i: number) => (
              <div key={i} style={{
                padding: '8px 12px', borderRadius: '6px', marginBottom: '4px',
                background: 'var(--bg-hover)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px', color: 'var(--text-secondary)',
                  flex: 1, wordBreak: 'break-all',
                }}>{url}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(url)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-muted)',
                    padding: '2px 8px', borderRadius: '4px',
                    fontSize: '10px', fontFamily: 'JetBrains Mono, monospace',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >copy</button>
              </div>
            ))
          }
          {selectedUrls.length > 300 && (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              Showing 300 of {selectedUrls.length} — download for full list
            </div>
          )}
        </div>
      </div>

      {/* Download All */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '14px' }}>
          DOWNLOAD ALL
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <DownloadBtn items={all} filename="all_urls.txt" color="var(--success)" />
          <DownloadBtn items={params} filename="param_urls.txt" color="var(--warning)" />
          {categories.map(cat => (
            <DownloadBtn
              key={cat.key}
              items={categorized[cat.key] ?? []}
              filename={`${cat.key}_urls.txt`}
              color={cat.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NucleiView({ data }: { data: any }) {
  const nuclei = data?.nuclei ?? {};
  const severities = [
    { key: 'critical', label: 'Critical', color: '#ff2244' },
    { key: 'high', label: 'High', color: 'var(--danger)' },
    { key: 'medium', label: 'Medium', color: 'var(--warning)' },
    { key: 'low', label: 'Low', color: 'var(--success)' },
    { key: 'info', label: 'Info', color: 'var(--accent)' },
  ];

  const allFindings = Object.values(nuclei).flat() as any[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {severities.map(s => (
          <div key={s.key} style={{
            flex: 1, minWidth: '80px',
            background: 'var(--bg-card)',
            border: `1px solid ${s.color}33`,
            borderRadius: '10px', padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>
              {nuclei[s.key]?.length ?? 0}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Download */}
      {allFindings.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DownloadBtn
            items={allFindings.map((f: any) => `[${f.severity}] ${f.name} — ${f.url}`)}
            filename="nuclei_findings.txt"
            color="var(--accent)"
          />
        </div>
      )}

      {severities.map(s => {
        const items = nuclei[s.key] ?? [];
        return (
          <div key={s.key} style={{ background: 'var(--bg-card)', border: `1px solid ${s.color}33`, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${s.color}22`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '700', color: s.color }}>{s.label}</span>
              <Badge text={String(items.length)} color={s.color} />
            </div>
            <div style={{ padding: '12px' }}>
              {items.length === 0
                ? <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    {Object.keys(nuclei).length === 0 ? 'Waiting for nuclei scan...' : 'No findings'}
                  </div>
                : items.map((item: any, i: number) => (
                  <div key={i} style={{
                    padding: '12px', borderRadius: '6px', marginBottom: '6px',
                    background: 'var(--bg-hover)',
                    border: `1px solid ${s.color}22`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{item.name}</span>
                      <Badge text={item.type || 'unknown'} color={s.color} />
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{item.url}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Template: {item.template}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FindingsView({ items, type, color }: { items: any[]; type: string; color: string }) {
  const urls = items.map((i: any) => i.url || '').filter(Boolean);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: '700' }}>{type} Findings</span>
        <Badge text={String(items.length)} color={color} />
        <div style={{ marginLeft: 'auto' }}>
          <DownloadBtn items={urls} filename={`${type.toLowerCase()}_findings.txt`} color={color} />
        </div>
      </div>
      <div style={{ padding: '12px' }}>
        {items.length === 0
          ? <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Scanning... or no findings
            </div>
          : items.map((item: any, i: number) => (
            <div key={i} style={{
              padding: '12px', borderRadius: '6px', marginBottom: '6px',
              background: 'var(--bg-hover)',
              border: `1px solid ${color}22`,
            }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: color, marginBottom: '4px' }}>
                {item.url}
              </div>
              {item.output && (
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                  color: 'var(--text-muted)', marginTop: '6px',
                  background: 'var(--bg-primary)', padding: '8px',
                  borderRadius: '4px', wordBreak: 'break-all',
                }}>
                  {item.output.slice(0, 300)}
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
}

function URLListView({ items, type, color }: { items: string[]; type: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: '700' }}>{type} Candidate URLs</span>
        <Badge text={String(items.length)} color={color} />
        <span style={{ marginLeft: 'auto', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
          GF Pattern filtered
        </span>
        <DownloadBtn items={items} filename={`${type.toLowerCase()}_urls.txt`} color={color} />
      </div>
      <div style={{ padding: '12px', maxHeight: '600px', overflowY: 'auto' }}>
        {items.length === 0
          ? <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Scanning... or no URLs matched
            </div>
          : items.map((url, i) => (
            <div key={i} style={{
              padding: '8px 12px', borderRadius: '6px', marginBottom: '4px',
              background: 'var(--bg-hover)',
              border: `1px solid ${color}22`,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px', color: 'var(--text-secondary)',
                flex: 1, wordBreak: 'break-all',
              }}>{url}</span>
              <button
                onClick={() => navigator.clipboard.writeText(url)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${color}44`,
                  color: color, padding: '2px 8px',
                  borderRadius: '4px', fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >copy</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default function Results({ activeView, scanData }: Props) {
  const titles: Record<string, string> = {
    subdomains: 'Subdomain Enumeration',
    urls: 'URL Discovery',
    nuclei: 'Nuclei Findings',
    xss: 'XSS Findings',
    sqli: 'SQL Injection Findings',
    lfi: 'LFI Candidate URLs',
    ssrf: 'SSRF Candidate URLs',
    redirect: 'Open Redirect URLs',
    rce: 'RCE Candidate URLs',
  };

  const r = scanData?.results ?? {};

  return (
    <div style={{ padding: '40px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px', color: 'var(--accent)',
          letterSpacing: '3px', marginBottom: '8px',
        }}>RESULTS</div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>
          {titles[activeView] ?? activeView}
        </h1>
        {scanData && (
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
            {scanData.domain} · Scan #{scanData.scan_id}
          </p>
        )}
      </div>

      {!scanData
        ? <EmptyState msg="কোনো scan data নেই। আগে scan করো।" />
        : activeView === 'subdomains' ? <SubdomainsView data={r} />
        : activeView === 'urls' ? <URLsView data={r} />
        : activeView === 'nuclei' ? <NucleiView data={r} />
        : activeView === 'xss' ? <FindingsView items={r.xss ?? []} type="XSS" color="var(--warning)" />
        : activeView === 'sqli' ? <FindingsView items={r.sqli ?? []} type="SQL Injection" color="var(--danger)" />
        : activeView === 'lfi' ? <URLListView items={r.lfi_urls ?? []} type="LFI" color="#ff6b35" />
        : activeView === 'ssrf' ? <URLListView items={r.ssrf_urls ?? []} type="SSRF" color="#c678dd" />
        : activeView === 'redirect' ? <URLListView items={r.redirect_urls ?? []} type="Open Redirect" color="#56b6c2" />
        : activeView === 'rce' ? <URLListView items={r.rce_urls ?? []} type="RCE" color="#ff2244" />
        : null
      }
    </div>
  );
}