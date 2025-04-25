// server/routes/games.js
const express = require("express");
const router = express.Router();
const gameCtrl = require("../controllers/gameController");
const auth = require("../middleware/auth");
const moveCtrl = require("../controllers/moveController");

// Use login
router.use(auth);

// Create
router.post("/", gameCtrl.createGame);

// List
router.get("/", gameCtrl.listGames);

// Join game
router.post("/:id/join", gameCtrl.joinGame);


router.put("/:id/board", gameCtrl.updatePlayerBoard);

//challenge AI
router.post("/ai", gameCtrl.createGameAI);
// Details
router.get("/:id", gameCtrl.getGame);

//Play
router.post("/:id/move", moveCtrl.makeMove);

module.exports = router;
