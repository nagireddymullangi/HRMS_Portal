// src/pages/employee/MyTimesheet.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiClock, FiCheck, FiX,
  FiEdit2, FiTrash2, FiSend, FiCalendar,
  FiTrendingUp, FiFileText
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import timesheetService from '../../services/timesheetService';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const MyTimesheet = () => {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm();

  useEffect(() => {
    if (user?.employeeId) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      const weekStart = monday.toISOString().split('T')[0];

      const [tsRes, projRes, statsRes, weekRes] = await Promise.all([
        timesheetService.getByEmployee(user.employeeId),
        projectService.getByEmployee(user.employeeId),
        timesheetService.getEmployeeStats(user.employeeId),
        timesheetService.getWeekly(user.employeeId, weekStart),
      ]);
      setTimesheets(tsRes.data.data || []);
      setProjects(projRes.data.data || []);
      setStats(statsRes.data.data || {});
      setWeeklyData(weekRes.data.data);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (ts = null) => {
    setEditing(ts);
    if (ts) {
      setValue('workDate', ts.workDate);
      setValue('projectId', ts.projectId);
      setValue('hoursWorked', ts.hoursWorked);
      setValue('description', ts.description);
      setValue('isBillable', ts.isBillable);
    } else {
      reset({
        workDate: new Date().toISOString().split('T')[0],
        isBillable: true,
      });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        employee: { id: user.employeeId },
        project: { id: parseInt(data.projectId) },
        hoursWorked: parseFloat(data.hoursWorked),
      };

      if (editing) {
        await timesheetService.update(editing.id, payload);
        toast.success('Updated');
      } else {
        await timesheetService.create(payload);
        toast.success('Timesheet entry created');
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

  const handleSubmitOne = async (id) => {
    try {
      await timesheetService.submit(id);
      toast.success('Submitted for approval');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleSubmitBulk = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Select timesheets first');
      return;
    }
    try {
      await timesheetService.submitBulk(selectedIds);
      toast.success(`${selectedIds.length} submitted`);
      setSelectedIds([]);
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async () => {
    try {
      await timesheetService.delete(deleteId);
      toast.success('Deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]);
  };

  const filtered = filter === 'ALL' ? timesheets
    : timesheets.filter(t => t.status === filter);

  const draftCount = timesheets.filter(t => t.status === 'DRAFT').length;

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  return (
    <Layout>
      <PageHeader
        title="My Timesheet"
        subtitle="Log your work hours"
        action={
          <div className="flex gap-2">
            {draftCount > 0 && (
              <button
                onClick={handleSubmitBulk}
                disabled={selectedIds.length === 0}
                className="btn-success"
              >
                <FiSend /> Submit Selected ({selectedIds.length})
              </button>
            )}
            <button onClick={() => openModal()} className="btn-primary">
              <FiPlus /> Add Entry
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                        text-white">
          <p className="text-sm opacity-90">Today</p>
          <p className="text-3xl font-bold mt-1">
            {stats.todayHours || 0}h
          </p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600
                        text-white">
          <p className="text-sm opacity-90">This Week</p>
          <p className="text-3xl font-bold mt-1">
            {stats.weekHours || 0}h
          </p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600
                        text-white">
          <p className="text-sm opacity-90">This Month</p>
          <p className="text-3xl font-bold mt-1">
            {stats.monthHours || 0}h
          </p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600
                        text-white">
          <p className="text-sm opacity-90">Draft Entries</p>
          <p className="text-3xl font-bold mt-1">{draftCount}</p>
        </div>
      </div>

      {/* Weekly Chart */}
      {weeklyData && (
        <div className="card mb-6">
          <h3 className="font-bold text-gray-800 mb-4">This Week</h3>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(weeklyData.dailyHours || {}).map(([date, hours]) => {
              const d = new Date(date);
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = d.getDate();
              const isToday = d.toDateString() === new Date().toDateString();
              const percentage = Math.min((parseFloat(hours) / 8) * 100, 100);

              return (
                <div key={date} className="text-center">
                  <p className="text-xs text-gray-500">{dayName}</p>
                  <p className={`text-lg font-bold ${
                    isToday ? 'text-primary-600' : 'text-gray-700'}`}>
                    {dayNum}
                  </p>
                  <div className="mt-2 h-24 bg-gray-100 rounded-lg
                                  overflow-hidden flex flex-col justify-end
                                  relative">
                    <div
                      className={`transition-all ${
                        percentage >= 100 ? 'bg-green-500'
                          : percentage >= 75 ? 'bg-blue-500'
                          : 'bg-yellow-500'}`}
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    {hours}h
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].map(f => (
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
            icon={FiClock}
            title="No Timesheet Entries"
            description="Start logging your work hours"
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filtered.filter(t =>
                            t.status === 'DRAFT').map(t => t.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                  </th>
                  {['Date', 'Project', 'Hours', 'Description',
                    'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs
                                          font-semibold text-gray-500
                                          uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(ts => (
                  <tr key={ts.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      {ts.status === 'DRAFT' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(ts.id)}
                          onChange={() => toggleSelect(ts.id)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(ts.workDate)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">{ts.projectName}</p>
                      <p className="text-xs text-gray-400">{ts.projectCode}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-primary-600">
                      {ts.hoursWorked}h
                      {ts.isBillable && (
                        <span className="ml-1 text-xs text-green-600">$</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600
                                   max-w-xs truncate">
                      {ts.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1
                                         rounded-full ${statusColors[ts.status]}`}>
                        {ts.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {ts.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handleSubmitOne(ts.id)}
                              className="p-1.5 rounded-lg hover:bg-green-50
                                         text-green-600"
                              title="Submit"
                            >
                              <FiSend className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openModal(ts)}
                              className="p-1.5 rounded-lg hover:bg-blue-50
                                         text-blue-600"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(ts.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50
                                         text-red-600"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {ts.status === 'REJECTED' && (
                          <button
                            onClick={() => openModal(ts)}
                            className="p-1.5 rounded-lg hover:bg-blue-50
                                       text-blue-600"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                        )}
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
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? 'Edit Timesheet' : 'Add Time Entry'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Work Date *
            </label>
            <input
              type="date"
              {...register('workDate', { required: 'Required' })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project *</label>
            <select
              {...register('projectId', { required: 'Required' })}
              className={`input-field ${errors.projectId ? 'input-error' : ''}`}
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.projectCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Hours Worked *
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="24"
              {...register('hoursWorked', { required: 'Required' })}
              className={`input-field ${
                errors.hoursWorked ? 'input-error' : ''}`}
              placeholder="e.g., 8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Work Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field resize-none"
              placeholder="What did you work on?"
            />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isBillable')} defaultChecked />
            <span className="text-sm">Billable Hours</span>
          </label>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Add Entry'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Entry"
        message="This entry will be deleted."
      />
    </Layout>
  );
};

export default MyTimesheet;