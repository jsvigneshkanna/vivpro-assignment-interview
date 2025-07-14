import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import { playlistAPI } from "./api";

// Mock the API
jest.mock("./api", () => ({
  playlistAPI: {
    getSongs: jest.fn(),
    searchSong: jest.fn(),
    updateRating: jest.fn(),
    exportCSV: jest.fn(),
  },
}));

const mockSongs = [
  {
    id: "1",
    title: "Test Song 1",
    danceability: 0.5,
    energy: 0.6,
    acousticness: 0.1,
    tempo: 120,
    duration_ms: 180000,
    star_rating: 0,
  },
  {
    id: "2",
    title: "Test Song 2",
    danceability: 0.7,
    energy: 0.8,
    acousticness: 0.2,
    tempo: 140,
    duration_ms: 200000,
    star_rating: 3,
  },
];

const mockPaginatedResponse = {
  songs: mockSongs,
  total: 2,
  page: 1,
  size: 10,
  total_pages: 1,
};

beforeEach(() => {
  playlistAPI.getSongs.mockResolvedValue(mockPaginatedResponse);
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders playlist dashboard", async () => {
  render(<App />);

  expect(screen.getByText("Playlist Dashboard")).toBeInTheDocument();
  expect(
    screen.getByText("Manage and explore your music collection")
  ).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("Test Song 1")).toBeInTheDocument();
    expect(screen.getByText("Test Song 2")).toBeInTheDocument();
  });
});

test("loads songs on mount", async () => {
  render(<App />);

  await waitFor(() => {
    expect(playlistAPI.getSongs).toHaveBeenCalledWith(1, 10);
  });
});

test("displays song data in table", async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText("Test Song 1")).toBeInTheDocument();
    expect(screen.getByText("Test Song 2")).toBeInTheDocument();
    expect(screen.getByText("0.500")).toBeInTheDocument(); // danceability
    expect(screen.getByText("120.0")).toBeInTheDocument(); // tempo
  });
});

test("search functionality works", async () => {
  const mockSearchResult = {
    id: "1",
    title: "Test Song 1",
    danceability: 0.5,
    energy: 0.6,
    acousticness: 0.1,
    tempo: 120,
    duration_ms: 180000,
    star_rating: 0,
  };

  playlistAPI.searchSong.mockResolvedValue(mockSearchResult);

  render(<App />);

  const searchInput = screen.getByPlaceholderText("Search by song title...");
  const searchButton = screen.getByText("Get Song");

  fireEvent.change(searchInput, { target: { value: "Test Song 1" } });
  fireEvent.click(searchButton);

  await waitFor(() => {
    expect(playlistAPI.searchSong).toHaveBeenCalledWith("Test Song 1");
  });
});

test("export CSV functionality", async () => {
  const mockBlob = new Blob(["csv data"], { type: "text/csv" });
  playlistAPI.exportCSV.mockResolvedValue(mockBlob);

  // Mock URL.createObjectURL
  global.URL.createObjectURL = jest.fn(() => "blob:url");
  global.URL.revokeObjectURL = jest.fn();

  render(<App />);

  const exportButton = screen.getByText("Export CSV");
  fireEvent.click(exportButton);

  await waitFor(() => {
    expect(playlistAPI.exportCSV).toHaveBeenCalled();
  });
});

test("star rating component renders", async () => {
  render(<App />);

  await waitFor(() => {
    const stars = screen.getAllByText("★");
    expect(stars.length).toBeGreaterThan(0);
  });
});

test("sorting functionality", async () => {
  render(<App />);

  await waitFor(() => {
    const titleHeader = screen.getByText("Title");
    fireEvent.click(titleHeader);

    // Check that the header has sorting class
    expect(titleHeader).toHaveClass("asc");
  });
});

test("handles API errors gracefully", async () => {
  playlistAPI.getSongs.mockRejectedValue(new Error("API Error"));

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/Failed to load songs/)).toBeInTheDocument();
  });
});

test("pagination is displayed when needed", async () => {
  const mockResponseWithPagination = {
    ...mockPaginatedResponse,
    total_pages: 5,
  };

  playlistAPI.getSongs.mockResolvedValue(mockResponseWithPagination);

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });
});
