import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import API_BASE_URL from "../config";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [userHours, setUserHours] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
    } else {
      fetchLogs();
    }
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/attendances`);
      const sortedLogs = res.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setLogs(sortedLogs);
      computeUserHours(sortedLogs);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const computeUserHours = (logs) => {
    const userMap = {};

    logs.forEach((log) => {
      if (log.status !== "Success") return;
      const user = log.user_id;
      const time = new Date(log.timestamp);
      if (!userMap[user]) userMap[user] = [];
      userMap[user].push(time);
    });

    const hoursPerUser = {};

    Object.entries(userMap).forEach(([user, times]) => {
      let totalMs = 0;
      times.sort((a, b) => a - b);
      for (let i = 0; i < times.length - 1; i += 2) {
        const start = times[i];
        const end = times[i + 1] || new Date();
        totalMs += end - start;
      }
      const hours = totalMs / (1000 * 60 * 60);
      hoursPerUser[user] = hours.toFixed(2);
    });

    setUserHours(hoursPerUser);
  };

  return (
    <div>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2 style={{ marginBottom: "15px" }}>All Attendance Logs</h2>

        {/* Scrollable Logs Table Box */}
        <div
          style={{
            border: "2px solid #c3c3c3",
            borderRadius: "10px",
            padding: "10px 0",
            maxHeight: "400px",
            overflowY: "auto",
            background: "white",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          }}
        >
          <table
            style={{
              width: "90%",
              borderCollapse: "collapse",
              fontSize: "15px",
              margin: "0 auto",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "#ffffff",
                boxShadow: "0 2px 3px rgba(0,0,0,0.05)",
                borderBottom: "2px solid #ccc",
              }}
            >
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={tdStyle}>{log.id}</td>
                  <td style={tdStyle}>{log.user_id}</td>
                  <td style={tdStyle}>{log.status}</td>
                  <td style={tdStyle}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User-wise Total Hours */}
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "2px solid #c3c3c3",
            borderRadius: "10px",
            background: "#f0f4f8",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "15px", textAlign: "center" }}>
            Total Hours Per User
          </h3>
          <table
            style={{
              width: "60%",
              margin: "0 auto",
              fontSize: "15px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Hours Present</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(userHours).map(([user, hours]) => (
                <tr key={user}>
                  <td style={tdStyle}>{user}</td>
                  <td style={tdStyle}>{hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  textAlign: "left",
  backgroundColor: "#f0f0f0",
};

const tdStyle = {
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
};
