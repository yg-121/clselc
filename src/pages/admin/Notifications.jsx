
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Check } from "react-feather"
import api, { handleApiError } from "../../utils/api"
import DataTable from "../../components/admin/DataTable"
import ErrorAlert from "../../components/admin/ErrorAlert"
import { formatDate } from "../../utils/formatters"
import { toast } from "react-toastify"

const Notifications = ({ resetNotificationCount }) => {
  const queryClient = useQueryClient()
  const [error, setError] = useState("")
  const [typeFilter, setTypeFilter] = useState("")

  // Fetch notifications - Fix the API endpoint path
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', typeFilter],
    queryFn: async () => {
      try {
        // The correct route that matches your backend
        let url = "/notifications/admin/notifications"
        if (typeFilter) {
          url += `?type=${typeFilter}`
        }
        const response = await api.get(url)
        return response.data.notifications || []
      } catch (error) {
        handleApiError(error, setError)
        throw error
      }
    },
  })

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      console.log("Marking notification as read:", notificationId);
      // The correct route that matches your backend
      const response = await api.patch(`/notifications/notifications/${notificationId}/read`);
      console.log("Mark as read response:", response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      resetNotificationCount();
      toast.success("Notification marked as read");
    },
    onError: (error) => {
      console.error("Failed to mark notification as read:", error);
      console.error("Error details:", error.response?.data || error.message);
      handleApiError(error, setError);
    },
  })

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    try {
      console.log("Attempting to mark all notifications as read");
      
      // Show loading state
      toast.info("Marking all notifications as read...");
      
      // Call the API endpoint with correct URL
      console.log("Calling API endpoint: /notifications/mark-all-read");
      const response = await api.patch("/notifications/mark-all-read");
      console.log("API response:", response.data);
      
      // Refetch notifications
      console.log("Invalidating notifications query");
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Reset notification count in the header/sidebar
      if (resetNotificationCount) {
        console.log("Resetting notification count");
        resetNotificationCount();
      }
      
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Failed to mark all notifications as read");
      handleApiError(error, setError);
    }
  }

  const columns = [
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => <div className="max-w-md truncate">{row.original.message}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.original.type === "new_user"
              ? "bg-green-100 text-green-800"
              : row.original.type === "case_update"
                ? "bg-blue-100 text-blue-800"
                : row.original.type === "appointment"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.original.status === "read" ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {row.original.status === "unread" && (
            <button
              onClick={() => handleMarkAsRead(row.original._id)}
              className="text-green-600 hover:text-green-800"
              aria-label="Mark as read"
            >
              <Check className="h-5 w-5" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Notification Center</h2>
        <button
          onClick={handleMarkAllAsRead}
          className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Mark All as Read
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      {/* Filters */}
      <div className="mb-6">
        <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Type
        </label>
        <select
          id="typeFilter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">All Types</option>
          <option value="new_user">New User</option>
          <option value="case_update">Case Update</option>
          <option value="appointment">Appointment</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* Notifications Table */}
      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={notifications || []} filterPlaceholder="Search notifications..." />
      )}
    </div>
  )
}

export default Notifications



