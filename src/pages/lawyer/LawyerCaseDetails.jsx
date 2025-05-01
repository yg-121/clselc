import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  File,
  MessageSquare,
  Calendar,
  Plus,
  User,
  Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PostCaseDocument from "./PostedCaseDocument";

// Helper function to map status to color
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "posted":
      return "bg-yellow-400";
    case "assigned":
      return "bg-blue-500";
    case "closed":
      return "bg-primary";
    default:
      return "bg-gray-400";
  }
};


export default function LawyerCaseDetails() {
  const { id } = useParams();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(null);

  useEffect(() => {
    const fetchLawyerCaseDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const res = await fetch(`http://localhost:5000/api/cases/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch case details.");
        }

        const data = await res.json();
        setCaseItem(data.case);
      } catch (err) {
        console.error("Error fetching case details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyerCaseDetails();
  }, [id]);

 
  const toggleDocs = () => {
    setIsDocsOpen(!isDocsOpen);
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setBidError(null);
  setBidSuccess(null);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const res = await fetch("http://localhost:5000/api/bids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        case: id, // caseId from useParams
        amount: parseFloat(amount),
        comment,
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch {
        throw new Error(`Server error: ${text} (Status: ${res.status})`);
      }
      throw new Error(errorData.message || `HTTP error ${res.status}`);
    }

    const data = JSON.parse(text);
    setBidSuccess("Bid submitted successfully!");
    setAmount("");
    setComment("");
  } catch (err) {
    console.error("Error submitting bid:", err);
    setBidError(err.message);
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-700 text-center mt-4">{error}</div>;
  }

  if (!caseItem) {
    return <div className="text-center mt-4">Case not found.</div>;
  }

  return (
    <div className="font-inter bg-background text-foreground p-6 max-w-3xl mx-auto">
      {/* Case Overview and Client Information */}
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{caseItem.category}</h1>
              <span
                className={`px-4 py-1.5 text-sm text-white rounded-full ${getStatusColor(
                  caseItem.status
                )}`}
              >
                {caseItem.status}
              </span>
            </div>
            <p className="text-muted-foreground mb-2 italic">
              {caseItem.description}
            </p>
            <div className="flex space-x-4 mb-4 text-sm text-gray-500">
              <p>
                <span className="font-medium">Deadline:</span> (
                <>{new Date(caseItem.deadline).toLocaleDateString()}</>)
              </p>
              <p>
                <span className="font-medium">Created:</span>{" "}
                {new Date(caseItem.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(caseItem.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <User className="mr-2 h-4 w-4" />
              <p className="text-sm text-gray-500">
                {caseItem.client.username}
              </p>
            </h2>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <p className="text-sm text-gray-500 mb-4">
                Email: {caseItem.client.email}
              </p>
            </h2>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:scale-101 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <File className="mr-2 h-5 w-5" /> Documents
              </h2>
              <button
                onClick={toggleDocs}
                className="flex items-center text-gray-700 hover:text-primary"
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
                <PostCaseDocument documents={caseItem.documents} caseId={id} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h1 className="text-xl font-semibold flex items-center">Make A Bid</h1>
        <div className="mt-6">
          {/* <h2 className="text-xl font-semibold mb-4">Submit a Bid</h2> */}
          {caseItem.status?.toLowerCase() === "posted" && (
            <div className="mt-6">
              <form
                onSubmit={handleSubmit}
                className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 space-y-6"
              >
                <div className="flex flex-col space-y-3">
                  <label
                    htmlFor="amount"
                    className="text-sm font-semibold text-gray-700 tracking-wide"
                  >
                    Amount (ETB):
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-400"
                    placeholder="Enter your bid amount"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex flex-col space-y-3">
                  <label
                    htmlFor="comment"
                    className="text-sm font-semibold text-gray-700 tracking-wide"
                  >
                    Comment:
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-400 resize-none"
                    placeholder="Enter your comment (optional)"
                    rows="4"
                  />
                </div>
                {bidError && (
                  <p className="text-red-500 text-sm text-center">{bidError}</p>
                )}
                {bidSuccess && (
                  <p className="text-green-500 text-sm text-center">
                    {bidSuccess}
                  </p>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
                >
                  Submit Bid
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



<div className="mt-6">
  <h2 className="text-xl font-semibold mb-4">Submit a Bid</h2>
  <form className="flex flex-col space-y-4">
    <div className="flex flex-col space-y-2">
      <label htmlFor="amount" className="text-sm font-medium text-gray-700">
        Amount (ETB):
      </label>
      <input
        type="number"
        id="amount"
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 bg-white transition-all duration-300"
        placeholder="Enter your bid amount"
        required
        min="0"
        step="0.01"
      />
    </div>
    <div className="flex flex-col space-y-2">
      <label htmlFor="comment" className="text-sm font-medium text-gray-700">
        Comment:
      </label>
      <textarea
        id="comment"
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 bg-white transition-all duration-300"
        placeholder="Enter your comment (optional)"
        rows="3"
      />
    </div>
    <button
      type="submit"
      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
    >
      Submit
    </button>
  </form>
</div>;