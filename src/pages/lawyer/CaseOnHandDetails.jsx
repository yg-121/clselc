import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AlertTriangle, X, MessageSquare } from "lucide-react";
import CaseHeader from "../../components/case/CaseHeader";
import TabsNavigation from "../../components/case/TabsNavigation";
import TabContent from "../../components/case/TabContent";
import AddNoteModal from "../../components/case/AddNoteModal";
import AddAppointmentModal from "../../components/case/AddAppointmentModal";
import RescheduleModal from "../../components/case/RescheduleModal";
import {
  isOverdue,
  formatDate,
  formatCurrency,
  fetchCaseDetails,
  handleCloseCase,
  handleAddNote,
  handleAddAppointment,
  fetchAppointments,
  handleRescheduleAppointment,
  downloadICSFile,
  handleConfirmAppointment,
  handleCancelAppointment,
  handleCompleteAppointment,
} from "../../components/case/Utils.jsx";

export default function CaseOnHandDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseDetail, setCaseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState(null);
  const [closeSuccess, setCloseSuccess] = useState(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] =
    useState(false);
  const [noteForm, setNoteForm] = useState({ content: "", visibility: "Both" });
  const [appointmentForm, setAppointmentForm] = useState({
    lawyer: "",
    client: "",
    case: id || "",
    date: "",
    type: "Meeting",
    description: "",
  });
  const [addNoteLoading, setAddNoteLoading] = useState(false);
  const [addNoteError, setAddNoteError] = useState(null);
  const [addNoteSuccess, setAddNoteSuccess] = useState(null);
  const [addAppointmentLoading, setAddAppointmentLoading] = useState(false);
  const [addAppointmentError, setAddAppointmentError] = useState(null);
  const [addAppointmentSuccess, setAddAppointmentSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "" });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(null);
  const [appointmentActionLoading, setAppointmentActionLoading] =
    useState(false);
  const [appointmentActionError, setAppointmentActionError] = useState(null);
  const [appointmentActionSuccess, setAppointmentActionSuccess] =
    useState(null);
  const [showAppointmentActions, setShowAppointmentActions] = useState(null);
  const appointmentActionsRef = useRef(null);

  useEffect(() => {
    fetchCaseDetails({ id, navigate, setCaseDetail, setLoading, setError });
  }, [id, navigate]);

  useEffect(() => {
    if (activeTab === "appointments") {
      fetchAppointments({
        id,
        setAppointments,
        setAppointmentsLoading,
        setAppointmentsError,
        navigate,
      });
    }
  }, [activeTab, id, navigate]);

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
            Error
          </h2>
          <p className="text-red-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
            >
              Go to Login
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
              to="/lawyer/lawyerCase"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
            >
              Back to Cases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const refreshCaseDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");
      
      const response = await fetch(
        `http://localhost:5000/api/cases/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch case details");
      }
      
      const data = await response.json();
      setCaseDetail(data.case);
    } catch (err) {
      console.error("Error fetching case details:", err);
      setError(err.message);
      if (err.message.includes("log in")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = (noteData) => {
    if (noteData) {
      setNoteForm({
        content: noteData.content,
        visibility: noteData.visibility
      });
    }
    setIsAddNoteModalOpen(true);
  };

  const handleDirectNoteSubmit = async (noteData) => {
    if (!noteData || !noteData.content) return;
    
    setAddNoteLoading(true);
    setAddNoteError(null);
    setAddNoteSuccess(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");
      
      const response = await fetch(
        `http://localhost:5000/api/cases/${id}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: noteData.content,
            visibility: noteData.visibility || "Both",
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add note");
      }
      
      const data = await response.json();
      setAddNoteSuccess(data.message || "Note added successfully");
      
      await refreshCaseDetails();
    } catch (err) {
      console.error("Error adding note:", err);
      setAddNoteError(err.message);
      if (err.message.includes("log in")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setAddNoteLoading(false);
    }
  };

  return (
    <div className="font-inter bg-gray-50 text-gray-800 p-6 max-w-6xl mx-auto min-h-screen">
      <CaseHeader
        caseDetail={caseDetail}
        onCloseCase={() => setIsCloseModalOpen(true)}
        closeLoading={closeLoading}
      />
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabContent
        activeTab={activeTab}
        caseDetail={caseDetail}
        isDocsOpen={isDocsOpen}
        toggleDocs={() => setIsDocsOpen(!isDocsOpen)}
        appointments={appointments}
        appointmentsLoading={appointmentsLoading}
        appointmentsError={appointmentsError}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        isOverdue={isOverdue}
        onAddNote={handleDirectNoteSubmit}
        onAddAppointment={() => setIsAddAppointmentModalOpen(true)}
        onRescheduleAppointment={(e) =>
          handleRescheduleAppointment(e, {
            selectedAppointment,
            rescheduleForm,
            setRescheduleLoading,
            setRescheduleError,
            setRescheduleSuccess,
            setIsRescheduleModalOpen,
            setSelectedAppointment,
            setRescheduleForm,
            fetchAppointments,
            navigate,
            setAppointments,
            setAppointmentsLoading,
            setAppointmentsError,
          })
        }
        onConfirmAppointment={handleConfirmAppointment}
        onCancelAppointment={handleCancelAppointment}
        onCompleteAppointment={handleCompleteAppointment}
        downloadICSFile={(appointmentId) =>
          downloadICSFile(appointmentId, {
            setAppointmentActionError,
            navigate,
          })
        }
        showAppointmentActions={showAppointmentActions}
        setShowAppointmentActions={setShowAppointmentActions}
        appointmentActionsRef={appointmentActionsRef}
        selectedAppointment={selectedAppointment}
        setSelectedAppointment={setSelectedAppointment}
        isRescheduleModalOpen={isRescheduleModalOpen}
        setIsRescheduleModalOpen={setIsRescheduleModalOpen}
        addNoteLoading={addNoteLoading}
        addNoteError={addNoteError}
        addNoteSuccess={addNoteSuccess}
        addAppointmentLoading={addAppointmentLoading}
        addAppointmentError={addAppointmentError}
        addAppointmentSuccess={addAppointmentSuccess}
        rescheduleLoading={rescheduleLoading}
        rescheduleError={rescheduleError}
        rescheduleSuccess={rescheduleSuccess}
        appointmentActionLoading={appointmentActionLoading}
        appointmentActionError={appointmentActionError}
        appointmentActionSuccess={appointmentActionSuccess}
        refreshCaseDetails={refreshCaseDetails}
        setActiveTab={setActiveTab}
      />
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => {
          setIsAddNoteModalOpen(false);
          setNoteForm({ content: "", visibility: "Both" });
          setAddNoteError(null);
          setAddNoteSuccess(null);
        }}
        noteForm={noteForm}
        setNoteForm={setNoteForm}
        onSubmit={handleDirectNoteSubmit}
        loading={addNoteLoading}
        error={addNoteError}
        success={addNoteSuccess}
      />
      <AddAppointmentModal
        isOpen={isAddAppointmentModalOpen}
        onClose={() => {
          setIsAddAppointmentModalOpen(false);
          setAppointmentForm({
            lawyer: "",
            client: "",
            case: id || "",
            date: "",
            type: "Meeting",
            description: "",
          });
          setAddAppointmentError(null);
          setAddAppointmentSuccess(null);
        }}
        appointmentForm={appointmentForm}
        setAppointmentForm={setAppointmentForm}
        onSubmit={handleAddAppointment}
        loading={addAppointmentLoading}
        error={addAppointmentError}
        success={addAppointmentSuccess}
      />
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSelectedAppointment(null);
          setRescheduleForm({ date: "" });
          setRescheduleError(null);
          setRescheduleSuccess(null);
        }}
        rescheduleForm={rescheduleForm}
        setRescheduleForm={setRescheduleForm}
        onSubmit={handleRescheduleAppointment}
        loading={rescheduleLoading}
        error={rescheduleError}
        success={rescheduleSuccess}
      />
      <div className="mt-6 flex gap-4">
        <Link
          to="/lawyer/lawyerCase"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300"
        >
          Back to Cases
        </Link>
        {caseDetail?.client?._id && (
          <Link
            to={`/lawyer/messages/${caseDetail.client._id}`}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Message Client
          </Link>
        )}
      </div>
    </div>
  );
}