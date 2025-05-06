import { useState } from "react";
import { File, Download, Trash } from "lucide-react";

export default function CaseDocument({
  documents,
  caseId,
  refreshCaseDetails,
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteClick = (docId) => {
    console.log("Delete button clicked for document ID:", docId); // Debug log
    setDocToDelete(docId);
    setShowPopup(true);
    setDeleteError(null); // Reset error state
    console.log("showPopup set to:", true, "docToDelete set to:", docId); // Debug log
  };

  const handleDeleteConfirm = async () => {
    console.log("Delete confirmed for document ID:", docToDelete); // Debug log
    try {
      setDeleteLoading(true);
      setDeleteError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(
        `http://localhost:5000/api/cases/${caseId}/documents/${docToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401 || res.status === 403) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(errorData.message || "Failed to delete document.");
      }

      // Refresh the case details using the callback instead of reloading the page
      if (refreshCaseDetails) {
        await refreshCaseDetails();
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setDeleteError(err.message);
      if (err.message.includes("log in")) {
        // Optionally redirect to login page if the session is expired
        localStorage.removeItem("token"); // Clear invalid token
        window.location.href = "/login"; // Redirect to login page
      }
    } finally {
      setDeleteLoading(false);
      setShowPopup(false);
      setDocToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    console.log("Delete canceled"); // Debug log
    setShowPopup(false);
    setDocToDelete(null);
    setDeleteError(null);
  };

  console.log("Rendering CaseDocument, showPopup:", showPopup); // Debug log

  return (
    <div className="relative">
      {/* Documents List */}
      {documents && documents.length > 0 ? (
        <ul className="space-y-4">
          {documents.map((doc) => (
            <li
              key={doc._id}
              className="p-4 border border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">File:</span>{" "}
                    {doc.fileName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Category:</span>{" "}
                    {doc.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">
                      Visibility:
                    </span>{" "}
                    {doc.visibility}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">
                      Uploaded By:
                    </span>{" "}
                    {doc.uploadedBy?.username || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">
                      Uploaded At:
                    </span>{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <a
                    href={`http://localhost:5000/${doc.filePath}`}
                    download
                    className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download
                  </a>
                  <button
                    onClick={() => handleDeleteClick(doc._id)}
                    className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md hover:from-red-700 hover:to-red-800 hover:scale-105 transition-all duration-300"
                  >
                    <Trash className="h-4 w-4 mr-2" /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No documents available.</p>
      )}

      {/* Display Error Message */}
      {deleteError && (
        <div className="mt-4 p-2 bg-red-100 text-red-600 rounded-lg">
          {deleteError}
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this document? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
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
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
