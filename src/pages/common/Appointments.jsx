import { useState, useEffect } from "react";
import { Calendar, Filter, X, Plus } from "lucide-react";
import {jwtDecode} from "jwt-decode";

export default function AppointmentsPage({ userRole }) {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState({
    lawyer: "",
    client: "",
    case: "",
    date: "",
    time: "",
    type: "Meeting",
    description: "",
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

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

  // Fetch appointments
  useEffect(() => {
    if (!userId) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/appointments", {
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

  // Fetch lawyers/clients and cases for the booking form
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch lawyers (for clients) or clients (for lawyers)
        const endpoint =
          userRole === "Client"
            ? "http://localhost:5000/api/users/lawyers"
            : "http://localhost:5000/api/users/clients";
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch users.");
        }

        const data = await response.json();
        if (userRole === "Client") {
          setLawyers(data.lawyers || []);
        } else {
          setClients(data.clients || []);
        }

        // Fetch cases
        const casesResponse = await fetch("http://localhost:5000/api/cases", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!casesResponse.ok) {
          const errorData = await casesResponse.json();
          throw new Error(errorData.message || "Failed to fetch cases.");
        }

        const casesData = await casesResponse.json();
        setCases(casesData.cases || []);
      } catch (err) {
        console.error("Error fetching data for form:", err);
        setError(err.message);
      }
    };

    fetchData();
  }, [userId, userRole]);

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

      // Combine date and time into ISO string
      const dateTimeStr = `${form.date}T${form.time}:00Z`;
      const dateTime = new Date(dateTimeStr);
      if (isNaN(dateTime) || dateTime < new Date()) {
        throw new Error("Invalid or past date/time.");
      }

      const payload = {
        date: dateTime.toISOString(),
        type: form.type,
        description: form.description || undefined,
        case: form.case || undefined,
      };

      if (userRole === "Client") {
        payload.lawyer = form.lawyer;
      } else {
        payload.client = form.client;
      }

      const response = await fetch("http://localhost:5000/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          const conflicts = errorData.conflicts.map(
            (c) =>
              `Conflict at ${new Date(c.date).toLocaleString()} (ID: ${c.id})`
          );
          throw new Error(`${errorData.message}: ${conflicts.join(", ")}`);
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
        setIsModalOpen(false);
        setForm({
          lawyer: "",
          client: "",
          case: "",
          date: "",
          time: "",
          type: "Meeting",
          description: "",
        });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center mt-4">{error}</div>;
  }

  return (
    <div className="font-inter bg-background text-foreground min-h-screen">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Appointments</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500">
            {filteredAppointments.length} Total Appointments
          </p>
          <div className="flex items-center space-x-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">All Appointments</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Book Appointment
            </button>
          </div>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <li key={appointment._id} className="py-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-gray-500 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {userRole === "Client"
                          ? `Meeting with ${
                              appointment.lawyerName || "Unknown Lawyer"
                            }`
                          : `Client meeting with ${
                              appointment.clientName || "Unknown Client"
                            }`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        Type: {appointment.type}
                      </p>
                      {appointment.case && (
                        <p className="text-sm text-gray-500">
                          Case: {appointment.caseDescription || "N/A"}
                        </p>
                      )}
                      {appointment.description && (
                        <p className="text-sm text-gray-500">
                          Description: {appointment.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 capitalize">
                        Status: {appointment.status}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300">
                      View Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 text-center py-12 hover:shadow-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <Calendar className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No appointments found
            </h3>
            <p className="text-gray-500">
              You don’t have any appointments yet.
            </p>
          </div>
        )}
      </div>

      {/* Modal for Booking Appointment */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Book Appointment
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setForm({
                    lawyer: "",
                    client: "",
                    case: "",
                    date: "",
                    time: "",
                    type: "Meeting",
                    description: "",
                  });
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {formSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-600 rounded-lg">
                {formSuccess}
              </div>
            )}
            {formError && (
              <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateAppointment}>
              {userRole === "Client" ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Lawyer
                  </label>
                  <select
                    value={form.lawyer}
                    onChange={(e) =>
                      setForm({ ...form, lawyer: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                    required
                  >
                    <option value="">Select a lawyer</option>
                    {lawyers.map((lawyer) => (
                      <option key={lawyer._id} value={lawyer._id}>
                        {lawyer.username} (
                        {lawyer.specialization?.join(", ") || "N/A"})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Client
                  </label>
                  <select
                    value={form.client}
                    onChange={(e) =>
                      setForm({ ...form, client: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                    required
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Case (Optional)
                </label>
                <select
                  value={form.case}
                  onChange={(e) => setForm({ ...form, case: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                >
                  <option value="">No case</option>
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.description} (Status: {c.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Court Hearing">Court Hearing</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  rows="3"
                  placeholder="Describe the purpose of the appointment"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setForm({
                      lawyer: "",
                      client: "",
                      case: "",
                      date: "",
                      time: "",
                      type: "Meeting",
                      description: "",
                    });
                    setFormError(null);
                    setFormSuccess(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/90 hover:scale-105 transition-all duration-300 flex items-center ${
                    formLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    "Book"
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
