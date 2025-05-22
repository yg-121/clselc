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
import LawyerAllCases from "./LawyerAllCases";

export default function LawyerHome({ userName }) {
  const [stats, setStats] = useState({
    activeCases: 0,
    upcomingAppointments: 0,
    unreadMessages: 0,
    pendingBids: 0,
    totalEarnings: 0,
    clientsHelped: 0,
  });
  const [availableCases, setAvailableCases] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [legalUpdates, setLegalUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch available cases
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

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
        console.log("Fetched cases:", casesData.cases);

        // Filter for posted cases and map to the required format
        const mappedCases = casesData.cases
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
          .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)); // Sort by lastUpdated (newest first)

        setAvailableCases(mappedCases);

        // Mock data for other sections (unchanged)
        setStats({
          activeCases: 5,
          upcomingAppointments: 3,
          unreadMessages: 7,
          pendingBids: 2,
          totalEarnings: 45000,
          clientsHelped: 24,
        });

        const mockAppointments = [
          {
            id: 1,
            client: "Abebe Bekele",
            date: "2025-03-20T10:00:00",
            status: "confirmed",
          },
          {
            id: 2,
            client: "Tigist Mengistu",
            date: "2025-03-22T14:30:00",
            status: "confirmed",
          },
          {
            id: 3,
            client: "Dawit Haile",
            date: "2025-03-25T11:00:00",
            status: "pending",
          },
        ];

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

        setUpcomingAppointments(mockAppointments);
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
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Cases */}
          <div className="lg:col-span-2">
            <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">
                  Available Cases
                </h2>
                <Link
                  to="/lawyer/all-cases"
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {availableCases.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {availableCases.map((caseItem) => (
                    <div key={caseItem.id} className="p-6 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start">
                            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {caseItem.category}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            Client: {caseItem.client}
                          </div>

                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {caseItem.description}
                          </p>

                          <div className="mt-2 text-xs text-gray-500">
                            Posted: {formatSimpleDate(caseItem.lastUpdated)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No available cases at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">
                  Upcoming Appointments
                </h2>
                <Link
                  to="/lawyer/appointments"
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
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
                            appointment.status === "confirmed"
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

              <div className="bg-gray-50 px-6 py-4">
                <Link
                  to="/lawyer/appointments/availability"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Set Availability
                </Link>
              </div>
            </div>

            {/* Professional Development */}
            <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
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
            <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
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
