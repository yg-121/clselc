import { io } from 'socket.io-client';

let socket;

export const connectSocket = (userId) => {
  if (!userId) {
    console.error('No user ID provided for socket connection');
    return null;
  }
  
  if (socket) {
    // If already connected, return existing socket
    return socket;
  }
  
  // Connect to the socket server
  socket = io('http://localhost:5000', {
    query: { userId },
  });
  
  socket.on('connect', () => {
    console.log('Socket connected with ID:', socket.id);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

export const getSocket = () => {
  return socket;
};