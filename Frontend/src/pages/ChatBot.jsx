import React, { useState, useRef, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import "./chatbot.css";

const MAX_CHAT_UI = 200;
const MAX_CONTEXT_MSGS = 16;

const ChatBot = () => {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState(user?.email || ""); 
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);


  const [summary, setSummary] = useState("");

  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    const savedChat = sessionStorage.getItem("chat_ui");
    const savedSummary = sessionStorage.getItem("chat_summary");

    if (savedChat) setChat(JSON.parse(savedChat));
    if (savedSummary) setSummary(savedSummary);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("chat_ui", JSON.stringify(chat));
  }, [chat]);

  useEffect(() => {
    sessionStorage.setItem("chat_summary", summary);
  }, [summary]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("chat_ui");
      sessionStorage.removeItem("chat_summary");
    };
  }, []);


  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };


  const appendMessage = (sender, text) => {
    setChat(prev => {
      const updated = [...prev, { sender, text }];
      return updated.length > MAX_CHAT_UI
        ? updated.slice(-MAX_CHAT_UI)
        : updated;
    });
    setTimeout(scrollToBottom, 50);
  };


  const handleSend = async () => {
    if (!email || !message) return;

    const userMsg = { sender: "user", text: message };
    const updatedChat = [...chat, userMsg];

    setChat(updatedChat);
    setMessage("");
    setLoading(true);

    const recentMessages = updatedChat.slice(-MAX_CONTEXT_MSGS);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          message,
          recentMessages,
          summary,
        }),
        credentials: "include",
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        appendMessage("bot", data.reply);

        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        appendMessage("bot", data.error || "Server error");
      }
    } catch {
      setLoading(false);
      appendMessage("bot", "Network error");
    }
  };

  //

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
  <div className="chatbot-page">
    <h1 className="chatbot-title">Your Saarthi Assistant</h1>

    <div className="chatbot-card">
      {!user && (
        <div className="chatbot-email">
          <label className="form-label">Your Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}

      <div className="chat-window" ref={chatBoxRef}>
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.sender}`}
          >
            <div className="chat-bubble">
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message bot">
            <div className="chat-bubble thinking">
              Saarthi is thinking…
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          className="form-control"
          placeholder="Ask about medicines, schedules, reports…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="btn-send" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  </div>
);
};

export default ChatBot;

