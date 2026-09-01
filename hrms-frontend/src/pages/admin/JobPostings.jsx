// src/pages/admin/JobPostings.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiPlus, FiBriefcase, FiMapPin, FiClock,
  FiUsers, FiEdit2, FiTrash2, FiEye, FiDollarSign
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import recruitmentService from '../../services/recruitmentService';
import departmentService from '../../services/departmentService';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { FaRupeeSign } from 'react-icons/fa';

const JobPostings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, deptRes] = await Promise.all([
        recruitmentService.getJobs(),
        departmentService.getAll(),
      ]);
      setJobs(jobsRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (job = null) => {
    setEditing(job);
    if (job) {
      Object.keys(job).forEach(k => setValue(k, job[k]));
      if (job.department) setValue('departmentId', job.department.id);
    } else {
      reset({
        employmentType: 'FULL_TIME',
        status: 'OPEN',
        openings: 1,
      });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        department: data.departmentId
          ? { id: parseInt(data.departmentId) } : null,
        experienceMin: parseInt(data.experienceMin || 0),
        experienceMax: data.experienceMax ? parseInt(data.experienceMax) : null,
        openings: parseInt(data.openings || 1),
        salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : null,
      };

      if (editing) {
        await recruitmentService.updateJob(editing.id, payload);
        toast.success('Job updated');
      } else {
        await recruitmentService.createJob(payload);
        toast.success('Job posted successfully');
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

  const handleStatusChange = async (id, status) => {
    try {
      await recruitmentService.updateJobStatus(id, status);
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async () => {
    try {
      await recruitmentService.deleteJob(deleteId);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = filter === 'ALL' ? jobs
    : jobs.filter(j => j.status === filter);

  const stats = {
    all: jobs.length,
    open: jobs.filter(j => j.status === 'OPEN').length,
    closed: jobs.filter(j => j.status === 'CLOSED').length,
    filled: jobs.filter(j => j.status === 'FILLED').length,
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-700',
      OPEN: 'bg-green-100 text-green-700',
      CLOSED: 'bg-red-100 text-red-700',
      ON_HOLD: 'bg-yellow-100 text-yellow-700',
      FILLED: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || colors.DRAFT;
  };

  return (
    <Layout>
      <PageHeader
        title="Job Postings"
        subtitle="Manage job openings and vacancies"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> Post New Job
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Jobs', value: stats.all, color: 'blue', icon: FiBriefcase },
          { label: 'Open', value: stats.open, color: 'green', icon: FiClock },
          { label: 'Closed', value: stats.closed, color: 'red', icon: FiUsers },
          { label: 'Filled', value: stats.filled, color: 'purple', icon: FiUsers },
        ].map(s => (
          <div key={s.label} className={`card bg-gradient-to-br
            from-${s.color}-500 to-${s.color}-600 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{s.label}</p>
                <p className="text-3xl font-bold mt-2">{s.value}</p>
              </div>
              <s.icon className="h-10 w-10 opacity-50" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'OPEN', 'DRAFT', 'CLOSED', 'FILLED'].map(f => (
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
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiBriefcase}
            title="No Job Postings"
            description="Create your first job posting"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(job => (
            <div key={job.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-mono">
                    {job.jobCode}
                  </p>
                  <h3 className="font-bold text-lg text-gray-800 mt-1">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {job.department?.name || 'General'}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full
                                   ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-3 border-t
                              border-gray-100 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMapPin className="h-4 w-4" />
                  <span className="truncate">{job.location || 'Any'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiClock className="h-4 w-4" />
                  <span>{job.employmentType?.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiUsers className="h-4 w-4" />
                  <span>{job.openings} openings</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiBriefcase className="h-4 w-4" />
                  <span>{job.experienceMin}-{job.experienceMax || 'Any'} yrs</span>
                </div>
              </div>

              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-2 py-2 text-sm">
                  <FaRupeeSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {formatCurrency(job.salaryMin)} -
                    {formatCurrency(job.salaryMax)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3
                              border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  📥 {job.totalApplications || 0} applications
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/admin/jobs/${job.id}/applications`)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                    title="View Applications"
                  >
                    <FiEye />
                  </button>
                  <button
                    onClick={() => openModal(job)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => setDeleteId(job.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? 'Edit Job Posting' : 'Post New Job'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Job Title *
              </label>
              <input
                {...register('title', { required: 'Required' })}
                className={`input-field ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Department
              </label>
              <select {...register('departmentId')} className="input-field">
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                {...register('location')}
                className="input-field"
                placeholder="e.g., Hyderabad, Remote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Employment Type
              </label>
              <select {...register('employmentType')} className="input-field">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Number of Openings
              </label>
              <input
                type="number"
                {...register('openings')}
                className="input-field"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Min Experience (yrs)
              </label>
              <input
                type="number"
                min="0"
                {...register('experienceMin')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Experience (yrs)
              </label>
              <input
                type="number"
                min="0"
                {...register('experienceMax')}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Min Salary
              </label>
              <input
                type="number"
                min="0"
                {...register('salaryMin', { required: 'Required',
                  min: { value: 0, message: 'Must be positive' }
                 })}
                className="input-field"
                placeholder="500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Salary
              </label>
              <input
                type="number"
                min="0"
                {...register('salaryMax', { required: 'Required',
                  min: { value: 0, message: 'Must be positive' }
                 })}
                className="input-field"
                placeholder="1000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Posted Date
              </label>
              <input
                type="date"
                {...register('postedDate')}
                className="input-field"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Closing Date
              </label>
              <input
                type="date"
                {...register('closingDate')}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Job Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="input-field resize-none"
              placeholder="Describe the role..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Responsibilities
            </label>
            <textarea
              {...register('responsibilities')}
              rows={3}
              className="input-field resize-none"
              placeholder="Key responsibilities..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Requirements
            </label>
            <textarea
              {...register('requirements')}
              rows={3}
              className="input-field resize-none"
              placeholder="Skills, qualifications required..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Skills Required
            </label>
            <input
              {...register('skillsRequired')}
              className="input-field"
              placeholder="e.g., Java, Spring Boot, React"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Post Job'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Job"
        message="This will permanently delete the job posting."
      />
    </Layout>
  );
};

export default JobPostings;