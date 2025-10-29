@echo off
echo 🚀 Starting EDA Application...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Start Django Backend
echo 📊 Starting Django Backend...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 🔧 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo 📦 Installing Python dependencies...
    pip install -r requirements.txt
)

REM Run migrations
echo 🗄️ Running database migrations...
python manage.py makemigrations
python manage.py migrate

REM Check if data exists, if not import it
if not exist "db.sqlite3" (
    echo 📥 Importing data...
    python import_data.py
)

REM Start Django server in background
echo 🌐 Starting Django server on port 8000...
start /b python manage.py runserver 8000

REM Go back to root directory
cd ..

REM Start React Frontend
echo ⚛️ Starting React Frontend...
cd frontend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

REM Start React development server
echo 🌐 Starting React server on port 3000...
start /b npm start

REM Go back to root directory
cd ..

echo.
echo ✅ EDA Application is starting up!
echo.
echo 📊 Backend API: http://localhost:8000
echo ⚛️ Frontend App: http://localhost:3000
echo.
echo 🔧 Press any key to stop the application...
pause >nul

echo.
echo 🛑 Stopping EDA Application...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo ✅ Application stopped.
pause
