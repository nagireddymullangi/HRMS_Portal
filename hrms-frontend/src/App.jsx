// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, EmployeeRoute } from './components/common/ProtectedRoute';
import  PWAInstallPrompt  from './components/common/PWAInstallPrompt';
import  NetworkStatus  from './components/common/NetworkStatus';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import LeaveManagement from './pages/admin/LeaveManagement';
import PayrollManagement from './pages/admin/PayrollManagement';
import OfferLetterManagement from './pages/admin/OfferLetterManagement';
import ExitManagement from './pages/admin/ExitManagement';
import DocumentTemplates from './pages/admin/DocumentTemplates';
import Reports from './pages/admin/Reports';
import ShiftManagement from './pages/admin/ShiftManagement';
import PerformanceManagement from './pages/admin/PerformanceManagement';
import ESignaturePad from './pages/admin/ESignaturePad';
import BiometricDevices from './pages/admin/BiometricDevices';
import FaceEnrollments from './pages/admin/FaceEnrollments';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyAttendance from './pages/employee/MyAttendance';
import MyLeave from './pages/employee/MyLeave';
import MyPayroll from './pages/employee/MyPayroll';
import BankDetails from './pages/employee/BankDetails';
import FaceCheckIn from './pages/employee/FaceCheckIn';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<EmployeeManagement />} />
            <Route path="/admin/departments" element={<DepartmentManagement />} />
            <Route path="/admin/attendance" element={<AttendanceManagement />} />
            <Route path="/admin/leaves" element={<LeaveManagement />} />
            <Route path="/admin/payroll" element={<PayrollManagement />} />
            <Route path="/admin/shifts" element={<ShiftManagement />} />
            <Route path="/admin/performance" element={<PerformanceManagement />} />
            <Route path="/admin/offer-letters" element={<OfferLetterManagement />} />
            <Route path="/admin/employee-exits" element={<ExitManagement />} />
            <Route path="/admin/document-templates" element={<DocumentTemplates />} />
            <Route path="/admin/e-signatures" element={<ESignaturePad />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/biometric-devices" element={<BiometricDevices />} />
            <Route path="/admin/face-enrollments" element={<FaceEnrollments />} />
          </Route>

          {/* Employee Routes */}
          <Route element={<EmployeeRoute />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/attendance" element={<MyAttendance />} />
            <Route path="/employee/leaves" element={<MyLeave />} />
            <Route path="/employee/payroll" element={<MyPayroll />} />
            <Route path="/employee/bank-details" element={<BankDetails />} />
            <Route path="/employee/face-check-in" element={<FaceCheckIn />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;