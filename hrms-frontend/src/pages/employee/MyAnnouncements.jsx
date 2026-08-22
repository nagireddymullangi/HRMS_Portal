// src/pages/employee/MyAnnouncements.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
   FiClock,
  FiUser, FiCalendar
} from 'react-icons/fi';
import { BsPinAngle } from 'react-icons/bs';
import { HiMegaphone } from 'react-icons/hi2';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import announcementService from '../../services/announcementService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const PRIORITY_STYLES = {
  LOW: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '📄' },
  MEDIUM: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📢' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '⚠️' },
  URGENT: { bg: 'bg-red-100', text: 'text-red-700', icon: '🚨' },
};

const MyAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (user?.employeeId) fetchAnnouncements();
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getForEmployee(user.employeeId);
      setAnnouncements(res.data.data || []);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (announcement) => {
    setSelected(announcement);
    if (!announcement.isRead) {
      try {
        await announcementService.markAsRead(announcement.id, user.employeeId);
        setAnnouncements(prev => prev.map(a =>
          a.id === announcement.id ? { ...a, isRead: true } : a));
      } catch {
        console.error('Failed to mark as read');
      }
    }
  };

  const filtered = filter === 'ALL' ? announcements
    : filter === 'UNREAD' ? announcements.filter(a => !a.isRead)
    : announcements.filter(a => a.priority === filter);

  const stats = {
    all: announcements.length,
    unread: announcements.filter(a => !a.isRead).length,
    urgent: announcements.filter(a => a.priority === 'URGENT').length,
    pinned: announcements.filter(a => a.isPinned).length,
  };

  return (
    <Layout>
      <PageHeader
        title="Announcements"
        subtitle="Company announcements and updates"
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'ALL', label: `All (${stats.all})` },
          { key: 'UNREAD', label: `Unread (${stats.unread})` },
          { key: 'URGENT', label: `Urgent (${stats.urgent})` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${filter === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={HiMegaphone}
            title="No Announcements"
            description="No announcements to show"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => {
            const style = PRIORITY_STYLES[a.priority];
            return (
              <div
                key={a.id}
                onClick={() => handleView(a)}
                className={`card cursor-pointer hover:shadow-lg
                            transition-all relative
                            ${a.isPinned
                              ? 'border-l-4 border-yellow-500' : ''}
                            ${!a.isRead
                              ? 'bg-blue-50/30 border border-blue-200' : ''}`}
              >
                {!a.isRead && (
                  <span className="absolute top-3 right-3 w-2 h-2
                                   bg-blue-600 rounded-full animate-pulse" />
                )}

                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center
                                    justify-center text-2xl ${style.bg}`}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {a.isPinned && (
                        <BsPinAngle className="h-3 w-3 text-yellow-600" />
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5
                                        rounded-full ${style.bg}
                                        ${style.text}`}>
                        {a.priority}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2"
                       dangerouslySetInnerHTML={{
                         __html: a.content.replace(/<[^>]*>/g, '') }} />
                    <div className="flex items-center gap-3 mt-3 text-xs
                                    text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiUser className="h-3 w-3" />
                        {a.createdByName}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="h-3 w-3" />
                        {formatDate(a.publishDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title=""
        size="lg"
      >
        {selected && (
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full
                                ${PRIORITY_STYLES[selected.priority].bg}
                                ${PRIORITY_STYLES[selected.priority].text}`}>
                {PRIORITY_STYLES[selected.priority].icon} {selected.priority}
              </span>
              <span className="badge-info text-xs">{selected.category}</span>
              {selected.isPinned && (
                <span className="text-xs bg-yellow-100 text-yellow-700
                                 px-2 py-1 rounded-full flex items-center gap-1">
                  <BsPinAngle className="h-3 w-3" /> Pinned
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              {selected.title}
            </h2>

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 pb-4 border-b border-gray-100">
              <span className="flex items-center gap-1">
                <FiUser className="h-4 w-4" />
                {selected.createdByName}
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="h-4 w-4" />
                {formatDate(selected.publishDate)}
              </span>
            </div>

            <div className="mt-4 prose max-w-none"
                 dangerouslySetInnerHTML={{ __html: selected.content }} />

            {selected.attachmentUrl && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <a href={selected.attachmentUrl}
                   target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 hover:underline text-sm
                              flex items-center gap-2">
                  📎 Download Attachment
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default MyAnnouncements;