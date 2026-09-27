"""
Transformer NER service using DistilBERT token classification.
Falls back to a lightweight spaCy-free heuristic when model isn't trained.
"""
from pathlib import Path
from typing import List, Dict
from ..core.config import settings


class NERService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.load_model()
    
    def load_model(self):
        try:
            path = Path(settings.NER_MODEL_PATH)
            if path.exists():
                from transformers import AutoTokenizer, AutoModelForTokenClassification
                self.tokenizer = AutoTokenizer.from_pretrained(str(path))
                self.model = AutoModelForTokenClassification.from_pretrained(str(path))
                print(f"✅ Loaded NER model from {path}")
            else:
                print("⚠️  NER model not found. Using heuristic fallback.")
        except Exception as e:
            print(f"NER loading error: {e}")
    
    def detect(self, text: str) -> List[Dict]:
        if self.model is None or self.tokenizer is None:
            return self._heuristic_person_org(text)
        
        import torch
        inputs = self.tokenizer(
            text, return_tensors="pt", truncation=True,
            max_length=512, return_offsets_mapping=True,
        )
        offsets = inputs.pop("offset_mapping")[0].tolist()
        
        with torch.no_grad():
            logits = self.model(**inputs).logits
        preds = torch.argmax(logits, dim=-1)[0].tolist()
        
        id2label = self.model.config.id2label
        entities = []
        cur = None
        for i, (start, end) in enumerate(offsets):
            if start == end:
                continue
            label = id2label.get(preds[i], "O")
            if label.startswith("B-"):
                if cur:
                    entities.append(cur)
                cur = {"type": label[2:], "start": start, "end": end, "value": text[start:end]}
            elif label.startswith("I-") and cur:
                cur["end"] = end
                cur["value"] = text[cur["start"]:end]
            else:
                if cur:
                    entities.append(cur)
                    cur = None
        if cur:
            entities.append(cur)
        
        return [
            {
                "type": e["type"],
                "value": e["value"].strip(),
                "start": e["start"],
                "end": e["end"],
                "confidence": 0.85,
                "source": "ner",
            }
            for e in entities if e["value"].strip()
        ]
    
    def _heuristic_person_org(self, text: str) -> List[Dict]:
        """
        Regex-based fallback: capitalized bigrams as PERSON.
        Not as good as a trained model but keeps the app runnable.
        """
        import re
        pattern = re.compile(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b")
        out = []
        for m in pattern.finditer(text):
            out.append({
                "type": "PERSON",
                "value": m.group(0),
                "start": m.start(),
                "end": m.end(),
                "confidence": 0.55,
                "source": "heuristic",
            })
        return out


ner_service = NERService()
