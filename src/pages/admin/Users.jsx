/* eslint-disable no-dupe-else-if */

"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2, UserPlus, Shield } from "react-feather"
import api, { handleApiError } from "../../utils/api"
import DataTable from "../../components/admin/DataTable"
import Modal from "../../components/admin/Modal"
import ErrorAlert from "../../components/admin/ErrorAlert"
import { toast } from "react-toastify"
import SimpleUserList from "./SimpleUserList" // Import the SimpleUserList component

const Users = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [showAssignReviewerModal, setShowAssignReviewerModal] = useState(false)
  // Remove the unused selectedUser state
  // const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  })
  const [selectedReviewer, setSelectedReviewer] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [useSimpleView, setUseSimpleView] = useState(false) // Toggle between views
  // Add these states for the search functionality
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Add this function at the top of your component
  const openDeleteConfirmation = (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.username || user.email}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user._id);
    }
  };

  // Add a function to search for users
  const searchUsers = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await api.get(`/users/search?query=${encodeURIComponent(searchQuery)}`)
      // Filter out users who are already reviewers or admins
      const filteredResults = response.data.filter(
        user => user.role !== "LegalReviewer" && user.role !== "Admin"
      )
      setSearchResults(filteredResults)
    } catch (error) {
      console.error("Failed to search users:", error)
      handleApiError(error, setError)
    } finally {
      setIsSearching(false)
    }
  }

  // Fetch users - Fix the endpoint and data handling
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', roleFilter, statusFilter],
    queryFn: async () => {
      try {
        let url = "/users"
        if (roleFilter || statusFilter) {
          url += "/filter"
          const params = {}
          if (roleFilter) params.role = roleFilter
          if (statusFilter) params.status = statusFilter
          url += "?" + new URLSearchParams(params).toString()
        }
        
        console.log("Fetching users from:", url)
        const response = await api.get(url)
        console.log("Users API response:", response.data)
        
        // Handle different response structures
        if (response.data && Array.isArray(response.data.users)) {
          return response.data.users
        } else if (Array.isArray(response.data)) {
          return response.data
        // eslint-disable-next-line no-dupe-else-if
        } else if (response.data && response.data.message && Array.isArray(response.data.users)) {
          return response.data.users
        }
        
        console.warn("Unexpected users data format:", response.data)
        return []
      } catch (error) {
        console.error("Failed to fetch users:", error)
        handleApiError(error, setError)
        return [] // Return empty array instead of throwing
      }
    },
  })

  // Fetch pending lawyers - Fix the endpoint and data handling
  const { data: pendingLawyers, isLoading: isLoadingPendingLawyers } = useQuery({
    queryKey: ['pendingLawyers'],
    queryFn: async () => {
      try {
        console.log("Fetching pending lawyers")
        const response = await api.get("/users/pending-lawyers")
        console.log("Pending lawyers API response:", response.data)
        
        // Handle different response structures
        if (response.data && Array.isArray(response.data.pendingLawyers)) {
          return response.data.pendingLawyers
        } else if (Array.isArray(response.data)) {
          return response.data
        } else if (response.data && response.data.message && Array.isArray(response.data.pendingLawyers)) {
          return response.data.pendingLawyers
        }
        
        console.warn("Unexpected pending lawyers data format:", response.data)
        return []
      } catch (error) {
        console.error("Failed to fetch pending lawyers:", error)
        handleApiError(error, setError)
        return [] // Return empty array instead of throwing
      }
    },
    enabled: activeTab === "pending",
  })

  // Add admin mutation
  const addAdminMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/users/add-admin", data)
      return response.data
    },
    onSuccess: () => {
      toast.success("Admin added successfully")
      setShowAddAdminModal(false)
      setFormData({
        username: "",
        email: "",
        password: "",
        phone: "",
      })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      handleApiError(error, setError)
    },
  })

  // Assign reviewer mutation
  const assignReviewerMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.post("/users/assign-reviewer", { userId })
      return response.data
    },
    onSuccess: () => {
      toast.success("User assigned as Legal Reviewer successfully")
      setShowAssignReviewerModal(false)
      setSearchQuery("")
      setSearchResults([])
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      handleApiError(error, setError)
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.delete(`/users/${userId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success("User deleted successfully")
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['pendingLawyers'] })
    },
    onError: (error) => {
      handleApiError(error, setError)
    },
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddAdmin = (e) => {
    e.preventDefault()
    addAdminMutation.mutate(formData)
  }

  const handleAssignReviewer = (userId) => {
    if (userId) {
      assignReviewerMutation.mutate(userId)
    }
  }

  // Remove the unused handleDeleteUser function since we're using openDeleteConfirmation directly
  // const handleDeleteUser = () => {
  //   if (selectedUser) {
  //     deleteUserMutation.mutate(selectedUser._id)
  //   }
  // }

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "ID",
        cell: ({ row }) => <span className="text-xs">{row.original._id}</span>,
      },
      {
        accessorKey: "username",
        header: "Username",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              row.original.role === "Admin"
                ? "bg-purple-100 text-purple-800"
                : row.original.role === "Lawyer"
                  ? "bg-blue-100 text-blue-800"
                  : row.original.role === "LegalReviewer"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              row.original.status === "Active"
                ? "bg-green-100 text-green-800"
                : row.original.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : row.original.status === "Suspended"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => openDeleteConfirmation(row.original)}
              className="text-red-600 hover:text-red-900"
              disabled={deleteUserMutation.isLoading}
            >
              <Trash2 className="h-5 w-5" />
            </button>
            {row.original.role !== "Admin" && row.original.role !== "LegalReviewer" && (
              <button
                onClick={() => {
                  setSelectedReviewer(row.original._id)
                  setShowAssignReviewerModal(true)
                }}
                className="text-green-600 hover:text-green-800"
                aria-label="Assign as reviewer"
              >
                <Shield className="h-5 w-5" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [deleteUserMutation.isLoading]
  )

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setUseSimpleView(!useSimpleView)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {useSimpleView ? "Switch to Advanced View" : "Switch to Simple View"}
          </button>
          <button
            onClick={() => setShowAddAdminModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Admin
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "pending"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`} 
          >
            Pending Lawyers
          </button>
        </nav>
      </div>

      {activeTab === "all" && (
        <>
          {/* Toggle between SimpleUserList and the existing complex view */}
          {useSimpleView ? (
            <SimpleUserList />
          ) : (
            <>
              {/* Existing filter controls */}
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Role
                    </label>
                    <select
                      id="roleFilter"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Lawyer">Lawyer</option>
                      <option value="Client">Client</option>
                      <option value="LegalReviewer">Legal Reviewer</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Status
                    </label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setRoleFilter("")
                        setStatusFilter("")
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              {isLoadingUsers ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : users && users.length > 0 ? (
                <DataTable columns={columns} data={users} filterPlaceholder="Search users..." />
              ) : (
                <div className="text-center py-4 bg-white shadow rounded-lg">
                  <p className="text-gray-500 py-8">No users found. Try adjusting your filters.</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === "pending" && (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Lawyer Approvals</h3>
          {isLoadingPendingLawyers ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading pending lawyers...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={pendingLawyers || []} filterPlaceholder="Search pending lawyers..." />
          )}
        </>
      )}

      {/* Add Admin Modal */}
      <Modal isOpen={showAddAdminModal} onClose={() => setShowAddAdminModal(false)} title="Add New Admin">
        <form onSubmit={handleAddAdmin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone (optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddAdminModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addAdminMutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {addAdminMutation.isPending ? "Adding..." : "Add Admin"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Reviewer Modal */}
      <Modal
        isOpen={showAssignReviewerModal}
        onClose={() => setShowAssignReviewerModal(false)}
        title="Assign Legal Reviewer"
      >
        <div className="space-y-6">
          <div>
            <label htmlFor="search-user" className="block text-sm font-medium text-gray-700 mb-1">
              Search User by Username or Email
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="search-user"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter username or email"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={searchUsers}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === "Lawyer"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "Client"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAssignReviewer(user._id)}
                            disabled={assignReviewerMutation.isPending}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Assign as Reviewer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : searchQuery && !isSearching ? (
            <p className="text-sm text-gray-500 mt-2">No users found matching your search.</p>
          ) : null}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowAssignReviewerModal(false)
                setSearchQuery("")
                setSearchResults([])
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Users
