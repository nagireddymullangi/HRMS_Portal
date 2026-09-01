// src/pages/admin/PoliciesManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiFileText, FiEdit2, FiTrash2,
  FiEye, FiCheckCircle, FiUsers, FiTrendingUp
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import policyService from '../../services/policyService';
import { formatDate } from '../../utils/helpers';

const CATEGORIES = [
  'LEAVE', 'ATTENDANCE', 'CODE_OF_CONDUCT', 'TRAVEL', 'REMOTE_WORK',
  'SECURITY', 'BENEFITS', 'COMPENSATION', 'PERFORMANCE', 'DIVERSITY',
  'GRIEVANCE', 'SAFETY', 'CONFIDENTIALITY', 'OTHER'
];

const PoliciesManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [complianceModal, setComplianceModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [polRes, statsRes] = await Promise.all([
        policyService.getAll(),
        policyService.getStatistics(),
      ]);
      setPolicies(polRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (policy = null) => {
    setEditing(policy);
    if (policy) {
      Object.keys(policy).forEach(k => setValue(k, policy[k]));
    } else {
      reset({
        category: 'OTHER',
        status: 'DRAFT',
        version: '1.0',
        isMandatory: true,
        requiresAcknowledgment: true,
      });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await policyService.update(editing.id, data);
        toast.success('Updated');
      } else {
        await policyService.create(data);
        toast.success('Policy created');
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

  const handleApprove = async (id) => {
    try {
      await policyService.approve(id);
      toast.success('Policy approved & activated');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await policyService.updateStatus(id, status);
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async () => {
    try {
      await policyService.delete(deleteId);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const viewCompliance = async (policyId) => {
    try {
      const res = await policyService.getComplianceReport(policyId);
      setComplianceModal(res.data.data);
    } catch {
      toast.error('Failed to load');
    }
  };

  const filtered = filter === 'ALL' ? policies
    : policies.filter(p => p.status === filter);

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    ACTIVE: 'bg-green-100 text-green-700',
    ARCHIVED: 'bg-yellow-100 text-yellow-700',
    EXPIRED: 'bg-red-100 text-red-700',
  };

  return (
    <Layout>
      <PageHeader
        title="HR Policies"
        subtitle="Manage company policies and compliance"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> New Policy
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Active', value: stats.active, color: 'green' },
          { label: 'Draft', value: stats.draft, color: 'yellow' },
          { label: 'Archived', value: stats.archived, color: 'gray' },
        ].map(s => (
          <div key={s.label} className={`card bg-gradient-to-br
            from-${s.color}-500 to-${s.color}-600 text-white`}>
            <p className="text-sm opacity-90">{s.label}</p>
            <p className="text-3xl font-bold mt-2">{s.value || 0}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED', 'EXPIRED'].map(f => (
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
            icon={FiFileText}
            title="No Policies"
            description="Create your first HR policy"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-400 font-mono">
                    {p.policyCode} • v{p.version}
                  </p>
                  <h3 className="font-bold text-lg text-gray-800 mt-1">
                    {p.title}
                  </h3>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full
                                   ${statusColors[p.status]}`}>
                  {p.status}
                </span>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                {p.description}
              </p>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="badge-info text-xs">
                  {p.category.replace('_', ' ')}
                </span>
                {p.isMandatory && (
                  <span className="badge-danger text-xs">Mandatory</span>
                )}
                {p.requiresAcknowledgment && (
                  <span className="badge-warning text-xs">Requires Ack</span>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Effective: {formatDate(p.effectiveDate)}
                {p.expiryDate && ` - ${formatDate(p.expiryDate)}`}
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => setViewModal(p)}
                        className="p-2 rounded-lg hover:bg-blue-50
                                   text-blue-600" title="View">
                  <FiEye />
                </button>
                <button onClick={() => viewCompliance(p.id)}
                        className="p-2 rounded-lg hover:bg-purple-50
                                   text-purple-600" title="Compliance">
                  <FiUsers />
                </button>
                {p.status === 'DRAFT' && (
                  <button onClick={() => handleApprove(p.id)}
                          className="p-2 rounded-lg hover:bg-green-50
                                     text-green-600" title="Approve">
                    <FiCheckCircle />
                  </button>
                )}
                <button onClick={() => openModal(p)}
                        className="p-2 rounded-lg hover:bg-blue-50
                                   text-blue-600">
                  <FiEdit2 />
                </button>
                <button onClick={() => setDeleteId(p.id)}
                        className="p-2 rounded-lg hover:bg-red-50
                                   text-red-600">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? 'Edit Policy' : 'New Policy'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                {...register('title', { required: 'Required' })}
                className={`input-field ${errors.title ? 'input-error' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Version</label>
              <input {...register('version')} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Content * (HTML supported)
            </label>
            <textarea
              {...register('content', { required: 'Required' })}
              rows={10}
              className={`input-field resize-y font-mono text-sm
                          ${errors.content ? 'input-error' : ''}`}
              placeholder="<h2>Policy Title</h2><p>Content...</p>"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select {...register('category')} className="input-field">
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Effective Date *
              </label>
              <input
                type="date"
                {...register('effectiveDate', { required: 'Required' })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                {...register('expiryDate')}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Document URL
            </label>
            <input
              {...register('documentUrl')}
              className="input-field"
              placeholder="Link to full policy PDF"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('isMandatory')} defaultChecked />
              <span className="text-sm">Mandatory Policy</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('requiresAcknowledgment')}
                     defaultChecked />
              <span className="text-sm">Requires Acknowledgment</span>
            </label>
          </div>

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

      {/* View Modal */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title=""
        size="xl"
      >
        {viewModal && (
          <div>
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 font-mono">
                {viewModal.policyCode} • v{viewModal.version}
              </p>
              <h2 className="text-2xl font-bold mt-1">{viewModal.title}</h2>
              <p className="text-gray-500 mt-1">{viewModal.description}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge-info text-xs">
                  {viewModal.category.replace('_', ' ')}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full
                                   ${statusColors[viewModal.status]}`}>
                  {viewModal.status}
                </span>
              </div>
            </div>
            <div className="mt-4 prose max-w-none"
                 dangerouslySetInnerHTML={{ __html: viewModal.content }} />
          </div>
        )}
      </Modal>

      {/* Compliance Report */}
      <Modal
        isOpen={!!complianceModal}
        onClose={() => setComplianceModal(null)}
        title="Compliance Report"
      >
        {complianceModal && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">{complianceModal.policyTitle}</h3>

            <div className="text-center py-6">
              <p className="text-6xl font-bold text-primary-600">
                {complianceModal.compliancePercentage}%
              </p>
              <p className="text-sm text-gray-500 mt-2">Compliance Rate</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {complianceModal.totalEmployees}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {complianceModal.acknowledged}
                </p>
                <p className="text-xs text-gray-500">Acknowledged</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {complianceModal.pending}
                </p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Policy"
        message="This policy will be permanently deleted."
      />
    </Layout>
  );
};

export default PoliciesManagement;