"use client"

import { useState } from "react"

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callApi = async (apiFunction) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFunction()
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message || "An error occurred")
      setLoading(false)
      throw err
    }
  }

  return { loading, error, callApi }
}
