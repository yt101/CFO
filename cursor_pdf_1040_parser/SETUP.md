# Python PDF Parser Setup

This microservice provides enhanced PDF parsing for 1040 tax returns using OCR capabilities.

## Quick Start

### Windows

```bash
# Navigate to the parser directory
cd cursor_pdf_1040_parser

# Install system dependencies (requires admin)
# You may need to install:
# - Python 3.8+
# - Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki
# - Ghostscript: https://www.ghostscript.com/download/gsdnld.html

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start the server
python api_server.py

# Or use the batch script
start_server.bat
```

### Linux/Mac

```bash
# Navigate to the parser directory
cd cursor_pdf_1040_parser

# Install system dependencies
# Ubuntu/Debian:
sudo apt-get update && sudo apt-get install -y ocrmypdf tesseract-ocr qpdf ghostscript

# MacOS:
brew install tesseract ghostscript qpdf ocrmypdf

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the server
python3 api_server.py

# Or use the shell script
chmod +x start_server.sh
./start_server.sh
```

## How It Works

1. **Text Detection**: Checks if PDF has extractable text
2. **OCR Fallback**: Automatically runs OCR using Tesseract for scanned PDFs
3. **Anchor Extraction**: Uses coordinate-based strategies to find values near labels
4. **Conversion**: Extracts numeric values from formatted strings

## API Endpoints

### `POST /parse`

Parses a 1040 tax PDF.

**Request:**
- `file`: PDF file (multipart/form-data)
- `year`: Tax year (default: 2024)

**Response:**
```json
{
  "primary_name": "John Doe",
  "agi": "$125,000",
  "total_tax": "$15,000",
  "refund": "$500",
  "_meta": {
    "used_ocr": true,
    "year": 2024
  },
  "_evidence": [...]
}
```

### `GET /health`

Health check endpoint.

### `GET /available-years`

Returns supported tax years.

## Integration with Next.js

The Next.js app automatically calls this service when it's running on `http://localhost:8000`. 

To configure a different URL, set the environment variable:
```bash
PYTHON_PARSER_URL=http://your-server:8000
```

## Supported Tax Software

- ✅ TurboTax
- ✅ H&R Block
- ✅ ProConnect (Intuit)
- ✅ TaxAct
- ✅ Free File Fillable Forms (IRS)
- ✅ Any PDF with standard 1040 layout

## Troubleshooting

### "No module named 'flask'"
Solution: Install requirements: `pip install -r requirements.txt`

### OCR not working
Solution: Install Tesseract OCR from https://github.com/tesseract-ocr/tesseract

### "OCRMyPDF not found"
Solution: Install ocrmypdf: `pip install ocrmypdf`

## Testing

Test the service directly:

```bash
curl -X POST http://localhost:8000/parse \
  -F "file=@/path/to/tax_return.pdf" \
  -F "year=2024"
```











