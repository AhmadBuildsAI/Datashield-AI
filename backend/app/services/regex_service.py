"""
Regex + validator based detection for structured PII.
All detections carry source='regex' or 'validator'.
"""
import re
from typing import List, Dict


# ==== Pakistan + International phone patterns ====
PHONE_PATTERNS = [
    re.compile(r"\b03\d{2}[- ]?\d{7}\b"),                # 0300-1234567
    re.compile(r"\+92[- ]?3\d{2}[- ]?\d{7}\b"),          # +92 300 1234567
    re.compile(r"\b0\d{2,4}[- ]?\d{6,8}\b"),             # landline
    re.compile(r"\+\d{1,3}[- ]?\d{6,14}\b"),             # international
]

EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")

CNIC_RE = re.compile(r"\b\d{5}-\d{7}-\d\b")

PASSPORT_RE = re.compile(r"\b[A-Z]{2}\d{7}\b")

# Credit card: 13-19 digits with optional separators
CC_RE = re.compile(r"\b(?:\d[ -]*?){13,19}\b")

BANK_RE = re.compile(r"\b(?:account|acct|iban)[\s:]*([A-Z0-9\-]{10,34})\b", re.IGNORECASE)

API_KEY_PATTERNS = [
    re.compile(r"\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"\bAIza[0-9A-Za-z\-_]{35}\b"),           # Google
    re.compile(r"\bghp_[A-Za-z0-9]{36}\b"),              # GitHub
    re.compile(r"\b[A-Fa-f0-9]{32,64}\b"),               # Generic hex tokens
]

PASSWORD_RE = re.compile(
    r"(?:password|passwd|pwd|secret|token)\s*[:=]\s*['\"]?([^\s'\"]{4,})['\"]?",
    re.IGNORECASE,
)

IP_RE = re.compile(r"\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b")

DATE_PATTERNS = [
    re.compile(r"\b\d{4}-\d{2}-\d{2}\b"),
    re.compile(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b"),
    re.compile(r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b"),
]


def _luhn_valid(number: str) -> bool:
    digits = [int(d) for d in number if d.isdigit()]
    if len(digits) < 13:
        return False
    checksum = 0
    parity = len(digits) % 2
    for i, d in enumerate(digits):
        if i % 2 == parity:
            d *= 2
            if d > 9:
                d -= 9
        checksum += d
    return checksum % 10 == 0


def _add(entities: List[Dict], etype: str, value: str, start: int, end: int,
         confidence: float, source: str):
    entities.append({
        "type": etype,
        "value": value,
        "start": start,
        "end": end,
        "confidence": confidence,
        "source": source,
    })


def detect_regex_entities(text: str) -> List[Dict]:
    entities: List[Dict] = []
    
    # EMAIL
    for m in EMAIL_RE.finditer(text):
        _add(entities, "EMAIL", m.group(0), m.start(), m.end(), 0.99, "regex")
    
    # PHONE (multiple patterns)
    for pat in PHONE_PATTERNS:
        for m in pat.finditer(text):
            v = m.group(0)
            if 7 <= len(re.sub(r"\D", "", v)) <= 15:
                _add(entities, "PHONE", v, m.start(), m.end(), 0.93, "regex")
    
    # CNIC
    for m in CNIC_RE.finditer(text):
        _add(entities, "CNIC", m.group(0), m.start(), m.end(), 0.98, "validator")
    
    # PASSPORT
    for m in PASSPORT_RE.finditer(text):
        _add(entities, "PASSPORT", m.group(0), m.start(), m.end(), 0.85, "regex")
    
    # CREDIT_CARD (with Luhn validation)
    for m in CC_RE.finditer(text):
        raw = m.group(0)
        digits = re.sub(r"\D", "", raw)
        if 13 <= len(digits) <= 19 and _luhn_valid(digits):
            _add(entities, "CREDIT_CARD", raw, m.start(), m.end(), 0.97, "validator")
    
    # BANK ACCOUNT
    for m in BANK_RE.finditer(text):
        _add(entities, "BANK_ACCOUNT", m.group(1), m.start(1), m.end(1), 0.88, "regex")
    
    # API KEYS
    for pat in API_KEY_PATTERNS:
        for m in pat.finditer(text):
            _add(entities, "API_KEY", m.group(0), m.start(), m.end(), 0.9, "regex")
    
    # PASSWORDS
    for m in PASSWORD_RE.finditer(text):
        _add(entities, "PASSWORD", m.group(1), m.start(1), m.end(1), 0.87, "regex")
    
    # IP ADDRESS
    for m in IP_RE.finditer(text):
        _add(entities, "IP_ADDRESS", m.group(0), m.start(), m.end(), 0.9, "validator")
    
    # DATES
    for pat in DATE_PATTERNS:
        for m in pat.finditer(text):
            _add(entities, "DATE", m.group(0), m.start(), m.end(), 0.8, "regex")
    
    return entities
