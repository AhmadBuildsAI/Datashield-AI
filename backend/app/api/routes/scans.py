from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pathlib import Path

from ...core.database import get_db
from ...core.config import settings
from ...models.scan import Scan
from ...models.user import User
from ...schemas.scan import (
    ScanTextRequest, ScanResponse, ScanListItem, DetectedEntity,
)
from ...services.ner_service import ner_service
from ...services.regex_service import detect_regex_entities
from ...services.detection_service import merge_detections, count_by_type
from ...services.risk_service import compute_risk
from ...services.masking_service import apply_masking
from ...services.ingest_service import read_file_content
from ...api.dependencies.auth import get_current_user

router = APIRouter(prefix="/scans", tags=["scans"])


def _run_scan(text: str, mask_mode: str, filename: str | None, source_type: str,
              db: Session, user_id: str) -> ScanResponse:
    if not text.strip():
        raise HTTPException(status_code=400, detail="Empty text")
    if len(text) > settings.MAX_CHARS:
        raise HTTPException(status_code=413, detail="Input too large")
    
    ner_entities = ner_service.detect(text)
    regex_entities = detect_regex_entities(text)
    entities = merge_detections(ner_entities, regex_entities)
    
    counts = count_by_type(entities)
    risk = compute_risk(entities)
    masked_text = apply_masking(text, entities, mask_mode)
    
    count = db.query(Scan).count()
    ref = f"DS-{10001 + count}"
    scan = Scan(
        scan_ref=ref,
        filename=filename,
        source_type=source_type,
        content_chars=len(text),
        original_text=text,
        masked_text=masked_text,
        entities=entities,
        entity_counts=counts,
        risk_score=risk["risk_score"],
        risk_level=risk["risk_level"],
        high_count=risk["high_count"],
        medium_count=risk["medium_count"],
        low_count=risk["low_count"],
        created_by=user_id,
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    return ScanResponse(
        scan_id=str(scan.id),
        scan_ref=ref,
        filename=filename,
        source_type=source_type,
        content_chars=scan.content_chars,
        original_text=scan.original_text,
        masked_text=scan.masked_text,
        entities=[DetectedEntity(**e) for e in entities],
        entity_counts=counts,
        risk_score=scan.risk_score,
        risk_level=scan.risk_level,
        high_count=scan.high_count,
        medium_count=scan.medium_count,
        low_count=scan.low_count,
        mask_mode=mask_mode,
        created_at=scan.created_at.isoformat(),
    )


@router.post("/text", response_model=ScanResponse)
def scan_text(
    payload: ScanTextRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _run_scan(payload.text, payload.mask_mode, None, "text", db, current_user.id)


@router.post("/file", response_model=ScanResponse)
async def scan_file(
    file: UploadFile = File(...),
    mask_mode: str = Form("mask"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")
    
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB")
    
    text = read_file_content(file.filename or "upload", contents)
    return _run_scan(text, mask_mode, file.filename, "file", db, current_user.id)


@router.get("/", response_model=list[ScanListItem])
def list_scans(
    limit: int = 50,
    risk_level: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Scan).filter(Scan.created_by == current_user.id)
    if risk_level:
        q = q.filter(Scan.risk_level == risk_level)
    rows = q.order_by(desc(Scan.created_at)).limit(limit).all()
    return [
        ScanListItem(
            id=str(s.id),
            scan_ref=s.scan_ref,
            filename=s.filename,
            risk_score=s.risk_score,
            risk_level=s.risk_level,
            total_entities=len(s.entities or []),
            high_count=s.high_count,
            created_at=s.created_at.isoformat(),
        ) for s in rows
    ]


@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = db.query(Scan).filter(
        Scan.id == scan_id, Scan.created_by == current_user.id
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scan not found")
    return ScanResponse(
        scan_id=str(s.id),
        scan_ref=s.scan_ref,
        filename=s.filename,
        source_type=s.source_type,
        content_chars=s.content_chars,
        original_text=s.original_text,
        masked_text=s.masked_text,
        entities=[DetectedEntity(**e) for e in (s.entities or [])],
        entity_counts=s.entity_counts or {},
        risk_score=s.risk_score,
        risk_level=s.risk_level,
        high_count=s.high_count,
        medium_count=s.medium_count,
        low_count=s.low_count,
        mask_mode="mask",
        created_at=s.created_at.isoformat(),
    )


@router.post("/{scan_id}/remask", response_model=ScanResponse)
def remask(
    scan_id: str,
    mask_mode: str = Form("mask"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = db.query(Scan).filter(
        Scan.id == scan_id, Scan.created_by == current_user.id
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scan not found")
    s.masked_text = apply_masking(s.original_text, s.entities or [], mask_mode)
    db.commit()
    return get_scan(scan_id, db, current_user)
