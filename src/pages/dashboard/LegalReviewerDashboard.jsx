import React from "react";
import { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../context/AuthContextDefinition";
import {
  FileText,
  Check,
  X,
  AlertTriangle,
  User,
  LogOut,
  Menu,
  Download
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Toaster } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../../components/ui/dialog";

// Create a new QueryClient instance
const queryClient = new QueryClient();

function ReviewerDashboardContent() {
  const queryClient = useQueryClient();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [sortOrder, setSortOrder] = useState("newest");

  // Function to properly format the license file URL
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

  // Function to handle viewing license
  const handleViewLicense = (licenseFile) => {
    if (!licenseFile) {
      toast.error("No license file available");
      return;
    }
    
    const licenseUrl = getLicenseFileUrl(licenseFile);
    console.log("Opening license file:", licenseUrl);
    
    setSelectedLicense(licenseUrl);
    setShowLicenseDialog(true);
    
    // Debug to verify state is changing
    console.log("Dialog should be open now:", true);
  };

  // Function to download license file
  const downloadLicenseFile = () => {
    if (!selectedLicense) return;
    
    // Create a temporary anchor element to force download
    const a = document.createElement('a');
    a.href = selectedLicense;
    a.download = `license-file-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Fetch all lawyers data (not just pending)
  const { 
    data: allLawyersData, 
    isLoading: isLoadingLawyers, 
    error: lawyersError,
    refetch: refetchLawyers 
  } = useQuery({
    queryKey: ['allLawyers'],
    queryFn: async () => {
      try {
        console.log("Fetching lawyers...");
        // First try to get all lawyers
        const response = await api.get("/users/lawyers");
        console.log("All lawyers response:", response.data);
        
        // If that doesn't work or returns empty, try the pending-lawyers endpoint
        if (!response.data?.lawyers || response.data.lawyers.length === 0) {
          console.log("No lawyers found, trying pending-lawyers endpoint...");
          const pendingResponse = await api.get("/users/pending-lawyers");
          console.log("Pending lawyers response:", pendingResponse.data);
          
          // Return pending lawyers with status explicitly set to "Pending"
          return (pendingResponse.data?.pendingLawyers || []).map(lawyer => ({
            ...lawyer,
            status: "Pending" // Ensure status is set
          }));
        }
        
        // Return all lawyers
        return response.data?.lawyers || [];
      } catch (error) {
        console.error("Error fetching lawyers:", error);
        
        // Fallback to pending-lawyers endpoint if the first one fails
        try {
          console.log("Trying fallback to pending-lawyers endpoint...");
          const pendingResponse = await api.get("/users/pending-lawyers");
          console.log("Fallback pending lawyers response:", pendingResponse.data);
          
          // Return pending lawyers with status explicitly set to "Pending"
          return (pendingResponse.data?.pendingLawyers || []).map(lawyer => ({
            ...lawyer,
            status: "Pending" // Ensure status is set
          }));
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          throw error; // Throw the original error
        }
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000
  });

  // Fetch pending lawyers specifically
  const { 
    data: pendingLawyersData,
    isLoading: isLoadingPending
  } = useQuery({
    queryKey: ['pendingLawyers'],
    queryFn: async () => {
      try {
        const response = await api.get("/users/pending-lawyers");
        console.log("Pending lawyers specific response:", response.data);
        return response.data?.pendingLawyers || [];
      } catch (error) {
        console.error("Error fetching pending lawyers:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000
  });

  // Combine all lawyers with pending lawyers to ensure we have all data
  const combinedLawyers = React.useMemo(() => {
    const allLawyers = allLawyersData || [];
    const pendingLawyers = pendingLawyersData || [];
    
    // Create a map of existing lawyers by ID
    const lawyerMap = new Map();
    allLawyers.forEach(lawyer => {
      lawyerMap.set(lawyer._id, lawyer);
    });
    
    // Add pending lawyers that aren't already in the map
    pendingLawyers.forEach(lawyer => {
      if (!lawyerMap.has(lawyer._id)) {
        lawyerMap.set(lawyer._id, { ...lawyer, status: "Pending" });
      }
    });
    
    return Array.from(lawyerMap.values());
  }, [allLawyersData, pendingLawyersData]);

  // Filter and sort lawyers based on search term, status filter, and sort order
  const filteredLawyers = React.useMemo(() => {
    if (!combinedLawyers.length) return [];
    
    console.log("Filtering from combined lawyers:", combinedLawyers);
    
    return combinedLawyers
      .filter(lawyer => {
        // Filter by status (case insensitive)
        const status = (lawyer.status || "").toLowerCase();
        const statusMatch = statusFilter === "All" || 
                           (statusFilter === "Pending" && status === "pending") ||
                           (statusFilter === "Active" && status === "active") ||
                           (statusFilter === "Rejected" && status === "rejected");
        
        // Filter by search term (case insensitive)
        const searchMatch = !searchTerm || 
                           (lawyer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lawyer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lawyer.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return statusMatch && searchMatch;
      })
      .sort((a, b) => {
        // Sort by date (newest/oldest)
        if (sortOrder === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        } else if (sortOrder === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        // Sort alphabetically
        else if (sortOrder === "name-asc") {
          return (a.username || "").localeCompare(b.username || "");
        } else if (sortOrder === "name-desc") {
          return (b.username || "").localeCompare(a.username || "");
        }
        return 0;
      });
  }, [combinedLawyers, searchTerm, statusFilter, sortOrder]);

  // Get counts for dashboard stats
  const pendingCount = React.useMemo(() => 
    combinedLawyers.filter(l => (l.status || "").toLowerCase() === "pending").length, 
    [combinedLawyers]
  );
  
  const approvedCount = React.useMemo(() => 
    combinedLawyers.filter(l => (l.status || "").toLowerCase() === "active").length, 
    [combinedLawyers]
  );
  
  const rejectedCount = React.useMemo(() => 
    combinedLawyers.filter(l => (l.status || "").toLowerCase() === "rejected").length, 
    [combinedLawyers]
  );

  // Handle approve lawyer
  const handleApproveLawyer = async (lawyerId) => {
    const toastId = toast.loading("Approving lawyer...");
    try {
      const response = await api.put("/users/approve-lawyer", { lawyerId });
      console.log("Approve lawyer response:", response.data);
      toast.success("Lawyer approved successfully", { id: toastId });
      const updatedLawyers = allLawyersData.filter(l => l._id !== lawyerId);
      queryClient.setQueryData(['allLawyers'], updatedLawyers);
    } catch (error) {
      console.error("Error approving lawyer:", error);
      const errorMessage = error.response?.data?.message || "Failed to approve lawyer";
      toast.error(errorMessage, { id: toastId });
    }
  };

  // Handle reject lawyer
  const handleRejectLawyer = async (lawyerId) => {
    const toastId = toast.loading("Rejecting lawyer...");
    try {
      const response = await api.put("/users/reject-lawyer", { lawyerId });
      console.log("Reject lawyer response:", response.data);
      toast.success("Lawyer rejected successfully", { id: toastId });
      const updatedLawyers = allLawyersData.filter(l => l._id !== lawyerId);
      queryClient.setQueryData(['allLawyers'], updatedLawyers);
    } catch (error) {
      console.error("Error rejecting lawyer:", error);
      const errorMessage = error.response?.data?.message || "Failed to reject lawyer";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Show error state
  if (lawyersError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h2 className="text-xl font-bold">Error Loading Dashboard</h2>
        <p className="text-muted-foreground">
          {lawyersError?.message || "Failed to load dashboard data"}
        </p>
        <Button variant="outline" onClick={() => refetchLawyers()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Header */}
      <header className="bg-card border-b h-16 fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-10">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">Legal Reviewer Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 mt-16">
        <div className="max-w-7xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-navy">Legal Reviewer Dashboard</h2>
          
          {/* Stats Cards - Position Pending Approval to the right */}
          <div className="flex justify-end">
            <div className="w-full max-w-md">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-600">Pending Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{pendingCount}</div>
                  <p className="text-muted-foreground text-sm">Lawyers awaiting review</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </select>
                  
                  <Button variant="outline" onClick={() => refetchLawyers()}>
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Lawyers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lawyer Applications</CardTitle>
              <CardDescription>
                {statusFilter === "All" 
                  ? "All lawyer applications" 
                  : statusFilter === "Pending" 
                    ? "Lawyers awaiting approval" 
                    : statusFilter === "Active" 
                      ? "Approved lawyers" 
                      : "Rejected applications"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLawyers ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading lawyers...</p>
                </div>
              ) : !filteredLawyers || filteredLawyers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No lawyers found matching your criteria
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">License</th>
                        <th className="text-left py-3 px-4 font-medium">Date Applied</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLawyers.map((lawyer) => (
                        <tr key={lawyer._id} className="border-b">
                          <td className="py-3 px-4">{lawyer.username || lawyer.name}</td>
                          <td className="py-3 px-4">{lawyer.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              lawyer.status === "Pending" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : lawyer.status === "Active" 
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}>
                              {lawyer.status || "Unknown"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {lawyer.license_file ? (
                              <Button 
                                onClick={() => handleViewLicense(lawyer.license_file)}
                                variant="link"
                                className="text-blue-600 hover:underline flex items-center p-0 h-auto"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View License
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">No license</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {lawyer.createdAt 
                              ? new Date(lawyer.createdAt).toLocaleDateString() 
                              : "Unknown"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              {lawyer.status === "Pending" && (
                                <>
                                  <Button 
                                    onClick={() => handleApproveLawyer(lawyer._id)}
                                    variant="outline" 
                                    size="sm"
                                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    onClick={() => handleRejectLawyer(lawyer._id)}
                                    variant="outline" 
                                    size="sm"
                                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {lawyer.status !== "Pending" && (
                                <span className="text-sm text-muted-foreground">
                                  {lawyer.status === "Active" ? "Approved" : "Rejected"}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* License Viewer Dialog */}
      <Dialog 
        open={showLicenseDialog} 
        onOpenChange={setShowLicenseDialog}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>License Document</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedLicense ? (
              <div className="space-y-4">
                {/* PDF Viewer */}
                <div className="w-full h-[70vh] border rounded-md overflow-hidden bg-gray-100">
                  <iframe 
                    src={selectedLicense} 
                    className="w-full h-full" 
                    title="License Document"
                  />
                </div>
                
                {/* Show file URL for debugging */}
                <div className="p-2 bg-gray-100 rounded text-sm">
                  <p><strong>File URL:</strong> {selectedLicense}</p>
                </div>
                
                {/* Direct link as fallback */}
                <div className="text-center">
                  <a 
                    href={selectedLicense} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open in new tab if not displaying correctly
                  </a>
                </div>
                
                {/* Download button */}
                <Button 
                  onClick={downloadLicenseFile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download License
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No license file available
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLicenseDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LegalReviewerDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <ReviewerDashboardContent />
    </QueryClientProvider>
  );
}
