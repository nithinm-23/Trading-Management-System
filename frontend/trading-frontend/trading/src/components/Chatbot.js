import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FiSend,
  FiX,
  FiChevronUp,
  FiUser,
  FiMessageSquare,
  FiMic,
} from "react-icons/fi";
import { IoMdChatbubbles } from "react-icons/io";
import { RiRobot2Line } from "react-icons/ri";
import "../styles/Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatWindowRef = useRef(null);

  const suggestedQuestions = [
    "What services do you offer?",
    "How can I contact support?",
    "What are your business hours?",
    "Do you have pricing information?",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    // Setup voice recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      let reply = "";

      if (input.toLowerCase().includes("contact")) {
        reply =
          "You can contact us at: 📞 +91-9876543210 (Me) or 📞 +91-8765432109 (My Teammate)";
      } else if (input.toLowerCase().includes("services")) {
        reply =
          "Our website offers:\n• Live Stock Tracking 📈\n• Portfolio Management 💼\n• Trade Execution 🚀\n• Market News 📰\n• Smart Alerts 🔔";
      } else {
        const res = await axios.post("http://localhost:3001/chat", {
          message: input,
        });
        reply = res.data.reply;
      }

      const botReply = { role: "bot", content: reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = {
        role: "bot",
        content:
          "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
  };

  const toggleChat = () => {
    if (isAnimating) return;

    if (isOpen) {
      // Closing animation
      setIsAnimating(true);
      chatWindowRef.current.classList.add("closing");
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
        chatWindowRef.current.classList.remove("closing");
      }, 300);
    } else {
      // Opening animation
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
      {/* Floating Button */}
      <button
        className={`floating-chat-btn ${isOpen ? "pulse" : ""}`}
        onClick={toggleChat}
      >
        {isOpen ? <FiX size={24} /> : <IoMdChatbubbles size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`chat-window ${isMinimized ? "minimized" : ""}`}
          ref={chatWindowRef}
        >
          <div className="chat-header">
            <div className="header-left">
              <RiRobot2Line className="bot-icon" />
              <h3>Welcome to StockPro</h3>
            </div>
            <div className="header-actions">
              <button
                className="icon-btn minimize-btn"
                onClick={toggleMinimize}
              >
                <FiChevronUp
                  className={`minimize-icon ${isMinimized ? "flipped" : ""}`}
                />
              </button>
              <button className="icon-btn close-btn" onClick={toggleChat}>
                <FiX />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="chat-body">
                {messages.length === 0 ? (
                  <div className="welcome-message">
                    <RiRobot2Line className="welcome-icon" />
                    <h4>Hello! How can I help you today?</h4>
                    <div className="suggestions">
                      <p>Try asking:</p>
                      {suggestedQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          className="suggestion-btn"
                          onClick={() => handleSuggestionClick(question)}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                      <div className="message-content">
                        <div className="message-avatar">
                          {msg.role === "bot" ? (
                            <RiRobot2Line className="bot-avatar" />
                          ) : (
                            <FiUser className="user-avatar" />
                          )}
                        </div>
                        <div className="message-bubble">
                          <div className="message-text">{msg.content}</div>
                          <div className="message-time">
                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="message bot typing">
                    <div className="message-content">
                      <div className="message-avatar">
                        <RiRobot2Line className="bot-avatar" />
                      </div>
                      <div className="message-bubble">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-footer">
                <div className="quick-replies">
                  {suggestedQuestions.slice(0, 3).map((question, idx) => (
                    <button
                      key={idx}
                      className="quick-reply-btn"
                      onClick={() => handleSuggestionClick(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Type or use voice..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <button
                    className={`mic-btn ${isListening ? "listening" : ""}`}
                    onClick={startListening}
                    title="Speak"
                  >
                    <FiMic />
                  </button>
                  <button
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={!input.trim()}
                  >
                    <FiSend className="send-icon" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
