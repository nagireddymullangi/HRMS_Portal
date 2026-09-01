// src/pages/admin/SettlementManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiDollarSign, FiCheck, FiEye,
  FiDownload, FiSend, FiPause, FiEdit2, FiTrash2,
  FiCheckCircle, FiClock
} from 'react-icons/fi';
import { FaCalculator, FaRupeeSign } from 'react-icons/fa';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import settlementService from '../../services/settlementService';
import employeeService from '../../services/employeeService';
import { formatDate, formatCurrency } from '../../utils/helpers';

const SettlementManagement = () => {
  const [settlements, setSettlements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [autoCalcData, setAutoCalcData] = useState(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');

  const { register, handleSubmit, reset, setValue, watch,
          formState: { errors } } = useForm();

  const values = watch();

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const [settRes, empRes, statsRes] = await Promise.all([
        filter === 'ALL'
          ? settlementService.getAll()
          : settlementService.getByStatus(filter),
        employeeService.getAll(),
        settlementService.getStatistics(),
      ]);
      setSettlements(settRes.data.data || []);
      setEmployees(empRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (settlement = null) => {
    setEditing(settlement);
    setAutoCalcData(null);
    if (settlement) {
      Object.keys(settlement).forEach(k => setValue(k, settlement[k]));
    } else {
      reset();
    }
    setModalOpen(true);
  };

  const handleAutoCalculate = async (empId) => {
    if (!empId) return;
    try {
      const res = await settlementService.autoCalculate(empId);
      const data = res.data.data;
      setAutoCalcData(data);

      // Auto-fill form
      setValue('pendingSalary', data.pendingSalary);
      setValue('leaveEncashment', data.leaveEncashment);
      setValue('leaveEncashmentDays', data.leaveEncashmentDays);
      setValue('gratuity', data.gratuity);

      toast.success(`Calculated based on ${data.yearsOfService} years of service`);
    } catch {
      toast.error('Auto-calculation failed');
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        employee: { id: parseInt(data.employeeId) },
        pendingSalary: parseFloat(data.pendingSalary || 0),
        pendingBonus: parseFloat(data.pendingBonus || 0),
        leaveEncashment: parseFloat(data.leaveEncashment || 0),
        leaveEncashmentDays: parseInt(data.leaveEncashmentDays || 0),
        gratuity: parseFloat(data.gratuity || 0),
        noticePeriodRecovery: parseFloat(data.noticePeriodRecovery || 0),
        otherEarnings: parseFloat(data.otherEarnings || 0),
        taxDeduction: parseFloat(data.taxDeduction || 0),
        pfDeduction: parseFloat(data.pfDeduction || 0),
        loanRecovery: parseFloat(data.loanRecovery || 0),
        advanceRecovery: parseFloat(data.advanceRecovery || 0),
        assetRecovery: parseFloat(data.assetRecovery || 0),
        otherDeductions: parseFloat(data.otherDeductions || 0),
      };

      if (editing) {
        await settlementService.update(editing.id, payload);
        toast.success('Updated');
      } else {
        await settlementService.create(payload);
        toast.success('Settlement created');
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

  const handleSubmitForApproval = async (id) => {
    try {
      await settlementService.submit(id);
      toast.success('Submitted for approval');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      await settlementService.approve(id);
      toast.success('Approved');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handlePay = async () => {
    if (!paymentRef.trim()) {
      toast.error('Payment reference required');
      return;
    }
    try {
      await settlementService.markPaid(payModal.id, {
        paymentReference: paymentRef,
        paymentMode,
      });
      toast.success('Payment recorded');
      setPayModal(null);
      setPaymentRef('');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDownloadPdf = async (id, settlementNumber) => {
    try {
      const res = await settlementService.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${settlementNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async () => {
    try {
      await settlementService.delete(deleteId);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  // Calculate totals for form preview
  const previewTotals = () => {
    const earnings = ['pendingSalary', 'pendingBonus', 'leaveEncashment',
                       'gratuity', 'otherEarnings']
      .reduce((sum, k) => sum + parseFloat(values[k] || 0), 0);

    const deductions = ['taxDeduction', 'pfDeduction', 'loanRecovery',
                         'advanceRecovery', 'assetRecovery',
                         'noticePeriodRecovery', 'otherDeductions']
      .reduce((sum, k) => sum + parseFloat(values[k] || 0), 0);

    return { earnings, deductions, net: earnings - deductions };
  };

  const totals = previewTotals();

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    ON_HOLD: 'bg-orange-100 text-orange-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <Layout>
      <PageHeader
        title="Full & Final Settlements"
        subtitle="Manage employee exit settlements"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> New Settlement
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Draft', value: stats.draft, color: 'purple' },
          { label: 'Pending', value: stats.pendingApproval, color: 'yellow' },
          { label: 'Approved', value: stats.approved, color: 'blue' },
          { label: 'Paid', value: stats.paid, color: 'green' },
          { label: 'On Hold', value: stats.onHold, color: 'orange' },
        ].map(s => (
          <div key={s.label} className={`card bg-gradient-to-br
            from-${s.color}-500 to-${s.color}-600 text-white text-center`}>
            <p className="text-xs opacity-90">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value || 0}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'ON_HOLD'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium
              ${filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : settlements.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FaRupeeSign}
            title="No Settlements"
            description="Create settlements for exiting employees"
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Settlement #', 'Employee', 'LWD',
                    'Net Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs
                                          font-semibold text-gray-500
                                          uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settlements.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">
                      {s.settlementNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{s.employeeName}</p>
                      <p className="text-xs text-gray-400">
                        {s.employeeCode}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(s.lastWorkingDate)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(s.netSettlement)}
                      </p>
                      <p className="text-xs text-gray-500">
                        E: {formatCurrency(s.totalEarnings)} |
                        D: {formatCurrency(s.totalDeductions)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1
                                         rounded-full ${statusColors[s.status]}`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setViewModal(s)}
                          className="p-1.5 rounded-lg hover:bg-blue-50
                                     text-blue-600" title="View"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(
                            s.id, s.settlementNumber)}
                          className="p-1.5 rounded-lg hover:bg-purple-50
                                     text-purple-600" title="Download PDF"
                        >
                          <FiDownload className="h-4 w-4" />
                        </button>
                        {s.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => openModal(s)}
                              className="p-1.5 rounded-lg hover:bg-blue-50
                                         text-blue-600"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleSubmitForApproval(s.id)}
                              className="p-1.5 rounded-lg hover:bg-yellow-50
                                         text-yellow-600" title="Submit"
                            >
                              <FiSend className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {s.status === 'PENDING_APPROVAL' && (
                          <button
                            onClick={() => handleApprove(s.id)}
                            className="p-1.5 rounded-lg hover:bg-green-50
                                       text-green-600" title="Approve"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                        )}
                        {s.status === 'APPROVED' && (
                          <button
                            onClick={() => setPayModal(s)}
                            className="p-1.5 rounded-lg hover:bg-green-50
                                       text-green-600" title="Mark Paid"
                          >
                            <FiCheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {s.status !== 'PAID' && (
                          <button
                            onClick={() => setDeleteId(s.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50
                                       text-red-600"
                          >
                            <FiTrash2 className="h-4 w-4" />
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); setAutoCalcData(null); }}
        title={editing ? 'Edit Settlement' : 'New F&F Settlement'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editing && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee *
                </label>
                <select
                  {...register('employeeId', { required: 'Required' })}
                  className={`input-field ${
                    errors.employeeId ? 'input-error' : ''}`}
                >
                  <option value="">Select Employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.employeeId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handleAutoCalculate(values.employeeId)}
                  className="btn-primary w-full justify-center"
                  disabled={!values.employeeId}
                >
                  <FaCalculator /> Auto Calculate
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Last Working Date *
            </label>
            <input
              type="date"
              {...register('lastWorkingDate', { required: 'Required' })}
              className="input-field"
            />
          </div>

          {autoCalcData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-semibold mb-1">
                📊 Auto-Calculation Preview
              </p>
              <p className="text-xs text-blue-600">
                Years of Service: <strong>{autoCalcData.yearsOfService}</strong> |
                Basic Salary: <strong>{formatCurrency(autoCalcData.basicSalary)}</strong>
              </p>
              {autoCalcData.yearsOfService < 5 && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Gratuity requires 5+ years of service
                </p>
              )}
            </div>
          )}

          {/* Earnings Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">💰 EARNINGS</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Pending Salary
                </label>
                <input type="number" step="0.01" {...register('pendingSalary')}
                       className="input-field" defaultValue={0} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Pending Bonus
                </label>
                <input type="number" step="0.01" {...register('pendingBonus')}
                       className="input-field" defaultValue={0} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Leave Encashment
                </label>
                <input type="number" step="0.01" {...register('leaveEncashment')}
                       className="input-field" defaultValue={0} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Leave Days
                </label>
                <input type="number" {...register('leaveEncashmentDays')}
                       className="input-field" defaultValue={0} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Gratuity
                </label>
                <input type="number" step="0.01" {...register('gratuity')}
                       className="input-field" defaultValue={0} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Other Earnings
                </label>
                <input type="number" step="0.01" {...register('otherEarnings')}
                       className="input-field" defaultValue={0} />
              </div>
              <div className="col-span-2">
                <input {...register('otherEarningsNote')}
                       className="input-field"
                       placeholder="Other earnings notes..." />
              </div>
            </div>
            <p className="mt-3 text-right font-bold text-green-700">
              Total Earnings: {formatCurrency(totals.earnings)}
            </p>
          </div>

          {/* Deductions Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-3">📉 DEDUCTIONS</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Tax Deduction
                </label>
                <input type="number" step="0.01" {...register('taxDeduction')}
                       className="input-field" defaultValue={0} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  PF Deduction
                </label>
                <input type="number" step="0.01" {...register('pfDeduction')}
                       className="input-field" defaultValue={0} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Loan Recovery
                </label>
                <input type="number" step="0.01" {...register('loanRecovery')}
                       className="input-field" defaultValue={0} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Advance Recovery
                </label>
                <input type="number" step="0.01" {...register('advanceRecovery')}
                       className="input-field" defaultValue={0} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Asset Recovery
                </label>
                <input type="number" step="0.01" {...register('assetRecovery')}
                       className="input-field" defaultValue={0} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Notice Period Recovery
                </label>
                <input type="number" step="0.01"
                       {...register('noticePeriodRecovery')}
                       className="input-field" defaultValue={0} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1">
                  Other Deductions
                </label>
                <input type="number" step="0.01" {...register('otherDeductions')}
                       className="input-field" defaultValue={0} />
                <input {...register('otherDeductionsNote')}
                       className="input-field mt-2"
                       placeholder="Other deductions notes..." />
              </div>
            </div>
            <p className="mt-3 text-right font-bold text-red-700">
              Total Deductions: {formatCurrency(totals.deductions)}
            </p>
          </div>

          {/* Net Amount Preview */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-700
                          text-white rounded-lg p-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Net Settlement</span>
              <span className="text-3xl font-bold">
                {formatCurrency(totals.net)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea {...register('notes')} rows={2}
                      className="input-field resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create Settlement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Settlement Details"
        size="lg"
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 font-mono">
                {viewModal.settlementNumber}
              </p>
              <h3 className="text-xl font-bold">{viewModal.employeeName}</h3>
              <p className="text-gray-500">
                {viewModal.designation} • {viewModal.departmentName}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                LWD: {formatDate(viewModal.lastWorkingDate)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-bold text-green-800 mb-3">Earnings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pending Salary</span>
                    <span>{formatCurrency(viewModal.pendingSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Bonus</span>
                    <span>{formatCurrency(viewModal.pendingBonus)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leave Encashment ({viewModal.leaveEncashmentDays}d)</span>
                    <span>{formatCurrency(viewModal.leaveEncashment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gratuity</span>
                    <span>{formatCurrency(viewModal.gratuity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span>{formatCurrency(viewModal.otherEarnings)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t
                                  border-green-200">
                    <span>Total</span>
                    <span>{formatCurrency(viewModal.totalEarnings)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-bold text-red-800 mb-3">Deductions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(viewModal.taxDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PF</span>
                    <span>{formatCurrency(viewModal.pfDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan Recovery</span>
                    <span>{formatCurrency(viewModal.loanRecovery)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Advance Recovery</span>
                    <span>{formatCurrency(viewModal.advanceRecovery)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Asset Recovery</span>
                    <span>{formatCurrency(viewModal.assetRecovery)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Notice Period</span>
                    <span>{formatCurrency(viewModal.noticePeriodRecovery)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t
                                  border-red-200">
                    <span>Total</span>
                    <span>{formatCurrency(viewModal.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-500 to-primary-700
                            text-white rounded-lg p-6 text-center">
              <p className="text-sm opacity-90">Net Settlement Amount</p>
              <p className="text-4xl font-bold mt-2">
                {formatCurrency(viewModal.netSettlement)}
              </p>
            </div>

            {viewModal.paidAt && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm">
                  ✓ Paid on {formatDate(viewModal.paidAt)}
                  {viewModal.paymentReference && ` | Ref: ${viewModal.paymentReference}`}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Pay Modal */}
      <Modal
        isOpen={!!payModal}
        onClose={() => { setPayModal(null); setPaymentRef(''); }}
        title="Mark as Paid"
      >
        {payModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm">Employee: <strong>{payModal.employeeName}</strong></p>
              <p className="text-sm">Amount:
                <strong className="text-green-600">
                  {formatCurrency(payModal.netSettlement)}
                </strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Mode
              </label>
              <select value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="input-field">
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Reference *
              </label>
              <input
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="input-field"
                placeholder="Transaction ID / Cheque Number"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setPayModal(null); setPaymentRef(''); }}
                      className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePay}
                      className="btn-success flex-1 justify-center">
                <FiCheckCircle /> Confirm Payment
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Settlement"
        message="This settlement will be permanently deleted."
      />
    </Layout>
  );
};

export default SettlementManagement;