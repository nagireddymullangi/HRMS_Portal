// src/pages/employee/MyDailyWork.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiPlay, FiPause, FiCheckCircle, FiAlertCircle,
  FiClock, FiCoffee, FiMessageSquare, FiSend,
  FiTarget, FiTrendingUp, FiCalendar, FiFlag,
  FiXCircle, FiPlus, FiEdit3, FiActivity
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import dailyWorkService from '../../services/dailyWorkService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { formatTime, formatDuration, getElapsedSeconds } from '../../utils/timeHelpers';

const MyDailyWork = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [breakModal, setBreakModal] = useState(false);
  const [progressModal, setProgressModal] = useState(null);
  const [completeModal, setCompleteModal] = useState(null);
  const [blockerModal, setBlockerModal] = useState(null);
  const [commentModal, setCommentModal] = useState(null);
  const [breakType, setBreakType] = useState('SHORT_BREAK');
  const [breakReason, setBreakReason] = useState('');
  const [breakLocation, setBreakLocation] = useState('');
  const [progressValue, setProgressValue] = useState(0);
  const [completionNotes, setCompletionNotes] = useState('');
  const [blockerReason, setBlockerReason] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [currentBreakTimer, setCurrentBreakTimer] = useState(0);
  const [liveTimers, setLiveTimers] = useState({});

  useEffect(() => {
    if (user?.employeeId) {
      fetchDashboard();
      const interval = setInterval(fetchDashboard, 30000); // Auto-refresh
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    // Live timer for current break
    if (dashboard?.currentBreak) {
      const timer = setInterval(() => {
        setCurrentBreakTimer(prev => prev + 1);
      }, 60000); // Update every minute
      return () => clearInterval(timer);
    }
  }, [dashboard?.currentBreak]);

  useEffect(() => {
  const interval = setInterval(() => {
    if (dashboard?.todayTasks) {
      const timers = {};
      dashboard.todayTasks.forEach((task) => {
        if (task.status === 'IN_PROGRESS' && task.startedAt) {
          timers[task.id] = getElapsedSeconds(
            task.resumedAt || task.startedAt,
            null,
            0
          ) + (task.totalActiveSeconds || 0);
        }
      });
      setLiveTimers(timers);
    }
  }, 1000);
  return () => clearInterval(interval);
}, [dashboard?.todayTasks]);

  const fetchDashboard = async () => {
    try {
      const res = await dailyWorkService.getMyDashboard(user.employeeId);
      setDashboard(res.data.data);
      if (res.data.data?.currentBreak) {
        setCurrentBreakTimer(res.data.data.currentBreak.currentDurationMinutes);
      }
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (id) => {
    try {
      await dailyWorkService.start(id);
      toast.success('Task started');
      fetchDashboard();
    } catch {
      toast.error('Failed');
    }
  };

  const handleAcceptTask = async (id) => {
    try {
      await dailyWorkService.accept(id);
      toast.success('Task accepted');
      fetchDashboard();
    } catch {
      toast.error('Failed');
    }
  };

  const handleStartBreak = async () => {
    try {
      await dailyWorkService.startBreak({
        employeeId: user.employeeId,
        breakType,
        reason: breakReason,
        location: breakLocation,
      });
      toast.success('Break started 🎉');
      setBreakModal(false);
      setBreakReason('');
      setBreakLocation('');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleEndBreak = async () => {
    try {
      await dailyWorkService.endBreak(dashboard.currentBreak.id);
      toast.success('Break ended. Back to work! 💪');
      fetchDashboard();
    } catch {
      toast.error('Failed');
    }
  };

  const handleUpdateProgress = async () => {
    try {
      await dailyWorkService.updateProgress(progressModal.id, progressValue);
      toast.success('Progress updated');
      setProgressModal(null);
      fetchDashboard();
    } catch {
      toast.error('Failed');
    }
  };

  const handleComplete = async () => {
    if (!completionNotes.trim()) {
      toast.error('Please add completion notes');
      return;
    }
    try {
      await dailyWorkService.complete(completeModal.id, completionNotes);
      toast.success('Task completed! 🎉');
      setCompleteModal(null);
      setCompletionNotes('');
      fetchDashboard();
    } catch {
      toast.error('Failed');
    }
  };

  const handleBlock = async () => {
    if (!blockerReason.trim()) {
      toast.error('Please provide blocker reason');
      return;
    }
    try {
      await dailyWorkService.block(blockerModal.id, blockerReason);
      toast.warning('Task blocked. Manager will be notified.');
      setBlockerModal(null);
      setBlockerReason('');
      fetchDashboard();
    } catch {
      toast.error('Failed');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await dailyWorkService.addComment(commentModal.id, {
        comment: commentText,
        type: 'UPDATE',
      });
      toast.success('Comment added');
      setCommentText('');
      const res = await dailyWorkService.getComments(commentModal.id);
      setComments(res.data.data);
    } catch {
      toast.error('Failed');
    }
  };

  const openCommentModal = async (task) => {
    setCommentModal(task);
    try {
      const res = await dailyWorkService.getComments(task.id);
      setComments(res.data.data);
    } catch {}
  };

  if (loading) return <Layout><Loader /></Layout>;

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-700 border-gray-300',
    MEDIUM: 'bg-blue-100 text-blue-700 border-blue-300',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
    URGENT: 'bg-red-100 text-red-700 border-red-300',
    CRITICAL: 'bg-red-200 text-red-900 border-red-500',
  };

  const statusColors = {
    ASSIGNED: 'bg-gray-100 text-gray-700',
    ACCEPTED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    ON_HOLD: 'bg-orange-100 text-orange-700',
    BLOCKED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
    OVERDUE: 'bg-red-100 text-red-700',
  };

  const categoryIcons = {
    DEVELOPMENT: '💻',
    TESTING: '🧪',
    MEETING: '👥',
    DOCUMENTATION: '📝',
    CLIENT_WORK: '🤝',
    TRAINING: '📚',
    SUPPORT: '🛠️',
    ADMIN: '📋',
    OTHER: '📌',
  };

  return (
    <Layout>
      <PageHeader
        title={`Good ${getTimeGreeting()}, ${user?.name?.split(' ')[0]}! 👋`}
        subtitle="Here's your work for today"
        action={
          !dashboard?.currentBreak ? (
            <button onClick={() => setBreakModal(true)}
                    className="btn-secondary">
              <FiCoffee /> Take a Break
            </button>
          ) : null
        }
      />

      {/* Active Break Banner */}
      {dashboard?.currentBreak && (
        <div className="card bg-gradient-to-r from-orange-500 to-red-500
                        text-white mb-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex
                              items-center justify-center backdrop-blur-sm">
                <FiCoffee className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  You're on {dashboard.currentBreak.breakType.replace('_', ' ')}
                </h3>
                <p className="text-sm opacity-90 mt-1">
                  Started at {new Date(dashboard.currentBreak.startTime)
                    .toLocaleTimeString()}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  Max allowed: {dashboard.currentBreak.maxAllowedMinutes} min
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">
                {currentBreakTimer}
                <span className="text-lg font-normal">min</span>
              </p>
              {currentBreakTimer > dashboard.currentBreak.maxAllowedMinutes && (
                <p className="text-xs mt-1 bg-red-800 px-2 py-1 rounded-full">
                  ⚠️ Exceeded by {currentBreakTimer -
                    dashboard.currentBreak.maxAllowedMinutes} min
                </p>
              )}
              <button onClick={handleEndBreak}
                      className="mt-3 bg-white text-orange-600 px-4 py-2
                                 rounded-lg font-semibold hover:bg-gray-100">
                End Break
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600
                        text-white text-center">
          <p className="text-xs opacity-90">Total</p>
          <p className="text-3xl font-bold mt-1">{dashboard?.totalTasks || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600
                        text-white text-center">
          <p className="text-xs opacity-90">Completed</p>
          <p className="text-3xl font-bold mt-1">{dashboard?.completed || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600
                        text-white text-center">
          <p className="text-xs opacity-90">In Progress</p>
          <p className="text-3xl font-bold mt-1">{dashboard?.inProgress || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600
                        text-white text-center">
          <p className="text-xs opacity-90">Pending</p>
          <p className="text-3xl font-bold mt-1">{dashboard?.pending || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600
                        text-white text-center">
          <p className="text-xs opacity-90">Blocked</p>
          <p className="text-3xl font-bold mt-1">{dashboard?.blocked || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600
                        text-white text-center">
          <p className="text-xs opacity-90">Productivity</p>
          <p className="text-3xl font-bold mt-1">
            {dashboard?.productivityScore || 0}
          </p>
        </div>
      </div>

      {/* Time Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <FiClock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">
            {Math.floor((dashboard?.totalWorkMinutes || 0) / 60)}h {
              (dashboard?.totalWorkMinutes || 0) % 60}m
          </p>
          <p className="text-xs text-gray-500 mt-1">Work Time</p>
        </div>
        <div className="card text-center">
          <FiCoffee className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-600">
            {dashboard?.totalBreakMinutes || 0} min
          </p>
          <p className="text-xs text-gray-500 mt-1">Break Time</p>
        </div>
        <div className="card text-center">
          <FiTrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">
            {dashboard?.totalTasks > 0
              ? Math.round((dashboard.completed * 100) / dashboard.totalTasks)
              : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Completion Rate</p>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3
                       flex items-center gap-2">
          <FiCalendar /> Today's Tasks
        </h2>

        {dashboard?.todayTasks?.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={FiTarget}
              title="No tasks for today"
              description="Enjoy your day or check with your manager"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {dashboard?.todayTasks?.map(task => (
              <div key={task.id}
                   className={`card border-l-4 ${
                     priorityColors[task.priority]?.split(' ')[2] ||
                     'border-gray-300'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-3xl">
                      {categoryIcons[task.category]}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-gray-400 font-mono">
                          {task.assignmentNumber}
                        </p>
                        <span className={`text-xs font-medium px-2 py-0.5
                                           rounded-full ${
                                             priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5
                                           rounded-full ${
                                             statusColors[task.status]}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {task.isOverdue && (
                          <span className="text-xs font-medium px-2 py-0.5
                                           rounded-full bg-red-100
                                           text-red-700">
                            ⚠️ Overdue
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1
                                      line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      {task.progressPercentage > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-semibold text-primary-600">
                              {task.progressPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-primary-500
                                            to-primary-700 h-2 rounded-full
                                            transition-all"
                                 style={{ width: `${task.progressPercentage}%` }} />
                          </div>
                        </div>
                      )}

                      {/* ═══ TIME TRACKING SECTION ═══ */}
{(task.startedAt || task.acceptedAt || task.completedAt) && (
  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">

    {/* Accepted Time */}
    {task.acceptedAt && (
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-center">
        <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">
          Accepted
        </p>
        <p className="text-xs font-bold text-blue-800 mt-0.5">
          {formatTime(task.acceptedAt)}
        </p>
      </div>
    )}

    {/* Start Time */}
    {task.startedAt && (
      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-2.5 text-center">
        <p className="text-[10px] font-semibold text-yellow-600 uppercase tracking-wide flex items-center justify-center gap-1">
          <FiPlay className="h-3 w-3" /> Start
        </p>
        <p className="text-xs font-bold text-yellow-800 mt-0.5">
          {formatTime(task.startedAt)}
        </p>
      </div>
    )}

    {/* Live Timer (while IN_PROGRESS) */}
    {task.status === 'IN_PROGRESS' && task.startedAt && (
      <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 text-center animate-pulse">
        <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide flex items-center justify-center gap-1">
          <FiClock className="h-3 w-3" /> Live
        </p>
        <p className="text-sm font-bold text-green-700 mt-0.5 font-mono">
          {formatDuration(liveTimers[task.id] || task.currentElapsedSeconds || 0)}
        </p>
      </div>
    )}

    {/* End Time + Total Duration (when COMPLETED) */}
    {task.status === 'COMPLETED' && task.completedAt && (
      <>
        <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 text-center">
          <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide flex items-center justify-center gap-1">
            <FiCheckCircle className="h-3 w-3" /> End
          </p>
          <p className="text-xs font-bold text-green-800 mt-0.5">
            {formatTime(task.completedAt)}
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
            ⏱ Total Time
          </p>
          <p className="text-sm font-bold text-indigo-800 mt-0.5 font-mono">
            {formatDuration(task.currentElapsedSeconds || task.totalActiveSeconds || 0)}
          </p>
          {task.actualHours > 0 && (
            <p className="text-[10px] text-indigo-500 mt-0.5">
              ({task.actualHours}h)
            </p>
          )}
        </div>
      </>
    )}

    {/* Paused Time */}
    {(task.status === 'ON_HOLD' || task.status === 'BLOCKED') && task.pausedAt && (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 text-center">
        <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide flex items-center justify-center gap-1">
          <FiPause className="h-3 w-3" /> Paused
        </p>
        <p className="text-xs font-bold text-orange-800 mt-0.5">
          {formatTime(task.pausedAt)}
        </p>
      </div>
    )}
  </div>
)}


                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mt-3
                                      text-xs text-gray-500 flex-wrap">
                        {task.estimatedHours && (
                          <span className="flex items-center gap-1">
                            <FiClock /> Est: {task.estimatedHours}h
                          </span>
                        )}
                        {task.actualHours > 0 && (
                          <span className="flex items-center gap-1">
                            <FiActivity /> Actual: {task.actualHours}h
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <FiCalendar /> Due: {formatDate(task.dueDate)}
                            {task.dueTime && ` ${task.dueTime}`}
                          </span>
                        )}
                        {task.totalComments > 0 && (
                          <span className="flex items-center gap-1">
                            <FiMessageSquare /> {task.totalComments}
                          </span>
                        )}
                      </div>

                      {/* Blocker */}
                      {task.blockerReason && (
                        <div className="mt-3 p-2 bg-red-50 border
                                        border-red-200 rounded-lg">
                          <p className="text-xs font-semibold text-red-700">
                            🚨 Blocker: {task.blockerReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100
                                flex-wrap">
                  {task.status === 'ASSIGNED' && (
                    <>
                      <button onClick={() => handleAcceptTask(task.id)}
                              className="btn-primary text-xs">
                        <FiCheckCircle /> Accept
                      </button>
                      <button onClick={() => handleStartTask(task.id)}
                              className="btn-success text-xs">
                        <FiPlay /> Start Now
                      </button>
                    </>
                  )}
                  {task.status === 'ACCEPTED' && (
                    <button onClick={() => handleStartTask(task.id)}
                            className="btn-success text-xs">
                      <FiPlay /> Start Task
                    </button>
                  )}
                  {task.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => {
                          setProgressModal(task);
                          setProgressValue(task.progressPercentage || 0);
                        }}
                        className="btn-primary text-xs"
                      >
                        <FiTrendingUp /> Update Progress
                      </button>
                      <button
                        onClick={() => setCompleteModal(task)}
                        className="btn-success text-xs"
                      >
                        <FiCheckCircle /> Complete
                      </button>
                      <button
                        onClick={() => setBlockerModal(task)}
                        className="btn-danger text-xs"
                      >
                        <FiAlertCircle /> Report Blocker
                      </button>
                    </>
                  )}
                  {task.status === 'BLOCKED' && (
                    <button
                      onClick={async () => {
                        await dailyWorkService.resume(task.id);
                        toast.success('Task resumed');
                        fetchDashboard();
                      }}
                      className="btn-primary text-xs"
                    >
                      <FiPlay /> Resume
                    </button>
                  )}
                  <button
                    onClick={() => openCommentModal(task)}
                    className="btn-secondary text-xs"
                  >
                    <FiMessageSquare /> Comments
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Tasks */}
      {dashboard?.upcomingTasks?.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3
                         flex items-center gap-2">
            <FiCalendar /> Upcoming Tasks
          </h2>
          <div className="space-y-2">
            {dashboard.upcomingTasks.map(task => (
              <div key={task.id} className="card opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {categoryIcons[task.category]}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Due: {formatDate(task.assignmentDate)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1
                                     rounded-full ${
                                       priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Break Modal */}
      <Modal isOpen={breakModal} onClose={() => setBreakModal(false)}
             title="Start Break">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Break Type
            </label>
            <select value={breakType} onChange={(e) => setBreakType(e.target.value)}
                    className="input-field">
              <option value="SHORT_BREAK">☕ Short Break (10 min)</option>
              <option value="TEA_BREAK">🍵 Tea Break (15 min)</option>
              <option value="LUNCH">🍽️ Lunch (60 min)</option>
              <option value="MEETING">👥 Meeting (60 min)</option>
              <option value="PERSONAL">🚻 Personal (15 min)</option>
              <option value="BATHROOM">🚽 Bathroom (5 min)</option>
              <option value="OTHER">📌 Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reason (Optional)
            </label>
            <input value={breakReason}
                   onChange={(e) => setBreakReason(e.target.value)}
                   className="input-field"
                   placeholder="Quick coffee break" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Location (Optional)
            </label>
            <input value={breakLocation}
                   onChange={(e) => setBreakLocation(e.target.value)}
                   className="input-field"
                   placeholder="Cafeteria, Home, etc." />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setBreakModal(false)}
                    className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleStartBreak}
                    className="btn-primary flex-1 justify-center">
              <FiCoffee /> Start Break
            </button>
          </div>
        </div>
      </Modal>

      {/* Progress Update Modal */}
      <Modal isOpen={!!progressModal}
             onClose={() => setProgressModal(null)}
             title="Update Progress">
        {progressModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium">{progressModal.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Progress: <span className="text-2xl font-bold text-primary-600">
                  {progressValue}%
                </span>
              </label>
              <input type="range" min="0" max="100" step="5"
                     value={progressValue}
                     onChange={(e) => setProgressValue(parseInt(e.target.value))}
                     className="w-full" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-gradient-to-r from-primary-500 to-primary-700
                              h-4 rounded-full transition-all"
                   style={{ width: `${progressValue}%` }} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setProgressModal(null)}
                      className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleUpdateProgress}
                      className="btn-primary flex-1 justify-center">
                Update
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Complete Modal */}
      <Modal isOpen={!!completeModal}
             onClose={() => { setCompleteModal(null); setCompletionNotes(''); }}
             title="Complete Task">
        {completeModal && (
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium">{completeModal.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Completion Notes *
              </label>
              <textarea value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        rows={4} className="input-field resize-none"
                        placeholder="What was accomplished? Any learnings?" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCompleteModal(null)}
                      className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleComplete}
                      className="btn-success flex-1 justify-center">
                <FiCheckCircle /> Mark Complete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Blocker Modal */}
      <Modal isOpen={!!blockerModal}
             onClose={() => { setBlockerModal(null); setBlockerReason(''); }}
             title="Report Blocker">
        {blockerModal && (
          <div className="space-y-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm">Task: <strong>{blockerModal.title}</strong></p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                What's blocking you? *
              </label>
              <textarea value={blockerReason}
                        onChange={(e) => setBlockerReason(e.target.value)}
                        rows={4} className="input-field resize-none"
                        placeholder="Waiting for approval, need clarification..." />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setBlockerModal(null)}
                      className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleBlock}
                      className="btn-danger flex-1 justify-center">
                <FiAlertCircle /> Report Blocker
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Comments Modal */}
      <Modal isOpen={!!commentModal}
             onClose={() => { setCommentModal(null); setCommentText(''); }}
             title="Task Comments" size="lg">
        {commentModal && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium">{commentModal.title}</p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : comments.map(c => (
                <div key={c.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-semibold">User #{c.userId}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm">{c.comment}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                     placeholder="Add an update..."
                     className="input-field flex-1" />
              <button onClick={handleAddComment} className="btn-primary">
                <FiSend />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

export default MyDailyWork;