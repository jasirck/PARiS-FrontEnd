import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { Loader, Send, Check, CheckCheck } from "lucide-react";

const AdminChat = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const pendingMessagesRef = useRef(new Set());

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
        break;
      
      case "chat_message":
        if (selectedSession?.user_id === data.sender_id || data.receiver_id === selectedSession?.user_id) {
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

          markMessageAsRead([data.message_id]);
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
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
        break;
      
      default:
        break;
    }
  }, [selectedSession]);

  const markMessageAsRead = useCallback((messageIds) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "mark_as_read",
        message_ids: messageIds
      }));
    }
  }, []);

  const fetchChatHistory = useCallback((userId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "fetch_chat_history",
        user_id: userId
      }));
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setConnectionError("Authentication required");
      return;
    }

    const connectWebSocket = () => {
      socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${token}`);

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
    } else {
      setConnectionError("Connection lost. Reconnecting...");
    }
  }, [message, selectedSession]);

  const handleSessionSelect = useCallback((session) => {
    setSelectedSession(session);
    setMessages([]);
    fetchChatHistory(session.user_id);
  }, [fetchChatHistory]);

  return (
    <main className="w-full max-w-7xl h-full rounded-2xl bg-white mx-auto relative">
      <div className="h-full bg-gray-50 rounded-xl shadow-lg flex overflow-hidden">
        <nav className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Active Chats</h2>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {chatSessions.map((session) => (
              <button
                key={session.user_id}
                onClick={() => handleSessionSelect(session)}
                className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors ${
                  selectedSession?.user_id === session.user_id ? "bg-blue-50" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3">
                  {session.user_image && (
                    <img
                      src={session.user_image}
                      alt={session.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900">{session.username}</h3>
                    {/* {session.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {session.unread_count}
                      </span>
                    )} */}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{session.last_message}</p>
                  <time className="text-xs text-gray-400">
                    {formatLastActive(session.last_active)}
                  </time>
                </div>
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 flex flex-col h-full">
          <header className="h-16 border-b border-gray-200 flex items-center px-6 bg-white">
            {selectedSession && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-3">
                  {selectedSession.user_image && (
                    <img
                      src={selectedSession.user_image}
                      alt={selectedSession.username}
                      className="w-full h-full rounded-full object-cover"
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
            )}
          </header>

          {connectionError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
              <p className="text-red-700">{connectionError}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_sender_admin ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-lg ${
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
                      msg.is_read ? <CheckCheck className="text-white" size={12} /> : <Check className="text-white" size={12} />
                    )}
                  </div>
                </div>
              </div>
            ))}
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
              disabled={!selectedSession}
            />
            <button
              type="submit"
              disabled={!message.trim() || !selectedSession}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AdminChat;




// import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { useSelector } from "react-redux";
// import { Loader, Send, Check, CheckCheck } from "lucide-react";

// const AdminChat = () => {
//   const [chatSessions, setChatSessions] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [message, setMessage] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [connectionError, setConnectionError] = useState(null);
//   const { token } = useSelector((state) => state.auth);
//   const chatEndRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const socketRef = useRef(null);
//   const pendingMessagesRef = useRef(new Set());

//   const scrollToBottom = useCallback(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, scrollToBottom]);

//   const handleWebSocketMessage = useCallback((event) => {
//     const data = JSON.parse(event.data);
    
//     switch (data.type) {
//       case "contact_list":
//         setChatSessions(data.contacts.map(contact => ({
//           ...contact,
//           last_active: new Date(contact.last_active).getTime()
//         })));
//         break;
      
//       case "chat_message":
//         if (selectedSession?.user_id === data.sender_id || data.receiver_id === selectedSession?.user_id) {
//           const newMessage = {
//             ...data,
//             timestamp: new Date(data.timestamp).getTime(),
//             pending: false
//           };

//           setMessages(prev => {
//             const pendingId = Array.from(pendingMessagesRef.current)
//               .find(id => prev.find(m => m.id === id)?.message === newMessage.message);
            
//             if (pendingId) {
//               pendingMessagesRef.current.delete(pendingId);
//               return prev.filter(m => m.id !== pendingId).concat(newMessage);
//             }
            
//             return [...prev, newMessage];
//           });

//           markMessageAsRead([data.message_id]);
//         }
//         break;
      
//       case "chat_history":
//         setMessages(data.messages.map(msg => ({
//           ...msg,
//           timestamp: new Date(msg.timestamp).getTime(),
//           pending: false
//         })));
//         pendingMessagesRef.current.clear();
//         break;
      
//       case "user_typing":
//         setIsTyping(true);
//         clearTimeout(typingTimeoutRef.current);
//         typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
//         break;
      
//       default:
//         break;
//     }
//   }, [selectedSession]);

//   const markMessageAsRead = useCallback((messageIds) => {
//     if (socketRef.current?.readyState === WebSocket.OPEN) {
//       socketRef.current.send(JSON.stringify({
//         type: "mark_as_read",
//         message_ids: messageIds
//       }));
//     }
//   }, []);

//   const fetchChatHistory = useCallback((userId) => {
//     if (socketRef.current?.readyState === WebSocket.OPEN) {
//       socketRef.current.send(JSON.stringify({
//         type: "fetch_chat_history",
//         user_id: userId
//       }));
//     }
//   }, []);

//   useEffect(() => {
//     if (!token) {
//       setConnectionError("Authentication required");
//       return;
//     }

//     const connectWebSocket = () => {
//       socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${token}`);

//       socketRef.current.onopen = () => {
//         setConnectionError(null);
//         if (selectedSession) {
//           fetchChatHistory(selectedSession.user_id);
//         }
//       };

//       socketRef.current.onmessage = handleWebSocketMessage;
      
//       socketRef.current.onclose = () => {
//         setConnectionError("Connection lost. Reconnecting...");
//         setTimeout(connectWebSocket, 5000);
//       };

//       socketRef.current.onerror = () => {
//         setConnectionError("WebSocket connection error");
//       };
//     };

//     connectWebSocket();
    
//     return () => {
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//       socketRef.current?.close();
//       pendingMessagesRef.current.clear();
//     };
//   }, [ selectedSession, ]);

//   const formatMessageTime = useCallback((timestamp) => {
//     const messageTime = new Date(timestamp);
//     const now = new Date();
//     const diffDays = Math.floor((now - messageTime) / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) {
//       return messageTime.toLocaleTimeString([], { 
//         hour: '2-digit', 
//         minute: '2-digit',
//         hour12: true 
//       });
//     } else if (diffDays === 1) {
//       return 'Yesterday ' + messageTime.toLocaleTimeString([], { 
//         hour: '2-digit', 
//         minute: '2-digit',
//         hour12: true 
//       });
//     } else if (diffDays < 7) {
//       return messageTime.toLocaleDateString([], { 
//         weekday: 'short',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       });
//     } else {
//       return messageTime.toLocaleDateString([], { 
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       });
//     }
//   }, []);

//   const formatLastActive = useCallback((timestamp) => {
//     const lastActive = new Date(timestamp);
//     const now = new Date();
//     const diffMinutes = Math.floor((now - lastActive) / (1000 * 60));
    
//     if (diffMinutes < 1) return 'Just now';
//     if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
//     const diffHours = Math.floor(diffMinutes / 60);
//     if (diffHours < 24) return `${diffHours}h ago`;
    
//     const diffDays = Math.floor(diffHours / 24);
//     if (diffDays === 1) return 'Yesterday';
//     if (diffDays < 7) return `${diffDays}d ago`;
    
//     return lastActive.toLocaleDateString([], { 
//       month: 'short',
//       day: 'numeric'
//     });
//   }, []);

//   const handleSendMessage = useCallback((e) => {
//     e.preventDefault();
//     if (!message.trim() || !selectedSession) return;
  
//     const timestamp = Date.now();
//     const tempId = `temp-${timestamp}`;
//     const messageData = {
//       type: "message",
//       message: message.trim(),
//       receiver_id: selectedSession.user_id,
//       timestamp
//     };
  
//     if (socketRef.current?.readyState === WebSocket.OPEN) {
//       socketRef.current.send(JSON.stringify(messageData));
//       setMessages(prev => [...prev, {
//         ...messageData,
//         is_sender_admin: true,
//         id: tempId,
//         pending: true
//       }]);
//       pendingMessagesRef.current.add(tempId);
//       setMessage("");
//     } else {
//       setConnectionError("Connection lost. Reconnecting...");
//     }
//   }, [message, selectedSession]);

//   const handleSessionSelect = useCallback((session) => {
//     setSelectedSession(session);
//     setMessages([]);
//     fetchChatHistory(session.user_id);
//   }, [fetchChatHistory]);

//   const formattedChatSessions = useMemo(() => {
//     return chatSessions.map(session => ({
//       ...session,
//       last_active: formatLastActive(session.last_active),
//     }));
//   }, [chatSessions, formatLastActive]);

//   return (
//     <main className="w-full max-w-7xl h-full rounded-2xl bg-white mx-auto relative">
//       <div className="h-full bg-gray-50 rounded-xl shadow-lg flex overflow-hidden">
//         <nav className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
//           <div className="p-4 border-b border-gray-200">
//             <h2 className="text-xl font-semibold text-gray-800">Active Chats</h2>
//           </div>
          
//           <div className="overflow-y-auto flex-1">
//             {formattedChatSessions.map((session) => (
//               <button
//                 key={session.user_id}
//                 onClick={() => handleSessionSelect(session)}
//                 className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors ${
//                   selectedSession?.user_id === session.user_id ? "bg-blue-50" : ""
//                 }`}
//               >
//                 <div className="w-10 h-10 rounded-full bg-gray-200 mr-3">
//                   {session.user_image && (
//                     <img
//                       src={session.user_image}
//                       alt={session.username}
//                       className="w-full h-full rounded-full object-cover"
//                     />
//                   )}
//                 </div>
                
//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-center">
//                     <h3 className="text-sm font-medium text-gray-900">{session.username}</h3>
//                     {session.unread_count > 0 && (
//                       <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//                         {session.unread_count}
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-sm text-gray-500 truncate">{session.last_message}</p>
//                   <time className="text-xs text-gray-400">
//                     {session.last_active}
//                   </time>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </nav>

//         <div className="flex-1 flex flex-col h-full">
//           <header className="h-16 border-b border-gray-200 flex items-center px-6 bg-white">
//             {selectedSession && (
//               <div className="flex items-center">
//                 <div className="w-8 h-8 rounded-full bg-gray-200 mr-3">
//                   {selectedSession.user_image && (
//                     <img
//                       src={selectedSession.user_image}
//                       alt={selectedSession.username}
//                       className="w-full h-full rounded-full object-cover"
//                     />
//                   )}
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-900">
//                     {selectedSession.username}
//                   </h3>
//                   {isTyping && (
//                     <p className="text-xs text-gray-500">typing...</p>
//                   )}
//                 </div>
//               </div>
//             )}
//           </header>

//           {connectionError && (
//             <div className="p-4 bg-red-50 border-l-4 border-red-500">
//               <p className="text-red-700">{connectionError}</p>
//             </div>
//           )}

//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {messages.map((msg) => (
//               <MessageBubble
//                 key={msg.id}
//                 msg={msg}
//                 isSenderAdmin={msg.is_sender_admin}
//               />
//             ))}
//             {isTyping && (
//               <div className="flex items-center gap-2 text-xs text-gray-500">
//                 <Loader className="animate-spin" size={12} />
//                 {selectedSession?.username} is typing...
//               </div>
//             )}
//             <div ref={chatEndRef} />
//           </div>

//           <form
//             onSubmit={handleSendMessage}
//             className="p-4 bg-white border-t border-gray-200 flex items-center gap-2"
//           >
//             <input
//               type="text"
//               placeholder="Type a message..."
//               className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               disabled={!selectedSession}
//             />
//             <button
//               type="submit"
//               disabled={!message.trim() || !selectedSession}
//               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Send size={18} />
//             </button>
//           </form>
//         </div>
//       </div>
//     </main>
//   );
// };

// const MessageBubble = React.memo(({ msg, isSenderAdmin }) => {
//   return (
//     <div className={`flex ${isSenderAdmin ? "justify-end" : "justify-start"}`}>
//       <div
//         className={`max-w-md px-4 py-2 rounded-lg ${
//           isSenderAdmin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
//         }`}
//       >
//         <p className="text-sm break-words">{msg.message}</p>
//         <div className="flex items-center justify-end gap-1 mt-1">
//           <time className="text-xs opacity-75">
//             {formatMessageTime(msg.timestamp)}
//           </time>
//           {isSenderAdmin && (
//             msg.is_read ? <CheckCheck className="text-white" size={12} /> : <Check className="text-white" size={12} />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// });

// export default AdminChat;