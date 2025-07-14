# Playlist Management Dashboard

A full-stack application for managing and analyzing music playlist data, built with Python FastAPI backend and React frontend.

## Features

### Data Processing (1.1)

- JSON data normalization from key-value pairs to tabular format
- In-memory data storage with DataFrame processing
- Data validation and type conversion
- Added star rating functionality

### Backend API (1.2)

- **[MUST HAVE]** REST API to serve all normalized data with pagination
- **[MUST HAVE]** Search songs by title (case-insensitive partial match)
- **[NICE TO HAVE]** Star rating system (1-5 stars)
- **[BONUS]** Unit tests for backend functionality
- CSV export functionality
- Statistics endpoint

### Frontend Dashboard (1.3)

- **[MUST HAVE]** Load and display all songs in tabular format
- **[MUST HAVE]** Pagination (10 rows per page)
- **[MUST HAVE]** Sortable columns (ascending/descending)
- **[MUST HAVE]** CSV download functionality
- **[MUST HAVE]** Song search by title
- **[NICE TO HAVE]** Star rating interface with backend integration
- **[NICE TO HAVE]** Scatter chart for danceability values
- **[NICE TO HAVE]** Histogram for song duration
- **[NICE TO HAVE]** Bar charts for acousticness and tempo
- **[BONUS]** Unit tests for frontend components

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server:**

   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`

   **API Documentation:** `http://localhost:8000/docs` (Swagger UI)

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## Running Tests

### Backend Tests

```bash
cd backend
python test_backend.py
```

### Frontend Tests

```bash
cd frontend
npm test
```

## API Documentation

### Endpoints

#### GET `/api/songs`

Get paginated list of songs

- **Query Parameters:**
  - `page` (int, optional): Page number (default: 1)
  - `size` (int, optional): Items per page (default: 10, max: 100)
- **Response:** Paginated list with metadata

#### GET `/api/songs/search`

Search for songs by title

- **Query Parameters:**
  - `title` (string, required): Song title to search for
- **Response:** Single song object or 404 if not found

#### POST `/api/songs/rating`

Update song star rating

- **Body:**
  ```json
  {
    "song_id": "string",
    "rating": 1-5
  }
  ```
- **Response:** Success confirmation

#### GET `/api/export/csv`

Export all data as CSV file

- **Response:** CSV file download

#### GET `/api/stats`

Get dataset statistics

- **Response:** Basic statistics for numeric columns

## Architecture

### Backend

- **FastAPI:** Modern, fast web framework for building APIs
- **Pandas:** Data manipulation and analysis
- **Pydantic:** Data validation using Python type annotations
- **Uvicorn:** ASGI server for running the application

### Frontend

- **React:** Component-based UI library
- **Chart.js:** Interactive charts and visualizations
- **Axios:** HTTP client for API communication
- **CSS3:** Modern styling with responsive design

### Data Flow

1. JSON data is normalized using `PlaylistDataProcessor`
2. FastAPI serves data through REST endpoints
3. React frontend consumes API and renders interactive UI
4. User interactions (rating, search, export) trigger API calls
5. Charts are generated client-side using processed data

## Features Details

### Data Normalization

The original JSON structure with key-value mappings is converted to a normalized table format:

**Original:**

```json
{
  "id": { "0": "song_id_1", "1": "song_id_2" },
  "title": { "0": "Song 1", "1": "Song 2" }
}
```

**Normalized:**

```
index | id        | title  | danceability | ... | star_rating
0     | song_id_1 | Song 1 | 0.521       | ... | 0
1     | song_id_2 | Song 2 | 0.735       | ... | 0
```

### Interactive Features

- **Sorting:** Click column headers to sort (toggles ASC/DESC)
- **Pagination:** Navigate through pages with Previous/Next controls
- **Search:** Find songs by partial title match (case-insensitive)
- **Rating:** Click stars to rate songs (1-5 stars)
- **Export:** Download complete dataset as CSV
- **Charts:** Visualize data distributions and patterns

### Responsive Design

- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-friendly controls

## Development

### Project Structure

```
├── assets/
│   └── playlist.json          # Original dataset
├── backend/
│   ├── data_processor.py      # Data normalization logic
│   ├── main.py               # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── test_backend.py       # Backend unit tests
├── frontend/
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.js           # Main application
│   │   ├── api.js           # API client
│   │   └── *.test.js        # Test files
│   └── package.json         # Node.js dependencies
└── README.md
```

### Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:8000
```

### Adding New Features

1. **Backend:** Add new endpoints in `main.py`
2. **Frontend:** Create components in `src/components/`
3. **Tests:** Add test cases for new functionality
4. **Documentation:** Update this README

## Production Deployment

### Backend Deployment

```bash
# Using Gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment

```bash
npm run build
# Serve the build/ directory with your web server
```

### Docker Support

Create `Dockerfile` for containerized deployment:

**Backend Dockerfile:**

```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**

```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Enhancements

- [ ] User authentication and personal playlists
- [ ] Advanced filtering (by genre, year, etc.)
- [ ] Playlist recommendations based on ratings
- [ ] Real-time collaborative features
- [ ] Integration with streaming services
- [ ] Advanced analytics and insights
- [ ] Batch operations (bulk rating, editing)

## Support

For questions or issues:

1. Check existing [GitHub Issues](../../issues)
2. Create a new issue with detailed description
3. Include error logs and reproduction steps

---
