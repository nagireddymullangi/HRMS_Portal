// src/pages/admin/ShiftManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiClock,
  FiUsers, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import shiftService from '../../services/shiftService';
import employeeService from '../../services/employeeService';
import { formatDate, getStatusBadge } from '../../utils/helpers';

const TABS = ['SHIFTS', 'ROSTER', 'OVERTIME'];

const ShiftManagement = () => {
  const [activeTab, setActiveTab] = useState('SHIFTS');
  const [shifts, setShifts] = useState([]);
  const [roster, setRoster] = useState([]);
  const [overtime, setOvertime] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shiftModal, setShiftModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  const { register: registerAssign, handleSubmit: handleSubmitAssign,
          reset: resetAssign,
          formState: { errors: errorsAssign } } = useForm();

  useEffect(() => {
    fetchAll();
    fetchEmployees();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [shiftsRes, rosterRes, otRes] = await Promise.all([
        shiftService.getAll(),
        shiftService.getRoster(),
        shiftService.getAllOvertime(),
      ]);
      setShifts(shiftsRes.data.data || []);
      setRoster(rosterRes.data.data || []);
      setOvertime(otRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data.data?.filter(e => e.status === 'ACTIVE') || []);
    } catch {
      console.error('Failed to load');
    }
  };

  const openShiftModal = (shift = null) => {
    setEditingShift(shift);
    if (shift) {
      Object.keys(shift).forEach(k => setValue(k, shift[k]));
    } else {
      reset({
        breakMinutes: 60,
        isNightShift: false,
        isActive: true,
      });
    }
    setShiftModal(true);
  };

  const onSubmitShift = async (data) => {
    setSubmitting(true);
    try {
      if (editingShift) {
        await shiftService.update(editingShift.id, data);
        toast.success('Shift updated');
      } else {
        await shiftService.create(data);
        toast.success('Shift created');
      }
      setShiftModal(false);
      reset();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitAssign = async (data) => {
    setSubmitting(true);
    try {
      await shiftService.assign({
        employeeId: parseInt(data.employeeId),
        shiftId: parseInt(data.shiftId),
        effectiveFrom: data.effectiveFrom,
      });
      toast.success('Shift assigned');
      setAssignModal(false);
      resetAssign();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await shiftService.delete(deleteId);
      toast.success('Shift deleted');
      fetchAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleOvertimeAction = async (id, status) => {
    try {
      await shiftService.approveOvertime(id, status);
      toast.success(`Overtime ${status.toLowerCase()}`);
      fetchAll();
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Shift Management"
        subtitle="Manage shifts, rosters, and overtime"
        action={
          activeTab === 'SHIFTS' ? (
            <button onClick={() => openShiftModal()} className="btn-primary">
              <FiPlus /> Add Shift
            </button>
          ) : activeTab === 'ROSTER' ? (
            <button onClick={() => setAssignModal(true)} className="btn-primary">
              <FiPlus /> Assign Shift
            </button>
          ) : null
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2
              transition-all whitespace-nowrap
              ${activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : (
        <>
          {/* SHIFTS TAB */}
          {activeTab === 'SHIFTS' && (
            shifts.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={FiClock}
                  title="No Shifts"
                  description="Create your first shift"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shifts.map(shift => (
                  <div key={shift.id} className="card hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl ${
                        shift.isNightShift
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-yellow-50 text-yellow-600'}`}>
                        <FiClock className="h-6 w-6" />
                      </div>
                      <span className={shift.isActive
                        ? 'badge-success' : 'badge-danger'}>
                        {shift.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {shift.name}
                    </h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Timing</span>
                        <span className="font-medium">
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Working Hours</span>
                        <span className="font-semibold text-primary-600">
                          {shift.workingHours}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Break</span>
                        <span className="font-medium">
                          {shift.breakMinutes} min
                        </span>
                      </div>
                      {shift.isNightShift && (
                        <div className="badge-info text-xs mt-2">
                          🌙 Night Shift
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openShiftModal(shift)}
                        className="flex-1 py-2 rounded-lg hover:bg-blue-50
                                   text-blue-600 text-sm font-medium
                                   flex items-center justify-center gap-1"
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(shift.id)}
                        className="flex-1 py-2 rounded-lg hover:bg-red-50
                                   text-red-600 text-sm font-medium
                                   flex items-center justify-center gap-1"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ROSTER TAB */}
          {activeTab === 'ROSTER' && (
            roster.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={FiUsers}
                  title="No Assignments"
                  description="Assign shifts to employees"
                />
              </div>
            ) : (
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Employee', 'Emp ID', 'Shift',
                          'Timing', 'Hours', 'Since'].map(h => (
                          <th key={h}
                              className="px-4 py-3 text-left text-xs
                                         font-semibold text-gray-500
                                         uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {roster.map(r => (
                        <tr key={r.employeeId}
                            className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">
                            {r.employeeName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {r.employeeCode}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="badge-info">{r.shiftName}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {r.startTime} - {r.endTime}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold
                                         text-primary-600">
                            {r.workingHours}h
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(r.effectiveFrom)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* OVERTIME TAB */}
          {activeTab === 'OVERTIME' && (
            overtime.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={FiClock}
                  title="No Overtime Records"
                  description="Overtime requests will appear here"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {overtime.map(ot => (
                  <div key={ot.id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-800">
                            {ot.employee?.fullName || 'Employee'}
                          </h3>
                          <span className={getStatusBadge(ot.status)}>
                            {ot.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Date</p>
                            <p className="font-medium">
                              {formatDate(ot.date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Hours</p>
                            <p className="font-bold text-primary-600">
                              {ot.hours}h
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Rate</p>
                            <p className="font-medium">
                              {ot.rateMultiplier}x
                            </p>
                          </div>
                        </div>
                        {ot.reason && (
                          <p className="text-sm text-gray-500 mt-2">
                            <span className="font-medium">Reason:</span>
                            {ot.reason}
                          </p>
                        )}
                      </div>
                      {ot.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleOvertimeAction(ot.id, 'APPROVED')}
                            className="btn-success text-xs"
                          >
                            <FiCheckCircle /> Approve
                          </button>
                          <button
                            onClick={() =>
                              handleOvertimeAction(ot.id, 'REJECTED')}
                            className="btn-danger text-xs"
                          >
                            <FiXCircle /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Shift Modal */}
      <Modal
        isOpen={shiftModal}
        onClose={() => { setShiftModal(false); reset(); }}
        title={editingShift ? 'Edit Shift' : 'New Shift'}
      >
        <form onSubmit={handleSubmit(onSubmitShift)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Shift Name *
            </label>
            <input
              {...register('name', { required: 'Required' })}
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g., Morning Shift"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Time *
              </label>
              <input
                type="time"
                {...register('startTime', { required: 'Required' })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                End Time *
              </label>
              <input
                type="time"
                {...register('endTime', { required: 'Required' })}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Break (minutes)
            </label>
            <input
              type="number"
              {...register('breakMinutes')}
              className="input-field"
              defaultValue={60}
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('isNightShift')} />
              <span className="text-sm">Night Shift</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('isActive')} defaultChecked />
              <span className="text-sm">Active</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button"
                    onClick={() => { setShiftModal(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editingShift ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={assignModal}
        onClose={() => { setAssignModal(false); resetAssign(); }}
        title="Assign Shift to Employee"
      >
        <form onSubmit={handleSubmitAssign(onSubmitAssign)}
              className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Employee *
            </label>
            <select
              {...registerAssign('employeeId', { required: 'Required' })}
              className={`input-field ${
                errorsAssign.employeeId ? 'input-error' : ''}`}
            >
              <option value="">Select Employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Shift *
            </label>
            <select
              {...registerAssign('shiftId', { required: 'Required' })}
              className={`input-field ${
                errorsAssign.shiftId ? 'input-error' : ''}`}
            >
              <option value="">Select Shift</option>
              {shifts.filter(s => s.isActive).map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Effective From *
            </label>
            <input
              type="date"
              {...registerAssign('effectiveFrom', { required: 'Required' })}
              className="input-field"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button"
                    onClick={() => { setAssignModal(false); resetAssign(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Assigning...' : 'Assign Shift'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Shift"
        message="This shift will be permanently deleted."
      />
    </Layout>
  );
};

export default ShiftManagement;