const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 🔍 Debug Logs
  console.log("📥 Received username:", `"${username}"`);
  console.log("📥 Received password:", `"${password}"`);
  console.log("✅ Expected username:", `"${ADMIN_USERNAME}"`);
  console.log("✅ Expected password:", `"${ADMIN_PASSWORD}"`);

  if (
    username?.trim() === ADMIN_USERNAME &&
    password?.trim() === ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ username }, "secret123", { expiresIn: "1h" });
    console.log("✅ Admin authenticated");
    return res.json({ token });
  }

  console.log("❌ Invalid credentials");
  return res.status(401).json({ error: "Invalid credentials" });
});

module.exports = router;
