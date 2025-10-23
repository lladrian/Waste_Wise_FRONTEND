import React, { useEffect, useState } from "react";

function WebSocketTest() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // const socket = new WebSocket("ws://localhost:5000");
    // const socket = new WebSocket("ws://waste-wise-backend-chi.vercel.app");
    const socket = new WebSocket("wss://waste-wise-backend-chi.vercel.app");


    socket.onopen = () => {
      console.log("Connected to server");
    };

    socket.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    socket.onclose = () => {
      console.log("Disconnected from server");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && input) {
      ws.send(input);
      setInput("");
    }
  };

  return (
    <div>
      <h2>WebSocket Test</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Message to server"
      />
      <button onClick={sendMessage}>Send</button>

      <div style={{ marginTop: 20 }}>
        <h3>Messages:</h3>
        {messages.map((msg, i) => (
          <div key={i} style={{ borderBottom: "1px solid #ccc" }}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WebSocketTest;
