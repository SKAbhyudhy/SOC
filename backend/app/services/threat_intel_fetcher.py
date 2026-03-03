from app.integrations.vt_connector import query_virustotal
from app.integrations.abuseipdb_connector import query_abuseipdb
from app.integrations.intel_correlator import correlate_intel


def enrich_threat(ioc: str) -> dict:
    vt = query_virustotal(ioc)
    abuse = query_abuseipdb(ioc)
    correlated = correlate_intel(vt, abuse)
    return {**vt, **abuse, **correlated, "sources": ["VirusTotal", "AbuseIPDB", "CVE", "OTX"]}
