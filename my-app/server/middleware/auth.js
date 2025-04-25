// server/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function authenticate(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ error: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Authentication error" });
  }
};
