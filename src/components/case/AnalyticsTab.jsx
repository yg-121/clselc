import React, { useState, useEffect } from "react";
import { BarChart2, PieChart as PieChartIcon, Calendar, FileText, AlertTriangle, Activity, Clock, Users } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar
} from 'recharts';

const AnalyticsTab = ({ caseId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('documents');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300'];

  useEffect(() => {
    const fetchCaseDetails = async () => {
      if (!caseId) {
        setError("No case ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        // Fetch case details
        const response = await fetch(
          `http://localhost:5000/api/cases/${caseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch case details.");
        }

        const data = await response.json();
        console.log("Case details:", data.case);
        setCaseDetails(data.case);
        
        // Generate analytics from case details
        const caseAnalytics = generateCaseAnalytics(data.case);
        setAnalytics(caseAnalytics);
      } catch (err) {
        console.error("Error fetching case details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [caseId]);

  // Function to generate analytics from case details
  const generateCaseAnalytics = (caseData) => {
    if (!caseData) return null;

    // Calculate days active
    const createdDate = new Date(caseData.createdAt);
    const today = new Date();
    const daysActive = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));

    // Calculate days left to main deadline
    const mainDeadline = new Date(caseData.deadline);
    const daysToMainDeadline = Math.ceil((mainDeadline - today) / (1000 * 60 * 60 * 24));

    // Count documents by category
    const documentsByCategory = {};
    if (caseData.documents && caseData.documents.length > 0) {
      caseData.documents.forEach(doc => {
        const category = doc.category || "Uncategorized";
        documentsByCategory[category] = (documentsByCategory[category] || 0) + 1;
      });
    }

    // If no documents by category, add sample data
    if (Object.keys(documentsByCategory).length === 0) {
      documentsByCategory["Evidence"] = 0;
      documentsByCategory["Contract"] = 0;
      documentsByCategory["Court Filing"] = 0;
    }

    // Count document visibility
    const documentVisibility = {
      "Client Only": caseData.documents?.filter(d => d.visibility === "Client").length || 0,
      "Lawyer Only": caseData.documents?.filter(d => d.visibility === "Lawyer").length || 0,
      "Both": caseData.documents?.filter(d => d.visibility === "Both").length || 0
    };

    // Count deadlines
    const deadlinesMet = caseData.additionalDeadlines?.filter(d => d.completed).length || 0;
    const deadlinesMissed = caseData.additionalDeadlines?.filter(d => !d.completed && new Date(d.date) < today).length || 0;
    const upcomingDeadlines = caseData.additionalDeadlines?.filter(d => !d.completed && new Date(d.date) >= today).length || 0;

    // Analyze notes
    const noteAnalytics = analyzeNotes(caseData.notes || []);

    // Generate activity timeline
    const activityTimeline = generateActivityTimeline(caseData);

    // Analyze appointments
    const appointmentAnalytics = analyzeAppointments(caseData.appointments || []);

    return {
      documentCount: caseData.documents?.length || 0,
      noteCount: caseData.notes?.length || 0,
      daysActive,
      mainDeadline,
      daysToMainDeadline,
      deadlinesMet,
      deadlinesMissed,
      upcomingDeadlines,
      documentsByCategory,
      documentVisibility,
      activityTimeline,
      notes: noteAnalytics,
      status: caseData.status || "Unknown",
      appointments: appointmentAnalytics,
      assignedLawyer: caseData.assigned_lawyer || null
    };
  };

  // Analyze notes
  const analyzeNotes = (notes) => {
    // Count notes by visibility
    const byVisibility = {
      "Client Only": notes.filter(n => n.visibility === "Client").length || 0,
      "Lawyer Only": notes.filter(n => n.visibility === "Lawyer").length || 0,
      "Both": notes.filter(n => n.visibility === "Both").length || 0
    };
    
    // Count notes by creator
    const byCreator = {};
    notes.forEach(note => {
      const creator = note.createdBy?.username || "Unknown";
      byCreator[creator] = (byCreator[creator] || 0) + 1;
    });
    
    // Count notes by month
    const byMonth = {};
    notes.forEach(note => {
      if (note.createdAt) {
        const month = new Date(note.createdAt).toLocaleString('default', { month: 'long' });
        byMonth[month] = (byMonth[month] || 0) + 1;
      }
    });
    
    // Calculate average note length
    const totalLength = notes.reduce((sum, note) => sum + (note.content?.length || 0), 0);
    const averageLength = notes.length > 0 ? Math.round(totalLength / notes.length) : 0;
    
    return {
      total: notes.length,
      byVisibility,
      byCreator,
      byMonth,
      averageLength
    };
  };

  // Analyze appointments
  const analyzeAppointments = (appointments) => {
    const today = new Date();
    
    // Count appointments by status
    const byStatus = {
      "Pending": 0,
      "Confirmed": 0,
      "Completed": 0,
      "Cancelled": 0
    };
    
    // Count appointments by type
    const byType = {
      "Meeting": 0,
      "Hearing": 0,
      "Deadline": 0,
      "Other": 0
    };
    
    // Count upcoming vs past appointments
    let upcoming = 0;
    let past = 0;
    
    // Monthly distribution
    const byMonth = {};
    
    appointments.forEach(appointment => {
      // Count by status
      byStatus[appointment.status] = (byStatus[appointment.status] || 0) + 1;
      
      // Count by type
      const type = appointment.type || "Other";
      byType[type] = (byType[type] || 0) + 1;
      
      // Count upcoming vs past
      const appointmentDate = new Date(appointment.date);
      if (appointmentDate > today) {
        upcoming++;
      } else {
        past++;
      }
      
      // Count by month
      const month = appointmentDate.toLocaleString('default', { month: 'long' });
      byMonth[month] = (byMonth[month] || 0) + 1;
    });
    
    return {
      total: appointments.length,
      byStatus,
      byType,
      upcoming,
      past,
      byMonth
    };
  };

  // Generate activity timeline from case data
  const generateActivityTimeline = (caseData) => {
    const timeline = [];
    const allDates = new Set();
    
    // Add document dates
    if (caseData.documents && caseData.documents.length > 0) {
      caseData.documents.forEach(doc => {
        if (doc.createdAt) {
          const date = new Date(doc.createdAt).toISOString().split('T')[0];
          allDates.add(date);
        }
      });
    }
    
    // Add note dates
    if (caseData.notes && caseData.notes.length > 0) {
      caseData.notes.forEach(note => {
        if (note.createdAt) {
          const date = new Date(note.createdAt).toISOString().split('T')[0];
          allDates.add(date);
        }
      });
    }
    
    // Sort dates
    const sortedDates = Array.from(allDates).sort();
    
    // Create timeline entries
    sortedDates.forEach(date => {
      const documents = caseData.documents?.filter(doc => 
        doc.createdAt && new Date(doc.createdAt).toISOString().split('T')[0] === date
      ).length || 0;
      
      const notes = caseData.notes?.filter(note => 
        note.createdAt && new Date(note.createdAt).toISOString().split('T')[0] === date
      ).length || 0;
      
      timeline.push({ date, documents, notes });
    });
    
    // If timeline is empty, add some sample data
    if (timeline.length === 0) {
      const createdDate = new Date(caseData.createdAt || new Date());
      const today = new Date();
      
      // Add entry for creation date
      timeline.push({
        date: createdDate.toISOString().split('T')[0],
        documents: 1,
        notes: 0
      });
      
      // Add entry for today
      timeline.push({
        date: today.toISOString().split('T')[0],
        documents: 0,
        notes: 0
      });
    }
    
    return timeline;
  };

  // Transform data for charts
  const prepareDocumentCategoryData = () => {
    if (!analytics || !analytics.documentsByCategory) return [];
    
    return Object.entries(analytics.documentsByCategory).map(([category, count]) => ({
      name: category,
      value: count
    }));
  };

  const prepareDocumentVisibilityData = () => {
    if (!analytics || !analytics.documentVisibility) return [];
    
    return Object.entries(analytics.documentVisibility).map(([visibility, count]) => ({
      name: visibility,
      value: count
    }));
  };

  const prepareActivityTimelineData = () => {
    if (!analytics || !analytics.activityTimeline) return [];
    
    return analytics.activityTimeline.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      documents: item.documents,
      notes: item.notes
    }));
  };

  const prepareDeadlineData = () => {
    if (!analytics) return [];
    
    return [
      { name: 'Main Deadline', value: 1, daysLeft: analytics.daysToMainDeadline },
      { name: 'Met', value: analytics.deadlinesMet || 0 },
      { name: 'Missed', value: analytics.deadlinesMissed || 0 },
      { name: 'Upcoming', value: analytics.upcomingDeadlines || 0 }
    ];
  };

  const prepareAppointmentStatusData = () => {
    if (!analytics || !analytics.appointments) return [];
    
    return Object.entries(analytics.appointments.byStatus).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  const prepareAppointmentTypeData = () => {
    if (!analytics || !analytics.appointments) return [];
    
    return Object.entries(analytics.appointments.byType).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  const prepareAppointmentMonthData = () => {
    if (!analytics || !analytics.appointments) return [];
    
    return Object.entries(analytics.appointments.byMonth).map(([month, count]) => ({
      name: month,
      value: count
    }));
  };

  const prepareNoteVisibilityData = () => {
    if (!analytics || !analytics.notes) return [];
    
    return Object.entries(analytics.notes.byVisibility).map(([visibility, count]) => ({
      name: visibility,
      value: count
    }));
  };

  const prepareNoteCreatorData = () => {
    if (!analytics || !analytics.notes) return [];
    
    return Object.entries(analytics.notes.byCreator).map(([creator, count]) => ({
      name: creator,
      value: count
    }));
  };

  const prepareNoteMonthData = () => {
    if (!analytics || !analytics.notes) return [];
    
    // Get all months in order
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    
    // Get the data from analytics
    const data = Object.entries(analytics.notes.byMonth).map(([month, count]) => ({
      name: month,
      value: count
    }));
    
    // Sort by month order
    return data.sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name));
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Calculate completion rate with proper null checks
  const calculateCompletionRate = () => {
    if (!analytics || !analytics.appointments || !analytics.appointments.byStatus) {
      return '0%';
    }
    
    const { total, byStatus } = analytics.appointments;
    const completed = byStatus.Completed || 0;
    
    if (total <= 0) {
      return '0%';
    }
    
    return `${Math.round((completed / total) * 100)}%`;
  };

  const prepareAppointmentStatusBarData = () => {
    if (!caseDetails || !caseDetails.appointments || caseDetails.appointments.length === 0) {
      return [
        { name: 'Pending', value: 0 },
        { name: 'Confirmed', value: 0 },
        { name: 'Completed', value: 0 },
        { name: 'Cancelled', value: 0 },
        { name: 'Total', value: 0 }
      ];
    }
    
    // Count appointments by status directly from caseDetails
    const pending = caseDetails.appointments.filter(a => a.status === 'Pending').length;
    const confirmed = caseDetails.appointments.filter(a => a.status === 'Confirmed').length;
    const completed = caseDetails.appointments.filter(a => a.status === 'Completed').length;
    const cancelled = caseDetails.appointments.filter(a => a.status === 'Cancelled').length;
    const total = caseDetails.appointments.length;
    
    return [
      { name: 'Pending', value: pending },
      { name: 'Confirmed', value: confirmed },
      { name: 'Completed', value: completed },
      { name: 'Cancelled', value: cancelled },
      { name: 'Total', value: total }
    ];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Loading case analytics...</p>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
        <div>
          <h3 className="text-red-800 font-medium">Error loading analytics</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700">No analytics data available for this case.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Chart Navigation - Styled like TabsNavigation */}
      <div className="bg-card text-card-foreground rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveChart("documents")}
            className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-300 ${
              activeChart === "documents"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </button>
          <button
            onClick={() => setActiveChart("deadlines")}
            className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-300 ${
              activeChart === "deadlines"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Deadlines
          </button>
          <button
            onClick={() => setActiveChart("notes")}
            className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-300 ${
              activeChart === "notes"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </button>
          <button
            onClick={() => setActiveChart("appointments")}
            className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-300 ${
              activeChart === "appointments"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Appointments
          </button>
        </div>
      </div>

      {/* Active Chart Display */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="h-80 transition-all duration-300">
          {activeChart === "documents" && (
            <div className="h-full">
              <h3 className="text-lg font-semibold mb-4">Document Analysis</h3>

              {/* Document Categories */}
              <div>
                <div className="h-60">
                  <ResponsiveContainer width="70%" height="70%">
                    <PieChart>
                      <Pie
                        data={prepareDocumentCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          percent > 0.05
                            ? `${name}: ${(percent * 100).toFixed(0)}%`
                            : ""
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {prepareDocumentCategoryData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} documents`, "Count"]}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeChart === "deadlines" && (
            <div className="h-full">
              <h3 className="text-lg font-semibold mb-4">Deadline Status</h3>

              {/* Main Case Deadline - Visual Representation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* <div className="p-4 border rounded-lg bg-white border-blue-200 shadow-sm"> */}
                <div className="flex flex-col items-center">
                  <div className="w-full h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="100%"
                        barSize={10}
                        data={[
                          {
                            name: "Days Left",
                            value: Math.max(
                              0,
                              Math.min(
                                100,
                                analytics.daysToMainDeadline < 0
                                  ? 0
                                  : analytics.daysToMainDeadline > 30
                                  ? 100
                                  : analytics.daysToMainDeadline * 3.33
                              )
                            ),
                            fill:
                              analytics.daysToMainDeadline < 0
                                ? "#EF4444"
                                : analytics.daysToMainDeadline < 7
                                ? "#F59E0B"
                                : "#10B981",
                          },
                        ]}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar
                          background
                          dataKey="value"
                          cornerRadius={10}
                          animate={true}
                        />
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-2xl font-bold"
                          fill={
                            analytics.daysToMainDeadline < 0
                              ? "#EF4444"
                              : analytics.daysToMainDeadline < 7
                              ? "#F59E0B"
                              : "#10B981"
                          }
                        >
                          {analytics.daysToMainDeadline}
                        </text>
                        <text
                          x="50%"
                          y="65%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs"
                          fill="#6B7280"
                        >
                          {analytics.daysToMainDeadline === 1
                            ? "DAY LEFT"
                            : analytics.daysToMainDeadline < 0
                            ? "DAYS OVERDUE"
                            : "DAYS LEFT"}
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                      {analytics.mainDeadline
                        ? new Date(analytics.mainDeadline).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "No deadline set"}
                    </p>
                  
                    
                  </div>
                </div>
                {/* Status Indicator */}
                
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        analytics.daysToMainDeadline < 0
                          ? "bg-red-500"
                          : analytics.daysToMainDeadline < 7
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                    <span className="text-sm font-medium">
                      {analytics.daysToMainDeadline < 0
                        ? "This case has passed its deadline"
                        : analytics.daysToMainDeadline < 7
                        ? "This case deadline is approaching soon"
                        : "This case is on track to meet its deadline"}
                    </span>
                  </div>
                

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Met",
                          value: analytics.deadlinesMet || 0,
                          color: "#4CAF50",
                        },
                        {
                          name: "Missed",
                          value: analytics.deadlinesMissed || 0,
                          color: "#F44336",
                        },
                        {
                          name: "Upcoming",
                          value: analytics.upcomingDeadlines || 0,
                          color: "#2196F3",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        {
                          name: "Met",
                          value: analytics.deadlinesMet || 0,
                          color: "#4CAF50",
                        },
                        {
                          name: "Missed",
                          value: analytics.deadlinesMissed || 0,
                          color: "#F44336",
                        },
                        {
                          name: "Upcoming",
                          value: analytics.upcomingDeadlines || 0,
                          color: "#2196F3",
                        },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} deadlines`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeChart === "activity" && (
            <div className="h-full">
              <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart
                  data={prepareActivityTimelineData()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="documents"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    animationBegin={0}
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    dataKey="notes"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    animationBegin={0}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === "notes" && (
            <div className="h-full">
              <h3 className="text-lg font-semibold mb-4">Note Analysis</h3>

              {/* Summary Cards - Top Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm flex items-center">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-blue-800 uppercase">
                      Total Notes
                    </h4>
                    <p className="text-2xl font-bold text-blue-700">
                      {analytics.notes?.total || 0}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 shadow-sm flex items-center">
                  <div className="bg-purple-500 rounded-full p-2 mr-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-purple-800 uppercase">
                      Top Contributor
                    </h4>
                    <p className="text-xl font-bold text-purple-700 truncate max-w-[150px]">
                      {prepareNoteCreatorData().length > 0
                        ? prepareNoteCreatorData().sort(
                            (a, b) => b.value - a.value
                          )[0].name
                        : "None"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Note Creator */}

                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Notes by Creator
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareNoteCreatorData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {prepareNoteCreatorData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} notes`, "Count"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeChart === 'appointments' && (
            <div className="h-full">
              <h3 className="text-lg font-semibold mb-4">Appointment Analysis</h3>
              
              {/* Summary Cards - Top Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200 shadow-sm flex items-center">
                  <div className="bg-indigo-500 rounded-full p-2 mr-3">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-indigo-800 uppercase">Total Appointments</h4>
                    <p className="text-2xl font-bold text-indigo-700">
                      {caseDetails?.appointments?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200 shadow-sm flex items-center">
                  <div className="bg-cyan-500 rounded-full p-2 mr-3">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-cyan-800 uppercase">Upcoming</h4>
                    <p className="text-2xl font-bold text-cyan-700">
                      {caseDetails?.appointments?.filter(a => new Date(a.date) > new Date()).length || 0}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200 shadow-sm flex items-center">
                  <div className="bg-amber-500 rounded-full p-2 mr-3">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-amber-800 uppercase">Completion Rate</h4>
                    <p className="text-xl font-bold text-amber-700">
                      {caseDetails?.appointments?.length > 0 
                        ? `${Math.round((caseDetails.appointments.filter(a => a.status === 'Completed').length / caseDetails.appointments.length) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Appointment Status Bar Chart */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                  Appointment Status Overview
                </h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareAppointmentStatusBarData()}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} appointments`, 'Count']} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar 
                        dataKey="value" 
                        name="Appointments" 
                        radius={[4, 4, 0, 0]}
                        barSize={60}
                      >
                        {prepareAppointmentStatusBarData().map((entry, index) => {
                          // Custom colors for status bars
                          const statusColors = {
                            'Pending': '#FCD34D',
                            'Confirmed': '#60A5FA',
                            'Completed': '#34D399',
                            'Cancelled': '#F87171',
                            'Total': '#8B5CF6'
                          };
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={statusColors[entry.name] || '#6B7280'} 
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Status Legend */}
              <div className="mt-4 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#FCD34D] mr-2"></div>
                  <span className="text-xs text-gray-600">Pending</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#60A5FA] mr-2"></div>
                  <span className="text-xs text-gray-600">Confirmed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#34D399] mr-2"></div>
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#F87171] mr-2"></div>
                  <span className="text-xs text-gray-600">Cancelled</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-2"></div>
                  <span className="text-xs text-gray-600">Total</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;






































