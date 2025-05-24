import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api.js";
import { toast, Toaster } from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext.jsx";
import {
  FileText,
  Check,
  X,
  AlertTriangle,
  LogOut,
  Download,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog.jsx";

// Add this style definition
const styles = `
  .ltr-textarea {
    direction: ltr !important;
    text-align: left !important;
    unicode-bidi: plaintext !important;
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    min-height: 6rem;
    font-family: inherit;
    font-size: inherit;
  }
  
  .dialog-content-stable {
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
    max-width: 500px;
    width: 90%;
    margin: 0 auto;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  /* Override any existing dialog positioning */
  [data-radix-popper-content-wrapper] {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    max-width: 500px !important;
    width: 90% !important;
  }
`;

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
  const [showActionDialog, setShowActionDialog] = useState(null); // Tracks which lawyer and action (approve/reject)
  const [actionComments, setActionComments] = useState("");
  const [loadingActions, setLoadingActions] = useState({}); // Tracks loading state for each lawyer

  // Debug textarea styles (optional, can remove after confirmation)
  useEffect(() => {
    const textarea = document.querySelector(".comment-textarea");
    if (textarea) {
      const computedStyles = window.getComputedStyle(textarea);
      console.log("Textarea computed styles:", {
        direction: computedStyles.direction,
        textAlign: computedStyles.textAlign,
        unicodeBidi: computedStyles.unicodeBidi,
        writingMode: computedStyles.writingMode,
      });
    }
  }, [showActionDialog]);

  // Function to properly format the license file URL
  const getLicenseFileUrl = (licenseFile) => {
    if (!licenseFile) return null;

    // If it's already a base64 string, return it directly
    if (licenseFile.startsWith("data:") || licenseFile.includes(";base64,")) {
      return licenseFile;
    }

    // If it's already a full URL, return it directly
    if (licenseFile.startsWith("http://") || licenseFile.startsWith("https://")) {
      return licenseFile;
    }

    // Extract just the filename from the path
    const filename = licenseFile.split('/').pop();
    
    // Construct the URL using the server's base URL
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    
    // Remove any trailing slash from baseUrl
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // Return the direct path to the file
    return `${cleanBaseUrl}/uploads/${filename}`;
  };

  // Function to handle viewing license
  const handleViewLicense = (licenseFile) => {
    if (!licenseFile) {
      toast.error("No license file available");
      return;
    }

    const licenseUrl = getLicenseFileUrl(licenseFile);
    console.log("Original license file path:", licenseFile);
    console.log("Converted license URL:", licenseUrl);

    setSelectedLicense(licenseUrl);
    setShowLicenseDialog(true);
  };

  // Function to download license file
  const downloadLicenseFile = () => {
    if (!selectedLicense) return;

    // Create a temporary anchor element to force download
    const a = document.createElement("a");
    a.href = selectedLicense;
    a.download = `license-file-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  // Fetch all lawyers data (not just pending)
  const {
    data: allLawyersData,
    isLoading: isLoadingLawyers,
    error: lawyersError,
    refetch: refetchLawyers,
  } = useQuery({
    queryKey: ["allLawyers"],
    queryFn: async () => {
      try {
        console.log("Fetching lawyers...");
        
        // Skip the /users/lawyers endpoint and go directly to pending-lawyers
        console.log("Fetching pending lawyers directly...");
        const pendingResponse = await api.get("/users/pending-lawyers");
        console.log("Pending lawyers response:", pendingResponse.data);

        // Return pending lawyers with status explicitly set to "Pending"
        return (pendingResponse.data?.pendingLawyers || []).map((lawyer) => ({
          ...lawyer,
          status: "Pending", // Ensure status is set
        }));
      } catch (error) {
        console.error("Error fetching lawyers:", error);
        
        // Try the pending-lawyers endpoint as fallback
        try {
          console.log("Trying pending-lawyers endpoint as fallback...");
          const pendingResponse = await api.get("/users/pending-lawyers");
          console.log("Pending lawyers response:", pendingResponse.data);
          
          return (pendingResponse.data?.pendingLawyers || []).map((lawyer) => ({
            ...lawyer,
            status: "Pending",
          }));
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          throw error; // Throw the original error
        }
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // Fetch pending lawyers specifically
  const {
    data: pendingLawyersData,
    isLoading: isLoadingPending,
  } = useQuery({
    queryKey: ["pendingLawyers"],
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
    staleTime: 30000,
  });

  // Combine all lawyers with pending lawyers to ensure we have all data
  const combinedLawyers = React.useMemo(() => {
    const allLawyers = allLawyersData || [];
    const pendingLawyers = pendingLawyersData || [];

    // Create a map of existing lawyers by ID
    const lawyerMap = new Map();
    allLawyers.forEach((lawyer) => {
      lawyerMap.set(lawyer._id, lawyer);
    });

    // Add pending lawyers that aren't already in the map
    pendingLawyers.forEach((lawyer) => {
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
      .filter((lawyer) => {
        // Filter by status (case insensitive)
        const status = (lawyer.status || "").toLowerCase();
        const statusMatch =
          statusFilter === "All" ||
          (statusFilter === "Pending" && status === "pending") ||
          (statusFilter === "Active" && status === "active") ||
          (statusFilter === "Rejected" && status === "rejected");

        // Filter by search term (case insensitive)
        const searchMatch =
          !searchTerm ||
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
  const pendingCount = React.useMemo(
    () => combinedLawyers.filter((l) => (l.status || "").toLowerCase() === "pending").length,
    [combinedLawyers]
  );

  const approvedCount = React.useMemo(
    () => combinedLawyers.filter((l) => (l.status || "").toLowerCase() === "active").length,
    [combinedLawyers]
  );

  const rejectedCount = React.useMemo(
    () => combinedLawyers.filter((l) => (l.status || "").toLowerCase() === "rejected").length,
    [combinedLawyers]
  );

  // Handle approve lawyer
  const handleApproveLawyer = async (lawyerId) => {
    const startTime = performance.now(); // Debug: Measure start time
    setLoadingActions((prev) => ({ ...prev, [lawyerId]: "approve" }));
    const toastId = toast.loading("Approving lawyer...");

    // Optimistic update
    const previousAllLawyers = queryClient.getQueryData(["allLawyers"]);
    const previousPendingLawyers = queryClient.getQueryData(["pendingLawyers"]);
    queryClient.setQueryData(["allLawyers"], (old) => {
      const index = old.findIndex((l) => l._id === lawyerId);
      if (index === -1) return old;
      const newData = [...old];
      newData[index] = {
        ...newData[index],
        status: "Active",
        verificationStatus: "Verified",
      };
      return newData;
    });
    queryClient.setQueryData(["pendingLawyers"], (old) =>
      old.filter((l) => l._id !== lawyerId)
    );

    try {
      // Use api.put directly instead of apiWithTimeout
      const response = await api.put("/users/approve-lawyer", {
        lawyerId,
        comments: actionComments || "No comments provided",
      });
      console.log("Approve lawyer response:", response.data);
      const endTime = performance.now(); // Debug: Measure end time
      console.log(`Approve API took ${endTime - startTime}ms`);

      toast.success("Lawyer approved successfully", { id: toastId });
      // Invalidate queries to refetch data
      queryClient.invalidateQueries(["allLawyers"]);
      queryClient.invalidateQueries(["pendingLawyers"]);
      setShowActionDialog(null);
      setActionComments("");
    } catch (error) {
      console.error("Error approving lawyer:", error);
      const errorMessage = error.message || "Failed to approve lawyer";
      toast.error(errorMessage, { id: toastId });

      // Revert optimistic update
      queryClient.setQueryData(["allLawyers"], previousAllLawyers);
      queryClient.setQueryData(["pendingLawyers"], previousPendingLawyers);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [lawyerId]: null }));
    }
  };

  // Handle reject lawyer
  const handleRejectLawyer = async (lawyerId) => {
    if (!actionComments) {
      toast.error("Comments are required for rejection");
      return;
    }
    const startTime = performance.now(); // Debug: Measure start time
    setLoadingActions((prev) => ({ ...prev, [lawyerId]: "reject" }));
    const toastId = toast.loading("Rejecting lawyer...");

    // Optimistic update
    const previousAllLawyers = queryClient.getQueryData(["allLawyers"]);
    const previousPendingLawyers = queryClient.getQueryData(["pendingLawyers"]);
    queryClient.setQueryData(["allLawyers"], (old) => {
      const index = old.findIndex((l) => l._id === lawyerId);
      if (index === -1) return old;
      const newData = [...old];
      newData[index] = {
        ...newData[index],
        status: "Rejected",
        verificationStatus: "Rejected",
      };
      return newData;
    });
    queryClient.setQueryData(["pendingLawyers"], (old) =>
      old.filter((l) => l._id !== lawyerId)
    );

    try {
      // Use api.put directly instead of apiWithTimeout
      const response = await api.put("/users/reject-lawyer", {
        lawyerId,
        comments: actionComments,
      });
      console.log("Reject lawyer response:", response.data);
      const endTime = performance.now(); // Debug: Measure end time
      console.log(`Reject API took ${endTime - startTime}ms`);

      toast.success("Lawyer rejected successfully", { id: toastId });
      // Invalidate queries to refetch data
      queryClient.invalidateQueries(["allLawyers"]);
      queryClient.invalidateQueries(["pendingLawyers"]);
      setShowActionDialog(null);
      setActionComments("");
    } catch (error) {
      console.error("Error rejecting lawyer:", error);
      const errorMessage = error.message || "Failed to reject lawyer";
      toast.error(errorMessage, { id: toastId });

      // Revert optimistic update
      queryClient.setQueryData(["allLawyers"], previousAllLawyers);
      queryClient.setQueryData(["pendingLawyers"], previousPendingLawyers);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [lawyerId]: null }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Action Dialog for Approve/Reject
  const ActionDialog = ({ lawyer, action }) => {
    // Use a ref to avoid re-renders
    const textareaRef = useRef(null);
    
    const handleConfirm = () => {
      const commentValue = textareaRef.current ? textareaRef.current.value : "";
      
      if (action === "reject" && !commentValue.trim()) {
        toast.error("Comments are required for rejection");
        return;
      }
      
      // Set the comments value from the ref
      setActionComments(commentValue);
      
      if (action === "approve") {
        handleApproveLawyer(lawyer._id);
      } else {
        handleRejectLawyer(lawyer._id);
      }
    };
    
    return (
      <Dialog
        open={showActionDialog === `${lawyer._id}-${action}`}
        onOpenChange={() => {
          setShowActionDialog(null);
          setActionComments("");
        }}
      >
        <DialogContent className="dialog-content-stable mx-auto">
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"} Lawyer: {lawyer.username || lawyer.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-1">
              Comments {action === "reject" ? "(Required)" : "(Optional)"}
            </label>
            <textarea
              ref={textareaRef}
              defaultValue={actionComments}
              className="ltr-textarea"
              rows={4}
              lang="en"
              dir="ltr"
              placeholder={
                action === "reject"
                  ? "Please provide a reason for rejection"
                  : "Enter any comments (optional)"
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowActionDialog(null);
                setActionComments("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loadingActions[lawyer._id]}
            >
              {loadingActions[lawyer._id] ? (
                <span className="animate-spin">⌛</span>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
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
      {/* Inline styles for textarea */}
      <style>{styles}</style>

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
            <Button variant="ghost" size="icon" onClick={handleLogout}>
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
                        <th className="text-left py-3 px-4 font-medium">Specializations</th>
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
                            {lawyer.specialization?.length
                              ? lawyer.specialization.join(", ")
                              : "None"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                (lawyer.status || "").toLowerCase() === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : (lawyer.status || "").toLowerCase() === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
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
                              {(lawyer.status || "").toLowerCase() === "pending" && (
                                <>
                                  <Button
                                    onClick={() =>
                                      setShowActionDialog(`${lawyer._id}-approve`)
                                    }
                                    variant="outline"
                                    size="sm"
                                    disabled={loadingActions[lawyer._id]}
                                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                  >
                                    {loadingActions[lawyer._id] === "approve" ? (
                                      <span className="animate-spin">⌛</span>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Approve
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      setShowActionDialog(`${lawyer._id}-reject`)
                                    }
                                    variant="outline"
                                    size="sm"
                                    disabled={loadingActions[lawyer._id]}
                                    className="bg-red-50 border-red-200 text-red-700 hover:bg-green-100"
                                  >
                                    {loadingActions[lawyer._id] === "reject" ? (
                                      <span className="animate-spin">⌛</span>
                                    ) : (
                                      <>
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                      </>
                                    )}
                                  </Button>
                                  <ActionDialog lawyer={lawyer} action="approve" />
                                  <ActionDialog lawyer={lawyer} action="reject" />
                                </>
                              )}
                              {(lawyer.status || "").toLowerCase() !== "pending" && (
                                <span className="text-sm text-muted-foreground">
                                  {(lawyer.status || "").toLowerCase() === "active"
                                    ? "Approved"
                                    : "Rejected"}
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
      <Dialog open={showLicenseDialog} onOpenChange={setShowLicenseDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>License Document</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedLicense ? (
              <div className="space-y-4">
                {/* PDF Viewer */}
                <div className="w-full h-[70vh] border rounded-md overflow-hidden bg-gray-100">
                  <LicenseViewer licenseFile={selectedLicense} getLicenseFileUrl={getLicenseFileUrl} />
                </div>
                
                {/* Debug info */}
                <div className="p-2 bg-gray-100 rounded text-xs">
                  <p><strong>Original path:</strong> {selectedLicense}</p>
                  <p><strong>Converted URL:</strong> {getLicenseFileUrl(selectedLicense)}</p>
                </div>
                
                {/* Direct download link */}
                <div className="text-center p-4 border rounded-md bg-gray-50">
                  <p className="mb-4">If the viewer doesn't work, try downloading the file:</p>
                  <a
                    href={getLicenseFileUrl(selectedLicense)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Download License File
                  </a>
                </div>
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

const LicenseViewer = ({ licenseFile, getLicenseFileUrl }) => {
  const [error, setError] = useState(false);
  
  // Generate the URL
  const url = getLicenseFileUrl(licenseFile);
  
  // Log the URL for debugging
  console.log("License file URL:", url);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-amber-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <p className="text-center text-gray-700 mb-4">
          Failed to load the license file. Please try downloading it instead.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Download License File
        </a>
      </div>
    );
  }
  
  return (
    <iframe
      src={url}
      className="w-full h-full"
      title="License Document"
      onError={() => setError(true)}
    />
  );
};

export default function LegalReviewerDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <ReviewerDashboardContent />
    </QueryClientProvider>
  );
}