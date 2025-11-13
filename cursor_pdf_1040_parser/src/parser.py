import json
from typing import Dict, Any, List
from .utils.pdf_utils import get_text_blocks, nearest_numeric_to_anchor, right_of_anchor, below_anchor

def load_anchors(anchor_path: str) -> Dict[str, Any]:
    with open(anchor_path, "r", encoding="utf-8") as f:
        return json.load(f)

def extract_fields_from_pdf(pdf_path: str, anchor_conf: Dict[str, Any]) -> Dict[str, Any]:
    pages = get_text_blocks(pdf_path)
    result = {"_meta": {"pages": len(pages), "anchors_year": anchor_conf.get("year")}}
    evidence: List[Dict[str, Any]] = []

    for field in anchor_conf.get("fields", []):
        key = field["key"]
        label = field["label"]
        strategy = field.get("strategy", "right")
        tol = field.get("tolerance", {})
        value, bbox, page_num = None, None, None

        for page in pages:
            blocks = page["blocks"]
            if strategy == "right":
                value, bbox = right_of_anchor(blocks, label, y_slack=float(tol.get("y_slack", 60)))
            elif strategy == "below":
                value, bbox = below_anchor(blocks, label, x_slack=float(tol.get("x_slack", 40)))
            else:  # nearest_numeric
                value, bbox = nearest_numeric_to_anchor(blocks, label, y_slack=float(tol.get("y_slack", 60)))
            if value:
                page_num = page["page"]
                break

        if value:
            result[key] = value.strip()
            evidence.append({"key": key, "label": label, "page": page_num, "bbox": bbox, "strategy": strategy})
        else:
            result[key] = None
            evidence.append({"key": key, "label": label, "page": None, "bbox": None, "strategy": strategy, "note": "not found"})

    result["_evidence"] = evidence
    return result
