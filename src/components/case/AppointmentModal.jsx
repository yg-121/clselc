import React, { useState } from "react";
import { X, Calendar, Clock, FileText, User } from "lucide-react";

const AppointmentModal = ({
  isOpen,
  onClose,
  caseDetail,
  onSuccess,
  onError,
  isLoading,
  setIsLoading
}) => {
  const [form, setForm] = useState({
    date: "",
    time: "09:00",
    type: "Meeting",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      // Combine date and time
      const dateTime = new Date(`${form.date}T${form.time}`);
      if (isNaN(dateTime) || dateTime < new Date()) {
        throw new Error("Please select a future date and time.");
      }

      // Check if caseDetail and client exist
      if (!caseDetail || !caseDetail.client || !caseDetail._id) {
        throw new Error("Case details are missing. Please refresh the page and try again.");
      }

      // Create appointment payload
      const payload = {
        client: caseDetail.client._id,
        case: caseDetail._id,
        date: dateTime.toISOString(),
        type: form.type,
        description: form.description,
      };

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
        throw new Error(errorData.message || "Failed to create appointment");
      }

      const data = await response.json();
      onSuccess(data.message || "Appointment scheduled successfully");
      
      // Reset form and close modal after success
      setTimeout(() => {
        setForm({
          date: "",
          time: "09:00",
          type: "Meeting",
          description: "",
        });
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error("Error creating appointment:", error);
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Safety check for caseDetail
  const clientName = caseDetail && caseDetail.client ? caseDetail.client.username || "Client" : "Client";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" /> Schedule Appointment
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline h-4 w-4 mr-1" /> Client
              </label>
              <input
                type="text"
                value={clientName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" /> Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" /> Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Type
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Meeting">Meeting</option>
                <option value="Hearing">Hearing</option>
                <option value="Deadline">Deadline</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="inline h-4 w-4 mr-1" /> Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter appointment details..."
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scheduling...
                  </>
                ) : (
                  "Schedule Appointment"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;

