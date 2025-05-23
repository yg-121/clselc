import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./hooks/authHooks.js";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import ClientHome from "./pages/client/ClientHome.jsx";
import FindLawyers from "./pages/client/FindLawyer.jsx";
import MyCases from "./pages/client/MyCases.jsx";
import CaseDetails from "./pages/client/CaseDetails.jsx";
import PostCase from "./pages/client/PostCases.jsx";
import ClientLawyerProfile from "./pages/client/clientLawyer.jsx";
import Notification from "./pages/client/Notifications.jsx";

import AppointmentsPage from "./pages/common/Appointments.jsx";
import MessagePage from "./pages/common/MessagePage.jsx";

import LawyerHome from "./pages/lawyer/LawyerHome.jsx";
import CaseOnHandDetails from "./pages/lawyer/CaseOnHandDetails.jsx";
import LawyerAllCases from "./pages/lawyer/LawyerAllCases.jsx";
import LawyerCase from "./pages/lawyer/LawyerCase.jsx";
import LawyerCaseDetails from "./pages/lawyer/LawyerCaseDetails.jsx";
import CaseAnalytics from "./pages/lawyer/CaseAnalytics.jsx";
import MyBids from "./pages/lawyer/MyBids.jsx";
import LawyerProfile from "./pages/lawyer/LawyerProfile.jsx";

import AdminDashboard from "./components/dashboard/AdminDashboard.jsx";
import LegalReviewerDashboard from "./pages/dashboard/LegalReviewerDashboard.jsx";

import ClientProfile from "./pages/client/ClientProfile.jsx";
import ClientNotifications from "./pages/client/Notifications.jsx";
import LawyerNotifications from "./pages/lawyer/Notifications.jsx";
import AdminNotifications from "./pages/admin/Notifications.jsx";

import { Toaster } from 'react-hot-toast';

import About from "./pages/static/About.jsx";
import Services from "./pages/static/Services.jsx";
import HowItWorks from "./pages/static/HowItWorks.jsx";
import Blog from "./pages/static/Blog.jsx";
import Terms from "./pages/static/Terms.jsx";
import Privacy from "./pages/static/Privacy.jsx";
import FAQ from "./pages/static/FAQ.jsx";
import Contact from "./pages/static/Contact.jsx";

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
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    switch (user.role) {
      case "Client":
        return <Navigate to="/client/home" replace />;
      case "Lawyer":
        return <Navigate to="/lawyer/home" replace />;
      case "Admin":
        return <Navigate to="/dashboard/admin" replace />;
      case "LegalReviewer":
        return <Navigate to="/dashboard/reviewer" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  const location = useLocation();
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isAdminRoute = location.pathname.startsWith('/dashboard/admin');
  const hideNavbarFooter = authRoutes.includes(location.pathname) || isAdminRoute;

  if (isAdminRoute) {
    return (
      <Routes>
        <Route
          path="/dashboard/admin/*"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbarFooter && <Navbar />}
      <main className={hideNavbarFooter ? "" : "flex-grow pb-4"}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/client/home"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <ClientHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/lawyer"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <FindLawyers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/cases"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <MyCases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/cases/:id"
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
                <MessagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/notification"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <Notification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/lawyer/:lawyerId"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <ClientLawyerProfile />
              </ProtectedRoute>
            }
          />
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
                <MessagePage />
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
          <Route
            path="/dashboard/reviewer"
            element={
              <ProtectedRoute allowedRoles={["LegalReviewer"]}>
                <LegalReviewerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/notifications"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <ClientNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/notifications"
            element={
              <ProtectedRoute allowedRoles={["Lawyer"]}>
                <LawyerNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/notifications"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/clientprofile"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <ClientProfile />
              </ProtectedRoute>
            }
          />
          {/* Static Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
         
        </Routes>
      </main>
      {!hideNavbarFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppRoutes />
    </AuthProvider>
  );
}


export default App;













