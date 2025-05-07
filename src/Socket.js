import { io } from "socket.io-client";

// Make sure we're using the correct URL
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
let socket = null;

export const connectSocket = (userId) => {
  if (!socket && userId) {
    try {
      console.log(`Connecting to socket at ${SOCKET_URL} with userId: ${userId}`);
      
      // Create socket with more robust error handling
      socket = io(SOCKET_URL, {
        auth: {
          userId,
        },
        // Try polling first, then websocket
        transports: ["polling", "websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        // Add path if your server uses a specific path
        path: "/socket.io/",
      });

      socket.on("connect", () => {
        console.log("✅ Connected to Socket.IO server with ID:", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.error("❌ Socket.IO connection error:", err.message);
        // Don't keep trying to reconnect if there's an auth error
        if (err.message.includes("authentication")) {
          socket.disconnect();
          socket = null;
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        // If the server disconnected us, don't try to reconnect
        if (reason === "io server disconnect") {
          socket.disconnect();
          socket = null;
        }
      });
      
      socket.on("reconnect_attempt", (attemptNumber) => {
        console.log(`Socket reconnection attempt #${attemptNumber}`);
      });
      
      socket.on("reconnect_failed", () => {
        console.error("Socket reconnection failed after all attempts");
        socket = null;
      });
    } catch (error) {
      console.error("Error initializing socket:", error);
      socket = null;
    }
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting socket");
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
