// src/pages/admin/Announcements.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiEye,
 FiUsers, FiCalendar,
   FiEyeOff
} from 'react-icons/fi';
import { BsPinAngle } from 'react-icons/bs';
import { HiMegaphone } from 'react-icons/hi2';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import announcementService from '../../services/announcementService';
import departmentService from '../../services/departmentService';
import { formatDate } from '../../utils/helpers';

const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch,
          formState: { errors } } = useForm();

  const targetAudience = watch('targetAudience', 'ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [annRes, deptRes] = await Promise.all([
        announcementService.getAll(),
        departmentService.getAll(),
      ]);
      setAnnouncements(annRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (announcement = null) => {
    setEditing(announcement);
    if (announcement) {
      Object.keys(announcement).forEach(k => setValue(k, announcement[k]));
    } else {
      reset({
        priority: 'MEDIUM',
        category: 'GENERAL',
        targetAudience: 'ALL',
        isPinned: false,
      });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await announcementService.update(editing.id, data);
        toast.success('Announcement updated');
      } else {
        await announcementService.create(data);
        toast.success('Announcement created');
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
      await announcementService.delete(deleteId);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await announcementService.togglePin(id);
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await announcementService.toggleActive(id);
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Announcements"
        subtitle="Create and manage company announcements"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> New Announcement
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                        text-white">
          <p className="text-sm opacity-90">Total</p>
          <p className="text-3xl font-bold mt-2">{announcements.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600
                        text-white">
          <p className="text-sm opacity-90">Active</p>
          <p className="text-3xl font-bold mt-2">
            {announcements.filter(a => a.isActive).length}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600
                        text-white">
          <p className="text-sm opacity-90">Pinned</p>
          <p className="text-3xl font-bold mt-2">
            {announcements.filter(a => a.isPinned).length}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600
                        text-white">
          <p className="text-sm opacity-90">Urgent</p>
          <p className="text-3xl font-bold mt-2">
            {announcements.filter(a => a.priority === 'URGENT').length}
          </p>
        </div>
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : announcements.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={HiMegaphone}
            title="No Announcements"
            description="Create your first announcement"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id}
                 className={`card ${a.isPinned ? 'border-l-4 border-yellow-500' : ''}
                             ${!a.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {a.isPinned && <BsPinAngle className="text-yellow-600 h-4 w-4" />}
                    <h3 className="font-bold text-gray-800">{a.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5
                                       rounded-full ${
                                         PRIORITY_COLORS[a.priority]}`}>
                      {a.priority}
                    </span>
                    <span className="badge-info text-xs">
                      {a.targetAudience}
                    </span>
                    {!a.isActive && (
                      <span className="badge-danger text-xs">Inactive</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3"
                     dangerouslySetInnerHTML={{ __html: a.content }} />

                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <FiUsers /> {a.readCount} reads
                    </span>
                    <span className="flex items-center gap-1">
                      <FiEye /> {a.viewCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar /> {formatDate(a.publishDate)}
                    </span>
                    {a.expiryDate && (
                      <span>Expires: {formatDate(a.expiryDate)}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => setViewing(a)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    title="View"
                  >
                    <FiEye />
                  </button>
                  <button
                    onClick={() => handleTogglePin(a.id)}
                    className={`p-2 rounded-lg hover:bg-yellow-50 ${
                      a.isPinned ? 'text-yellow-600' : 'text-gray-400'}`}
                    title="Pin"
                  >
                    <BsPinAngle />
                  </button>
                  <button
                    onClick={() => handleToggleActive(a.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    title="Toggle Active"
                  >
                    {a.isActive ? <FiEye /> : <FiEyeOff />}
                  </button>
                  <button
                    onClick={() => openModal(a)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => setDeleteId(a.id)}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? 'Edit Announcement' : 'New Announcement'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              {...register('title', { required: 'Required' })}
              className={`input-field ${errors.title ? 'input-error' : ''}`}
              placeholder="Announcement title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Content * (HTML supported)
            </label>
            <textarea
              {...register('content', { required: 'Required' })}
              rows={6}
              className={`input-field resize-none ${
                errors.content ? 'input-error' : ''}`}
              placeholder="Announcement content..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Priority
              </label>
              <select {...register('priority')} className="input-field">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <input {...register('category')} className="input-field"
                     placeholder="GENERAL, POLICY, HR, etc."
                     defaultValue="GENERAL" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Target Audience
            </label>
            <select {...register('targetAudience')} className="input-field">
              <option value="ALL">All Employees</option>
              <option value="DEPARTMENT">Specific Department</option>
              <option value="SPECIFIC">Specific Employees</option>
            </select>
          </div>

          {targetAudience === 'DEPARTMENT' && (
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
            )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Publish Date
              </label>
              <input
                type="datetime-local"
                {...register('publishDate')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="datetime-local"
                {...register('expiryDate')}
                className="input-field"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isPinned')} />
            <span className="text-sm">📌 Pin to top</span>
          </label>

          <div className="flex gap-3 pt-2">
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
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title="Announcement Details"
        size="lg"
      >
        {viewing && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`text-xs font-medium px-2 py-0.5
                                   rounded-full ${
                                     PRIORITY_COLORS[viewing.priority]}`}>
                  {viewing.priority}
                </span>
                <span className="badge-info text-xs">{viewing.category}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {viewing.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Posted on {formatDate(viewing.publishDate)}
              </p>
            </div>

            <div className="prose max-w-none"
                 dangerouslySetInnerHTML={{ __html: viewing.content }} />

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {viewing.viewCount}
                </p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {viewing.readCount}
                </p>
                <p className="text-xs text-gray-500">Reads</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mt-2">
                  Audience: {viewing.targetAudience}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="This will be permanently deleted."
      />
    </Layout>
  );
};

export default Announcements;