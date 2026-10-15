import React from 'react';
import { Gauge, Target, AlertCircle, Clock, Hash } from 'lucide-react';

interface LiveMetricsBarProps {
  wpm: number;
  accuracy: number;
  mistakes: number;
  timeFormatted: string;
  itemsPerMinute: number;
  itemsCount: number;
  isTimed?: boolean;
}

export const LiveMetricsBar: React.FC<LiveMetricsBarProps> = ({
  wpm,
  accuracy,
  mistakes,
  timeFormatted,
  itemsPerMinute,
  itemsCount,
  isTimed = false,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center">
        {/* Speed: WPM */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Gauge className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Speed</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono-digits text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {wpm}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">WPM</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Accuracy</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`font-mono-digits text-xl sm:text-2xl font-bold ${
                accuracy >= 95
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : accuracy >= 85
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {accuracy}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">%</span>
          </div>
        </div>

        {/* Mistakes */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Mistakes</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`font-mono-digits text-xl sm:text-2xl font-bold ${
                mistakes > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {mistakes}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">err</span>
          </div>
        </div>

        {/* Time Elapsed / Left */}
        <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isTimed ? 'Timer' : 'Elapsed'}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono-digits text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {timeFormatted}
            </span>
          </div>
        </div>

        {/* Items Billed & Items/Min */}
        <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Hash className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Billed</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono-digits text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {itemsCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">({itemsPerMinute}/m)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
