// src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

// Route accessible only when authenticated
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

// Route accessible only for Admin
export const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/employee/dashboard" replace />;

  return <Outlet />;
};

// Route accessible only for Employee
export const EmployeeRoute = () => {
  const { user, loading, isEmployee } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isEmployee()) return <Navigate to="/admin/dashboard" replace />;

  return <Outlet />;
};