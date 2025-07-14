import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const playlistAPI = {
  // Get all songs with pagination
  getSongs: async (page = 1, size = 10) => {
    const response = await api.get(`/api/songs?page=${page}&size=${size}`);
    return response.data;
  },

  // Search song by title
  searchSong: async (title) => {
    const response = await api.get(
      `/api/songs/search?title=${encodeURIComponent(title)}`
    );
    return response.data;
  },

  // Update song rating
  updateRating: async (songId, rating) => {
    const response = await api.post("/api/songs/rating", {
      song_id: songId,
      rating: rating,
    });
    return response.data;
  },

  // Export to CSV
  exportCSV: async () => {
    const response = await api.get("/api/export/csv", {
      responseType: "blob",
    });
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get("/api/stats");
    return response.data;
  },
};

export default api;
