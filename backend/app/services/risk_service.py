"""
Privacy risk scoring.
"""
from typing import List, Dict
from ..core.config import settings


SEVERITY_WEIGHT = {"HIGH": 8, "MEDIUM": 4, "LOW": 2}


def compute_risk(entities: List[Dict]) -> Dict:
    high = sum(1 for e in entities if e["severity"] == "HIGH")
    medium = sum(1 for e in entities if e["severity"] == "MEDIUM")
    low = sum(1 for e in entities if e["severity"] == "LOW")
    
    raw = high * SEVERITY_WEIGHT["HIGH"] + medium * SEVERITY_WEIGHT["MEDIUM"] + low * SEVERITY_WEIGHT["LOW"]
    
    # Bonus for diversity
    unique_types = len({e["type"] for e in entities})
    raw += unique_types * 2
    
    score = min(100.0, float(raw))
    
    if score >= 70:
        level = "HIGH"
    elif score >= 40:
        level = "MEDIUM"
    else:
        level = "LOW"
    
    return {
        "risk_score": round(score, 2),
        "risk_level": level,
        "high_count": high,
        "medium_count": medium,
        "low_count": low,
    }
