// server/controllers/scoreController.js
const User = require("../models/User");

exports.listScores = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $project: {
          username: 1,
          wins: 1,
          losses: 1,
        },
      },
      { $sort: { wins: -1, losses: 1, username: 1 } },
    ]);
    res.json(stats);
  } catch (err) {
    console.error("List scores failed:", err);
    res.status(500).json({ error: "Failed to list scores." });
  }
};
