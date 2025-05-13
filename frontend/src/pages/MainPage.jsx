import React, { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const [name, setName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleAuthenticate = async () => {
    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    try {
      const result = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([
            /* dummy */
          ]),
          allowCredentials: [],
          timeout: 60000,
          userVerification: "preferred",
        },
      });

      if (result) {
        await axios.post("http://localhost:5005/api/attendances", {
          user_id: name,
          status: "Success",
        });
        setMessage("");
        setModalVisible(true);
        console.log("✅ Modal should now show");

        setTimeout(() => {
          setModalVisible(false);
          console.log("⏱️ Modal hidden after 2 seconds");
        }, 2000);
      }
    } catch (err) {
      await axios.post("http://localhost:5005/api/attendances", {
        user_id: name,
        status: "Failed",
      });
      setMessage("Authentication failed. Please try again.");
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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "30px",
        }}
      >
        <h2>Please record your attendance</h2>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            fontSize: "16px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
        <br />
        <button
          onClick={handleAuthenticate}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#2c3e50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Authenticate
        </button>

        {message && (
          <div style={{ marginTop: "15px", color: "red" }}>{message}</div>
        )}

        <div style={{ marginTop: "25px" }}>
          <button
            onClick={() => navigate("/admin-login")}
            style={{
              background: "none",
              color: "#3498db",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "15px",
              border: "none",
            }}
          >
            Admin Login
          </button>
        </div>
      </div>

      {/* ✅ Success Modal */}
      {modalVisible && (
        <div
          style={{
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
          }}
        >
          <h3>✅ Attendance Recorded</h3>
        </div>
      )}
    </div>
  );
}
