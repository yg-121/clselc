import { useState } from "react";
import { File, Download, Trash, Eye, X } from "lucide-react";

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
    setDocToDelete(docId);
    setShowPopup(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
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
        throw new Error(errorData.message || "Failed to delete document.");
      }

      // Refresh the case details using the callback
      if (refreshCaseDetails) {
        await refreshCaseDetails();
      }
      
      setShowPopup(false);
      setDocToDelete(null);
    } catch (err) {
      console.error("Error deleting document:", err);
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowPopup(false);
    setDocToDelete(null);
    setDeleteError(null);
  };

  return (
    <div className="relative">
      {/* Documents List */}
      {documents && documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{doc.fileName}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {doc.category}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {doc.visibility}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()} by {doc.uploadedBy?.username || "Unknown"}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`http://localhost:5000/${doc.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a
                    href={`http://localhost:5000/${doc.filePath}`}
                    download
                    className="inline-flex items-center p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteClick(doc._id)}
                    className="inline-flex items-center p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic text-center">No documents available.</p>
      )}

      {/* Delete Confirmation Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Deletion
              </h2>
              <button
                onClick={handleCancelDelete}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be
              undone.
            </p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className={`px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center ${
                  deleteLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Document"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
