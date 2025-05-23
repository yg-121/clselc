import io from "socket.io-client"
import { getToken } from "./auth.js"

class SocketService {
  constructor() {
    this.socket = null
    this.callbacks = {}
  }

  initialize(userId) {
    if (this.socket) {
      return this.socket
    }

    const token = getToken()
    if (!token || !userId) {
      console.error("Socket initialization failed: Missing token or userId")
      return null
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"

    this.socket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: {
        token,
        userId,
      },
    })

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id)
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message)
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
    })

    return this.socket
  }

  on(event, callback) {
    if (!this.socket) {
      console.error("Socket not initialized")
      return
    }

    // Store callback reference for potential cleanup
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)

    this.socket.on(event, callback)
  }

  off(event, callback) {
    if (!this.socket) {
      return
    }

    if (callback) {
      this.socket.off(event, callback)
      // Remove specific callback from our tracking
      if (this.callbacks[event]) {
        this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback)
      }
    } else {
      // Remove all callbacks for this event
      if (this.callbacks[event]) {
        this.callbacks[event].forEach((cb) => {
          this.socket.off(event, cb)
        })
        delete this.callbacks[event]
      }
    }
  }

  emit(event, data) {
    if (!this.socket) {
      console.error("Socket not initialized")
      return
    }
    this.socket.emit(event, data)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.callbacks = {}
    }
  }
}

// Create a singleton instance
const socketService = new SocketService()
export default socketService
