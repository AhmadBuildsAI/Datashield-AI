"""
Ingest text from .txt / .csv / .md / .log files.
"""
import csv
import io
from pathlib import Path


def read_file_content(filename: str, contents: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    try:
        text = contents.decode("utf-8", errors="ignore")
    except Exception:
        return ""
    
    if suffix == ".csv":
        # Read as text but flatten rows for analysis
        try:
            reader = csv.reader(io.StringIO(text))
            rows = [" | ".join(row) for row in reader]
            return "\n".join(rows)
        except Exception:
            return text
    
    return text
