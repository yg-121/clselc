import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  Calendar,
  CheckCircle,
  ChevronDownCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
} from "lucide-react";
import CaseDocument from "../client/CaseDocument";
import AppointmentsPage from "../common/Appointments";

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
  const currentDate = new Date("2025-05-03T00:00:00.000Z");
  return new Date(deadlineDate) < currentDate;
};

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
  const [noteForm, setNoteForm] = useState({
    content: "",
    visibility: "Both",
  });
  const [addNoteLoading, setAddNoteLoading] = useState(false);
  const [addNoteError, setAddNoteError] = useState(null);
  const [addNoteSuccess, setAddNoteSuccess] = useState(null);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(`http://localhost:5000/api/cases/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
          throw new Error("Session expired. Please log in again.");
        }
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

  useEffect(() => {
    fetchCaseDetails();
  }, [id, navigate]);

  const handleCloseCase = async () => {
    try {
      setCloseLoading(true);
      setCloseError(null);
      setCloseSuccess(null);

      const token = localStorage.getItem("token");
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
      if (err.message.includes("log in")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setCloseLoading(false);
      setIsCloseModalOpen(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      setAddNoteLoading(true);
      setAddNoteError(null);
      setAddNoteSuccess(null);

      const token = localStorage.getItem("token");
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
        if (res.status === 401 || res.status === 403) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(errorData.message || "Failed to add note.");
      }

      const data = await res.json();
      setAddNoteSuccess(data.message);

      await fetchCaseDetails();

      setTimeout(() => {
        setIsAddNoteModalOpen(false);
        setNoteForm({ content: "", visibility: "Both" });
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") {
      return "N/A";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "posted":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "assigned":
        return <ChevronDownCircle className="h-5 w-5 text-green-500" />;
      case "closed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const toggleDocs = () => {
    setIsDocsOpen(!isDocsOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center mt-4">
        {error}
        <Link
          to="/login"
          className="mt-2 inline-block text-blue-500 hover:underline"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (!caseDetail) {
    return <div className="text-center mt-4">No case details available.</div>;
  }

  return (
    <div className="font-inter bg-white text-gray-800 p-6 max-w-3xl mx-auto min-h-screen">
      {/* Case Overview */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {caseDetail.category || "Other"}
              </h1>
              <span
                className={`px-4 py-1.5 text-sm text-white rounded-full ${getStatusColor(
                  caseDetail.status
                )}`}
              >
                {caseDetail.status.charAt(0).toUpperCase() +
                  caseDetail.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600 mb-2 italic">
              {caseDetail.description || "Untitled Case"}
            </p>
            <div className="flex space-x-4 mb-4 text-sm text-gray-600">
              <p className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-700" />
                <span className="font-medium">Started:</span>{" "}
                {formatDate(caseDetail.createdAt || new Date().toISOString())}
              </p>
              <p className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-700" />
                <span className="font-medium">Deadline:</span>{" "}
                {formatDate(caseDetail.deadline || new Date().toISOString())}
              </p>
              <p className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-700" />
                <span className="font-medium">Last Updated:</span>{" "}
                {formatDate(caseDetail.updatedAt || new Date().toISOString())}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-gray-700" />
                <span className="font-medium">Client:</span>{" "}
                {caseDetail.client?.username || "Unknown Client"}
              </p>
              <p className="flex items-center mt-1">
                <DollarSign className="mr-2 h-4 w-4 text-gray-700" />
                <span className="font-medium">Bid Amount:</span>{" "}
                {formatCurrency(caseDetail.winning_bid?.amount || 0)}
              </p>
            </div>
          </div>
          {caseDetail.status === "assigned" && (
            <div className="self-end flex flex-col space-y-4">
              <button
                onClick={() => setIsCloseModalOpen(true)}
                disabled={closeLoading}
                className={`inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300 ${
                  closeLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <X className="h-4 w-4 mr-2" /> Close Case
              </button>
            </div>
          )}
        </div>
        {closeSuccess && (
          <div className="mt-4 p-2 bg-green-100 text-green-600 rounded-lg">
            {closeSuccess}
          </div>
        )}
        {closeError && (
          <div className="mt-4 p-2 bg-red-100 text-red-600 rounded-lg">
            {closeError}
          </div>
        )}
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

      {/* Documents */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center text-gray-800">
                <FileText className="mr-2 h-5 w-5 text-gray-700" /> Documents
              </h2>
              <button
                onClick={toggleDocs}
                className="flex items-center text-gray-700 hover:text-gray-900 transition-all duration-300"
              >
                {isDocsOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
            {isDocsOpen && (
              <div>
                <CaseDocument documents={caseDetail.documents} caseId={id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
        <div className="flex justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold flex items-center mb-4 text-gray-800">
              <MessageSquare className="mr-2 h-5 w-5 text-gray-700" /> Notes
            </h2>
            {caseDetail.notes && caseDetail.notes.length > 0 ? (
              <ul className="space-y-4">
                {caseDetail.notes.map((note) => (
                  <li
                    key={note._id}
                    className="p-4 border border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all duration-300"
                  >
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Content:</span>{" "}
                      {note.content}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Visibility:</span>{" "}
                      {note.visibility}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Created By:</span>{" "}
                      {note.createdBy?.username || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Created At:</span>{" "}
                      {formatDate(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No notes available.</p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add Note</h2>
              <button
                onClick={() => {
                  setIsAddNoteModalOpen(false);
                  setNoteForm({ content: "", visibility: "Both" });
                  setAddNoteError(null);
                  setAddNoteSuccess(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {addNoteSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-600 rounded-lg">
                {addNoteSuccess}
              </div>
            )}
            {addNoteError && (
              <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg">
                {addNoteError}
              </div>
            )}
            <form onSubmit={handleAddNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note Content
                </label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, content: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  rows="4"
                  maxLength="500"
                  required
                  placeholder="Enter your note here..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  value={noteForm.visibility}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, visibility: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                >
                  {["Both", "Client", "Lawyer"].map((vis) => (
                    <option key={vis} value={vis}>
                      {vis}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddNoteModalOpen(false);
                    setNoteForm({ content: "", visibility: "Both" });
                    setAddNoteError(null);
                    setAddNoteSuccess(null);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addNoteLoading}
                  className={`px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300 flex items-center ${
                    addNoteLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {addNoteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    "Add Note"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Additional Deadlines */}
      {caseDetail.additionalDeadlines &&
        caseDetail.additionalDeadlines.length > 0 && (
          <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <Calendar className="mr-2 h-5 w-5 text-gray-700" /> Additional
              Deadlines
            </h2>
            <ul className="space-y-4">
              {caseDetail.additionalDeadlines.map((deadline) => {
                const overdue = isOverdue(deadline.deadline);
                return (
                  <li
                    key={deadline._id}
                    className={`p-4 border rounded-lg transition-all duration-300 ${
                      overdue
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Description:</span>{" "}
                          {deadline.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Deadline:</span>{" "}
                          {formatDate(deadline.deadline)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Assigned To:</span>{" "}
                          {deadline.assignedTo?.username || "Unknown"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm text-white rounded-full ${
                          overdue ? "bg-red-500" : "bg-green-500"
                        }`}
                      >
                        {overdue ? "Overdue" : "Upcoming"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

      {/* Appointments Section */}
      {caseDetail.status === "assigned" && (
        <AppointmentsPage
          caseItem={caseDetail}
          fetchCaseDetails={fetchCaseDetails}
        />
      )}

      {/* Back Button */}
      <div className="mt-6">
        <Link
          to="/lawyer/cases"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300"
        >
          Back to Cases
        </Link>
      </div>
    </div>
  );
}
