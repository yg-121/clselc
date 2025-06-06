import { X, Plus } from "lucide-react";

const AddAppointmentModal = ({
  isOpen,
  onClose,
  appointmentForm,
  setAppointmentForm,
  onSubmit,
  loading,
  error,
  success,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-600 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit}>
          {localStorage.getItem("userRole") === "Client" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lawyer
              </label>
              <input
                type="text"
                value={appointmentForm.lawyer}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    lawyer: e.target.value,
                  })
                }
                className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                required
                placeholder="Enter lawyer's username"
              />
            </div>
          )}
          {localStorage.getItem("userRole") === "Lawyer" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <input
                type="text"
                value={appointmentForm.client}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    client: e.target.value,
                  })
                }
                className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                required
                placeholder="Enter client's username"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={appointmentForm.date}
              onChange={(e) =>
                setAppointmentForm({ ...appointmentForm, date: e.target.value })
              }
              className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={appointmentForm.type}
              onChange={(e) =>
                setAppointmentForm({ ...appointmentForm, type: e.target.value })
              }
              className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
            >
              {["Meeting", "Call", "Review"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={appointmentForm.description}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  description: e.target.value,
                })
              }
              className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
              rows="3"
              placeholder="Enter description (optional)"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300 flex items-center ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Appointment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;
