/* eslint-disable no-unused-vars */

"use client"

import { useState, useMemo, useEffect } from "react"
import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "react-feather"
import api from "../../utils/api"
import { checkApiConfig } from "../../utils/api";
import DataTable from "../../components/admin/DataTable"
import ErrorAlert from "../../components/admin/ErrorAlert"
import { formatDateTime } from "../../utils/formatters"
import { toast } from "react-toastify"

const Appointments = () => {
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const queryClient = useQueryClient()
  // const [mockAppointments, setMockAppointments] = useState([]); // Set to empty array to disable mock data

  // Add useEffect to check API configuration
  useEffect(() => {
    const config = checkApiConfig();
    console.log("API Configuration in Appointments component:", config);
  }, []);

  // Add useEffect to test the API endpoint
  useEffect(() => {
    const testApiEndpoint = async () => {
      try {
        console.log("Testing appointments API endpoint...");
        
        // Test the /appointments/test endpoint
        try {
          const testResponse = await api.get("/appointments/test");
          console.log("Test endpoint response:", testResponse.data);
          if (testResponse.data && testResponse.data.message) {
            console.log("Test endpoint is working:", testResponse.data.message);
          }
        } catch (testError) {
          console.error("Test endpoint error:", testError);
        }
        
        // Test the main endpoint with a direct fetch
        try {
          const token = localStorage.getItem("token");
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
          console.log("Using API URL:", apiUrl);
          
          const response = await fetch(`${apiUrl}/appointments`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          console.log("Direct fetch response status:", response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log("Direct fetch response data:", data);
          } else {
            const errorText = await response.text();
            console.error("Direct fetch error:", errorText);
          }
        } catch (fetchError) {
          console.error("Direct fetch error:", fetchError);
        }
      } catch (error) {
        console.error("API test error:", error);
      }
    };
    
    testApiEndpoint();
  }, []);

  // Add useEffect to check user role and permissions
  useEffect(() => {
    const checkUserPermissions = () => {
      try {
        // Get user info from localStorage
        const userJson = localStorage.getItem("user");
        const tokenString = localStorage.getItem("token");
        
        if (!userJson || !tokenString) {
          console.error("User or token not found in localStorage");
          return;
        }
        
        const user = JSON.parse(userJson);
        console.log("Current user:", user);
        console.log("User role:", user.role);
        
        // Check if user has admin role
        if (user.role !== "Admin") {
          console.warn("User does not have Admin role. Current role:", user.role);
        }
        
        // Check token
        console.log("Token exists:", !!tokenString);
        if (tokenString) {
          // Don't log the full token for security reasons
          console.log("Token starts with:", tokenString.substring(0, 10));
          
          // Check if token is expired (if it's a JWT)
          try {
            const tokenParts = tokenString.split('.');
            if (tokenParts.length === 3) {
              // It's a JWT
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log("Token payload:", payload);
              
              if (payload.exp) {
                const expiryDate = new Date(payload.exp * 1000);
                const now = new Date();
                console.log("Token expires:", expiryDate);
                console.log("Token expired:", expiryDate < now);
              }
            }
          } catch (e) {
            console.error("Error parsing token:", e);
          }
        }
      } catch (error) {
        console.error("Error checking user permissions:", error);
      }
    };
    
    checkUserPermissions();
  }, []);

  // Fetch appointments with the correct format matching the backend
  const { data: appointments, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["appointments", statusFilter],
    queryFn: async () => {
      try {
        let url = "/appointments";
        if (statusFilter) {
          url += `?status=${statusFilter}`;
        }
        
        const response = await api.get(url);
        console.log("API response:", response.data);
        
        // The backend returns { message: "Appointments fetched", appointments: [...] }
        const appointmentsData = response.data.appointments || [];
        
        // Transform data to match the table format
        return appointmentsData.map(appointment => ({
          _id: appointment._id,
          clientName: appointment.client?.username || "Unknown Client",
          lawyerName: appointment.lawyer?.username || "Unknown Lawyer",
          dateTime: appointment.date,
          status: appointment.status,
          type: appointment.type
        }));
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to load appointments: " + (error.response?.data?.message || error.message));
        throw error;
      }
    }
  });

  // Add useEffect to log when appointments data changes
  useEffect(() => {
    console.log("Appointments data changed:", appointments);
    console.log("isLoading:", isLoading);
    console.log("isError:", isError);
  }, [appointments, isLoading, isError]);

  // COMPLETELY DISABLE mock data
  useEffect(() => {
    // Intentionally empty - we're not setting mock data anymore
  }, [appointments, isLoading, isError]);

  // Add useEffect to log query errors
  useEffect(() => {
    if (queryError) {
      console.error("React Query error:", queryError);
    }
  }, [queryError]);

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId) => {
      const response = await api.delete(`/appointments/${appointmentId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success("Appointment deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
    onError: (error) => {
      setError("Failed to delete appointment: " + (error.response?.data?.message || error.message))
    },
  })

  const handleDeleteAppointment = (appointmentId) => {
    deleteAppointmentMutation.mutate(appointmentId)
  }

  // Create test appointment with exact backend model format
  const createTestAppointment = async () => {
    try {
      setError("");
      
      // Get current user info
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      
      if (!user) {
        setError("User information not found. Please log in again.");
        return;
      }
      
      // Create appointment data exactly matching the backend model
      const appointmentData = {
        client: user._id,
        lawyer: user._id, // For testing, use same user as lawyer
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        type: "Meeting", // Must match enum in model: 'Meeting', 'Hearing', 'Deadline', 'Other'
        status: "Pending", // Must match enum in model: 'Pending', 'Confirmed', 'Cancelled', 'Completed'
        description: "Test appointment created from admin panel"
      };
      
      const response = await api.post("/appointments", appointmentData);
      toast.success("Test appointment created successfully");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    } catch (error) {
      console.error("Error creating test appointment:", error);
      setError("Failed to create test appointment: " + (error.response?.data?.message || error.message));
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "ID",
        cell: ({ row }) => <span className="text-xs">{row.original._id}</span>,
      },
      {
        accessorKey: "clientName",
        header: "Client",
      },
      {
        accessorKey: "lawyerName",
        header: "Lawyer",
      },
      {
        accessorKey: "dateTime",
        header: "Date & Time",
        cell: ({ row }) => formatDateTime(row.original.dateTime),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              row.original.status === "Confirmed"
                ? "bg-green-100 text-green-800"
                : row.original.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : row.original.status === "Cancelled"
                    ? "bg-red-100 text-red-800"
                    : row.original.status === "Completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
            {row.original.type}
          </span>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => handleDeleteAppointment(row.original._id)}
            className="text-red-600 hover:text-red-800"
            aria-label="Delete appointment"
            disabled={deleteAppointmentMutation.isPending}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        ),
      },
    ],
    [deleteAppointmentMutation.isPending]
  )

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Appointment Management</h2>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}
      {isError && (
        <ErrorAlert
          message="Failed to load appointments. Please try again."
          onClose={() => setError("")}
        />
      )}

      {/* Filters */}
      <div className="mb-6">
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Status
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Appointments Table */}
      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading appointments...</p>
        </div>
      ) : appointments && appointments.length > 0 ? (
        <DataTable
          columns={columns}
          data={appointments}
          filterPlaceholder="Search appointments..."
        />
      ) : (
        <div className="text-center py-4 bg-white shadow rounded-lg">
          <p className="text-gray-500 py-8">No appointments found. Try creating a new appointment.</p>
        </div>
      )}
    </div>
  )
}

export default Appointments
