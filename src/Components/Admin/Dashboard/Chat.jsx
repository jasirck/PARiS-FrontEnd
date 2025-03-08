

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useSelector } from "react-redux";
import { Loader, Send, Check, CheckCheck, ArrowLeft, Menu } from "lucide-react";
import  {WS_BASE_URL}  from "../../../utils/services/socket.js";

// Memoized EmptyChat component
const EmptyChat = memo(() => {
  const isMobileView = useMemo(() => window.innerWidth < 768, []);
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = useCallback(() => {
    setShowSidebar(!showSidebar);
  }, [showSidebar]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <p className="text-lg">Select a chat to start messaging</p>
      {isMobileView && !showSidebar && (
        <button 
          onClick={toggleSidebar} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          View Chats
        </button>
      )}
    </div>
  );
});

// Memoized ChatSessionItem component
const ChatSessionItem = memo(({ session, selectedSession, handleMobileSessionSelect, formatLastActive }) => {
  return (
    <button 
      key={session.user_id}
      onClick={() => handleMobileSessionSelect(session)}
      className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors ${
        selectedSession?.user_id === session.user_id ? "bg-blue-50" : ""
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex-shrink-0">
        {session.user_image && (
          <img
            src={(session.user_image.includes("lh3.googleusercontent.com/a/")) 
              ? session.user_image 
              : `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${session.user_image}`}
            alt={session.username}
            className="w-full h-full rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/user_image_demo.png";
            }}
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900 truncate">{session.username}</h3>
          {session.unread_count > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
              {session.unread_count}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{session.last_message}</p>
        <time className="text-xs text-gray-400">
          {formatLastActive(session.last_active)}
        </time>
      </div>
    </button>
  );
});

const AdminChat = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const { token } = useSelector((state) => state.auth);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const pendingMessagesRef = useRef(new Set());

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar for mobile view
  const toggleSidebar = useCallback(() => {
    setShowSidebar(!showSidebar);
  }, [showSidebar]);

  // When selecting a session in mobile view, hide sidebar
  const handleMobileSessionSelect = useCallback((session) => {
    handleSessionSelect(session);
    if (isMobileView) {
      setShowSidebar(false);
    }
  }, [isMobileView]);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleWebSocketMessage = useCallback((event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case "contact_list":
        setChatSessions(data.contacts.map(contact => ({
          ...contact,
          last_active: new Date(contact.last_active).getTime()
        })));
        console.log("contact_list", data.contacts);
        break;
        
        
      
      case "chat_message":
        if (selectedSession?.user_id === data.sender_id || 
            (selectedSession?.user_id === data.receiver_id)) {
          const newMessage = {
            ...data,
            timestamp: new Date(data.timestamp).getTime(),
            pending: false
          };

          setMessages(prev => {
            const pendingId = Array.from(pendingMessagesRef.current)
              .find(id => prev.find(m => m.id === id)?.message === newMessage.message);
            
            if (pendingId) {
              pendingMessagesRef.current.delete(pendingId);
              return prev.filter(m => m.id !== pendingId).concat(newMessage);
            }
            
            return [...prev, newMessage];
          });
          
          // Update unread count when receiving message from user
          if (!data.is_sender_admin) {
            setChatSessions(prev => prev.map(session => {
              if (session.user_id === data.sender_id) {
                return {
                  ...session,
                  last_message: data.message,
                  last_active: new Date(data.timestamp).getTime(),
                  unread_count: selectedSession?.user_id === data.sender_id ? 0 : session.unread_count + 1
                };
              }
              return session;
            }));
            
            // Mark as read if the chat is currently open
            if (selectedSession?.user_id === data.sender_id) {
              markMessageAsRead(data.sender_id);
            }
          }
        } else if (data.is_sender_admin === false) {
          // Update session list when a new message from a user comes in
          setChatSessions(prev => prev.map(session => {
            if (session.user_id === data.sender_id) {
              return {
                ...session,
                last_message: data.message,
                last_active: new Date(data.timestamp).getTime(),
                unread_count: session.unread_count + 1
              };
            }
            return session;
          }));
        }
        break;
      
      case "chat_history":
        setMessages(data.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp).getTime(),
          pending: false
        })));
        pendingMessagesRef.current.clear();
        break;
      
      case "user_typing":
        if (selectedSession?.user_id === data.user_id) {
          setIsTyping(data.is_typing);
          if (data.is_typing) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
          }
        }
        break;
      
      default:
        break;
    }
  }, [selectedSession]);

  const markMessageAsRead = useCallback((userId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && userId) {
      socketRef.current.send(JSON.stringify({
        type: "mark_as_read",
        user_id: userId
      }));
      
      // Update local state to reflect read messages
      setChatSessions(prev => prev.map(session => {
        if (session.user_id === userId) {
          return {
            ...session,
            unread_count: 0
          };
        }
        return session;
      }));
    }
  }, []);

  const fetchChatHistory = useCallback((userId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      markMessageAsRead(userId);
      socketRef.current.send(JSON.stringify({
        type: "fetch_chat_history",
        user_id: userId
      }));
    }
  }, [markMessageAsRead]);

  useEffect(() => {
    if (!token) {
      setConnectionError("Authentication required");
      return;
    }

    const connectWebSocket = () => {
      // const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // const wsHost = process.env.REACT_APP_WS_HOST || window.location.hostname;
      // const wsPort = process.env.REACT_APP_WS_PORT || '8000';
      
      socketRef.current = new WebSocket(`${WS_BASE_URL}/ws/chat/?token=${token}`);

      socketRef.current.onopen = () => {
        setConnectionError(null);
        if (selectedSession) {
          fetchChatHistory(selectedSession.user_id);
        }
      };

      socketRef.current.onmessage = handleWebSocketMessage;
      
      socketRef.current.onclose = () => {
        setConnectionError("Connection lost. Reconnecting...");
        setTimeout(connectWebSocket, 5000);
      };

      socketRef.current.onerror = () => {
        setConnectionError("WebSocket connection error");
      };
    };

    connectWebSocket();
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketRef.current?.close();
      pendingMessagesRef.current.clear();
    };
  }, [token, selectedSession, handleWebSocketMessage, fetchChatHistory]);

  const formatMessageTime = useCallback((timestamp) => {
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
  }, []);

  const formatLastActive = useCallback((timestamp) => {
    const lastActive = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastActive) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return lastActive.toLocaleDateString([], { 
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!message.trim() || !selectedSession) return;
  
    const timestamp = Date.now();
    const tempId = `temp-${timestamp}`;
    const messageData = {
      type: "message",
      message: message.trim(),
      receiver_id: selectedSession.user_id,
      timestamp
    };
  
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messageData));
      setMessages(prev => [...prev, {
        ...messageData,
        is_sender_admin: true,
        id: tempId,
        pending: true
      }]);
      pendingMessagesRef.current.add(tempId);
      setMessage("");
      
      // Update the chat session's last message and time
      setChatSessions(prev => prev.map(session => {
        if (session.user_id === selectedSession.user_id) {
          return {
            ...session,
            last_message: message.trim(),
            last_active: timestamp
          };
        }
        return session;
      }));
    } else {
      setConnectionError("Connection lost. Reconnecting...");
    }
  }, [message, selectedSession]);

  const handleSessionSelect = useCallback((session) => {
    setSelectedSession(session);
    setMessages([]);
    fetchChatHistory(session.user_id);
  }, [fetchChatHistory]);

  const memoizedChatSessions = useMemo(() => 
    chatSessions.sort((a, b) => b.last_active - a.last_active), [chatSessions]);
    
  const memoizedMessages = useMemo(() => messages, [messages]);

  return (
    <main className="w-full max-w-7xl h-full rounded-2xl bg-white mx-auto relative">
      {connectionError && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
          {connectionError}
        </div>
      )}
      <div className="h-full bg-gray-50 rounded-xl shadow-lg flex overflow-hidden">
        {/* Sidebar / Chat List */}
        {(!isMobileView || showSidebar) && (
          <nav className={`${isMobileView ? 'w-full' : 'w-80'} h-full bg-white border-r border-gray-200 flex flex-col ${isMobileView ? 'absolute inset-0 z-10' : ''}`}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Active Chats</h2>
              {isMobileView && selectedSession && (
                <button 
                  onClick={toggleSidebar}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1">
              {memoizedChatSessions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No active chats
                </div>
              ) : (
                memoizedChatSessions.map((session) => (
                  <ChatSessionItem
                    key={session.user_id}
                    session={session}
                    selectedSession={selectedSession}
                    handleMobileSessionSelect={handleMobileSessionSelect}
                    formatLastActive={formatLastActive}
                  />
                ))
              )}
            </div>
          </nav>
        )}

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col h-full ${(!isMobileView || !showSidebar) ? 'block' : 'hidden'}`}>
          <header className="h-16 border-b border-gray-200 flex items-center px-6 bg-white justify-between">
            {selectedSession ? (
              <>
                <div className="flex items-center">
                  {isMobileView && (
                    <button 
                      onClick={toggleSidebar} 
                      className="mr-2 p-1 rounded-full hover:bg-gray-100"
                    >
                      <Menu size={20} />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-3">
                    {selectedSession.user_image && (
                      <img
                        src={(selectedSession.user_image.includes("lh3.googleusercontent.com/a/")) 
                          ? selectedSession.user_image 
                          : `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${selectedSession.user_image}`}
                        alt={selectedSession.username}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/32";
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {selectedSession.username}
                    </h3>
                    {isTyping && (
                      <p className="text-xs text-gray-500">typing...</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center">
                {isMobileView && (
                  <button 
                    onClick={toggleSidebar} 
                    className="mr-2 p-1 rounded-full hover:bg-gray-100"
                  >
                    <Menu size={20} />
                  </button>
                )}
                <h3 className="text-sm font-medium text-gray-900">
                  Admin Chat
                </h3>
              </div>
            )}
          </header>

          {selectedSession ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {memoizedMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No messages yet</p>
                  </div>
                ) : (
                  memoizedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_sender_admin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                          msg.is_sender_admin
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <time className="text-xs opacity-75">
                            {formatMessageTime(msg.timestamp)}
                          </time>
                          {msg.is_sender_admin && (
                            msg.pending ? 
                              <Loader className="animate-spin" size={12} /> : 
                              (msg.is_read ? <CheckCheck size={12} /> : <Check size={12} />)
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Loader className="animate-spin" size={12} />
                    {selectedSession?.username} is typing...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white border-t border-gray-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              <EmptyChat />
            )}
          </div>
        </div>
      </main>
    );
  };
  
  export default AdminChat;


