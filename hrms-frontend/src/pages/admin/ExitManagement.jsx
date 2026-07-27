import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiUserX, FiCheckCircle,
  FiFile, FiEdit2
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import exitService from '../../services/exitService';
import employeeService from '../../services/employeeService';
import { formatDate, formatCurrency, getStatusBadge } from '../../utils/helpers';

const EXIT_REASONS = [
  'BETTER_OPPORTUNITY', 'PERSONAL', 'RELOCATION', 'HEALTH',
  'HIGHER_STUDIES', 'RETIREMENT', 'TERMINATION', 'OTHER'
];

const ExitManagement = () => {
  const [exits, setExits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExit, setSelectedExit] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset,
          formState: { errors } } = useForm();

  useEffect(() => {
    fetchAll();
    fetchEmployees();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await exitService.getAll();
      setExits(res.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data.data?.filter(e => e.status === 'ACTIVE') || []);
    } catch {
      console.error('Failed to load employees');
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await exitService.initiate(data);
      toast.success('Exit request initiated');
      setIsModalOpen(false);
      reset();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearanceUpdate = async (id, field, value) => {
    try {
      await exitService.update(id, { [field]: value });
      toast.success('Updated');
      const res = await exitService.getById(id);
      setSelectedExit(res.data.data);
      fetchAll();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      await exitService.approve(id);
      toast.success('Approved');
      fetchAll();
    } catch {
      toast.error('Approve failed');
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Exit Management"
        subtitle="Manage employee resignations and offboarding"
        action={
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <FiPlus /> New Exit Request
          </button>
        }
      />

      {loading ? (
        <Loader fullScreen={false} />
      ) : exits.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiUserX}
            title="No Exit Requests"
            description="No employee has initiated exit yet"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {exits.map((exit) => (
            <div key={exit.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-800">
                      {exit.employeeName}
                    </h3>
                    <span className={getStatusBadge(exit.status)}>
                      {exit.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {exit.employeeCode} • {exit.designation} • {exit.departmentName}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-gray-400">Resigned On</p>
                      <p className="text-sm font-medium">
                        {formatDate(exit.resignationDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Last Working Day</p>
                      <p className="text-sm font-medium">
                        {formatDate(exit.lastWorkingDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Notice Period</p>
                      <p className="text-sm font-medium">
                        {exit.noticePeriodDays} days
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Reason</p>
                      <p className="text-sm font-medium">
                        {exit.reason.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Clearance Progress</span>
                      <span className="font-semibold">
                        {exit.clearanceProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${exit.clearanceProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {exit.status === 'PENDING' && (
                    <button
                      onClick={() => handleApprove(exit.id)}
                      className="btn-success"
                    >
                      <FiCheckCircle /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedExit(exit);
                      setDetailModal(true);
                    }}
                    className="btn-primary"
                  >
                    <FiEdit2 /> Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Exit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title="Initiate Exit Process"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Employee *</label>
            <select
              {...register('employeeId', { required: 'Required' })}
              className={`input-field ${errors.employeeId ? 'input-error' : ''}`}
            >
              <option value="">Select Employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Resignation Date *
              </label>
              <input
                type="date"
                {...register('resignationDate', { required: 'Required' })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Working Date *
              </label>
              <input
                type="date"
                {...register('lastWorkingDate', { required: 'Required' })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Notice Period (days)
              </label>
              <input
                type="number"
                {...register('noticePeriodDays')}
                defaultValue={30}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason *</label>
              <select
                {...register('reason', { required: 'Required' })}
                className="input-field"
              >
                <option value="">Select Reason</option>
                {EXIT_REASONS.map(r => (
                  <option key={r} value={r}>{r.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Detailed Reason
            </label>
            <textarea
              {...register('detailedReason')}
              rows={3}
              className="input-field resize-none"
              placeholder="Additional details..."
            />
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
              {submitting ? 'Submitting...' : 'Initiate Exit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail/Manage Modal */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title="Exit Process Management"
        size="xl"
      >
        {selectedExit && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-lg">{selectedExit.employeeName}</h3>
              <p className="text-sm text-gray-500">
                {selectedExit.designation} • {selectedExit.departmentName}
              </p>
            </div>

            {/* Clearances */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                Department Clearances
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['itClearance', 'IT Clearance'],
                  ['hrClearance', 'HR Clearance'],
                  ['financeClearance', 'Finance Clearance'],
                  ['managerClearance', 'Manager Clearance'],
                  ['adminClearance', 'Admin Clearance'],
                ].map(([field, label]) => (
                  <label key={field}
                         className="flex items-center gap-3 p-3 bg-gray-50
                                    rounded-lg cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={selectedExit[field] || false}
                      onChange={(e) => handleClearanceUpdate(
                          selectedExit.id, field, e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium">{label}</span>
                    {selectedExit[field] && (
                      <FiCheckCircle className="text-green-600 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Settlement */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                Final Settlement
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Settlement Amount</label>
                  <input
                    type="number"
                    defaultValue={selectedExit.finalSettlementAmount || ''}
                    onBlur={(e) => handleClearanceUpdate(
                        selectedExit.id, 'finalSettlementAmount',
                        e.target.value)}
                    className="input-field"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedExit.settlementPaid || false}
                      onChange={(e) => handleClearanceUpdate(
                          selectedExit.id, 'settlementPaid',
                          e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span>Settlement Paid</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Exit Interview */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                Exit Interview
              </h3>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedExit.exitInterviewCompleted || false}
                  onChange={(e) => handleClearanceUpdate(
                      selectedExit.id, 'exitInterviewCompleted',
                      e.target.checked)}
                  className="w-5 h-5"
                />
                <span>Exit Interview Completed</span>
              </label>
              <textarea
                defaultValue={selectedExit.exitInterviewNotes || ''}
                onBlur={(e) => handleClearanceUpdate(
                    selectedExit.id, 'exitInterviewNotes', e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Exit interview feedback..."
              />
            </div>

            {/* Experience Letter */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedExit.experienceLetterIssued || false}
                  onChange={(e) => handleClearanceUpdate(
                      selectedExit.id, 'experienceLetterIssued',
                      e.target.checked)}
                  className="w-5 h-5"
                />
                <span>Experience Letter Issued</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedExit.rehireEligible !== false}
                  onChange={(e) => handleClearanceUpdate(
                      selectedExit.id, 'rehireEligible', e.target.checked)}
                  className="w-5 h-5"
                />
                <span>Eligible for Rehire</span>
              </label>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ExitManagement;