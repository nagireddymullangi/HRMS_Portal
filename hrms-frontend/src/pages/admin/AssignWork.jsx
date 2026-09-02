// src/pages/admin/AssignWork.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiEye, FiFilter,
  FiUsers, FiTarget, FiAlertCircle, FiClock,
  FiCoffee, FiRefreshCw
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import dailyWorkService from '../../services/dailyWorkService';
import employeeService from '../../services/employeeService';
import projectService from '../../services/projectService';
import { formatDate } from '../../utils/helpers';

const AssignWork = () => {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [activeBreaks, setActiveBreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]);
  const [bulkTasks, setBulkTasks] = useState([{}]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue,watch,
          formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const [assignRes, empRes, projRes, teamRes, breakRes] =
        await Promise.all([
          dailyWorkService.getAll(selectedDate),
          employeeService.getAll(),
          projectService.getActive(),
          dailyWorkService.getTeamDashboard(),
          dailyWorkService.getActiveBreaks(),
        ]);
      setAssignments(assignRes.data.data || []);
      setEmployees(empRes.data.data || []);
      setProjects(projRes.data.data || []);
      setTeamStats(teamRes.data.data || {});
      setActiveBreaks(breakRes.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (task = null) => {
    setEditing(task);
    if (task) {
      Object.keys(task).forEach(k => setValue(k, task[k]));
    } else {
      reset({
        category: 'DEVELOPMENT',
        priority: 'MEDIUM',
        assignmentDate: selectedDate,
      });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        employee: { id: parseInt(data.employeeId) },
        projectId: data.projectId ? parseInt(data.projectId) : null,
        estimatedHours: data.estimatedHours
          ? parseFloat(data.estimatedHours) : null,
      };

      if (editing) {
        await dailyWorkService.update(editing.id, payload);
        toast.success('Assignment updated');
      } else {
        await dailyWorkService.create(payload);
        toast.success('Task assigned successfully');
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

  const handleForceEndBreak = async (id) => {
    const note = prompt('Reason for forcing break end?');
    if (!note) return;
    try {
      await dailyWorkService.forceEndBreak(id, note);
      toast.success('Break ended');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await dailyWorkService.delete(id);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
    CRITICAL: 'bg-red-200 text-red-900',
  };

  const statusColors = {
    ASSIGNED: 'bg-gray-100 text-gray-700',
    ACCEPTED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    ON_HOLD: 'bg-orange-100 text-orange-700',
    BLOCKED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
  };

  const today = new Date().toISOString().split('T')[0];
  const assignmentDate = watch('assignmentDate');
  const dueDate = watch('dueDate');

  return (
    <Layout>
      <PageHeader
        title="Assign Daily Work"
        subtitle="Assign tasks and monitor team progress"
        action={
          <div className="flex gap-2">
            <button onClick={fetchData} className="btn-secondary">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={() => openModal()} className="btn-primary">
              <FiPlus /> New Task
            </button>
          </div>
        }
      />

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                        text-white text-center">
          <p className="text-xs opacity-90">Total Today</p>
          <p className="text-3xl font-bold mt-1">
            {teamStats.totalAssignmentsToday || 0}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600
                        text-white text-center">
          <p className="text-xs opacity-90">Completed</p>
          <p className="text-3xl font-bold mt-1">
            {teamStats.completedToday || 0}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600
                        text-white text-center">
          <p className="text-xs opacity-90">In Progress</p>
          <p className="text-3xl font-bold mt-1">
            {teamStats.inProgress || 0}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600
                        text-white text-center">
          <p className="text-xs opacity-90">Blocked</p>
          <p className="text-3xl font-bold mt-1">
            {teamStats.blocked || 0}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600
                        text-white text-center">
          <p className="text-xs opacity-90">Overdue</p>
          <p className="text-3xl font-bold mt-1">
            {teamStats.overdue || 0}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600
                        text-white text-center">
          <p className="text-xs opacity-90">On Break</p>
          <p className="text-3xl font-bold mt-1">
            {teamStats.employeesOnBreak || 0}
          </p>
        </div>
      </div>

      {/* Active Breaks Alert */}
      {activeBreaks.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FiCoffee className="text-orange-500" />
            Employees Currently on Break ({activeBreaks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeBreaks.map(b => (
              <div key={b.id}
                   className={`p-3 rounded-lg ${
                     b.currentDurationMinutes > b.maxAllowedMinutes
                       ? 'bg-red-50 border border-red-200'
                       : 'bg-orange-50 border border-orange-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">
                      {b.employeeName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {b.breakType.replace('_', ' ')}
                    </p>
                  </div>
                  <button onClick={() => handleForceEndBreak(b.id)}
                          className="text-xs bg-red-600 text-white
                                     px-2 py-1 rounded">
                    Force End
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-sm font-bold ${
                    b.currentDurationMinutes > b.maxAllowedMinutes
                      ? 'text-red-600' : 'text-orange-600'}`}>
                    {b.currentDurationMinutes} min
                  </span>
                  <span className="text-xs text-gray-500">
                    Max: {b.maxAllowedMinutes} min
                  </span>
                </div>
                {b.currentDurationMinutes > b.maxAllowedMinutes && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    ⚠️ Exceeded by {b.currentDurationMinutes - b.maxAllowedMinutes} min
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Date:</label>
          <input type="date" value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="input-field w-48" />
          <span className="text-sm text-gray-500">
            Showing {assignments.length} assignments
          </span>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <Loader fullScreen={false} />
      ) : assignments.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiTarget}
            title="No Assignments"
            description="Create assignments for your team"
            action={
              <button onClick={() => openModal()} className="btn-primary">
                <FiPlus /> Create Task
              </button>
            }
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Task #', 'Employee', 'Title', 'Priority',
                    'Progress', 'Status', 'Due', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs
                                          font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">
                      {task.assignmentNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{task.employeeName}</p>
                      <p className="text-xs text-gray-400">
                        {task.employeeCode}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-400">
                        {task.category.replace('_', ' ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1
                                         rounded-full ${
                                           priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-primary-600 h-2 rounded-full"
                               style={{ width: `${task.progressPercentage}%` }} />
                        </div>
                        <span className="text-xs font-semibold">
                          {task.progressPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1
                                         rounded-full ${
                                           statusColors[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {task.dueDate && (
                        <div>
                          <p className={task.isOverdue
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-600'}>
                            {formatDate(task.dueDate)}
                          </p>
                          {task.dueTime && (
                            <p className="text-xs text-gray-400">
                              {task.dueTime}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openModal(task)}
                                className="p-1.5 rounded-lg hover:bg-blue-50
                                           text-blue-600">
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(task.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50
                                           text-red-600">
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign/Edit Modal */}
      <Modal isOpen={modalOpen}
             onClose={() => { setModalOpen(false); reset(); }}
             title={editing ? 'Edit Task' : 'Assign New Task'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign To Employee *
              </label>
              <select {...register('employeeId', { required: 'Required' })}
                      className={`input-field ${
                        errors.employeeId ? 'input-error' : ''}`}>
                <option value="">Select Employee</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} ({e.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Assignment Date *
              </label>
              <input type="date"
                    min={today}
                     {...register('assignmentDate', { required: 'Assignment date is Required',
                      validate: (value) => value >= today || 'Assignment date cannot be in the past'
                      })}
                     className={"input-field ${errors.assignmentDate ? 'input-error' : ''}"}
              />
              {errors.assignmentDate && (
                <span className='text-red-500 text-xs'>{errors.assignmentDate.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input {...register('title', { required: 'Required' })}
                   className={`input-field ${errors.title ? 'input-error' : ''}`}
                   placeholder="Task title" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea {...register('description')} rows={3}
                      className="input-field resize-none"
                      placeholder="Detailed task description..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select {...register('category')} className="input-field">
                <option value="DEVELOPMENT">💻 Development</option>
                <option value="TESTING">🧪 Testing</option>
                <option value="MEETING">👥 Meeting</option>
                <option value="DOCUMENTATION">📝 Documentation</option>
                <option value="CLIENT_WORK">🤝 Client Work</option>
                <option value="TRAINING">📚 Training</option>
                <option value="SUPPORT">🛠️ Support</option>
                <option value="ADMIN">📋 Admin</option>
                <option value="OTHER">📌 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select {...register('priority')} className="input-field">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Est. Hours
              </label>
              <input type="number" step="1" min='1'
                     {...register('estimatedHours')}
                     className="input-field" placeholder="1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date"
                min={assignmentDate || today}
                {...register('dueDate',{
                  required: 'Due Date is required',
                  validate: (value, formValues) => {
                    if (!formValues.assignmentDate) return true;
                    return (
                      value >= formValues.assignmentDate ||
                      'Due Date cannot be before Assignment date'
                    );
                  }
                })}
                     className={"input-field ${errors.dueDate ? 'input-error' : ''}"}
               />
               {errors.dueDate && (
                <span className='text-red-500 text-xs'>{errors.dueDate.message}</span>
               )}
            </div>
            <div> 
              <label className="block text-sm font-medium mb-1">Due Time</label>
              <input type="time" {...register('dueTime')}
                     className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <select {...register('projectId')} className="input-field">
              <option value="">No Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tags (comma-separated)
            </label>
            <input {...register('tags')} className="input-field"
                   placeholder="frontend, urgent, bug" />
          </div>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default AssignWork;