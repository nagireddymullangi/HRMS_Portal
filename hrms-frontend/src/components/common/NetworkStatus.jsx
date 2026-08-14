// src/components/common/NetworkStatus.jsx
import { useEffect, useState } from 'react';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100]
                     px-4 py-2 rounded-full text-white text-sm font-medium
                     shadow-lg flex items-center gap-2 animate-slide-up
                     ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}>
      {isOnline ? (
        <>
          <FiWifi className="h-4 w-4" />
          Back Online
        </>
      ) : (
        <>
          <FiWifiOff className="h-4 w-4" />
          You are Offline
        </>
      )}
    </div>
  );
};

export default NetworkStatus;