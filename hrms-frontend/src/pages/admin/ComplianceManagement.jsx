// src/pages/admin/ComplianceManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiShield, FiCalendar, FiAlertTriangle,
  FiCheckCircle, FiClock, FiEdit2, FiTrash2,
  FiFileText, FiFile
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import complianceService from '../../services/complianceService';
import { formatDate, formatCurrency } from '../../utils/helpers';

const TABS = ['DASHBOARD', 'RECORDS', 'CALENDAR'];

const RECORD_TYPES = ['PF', 'ESI', 'PT', 'TDS', 'GRATUITY', 'INCOME_TAX',
                       'LWF', 'BONUS', 'FORM_16', 'FORM_24Q', 'OTHER'];
const COMPLIANCE_TYPES = ['PF', 'ESI', 'PT', 'TDS', 'GRATUITY', 'INCOME_TAX',
                           'LWF', 'GST', 'ROC', 'AUDIT', 'OTHER'];

const ComplianceManagement = () => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [records, setRecords] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recordModal, setRecordModal] = useState(false);
  const [eventModal, setEventModal] = useState(false);
  const [fileModal, setFileModal] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [completeModal, setCompleteModal] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [acknowledgmentNumber, setAcknowledgmentNumber] = useState('');
  const [challanNumber, setChallanNumber] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  const { register: regRecord, handleSubmit: handleRecordSubmit,
          reset: resetRecord, setValue: setRecordValue,
          formState: { errors: recordErrors } } = useForm();

  const { register: regEvent, handleSubmit: handleEventSubmit,
          reset: resetEvent, setValue: setEventValue,
          formState: { errors: eventErrors } } = useForm();

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    try {
      const [statsRes, recordsRes, eventsRes] = await Promise.all([
        complianceService.getDashboard(),
        complianceService.getAllRecords(),
        complianceService.getAllEvents(),
      ]);
      setStats(statsRes.data.data || {});
      setRecords(recordsRes.data.data || []);
      setEvents(eventsRes.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openRecordModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      Object.keys(record).forEach(k => setRecordValue(k, record[k]));
    } else {
      resetRecord({
        recordType: 'PF',
        periodYear: new Date().getFullYear(),
        periodMonth: new Date().getMonth() + 1,
        filingStatus: 'PENDING',
      });
    }
    setRecordModal(true);
  };

  const onRecordSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        periodYear: parseInt(data.periodYear),
        periodMonth: data.periodMonth ? parseInt(data.periodMonth) : null,
        amount: parseFloat(data.amount || 0),
        employerContribution: parseFloat(data.employerContribution || 0),
        employeeContribution: parseFloat(data.employeeContribution || 0),
      };

      if (editingRecord) {
        await complianceService.updateRecord(editingRecord.id, payload);
        toast.success('Updated');
      } else {
        await complianceService.createRecord(payload);
        toast.success('Record created');
      }
      setRecordModal(false);
      resetRecord();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const openEventModal = (event = null) => {
    setEditingEvent(event);
    if (event) {
      Object.keys(event).forEach(k => setEventValue(k, event[k]));
    } else {
      resetEvent({
        complianceType: 'PF',
        frequency: 'MONTHLY',
        reminderDaysBefore: 7,
        isActive: true,
      });
    }
    setEventModal(true);
  };

  const onEventSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        reminderDaysBefore: parseInt(data.reminderDaysBefore || 7),
      };

      if (editingEvent) {
        await complianceService.updateEvent(editingEvent.id, payload);
        toast.success('Updated');
      } else {
        await complianceService.createEvent(payload);
        toast.success('Event created');
      }
      setEventModal(false);
      resetEvent();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleMarkFiled = async () => {
    if (!acknowledgmentNumber.trim()) {
      toast.error('Acknowledgment number required');
      return;
    }
    try {
      await complianceService.markFiled(fileModal.id, acknowledgmentNumber);
      toast.success('Marked as filed');
      setFileModal(null);
      setAcknowledgmentNumber('');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleMarkPaid = async () => {
    if (!challanNumber.trim()) {
      toast.error('Challan number required');
      return;
    }
    try {
      await complianceService.markPaid(payModal.id, challanNumber);
      toast.success('Marked as paid');
      setPayModal(null);
      setChallanNumber('');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleCompleteEvent = async () => {
    try {
      await complianceService.completeEvent(completeModal.id, completionNotes);
      toast.success('Completed');
      setCompleteModal(null);
      setCompletionNotes('');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDeleteRecord = async () => {
    try {
      await complianceService.deleteRecord(deleteRecordId);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await complianceService.deleteEvent(deleteEventId);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    FILED: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    ACKNOWLEDGED: 'bg-purple-100 text-purple-700',
    FAILED: 'bg-red-100 text-red-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
    SKIPPED: 'bg-gray-100 text-gray-700',
  };

  return (
    <Layout>
      <PageHeader
        title="Compliance & Statutory Management"
        subtitle="Track statutory compliance and deadlines"
        action={
          activeTab === 'RECORDS' ? (
            <button onClick={() => openRecordModal()} className="btn-primary">
              <FiPlus /> Add Record
            </button>
          ) : activeTab === 'CALENDAR' ? (
            <button onClick={() => openEventModal()} className="btn-primary">
              <FiPlus /> Add Event
            </button>
          ) : null
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2
              ${activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : (
        <>
          {/* Dashboard Tab */}
          {activeTab === 'DASHBOARD' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card bg-gradient-to-br from-red-500 to-red-600
                                text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Overdue</p>
                      <p className="text-3xl font-bold mt-2">
                        {stats.overdueEvents || 0}
                      </p>
                    </div>
                    <FiAlertTriangle className="h-10 w-10 opacity-50" />
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-yellow-500
                                to-yellow-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Upcoming (30d)</p>
                      <p className="text-3xl font-bold mt-2">
                        {stats.upcomingEvents || 0}
                      </p>
                    </div>
                    <FiClock className="h-10 w-10 opacity-50" />
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-green-500
                                to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Completed</p>
                      <p className="text-3xl font-bold mt-2">
                        {stats.completedEvents || 0}
                      </p>
                    </div>
                    <FiCheckCircle className="h-10 w-10 opacity-50" />
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-blue-500
                                to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Records</p>
                      <p className="text-3xl font-bold mt-2">
                        {stats.totalRecords || 0}
                      </p>
                    </div>
                    <FiFileText className="h-10 w-10 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Overdue Events */}
              <div className="card mb-6">
                <h3 className="font-bold text-red-600 mb-3
                               flex items-center gap-2">
                  <FiAlertTriangle /> Overdue Compliance
                </h3>
                {events.filter(e => e.status === 'OVERDUE').length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    ✓ No overdue events
                  </p>
                ) : (
                  <div className="space-y-2">
                    {events.filter(e => e.status === 'OVERDUE').map(e => (
                      <div key={e.id}
                           className="flex items-center justify-between p-3
                                      bg-red-50 border border-red-200
                                      rounded-lg">
                        <div>
                          <p className="font-medium">{e.title}</p>
                          <p className="text-xs text-red-600">
                            Was due: {formatDate(e.dueDate)} •
                            {e.complianceType}
                          </p>
                        </div>
                        <button
                          onClick={() => setCompleteModal(e)}
                          className="btn-success text-xs"
                        >
                          Mark Complete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Events */}
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-3
                               flex items-center gap-2">
                  <FiCalendar /> Upcoming Compliance (Next 30 Days)
                </h3>
                {events.filter(e => e.status === 'PENDING').slice(0, 5).length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming events</p>
                ) : (
                  <div className="space-y-2">
                    {events.filter(e => e.status === 'PENDING').slice(0, 5).map(e => {
                      const daysUntil = Math.ceil(
                        (new Date(e.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={e.id}
                             className="flex items-center justify-between p-3
                                        bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{e.title}</p>
                            <p className="text-xs text-gray-500">
                              {e.complianceType} • {e.frequency}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {formatDate(e.dueDate)}
                            </p>
                            <p className={`text-xs ${
                              daysUntil <= 7 ? 'text-red-600' :
                              daysUntil <= 15 ? 'text-orange-600' :
                              'text-gray-500'}`}>
                              {daysUntil > 0
                                ? `${daysUntil} days remaining`
                                : 'Due today'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Records Tab */}
          {activeTab === 'RECORDS' && (
            records.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={FiFileText}
                  title="No Records"
                  description="Add statutory records"
                />
              </div>
            ) : (
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Ref #', 'Type', 'Period', 'Employer',
                          'Employee', 'Total', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs
                                                font-semibold text-gray-500
                                                uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs font-mono text-gray-500">
                            {r.referenceNumber}
                          </td>
                          <td className="px-4 py-3">
                            <span className="badge-info text-xs">
                              {r.recordType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {r.periodMonth && `${r.periodMonth}/`}{r.periodYear}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(r.employerContribution)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(r.employeeContribution)}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-primary-600">
                            {formatCurrency(r.totalAmount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-1
                                               rounded-full ${statusColors[r.filingStatus]}`}>
                              {r.filingStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {r.filingStatus === 'PENDING' && (
                                <button
                                  onClick={() => setFileModal(r)}
                                  className="p-1.5 rounded-lg hover:bg-blue-50
                                             text-blue-600" title="Mark Filed"
                                >
                                  <FiFile className="h-4 w-4" />
                                </button>
                              )}
                              {r.filingStatus === 'FILED' && (
                                <button
                                  onClick={() => setPayModal(r)}
                                  className="p-1.5 rounded-lg hover:bg-green-50
                                             text-green-600" title="Mark Paid"
                                >
                                  <FiCheckCircle className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => openRecordModal(r)}
                                className="p-1.5 rounded-lg hover:bg-blue-50
                                           text-blue-600"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteRecordId(r.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50
                                           text-red-600"
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
            )
          )}

          {/* Calendar Tab */}
          {activeTab === 'CALENDAR' && (
            events.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={FiCalendar}
                  title="No Events"
                  description="Add compliance events to calendar"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(e => (
                  <div key={e.id} className={`card ${
                    e.status === 'OVERDUE' ? 'border-l-4 border-red-500' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge-info text-xs">
                            {e.complianceType}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5
                                             rounded-full ${statusColors[e.status]}`}>
                            {e.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-800">{e.title}</h3>
                        {e.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {e.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Due Date</p>
                        <p className="font-medium">{formatDate(e.dueDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Frequency</p>
                        <p className="font-medium">{e.frequency}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      {e.status !== 'COMPLETED' && (
                        <button
                          onClick={() => setCompleteModal(e)}
                          className="btn-success text-xs flex-1 justify-center"
                        >
                          <FiCheckCircle /> Mark Complete
                        </button>
                      )}
                      <button
                        onClick={() => openEventModal(e)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => setDeleteEventId(e.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Record Modal */}
      <Modal
        isOpen={recordModal}
        onClose={() => { setRecordModal(false); resetRecord(); }}
        title={editingRecord ? 'Edit Record' : 'Add Statutory Record'}
        size="lg"
      >
        <form onSubmit={handleRecordSubmit(onRecordSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select {...regRecord('recordType')} className="input-field">
                {RECORD_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <select {...regRecord('periodMonth')} className="input-field">
                <option value="">-</option>
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year *</label>
              <input type="number" {...regRecord('periodYear', { required: true })}
                     className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Employer Contribution
              </label>
              <input type="number" step="0.01"
                     {...regRecord('employerContribution')}
                     className="input-field" defaultValue={0} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Employee Contribution
              </label>
              <input type="number" step="0.01"
                     {...regRecord('employeeContribution')}
                     className="input-field" defaultValue={0} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Filing Status
            </label>
            <select {...regRecord('filingStatus')} className="input-field">
              <option value="PENDING">Pending</option>
              <option value="FILED">Filed</option>
              <option value="PAID">Paid</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Document URL
            </label>
            <input {...regRecord('documentUrl')} className="input-field"
                   placeholder="Link to challan/receipt" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea {...regRecord('notes')} rows={2}
                      className="input-field resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setRecordModal(false); resetRecord(); }}
                    className="btn-secondary flex-1">Cancel</button>
            <button type="submit"
                    className="btn-primary flex-1 justify-center">
              {editingRecord ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Event Modal */}
      <Modal
        isOpen={eventModal}
        onClose={() => { setEventModal(false); resetEvent(); }}
        title={editingEvent ? 'Edit Event' : 'Add Compliance Event'}
      >
        <form onSubmit={handleEventSubmit(onEventSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input {...regEvent('title', { required: 'Required' })}
                   className={`input-field ${eventErrors.title ? 'input-error' : ''}`} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...regEvent('description')} rows={2}
                      className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select {...regEvent('complianceType')} className="input-field">
                {COMPLIANCE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select {...regEvent('frequency')} className="input-field">
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="HALF_YEARLY">Half Yearly</option>
                <option value="ANNUALLY">Annually</option>
                <option value="ONE_TIME">One Time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Due Date *
              </label>
              <input type="date" {...regEvent('dueDate', { required: true })}
                     className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Reminder (days before)
              </label>
              <input type="number" {...regEvent('reminderDaysBefore')}
                     className="input-field" defaultValue={7} />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button"
                    onClick={() => { setEventModal(false); resetEvent(); }}
                    className="btn-secondary flex-1">Cancel</button>
            <button type="submit"
                    className="btn-primary flex-1 justify-center">
              {editingEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mark Filed Modal */}
      <Modal
        isOpen={!!fileModal}
        onClose={() => { setFileModal(null); setAcknowledgmentNumber(''); }}
        title="Mark as Filed"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Acknowledgment Number *
            </label>
            <input value={acknowledgmentNumber}
                   onChange={(e) => setAcknowledgmentNumber(e.target.value)}
                   className="input-field"
                   placeholder="Enter acknowledgment number" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setFileModal(null); setAcknowledgmentNumber(''); }}
                    className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleMarkFiled}
                    className="btn-primary flex-1 justify-center">
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal
        isOpen={!!payModal}
        onClose={() => { setPayModal(null); setChallanNumber(''); }}
        title="Mark as Paid"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Challan Number *
            </label>
            <input value={challanNumber}
                   onChange={(e) => setChallanNumber(e.target.value)}
                   className="input-field"
                   placeholder="Enter challan number" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setPayModal(null); setChallanNumber(''); }}
                    className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleMarkPaid}
                    className="btn-success flex-1 justify-center">
              Confirm Payment
            </button>
          </div>
        </div>
      </Modal>

      {/* Complete Event Modal */}
      <Modal
        isOpen={!!completeModal}
        onClose={() => { setCompleteModal(null); setCompletionNotes(''); }}
        title="Complete Event"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Completion Notes
            </label>
            <textarea value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      rows={4} className="input-field resize-none"
                      placeholder="Add notes..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setCompleteModal(null); setCompletionNotes(''); }}
                    className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCompleteEvent}
                    className="btn-success flex-1 justify-center">
              <FiCheckCircle /> Complete
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteRecordId}
        onClose={() => setDeleteRecordId(null)}
        onConfirm={handleDeleteRecord}
        title="Delete Record"
        message="This record will be permanently deleted."
      />

      <ConfirmDialog
        isOpen={!!deleteEventId}
        onClose={() => setDeleteEventId(null)}
        onConfirm={handleDeleteEvent}
        title="Delete Event"
        message="This event will be permanently deleted."
      />
    </Layout>
  );
};

export default ComplianceManagement;