// src/pages/admin/PayrollManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiDownload,
  FiDollarSign, FiCheckCircle, FiEye, FiTrendingUp, FiTrendingDown, FiShield
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
import { FaRupeeSign } from 'react-icons/fa';

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
  const [viewingPayroll, setViewingPayroll] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterMonth, setFilterMonth] = useState(
    new Date().getMonth() + 1
  );
  const [filterYear, setFilterYear] = useState(
    new Date().getFullYear()
  );

  const { register, handleSubmit, reset, setValue, watch,
          formState: { errors } } = useForm({
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basicSalary: '',
      hra: '',
      transportAllowance: '',
      medicalAllowance: '',
      otherAllowances: 0,
      pfDeduction: '',
      esiDeduction: 0,
      professionalTax: 0,
      taxDeduction: 0,
      otherDeductions: 0,
      pfEmployer: '',
      esiEmployer: 0,
    }
  });

  const basicSalaryValue = watch('basicSalary');
  const hraValue = watch('hra');
  const transportAllowanceValue = watch('transportAllowance');
  const medicalAllowanceValue = watch('medicalAllowance');
  const otherAllowancesValue = watch('otherAllowances');

  const pfDeductionValue = watch('pfDeduction');
  const esiDeductionValue = watch('esiDeduction');
  const professionalTaxValue = watch('professionalTax');
  const taxDeductionValue = watch('taxDeduction');
  const otherDeductionsValue = watch('otherDeductions');

  const pfEmployerValue = watch('pfEmployer');
  const esiEmployerValue = watch('esiEmployer');

  // Real-time calculations for preview in modal
  const calcBasic = parseFloat(basicSalaryValue) || 0;
  const calcHra = parseFloat(hraValue) || 0;
  const calcTA = parseFloat(transportAllowanceValue) || 0;
  const calcMed = parseFloat(medicalAllowanceValue) || 0;
  const calcOtherAllow = parseFloat(otherAllowancesValue) || 0;
  const previewGross = calcBasic + calcHra + calcTA + calcMed + calcOtherAllow;

  const calcPfEmployee = parseFloat(pfDeductionValue) || 0;
  const calcEsiEmployee = parseFloat(esiDeductionValue) || 0;
  const calcPT = parseFloat(professionalTaxValue) || 0;
  const calcTax = parseFloat(taxDeductionValue) || 0;
  const calcOtherDed = parseFloat(otherDeductionsValue) || 0;
  const previewTotalDeductions = calcPfEmployee + calcEsiEmployee + calcPT + calcTax + calcOtherDed;
  const previewNetSalary = Math.max(0, previewGross - previewTotalDeductions);

  const calcPfEmployer = parseFloat(pfEmployerValue) || 0;
  const calcEsiEmployer = parseFloat(esiEmployerValue) || 0;
  const previewTotalEmployer = calcPfEmployer + calcEsiEmployer;
  const previewCtc = previewGross + previewTotalEmployer;

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [filterMonth, filterYear]);

  // Auto-fill standard Indian payroll components when basicSalary changes (only in Create mode)
  useEffect(() => {
    if (editingPayroll) return; // Do not overwrite values when editing an existing payroll

    const basic = parseFloat(basicSalaryValue) || 0;
    if (basic > 0) {
      const hra = Math.round(basic * 0.40);
      const ta = Math.round(basic * 0.10);
      const med = Math.round(basic * 0.05);
      const gross = basic + hra + ta + med;

      setValue('hra', hra);
      setValue('transportAllowance', ta);
      setValue('medicalAllowance', med);
      setValue('otherAllowances', 0);

      // EPF 12% for employee and employer
      const epf = Math.round(basic * 0.12);
      setValue('pfDeduction', epf);
      setValue('pfEmployer', epf);

      // ESI: applicable if gross <= 21,000 (0.75% employee, 3.25% employer)
      if (gross <= 21000) {
        setValue('esiDeduction', Math.round(gross * 0.0075));
        setValue('esiEmployer', Math.round(gross * 0.0325));
      } else {
        setValue('esiDeduction', 0);
        setValue('esiEmployer', 0);
      }

      // Professional Tax (Standard 200 if gross > 15,000)
      setValue('professionalTax', gross > 15000 ? 200 : 0);

      // TDS (10% of gross if gross > 25,000)
      setValue('taxDeduction', gross > 25000 ? Math.round(gross * 0.10) : 0);
    } else {
      setValue('hra', 0);
      setValue('transportAllowance', 0);
      setValue('medicalAllowance', 0);
      setValue('otherAllowances', 0);
      setValue('pfDeduction', 0);
      setValue('esiDeduction', 0);
      setValue('professionalTax', 0);
      setValue('taxDeduction', 0);
      setValue('pfEmployer', 0);
      setValue('esiEmployer', 0);
    }
  }, [basicSalaryValue, setValue, editingPayroll]);

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
      setValue('employeeId', p.employeeId);
      setValue('month', p.month);
      setValue('year', p.year);
      setValue('basicSalary', p.basicSalary ?? p.basicPay ?? 0);
      setValue('hra', p.hra ?? 0);
      setValue('transportAllowance', p.transportAllowance ?? 0);
      setValue('medicalAllowance', p.medicalAllowance ?? 0);
      setValue('otherAllowances', p.otherAllowances ?? 0);
      setValue('pfDeduction', p.pfDeduction ?? p.pfEmployee ?? 0);
      setValue('esiDeduction', p.esiDeduction ?? p.esiEmployee ?? 0);
      setValue('professionalTax', p.professionalTax ?? 0);
      setValue('taxDeduction', p.taxDeduction ?? 0);
      setValue('otherDeductions', p.otherDeductions ?? 0);
      setValue('pfEmployer', p.pfEmployer ?? 0);
      setValue('esiEmployer', p.esiEmployer ?? 0);
    } else {
      reset({
        month: filterMonth,
        year: filterYear,
        basicSalary: '',
        hra: '',
        transportAllowance: '',
        medicalAllowance: '',
        otherAllowances: 0,
        pfDeduction: '',
        esiDeduction: 0,
        professionalTax: 0,
        taxDeduction: 0,
        otherDeductions: 0,
        pfEmployer: '',
        esiEmployer: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleDownloadPayslip = async (id) => {
    try {
      const res = await payrollService.downloadPayslipPdf(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast.error('Failed to download payslip');
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingPayroll) {
        await payrollService.update(editingPayroll.id, data);
        toast.success('Payroll updated successfully');
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

  const totalCTC = payrolls.reduce(
    (sum, p) => sum + (parseFloat(p.ctc) || (parseFloat(p.grossSalary || 0) + parseFloat(p.totalEmployerContribution || 0))), 0
  );

  const years = Array.from({ length: 5 },
    (_, i) => new Date().getFullYear() - i);

  return (
    <Layout>
      <PageHeader
        title="Payroll Management"
        subtitle="Manage employee salary structures, allowances, statutory deductions, and employer contributions"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus className="h-4 w-4" /> Generate Payroll
          </button>
        }
      />

      {/* Filters & Summary */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
          </div>
          
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Net Payroll</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(totalNet)}
              </p>
            </div>
            <div className="border-l border-gray-200 pl-6">
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Company CTC</p>
              <p className="text-xl font-bold text-indigo-600">
                {formatCurrency(totalCTC)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : payrolls.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FaRupeeSign}
            title="No Payroll Records"
            description="Generate payroll for the selected month to see records"
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
                  {['Employee', 'Basic Pay', 'Gross Earnings', 'Employee Deductions',
                    'Employer PF & ESI', 'Net Salary', 'Status', 'Actions'].map((h) => (
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
                        {p.employeeCode} • {p.departmentName || 'General'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {formatCurrency(p.basicSalary ?? p.basicPay)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-semibold">
                      {formatCurrency(p.grossSalary)}
                      <span className="block text-[11px] text-gray-400 font-normal">
                        HRA: {formatCurrency(p.hra)} | TA: {formatCurrency(p.transportAllowance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      -{formatCurrency(p.totalDeductions)}
                      <span className="block text-[11px] text-gray-400 font-normal">
                        PF: {formatCurrency(p.pfDeduction)} | ESI: {formatCurrency(p.esiDeduction)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-indigo-600 font-medium">
                      {formatCurrency(p.totalEmployerContribution || ((parseFloat(p.pfEmployer) || 0) + (parseFloat(p.esiEmployer) || 0)))}
                      <span className="block text-[11px] text-gray-400 font-normal">
                        PF: {formatCurrency(p.pfEmployer)} | ESI: {formatCurrency(p.esiEmployer)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      {formatCurrency(p.netSalary)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(p.status)}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingPayroll(p)}
                          className="p-2 rounded-lg hover:bg-gray-100 
                                     text-gray-600 transition-colors"
                          title="View Details"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
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
                          onClick={() => handleDownloadPayslip(p.id)}
                          className="p-2 rounded-lg hover:bg-blue-50 
                                     text-blue-600 transition-colors"
                          title="Download Payslip PDF"
                        >
                          <FiDownload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(p)}
                          className="p-2 rounded-lg hover:bg-amber-50 
                                     text-amber-600 transition-colors"
                          title="Edit Payroll"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-2 rounded-lg hover:bg-red-50 
                                     text-red-600 transition-colors"
                          title="Delete"
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
        title={editingPayroll ? 'Edit Payroll Record' : 'Generate Employee Payroll'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {!editingPayroll && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Employee *
              </label>
              <select
                {...register('employeeId', {
                  required: 'Employee is required'
                })}
                className={`input-field ${errors.employeeId ? 'input-error' : ''}`}
              >
                <option value="">Select Employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} ({e.employeeId}) - {e.designation || 'No Designation'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Month *
              </label>
              <select {...register('month', { required: true })} className="input-field">
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Year *
              </label>
              <select {...register('year', { required: true })} className="input-field">
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 1: Earnings */}
          <div className="border border-green-100 rounded-xl p-4 bg-green-50/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiTrendingUp className="text-green-600" />
                <h4 className="text-sm font-bold text-gray-800">
                  Earnings & Allowances
                </h4>
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                Gross: {formatCurrency(previewGross)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Basic Pay * (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('basicSalary', { required: 'Basic Pay is required', min: 0 })}
                  className="input-field"
                  placeholder="e.g. 30000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  HRA (40% of Basic) (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('hra', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Transport Allowance (TA) (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('transportAllowance', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Medical Allowance (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('medicalAllowance', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Other / Special Allowances (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('otherAllowances', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Deductions */}
          <div className="border border-red-100 rounded-xl p-4 bg-red-50/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiTrendingDown className="text-red-500" />
                <h4 className="text-sm font-bold text-gray-800">
                  Employee Deductions
                </h4>
              </div>
              <span className="text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                Total Deductions: -{formatCurrency(previewTotalDeductions)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Employee PF (12% Basic) (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('pfDeduction', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Employee ESI (0.75% Gross) (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('esiDeduction', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Professional Tax (PT) (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('professionalTax', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tax Deducted at Source (TDS) (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('taxDeduction', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Other Deductions / LOP (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('otherDeductions', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Employer Contributions */}
          <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiShield className="text-indigo-600" />
                <h4 className="text-sm font-bold text-gray-800">
                  Employer Statutory Contributions (Part of CTC)
                </h4>
              </div>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                Employer Contribution: {formatCurrency(previewTotalEmployer)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Employer PF (12% of Basic) (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('pfEmployer', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Employer ESI (3.25% of Gross) (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register('esiEmployer', { min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Live Summary Bar */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-xs uppercase font-semibold text-green-700">Net Take-Home Salary</p>
              <p className="text-2xl font-bold text-green-700 mt-0.5">
                {formatCurrency(previewNetSalary)}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-indigo-50 border border-indigo-200">
              <p className="text-xs uppercase font-semibold text-indigo-700">Monthly CTC (Gross + Employer)</p>
              <p className="text-2xl font-bold text-indigo-700 mt-0.5">
                {formatCurrency(previewCtc)}
              </p>
            </div>
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

      {/* View Payroll Breakdown Modal */}
      {viewingPayroll && (
        <Modal
          isOpen={!!viewingPayroll}
          onClose={() => setViewingPayroll(null)}
          title={`Payroll Breakdown - ${MONTHS[viewingPayroll.month - 1]} ${viewingPayroll.year}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-200">
              <div>
                <p className="font-bold text-gray-800 text-base">{viewingPayroll.employeeName}</p>
                <p className="text-xs text-gray-500">
                  {viewingPayroll.employeeCode} • {viewingPayroll.departmentName || 'General'} • {viewingPayroll.designation || 'N/A'}
                </p>
              </div>
              <span className={getStatusBadge(viewingPayroll.status)}>
                {viewingPayroll.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-1.5 text-green-700">
                  <FiTrendingUp /> Earnings
                </h5>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Basic Pay</span>
                    <span className="font-medium text-gray-800">{formatCurrency(viewingPayroll.basicSalary ?? viewingPayroll.basicPay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">House Rent Allowance (HRA)</span>
                    <span className="font-medium text-gray-800">{formatCurrency(viewingPayroll.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transport Allowance (TA)</span>
                    <span className="font-medium text-gray-800">{formatCurrency(viewingPayroll.transportAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Medical Allowance</span>
                    <span className="font-medium text-gray-800">{formatCurrency(viewingPayroll.medicalAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Other Allowances</span>
                    <span className="font-medium text-gray-800">{formatCurrency(viewingPayroll.otherAllowances)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-700 pt-2 border-t border-gray-100">
                    <span>Total Gross Earnings</span>
                    <span>{formatCurrency(viewingPayroll.grossSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-1.5 text-red-600">
                  <FiTrendingDown /> Employee Deductions
                </h5>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Employee PF (12%)</span>
                    <span className="font-medium text-red-600">-{formatCurrency(viewingPayroll.pfDeduction ?? viewingPayroll.pfEmployee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Employee ESI (0.75%)</span>
                    <span className="font-medium text-red-600">-{formatCurrency(viewingPayroll.esiDeduction ?? viewingPayroll.esiEmployee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Professional Tax (PT)</span>
                    <span className="font-medium text-red-600">-{formatCurrency(viewingPayroll.professionalTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Income Tax (TDS)</span>
                    <span className="font-medium text-red-600">-{formatCurrency(viewingPayroll.taxDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Other Deductions / LOP</span>
                    <span className="font-medium text-red-600">-{formatCurrency(viewingPayroll.otherDeductions)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-red-600 pt-2 border-t border-gray-100">
                    <span>Total Deductions</span>
                    <span>-{formatCurrency(viewingPayroll.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employer Contributions */}
            <div className="border border-indigo-100 bg-indigo-50/40 rounded-lg p-3">
              <h5 className="font-bold text-sm text-indigo-800 mb-2 flex items-center gap-1.5">
                <FiShield /> Employer Statutory Contributions
              </h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Employer PF Contribution (12%):</span>
                  <span className="font-semibold text-indigo-900">{formatCurrency(viewingPayroll.pfEmployer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Employer ESI Contribution (3.25%):</span>
                  <span className="font-semibold text-indigo-900">{formatCurrency(viewingPayroll.esiEmployer)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-indigo-900 pt-2 mt-2 border-t border-indigo-200 text-sm">
                <span>Total Employer Contribution</span>
                <span>{formatCurrency(viewingPayroll.totalEmployerContribution || ((parseFloat(viewingPayroll.pfEmployer) || 0) + (parseFloat(viewingPayroll.esiEmployer) || 0)))}</span>
              </div>
            </div>

            {/* Net & CTC Bar */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs uppercase font-semibold text-green-700">Net Take-Home Pay</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(viewingPayroll.netSalary)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-indigo-50 border border-indigo-200">
                <p className="text-xs uppercase font-semibold text-indigo-700">Monthly CTC</p>
                <p className="text-xl font-bold text-indigo-700">
                  {formatCurrency(viewingPayroll.ctc || (parseFloat(viewingPayroll.grossSalary || 0) + parseFloat(viewingPayroll.totalEmployerContribution || 0)))}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewingPayroll(null)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPayslip(viewingPayroll.id)}
                className="btn-primary"
              >
                <FiDownload className="h-4 w-4 mr-1.5" /> Download Payslip PDF
              </button>
            </div>
          </div>
        </Modal>
      )}

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
