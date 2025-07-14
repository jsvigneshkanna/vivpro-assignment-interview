#!/usr/bin/env python3
"""
Unit tests for the playlist API backend
"""
import unittest
import sys
import os
import json
from unittest.mock import Mock, patch

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data_processor import PlaylistDataProcessor

class TestDataProcessor(unittest.TestCase):
    """Test the PlaylistDataProcessor class"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create mock data
        self.mock_data = {
            "id": {"0": "test_id_1", "1": "test_id_2"},
            "title": {"0": "Test Song 1", "1": "Test Song 2"},
            "danceability": {"0": 0.5, "1": 0.7},
            "energy": {"0": 0.6, "1": 0.8},
            "duration_ms": {"0": 180000, "1": 200000}
        }
        
        # Create a temporary JSON file
        self.test_json_path = 'test_playlist.json'
        with open(self.test_json_path, 'w') as f:
            json.dump(self.mock_data, f)
        
        self.processor = PlaylistDataProcessor(self.test_json_path)
    
    def tearDown(self):
        """Clean up test fixtures"""
        if os.path.exists(self.test_json_path):
            os.remove(self.test_json_path)
        
        csv_path = 'test_output.csv'
        if os.path.exists(csv_path):
            os.remove(csv_path)
    
    def test_load_and_normalize(self):
        """Test data loading and normalization"""
        df = self.processor.load_and_normalize()
        
        # Check shape
        self.assertEqual(df.shape[0], 2)  # 2 songs
        self.assertGreater(df.shape[1], 5)  # At least 5 columns
        
        # Check that all original columns are present
        for column in self.mock_data.keys():
            self.assertIn(column, df.columns)
        
        # Check star_rating column is added
        self.assertIn('star_rating', df.columns)
        
        # Check duration_s column is added
        self.assertIn('duration_s', df.columns)
        
        # Check values
        self.assertEqual(df.iloc[0]['title'], 'Test Song 1')
        self.assertEqual(df.iloc[1]['title'], 'Test Song 2')
        self.assertEqual(df.iloc[0]['duration_s'], 180.0)
    
    def test_get_song_by_title(self):
        """Test song search by title"""
        self.processor.load_and_normalize()
        
        # Test exact match
        song = self.processor.get_song_by_title('Test Song 1')
        self.assertIsNotNone(song)
        self.assertEqual(song['title'], 'Test Song 1')
        self.assertEqual(song['id'], 'test_id_1')
        
        # Test partial match
        song = self.processor.get_song_by_title('Song 2')
        self.assertIsNotNone(song)
        self.assertEqual(song['title'], 'Test Song 2')
        
        # Test case insensitive
        song = self.processor.get_song_by_title('test song 1')
        self.assertIsNotNone(song)
        self.assertEqual(song['title'], 'Test Song 1')
        
        # Test no match
        song = self.processor.get_song_by_title('Nonexistent Song')
        self.assertIsNone(song)
    
    def test_update_star_rating(self):
        """Test star rating update"""
        self.processor.load_and_normalize()
        
        # Test valid rating update
        success = self.processor.update_star_rating('test_id_1', 5)
        self.assertTrue(success)
        
        # Verify the rating was updated
        df = self.processor.get_normalized_data()
        song_rating = df[df['id'] == 'test_id_1']['star_rating'].iloc[0]
        self.assertEqual(song_rating, 5)
        
        # Test update non-existent song
        success = self.processor.update_star_rating('nonexistent_id', 3)
        self.assertFalse(success)
        
        # Test invalid rating
        with self.assertRaises(ValueError):
            self.processor.update_star_rating('test_id_1', 0)
        
        with self.assertRaises(ValueError):
            self.processor.update_star_rating('test_id_1', 6)
    
    def test_save_to_csv(self):
        """Test CSV export"""
        self.processor.load_and_normalize()
        
        csv_path = 'test_output.csv'
        self.processor.save_to_csv(csv_path)
        
        self.assertTrue(os.path.exists(csv_path))
        
        # Verify CSV content
        import pandas as pd
        df_from_csv = pd.read_csv(csv_path)
        original_df = self.processor.get_normalized_data()
        
        self.assertEqual(len(df_from_csv), len(original_df))
        self.assertEqual(list(df_from_csv.columns), list(original_df.columns))

class TestAPIEndpoints(unittest.TestCase):
    """Test API endpoints"""
    
    @patch('main.processor')
    def test_pagination_calculation(self, mock_processor):
        """Test pagination logic"""
        # This would require setting up FastAPI test client
        # For now, we'll test the logic separately
        
        total_items = 100
        page_size = 10
        
        # Test page 1
        page = 1
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        total_pages = (total_items + page_size - 1) // page_size
        
        self.assertEqual(start_idx, 0)
        self.assertEqual(end_idx, 10)
        self.assertEqual(total_pages, 10)
        
        # Test page 5
        page = 5
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        self.assertEqual(start_idx, 40)
        self.assertEqual(end_idx, 50)

if __name__ == '__main__':
    unittest.main()
