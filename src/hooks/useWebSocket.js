// src/hooks/useWebSocket.js

import { useEffect, useState } from 'react';

const useWebSocket = (url) => {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const ws = new WebSocket(url); // Connect to WebSocket

        ws.onopen = () => {
            console.log("WebSocket connection established");
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        setSocket(ws);

        return () => {
            ws.close(); // Cleanup on component unmount
        };
    }, [url]);

    return { messages, socket };
};

export default useWebSocket;
