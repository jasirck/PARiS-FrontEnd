// src/components/VisaNotificationComponent.js

import React, { useEffect, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';  
import { Bell } from 'lucide-react'; // Using lucide-react for icons
import { motion, AnimatePresence } from 'framer-motion'; // For animations

const MAX_NOTIFICATIONS = 50;

const VisaNotificationComponent = () => {
    const { messages, connectionStatus } = useWebSocket('ws://127.0.0.1:8000/ws/visa_notifications/');
    const [notifications, setNotifications] = useState([]);
    // console.log('WebSocket Connection Status:', connectionStatus);


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

    if (notifications.length === 0) return null; // Only show if there are notifications

    return (
        <div className="max-w-lg mx-auto p-4 bg-gray-100 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Visa Notifications</h2>
                <div className="flex items-center space-x-2">
                    <span
                        className={`text-sm ${
                            connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {connectionStatus === 'connected' ? 'Connected' : 'Reconnecting...'}
                    </span>
                    <Bell className="w-6 h-6 text-gray-600" />
                </div>
            </div>
            {notifications.length > 0 ? (
                <div className="space-y-2">
                    <AnimatePresence>
                        {notifications.map((notification, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-3 bg-white rounded-md shadow-md border-l-4 border-blue-500"
                            >
                                {notification.message}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <p className="text-sm text-gray-600 text-center">No notifications yet.</p>
            )}
            {notifications.length > 0 && (
                <button
                    className="mt-4 w-full py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
                    onClick={clearNotifications}
                >
                    Clear Notifications
                </button>
            )}
        </div>
    );
};

export default VisaNotificationComponent;
