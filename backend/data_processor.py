
import json
import pandas as pd
from typing import Dict, Any, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PlaylistDataProcessor:
    
    def __init__(self, json_file_path: str):
        self.json_file_path = json_file_path
        self.normalized_data = None
        
    def load_and_normalize(self) -> pd.DataFrame:
        try:
            with open(self.json_file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            logger.info(f"Loaded JSON data with {len(data)} attributes")
            
            normalized_rows = []
            
            # Get the number of songs (assuming all attributes have same number of entries)
            first_key = list(data.keys())[0]
            num_songs = len(data[first_key])
            
            logger.info(f"Processing {num_songs} songs")
            
            for i in range(num_songs):
                row = {'index': i}
                for attribute, values in data.items():
                    row[attribute] = values[str(i)]
                normalized_rows.append(row)
            
            self.normalized_data = pd.DataFrame(normalized_rows)
            
            # Add star_rating column (initially 0 for all songs)
            self.normalized_data['star_rating'] = 0
            
            # Convert duration from ms to seconds for easier processing
            if 'duration_ms' in self.normalized_data.columns:
                self.normalized_data['duration_s'] = self.normalized_data['duration_ms'] / 1000
            
            logger.info(f"Successfully normalized data: {self.normalized_data.shape}")
            logger.info(f"Columns: {list(self.normalized_data.columns)}")
            
            return self.normalized_data
            
        except Exception as e:
            logger.error(f"Error processing data: {str(e)}")
            raise
    
    def get_normalized_data(self) -> pd.DataFrame:
        """Get the normalized DataFrame"""
        if self.normalized_data is None:
            return self.load_and_normalize()
        return self.normalized_data
    
    def save_to_csv(self, output_path: str):
        """Save normalized data to CSV"""
        if self.normalized_data is not None:
            self.normalized_data.to_csv(output_path, index=False)
            logger.info(f"Data saved to {output_path}")
        else:
            logger.warning("No data to save. Run load_and_normalize() first.")
    
    def get_song_by_title(self, title: str) -> Dict[str, Any]:
        """Get song by title (case-insensitive partial match)"""
        if self.normalized_data is None:
            raise ValueError("Data not loaded. Run load_and_normalize() first.")
        
        # Case-insensitive partial match
        matches = self.normalized_data[
            self.normalized_data['title'].str.contains(title, case=False, na=False)
        ]
        
        if len(matches) == 0:
            return None
        
        # Return first match as dictionary
        return matches.iloc[0].to_dict()
    
    def update_star_rating(self, song_id: str, rating: int) -> bool:
        """Update star rating for a song"""
        if self.normalized_data is None:
            raise ValueError("Data not loaded. Run load_and_normalize() first.")
        
        if not (1 <= rating <= 5):
            raise ValueError("Rating must be between 1 and 5")
        
        # Find song by ID
        mask = self.normalized_data['id'] == song_id
        if not mask.any():
            return False
        
        self.normalized_data.loc[mask, 'star_rating'] = rating
        return True

if __name__ == "__main__":
    # Test the processor
    processor = PlaylistDataProcessor('../assets/playlist.json')
    df = processor.load_and_normalize()
    print(f"Normalized data shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"First 5 rows:\n{df.head()}")
    
    # Save to CSV
    processor.save_to_csv('../assets/normalized_playlist.csv')
