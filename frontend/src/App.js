import React, { useState, useEffect } from "react";
import { playlistAPI } from "./api";
import StarRating from "./components/StarRating";
import Pagination from "./components/Pagination";
import Charts from "./components/Charts";

function App() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);
  const [pageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTitle, setSearchTitle] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [showCharts, setShowCharts] = useState(false);
  const [allSongs, setAllSongs] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSongs();
  }, [currentPage]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await playlistAPI.getSongs(currentPage, pageSize);
      setSongs(response.songs);
      setTotalPages(response.total_pages);
      setTotalSongs(response.total);
    } catch (err) {
      setError("Failed to load songs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSongs = async () => {
    try {
      setLoading(true);
      // Load all songs for charts (assuming max 1000 songs)
      const response = await playlistAPI.getSongs(1, 1000);
      setAllSongs(response.songs);
    } catch (err) {
      setError("Failed to load all songs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedSongs = [...songs].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setSongs(sortedSongs);
  };

  const handleSearch = async () => {
    if (!searchTitle.trim()) {
      setSearchResult(null);
      return;
    }

    try {
      setLoading(true);
      const result = await playlistAPI.searchSong(searchTitle.trim());
      setSearchResult(result);
      showMessage("Song found!", "success");
    } catch (err) {
      setSearchResult(null);
      if (err.response?.status === 404) {
        showMessage("No song found with that title", "error");
      } else {
        showMessage("Error searching for song: " + err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (songId, rating) => {
    try {
      await playlistAPI.updateRating(songId, rating);

      // Update the rating in the current songs list
      setSongs(
        songs.map((song) =>
          song.id === songId ? { ...song, star_rating: rating } : song
        )
      );

      // Update the rating in search result if it matches
      if (searchResult && searchResult.id === songId) {
        setSearchResult({ ...searchResult, star_rating: rating });
      }

      showMessage("Rating updated successfully!", "success");
    } catch (err) {
      showMessage("Failed to update rating: " + err.message, "error");
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await playlistAPI.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "playlist_data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showMessage("CSV exported successfully!", "success");
    } catch (err) {
      showMessage("Failed to export CSV: " + err.message, "error");
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleCharts = () => {
    setShowCharts(!showCharts);
    if (!showCharts && allSongs.length === 0) {
      loadAllSongs();
    }
  };

  const getSortClassName = (columnKey) => {
    if (sortConfig.key !== columnKey) return "sortable";
    return sortConfig.direction === "asc" ? "asc" : "desc";
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Playlist Dashboard</h1>
        <p>Manage and explore your music collection</p>
      </div>

      {message && (
        <div className={message.type === "error" ? "error" : "success"}>
          {message.text}
        </div>
      )}

      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by song title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Get Song
          </button>
        </div>

        <button className="btn btn-success" onClick={handleExportCSV}>
          Export CSV
        </button>

        <button className="btn btn-primary" onClick={toggleCharts}>
          {showCharts ? "Hide Charts" : "Show Charts"}
        </button>
      </div>

      {searchResult && (
        <div className="table-container">
          <h3>Search Result</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Danceability</th>
                <th>Energy</th>
                <th>Acousticness</th>
                <th>Tempo</th>
                <th>Duration</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{searchResult.title}</td>
                <td>{searchResult.danceability?.toFixed(3)}</td>
                <td>{searchResult.energy?.toFixed(3)}</td>
                <td>{searchResult.acousticness?.toFixed(3)}</td>
                <td>{searchResult.tempo?.toFixed(1)}</td>
                <td>{formatDuration(searchResult.duration_ms)}</td>
                <td>
                  <StarRating
                    rating={searchResult.star_rating || 0}
                    onRatingChange={handleRatingChange}
                    songId={searchResult.id}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}

      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="table-container">
            <h3>Songs ({totalSongs} total)</h3>
            <table className="table">
              <thead>
                <tr>
                  <th
                    className={getSortClassName("title")}
                    onClick={() => handleSort("title")}
                  >
                    Title
                  </th>
                  <th
                    className={getSortClassName("danceability")}
                    onClick={() => handleSort("danceability")}
                  >
                    Danceability
                  </th>
                  <th
                    className={getSortClassName("energy")}
                    onClick={() => handleSort("energy")}
                  >
                    Energy
                  </th>
                  <th
                    className={getSortClassName("acousticness")}
                    onClick={() => handleSort("acousticness")}
                  >
                    Acousticness
                  </th>
                  <th
                    className={getSortClassName("tempo")}
                    onClick={() => handleSort("tempo")}
                  >
                    Tempo
                  </th>
                  <th
                    className={getSortClassName("duration_ms")}
                    onClick={() => handleSort("duration_ms")}
                  >
                    Duration
                  </th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => (
                  <tr key={song.id}>
                    <td title={song.title}>{song.title}</td>
                    <td>{song.danceability?.toFixed(3)}</td>
                    <td>{song.energy?.toFixed(3)}</td>
                    <td>{song.acousticness?.toFixed(3)}</td>
                    <td>{song.tempo?.toFixed(1)}</td>
                    <td>{formatDuration(song.duration_ms)}</td>
                    <td>
                      <StarRating
                        rating={song.star_rating || 0}
                        onRatingChange={handleRatingChange}
                        songId={song.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          {showCharts && allSongs.length > 0 && <Charts songs={allSongs} />}
        </>
      )}
    </div>
  );
}

export default App;
