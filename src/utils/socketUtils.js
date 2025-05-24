import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
  if (socket && socket.connected) {
    console.log("Socket already connected:", socket.id);
    return socket;
  }

  const token = localStorage.getItem("token");
  if (!userId || !token) {
    console.error("Cannot connect socket: Missing userId or token", { userId, hasToken: !!token });
    return null;
  }

  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
  console.log("Attempting to connect socket to:", socketUrl, "with userId:", userId);

  socket = io(socketUrl, {
    auth: { token, userId },
    path: "/socket.io",
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    randomizationFactor: 0.5,
    timeout: 10000,
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id, "User ID:", userId);
    socket.emit("join", userId);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message, "Auth:", { userId, hasToken: !!token });
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("Socket disconnected");
    socket = null;
  }
};

export const getSocket = () => socket;