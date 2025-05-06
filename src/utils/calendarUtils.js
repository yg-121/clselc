/**
 * Download an ICS file for an appointment
 * @param {string} appointmentId - The ID of the appointment
 * @param {function} setAppointmentActionError - Function to set error state
 * @param {function} navigate - React Router navigate function
 */
export const downloadICSFile = async (appointmentId, setAppointmentActionError, navigate) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    a.href = `http://localhost:5000/api/appointments/${appointmentId}/ics?token=${token}`;
    a.setAttribute("download", `appointment-${appointmentId}.ics`);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error("Error downloading ICS file:", err);
    if (setAppointmentActionError) {
      setAppointmentActionError("Failed to download calendar file");
      setTimeout(() => setAppointmentActionError(null), 3000);
    }
    if (err.message.includes("log in") && navigate) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }
};

/**
 * Generate a Google Calendar event URL
 * @param {Object} appointment - The appointment object
 * @returns {string} - Google Calendar URL
 */
export const generateGoogleCalendarUrl = (appointment) => {
  if (!appointment || !appointment.date) return "";
  
  const startDate = new Date(appointment.date);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
  
  const startDateStr = startDate.toISOString().replace(/-|:|\.\d+/g, "");
  const endDateStr = endDate.toISOString().replace(/-|:|\.\d+/g, "");
  
  const title = encodeURIComponent(appointment.title || "Legal Appointment");
  const description = encodeURIComponent(appointment.description || "");
  const location = encodeURIComponent(appointment.location || "");
  
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${description}&location=${location}`;
};