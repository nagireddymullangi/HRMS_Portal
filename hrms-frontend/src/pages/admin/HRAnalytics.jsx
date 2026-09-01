// src/pages/admin/HRAnalytics.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart, RadialBarChart,
  RadialBar, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  FiUsers, FiTrendingUp, FiTrendingDown, FiDollarSign,
  FiUserCheck, FiUserX, FiCalendar, FiBriefcase,
  FiActivity, FiPieChart, FiDownload
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import analyticsService from '../../services/analyticsService';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444',
                '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const HRAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('OVERVIEW');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await analyticsService.getDashboard();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loader /></Layout>;
  if (!data) return <Layout><p>No data</p></Layout>;

  const TABS = ['OVERVIEW', 'WORKFORCE', 'ATTRITION', 'ATTENDANCE',
                 'PAYROLL', 'RECRUITMENT'];

  return (
    <Layout>
      <PageHeader
        title="HR Analytics & MIS Dashboard"
        subtitle="Executive insights and workforce intelligence"
        action={
          <button className="btn-primary">
            <FiDownload /> Export Report
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap
              ${tab === t
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'OVERVIEW' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                            text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Employees</p>
                  <p className="text-3xl font-bold mt-1">
                    {data.totalEmployees}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    {data.activeEmployees} active
                  </p>
                </div>
                <FiUsers className="h-10 w-10 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600
                            text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">New Hires</p>
                  <p className="text-3xl font-bold mt-1">
                    +{data.newHiresThisMonth}
                  </p>
                  <p className="text-xs opacity-75 mt-1">This month</p>
                </div>
                <FiUserCheck className="h-10 w-10 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-500 to-red-600
                            text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Attrition Rate</p>
                  <p className="text-3xl font-bold mt-1">
                    {data.attritionRate}%
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    {data.exitsThisMonth} exits this month
                  </p>
                </div>
                <FiTrendingDown className="h-10 w-10 opacity-50" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600
                            text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Monthly Payroll</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(data.totalMonthlyPayroll)}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Avg: {formatCurrency(data.avgSalary)}
                  </p>
                </div>
                <FiDollarSign className="h-10 w-10 opacity-50" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-gray-500">Avg Tenure</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {data.avgTenureYears} <span className="text-sm">years</span>
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Avg Age</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {data.avgAge} <span className="text-sm">years</span>
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {data.avgAttendanceRate}%
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Open Positions</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {data.openPositions}
              </p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">
                📊 Hiring vs Attrition Trend
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.monthlyHires.map((h, i) => ({
                  month: h.month,
                  hires: h.hires,
                  exits: data.monthlyExits[i]?.exits || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="hires" stroke="#10b981"
                        strokeWidth={2} name="Hires" />
                  <Line type="monotone" dataKey="exits" stroke="#ef4444"
                        strokeWidth={2} name="Exits" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">
                🏢 Department Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.departmentDistribution}
                    cx="50%" cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.departmentDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">
                💰 Payroll Trend
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.payrollTrend}>
                  <defs>
                    <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="amount"
                        stroke="#3b82f6" fillOpacity={1}
                        fill="url(#colorPayroll)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">
                📅 Attendance This Week
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">
                📉 Attrition by Department
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.attritionByDepartment} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="department" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#ef4444" name="Attrition %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">
                🎯 Recruitment Funnel
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.recruitmentFunnel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="stage" angle={-30} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6"
                       radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* WORKFORCE TAB */}
      {tab === 'WORKFORCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">Age Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">Tenure Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.tenureDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">Gender Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.genderDistribution}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.genderDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">Department Wise</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.departmentDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ATTRITION TAB */}
      {tab === 'ATTRITION' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card">
              <p className="text-sm text-gray-500">Attrition Rate</p>
              <p className="text-4xl font-bold text-red-600 mt-2">
                {data.attritionRate}%
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Retention Rate</p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {data.retentionRate}%
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Voluntary Exits</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">
                {data.voluntaryExits}
              </p>
            </div>
          </div>

          <div className="card mb-6">
            <h3 className="font-bold text-gray-800 mb-4">
              Monthly Exit Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyExits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="exits" stroke="#ef4444"
                      strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">
              Attrition by Department
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.attritionByDepartment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="department" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="rate" fill="#ef4444" name="Attrition %"
                     radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Other tabs would follow similar patterns */}
      {['ATTENDANCE', 'PAYROLL', 'RECRUITMENT'].includes(tab) && (
        <div className="card text-center py-12">
          <FiActivity className="h-16 w-16 mx-auto text-gray-300" />
          <p className="text-gray-500 mt-4">
            {tab} detailed view - Extend with additional endpoints
          </p>
        </div>
      )}
    </Layout>
  );
};

export default HRAnalytics;