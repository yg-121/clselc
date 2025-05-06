import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Filter, Plus, X } from "lucide-react";
import { jwtDecode } from "jwt-decode";

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

export default function AppointmentsPage({
  userRole,
  caseItem,
  fetchCaseDetails,
}) {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    case: "",
    date: "",
    type: "Meeting",
    description: "",
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Decode token to get userId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      window.location.href = "/login";
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (!decoded.id) {
        throw new Error("User ID not found in token.");
      }
      setUserId(decoded.id);
    } catch (err) {
      console.error("Error decoding token:", err);
      setError("Failed to authenticate. Please log in again.");
      setLoading(false);
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  // Fetch case details from API
  useEffect(() => {
    const fetchCaseDetailsFromApi = async () => {
      if (!caseItem || !caseItem._id) {
        setError("Case ID is missing or invalid.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/cases/${caseItem._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(errorData.message || "Failed to fetch case details.");
        }

        const data = await response.json();
        // console.log("Fetched case details:", data); // Debug log
        setForm((prevForm) => ({
          ...prevForm,
          lawyer: data.case.assigned_lawyer?._id || "",
          client: data.case.client?._id || "",
          case: data.case._id || "",
        }));
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

    fetchCaseDetailsFromApi();
  }, [caseItem]);

  // Fetch appointments
  useEffect(() => {
    if (!userId) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/appointments/case/${caseItem._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(errorData.message || "Failed to fetch appointments.");
        }

        const data = await response.json();
        console.log("fetched appoinmente",data)
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError(err.message);
        if (err.message.includes("log in")) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [userId]);

  // Handle form submission to create appointment
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setFormError(null);
      setFormSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      // Validate date
      const date = new Date(form.date);
      if (isNaN(date) || date < new Date()) {
        throw new Error("Please select a future date for the appointment.");
      }

      // Build the payload for the POST /appointments endpoint
      const payload = {
        client: caseItem.client._id,
        lawyer: caseItem.assigned_lawyer._id,
        date: date.toISOString().split("T")[0],
        type: form.type || "Meeting",
        description: form.description || undefined,
        case: caseItem._id,
      };

      console.log("Payload being sent:", payload); // Debug log
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          throw new Error(
            errorData.message || "Invalid appointment data provided."
          );
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(errorData.message || "Failed to create appointment.");
      }

      const data = await response.json();
      setFormSuccess(data.message);
      setAppointments([...appointments, data.appointment]);

      setTimeout(() => {
        setShowForm(false);
        setForm({
          lawyer: form.lawyer,
          client: form.client,
          case: form.case,
          date: "",
          type: "Meeting",
          description: "",
        });
        setFormError(null);
        setFormSuccess(null);
        fetchCaseDetails();
      }, 1500);
    } catch (err) {
      console.error("Error creating appointment:", err);
      setFormError(err.message);
      if (err.message.includes("log in")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (id) => {
    try {
      setCancelLoading(true);
      setCancelError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(
        `http://localhost:5000/api/appointments/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          throw new Error(errorData.message || "Appointment not found");
        }
        throw new Error(errorData.message || "Failed to cancel appointment");
      }

      const data = await response.json();
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt._id === id ? data.appointment : appt
        )
      );
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      setCancelError(err.message);
      if (err.message.includes("log in")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setCancelLoading(false);
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const now = new Date();
    const apptDate = new Date(appointment.date);
    const isUpcoming = apptDate >= now;
    return filter === "all"
      ? true
      : filter === "upcoming"
      ? isUpcoming
      : !isUpcoming;
  });

  // Determine if the "Book Appointment" button should be disabled
  const isBookingDisabled = userRole === "Client" ? !form.lawyer : !form.client;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-600">{error}</p>
        {error.includes("log in") && (
          <p className="mt-2">
            <Link to="/login" className="text-primary hover:underline">
              Click here to log in
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
      {/* Header */}
      <div className=" flex justify-between">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Appointments</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredAppointments.length} Appointment
            {filteredAppointments.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
              >
                <option value="all">All Appointments</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={isBookingDisabled}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                isBookingDisabled
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
              title={
                isBookingDisabled
                  ? userRole === "Client"
                    ? "No lawyer assigned to this case."
                    : "No client assigned to this case."
                  : ""
              }
            >
              <Plus className="h-5 w-5 mr-2" />
              {showForm ? "Hide Form" : "Book Appointment"}
            </button>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-6">
            {console.log(filteredAppointments)}
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 relative"
                >
                  <Calendar className="h-6 w-6 text-gray-500 mr-4" />
                  <span
                    className={`px-2 py-1.5 text-sm text-white rounded-full ${getStatusColor(
                      appointment.status
                    )}`}
                    style={{ position: "absolute", top: "4px", right: "8px" }}
                  >
                    {appointment.status}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.date).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: {appointment.type || "Meeting"}
                    </p>
                    {appointment.description && (
                      <p className="text-sm text-gray-600">
                        Description: {appointment.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCancelAppointment(appointment._id)}
                    className={`text-red-500 hover:text-red-700 ${
                      cancelLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    disabled={
                      appointment.status === "Cancelled" ||
                      cancelLoading ||
                      (appointment.client.toString() !== userId &&
                        appointment.lawyer.toString() !== userId)
                    }
                    title={
                      appointment.status === "Cancelled"
                        ? "This appointment is already cancelled"
                        : cancelLoading
                        ? "Cancelling..."
                        : appointment.client.toString() !== userId &&
                          appointment.lawyer.toString() !== userId
                        ? "Only the client or lawyer can cancel this appointment"
                        : ""
                    }
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              ))}
            </div>
            {cancelError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {cancelError}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 text-center py-12 mb-6">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Appointments Found
            </h3>
            <p className="text-gray-600">Book an appointment to get started.</p>
          </div>
        )}

        {/* Booking Form */}
        {showForm && (
          <div
            className="bg-card text-card-foreground rounded-lg shadow-md p-6 transition-all duration-500 ease-in-out transform origin-top"
            style={{
              opacity: showForm ? 1 : 0,
              transform: showForm ? "scale(1)" : "scale(0.95)",
            }}
          >
            {formSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {formSuccess}
              </div>
            )}
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAppointment}>
              {userRole === "Client" && (
                <div className="mb-4">
                  <label
                    htmlFor="lawyer"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Lawyer
                  </label>
                  <input
                    id="lawyer"
                    value={
                      form.lawyer ? "Assigned Lawyer" : "No lawyer assigned"
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
              )}

              {userRole === "Lawyer" && (
                <div className="mb-4">
                  <label
                    htmlFor="client"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Client
                  </label>
                  <input
                    id="client"
                    value={
                      form.client ? "Assigned Client" : "No client assigned"
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
              )}


              <div className="mb-4">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  required
                  disabled={isBookingDisabled}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Appointment Type
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  disabled={isBookingDisabled}
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Court Hearing">Court Hearing</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  rows="3"
                  placeholder="Describe the purpose of the appointment"
                  disabled={isBookingDisabled}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm({
                      lawyer: form.lawyer,
                      client: form.client,
                      case: caseItem._id,
                      date: "",
                      type: "Meeting",
                      description: "",
                    });
                    setFormError(null);
                    setFormSuccess(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || isBookingDisabled}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${
                    formLoading || isBookingDisabled
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    "Book Appointment"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
