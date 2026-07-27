// src/pages/admin/AttendanceManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiFilter } from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import attendanceService from '../../services/attendanceService';
import employeeService from '../../services/employeeService';
import { getStatusBadge, formatDate } from '../../utils/helpers';

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE'];

const AttendanceManagement = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filterDate]);

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data.data || []);
    } catch {
      toast.error('Failed to load employees');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getAll({ date: filterDate });
      setAttendances(res.data.data || []);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      setValue('employeeId', record.employeeId);
      setValue('date', record.date);
      setValue('checkIn', record.checkIn);
      setValue('checkOut', record.checkOut);
      setValue('status', record.status);
      setValue('notes', record.notes);
    } else {
      reset({ date: filterDate, status: 'PRESENT' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingRecord) {
        await attendanceService.update(editingRecord.id, data);
        toast.success('Attendance updated');
      } else {
        await attendanceService.mark(data);
        toast.success('Attendance marked');
      }
      setIsModalOpen(false);
      reset();
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await attendanceService.delete(deleteId);
      toast.success('Record deleted');
      fetchAttendance();
    } catch {
      toast.error('Delete failed');
    }
  };

  const stats = {
    present: attendances.filter(a => a.status === 'PRESENT').length,
    absent: attendances.filter(a => a.status === 'ABSENT').length,
    halfDay: attendances.filter(a => a.status === 'HALF_DAY').length,
    onLeave: attendances.filter(a => a.status === 'ON_LEAVE').length,
  };

  return (
    <Layout>
      <PageHeader
        title="Attendance Management"
        subtitle="Track and manage employee attendance"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus className="h-4 w-4" /> Mark Attendance
          </button>
        }
      />

      {/* Filter & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="card lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiFilter className="inline mr-1" /> Filter by Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input-field"
          />
        </div>
        {[
          { label: 'Present', value: stats.present, color: 'text-green-600' },
          { label: 'Absent', value: stats.absent, color: 'text-red-600' },
          { label: 'Half Day', value: stats.halfDay, color: 'text-yellow-600' },
          { label: 'On Leave', value: stats.onLeave, color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <Loader fullScreen={false} />
      ) : attendances.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiCalendar}
            title="No Attendance Records"
            description="No attendance found for selected date"
            action={
              <button onClick={() => openModal()} className="btn-primary">
                <FiPlus /> Mark Attendance
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
                  {['Employee', 'Date', 'Check In', 'Check Out',
                    'Hours', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs 
                                          font-semibold text-gray-500 
                                          uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendances.map((a) => (
                  <tr key={a.id}
                      className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-800">
                        {a.employeeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.employeeCode}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(a.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {a.checkIn || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {a.checkOut || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {a.workingHours ? `${a.workingHours}h` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(a.status)}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal(a)}
                          className="p-2 rounded-lg hover:bg-blue-50 
                                     text-blue-600 transition-colors"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(a.id)}
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title={editingRecord ? 'Edit Attendance' : 'Mark Attendance'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editingRecord && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee *
              </label>
              <select
                {...register('employeeId', {
                  required: 'Employee is required'
                })}
                className={`input-field ${
                  errors.employeeId ? 'input-error' : ''}`}
              >
                <option value="">Select Employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} ({e.employeeId})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                disabled={!!editingRecord}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="input-field"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check In
              </label>
              <input
                type="time"
                {...register('checkIn')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check Out
              </label>
              <input
                type="time"
                {...register('checkOut')}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              className="input-field resize-none"
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button"
                    onClick={() => { setIsModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' :
               editingRecord ? 'Update' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message="Delete this attendance record permanently?"
        confirmText="Delete"
      />
    </Layout>
  );
};
export default AttendanceManagement;