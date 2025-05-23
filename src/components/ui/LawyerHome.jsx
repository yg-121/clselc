"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Skeleton } from "../../../components/ui/skeleton.jsx";
import { Progress } from "../../../components/ui/progress.jsx";
import { Separator } from "../../components/ui/separator.jsx";

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
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            {error.includes("token") && (
              <Button asChild className="mt-4 w-full">
                <Link to="/login">Log in</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container px-4 py-8 md:py-12">
          <div className="md:flex md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back</h1>
              <p className="mt-2 text-teal-50">
                Here's an overview of your cases, appointments, and available
                opportunities.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-4 md:mt-0 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <Link to="/lawyer/lawyerCase">View cases on your hand</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container px-4 -mt-6 md:-mt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="bg-card shadow-lg border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-teal-100 p-3 mb-3">
                  <Briefcase className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-sm text-muted-foreground">Posted Cases</p>
                <h3 className="text-xl font-semibold mt-1">
                  {stats.activeCases}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 mb-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">Appointments</p>
                <h3 className="text-xl font-semibold mt-1">
                  {stats.upcomingAppointments}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-amber-100 p-3 mb-3">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <h3 className="text-xl font-semibold mt-1">
                  {stats.unreadMessages}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 mb-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground">Pending Bids</p>
                <h3 className="text-xl font-semibold mt-1">
                  {stats.pendingBids}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-lg border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-teal-100 p-3 mb-3">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Cases In Progress
                </p>
                <h3 className="text-xl font-semibold mt-1">
                  {stats.casesOnHand}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Cases and Cases On Hand */}
          <div className="lg:col-span-2 space-y-8">
            {/* New Cases */}
            <Card className="shadow-md border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle>New Cases</CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                >
                  <Link to="/lawyer/all-cases" className="flex items-center">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {availableCases.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableCases.slice(0, 4).map((caseItem) => (
                      <Link
                        key={caseItem.id}
                        to="/lawyer/all-cases"
                        className="block"
                      >
                        <Card className="h-full hover:shadow-md transition-all border-0 bg-card/50 hover:bg-card">
                          <CardContent className="p-4">
                            <div className="flex items-start mb-2">
                              <Badge
                                variant="secondary"
                                className="bg-teal-100 text-teal-800 hover:bg-teal-200"
                              >
                                {caseItem.category}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground" />
                              {caseItem.client}
                            </div>
                            <p className="text-sm line-clamp-2 mb-2">
                              {caseItem.description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              Posted: {formatSimpleDate(caseItem.lastUpdated)}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No available cases at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cases On Hand */}
            <Card className="shadow-md border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle>Cases In Progress</CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                >
                  <Link to="/lawyer/lawyerCase" className="flex items-center">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {inProgressCases.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {inProgressCases.slice(0, 4).map((caseItem) => (
                      <Link
                        key={caseItem.id}
                        to={`/lawyer/lawyerCase/${caseItem.id}`}
                        className="block"
                      >
                        <Card className="h-full hover:shadow-md transition-all border-0 bg-card/50 hover:bg-card">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2 mb-2 flex-wrap">
                              <Badge
                                variant="secondary"
                                className="bg-teal-100 text-teal-800 hover:bg-teal-200"
                              >
                                {caseItem.category}
                              </Badge>
                              <Badge className="bg-teal-600 hover:bg-teal-700">
                                In Progress
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground" />
                              {caseItem.client}
                            </div>
                            <p className="text-sm line-clamp-2 mb-2">
                              {caseItem.description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              Deadline: {formatDate(caseItem.deadline)}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No cases in progress at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <Card className="shadow-md border-0">
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-1">
                    {upcomingAppointments.map((appointment, index) => (
                      <div key={appointment.id}>
                        {index > 0 && <Separator className="my-2" />}
                        <div className="py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                {appointment.client}
                              </h3>
                              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground" />
                                {formatDate(appointment.date)}
                              </div>
                            </div>
                            <Badge
                              variant={
                                appointment.status === "Confirmed"
                                  ? "success"
                                  : "outline"
                              }
                              className={
                                appointment.status === "Confirmed"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No upcoming appointments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Development */}
            <Card className="shadow-md border-0">
              <CardHeader className="pb-2">
                <CardTitle>Professional Development</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-teal-600 mr-2" />
                    <h3 className="font-medium">Ethiopian Bar Association</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stay current with Ethiopian legal requirements and earn
                    continuing education credits.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-teal-600 mr-2" />
                    <h3 className="font-medium">Improve Your Profile</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete your profile to attract more clients and increase
                    your visibility.
                  </p>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Profile Completion: 75%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-md border-0">
              <CardHeader className="pb-2">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"
                  >
                    <Link to="/lawyer/messages">
                      <MessageSquare className="h-5 w-5 mb-1" />
                      <span className="text-sm">Messages</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"
                  >
                    <Link to="/lawyer/all-cases">
                      <Briefcase className="h-5 w-5 mb-1" />
                      <span className="text-sm">Posted Cases</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"
                  >
                    <Link to="/lawyer/lawyerCase">
                      <FileText className="h-5 w-5 mb-1" />
                      <span className="text-sm">Cases On Hand</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"
                  >
                    <Link to="/lawyer/my-bids">
                      <DollarSign className="h-5 w-5 mb-1" />
                      <span className="text-sm">Bids</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
