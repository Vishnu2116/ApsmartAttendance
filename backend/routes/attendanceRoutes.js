const express = require("express");
const router = express.Router();
const pool = require("../db/db");

// ✅ GET all attendance logs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM attendances ORDER BY timestamp DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/attendances error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST a new attendance record (NO device_id now)
router.post("/", async (req, res) => {
  const { user_id, status } = req.body;

  if (!user_id || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO attendances (user_id, status) VALUES ($1, $2) RETURNING *",
      [user_id, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/attendances error:", err.message);
    res.status(500).json({ error: "Failed to insert attendance record" });
  }
});

module.exports = router;
