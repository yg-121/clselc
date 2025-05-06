"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Pie, Bar, Line } from "react-chartjs-2"
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
} from "chart.js"
import { Clock, Users, UserCheck, Briefcase, FileText, Calendar, AlertTriangle } from "react-feather"
import api from "../../utils/api"
import ChartCard from "../../components/admin/ChartCard"
import ErrorAlert from "../../components/admin/ErrorAlert"
import { formatDate, formatDateTime } from "../../utils/formatters"
import { Link } from "react-router-dom"

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
)

const Dashboard = () => {
  const [error, setError] = useState("")
  const queryClient = useQueryClient()
  const [mockAppointments, setMockAppointments] = useState([]);

  // Add this helper function at the top of your component
  const safeFormatDateTime = (dateTime) => {
    try {
      if (!dateTime) return "No date available";
      
      // Try to format using the formatDateTime function
      return formatDateTime(dateTime);
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", dateTime);
      
      // Return a fallback format
      try {
        if (dateTime) {
          const date = new Date(dateTime);
          if (isNaN(date.getTime())) {
            return "Invalid date";
          }
          return date.toLocaleString();
        }
      } catch (e) {
        console.error("Fallback date formatting failed:", e);
      }
      
      return "Invalid date";
    }
  };

  // Add this function to check if the API endpoint is working
  useEffect(() => {
    const checkApiEndpoint = async () => {
      try {
        console.log("Testing admin stats endpoint...")
        const token = localStorage.getItem("token")
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        
        // Try different route combinations
        const routes = [
          "/notifications/admin/stats",
        ]
        
        for (const route of routes) {
          console.log(`Testing route: ${apiUrl}${route}`)
          try {
            const response = await fetch(`${apiUrl}${route}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            })
            
            console.log(`Route ${route} status:`, response.status)
            
            if (response.ok) {
              const data = await response.json()
              console.log(`Route ${route} data:`, data)
              console.log("Found working route!")
              break
            } else {
              const errorText = await response.text()
              console.error(`Route ${route} error:`, errorText)
            }
          } catch (routeError) {
            console.error(`Route ${route} fetch error:`, routeError)
          }
        }
      } catch (error) {
        console.error("Direct fetch error:", error)
      }
    }
    
    checkApiEndpoint()
  }, [])

  // Fetch dashboard data - Fix the route to match backend
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      try {
        console.log("Fetching dashboard stats...")
        
        // The correct route that matches your backend
        // Your api client already includes the '/api' prefix
        const response = await api.get("/notifications/admin/stats")
        console.log("Dashboard stats response:", response.data)
        
        // Return empty object if data is null or undefined
        return response.data || { 
          totalUsers: 0, 
          pendingLawyers: 0, 
          totalCases: 0 
        }
      } catch (error) {
        console.error("Dashboard stats error:", error)
        console.error("Error details:", error.response?.data || error.message)
        setError("Failed to load dashboard data: " + (error.response?.data?.message || error.message))
        
        // Return default data as a last resort
        return { 
          totalUsers: 0, 
          pendingLawyers: 0, 
          totalCases: 0 
        }
      }
    },
    retry: 1,
    retryDelay: 1000,
  })

  // Fetch case analytics - Fix the endpoint and data structure
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['caseAnalytics'],
    queryFn: async () => {
      try {
        const response = await api.get("/cases/analytics")
        console.log("Analytics response:", response.data)
        
        // Extract the analytics data
        const data = response.data.analytics || response.data;
        
        // Transform the byCategory object into an array format for the chart
        const byCategory = data.byCategory ? 
          Object.entries(data.byCategory).map(([category, count]) => ({ 
            category, 
            count 
          })) : [];
        
        // Transform the byStatus object into an array format for the chart
        const byStatus = data.byStatus ? 
          Object.entries(data.byStatus).map(([status, count]) => ({ 
            status, 
            count 
          })) : [];
        
        console.log("Transformed category data:", byCategory);
        console.log("Transformed status data:", byStatus);
        
        return {
          byCategory,
          byStatus
        };
      } catch (error) {
        setError("Failed to load analytics: " + (error.response?.data?.message || error.message))
        throw error
      }
    },
  })

  // Fetch recent audit logs
  const { data: auditLogs, isLoading: isLoadingAudit } = useQuery({
    queryKey: ['recentAuditLogs'],
    queryFn: async () => {
      try {
        const response = await api.get("/audit?limit=5")
        return response.data
      } catch (error) {
        setError("Failed to load audit logs: " + (error.response?.data?.message || error.message))
        throw error
      }
    },
  })

  // Fetch upcoming appointments - Fix the endpoint and data structure
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['upcomingAppointments'],
    queryFn: async () => {
      try {
        // Use the correct endpoint without duplicating /api
        const response = await api.get("/appointments?limit=5");
        console.log("Appointments response:", response.data);
        
        // Handle different response structures
        let appointmentsData = [];
        
        if (Array.isArray(response.data)) {
          console.log("Response data is an array");
          appointmentsData = response.data;
        } else if (response.data && Array.isArray(response.data.appointments)) {
          console.log("Response data has appointments array");
          appointmentsData = response.data.appointments;
        } else if (response.data && response.data.message === "Appointments fetched" && Array.isArray(response.data.appointments)) {
          console.log("Response data has message and appointments array");
          appointmentsData = response.data.appointments;
        } else {
          console.warn("Unexpected appointments data format:", response.data);
          return [];
        }
        
        console.log("Processed appointments data:", appointmentsData);
        
        // Transform the data to match the expected format
        return appointmentsData.map(appointment => {
          console.log("Processing appointment:", appointment);
          return {
            _id: appointment._id || `temp-${Math.random()}`,
            clientName: appointment.client?.username || 
                       (typeof appointment.client === 'string' ? appointment.client : 'Unknown Client'),
            lawyerName: appointment.lawyer?.username || 
                       (typeof appointment.lawyer === 'string' ? appointment.lawyer : 'Unknown Lawyer'),
            dateTime: appointment.date || appointment.dateTime || new Date().toISOString(),
            status: appointment.status || 'Scheduled',
            type: appointment.type || 'Consultation'
          };
        });
      } catch (error) {
        console.error("Appointment fetch error:", error);
        console.error("Error details:", error.response?.data || error.message);
        return []; // Return empty array instead of throwing
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
  })

  // If no appointments are returned, use mock data for testing
  useEffect(() => {
    if (appointments && appointments.length === 0 && !isLoadingAppointments) {
      console.log("No appointments returned from API, using mock data for testing");
      // This is just for testing - remove in production
      const mockAppointments = [
        {
          _id: "mock1",
          clientName: "John Doe",
          lawyerName: "Jane Smith",
          dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          status: "Scheduled",
          type: "Consultation"
        },
        {
          _id: "mock2",
          clientName: "Alice Johnson",
          lawyerName: "Bob Brown",
          dateTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          status: "Pending",
          type: "Meeting"
        }
      ];
      // Uncomment this line to use mock data for testing
      // setMockAppointments(mockAppointments);
    }
  }, [appointments, isLoadingAppointments]);

  // Fetch notifications separately
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: async () => {
      try {
        const response = await api.get("/notifications/admin/notifications")
        console.log("Notifications response:", response.data)
        return response.data.notifications || []
      } catch (error) {
        setError("Failed to load notifications: " + (error.response?.data?.message || error.message))
        throw error
      }
    },
  })

  // Prepare chart data - Fix potential NaN issues
  const categoryChartData = {
    labels: analyticsData?.byCategory?.map(item => item.category || 'Unknown') || [],
    datasets: [
      {
        data: analyticsData?.byCategory?.map(item => Number(item.count) || 0) || [],
        backgroundColor: [
          "#4F46E5", // indigo-600
          "#7C3AED", // purple-600
          "#EC4899", // pink-600
          "#F59E0B", // amber-500
          "#10B981", // emerald-500
          "#3B82F6", // blue-500
          "#EF4444", // red-500
        ],
        borderWidth: 1,
      },
    ],
  }

  const statusChartData = {
    labels: analyticsData?.byStatus?.map(item => item.status || 'Unknown') || [],
    datasets: [
      {
        label: "Cases by Status",
        data: analyticsData?.byStatus?.map(item => Number(item.count) || 0) || [],
        backgroundColor: "#4F46E5",
      },
    ],
  }

  const statusChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  }

  // User activity chart data (mock data - replace with actual data when available)
  const userActivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'New Users',
        data: [5, 8, 12, 7, 10, 15, 9],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Active Users',
        data: [15, 20, 18, 25, 22, 30, 28],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      // Refetch notifications
      await queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
    } catch (error) {
      setError("Failed to mark notification as read: " + (error.response?.data?.message || error.message))
    }
  }

  // Try different API endpoints
  useEffect(() => {
    const checkEndpoints = async () => {
      try {
        console.log("Checking appointment endpoints...");
        
        try {
          const response1 = await api.get("/appointments?limit=5");
          console.log("Endpoint /appointments works:", response1.data);
        } catch (e) {
          console.log("Endpoint /appointments failed:", e.message);
        }
        
        try {
          // Remove the duplicate /api prefix
          const response2 = await axios.get("http://localhost:5000/api/appointments?limit=5");
          console.log("Direct endpoint /api/appointments works:", response2.data);
        } catch (e) {
          console.log("Direct endpoint /api/appointments failed:", e.message);
        }
      } catch (error) {
        console.error("Endpoint check failed:", error);
      }
    };
    
    checkEndpoints();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-4 flex items-start">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold text-gray-800">
              {isLoadingDashboard ? "..." : dashboardData?.totalUsers || 0}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 flex items-start">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Lawyers</p>
            <p className="text-2xl font-semibold text-gray-800">
              {isLoadingDashboard ? "..." : dashboardData?.lawyers || 0}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 flex items-start">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Lawyers</p>
            <p className="text-2xl font-semibold text-gray-800">
              {isLoadingDashboard ? "..." : dashboardData?.pendingLawyers || 0}
            </p>
            {(dashboardData?.pendingLawyers > 0) && (
              <Link to="/dashboard/admin/users?role=Lawyer&status=Pending" className="text-xs text-indigo-600 hover:text-indigo-800">
                Review pending lawyers
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 flex items-start">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Cases</p>
            <p className="text-2xl font-semibold text-gray-800">
              {isLoadingDashboard ? "..." : dashboardData?.totalCases || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Cases by Category">
          {isLoadingAnalytics ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          ) : analyticsData?.byCategory && analyticsData.byCategory.length > 0 ? (
            <div className="h-64">
              <Pie data={categoryChartData} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No category data available</p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Cases by Status">
          {isLoadingAnalytics ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          ) : analyticsData?.byStatus && analyticsData.byStatus.length > 0 ? (
            <div className="h-64">
              <Bar data={statusChartData} options={statusChartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No status data available</p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* User Activity Chart */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
        <div className="h-64">
          <Line 
            data={userActivityData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Recent Activity and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Audit Logs */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <Link to="/dashboard/admin/audit" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>

          {isLoadingAudit ? (
            <div className="py-4 text-center">
              <p className="text-gray-500">Loading activity logs...</p>
            </div>
          ) : auditLogs?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {auditLogs.slice(0, 5).map((log) => (
                <li key={log._id} className="py-3">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.admin?.username || "System"} {log.action} {log.target?.username || ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500">No activity logs available</p>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
            <Link to="/dashboard/admin/notifications" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>

          {isLoadingNotifications ? (
            <div className="py-4 text-center">
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : notificationsData?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {notificationsData.slice(0, 5).map((notification) => (
                <li key={notification._id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-3 ${
                        notification.type === "new_user" 
                          ? "bg-green-100 text-green-600" 
                          : notification.type === "case_update" 
                            ? "bg-blue-100 text-blue-600"
                            : "bg-yellow-100 text-yellow-600"
                      }`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.type} • {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    {notification.status === "Unread" && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="ml-4 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500">No notifications available</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
          <Link to="/dashboard/admin/appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all
          </Link>
        </div>

        {isLoadingAppointments ? (
          <div className="py-4 text-center">
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : (appointments && appointments.length > 0) || mockAppointments.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {(appointments?.length > 0 ? appointments : mockAppointments).slice(0, 5).map((appointment) => (
              <li key={appointment._id} className="py-3">
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {String(appointment.clientName || 'Unknown Client')} with {String(appointment.lawyerName || 'Unknown Lawyer')}
                      </p>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                        {String(appointment.status || 'Scheduled')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {safeFormatDateTime(appointment.dateTime)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-4 text-center">
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard












