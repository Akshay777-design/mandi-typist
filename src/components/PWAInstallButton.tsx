import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallModal } from './InstallModal';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already running inside an installed standalone PWA window, hide button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
        title="Download Mandi Typist to your phone or desktop"
      >
        {isIOS ? (
          <Smartphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        ) : (
          <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        )}
        <span>Install App</span>
      </button>

      <InstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
