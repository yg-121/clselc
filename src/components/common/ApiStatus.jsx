"use client"

import { useState, useEffect } from "react"

const ApiStatus = () => {
  // eslint-disable-next-line no-unused-vars
  const [status, setStatus] = useState("Checking API connection...")
  // eslint-disable-next-line no-unused-vars
  const [isConnected, setIsConnected] = useState(null)
  const API_BASE_URL = "http://localhost:5000"

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        console.log("Checking API connection to:", `${API_BASE_URL}/`)
        const response = await fetch(`${API_BASE_URL}/`, {
          method: "HEAD",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("API response status:", response.status)

        if (response.ok) {
          setStatus("API is connected")
          setIsConnected(true)
        } else {
          setStatus(`API returned status ${response.status}. Check server configuration.`)
          setIsConnected(false)
        }
      } catch (error) {
        console.error("API connection error:", error)
        setStatus(`Cannot connect to API. Make sure the server is running at ${API_BASE_URL}`)
        setIsConnected(false)
      }
    }

    checkApiConnection()
  }, [])

  // Return null to render nothing in the UI
  return null
}

export default ApiStatus