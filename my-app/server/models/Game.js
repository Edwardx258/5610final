// server/models/Game.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const moveSchema = new Schema(
  {
    by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    result: { type: String, enum: ["H", "M"], required: true },
  },
  { timestamps: true }
);

const gameSchema = new Schema(
  {
    players: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    boardState: {
      // Each player's board status
      type: Map,
      of: [[String]], // Map<userId, string[][]>
      default: {},
    },
    moves: [moveSchema],
    status: {
      type: String,
      enum: ["open", "active", "completed"],
      default: "open",
    },
    currentTurn: { type: Schema.Types.ObjectId, ref: "User" },
    winner: { type: Schema.Types.ObjectId, ref: "User", default: null },
      isAI: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);
