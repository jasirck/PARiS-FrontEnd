import React, { useState, useEffect, useRef } from "react";
import { IoClose, IoSend, IoInformationCircle, IoChatbubbleEllipses } from "react-icons/io5";
import { useSelector } from "react-redux";
import { WS_BASE_URL } from "../utils/services/socket.js";

const UserChat = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { token, user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pendingMessagesRef = useRef(new Set());

  // Check screen size for responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket(`${WS_BASE_URL}/ws/chat/?token=${token}`);
      socketRef.current.onopen = () => {
        setIsConnected(true);
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
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
        } else if (data.type === "typing") {
          setIsTyping(data.is_typing);
        }
      };

      socketRef.current.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWebSocket, 5000);
      };

      socketRef.current.onerror = () => {
        setIsConnected(false);
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

  // Check if user has scrolled up and show scroll-to-bottom button
  useEffect(() => {
    const checkScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 50;
        setShowScrollBottom(isScrolledUp);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  // Group messages by date for better visual separation
  const getMessageDateGroup = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Information panel content
  const infoContent = (
    <div className="absolute top-16 right-6 bg-white rounded-lg shadow-xl p-4 w-72 text-sm text-gray-700 border border-gray-200 z-10 animate-fadeIn">
      <h4 className="font-bold mb-2 text-[#287094]">About PARiS Travel Chat</h4>
      <p className="mb-3">Ask any questions about your travel plans, bookings, or destinations. Our team is here to help!</p>
      <p className="mb-2 text-xs text-gray-500">Response times: typically within 5 minutes during business hours (9AM-6PM).</p>
      <button 
        onClick={() => setShowInfo(false)} 
        className="text-xs text-[#287094] hover:underline float-right mt-1"
      >
        Close
      </button>
    </div>
  );

  // Get unique date groups
  const messageGroups = {};
  messages.forEach(message => {
    const dateGroup = getMessageDateGroup(message.timestamp);
    if (!messageGroups[dateGroup]) {
      messageGroups[dateGroup] = [];
    }
    messageGroups[dateGroup].push(message);
  });

  return (
    <div 
      ref={chatContainerRef}
      className={`fixed ${isMobile ? 'bottom-0 right-0 left-0 w-full rounded-t-xl rounded-b-none' : 'bottom-20 right-6 w-96 rounded-2xl'} 
        bg-[#F6F6F6] shadow-2xl flex flex-col overflow-hidden border border-[#D4D4CE] 
        transition-all duration-300 hover:shadow-3xl max-h-[80vh] z-50`}
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <div className="bg-[#287094] text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="relative">
            <IoChatbubbleEllipses className={`text-xl md:text-2xl ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border border-white"></span>
            )}
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold">PARiS Travel Chat</h3>
            <p className="text-xs text-[#D4D4CE]">
              {isConnected ? 'Online' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowInfo(!showInfo)} 
            className="hover:bg-[#023246] p-1.5 md:p-2 rounded-full transition-colors duration-200 relative"
            aria-label="Information"
          >
            <IoInformationCircle className="text-lg md:text-xl" />
          </button>
          <button 
            onClick={onClose} 
            className="hover:bg-[#023246] p-1.5 md:p-2 rounded-full transition-colors duration-200"
            aria-label="Close chat"
          >
            <IoClose className="text-lg md:text-xl" />
          </button>
        </div>
      </div>

      {showInfo && infoContent}

      <div 
        ref={messagesContainerRef}
        className="flex-grow p-3 md:p-4 overflow-y-auto space-y-3 md:space-y-4 bg-[#F6F6F6] h-[350px] md:h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent relative"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
            <IoChatbubbleEllipses className="text-4xl text-gray-300" />
            <p className="text-center">No messages yet. Start a conversation!</p>
            {isConnected ? (
              <p className="text-xs text-gray-400">We typically respond within minutes.</p>
            ) : (
              <p className="text-xs text-gray-400 animate-pulse">Connecting to chat service...</p>
            )}
          </div>
        ) : (
          Object.keys(messageGroups).map(dateGroup => (
            <div key={dateGroup} className="message-group">
              <div className="flex justify-center my-4">
                <span className="bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full">
                  {dateGroup}
                </span>
              </div>
              {messageGroups[dateGroup].map((message, index) => {
                const isConsecutive = index > 0 && messageGroups[dateGroup][index-1].sender_id === message.sender_id;
                
                return (
                  <div 
                    key={message.id}
                    className={`flex ${message.is_sender_admin ? "justify-start" : "justify-end"} animate-fadeIn ${isConsecutive ? "mt-1" : "mt-3"}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm
                        ${message.sender_id === user.id 
                          ? "bg-[#287094] text-white" 
                          : "bg-[#E8E8E8] text-[#023246]"
                        }
                        ${message.pending ? "opacity-70" : ""}
                        ${message.is_sender_admin 
                          ? (isConsecutive ? "rounded-tl-sm rounded-bl-sm" : "rounded-bl-sm") 
                          : (isConsecutive ? "rounded-tr-sm rounded-br-sm" : "rounded-br-sm")
                        }
                      `}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <p className="text-xs opacity-75">
                          {formatMessageTime(message.timestamp)}
                        </p>
                        {message.pending && 
                          <span className="text-xs animate-pulse">sending...</span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />

        {showScrollBottom && (
          <button 
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-[#287094] text-white p-2 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity"
            aria-label="Scroll to bottom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-3 md:p-4 border-t border-[#D4D4CE] bg-white">
        {isTyping && (
          <div className="text-xs text-gray-500 italic mb-1">
            <span className="flex items-center space-x-1">
              <span>Admin is typing</span>
              <span className="flex space-x-1">
                <span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </span>
            </span>
          </div>
        )}
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
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            className="flex-grow px-4 py-2.5 border border-[#D4D4CE] rounded-full focus:outline-none focus:ring-2 focus:ring-[#287094] focus:border-transparent transition-all duration-200 bg-[#F6F6F6] text-sm md:text-base shadow-inner"
            disabled={!isConnected}
          />
          <button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || !isConnected}
            className="bg-[#287094] text-white p-2.5 md:p-3 rounded-full hover:bg-[#023246] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-md"
            aria-label="Send message"
          >
            <IoSend className="text-lg md:text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserChat;