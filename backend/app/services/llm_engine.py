from app.services.rag_retriever import retrieve_context


def analyze_incident(detection: dict, log: dict) -> dict:
    rag = retrieve_context(detection)
    confidence = round(detection["signal_strength"] * 100, 2)
    return {
        "classification": detection["category"],
        "confidence": confidence,
        "reasoning": f"Detected {detection['category']} pattern from {log['source']} with severity {detection['severity']}.",
        "mitre_ids": [r.split()[1] for r in rag["references"] if r.startswith("ATT&CK")],
        "rag_references": rag["references"],
        "suggested_mitigation": rag["references"][-1],
    }
