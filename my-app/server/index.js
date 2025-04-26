// server/index.js
require("dotenv").config(); // Load .env
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3001;

// Middle part
app.use(
  cors({
    origin:['https://mengyuan-shi-yixuan-xiong-project3.onrender.com',
        /^http:\/\/localhost:\d+$/ ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// —— Check router ——
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

//Resource router load
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/games");
const scoresRouter = require("./routes/scores");

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/scores", scoresRouter);

// —— Connect Database ——
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✔️ MongoDB connected");

    const User = require("./models/User");
    const Game = require("./models/Game");
    console.log("Models loaded:", !!User, !!Game);

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
