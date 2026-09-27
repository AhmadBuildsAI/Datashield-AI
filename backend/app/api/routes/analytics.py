from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json
from pathlib import Path

from ...core.database import get_db
from ...core.config import settings
from ...models.scan import Scan
from ...models.user import User
from ...schemas.scan import AnalyticsResponse
from ...api.dependencies.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scans = db.query(Scan).filter(Scan.created_by == current_user.id).all()
    total = len(scans)
    high_risk_scans = sum(1 for s in scans if s.risk_level == "HIGH")
    
    total_entities = sum(len(s.entities or []) for s in scans)
    
    agg: dict = {}
    for s in scans:
        for k, v in (s.entity_counts or {}).items():
            agg[k] = agg.get(k, 0) + v
    
    distribution = [
        {"type": k, "count": v} for k, v in sorted(agg.items(), key=lambda x: x[1], reverse=True)
    ]
    
    avg_risk = sum(s.risk_score for s in scans) / total if total else 0.0
    
    return {
        "total_scans": total,
        "high_risk_scans": high_risk_scans,
        "total_entities": total_entities,
        "entity_distribution": distribution,
        "avg_risk_score": round(avg_risk, 2),
    }


@router.get("/model-info")
def model_info(current_user: User = Depends(get_current_user)):
    p = Path(settings.NER_METRICS_PATH)
    if p.exists():
        with open(p) as f:
            return json.load(f)
    return {
        "model_name": "DistilBERT Token Classification",
        "framework": "PyTorch + Hugging Face Transformers",
        "detection_layers": [
            "Transformer NER (PERSON, ORGANIZATION, LOCATION)",
            "Regex + Validator (EMAIL, PHONE, CNIC, PASSPORT, CC, BANK, API_KEY, PASSWORD, IP, DATE)",
        ],
        "entity_types": settings.ENTITY_TYPES,
        "metrics": {},
        "status": "heuristic_fallback",
        "note": "Train the bundled NER model to populate evaluation metrics.",
    }
