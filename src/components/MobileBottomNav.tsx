import React from 'react';
import { Keyboard, Receipt, Timer, Carrot, Award } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'practice' | 'bill' | 'timed' | 'vegetables' | 'progress';
  setActiveTab: (tab: 'practice' | 'bill' | 'timed' | 'vegetables' | 'progress') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'practice'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Keyboard className="w-5 h-5 mb-1" />
          <span className="text-[10px] leading-tight">Drills</span>
        </button>

        <button
          onClick={() => setActiveTab('bill')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'bill'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-5 h-5 mb-1" />
          <span className="text-[10px] leading-tight">Bill</span>
        </button>

        <button
          onClick={() => setActiveTab('timed')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'timed'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Timer className="w-5 h-5 mb-1 text-amber-500" />
          <span className="text-[10px] leading-tight font-medium">Timed</span>
        </button>

        <button
          onClick={() => setActiveTab('vegetables')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'vegetables'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Carrot className="w-5 h-5 mb-1" />
          <span className="text-[10px] leading-tight">Items</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'progress'
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-5 h-5 mb-1" />
          <span className="text-[10px] leading-tight">Metrics</span>
        </button>
      </div>
    </div>
  );
};
