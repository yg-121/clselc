import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Plus,
  CheckCircle,
  AlertTriangle,
  User,
  MoreHorizontal,
  Download,
  RefreshCw,
  XCircle,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import AppointmentModal from "./AppointmentModal";

const AppointmentsTab = ({
  appointments,
  appointmentsLoading,
  appointmentsError,
  formatDate,
  onRescheduleAppointment,
  onConfirmAppointment,
  onCancelAppointment,
  onCompleteAppointment,
  downloadICSFile,
  showAppointmentActions,
  setShowAppointmentActions,
  appointmentActionsRef,
  selectedAppointment,
  setSelectedAppointment,
  isRescheduleModalOpen: propIsRescheduleModalOpen, // Rename to avoid conflict
  setIsRescheduleModalOpen: setParentIsRescheduleModalOpen, // Rename to avoid conflict
  rescheduleLoading,
  rescheduleError,
  rescheduleSuccess,
  appointmentActionLoading,
  appointmentActionError,
  appointmentActionSuccess,
  caseDetail,
  refreshCaseDetails
}) => {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [addAppointmentLoading, setAddAppointmentLoading] = useState(false);
  const [addAppointmentError, setAddAppointmentError] = useState(null);
  const [addAppointmentSuccess, setAddAppointmentSuccess] = useState(null);
  
  // Confirmation modal states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [appointmentToAction, setAppointmentToAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Keep only the reschedule form state locally, remove the duplicate declarations
  const [rescheduleForm, setRescheduleForm] = useState({ date: '' });
  
  // Local state for modal visibility
  const [localIsRescheduleModalOpen, setLocalIsRescheduleModalOpen] = useState(false);
  
  // Use prop value if provided, otherwise use local state
  const isRescheduleModalOpen = propIsRescheduleModalOpen !== undefined 
    ? propIsRescheduleModalOpen 
    : localIsRescheduleModalOpen;
  
  // Function to update both local and parent state
  const handleSetIsRescheduleModalOpen = (value) => {
    setLocalIsRescheduleModalOpen(value);
    if (typeof setParentIsRescheduleModalOpen === 'function') {
      setParentIsRescheduleModalOpen(value);
    }
  };
  
  // Handle appointment creation success
  const handleAppointmentSuccess = (message) => {
    setAddAppointmentSuccess(message);
    refreshCaseDetails(); // Refresh to get updated appointments
    
    // Clear success message after some time
    setTimeout(() => {
      setAddAppointmentSuccess(null);
    }, 5000);
  };

  // Handle appointment creation error
  const handleAppointmentError = (error) => {
    setAddAppointmentError(error);
    
    // Clear error message after some time
    setTimeout(() => {
      setAddAppointmentError(null);
    }, 5000);
  };

  // Open confirm modal
  const openConfirmModal = (appointmentId) => {
    setAppointmentToAction(appointmentId);
    setConfirmModalOpen(true);
    setShowAppointmentActions(null);
  };

  // Open cancel modal
  const openCancelModal = (appointmentId) => {
    setAppointmentToAction(appointmentId);
    setCancelModalOpen(true);
    setShowAppointmentActions(null);
  };

  // Open complete modal
  const openCompleteModal = (appointmentId) => {
    setAppointmentToAction(appointmentId);
    setCompleteModalOpen(true);
    setShowAppointmentActions(null);
  };

  // Handle confirm appointment
  const handleConfirmAppointment = async () => {
    setActionLoading(true);
    try {
      console.log("Confirming appointment with ID:", appointmentToAction);
      
      // Direct API call instead of using the utility function
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");
      
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentToAction}/confirm`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm appointment");
      }
      
      await response.json();
      console.log("Appointment confirmed successfully");
      
      // Check if refreshCaseDetails is a function before calling it
      if (typeof refreshCaseDetails === 'function') {
        refreshCaseDetails();
      } else {
        console.warn("refreshCaseDetails is not a function:", refreshCaseDetails);
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
    } finally {
      setActionLoading(false);
      setConfirmModalOpen(false);
      setAppointmentToAction(null);
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    setActionLoading(true);
    try {
      console.log("Cancelling appointment with ID:", appointmentToAction);
      
      // Direct API call instead of using the utility function
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");
      
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentToAction}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel appointment");
      }
      
      await response.json();
      console.log("Appointment cancelled successfully");
      
      // Check if refreshCaseDetails is a function before calling it
      if (typeof refreshCaseDetails === 'function') {
        refreshCaseDetails();
      } else {
        console.warn("refreshCaseDetails is not a function:", refreshCaseDetails);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setActionLoading(false);
      setCancelModalOpen(false);
      setAppointmentToAction(null);
    }
  };

  // Handle complete appointment
  const handleCompleteAppointment = async () => {
    setActionLoading(true);
    try {
      console.log("Completing appointment with ID:", appointmentToAction);
      
      // Direct API call instead of using the utility function
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");
      
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentToAction}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to complete appointment");
      }
      
      await response.json();
      console.log("Appointment completed successfully");
      
      // Check if refreshCaseDetails is a function before calling it
      if (typeof refreshCaseDetails === 'function') {
        refreshCaseDetails();
      } else {
        console.warn("refreshCaseDetails is not a function:", refreshCaseDetails);
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
    } finally {
      setActionLoading(false);
      setCompleteModalOpen(false);
      setAppointmentToAction(null);
    }
  };

  // Add a function to handle rescheduling
  const handleRescheduleAppointment = async (e) => {
    if (e) e.preventDefault();
    
    if (!selectedAppointment) {
      // Use the error state from props if available, otherwise use a local state
      if (typeof setRescheduleError === 'function') {
        setRescheduleError("No appointment selected for rescheduling");
      } else {
        console.error("No appointment selected for rescheduling");
      }
      return;
    }
    
    if (!rescheduleForm.date) {
      if (typeof setRescheduleError === 'function') {
        setRescheduleError("Please select a new date for the appointment");
      } else {
        console.error("Please select a new date for the appointment");
      }
      return;
    }
    
    // Use the loading state from props if available
    if (typeof setRescheduleLoading === 'function') {
      setRescheduleLoading(true);
    }
    
    // Clear error and success states if functions are available
    if (typeof setRescheduleError === 'function') {
      setRescheduleError(null);
    }
    if (typeof setRescheduleSuccess === 'function') {
      setRescheduleSuccess(null);
    }
    
    try {
      console.log("Rescheduling appointment with ID:", selectedAppointment._id);
      console.log("New date:", rescheduleForm.date);
      
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");
      
      const response = await fetch(
        `http://localhost:5000/api/appointments/${selectedAppointment._id}/date`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ date: rescheduleForm.date }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reschedule appointment");
      }
      
      await response.json();
      
      // Set success message if function is available
      if (typeof setRescheduleSuccess === 'function') {
        setRescheduleSuccess("Appointment rescheduled successfully");
      }
      console.log("Appointment rescheduled successfully");
      
      // Close the modal and reset form
      handleSetIsRescheduleModalOpen(false);
      setRescheduleForm({ date: '' });
      
      // Refresh the case details
      if (typeof refreshCaseDetails === 'function') {
        refreshCaseDetails();
      } else {
        console.warn("refreshCaseDetails is not a function:", refreshCaseDetails);
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      
      // Set error message if function is available
      if (typeof setRescheduleError === 'function') {
        setRescheduleError(error.message);
      }
    } finally {
      // Set loading state if function is available
      if (typeof setRescheduleLoading === 'function') {
        setRescheduleLoading(false);
      }
    }
  };

  // Add a function to open the reschedule modal
  const openRescheduleModal = (appointment) => {
    console.log("Opening reschedule modal for appointment:", appointment);
    setSelectedAppointment(appointment);
    setRescheduleForm({ date: '' }); // Reset the form
    handleSetIsRescheduleModalOpen(true);
    setShowAppointmentActions(null); // Close the actions dropdown
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center text-gray-800">
          <Calendar className="mr-2 h-5 w-5 text-gray-500" /> Appointments
        </h2>

        <button
          onClick={() => setIsAppointmentModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          disabled={addAppointmentLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          {addAppointmentLoading ? "Scheduling..." : "Schedule Appointment"}
        </button>
      </div>
      {addAppointmentSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded animate-fade-in-down">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p>{addAppointmentSuccess}</p>
          </div>
        </div>
      )}
      {addAppointmentError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded animate-fade-in-down">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>{addAppointmentError}</p>
          </div>
        </div>
      )}
      {appointmentActionSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded animate-fade-in-down">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p>{appointmentActionSuccess}</p>
          </div>
        </div>
      )}
      {appointmentActionError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded animate-fade-in-down">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>{appointmentActionError}</p>
          </div>
        </div>
      )}
      {/* Appointment creation modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        caseDetail={caseDetail}
        onSuccess={handleAppointmentSuccess}
        onError={handleAppointmentError}
        isLoading={addAppointmentLoading}
        setIsLoading={setAddAppointmentLoading}
      />
      {/* Confirm Appointment Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Confirm
              Appointment
            </h2>

            <p className="mb-6 text-gray-600">
              Are you sure you want to confirm this appointment? This will
              notify the client that the appointment is confirmed.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAppointment}
                className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                disabled={actionLoading}
              >
                {actionLoading ? (
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
                    Confirming...
                  </span>
                ) : (
                  "Confirm Appointment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Cancel Appointment Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> Cancel
              Appointment
            </h2>

            <p className="mb-6 text-gray-600">
              Are you sure you want to cancel this appointment? This action
              cannot be undone and will notify the client.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
                disabled={actionLoading}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleCancelAppointment}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                disabled={actionLoading}
              >
                {actionLoading ? (
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
                    Cancelling...
                  </span>
                ) : (
                  "Yes, Cancel Appointment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Complete Appointment Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setCompleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Mark as
              Completed
            </h2>

            <p className="mb-6 text-gray-600">
              Are you sure you want to mark this appointment as completed? This
              will update the appointment status and notify the client.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteAppointment}
                className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                disabled={actionLoading}
              >
                {actionLoading ? (
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
                    Completing...
                  </span>
                ) : (
                  "Mark as Completed"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {appointmentsLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading appointments...</span>
        </div>
      ) : appointmentsError ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>{appointmentsError}</p>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No Appointments
          </h3>
          <p className="text-gray-600 mb-4">
            There are no appointments scheduled for this case yet.
          </p>
          <button
            onClick={() => setIsAppointmentModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" /> Schedule Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => {
                  const isUpcoming = new Date(appointment.date) > new Date();
                  const isPending = appointment.status === "Pending";
                  const isConfirmed = appointment.status === "Confirmed";
                  const isCancelled = appointment.status === "Cancelled";
                  const isCompleted = appointment.status === "Completed";

                  return (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center">
                          {appointment.type === "Meeting" && (
                            <User className="h-4 w-4 mr-1 text-blue-500" />
                          )}
                          {appointment.type === "Hearing" && (
                            <AlertCircle className="h-4 w-4 mr-1 text-purple-500" />
                          )}
                          {appointment.type === "Deadline" && (
                            <Calendar className="h-4 w-4 mr-1 text-red-500" />
                          )}
                          {appointment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(appointment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                        {isConfirmed && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Confirmed
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Cancelled
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {appointment.description || "No description provided"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => {
                              setShowAppointmentActions(
                                showAppointmentActions === appointment._id
                                  ? null
                                  : appointment._id
                              );
                              setSelectedAppointment(appointment);
                            }}
                            className="inline-flex items-center text-gray-400 hover:text-gray-600"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>

                          {showAppointmentActions === appointment._id && (
                            <div
                              ref={appointmentActionsRef}
                              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                            >
                              <div
                                className="py-1"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="options-menu"
                              >
                                {/* Download ICS */}
                                <button
                                  onClick={() => {
                                    downloadICSFile(appointment._id);
                                    setShowAppointmentActions(null);
                                  }}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  role="menuitem"
                                >
                                  <Download className="mr-3 h-4 w-4 text-gray-400" />
                                  Add Calendar
                                </button>

                                {/* Reschedule */}
                                {isUpcoming && !isCancelled && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent event bubbling
                                      openRescheduleModal(appointment);
                                    }}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                  >
                                    <RefreshCw className="mr-3 h-4 w-4 text-gray-400" />
                                    Reschedule
                                  </button>
                                )}

                                {/* Confirm - only for pending appointments and lawyers */}
                                {isPending && isUpcoming && (
                                  <button
                                    onClick={() =>
                                      openConfirmModal(appointment._id)
                                    }
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                    role="menuitem"
                                  >
                                    <CheckCircle className="mr-3 h-4 w-4 text-green-500" />
                                    Confirm Appointment
                                  </button>
                                )}

                                {/* Complete - only for confirmed appointments and lawyers */}
                                {isConfirmed && (
                                  <button
                                    onClick={() =>
                                      openCompleteModal(appointment._id)
                                    }
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                    role="menuitem"
                                  >
                                    <Check className="mr-3 h-4 w-4 text-blue-500" />
                                    Mark as Completed
                                  </button>
                                )}

                                {/* Cancel - for pending or confirmed appointments */}
                                {(isPending || isConfirmed) && isUpcoming && (
                                  <button
                                    onClick={() =>
                                      openCancelModal(appointment._id)
                                    }
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                    role="menuitem"
                                  >
                                    <XCircle className="mr-3 h-4 w-4 text-red-500" />
                                    Cancel Appointment
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Reschedule Appointment Modal */}
      {isRescheduleModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Reschedule Appointment
              </h3>
              <button
                onClick={() => handleSetIsRescheduleModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {rescheduleError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p>{rescheduleError}</p>
                </div>
              </div>
            )}
            
            {rescheduleSuccess && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <p>{rescheduleSuccess}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleRescheduleAppointment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Date & Time
                </label>
                <div className="text-gray-900 bg-gray-100 p-2 rounded">
                  {formatDate(selectedAppointment.date)}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  New Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={rescheduleForm.date}
                  onChange={(e) => {
                    console.log("Date changed:", e.target.value);
                    setRescheduleForm({ ...rescheduleForm, date: e.target.value });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleSetIsRescheduleModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
                  disabled={rescheduleLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                  disabled={rescheduleLoading}
                >
                  {rescheduleLoading ? (
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
                      Rescheduling...
                    </span>
                  ) : (
                    "Reschedule Appointment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
     
      {rescheduleSuccess && !isRescheduleModalOpen && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded animate-fade-in-down">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p>{rescheduleSuccess}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;





















