#!/bin/bash
# Start the Python PDF parser microservice

echo "Starting 1040 PDF Parser Microservice..."
echo "Make sure you have installed the requirements:"
echo "  pip install -r requirements.txt"
echo ""

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    echo "Activating virtual environment..."
    source .venv/bin/activate
fi

# Start the Flask server
python api_server.py











