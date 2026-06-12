import httpx
import dns.resolver
import asyncio

# Common subdomains list
COMMON_SUBDOMAINS = [
    "www", "mail", "ftp", "admin", "api", "dev", "test", "staging",
    "blog", "shop", "app", "portal", "vpn", "remote", "secure",
    "login", "dashboard", "cdn", "static", "media", "images",
    "support", "help", "docs", "status", "monitor", "beta"
]

async def check_subdomain_active(subdomain: str) -> bool:
    """Subdomain টি active কিনা HTTP request দিয়ে check করে"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"http://{subdomain}", follow_redirects=True)
            return response.status_code < 500
    except:
        return False

def dns_lookup(subdomain: str) -> bool:
    """DNS record আছে কিনা check করে"""
    try:
        dns.resolver.resolve(subdomain, 'A')
        return True
    except:
        return False

async def enumerate_subdomains(domain: str) -> dict:
    """
    Domain এর সব subdomains খুঁজে বের করে।
    Active এবং inactive আলাদা করে return করে।
    """
    active = []
    inactive = []

    print(f"[*] Scanning subdomains for: {domain}")

    for prefix in COMMON_SUBDOMAINS:
        subdomain = f"{prefix}.{domain}"

        # Step 1: DNS check
        has_dns = dns_lookup(subdomain)

        if has_dns:
            # Step 2: HTTP check
            is_active = await check_subdomain_active(subdomain)

            if is_active:
                print(f"[+] ACTIVE: {subdomain}")
                active.append(subdomain)
            else:
                print(f"[-] INACTIVE: {subdomain}")
                inactive.append(subdomain)

    print(f"[*] Done. Active: {len(active)}, Inactive: {len(inactive)}")

    return {
        "domain": domain,
        "active": active,
        "inactive": inactive,
        "total": len(active) + len(inactive)
    }