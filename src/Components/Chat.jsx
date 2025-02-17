// UserChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { IoClose, IoSend, IoInformationCircle, IoChatbubbleEllipses } from "react-icons/io5";
import { useSelector } from "react-redux";
import { toast } from 'sonner';

const UserChat = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { token, user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pendingMessagesRef = useRef(new Set());

  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${token}`);

      socketRef.current.onopen = () => {
        setIsConnected(true);
        toast.success('Connected to chat server');
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("data", data);
        
        if (data.type === "chat_history") {
          const chatHistory = data.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp).getTime(),
            pending: false
          }));
          setMessages(chatHistory);
          pendingMessagesRef.current.clear();
        } else if (data.type === "chat_message") {
          const newMessage = {
            ...data,
            timestamp: new Date(data.timestamp).getTime(),
            pending: false
          };

          setMessages((prev) => {
            // Remove corresponding pending message if it exists
            const pendingId = Array.from(pendingMessagesRef.current)
              .find(id => prev.find(m => m.id === id)?.message === newMessage.message);
            
            if (pendingId) {
              pendingMessagesRef.current.delete(pendingId);
              return prev.filter(m => m.id !== pendingId).concat(newMessage);
            }
            
            return [...prev, newMessage];
          });

          if (!newMessage.is_sender_admin) {
            const audio = new Audio('/message-notification.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
          }
        }
      };

      socketRef.current.onclose = () => {
        setIsConnected(false);
        toast.error('Disconnected from server. Reconnecting...');
        setTimeout(connectWebSocket, 5000);
      };

      socketRef.current.onerror = () => {
        setIsConnected(false);
        toast.error('Connection error. Please try again later.');
      };
    };

    connectWebSocket();
    return () => {
      socketRef.current?.close();
      pendingMessagesRef.current.clear();
    };
  }, [token]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current?.send(JSON.stringify({ type: "typing_start" }));
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current?.send(JSON.stringify({ type: "typing_stop" }));
    }, 1000);
  };

  const sendMessage = () => {
    if (inputMessage.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      const timestamp = Date.now();
      const tempMessageId = `temp-${timestamp}`;
      
      const messageToSend = {
        type: "message",
        message: inputMessage.trim(),
        sender_id: user.id,
        is_sender_admin: false,
      };

      const messageForState = {
        ...messageToSend,
        id: tempMessageId,
        timestamp,
        pending: true
      };

      pendingMessagesRef.current.add(tempMessageId);
      socketRef.current.send(JSON.stringify(messageToSend));
      setMessages((prev) => [...prev, messageForState]);
      setInputMessage("");
      inputRef.current?.focus();
    } else if (socketRef.current?.readyState !== WebSocket.OPEN) {
      toast.error('Unable to send message. Please check your connection.');
    }
  };

  const formatMessageTime = (timestamp) => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - messageTime) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return messageTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday ' + messageTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays < 7) {
      return messageTime.toLocaleDateString([], { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return messageTime.toLocaleDateString([], { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-[#F6F6F6] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#D4D4CE] transition-all duration-300 hover:shadow-3xl">
      <div className="bg-[#287094] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <IoChatbubbleEllipses className="text-2xl animate-bounce" />
          <div>
            <h3 className="text-lg font-semibold">PARiS Travel Chat</h3>
            {isConnected && <p className="text-xs text-[#D4D4CE]">Online</p>}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              setShowInfo(!showInfo);
              if (!showInfo) {
                toast.info('24/7 Support - Average response time: 5 minutes');
              }
            }} 
            className="hover:bg-[#023246] p-2 rounded-full transition-colors duration-200"
          >
            <IoInformationCircle className="text-xl" />
          </button>
          <button 
            onClick={onClose} 
            className="hover:bg-[#023246] p-2 rounded-full transition-colors duration-200"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#F6F6F6] h-[400px]">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.is_sender_admin ? "justify-start" : "justify-end"} animate-fadeIn`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm
                ${message.sender_id === user.id 
                  ? "bg-[#287094] text-white" 
                  : "bg-[#D4D4CE] text-[#023246]"
                }
                ${message.pending ? "opacity-70" : ""}
              `}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <p className="text-xs opacity-75">
                  {formatMessageTime(message.timestamp)}
                </p>
                {message.pending && 
                  <span className="text-xs animate-pulse">sending...</span>
                }
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#D4D4CE] bg-white">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 border border-[#D4D4CE] rounded-full focus:outline-none focus:ring-2 focus:ring-[#287094] focus:border-transparent transition-all duration-200 bg-[#F6F6F6]"
            disabled={!isConnected}
          />
          <button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || !isConnected}
            className="bg-[#287094] text-white p-3 rounded-full hover:bg-[#023246] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            <IoSend className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserChat;





