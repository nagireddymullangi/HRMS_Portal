// src/pages/admin/LeaveManagement.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiFileText, FiCheck, FiX, FiFilter,
  FiMessageSquare
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import leaveService from '../../services/leaveService';
import { getStatusBadge, formatDate } from '../../utils/helpers';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionModal, setActionModal] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const res = await leaveService.getAll();
      setLeaves(res.data.data || []);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'ALL'
    ? leaves
    : leaves.filter(l => l.status === filter);

  const handleAction = async (action) => {
    setSubmitting(true);
    try {
      await leaveService.updateStatus(actionModal.id, {
        status: action,
        adminComment: comment
      });
      toast.success(`Leave ${action.toLowerCase()}d successfully`);
      setActionModal(null);
      setComment('');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    all: leaves.length,
    pending: leaves.filter(l => l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  };

  return (
    <Layout>
      <PageHeader
        title="Leave Management"
        subtitle="Review and manage employee leave requests"
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'ALL', label: `All (${stats.all})` },
          { key: 'PENDING', label: `Pending (${stats.pending})` },
          { key: 'APPROVED', label: `Approved (${stats.approved})` },
          { key: 'REJECTED', label: `Rejected (${stats.rejected})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${filter === f.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiFileText}
            title="No Leave Requests"
            description="No leave requests found for the selected filter"
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Employee', 'Leave Type', 'Duration',
                    'Days', 'Reason', 'Status', 'Actions'].map((h) => (
                    <th key={h}
                        className="px-4 py-3 text-left text-xs 
                                   font-semibold text-gray-500 
                                   uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((leave) => (
                  <tr key={leave.id}
                      className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-800">
                        {leave.employeeName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {leave.employeeCode}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {leave.leaveTypeName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <p>{formatDate(leave.startDate)}</p>
                      <p className="text-xs text-gray-400">
                        to {formatDate(leave.endDate)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold 
                                   text-gray-700">
                      {leave.totalDays}d
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 
                                   max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(leave.status)}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {leave.status === 'PENDING' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setActionModal(leave)}
                            className="p-2 rounded-lg hover:bg-green-50 
                                       text-green-600 transition-colors"
                            title="Approve/Reject"
                          >
                            <FiMessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          {leave.adminComment || 'No comment'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => { setActionModal(null); setComment(''); }}
        title="Review Leave Request"
      >
        {actionModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Employee</span>
                <span className="text-sm font-medium">
                  {actionModal.employeeName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Leave Type</span>
                <span className="text-sm font-medium">
                  {actionModal.leaveTypeName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Duration</span>
                <span className="text-sm font-medium">
                  {formatDate(actionModal.startDate)} -
                  {formatDate(actionModal.endDate)}
                  ({actionModal.totalDays} days)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Reason</span>
                <span className="text-sm font-medium max-w-xs text-right">
                  {actionModal.reason}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Add a comment..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleAction('REJECTED')}
                disabled={submitting}
                className="btn-danger flex-1 justify-center"
              >
                <FiX className="h-4 w-4" />
                {submitting ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleAction('APPROVED')}
                disabled={submitting}
                className="btn-success flex-1 justify-center"
              >
                <FiCheck className="h-4 w-4" />
                {submitting ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
export default LeaveManagement;