// src/pages/admin/GrievanceManagement.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiAlertCircle, FiCheckCircle, FiClock,
  FiTrendingUp, FiUserPlus, FiAlertTriangle,
  FiCheck, FiMessageSquare, FiEye
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import grievanceService from '../../services/grievanceService';
import employeeService from '../../services/employeeService';
import { formatDate } from '../../utils/helpers';

const CATEGORY_ICONS = {
  WORKPLACE: '🏢', SALARY: '💰', HARASSMENT: '⚠️',
  DISCRIMINATION: '🚫', MANAGEMENT: '👥', PEER_CONFLICT: '⚔️',
  POLICY: '📋', FACILITIES: '🏭', OTHER: '💬',
};

const GrievanceManagement = () => {
  const [grievances, setGrievances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [resolveModal, setResolveModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [resolution, setResolution] = useState('');
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [filter, setFilter] = useState('OPEN');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [grivRes, empRes, statsRes] = await Promise.all([
        filter === 'ALL'
          ? grievanceService.getAll()
          : grievanceService.getByStatus(filter),
        employeeService.getAll(),
        grievanceService.getStatistics(),
      ]);
      setGrievances(grivRes.data.data || []);
      setEmployees(empRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser) {
      toast.error('Select a user');
      return;
    }
    try {
      await grievanceService.assign(assignModal.id, parseInt(selectedUser));
      toast.success('Assigned successfully');
      setAssignModal(null);
      setSelectedUser('');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error('Resolution required');
      return;
    }
    try {
      await grievanceService.resolve(resolveModal.id, resolution);
      toast.success('Resolved');
      setResolveModal(null);
      setResolution('');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleEscalate = async (id) => {
    try {
      await grievanceService.escalate(id);
      toast.success('Escalated');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await grievanceService.addComment(viewModal.id, {
        comment, isInternal,
      });
      toast.success('Comment added');
      setComment('');
      setIsInternal(false);
      const res = await grievanceService.getById(viewModal.id);
      setViewModal(res.data.data);
    } catch {
      toast.error('Failed');
    }
  };

  const statusColors = {
    OPEN: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-700',
    ESCALATED: 'bg-red-100 text-red-700',
  };

  return (
    <Layout>
      <PageHeader
        title="Grievance Management"
        subtitle="Handle employee grievances and concerns"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Open', value: stats.open, color: 'yellow' },
          { label: 'In Progress', value: stats.inProgress, color: 'purple' },
          { label: 'Resolved', value: stats.resolved, color: 'green' },
          { label: 'Closed', value: stats.closed, color: 'blue' },
          { label: 'Escalated', value: stats.escalated, color: 'red' },
        ].map(s => (
          <div key={s.label} className={`card bg-gradient-to-br
            from-${s.color}-500 to-${s.color}-600 text-white text-center`}>
            <p className="text-xs opacity-90">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value || 0}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED',
          'ESCALATED', 'ALL'].map(f => (
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
      ) : grievances.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiAlertCircle}
            title="No Grievances"
            description={`No ${filter.toLowerCase()} grievances`}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {grievances.map(g => (
            <div key={g.id} className="card hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xl">
                      {CATEGORY_ICONS[g.category]}
                    </span>
                    <p className="text-xs text-gray-400 font-mono">
                      {g.ticketNumber}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5
                                       rounded-full ${statusColors[g.status]}`}>
                      {g.status.replace('_', ' ')}
                    </span>
                    {g.priority === 'HIGH' || g.priority === 'CRITICAL' ? (
                      <span className="text-xs font-bold text-red-600
                                       flex items-center gap-1">
                        <FiAlertTriangle className="h-3 w-3" />
                        {g.priority}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        {g.priority}
                      </span>
                    )}
                    {g.isAnonymous && (
                      <span className="text-xs bg-purple-100 text-purple-700
                                       px-2 py-0.5 rounded-full">
                        🔒 Anonymous
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-800">{g.subject}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {g.description}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs
                                  text-gray-500 flex-wrap">
                    <span>By: {g.employeeName}</span>
                    <span>Submitted: {formatDate(g.createdAt)}</span>
                    {g.assignedToName && (
                      <span>Assigned: {g.assignedToName}</span>
                    )}
                    {g.comments?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FiMessageSquare className="h-3 w-3" />
                        {g.comments.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 ml-4">
                  <button
                    onClick={() => setViewModal(g)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                    title="View & Comment"
                  >
                    <FiEye />
                  </button>
                  {g.status !== 'CLOSED' && g.status !== 'RESOLVED' && (
                    <>
                      {!g.assignedTo && (
                        <button
                          onClick={() => setAssignModal(g)}
                          className="p-2 rounded-lg hover:bg-purple-50
                                     text-purple-600"
                          title="Assign"
                        >
                          <FiUserPlus />
                        </button>
                      )}
                      <button
                        onClick={() => setResolveModal(g)}
                        className="p-2 rounded-lg hover:bg-green-50
                                   text-green-600"
                        title="Resolve"
                      >
                        <FiCheck />
                      </button>
                      {g.status !== 'ESCALATED' && (
                        <button
                          onClick={() => handleEscalate(g.id)}
                          className="p-2 rounded-lg hover:bg-red-50
                                     text-red-600"
                          title="Escalate"
                        >
                          <FiAlertTriangle />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title=""
        size="lg"
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {CATEGORY_ICONS[viewModal.category]}
                </span>
                <p className="text-xs text-gray-400 font-mono">
                  {viewModal.ticketNumber}
                </p>
                <span className={`text-xs font-medium px-2 py-0.5
                                   rounded-full ${
                                     statusColors[viewModal.status]}`}>
                  {viewModal.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {viewModal.subject}
              </h2>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Submitted By</p>
                  <p className="font-medium">{viewModal.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Priority</p>
                  <p className="font-medium">{viewModal.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Assigned To</p>
                  <p className="font-medium">
                    {viewModal.assignedToName || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Submitted On</p>
                  <p className="font-medium">
                    {formatDate(viewModal.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase mb-2">
                Description
              </p>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">
                {viewModal.description}
              </p>
            </div>

            {viewModal.resolution && (
              <div>
                <p className="text-xs text-gray-400 uppercase mb-2">
                  Resolution
                </p>
                <p className="text-sm bg-green-50 border border-green-200
                              p-3 rounded-lg text-green-800">
                  {viewModal.resolution}
                </p>
              </div>
            )}

            {viewModal.satisfactionRating && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600">Employee Feedback</p>
                <div className="flex items-center gap-2 mt-1">
                  {'★'.repeat(viewModal.satisfactionRating)}
                  <span className="text-sm text-blue-800">
                    ({viewModal.satisfactionRating}/5)
                  </span>
                </div>
                {viewModal.feedback && (
                  <p className="text-sm mt-2">{viewModal.feedback}</p>
                )}
              </div>
            )}

            {/* Comments */}
            <div>
              <p className="text-xs text-gray-400 uppercase mb-2">
                Conversation
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {viewModal.comments?.map(c => (
                  <div key={c.id}
                       className={`p-3 rounded-lg ${
                         c.isInternal
                           ? 'bg-yellow-50 border border-yellow-200'
                           : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold">{c.userName}</p>
                        {c.isInternal && (
                          <span className="text-xs bg-yellow-200
                                           text-yellow-800 px-1.5 py-0.5
                                           rounded">
                            🔒 Internal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm">{c.comment}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Add a comment..."
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                    />
                    Internal note (not visible to employee)
                  </label>
                  <button onClick={handleAddComment}
                          className="btn-primary text-sm">
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => { setAssignModal(null); setSelectedUser(''); }}
        title="Assign Grievance"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Assign to *
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="input-field"
            >
              <option value="">Select User</option>
              {employees.map(e => (
                <option key={e.id} value={e.userId}>
                  {e.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setAssignModal(null); setSelectedUser(''); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button onClick={handleAssign}
                    className="btn-primary flex-1 justify-center">
              Assign
            </button>
          </div>
        </div>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={!!resolveModal}
        onClose={() => { setResolveModal(null); setResolution(''); }}
        title="Resolve Grievance"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Resolution Description *
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={6}
              className="input-field resize-none"
              placeholder="Describe how this grievance was resolved..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setResolveModal(null); setResolution(''); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button onClick={handleResolve}
                    className="btn-success flex-1 justify-center">
              <FiCheck /> Mark Resolved
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default GrievanceManagement;