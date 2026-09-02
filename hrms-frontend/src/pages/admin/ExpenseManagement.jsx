// src/pages/admin/ExpenseManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiCheck, FiX, FiDollarSign, FiClock,
  FiTrendingUp, FiPackage, FiEye, FiEdit2,
  FiPlus, FiCheckCircle
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import expenseService from '../../services/expenseService';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { FaRupeeSign } from 'react-icons/fa';

const TABS = ['CLAIMS', 'CATEGORIES'];

const ExpenseManagement = () => {
  const [activeTab, setActiveTab] = useState('CLAIMS');
  const [claims, setClaims] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [reimburseModal, setReimburseModal] = useState(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [reason, setReason] = useState('');
  const [reimburseAmount, setReimburseAmount] = useState('');
  const [filter, setFilter] = useState('SUBMITTED');

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [claimsRes, catRes, statsRes] = await Promise.all([
        filter === 'ALL'
          ? expenseService.getAll()
          : expenseService.getByStatus(filter),
        expenseService.getCategories(),
        expenseService.getOverallStats(),
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

  const handleApprove = async (id) => {
    try {
      await expenseService.approve(id);
      toast.success('Approved');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Reason required');
      return;
    }
    try {
      await expenseService.reject(rejectModal, reason);
      toast.success('Rejected');
      setRejectModal(null);
      setReason('');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleReimburse = async () => {
    try {
      await expenseService.reimburse(reimburseModal.id,
        parseFloat(reimburseAmount || reimburseModal.amount));
      toast.success('Marked as reimbursed');
      setReimburseModal(null);
      setReimburseAmount('');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const openCategoryModal = (cat = null) => {
    setEditingCategory(cat);
    if (cat) {
      Object.keys(cat).forEach(k => setValue(k, cat[k]));
    } else {
      reset({ requiresReceipt: true, isActive: true });
    }
    setCategoryModal(true);
  };

  const onCategorySubmit = async (data) => {
    try {
      if (editingCategory) {
        await expenseService.updateCategory(editingCategory.id, data);
        toast.success('Category updated');
      } else {
        await expenseService.createCategory(data);
        toast.success('Category created');
      }
      setCategoryModal(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await expenseService.deleteCategory(id);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    REIMBURSED: 'bg-blue-100 text-blue-700',
  };

  return (
    <Layout>
      <PageHeader
        title="Expense Management"
        subtitle="Review and process expense claims"
        action={
          activeTab === 'CATEGORIES' && (
            <button onClick={() => openCategoryModal()} className="btn-primary">
              <FiPlus /> Add Category
            </button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600
                        text-white">
          <p className="text-sm opacity-90">Pending Approval</p>
          <p className="text-3xl font-bold mt-2">{stats.pendingCount || 0}</p>
          <p className="text-xs opacity-75 mt-1">
            {formatCurrency(stats.totalPendingAmount)}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600
                        text-white">
          <p className="text-sm opacity-90">Approved</p>
          <p className="text-3xl font-bold mt-2">{stats.approvedCount || 0}</p>
          <p className="text-xs opacity-75 mt-1">
            {formatCurrency(stats.totalApprovedAmount)}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                        text-white">
          <p className="text-sm opacity-90">Reimbursed</p>
          <p className="text-3xl font-bold mt-2">{stats.reimbursedCount || 0}</p>
          <p className="text-xs opacity-75 mt-1">
            {formatCurrency(stats.totalReimbursedAmount)}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600
                        text-white">
          <p className="text-sm opacity-90">Total Claims</p>
          <p className="text-3xl font-bold mt-2">{stats.totalClaims || 0}</p>
          <p className="text-xs opacity-75 mt-1">
            {formatCurrency(stats.totalClaimedAmount)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2
              ${activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'CLAIMS' && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['SUBMITTED', 'APPROVED', 'REIMBURSED',
              'REJECTED', 'ALL'].map(f => (
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
          ) : claims.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={FaRupeeSign}
                title="No Claims"
                description={`No ${filter.toLowerCase()} claims`}
              />
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Claim #', 'Employee', 'Category', 'Date',
                        'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs
                                              font-semibold text-gray-500
                                              uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {claims.map(claim => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">
                          {claim.claimNumber}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm">
                            {claim.employeeName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {claim.employeeCode}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {claim.categoryName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(claim.expenseDate)}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold
                                       text-primary-600">
                          {formatCurrency(claim.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1
                                             rounded-full ${
                                               statusColors[claim.status]}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => setViewModal(claim)}
                              className="p-1.5 rounded-lg hover:bg-gray-100
                                         text-gray-600"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            {claim.status === 'SUBMITTED' && (
                              <>
                                <button
                                  onClick={() => handleApprove(claim.id)}
                                  className="p-1.5 rounded-lg hover:bg-green-50
                                             text-green-600"
                                  title="Approve"
                                >
                                  <FiCheck className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setRejectModal(claim.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50
                                             text-red-600"
                                  title="Reject"
                                >
                                  <FiX className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {claim.status === 'APPROVED' && (
                              <button
                                onClick={() => {
                                  setReimburseModal(claim);
                                  setReimburseAmount(claim.amount);
                                }}
                                className="p-1.5 rounded-lg hover:bg-blue-50
                                           text-blue-600"
                                title="Mark Reimbursed"
                              >
                                <FiCheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'CATEGORIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {cat.description || 'No description'}
                  </p>
                </div>
                <span className={cat.isActive
                  ? 'badge-success text-xs'
                  : 'badge-danger text-xs'}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {cat.maxAmount && (
                <p className="text-sm text-gray-600 mt-2">
                  Max: <strong>{formatCurrency(cat.maxAmount)}</strong>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Receipt: {cat.requiresReceipt ? 'Required' : 'Optional'}
              </p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openCategoryModal(cat)}
                  className="flex-1 py-2 rounded-lg hover:bg-blue-50
                             text-blue-600 text-sm font-medium
                             flex items-center justify-center gap-1"
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="flex-1 py-2 rounded-lg hover:bg-red-50
                             text-red-600 text-sm font-medium
                             flex items-center justify-center gap-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Claim Details"
        size="lg"
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="flex justify-between pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-mono">
                  {viewModal.claimNumber}
                </p>
                <h3 className="text-xl font-bold">{viewModal.categoryName}</h3>
                <p className="text-gray-500">{viewModal.employeeName}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(viewModal.amount)}
                </p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full
                                   ${statusColors[viewModal.status]}`}>
                  {viewModal.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                ['Expense Date', formatDate(viewModal.expenseDate)],
                ['Vendor', viewModal.vendor || 'N/A'],
                ['Payment Method',
                  viewModal.paymentMethod?.replace('_', ' ')],
                ['Currency', viewModal.currency],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase mb-1">Description</p>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">
                {viewModal.description}
              </p>
            </div>

            {viewModal.receiptUrl && (
              <a href={viewModal.receiptUrl} target="_blank" rel="noreferrer"
                 className="btn-secondary w-full justify-center">
                <FiFileText /> View Receipt
              </a>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => { setRejectModal(null); setReason(''); }}
        title="Reject Claim"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Rejection Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="Explain why this claim is rejected..."
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setRejectModal(null); setReason(''); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleReject}
                    className="btn-danger flex-1 justify-center">
              <FiX /> Reject Claim
            </button>
          </div>
        </div>
      </Modal>

      {/* Reimburse Modal */}
      <Modal
        isOpen={!!reimburseModal}
        onClose={() => { setReimburseModal(null); setReimburseAmount(''); }}
        title="Process Reimbursement"
      >
        {reimburseModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Claim: <strong>{reimburseModal.claimNumber}</strong>
              </p>
              <p className="text-sm text-blue-800">
                Employee: <strong>{reimburseModal.employeeName}</strong>
              </p>
              <p className="text-sm text-blue-800">
                Claimed Amount:
                <strong>{formatCurrency(reimburseModal.amount)}</strong>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Reimbursement Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={reimburseAmount}
                onChange={(e) => setReimburseAmount(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setReimburseModal(null); setReimburseAmount(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={handleReimburse}
                      className="btn-success flex-1 justify-center">
                <FiCheckCircle /> Confirm Reimbursement
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={categoryModal}
        onClose={() => { setCategoryModal(false); reset(); }}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit(onCategorySubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              {...register('name', { required: 'Required' })}
              className={`input-field ${errors.name ? 'input-error' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Max Amount (₹)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              {...register('maxAmount')}
              className="input-field"
              placeholder="Leave empty for no limit"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('requiresReceipt')}
                     defaultChecked />
              <span className="text-sm">Requires Receipt</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('isActive')} defaultChecked />
              <span className="text-sm">Active</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setCategoryModal(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit"
                    className="btn-primary flex-1 justify-center">
              {editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default ExpenseManagement;