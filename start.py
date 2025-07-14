#!/usr/bin/env python3
"""
Quick start script for the playlist application
"""
import subprocess
import sys
import os
import time
import threading

def run_backend():
    """Run the backend server"""
    print("Starting backend server...")
    try:
        backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
        os.chdir(backend_dir)
        
        # Try to activate virtual environment if it exists
        venv_python = os.path.join('venv', 'bin', 'python')
        if os.path.exists(venv_python):
            subprocess.run([venv_python, 'main.py'])
        else:
            # Fall back to system python
            subprocess.run([sys.executable, 'main.py'])
    except Exception as e:
        print(f"Backend error: {e}")

def run_frontend():
    """Run the frontend development server"""
    print("Starting frontend server...")
    try:
        frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')
        os.chdir(frontend_dir)
        subprocess.run(['npm', 'start'])
    except Exception as e:
        print(f"Frontend error: {e}")

def main():
    """Main function to start both servers"""
    print("Starting Playlist Management Dashboard...")
    print("Press Ctrl+C to stop both servers")
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Give backend time to start
    time.sleep(3)
    
    # Start frontend (this will block)
    try:
        run_frontend()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        sys.exit(0)

if __name__ == "__main__":
    main()
