import os
import subprocess
import tempfile
from typing import Optional

def has_meaningful_text(pdf_path: str, min_chars: int = 200) -> bool:
    """Check if the PDF has a usable text layer by sampling pages with PyMuPDF."""
    import fitz  # PyMuPDF
    text_chars = 0
    with fitz.open(pdf_path) as doc:
        for i, page in enumerate(doc):
            txt = page.get_text("text", flags=1)  # normalize ligatures
            if txt:
                text_chars += len(txt.strip())
            if text_chars >= min_chars:
                return True
    return False

def flatten_pdf(input_pdf: str, output_pdf: Optional[str] = None) -> str:
    """
    Try to normalize/troubleshoot weird PDFs before OCR (XFA, encryption, odd encodings).
    Uses qpdf (decrypt/normalize) and ghostscript (flatten) if available.
    """
    if output_pdf is None:
        output_pdf = os.path.join(tempfile.gettempdir(), "flattened.pdf")

    # Step 1: qpdf normalize if available
    try:
        subprocess.run(["qpdf", "--decrypt", "--force-version=1.7", input_pdf, output_pdf], check=True)
        src = output_pdf
    except Exception:
        src = input_pdf  # fall back if qpdf not present

    # Step 2: ghostscript flatten if available
    try:
        tmp = os.path.join(tempfile.gettempdir(), "flattened_gs.pdf")
        subprocess.run(["gs", "-o", tmp, "-sDEVICE=pdfwrite", "-dPDFSETTINGS=/prepress", src], check=True)
        return tmp
    except Exception:
        return src

def ocr_pdf(input_pdf: str, output_pdf: Optional[str] = None, force: bool = True) -> str:
    """Run ocrmypdf to embed a hidden searchable text layer."""
    if output_pdf is None:
        output_pdf = os.path.join(tempfile.gettempdir(), "ocr.pdf")
    args = ["ocrmypdf"]
    if force:
        args.append("--force-ocr")
    args += ["--rotate-pages", "--deskew", "--remove-background", input_pdf, output_pdf]
    subprocess.run(args, check=True)
    return output_pdf

def ensure_searchable_pdf(src_path: str, min_chars: int = 200) -> (str, bool):
    """
    Return (path, used_ocr). If text layer is insufficient, flatten + OCR and return the new path.
    """
    if has_meaningful_text(src_path, min_chars=min_chars):
        return src_path, False
    flat = flatten_pdf(src_path)
    try:
        out = ocr_pdf(flat)
        return out, True
    except Exception:
        # As a last resort, return flattened even if OCR failed
        return flat, False
