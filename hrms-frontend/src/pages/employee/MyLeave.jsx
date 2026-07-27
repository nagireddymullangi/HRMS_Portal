// src/pages/employee/MyLeave.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiFileText, FiTrash2
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import leaveService from '../../services/leaveService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStatusBadge } from '../../utils/helpers';

const MyLeave = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch,
          formState: { errors } } = useForm();

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const totalDays = startDate && endDate
    ? Math.max(0, Math.round(
        (new Date(endDate) - new Date(startDate)) /
        (1000 * 60 * 60 * 24)) + 1)
    : 0;

  useEffect(() => {
    if (user?.employeeId) {
      fetchLeaves();
      fetchLeaveTypes();
    }
  }, [user]);

  const fetchLeaves = async () => {
    try {
      const res = await leaveService.getByEmployee(user.employeeId);
      setLeaves(res.data.data || []);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await leaveService.getLeaveTypes();
      setLeaveTypes(res.data.data || []);
    } catch {
      console.error('Failed to load leave types');
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await leaveService.apply(user.employeeId, data);
      toast.success('Leave application submitted!');
      setIsModalOpen(false);
      reset();
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await leaveService.delete(deleteId);
      toast.success('Leave cancelled');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const stats = {
    pending: leaves.filter(l => l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  };

  return (
    <Layout>
      <PageHeader
        title="My Leave Requests"
        subtitle="Apply and track your leave requests"
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            <FiPlus className="h-4 w-4" /> Apply Leave
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending', value: stats.pending,
            color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Approved', value: stats.approved,
            color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Rejected', value: stats.rejected,
            color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.label} className={`card ${s.bg} border-none`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : leaves.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiFileText}
            title="No Leave Requests"
            description="Apply for leave when needed"
            action={
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
              >
                <FiPlus /> Apply Leave
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <div key={leave.id}
                 className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {leave.leaveTypeName}
                    </h3>
                    <span className={getStatusBadge(leave.status)}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 
                                  gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">From</p>
                      <p className="font-medium text-gray-700">
                        {formatDate(leave.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">To</p>
                      <p className="font-medium text-gray-700">
                        {formatDate(leave.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Total Days</p>
                      <p className="font-medium text-gray-700">
                        {leave.totalDays} days
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Applied On</p>
                      <p className="font-medium text-gray-700">
                        {formatDate(leave.appliedAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Reason:</span> {leave.reason}
                  </p>
                  {leave.adminComment && (
                    <p className="text-sm mt-1 text-blue-600">
                      <span className="font-medium">Admin Comment:</span>{' '}
                      {leave.adminComment}
                    </p>
                  )}
                </div>
                {leave.status === 'PENDING' && (
                  <button
                    onClick={() => setDeleteId(leave.id)}
                    className="p-2 rounded-lg hover:bg-red-50 
                               text-red-500 transition-colors ml-4"
                    title="Cancel Leave"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title="Apply for Leave"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type *
            </label>
            <select
              {...register('leaveTypeId', {
                required: 'Leave type is required'
              })}
              className={`input-field ${
                errors.leaveTypeId ? 'input-error' : ''}`}
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} (Max: {lt.maxDays} days)
                </option>
              ))}
            </select>
            {errors.leaveTypeId && (
              <p className="text-xs text-red-600 mt-1">
                {errors.leaveTypeId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium 
                                text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                {...register('startDate', {
                  required: 'Start date is required'
                })}
                min={today}
                className={`input-field ${
                  errors.startDate ? 'input-error' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium 
                                text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                {...register('endDate', {
                  required: 'End date is required'
                })}
                min={startDate}
                className={`input-field ${
                  errors.endDate ? 'input-error' : ''}`}
              />
            </div>
          </div>

          {totalDays > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <span className="text-blue-700 font-semibold text-sm">
                📅 Total: {totalDays} day{totalDays > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason *
            </label>
            <textarea
              {...register('reason', { required: 'Reason is required' })}
              rows={3}
              className={`input-field resize-none ${
                errors.reason ? 'input-error' : ''}`}
              placeholder="Please provide reason for leave..."
            />
            {errors.reason && (
              <p className="text-xs text-red-600 mt-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); reset(); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 justify-center"
            >
              {submitting ? 'Submitting...' : 'Apply Leave'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Cancel Leave"
        message="Cancel this leave request?"
        confirmText="Yes, Cancel"
      />
    </Layout>
  );
};

const today = new Date().toISOString().split('T')[0];
export default MyLeave;