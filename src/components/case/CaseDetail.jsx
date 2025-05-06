// Add these imports if not already present
import { handleConfirmAppointment, handleCancelAppointment, handleCompleteAppointment } from './Utils';

// Add these state variables in your component
const [appointmentActionLoading, setAppointmentActionLoading] = useState(false);
const [appointmentActionError, setAppointmentActionError] = useState(null);
const [appointmentActionSuccess, setAppointmentActionSuccess] = useState(null);
const [showAppointmentActions, setShowAppointmentActions] = useState(null);
const [appointments, setAppointments] = useState([]);
const [appointmentsLoading, setAppointmentsLoading] = useState(false);
const [appointmentsError, setAppointmentsError] = useState(null);
const appointmentActionsRef = useRef(null);

// Add this useEffect to log appointments whenever they change
useEffect(() => {
  console.log("Current appointments:", appointments);
}, [appointments]);

// Add these functions to handle appointment actions
const onConfirmAppointment = async (appointmentId) => {
  try {
    setAppointmentActionLoading(true);
    setAppointmentActionError(null);
    setAppointmentActionSuccess(null);
    
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found. Please log in.");
    
    const response = await fetch(
      `http://localhost:5000/api/appointments/${appointmentId}/confirm`,
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
    
    const data = await response.json();
    setAppointmentActionSuccess("Appointment confirmed successfully");
    
    // Update the appointment status in the local state
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app._id === appointmentId 
          ? { ...app, status: 'Confirmed' } 
          : app
      )
    );
    
    // Also refresh appointments from the server to ensure data consistency
    fetchCaseAppointments(id);
  } catch (error) {
    console.error("Error confirming appointment:", error);
    setAppointmentActionError(error.message);
  } finally {
    setAppointmentActionLoading(false);
  }
};

const onCancelAppointment = async (appointmentId) => {
  try {
    setAppointmentActionLoading(true);
    setAppointmentActionError(null);
    setAppointmentActionSuccess(null);
    
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found. Please log in.");
    
    const response = await fetch(
      `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
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
    
    const data = await response.json();
    setAppointmentActionSuccess("Appointment cancelled successfully");
    
    // Update the appointment status in the local state
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app._id === appointmentId 
          ? { ...app, status: 'Cancelled' } 
          : app
      )
    );
    
    // Also refresh appointments from the server to ensure data consistency
    fetchCaseAppointments(id);
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    setAppointmentActionError(error.message);
  } finally {
    setAppointmentActionLoading(false);
  }
};

const onCompleteAppointment = async (appointmentId) => {
  try {
    setAppointmentActionLoading(true);
    setAppointmentActionError(null);
    setAppointmentActionSuccess(null);
    
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found. Please log in.");
    
    const response = await fetch(
      `http://localhost:5000/api/appointments/${appointmentId}/complete`,
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
    
    const data = await response.json();
    setAppointmentActionSuccess("Appointment marked as completed successfully");
    
    // Refresh appointments
    fetchCaseAppointments(id);
  } catch (error) {
    console.error("Error completing appointment:", error);
    setAppointmentActionError(error.message);
  } finally {
    setAppointmentActionLoading(false);
  }
};

// Pass these functions to the AppointmentsTab component

// Update the fetchCaseAppointments function to ensure it's properly fetching data
const fetchCaseAppointments = async (caseId) => {
  try {
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found. Please log in.");

    console.log(`Fetching appointments for case: ${caseId}`);
    
    const response = await fetch(
      `http://localhost:5000/api/appointments/case/${caseId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch appointments");
    }

    const data = await response.json();
    console.log("Appointments fetched:", data.appointments);
    setAppointments(data.appointments);
    return data.appointments;
  } catch (error) {
    console.error("Error fetching case appointments:", error);
    setAppointmentsError(error.message);
    return [];
  } finally {
    setAppointmentsLoading(false);
  }
};

// Add a refreshCaseDetails function that updates both case details and appointments
const refreshCaseDetails = () => {
  fetchCaseDetails();
  fetchCaseAppointments(id);
};

// Make sure to pass this function to the AppointmentsTab component
<AppointmentsTab
  appointments={appointments}
  appointmentsLoading={appointmentsLoading}
  appointmentsError={appointmentsError}
  formatDate={(date) => new Date(date).toLocaleString()}
  onRescheduleAppointment={onRescheduleAppointment}
  onConfirmAppointment={onConfirmAppointment}
  onCancelAppointment={onCancelAppointment}
  onCompleteAppointment={onCompleteAppointment}
  downloadICSFile={downloadICSFile}
  showAppointmentActions={showAppointmentActions}
  setShowAppointmentActions={setShowAppointmentActions}
  appointmentActionsRef={appointmentActionsRef}
  selectedAppointment={selectedAppointment}
  setSelectedAppointment={setSelectedAppointment}
  setIsRescheduleModalOpen={setIsRescheduleModalOpen}
  rescheduleLoading={rescheduleLoading}
  rescheduleError={rescheduleError}
  rescheduleSuccess={rescheduleSuccess}
  appointmentActionLoading={appointmentActionLoading}
  appointmentActionError={appointmentActionError}
  appointmentActionSuccess={appointmentActionSuccess}
  // caseDetail={caseDetail}
  refreshCaseDetails={refreshCaseDetails}
/>;



