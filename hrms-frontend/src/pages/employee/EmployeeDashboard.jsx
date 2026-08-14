// src/pages/employee/EmployeeDashboard.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiCalendar, FiFileText, FiDollarSign,
  FiClock, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency, getStatusBadge } from '../../utils/helpers';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.employeeId) fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getEmployeeDashboard(
        user.employeeId
      );
      setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loader fullScreen={false} /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-primary-100 mt-1">
            Here's your summary for this month.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Present Days"
            value={data?.myPresentDays || 0}
            icon={FiCheckCircle}
            color="green"
          />
          <StatCard
            title="Absent Days"
            value={data?.myAbsentDays || 0}
            icon={FiXCircle}
            color="red"
          />
          <StatCard
            title="Pending Leaves"
            value={data?.myPendingLeaves || 0}
            icon={FiClock}
            color="yellow"
          />
          <StatCard
            title="Approved Leaves"
            value={data?.myApprovedLeaves || 0}
            icon={FiFileText}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Payslip */}
          {data?.latestPayroll && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 
                             flex items-center gap-2">
                <FaRupeeSign className="text-green-600" />
                Latest Payslip
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Period</span>
                  <span className="font-medium">
                    {new Date(2024, data.latestPayroll.month - 1)
                      .toLocaleString('default', { month: 'long' })} {' '}
                    {data.latestPayroll.year}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gross Salary</span>
                  <span className="font-medium">
                    {formatCurrency(data.latestPayroll.grossSalary)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Deductions</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(data.latestPayroll.totalDeductions)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t 
                                border-gray-100 pt-3">
                  <span className="font-semibold text-gray-700">
                    Net Salary
                  </span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatCurrency(data.latestPayroll.netSalary)}
                  </span>
                </div>
                <span className={getStatusBadge(data.latestPayroll.status)}>
                  {data.latestPayroll.status}
                </span>
              </div>
            </div>
          )}

          {/* Recent Leaves */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 
                           flex items-center gap-2">
              <FiFileText className="text-blue-600" />
              Recent Leave Requests
            </h2>
            {data?.recentLeaves?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                No leave requests yet
              </p>
            ) : (
              <div className="space-y-3">
                {data?.recentLeaves?.map((leave) => (
                  <div key={leave.id}
                       className="flex items-center justify-between 
                                  p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {leave.leaveTypeName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(leave.startDate)} -
                        {formatDate(leave.endDate)}
                        ({leave.totalDays}d)
                      </p>
                    </div>
                    <span className={getStatusBadge(leave.status)}>
                      {leave.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 
                         flex items-center gap-2">
            <FiCalendar className="text-purple-600" />
            Recent Attendance
          </h2>
          {data?.recentAttendance?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No attendance records yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Date', 'Check In', 'Check Out',
                      'Hours', 'Status'].map((h) => (
                      <th key={h}
                          className="pb-3 text-left text-xs font-semibold 
                                     text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.recentAttendance?.map((a) => (
                    <tr key={a.id}
                        className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 text-sm text-gray-700">
                        {formatDate(a.date)}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {a.checkIn || '-'}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {a.checkOut || '-'}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {a.workingHours ? `${a.workingHours}h` : '-'}
                      </td>
                      <td className="py-3">
                        <span className={getStatusBadge(a.status)}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
export default EmployeeDashboard;