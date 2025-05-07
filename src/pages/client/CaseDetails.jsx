import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  File, MessageSquare, Calendar, Plus, User, Edit,
  ChevronDown, ChevronUp, CheckCircle, X, Trash2, AlertTriangle, FileText,
  ExternalLink, Award, Clock, DollarSign, ThumbsUp, Shield, Briefcase, Tag
} from "lucide-react";
import CaseDocument from "./CaseDocument";
import AppointmentsPage from "../common/Appointments";
import CaseHeader from "../../components/case/CaseHeader";
import TabsNavigation from "../../components/case/TabsNavigation";
import TabContent from "../../components/case/TabContent";
import AddNoteModal from "../../components/case/AddNoteModal";
import AddAppointmentModal from "../../components/case/AddAppointmentModal";
import RescheduleModal from "../../components/case/RescheduleModal";
import DocumentsTab from "../../components/case/DocumentsTab";
import NotesTab from "../../components/case/NotesTab";
import AppointmentsTab from "../../components/case/AppointmentsTab";
// import { ErrorBoundary } from "react-error-boundary";

// Instead, let's create a simple error boundary component
class SimpleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          <h3 className="font-medium mb-2">Something went wrong:</h3>
          <p className="mb-4">{this.state.error?.message || "Unknown error"}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper functions
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "posted":
      return "bg-gradient-to-r from-amber-500 to-amber-600";
    case "assigned":
      return "bg-gradient-to-r from-teal-500 to-teal-600";
    case "closed":
      return "bg-gradient-to-r from-green-500 to-green-600";
    default:
      return "bg-gradient-to-r from-gray-400 to-gray-500";
  }
};

const isOverdue = (deadlineDate) => {
  const currentDate = new Date();
  return new Date(deadlineDate) < currentDate;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseDetail, setCaseDetail] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Modals state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditingCase, setIsEditingCase] = useState(false);
  
  // Form states
  const [updateForm, setUpdateForm] = useState({
    description: "",
    category: "",
    deadline: "",
  });
  const [noteForm, setNoteForm] = useState({
    content: "",
    visibility: "Both",
  });
  
  // Loading and error states
  const [acceptLoading, setAcceptLoading] = useState(null);
  const [acceptError, setAcceptError] = useState(null);
  const [acceptSuccess, setAcceptSuccess] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState(null);
  const [closeSuccess, setCloseSuccess] = useState(null);
  const [addNoteLoading, setAddNoteLoading] = useState(false);
  const [addNoteError, setAddNoteError] = useState(null);
  const [addNoteSuccess, setAddNoteSuccess] = useState(null);
  
  // Appointments states
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [showAppointmentActions, setShowAppointmentActions] = useState(null);
  const appointmentActionsRef = useRef(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    time: "",
    duration: 60,
    location: "",
    description: "",
  });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(null);
  const [appointmentActionLoading, setAppointmentActionLoading] = useState(false);
  const [appointmentActionError, setAppointmentActionError] = useState(null);

  // Add these state variables to your component
  const [uploadForm, setUploadForm] = useState({
    visibility: "Both",
    category: "Evidence"
  });
  const [files, setFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Function to fetch case and bids data
  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const caseRes = await fetch(`http://localhost:5000/api/cases/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!caseRes.ok) {
        const errorData = await caseRes.json();
        throw new Error(errorData.message || "Failed to fetch case details.");
      }

      const caseData = await caseRes.json();
      setCaseDetail(caseData.case);
      setUpdateForm({
        description: caseData.case.description,
        category: caseData.case.category,
        deadline: caseData.case.deadline?.split("T")[0] || "",
      });

      const bidsRes = await fetch(`http://localhost:5000/api/bids/case/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!bidsRes.ok) {
        const errorData = await bidsRes.json();
        throw new Error(errorData.message || "Failed to fetch bids.");
      }

      const bidsData = await bidsRes.json();
      setBids(bidsData);
    } catch (err) {
      console.error("Error fetching case details or bids:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(`http://localhost:5000/api/appointments/case/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch appointments.");
      }

      const data = await response.json();
      console.log("Fetched appointments:", data);
      
      // Ensure we're setting an array
      if (Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else if (data.appointments) {
        console.warn("API returned non-array appointments, converting to array");
        setAppointments([data.appointments]);
      } else {
        console.warn("API returned no appointments, setting empty array");
        setAppointments([]);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointmentsError(err.message);
      // Set empty array on error
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === "appointments" && caseDetail?.status === "Assigned") {
      fetchAppointments();
    }
  }, [activeTab, id, caseDetail?.status]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        appointmentActionsRef.current &&
        !appointmentActionsRef.current.contains(event.target)
      ) {
        setShowAppointmentActions(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add a useEffect to ensure appointments is always an array
  useEffect(() => {
    // Log the appointments data to debug
    console.log("Appointments data:", appointments);
    
    // If appointments is not an array, initialize it as an empty array
    if (!Array.isArray(appointments)) {
      console.warn("Appointments is not an array, initializing as empty array");
      setAppointments([]);
    }
  }, [appointments]);

  // Handle functions
  const handleAcceptBid = async (bidId) => {
    try {
      setAcceptLoading(bidId);
      setAcceptError(null);
      setAcceptSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(
        `http://localhost:5000/api/bids/accept/${bidId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to accept bid.");
      }

      const data = await res.json();
      setAcceptSuccess("Bid accepted successfully!");
      
      // Update the local state to reflect the changes
      setBids(prevBids => 
        prevBids.map(bid => ({
          ...bid,
          status: bid._id === bidId ? 'Accepted' : 'Rejected'
        }))
      );
      
      // Update case status in the UI
      setCaseDetail(prevCase => ({
        ...prevCase,
        status: 'Assigned',
        winning_bid: bidId,
        assigned_lawyer: data.bid.lawyer
      }));

      // Reload the page after a short delay to show the updated status
      setTimeout(() => {
        fetchCaseDetails();
      }, 2000);
    } catch (error) {
      console.error("Error accepting bid:", error);
      setAcceptError(error.message);
    } finally {
      setAcceptLoading(null);
    }
  };

  const handleUpdateCase = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(`http://localhost:5000/api/cases/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update case.");
      }

      const data = await res.json();
      setUpdateSuccess(data.message);

      await fetchCaseDetails();
      setTimeout(() => {
        setIsEditingCase(false);
      }, 1500);
    } catch (err) {
      console.error("Error updating case:", err);
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseCase = async () => {
    try {
      setCloseLoading(true);
      setCloseError(null);
      setCloseSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(`http://localhost:5000/api/cases/${id}/close`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to close case.");
      }

      const data = await res.json();
      setCloseSuccess(data.message);

      await fetchCaseDetails();
    } catch (err) {
      console.error("Error closing case:", err);
      setCloseError(err.message);
    } finally {
      setCloseLoading(false);
      setIsCloseModalOpen(false);
    }
  };

  const handleDeleteCase = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(`http://localhost:5000/api/cases/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete case.");
      }

      const data = await res.json();
      navigate("/client/cases", { state: { message: data.message } });
    } catch (err) {
      console.error("Error deleting case:", err);
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddNote = async (noteData) => {
    try {
      // Check if noteData is provided and has content
      if (noteData && !noteData.content) {
        console.log("Note data received but missing content:", noteData);
        return; // Exit early if no content
      }
      
      // If no noteData and using form, check if form has content
      if (!noteData && (!noteForm || !noteForm.content)) {
        console.log("No note content in form:", noteForm);
        return; // Exit early if no content
      }

      setAddNoteLoading(true);
      setAddNoteError(null);
      setAddNoteSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      // If noteData is provided, use it; otherwise, use the noteForm state
      const noteToSubmit = noteData || noteForm;
      
      console.log("Submitting note:", noteToSubmit);

      const res = await fetch(`http://localhost:5000/api/cases/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteToSubmit),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add note.");
      }

      const data = await res.json();
      setAddNoteSuccess(data.message);
      
      // Reset form if using the form state
      if (!noteData) {
        setNoteForm({ content: "", visibility: "Both" });
      }
      
      // Refresh case details to show the new note
      await refreshCaseDetails();
      
      // If using the modal, close it after a delay
      if (isAddNoteModalOpen) {
        setTimeout(() => {
          setIsAddNoteModalOpen(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Error adding note:", err);
      setAddNoteError(err.message);
    } finally {
      setAddNoteLoading(false);
    }
  };

  const handleAddAppointment = async (appointmentData) => {
    try {
      setAddAppointmentLoading(true);
      setAddAppointmentError(null);
      setAddAppointmentSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      // Validate required fields
      if (!appointmentData.date) {
        throw new Error("Date is required for the appointment");
      }

      // Create appointment payload
      const payload = {
        client: caseDetail.client._id,
        lawyer: caseDetail.assigned_lawyer._id,
        case: id,
        date: appointmentData.date,
        time: appointmentData.time,
        duration: appointmentData.duration || 60,
        type: appointmentData.type || "Meeting",
        location: appointmentData.location || "Online",
        description: appointmentData.description || ""
      };

      const res = await fetch(`http://localhost:5000/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create appointment.");
      }

      const data = await res.json();
      setAddAppointmentSuccess(data.message || "Appointment created successfully");
      
      // Refresh appointments list
      await fetchAppointments();
      
      // Close modal after a delay
      setTimeout(() => {
        setIsAddAppointmentModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Error creating appointment:", err);
      setAddAppointmentError(err.message);
    } finally {
      setAddAppointmentLoading(false);
    }
  };

  const handleRescheduleAppointment = async (appointmentId, newData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to reschedule appointment.");
      }

      // Refresh appointments list
      await fetchAppointments();
      
      return true; // Indicate success
    } catch (err) {
      console.error("Error rescheduling appointment:", err);
      return false; // Indicate failure
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/confirm`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to confirm appointment.");
      }

      // Refresh appointments list
      await fetchAppointments();
      
      return true; // Indicate success
    } catch (err) {
      console.error("Error confirming appointment:", err);
      return false; // Indicate failure
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to cancel appointment.");
      }

      // Refresh appointments list
      await fetchAppointments();
      
      return true; // Indicate success
    } catch (err) {
      console.error("Error canceling appointment:", err);
      return false; // Indicate failure
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/complete`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to mark appointment as completed.");
      }

      // Refresh appointments list
      await fetchAppointments();
      
      return true; // Indicate success
    } catch (err) {
      console.error("Error completing appointment:", err);
      return false; // Indicate failure
    }
  };

  const downloadICSFile = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/ics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to download calendar file.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `appointment-${appointmentId}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading ICS file:", err);
      alert("Failed to download calendar file: " + err.message);
    }
  };

  const toggleDocs = () => {
    setIsDocsOpen(!isDocsOpen);
  };

  const refreshCaseDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const caseRes = await fetch(`http://localhost:5000/api/cases/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!caseRes.ok) {
        const errorData = await caseRes.json();
        throw new Error(errorData.message || "Failed to fetch case details.");
      }

      const caseData = await caseRes.json();
      setCaseDetail(caseData.case);
      setUpdateForm({
        description: caseData.case.description,
        category: caseData.case.category,
        deadline: caseData.case.deadline?.split("T")[0] || "",
      });

      const bidsRes = await fetch(`http://localhost:5000/api/bids/case/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!bidsRes.ok) {
        const errorData = await bidsRes.json();
        throw new Error(errorData.message || "Failed to fetch bids.");
      }

      const bidsData = await bidsRes.json();
      setBids(bidsData);
    } catch (err) {
      console.error("Error fetching case details or bids:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
          <p className="text-gray-600 text-lg">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Error Loading Case
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <Link
              to="/client/cases"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
            >
              Back to Cases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            No Case Found
          </h2>
          <p className="text-gray-600 text-center mb-6">
            No case details available.
          </p>
          <div className="flex justify-center">
            <Link
              to="/client/cases"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
            >
              Back to Cases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-gray-50 text-gray-800 p-6 max-w-6xl mx-auto min-h-screen">
      {/* Case Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-blue-500" />
              {caseDetail.category}
            </h1>
            <span
              className={`px-4 py-1.5 text-sm font-medium text-white rounded-full shadow-sm ${getStatusColor(
                caseDetail.status
              )}`}
            >
              {caseDetail.status}
            </span>
          </div>
          <p className="text-gray-700 mb-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            {caseDetail.description}
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              <span>
                <span className="font-medium">Deadline:</span>{" "}
                <span className={isOverdue(caseDetail.deadline) ? "text-red-600 font-medium" : ""}>
                  {formatDate(caseDetail.deadline)}
                </span>
              </span>
            </div>
            {caseDetail.assigned_lawyer && (
              <div className="flex items-center text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                <span>
                  <span className="font-medium">Lawyer:</span>{" "}
                  {caseDetail.assigned_lawyer.username}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {caseDetail.status === "Posted" && (
              <button
                onClick={() => setIsEditingCase(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow flex items-center"
              >
                <Edit className="w-4 h-4 inline mr-1" /> Edit Case
              </button>
            )}
            {caseDetail.status === "Assigned" && (
              <button
                onClick={() => setIsCloseModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-sm hover:shadow flex items-center"
                disabled={closeLoading}
              >
                {closeLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 inline mr-1" /> Close Case
                  </>
                )}
              </button>
            )}
            {caseDetail.status === "Posted" && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow flex items-center"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 inline mr-1" /> Delete Case
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="flex border-b">
          <button
            className={`px-6 py-3.5 text-sm font-medium flex items-center ${
              activeTab === "overview"
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            } transition-colors duration-200`}
            onClick={() => setActiveTab("overview")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Overview
          </button>
          <button
            className={`px-6 py-3.5 text-sm font-medium flex items-center ${
              activeTab === "documents"
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            } transition-colors duration-200`}
            onClick={() => setActiveTab("documents")}
          >
            <File className="w-4 h-4 mr-2" />
            Documents
          </button>
          <button
            className={`px-6 py-3.5 text-sm font-medium flex items-center ${
              activeTab === "notes"
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            } transition-colors duration-200`}
            onClick={() => setActiveTab("notes")}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Notes
          </button>
          {caseDetail.status === "Assigned" && (
            <button
              className={`px-6 py-3.5 text-sm font-medium flex items-center ${
                activeTab === "appointments"
                  ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              } transition-colors duration-200`}
              onClick={() => setActiveTab("appointments")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div>
              {caseDetail.status === "Posted" && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-500" />
                    Lawyer Bids
                  </h3>
                  {bids.length > 0 ? (
                    <div className="space-y-4">
                      {bids.map((bid) => (
                        <div
                          key={bid._id}
                          className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-200"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                              <img
                                src={bid.lawyer?.profile_photo || defaultAvatar}
                                alt={bid.lawyer?.username || "Lawyer"}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 mr-3"
                              />
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-semibold text-gray-800">
                                    {bid.lawyer?.username || "Unknown Lawyer"}
                                  </h4>
                                  {bid.lawyer?._id && (
                                    <Link 
                                      to={`/client/lawyer/${bid.lawyer._id}`}
                                      className="ml-2 p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                      title="View Lawyer Profile"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Link>
                                  )}
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Clock className="w-3.5 h-3.5 mr-1" />
                                  <span>{new Date(bid.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-green-600 block">
                                {formatCurrency(bid.amount)}
                              </span>
                              <span className="text-xs text-gray-500">Bid Amount</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg mb-4 text-gray-700">
                            {bid.message || "No additional message provided."}
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleAcceptBid(bid._id)}
                              className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-sm hover:shadow flex items-center"
                              disabled={acceptLoading === bid._id}
                            >
                              {acceptLoading === bid._id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                  Processing...
                                </div>
                              ) : (
                                <>
                                  <ThumbsUp className="w-4 h-4 mr-2" />
                                  Accept Bid
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No bids have been placed yet.</p>
                      <p className="text-sm text-gray-500 mt-2">Check back later or update your case details to attract more lawyers.</p>
                    </div>
                  )}
                </div>
              )}

              {caseDetail.status === "Assigned" && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-500" />
                    Assigned Lawyer
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300">
                    {caseDetail.assigned_lawyer ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={caseDetail.assigned_lawyer.profile_photo || defaultAvatar}
                            alt={caseDetail.assigned_lawyer.username}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 mr-4"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">
                              {caseDetail.assigned_lawyer.username}
                            </h4>
                            <div className="flex items-center mt-1">
                              <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                              <span className="font-medium text-green-600">
                                {caseDetail.winning_bid?.amount
                                  ? formatCurrency(caseDetail.winning_bid.amount)
                                  : "N/A"}
                              </span>
                              <span className="text-gray-500 text-sm ml-1">Accepted Bid</span>
                            </div>
                            <Link
                              to={`/client/lawyer/${caseDetail.assigned_lawyer._id}`}
                              className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              View Full Profile
                            </Link>
                          </div>
                        </div>
                        <Link
                          to={`/client/messages/${caseDetail.assigned_lawyer._id}`}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600">No lawyer assigned yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
           
              
              <div className="p-4">
                <DocumentsTab 
                  caseDetail={caseDetail} 
                  isDocsOpen={isDocsOpen} 
                  toggleDocs={toggleDocs} 
                  refreshCaseDetails={refreshCaseDetails}
                  setActiveTab={setActiveTab}
                />
              </div>
          )}

          {activeTab === "notes" && (
            <NotesTab
              caseDetail={caseDetail}
              formatDate={formatDate}
              onAddNote={() => refreshCaseDetails()} // Just refresh case details when a note is added
              addNoteLoading={addNoteLoading}
              addNoteError={addNoteError}
              addNoteSuccess={addNoteSuccess}
              caseId={id}
            />
          )}

          {activeTab === "appointments" && caseDetail.status === "Assigned" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-4">
                <SimpleErrorBoundary
                  onReset={() => {
                    // Reset the state that caused the error
                    fetchAppointments();
                  }}
                >
                  <AppointmentsTab 
                    caseDetail={caseDetail}
                    appointments={Array.isArray(appointments) ? appointments : []}
                    appointmentsLoading={appointmentsLoading}
                    appointmentsError={appointmentsError}
                    formatDate={formatDate}
                    onRescheduleAppointment={handleRescheduleAppointment}
                    onConfirmAppointment={handleConfirmAppointment}
                    onCancelAppointment={handleCancelAppointment}
                    onCompleteAppointment={handleCompleteAppointment}
                    downloadICSFile={downloadICSFile}
                    showAppointmentActions={showAppointmentActions}
                    setShowAppointmentActions={setShowAppointmentActions}
                    appointmentActionsRef={appointmentActionsRef}
                    selectedAppointment={selectedAppointment}
                    setSelectedAppointment={setSelectedAppointment}
                    isRescheduleModalOpen={isRescheduleModalOpen}
                    setIsRescheduleModalOpen={setIsRescheduleModalOpen}
                    refreshCaseDetails={refreshCaseDetails}
                  />
                </SimpleErrorBoundary>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close Confirmation Modal */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Close
              </h2>
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to close this case? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseCase}
                disabled={closeLoading}
                className={`px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300 flex items-center ${
                  closeLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {closeLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Closing...
                  </>
                ) : (
                  "Confirm Close"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Deletion
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this case? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCase}
                disabled={deleteLoading}
                className={`px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md hover:from-red-700 hover:to-red-800 hover:scale-105 transition-all duration-300 flex items-center ${
                  deleteLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Case Modal */}
      {isEditingCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Update Case
              </h2>
              <button
                onClick={() => setIsEditingCase(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {updateSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-600 rounded-lg">
                {updateSuccess}
              </div>
            )}
            {updateError && (
              <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg">
                {updateError}
              </div>
            )}
            <form onSubmit={handleUpdateCase}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  rows="4"
                  maxLength="500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={updateForm.category}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, category: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  required
                >
                  {[
                    "Contract",
                    "Family",
                    "Criminal",
                    "Property",
                    "Labor",
                    "Other",
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={updateForm.deadline}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, deadline: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCase(false)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className={`px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300 flex items-center ${
                    updateLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {updateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Add this function to handle file upload
const handleUploadDocuments = async (e) => {
  e.preventDefault();
  try {
    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    if (!files.length) {
      throw new Error("Please select at least one file to upload");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const formData = new FormData();
    
    // Append each file to the FormData
    for (let i = 0; i < files.length; i++) {
      formData.append("case_files", files[i]);
    }
    
    // Append other form data
    formData.append("visibility", uploadForm.visibility);
    formData.append("category", uploadForm.category);

    const response = await fetch(`http://localhost:5000/api/cases/${id}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload documents");
    }

    const data = await response.json();
    setUploadSuccess(data.message || "Documents uploaded successfully");
    
    // Reset form
    setFiles([]);
    setUploadForm({
      visibility: "Both",
      category: "Evidence"
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Refresh case details to show new documents
    await refreshCaseDetails();
    
    // Close modal after a delay
    setTimeout(() => {
      setIsDocsOpen(false);
      setUploadSuccess(null);
    }, 2000);
    
  } catch (error) {
    console.error("Error uploading documents:", error);
    setUploadError(error.message);
  } finally {
    setUploadLoading(false);
  }
};

// Define a default avatar data URI at the top of your component
const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e2e8f0'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
