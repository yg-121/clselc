import { useState, useEffect } from "react"
import { useApi } from "../../hooks/useApi"
import { Auth } from "../../hooks/useAuth"

const PendingLawyers = () => {
  const { api } = useApi()
  const { user } = Auth()
  const [pendingLawyers, setPendingLawyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPendingLawyers = async () => {
      try {
        const response = await api.get("/users/pending-lawyers")
        setPendingLawyers(response.data.pendingLawyers || [])
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch pending lawyers")
      } finally {
        setLoading(false)
      }
    }

    fetchPendingLawyers()
  }, [api])

  const handleApprove = async (lawyerId) => {
    try {
      await api.put("/users/approve-lawyer", { lawyerId })
      setPendingLawyers(pendingLawyers.filter((lawyer) => lawyer._id !== lawyerId))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve lawyer")
    }
  }

  const handleReject = async (lawyerId) => {
    try {
      await api.put("/users/reject-lawyer", { lawyerId })
      setPendingLawyers(pendingLawyers.filter((lawyer) => lawyer._id !== lawyerId))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject lawyer")
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  if (user.role !== "LegalReviewer") {
    return (
      <div className="text-center text-red-500">
        Only Legal Reviewers can approve or reject lawyers.
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Pending Lawyers</h2>
      {pendingLawyers.length === 0 ? (
        <p>No pending lawyers found.</p>
      ) : (
        <ul>
          {pendingLawyers.map((lawyer) => (
            <li key={lawyer._id} className="flex justify-between items-center mb-2">
              <span>{lawyer.username} ({lawyer.email})</span>
              <div>
                <button
                  onClick={() => handleApprove(lawyer._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(lawyer._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PendingLawyers