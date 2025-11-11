@echo off
echo ================================================================================
echo GCC Data Extractor - Startup Script
echo ================================================================================
echo.

echo Starting Flask API Server...
start "Flask API" cmd /k python backend_api.py

echo Waiting for API to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Development Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ================================================================================
echo Services Starting:
echo - Flask API: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Starting Chrome with debug mode...
echo ================================================================================

REM Kill any existing Chrome processes to ensure clean start
echo Closing any existing Chrome instances...
taskkill /F /IM chrome.exe >nul 2>&1
timeout /t 2 /nobreak > nul

REM Try to find Chrome and start it with debugging enabled using PowerShell
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "Chrome Debug" powershell -Command "& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --remote-debugging-port=9222 --user-data-dir='%TEMP%\chrome_debug_profile' http://localhost:3000"
    echo Chrome started with debugging on port 9222
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "Chrome Debug" powershell -Command "& 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' --remote-debugging-port=9222 --user-data-dir='%TEMP%\chrome_debug_profile' http://localhost:3000"
    echo Chrome started with debugging on port 9222
) else (
    echo WARNING: Chrome not found in default locations.
    echo Please manually start Chrome with: chrome.exe --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome_debug_profile"
    echo.
)

echo Waiting for Chrome to initialize debug port...
timeout /t 5 /nobreak > nul

echo.
echo All services started successfully!
echo Close this window to keep services running, or press Ctrl+C to stop.
pause


