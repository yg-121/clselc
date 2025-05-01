import { useState } from "react";
import { File, Download, Trash } from "lucide-react";

export default function PostedCaseDocument({ documents, caseId }) {
  const [showPopup, setShowPopup] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const handleDeleteConfirm = async () => {
    console.log("Delete confirmed for document ID:", docToDelete); // Debug log
    try {
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

      // Refresh the page to reflect the updated documents list
      window.location.reload();
    } catch (err) {
      console.error("Error deleting document:", err);
      alert(err.message);
    } finally {
      setShowPopup(false);
      setDocToDelete(null);
    }
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
              className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">File:</span> {doc.fileName}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Category:</span>{" "}
                    {doc.category}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Visibility:</span>{" "}
                    {doc.visibility}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Uploaded By:</span>{" "}
                    {doc.uploadedBy?.username || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Uploaded At:</span>{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <a
                    href={`http://localhost:5000/${doc.filePath}`}
                    download
                    className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No documents available.</p>
      )}
    </div>
  );
}
