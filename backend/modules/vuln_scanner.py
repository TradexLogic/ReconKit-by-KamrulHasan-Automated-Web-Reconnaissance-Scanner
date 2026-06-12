import httpx
import re
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

SQLI_ERROR_PATTERNS = [
    r"sql syntax",
    r"mysql_fetch",
    r"ora-\d{5}",
    r"microsoft ole db",
    r"sqlite_exception",
    r"postgresql.*error",
    r"warning.*mysql",
    r"valid mysql result",
    r"mysqlclient",
    r"syntax error",
    r"unclosed quotation",
    r"odbc.*error",
    r"quoted string not properly terminated",
    r"you have an error in your sql",
    r"supplied argument is not a valid mysql",
    r"error.*\bquery\b",
    r"mysql.*error",
    r"division by zero",
    r"invalid query",
    r"sql command not properly ended",
    r"unexpected end of sql command",
    r"warning.*pg_exec",
    r"function\.mysql",
    r"mysql_numrows",
    r"mysql_query",
    r"pg_query\(\)",
    r"sqlite_query",
]

XSS_PAYLOAD = "<script>alert('xss')</script>"
XSS_PATTERN = r"<script>alert\('xss'\)</script>"
SQLI_PAYLOADS = ["'", '"', "' OR '1'='1", "' --", '" --']


async def inject_sqli_payload(url: str, param: str, payload: str, original_params: dict) -> dict:
    test_params = original_params.copy()
    test_params[param] = payload

    parsed = urlparse(url)
    new_query = urlencode({
        k: v[0] if isinstance(v, list) else v
        for k, v in test_params.items()
    })
    test_url = urlunparse(parsed._replace(query=new_query))

    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            response = await client.get(test_url)
            body = response.text.lower()

            print(f"[DEBUG] Status: {response.status_code} | URL: {test_url[:80]}")

            for pattern in SQLI_ERROR_PATTERNS:
                if re.search(pattern, body, re.IGNORECASE):
                    return {
                        "vulnerable": True,
                        "param": param,
                        "payload": payload,
                        "pattern_matched": pattern,
                        "url": test_url,
                    }

        return {"vulnerable": False}

    except Exception as e:
        print(f"[DEBUG] Exception: {type(e).__name__}: {repr(e)}")
        return {"vulnerable": False, "error": str(e)}


async def inject_sqli_post(url: str, param: str, payload: str, original_params: dict) -> dict:
    """POST form এর জন্য SQLi check"""
    test_params = {
        k: v[0] if isinstance(v, list) else v
        for k, v in original_params.items()
    }
    test_params[param] = payload

    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            response = await client.post(url, data=test_params)
            body = response.text.lower()

            print(f"[DEBUG POST] Status: {response.status_code} | Param: {param}")

            for pattern in SQLI_ERROR_PATTERNS:
                if re.search(pattern, body, re.IGNORECASE):
                    return {
                        "vulnerable": True,
                        "param": param,
                        "payload": payload,
                        "pattern_matched": pattern,
                        "method": "POST",
                        "url": url,
                    }

        return {"vulnerable": False}

    except Exception as e:
        print(f"[DEBUG POST] Exception: {type(e).__name__}: {repr(e)}")
        return {"vulnerable": False, "error": str(e)}


async def scan_sqli(url: str) -> dict:
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    if not params:
        return {
            "url": url,
            "status": "skipped",
            "reason": "No URL parameters found",
            "findings": [],
        }

    findings = []
    tested = 0

    print(f"[SQLi] Testing GET: {url}")
    print(f"[SQLi] Parameters: {list(params.keys())}")

    for param in params:
        for payload in SQLI_PAYLOADS:
            result = await inject_sqli_payload(url, param, payload, params)
            tested += 1

            if result.get("vulnerable"):
                print(f"[!] SQLi found — param: {param}, payload: {payload}")
                findings.append(result)
                break

    return {
        "url": url,
        "status": "completed",
        "parameters_tested": list(params.keys()),
        "payloads_tested": tested,
        "vulnerable": len(findings) > 0,
        "findings": findings,
    }


async def scan_sqli_post(url: str, form_params: dict) -> dict:
    """POST form এর জন্য SQLi scan"""
    findings = []
    tested = 0

    print(f"[SQLi POST] Testing: {url}")
    print(f"[SQLi POST] Params: {list(form_params.keys())}")

    for param in form_params:
        for payload in SQLI_PAYLOADS:
            result = await inject_sqli_post(url, param, payload, form_params)
            tested += 1

            if result.get("vulnerable"):
                print(f"[!] SQLi POST found — param: {param}")
                findings.append(result)
                break

    return {
        "url": url,
        "method": "POST",
        "status": "completed",
        "parameters_tested": list(form_params.keys()),
        "payloads_tested": tested,
        "vulnerable": len(findings) > 0,
        "findings": findings,
    }


async def scan_xss(url: str) -> dict:
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    if not params:
        return {
            "url": url,
            "status": "skipped",
            "reason": "No URL parameters found",
            "findings": [],
        }

    findings = []

    print(f"[XSS] Testing: {url}")

    for param in params:
        test_params = {
            k: v[0] if isinstance(v, list) else v
            for k, v in params.items()
        }
        test_params[param] = XSS_PAYLOAD

        new_query = urlencode(test_params)
        test_url = urlunparse(parsed._replace(query=new_query))

        try:
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                response = await client.get(test_url)
                body = response.text

                if re.search(XSS_PATTERN, body, re.IGNORECASE):
                    print(f"[!] XSS found — param: {param}")
                    findings.append({
                        "vulnerable": True,
                        "param": param,
                        "payload": XSS_PAYLOAD,
                        "url": test_url,
                    })

        except Exception as e:
            print(f"[XSS] Exception: {type(e).__name__}: {repr(e)}")
            continue

    return {
        "url": url,
        "status": "completed",
        "parameters_tested": list(params.keys()),
        "vulnerable": len(findings) > 0,
        "findings": findings,
    }


async def scan_vulnerabilities(url: str) -> dict:
    sqli_result = await scan_sqli(url)
    xss_result = await scan_xss(url)

    return {
        "url": url,
        "sqli": sqli_result,
        "xss": xss_result,
    }