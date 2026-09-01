// src/pages/employee/MyLearning.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiBook, FiClock, FiAward, FiTrendingUp,
  FiCheckCircle, FiStar, FiExternalLink, FiPlay
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import trainingService from '../../services/trainingService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const TABS = ['AVAILABLE', 'MY_LEARNINGS', 'COMPLETED'];

const MyLearning = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('AVAILABLE');
  const [programs, setPrograms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    if (user?.employeeId) fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'AVAILABLE') {
        const res = await trainingService.getOpenPrograms(user.employeeId);
        setPrograms(res.data.data || []);
      } else {
        const res = await trainingService.getMyEnrollments(user.employeeId);
        setEnrollments(res.data.data || []);
      }
      const statsRes = await trainingService.getEmployeeStats(user.employeeId);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (programId) => {
    try {
      await trainingService.enroll(programId, user.employeeId);
      toast.success('Enrolled successfully! 🎉');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await trainingService.submitFeedback(feedbackModal.id, {
        rating,
        feedback: feedbackText,
      });
      toast.success('Thanks for your feedback!');
      setFeedbackModal(null);
      setFeedbackText('');
      setRating(5);
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const filteredEnrollments = activeTab === 'COMPLETED'
    ? enrollments.filter(e => e.status === 'COMPLETED')
    : enrollments.filter(e => e.status !== 'COMPLETED' && e.status !== 'DROPPED');

  const statusColors = {
    ENROLLED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    DROPPED: 'bg-gray-100 text-gray-700',
    FAILED: 'bg-red-100 text-red-700',
  };

  return (
    <Layout>
      <PageHeader
        title="Learning & Development"
        subtitle="Grow your skills"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                        text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Enrolled</p>
              <p className="text-3xl font-bold mt-1">
                {stats.totalEnrollments || 0}
              </p>
            </div>
            <FiBook className="h-8 w-8 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600
                        text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">In Progress</p>
              <p className="text-3xl font-bold mt-1">{stats.inProgress || 0}</p>
            </div>
            <FiPlay className="h-8 w-8 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600
                        text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Completed</p>
              <p className="text-3xl font-bold mt-1">{stats.completed || 0}</p>
            </div>
            <FiCheckCircle className="h-8 w-8 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600
                        text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Learning Hours</p>
              <p className="text-3xl font-bold mt-1">
                {stats.totalLearningHours || 0}h
              </p>
            </div>
            <FiClock className="h-8 w-8 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2
              whitespace-nowrap transition-all
              ${activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500'}`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullScreen={false} />
      ) : (
        <>
          {/* Available Programs */}
          {activeTab === 'AVAILABLE' && (
            programs.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={FiBook}
                  title="No Programs Available"
                  description="Check back later for new training programs"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map(p => (
                  <div key={p.id} className="card hover:shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge-info text-xs">
                        {p.category.replace('_', ' ')}
                      </span>
                      {p.isMandatory && (
                        <span className="badge-danger text-xs">Mandatory</span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg">{p.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {p.description}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiClock className="h-3 w-3" />
                        {p.durationHours}h
                      </div>
                      <div className="flex items-center gap-1">
                        <FiUsers className="h-3 w-3" />
                        {p.totalEnrolled}/{p.maxParticipants || '∞'}
                      </div>
                      {p.averageRating > 0 && (
                        <div className="flex items-center gap-1
                                        col-span-2">
                          <FiStar className="h-3 w-3 text-yellow-500" />
                          {p.averageRating} ({p.totalCompleted} completed)
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      {formatDate(p.startDate)} - {formatDate(p.endDate)}
                    </p>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {p.isEnrolled ? (
                        <span className="w-full block text-center py-2
                                         bg-green-50 text-green-700 rounded-lg
                                         text-sm font-medium">
                          ✓ Already Enrolled
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEnroll(p.id)}
                          className="btn-primary w-full justify-center"
                        >
                          <FiPlay /> Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* My Learnings */}
          {(activeTab === 'MY_LEARNINGS' || activeTab === 'COMPLETED') && (
            filteredEnrollments.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={FiBook}
                  title={`No ${activeTab.replace('_', ' ').toLowerCase()} programs`}
                  description={activeTab === 'COMPLETED'
                    ? "You haven't completed any programs yet"
                    : "Enroll in programs to start learning"}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEnrollments.map(e => (
                  <div key={e.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-1
                                         rounded-full ${statusColors[e.status]}`}>
                        {e.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        Enrolled: {formatDate(e.enrolledDate)}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg">{e.programTitle}</h3>
                    <p className="text-xs text-gray-500">{e.programCode}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="badge-info text-xs">
                        {e.programCategory.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-600">
                        <FiClock className="inline h-3 w-3" /> {e.durationHours}h
                      </span>
                    </div>

                    {e.status === 'COMPLETED' && (
                      <div className="mt-3 p-3 bg-green-50 border
                                      border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-green-600">Completed on</p>
                            <p className="text-sm font-medium">
                              {formatDate(e.completionDate)}
                            </p>
                          </div>
                          {e.score && (
                            <div className="text-right">
                              <p className="text-xs text-green-600">Score</p>
                              <p className="text-xl font-bold text-green-700">
                                {e.score}
                                {e.grade && ` (${e.grade})`}
                              </p>
                            </div>
                          )}
                        </div>

                        {e.certificateUrl && (
                          <a href={e.certificateUrl} target="_blank"
                             rel="noreferrer"
                             className="mt-2 btn-success w-full
                                        justify-center text-sm">
                            <FiAward /> Download Certificate
                          </a>
                        )}

                        {!e.rating && (
                          <button
                            onClick={() => setFeedbackModal(e)}
                            className="mt-2 btn-secondary w-full
                                       justify-center text-sm"
                          >
                            <FiStar /> Rate this Course
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Feedback Modal */}
      <Modal
        isOpen={!!feedbackModal}
        onClose={() => setFeedbackModal(null)}
        title="Rate this Program"
      >
        {feedbackModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium">
                {feedbackModal.programTitle}
              </p>
            </div>

            <div>
              <p className="text-sm mb-2">How would you rate this?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`text-4xl transition-transform hover:scale-110
                      ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Your Feedback
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setFeedbackModal(null)}
                      className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleSubmitFeedback}
                      className="btn-primary flex-1 justify-center">
                Submit
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

const FiUsers = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24"
       stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default MyLearning;