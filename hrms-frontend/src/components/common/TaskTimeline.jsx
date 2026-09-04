// src/components/common/TaskTimeline.jsx
import {
  FiCheck, FiPlay, FiPause, FiCheckCircle,
  FiClock, FiUserCheck, FiRotateCw
} from 'react-icons/fi';
import { formatDateTime, formatDuration } from '../../utils/timeHelpers';

const TaskTimeline = ({ task, currentElapsed }) => {
  const events = [
    {
      label: 'Task Assigned',
      time: task.createdAt,
      icon: FiUserCheck,
      color: 'bg-gray-500',
      completed: true,
    },
    {
      label: 'Accepted',
      time: task.acceptedAt,
      icon: FiCheck,
      color: 'bg-blue-500',
      completed: !!task.acceptedAt,
    },
    {
      label: 'Started',
      time: task.startedAt,
      icon: FiPlay,
      color: 'bg-yellow-500',
      completed: !!task.startedAt,
    },
    ...(task.pausedAt ? [{
      label: 'Paused/Blocked',
      time: task.pausedAt,
      icon: FiPause,
      color: 'bg-orange-500',
      completed: true,
    }] : []),
    ...(task.resumedAt ? [{
      label: 'Resumed',
      time: task.resumedAt,
      icon: FiRotateCw,
      color: 'bg-purple-500',
      completed: true,
    }] : []),
    {
      label: 'Completed',
      time: task.completedAt,
      icon: FiCheckCircle,
      color: 'bg-green-500',
      completed: !!task.completedAt,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-700">📋 Task Timeline</h4>
        {task.startedAt && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1
                          rounded-full">
            <FiClock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-600">
              {task.status === 'COMPLETED'
                ? formatDuration(task.currentElapsedSeconds || 0)
                : currentElapsed
                  ? formatDuration(currentElapsed)
                  : task.formattedDuration || '00:00:00'}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        {events.map((event, idx) => {
          const Icon = event.icon;
          const isLast = idx === events.length - 1;
          return (
            <div key={idx} className="flex items-start gap-3 pb-3">
              {/* Icon */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center
                                  justify-center ${event.completed
                                    ? event.color : 'bg-gray-200'} 
                                  ${event.completed ? 'text-white' : 'text-gray-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-6 ${event.completed
                    ? 'bg-gray-300' : 'bg-gray-200'}`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <p className={`text-sm font-medium ${event.completed
                  ? 'text-gray-800' : 'text-gray-400'}`}>
                  {event.label}
                </p>
                {event.time ? (
                  <p className="text-xs text-gray-500">
                    {formatDateTime(event.time)}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">Not yet</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Summary */}
      {task.status === 'COMPLETED' && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200
                        rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-green-600">Total Time</p>
              <p className="font-bold text-green-800">
                {formatDuration(task.currentElapsedSeconds || 0)}
              </p>
            </div>
            {task.totalPauseSeconds > 0 && (
              <div>
                <p className="text-xs text-orange-600">Pause Time</p>
                <p className="font-bold text-orange-800">
                  {formatDuration(task.totalPauseSeconds)}
                </p>
              </div>
            )}
            {task.pauseCount > 0 && (
              <div>
                <p className="text-xs text-gray-600">Pauses</p>
                <p className="font-bold text-gray-800">
                  {task.pauseCount} times
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-blue-600">Actual Hours</p>
              <p className="font-bold text-blue-800">
                {task.actualHours || 0}h
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTimeline;