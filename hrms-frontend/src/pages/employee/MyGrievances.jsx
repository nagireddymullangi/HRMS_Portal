// src/pages/employee/MyGrievances.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiAlertCircle, FiCheckCircle,
  FiClock, FiMessageSquare, FiStar, FiEye,
  FiTrendingUp
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import grievanceService from '../../services/grievanceService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const CATEGORY_ICONS = {
  WORKPLACE: '🏢',
  SALARY: '💰',
  HARASSMENT: '⚠️',
  DISCRIMINATION: '🚫',
  MANAGEMENT: '👥',
  PEER_CONFLICT: '⚔️',
  POLICY: '📋',
  FACILITIES: '🏭',
  OTHER: '💬',
};

const MyGrievances = () => {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (user?.employeeId) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await grievanceService.getByEmployee(user.employeeId);
      setGrievances(res.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await grievanceService.create({
        ...data,
        employee: { id: user.employeeId },
        isAnonymous: data.isAnonymous || false,
      });
      toast.success('Grievance submitted successfully');
      setModalOpen(false);
      reset();
      fetchData();
    } catch {
      toast.error('Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await grievanceService.addComment(viewModal.id, {
        comment,
        isInternal: false,
      });
      toast.success('Comment added');
      setComment('');
      const res = await grievanceService.getById(viewModal.id);
      setViewModal(res.data.data);
    } catch {
      toast.error('Failed');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await grievanceService.submitFeedback(feedbackModal.id, {
        rating,
        feedback: feedbackText,
      });
      toast.success('Feedback submitted');
      setFeedbackModal(null);
      setFeedbackText('');
      setRating(5);
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const stats = {
    total: grievances.length,
    open: grievances.filter(g => g.status === 'OPEN').length,
    inProgress: grievances.filter(g =>
      ['UNDER_REVIEW', 'IN_PROGRESS'].includes(g.status)).length,
    resolved: grievances.filter(g =>
      ['RESOLVED', 'CLOSED'].includes(g.status)).length,
  };

  const statusColors = {
    OPEN: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-700',
    ESCALATED: 'bg-red-100 text-red-700',
  };

  const priorityColors = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-yellow-600',
    HIGH: 'text-orange-600',
    CRITICAL: 'text-red-600',
  };

  return (
    <Layout>
      <PageHeader
        title="My Grievances"
        subtitle="Submit and track your grievances"
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <FiPlus /> Submit Grievance
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                        text-white">
          <p className="text-sm opacity-90">Total</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600
                        text-white">
          <p className="text-sm opacity-90">Open</p>
          <p className="text-3xl font-bold mt-2">{stats.open}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600
                        text-white">
          <p className="text-sm opacity-90">In Progress</p>
          <p className="text-3xl font-bold mt-2">{stats.inProgress}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600
                        text-white">
          <p className="text-sm opacity-90">Resolved</p>
          <p className="text-3xl font-bold mt-2">{stats.resolved}</p>
        </div>
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : grievances.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiAlertCircle}
            title="No Grievances"
            description="Submit a grievance if you have concerns"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {grievances.map(g => (
            <div key={g.id}
                 className="card hover:shadow-md cursor-pointer"
                 onClick={() => setViewModal(g)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
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
                    <span className={`text-xs font-medium
                                       ${priorityColors[g.priority]}`}>
                      • {g.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mt-1">
                    {g.subject}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {g.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs
                                  text-gray-500">
                    <span>Submitted: {formatDate(g.createdAt)}</span>
                    {g.comments && (
                      <span className="flex items-center gap-1">
                        <FiMessageSquare className="h-3 w-3" />
                        {g.comments.length} comments
                      </span>
                    )}
                  </div>
                </div>

                {g.status === 'RESOLVED' && !g.satisfactionRating && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeedbackModal(g);
                    }}
                    className="btn-success text-xs"
                  >
                    <FiStar /> Rate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title="Submit New Grievance"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              🔒 Your grievance will be handled confidentially by HR.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>
              <select
                {...register('category', { required: 'Required' })}
                className={`input-field ${errors.category ? 'input-error' : ''}`}
              >
                <option value="">Select Category</option>
                <option value="WORKPLACE">🏢 Workplace</option>
                <option value="SALARY">💰 Salary</option>
                <option value="HARASSMENT">⚠️ Harassment</option>
                <option value="DISCRIMINATION">🚫 Discrimination</option>
                <option value="MANAGEMENT">👥 Management</option>
                <option value="PEER_CONFLICT">⚔️ Peer Conflict</option>
                <option value="POLICY">📋 Policy</option>
                <option value="FACILITIES">🏭 Facilities</option>
                <option value="OTHER">💬 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Priority
              </label>
              <select {...register('priority')} className="input-field"
                      defaultValue="MEDIUM">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Subject *
            </label>
            <input
              {...register('subject', { required: 'Required' })}
              className={`input-field ${errors.subject ? 'input-error' : ''}`}
              placeholder="Brief title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Required' })}
              rows={6}
              className={`input-field resize-none ${
                errors.description ? 'input-error' : ''}`}
              placeholder="Provide detailed description of the issue..."
            />
          </div>

          <label className="flex items-center gap-2 p-3 bg-yellow-50
                            rounded-lg">
            <input type="checkbox" {...register('isAnonymous')} />
            <span className="text-sm">
              🔒 Submit anonymously (your identity won't be visible)
            </span>
          </label>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Submitting...' : 'Submit Grievance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal with Comments */}
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
              <p className="text-xs text-gray-500 mt-1">
                Submitted: {formatDate(viewModal.createdAt)}
              </p>
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

            {/* Comments Thread */}
            <div>
              <p className="text-xs text-gray-400 uppercase mb-2">
                Conversation
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {viewModal.comments?.filter(c => !c.isInternal).map(c => (
                  <div key={c.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-semibold text-gray-700">
                        {c.userName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm">{c.comment}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  className="input-field flex-1"
                />
                <button onClick={handleAddComment} className="btn-primary">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={!!feedbackModal}
        onClose={() => setFeedbackModal(null)}
        title="Rate Resolution"
      >
        {feedbackModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              How satisfied are you with the resolution?
            </p>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-4xl transition-transform hover:scale-110
                    ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Feedback (Optional)
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Share your thoughts..."
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setFeedbackModal(null)}
                      className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleSubmitFeedback}
                      className="btn-success flex-1 justify-center">
                Submit Feedback
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default MyGrievances;