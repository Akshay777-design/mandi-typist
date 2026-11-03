import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Download, Copy, Check, X, QrCode } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'qr' | 'android' | 'ios'>('android');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (isOpen && canvasRef.current && currentUrl) {
      QRCode.toCanvas(canvasRef.current, currentUrl, {
        width: 180,
        margin: 2,
        color: {
          dark: '#14532d', // deep forest emerald
          light: '#ffffff',
        },
      }).catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, currentUrl, activeTab]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Download to Your Phone
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Install Mandi Typist on Android or iPhone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct Install prompt button if browser supported */}
        {isInstallable && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 mb-2">
              Your browser supports 1-tap installation:
            </div>
            <button
              onClick={handleDirectInstall}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>Install to This Device Now</span>
            </button>
          </div>
        )}

        {/* Device selector tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mt-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-2 rounded-lg transition-colors min-h-[40px] ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`py-2 rounded-lg transition-colors min-h-[40px] ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            iPhone (iOS)
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 rounded-lg transition-colors min-h-[40px] flex items-center justify-center gap-1 ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'android' && (
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">1</span>
                <span>Open this page in <strong>Google Chrome</strong> on your Android phone.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">2</span>
                <span>Tap the top <strong>&ldquo;Install App&rdquo;</strong> button (or tap the <strong>⋮ (three dots)</strong> menu in Chrome).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">3</span>
                <span>Select <strong>&ldquo;Add to Home screen&rdquo;</strong> or <strong>&ldquo;Install application&rdquo;</strong>.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                ⚡ Once installed, Mandi Typist launches full-screen and works <strong>100% offline</strong> with zero internet connection needed.
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200">
                <strong>Xiaomi / Redmi / MIUI Note:</strong> If tapping &ldquo;Add&rdquo; doesn&rsquo;t show the icon on your home screen, Xiaomi blocks Chrome shortcuts by default. Go to phone <strong>Settings &gt; Apps &gt; Manage apps &gt; Chrome &gt; Other permissions</strong> and enable <strong>&ldquo;Home screen shortcuts&rdquo;</strong>.
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">1</span>
                <span>Open this link in <strong>Safari</strong> on your iPhone or iPad.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">2</span>
                <span>Tap the <strong>Share</strong> button (the square with an arrow pointing up at the bottom).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">3</span>
                <span>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">4</span>
                <span>Tap <strong>&ldquo;Add&rdquo;</strong> in the top right corner.</span>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block">
                <canvas ref={canvasRef} className="rounded-lg" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5">
                Point your phone camera at this QR code to open the app directly.
              </p>
            </div>
          )}
        </div>

        {/* Copy App Link Box */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            APP LINK TO OPEN ON PHONE:
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono truncate focus:outline-hidden"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 min-h-[38px]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
