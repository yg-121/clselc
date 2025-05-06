// "use client"

// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { useAuth } from "../../context/AuthContext"
// import { useApi } from "../../hooks/useApi"
// import Button from "../common/Button"
// import Input from "../common/Input"
// import Modal from "../common/Modal"
// import { Search, Trash2, Eye, X, Shield } from "lucide-react"
// import { admin } from "../../services/api.js";

// const UserManagement = () => {
//   const navigate = useNavigate()
//   const { logout } = useAuth()
//   const api = useApi()

//   const [users, setUsers] = useState([])
//   const [filteredUsers, setFilteredUsers] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [filters, setFilters] = useState({
//     role: "",
//     status: "",
//   })
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false)
//   const [selectedUser, setSelectedUser] = useState(null)
//   const [isDeleting, setIsDeleting] = useState(false)
//   const [toast, setToast] = useState({ show: false, message: "", type: "" })
//   const [isAssignReviewerModalOpen, setIsAssignReviewerModalOpen] = useState(false)
//   const [userToDelete, setUserToDelete] = useState(null)
//   const [userToAssign, setUserToAssign] = useState(null)
//   const [assignReviewerLoading, setAssignReviewerLoading] = useState(false)

//   useEffect(() => {
//     // Force close modal with ESC key
//     const handleEsc = (event) => {
//       if (event.keyCode === 27) { // ESC key
//         setIsConfirmDeleteModalOpen(false);
//         setIsViewModalOpen(false);
//         setIsAssignReviewerModalOpen(false);
//       }
//     };
    
//     window.addEventListener('keydown', handleEsc);
    
//     return () => {
//       window.removeEventListener('keydown', handleEsc);
//     };
//   }, []);

//   // Fetch users
//   useEffect(() => {
//     const fetchUsers = async () => {
//       setIsLoading(true)
//       try {
//         const response = await api.get("/api/users")
//         setUsers(response.data.users || [])
//         setFilteredUsers(response.data.users || [])
//         setError(null)
//       } catch (error) {
//         console.error("Failed to fetch users:", error)
//         setError("Failed to load users. Please try again.")
//         if (error.response && error.response.status === 401) {
//           logout()
//           navigate("/auth/login")
//         }
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchUsers()
//   }, [api, logout, navigate])

//   // Filter users when filters change
//   useEffect(() => {
//     const filterUsers = async () => {
//       if (filters.role || filters.status) {
//         setIsLoading(true)
//         try {
//           const queryParams = []
//           if (filters.role) queryParams.push(`role=${filters.role}`)
//           if (filters.status) queryParams.push(`status=${filters.status}`)

//           const response = await api.get(`/api/users/filter?${queryParams.join("&")}`)
//           setUsers(response.data.users || [])
//           setFilteredUsers(response.data.users || [])
//         } catch (error) {
//           console.error("Failed to filter users:", error)
//           setToast({
//             show: true,
//             message: "Failed to filter users. Please try again.",
//             type: "error",
//           })
//         } finally {
//           setIsLoading(false)
//         }
//       }
//     }

//     filterUsers()
//   }, [filters, api])

//   // Handle search
//   useEffect(() => {
//     if (searchTerm) {
//       const results = users.filter(
//         (user) =>
//           user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           user.email.toLowerCase().includes(searchTerm.toLowerCase()),
//       )
//       setFilteredUsers(results)
//     } else {
//       setFilteredUsers(users)
//     }
//   }, [searchTerm, users])

//   // Show toast notification
//   const showToast = (message, type = "success") => {
//     setToast({ show: true, message, type })
//     setTimeout(() => {
//       setToast({ show: false, message: "", type: "" })
//     }, 3000)
//   }

//   // Handle filter change
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target
//     setFilters((prev) => ({ ...prev, [name]: value }))
//   }

//   // Reset filters
//   const resetFilters = () => {
//     setFilters({ role: "", status: "" })
//     setSearchTerm("")
//   }

//   // View user details
//   const handleViewUser = (user) => {
//     setSelectedUser(user)
//     setIsViewModalOpen(true)
//   }

//   // Handle delete user
//   const handleDeleteUser = async (userId) => {
//     try {
//       setIsDeleting(true)
//       await admin.deleteUser(userId)
//       setUsers(users.filter((user) => user._id !== userId))
//       setFilteredUsers(filteredUsers.filter((user) => user._id !== userId))
//       showToast("User deleted successfully!", "success")
//       setIsConfirmDeleteModalOpen(false)
//     } catch (error) {
//       console.error("Failed to delete user:", error)
//       showToast(error.response?.data?.message || "Failed to delete user", "error")
//       if (error.response && error.response.status === 401) {
//         logout()
//         navigate("/auth/login")
//       }
//     } finally {
//       setIsDeleting(false)
//     }
//   }

//   // Simple custom confirmation dialog
//   const SimpleConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
//     if (!isOpen) return null;
    
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 max-w-md w-full">
//           <h3 className="text-lg font-medium mb-4">{title}</h3>
//           <p className="mb-6">{message}</p>
//           <div className="flex justify-end space-x-3">
//             <button
//               onClick={onCancel}
//               className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={onConfirm}
//               className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Then use it in your component
//   const [confirmDialog, setConfirmDialog] = useState({
//     isOpen: false,
//     title: '',
//     message: '',
//     onConfirm: () => {},
//   });

//   const openDeleteConfirmation = (user) => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete User',
//       message: `Are you sure you want to delete user ${user.username}? This action cannot be undone.`,
//       onConfirm: () => {
//         handleDeleteUser(user._id);
//         setConfirmDialog({ ...confirmDialog, isOpen: false });
//       },
//     });
//   };

//   // Handle assign legal reviewer
//   const handleAssignReviewer = async (userId) => {
//     try {
//       setAssignReviewerLoading(true)
//       const response = await api.post("/api/users/assign-reviewer", { userId })
      
//       // Update the user in the lists
//       // eslint-disable-next-line no-unused-vars
//       const updatedUser = response.data.user
//       setUsers(users.map(user => 
//         user._id === userId ? { ...user, role: 'LegalReviewer', status: 'Active' } : user
//       ))
//       setFilteredUsers(filteredUsers.map(user => 
//         user._id === userId ? { ...user, role: 'LegalReviewer', status: 'Active' } : user
//       ))
      
//       showToast("User assigned as Legal Reviewer successfully!", "success")
//       setIsAssignReviewerModalOpen(false)
//     } catch (error) {
//       console.error("Failed to assign reviewer:", error)
//       showToast(error.response?.data?.message || "Failed to assign reviewer", "error")
//       if (error.response && error.response.status === 401) {
//         logout()
//         navigate("/auth/login")
//       }
//     } finally {
//       setAssignReviewerLoading(false)
//     }
//   }

//   // Open assign reviewer modal
//   const openAssignReviewerModal = (user) => {
//     setUserToAssign(user)
//     setIsAssignReviewerModalOpen(true)
//   }

//   if (isLoading && users.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   if (error && users.length === 0) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//         <strong className="font-bold">Error!</strong>
//         <span className="block sm:inline"> {error}</span>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-800">User Management</h1>

//         <div className="flex flex-col md:flex-row gap-2">
//           <div className="relative">
//             <Input
//               type="text"
//               placeholder="Search users..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//               aria-label="Search users"
//             />
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           </div>

//           <select
//             name="role"
//             value={filters.role}
//             onChange={handleFilterChange}
//             className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             aria-label="Filter by role"
//           >
//             <option value="">All Roles</option>
//             <option value="Admin">Admin</option>
//             <option value="Client">Client</option>
//             <option value="Lawyer">Lawyer</option>
//             <option value="LegalReviewer">Legal Reviewer</option>
//           </select>

//           <select
//             name="status"
//             value={filters.status}
//             onChange={handleFilterChange}
//             className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             aria-label="Filter by status"
//           >
//             <option value="">All Status</option>
//             <option value="Active">Active</option>
//             <option value="Pending">Pending</option>
//             <option value="Rejected">Rejected</option>
//           </select>

//           {(filters.role || filters.status || searchTerm) && (
//             <Button
//               onClick={resetFilters}
//               variant="secondary"
//               size="sm"
//               className="flex items-center gap-1"
//               aria-label="Clear filters"
//             >
//               <X className="h-4 w-4" /> Clear
//             </Button>
//           )}
//         </div>
//       </div>

//       <div className="bg-white shadow-md rounded-lg overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   ID
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   Username
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   Email
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   Role
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   Status
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   Photo
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {isLoading && users.length > 0 ? (
//                 <tr>
//                   <td colSpan="7" className="px-6 py-4 text-center">
//                     <div className="flex justify-center">
//                       <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredUsers.length === 0 ? (
//                 <tr>
//                   <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
//                     No users found matching your criteria.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredUsers.map((user) => (
//                   <tr key={user._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user._id}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           user.role === "Admin"
//                             ? "bg-purple-100 text-purple-800"
//                             : user.role === "Lawyer"
//                               ? "bg-blue-100 text-blue-800"
//                               : user.role === "Client"
//                                 ? "bg-green-100 text-green-800"
//                                 : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {user.role}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           user.status === "Active"
//                             ? "bg-green-100 text-green-800"
//                             : user.status === "Pending"
//                               ? "bg-yellow-100 text-yellow-800"
//                               : user.status === "Rejected"
//                                 ? "bg-red-100 text-red-800"
//                                 : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {user.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {user.profile_photo ? (
//                         <img
//                           src={user.profile_photo || "/placeholder.svg"}
//                           alt={`${user.username}'s profile`}
//                           className="h-10 w-10 rounded-full object-cover"
//                         />
//                       ) : (
//                         <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
//                           <span className="text-gray-500 text-sm font-medium">
//                             {user.username.charAt(0).toUpperCase()}
//                           </span>
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
//                       <Button
//                         onClick={() => handleViewUser(user)}
//                         variant="secondary"
//                         size="sm"
//                         className="inline-flex items-center"
//                         aria-label={`View ${user.username}`}
//                       >
//                         <Eye className="h-4 w-4 mr-1" /> View
//                       </Button>
                      
//                       {/* Add Assign Reviewer button if user is not Admin or LegalReviewer */}
//                       {user.role !== "Admin" && user.role !== "LegalReviewer" && (
//                         <Button
//                           onClick={() => openAssignReviewerModal(user)}
//                           variant="primary"
//                           size="sm"
//                           className="inline-flex items-center"
//                           aria-label={`Assign ${user.username} as reviewer`}
//                         >
//                           <Shield className="h-4 w-4 mr-1" /> Assign Reviewer
//                         </Button>
//                       )}
                      
//                       {/* Don't allow deleting Admin users */}
//                       {user.role !== "Admin" && (
//                         <Button
//                           onClick={() => openDeleteConfirmation(user)}
//                           variant="danger"
//                           size="sm"
//                           className="inline-flex items-center"
//                           disabled={isDeleting}
//                           aria-label={`Delete ${user.username}`}
//                         >
//                           <Trash2 className="h-4 w-4 mr-1" /> Delete
//                         </Button>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* View User Modal */}
//       <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="User Details">
//         {selectedUser && (
//           <div className="space-y-4">
//             <div className="flex justify-center">
//               {selectedUser.profile_photo ? (
//                 <img
//                   src={selectedUser.profile_photo || "/placeholder.svg"}
//                   alt={`${selectedUser.username}'s profile`}
//                   className="h-24 w-24 rounded-full object-cover"
//                 />
//               ) : (
//                 <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
//                   <span className="text-gray-500 text-xl font-medium">
//                     {selectedUser.username.charAt(0).toUpperCase()}
//                   </span>
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Username</p>
//                 <p className="text-base font-semibold">{selectedUser.username}</p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Email</p>
//                 <p className="text-base font-semibold">{selectedUser.email}</p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Role</p>
//                 <p className="text-base font-semibold">{selectedUser.role}</p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Status</p>
//                 <p className="text-base font-semibold">{selectedUser.status}</p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">ID</p>
//                 <p className="text-base font-semibold">{selectedUser._id}</p>
//               </div>
//               {selectedUser.phone && (
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Phone</p>
//                   <p className="text-base font-semibold">{selectedUser.phone}</p>
//                 </div>
//               )}
//             </div>

//             {selectedUser.role === "Lawyer" && (
//               <div className="border-t pt-4 mt-4">
//                 <h3 className="text-lg font-semibold mb-2">Lawyer Details</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {selectedUser.specialization && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Specialization</p>
//                       <p className="text-base font-semibold">
//                         {Array.isArray(selectedUser.specialization)
//                           ? selectedUser.specialization.join(", ")
//                           : selectedUser.specialization}
//                       </p>
//                     </div>
//                   )}
//                   {selectedUser.location && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Location</p>
//                       <p className="text-base font-semibold">{selectedUser.location}</p>
//                     </div>
//                   )}
//                   {selectedUser.yearsOfExperience && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Experience</p>
//                       <p className="text-base font-semibold">{selectedUser.yearsOfExperience} years</p>
//                     </div>
//                   )}
//                   {selectedUser.hourlyRate && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
//                       <p className="text-base font-semibold">${selectedUser.hourlyRate}/hr</p>
//                     </div>
//                   )}
//                 </div>
//                 {selectedUser.bio && (
//                   <div className="mt-4">
//                     <p className="text-sm font-medium text-gray-500">Bio</p>
//                     <p className="text-base">{selectedUser.bio}</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             <div className="flex justify-end mt-4">
//               <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Delete Confirmation Modal */}
//       <Modal 
//         isOpen={isConfirmDeleteModalOpen} 
//         onClose={() => setIsConfirmDeleteModalOpen(false)}
//         title="Delete User"
//       >
//         {userToDelete && (
//           <div className="space-y-4">
//             <p className="text-gray-700">
//               Are you sure you want to delete the user {userToDelete.username}? This action cannot be undone.
//             </p>
            
//             <div className="flex justify-end space-x-3 mt-6">
//               <button
//                 type="button"
//                 onClick={() => setIsConfirmDeleteModalOpen(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={() => handleDeleteUser(userToDelete._id)}
//                 disabled={isDeleting}
//                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
//               >
//                 {isDeleting ? "Deleting..." : "Delete"}
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Assign Reviewer Modal */}
//       <Modal 
//         isOpen={isAssignReviewerModalOpen} 
//         onClose={() => setIsAssignReviewerModalOpen(false)}
//         title="Assign Legal Reviewer"
//       >
//         {userToAssign && (
//           <div className="space-y-4">
//             <p className="text-gray-700">
//               Are you sure you want to assign <span className="font-semibold">{userToAssign.username}</span> as a Legal Reviewer?
//               This will give them additional permissions to review legal documents and cases.
//             </p>
            
//             <div className="flex justify-end space-x-3 mt-6">
//               <Button 
//                 variant="secondary" 
//                 onClick={() => setIsAssignReviewerModalOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 variant="primary" 
//                 onClick={() => handleAssignReviewer(userToAssign._id)}
//                 isLoading={assignReviewerLoading}
//                 disabled={assignReviewerLoading}
//               >
//                 Assign Reviewer
//               </Button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Toast Notification */}
//       {toast.show && (
//         <div
//           className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg ${
//             toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
//           }`}
//           role="alert"
//           aria-live="assertive"
//         >
//           {toast.message}
//         </div>
//       )}
//     </div>
//   )
// }

// export default UserManagement
