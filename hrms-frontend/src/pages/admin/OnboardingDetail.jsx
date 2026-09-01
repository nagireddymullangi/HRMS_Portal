// src/pages/admin/OnboardingDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiArrowLeft, FiPlus, FiCheckCircle, FiCircle,
  FiClock, FiUser, FiEdit2, FiTrash2, FiFlag
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import onboardingService from '../../services/onboardingService';
import { formatDate } from '../../utils/helpers';

const CATEGORY_ICONS = {
  DOCUMENT: '📄',
  ORIENTATION: '👥',
  IT_SETUP: '💻',
  TRAINING: '📚',
  PAPERWORK: '✍️',
  COMPLIANCE: '⚖️',
  OTHER: '📌',
};

const CATEGORY_COLORS = {
  DOCUMENT: 'bg-blue-50 border-blue-200',
  ORIENTATION: 'bg-purple-50 border-purple-200',
  IT_SETUP: 'bg-green-50 border-green-200',
  TRAINING: 'bg-yellow-50 border-yellow-200',
  PAPERWORK: 'bg-pink-50 border-pink-200',
  COMPLIANCE: 'bg-red-50 border-red-200',
  OTHER: 'bg-gray-50 border-gray-200',
};

const OnboardingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [onboarding, setOnboarding] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [onbRes, tasksRes] = await Promise.all([
        onboardingService.getById(id),
        onboardingService.getTasks(id),
      ]);
      setOnboarding(onbRes.data.data);
      setTasks(tasksRes.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openTaskModal = (task = null) => {
    setEditingTask(task);
    if (task) {
      Object.keys(task).forEach(k => setValue(k, task[k]));
    } else {
      reset({
        category: 'OTHER',
        priority: 'MEDIUM',
        status: 'PENDING',
        isRequired: true,
      });
    }
    setTaskModal(true);
  };

  const onSubmitTask = async (data) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await onboardingService.updateTask(editingTask.id, data);
        toast.success('Task updated');
      } else {
        await onboardingService.addTask(id, data);
        toast.success('Task added');
      }
      setTaskModal(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      if (task.status === 'COMPLETED') {
        await onboardingService.updateTask(task.id,
          { ...task, status: 'PENDING' });
      } else {
        await onboardingService.completeTask(task.id);
      }
      fetchData();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    try {
      await onboardingService.deleteTask(deleteId);
      toast.success('Task deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = filter === 'ALL' ? tasks
    : filter === 'PENDING' ? tasks.filter(t => t.status === 'PENDING')
    : filter === 'COMPLETED' ? tasks.filter(t => t.status === 'COMPLETED')
    : tasks;

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
  };

  if (loading) return <Layout><Loader /></Layout>;
  if (!onboarding) return <Layout><p>Not found</p></Layout>;

  const emp = onboarding.employee;

  return (
    <Layout>
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/onboarding')}
        className="flex items-center gap-2 text-gray-600
                   hover:text-gray-800 mb-4"
      >
        <FiArrowLeft /> Back to Onboarding List
      </button>

      {/* Header Card */}
      <div className="card bg-gradient-to-r from-blue-600 to-indigo-700
                      text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {emp?.firstName} {emp?.lastName}
            </h1>
            <p className="opacity-90 mt-1">
              {emp?.employeeId} • {emp?.designation || 'N/A'}
            </p>
            <p className="opacity-90 text-sm mt-1">
              {emp?.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Overall Progress</p>
            <p className="text-4xl font-bold">
              {onboarding.completionPercentage || 0}%
            </p>
            <p className="text-xs opacity-90 mt-1">
              Status: {onboarding.status.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="mt-4 w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all"
            style={{ width: `${onboarding.completionPercentage || 0}%` }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4
                        border-t border-white/20">
          <div>
            <p className="text-xs opacity-75">Start Date</p>
            <p className="font-medium">{formatDate(onboarding.startDate)}</p>
          </div>
          <div>
            <p className="text-xs opacity-75">Expected Completion</p>
            <p className="font-medium">
              {formatDate(onboarding.expectedCompletionDate)}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-75">Assigned HR</p>
            <p className="font-medium">
              {onboarding.assignedHrId ? '✓ Assigned' : 'Not Assigned'}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-75">Assigned Manager</p>
            <p className="font-medium">
              {onboarding.assignedManagerId ? '✓ Assigned' : 'Not Assigned'}
            </p>
          </div>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Completed', value: stats.completed, color: 'green' },
          { label: 'Pending', value: stats.pending, color: 'yellow' },
          { label: 'In Progress', value: stats.inProgress, color: 'orange' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-3xl font-bold text-${s.color}-600`}>
              {s.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tasks Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
        <div className="flex gap-2">
          <div className="flex gap-1">
            {['ALL', 'PENDING', 'COMPLETED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium
                  ${filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => openTaskModal()} className="btn-primary">
            <FiPlus /> Add Task
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filtered.map(task => (
          <div
            key={task.id}
            className={`card border-l-4 ${
              task.status === 'COMPLETED'
                ? 'border-green-500 bg-green-50/30'
                : task.priority === 'HIGH'
                ? 'border-red-500'
                : task.priority === 'MEDIUM'
                ? 'border-yellow-500'
                : 'border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggleComplete(task)}
                className="mt-1 flex-shrink-0"
              >
                {task.status === 'COMPLETED' ? (
                  <FiCheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <FiCircle className="h-6 w-6 text-gray-400
                                       hover:text-primary-600" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {CATEGORY_ICONS[task.category]}
                      </span>
                      <h4 className={`font-semibold ${
                        task.status === 'COMPLETED'
                          ? 'text-gray-500 line-through'
                          : 'text-gray-800'}`}>
                        {task.taskName}
                      </h4>
                      {task.isRequired && (
                        <span className="text-xs bg-red-100 text-red-700
                                         px-2 py-0.5 rounded-full">
                          Required
                        </span>
                      )}
                      {task.priority === 'HIGH' && (
                        <FiFlag className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs
                                    text-gray-500">
                      <span className="badge-info text-xs">
                        {task.category.replace('_', ' ')}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <FiClock /> Due: {formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.completedAt && (
                        <span className="flex items-center gap-1
                                         text-green-600">
                          <FiCheckCircle />
                          Completed: {formatDate(task.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => openTaskModal(task)}
                      className="p-1.5 rounded-lg hover:bg-blue-50
                                 text-blue-600"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(task.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50
                                 text-red-600"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={taskModal}
        onClose={() => { setTaskModal(false); reset(); }}
        title={editingTask ? 'Edit Task' : 'Add Task'}
      >
        <form onSubmit={handleSubmit(onSubmitTask)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Task Name *
            </label>
            <input
              {...register('taskName', { required: 'Required' })}
              className={`input-field ${errors.taskName ? 'input-error' : ''}`}
              placeholder="e.g., Submit ID Proof"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field resize-none"
              placeholder="Task details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <select {...register('category')} className="input-field">
                <option value="DOCUMENT">📄 Document</option>
                <option value="ORIENTATION">👥 Orientation</option>
                <option value="IT_SETUP">💻 IT Setup</option>
                <option value="TRAINING">📚 Training</option>
                <option value="PAPERWORK">✍️ Paperwork</option>
                <option value="COMPLIANCE">⚖️ Compliance</option>
                <option value="OTHER">📌 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Priority
              </label>
              <select {...register('priority')} className="input-field">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Due Date
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Status
              </label>
              <select {...register('status')} className="input-field">
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="SKIPPED">Skipped</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isRequired')} />
            <span className="text-sm">Required Task</span>
          </label>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setTaskModal(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editingTask ? 'Update' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="This task will be permanently deleted."
      />
    </Layout>
  );
};

export default OnboardingDetail;