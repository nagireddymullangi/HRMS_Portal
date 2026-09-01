// src/pages/admin/EventsManagement.jsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiPlus, FiEdit2, FiTrash2, FiCalendar,
  FiMapPin, FiUsers, FiVideo, FiClock
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import eventService from '../../services/eventService';
import departmentService from '../../services/departmentService';
import { formatDate } from '../../utils/helpers';

const EVENT_TYPES = [
  'MEETING', 'TRAINING', 'WORKSHOP', 'SEMINAR',
  'CELEBRATION', 'HOLIDAY', 'TEAM_BUILDING',
  'CONFERENCE', 'WEBINAR', 'OTHER'
];

const EVENT_COLORS = {
  MEETING: '#3b82f6', TRAINING: '#10b981', WORKSHOP: '#f59e0b',
  SEMINAR: '#8b5cf6', CELEBRATION: '#ec4899', HOLIDAY: '#ef4444',
  TEAM_BUILDING: '#14b8a6', CONFERENCE: '#6366f1',
  WEBINAR: '#06b6d4', OTHER: '#6b7280'
};

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue,getValues, watch,
          formState: { errors } } = useForm();

  const targetAudience = watch('targetAudience', 'ALL');
  const isVirtual = watch('isVirtual', false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [evRes, deptRes] = await Promise.all([
        eventService.getAll(),
        departmentService.getAll(),
      ]);
      setEvents(evRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event = null) => {
    setEditing(event);
    if (event) {
      Object.keys(event).forEach(k => {
        if (k === 'startDateTime' || k === 'endDateTime') {
          setValue(k, event[k]?.substring(0, 16));
        } else {
          setValue(k, event[k]);
        }
      });
    } else {
      reset({
        eventType: 'MEETING',
        targetAudience: 'ALL',
        color: '#3b82f6',
        isVirtual: false,
        rsvpRequired: false,
      });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Auto-set color based on type
      if (!data.color) data.color = EVENT_COLORS[data.eventType];

      if (editing) {
        await eventService.update(editing.id, data);
        toast.success('Event updated');
      } else {
        await eventService.create(data);
        toast.success('Event created');
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

  const handleDelete = async () => {
    try {
      await eventService.delete(deleteId);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const getCurrentDateTime = () =>{
    const now =new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0,16);
  };
  const minDateTime = getCurrentDateTime();

  return (
    <Layout>
      <PageHeader
        title="Events Management"
        subtitle="Create and manage company events"
        action={
          <button onClick={() => openModal()} className="btn-primary">
            <FiPlus /> New Event
          </button>
        }
      />

      {loading ? (
        <Loader fullScreen={false} />
      ) : events.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiCalendar}
            title="No Events"
            description="Create your first event"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(e => (
            <div key={e.id} className="card overflow-hidden">
              <div className="h-2 -m-6 mb-4"
                   style={{ backgroundColor: e.color }} />

              <div className="flex items-start justify-between mb-3">
                <span className="badge-info text-xs">{e.eventType}</span>
                <span className={
                  e.status === 'SCHEDULED' ? 'badge-success' :
                  e.status === 'ONGOING' ? 'badge-warning' :
                  e.status === 'COMPLETED' ? 'badge-info' :
                  'badge-danger'}>
                  {e.status}
                </span>
              </div>

              <h3 className="font-bold text-gray-800 text-lg">{e.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {e.description}
              </p>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiClock className="h-4 w-4" />
                  <span>{new Date(e.startDateTime).toLocaleString()}</span>
                </div>
                {e.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiMapPin className="h-4 w-4" />
                    <span className="truncate">{e.location}</span>
                  </div>
                )}
                {e.isVirtual && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <FiVideo className="h-4 w-4" />
                    <span>Virtual Event</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <FiUsers className="h-4 w-4" />
                  <span>{e.attendingCount || 0} attending</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openModal(e)}
                  className="flex-1 py-2 rounded-lg hover:bg-blue-50
                             text-blue-600 text-sm font-medium
                             flex items-center justify-center gap-1"
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(e.id)}
                  className="flex-1 py-2 rounded-lg hover:bg-red-50
                             text-red-600 text-sm font-medium
                             flex items-center justify-center gap-1"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? 'Edit Event' : 'New Event'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              {...register('title', { required: 'Required',
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message:"Title must contain only letters and spaces"
                }
               })}
              className={`input-field ${errors.title ? 'input-error' : ''}`}
              placeholder="Event title"
            />
            {errors.title && <p className='text-red-500 text-xs mt-1'>{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field resize-none"
              placeholder="Event details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Event Type
              </label>
              <select {...register('eventType')} className="input-field">
                {EVENT_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                {...register('color')}
                className="input-field h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                min={minDateTime}
                {...register('startDateTime', { required: 'Required',
                  validate: (value) => {
                    if (new Date(value) < new Date()){
                      return "Start date cannot be in the past";
                    }
                    return true;
                  }
                 })}
                className={"input-field ${errors.startDateTime ? 'input-error' : ''}"}
              />
              {errors.startDateTime && (
                <p className='text-red-500 text-xs mt-1'>{errors.startDateTime.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                min={minDateTime}
                {...register('endDateTime', { required: 'Required',
                  validate: (value) => {
                    const start = getValues('startDateTime');
                    if (new Date(value) < new Date()){
                      return "End Date  & Time must be after the start date & time";
                    }
                    return true;
                  }
                 })}
                className={"input-field ${errors.endDateTime ? 'input-error':''}"}
              />
              {errors.endDateTime && (
                <p className='text-red-500 text-xs mt-1'>{errors.endDateTime.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('isVirtual')} />
              <span className="text-sm">Virtual Event</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('isAllDay')} />
              <span className="text-sm">All Day</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('rsvpRequired')} />
              <span className="text-sm">RSVP Required</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {isVirtual ? 'Meeting Link' : 'Location'}
            </label>
            <input
              {...register(isVirtual ? 'meetingLink' : 'location')}
              className="input-field"
              placeholder={isVirtual
                ? 'https://meet.google.com/...'
                : 'Conference Room A'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Target Audience
            </label>
            <select {...register('targetAudience')} className="input-field">
              <option value="ALL">All Employees</option>
              <option value="DEPARTMENT">Specific Department</option>
            </select>
          </div>

          {targetAudience === 'DEPARTMENT' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Department
              </label>
              <select {...register('departmentId')} className="input-field">
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button"
                    onClick={() => { setModalOpen(false); reset(); }}
                    className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
                    className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="This event will be permanently deleted."
      />
    </Layout>
  );
};

export default EventsManagement;