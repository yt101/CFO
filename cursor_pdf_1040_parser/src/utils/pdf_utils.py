from typing import List, Dict, Any, Tuple

def get_text_blocks(pdf_path: str) -> List[Dict[str, Any]]:
    """
    Extract text blocks from each page using PyMuPDF.
    Returns a list of dicts: {"page": int, "blocks": List[Tuple[x0,y0,x1,y1,text, ...]]}
    """
    import fitz
    out = []
    with fitz.open(pdf_path) as doc:
        for i, page in enumerate(doc):
            blocks = page.get_text("blocks")  # tuples: (x0, y0, x1, y1, text, block_no, ...)
            out.append({"page": i+1, "blocks": blocks})
    return out

def nearest_numeric_to_anchor(blocks, anchor_text: str, y_slack: float = 60.0, prefer_right: bool = True):
    """
    Find a numeric-looking block near the anchor. By default, search to the right on the same row (±y_slack).
    """
    low_anchor = anchor_text.lower()
    anchors = [b for b in blocks if low_anchor in str(b[4]).lower()]
    if not anchors:
        return None, None
    ax0, ay0, ax1, ay1, atext, *rest = anchors[0]

    # candidates: numeric text on same row-ish
    import re
    num_re = re.compile(r"[0-9][0-9,\.]*")
    candidates = []
    for b in blocks:
        x0, y0, x1, y1, txt, *_ = b
        if not txt or not num_re.search(txt):
            continue
        same_row = abs(y0 - ay0) <= y_slack
        right_side = x0 >= ax1
        if same_row and ((prefer_right and right_side) or not prefer_right):
            candidates.append((abs(y0 - ay0), x0, (x0,y0,x1,y1), txt))

    if not candidates:
        # fallback: nearest numeric anywhere in vicinity
        for b in blocks:
            x0, y0, x1, y1, txt, *_ = b
            if not txt or not num_re.search(txt):
                continue
            candidates.append((abs(y0 - ay0) + abs(x0 - ax0), x0, (x0,y0,x1,y1), txt))

    if not candidates:
        return None, None

    candidates.sort(key=lambda t: (t[0], t[1]))
    _, _, bbox, text = candidates[0]
    return text, bbox

def right_of_anchor(blocks, anchor_text: str, y_slack: float = 60.0):
    """Return the nearest text block to the right of the anchor on the same row-ish."""
    low_anchor = anchor_text.lower()
    anchors = [b for b in blocks if low_anchor in str(b[4]).lower()]
    if not anchors:
        return None, None
    ax0, ay0, ax1, ay1, atext, *rest = anchors[0]
    # Find nearest block to the right
    candidates = []
    for b in blocks:
        x0, y0, x1, y1, txt, *_ = b
        if abs(y0 - ay0) <= y_slack and x0 > ax1 and txt and txt.strip():
            candidates.append((abs(y0 - ay0), x0, (x0,y0,x1,y1), txt))
    if not candidates:
        return None, None
    candidates.sort(key=lambda t: (t[0], t[1]))
    return candidates[0][3], candidates[0][2]

def below_anchor(blocks, anchor_text: str, x_slack: float = 40.0):
    """Return nearest block below the anchor (same column-ish)."""
    low_anchor = anchor_text.lower()
    anchors = [b for b in blocks if low_anchor in str(b[4]).lower()]
    if not anchors:
        return None, None
    ax0, ay0, ax1, ay1, atext, *rest = anchors[0]
    candidates = []
    for b in blocks:
        x0, y0, x1, y1, txt, *_ = b
        same_col = abs(x0 - ax0) <= x_slack or abs(x1 - ax1) <= x_slack
        if y0 > ay1 and same_col and txt and txt.strip():
            candidates.append((y0 - ay1, (x0,y0,x1,y1), txt))
    if not candidates:
        return None, None
    candidates.sort(key=lambda t: t[0])
    return candidates[0][2], candidates[0][1]
