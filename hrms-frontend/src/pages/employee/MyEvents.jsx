// src/pages/employee/MyEvents.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiCalendar, FiMapPin, FiVideo,
  FiClock, FiUsers, FiCheck, FiX, FiHelpCircle
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import eventService from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('UPCOMING');

  useEffect(() => {
    if (user?.employeeId) fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const res = await eventService.getForEmployee(user.employeeId);
      setEvents(res.data.data || []);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (eventId, status) => {
    try {
      await eventService.updateRsvp(eventId, {
        employeeId: user.employeeId,
        status,
      });
      toast.success(`RSVP updated to ${status}`);
      fetchEvents();
      if (selected) {
        const updated = await eventService.getById(eventId, user.employeeId);
        setSelected(updated.data.data);
      }
    } catch {
      toast.error('Failed to update RSVP');
    }
  };

  const now = new Date();
  const filtered = filter === 'UPCOMING'
    ? events.filter(e => new Date(e.startDateTime) > now)
    : filter === 'PAST'
    ? events.filter(e => new Date(e.startDateTime) < now)
    : events;

  const formatEventTime = (start, end) => {
    const startD = new Date(start);
    const endD = new Date(end);
    if (startD.toDateString() === endD.toDateString()) {
      return `${startD.toLocaleDateString()} • ${
        startD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } - ${endD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${startD.toLocaleString()} - ${endD.toLocaleString()}`;
  };

  return (
    <Layout>
      <PageHeader
        title="Company Events"
        subtitle="View and RSVP to company events"
      />

      <div className="flex gap-2 mb-6">
        {['UPCOMING', 'PAST', 'ALL'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium
              ${filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FiCalendar}
            title="No Events"
            description={`No ${filter.toLowerCase()} events`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(e => (
            <div key={e.id}
                 onClick={() => setSelected(e)}
                 className="card cursor-pointer hover:shadow-lg
                            transition-shadow overflow-hidden">
              <div className="h-2 -m-6 mb-4"
                   style={{ backgroundColor: e.color }} />

              <div className="flex items-start justify-between mb-2">
                <span className="badge-info text-xs">{e.eventType}</span>
                {e.myRsvpStatus === 'ATTENDING' && (
                  <span className="badge-success text-xs">✓ Attending</span>
                )}
              </div>

              <h3 className="font-bold text-gray-800 text-lg">{e.title}</h3>

              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FiClock className="h-4 w-4" />
                  <span>{formatEventTime(e.startDateTime, e.endDateTime)}</span>
                </div>
                {e.location && (
                  <div className="flex items-center gap-2">
                    <FiMapPin className="h-4 w-4" />
                    <span>{e.location}</span>
                  </div>
                )}
                {e.isVirtual && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <FiVideo className="h-4 w-4" />
                    <span>Virtual Event</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FiUsers className="h-4 w-4" />
                  <span>{e.attendingCount || 0} attending</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title=""
        size="lg"
      >
        {selected && (
          <div>
            <span className="badge-info text-xs">{selected.eventType}</span>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              {selected.title}
            </h2>
            <p className="text-gray-600 mt-2">{selected.description}</p>

            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3">
                <FiCalendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {formatEventTime(selected.startDateTime,
                      selected.endDateTime)}
                  </p>
                </div>
              </div>
              {selected.location && (
                <div className="flex items-center gap-3">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                  <span>{selected.location}</span>
                </div>
              )}
              {selected.isVirtual && selected.meetingLink && (
                <div className="flex items-center gap-3">
                  <FiVideo className="h-5 w-5 text-blue-600" />
                  <a href={selected.meetingLink}
                     target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">
                    Join Meeting
                  </a>
                </div>
              )}
            </div>

            {/* RSVP Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Your Response
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRsvp(selected.id, 'ATTENDING')}
                  className={`p-3 rounded-lg border-2 transition-all
                    flex flex-col items-center gap-1
                    ${selected.myRsvpStatus === 'ATTENDING'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'}`}
                >
                  <FiCheck className="h-5 w-5" />
                  <span className="text-xs font-medium">Attending</span>
                </button>
                <button
                  onClick={() => handleRsvp(selected.id, 'MAYBE')}
                  className={`p-3 rounded-lg border-2 transition-all
                    flex flex-col items-center gap-1
                    ${selected.myRsvpStatus === 'MAYBE'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-yellow-300'}`}
                >
                  <FiHelpCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">Maybe</span>
                </button>
                <button
                  onClick={() => handleRsvp(selected.id, 'NOT_ATTENDING')}
                  className={`p-3 rounded-lg border-2 transition-all
                    flex flex-col items-center gap-1
                    ${selected.myRsvpStatus === 'NOT_ATTENDING'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300'}`}
                >
                  <FiX className="h-5 w-5" />
                  <span className="text-xs font-medium">Not Going</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default MyEvents;