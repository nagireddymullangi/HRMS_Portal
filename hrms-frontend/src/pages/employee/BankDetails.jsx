// src/pages/employee/BankDetails.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiCreditCard, FiCheckCircle, FiSave,
  FiShield, FiInfo
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import bankService from '../../services/bankService';
import { useAuth } from '../../context/AuthContext';

const BankDetails = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankData, setBankData] = useState(null);

  const { register, handleSubmit, reset,
          formState: { errors } } = useForm();

  useEffect(() => {
    if (user?.employeeId) fetchBankDetails();
  }, [user]);

  const fetchBankDetails = async () => {
    try {
      const res = await bankService.getByEmployee(user.employeeId);
      setBankData(res.data.data);
      reset(res.data.data);
    } catch {
      // No bank details yet
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await bankService.save(user.employeeId, data);
      toast.success('Bank details saved successfully');
      fetchBankDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Bank Details"
        subtitle="Manage your salary account information"
      />

      {loading ? (
        <Loader fullScreen={false} />
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Verification Status */}
          {bankData && (
            <div className={`card ${bankData.isVerified
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center gap-3">
                {bankData.isVerified ? (
                  <>
                    <FiCheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">
                        ✓ Verified Account
                      </p>
                      <p className="text-sm text-green-600">
                        Your account has been verified for payroll
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <FiShield className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-800">
                        Pending Verification
                      </p>
                      <p className="text-sm text-yellow-600">
                        Your bank details are pending admin verification
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <FiInfo className="h-5 w-5 text-blue-600 flex-shrink-0
                                 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Important</p>
                <p>Please ensure all bank details are accurate. Incorrect
                   details may result in salary payment delays.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FiCreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Bank Account Details
                </h2>
                <p className="text-sm text-gray-500">
                  For salary crediting
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Holder Name *
                </label>
                <input
                  {...register('accountHolderName', { required: 'Required' })}
                  className={`input-field ${
                    errors.accountHolderName ? 'input-error' : ''}`}
                  placeholder="As per bank records"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bank Name *
                  </label>
                  <input
                    {...register('bankName', { required: 'Required' })}
                    className={`input-field ${
                      errors.bankName ? 'input-error' : ''}`}
                    placeholder="e.g., HDFC Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Branch Name
                  </label>
                  <input
                    {...register('branchName')}
                    className="input-field"
                    placeholder="e.g., Hyderabad Main"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Number *
                </label>
                <input
                  {...register('accountNumber', {
                    required: 'Required',
                    pattern: {
                      value: /^[0-9]{9,18}$/,
                      message: 'Invalid account number'
                    }
                  })}
                  className={`input-field ${
                    errors.accountNumber ? 'input-error' : ''}`}
                  placeholder="Enter account number"
                />
                {errors.accountNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.accountNumber.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    IFSC Code *
                  </label>
                  <input
                    {...register('ifscCode', {
                      required: 'Required',
                      pattern: {
                        value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                        message: 'Invalid IFSC code'
                      }
                    })}
                    className={`input-field uppercase ${
                      errors.ifscCode ? 'input-error' : ''}`}
                    placeholder="e.g., HDFC0001234"
                  />
                  {errors.ifscCode && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.ifscCode.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Account Type
                  </label>
                  <select {...register('accountType')} className="input-field">
                    <option value="SAVINGS">Savings</option>
                    <option value="CURRENT">Current</option>
                    <option value="SALARY">Salary</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full justify-center py-3"
              >
                <FiSave />
                {saving ? 'Saving...' : bankData
                  ? 'Update Details' : 'Save Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BankDetails;