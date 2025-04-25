// server/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "token";
const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: "Username existed!" });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, passwordHash: hash });
    await user.save();

    // Cookie issued
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res
      .cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax" })
      .status(201)
      .json({ _id: user._id, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed!" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Incorrect Username or password." });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Incorrect Username or password." });
    }
    // Issue JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    // Set HTTP-only cookie
    res
      .cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax"
        // secure: true,
        // https started when deploy
      })
      .json({ message: "Log in success",_id: user._id,username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Log in failed!" });
  }
};

// GET /api/auth/me
exports.getMe = (req, res) => {
  if (!req.user) {
    return res.json(null);
  }
  res.json({
    id: req.user._id,
    username: req.user.username,
  });
};

exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax" }).json({
    message: "Logged out",
  });
};


exports.me = (req, res) => {
  if (!req.user) {
    // Not login
    return res.json(null);
  }
  // After login send back information
  res.json({
    _id: req.user._id,
    username: req.user.username,
  });
};
