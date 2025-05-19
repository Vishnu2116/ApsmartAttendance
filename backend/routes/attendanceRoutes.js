const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// ✅ GET all attendance logs
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM attendances ORDER BY timestamp DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/attendances error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST a new attendance record with IST timestamp
router.post("/", async (req, res) => {
  const { user_id, status } = req.body;

  if (!user_id || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const istNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  try {
    const [result] = await pool.query(
      "INSERT INTO attendances (user_id, status, timestamp) VALUES (?, ?, ?)",
      [user_id, status, istNow]
    );
    res
      .status(201)
      .json({ id: result.insertId, user_id, status, timestamp: istNow });
  } catch (err) {
    console.error("POST /api/attendances error:", err.message);
    res.status(500).json({ error: "Failed to insert attendance record" });
  }
});

module.exports = router;
