// src/pages/employee/MyOnboarding.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiCheckCircle, FiCircle, FiClock,
  FiTrendingUp, FiAward
} from 'react-icons/fi';
import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import onboardingService from '../../services/onboardingService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const CATEGORY_ICONS = {
  DOCUMENT: '📄',
  ORIENTATION: '👥',
  IT_SETUP: '💻',
  TRAINING: '📚',
  PAPERWORK: '✍️',
  COMPLIANCE: '⚖️',
  OTHER: '📌',
};

const MyOnboarding = () => {
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.employeeId) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await onboardingService.getByEmployee(user.employeeId);
      setOnboarding(res.data.data);
      if (res.data.data?.id) {
        const tasksRes = await onboardingService.getTasks(res.data.data.id);
        setTasks(tasksRes.data.data || []);
      }
    } catch {
      // No onboarding
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await onboardingService.completeTask(taskId);
      toast.success('Task completed! 🎉');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <Layout><Loader /></Layout>;

  if (!onboarding) {
    return (
      <Layout>
        <PageHeader title="My Onboarding" />
        <div className="card">
          <EmptyState
            icon={FiTrendingUp}
            title="No Onboarding Active"
            description="You don't have an active onboarding process"
          />
        </div>
      </Layout>
    );
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  };

  return (
    <Layout>
      <PageHeader
        title="My Onboarding Journey"
        subtitle="Complete your onboarding tasks"
      />

      {/* Welcome Card */}
      <div className="card bg-gradient-to-r from-indigo-600 via-purple-600
                      to-pink-600 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex
                          items-center justify-center backdrop-blur-sm">
            {onboarding.completionPercentage === 100 ? (
              <FiAward className="h-8 w-8" />
            ) : (
              <FiTrendingUp className="h-8 w-8" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {onboarding.completionPercentage === 100
                ? 'Congratulations! 🎉'
                : `Welcome aboard, ${user.name}! 👋`}
            </h2>
            <p className="opacity-90 mt-1">
              {onboarding.completionPercentage === 100
                ? "You've completed all onboarding tasks!"
                : `You've completed ${stats.completed} of ${stats.total} tasks`}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Your Progress</span>
            <span className="font-bold">
              {onboarding.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4">
            <div
              className="bg-white h-4 rounded-full transition-all
                         relative overflow-hidden"
              style={{ width: `${onboarding.completionPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r
                              from-transparent via-white/40 to-transparent
                              animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Task List Grouped by Category */}
      {Object.entries(
        tasks.reduce((acc, task) => {
          if (!acc[task.category]) acc[task.category] = [];
          acc[task.category].push(task);
          return acc;
        }, {})
      ).map(([category, categoryTasks]) => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3
                         flex items-center gap-2">
            <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
            {category.replace('_', ' ')}
            <span className="text-sm font-normal text-gray-500">
              ({categoryTasks.filter(t => t.status === 'COMPLETED').length}/
              {categoryTasks.length})
            </span>
          </h3>
          <div className="space-y-2">
            {categoryTasks.map(task => (
              <div
                key={task.id}
                className={`card cursor-pointer transition-all hover:shadow-md
                  ${task.status === 'COMPLETED'
                    ? 'bg-green-50/50 border-l-4 border-green-500'
                    : 'hover:bg-gray-50'}`}
                onClick={() => task.status !== 'COMPLETED' &&
                             handleCompleteTask(task.id)}
              >
                <div className="flex items-start gap-3">
                  {task.status === 'COMPLETED' ? (
                    <FiCheckCircle className="h-6 w-6 text-green-600
                                              flex-shrink-0 mt-0.5" />
                  ) : (
                    <FiCircle className="h-6 w-6 text-gray-400
                                         flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      task.status === 'COMPLETED'
                        ? 'text-gray-500 line-through'
                        : 'text-gray-800'}`}>
                      {task.taskName}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                    )}
                    {task.dueDate && task.status !== 'COMPLETED' && (
                      <p className="text-xs text-orange-600 mt-2
                                    flex items-center gap-1">
                        <FiClock /> Due: {formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                  {task.isRequired && task.status !== 'COMPLETED' && (
                    <span className="badge-danger text-xs">Required</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Layout>
  );
};

export default MyOnboarding;