const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const attendanceRoutes = require("./routes/attendanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const samlRoutes = require("./routes/saml.route");

const app = express();
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://apsmartattendance.onrender.com",
      "https://andhrapradhesh.onelogin.com",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for SAML (production only)
if (IS_PRODUCTION) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-session-secret",
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
}

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/", samlRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Biometric Attendance API is running");
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (IS_PRODUCTION) {
    console.log("SAML authentication enabled");
  }
});
