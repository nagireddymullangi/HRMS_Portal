// src/utils/timeHelpers.js
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export const formatTime = (dateTime) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const formatDurationShort = (seconds) => {
  if (!seconds || seconds < 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const getTimeAgo = (dateTime) => {
  if (!dateTime) return '';
  const seconds = Math.floor((new Date() - new Date(dateTime)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const calculateTaskDuration = (startedAt, completedAt, pauseSeconds = 0) => {
  if (!startedAt) return 0;
  const end = completedAt ? new Date(completedAt) : new Date();
  const totalSeconds = Math.floor((end - new Date(startedAt)) / 1000);
  return Math.max(0, totalSeconds - pauseSeconds);
};

export const getElapsedSeconds = (startedAt, completedAt,pauseSeconds = 0) => {
  if (!startedAt) return 0;
  const end = completedAt ? new Date(completedAt) : new Date();
  const total = Math.floor((end - new Date(startedAt)) / 1000);
  return Math.max(0, total - (pauseSeconds || 0));
};