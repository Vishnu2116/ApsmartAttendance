import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import API_BASE_URL from "../config";

export default function AdminLogin({ setIsAuthenticated }) {
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessingSaml, setIsProcessingSaml] = useState(false);
  const navigate = useNavigate();
  const IS_PRODUCTION = process.env.NODE_ENV === "production";

  useEffect(() => {
    // Check for existing token on component mount
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
      navigate("/admin-dashboard");
      return;
    }

    // Handle SAML callback with token from URL
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      handleSamlCallback(tokenFromUrl);
    }

    // Handle SAML errors from URL
    const error = searchParams.get("error");
    if (error === "saml") {
      toast.error("SSO authentication failed. Please try again.");
    }
  }, [searchParams, navigate, setIsAuthenticated]);

  const handleSamlCallback = (token) => {
    setIsProcessingSaml(true);
    try {
      // Store token in multiple storage locations for redundancy
      localStorage.setItem("adminToken", token);
      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("loggedInUser", "admin");
      
      sessionStorage.setItem("adminToken", token);
      sessionStorage.setItem("isAdminLoggedIn", "true");
      sessionStorage.setItem("loggedInUser", "admin");

      // Update global authentication state
      setIsAuthenticated(true);
      
      toast.success("SSO login successful!");
      navigate("/admin-dashboard");
    } catch (e) {
      console.error("Error storing token:", e);
      toast.error(`Error processing SSO login: ${e.message}`);
    } finally {
      setIsProcessingSaml(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.warning("Please enter both username and password.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        username: username.trim(),
        password: password.trim(),
      });

      // Store authentication data
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("loggedInUser", username);
      
      // Update global auth state and redirect
      setIsAuthenticated(true);
      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Invalid username or password.");
    }
    setUsername("");
    setPassword("");
  };

  const handleSamlLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/saml`;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
      }}>
        {isProcessingSaml ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            minWidth: "350px"
          }}>
            <h2 style={{ marginBottom: "15px", color: "#2c3e50" }}>Processing SSO Login</h2>
            <p>Please wait while we authenticate you...</p>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              border: "5px solid #f3f3f3",
              borderTop: "5px solid #3498db", 
              borderRadius: "50%", 
              animation: "spin 1s linear infinite",
              margin: "20px auto"
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            minWidth: "350px",
            textAlign: "center",
          }}>
            <h2 style={{ marginBottom: "25px", color: "#2c3e50" }}>Admin Login</h2>

            <form onSubmit={handleLogin}>
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
                type="submit"
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
            </form>

            {IS_PRODUCTION && (
              <div style={{ marginTop: "20px" }}>
                <div style={{ margin: "10px 0", color: "#555" }}>OR</div>
                <button
                  onClick={handleSamlLogin}
                  style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: "#0747A6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Sign in with SSO
                </button>
              </div>
            )}

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
        )}
      </div>
    </div>
  );
}