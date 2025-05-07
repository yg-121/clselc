import { useQuery } from "@tanstack/react-query"
import api from "../../services/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area 
} from "recharts"
import { 
  Users, Briefcase, UserCheck, Clock, Activity, 
  Calendar, TrendingUp, AlertCircle 
} from "lucide-react"

export default function Dashboard() {
  // Fetch admin stats with more detailed debugging
  const { data: dashboardData, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching admin stats...")
        
        // Log the API URL being used
        console.log("🔍 API URL:", api.defaults.baseURL || "No base URL set")
        
        // Make the API call with detailed logging
        console.log("🔍 Making API call to /notifications/admin/stats")
        const response = await api.get("/notifications/admin/stats")
        
        // Log the full response
        console.log("🔍 Admin stats response status:", response.status)
        console.log("🔍 Admin stats response headers:", response.headers)
        console.log("🔍 Admin stats response data:", response.data)
        
        return response.data
      } catch (error) {
        console.error("❌ Error fetching admin stats:", error)
        console.error("❌ Error details:", error.response?.data || error.message)
        throw error
      }
    }
  })

  // Fetch case analytics
  const { data: caseAnalytics, isLoading: isLoadingAnalytics, error: analyticsError } = useQuery({
    queryKey: ['caseAnalytics'],
    queryFn: async () => {
      try {
        console.log("Fetching case analytics...")
        const response = await api.get("/cases/analytics")
        console.log("Case analytics response:", response.data)
        return response.data?.analytics || {}
      } catch (error) {
        console.error("Error fetching case analytics:", error)
        throw error
      }
    }
  })

  // Generate default activity data if none is provided by the backend
  const generateDefaultActivityData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      name: day,
      users: 0,
      cases: 0
    }))
  }

  // Show loading state
  if (isLoadingStats || isLoadingAnalytics) {
    return <div className="flex justify-center items-center h-64">Loading dashboard data...</div>
  }

  // Show error state
  if (statsError || analyticsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h2 className="text-xl font-bold">Error Loading Dashboard</h2>
        <p className="text-muted-foreground">
          {statsError?.message || analyticsError?.message || "Failed to load dashboard data"}
        </p>
        <p className="text-sm text-muted-foreground">
          Please check your backend connection and try again.
        </p>
      </div>
    )
  }

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']
  
  // Prepare data for pie charts
  const caseStatusData = Object.entries(dashboardData?.casesByStatus || {}).map(([name, value]) => ({
    name,
    value
  }))
  
  const caseCategoryData = Object.entries(dashboardData?.casesByCategory || {}).map(([name, value]) => ({
    name,
    value
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.clients || 0} clients, {dashboardData?.lawyers || 0} lawyers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Lawyers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.pendingLawyers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Lawyers awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalCases || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.casesByStatus?.Posted || 0} posted, {dashboardData?.casesByStatus?.Assigned || 0} assigned
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deadlines</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseAnalytics?.activeDeadlines || 0}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming case deadlines
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Case Analytics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Activity Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
                <CardDescription>User and case activity over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.recentActivity || generateDefaultActivityData()}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="cases" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCases)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Recent Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Cases</CardTitle>
                <CardDescription>Latest cases on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData.recentCases || []).map((caseItem, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        caseItem.status === 'Closed' ? 'bg-green-500' : 
                        caseItem.status === 'Assigned' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {caseItem.description?.substring(0, 50) || `Case #${caseItem._id}`}
                          {caseItem.description?.length > 50 ? '...' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {caseItem.category} • {caseItem.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!dashboardData.recentCases || dashboardData.recentCases.length === 0) && (
                    <p className="text-sm text-muted-foreground">No recent cases</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.userGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Case Analytics Tab */}
        <TabsContent value="cases" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Cases by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Cases by Status</CardTitle>
                <CardDescription>Distribution of cases by current status</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={caseStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {caseStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} cases`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Cases by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Cases by Category</CardTitle>
                <CardDescription>Distribution of cases by legal category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={caseCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {caseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} cases`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Form Usage */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Form Template Usage</CardTitle>
                <CardDescription>Most commonly used legal form templates</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={Object.entries(caseAnalytics?.formUsage || {}).map(([name, value]) => ({
                      name,
                      value
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => [`${value} uses`, 'Count']} />
                    <Bar dataKey="value" fill="#8884d8" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* User Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>Breakdown of users by role</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Clients', value: dashboardData?.clients || 0 },
                        { name: 'Lawyers', value: dashboardData?.lawyers || 0 },
                        { name: 'Admins', value: (dashboardData?.totalUsers || 0) - (dashboardData?.clients || 0) - (dashboardData?.lawyers || 0) }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#0088FE" />
                      <Cell fill="#00C49F" />
                      <Cell fill="#FFBB28" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Lawyer Approval Status */}
            <Card>
              <CardHeader>
                <CardTitle>Lawyer Approval Status</CardTitle>
                <CardDescription>Status of lawyer registrations</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Approved', value: (dashboardData?.lawyers || 0) - (dashboardData?.pendingLawyers || 0) },
                        { name: 'Pending', value: dashboardData?.pendingLawyers || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#00C49F" />
                      <Cell fill="#FFBB28" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} lawyers`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* User Activity */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Recent user activity on the platform</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.recentActivity?.map(day => ({
                      name: day.name,
                      users: day.users,
                      cases: day.cases
                    })) || generateDefaultActivityData()}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" name="New Users" fill="#0088FE" />
                    <Bar dataKey="cases" name="New Cases" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
