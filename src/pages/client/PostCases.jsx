import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ClientPostCase() {
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    deadline: "",
  });
  const [files, setFiles] = useState([]); // State for file uploads
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files); // Store selected files
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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

      // Navigate to My Cases page after successful post
      navigate("/client/cases");
    } catch (err) {
      setError(err.message);
      console.error("Error posting case:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-inter bg-background text-foreground">
      {/* Post a Case Section */}
      <div className="rotating-border bg-background hover:bg-blue-100 transition duration-300 ease-in-out py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground">Post a Case</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Describe your legal needs and connect with lawyers who can help
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Case Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-card text-card-foreground placeholder-muted-foreground"
                  placeholder="Provide a detailed description of your legal needs"
                  required
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-card text-card-foreground"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Business">Business Law</option>
                  <option value="Family">Family Law</option>
                  <option value="Criminal">Criminal Law</option>
                  <option value="Property">Property Law</option>
                  <option value="Labor">Labor Law</option>
                  <option value="Intellectual Property">
                    Intellectual Property
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-card text-card-foreground"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="documents"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Upload Documents (Optional)
                </label>
                <input
                  type="file"
                  id="documents"
                  name="documents"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-card text-card-foreground"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  You can upload multiple files (PDF, images, etc.)
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-md transition duration-200"
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Post Case"}
                </button>
                <Link
                  to="/client/home"
                  className="border border-primary text-primary hover:bg-primary/10 hover:underline font-medium py-3 px-6 rounded-md transition duration-200"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
