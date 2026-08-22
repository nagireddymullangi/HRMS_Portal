// src/pages/auth/ResetPasswordPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiLock, FiEye, FiEyeOff, FiCheckCircle,
  FiXCircle, FiArrowLeft, FiKey
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import passwordService from '../../services/passwordService';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';
import { validatePassword } from '../../utils/passwordUtils';
import Loader from '../../components/common/Loader';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword', '');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
      setValidating(false);
      return;
    }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const res = await passwordService.validateToken(token);
      setTokenInfo(res.data.data);
      setTokenValid(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset link');
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const onSubmit = async (data) => {
    // Validate password strength
    const validation = validatePassword(data.newPassword);
    if (!validation.isValid) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await passwordService.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
      toast.success('Password reset successfully!');

      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center
                      bg-gray-50">
        <div className="text-center">
          <Loader fullScreen={false} />
          <p className="text-gray-500 mt-3">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center
                      bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl
                        shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full
                          flex items-center justify-center
                          mx-auto mb-4">
            <FiXCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Invalid Reset Link
          </h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            {error}
          </p>

          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="btn-primary w-full justify-center py-3"
            >
              Request New Reset Link
            </Link>
            <Link
              to="/login"
              className="btn-secondary w-full justify-center py-3"
            >
              <FiArrowLeft />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center
                      bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl
                        shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full
                          flex items-center justify-center
                          mx-auto mb-4 animate-bounce">
            <FiCheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Password Reset Successful!
          </h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            Your password has been changed successfully. You will be
            redirected to login page in a moment.
          </p>

          <div className="w-full bg-gray-200 rounded-full h-1 mb-6">
            <div className="bg-green-600 h-1 rounded-full
                            animate-progress" />
          </div>

          <Link
            to="/login"
            className="btn-primary w-full justify-center py-3"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br
                      from-purple-700 via-purple-800 to-indigo-900
                      p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500
                        rounded-full opacity-10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-14 h-14 bg-white rounded-2xl flex
                            items-center justify-center shadow-lg">
              <HiOutlineOfficeBuilding className="h-8 w-8 text-purple-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                POTLA TECH SOLUTIONS
              </h1>
              <p className="text-purple-200 text-sm mt-0.5">
                HRMS Portal
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-5xl font-bold text-white leading-tight">
              Create your<br />new password
            </h2>
            <p className="text-purple-100 text-base mt-6 leading-relaxed
                          max-w-lg">
              Choose a strong password to keep your account secure.
              Make sure it's something you'll remember!
            </p>

            <div className="mt-10 bg-white/10 backdrop-blur-sm rounded-2xl
                            p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex
                             items-center gap-2">
                <FiKey className="h-5 w-5" />
                Password Best Practices
              </h3>
              <ul className="space-y-2 text-purple-100 text-sm">
                <li>✓ Use at least 8 characters</li>
                <li>✓ Mix uppercase and lowercase letters</li>
                <li>✓ Include numbers and symbols</li>
                <li>✓ Avoid personal information</li>
                <li>✓ Don't reuse old passwords</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-purple-200 text-sm relative z-10">
          © 2026 Potla Tech Solutions HRMS. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center
                      p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full
                              flex items-center justify-center
                              mx-auto mb-4">
                <FiLock className="h-10 w-10 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Reset Password
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                for {tokenInfo?.email}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold
                                  text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex
                                  items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('newPassword', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                      validate: (value) => {
                        const validation = validatePassword(value);
                        return validation.isValid ||
                          'Password does not meet requirements';
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50
                                border-2 rounded-xl text-gray-800
                                placeholder-gray-400 focus:outline-none
                                focus:border-purple-500 focus:bg-white
                                transition-all
                                ${errors.newPassword
                                  ? 'border-red-300'
                                  : 'border-gray-200'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex
                               items-center text-gray-400
                               hover:text-gray-600"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {errors.newPassword.message}
                  </p>
                )}
                <PasswordStrengthMeter password={newPassword} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold
                                  text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex
                                  items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm password',
                      validate: (value) =>
                        value === newPassword || 'Passwords do not match',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50
                                border-2 rounded-xl text-gray-800
                                placeholder-gray-400 focus:outline-none
                                focus:border-purple-500 focus:bg-white
                                transition-all
                                ${errors.confirmPassword
                                  ? 'border-red-300'
                                  : 'border-gray-200'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex
                               items-center text-gray-400
                               hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700
                           text-white font-semibold rounded-xl
                           transition-all duration-200 shadow-lg
                           shadow-purple-200 hover:shadow-xl
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transform hover:-translate-y-0.5"
              >
                {submitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2
                           text-sm text-gray-600 hover:text-purple-600
                           font-medium transition-colors"
              >
                <FiArrowLeft />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;