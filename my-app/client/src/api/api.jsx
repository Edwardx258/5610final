import axios from "axios";

const BASE_URL = "https://mengyuan-shi-yixuan-xiong-project3.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // for cookie-based auth
  headers: { "Content-Type": "application/json" },
});

// --- Auth APIs ---

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const logoutUser = async () => {
  await api.post("/auth/logout");
};

// --- Game APIs ---

// Fetch all categorized games (for logged-in users)
export const fetchAllGames = async () => {
  const res = await api.get("/games");
  return res.data;
};

// Fetch public games (for guests - NOT logged-in)
export const fetchGamesForGuests = async () => {
  const res = await api.get("/games/guest");
  return res.data;
};

// Fetch single game by ID
export const fetchGame = async (gameId) => {
  const res = await api.get(`/games/${gameId}`);
  return res.data;
};

// Create a new 2-player game
export const createNewGame = async () => {
  const res = await api.post("/games");
  return res.data;
};

// Create a game vs AI
export const createAIGame = async () => {
  const res = await api.post("/games/ai");
  return res.data;
};

// Join an open game
export const joinGame = async (gameId) => {
  const res = await api.post(`/games/${gameId}/join`);
  return res.data;
};

// Update player's board after ship placement
export const updateBoard = async (gameId, board) => {
  const res = await api.put(`/games/${gameId}/board`, { board });
  return res.data;
};

// Make a move in a game
export const makeMove = async (gameId, { row, col }) => {
  const res = await api.post(`/games/${gameId}/move`, { row, col });
  return res.data;
};

export default api;