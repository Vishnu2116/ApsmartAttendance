const express = require("express");
const cors = require("cors");
const attendanceRoutes = require("./routes/attendanceRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend-name.onrender.com",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/admin", adminRoutes);

app.use("/api/attendances", attendanceRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Biometric Attendance API is running");
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
