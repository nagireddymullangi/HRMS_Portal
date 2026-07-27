// src/pages/employee/MyAttendance.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock } from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStatusBadge } from '../../utils/helpers';

const MyAttendance = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterMonth, setFilterMonth] = useState(
    new Date().getMonth() + 1
  );
  const [filterYear] = useState(new Date().getFullYear());

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendances.find((a) => a.date === today);

  useEffect(() => {
    if (user?.employeeId) {
      fetchAttendance();
      fetchSummary();
    }
  }, [user, filterMonth]);

  const fetchAttendance = async () => {
    try {
      const start = `${filterYear}-${String(filterMonth).padStart(2, '0')}-01`;
      const end = new Date(filterYear, filterMonth, 0)
        .toISOString().split('T')[0];
      const res = await attendanceService.getByEmployee(
        user.employeeId, { startDate: start, endDate: end }
      );
      setAttendances(res.data.data || []);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await attendanceService.getSummary(
        user.employeeId, filterMonth, filterYear
      );
      setSummary(res.data.data || {});
    } catch {
      console.error('Failed to load summary');
    }
  };

  const handleMarkAttendance = async () => {
    if (!checkInTime) {
      toast.error('Please enter check-in time');
      return;
    }
    setSubmitting(true);
    try {
      await attendanceService.mark({
        employeeId: user.employeeId,
        date: today,
        checkIn: checkInTime,
        checkOut: checkOutTime || null,
        status: 'PRESENT',
      });
      toast.success('Attendance marked successfully!');
      setIsModalOpen(false);
      setCheckInTime('');
      setCheckOutTime('');
      fetchAttendance();
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Layout>
      <PageHeader
        title="My Attendance"
        subtitle="Track your daily attendance"
        action={
          !todayAttendance ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <FiClock className="h-4 w-4" />
              Mark Today's Attendance
            </button>
          ) : (
            <span className="badge-success px-4 py-2 rounded-lg text-sm">
              ✓ Attendance Marked Today
            </span>
          )
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Present', value: summary.present || 0,
            color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Absent', value: summary.absent || 0,
            color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Half Day', value: summary.halfDay || 0,
            color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'On Leave', value: summary.onLeave || 0,
            color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className={`card ${s.bg} border-none`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Month Filter */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-600">
            Filter by Month:
          </label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="input-field w-40"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m} {filterYear}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <Loader fullScreen={false} />
      ) : attendances.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiCalendar}
            title="No Attendance Records"
            description="No records found for selected month"
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Date', 'Check In', 'Check Out',
                    'Working Hours', 'Status', 'Notes'].map((h) => (
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
                {attendances.map((a) => (
                  <tr key={a.id}
                      className={`hover:bg-gray-50 transition-colors
                        ${a.date === today ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium 
                                   text-gray-800">
                      {formatDate(a.date)}
                      {a.date === today && (
                        <span className="ml-2 text-xs bg-primary-100 
                                         text-primary-700 px-2 py-0.5 
                                         rounded-full">
                          Today
                        </span>
                      )}
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
                        {a.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {a.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Mark Attendance"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-800">
              📅 Today: {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Time *
            </label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Time (Optional)
            </label>
            <input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkAttendance}
              disabled={submitting}
              className="btn-primary flex-1 justify-center"
            >
              {submitting ? 'Marking...' : 'Mark Present'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
export default MyAttendance;