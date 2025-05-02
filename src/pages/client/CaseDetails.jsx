import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  File,
  MessageSquare,
  Calendar,
  Plus,
  User,
  Edit,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  Trash2,
} from "lucide-react";
import CaseDocument from "./CaseDocument";
import AppointmentsPage from "../common/Appointments";

// Helper function to map status to color
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

// Helper function to check if a deadline is overdue
const isOverdue = (deadlineDate) => {
  const currentDate = new Date("2025-04-29T00:00:00.000Z"); // Current date as per context
  return new Date(deadlineDate) < currentDate;
};

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(null);
  const [acceptError, setAcceptError] = useState(null);
  const [acceptSuccess, setAcceptSuccess] = useState(null);
  const [isEditingCase, setIsEditingCase] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    description: "",
    category: "",
    deadline: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  // Function to fetch case and bids data
  const fetchCaseDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      console.log("Fetching case details for caseId:", id);
      const caseRes = await fetch(`http://localhost:5000/api/cases/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!caseRes.ok) {
        const errorData = await caseRes.json();
        throw new Error(errorData.message || "Failed to fetch case details.");
      }

      const caseData = await caseRes.json();
      setCaseItem(caseData.case);
      setUpdateForm({
        description: caseData.case.description,
        category: caseData.case.category,
        deadline: caseData.case.deadline.split("T")[0],
      });

      const bidsRes = await fetch(`http://localhost:5000/api/bids/case/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!bidsRes.ok) {
        const errorData = await bidsRes.json();
        throw new Error(errorData.message || "Failed to fetch bids.");
      }

      const bidsData = await bidsRes.json();
      setBids(bidsData);
    } catch (err) {
      console.error("Error fetching case details or bids:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const handleAcceptBid = async (bidId) => {
    try {
      setAcceptLoading(bidId);
      setAcceptError(null);
      setAcceptSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      console.log("Accepting bid with bidId:", bidId);
      const res = await fetch(
        `http://localhost:5000/api/bids/accept/${bidId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to accept bid.");
      }

      const data = await res.json();
      setAcceptSuccess(data.message);

      await fetchCaseDetails();
    } catch (err) {
      console.error("Error accepting bid:", err);
      setAcceptError(err.message);
    } finally {
      setAcceptLoading(null);
    }
  };

  const handleUpdateCase = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      console.log("Updating case with caseId:", id, "Data:", updateForm);
      const res = await fetch(`http://localhost:5000/api/cases/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update case.");
      }

      const data = await res.json();
      setUpdateSuccess(data.message);

      await fetchCaseDetails();
      setTimeout(() => {
        setIsEditingCase(false);
      }, 1500);
    } catch (err) {
      console.error("Error updating case:", err);
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseCase = async () => {
    try {
      setCloseLoading(true);
      setCloseError(null);
      setCloseSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      console.log("Closing case with caseId:", id);
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
    } finally {
      setCloseLoading(false);
      setIsCloseModalOpen(false);
    }
  };

  const handleDeleteCase = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      console.log("Deleting case with caseId:", id);
      const res = await fetch(`http://localhost:5000/api/cases/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete case.");
      }

      const data = await res.json();
      navigate("/client/cases", { state: { message: data.message } });
    } catch (err) {
      console.error("Error deleting case:", err);
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      setAddNoteLoading(true);
      setAddNoteError(null);
      setAddNoteSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      console.log("Adding note to caseId:", id, "Data:", noteForm);
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
        window.location.href = "/login";
      }
    } finally {
      setAddNoteLoading(false);
    }
  };

  const toggleDocs = () => {
    setIsDocsOpen(!isDocsOpen);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center mt-4">{error}</div>;
  }

  if (!caseItem) {
    return (
      <div className="text-center mt-4 text-gray-600">Case not found.</div>
    );
  }

  return (
    <div className="font-inter bg-white text-gray-800 p-6 max-w-3xl mx-auto min-h-screen">
      {/* Case Overview and Client Information */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {caseItem.category}
              </h1>
              <span
                className={`px-4 py-1.5 text-sm text-white rounded-full ${getStatusColor(
                  caseItem.status
                )}`}
              >
                {caseItem.status}
              </span>
            </div>
            <p className="text-gray-600 mb-2 italic">{caseItem.description}</p>
            <div className="flex space-x-4 mb-4 text-sm text-gray-600">
              <p className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-700" />
                <span className="font-medium">Deadline:</span>{" "}
                {new Date(caseItem.deadline).toLocaleDateString()}
              </p>
              <p className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-700" />
                <span className="font-medium">Created:</span>{" "}
                {new Date(caseItem.createdAt).toLocaleDateString()}
              </p>
              <p className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-700" />
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(caseItem.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <User className="mr-2 h-4 w-4 text-gray-700" />
              <p className="text-sm text-gray-600">
                {caseItem.client.username}
              </p>
            </h2>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <p className="text-sm text-gray-600 mb-4">
                Email: {caseItem.client.email}
              </p>
            </h2>
          </div>
          <div className="self-end flex flex-col space-y-4">
            {caseItem.status !== "Assigned" && caseItem.status !== "Closed" && (
              <button
                onClick={() => setIsEditingCase(true)}
                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300"
              >
                <Edit className="h-4 w-4 mr-2" /> Update Case
              </button>
            )}
            {caseItem.status === "Assigned" && (
              <button
                onClick={() => setIsCloseModalOpen(true)}
                disabled={closeLoading}
                className={`inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300 ${
                  closeLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <X className="h-4 w-4 mr-2" /> Close Case
              </button>
            )}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={deleteLoading}
              className={`inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md hover:from-red-700 hover:to-red-800 hover:scale-105 transition-all duration-300 ${
                deleteLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete Case
            </button>
          </div>
        </div>
        {deleteError && (
          <div className="mt-4 p-2 bg-red-100 text-red-600 rounded-lg">
            {deleteError}
          </div>
        )}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Deletion
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this case? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCase}
                disabled={deleteLoading}
                className={`px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md hover:from-red-700 hover:to-red-800 hover:scale-105 transition-all duration-300 flex items-center ${
                  deleteLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Case Modal */}
      {isEditingCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Update Case
              </h2>
              <button
                onClick={() => setIsEditingCase(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {updateSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-600 rounded-lg">
                {updateSuccess}
              </div>
            )}
            {updateError && (
              <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg">
                {updateError}
              </div>
            )}
            <form onSubmit={handleUpdateCase}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  rows="4"
                  maxLength="500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={updateForm.category}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, category: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  required
                >
                  {[
                    "Contract",
                    "Family",
                    "Criminal",
                    "Property",
                    "Labor",
                    "Other",
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={updateForm.deadline}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, deadline: e.target.value })
                  }
                  className="w-full border border-gray-400 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCase(false)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className={`px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300 flex items-center ${
                    updateLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {updateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assigned Lawyer */}
      {caseItem.assigned_lawyer && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
          <div className="flex justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <User className="mr-2 h-5 w-5 text-gray-700" /> Assigned Lawyer
              </h2>
              <p className="text-sm text-gray-600">
                Username: {caseItem.assigned_lawyer.username}
              </p>
              <p className="text-sm text-gray-600">
                Email: {caseItem.assigned_lawyer.email}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => alert("Messaging functionality coming soon!")}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300"
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Message Lawyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winning Bid */}
      {caseItem.winning_bid && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Winning Bid
          </h2>
          <p className="text-sm text-gray-600">
            Amount: {caseItem.winning_bid.amount} ETB
          </p>
          <p className="text-sm text-gray-600">
            Lawyer: {caseItem.assigned_lawyer?.username || "Unknown"}
          </p>
        </div>
      )}

      {/* Documents */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center text-gray-800">
                <File className="mr-2 h-5 w-5 text-gray-700" /> Documents
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
                <CaseDocument documents={caseItem.documents} caseId={id} />
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() =>
                alert("Document upload functionality coming soon!")
              }
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
            </button>
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
            {caseItem.notes && caseItem.notes.length > 0 ? (
              <ul className="space-y-4">
                {caseItem.notes.map((note) => (
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
                      {new Date(note.createdAt).toLocaleDateString()}
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

      {/* Form Templates */}
      {caseItem.formTemplates && caseItem.formTemplates.length > 0 && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
          <div className="flex justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <File className="mr-2 h-5 w-5 text-gray-700" /> Form Templates
              </h2>
              <ul className="space-y-4">
                {caseItem.formTemplates.map((form) => (
                  <li
                    key={form._id}
                    className="p-4 border border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Title:</span>{" "}
                          {form.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Created By:</span>{" "}
                          {form.createdBy?.username || "Unknown"}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() =>
                            alert("Form viewing functionality coming soon!")
                          }
                          className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300"
                        >
                          View Form
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Additional Deadlines */}
      {caseItem.additionalDeadlines &&
        caseItem.additionalDeadlines.length > 0 && (
          <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <Calendar className="mr-2 h-5 w-5 text-gray-700" /> Additional
              Deadlines
            </h2>
            <ul className="space-y-4">
              {caseItem.additionalDeadlines.map((deadline) => {
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
                          {new Date(deadline.deadline).toLocaleDateString()}
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

      {/* Bids Section */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 transition-all duration-300">
        <div className="flex justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Bids</h2>
            {acceptSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-600 rounded-lg">
                {acceptSuccess}
              </div>
            )}
            {acceptError && (
              <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg">
                {acceptError}
              </div>
            )}
            {bids.length > 0 ? (
              <ul className="space-y-4">
                {bids.map((bid) => (
                  <li
                    key={bid._id}
                    className="relative p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md hover:scale-101 transition-all duration-300"
                  >
                    <div className="pr-12">
                      <p className="text-sm text-gray-700 font-semibold">
                        <span className="font-medium">Lawyer:</span>{" "}
                        {bid.lawyer?.username || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Amount:</span>{" "}
                        {bid.amount} ETB
                      </p>
                      {bid.comment && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Comment:</span>{" "}
                          {bid.comment}
                        </p>
                      )}
                    </div>
                    {caseItem.status === "Posted" &&
                      bid.status !== "Accepted" && (
                        <div className="absolute right-[-12px] top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
                          <button
                            onClick={() => handleAcceptBid(bid._id)}
                            disabled={acceptLoading === bid._id}
                            className={`text-green-500 hover:text-green-600 hover:scale-110 transition-all duration-300 bg-white rounded-full shadow-md p-1 ${
                              acceptLoading === bid._id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {acceptLoading === bid._id ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                            ) : (
                              <CheckCircle className="h-6 w-6" />
                            )}
                          </button>
                        </div>
                      )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No bids available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      {caseItem.status === "Assigned" && (
        <AppointmentsPage caseItem={caseItem} fetchCaseDetails={fetchCaseDetails} />
      )}

      {/* Back Button */}
      <div className="mt-6">
        <Link
          to="/client/cases"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300"
        >
          Back to My Cases
        </Link>
      </div>
    </div>
  );
}
