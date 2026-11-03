import React from 'react';
import { Settings, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'practice' | 'bill' | 'timed' | 'vegetables' | 'progress';
  setActiveTab: (tab: 'practice' | 'bill' | 'timed' | 'vegetables' | 'progress') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  streakDays: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  onToggleSound,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  streakDays,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('practice')}
            className="flex items-center gap-2 text-left group focus:outline-hidden"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-base shadow-xs group-hover:bg-emerald-800 transition-colors">
              M
            </span>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                Mandi Typist
              </span>
            </div>
          </button>

          {/* Daily Streak unboxed label */}
          {streakDays > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 pl-2 border-l border-slate-200 dark:border-slate-800" title={`${streakDays} Day Practice Streak`}>
              <span>🔥</span>
              <span>{streakDays}d streak</span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('practice')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'practice'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Practice Drills
          </button>
          <button
            onClick={() => setActiveTab('bill')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'bill'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bill Mode
          </button>
          <button
            onClick={() => setActiveTab('timed')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'timed'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Timed Challenge
          </button>
          <button
            onClick={() => setActiveTab('vegetables')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'vegetables'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vegetables List
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'progress'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Metrics & Badges
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          <button
            onClick={onToggleSound}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-5 h-5 opacity-60" />}
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Settings & Shop Spelling Preferences"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
