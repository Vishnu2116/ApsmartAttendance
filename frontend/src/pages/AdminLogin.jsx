import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify"; // ✅ import toast

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setPassword("");
    setUsername("");
    if (!username || !password) {
      toast.warning("Please enter both username and password.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5005/api/admin/login", {
        username,
        password,
      });

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("loggedInUser", username);
      navigate("/admin-dashboard");
    } catch (err) {
      toast.error("Invalid username or password."); // ✅ show toast instead of inline text
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Navbar />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            minWidth: "350px",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "25px", color: "#2c3e50" }}>
            Admin Login
          </h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "10px",
              marginBottom: "15px",
              width: "100%",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "10px",
              marginBottom: "20px",
              width: "100%",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
          <br />
          <button
            onClick={handleLogin}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#2c3e50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Login
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "25px",
              textDecoration: "underline",
              background: "none",
              color: "#3498db",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Back to Main Page
          </button>
        </div>
      </div>
    </div>
  );
}
