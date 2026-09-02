// src/pages/admin/TrainingManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiPlus, FiBook, FiUsers, FiClock,
  FiEdit2, FiTrash2, FiEye, FiAward, FiStar
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import trainingService from '../../services/trainingService';
import { formatDate, formatCurrency } from '../../utils/helpers';

const CATEGORY_COLORS = {
  TECHNICAL: 'bg-blue-100 text-blue-700',
  SOFT_SKILLS: 'bg-purple-100 text-purple-700',
  LEADERSHIP: 'bg-yellow-100 text-yellow-700',
  COMPLIANCE: 'bg-red-100 text-red-700',
  ONBOARDING: 'bg-green-100 text-green-700',
  CERTIFICATION: 'bg-indigo-100 text-indigo-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

const TrainingManagement = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
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
      const [progRes, statsRes] = await Promise.all([
        trainingService.getAllPrograms(),
        trainingService.getStatistics(),
      ]);
      setPrograms(progRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (program = null) => {
    setEditing(program);
    if (program) {
      Object.keys(program).forEach(k => setValue(k, program[k]));
    } else {
      reset({
        category: 'TECHNICAL',
        trainingType: 'ONLINE',
        status: 'PLANNED',
        isMandatory: false,
      });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        durationHours: data.durationHours ? parseFloat(data.durationHours) : null,
        maxParticipants: data.maxParticipants
          ? parseInt(data.maxParticipants) : null,
        costPerParticipant: data.costPerParticipant
          ? parseFloat(data.costPerParticipant) : null,
      };

      if (editing) {
        await trainingService.updateProgram(editing.id, payload);
        toast.success('Updated');
      } else {
        await trainingService.createProgram(payload);
        toast.success('Program created');
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
      await trainingService.deleteProgram(deleteId);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = filter === 'ALL' ? programs
    : programs.filter(p => p.status === filter);

  const statusColors = {
    PLANNED: 'bg-gray-100 text-gray-700',
    OPEN_FOR_ENROLLMENT: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-purple-100 text-purple-700',
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
        title="Training Programs"
        subtitle="Manage learning & development programs"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> New Program
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.totalPrograms, color: 'blue' },
          { label: 'Open', value: stats.openPrograms, color: 'green' },
          { label: 'In Progress', value: stats.inProgressPrograms, color: 'yellow' },
          { label: 'Completed', value: stats.completedPrograms, color: 'purple' },
          { label: 'Enrollments', value: stats.totalEnrollments, color: 'indigo' },
        ].map(s => (
          <div key={s.label} className={`card bg-gradient-to-br
            from-${s.color}-500 to-${s.color}-600 text-white text-center`}>
            <p className="text-xs opacity-90">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value || 0}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'PLANNED', 'OPEN_FOR_ENROLLMENT',
          'IN_PROGRESS', 'COMPLETED'].map(f => (
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
            icon={FiBook}
            title="No Training Programs"
            description="Create your first training program"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(program => (
            <div key={program.id} className="card hover:shadow-md">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400 font-mono">
                  {program.programCode}
                </p>
                <div className="flex gap-1">
                  {program.isMandatory && (
                    <span className="badge-danger text-xs">Mandatory</span>
                  )}
                  <span className={`text-xs font-medium px-2 py-1
                                     rounded-full ${statusColors[program.status]}`}>
                    {program.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-lg text-gray-800">
                {program.title}
              </h3>

              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-medium px-2 py-0.5
                                   rounded-full ${
                                     CATEGORY_COLORS[program.category]}`}>
                  {program.category.replace('_', ' ')}
                </span>
                <span className="badge-info text-xs">
                  {program.trainingType.replace('_', ' ')}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {program.description}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs
                              text-gray-600 border-t pt-3">
                <div className="flex items-center gap-1">
                  <FiClock className="h-3 w-3" />
                  {program.durationHours}h
                </div>
                <div className="flex items-center gap-1">
                  <FiUsers className="h-3 w-3" />
                  {program.totalEnrolled}/{program.maxParticipants || '∞'}
                </div>
                <div className="flex items-center gap-1">
                  <FiAward className="h-3 w-3" />
                  {program.totalCompleted} completed
                </div>
                {program.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <FiStar className="h-3 w-3 text-yellow-500" />
                    {program.averageRating}
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                {formatDate(program.startDate)} - {formatDate(program.endDate)}
              </p>

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/admin/training/${program.id}`)}
                  className="flex-1 py-2 rounded-lg hover:bg-blue-50
                             text-blue-600 text-sm font-medium
                             flex items-center justify-center gap-1"
                >
                  <FiEye /> View
                </button>
                <button
                  onClick={() => openModal(program)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => setDeleteId(program.id)}
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
        title={editing ? 'Edit Program' : 'New Training Program'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              {...register('title', { required: 'Required' })}
              className={`input-field ${errors.title ? 'input-error' : ''}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select {...register('category')} className="input-field">
                <option value="TECHNICAL">Technical</option>
                <option value="SOFT_SKILLS">Soft Skills</option>
                <option value="LEADERSHIP">Leadership</option>
                <option value="COMPLIANCE">Compliance</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="CERTIFICATION">Certification</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select {...register('trainingType')} className="input-field">
                <option value="CLASSROOM">Classroom</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Hybrid</option>
                <option value="SELF_PACED">Self Paced</option>
                <option value="WORKSHOP">Workshop</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duration (hrs)</label>
              <input
                type="number"
                step="1"
                min="1"
                {...register('durationHours')}
                className="input-field" defaultValue={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Participants</label>
              <input
                type="number"
                step="1"
                min="1"
                {...register('maxParticipants')}
                className="input-field" defaultValue={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cost/Person</label>
              <input
                type="number"
                step="1"
                min="0"
                {...register('costPerParticipant')}
                className="input-field" defaultValue={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
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
              <label className="block text-sm font-medium mb-1">End Date</label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Trainer Name</label>
              <input {...register('trainerName',{
                required: 'Trainer name is required',
                minLength: { value: 2, message: 'Namemust be at least 3 characters'},
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Trainer name should contain letters only"
                }
              })}
               className="input-field" 
              />
              {errors. trainerName && (
                <span className='text-red-500 text-xs mt-1 block'>{errors.trainerName.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trainer Email</label>
              <input {...register('trainerEmail',{
                required: 'Trainer Email is Required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Enter a valid email address'
                }
              })} className="input-field" 
              />
              {errors.trainerEmail && (
                <span className='text-red-500 text-xs mt-1 block'>{errors.trainerEmail.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location / Meeting Link</label>
            <input {...register('location')} className="input-field" />
            <input {...register('meetingLink')} className="input-field mt-2"
                   placeholder="https://meet.google.com/..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Learning Objectives</label>
            <textarea
              {...register('learningObjectives')}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Materials URL</label>
            <input {...register('materialsUrl')} className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="PLANNED">Planned</option>
                <option value="OPEN_FOR_ENROLLMENT">Open for Enrollment</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isMandatory')} />
                <span className="text-sm">Mandatory Training</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create Program'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Program"
        message="This will delete the program and all enrollments."
      />
    </Layout>
  );
};

export default TrainingManagement;