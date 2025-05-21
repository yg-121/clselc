import { io } from "socket.io-client"

// Socket singleton
let socket = null

// Socket service
const socketService = {
  // Initialize socket connection
  initialize(userId) {
    if (!socket) {
      try {
        // Get authentication token
        const token = localStorage.getItem("token")
        
        if (!token) {
          console.error("No authentication token found")
          return null
        }
        
        // Use absolute URL instead of relative URL
        const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
        
        console.log(`Initializing socket connection to ${socketUrl}`)
        
        // Create socket with proper configuration
        socket = io(socketUrl, {
          path: "/socket.io",
          auth: {
            token,
            userId
          },
          transports: ["websocket", "polling"],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000
        })

        console.log("Socket initialized")

        socket.on("connect", () => {
          console.log("Connected to socket server with ID:", socket.id)
        })

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err)
          console.error("Error details:", err.message || "No error message")
          
          // If we have authentication issues, don't keep trying
          if (err.message && (err.message.includes("auth") || err.message.includes("token"))) {
            console.error("Authentication error, disconnecting socket")
            this.disconnect()
          }
        })
        
        socket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason)
        })
      } catch (error) {
        console.error("Error creating socket:", error)
        socket = null
      }
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
