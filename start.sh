#!/bin/bash

# EDA Application Startup Script
echo "🚀 Starting EDA Application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Start Django Backend
echo "📊 Starting Django Backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Check if data exists, if not import it
if [ ! -f "db.sqlite3" ] || [ ! -s "db.sqlite3" ]; then
    echo "📥 Importing data..."
    python import_data.py
fi

# Start Django server in background
echo "🌐 Starting Django server on port 8000..."
python manage.py runserver 8000 &
DJANGO_PID=$!

# Go back to root directory
cd ..

# Start React Frontend
echo "⚛️ Starting React Frontend..."
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start React development server
echo "🌐 Starting React server on port 3000..."
npm start &
REACT_PID=$!

# Go back to root directory
cd ..

echo ""
echo "✅ EDA Application is starting up!"
echo ""
echo "📊 Backend API: http://localhost:8000"
echo "⚛️ Frontend App: http://localhost:3000"
echo ""
echo "🔧 To stop the application, press Ctrl+C"
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping EDA Application..."
    kill $DJANGO_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    echo "✅ Application stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
