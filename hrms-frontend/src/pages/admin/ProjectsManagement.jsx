// src/pages/admin/ProjectsManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiPlus, FiFolder, FiUsers, FiClock,
  FiDollarSign, FiEdit2, FiTrash2, FiEye,
  FiTrendingUp, FiCheckCircle, FiPauseCircle
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import projectService from '../../services/projectService';
import employeeService from '../../services/employeeService';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ProjectsManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [projRes, empRes, statsRes] = await Promise.all([
        projectService.getAll(),
        employeeService.getAll(),
        projectService.getStatistics(),
      ]);
      setProjects(projRes.data.data || []);
      setEmployees(empRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (project = null) => {
    setEditing(project);
    if (project) {
      Object.keys(project).forEach(k => setValue(k, project[k]));
    } else {
      reset({
        status: 'PLANNED',
        priority: 'MEDIUM',
        color: '#3b82f6',
        isBillable: true,
      });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        projectManagerId: data.projectManagerId
          ? parseInt(data.projectManagerId) : null,
        estimatedHours: data.estimatedHours
          ? parseFloat(data.estimatedHours) : null,
        budget: data.budget ? parseFloat(data.budget) : null,
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
      };

      if (editing) {
        await projectService.update(editing.id, payload);
        toast.success('Project updated');
      } else {
        await projectService.create(payload);
        toast.success('Project created');
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

  const handleDelete = async () => {
    try {
      await projectService.delete(deleteId);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = filter === 'ALL' ? projects
    : projects.filter(p => p.status === filter);

  const statusColors = {
    PLANNED: 'bg-gray-100 text-gray-700',
    ACTIVE: 'bg-green-100 text-green-700',
    ON_HOLD: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const getCurrentDateTime = () =>{
    const now =new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0,16);
  };
  const minDateTime = getCurrentDateTime();

  return (
    <Layout>
      <PageHeader
        title="Projects"
        subtitle="Manage projects and track progress"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> New Project
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.totalProjects,
            color: 'blue', icon: FiFolder },
          { label: 'Active', value: stats.activeProjects,
            color: 'green', icon: FiTrendingUp },
          { label: 'Completed', value: stats.completedProjects,
            color: 'purple', icon: FiCheckCircle },
          { label: 'On Hold', value: stats.onHoldProjects,
            color: 'yellow', icon: FiPauseCircle },
        ].map(s => (
          <div key={s.label} className={`card bg-gradient-to-br
            from-${s.color}-500 to-${s.color}-600 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{s.label}</p>
                <p className="text-3xl font-bold mt-2">{s.value || 0}</p>
              </div>
              <s.icon className="h-10 w-10 opacity-50" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED'].map(f => (
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
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiFolder}
            title="No Projects"
            description="Create your first project"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <div key={project.id}
                 className="card hover:shadow-lg transition-shadow
                            overflow-hidden">
              <div className="h-2 -mx-6 -mt-6 mb-4"
                   style={{ backgroundColor: project.color }} />

              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400 font-mono">
                  {project.projectCode}
                </p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full
                                   ${statusColors[project.status]}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-bold text-lg text-gray-800 mb-1">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {project.clientName || 'Internal Project'}
              </p>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold text-primary-600">
                    {project.progressPercentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${project.progressPercentage || 0}%`,
                      backgroundColor: project.color
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-2 py-3 border-t
                              border-gray-100 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <FiUsers className="h-3 w-3" />
                  {project.totalMembers || 0} members
                </div>
                <div className="flex items-center gap-1">
                  <FiCheckCircle className="h-3 w-3" />
                  {project.completedTasks}/{project.totalTasks} tasks
                </div>
                <div className="flex items-center gap-1">
                  <FiClock className="h-3 w-3" />
                  {project.actualHours || 0}/{project.estimatedHours || 0}h
                </div>
                {project.budget && (
                  <div className="flex items-center gap-1">
                    <FiDollarSign className="h-3 w-3" />
                    {formatCurrency(project.budget)}
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </p>

              <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/admin/projects/${project.id}`)}
                  className="flex-1 py-2 rounded-lg hover:bg-blue-50
                             text-blue-600 text-sm font-medium
                             flex items-center justify-center gap-1"
                >
                  <FiEye /> View
                </button>
                <button
                  onClick={() => openModal(project)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => setDeleteId(project.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? 'Edit Project' : 'New Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Project Name *
              </label>
              <input
                {...register('name', { required: 'Required' })}
                className={`input-field ${errors.name ? 'input-error' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Client Name
              </label>
              <input {...register('clientName')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Project Manager
              </label>
              <select {...register('projectManagerId')} className="input-field">
                <option value="">Select Manager</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                min={minDateTime}
                {...register('startDateTime', { required: 'Required',
                  validate: (value) => {
                    if (new Date(value) < new Date()){
                      return "Start date cannot be in the past";
                    }
                    return true;
                  }
                 })}
                className={"input-field ${errors.startDateTime ? 'input-error' : ''}"}
              />
              {errors.startDateTime && (
                <p className='text-red-500 text-xs mt-1'>{errors.startDateTime.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                min={minDateTime}
                {...register('endDateTime', { required: 'Required',
                  validate: (value) => {
                    const start = getValues('startDateTime');
                    if (new Date(value) < new Date()){
                      return "End Date  & Time must be after the start date & time";
                    }
                    return true;
                  }
                 })}
                className={"input-field ${errors.endDateTime ? 'input-error':''}"}
              />
              {errors.endDateTime && (
                <p className='text-red-500 text-xs mt-1'>{errors.endDateTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                step="1"
                min="1"
                {...register('estimatedHours')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Budget
              </label>
              <input
                type="number"
                step="1"
                min="0"
                {...register('budget')}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Hourly Rate
              </label>
              <input
                type="number"
                step="1"
                min="0"
                {...register('hourlyRate')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                {...register('color')}
                className="input-field h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select {...register('priority')} className="input-field">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field resize-none"
              placeholder="Project details..."
            />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isBillable')} defaultChecked />
            <span className="text-sm">Billable Project</span>
          </label>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="This will delete the project and all related data."
      />
    </Layout>
  );
};

export default ProjectsManagement;