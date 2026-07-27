// src/pages/admin/DepartmentManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiGrid } from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import departmentService from '../../services/departmentService';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data.data || []);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (dept = null) => {
    setEditingDept(dept);
    if (dept) {
      setValue('name', dept.name);
      setValue('description', dept.description);
    } else {
      reset();
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingDept) {
        await departmentService.update(editingDept.id, data);
        toast.success('Department updated successfully');
      } else {
        await departmentService.create(data);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
      reset();
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await departmentService.delete(deleteId);
      toast.success('Department deleted');
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Department Management"
        subtitle="Manage your organization departments"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus className="h-4 w-4" /> Add Department
          </button>
        }
      />

      {loading ? (
        <Loader fullScreen={false} />
      ) : departments.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiGrid}
            title="No Departments"
            description="Add your first department to get started"
            action={
              <button onClick={() => openModal()} className="btn-primary">
                <FiPlus className="h-4 w-4" /> Add Department
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id}
                 className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <FiGrid className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {dept.employeeCount} employees
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(dept)}
                    className="p-2 rounded-lg hover:bg-blue-50 
                               text-blue-600 transition-colors"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(dept.id)}
                    className="p-2 rounded-lg hover:bg-red-50 
                               text-red-600 transition-colors"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {dept.description && (
                <p className="text-sm text-gray-500 mt-3 border-t 
                              border-gray-100 pt-3">
                  {dept.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title={editingDept ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Engineering"
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field resize-none"
              placeholder="Department description..."
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
              {submitting ? 'Saving...' :
               editingDept ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        message="Are you sure? This action cannot be undone."
        confirmText="Delete"
      />
    </Layout>
  );
};
export default DepartmentManagement;