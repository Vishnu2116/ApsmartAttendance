const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // change this if needed

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, "secret123", { expiresIn: "1h" });
    return res.json({ token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

module.exports = router;
