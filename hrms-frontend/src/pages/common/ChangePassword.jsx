// src/pages/common/ChangePassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiLock, FiEye, FiEyeOff, FiSave,
  FiKey, FiShield
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';
import passwordService from '../../services/passwordService';
import { validatePassword } from '../../utils/passwordUtils';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword', '');

  const onSubmit = async (data) => {
    const validation = validatePassword(data.newPassword);
    if (!validation.isValid) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (data.currentPassword === data.newPassword) {
      toast.error('New password must be different from current');
      return;
    }

    setSubmitting(true);
    try {
      await passwordService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Password changed successfully!');
      reset();
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Change Password"
        subtitle="Update your account password"
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Security Info */}
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50
                        border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FiShield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Account Security</h3>
              <p className="text-sm text-gray-600">
                Choose a strong password to protect your account
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4
                          border-b border-gray-100">
            <div className="p-3 bg-purple-50 rounded-xl">
              <FiKey className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Password Change
              </h2>
              <p className="text-sm text-gray-500">
                Enter your current and new password
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-2">
                Current Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex
                                items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('currentPassword', {
                    required: 'Current password is required',
                  })}
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className={`input-field pl-10 pr-10 ${
                    errors.currentPassword ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex
                             items-center text-gray-400"
                >
                  {showCurrent ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex
                                items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Must be at least 8 characters',
                    },
                    validate: (value) => {
                      const validation = validatePassword(value);
                      return validation.isValid ||
                        'Password does not meet requirements';
                    },
                  })}
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className={`input-field pl-10 pr-10 ${
                    errors.newPassword ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex
                             items-center text-gray-400"
                >
                  {showNew ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
              <PasswordStrengthMeter password={newPassword} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex
                                items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (value) =>
                      value === newPassword || 'Passwords do not match',
                  })}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  className={`input-field pl-10 pr-10 ${
                    errors.confirmPassword ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex
                             items-center text-gray-400"
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 justify-center"
              >
                <FiSave />
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ChangePassword;