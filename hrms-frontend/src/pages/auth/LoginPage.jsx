// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';

// Validation Schema
const loginSchema = yup.object({
  usernameOrEmail: yup
    .string()
    .required('Username or Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data);
      if (result.success) {
        toast.success('Login successful! Welcome back 👋');
      } else {
        toast.error(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 
                    via-primary-800 to-primary-600 flex items-center 
                    justify-center p-4">
      {isLoading && <Loader />}

      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 
                          bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl font-bold text-primary-700">HR</span>
          </div>
          <h1 className="text-3xl font-bold text-white">HRMS Portal</h1>
          <p className="text-primary-200 mt-2 text-sm">
            Human Resource Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username or Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex 
                                items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('usernameOrEmail')}
                  type="text"
                  placeholder="Enter username or email"
                  className={`input-field pl-10 ${
                    errors.usernameOrEmail ? 'input-error' : ''
                  }`}
                />
              </div>
              {errors.usernameOrEmail && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.usernameOrEmail.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex 
                                items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`input-field pl-10 pr-10 ${
                    errors.password ? 'input-error' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex 
                             items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary justify-center py-3 text-base
                         rounded-xl shadow-md hover:shadow-lg 
                         transform hover:-translate-y-0.5 transition-all"
            >
              <FiLogIn className="h-5 w-5" />
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">
              🔑 Demo Credentials
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-blue-600">
                <span>Admin:</span>
                <span className="font-medium">admin / Admin@123</span>
              </div>
              <div className="flex justify-between text-xs text-blue-600">
                <span>Employee:</span>
                <span className="font-medium">emp001 / Emp@123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-200 text-xs mt-6">
          © 2026 HRMS Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;