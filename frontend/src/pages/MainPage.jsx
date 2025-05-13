import React, { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

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
      const credentialId = localStorage.getItem("credentialId");
      if (!credentialId) {
        alert("Please register your fingerprint first.");
        return;
      }

      const publicKey = {
        challenge: new Uint8Array(32),
        timeout: 60000,
        userVerification: "required",
        allowCredentials: [
          {
            id: Uint8Array.from(atob(credentialId), (c) => c.charCodeAt(0)),
            type: "public-key",
            transports: ["internal"],
          },
        ],
      };

      await navigator.credentials.get({ publicKey });

      await axios.post(`${API_BASE_URL}/api/attendances`, {
        user_id: name,
        status: "Success",
      });

      setMessage("");
      setModalVisible(true);
      setTimeout(() => setModalVisible(false), 2000);
    } catch (err) {
      await axios.post(`${API_BASE_URL}/api/attendances`, {
        user_id: name,
        status: "Failed",
      });
      setMessage("Authentication failed. Please try again.");
    }
  };

  const registerFingerprint = async () => {
    try {
      const publicKey = {
        challenge: new Uint8Array(32),
        rp: { name: "Smart Attendance" },
        user: {
          id: new Uint8Array(16),
          name: "user@example.com",
          displayName: "User",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none",
      };

      const credential = await navigator.credentials.create({ publicKey });
      const rawId = btoa(
        String.fromCharCode(...new Uint8Array(credential.rawId))
      );
      localStorage.setItem("credentialId", rawId);
      alert("Fingerprint registered successfully.");
      window.location.reload(); // hide the button after registration
    } catch (e) {
      alert("Fingerprint registration failed: " + e.message);
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

      {!localStorage.getItem("credentialId") && (
        <button
          onClick={registerFingerprint}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#2c3e50",
            color: "white",
            border: "none",
            padding: "12px 18px",
            borderRadius: "50px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          Register Fingerprint
        </button>
      )}

      {modalVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <h3>✅ Attendance Recorded</h3>
          </div>
        </div>
      )}
    </div>
  );
}
