

import { useState } from "react"

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callApi = async (apiFunc, ...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFunc(...args)
      setLoading(false)
      return { data: response.data, success: true }
    } catch (err) {
      setLoading(false)
      const errorMessage = err.response?.data?.message || "An error occurred"
      setError(errorMessage)
      return { error: errorMessage, success: false }
    }
  }

  return { loading, error, callApi }
}

export default useApi
