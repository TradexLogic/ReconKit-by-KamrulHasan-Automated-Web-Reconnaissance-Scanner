from fastapi import APIRouter
from database.db import init_db, get_connection
from modules.subdomain import enumerate_subdomains
from modules.port_scanner import scan_ports
from modules.vuln_scanner import scan_vulnerabilities
import json

router = APIRouter()
init_db()

@router.post("/scan/vuln")
async def scan_vuln(data: dict):
    url = data.get("url")
    if not url:
        return {"error": "URL required"}

    if not url.startswith("http"):
        return {"error": "URL must start with http:// or https://"}

    result = await scan_vulnerabilities(url)
    return result

@router.post("/scan/start")
async def start_scan(data: dict):
    domain = data.get("domain")
    if not domain:
        return {"error": "Domain required"}

    # Database এ scan record তৈরি
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO scans (domain, status) VALUES (?, ?)",
        (domain, "running")
    )
    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()

    # Subdomain enumeration চালাও
    subdomain_results = await enumerate_subdomains(domain)

    # Results database এ save করো
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO results (scan_id, type, data) VALUES (?, ?, ?)",
        (scan_id, "subdomains", json.dumps(subdomain_results))
    )

    # Scan complete mark করো
    cursor.execute(
        "UPDATE scans SET status=? WHERE id=?",
        ("completed", scan_id)
    )
    conn.commit()
    conn.close()

    return {
        "scan_id": scan_id,
        "domain": domain,
        "status": "completed",
        "results": subdomain_results
    }

@router.get("/scan/{scan_id}")
async def get_scan(scan_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans WHERE id=?", (scan_id,))
    scan = cursor.fetchone()

    cursor.execute(
        "SELECT type, data FROM results WHERE scan_id=?",
        (scan_id,)
    )
    results = cursor.fetchall()
    conn.close()

    if not scan:
        return {"error": "Scan not found"}

    return {
        "id": scan[0],
        "domain": scan[1],
        "status": scan[2],
        "created_at": scan[3],
        "results": [
            {"type": r[0], "data": json.loads(r[1])}
            for r in results
        ]
    }

@router.get("/scans")
async def list_scans():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans ORDER BY created_at DESC")
    scans = cursor.fetchall()
    conn.close()

    return {"scans": [
        {"id": s[0], "domain": s[1], "status": s[2], "created_at": s[3]}
        for s in scans
    ]}