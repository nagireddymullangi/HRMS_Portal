// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import {
  FiUsers, FiGrid, FiCalendar,
  FiFileText, FiDollarSign, FiUserCheck
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import dashboardService from '../../services/dashboardService';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getAdminDashboard();
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
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                        xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={data?.totalEmployees || 0}
            icon={FiUsers}
            color="blue"
            subtitle={`${data?.activeEmployees || 0} active`}
          />
          <StatCard
            title="Departments"
            value={data?.totalDepartments || 0}
            icon={FiGrid}
            color="purple"
          />
          <StatCard
            title="Present Today"
            value={data?.presentToday || 0}
            icon={FiUserCheck}
            color="green"
          />
          <StatCard
            title="Pending Leaves"
            value={data?.pendingLeaves || 0}
            icon={FiFileText}
            color="yellow"
          />
          <StatCard
            title="Monthly Payroll"
            value={formatCurrency(data?.totalPayrollThisMonth || 0)}
            icon={FiDollarSign}
            color="indigo"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Department wise */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Employees by Department
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.departmentWiseEmployees || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Leave Status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Leave Status Overview
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.leaveStatusStats || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(data?.leaveStatusStats || []).map((entry, index) => (
                    <Cell key={index}
                          fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default AdminDashboard;