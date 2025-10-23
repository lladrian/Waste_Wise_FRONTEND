import React, { useEffect, useState, useRef } from 'react';

function WebSocketTest() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:5000');
    // ws.current = new WebSocket('wss://waste-wise-backend-uzub.onrender.com');

    ws.current.onopen = () => {
      console.log('✅ Connected');
      setIsConnected(true);
    };

    ws.current.onmessage = async (event) => {
      let messageText;

      // Check if data is Blob and convert it to text
      if (event.data instanceof Blob) {
        messageText = await event.data.text();
      } else {
        messageText = event.data;
      }

      console.log('📩 Message received:', messageText);
      setMessages((prev) => [...prev, messageText]);
    };

    ws.current.onclose = () => {
      console.log('🔌 Disconnected');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = () => {
    if (ws.current && isConnected && input.trim()) {
      ws.current.send(input);
      setMessages((prev) => [...prev, `You: ${input}`]);
      setInput('');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>💬 Realtime Chat (WebSocket)</h2>

      <div
        style={{
          border: '1px solid #ccc',
          padding: '1rem',
          height: '300px',
          overflowY: 'auto',
          marginBottom: '1rem',
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
        disabled={!isConnected}
        style={{ marginRight: '0.5rem' }}
      />
      <button onClick={sendMessage} disabled={!isConnected || !input.trim()}>
        Send
      </button>
    </div>
  );
}

export default WebSocketTest;
