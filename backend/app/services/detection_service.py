"""
Merge NER + regex detections, deduplicate overlapping spans.
Prefer higher confidence + longer span.
"""
from typing import List, Dict
from ..core.config import settings


def _overlaps(a: Dict, b: Dict) -> bool:
    return not (a["end"] <= b["start"] or b["end"] <= a["start"])


def merge_detections(*lists: List[Dict]) -> List[Dict]:
    all_entities: List[Dict] = []
    for lst in lists:
        all_entities.extend(lst)
    
    # Sort by (confidence desc, length desc)
    all_entities.sort(key=lambda e: (-e["confidence"], -(e["end"] - e["start"])))
    
    kept: List[Dict] = []
    for e in all_entities:
        if any(_overlaps(e, k) for k in kept):
            continue
        kept.append(e)
    
    # Assign severity
    for e in kept:
        if e["type"] in settings.HIGH_RISK_ENTITIES:
            e["severity"] = "HIGH"
        elif e["type"] in settings.MEDIUM_RISK_ENTITIES:
            e["severity"] = "MEDIUM"
        else:
            e["severity"] = "LOW"
    
    kept.sort(key=lambda e: e["start"])
    return kept


def count_by_type(entities: List[Dict]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for e in entities:
        counts[e["type"]] = counts.get(e["type"], 0) + 1
    return counts
