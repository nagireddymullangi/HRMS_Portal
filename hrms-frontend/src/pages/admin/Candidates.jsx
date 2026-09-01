// src/pages/admin/Candidates.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiUser, FiMail, FiPhone,
  FiBriefcase, FiSearch, FiEdit2, FiEye,
  FiLinkedin, FiExternalLink
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import recruitmentService from '../../services/recruitmentService';
import { getInitials } from '../../utils/helpers';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    try {
      const res = await recruitmentService.getCandidates();
      setCandidates(res.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (candidate = null) => {
    setEditing(candidate);
    if (candidate) {
      Object.keys(candidate).forEach(k => setValue(k, candidate[k]));
    } else {
      reset({ source: 'WEBSITE' });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await recruitmentService.updateCandidate(editing.id, data);
        toast.success('Candidate updated');
      } else {
        await recruitmentService.createCandidate(data);
        toast.success('Candidate added');
      }
      setModalOpen(false);
      reset();
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = candidates.filter(c => {
    const s = search.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(s) ||
      c.lastName?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.currentCompany?.toLowerCase().includes(s)
    );
  });

  return (
    <Layout>
      <PageHeader
        title="Candidates Database"
        subtitle={`${candidates.length} candidates`}
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> Add Candidate
          </button>
        }
      />

      <div className="card mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiUser}
            title="No Candidates"
            description="Add candidates to build your talent pool"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="card hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br
                                from-purple-500 to-pink-500 flex items-center
                                justify-center text-white font-bold
                                flex-shrink-0">
                  {getInitials(c.firstName + ' ' + c.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800">
                    {c.firstName} {c.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {c.currentDesignation || 'Job Seeker'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    @ {c.currentCompany || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <FiMail className="h-3 w-3" />
                  <span className="truncate">{c.email}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <FiPhone className="h-3 w-3" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.totalExperience && (
                  <div className="flex items-center gap-2">
                    <FiBriefcase className="h-3 w-3" />
                    <span>{c.totalExperience} years exp</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t
                              border-gray-100">
                <span className="badge-info text-xs">{c.source}</span>
                <div className="ml-auto flex gap-1">
                  {c.linkedinUrl && (
                    <a href={c.linkedinUrl} target="_blank" rel="noreferrer"
                       className="p-1.5 rounded-lg hover:bg-blue-50
                                  text-blue-600">
                      <FiLinkedin className="h-4 w-4" />
                    </a>
                  )}
                  {c.resumeUrl && (
                    <a href={c.resumeUrl} target="_blank" rel="noreferrer"
                       className="p-1.5 rounded-lg hover:bg-purple-50
                                  text-purple-600">
                      <FiExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => setViewModal(c)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openModal(c)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? 'Edit Candidate' : 'Add Candidate'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name *
              </label>
              <input
                {...register('firstName', { required: 'Required' })}
                className={`input-field ${
                  errors.firstName ? 'input-error' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name *
              </label>
              <input
                {...register('lastName', { required: 'Required' })}
                className={`input-field ${
                  errors.lastName ? 'input-error' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                {...register('email', { required: 'Required' })}
                className={`input-field ${errors.email ? 'input-error' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input {...register('phone')} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Company
              </label>
              <input {...register('currentCompany')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Designation
              </label>
              <input {...register('currentDesignation')} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Experience (yrs)
              </label>
              <input
                type="number"
                step="0.5"
                {...register('totalExperience')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Salary
              </label>
              <input
                type="number"
                {...register('currentSalary')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expected Salary
              </label>
              <input
                type="number"
                {...register('expectedSalary')}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Notice Period (days)
              </label>
              <input
                type="number"
                {...register('noticePeriod')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Location
              </label>
              <input {...register('location')} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skills</label>
            <textarea
              {...register('skills')}
              rows={2}
              className="input-field resize-none"
              placeholder="Java, Python, React..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                LinkedIn URL
              </label>
              <input {...register('linkedinUrl')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Resume URL
              </label>
              <input {...register('resumeUrl')} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Source</label>
            <select {...register('source')} className="input-field">
              <option value="WEBSITE">Website</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="REFERRAL">Referral</option>
              <option value="JOB_PORTAL">Job Portal</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Candidate Details"
        size="lg"
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br
                              from-purple-500 to-pink-500 flex items-center
                              justify-center text-white text-2xl font-bold">
                {getInitials(viewModal.firstName + ' ' + viewModal.lastName)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {viewModal.firstName} {viewModal.lastName}
                </h2>
                <p className="text-gray-500">
                  {viewModal.currentDesignation} @ {viewModal.currentCompany}
                </p>
                <span className="badge-info text-xs mt-1">
                  {viewModal.source}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                ['Email', viewModal.email],
                ['Phone', viewModal.phone],
                ['Experience', viewModal.totalExperience + ' years'],
                ['Notice Period', viewModal.noticePeriod + ' days'],
                ['Current Salary', viewModal.currentSalary],
                ['Expected Salary', viewModal.expectedSalary],
                ['Location', viewModal.location],
              ].map(([label, value]) => value && (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>

            {viewModal.skills && (
              <div>
                <p className="text-xs text-gray-400 uppercase mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {viewModal.skills.split(',').map((skill, i) => (
                    <span key={i} className="badge-info text-xs">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Candidates;