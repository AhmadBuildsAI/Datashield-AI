"""
Apply masking to text based on detected entities.
"""
from typing import List, Dict


def apply_masking(text: str, entities: List[Dict], mode: str = "mask") -> str:
    if mode == "keep" or not entities:
        return text
    
    # Sort by start descending so replacements don't shift indices
    sorted_e = sorted(entities, key=lambda e: e["start"], reverse=True)
    
    result = text
    for e in sorted_e:
        start, end = e["start"], e["end"]
        if mode == "mask":
            replacement = f"[{e['type']}]"
        elif mode == "replace":
            replacement = f"<{e['type']}_REDACTED>"
        elif mode == "remove":
            replacement = ""
        else:
            continue
        result = result[:start] + replacement + result[end:]
    
    return result
