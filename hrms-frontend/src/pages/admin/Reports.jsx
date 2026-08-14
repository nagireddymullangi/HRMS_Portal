// src/pages/admin/Reports.jsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiDownload, FiUsers, FiCalendar,
   FiFileText, FiBarChart2
} from 'react-icons/fi';
import { LuIndianRupee } from 'react-icons/lu';
import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import reportService, { downloadFile } from '../../services/reportService';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

const Reports = () => {
  const [loading, setLoading] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [leaveStatus, setLeaveStatus] = useState('ALL');

  const handleDownload = async (fn, filename, key) => {
    setLoading(key);
    try {
      const res = await fn();
      downloadFile(res.data, filename);
      toast.success('Downloaded successfully');
    } catch {
      toast.error('Download failed');
    } finally {
      setLoading('');
    }
  };

  const years = Array.from({ length: 5 },
    (_, i) => new Date().getFullYear() - i);

  const reports = [
    {
      key: 'emp-excel',
      title: 'Employees Directory',
      description: 'Export all employees with details',
      icon: FiUsers,
      color: 'blue',
      buttons: [
        {
          label: 'Excel',
          onClick: () => handleDownload(
            reportService.exportEmployeesExcel,
            'employees.xlsx', 'emp-excel'),
        },
        {
          label: 'CSV',
          onClick: () => handleDownload(
            reportService.exportEmployeesCsv,
            'employees.csv', 'emp-csv'),
        },
      ],
    },
  ];

  return (
    <Layout>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Download detailed reports for HR analysis"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Reports */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Employee Directory</h3>
              <p className="text-sm text-gray-500">
                Complete employee list with details
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              disabled={loading === 'emp-excel'}
              onClick={() => handleDownload(
                reportService.exportEmployeesExcel,
                'employees.xlsx', 'emp-excel')}
              className="btn-primary flex-1 justify-center"
            >
              <FiDownload /> Excel
            </button>
            <button
              disabled={loading === 'emp-csv'}
              onClick={() => handleDownload(
                reportService.exportEmployeesCsv,
                'employees.csv', 'emp-csv')}
              className="btn-secondary flex-1 justify-center"
            >
              <FiDownload /> CSV
            </button>
          </div>
        </div>

        {/* Attendance Report */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <FiCalendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Attendance Report</h3>
              <p className="text-sm text-gray-500">
                Date-range attendance data
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <button
            disabled={loading === 'att'}
            onClick={() => handleDownload(
              () => reportService.exportAttendanceExcel(startDate, endDate),
              `attendance_${startDate}_to_${endDate}.xlsx`, 'att')}
            className="btn-primary w-full mt-3 justify-center"
          >
            <FiDownload /> Download Attendance
          </button>
        </div>

        {/* Payroll Report */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <LuIndianRupee className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Payroll Report</h3>
              <p className="text-sm text-gray-500">
                Monthly payroll with totals
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="input-field text-sm"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="input-field text-sm"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button
            disabled={loading === 'pay'}
            onClick={() => handleDownload(
              () => reportService.exportPayrollExcel(month, year),
              `payroll_${month}_${year}.xlsx`, 'pay')}
            className="btn-primary w-full mt-3 justify-center"
          >
            <FiDownload /> Download Payroll
          </button>
        </div>

        {/* Leaves Report */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <FiFileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Leaves Report</h3>
              <p className="text-sm text-gray-500">
                Filter by status
              </p>
            </div>
          </div>
          <select
            value={leaveStatus}
            onChange={(e) => setLeaveStatus(e.target.value)}
            className="input-field text-sm mt-4"
          >
            <option value="ALL">All Leaves</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button
            disabled={loading === 'leave'}
            onClick={() => handleDownload(
              () => reportService.exportLeavesExcel(leaveStatus),
              `leaves_${leaveStatus}.xlsx`, 'leave')}
            className="btn-primary w-full mt-3 justify-center"
          >
            <FiDownload /> Download Leaves
          </button>
        </div>

        {/* HR Summary Report */}
        <div className="card md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <FiBarChart2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                Monthly HR Summary Report
              </h3>
              <p className="text-sm text-gray-500">
                Comprehensive HR analytics for the month
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="input-field text-sm"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="input-field text-sm"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              disabled={loading === 'hr'}
              onClick={() => handleDownload(
                () => reportService.generateHRReport(month, year),
                `hr_report_${month}_${year}.xlsx`, 'hr')}
              className="btn-primary justify-center"
            >
              <FiDownload /> Generate
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;