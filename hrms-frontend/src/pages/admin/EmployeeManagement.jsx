// src/pages/admin/EmployeeManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiUsers, FiEye
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import employeeService from '../../services/employeeService';
import departmentService from '../../services/departmentService';
import { getInitials, getStatusBadge, formatDate } from '../../utils/helpers';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [editingEmp, setEditingEmp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        employeeService.getAll(),
        departmentService.getAll(),
      ]);
      setEmployees(empRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter((e) =>
    e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    e.departmentName?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (emp = null) => {
    setEditingEmp(emp);
    if (emp) {
      Object.keys(emp).forEach((key) => setValue(key, emp[key]));
      setValue('departmentId', emp.departmentId);
    } else {
      reset();
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingEmp) {
        await employeeService.update(editingEmp.id, data);
        toast.success('Employee updated successfully');
      } else {
        await employeeService.create(data);
        toast.success('Employee created successfully');
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

  const handleDelete = async () => {
    try {
      await employeeService.delete(deleteId);
      toast.success('Employee deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Employee Management"
        subtitle={`${employees.length} total employees`}
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus className="h-4 w-4" /> Add Employee
          </button>
        }
      />

      {/* Search */}
      <div className="card mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 
                               text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, email, ID, department..."
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
            icon={FiUsers}
            title="No Employees Found"
            description="Add employees or try a different search"
            action={
              <button onClick={() => openModal()} className="btn-primary">
                <FiPlus /> Add Employee
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
                  {['Employee', 'ID', 'Department',
                    'Designation', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs 
                                          font-semibold text-gray-500 
                                          uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((emp) => (
                  <tr key={emp.id}
                      className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-100 
                                        flex items-center justify-center 
                                        flex-shrink-0">
                          <span className="text-primary-700 font-semibold 
                                          text-sm">
                            {getInitials(emp.fullName)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {emp.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {emp.employeeId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {emp.departmentName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {emp.designation || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(emp.status)}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedEmp(emp);
                            setViewModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 
                                     text-gray-500 transition-colors"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(emp)}
                          className="p-2 rounded-lg hover:bg-blue-50 
                                     text-blue-600 transition-colors"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(emp.id)}
                          className="p-2 rounded-lg hover:bg-red-50 
                                     text-red-600 transition-colors"
                        >
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title={editingEmp ? 'Edit Employee' : 'Add New Employee'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                {...register('firstName', {
                  required: 'First name is required'
                })}
                className={`input-field ${
                  errors.firstName ? 'input-error' : ''}`}
                placeholder="First name"
              />
              {errors.firstName && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                {...register('lastName', {
                  required: 'Last name is required'
                })}
                className={`input-field ${
                  errors.lastName ? 'input-error' : ''}`}
                placeholder="Last name"
              />
              {errors.lastName && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email'
                }
              })}
              disabled={!!editingEmp}
              className={`input-field ${
                errors.email ? 'input-error' : ''} 
                ${editingEmp ? 'bg-gray-50' : ''}`}
              placeholder="email@company.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {!editingEmp && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium 
                                  text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  {...register('username', {
                    required: 'Username is required'
                  })}
                  className={`input-field ${
                    errors.username ? 'input-error' : ''}`}
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium 
                                  text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Min 6 characters'
                    }
                  })}
                  className={`input-field ${
                    errors.password ? 'input-error' : ''}`}
                  placeholder="Password"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                {...register('phone')}
                className="input-field"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                {...register('designation')}
                className="input-field"
                placeholder="Job title"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                {...register('departmentId')}
                className="input-field"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Joining
              </label>
              <input
                type="date"
                {...register('dateOfJoining')}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className="input-field"
              />
            </div>
            {editingEmp && (
              <div>
                <label className="block text-sm font-medium 
                                  text-gray-700 mb-1">
                  Status
                </label>
                <select {...register('status')} className="input-field">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              {...register('address')}
              rows={2}
              className="input-field resize-none"
              placeholder="Full address"
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
               editingEmp ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        title="Employee Details"
      >
        {selectedEmp && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 
                            border-b border-gray-100">
              <div className="h-16 w-16 rounded-full bg-primary-100 
                              flex items-center justify-center">
                <span className="text-primary-700 font-bold text-xl">
                  {getInitials(selectedEmp.fullName)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {selectedEmp.fullName}
                </h3>
                <p className="text-gray-500 text-sm">
                  {selectedEmp.designation || 'N/A'}
                </p>
                <span className={getStatusBadge(selectedEmp.status)}>
                  {selectedEmp.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Employee ID', selectedEmp.employeeId],
                ['Email', selectedEmp.email],
                ['Phone', selectedEmp.phone || 'N/A'],
                ['Department', selectedEmp.departmentName || 'N/A'],
                ['Date of Birth', formatDate(selectedEmp.dateOfBirth)],
                ['Date of Joining', formatDate(selectedEmp.dateOfJoining)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase 
                                font-semibold tracking-wider">{label}</p>
                  <p className="text-sm text-gray-700 mt-0.5 font-medium">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            {selectedEmp.address && (
              <div>
                <p className="text-xs text-gray-400 uppercase 
                              font-semibold tracking-wider">Address</p>
                <p className="text-sm text-gray-700 mt-0.5">
                  {selectedEmp.address}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message="This will permanently delete the employee and their account."
        confirmText="Delete Employee"
      />
    </Layout>
  );
};
export default EmployeeManagement;