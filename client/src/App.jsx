import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import VolunteerRegister from './pages/VolunteerRegister';
import BeneficiaryRegister from './pages/BeneficiaryRegister';
import AdminDashboard from './pages/AdminDashboard';
import Tasks from './pages/Tasks';
import Assignments from './pages/Assignments';
import VolunteerProfile from './pages/VolunteerProfile';
import BeneficiaryProfile from './pages/BeneficiaryProfile';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user.role === 'volunteer') return <Navigate to="/tasks" replace />;
  return <Navigate to="/tasks" replace />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/volunteer" element={<VolunteerRegister />} />
        <Route path="/register/beneficiary" element={<BeneficiaryRegister />} />
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute><Tasks /></ProtectedRoute>
        } />
        <Route path="/assignments" element={
          <ProtectedRoute roles={['admin']}><Assignments /></ProtectedRoute>
        } />
        <Route path="/volunteer/profile" element={
          <ProtectedRoute roles={['volunteer']}><VolunteerProfile /></ProtectedRoute>
        } />
        <Route path="/beneficiary/profile" element={
          <ProtectedRoute roles={['beneficiary']}><BeneficiaryProfile /></ProtectedRoute>
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
