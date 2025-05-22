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
  
  // Retrieve token from localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage for socket connection');
    return null;
  }
  
  // Connect to the socket server with improved configuration
  socket = io('http://localhost:5000', {
    auth: { token, userId }, // Send both token and userId in auth object
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    withCredentials: true
  });
  
  socket.on('connect', () => {
    console.log('Socket connected with ID:', socket.id, 'User ID:', userId);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    console.log('Attempted auth data:', { token, userId });
    // Try to reconnect with polling if websocket fails
    if (socket.io.opts.transports.indexOf('polling') === -1) {
      console.log('Attempting to reconnect with polling transport');
      socket.io.opts.transports = ['polling', 'websocket'];
    }
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
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