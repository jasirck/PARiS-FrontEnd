import React, { useEffect, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';  
import { Bell, X } from 'lucide-react'; // Using lucide-react for icons
import { motion, AnimatePresence } from 'framer-motion'; // For animations

const NOTIFICATION_TIMEOUT = 5000; // Time in ms before a toast auto-dismisses

// Individual Toast Notification Component
const ToastNotification = ({ notification, onRemove }) => {
  // Auto-dismiss notification after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, NOTIFICATION_TIMEOUT);
    
    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`p-3 mb-2 bg-white rounded-md shadow-lg border-l-4 
        ${notification.type === 'info' ? 'border-blue-500' : 
          notification.type === 'success' ? 'border-green-500' : 
          notification.type === 'warning' ? 'border-yellow-500' : 'border-red-500'}
        max-w-xs w-full`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-800 text-sm font-medium">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
        </div>
        <button 
          onClick={() => onRemove(notification.id)} 
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const ToastNotificationContainer = () => {
  // WebSocket hook for connecting to the server
  const { messages, connectionStatus } = useWebSocket('ws://127.0.0.1:8000/ws/notifications/');
  
  // State for active toast notifications
  const [toasts, setToasts] = useState([]);

  // Effect to handle incoming messages
  useEffect(() => {
    if (messages.length > 0) {
      const newNotifications = messages.map((msg) => ({
        ...msg,
        id: Date.now() + Math.random(), // Generate unique ID
        timestamp: new Date().toLocaleTimeString(),
        type: getNotificationType(msg) // Determine notification type
      }));

      setToasts(prev => [...newNotifications, ...prev]);
    }
  }, [messages]);

  // Helper to determine notification type based on content
  const getNotificationType = (msg) => {
    const content = msg.message?.toLowerCase() || '';
    if (content.includes('approved')) return 'success';
    if (content.includes('pending')) return 'warning';
    if (content.includes('rejected') || content.includes('error')) return 'error';
    return 'info';
  };

  // Remove a specific notification
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification 
            key={toast.id} 
            notification={toast} 
            onRemove={removeToast} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotificationContainer;