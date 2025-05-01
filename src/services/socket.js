import { io } from "socket.io-client"

// Socket singleton
let socket = null

// Socket service
const socketService = {
  // Initialize socket connection
  initialize() {
    if (!socket) {
      // Use relative URL for socket connection (same origin)
      socket = io("/", {
        path: "/socket.io",
        auth: {
          token: localStorage.getItem("token"),
        },
      })

      console.log("Socket initialized")

      socket.on("connect", () => {
        console.log("Connected to socket server")
      })

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message)
      })
    }
    return socket
  },

  // Get existing socket or initialize a new one
  getSocket() {
    if (!socket) {
      return this.initialize()
    }
    return socket
  },

  // Disconnect socket
  disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
      console.log("Socket disconnected")
    }
  },

  // Listen for events
  on(event, callback) {
    const s = this.getSocket()
    s.on(event, callback)
    return () => s.off(event, callback)
  },

  // Remove event listener
  off(event, callback) {
    if (socket) {
      socket.off(event, callback)
    }
  },

  // Emit event
  emit(event, data) {
    const s = this.getSocket()
    s.emit(event, data)
  },
}

export default socketService
