from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from ..core.database import Base
import uuid

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_ref = Column(String(20), unique=True, nullable=False, index=True)
    filename = Column(String(255), nullable=True)
    source_type = Column(String(20), nullable=False, default="text")  # text | file
    content_chars = Column(Integer, nullable=False, default=0)
    
    original_text = Column(Text, nullable=False)
    masked_text = Column(Text, nullable=True)
    
    entities = Column(JSONB, nullable=False)  # [{type, value, start, end, confidence, source, severity}]
    entity_counts = Column(JSONB, nullable=False)  # {EMAIL: 3, PHONE: 2, ...}
    
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), index=True)
