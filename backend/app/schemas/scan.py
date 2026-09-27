from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class ScanTextRequest(BaseModel):
    text: str = Field(min_length=1, max_length=200_000)
    mask_mode: str = Field(default="mask")  # mask | replace | remove | keep

class DetectedEntity(BaseModel):
    type: str
    value: str
    start: int
    end: int
    confidence: float
    source: str  # ner | regex | validator
    severity: str  # HIGH | MEDIUM | LOW

class ScanResponse(BaseModel):
    scan_id: str
    scan_ref: str
    filename: Optional[str]
    source_type: str
    content_chars: int
    original_text: str
    masked_text: Optional[str]
    entities: List[DetectedEntity]
    entity_counts: Dict[str, int]
    risk_score: float
    risk_level: str
    high_count: int
    medium_count: int
    low_count: int
    mask_mode: str
    created_at: str

class ScanListItem(BaseModel):
    id: str
    scan_ref: str
    filename: Optional[str]
    risk_score: float
    risk_level: str
    total_entities: int
    high_count: int
    created_at: str

class AnalyticsResponse(BaseModel):
    total_scans: int
    high_risk_scans: int
    total_entities: int
    entity_distribution: List[dict]
    avg_risk_score: float
