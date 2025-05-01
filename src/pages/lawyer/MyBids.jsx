import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Clock, FileText, Filter, Calendar, CheckCircle, XCircle, ChevronRight } from "lucide-react";

export default function MyBids({ userName }) {
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For demo purposes, we'll use mock data
    setTimeout(() => {
      const mockBids = [
        {
          id: 1,
          caseId: 201,
          caseTitle: "Corporate Merger Review",
          clientName: "ABC Corp",
          amount: 4500,
          submittedDate: "2025-03-16",
          expiryDate: "2025-03-23",
          status: "pending",
          notes: "Offered comprehensive legal review of merger documents with expertise in corporate law.",
          category: "Business Law",
        },
        {
          id: 2,
          caseId: 202,
          caseTitle: "Patent Application for New Technology",
          clientName: "Tech Innovations",
          amount: 3200,
          submittedDate: "2025-03-14",
          expiryDate: "2025-03-21",
          status: "accepted",
          notes: "Proposed expedited patent filing process with specialized knowledge in software patents.",
          category: "Intellectual Property",
        },
        {
          id: 3,
          caseId: 203,
          caseTitle: "Real Estate Transaction Review",
          clientName: "Property Holdings LLC",
          amount: 2000,
          submittedDate: "2025-03-12",
          expiryDate: "2025-03-19",
          status: "rejected",
          notes: "Offered comprehensive review of commercial property transaction documents.",
          category: "Property Law",
        },
        {
          id: 4,
          caseId: 204,
          caseTitle: "Employment Contract Dispute",
          clientName: "John Smith",
          amount: 2800,
          submittedDate: "2025-03-10",
          expiryDate: "2025-03-17",
          status: "pending",
          notes: "Proposed representation in non-compete clause dispute with expertise in employment law.",
          category: "Labor Law",
        },
        {
          id: 5,
          caseId: 205,
          caseTitle: "Trademark Infringement Case",
          clientName: "Fashion Brand Inc",
          amount: 3800,
          submittedDate: "2025-03-08",
          expiryDate: "2025-03-15",
          status: "pending",
          notes: "Offered representation in trademark infringement case with specialized experience.",
          category: "Intellectual Property",
        },
      ];

      setBids(mockBids);
      setFilteredBids(mockBids);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter bids based on selected status
    if (selectedStatus === "all") {
      setFilteredBids(bids);
    } else {
      const filtered = bids.filter((bid) => bid.status === selectedStatus);
      setFilteredBids(filtered);
    }
  }, [selectedStatus, bids]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold">My Bids</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold text-foreground">
              {filteredBids.length} {selectedStatus === "all" ? "Total" : selectedStatus} Bids
            </h2>
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="all">All Bids</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Bids List */}
        {filteredBids.length > 0 ? (
          <div className="bg-card text-card-foreground shadow-md rounded-lg overflow-hidden hover:shadow-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <ul className="divide-y divide-gray-200">
              {filteredBids.map((bid) => (
                <li key={bid.id} className="hover:bg-gray-50">
                  <Link to={`/lawyer/bids/${bid.id}`} className="block">
                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <DollarSign className="h-6 w-6 text-blue-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-foreground">{bid.caseTitle}</h3>
                              <span
                                className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}
                              >
                                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="flex items-center">
                                <FileText className="mr-1 h-4 w-4 text-gray-400" />
                                Client: {bid.clientName}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <DollarSign className="mr-1 h-4 w-4 text-gray-400" />
                              Bid Amount: {formatCurrency(bid.amount)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                            {bid.category}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="mr-1 h-4 w-4 text-gray-400" />
                            Submitted: {formatDate(bid.submittedDate)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                            Expires: {formatDate(bid.expiryDate)}
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                        </div>
                      </div>
                      <div className="mt-2 ml-16">
                        <p className="text-sm text-gray-600 line-clamp-2">{bid.notes}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-8 text-center hover:shadow-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No bids found</h3>
            <p className="text-gray-500 mb-4">
              {selectedStatus === "all"
                ? "You haven't submitted any bids yet."
                : `You don't have any ${selectedStatus} bids.`}
            </p>
            {selectedStatus !== "all" ? (
              <button
                onClick={() => setSelectedStatus("all")}
                className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                View All Bids
              </button>
            ) : null}
            <Link
              to="/lawyer/cases/available"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
            >
              Browse Available Cases
            </Link>
          </div>
        )}

        {/* Bid Status Guide */}
        <div className="mt-8 bg-card text-card-foreground rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4">Bid Status Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <p className="font-medium text-foreground">Pending</p>
                <p className="text-sm text-gray-500">Client is reviewing your bid</p>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="font-medium text-foreground">Accepted</p>
                <p className="text-sm text-gray-500">Client has accepted your bid</p>
              </div>
            </div>
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="font-medium text-foreground">Rejected</p>
                <p className="text-sm text-gray-500">Client has rejected your bid</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}