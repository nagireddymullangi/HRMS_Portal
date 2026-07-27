// src/components/common/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiUsers, FiGrid, FiCalendar,
  FiFileText,FiUserX,FiFile, FiDollarSign, FiX, FiLogOut
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';


// Admin Navigation Links
const adminNavLinks = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: FiHome,
  },
  {
    path: '/admin/employees',
    label: 'Employees',
    icon: FiUsers,
  },
  {
    path: '/admin/departments',
    label: 'Departments',
    icon: FiGrid,
  },
  {
    path: '/admin/attendance',
    label: 'Attendance',
    icon: FiCalendar,
  },
  {
    path: '/admin/leaves',
    label: 'Leave Management',
    icon: FiFileText,
  },
  {
    path: '/admin/payroll',
    label: 'Payroll',
    icon: FaRupeeSign,
  },
  { 
    path: '/admin/offer-letters',
    label: 'Offer Letters',
    icon: FiFile,
  },
  {
    path: '/admin/employee-exits',
    label: 'Exit Management',
    icon: FiUserX,
  },
  {
    path: '/admin/document-templates',
    label: 'Document Templates',
    icon: FiFileText,
  },
];

// Employee Navigation Links
const employeeNavLinks = [
  {
    path: '/employee/dashboard',
    label: 'Dashboard',
    icon: FiHome,
  },
  {
    path: '/employee/attendance',
    label: 'My Attendance',
    icon: FiCalendar,
  },
  {
    path: '/employee/leaves',
    label: 'My Leaves',
    icon: FiFileText,
  },
  {
    path: '/employee/payroll',
    label: 'My Payroll',
    icon: FaRupeeSign,
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navLinks = isAdmin() ? adminNavLinks : employeeNavLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar 
                   text-white z-50 transform transition-transform 
                   duration-300 ease-in-out flex flex-col
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                   lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 
                        border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-primary-600 rounded-lg flex 
                            items-center justify-center">
              <span className="text-white font-bold text-sm">HR</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-none">
                HRMS
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {isAdmin() ? 'Admin Panel' : 'Employee Portal'}
              </p>
            </div>
          </div>

          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white 
                       transition-colors p-1"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-600 
                            flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {(user?.name || user?.username || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name || user?.username}
              </p>
              <p className="text-gray-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-gray-500 text-xs uppercase font-semibold 
                        tracking-wider px-3 mb-2">
            {isAdmin() ? 'Admin Menu' : 'My Menu'}
          </p>

          <ul className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                    }
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-400 
                       hover:bg-red-900/30 hover:text-red-300"
          >
            <FiLogOut className="h-5 w-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;