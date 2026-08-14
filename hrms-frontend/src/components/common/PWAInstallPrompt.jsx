// src/components/common/PWAInstallPrompt.jsx
import { useEffect, useState } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after 3 seconds
      const dismissed = localStorage.getItem('pwa-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  if (isInstalled || !showPrompt || !deferredPrompt) return null;

  return (
    <div className="pwa-install-prompt">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary-100 rounded-xl flex-shrink-0">
          <FiDownload className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm">
            Install HRMS App
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Install our app for a better experience with offline access
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="btn-primary text-xs px-3 py-1.5"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;