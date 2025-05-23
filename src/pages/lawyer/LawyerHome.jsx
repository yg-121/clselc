import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  MessageSquare,
  FileText,
  DollarSign,
  ArrowRight,
  Clock,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import LawyerAllCases from "./LawyerAllCases.jsx";

export default function LawyerHome({ userName }) {
  const [stats, setStats] = useState({
    activeCases: 0,
    upcomingAppointments: 0,
    unreadMessages: 0,
    pendingBids: 0,
    casesOnHand: 0,
    totalEarnings: 0,
    clientsHelped: 0,
  });
  const [availableCases, setAvailableCases] = useState([]);
  const [inProgressCases, setInProgressCases] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [legalUpdates, setLegalUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Helper function to map backend status to frontend status (from LawyerCase.jsx)
  const mapStatus = (backendStatus) => {
    switch (backendStatus?.toLowerCase()) {
      case "posted":
        return "started";
      case "assigned":
        return "on progress";
      case "closed":
        return "completed";
      default:
        return "started"; // Default to "started" for unknown statuses
    }
  };

  // Decode token to get userId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      window.location.href = "/login";
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (!decoded.id) {
        throw new Error("User ID not found in token.");
      }
      console.log("Decoded userId:", decoded.id); // Debug: Log userId
      setUserId(decoded.id);
    } catch (err) {
      console.error("Error decoding token:", err);
      setError("Failed to authenticate. Please log in again.");
      setLoading(false);
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  // Fetch data when userId is set
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        // Fetch cases
        const casesResponse = await fetch("http://localhost:5000/api/cases", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!casesResponse.ok) {
          const errorData = await casesResponse.json();
          if (casesResponse.status === 401 || casesResponse.status === 403) {
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(errorData.message || "Failed to fetch cases.");
        }

        const casesData = await casesResponse.json();
        console.log("Fetched cases:", casesData.cases); // Debug: Log all cases
        console.log(
          "Cases with assigned_lawyer._id:",
          casesData.cases.map((c) => ({
            id: c._id,
            assigned_lawyer: c.assigned_lawyer?._id,
            status: c.status,
          }))
        ); // Debug: Log assigned_lawyer and status

        // Validate cases data
        if (!Array.isArray(casesData.cases)) {
          throw new Error("Invalid response: cases is not an array.");
        }

        // Filter and map available cases (posted)
        const mappedAvailableCases = casesData.cases
          .filter((caseItem) => caseItem.status?.toLowerCase() === "posted")
          .map((caseItem) => ({
            id: caseItem._id || "unknown-id",
            title: caseItem.description || "Untitled Case",
            client: caseItem.client?.username || "Unknown Client",
            status: caseItem.status || "posted",
            lastUpdated: caseItem.createdAt || new Date().toISOString(),
            category: caseItem.category || "Other",
            description: caseItem.description || "No description available.",
          }))
          .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

        setAvailableCases(mappedAvailableCases);

        // Filter and map in-progress cases (assigned to this lawyer)
        const mappedInProgressCases = casesData.cases
          .filter(
            (caseItem) =>
              caseItem.assigned_lawyer?._id === userId &&
              mapStatus(caseItem.status) === "on progress"
          )
          .map((caseItem) => ({
            id: caseItem._id || "unknown-id",
            category: caseItem.category || "Other",
            client: caseItem.client?.username || "Unknown Client",
            description:
              caseItem.notes && caseItem.notes.length > 0
                ? caseItem.notes[0].content
                : caseItem.description || "No description available.",
            deadline: caseItem.deadline || "No deadline",
          }))
          .sort((a, b) => new Date(b.deadline) - new Date(a.deadline));

        console.log("Mapped in-progress cases:", mappedInProgressCases); // Debug: Log filtered cases
        setInProgressCases(mappedInProgressCases);

        // Fetch appointments
        const appointmentsResponse = await fetch(
          "http://localhost:5000/api/appointments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!appointmentsResponse.ok) {
          const errorData = await appointmentsResponse.json();
          if (
            appointmentsResponse.status === 401 ||
            appointmentsResponse.status === 403
          ) {
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(errorData.message || "Failed to fetch appointments.");
        }

        const appointmentsData = await appointmentsResponse.json();
        console.log("Fetched appointments:", appointmentsData.appointments);

        // Map and filter appointments
        const mappedAppointments = appointmentsData.appointments
          .filter((appointment) =>
            ["Pending", "Confirmed"].includes(appointment.status)
          )
          .map((appointment) => ({
            id: appointment._id || "unknown-id",
            client: appointment.client?.username || "Unknown Client",
            date: appointment.date || new Date().toISOString(),
            status: appointment.status || "Pending",
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setUpcomingAppointments(mappedAppointments);

        // Fetch bids
        let pendingBidsCount = 2; // Fallback mock value
        try {
          const bidsResponse = await fetch(
            "http://localhost:5000/api/bids/my-bids",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!bidsResponse.ok) {
            const errorData = await bidsResponse.json();
            console.error("Failed to fetch bids:", errorData.message);
          } else {
            const bidsData = await bidsResponse.json();
            console.log("Fetched bids:", bidsData.bids);

            if (!Array.isArray(bidsData.bids)) {
              console.error("Invalid bids response: not an array");
            } else {
              pendingBidsCount = bidsData.bids.filter(
                (bid) => bid.status?.toLowerCase() === "pending"
              ).length;
            }
          }
        } catch (err) {
          console.error("Error fetching bids:", err.message);
        }

        // Update stats
        setStats({
          activeCases: mappedAvailableCases.length,
          upcomingAppointments: mappedAppointments.length,
          unreadMessages: 7, // Mock data
          pendingBids: pendingBidsCount,
          casesOnHand: mappedInProgressCases.length,
          totalEarnings: 45000, // Mock data
          clientsHelped: 24, // Mock data
        });

        // Mock legal updates
        const mockLegalUpdates = [
          {
            id: 1,
            title: "New Business Registration Regulations in Ethiopia",
            excerpt:
              "Recent changes to business registration procedures and requirements that all lawyers should be aware of.",
            author: "Ethiopian Legal Review",
            date: "2025-03-15",
            category: "Business Law",
            imageUrl: "/placeholder.svg?height=200&width=300",
            readTime: "8 min read",
          },
          {
            id: 2,
            title: "Updates to Ethiopian Labor Law: What Lawyers Need to Know",
            excerpt:
              "Recent amendments to labor regulations affecting employment contracts, working hours, and employee benefits.",
            author: "Ethiopian Bar Association",
            date: "2025-03-10",
            category: "Labor Law",
            imageUrl: "/placeholder.svg?height=200&width=300",
            readTime: "10 min read",
          },
          {
            id: 3,
            title:
              "Ethiopian Intellectual Property Office: New Filing Procedures",
            excerpt:
              "Changes to trademark and patent filing procedures that will affect how IP lawyers submit applications.",
            author: "IP Law Journal",
            date: "2025-03-05",
            category: "Intellectual Property",
            imageUrl: "/placeholder.svg?height=200&width=300",
            readTime: "6 min read",
          },
        ];

        setLegalUpdates(mockLegalUpdates);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        if (err.message.includes("log in")) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatSimpleDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
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
        {error.includes("token") && (
          <p className="mt-2">
            <Link to="/login" className="text-blue-500 hover:underline">
              Click here to log in
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="font-inter bg-background text-foreground min-h-screen">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="md:flex md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back</h1>
              <p className="mt-2 text-gray-100">
                Here's an overview of your cases, appointments, and available
                opportunities.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                to="/lawyer/lawyerCase"
                className="inline-flex items-center px-4 py-2 border border-white rounded-lg text-sm font-medium text-white hover:bg-primary/90"
              >
                Here are cases on your hand
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-101 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Briefcase className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm text-gray-500">Posted Cases</p>
              <h3 className="text-xl font-semibold text-foreground">
                {stats.activeCases}
              </h3>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-101 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-500">Appointments</p>
              <h3 className="text-xl font-semibold text-foreground">
                {stats.upcomingAppointments}
              </h3>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-101 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-yellow-100 p-3 mb-4">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-500">Messages</p>
              <h3 className="text-xl font-semibold text-foreground">
                {stats.unreadMessages}
              </h3>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-101 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-purple-100 p-3 mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-500">Pending Bids</p>
              <h3 className="text-xl font-semibold text-foreground">
                {stats.pendingBids}
              </h3>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-101 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-indigo-100 p-3 mb-4">
                <Briefcase className="h-6 w-6 text-indigo-600" />
              </div>
              <p className="text-sm text-gray-500">Cases On Progress</p>
              <h3 className="text-xl font-semibold text-foreground">
                {stats.casesOnHand}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Cases and Cases On Hand */}
          <div className="lg:col-span-2">
            {/* New Cases */}
            <div className="rotating-border bg-background hover:bg-blue-100 transition duration-300 ease-in-out ">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">
                  New Cases
                </h2>
                <Link
                  to="/lawyer/all-cases"
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {availableCases.length > 0 ? (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableCases.slice(0, 4).map((caseItem) => (
                    <Link
                      key={caseItem.id}
                      to="/lawyer/all-cases"
                      className="block"
                    >
                      <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-200">
                        <div className="flex items-start mb-2">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {caseItem.category}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {caseItem.client}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {caseItem.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Posted: {formatSimpleDate(caseItem.lastUpdated)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No available cases at the moment.</p>
                </div>
              )}
            </div>

            {/* Cases On Progress */}
            <div className="rotating-border bg-muted hover:bg-purple-100 transition duration-300 ease-in-out">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">
                  Cases On Progress
                </h2>
                <Link
                  to="/lawyer/lawyerCase"
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {inProgressCases.length > 0 ? (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inProgressCases.slice(0, 4).map((caseItem) => (
                    <Link
                      key={caseItem.id}
                      to={`/lawyer/lawyerCase/${caseItem.id}`}
                      className="block"
                    >
                      <div className="bg-gray-50 rounded-lg shadow-sm p-6 relative hover:shadow-md hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-200">
                        <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                          On Progress
                        </span>
                        <div className="flex items-start mb-2">
                          {/* <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground"> */}
                          <p>
                            {" "}
                            <strong>{caseItem.category}</strong>
                          </p>
                          {/* </span> */}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {caseItem.client}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {caseItem.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Deadline: {formatDate(caseItem.deadline)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No cases on hand at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 ">
            {/* Upcoming Appointments */}
            <div className="rotating-border bg-background hover:bg-yellow-100 transition duration-300 ease-in-out">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">
                  Upcoming Appointments
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {appointment.client}
                          </h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {formatDate(appointment.date)}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No upcoming appointments</p>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Development */}
            <div className="rotating-border bg-muted hover:bg-orange-100 transition duration-300 ease-in-out py-6">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-foreground">
                  Professional Development
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-medium text-foreground">
                      Ethiopian Bar Association
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Stay current with Ethiopian legal requirements and earn
                    continuing education credits.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-medium text-foreground">
                      Improve Your Profile
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Complete your profile to attract more clients and increase
                    your visibility.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Profile Completion: 75%
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rotating-border bg-background hover:bg-blue-100 transition duration-300 ease-in-out">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-foreground">
                  Quick Actions
                </h2>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/lawyer/messages"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-all duration-300"
                  >
                    <MessageSquare className="h-6 w-6 text-blue-500 mb-2" />
                    <span className="text-sm text-foreground">Messages</span>
                  </Link>

                  <Link
                    to="/lawyer/all-cases"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-all duration-300"
                  >
                    <Briefcase className="h-6 w-6 text-blue-500 mb-2" />
                    <span className="text-sm text-foreground">
                      Posted Cases
                    </span>
                  </Link>

                  <Link
                    to="/lawyer/lawyerCase"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-all duration-300"
                  >
                    <FileText className="h-6 w-6 text-blue-500 mb-2" />
                    <span className="text-sm text-foreground">
                      Cases On Hand
                    </span>
                  </Link>

                  <Link
                    to="/lawyer/my-bids"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-all duration-300"
                  >
                    <DollarSign className="h-6 w-6 text-blue-500 mb-2" />
                    <span className="text-sm text-foreground">Bids</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
