from app.services.rag_knowledge_base import knowledge_lookup


def retrieve_context(detection: dict) -> dict:
    refs = knowledge_lookup(detection["category"])
    return {"references": refs, "corpus": ["MITRE", "CVE", "Threat Reports", "SOC Playbooks"]}
