// src/components/common/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiUsers, FiGrid, FiCalendar,
  FiFileText,FiUserX,FiFile, FiDollarSign, FiX, FiLogOut
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

import { FiBarChart2, FiClock, FiTarget } from 'react-icons/fi';

import { useEffect, useState } from 'react';
 import {
   FiCreditCard,
   FiEdit3
 } from 'react-icons/fi';

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
  {
    path:'/admin/e-signatures',
    label: 'E-Signatures',
    icon: FiEdit3,
  },
  {
  path: '/admin/reports',
  label: 'Reports',
  icon: FiBarChart2,
},
{
  path: '/admin/shifts',
  label: 'Shift Management',
  icon: FiClock,
},
{
  path: '/admin/performance',
  label: 'Performance',
  icon: FiTarget,
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
  {
    path:'/employee/bank-details',
    label: 'Bank Details',
    icon: FiCreditCard,
  }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navLinks = isAdmin() ? adminNavLinks : employeeNavLinks;

  // Swipe to close on mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`fixed top-0 left-0 h-full w-72 bg-sidebar 
                   text-white z-50 transform transition-transform 
                   duration-300 ease-in-out flex flex-col
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                   lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 
                        border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary-600 rounded-xl flex 
                            items-center justify-center shadow-lg">
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
        <div className="px-4 py-3 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-600 
                            flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {(user?.name || user?.username || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
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
        <div className="px-3 py-4 border-t border-gray-700 flex-shrink-0">
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