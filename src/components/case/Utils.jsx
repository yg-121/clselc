import { Clock, CheckCircle } from "lucide-react";

// Utility function to check if a date is overdue
export const isOverdue = (deadlineDate) => {
  const currentDate = new Date("2025-05-03T00:00:00.000Z");
  return new Date(deadlineDate) < currentDate;
};

// Utility function to format dates
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Utility function to format currency
export const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Utility function to get status badge JSX
export const getStatusBadge = (status) => {
  const statusMap = {
    posted: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: '',
      label: "Posted",
    },
    assigned: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: '',
      label: "Assigned",
    },
    closed: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <CheckCircle className="h-4 w-4 mr-1" />,
      label: "Closed",
    },
    default: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: <Clock className="h-4 w-4 mr-1" />,
      label: status || "Unknown",
    },
  };
  const statusInfo = statusMap[status?.toLowerCase()] || statusMap.default;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}
    >
      {statusInfo.icon}
      {statusInfo.label}
    </span>
  );
};

// Fetch case details from the API
export const fetchCaseDetails = async ({
  id,
  navigate,
  setCaseDetail,
  setLoading,
  setError,
}) => {
  try {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("Authentication token not found. Please log in.");

    const response = await fetch(`http://localhost:5000/api/cases/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401 || response.status === 403)
        throw new Error("Session expired. Please log in again.");
      throw new Error(errorData.message || "Failed to fetch case details.");
    }

    const data = await response.json();
    setCaseDetail(data.case || data);
  } catch (err) {
    console.error("Error fetching case details:", err);
    setError(err.message);
    if (err.message.includes("log in")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  } finally {
    setLoading(false);
  }
};

// Close a case via the API
export const handleCloseCase = async ({
  id,
  setCloseLoading,
  setCloseError,
  setCloseSuccess,
  fetchCaseDetails,
  navigate,
  setCaseDetail,
  setLoading,
  setError,
}) => {
  try {
    setCloseLoading(true);
    setCloseError(null);
    setCloseSuccess(null);

    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("Authentication token not found. Please log in.");

    const res = await fetch(`http://localhost:5000/api/cases/${id}/close`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to close case.");
    }

    const data = await res.json();
    setCloseSuccess(data.message);
    await fetchCaseDetails({
      id,
      navigate,
      setCaseDetail,
      setLoading,
      setError,
    });
  } catch (err) {
    console.error("Error closing case:", err);
    setCloseError(err.message);
    if (err.message.includes("log in")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  } finally {
    setCloseLoading(false);
  }
};

// Add a note to a case
export const handleAddNote = async (
  e,
  {
    id,
    noteForm,
    setAddNoteLoading,
    setAddNoteError,
    setAddNoteSuccess,
    setIsAddNoteModalOpen,
    setNoteForm,
    fetchCaseDetails,
    navigate,
    setCaseDetail,
    setLoading,
    setError,
  }
) => {
  e.preventDefault();
  try {
    setAddNoteLoading(true);
    setAddNoteError(null);
    setAddNoteSuccess(null);

    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("Authentication token not found. Please log in.");

    const res = await fetch(`http://localhost:5000/api/cases/${id}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(noteForm),
    });

    if (!res.ok) {
      const errorData = await res.json();
      if (res.status === 401 || res.status === 403)
        throw new Error("Session expired. Please log in again.");
      throw new Error(errorData.message || "Failed to add note.");
    }

    const data = await res.json();
    setAddNoteSuccess(data.message);
    await fetchCaseDetails({
      id,
      navigate,
      setCaseDetail,
      setLoading,
      setError,
    });

    setTimeout(() => {
      setIsAddNoteModalOpen(false);
      setNoteForm({ content: "", visibility: "Both" });
      setAddNoteSuccess(null);
    }, 1500);
  } catch (err) {
    console.error("Error adding note:", err);
    setAddNoteError(err.message);
    if (err.message.includes("log in")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  } finally {
    setAddNoteLoading(false);
  }
};

// Add an appointment to a case
export const handleAddAppointment = async (
  e,
  {
    caseDetail,
    id,
    appointmentForm,
    setAddAppointmentLoading,
    setAddAppointmentError,
    setAddAppointmentSuccess,
    setIsAddAppointmentModalOpen,
    setAppointmentForm,
    fetchCaseDetails,
    navigate,
    setCaseDetail,
    setLoading,
    setError,
  }
) => {
  e.preventDefault();
  try {
    setAddAppointmentLoading(true);
    setAddAppointmentError(null);
    setAddAppointmentSuccess(null);

    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("Authentication token not found. Please log in.");

    const requiredFields = { date: appointmentForm.date };
   const currentUser= localStorage.getItem("authResponse"); 
    if (currentUser.role === "Client")
      requiredFields.lawyer = appointmentForm.lawyer;
    else if (currentUser.role === "Lawyer")
      requiredFields.client = appointmentForm.client;

    if (
      !requiredFields.date ||
      !(requiredFields.lawyer || requiredFields.client)
    ) {
      throw new Error("Date and either lawyer or client are required");
    }

    const formData = { ...appointmentForm, client: caseDetail.client._id };

    const res = await fetch(`http://localhost:5000/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      if (res.status === 401 || res.status === 403)
        throw new Error("Session expired. Please log in again.");
      throw new Error(errorData.message || "Failed to add appointment.");
    }

    const data = await res.json();
    setAddAppointmentSuccess(data.message);
    await fetchCaseDetails({
      id,
      navigate,
      setCaseDetail,
      setLoading,
      setError,
    });

    setTimeout(() => {
      setIsAddAppointmentModalOpen(false);
      setAppointmentForm({
        created: "",
        client: "",
        case: id || "",
        date: "",
        type: "Meeting",
        description: "",
      });
      setAddAppointmentSuccess(null);
    }, 1500);
  } catch (err) {
    console.error("Error adding appointment:", err);
    setAddAppointmentError(err.message);
    if (err.message.includes("log in")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  } finally {
    setAddAppointmentLoading(false);
  }
};

// Fetch appointments for a case
export const fetchAppointments = async ({
  id,
  setAppointments,
  setAppointmentsLoading,
  setAppointmentsError,
  navigate,
}) => {
  try {
    setAppointmentsLoading(true);
    setAppointmentsError(null);

    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("Authentication token not found. Please log in.");

    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 3);
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + 6);

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    const response = await fetch(
      `http://localhost:5000/api/appointments/case/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401 || response.status === 403)
        throw new Error("Session expired. Please log in again.");
      throw new Error(errorData.message || "Failed to fetch appointments.");
    }

    const data = await response.json();
    const caseAppointments = data.appointments.filter(
      (appointment) => appointment.case && appointment.case._id === id
    );
    setAppointments(caseAppointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    setAppointmentsError(err.message);
    if (err.message.includes("log in")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  } finally {
    setAppointmentsLoading(false);
  }
};




// Reschedule an appointment
export const handleRescheduleAppointment = async (
  e,
  {
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
  }
) => {
  e.preventDefault();
  try {
    setRescheduleLoading(true);
    setRescheduleError(null);
    setRescheduleSuccess(null);

    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("Authentication token not found. Please log in.");

    if (!rescheduleForm.date)
      throw new Error("Please select a new date for the appointment.");

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
      if (response.status === 401 || response.status === 403)
        throw new Error("Session expired. Please log in again.");
      throw new Error(errorData.message || "Failed to reschedule appointment.");
    }

    await response.json();
    setRescheduleSuccess("Appointment rescheduled successfully");
    await fetchAppointments({
      id: selectedAppointment.case._id,
      setAppointments,
      setAppointmentsLoading,
      setAppointmentsError,
      navigate,
    });

    setTimeout(() => {
      setIsRescheduleModalOpen(false);
      setSelectedAppointment(null);
      setRescheduleForm({ date: "" });
      setRescheduleSuccess(null);
    }, 1500);
  } catch (err) {
    console.error("Error rescheduling appointment:", err);
    setRescheduleError(err.message);
    if (err.message.includes("log in")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  } finally {
    setRescheduleLoading(false);
  }
};

// Download ICS file for an appointment
export const downloadICSFile = async (
  appointmentId,
  { setAppointmentActionError, navigate }
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("Authentication token not found. Please log in.");

    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    a.href = `http://localhost:5000/api/appointments/${appointmentId}/ics?token=${token}`;
    a.setAttribute("download", `appointment-${appointmentId}.ics`);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error("Error downloading ICS file:", err);
    setAppointmentActionError("Failed to download calendar file");
    setTimeout(() => setAppointmentActionError(null), 3000);
    if (err.message.includes("log in")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }
};

// Handle appointment action (confirm, cancel, complete)
export const handleAppointmentAction = async (
  appointmentId,
  action,
  successMessage,
  {
    setAppointmentActionLoading,
    setAppointmentActionError,
    setAppointmentActionSuccess,
    setShowAppointmentActions,
    fetchAppointments,
    navigate,
    setAppointments,
    setAppointmentsLoading,
    setAppointmentsError,
  }
) => {
  try {
    setAppointmentActionLoading(true);
    setAppointmentActionError(null);
    setAppointmentActionSuccess(null);
    setShowAppointmentActions(null);

    const token = localStorage.getItem("token");
    if (!token)
      throw new Error("Authentication token not found. Please log in.");

    const response = await fetch(
      `http://localhost:5000/api/appointments/${appointmentId}/${action}`,
      {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401 || response.status === 403)
        throw new Error("Session expired. Please log in again.");
      throw new Error(errorData.message || `Failed to ${action} appointment.`);
    }

    const data = await response.json();
    setAppointmentActionSuccess(successMessage || data.message);

    // Refresh appointments list
    if (fetchAppointments) {
      try {
        setAppointmentsLoading(true);
        setAppointmentsError(null);
        const updatedAppointments = await fetchAppointments();
        setAppointments(updatedAppointments);
      } catch (error) {
        console.error(`Error refreshing appointments after ${action}:`, error);
        setAppointmentsError(`Appointment ${action}d, but failed to refresh list.`);
      } finally {
        setAppointmentsLoading(false);
      }
    }
  } catch (error) {
    console.error(`Error ${action}ing appointment:`, error);
    setAppointmentActionError(error.message);
    if (error.message.includes("session expired")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  } finally {
    setAppointmentActionLoading(false);
  }
};

// Confirm an appointment
export const handleConfirmAppointment = async (
  appointmentId,
  {
    setAppointmentActionLoading,
    setAppointmentActionError,
    setAppointmentActionSuccess,
    setShowAppointmentActions,
    fetchAppointments,
    navigate,
    setAppointments,
    setAppointmentsLoading,
    setAppointmentsError,
  }
) => {
  await handleAppointmentAction(
    appointmentId,
    "confirm",
    "Appointment confirmed successfully",
    {
      setAppointmentActionLoading,
      setAppointmentActionError,
      setAppointmentActionSuccess,
      setShowAppointmentActions,
      fetchAppointments,
      navigate,
      setAppointments,
      setAppointmentsLoading,
      setAppointmentsError,
    }
  );
};

// Cancel an appointment
export const handleCancelAppointment = async (
  appointmentId,
  {
    setAppointmentActionLoading,
    setAppointmentActionError,
    setAppointmentActionSuccess,
    setShowAppointmentActions,
    fetchAppointments,
    navigate,
    setAppointments,
    setAppointmentsLoading,
    setAppointmentsError,
  }
) => {
  await handleAppointmentAction(
    appointmentId,
    "cancel",
    "Appointment cancelled successfully",
    {
      setAppointmentActionLoading,
      setAppointmentActionError,
      setAppointmentActionSuccess,
      setShowAppointmentActions,
      fetchAppointments,
      navigate,
      setAppointments,
      setAppointmentsLoading,
      setAppointmentsError,
    }
  );
};

// Complete an appointment
export const handleCompleteAppointment = async (
  appointmentId,
  {
    setAppointmentActionLoading,
    setAppointmentActionError,
    setAppointmentActionSuccess,
    setShowAppointmentActions,
    fetchAppointments,
    navigate,
    setAppointments,
    setAppointmentsLoading,
    setAppointmentsError,
  }
) => {
  await handleAppointmentAction(
    appointmentId,
    "complete",
    "Appointment marked as completed successfully",
    {
      setAppointmentActionLoading,
      setAppointmentActionError,
      setAppointmentActionSuccess,
      setShowAppointmentActions,
      fetchAppointments,
      navigate,
      setAppointments,
      setAppointmentsLoading,
      setAppointmentsError,
    }
  );
};

// Function to fetch case appointments
export const fetchCaseAppointments = async (caseId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found. Please log in.");

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
    if (response.status === 401 || response.status === 403)
      throw new Error("Session expired. Please log in again.");
    throw new Error(errorData.message || "Failed to fetch appointments.");
  }

  const data = await response.json();
  return data.appointments;
};
