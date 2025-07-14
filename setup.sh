#!/bin/bash

# Playlist Management Dashboard Setup Script

echo "Setting up Playlist Management Dashboard..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "Prerequisites check passed"

# Setup Backend
echo "Setting up Backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

echo "Backend setup complete"

# Setup Frontend
echo "Setting up Frontend..."
cd ../frontend

# Install Node dependencies
npm install

echo "Frontend setup complete"

echo "Setup complete! To start the application:"
echo ""
echo "Backend (Terminal 1):"
echo "cd backend"
echo "source venv/bin/activate"
echo "python main.py"
echo ""
echo "Frontend (Terminal 2):"
echo "cd frontend"
echo "npm start"
echo ""
echo "Then open http://localhost:3000 in your browser"
