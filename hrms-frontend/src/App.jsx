// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, EmployeeRoute } from './components/common/ProtectedRoute';
import  PWAInstallPrompt  from './components/common/PWAInstallPrompt';
import  NetworkStatus  from './components/common/NetworkStatus';
import AIChatbot from './components/common/AIChatbot';
import Announcements from './pages/admin/Announcements';
import EventsManagement from './pages/admin/EventsManagement';
import MyAnnouncements from './pages/employee/MyAnnouncements';
import MyEvents from './pages/employee/MyEvents';

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
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ChangePassword from './pages/common/ChangePassword';
import OnboardingManagement from './pages/admin/OnboardingManagement';
import OnboardingDetail from './pages/admin/OnboardingDetail';
import MyOnboarding from './pages/employee/MyOnboarding';
import JobPostings from './pages/admin/JobPostings';
import Candidates from './pages/admin/Candidates';
import ApplicationsPipeline from './pages/admin/ApplicationsPipeline';
import ProjectsManagement from './pages/admin/ProjectsManagement';
import ProjectDetail from './pages/admin/ProjectDetail';
import TimesheetApprovals from './pages/admin/TimesheetApprovals';
import MyTimesheet from './pages/employee/MyTimesheet';
import ExpenseManagement from './pages/admin/ExpenseManagement';
import GrievanceManagement from './pages/admin/GrievanceManagement';
import MyExpenses from './pages/employee/MyExpenses';
import MyGrievances from './pages/employee/MyGrievances';
import TrainingManagement from './pages/admin/TrainingManagement';
import PoliciesManagement from './pages/admin/PoliciesManagement';
import SettlementManagement from './pages/admin/SettlementManagement';
import ComplianceManagement from './pages/admin/ComplianceManagement';
import HRAnalytics from './pages/admin/HRAnalytics';
import AIInsights from './pages/admin/AIInsights';
import AssignWork from './pages/admin/AssignWork';


// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyAttendance from './pages/employee/MyAttendance';
import MyLeave from './pages/employee/MyLeave';
import MyPayroll from './pages/employee/MyPayroll';
import BankDetails from './pages/employee/BankDetails';
import FaceCheckIn from './pages/employee/FaceCheckIn';
import MyLearning from './pages/employee/MyLearning';
import MyPolicies from './pages/employee/MyPolicies';
import MyDailyWork from './pages/employee/MyDailyWork';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NetworkStatus />
        <PWAInstallPrompt />
        <AIChatbot />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

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
            <Route path="/admin/announcements" element={<Announcements />} />
            <Route path="/admin/events" element={<EventsManagement />} />
            <Route path="/admin/onboarding" element={<OnboardingManagement />} />
            <Route path="/admin/onboarding/:id" element={<OnboardingDetail />} />
            <Route path="/admin/jobs" element={<JobPostings />} />
            <Route path="/admin/candidates" element={<Candidates />} />
            <Route path="/admin/jobs/:jobId/applications" element={<ApplicationsPipeline />} />
            <Route path="/admin/projects" element={<ProjectsManagement />} />
            <Route path="/admin/projects/:id" element={<ProjectDetail />} />
            <Route path="/admin/timesheets" element={<TimesheetApprovals />} />
            <Route path="/admin/expenses" element={<ExpenseManagement />} />
            <Route path="/admin/grievances" element={<GrievanceManagement />} />
            <Route path="/admin/training" element={<TrainingManagement />} />
            <Route path="/admin/policies" element={<PoliciesManagement />} />
            <Route path="/admin/settlements" element={<SettlementManagement />} />
            <Route path="/admin/compliance" element={<ComplianceManagement />} />
            <Route path="/admin/analytics" element={<HRAnalytics />} />
            <Route path="/admin/ai-insights" element={<AIInsights />} />
            <Route path="/admin/assign-work" element={<AssignWork />} />
          </Route>

          {/* Employee Routes */}
          <Route element={<EmployeeRoute />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/attendance" element={<MyAttendance />} />
            <Route path="/employee/leaves" element={<MyLeave />} />
            <Route path="/employee/payroll" element={<MyPayroll />} />
            <Route path="/employee/bank-details" element={<BankDetails />} />
            <Route path="/employee/face-check-in" element={<FaceCheckIn />} />
            <Route path="/employee/announcements" element={<MyAnnouncements />} />
            <Route path="/employee/events" element={<MyEvents />} />
            <Route path="/employee/onboarding" element={<MyOnboarding />} />
            <Route path="/employee/timesheet" element={<MyTimesheet />} />
            <Route path="/employee/expenses" element={<MyExpenses />} />
            <Route path="/employee/grievances" element={<MyGrievances />} />
            <Route path="/employee/learning" element={<MyLearning />} />
            <Route path="/employee/policies" element={<MyPolicies />} />
            <Route path="/employee/daily-work" element={<MyDailyWork />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />,
          
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

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