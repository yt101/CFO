@echo off
echo Starting 1040 PDF Parser Microservice...
echo.

if exist .venv (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
)

echo Installing/updating requirements...
pip install -r requirements.txt

echo.
echo Starting Flask server on port 8000...
python api_server.py

pause











