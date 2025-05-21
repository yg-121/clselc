import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = () => {
  if (socket) return socket;
  
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No auth token available for socket connection");
    return null;
  }
  
  // Connect to the root URL without any namespace
  const socketUrl = "http://localhost:5000"; // Use hardcoded URL for testing
  console.log("Initializing socket connection to:", socketUrl);
  
  try {
    // Connect to the default namespace
    socket = io(socketUrl, {
      auth: { token }
    });
    
    socket.on("connect", () => {
      console.log("Socket connected successfully with ID:", socket.id);
    });
    
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });
    
    return socket;
  } catch (error) {
    console.error("Failed to initialize socket:", error);
    return null;
  }
};

export const getSocket = () => {
  return socket || initializeSocket();
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected");
  }
};
