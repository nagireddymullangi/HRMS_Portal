// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiMail, FiLock, FiEye, FiEyeOff,
  FiUsers, FiClipboard, FiUmbrella,
  FiDollarSign, FiBarChart2, FiGift
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data);
      if (result.success) {
        toast.success('Login successful! Welcome back 👋');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fill demo credentials
  // const fillDemo = (type) => {
  //   if (type === 'admin') {
  //     setValue('usernameOrEmail', 'admin');
  //     setValue('password', 'Admin@123');
  //   } else {
  //     setValue('usernameOrEmail', 'emp001');
  //     setValue('password', 'Emp@123');
  //   }
  // };

  const features = [
    { icon: '👥', label: 'Employees' },
    { icon: '📋', label: 'Attendance' },
    { icon: '🏖️', label: 'Leaves' },
    { icon: '💰', label: 'Payroll' },
    { icon: '📊', label: 'Performance' },
    { icon: '🎉', label: 'Events' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {isLoading && <Loader />}

      {/* LEFT SIDE - Brand & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br 
                      from-blue-700 via-blue-800 to-indigo-900 
                      p-12 flex-col justify-between relative overflow-hidden">

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 
                        rounded-full opacity-10 blur-3xl -translate-y-1/2 
                        translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 
                        rounded-full opacity-10 blur-3xl translate-y-1/2 
                        -translate-x-1/2"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo & Company */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-20 h-14 bg-white rounded-2xl flex 
                            items-center justify-center shadow-lg">
              <HiOutlineOfficeBuilding className="h-8 w-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                POTLA TECH SOLUTIONS
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                Human Resource Management System
              </p>
            </div>
          </div>

          {/* Hero Text */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white leading-tight">
              Manage your workforce<br />with confidence
            </h2>
            <p className="text-blue-100 text-base mt-6 leading-relaxed 
                          max-w-lg">
              Streamline HR operations with employee management,
              attendance tracking, leave management, payroll processing,
              and performance reviews — all in one place.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 
                           text-center hover:bg-white/20 transition-all 
                           cursor-pointer border border-white/10"
              >
                <div className="text-4xl mb-2">{feature.icon}</div>
                <p className="text-white font-semibold text-sm">
                  {feature.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-blue-200 text-sm">
            © 2026 Potla Tech Solutions HRMS. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center 
                      p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile Logo (visible only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 
                            bg-blue-700 rounded-2xl shadow-lg mb-3">
              <HiOutlineOfficeBuilding className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              POTLA TECH SOLUTIONS
            </h1>
            <p className="text-gray-500 text-xs mt-1">HRMS Portal</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Welcome back
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Sign in to your HRMS account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email/Username */}
              <div>
                <label className="block text-sm font-semibold 
                                  text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex 
                                  items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('usernameOrEmail', {
                      required: 'Email is required'
                    })}
                    type="text"
                    placeholder="admin"
                    className={`w-full pl-12 pr-4 py-3.5 bg-blue-50/50 
                                border-2 rounded-xl text-gray-800 
                                placeholder-gray-400 focus:outline-none 
                                focus:border-blue-500 focus:bg-white 
                                transition-all
                                ${errors.usernameOrEmail
                                  ? 'border-red-300'
                                  : 'border-blue-100'}`}
                  />
                </div>
                {errors.usernameOrEmail && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {errors.usernameOrEmail.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold 
                                  text-gray-700 mb-2">
                  Password
                </label>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex 
                                  items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Min 6 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 bg-blue-50/50 
                                border-2 rounded-xl text-gray-800 
                                placeholder-gray-400 focus:outline-none 
                                focus:border-blue-500 focus:bg-white 
                                transition-all
                                ${errors.password
                                  ? 'border-red-300'
                                  : 'border-blue-100'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex 
                               items-center text-gray-400 
                               hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                  
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {errors.password.message}
                  </p>
                )}
                <a href="/forgot-password" 
                className='block text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors'>
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 
                           text-white font-semibold rounded-xl 
                           transition-all duration-200 shadow-lg 
                           shadow-blue-200 hover:shadow-xl 
                           hover:shadow-blue-300 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transform hover:-translate-y-0.5"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Demo Accounts Card */}
          {/* <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-center text-gray-700 font-semibold mb-4">
              Demo Accounts
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fillDemo('admin')}
                className="py-3 px-4 bg-blue-50 hover:bg-blue-100 
                           text-blue-700 font-semibold rounded-xl 
                           transition-all duration-200 flex items-center 
                           justify-center gap-2 border-2 border-blue-100
                           hover:border-blue-200"
              >
                <span className="text-lg">👑</span>
                Admin Login
              </button>
              <button
                onClick={() => fillDemo('employee')}
                className="py-3 px-4 bg-green-50 hover:bg-green-100 
                           text-green-700 font-semibold rounded-xl 
                           transition-all duration-200 flex items-center 
                           justify-center gap-2 border-2 border-green-100
                           hover:border-green-200"
              >
                <span className="text-lg">👤</span>
                Employee Login
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              Password for all accounts:{' '}
              <code className="bg-gray-100 px-2 py-0.5 rounded 
                               text-gray-700 font-mono">
                Admin@123
              </code>
            </p>
          </div> */}

          {/* Mobile Footer */}
          <p className="lg:hidden text-center text-gray-400 text-xs">
            © 2026 Potla Tech Solutions HRMS
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;