import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

function App() { 
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={user ? <Navigate to={getRedirectPath(user.role)} /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={getRedirectPath(user.role)} /> : <Register />} />
          <Route path="/forgot-password" element={user ? <Navigate to={getRedirectPath(user.role)} /> : <ForgotPassword />} />
          <Route path="/reset-password" element={user ? <Navigate to={getRedirectPath(user.role)} /> : <ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

const getRedirectPath = (role) => {
  switch (role) {
    case 'Client':
      return '/dashboard/client';
    case 'Lawyer':
      return '/dashboard/lawyer';
    case 'Admin':
      return '/admin';
    default:
      return '/login';
  }
};

export default App;