import React from "react";

export default function EmailList({ emails, onSelect }) {
  const [activeId, setActiveId] = React.useState(null);

  const handleSelect = (email) => {
    setActiveId(email.id);
    onSelect(email);
  };

  return (
    <div>
      {emails.length === 0 ? (
        <div style={{ color: "#666", padding: 8 }}>No emails found</div>
      ) : (
        emails.map(email => (
          <div
            key={email.id}
            onClick={() => handleSelect(email)}
            style={{
              padding: "8px 12px",
              marginBottom: 6,
              borderRadius: 6,
              cursor: "pointer",
              backgroundColor: activeId === email.id ? "#e6f0ff" : "#fff",
              border: activeId === email.id ? "1px solid #007bff" : "1px solid #ddd",
              transition: "background-color 0.2s, border 0.2s"
            }}
          >
            <div style={{ fontWeight: 600 }}>{email.subject}</div>
            <div style={{ fontSize: 12, color: "#555" }}>{email.from}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{email.category}</div>
          </div>
        ))
      )}
    </div>
  );
}
