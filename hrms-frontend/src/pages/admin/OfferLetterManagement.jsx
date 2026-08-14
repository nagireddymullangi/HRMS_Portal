import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiDownload,
  FiFile, FiSend, FiCheck, FiX
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import offerLetterService from '../../services/offerLetterService';
import departmentService from '../../services/departmentService';
import { formatDate, formatCurrency, getStatusBadge } from '../../utils/helpers';

const OfferLetterManagement = () => {
  const [offers, setOffers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => {
    fetchAll();
    fetchDepartments();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await offerLetterService.getAll();
      setOffers(res.data.data || []);
    } catch {
      toast.error('Failed to load offer letters');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data.data || []);
    } catch {
      console.error('Failed to load departments');
    }
  };

  const openModal = (offer = null) => {
    setEditing(offer);
    if (offer) {
      Object.keys(offer).forEach((k) => setValue(k, offer[k]));
    } else {
      reset({
        employmentType: 'FULL_TIME',
        workLocation: 'Hyderabad, India',
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await offerLetterService.update(editing.id, data);
        toast.success('Offer letter updated');
      } else {
        await offerLetterService.create(data);
        toast.success('Offer letter created');
      }
      setIsModalOpen(false);
      reset();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status, reason = '') => {
    try {
      await offerLetterService.updateStatus(id, { status, reason });
      toast.success(`Marked as ${status}`);
      fetchAll();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDownload = async (id, offerNumber) => {
    try {
      const res = await offerLetterService.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${offerNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async () => {
    try {
      await offerLetterService.delete(deleteId);
      toast.success('Deleted');
      fetchAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = filter === 'ALL'
    ? offers
    : offers.filter(o => o.status === filter);

  const stats = {
    all: offers.length,
    draft: offers.filter(o => o.status === 'DRAFT').length,
    sent: offers.filter(o => o.status === 'SENT').length,
    accepted: offers.filter(o => o.status === 'ACCEPTED').length,
    rejected: offers.filter(o => o.status === 'REJECTED').length,
  };

  return (
    <Layout>
      <PageHeader
        title="Offer Letter Management"
        subtitle="Generate and manage employment offer letters"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> New Offer Letter
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'ALL', label: `All (${stats.all})` },
          { key: 'DRAFT', label: `Draft (${stats.draft})` },
          { key: 'SENT', label: `Sent (${stats.sent})` },
          { key: 'ACCEPTED', label: `Accepted (${stats.accepted})` },
          { key: 'REJECTED', label: `Rejected (${stats.rejected})` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${filter === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiFile}
            title="No Offer Letters"
            description="Create your first offer letter"
            action={
              <button onClick={() => openModal()} className="btn-primary">
                <FiPlus /> New Offer Letter
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((offer) => (
            <div key={offer.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono">
                    {offer.offerNumber}
                  </p>
                  <h3 className="font-bold text-lg text-gray-800 mt-1">
                    {offer.candidateName}
                  </h3>
                  <p className="text-sm text-gray-500">{offer.position}</p>
                </div>
                <span className={getStatusBadge(offer.status)}>
                  {offer.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-t
                              border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">CTC</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(offer.offeredSalary)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Joining</p>
                  <p className="font-medium text-gray-700 text-sm">
                    {formatDate(offer.joiningDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm text-gray-700">
                    {offer.departmentName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Valid Until</p>
                  <p className="text-sm text-gray-700">
                    {formatDate(offer.expiryDate)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleDownload(offer.id, offer.offerNumber)}
                  className="btn-secondary text-xs flex-1 justify-center"
                >
                  <FiDownload /> PDF
                </button>
                {offer.status === 'DRAFT' && (
                  <button
                    onClick={() => handleStatusChange(offer.id, 'SENT')}
                    className="btn-primary text-xs flex-1 justify-center"
                  >
                    <FiSend /> Send
                  </button>
                )}
                {offer.status === 'SENT' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(offer.id, 'ACCEPTED')}
                      className="btn-success text-xs flex-1 justify-center"
                    >
                      <FiCheck /> Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(offer.id, 'REJECTED')}
                      className="btn-danger text-xs flex-1 justify-center"
                    >
                      <FiX /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => openModal(offer)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => setDeleteId(offer.id)}
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
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title={editing ? 'Edit Offer Letter' : 'New Offer Letter'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Candidate Name *
              </label>
              <input
                {...register('candidateName', { required: 'Required' })}
                className={`input-field ${errors.candidateName ? 'input-error' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                {...register('candidateEmail', { required: 'Required' })}
                className={`input-field ${errors.candidateEmail ? 'input-error' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input {...register('candidatePhone')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Position *</label>
              <input
                {...register('position', { required: 'Required' })}
                className={`input-field ${errors.position ? 'input-error' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select {...register('departmentId')} className="input-field">
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Employment Type
              </label>
              <select {...register('employmentType')} className="input-field">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                CTC (Annual) *
              </label>
              <input
                type="number"
                min="0"
                {...register('offeredSalary', { required: 'Required',
                  min: { value: 0, message: 'Must be positive' }
                 })}
                className={`input-field ${errors.offeredSalary ? 'input-error' : ''}`}
                placeholder="500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Joining Date *
              </label>
              <input
                type="date"
                {...register('joiningDate', { required: 'Required' })}
                className={`input-field ${errors.joiningDate ? 'input-error' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                {...register('expiryDate', { required: 'Required' })}
                className={`input-field ${errors.expiryDate ? 'input-error' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Reporting Manager
              </label>
              <input {...register('reportingManager')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Work Location
              </label>
              <input {...register('workLocation')} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Terms
            </label>
            <textarea
              {...register('additionalTerms')}
              rows={3}
              className="input-field resize-none"
              placeholder="Any additional terms or conditions..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); reset(); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 justify-center"
            >
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Offer Letter"
        message="This action cannot be undone."
      />
    </Layout>
  );
};

export default OfferLetterManagement;