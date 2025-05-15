import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainPage from "./pages/MainPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { useEffect, useState } from "react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route 
          path="/admin-login" 
          element={isAuthenticated ? <Navigate to="/admin-dashboard" /> : <AdminLogin setIsAuthenticated={setIsAuthenticated} />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/admin-login" />} 
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}