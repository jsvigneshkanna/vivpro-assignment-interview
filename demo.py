#!/usr/bin/env python3
"""
Demo script to show data processing functionality
"""
import json
import sys
import os

def demo_data_processing():
    """Demonstrate the data processing functionality"""
    print("Playlist Data Processing Demo")
    print("=" * 50)
    
    # Load the JSON data
    json_path = os.path.join(os.path.dirname(__file__), 'assets', 'playlist.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        print(f"Successfully loaded playlist data")
        print(f"Found {len(data)} attributes")
        
        # Get number of songs
        first_key = list(data.keys())[0]
        num_songs = len(data[first_key])
        print(f"Dataset contains {num_songs} songs")
        
        # Show attributes
        print(f"\nAvailable attributes:")
        for i, attr in enumerate(data.keys(), 1):
            print(f"  {i:2d}. {attr}")
        
        # Show sample normalization
        print(f"\nSample normalized data (first 3 songs):")
        print("-" * 80)
        print(f"{'Index':<5} {'ID':<20} {'Title':<25} {'Danceability':<12} {'Energy':<8}")
        print("-" * 80)
        
        for i in range(min(3, num_songs)):
            idx = str(i)
            song_id = data['id'][idx]
            title = data['title'][idx][:22] + "..." if len(data['title'][idx]) > 22 else data['title'][idx]
            danceability = data['danceability'][idx]
            energy = data['energy'][idx]
            
            print(f"{i:<5} {song_id:<20} {title:<25} {danceability:<12.3f} {energy:<8.3f}")
        
        print("-" * 80)
        
        # Show some statistics
        print(f"\nQuick Statistics:")
        danceability_values = [data['danceability'][str(i)] for i in range(num_songs)]
        energy_values = [data['energy'][str(i)] for i in range(num_songs)]
        duration_values = [data['duration_ms'][str(i)] for i in range(num_songs)]
        
        print(f"  Danceability: {min(danceability_values):.3f} - {max(danceability_values):.3f} (avg: {sum(danceability_values)/len(danceability_values):.3f})")
        print(f"  Energy:       {min(energy_values):.3f} - {max(energy_values):.3f} (avg: {sum(energy_values)/len(energy_values):.3f})")
        print(f"  Duration:     {min(duration_values)/1000:.1f}s - {max(duration_values)/1000:.1f}s (avg: {sum(duration_values)/len(duration_values)/1000:.1f}s)")
        
        print(f"\nData is ready for API serving and frontend visualization!")
        print(f"\nTo start the application:")
        print(f"  1. Backend: cd backend && python main.py")
        print(f"  2. Frontend: cd frontend && npm start")
        print(f"  3. Open: http://localhost:3000")
        
    except FileNotFoundError:
        print(f"Could not find playlist.json at {json_path}")
        print(f"   Make sure you're running this from the project root directory")
    except json.JSONDecodeError:
        print(f"Invalid JSON format in playlist.json")
    except Exception as e:
        print(f"Error processing data: {e}")

if __name__ == "__main__":
    demo_data_processing()
