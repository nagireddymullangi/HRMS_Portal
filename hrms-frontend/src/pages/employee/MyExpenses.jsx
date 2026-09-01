// src/pages/employee/MyExpenses.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiDollarSign, FiSend, FiEdit2,
  FiTrash2, FiUpload, FiClock, FiCheckCircle,
  FiXCircle, FiFileText
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import expenseService from '../../services/expenseService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency } from '../../utils/helpers';

const MyExpenses = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset, setValue, watch,
          formState: { errors } } = useForm();

  const selectedCategoryId = watch('categoryId');
  const selectedCategory = categories.find(
    c => c.id === parseInt(selectedCategoryId));

  useEffect(() => {
    if (user?.employeeId) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [claimsRes, catRes, statsRes] = await Promise.all([
        expenseService.getByEmployee(user.employeeId),
        expenseService.getActiveCategories(),
        expenseService.getEmployeeStats(user.employeeId),
      ]);
      setClaims(claimsRes.data.data || []);
      setCategories(catRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (claim = null) => {
    setEditing(claim);
    if (claim) {
      Object.keys(claim).forEach(k => setValue(k, claim[k]));
    } else {
      reset({
        currency: 'INR',
        paymentMethod: 'CASH',
        expenseDate: new Date().toISOString().split('T')[0],
      });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        employee: { id: user.employeeId },
        categoryId: parseInt(data.categoryId),
        projectId: data.projectId ? parseInt(data.projectId) : null,
        amount: parseFloat(data.amount),
      };

      if (editing) {
        await expenseService.update(editing.id, payload);
        toast.success('Claim updated');
      } else {
        await expenseService.create(payload);
        toast.success('Claim created');
      }
      setModalOpen(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClaim = async (id) => {
    try {
      await expenseService.submit(id);
      toast.success('Submitted for approval');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async () => {
    try {
      await expenseService.delete(deleteId);
      toast.success('Deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = filter === 'ALL' ? claims
    : claims.filter(c => c.status === filter);

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    REIMBURSED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  };

  return (
    <Layout>
      <PageHeader
        title="My Expense Claims"
        subtitle="Submit and track your expense claims"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> New Claim
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                        text-white">
          <p className="text-sm opacity-90">This Month</p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(stats.monthTotal)}
          </p>
          <p className="text-xs opacity-75 mt-1">Approved amount</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600
                        text-white">
          <p className="text-sm opacity-90">This Year</p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(stats.yearTotal)}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600
                        text-white">
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-3xl font-bold mt-2">
            {stats.submittedCount || 0}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600
                        text-white">
          <p className="text-sm opacity-90">Reimbursed</p>
          <p className="text-3xl font-bold mt-2">
            {stats.reimbursedCount || 0}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED',
          'REJECTED', 'REIMBURSED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium
              ${filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiDollarSign}
            title="No Expense Claims"
            description="Submit your first expense claim"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(claim => (
            <div key={claim.id} className="card hover:shadow-md">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-400 font-mono">
                    {claim.claimNumber}
                  </p>
                  <h3 className="font-bold text-gray-800 mt-1">
                    {claim.categoryName}
                  </h3>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full
                                   ${statusColors[claim.status]}`}>
                  {claim.status}
                </span>
              </div>

              <p className="text-3xl font-bold text-primary-600 mt-2">
                {formatCurrency(claim.amount)}
              </p>

              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">
                    {formatDate(claim.expenseDate)}
                  </span>
                </div>
                {claim.vendor && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vendor</span>
                    <span className="font-medium">{claim.vendor}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium">
                    {claim.paymentMethod?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {claim.description && (
                <p className="text-sm text-gray-600 mt-3 p-2 bg-gray-50
                              rounded-lg">
                  {claim.description}
                </p>
              )}

              {claim.rejectedReason && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200
                                rounded-lg">
                  <p className="text-xs font-semibold text-red-700">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-red-600">
                    {claim.rejectedReason}
                  </p>
                </div>
              )}

              {claim.status === 'REIMBURSED' && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200
                                rounded-lg">
                  <p className="text-xs font-semibold text-blue-700">
                    ✓ Reimbursed: {formatCurrency(claim.reimbursedAmount)}
                  </p>
                  <p className="text-xs text-blue-600">
                    on {formatDate(claim.reimbursedAt)}
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                {claim.status === 'DRAFT' && (
                  <>
                    <button
                      onClick={() => handleSubmitClaim(claim.id)}
                      className="btn-success text-xs flex-1 justify-center"
                    >
                      <FiSend /> Submit
                    </button>
                    <button
                      onClick={() => openModal(claim)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => setDeleteId(claim.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
                {claim.status === 'REJECTED' && (
                  <button
                    onClick={() => openModal(claim)}
                    className="btn-primary text-xs flex-1 justify-center"
                  >
                    <FiEdit2 /> Edit & Resubmit
                  </button>
                )}
                {claim.receiptUrl && (
                  <a href={claim.receiptUrl} target="_blank" rel="noreferrer"
                     className="p-2 rounded-lg hover:bg-purple-50
                                text-purple-600">
                    <FiFileText />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? 'Edit Claim' : 'New Expense Claim'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>
              <select
                {...register('categoryId', { required: 'Required' })}
                className={`input-field ${
                  errors.categoryId ? 'input-error' : ''}`}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.maxAmount && ` (Max: ${formatCurrency(c.maxAmount)})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                {...register('expenseDate', { required: 'Required' })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { required: 'Required' })}
                className={`input-field ${errors.amount ? 'input-error' : ''}`}
                placeholder="0.00"
              />
              {selectedCategory?.maxAmount && (
                <p className="text-xs text-orange-600 mt-1">
                  Max allowed: {formatCurrency(selectedCategory.maxAmount)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Currency
              </label>
              <select {...register('currency')} className="input-field">
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <input
                {...register('vendor')}
                className="input-field"
                placeholder="e.g., Uber, Amazon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Method
              </label>
              <select {...register('paymentMethod')} className="input-field">
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Required' })}
              rows={3}
              className={`input-field resize-none ${
                errors.description ? 'input-error' : ''}`}
              placeholder="Explain the expense..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Receipt URL
              {selectedCategory?.requiresReceipt && (
                <span className="text-red-500"> *</span>
              )}
            </label>
            <input
              {...register('receiptUrl')}
              className="input-field"
              placeholder="Upload to cloud & paste URL"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload receipt to Google Drive/Dropbox and paste shareable link
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Notes
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              className="input-field resize-none"
              placeholder="Optional notes..."
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
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create Claim'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Claim"
        message="This claim will be permanently deleted."
      />
    </Layout>
  );
};

export default MyExpenses;