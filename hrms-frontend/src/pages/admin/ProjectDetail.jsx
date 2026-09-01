// src/pages/admin/ProjectDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiArrowLeft, FiPlus, FiUsers, FiClock,
  FiDollarSign, FiEdit2, FiTrash2, FiUserPlus, FiX
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import projectService from '../../services/projectService';
import employeeService from '../../services/employeeService';
import { formatDate, formatCurrency, getInitials } from '../../utils/helpers';

const TASK_STAGES = [
  { key: 'TODO', label: 'To Do', color: 'bg-gray-100' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100' },
  { key: 'REVIEW', label: 'Review', color: 'bg-yellow-100' },
  { key: 'DONE', label: 'Done', color: 'bg-green-100' },
];

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  const { register: regMember, handleSubmit: submitMember,
          reset: resetMember } = useForm();

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, tasksRes, membersRes, empRes] = await Promise.all([
        projectService.getById(id),
        projectService.getTasks(id),
        projectService.getMembers(id),
        employeeService.getAll(),
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data || []);
      setMembers(membersRes.data.data || []);
      setEmployees(empRes.data.data || []);
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
      reset({ status: 'TODO', priority: 'MEDIUM' });
    }
    setTaskModal(true);
  };

  const onSubmitTask = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        assignedTo: data.assignedTo ? parseInt(data.assignedTo) : null,
        estimatedHours: data.estimatedHours
          ? parseFloat(data.estimatedHours) : null,
      };

      if (editingTask) {
        await projectService.updateTask(editingTask.id, payload);
        toast.success('Task updated');
      } else {
        await projectService.createTask(id, payload);
        toast.success('Task created');
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

  const handleTaskStatusChange = async (taskId, status) => {
    try {
      await projectService.updateTaskStatus(taskId, status);
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const onAddMember = async (data) => {
    try {
      await projectService.addMember(id, {
        employeeId: parseInt(data.employeeId),
        role: data.role,
      });
      toast.success('Member added');
      setMemberModal(false);
      resetMember();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleRemoveMember = async (empId) => {
    try {
      await projectService.removeMember(id, empId);
      toast.success('Member removed');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await projectService.deleteTask(deleteTaskId);
      toast.success('Task deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <Layout><Loader /></Layout>;
  if (!project) return <Layout><p>Not found</p></Layout>;

  const memberIds = new Set(members.map(m => m.employee?.id));
  const availableEmployees = employees.filter(e => !memberIds.has(e.id));

  return (
    <Layout>
      <button
        onClick={() => navigate('/admin/projects')}
        className="flex items-center gap-2 text-gray-600
                   hover:text-gray-800 mb-4"
      >
        <FiArrowLeft /> Back to Projects
      </button>

      {/* Project Header */}
      <div className="card mb-6"
           style={{
             background: `linear-gradient(135deg, ${project.color}20, ${project.color}05)`,
             borderLeft: `4px solid ${project.color}`
           }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 font-mono">
              {project.projectCode}
            </p>
            <h1 className="text-2xl font-bold text-gray-800">
              {project.name}
            </h1>
            <p className="text-gray-600 mt-1">{project.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <FiUsers className="h-4 w-4" />
                {project.totalMembers} members
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="h-4 w-4" />
                {project.actualHours || 0}h / {project.estimatedHours || 0}h
              </span>
              {project.budget && (
                <span className="flex items-center gap-1">
                  <FiDollarSign className="h-4 w-4" />
                  {formatCurrency(project.budget)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-800">
              {project.progressPercentage || 0}%
            </p>
            <p className="text-xs text-gray-500">Progress</p>
          </div>
        </div>

        <div className="mt-4 w-full bg-white/60 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all"
            style={{
              width: `${project.progressPercentage || 0}%`,
              backgroundColor: project.color
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Members */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Team Members</h3>
              <button
                onClick={() => setMemberModal(true)}
                className="p-1 rounded-lg hover:bg-blue-50 text-blue-600"
              >
                <FiUserPlus />
              </button>
            </div>
            <div className="space-y-2">
              {members.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No members yet
                </p>
              ) : (
                members.map(m => (
                  <div key={m.id}
                       className="flex items-center justify-between p-2
                                  hover:bg-gray-50 rounded-lg group">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full
                                      bg-gradient-to-br from-blue-500
                                      to-indigo-600 flex items-center
                                      justify-center text-white text-xs
                                      font-bold">
                        {getInitials(m.employee?.firstName + ' ' +
                                     m.employee?.lastName)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {m.employee?.firstName} {m.employee?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(m.employee?.id)}
                      className="opacity-0 group-hover:opacity-100 p-1
                                 rounded hover:bg-red-50 text-red-500
                                 transition-opacity"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tasks Kanban */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
            <button onClick={() => openTaskModal()} className="btn-primary">
              <FiPlus /> Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {TASK_STAGES.map(stage => {
              const stageTasks = tasks.filter(t => t.status === stage.key);
              return (
                <div key={stage.key}>
                  <div className={`${stage.color} p-2 rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-gray-800">
                        {stage.label}
                      </h4>
                      <span className="text-xs bg-white/60 px-2 py-0.5
                                       rounded-full">
                        {stageTasks.length}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-b-lg
                                  min-h-[400px] space-y-2">
                    {stageTasks.map(task => (
                      <div key={task.id}
                           className="bg-white p-3 rounded-lg shadow-sm
                                      hover:shadow-md cursor-pointer">
                        <h5 className="font-semibold text-sm mb-1">
                          {task.taskName}
                        </h5>
                        {task.description && (
                          <p className="text-xs text-gray-500 line-clamp-2
                                        mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-0.5 rounded-full
                            ${task.priority === 'URGENT'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : task.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'}`}>
                            {task.priority}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openTaskModal(task)}
                              className="p-1 rounded hover:bg-blue-50
                                         text-blue-600"
                            >
                              <FiEdit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setDeleteTaskId(task.id)}
                              className="p-1 rounded hover:bg-red-50
                                         text-red-600"
                            >
                              <FiTrash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="flex gap-1 mt-2 pt-2 border-t
                                        border-gray-100">
                          {TASK_STAGES.filter(s => s.key !== stage.key)
                                       .slice(0, 2).map(s => (
                            <button
                              key={s.key}
                              onClick={() => handleTaskStatusChange(
                                task.id, s.key)}
                              className="text-xs px-2 py-1 rounded
                                         hover:bg-gray-100 text-gray-600"
                            >
                              → {s.label}
                            </button>
                          ))}
                        </div>

                        {task.dueDate && (
                          <p className="text-xs text-orange-600 mt-2">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign To
              </label>
              <select {...register('assignedTo')} className="input-field">
                <option value="">Select Member</option>
                {members.map(m => (
                  <option key={m.id} value={m.employee?.id}>
                    {m.employee?.firstName} {m.employee?.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select {...register('priority')} className="input-field">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                step="0.5"
                {...register('estimatedHours')}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="input-field"
              />
            </div>
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
          </div>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setTaskModal(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editingTask ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={memberModal}
        onClose={() => { setMemberModal(false); resetMember(); }}
        title="Add Team Member"
      >
        <form onSubmit={submitMember(onAddMember)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Employee *
            </label>
            <select
              {...regMember('employeeId', { required: 'Required' })}
              className="input-field"
            >
              <option value="">Select Employee</option>
              {availableEmployees.map(e => (
                <option key={e.id} value={e.id}>{e.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              {...regMember('role')}
              className="input-field"
              placeholder="e.g., Developer, Designer"
            />
          </div>
          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setMemberModal(false); resetMember(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit"
                    className="btn-primary flex-1 justify-center">
              Add Member
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="This task will be permanently deleted."
      />
    </Layout>
  );
};

export default ProjectDetail;