// server/routes/auth.js
const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");

const authenticate = require("../middleware/auth");

// Registration
router.post("/register", authCtrl.register);

// Log in
router.post("/login", authCtrl.login);

router.get("/me", authenticate, authCtrl.getMe);

// Log out
router.post("/logout", authCtrl.logout);



module.exports = router;
