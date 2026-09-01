// src/pages/admin/OnboardingManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiCheckCircle, FiClock, FiUser,
  FiTrendingUp, FiAlertCircle, FiEye, FiPlay
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import onboardingService from '../../services/onboardingService';
import employeeService from '../../services/employeeService';
import { useNavigate } from 'react-router-dom';
import { formatDate, getInitials } from '../../utils/helpers';

const OnboardingManagement = () => {
  const navigate = useNavigate();
  const [onboardings, setOnboardings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [onbRes, empRes, statsRes] = await Promise.all([
        onboardingService.getAll(),
        employeeService.getAll(),
        onboardingService.getStatistics(),
      ]);
      setOnboardings(onbRes.data.data || []);
      setEmployees(empRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await onboardingService.initiate(data.employeeId, {
        startDate: data.startDate,
        expectedCompletionDate: data.expectedCompletionDate,
        assignedHrId: data.assignedHrId ? parseInt(data.assignedHrId) : null,
        assignedManagerId: data.assignedManagerId
          ? parseInt(data.assignedManagerId) : null,
        notes: data.notes,
      });
      toast.success('Onboarding initiated with default tasks!');
      setModalOpen(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'ALL' ? onboardings
    : onboardings.filter(o => o.status === filter);

  const onboardedIds = new Set(onboardings.map(o => o.employee?.id));
  const eligibleEmployees = employees.filter(e => !onboardedIds.has(e.id));

  const getStatusColor = (status) => {
    const colors = {
      INITIATED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      ON_HOLD: 'bg-orange-100 text-orange-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.INITIATED;
  };

  return (
    <Layout>
      <PageHeader
        title="Employee Onboarding"
        subtitle="Manage new hire onboarding process"
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <FiPlus /> Start Onboarding
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                        text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold mt-2">
                {stats.total || 0}
              </p>
            </div>
            <FiUser className="h-10 w-10 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600
                        text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">In Progress</p>
              <p className="text-3xl font-bold mt-2">
                {stats.inProgress || 0}
              </p>
            </div>
            <FiClock className="h-10 w-10 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600
                        text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Completed</p>
              <p className="text-3xl font-bold mt-2">
                {stats.completed || 0}
              </p>
            </div>
            <FiCheckCircle className="h-10 w-10 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600
                        text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">New</p>
              <p className="text-3xl font-bold mt-2">
                {stats.initiated || 0}
              </p>
            </div>
            <FiTrendingUp className="h-10 w-10 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'INITIATED', 'IN_PROGRESS', 'COMPLETED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium
              ${filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiUser}
            title="No Onboarding Records"
            description="Start onboarding for new hires"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(o => (
            <div key={o.id} className="card">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br
                                from-blue-500 to-indigo-600 flex items-center
                                justify-center text-white font-bold flex-shrink-0">
                  {getInitials(o.employee?.firstName + ' ' + o.employee?.lastName)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {o.employee?.firstName} {o.employee?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {o.employee?.employeeId} • {o.employee?.designation}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full
                                       ${getStatusColor(o.status)}`}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-semibold text-primary-600">
                        {o.completionPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600
                                   h-2 rounded-full transition-all"
                        style={{ width: `${o.completionPercentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 mt-3 text-xs
                                  text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiPlay />
                      Start: {formatDate(o.startDate)}
                    </span>
                    {o.expectedCompletionDate && (
                      <span className="flex items-center gap-1">
                        <FiClock />
                        Expected: {formatDate(o.expectedCompletionDate)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/admin/onboarding/${o.id}`)}
                    className="btn-primary w-full mt-3 justify-center py-2 text-sm"
                  >
                    <FiEye /> View Tasks & Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Initiate Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title="Start Onboarding Process"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                A default set of 15 onboarding tasks will be automatically
                created including documents, orientation, IT setup, and training.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Employee *
            </label>
            <select
              {...register('employeeId', { required: 'Required' })}
              className={`input-field ${
                errors.employeeId ? 'input-error' : ''}`}
            >
              <option value="">Select Employee</option>
              {eligibleEmployees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeId})
                </option>
              ))}
            </select>
            {eligibleEmployees.length === 0 && (
              <p className="text-xs text-orange-500 mt-1">
                All employees are already in onboarding
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date *
              </label>
              <input
                type="date"
                {...register('startDate', { required: 'Required' })}
                className="input-field"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expected Completion
              </label>
              <input
                type="date"
                {...register('expectedCompletionDate')}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign HR
              </label>
              <select {...register('assignedHrId')} className="input-field">
                <option value="">Select HR</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign Manager
              </label>
              <select {...register('assignedManagerId')} className="input-field">
                <option value="">Select Manager</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="input-field resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Starting...' : 'Start Onboarding'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default OnboardingManagement;