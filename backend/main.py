#!/usr/bin/env python3
"""
FastAPI backend for playlist data API
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import uvicorn
import os
import logging
from data_processor import PlaylistDataProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Playlist API", description="API for playlist data management", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data processor instance
processor = None

# Pydantic models
class Song(BaseModel):
    index: int
    id: str
    title: str
    danceability: float
    energy: float
    key: int
    loudness: float
    mode: int
    acousticness: float
    instrumentalness: float
    liveness: float
    valence: float
    tempo: float
    duration_ms: int
    time_signature: int
    num_bars: int
    num_sections: int
    num_segments: int
    star_rating: int = 0
    duration_s: Optional[float] = None

class RatingUpdate(BaseModel):
    song_id: str
    rating: int

class PaginatedResponse(BaseModel):
    songs: List[Song]
    total: int
    page: int
    size: int
    total_pages: int

@app.on_event("startup")
async def startup_event():
    """Initialize data processor on startup"""
    global processor
    try:
        json_path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'playlist.json')
        processor = PlaylistDataProcessor(json_path)
        processor.load_and_normalize()
        logger.info("Data processor initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize data processor: {str(e)}")
        raise

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Playlist API is running", "version": "1.0.0"}

@app.get("/api/songs", response_model=PaginatedResponse)
async def get_all_songs(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page")
):
    """Get all songs with pagination"""
    try:
        df = processor.get_normalized_data()
        total = len(df)
        
        # Calculate pagination
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        
        # Get paginated data
        paginated_df = df.iloc[start_idx:end_idx]
        
        # Convert to list of dictionaries
        songs = []
        for _, row in paginated_df.iterrows():
            song_dict = row.to_dict()
            # Ensure all required fields are present
            if 'duration_s' not in song_dict:
                song_dict['duration_s'] = song_dict.get('duration_ms', 0) / 1000
            songs.append(Song(**song_dict))
        
        total_pages = (total + size - 1) // size  # Ceiling division
        
        return PaginatedResponse(
            songs=songs,
            total=total,
            page=page,
            size=size,
            total_pages=total_pages
        )
    
    except Exception as e:
        logger.error(f"Error retrieving songs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/songs/search")
async def search_song_by_title(title: str = Query(..., description="Song title to search for")):
    """Search for a song by title"""
    try:
        song = processor.get_song_by_title(title)
        
        if song is None:
            raise HTTPException(status_code=404, detail=f"No song found with title containing '{title}'")
        
        # Ensure duration_s field exists
        if 'duration_s' not in song:
            song['duration_s'] = song.get('duration_ms', 0) / 1000
            
        return Song(**song)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching for song: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/songs/rating")
async def update_song_rating(rating_update: RatingUpdate):
    """Update star rating for a song"""
    try:
        if not (1 <= rating_update.rating <= 5):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        success = processor.update_star_rating(rating_update.song_id, rating_update.rating)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Song with ID '{rating_update.song_id}' not found")
        
        return {"message": "Rating updated successfully", "song_id": rating_update.song_id, "rating": rating_update.rating}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating rating: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/export/csv")
async def export_to_csv():
    """Export all data to CSV file"""
    try:
        df = processor.get_normalized_data()
        
        # Create temp directory if it doesn't exist
        temp_dir = os.path.join(os.path.dirname(__file__), 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        
        csv_path = os.path.join(temp_dir, 'playlist_export.csv')
        df.to_csv(csv_path, index=False)
        
        return FileResponse(
            path=csv_path,
            filename="playlist_data.csv",
            media_type="text/csv"
        )
    
    except Exception as e:
        logger.error(f"Error exporting CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_statistics():
    """Get basic statistics about the dataset"""
    try:
        df = processor.get_normalized_data()
        
        numeric_columns = ['danceability', 'energy', 'acousticness', 'tempo', 'duration_s', 'valence']
        stats = {}
        
        for col in numeric_columns:
            if col in df.columns:
                stats[col] = {
                    'min': float(df[col].min()),
                    'max': float(df[col].max()),
                    'mean': float(df[col].mean()),
                    'median': float(df[col].median())
                }
        
        return {
            'total_songs': len(df),
            'statistics': stats
        }
    
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
