import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Calendar, List, Upload, AlertCircle, CheckCircle } from "lucide-react";

export default function ClientPostCase() {
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    deadline: "",
  });
  const [files, setFiles] = useState([]); // State for file uploads
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files); // Store selected files
    // Show file names in the UI
    const fileInput = document.getElementById('file-names');
    if (fileInput) {
      let fileNames = '';
      for (let i = 0; i < e.target.files.length; i++) {
        fileNames += `${e.target.files[i].name}${i < e.target.files.length - 1 ? ', ' : ''}`;
      }
      fileInput.textContent = fileNames || 'No files selected';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("deadline", formData.deadline);

      // Append files to FormData using the key "case_files"
      for (let i = 0; i < files.length; i++) {
        formDataToSend.append("case_files", files[i]);
      }

      const response = await fetch("http://localhost:5000/api/cases", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      // Log the raw response to debug
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        // Try to parse the response as JSON, but handle if it’s not JSON
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Server returned non-JSON response: ${responseText}`);
        }
        throw new Error(errorData.message || "Failed to post case");
      }

      const data = JSON.parse(responseText);
      console.log("Case posted successfully:", data);
      
      // Show success message briefly before redirecting
      setSuccess(true);
      setTimeout(() => {
        navigate("/client/cases");
      }, 1500);
    } catch (err) {
      setError(err.message);
      console.error("Error posting case:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-inter bg-gradient-to-b from-background to-gray-50 text-foreground min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Post a New Case</h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Describe your legal needs to connect with qualified lawyers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        <div className="bg-card rounded-xl shadow-xl p-6 border border-border/50 hover:shadow-2xl transition-all duration-300">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>Case posted successfully! Redirecting to your cases...</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                {/* Description Field */}
                <div className="mb-6">
                  <label
                    htmlFor="description"
                    className="flex items-center text-base font-medium text-foreground mb-2"
                  >
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Case Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="10"
                    className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-card-foreground placeholder-muted-foreground transition-all duration-200"
                    placeholder="Provide a detailed description of your legal issue and what kind of assistance you need..."
                    required
                  ></textarea>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be specific about your situation to help lawyers understand how they can assist you.
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Category and Deadline Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="category"
                      className="flex items-center text-base font-medium text-foreground mb-2"
                    >
                      <List className="h-5 w-5 mr-2 text-primary" />
                      Legal Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-card-foreground appearance-none transition-all duration-200"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Business">Business Law</option>
                      <option value="Family">Family Law</option>
                      <option value="Criminal">Criminal Law</option>
                      <option value="Property">Property Law</option>
                      <option value="Labor">Labor Law</option>
                      <option value="Intellectual Property">IP Law</option>
                      <option value="Tax">Tax Law</option>
                      <option value="Immigration">Immigration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="deadline"
                      className="flex items-center text-base font-medium text-foreground mb-2"
                    >
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      Response Deadline
                    </label>
                    <input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-card-foreground transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* File Upload Field */}
                <div>
                  <label
                    htmlFor="documents"
                    className="flex items-center text-base font-medium text-foreground mb-2"
                  >
                    <Upload className="h-5 w-5 mr-2 text-primary" />
                    Supporting Documents
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-all duration-200">
                    <input
                      type="file"
                      id="documents"
                      name="documents"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="documents"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-base font-medium text-foreground mb-1">
                        Click to upload files
                      </span>
                      <span className="text-sm text-muted-foreground mb-2">
                        or drag and drop files here
                      </span>
                      <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        Browse Files
                      </span>
                    </label>
                    <p id="file-names" className="mt-2 text-sm text-muted-foreground truncate">
                      No files selected
                    </p>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                  <h3 className="text-sm font-semibold mb-2 text-foreground">Tips for Success</h3>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-medium mr-2 mt-0.5">1</span>
                      <p className="text-muted-foreground">Be specific about your legal issue and desired outcome</p>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-medium mr-2 mt-0.5">2</span>
                      <p className="text-muted-foreground">Include relevant dates and locations</p>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-medium mr-2 mt-0.5">3</span>
                      <p className="text-muted-foreground">Upload supporting documents to help explain your case</p>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-2">
                  <Link
                    to="/client/home"
                    className="border border-primary text-primary hover:bg-primary/10 font-medium py-2 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      </>
                    ) : (
                      "Submit Case"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
