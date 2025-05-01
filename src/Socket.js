import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Replace with your backend URL if different
let socket = null;

export const connectSocket = (userId) => {
  if (!socket && userId) {
    socket = io(SOCKET_URL, {
      auth: {
        userId, // Send the userId to the backend for room joining
      },
      transports: ["websocket"], // Ensure WebSocket transport
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
