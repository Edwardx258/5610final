// src/controllers/gameController.js
const Game = require("../models/Game");
const { createEmptyBoard, placeShipsOnBoard } = require("../services/shipService");

// Create new game (for PvP)
exports.createGame = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const game = new Game({
      players: [userId],
      boardState: new Map(),
      status: "open",
    });
    await game.save();
    res.status(201).json(game);
  } catch (err) {
    console.error("Create game failed:", err);
    res.status(500).json({ error: "Create failed." });
  }
};

// Create a new AI game
exports.createGameAI = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const emptyBoard = createEmptyBoard();
    const aiBoard = placeShipsOnBoard(createEmptyBoard());

    const game = new Game({
      players: [userId, "AI"],
      isAI: true,
      currentTurn: userId,
      boardState: new Map([
        [userId, emptyBoard],
        ["AI", aiBoard],
      ]),
      status: "open",
    });

    await game.save();
    res.status(201).json({ id: game._id });
  } catch (err) {
    console.error("Create AI game failed:", err);
    res.status(500).json({ error: "Create AI game failed." });
  }
};

// Player joins an existing PvP game
exports.joinGame = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found." });

    if (game.players.some(pid => pid.toString() === userId)) {
      return res.status(400).json({ error: "Cannot join your own game." });
    }

    if (game.players.length >= 2) {
      return res.status(400).json({ error: "Room is full." });
    }

    game.players.push(userId);

    const boardState = new Map(game.boardState);
    boardState.set(userId, createEmptyBoard());
    game.boardState = boardState;

    await game.save();
    res.json(game);
  } catch (err) {
    console.error("Join game failed:", err);
    res.status(500).json({ error: "Join failed." });
  }
};

// Update the player's board after they place ships
exports.updatePlayerBoard = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { board } = req.body;
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found." });

    const boardState = new Map(game.boardState);
    boardState.set(userId, board);
    game.boardState = boardState;

    // If both players (or player+AI) have placed ships
    if (game.isAI || (game.players.length === 2 && boardState.size === 2)) {
      game.status = "active";

      // ⚡ Ensure currentTurn is set when battle begins
      if (!game.currentTurn) {
        game.currentTurn = game.players[0]; // Let creator go first
      }
    }

    await game.save();
    return res.json({ id: game._id });
  } catch (err) {
    console.error("Update board failed:", err);
    res.status(500).json({ error: "Update board failed." });
  }
};

// List games for logged-in users
exports.listGames = async (req, res) => {
  try {
    const userId = req.user._id;
    const all = await Game.find().populate("players", "username winner").exec();

    const open = all.filter(
        (g) => g.status === "open" && !g.players.some((p) => p._id.equals(userId))
    );
    const myOpen = all.filter(
        (g) => g.status === "open" && g.players.some((p) => p._id.equals(userId))
    );
    const active = all.filter(
        (g) => g.status === "active" && g.players.some((p) => p._id.equals(userId))
    );
    const completed = all.filter(
        (g) => g.status === "completed" && g.players.some((p) => p._id.equals(userId))
    );
    const otherGames = all.filter(
        (g) =>
            (g.status === "active" || g.status === "completed") &&
            !g.players.some((p) => p._id.equals(userId))
    );

    res.json({ open, myOpen, active, completed, otherGames });
  } catch (err) {
    console.error("List games failed:", err);
    res.status(500).json({ error: "List games failed." });
  }
};

// Guest view (no login required)
exports.listGamesForGuests = async (req, res) => {
  try {
    const all = await Game.find().populate("players", "username winner").exec();
    const active = all.filter((g) => g.status === "active");
    const completed = all.filter((g) => g.status === "completed");

    res.json({ active, completed });
  } catch (err) {
    console.error("Guest list failed:", err);
    res.status(500).json({ error: "Guest list failed." });
  }
};

// Get a single game by ID
exports.getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
        .populate("players", "username")
        .populate("winner", "username")
        .exec();

    if (!game) return res.status(404).json({ error: "Game not found." });

    const obj = game.toObject();
    obj.boardState = Object.fromEntries(game.boardState);

    res.json(obj);
  } catch (err) {
    console.error("Get game failed:", err);
    res.status(500).json({ error: "Get game failed." });
  }
};