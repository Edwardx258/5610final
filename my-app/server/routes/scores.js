// server/routes/scores.js
const express = require("express");
const router = express.Router();
const scoreCtrl = require("../controllers/scoreController");


router.get("/", scoreCtrl.listScores);

module.exports = router;
