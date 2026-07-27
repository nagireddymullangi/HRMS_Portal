// src/pages/admin/PayrollManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2,
  FiDollarSign, FiCheckCircle
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import payrollService from '../../services/payrollService';
import employeeService from '../../services/employeeService';
import { formatCurrency, getStatusBadge } from '../../utils/helpers';

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterMonth, setFilterMonth] = useState(
    new Date().getMonth() + 1
  );
  const [filterYear, setFilterYear] = useState(
    new Date().getFullYear()
  );

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } = useForm({
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    }
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [filterMonth, filterYear]);

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data.data || []);
    } catch {
      toast.error('Failed to load employees');
    }
  };

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getByMonthYear(
        filterMonth, filterYear
      );
      setPayrolls(res.data.data || []);
    } catch {
      toast.error('Failed to load payroll');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (p = null) => {
    setEditingPayroll(p);
    if (p) {
      Object.keys(p).forEach((k) => setValue(k, p[k]));
    } else {
      reset({
        month: filterMonth,
        year: filterYear,
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingPayroll) {
        await payrollService.update(editingPayroll.id, data);
        toast.success('Payroll updated');
      } else {
        await payrollService.generate(data);
        toast.success('Payroll generated successfully');
      }
      setIsModalOpen(false);
      reset();
      fetchPayrolls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await payrollService.markPaid(id);
      toast.success('Marked as paid');
      fetchPayrolls();
    } catch {
      toast.error('Failed to mark as paid');
    }
  };

  const handleDelete = async () => {
    try {
      await payrollService.delete(deleteId);
      toast.success('Payroll deleted');
      fetchPayrolls();
    } catch {
      toast.error('Delete failed');
    }
  };

  const totalNet = payrolls.reduce(
    (sum, p) => sum + (parseFloat(p.netSalary) || 0), 0
  );

  const years = Array.from({ length: 5 },
    (_, i) => new Date().getFullYear() - i);

  return (
    <Layout>
      <PageHeader
        title="Payroll Management"
        subtitle="Generate and manage employee payroll"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus className="h-4 w-4" /> Generate Payroll
          </button>
        }
      />

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Month
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="input-field w-40"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Year
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="input-field w-28"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Total Net Payroll</p>
            <p className="text-xl font-bold text-gray-800">
              {formatCurrency(totalNet)}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : payrolls.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiDollarSign}
            title="No Payroll Records"
            description="Generate payroll for the selected month"
            action={
              <button onClick={() => openModal()} className="btn-primary">
                <FiPlus /> Generate Payroll
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
                  {['Employee', 'Basic', 'Gross', 'Deductions',
                    'Net Salary', 'Status', 'Actions'].map((h) => (
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
                {payrolls.map((p) => (
                  <tr key={p.id}
                      className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-800">
                        {p.employeeName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.employeeCode} • {p.departmentName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatCurrency(p.basicSalary)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatCurrency(p.grossSalary)}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      -{formatCurrency(p.totalDeductions)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold 
                                   text-green-600">
                      {formatCurrency(p.netSalary)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(p.status)}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.status === 'GENERATED' && (
                          <button
                            onClick={() => handleMarkPaid(p.id)}
                            className="p-2 rounded-lg hover:bg-green-50 
                                       text-green-600 transition-colors"
                            title="Mark as Paid"
                          >
                            <FiCheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openModal(p)}
                          className="p-2 rounded-lg hover:bg-blue-50 
                                     text-blue-600 transition-colors"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
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

      {/* Generate/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title={editingPayroll ? 'Edit Payroll' : 'Generate Payroll'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editingPayroll && (
            <div>
              <label className="block text-sm font-medium 
                                text-gray-700 mb-1">
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
              <label className="block text-sm font-medium 
                                text-gray-700 mb-1">Month *</label>
              <select {...register('month', { required: true })}
                      className="input-field">
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium 
                                text-gray-700 mb-1">Year *</label>
              <select {...register('year', { required: true })}
                      className="input-field">
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-200" />
          <p className="text-sm font-semibold text-gray-700">
            💰 Earnings
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              ['basicSalary', 'Basic Salary'],
              ['hra', 'HRA'],
              ['transportAllowance', 'Transport Allowance'],
              ['medicalAllowance', 'Medical Allowance'],
              ['otherAllowances', 'Other Allowances'],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block text-sm font-medium 
                                  text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0"
                  {...register(name,{ min: 0 })}
                  onKeyDown={(e) => {
                    if (e.key === '-'){
                      e.preventDefault();
                    }
                  }}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <hr className="border-gray-200" />
          <p className="text-sm font-semibold text-gray-700">
            📉 Deductions
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              ['pfDeduction', 'PF Deduction'],
              ['taxDeduction', 'Tax Deduction'],
              ['otherDeductions', 'Other Deductions'],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block text-sm font-medium 
                                  text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0"
                  {...register(name,{ min: 0 })}
                  // onKeyDown={(e) => {
                  //   if (e.key === '-'){
                  //     e.preventDefault();
                  //   }
                  // }}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            ))}
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
              {submitting ? 'Processing...' :
               editingPayroll ? 'Update Payroll' : 'Generate Payroll'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Payroll"
        message="Delete this payroll record permanently?"
        confirmText="Delete"
      />
    </Layout>
  );
};
export default PayrollManagement;