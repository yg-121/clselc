
"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download } from "react-feather"
import { unparse } from "papaparse"
import api, { handleApiError } from "../../utils/api"
import DataTable from "../../components/admin/DataTable"
import ErrorAlert from "../../components/admin/ErrorAlert"
import { formatDate } from "../../utils/formatters"

const AuditLogs = () => {
  const [error, setError] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [targetFilter, setTargetFilter] = useState("")

  // Fetch audit logs with more detailed logging
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['auditLogs', actionFilter, targetFilter],
    queryFn: async () => {
      try {
        console.log("Fetching audit logs with filters:", { action: actionFilter, target: targetFilter });
        
        let url = "/audit";
        const params = {};
        if (actionFilter) params.action = actionFilter;
        if (targetFilter) params.target = targetFilter;
        
        if (Object.keys(params).length > 0) {
          url += "?" + new URLSearchParams(params).toString();
        }
        
        console.log("Audit logs URL:", url);
        const response = await api.get(url);
        
        // Log each audit log to see what's in the data
        console.log("Audit logs response:", response.data);
        if (response.data && response.data.length > 0) {
          response.data.forEach((log, index) => {
            console.log(`Audit log ${index}:`, {
              id: log._id,
              user: log.user,
              action: log.action,
              target: log.target,
              details: log.details,
              createdAt: log.createdAt
            });
          });
        }
        
        return response.data;
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        handleApiError(error, setError);
        throw error;
      }
    },
  })

  const handleExportCSV = () => {
    if (!auditLogs || auditLogs.length === 0) {
      return
    }

    // Prepare data for CSV export
    const data = auditLogs.map((log) => ({
      ID: log._id,
      Admin: log.admin?.username || "System",
      Action: log.action,
      Target: log.target?.username || "N/A",
      Details: log.details,
      Date: formatDate(log.createdAt),
    }))

    // Generate CSV
    const csv = unparse(data)

    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `audit-logs-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns = [
    {
      accessorKey: "user.username",
      header: "Admin",
      cell: ({ row }) => row.original.user?.username || "System",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.original.action === "create"
              ? "bg-green-100 text-green-800"
              : row.original.action === "update"
                ? "bg-blue-100 text-blue-800"
                : row.original.action === "delete"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.original.action}
        </span>
      ),
    },
    {
      accessorKey: "target.username",
      header: "Target",
      cell: ({ row }) => {
        const log = row.original;
        console.log(`Rendering target for log ${log._id}:`, {
          target: log.target,
          details: log.details
        });
        
        // Check if target exists and has a username
        if (log.target && typeof log.target === 'object' && log.target.username) {
          console.log(`Found target username: ${log.target.username}`);
          return log.target.username;
        }
        
        // If target is a string (ID only), show it
        if (typeof log.target === 'string' && log.target) {
          console.log(`Target is ID only: ${log.target}`);
          return `User ID: ${log.target.substring(0, 8)}...`;
        }
        
        // Try to extract username from details if it's a JSON string
        if (log.details) {
          try {
            // Try to parse as JSON
            if (log.details.startsWith('{') && log.details.endsWith('}')) {
              const details = JSON.parse(log.details);
              console.log(`Parsed details:`, details);
              
              // Check for username in various places
              if (details.username) {
                console.log(`Found username in details.username: ${details.username}`);
                return details.username;
              }
              
              if (details.user && details.user.username) {
                console.log(`Found username in details.user.username: ${details.user.username}`);
                return details.user.username;
              }
              
              if (details.target && details.target.username) {
                console.log(`Found username in details.target.username: ${details.target.username}`);
                return details.target.username;
              }
              
              // Check for any field that might contain a username
              for (const key in details) {
                if (typeof details[key] === 'string' && 
                    (key.includes('user') || key.includes('name'))) {
                  console.log(`Found possible username in details.${key}: ${details[key]}`);
                  return details[key];
                }
              }
            }
          } catch (e) {
            console.log(`Error parsing details as JSON:`, e);
          }
          
          // If not JSON or parsing failed, try regex to extract username
          const usernameMatch = log.details.match(/username[":]\s*["']?([^"',}]+)/i);
          if (usernameMatch && usernameMatch[1]) {
            console.log(`Found username via regex: ${usernameMatch[1]}`);
            return usernameMatch[1];
          }
          
          // Try to extract email as fallback
          const emailMatch = log.details.match(/email[":]\s*["']?([^"',}]+)/i);
          if (emailMatch && emailMatch[1]) {
            console.log(`Found email via regex: ${emailMatch[1]}`);
            return emailMatch[1];
          }
          
          // If details contains user ID, show it
          const idMatch = log.details.match(/userId[":]\s*["']?([^"',}]+)/i) || 
                          log.details.match(/user_id[":]\s*["']?([^"',}]+)/i) ||
                          log.details.match(/id[":]\s*["']?([^"',}]+)/i);
          if (idMatch && idMatch[1]) {
            console.log(`Found ID via regex: ${idMatch[1]}`);
            return `User ID: ${idMatch[1].substring(0, 8)}...`;
          }
        }
        
        // If action is login/logout, show the user who performed the action
        if (log.action === 'login' || log.action === 'logout') {
          if (log.user && log.user.username) {
            console.log(`Using user's own username for login/logout: ${log.user.username}`);
            return log.user.username;
          }
        }
        
        console.log(`No target information found, returning N/A`);
        return "N/A";
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => <div className="max-w-md truncate">{row.original.details}</div>,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Audit Logs</h2>
        <button
          onClick={handleExportCSV}
          disabled={!auditLogs || auditLogs.length === 0}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          <Download className="h-5 w-5 mr-2" />
          Export CSV
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div>
          <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Action
          </label>
          <select
            id="actionFilter"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </div>
        <div>
          <label htmlFor="targetFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Target
          </label>
          <input
            type="text"
            id="targetFilter"
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            placeholder="Enter username"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading audit logs...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={auditLogs || []} filterPlaceholder="Search audit logs..." />
      )}
    </div>
  )
}

export default AuditLogs
