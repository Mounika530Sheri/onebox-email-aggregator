import React, { useState } from "react";
import axios from "axios";

export default function SuggestReply({ emailBody }) {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const suggest = async () => {
    try {
      setLoading(true);
      setReply(""); 

      const r = await axios.post("http://localhost:4000/api/emails/suggest-reply", {
        emailBody,
        context: "I am applying for a job position. If the lead is interested, share the meeting booking link: https://cal.com/example"
      });

      setReply(r.data.suggestion);
    } catch (err) {
      console.error("Failed to generate suggestion:", err);
      setReply("Failed to generate suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 6, backgroundColor: "#f5f5f5" }}>
      <button
        onClick={suggest}
        disabled={loading}
        style={{
          padding: "6px 12px",
          borderRadius: 5,
          border: "none",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Generating..." : "Suggest Reply"}
      </button>

      {reply && (
        <div style={{ marginTop: 10, whiteSpace: "pre-wrap", padding: 8, backgroundColor: "#fff", borderRadius: 5, border: "1px solid #ccc" }}>
          <strong>Suggestion:</strong>
          <div style={{ marginTop: 4 }}>{reply}</div>
        </div>
      )}
    </div>
  );
}
