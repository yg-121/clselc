import { useState } from "react";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiFunc, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
      console.log('[useApi] Success:', response.data);
      setLoading(false);
      return { data: response.data, success: true };
    } catch (err) {
      console.error('[useApi] Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        stack: err.stack,
      });
      setLoading(false);
      const errorMessage = err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
      return { error: errorMessage, success: false };
    }
  };

  return { loading, error, callApi };
}

export default useApi;