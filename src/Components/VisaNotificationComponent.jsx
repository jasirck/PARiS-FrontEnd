import React, { useEffect, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';  
import { Bell } from 'lucide-react'; // Using lucide-react for icons
import { motion, AnimatePresence } from 'framer-motion'; // For animations

const MAX_NOTIFICATIONS = 50;

const VisaNotificationComponent = () => {
    const { messages, connectionStatus } = useWebSocket('ws://127.0.0.1:8000/ws/visa_notifications/');
    const [notifications, setNotifications] = useState([]);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        if (messages.length > 0) {
            console.log('Received messages:', messages);
            setNotifications((prevNotifications) => {
                const updatedNotifications = [...messages, ...prevNotifications];
                return updatedNotifications.slice(0, MAX_NOTIFICATIONS);
            });
        }
    }, [messages]);
    
    const clearNotifications = () => {
        setNotifications([]);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    if (notifications.length === 0) return null; // Only show if there are notifications

    return (
        <div className="max-w-lg mx-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Bell className={`w-6 h-6 ${connectionStatus === 'connected' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <h2 className="text-lg font-bold text-gray-800">Visa Notifications</h2>
                </div>
                <div className="flex items-center space-x-3">
                    <span
                        className={`text-sm px-2 py-1 rounded-full ${
                            connectionStatus === 'connected' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {connectionStatus === 'connected' ? 'Connected' : 'Reconnecting...'}
                    </span>
                    <button 
                        onClick={toggleExpand}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        {isExpanded ? '▼' : '▲'}
                    </button>
                </div>
            </div>
            
            {isExpanded && notifications.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                    <AnimatePresence>
                        {notifications.map((notification, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`p-3 bg-white rounded-md shadow-sm 
                                    border-l-4 ${index % 3 === 0 ? 'border-blue-500' : index % 3 === 1 ? 'border-purple-500' : 'border-indigo-500'}
                                    hover:shadow-md transition-shadow duration-200 transform hover:-translate-y-1 transition-transform`}
                            >
                                <p className="text-gray-800">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">Just now</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
            
            {isExpanded && notifications.length > 0 && (
                <button
                    className="mt-4 w-full py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-md hover:from-red-600 hover:to-red-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    onClick={clearNotifications}
                >
                    Clear All Notifications
                </button>
            )}
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cccccc;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #aaaaaa;
                }
            `}</style>
        </div>
    );
};

export default VisaNotificationComponent;