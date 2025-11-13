# Cursor-Ready PDF Tax Parser (1040) — Native + OCR Fallback

This starter lets you parse **searchable PDFs** exported by tax prep software **or** scanned PDFs by
adding an OCR fallback automatically. It's **not** hardcoded for any vendor; it relies on
**year-specific anchor labels** you can tweak in `src/anchors/`.

## Key Features
- **Text-layer check**: detects when a PDF is image-only and triggers OCR.
- **OCR fallback**: uses `ocrmypdf` (Tesseract under the hood) to embed a searchable text layer.
- **Anchor-based extraction**: finds values near labels like "Adjusted gross income", "Total tax".
- **Auditability**: stores which page/anchor/coords were used per extracted value.
- **Year versioning**: anchors are versioned by tax year; supports minor label drift without locking to a vendor.

## Quick Start (CLI)
1) Install system deps (Linux/Mac usually available; Windows via WSL recommended):
   ```bash
   # OCR + PDF utilities
   # Ubuntu/Debian example:
   sudo apt-get update && sudo apt-get install -y ocrmypdf tesseract-ocr qpdf ghostscript
   ```

2) Create a Python env and install:
   ```bash
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```

3) Run the CLI:
   ```bash
   python app.py --pdf /path/to/tax_return.pdf --year 2024 --out /path/to/output.json
   ```

4) Output includes parsed JSON and optional searchable-PDF (if OCR was used).

## Typical Flow
- For **native PDFs** (exported from software): parsed directly via PyMuPDF.
- For **scanned PDFs**: automatically flattened and OCR'd, then parsed.

## Extending
- Add/edit anchors in `src/anchors/1040_YYYY.json`.
- Add more fields under `"fields"` with `"label"`, `"strategy"` (`right`, `below`, `nearest_numeric`), and optional `"tolerance"` (pixels).

## Notes
- Accuracy depends on clean anchors and consistent layouts. Use `--dump-blocks` to inspect raw blocks and improve anchors.
- If you also parse Schedules (A, B, C...), add anchor files like `1040A_2024.json` and call the parser per form.
