import { useState, useRef } from "react";
import { FileText, ChevronUp, ChevronDown, Download, Eye, Plus, Upload, File, X, AlertCircle, CheckCircle, Trash } from "lucide-react";
import CaseDocument from "../../pages/client/CaseDocument";

const DocumentsTab = ({ caseDetail, isDocsOpen, toggleDocs, refreshCaseDetails, setActiveTab }) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    visibility: "Both",
    category: "Evidence"
  });
  const fileInputRef = useRef(null);
  
  // Add states for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUploadFormChange = (e) => {
    const { name, value } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: value
    });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setUploadError("Please select at least one file to upload");
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const formData = new FormData();
      
      // Append each file to the FormData
      for (let i = 0; i < files.length; i++) {
        formData.append("case_files", files[i]);
      }
      
      // Append other form data
      formData.append("visibility", uploadForm.visibility);
      formData.append("category", uploadForm.category);

      const response = await fetch(`http://localhost:5000/api/cases/${caseDetail._id}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload documents");
      }

      const data = await response.json();
      setUploadSuccess(data.message || "Documents uploaded successfully");
      
      // Reset form
      setFiles([]);
      setUploadForm({
        visibility: "Both",
        category: "Evidence"
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Refresh case details to show new documents
      await refreshCaseDetails();
      
      // Close modal after a delay
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccess(null);
      }, 2000);
      
    } catch (error) {
      console.error("Error uploading documents:", error);
      setUploadError(error.message);
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Handle opening delete confirmation modal
  const handleDeleteClick = (docId) => {
    setDocumentToDelete(docId);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };
  
  // Handle document deletion
  const handleDeleteDocument = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      
      const res = await fetch(
        `http://localhost:5000/api/cases/${caseDetail._id}/documents/${documentToDelete}`,
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
      
      // Refresh case details
      await refreshCaseDetails();
      
      // Close modal
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
      
    } catch (err) {
      console.error("Error deleting document:", err);
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center text-foreground">
          <FileText className="mr-2 h-5 w-5 text-primary" /> Case Documents
        </h2>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg shadow-sm hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
        >
          <Upload className="h-4 w-4 " />
        </button>
      </div>

      {/* Documents */}
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
       
        {caseDetail.documents && caseDetail.documents.length > 0 ? (
          <div className="space-y-4">
            {caseDetail.documents.map((doc) => (
              <div 
                key={doc._id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{doc.fileName}</p>
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
          <p className="text-muted-foreground text-center py-4">No documents available for this case.</p>
        )}
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <h3 className="font-medium text-foreground mb-1">Evidence</h3>
          <p className="text-sm text-muted-foreground">
            {caseDetail.documents?.filter((doc) => doc.category === "Evidence")
              .length || 0}{" "}
            documents
          </p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-4 border-l-4 border-amber-500">
          <h3 className="font-medium text-foreground mb-1">Forms</h3>
          <p className="text-sm text-muted-foreground">
            {caseDetail.documents?.filter((doc) => doc.category === "Form")
              .length || 0}{" "}
            documents
          </p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <h3 className="font-medium text-foreground mb-1">Correspondence</h3>
          <p className="text-sm text-muted-foreground">
            {caseDetail.documents?.filter(
              (doc) => doc.category === "Correspondence"
            ).length || 0}{" "}
            documents
          </p>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-primary" /> Upload Documents
            </h2>

            <form onSubmit={handleUploadSubmit}>
              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-all duration-200">
                  <input
                    type="file"
                    id="documents"
                    name="documents"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <label
                    htmlFor="documents"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-base font-medium text-gray-700 mb-1">
                      Click to upload files
                    </span>
                    <span className="text-sm text-gray-500 mb-2">
                      PDF, DOCX, JPG, PNG (max 10MB)
                    </span>
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">
                      Selected files:
                    </p>
                    <ul className="text-sm text-gray-600 mt-1">
                      {files.map((file, index) => (
                        <li key={index} className="truncate">
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Document Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={uploadForm.category}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Evidence">Evidence</option>
                  <option value="Form">Form</option>
                  <option value="Correspondence">Correspondence</option>
                </select>
              </div>

              {/* Document Visibility */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={uploadForm.visibility}
                  onChange={handleUploadFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Both">Both Client & Lawyer</option>
                  <option value="Client">Client Only</option>
                  <option value="Lawyer">Lawyer Only</option>
                </select>
              </div>

              {/* Error and Success Messages */}
              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={uploadLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled={uploadLoading}
                >
                  {uploadLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> Confirm Deletion
            </h2>
            
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDocument}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md hover:from-red-700 hover:to-red-800 hover:scale-105 transition-all duration-300"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </span>
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
};

export default DocumentsTab;
