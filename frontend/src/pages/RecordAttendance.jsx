import React, { useState } from "react";
import axios from "axios";

export default function RecordAttendance() {
  const [userId, setUserId] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const handleAttendance = async () => {
    if (!userId.trim()) {
      setStatusMsg("⚠️ Please enter your username.");
      return;
    }

    try {
      const result = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([
            /* dummy challenge */
          ]),
          allowCredentials: [],
          timeout: 60000,
          userVerification: "preferred",
        },
      });

      if (result) {
        await axios.post(`${API_BASE_URL}/api/attendances`, {
          user_id: userId,
          status: "Success",
        });

        setStatusMsg("✅ Attendance recorded successfully.");
      }
    } catch (err) {
      await axios.post(`${API_BASE_URL}/api/attendances`, {
        user_id: userId,
        status: "Failed",
      });

      setStatusMsg("❌ Fingerprint authentication failed.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Record Attendance</h2>
      <input
        type="text"
        placeholder="Enter your username"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ fontSize: 16, padding: 8 }}
      />
      <br />
      <br />
      <button onClick={handleAttendance} style={{ fontSize: 18 }}>
        Submit & Authenticate
      </button>
      <br />
      <br />
      <div>{statusMsg}</div>
    </div>
  );
}
