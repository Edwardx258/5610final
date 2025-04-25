const Game = require("../models/Game");

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

      game.boardState.set(opponentId, board); // 必须重新set进Map！
      game.markModified('boardState'); // 🚨 告诉Mongoose，boardState变了
      await game.save();

      return res.json(game);
    } else {
      // === Player Attacks AI ===
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
        // === AI Counterattack ===
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
          game.currentTurn = userId; // AI over
        }

        game.boardState.set(userId, boardPlayer); // set board
      }

      game.boardState.set("AI", boardAI); //
      game.markModified('boardState'); // 🚨 Mongoose，boardState change
      await game.save();

      return res.json(game);
    }

  } catch (err) {
    console.error("makeMove error:", err);
    return res.status(500).json({ error: "Move failed." });
  }
};