# 🔍 ReconKit — Automated Web Reconnaissance & Vulnerability Scanner

> A powerful, modular, web-based security reconnaissance platform built for bug bounty hunters and penetration testers. ReconKit automates the entire recon-to-vulnerability workflow with a clean, real-time dashboard.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-green.svg)
![React](https://img.shields.io/badge/react-18+-61DAFB.svg)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20WSL-orange.svg)

---

<details>
<summary>Click to see screenshots</summary>
<img width="458" height="383" alt="Screenshot 2026-06-12 180503" src="https://github.com/user-attachments/assets/c8e47005-3a64-4f54-8862-905a645257be" />
<img width="590" height="430" alt="Screenshot 2026-06-12 180709" src="https://github.com/user-attachments/assets/38a87da8-a14f-469e-8670-8fc0570667a3" />
<img width="673" height="419" alt="Screenshot 2026-06-12 180757" src="https://github.com/user-attachments/assets/f1d8e066-8eb1-444c-9368-19d052f49787" />
</details>

## 🌟 What is ReconKit?

ReconKit is an open-source, web-based automated security scanning platform that combines the power of industry-standard tools like **Subfinder**, **httpx**, **Katana**, **Nuclei**, **Dalfox**, and **SQLMap** into a single unified dashboard with real-time live updates.

Whether you're doing bug bounty hunting, penetration testing, or security research — ReconKit automates your entire workflow from subdomain discovery to vulnerability detection.

---

## ✨ Key Features

- 🔎 **Subdomain Enumeration** — Subfinder + Assetfinder combined for maximum coverage
- ✅ **Active Host Detection** — httpx-powered live/dead host filtering
- 🌐 **URL Discovery** — Waybackurls + GAU + Katana crawler
- 🎯 **Smart URL Categorization** — GF patterns auto-sort URLs by vulnerability type (XSS, SQLi, LFI, SSRF, RCE, IDOR, SSTI, Redirect)
- 💉 **XSS Detection** — Dalfox automated XSS scanner
- 🗄️ **SQLi Detection** — SQLMap integration
- ☢️ **Vulnerability Scanning** — Nuclei with full template support
- 📡 **Real-time Dashboard** — WebSocket-powered live updates as scan progresses
- 🔐 **Authenticated Scanning** — Session cookie support for login-required targets
- 📥 **Export Results** — Download any URL list or findings as .txt files
- 🗂️ **Scan History** — SQLite-backed persistent scan records
- 🧩 **Modular Architecture** — Each tool is an independent module, easy to extend

---

## 🖥️ Dashboard Preview

```
┌─────────────────────────────────────────────────────┐
│  RECON  ScanKit          supernovas.indrive.com      │
│─────────────────────────────────────────────────────│
│  ⬡ Dashboard    │  OVERVIEW                         │
│  ◈ New Scan     │  Subdomains: 3 | URLs: 3000       │
│  ◷ History      │  Nuclei: 12  | XSS: 2 | SQLi: 1  │
│─────────────────│                                    │
│  RECON          │  [URL CATEGORIES — LIVE]           │
│  ◎ Subdomains   │  XSS     ████████░░  24           │
│  ⊹ URLs         │  SQLi    █████░░░░░  15           │
│─────────────────│  LFI     ███░░░░░░░   8           │
│  VULNERABILITIES│  SSRF    ██░░░░░░░░   5           │
│  ▸ Nuclei       │                                    │
│  ▸ XSS          │  [NUCLEI SEVERITY — LIVE]          │
│  ▸ SQL Injection│  Critical ██░░░░░░░░  2           │
│  ▸ LFI          │  High     ████░░░░░░  8           │
│  ▸ SSRF         │  Medium   ██████░░░░ 15           │
│  ▸ RCE          │                                    │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10+ + FastAPI |
| Real-time | WebSocket |
| Frontend | React 18 + TypeScript |
| Database | SQLite |
| Recon Tools | Subfinder, Assetfinder, httpx |
| URL Discovery | Waybackurls, GAU, Katana |
| Vuln Scanning | Nuclei, Dalfox, SQLMap |
| URL Filtering | GF Patterns |

---

## ⚙️ Installation

### Prerequisites

- **OS:** Linux or Windows WSL2 (Ubuntu recommended)
- **Python:** 3.10+
- **Node.js:** 18+
- **Go:** 1.22+

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/reconkit.git
cd reconkit
```

---

### Step 2 — Install Go Tools

```bash
# Go install
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin:~/go/bin' >> ~/.bashrc
source ~/.bashrc

# Recon tools
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
go install -v github.com/tomnomnom/assetfinder@latest
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
go install -v github.com/tomnomnom/waybackurls@latest
go install -v github.com/lc/gau/v2/cmd/gau@latest
go install -v github.com/projectdiscovery/katana/cmd/katana@latest
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
go install -v github.com/hahwul/dalfox/v2@latest
go install -v github.com/tomnomnom/gf@latest

# Nuclei templates
nuclei -update-templates

# GF patterns
git clone https://github.com/1ndianl33t/Gf-Patterns /tmp/gf-patterns
mkdir -p ~/.gf
cp /tmp/gf-patterns/*.json ~/.gf/
```

---

### Step 3 — Install SQLMap

```bash
cd ~
git clone https://github.com/sqlmapproject/sqlmap.git
```

---

### Step 4 — Backend Setup

```bash
cd reconkit/backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn websockets httpx
```

---

### Step 5 — Frontend Setup

```bash
cd reconkit/frontend
npm install
```

---

### Step 6 — Run ReconKit

**Terminal 1 — Backend (WSL/Linux):**
```bash
cd reconkit/backend
source venv/bin/activate
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd reconkit/frontend
npm start
```

Open browser: `http://localhost:3000`

---

## 🚀 Usage

### Basic Scan
1. Open `http://localhost:3000`
2. Click **New Scan**
3. Enter target domain (e.g. `example.com`)
4. Click **Start Scan**
5. Watch real-time results populate across all panels

### Authenticated Scan (for login-required targets)
1. Login to target site in your browser
2. Copy your session cookie (e.g. `PHPSESSID=abc123`)
3. Paste in **Session Cookie** field before scanning
4. ReconKit will pass cookies to Katana, Dalfox, SQLMap, and Nuclei

### Local Testing (DVWA)
```bash
docker run -d -p 80:80 --name dvwa vulnerables/web-dvwa
```
- URL: `http://localhost/login.php`
- Username: `admin` | Password: `password`
- Click "Create / Reset Database"
- Scan `localhost` with session cookie

---

## 📁 Project Structure

```
reconkit/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── core/
│   │   ├── workflow.py         # Main scan pipeline orchestrator
│   │   └── websocket_manager.py # Real-time WebSocket manager
│   ├── modules/
│   │   ├── subfinder.py        # Subdomain enumeration
│   │   ├── assetfinder.py      # Subdomain enumeration
│   │   ├── httpx_runner.py     # Active host detection
│   │   ├── waybackurls.py      # URL discovery
│   │   ├── gau.py              # URL discovery
│   │   ├── katana.py           # Web crawler
│   │   ├── gf_runner.py        # URL categorization
│   │   ├── dalfox.py           # XSS scanner
│   │   ├── sqlmap_runner.py    # SQLi scanner
│   │   └── nuclei.py           # Vulnerability scanner
│   └── database/
│       └── db.py               # SQLite database
└── frontend/
    └── src/
        ├── App.tsx
        └── components/
            ├── Sidebar.tsx
            ├── Dashboard.tsx
            ├── ScanPanel.tsx
            ├── Results.tsx
            └── History.tsx
```

---

## 🔄 Scan Workflow

```
Target Domain Input
        ↓
┌─── Phase 1: Subdomain Enumeration ───┐
│  Subfinder + Assetfinder             │
│  → Merge & deduplicate               │
└──────────────────────────────────────┘
        ↓
┌─── Phase 2: Active Host Detection ───┐
│  httpx → filter live hosts           │
└──────────────────────────────────────┘
        ↓
┌─── Phase 3: URL Discovery ────────────┐
│  Waybackurls + GAU + Katana crawler   │
│  → Merge & deduplicate                │
└───────────────────────────────────────┘
        ↓
┌─── Phase 4: URL Categorization ───────┐
│  GF Patterns                          │
│  → XSS, SQLi, LFI, SSRF, RCE, IDOR  │
└───────────────────────────────────────┘
        ↓
┌─── Phase 5: Vulnerability Scanning ───┐
│  Dalfox  → XSS detection             │
│  SQLMap  → SQLi detection            │
└───────────────────────────────────────┘
        ↓
┌─── Phase 6: Nuclei Full Scan ─────────┐
│  All templates → Critical/High/Medium │
└───────────────────────────────────────┘
        ↓
   Dashboard Results
```

---

## ➕ Adding New Modules

ReconKit is built with a plugin-friendly architecture. To add a new scanner:

1. Create `backend/modules/your_tool.py`
2. Implement `async def run_your_tool(targets: list) -> list`
3. Import and call it in `core/workflow.py`
4. Add results display in `frontend/src/components/Results.tsx`

---

## ⚠️ Legal Disclaimer

> ReconKit is intended for **authorized security testing only**.
> Always ensure you have **explicit written permission** before scanning any target.
> The authors are not responsible for any misuse or damage caused by this tool.
> Use responsibly and ethically.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests for new modules or improvements
- Share your experience and findings

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Credits

ReconKit is powered by these amazing open-source tools:

- [Subfinder](https://github.com/projectdiscovery/subfinder) — ProjectDiscovery
- [httpx](https://github.com/projectdiscovery/httpx) — ProjectDiscovery
- [Nuclei](https://github.com/projectdiscovery/nuclei) — ProjectDiscovery
- [Katana](https://github.com/projectdiscovery/katana) — ProjectDiscovery
- [Assetfinder](https://github.com/tomnomnom/assetfinder) — tomnomnom
- [Waybackurls](https://github.com/tomnomnom/waybackurls) — tomnomnom
- [GF](https://github.com/tomnomnom/gf) — tomnomnom
- [GAU](https://github.com/lc/gau) — lc
- [Dalfox](https://github.com/hahwul/dalfox) — hahwul
- [SQLMap](https://github.com/sqlmapproject/sqlmap) — sqlmapproject

---

<p align="center">
  Made with ❤️ for the Bug Bounty Community
</p>
