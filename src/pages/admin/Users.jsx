import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../services/api"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Search, UserCheck, UserX, UserPlus, FileText, Shield, Trash2, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Replace the Label import with a simple label component
const Label = ({ htmlFor, children }) => (
  <label 
    htmlFor={htmlFor} 
    className="text-sm font-medium leading-none mb-2 block"
  >
    {children}
  </label>
)

// Add this function to properly format license file URLs
const getLicenseFileUrl = (licenseFile) => {
  if (!licenseFile) return null;
  
  // If it's already a base64 string, return it directly
  if (licenseFile.startsWith('data:') || licenseFile.includes(';base64,')) {
    return licenseFile;
  }
  
  // Ensure the path starts with a slash
  const path = licenseFile.startsWith('/') ? licenseFile : `/${licenseFile}`;
  
  // Construct the full URL with proper slash between base URL and path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${path}`;
};

// Add this function to directly open the license file
const openLicenseFile = (licenseFile, e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  if (!licenseFile) {
    toast.warning("No license file available");
    return;
  }
  
  // Use the getLicenseFileUrl function to get the proper URL
  const licenseUrl = getLicenseFileUrl(licenseFile);
  
  // Create a temporary anchor element to force an external link
  const a = document.createElement('a');
  a.href = licenseUrl;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  console.log("Opening license file at:", licenseUrl);
};

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false)
  const [showLicenseDialog, setShowLicenseDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAssignReviewerDialog, setShowAssignReviewerDialog] = useState(false)
  const [reviewerSearchTerm, setReviewerSearchTerm] = useState("")
  const [selectedLawyer, setSelectedLawyer] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [userToAssign, setUserToAssign] = useState(null)
  const [newAdmin, setNewAdmin] = useState({ username: "", email: "", password: "" })
  const [assignSuccess, setAssignSuccess] = useState(null)
  
  const queryClient = useQueryClient()
  
  // Fetch all users
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get("/users")
      console.log("API Response (all users):", response.data)
      return response.data || []
    }
  })

  // Fetch pending lawyers specifically
  const { data: pendingLawyersData, isLoading: isLoadingPending, error: pendingError } = useQuery({
    queryKey: ['pending-lawyers'],
    queryFn: async () => {
      const response = await api.get("/users/pending-lawyers");
      console.log("API Response (pending lawyers):", response.data);
      
      // Ensure we have the license_file field for each lawyer
      const pendingLawyers = response.data.pendingLawyers || [];
      
      // Log the license file paths for debugging
      if (pendingLawyers.length > 0) {
        console.log("License file paths:");
        pendingLawyers.forEach(lawyer => {
          console.log(`${lawyer.username}: ${lawyer.license_file}`);
          if (lawyer.license_file) {
            console.log(`Constructed URL: ${getLicenseFileUrl(lawyer.license_file)}`);
          }
        });
      }
      
      return pendingLawyers;
    }
  })

  // Ensure users is always an array before rendering
  const users = Array.isArray(usersData) ? usersData : 
               (usersData && Array.isArray(usersData.users)) ? usersData.users : [];
  
  // Get pending lawyers from the dedicated endpoint
  const pendingLawyers = pendingLawyersData || [];
  
  console.log("Users data:", users)
  console.log("Pending lawyers:", pendingLawyers)
  
  // Add admin mutation
  const addAdminMutation = useMutation({
    mutationFn: async (adminData) => {
      return await api.post("/users/add-admin", adminData)
    },
    onSuccess: () => {
      toast.success("Admin added successfully")
      setShowAddAdminDialog(false)
      setNewAdmin({ username: "", email: "", password: "" })
      queryClient.invalidateQueries(['users'])
    },
    onError: (error) => {
      toast.error(`Failed to add admin: ${error.response?.data?.message || error.message}`)
    }
  })
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      return await api.delete(`/users/${userId}`)
    },
    onSuccess: () => {
      toast.success("User deleted successfully")
      setShowDeleteDialog(false)
      setUserToDelete(null)
      queryClient.invalidateQueries(['users'])
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.response?.data?.message || error.message}`)
    }
  })
  
  // Approve lawyer mutation
  const approveLawyerMutation = useMutation({
    mutationFn: async (lawyerId) => {
      return await api.put(`/users/approve-lawyer`, { lawyerId })
    },
    onSuccess: () => {
      toast.success("Lawyer approved successfully")
      queryClient.invalidateQueries(['users'])
    },
    onError: (error) => {
      toast.error(`Failed to approve lawyer: ${error.response?.data?.message || error.message}`)
    }
  })
  
  // Reject lawyer mutation
  const rejectLawyerMutation = useMutation({
    mutationFn: async (lawyerId) => {
      return await api.put(`/users/reject-lawyer`, { lawyerId })
    },
    onSuccess: () => {
      toast.success("Lawyer rejected")
      queryClient.invalidateQueries(['users'])
    },
    onError: (error) => {
      toast.error(`Failed to reject lawyer: ${error.response?.data?.message || error.message}`)
    }
  })
  
  // Assign reviewer mutation
  const assignReviewerMutation = useMutation({
    mutationFn: async (userId) => {
      try {
        const response = await api.post(`/users/assign-reviewer`, { userId });
        return response.data;
      } catch (error) {
        if (error.response?.data?.message?.includes("already a Legal Reviewer")) {
          throw new Error("User is already a Legal Reviewer");
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Find the user that was assigned
      const assignedUser = users.find(user => user._id === variables);
      const username = assignedUser ? assignedUser.username : "User";
      
      // Set success message with username
      setAssignSuccess(`${username} was successfully assigned as a Legal Reviewer!`);
      
      // Show toast
      toast.success(`${username} assigned as Legal Reviewer successfully!`, {
        toastId: `assign-success-${Date.now()}`
      });
      
      // Close dialog and reset state after a delay
      setTimeout(() => {
        setShowAssignReviewerDialog(false);
        setUserToAssign(null);
        
        // Clear success message after dialog closes
        setTimeout(() => {
          setAssignSuccess(null);
        }, 500);
      }, 1500);
      
      // Refresh data
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['pending-lawyers']);
    },
    onError: (error) => {
      toast.error(`${error.message}`, {
        toastId: `assign-error-${Date.now()}`
      });
    }
  })
  
  // Handle add admin
  const handleAddAdmin = () => {
    if (!newAdmin.username || !newAdmin.email || !newAdmin.password) {
      toast.error("Please fill all fields")
      return
    }
    
    addAdminMutation.mutate(newAdmin)
  }
  
  // Open delete confirmation dialog
  const openDeleteDialog = (user) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }
  
  // Handle delete user
  const handleDeleteUser = () => {
    if (userToDelete && userToDelete._id) {
      deleteUserMutation.mutate(userToDelete._id)
    }
  }
  
  // Handle approve lawyer
  const handleApproveLawyer = (lawyerId) => {
    approveLawyerMutation.mutate(lawyerId)
  }
  
  // Handle reject lawyer
  const handleRejectLawyer = (lawyerId) => {
    rejectLawyerMutation.mutate(lawyerId)
  }
  
  // Handle assign reviewer with optimistic update
  const handleAssignReviewer = (userId) => {
    // Optimistic update - update UI immediately
    const userToUpdate = users.find(user => user._id === userId);
    if (userToUpdate) {
      // Create a copy of users with the updated role
      const updatedUsers = users.map(user => 
        user._id === userId ? {...user, role: "LegalReviewer"} : user
      );
      
      // Update the UI immediately
      queryClient.setQueryData(['users'], updatedUsers);
    }
    
    // Trigger the mutation
    assignReviewerMutation.mutate(userId);
  }
  
  // Handle view license
  const handleViewLicense = (lawyer) => {
    console.log("Viewing license for lawyer:", lawyer);
    
    // Check if license file exists
    if (!lawyer.license_file) {
      toast.warning(`No license file available for ${lawyer.username}`);
      return;
    }
    
    // Set the selected lawyer and open the dialog
    setSelectedLawyer(lawyer);
    setShowLicenseDialog(true);
  };

  if (isLoadingUsers || isLoadingPending) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }
  
  if (usersError || pendingError) {
    return <div className="flex justify-center items-center h-64 text-red-500">
      Error: {usersError?.message || pendingError?.message}
    </div>
  }

  // Get pending lawyers count
  const pendingLawyersCount = pendingLawyers.length;

  // Now users is guaranteed to be an array
  const filteredUsers = activeTab === "pending" 
    ? pendingLawyers.filter(lawyer => 
        lawyer.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        lawyer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users.filter(user => {
        const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        
        if (activeTab === "all") return matchesSearch
        if (activeTab === "clients") return matchesSearch && user.role === "Client"
        if (activeTab === "lawyers") return matchesSearch && user.role === "Lawyer"
        if (activeTab === "admins") return matchesSearch && user.role === "Admin"
        if (activeTab === "reviewers") return matchesSearch && user.role === "LegalReviewer"
        return matchesSearch
      });

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => setShowAddAdminDialog(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
          
          <Button 
            onClick={() => setShowAssignReviewerDialog(true)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Shield className="h-4 w-4 mr-2" />
            Assign Reviewer
          </Button>
          
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 sm:px-6 overflow-x-auto">
              <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="lawyers">Lawyers</TabsTrigger>
                <TabsTrigger value="admins">Admins</TabsTrigger>
                <TabsTrigger value="reviewers">Legal Reviewers</TabsTrigger>
                <TabsTrigger value="pending" className="relative">
                  Pending Lawyers
                  {pendingLawyersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingLawyersCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={activeTab} className="overflow-x-auto">
              <div className="min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Username</TableHead>
                      <TableHead className="w-[250px]">Email</TableHead>
                      <TableHead className="w-[120px]">Role</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="text-right w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {activeTab === "pending" ? (
                            <div className="flex flex-col items-center text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-lg font-medium">No pending lawyers</p>
                              <p className="text-sm">All lawyer applications have been reviewed</p>
                            </div>
                          ) : (
                            "No users found"
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow 
                          key={user._id}
                          className={user.role === "Lawyer" && user.status === "pending" ? "bg-amber-50" : ""}
                        >
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={
                              user.role === "Admin" ? "destructive" : 
                              user.role === "Lawyer" ? "default" : 
                              user.role === "LegalReviewer" ? "warning" :
                              "secondary"
                            }>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {activeTab === "pending" || (user.role === "Lawyer" && user.status === "pending") ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Pending Approval
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {user.role === "Lawyer" && user.status === "pending" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 w-8 p-0 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                                    onClick={() => handleApproveLawyer(user._id)}
                                    title="Approve Lawyer"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 w-8 p-0 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
                                    onClick={() => handleRejectLawyer(user._id)}
                                    title="Reject Lawyer"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openLicenseFile(user.license_file, e);
                                    }}
                                    title="View License"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              
                              {/* Delete user button - don't allow deleting own account */}
                              {user.role !== "Admin" && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 text-destructive"
                                  onClick={() => openDeleteDialog(user)}
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button size="sm" variant="outline" className="h-8">
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Add Admin Dialog */}
      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAdminDialog(false)}>Cancel</Button>
            <Button onClick={handleAddAdmin} disabled={addAdminMutation.isLoading}>
              {addAdminMutation.isLoading ? "Adding..." : "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View License Dialog */}
      <Dialog open={showLicenseDialog} onOpenChange={setShowLicenseDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lawyer License - {selectedLawyer?.username}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {selectedLawyer?.license_file ? (
              <div className="space-y-4">
                {/* PDF Viewer */}
                <div className="w-full h-[70vh] border rounded-md overflow-hidden bg-gray-100">
                  <iframe 
                    src={getLicenseFileUrl(selectedLawyer.license_file)} 
                    className="w-full h-full" 
                    title="License Document"
                  />
                </div>
                
                {/* Direct backend URL for download */}
                <div className="text-center p-4 border rounded-md bg-gray-50">
                  <p className="mb-4">Download or view the license file:</p>
                  <Button 
                    onClick={() => openLicenseFile(selectedLawyer.license_file)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Open License File
                  </Button>
                </div>
                
                {/* Show file path for reference */}
                <div className="p-2 bg-gray-100 rounded text-sm">
                  <p><strong>File path:</strong> {selectedLawyer.license_file}</p>
                  <p><strong>Full URL:</strong> {getLicenseFileUrl(selectedLawyer.license_file)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No license file available
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLicenseDialog(false)}>Close</Button>
            <Button 
              onClick={() => {
                handleApproveLawyer(selectedLawyer._id);
                setShowLicenseDialog(false);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve Lawyer
            </Button>
            <Button 
              onClick={() => {
                handleRejectLawyer(selectedLawyer._id);
                setShowLicenseDialog(false);
              }}
              variant="destructive"
            >
              Reject Lawyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              <h2 className="text-xl font-semibold">Confirm Deletion</h2>
            </div>
            
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete user <span className="font-semibold">{userToDelete?.username}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteUserMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isLoading}
              >
                {deleteUserMutation.isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete User"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Assign Reviewer Dialog */}
      <Dialog open={showAssignReviewerDialog} onOpenChange={(open) => {
        if (!open) {
          setUserToAssign(null);
          setAssignSuccess(null);
        }
        setShowAssignReviewerDialog(open);
      }}>
        <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-amber-500" />
              Assign Legal Reviewer
            </DialogTitle>
          </DialogHeader>
          
          {assignSuccess ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600">{assignSuccess}</p>
              <div className="mt-6">
                <Button 
                  onClick={() => {
                    setShowAssignReviewerDialog(false);
                    setAssignSuccess(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : userToAssign ? (
            <>
              <div className="py-4">
                <p className="text-gray-600">
                  Are you sure you want to assign <span className="font-semibold">{userToAssign.username}</span> as a Legal Reviewer? 
                  They will have special permissions to review and approve legal documents.
                </p>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setUserToAssign(null)} className="w-full sm:w-auto">
                  Back to Search
                </Button>
                <Button 
                  onClick={() => {
                    handleAssignReviewer(userToAssign._id);
                  }}
                  disabled={assignReviewerMutation.isLoading}
                  className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
                >
                  {assignReviewerMutation.isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Assigning...
                    </span>
                  ) : "Assign as Reviewer"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-4 space-y-4">
                <div className="bg-amber-50 p-4 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-800">About Legal Reviewers</h3>
                    <p className="text-sm text-amber-700">
                      Legal Reviewers have special permissions to review and approve legal documents, 
                      lawyer applications, and other sensitive content. Assign this role carefully.
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users by username or email..."
                    className="pl-8 w-full"
                    value={reviewerSearchTerm}
                    onChange={(e) => setReviewerSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="border rounded-md overflow-hidden overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter(user => 
                          (user.role !== "Admin" && user.role !== "LegalReviewer") &&
                          (user.username?.toLowerCase().includes(reviewerSearchTerm.toLowerCase()) || 
                           user.email?.toLowerCase().includes(reviewerSearchTerm.toLowerCase()))
                        )
                        .map((user) => (
                          <TableRow key={user._id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={
                                user.role === "Lawyer" ? "default" : "secondary"
                              }>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm"
                                onClick={() => setUserToAssign(user)}
                                className="bg-amber-600 hover:bg-amber-700"
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Assign
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {users.filter(user => 
                        (user.role !== "Admin" && user.role !== "LegalReviewer") &&
                        (user.username?.toLowerCase().includes(reviewerSearchTerm.toLowerCase()) || 
                         user.email?.toLowerCase().includes(reviewerSearchTerm.toLowerCase()))
                      ).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            {reviewerSearchTerm ? (
                              <div>No users found matching "{reviewerSearchTerm}"</div>
                            ) : (
                              <div>Enter a username or email to find users to assign as reviewers</div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignReviewerDialog(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Toast container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
    </div>
  )
}
