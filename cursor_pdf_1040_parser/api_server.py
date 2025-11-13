#!/usr/bin/env python3
"""
Flask API server for the 1040 PDF parser.
Exposes OCR-backed PDF parsing as a REST endpoint.
"""
import os
import sys
import tempfile
import json
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pathlib import Path
from src.ocr_guard import ensure_searchable_pdf
from src.parser import load_anchors, extract_fields_from_pdf
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': '1040-pdf-parser',
        'version': '1.0.0'
    })

@app.route('/parse', methods=['POST'])
def parse_pdf():
    """
    Parse a 1040 tax PDF.
    
    Expects:
    - multipart/form-data with 'file' field
    - Optional 'year' query param (defaults to 2024)
    - Optional 'anchors' query param (path to custom anchors file)
    
    Returns:
    - JSON with extracted fields and evidence
    """
    try:
        # Get year from query param or default to 2024
        year = int(request.args.get('year', 2024))
        
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save uploaded file to temp location
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            file.save(tmp_file.name)
            pdf_path = tmp_file.name
        
        try:
            # Ensure searchable PDF (OCR if needed)
            searchable_pdf, used_ocr = ensure_searchable_pdf(pdf_path)
            
            # Determine anchors file
            anchors_path = os.path.join('src', 'anchors', f'1040_{year}.json')
            if not os.path.exists(anchors_path):
                return jsonify({
                    'error': f'Anchors file not found for year {year}',
                    'available_years': ['2024']  # Add more as you add anchor files
                }), 400
            
            # Load anchors and extract fields
            anchors = load_anchors(anchors_path)
            result = extract_fields_from_pdf(searchable_pdf, anchors)
            
            # Add metadata
            result['_meta'] = result.get('_meta', {})
            result['_meta']['used_ocr'] = used_ocr
            result['_meta']['source_filename'] = file.filename
            result['_meta']['year'] = year
            
            # Convert numeric strings to numbers where appropriate
            for key, value in result.items():
                if key not in ['_meta', '_evidence'] and value is not None:
                    try:
                        # Remove $ and commas and convert
                        cleaned = str(value).replace('$', '').replace(',', '').strip()
                        if cleaned and '.' not in cleaned:
                            result[key] = int(cleaned)
                        elif cleaned:
                            result[key] = float(cleaned)
                    except (ValueError, AttributeError):
                        pass  # Keep as string
            
            return jsonify(result)
            
        finally:
            # Clean up temp files
            try:
                os.unlink(pdf_path)
            except:
                pass
            if 'searchable_pdf' in locals() and searchable_pdf != pdf_path:
                try:
                    os.unlink(searchable_pdf)
                except:
                    pass
                    
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to parse PDF',
            'details': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/available-years', methods=['GET'])
def get_available_years():
    """Return list of tax years for which anchors exist"""
    anchors_dir = Path('src/anchors')
    years = []
    if anchors_dir.exists():
        for anchor_file in anchors_dir.glob('1040_*.json'):
            year_str = anchor_file.stem.split('_')[1]
            years.append(year_str)
    return jsonify({'years': sorted(years)})

if __name__ == '__main__':
    # Run on all interfaces, port 8000
    app.run(host='0.0.0.0', port=8000, debug=True)











