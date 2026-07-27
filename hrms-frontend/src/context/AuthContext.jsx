// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { API_ENDPOINTS, ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Login
 const login = useCallback(async (credentials) => {
  try {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
    const { data } = response.data; // ApiResponse wrapper

    const { token, role, employeeId, name, email, username } = data;

    const userData = { employeeId, name, email, role, username };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(token);
    setUser(userData);

    // Redirect based on role
    if (role === ROLES.ADMIN) {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/dashboard');
    }

    return { success: true };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Invalid credentials. Please try again.';

    return { success: false, message };
  }
}, [navigate]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    navigate('/login');
  }, [navigate]);

  // Check if Admin
  const isAdmin = () => user?.role === ROLES.ADMIN;

  // Check if Employee
  const isEmployee = () => user?.role === ROLES.EMPLOYEE;

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isEmployee,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;