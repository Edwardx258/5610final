const Game = require("../models/Game");
const User = require("../models/User");

exports.makeMove = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { row, col } = req.body;
    const game = await Game.findById(req.params.id);

    if (!game) return res.status(404).json({ error: "Game not found." });
    if (game.status !== "active") {
      return res.status(400).json({ error: "Game is not active." });
    }

    const isAI = game.isAI;
    const isMyTurn = game.currentTurn.toString() === userId;

    if (!isMyTurn) {
      return res.status(403).json({ error: "Not your turn." });
    }

    if (!isAI) {
      // === PvP Logic ===
      const opponentId = game.players.map(p => p.toString()).find(id => id !== userId);
      const board = game.boardState.get(opponentId);

      if (!board || !board[row] || board[row][col] === "H" || board[row][col] === "M") {
        return res.status(400).json({ error: "Invalid move." });
      }

      const hit = board[row][col] === "S";
      board[row][col] = hit ? "H" : "M";

      game.moves.push({ by: userId, row, col, result: hit ? "H" : "M" });

      const opponentHasShips = board.flat().some(cell => cell === "S");
      if (!opponentHasShips) {
        game.status = "completed";
        game.winner = userId;
      } else {
        game.currentTurn = opponentId;
      }

      game.boardState.set(opponentId, board);
      game.markModified('boardState');
      await game.save();

    } else {
      // === Player vs AI Logic ===
      const boardAI = game.boardState.get("AI");

      if (!boardAI || !boardAI[row] || boardAI[row][col] === "H" || boardAI[row][col] === "M") {
        return res.status(400).json({ error: "Invalid move." });
      }

      const hitPlayer = boardAI[row][col] === "S";
      boardAI[row][col] = hitPlayer ? "H" : "M";

      game.moves.push({ by: userId, row, col, result: hitPlayer ? "H" : "M" });

      const aiHasShips = boardAI.flat().some(c => c === "S");
      if (!aiHasShips) {
        game.status = "completed";
        game.winner = userId;
      } else {
        // AI Counterattack
        const boardPlayer = game.boardState.get(userId);
        const availableMoves = [];

        for (let r = 0; r < boardPlayer.length; r++) {
          for (let c = 0; c < boardPlayer[r].length; c++) {
            if (boardPlayer[r][c] !== "H" && boardPlayer[r][c] !== "M") {
              availableMoves.push({ r, c });
            }
          }
        }

        if (availableMoves.length === 0) {
          return res.status(500).json({ error: "AI has no valid moves left." });
        }

        const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        const hitAI = boardPlayer[move.r][move.c] === "S";
        boardPlayer[move.r][move.c] = hitAI ? "H" : "M";

        game.moves.push({ by: "AI", row: move.r, col: move.c, result: hitAI ? "H" : "M" });

        const playerHasShips = boardPlayer.flat().some(c => c === "S");
        if (!playerHasShips) {
          game.status = "completed";
          game.winner = "AI";
        } else {
          game.currentTurn = userId;
        }

        game.boardState.set(userId, boardPlayer);
      }

      game.boardState.set("AI", boardAI);
      game.markModified('boardState');
      await game.save();
    }

    // === After each move, check if we need to update scores ===
    if (game.status === "completed" && !game.scoresUpdated) {
      const winnerId = game.winner?.toString();
      const loserId = game.players.find(p => p.toString() !== winnerId);

      if (winnerId && loserId) {
        await User.findByIdAndUpdate(winnerId, { $inc: { wins: 1 } });
        await User.findByIdAndUpdate(loserId, { $inc: { losses: 1 } });

        game.scoresUpdated = true;
        await game.save();
      }
    }

    res.json(game);

  } catch (err) {
    console.error("makeMove error:", err);
    return res.status(500).json({ error: "Move failed." });
  }
};