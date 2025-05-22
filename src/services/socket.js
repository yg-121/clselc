import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let socket = null;

export const socketService = {
  initialize(userId) {
    if (!userId) {
      console.error('[Socket] User ID is required');
      return null;
    }

    if (socket && socket.connected) {
      return socket;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('[Socket] Token is required');
        return null;
      }

      socket = io(SOCKET_URL, {
        auth: { token, userId },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log(`[Socket] Connected with ID: ${socket.id}`);
      });

      socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
      });

      socket.on('error', (error) => {
        console.error('[Socket] Error:', error.message);
      });

      return socket;
    } catch (error) {
      console.error('[Socket] Initialization error:', error.message);
      return null;
    }
  },

  on(event, callback) {
    if (socket) {
      socket.on(event, callback);
    } else {
      console.warn(`[Socket] Cannot listen to ${event}: Socket not initialized`);
    }
  },

  off(event) {
    if (socket) {
      socket.off(event);
    }
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('[Socket] Disconnected');
    }
  },
};

export default socketService;