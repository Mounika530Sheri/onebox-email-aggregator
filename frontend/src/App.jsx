import React, { useState } from "react";
import axios from "axios";
import EmailList from "./components/EmailList";
import SuggestReply from "./components/SuggestReply";

export default function App() {
  const [q, setQ] = useState("");
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);


  const search = async () => {
    try {
      const r = await axios.get(
        `http://localhost:4000/api/emails/search?q=${encodeURIComponent(q)}`
      );

      console.log("Search result:", r.data);

      
      const uniqueEmailsMap = new Map();
      r.data.forEach(email => {
        if (!uniqueEmailsMap.has(email.id)) {
          uniqueEmailsMap.set(email.id, email);
        }
      });

      const uniqueEmails = Array.from(uniqueEmailsMap.values()).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setEmails(uniqueEmails);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>Onebox — Email Aggregator</h2>

      <div style={{ marginBottom: 10, display: "flex", gap: 8 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search subject/from/body"
          style={{ flex: 1, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button
          onClick={search}
          style={{ padding: "6px 12px", borderRadius: 4, border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer" }}
        >
          Search
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, height: "80vh" }}>
       
        <div style={{ flex: 1, overflowY: "auto", border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
          <EmailList emails={emails} onSelect={setSelected} />
        </div>

      
        <div
          style={{
            width: 420,
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto"
          }}
        >
          <h3>Selected Email</h3>

          {selected ? (
            <div>
              <div><strong>Subject:</strong> {selected.subject}</div>
              <div><strong>From:</strong> {selected.from}</div>
              <div><strong>Category:</strong> {selected.category}</div>
              <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{selected.body}</div>

              
              <SuggestReply emailBody={selected.body} />
            </div>
          ) : (
            <div style={{ marginTop: 20, color: "#666" }}>Select an email to see details</div>
          )}
        </div>
      </div>
    </div>
  );
}
