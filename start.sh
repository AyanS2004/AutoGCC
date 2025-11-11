#!/bin/bash

echo "================================================================================"
echo "GCC Data Extractor - Startup Script"
echo "================================================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

echo "Starting Flask API Server..."
python3 backend_api.py &
API_PID=$!

echo "Waiting for API to initialize..."
sleep 5

echo "Starting Frontend Development Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================================================================"
echo "Services Started:"
echo "- Flask API: http://localhost:5000 (PID: $API_PID)"
echo "- Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "To start Chrome with debug mode, run:"
echo "google-chrome --remote-debugging-port=9222"
echo "  or"
echo "/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222"
echo ""
echo "Press Ctrl+C to stop all services"
echo "================================================================================"

# Trap Ctrl+C and cleanup
trap "echo ''; echo 'Stopping services...'; kill $API_PID $FRONTEND_PID; exit" INT

# Wait for background processes
wait


