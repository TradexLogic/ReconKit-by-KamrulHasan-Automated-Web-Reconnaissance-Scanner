import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ScanPanel from './components/ScanPanel';
import Results from './components/Results';
import History from './components/History';
import './index.css';

export type ActiveView =
  | 'dashboard' | 'scan' | 'history'
  | 'subdomains' | 'urls'
  | 'nuclei' | 'xss' | 'sqli'
  | 'lfi' | 'ssrf' | 'redirect' | 'rce';

export type ScanData = {
  scan_id: number;
  domain: string;
  status: string;
  results: Record<string, any>;
};

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [currentScanId, setCurrentScanId] = useState<number | null>(null);

  // Live results update — WebSocket data gelei update hobe
  const updateLiveResult = (data_type: string, data: any) => {
    setScanData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        results: {
          ...prev.results,
          [data_type]: data,
        }
      };
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        scanData={scanData}
        isScanning={isScanning}
      />
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
        {activeView === 'dashboard' && (
          <Dashboard setActiveView={setActiveView} scanData={scanData} />
        )}
        {activeView === 'scan' && (
          <ScanPanel
            setScanData={setScanData}
            setActiveView={setActiveView}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
            scanLogs={scanLogs}
            setScanLogs={setScanLogs}
            currentScanId={currentScanId}
            setCurrentScanId={setCurrentScanId}
            updateLiveResult={updateLiveResult}
          />
        )}
        {activeView === 'history' && (
          <History setScanData={setScanData} setActiveView={setActiveView} />
        )}
        {['subdomains','urls','nuclei','xss','sqli','lfi','ssrf','redirect','rce'].includes(activeView) && (
  <Results activeView={activeView} scanData={scanData} />
      )}
      </main>
    </div>
  );
}

export default App;