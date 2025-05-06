import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import  {AuthProvider}  from "./context/AuthContext";
import {useAuth} from "./hooks/authHooks"
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ClientHome from "./pages/client/ClientHome";
import FindLawyers from "./pages/client/FindLawyer";
import MyCases from "./pages/client/MyCases";
import CaseDetails from "./pages/client/CaseDetails";
import PostCase from "./pages/client/PostCases";
import ClientLawyerProfile from "./pages/client/clientLawyer";
import Notification from "./pages/client/Notifications";
import AppointmentsPage from "./pages/common/Appointments";
import LawyerHome from "./pages/lawyer/LawyerHome";
import CaseOnHandDetails from "./pages/lawyer/CaseOnHandDetails";
import LawyerAllCases from "./pages/lawyer/LawyerAllCases";
import LawyerCase from "./pages/lawyer/LawyerCase";
import LawyerCaseDetails from "./pages/lawyer/LawyerCaseDetails";
import CaseAnalytics from "./pages/lawyer/CaseAnalytics";
import MyBids from "./pages/lawyer/MyBids";
import LawyerProfile from "./pages/lawyer/LawyerProfile";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import MessagesPage from "./pages/common/Messages";

// Not Found Component
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Return to Home
      </a>
    </div>
  );
};



// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "Client") {
      return <Navigate to="/client/home" replace />;
    } else if (user.role === "Lawyer") {
      return <Navigate to="/lawyer/home" replace />;
    } else if (user.role === "Admin") {
      return <Navigate to="/dashboard/admin" replace />;
    } else {
      // Fallback to login if role is unknown
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  const location = useLocation();
  const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const hideNavbarFooter = authRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbarFooter && <Navbar />}
      <main className={hideNavbarFooter ? "" : "flex-grow"}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Dashboard Routes */}
          <Route
            path="client/home"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <ClientHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/lawyer"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <FindLawyers />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/cases"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <MyCases />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/cases/:id"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <CaseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/cases/post"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <PostCase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/appointments"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/messages"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/notification"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <Notification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/lawyer/:lawyerId"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <ClientLawyerProfile />
              </ProtectedRoute>
            }
          />
          {/* Lawyer route */}
          <Route
            path="/lawyer/home"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <LawyerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/all-cases"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <LawyerAllCases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/all-cases/:id"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <LawyerCaseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/lawyerCase"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <LawyerCase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/lawyerCase/:id"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <CaseOnHandDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/CaseAnalytics"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <CaseAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/my-bids"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <MyBids />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/appointments"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/messages"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/profile/:lawyerId"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <LawyerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/*"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideNavbarFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;




