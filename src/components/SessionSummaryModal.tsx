import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Badge, SessionResult } from '../types';
import { Award, Zap, Target, Clock, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

interface SessionSummaryModalProps {
  result: SessionResult;
  newBadges: Badge[];
  onPracticeAgain: () => void;
  onPracticeWeakSpots: () => void;
  onClose: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  result,
  newBadges,
  onPracticeAgain,
  onPracticeWeakSpots,
  onClose,
}) => {
  useEffect(() => {
    // Fire festive confetti if good score or new badges
    if (result.wpm >= 40 || result.accuracy >= 95 || newBadges.length > 0) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
        });
      } catch {
        // Confetti catch
      }
    }
  }, [result, newBadges]);

  // Separate mistyped characters into special mandi chars (., digits) vs letters
  const specialChars = result.mistypedCharacters.filter((c) =>
    ['.', ',', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(c.char)
  );
  const letterChars = result.mistypedCharacters.filter(
    (c) => !['.', ',', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(c.char)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Header */}
        <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 mb-3">
            {result.mode === 'timed' ? <Clock className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {result.mode === 'timed' ? 'Timed Challenge Complete!' : 'Session Completed!'}
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>
              {result.mode === 'timed'
                ? `${Math.round(result.durationSeconds / 60)} MIN TIMED CHALLENGE`
                : `${result.mode.toUpperCase()} MODE`}
            </span>
            <span aria-hidden="true">·</span>
            <span>{result.difficulty.toUpperCase()}</span>
            <span aria-hidden="true">·</span>
            <span>{result.completedItemsCount} items billed</span>
          </div>
        </div>

        {/* Newly unlocked badges banner */}
        {newBadges.length > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
            <span className="text-2xl">{newBadges[0].icon}</span>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Badge Unlocked: {newBadges[0].title}!
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300">
                {newBadges[0].description}
              </div>
            </div>
          </div>
        )}

        {/* 4 Core KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <div className="text-[11px] text-slate-500 font-medium">Speed</div>
            <div className="font-mono-digits text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {result.wpm}
            </div>
            <div className="text-[10px] text-slate-400">WPM</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <div className="text-[11px] text-slate-500 font-medium">Accuracy</div>
            <div
              className={`font-mono-digits text-2xl font-bold ${
                result.accuracy >= 95
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {result.accuracy}%
            </div>
            <div className="text-[10px] text-slate-400">{result.totalMistakes} errors</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <div className="text-[11px] text-slate-500 font-medium">Time</div>
            <div className="font-mono-digits text-2xl font-bold text-slate-800 dark:text-slate-100">
              {result.durationSeconds}s
            </div>
            <div className="text-[10px] text-slate-400">Duration</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <div className="text-[11px] text-slate-500 font-medium">Rate</div>
            <div className="font-mono-digits text-2xl font-bold text-slate-800 dark:text-slate-100">
              {result.itemsPerMinute}
            </div>
            <div className="text-[10px] text-slate-400">Items / min</div>
          </div>
        </div>

        {/* Diagnostic Analysis Section */}
        <div className="space-y-4 text-xs">
          {/* Slowest Items */}
          {result.slowestItems.length > 0 && (
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Slowest Items</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.slowestItems.slice(0, 4).map((item, idx) => (
                  <div
                    key={`slow-${idx}`}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                  >
                    <span className="font-medium">{item.text}</span>
                    <span className="text-slate-500 font-mono-digits">
                      {(item.timeMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most Mistyped Items */}
          {result.mostMistypedItems.length > 0 && (
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Most-Mistyped Vegetable Names</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.mostMistypedItems.slice(0, 4).map((item, idx) => (
                  <div
                    key={`mistype-${idx}`}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900/40 flex items-center gap-1.5"
                  >
                    <span className="font-medium">{item.text}</span>
                    <span className="font-mono-digits font-bold text-rose-600 dark:text-rose-400">
                      {item.mistakes}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Mistyped Characters (Decimal point & numbers focus) */}
          {(specialChars.length > 0 || letterChars.length > 0) && (
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-blue-500" />
                <span>Mistyped Characters & Keys</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Highlight decimal and digit errors */}
                {specialChars.map((ch, idx) => (
                  <span
                    key={`spec-ch-${idx}`}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-mono-digits font-bold border border-amber-300 dark:border-amber-800"
                  >
                    &apos;{ch.char === '.' ? 'Decimal .' : ch.char}&apos; ({ch.count}x)
                  </span>
                ))}
                {letterChars.slice(0, 5).map((ch, idx) => (
                  <span
                    key={`let-ch-${idx}`}
                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono-digits"
                  >
                    &apos;{ch.char}&apos; ({ch.count}x)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onPracticeWeakSpots}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <span>Practice Weak Spots</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPracticeAgain}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-md min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Next Drill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
