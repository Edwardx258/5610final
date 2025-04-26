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
            type: Map,
            of: [[String]],
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
        scoresUpdated: { type: Boolean, default: false },
        isAI: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);