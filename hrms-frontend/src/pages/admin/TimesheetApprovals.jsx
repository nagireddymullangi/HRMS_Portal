// src/pages/admin/TimesheetApprovals.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiCheck, FiX, FiClock, FiFilter,
  FiCheckSquare, FiSquare
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import timesheetService from '../../services/timesheetService';
import { formatDate } from '../../utils/helpers';

const TimesheetApprovals = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');
  const [filter, setFilter] = useState('SUBMITTED');

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = filter === 'ALL'
        ? await timesheetService.getAll()
        : await timesheetService.getByStatus(filter);
      setTimesheets(res.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await timesheetService.approve(id);
      toast.success('Approved');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    try {
      await timesheetService.reject(rejectModal, reason);
      toast.success('Rejected');
      setRejectModal(null);
      setReason('');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Select timesheets first');
      return;
    }
    try {
      await timesheetService.approveBulk(selectedIds);
      toast.success(`${selectedIds.length} approved`);
      setSelectedIds([]);
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]);
  };

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  return (
    <Layout>
      <PageHeader
        title="Timesheet Approvals"
        subtitle="Review and approve timesheets"
        action={
          selectedIds.length > 0 && (
            <button onClick={handleBulkApprove} className="btn-success">
              <FiCheck /> Approve {selectedIds.length} Selected
            </button>
          )
        }
      />

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['SUBMITTED', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setSelectedIds([]); }}
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
      ) : timesheets.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiClock}
            title="No Timesheets"
            description={`No ${filter.toLowerCase()} timesheets`}
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {filter === 'SUBMITTED' && (
                    <th className="px-3 py-3">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(timesheets.map(t => t.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </th>
                  )}
                  {['Employee', 'Date', 'Project', 'Hours', 'Description',
                    'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs
                                          font-semibold text-gray-500
                                          uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timesheets.map(ts => (
                  <tr key={ts.id} className="hover:bg-gray-50">
                    {filter === 'SUBMITTED' && (
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(ts.id)}
                          onChange={() => toggleSelect(ts.id)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{ts.employeeName}</p>
                      <p className="text-xs text-gray-400">{ts.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(ts.workDate)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">{ts.projectName}</p>
                      <p className="text-xs text-gray-400">{ts.projectCode}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-primary-600">
                      {ts.hoursWorked}h
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600
                                   max-w-xs truncate">
                      {ts.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1
                                         rounded-full ${statusColors[ts.status]}`}>
                        {ts.status}
                      </span>
                      {ts.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1">
                          {ts.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ts.status === 'SUBMITTED' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleApprove(ts.id)}
                            className="p-1.5 rounded-lg hover:bg-green-50
                                       text-green-600"
                            title="Approve"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setRejectModal(ts.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50
                                       text-red-600"
                            title="Reject"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => { setRejectModal(null); setReason(''); }}
        title="Reject Timesheet"
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
              placeholder="Provide a reason for rejection..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setRejectModal(null); setReason(''); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button onClick={handleReject}
                    className="btn-danger flex-1 justify-center">
              <FiX /> Reject
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default TimesheetApprovals;