import React from 'react';
import { ALL_BADGES } from '../services/storage';
import { UserStats, TypistSettings } from '../types';
import { Flame, Trophy, TrendingUp, Target, Award, Clock } from 'lucide-react';

interface ProgressDashboardProps {
  stats: UserStats;
  settings: TypistSettings;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  stats,
  settings,
}) => {
  const goalMinutes = settings.dailyGoalMinutes || 10;
  const todayMinutes = Math.floor(stats.todayPracticeSeconds / 60);
  const goalProgressPct = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  // Compute session trend lines (last 14 sessions or grouped by day)
  const history = stats.history || [];
  const chartSessions = [...history].reverse().slice(-14);

  // SVG Chart Dimensions
  const chartWidth = 560;
  const chartHeight = 180;
  const paddingX = 35;
  const paddingY = 25;

  const maxWpm = Math.max(60, ...chartSessions.map((s) => s.wpm));
  const points = chartSessions.map((session, index) => {
    const x =
      chartSessions.length === 1
        ? chartWidth / 2
        : paddingX + (index / (chartSessions.length - 1)) * (chartWidth - paddingX * 2);
    // WPM mapping (0 to maxWpm)
    const yWpm = chartHeight - paddingY - (session.wpm / maxWpm) * (chartHeight - paddingY * 2);
    // Accuracy mapping (50% to 100%)
    const accClamped = Math.max(50, Math.min(100, session.accuracy));
    const yAcc =
      chartHeight - paddingY - ((accClamped - 50) / 50) * (chartHeight - paddingY * 2);

    return { x, yWpm, yAcc, session };
  });

  const wpmPolyline = points.map((p) => `${p.x},${p.yWpm}`).join(' ');
  const accPolyline = points.map((p) => `${p.x},${p.yAcc}`).join(' ');

  const unlockedSet = new Set(stats.unlockedBadgeIds || []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner: Streak & Daily Goal Ring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Streak Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Billing Habit Streak
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono-digits text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {stats.streakDays}
              </span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Days
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Keep typing daily to build wholesale muscle memory!
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shrink-0">
            <Flame className="w-8 h-8 fill-amber-500 text-amber-600" />
          </div>
        </div>

        {/* Daily Practice Goal Progress */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Today&apos;s Goal ({goalMinutes} min)
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono-digits text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {todayMinutes}
              </span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                / {goalMinutes} min
              </span>
            </div>
            <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${goalProgressPct}%` }}
              />
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        {/* All-Time Peak Speed */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Personal Best Speed
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono-digits text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {stats.personalBests.overallWpm || 0}
              </span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                WPM
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Top Accuracy: {stats.personalBests.highestAccuracy || 0}%
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Progress Chart (WPM and Accuracy Trends) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Speed & Accuracy Progression</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tracking your typing evolution across recent practice runs
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-slate-700 dark:text-slate-300">WPM Speed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-700 dark:text-slate-300">Accuracy %</span>
            </div>
          </div>
        </div>

        {chartSessions.length > 1 ? (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
                {/* Horizontal reference grid lines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={chartWidth - paddingX}
                  y2={paddingY}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight / 2}
                  x2={chartWidth - paddingX}
                  y2={chartHeight / 2}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight - paddingY}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                />

                {/* Accuracy line (Blue) */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={accPolyline}
                  opacity="0.85"
                />

                {/* WPM line (Emerald) */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={wpmPolyline}
                />

                {/* Data points */}
                {points.map((p, idx) => (
                  <g key={`pt-${idx}`}>
                    <circle cx={p.x} cy={p.yWpm} r="4.5" className="fill-emerald-600 stroke-white dark:stroke-slate-900 stroke-2" />
                    <circle cx={p.x} cy={p.yAcc} r="3.5" className="fill-blue-500 stroke-white dark:stroke-slate-900 stroke-2" />
                  </g>
                ))}
              </svg>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono-digits px-8 pt-1">
                <span>Run #1</span>
                <span>Run #{chartSessions.length} (Latest)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            Complete at least 2 sessions to render your progress graph!
          </div>
        )}
      </div>

      {/* Personal Best Badges Showcase */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Mandi Typist Badges</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Milestones earned through mandi speed, precision, and dedication
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl flex flex-col items-center text-center transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl mb-1.5">{badge.icon}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {badge.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {badge.description}
                </div>
                {isUnlocked ? (
                  <span className="mt-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    UNLOCKED ✓
                  </span>
                ) : (
                  <span className="mt-2 text-[10px] font-medium text-slate-400">
                    LOCKED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
