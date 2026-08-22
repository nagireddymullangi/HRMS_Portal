// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiMail, FiArrowLeft, FiSend,
  FiCheckCircle, FiClock
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import passwordService from '../../services/passwordService';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await passwordService.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message ||
        'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br
                      from-blue-700 via-blue-800 to-indigo-900
                      p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500
                        rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500
                        rounded-full opacity-10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-14 h-14 bg-white rounded-2xl flex
                            items-center justify-center shadow-lg">
              <HiOutlineOfficeBuilding className="h-8 w-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                POTLA TECH SOLUTIONS
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                HRMS Portal
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-5xl font-bold text-white leading-tight">
              Forgot your<br />password?
            </h2>
            <p className="text-blue-100 text-base mt-6 leading-relaxed
                          max-w-lg">
              No worries! We'll help you reset it in just a few simple steps.
              Enter your email and we'll send you a secure reset link.
            </p>

            {/* Steps */}
            <div className="mt-10 space-y-4">
              {[
                { num: '1', text: 'Enter your registered email address' },
                { num: '2', text: 'Check your inbox for reset link' },
                { num: '3', text: 'Click the link and set new password' },
                { num: '4', text: 'Login with your new password' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm
                                  rounded-full flex items-center
                                  justify-center text-white font-bold
                                  flex-shrink-0">
                    {step.num}
                  </div>
                  <p className="text-blue-100">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-blue-200 text-sm relative z-10">
          © 2026 Potla Tech Solutions HRMS. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center
                      p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16
                            bg-blue-700 rounded-2xl shadow-lg mb-3">
              <HiOutlineOfficeBuilding className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              POTLA TECH SOLUTIONS
            </h1>
          </div>

          {!submitted ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full
                                flex items-center justify-center
                                mx-auto mb-4">
                  <FiMail className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Forgot Password?
                </h2>
                <p className="text-gray-500 text-sm mt-2">
                  Enter your email to receive a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email',
                        },
                      })}
                      type="email"
                      placeholder="Enter your registered email"
                      className={`w-full pl-12 pr-4 py-3.5 bg-blue-50/50
                                  border-2 rounded-xl text-gray-800
                                  placeholder-gray-400 focus:outline-none
                                  focus:border-blue-500 focus:bg-white
                                  transition-all
                                  ${errors.email
                                    ? 'border-red-300'
                                    : 'border-blue-100'}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700
                             text-white font-semibold rounded-xl
                             transition-all duration-200 shadow-lg
                             shadow-blue-200 hover:shadow-xl
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transform hover:-translate-y-0.5
                             flex items-center justify-center gap-2"
                >
                  <FiSend />
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2
                             text-sm text-gray-600 hover:text-blue-600
                             font-medium transition-colors"
                >
                  <FiArrowLeft />
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10
                            text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full
                              flex items-center justify-center
                              mx-auto mb-4 animate-bounce">
                <FiCheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Check Your Email!
              </h2>
              <p className="text-gray-500 text-sm mt-2 mb-6">
                We've sent a password reset link to
              </p>
              <p className="font-semibold text-gray-800 text-lg mb-6">
                {submittedEmail}
              </p>

              <div className="bg-yellow-50 border border-yellow-200
                              rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 justify-center
                                text-yellow-800 text-sm">
                  <FiClock className="h-4 w-4" />
                  <span className="font-medium">
                    The link will expire in 30 minutes
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-500 space-y-2 mb-6">
                <p>Didn't receive the email?</p>
                <ul className="text-xs space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Verify the email address is correct</li>
                  <li>• Wait a few minutes and try again</li>
                </ul>
              </div>

              <button
                onClick={() => setSubmitted(false)}
                className="w-full btn-secondary justify-center py-3"
              >
                Try Different Email
              </button>

              <Link
                to="/login"
                className="mt-4 flex items-center justify-center gap-2
                           text-sm text-blue-600 hover:text-blue-700
                           font-medium"
              >
                <FiArrowLeft />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;