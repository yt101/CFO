import argparse, json, os, sys, tempfile
from src.ocr_guard import ensure_searchable_pdf, has_meaningful_text
from src.parser import load_anchors, extract_fields_from_pdf

def main():
    ap = argparse.ArgumentParser(description="Parse tax PDFs (native + OCR fallback).")
    ap.add_argument("--pdf", required=True, help="Input PDF path")
    ap.add_argument("--year", required=True, type=int, help="Tax year (e.g., 2024)")
    ap.add_argument("--anchors", default=None, help="Path to anchors JSON (default uses src/anchors/1040_YEAR.json)")
    ap.add_argument("--out", default=None, help="Output JSON path")
    ap.add_argument("--dump-blocks", action="store_true", help="Print raw text blocks for debugging")
    args = ap.parse_args()

    if not os.path.exists(args.pdf):
        print(f"File not found: {args.pdf}", file=sys.stderr)
        sys.exit(1)

    # Choose anchors file
    if args.anchors:
        anchors_path = args.anchors
    else:
        anchors_path = os.path.join("src", "anchors", f"1040_{args.year}.json")

    if not os.path.exists(anchors_path):
        print(f"Anchors file not found: {anchors_path}", file=sys.stderr)
        sys.exit(2)

    # Ensure we can parse text; OCR fallback if needed
    searchable_pdf, used_ocr = ensure_searchable_pdf(args.pdf)

    # Optional debug: dump blocks
    if args.dump-blocks:
        from src.utils.pdf_utils import get_text_blocks
        pages = get_text_blocks(searchable_pdf)
        for p in pages:
            print(f"--- Page {p['page']} ---")
            for b in p["blocks"]:
                print(b)

    # Load anchors & extract
    anchors = load_anchors(anchors_path)
    result = extract_fields_from_pdf(searchable_pdf, anchors)
    result["_meta"]["used_ocr"] = used_ocr
    result["_meta"]["source_pdf"] = os.path.abspath(args.pdf)

    # Save output
    out_path = args.out or os.path.join(tempfile.gettempdir(), "parsed_1040.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"✅ Parsed JSON saved to: {out_path}")
    if used_ocr:
        print("ℹ️ OCR was used to create a searchable copy of the PDF.")

if __name__ == "__main__":
    main()
