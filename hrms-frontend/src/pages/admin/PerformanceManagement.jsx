// src/pages/admin/PerformanceManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiTarget, FiUsers, FiTrendingUp,
  FiEdit2, FiStar, FiCheckCircle
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import performanceService from '../../services/performanceService';
import employeeService from '../../services/employeeService';
import { formatDate } from '../../utils/helpers';

const TABS = ['CYCLES', 'KRAS_REVIEWS'];

const PerformanceManagement = () => {
  const [activeTab, setActiveTab] = useState('CYCLES');
  const [cycles, setCycles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [kras, setKras] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cycleModal, setCycleModal] = useState(false);
  const [kraModal, setKraModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset,
          formState: { errors } } = useForm();

  const { register: registerKra, handleSubmit: handleSubmitKra,
          reset: resetKra,
          formState: { errors: errorsKra } } = useForm();

  const { register: registerReview, handleSubmit: handleSubmitReview,
          reset: resetReview } = useForm();

  useEffect(() => {
    fetchCycles();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedCycle && selectedEmployee) {
      fetchKras();
      fetchSummary();
    }
  }, [selectedCycle, selectedEmployee]);

  const fetchCycles = async () => {
    try {
      const res = await performanceService.getAllCycles();
      setCycles(res.data.data || []);
    } catch {
      toast.error('Failed to load cycles');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data.data || []);
    } catch {
      console.error('Failed to load employees');
    }
  };

  const fetchKras = async () => {
    try {
      const res = await performanceService.getKras(
        selectedEmployee, selectedCycle);
      setKras(res.data.data || []);
    } catch {
      console.error('Failed to load KRAs');
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await performanceService.getSummary(
        selectedEmployee, selectedCycle);
      setSummary(res.data.data);
    } catch {
      console.error('Failed to load summary');
    }
  };

  const onCreateCycle = async (data) => {
    setSubmitting(true);
    try {
      await performanceService.createCycle(data);
      toast.success('Cycle created');
      setCycleModal(false);
      reset();
      fetchCycles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onCreateKra = async (data) => {
    setSubmitting(true);
    try {
      await performanceService.createKra({
        ...data,
        weightage: parseInt(data.weightage),
        employee: { id: parseInt(selectedEmployee) },
        cycle: { id: parseInt(selectedCycle) },
      });
      toast.success('KRA created');
      setKraModal(false);
      resetKra();
      fetchKras();
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitReview = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        rating: parseInt(data.rating),
        comments: data.comments,
      };

      if (reviewModal.type === 'self') {
        await performanceService.submitSelfReview(reviewModal.kraId, payload);
        toast.success('Self review submitted');
      } else {
        await performanceService.submitManagerReview(reviewModal.kraId, payload);
        toast.success('Manager review submitted');
      }

      setReviewModal(null);
      resetReview();
      fetchKras();
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const updateCycleStatus = async (id, status) => {
    try {
      await performanceService.updateCycleStatus(id, status);
      toast.success(`Cycle ${status.toLowerCase()}`);
      fetchCycles();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Performance Management"
        subtitle="Manage performance cycles, KRAs, and reviews"
        action={
          activeTab === 'CYCLES' ? (
            <button onClick={() => setCycleModal(true)} className="btn-primary">
              <FiPlus /> New Cycle
            </button>
          ) : null
        }
      />

      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2
              transition-all whitespace-nowrap
              ${activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500'}`}
          >
            {tab.replace('_', ' & ')}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : (
        <>
          {/* CYCLES TAB */}
          {activeTab === 'CYCLES' && (
            cycles.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={FiTarget}
                  title="No Performance Cycles"
                  description="Create your first performance cycle"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cycles.map(cycle => (
                  <div key={cycle.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 bg-indigo-50 rounded-xl">
                        <FiTarget className="h-6 w-6 text-indigo-600" />
                      </div>
                      <span className={
                        cycle.status === 'ACTIVE' ? 'badge-success' :
                        cycle.status === 'COMPLETED' ? 'badge-info' :
                        'badge-warning'}>
                        {cycle.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800">{cycle.name}</h3>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Start</span>
                        <span className="font-medium text-gray-700">
                          {formatDate(cycle.startDate)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>End</span>
                        <span className="font-medium text-gray-700">
                          {formatDate(cycle.endDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      {cycle.status === 'DRAFT' && (
                        <button
                          onClick={() => updateCycleStatus(cycle.id, 'ACTIVE')}
                          className="btn-success text-xs flex-1 justify-center"
                        >
                          Activate
                        </button>
                      )}
                      {cycle.status === 'ACTIVE' && (
                        <button
                          onClick={() =>
                            updateCycleStatus(cycle.id, 'COMPLETED')}
                          className="btn-primary text-xs flex-1 justify-center"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* KRAs & Reviews TAB */}
          {activeTab === 'KRAS_REVIEWS' && (
            <div className="space-y-6">
              {/* Selection */}
              <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Performance Cycle
                    </label>
                    <select
                      value={selectedCycle}
                      onChange={(e) => setSelectedCycle(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select Cycle</option>
                      {cycles.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Employee
                    </label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.fullName} ({e.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {summary && selectedCycle && selectedEmployee && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card bg-gradient-to-br
                                  from-blue-500 to-blue-600 text-white">
                    <p className="text-sm opacity-90">Overall Rating</p>
                    <p className="text-4xl font-bold mt-2">
                      {summary.overallRating || 0}
                    </p>
                    <p className="text-xs opacity-90 mt-1">out of 5</p>
                  </div>
                  <div className="card">
                    <p className="text-sm text-gray-500">Grade</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      {summary.grade}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <FiStar
                          key={i}
                          className={`h-4 w-4 ${
                            i <= Math.round(summary.overallRating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <p className="text-sm text-gray-500">Total KRAs</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      {summary.totalKras}
                    </p>
                  </div>
                </div>
              )}

              {/* KRAs */}
              {selectedCycle && selectedEmployee && (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Key Result Areas (KRAs)
                    </h2>
                    <button onClick={() => setKraModal(true)}
                            className="btn-primary">
                      <FiPlus /> Add KRA
                    </button>
                  </div>

                  {kras.length === 0 ? (
                    <div className="card">
                      <EmptyState
                        icon={FiTarget}
                        title="No KRAs Defined"
                        description="Add KRAs for this employee"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {kras.map(kra => (
                        <div key={kra.id} className="card">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800">
                                {kra.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {kra.description}
                              </p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className="badge-info text-xs">
                                Weight: {kra.weightage}%
                              </span>
                              <span className={
                                kra.status === 'COMPLETED'
                                  ? 'badge-success' : 'badge-warning'}>
                                {kra.status}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2
                                          gap-4 py-3 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-400">Target</p>
                              <p className="text-sm text-gray-700">
                                {kra.target || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Achieved</p>
                              <p className="text-sm text-gray-700">
                                {kra.achieved || '-'}
                              </p>
                            </div>
                          </div>

                          {/* Ratings Display */}
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="text-center p-2 bg-gray-50
                                            rounded-lg">
                              <p className="text-xs text-gray-500">
                                Self Rating
                              </p>
                              <p className="text-lg font-bold text-blue-600">
                                {kra.selfRating || '-'}
                                {kra.selfRating && '/5'}
                              </p>
                            </div>
                            <div className="text-center p-2 bg-gray-50
                                            rounded-lg">
                              <p className="text-xs text-gray-500">
                                Manager Rating
                              </p>
                              <p className="text-lg font-bold text-purple-600">
                                {kra.managerRating || '-'}
                                {kra.managerRating && '/5'}
                              </p>
                            </div>
                            <div className="text-center p-2 bg-primary-50
                                            rounded-lg">
                              <p className="text-xs text-gray-500">
                                Final Rating
                              </p>
                              <p className="text-lg font-bold text-primary-600">
                                {kra.finalRating || '-'}
                                {kra.finalRating && '/5'}
                              </p>
                            </div>
                          </div>

                          {kra.selfComments && (
                            <p className="text-sm text-gray-600 p-2
                                          bg-blue-50 rounded mb-2">
                              <strong>Self:</strong> {kra.selfComments}
                            </p>
                          )}
                          {kra.managerComments && (
                            <p className="text-sm text-gray-600 p-2
                                          bg-purple-50 rounded mb-2">
                              <strong>Manager:</strong> {kra.managerComments}
                            </p>
                          )}

                          <div className="flex gap-2 pt-3 border-t
                                          border-gray-100">
                            {!kra.selfRating && (
                              <button
                                onClick={() => setReviewModal({
                                  type: 'self', kraId: kra.id })}
                                className="btn-primary text-xs flex-1
                                           justify-center"
                              >
                                Submit Self Review
                              </button>
                            )}
                            {kra.selfRating && !kra.managerRating && (
                              <button
                                onClick={() => setReviewModal({
                                  type: 'manager', kraId: kra.id })}
                                className="btn-success text-xs flex-1
                                           justify-center"
                              >
                                Submit Manager Review
                              </button>
                            )}
                            {kra.status === 'COMPLETED' && (
                              <div className="flex items-center gap-2
                                              text-green-600 text-sm">
                                <FiCheckCircle />
                                Review Completed
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Cycle Modal */}
      <Modal
        isOpen={cycleModal}
        onClose={() => { setCycleModal(false); reset(); }}
        title="Create Performance Cycle"
      >
        <form onSubmit={handleSubmit(onCreateCycle)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              {...register('name', { required: 'Required' })}
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g., Q1 2026 Performance Review"
            />
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                End Date *
              </label>
              <input
                type="date"
                {...register('endDate', { required: 'Required' })}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setCycleModal(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Creating...' : 'Create Cycle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create KRA Modal */}
      <Modal
        isOpen={kraModal}
        onClose={() => { setKraModal(false); resetKra(); }}
        title="Add KRA"
        size="lg"
      >
        <form onSubmit={handleSubmitKra(onCreateKra)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              {...registerKra('title', { required: 'Required' })}
              className={`input-field ${errorsKra.title ? 'input-error' : ''}`}
              placeholder="e.g., Complete Product Feature Development"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              {...registerKra('description')}
              rows={3}
              className="input-field resize-none"
              placeholder="Detailed description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Weightage (%) *
              </label>
              <input
                type="number"
                {...registerKra('weightage', {
                  required: 'Required',
                  min: 0, max: 100
                })}
                className="input-field"
                placeholder="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target</label>
              <input
                {...registerKra('target')}
                className="input-field"
                placeholder="Expected outcome"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setKraModal(false); resetKra(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Adding...' : 'Add KRA'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => { setReviewModal(null); resetReview(); }}
        title={reviewModal?.type === 'self'
          ? 'Submit Self Review' : 'Submit Manager Review'}
      >
        <form onSubmit={handleSubmitReview(onSubmitReview)}
              className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Rating (1-5) *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <label key={n} className="flex-1">
                  <input
                    type="radio"
                    value={n}
                    {...registerReview('rating', { required: true })}
                    className="hidden peer"
                  />
                  <div className="p-3 text-center border-2 border-gray-200
                                  rounded-lg cursor-pointer
                                  peer-checked:border-primary-600
                                  peer-checked:bg-primary-50
                                  hover:border-primary-300 transition-all">
                    <p className="text-xl font-bold">{n}</p>
                    <p className="text-xs text-gray-500">
                      {n === 1 ? 'Poor' :
                       n === 2 ? 'Fair' :
                       n === 3 ? 'Good' :
                       n === 4 ? 'Very Good' : 'Excellent'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Comments
            </label>
            <textarea
              {...registerReview('comments')}
              rows={4}
              className="input-field resize-none"
              placeholder="Provide feedback..."
            />
          </div>
          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setReviewModal(null); resetReview(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default PerformanceManagement;