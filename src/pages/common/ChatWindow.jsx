import React, { useState } from "react";

const ChatWindow = ({ selectedUser, chatHistory, onSendMessage, role }) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || file) {
      onSendMessage(message, file);
      setMessage("");
      setFile(null);
    }
  };

  return (
    <div style={{ width: "70%", padding: "10px" }}>
      {selectedUser ? (
        <>
          <h3>Chat with {selectedUser.username}</h3>
          <div
            style={{
              height: "400px",
              overflowY: "scroll",
              border: "1px solid #ccc",
              padding: "10px",
            }}
          >
            {chatHistory.map((chat) => (
              <div
                key={chat._id}
                style={{
                  textAlign:
                    chat.sender._id === selectedUser._id ? "left" : "right",
                  margin: "5px",
                }}
              >
                <p>
                  <strong>{chat.sender.username}:</strong>{" "}
                  {chat.file === "voice" ? (
                    <audio controls src={chat.filePath} />
                  ) : chat.file === "file" ? (
                    <a
                      href={chat.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download File
                    </a>
                  ) : (
                    chat.message
                  )}
                </p>
                <small>{new Date(chat.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ width: "60%" }}
            />
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button type="submit">Send</button>
          </form>
        </>
      ) : (
        <p>Select a user to start chatting</p>
      )}
    </div>
  );
};

export default ChatWindow;
