// src/components/common/Navbar.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
  FiBell, FiLogOut, FiUser,
  FiChevronDown, FiMenu
} from 'react-icons/fi';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 
                    flex items-center justify-between sticky top-0 z-40 
                    shadow-sm">
      {/* Left - Menu Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 
                     transition-colors text-gray-600"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            HRMS Portal
          </h1>
        </div>
      </div>

      {/* Right - User Menu */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 
                           transition-colors text-gray-600">
          <FiBell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 
                           bg-red-500 rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-lg 
                       hover:bg-gray-100 transition-colors"
          >
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-primary-600 
                            flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {getInitials(user?.name || user?.username)}
              </span>
            </div>

            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-none">
                {user?.name || user?.username}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Employee'}
              </p>
            </div>

            <FiChevronDown className={`h-4 w-4 text-gray-500 transition-transform 
                            ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl 
                            shadow-lg border border-gray-100 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 text-xs font-medium 
                                 px-2 py-0.5 rounded-full bg-primary-100 
                                 text-primary-700">
                  {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Employee'}
                </span>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  className="flex items-center gap-3 w-full px-4 py-2.5 
                             text-sm text-gray-700 hover:bg-gray-50 
                             transition-colors"
                >
                  <FiUser className="h-4 w-4 text-gray-400" />
                  My Profile
                </button>

                <hr className="my-1 border-gray-100" />

                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 
                             text-sm text-red-600 hover:bg-red-50 
                             transition-colors"
                >
                  <FiLogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;