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
  
  // Connect to the socket server with improved configuration
  socket = io('http://localhost:5000', {
    query: { userId },
    transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
    reconnectionAttempts: 5,              // Try to reconnect 5 times
    reconnectionDelay: 1000,              // Start with 1 second delay
    reconnectionDelayMax: 5000,           // Maximum 5 seconds delay
    timeout: 20000,                       // 20 seconds timeout
    withCredentials: true                 // Send cookies if needed
  });
  
  socket.on('connect', () => {
    console.log('Socket connected with ID:', socket.id);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    // Try to reconnect with polling if websocket fails
    if (socket.io.opts.transports.indexOf('polling') === -1) {
      console.log('Attempting to reconnect with polling transport');
      socket.io.opts.transports = ['polling', 'websocket'];
    }
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      // The server has forcefully disconnected the socket
      console.log('Attempting to reconnect...');
      socket.connect();
    }
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
