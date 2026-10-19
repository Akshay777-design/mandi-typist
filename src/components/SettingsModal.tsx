import React, { useRef, useState } from 'react';
import { TypistSettings } from '../types';
import { soundManager } from '../services/sound';
import { storage } from '../services/storage';
import { X, Volume2, Download, Upload, Check, AlertCircle } from 'lucide-react';
import { InstallModal } from './InstallModal';

interface SettingsModalProps {
  settings: TypistSettings;
  onUpdateSettings: (updated: TypistSettings) => void;
  onClose: () => void;
  onDataImported: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onDataImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const handleTestSound = () => {
    soundManager.playLineComplete();
  };

  const handleExport = () => {
    const jsonStr = storage.exportAllDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mandi-typist-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storage.importDataJson(content);
      setImportStatus(res);
      if (res.success) {
        onDataImported();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Billing & Practice Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize typing feedback, typography, and shop preferences
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Form Body */}
        <div className="mt-5 space-y-5 text-sm">
          {/* Case Sensitivity */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Case Sensitivity
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Default off: &apos;thakkali&apos; matches &apos;Thakkali&apos;
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({ ...settings, caseSensitive: !settings.caseSensitive })
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.caseSensitive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.caseSensitive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Malayalam Script Reminder */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Malayalam Script Reminder
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Show Malayalam text (e.g. തക്കാളി) below target lines
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({ ...settings, showMalayalam: !settings.showMalayalam })
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showMalayalam ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.showMalayalam ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Difficulty Level */}
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Difficulty Level
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, difficulty: lvl })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    settings.difficulty === lvl
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {settings.difficulty === 'easy' && 'Easy: Short vegetable names and whole numbers (5, 10, 0.5)'}
              {settings.difficulty === 'medium' && 'Medium: Standard names and 1-2 decimal places (12.5, 50.25)'}
              {settings.difficulty === 'hard' && 'Hard: Long multi-word names and 3 decimal places (3.750, 48.125)'}
            </div>
          </div>

          {/* Bill Length */}
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Bill Mode Length
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([5, 10, 15] as const).map((num) => (
                <button
                  key={`bill-len-${num}`}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, billLength: num })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    settings.billLength === num
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {num} Lines
                </button>
              ))}
            </div>
          </div>

          {/* Timed Challenge Duration */}
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Timed Challenge Duration
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { sec: 300, label: '5 Min' },
                { sec: 600, label: '10 Min' },
                { sec: 900, label: '15 Min' },
              ].map((item) => (
                <button
                  key={`timed-pref-${item.sec}`}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, timedDuration: item.sec })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    settings.timedDuration === item.sec
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Typing Text Size
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, fontSize: size })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    settings.fontSize === size
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Feedback */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Sound Effects
                </div>
                <div className="text-xs text-slate-500">
                  Keyboard ticks, error buzz, and cash register chimes
                </div>
              </div>
              <button
                type="button"
                onClick={handleTestSound}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Chime</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundEnabled ? settings.soundVolume : 0}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  onUpdateSettings({
                    ...settings,
                    soundVolume: vol,
                    soundEnabled: vol > 0,
                  });
                  soundManager.setVolume(vol);
                }}
                className="w-full accent-emerald-600"
              />
              <span className="text-xs font-mono-digits text-slate-500 min-w-[35px]">
                {settings.soundEnabled ? Math.round(settings.soundVolume * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Data Export / Import (Backup) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Data Backup & Sync (JSON)
            </div>
            <div className="text-xs text-slate-500 mb-3">
              Export your custom shop vegetables, billing records, and personal bests.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>

            {importStatus && (
              <div
                className={`mt-2 p-2 rounded-xl text-xs flex items-center gap-2 ${
                  importStatus.success
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                }`}
              >
                {importStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>

          {/* Download to Phone */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Download to Phone
            </div>
            <div className="text-xs text-slate-500 mb-3">
              Install as an offline app on your Android phone or iPhone without the app store.
            </div>
            <button
              type="button"
              onClick={() => setShowInstallGuide(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>View Phone Installation Guide & QR Code</span>
            </button>
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-md min-h-[44px]"
          >
            Apply & Close
          </button>
        </div>
      </div>

      <InstallModal isOpen={showInstallGuide} onClose={() => setShowInstallGuide(false)} />
    </div>
  );
};
