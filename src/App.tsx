/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PracticeMode,
  SessionResult,
  TargetLine,
  TypistSettings,
  UserStats,
  Vegetable,
  Badge,
} from './types';
import { storage } from './services/storage';
import { soundManager } from './services/sound';
import {
  createTargetLine,
  generateBillLines,
  analyzeWeakSpots,
} from './services/generator';

// Components
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LiveMetricsBar } from './components/LiveMetricsBar';
import { TypingArea } from './components/TypingArea';
import { BillReceiptView } from './components/BillReceiptView';
import { VegetablesManager } from './components/VegetablesManager';
import { ProgressDashboard } from './components/ProgressDashboard';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TimedChallengeView } from './components/TimedChallengeView';

import {
  FileText,
  Hash,
  Type,
  AlertCircle,
  Timer,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  // Global State
  const [vegetables, setVegetables] = useState<Vegetable[]>(() => storage.loadVegetables());
  const [settings, setSettings] = useState<TypistSettings>(() => storage.loadSettings());
  const [stats, setStats] = useState<UserStats>(() => storage.loadStats());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'practice' | 'bill' | 'timed' | 'vegetables' | 'progress'>('practice');

  // Practice sub-mode
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('single');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SessionResult | null>(null);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);

  // Practice state
  const [currentLine, setCurrentLine] = useState<TargetLine | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [completedItemsCount, setCompletedItemsCount] = useState<number>(0);
  const [totalCharactersTyped, setTotalCharactersTyped] = useState<number>(0);
  const [totalErrors, setTotalErrors] = useState<number>(0);

  // Bill Mode specific state
  const [billLines, setBillLines] = useState<TargetLine[]>([]);

  // Diagnostic tracking per session
  const [slowestItemsTracker, setSlowestItemsTracker] = useState<Array<{ text: string; timeMs: number }>>([]);
  const [mistypedItemsTracker, setMistypedItemsTracker] = useState<Record<string, number>>({});
  const [mistypedCharsTracker, setMistypedCharsTracker] = useState<Record<string, number>>({});

  // Timed challenge state
  const [timedDuration, setTimedDuration] = useState<number>(settings.timedDuration || 60);
  const [timeLeft, setTimeLeft] = useState<number>(timedDuration);
  const [isTimedActive, setIsTimedActive] = useState<boolean>(false);

  // Sync sound manager settings
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
    soundManager.setVolume(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  // Sync Dark Mode class on document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Compute weak spots list
  const weakSpotsAnalysis = useMemo(() => {
    return analyzeWeakSpots(stats);
  }, [stats]);

  // Initialize a target line
  const spawnNextLine = useCallback(() => {
    const weakList = weakSpotsAnalysis.topMistypedWords.map((w) => w.word);
    const line = createTargetLine(practiceMode, vegetables, settings.difficulty, weakList);
    setCurrentLine(line);
  }, [practiceMode, vegetables, settings.difficulty, weakSpotsAnalysis]);

  // Initialize Bill Mode
  const initBill = useCallback(() => {
    const lines = generateBillLines(vegetables, settings.difficulty, settings.billLength || 10);
    setBillLines(lines);
  }, [vegetables, settings.difficulty, settings.billLength]);

  // Start / Reset Session
  const resetSession = useCallback(() => {
    setSessionStartTime(Date.now());
    setElapsedSeconds(0);
    setCompletedItemsCount(0);
    setTotalCharactersTyped(0);
    setTotalErrors(0);
    setSlowestItemsTracker([]);
    setMistypedItemsTracker({});
    setMistypedCharsTracker({});
    setTimeLeft(timedDuration);
    setIsTimedActive(practiceMode === 'timed');

    if (activeTab === 'bill') {
      initBill();
    } else {
      spawnNextLine();
    }
  }, [activeTab, practiceMode, timedDuration, initBill, spawnNextLine]);

  // Trigger reset whenever tab or sub-mode changes
  useEffect(() => {
    resetSession();
  }, [activeTab, practiceMode, resetSession]);

  // Timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (practiceMode === 'timed' && isTimedActive) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            endTimedSession();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [practiceMode, isTimedActive]);

  // Format Elapsed / Timed string
  const timeFormatted = useMemo(() => {
    const sec = practiceMode === 'timed' ? timeLeft : elapsedSeconds;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, [practiceMode, timeLeft, elapsedSeconds]);

  // Live Metrics calculations
  const liveWpm = useMemo(() => {
    if (elapsedSeconds <= 0) return 0;
    const minutes = elapsedSeconds / 60;
    const words = totalCharactersTyped / 5;
    return Math.round(words / minutes);
  }, [elapsedSeconds, totalCharactersTyped]);

  const liveAccuracy = useMemo(() => {
    if (totalCharactersTyped <= 0) return 100;
    const correct = Math.max(0, totalCharactersTyped - totalErrors);
    return Math.min(100, Math.round((correct / totalCharactersTyped) * 100));
  }, [totalCharactersTyped, totalErrors]);

  const liveItemsPerMinute = useMemo(() => {
    if (elapsedSeconds <= 0) return 0;
    const minutes = elapsedSeconds / 60;
    return Math.round((completedItemsCount / minutes) * 10) / 10;
  }, [elapsedSeconds, completedItemsCount]);

  // Handle line completed in Single/Timed/WeakSpots/Names/Numbers modes
  const handleLineCompleted = (
    line: TargetLine,
    lineStats: {
      timeMs: number;
      errorsCount: number;
      mistypedChars: Array<{ char: string; count: number }>;
    }
  ) => {
    const charsInLine = line.text.length;
    setTotalCharactersTyped((prev) => prev + charsInLine);
    setTotalErrors((prev) => prev + lineStats.errorsCount);
    setCompletedItemsCount((prev) => prev + 1);

    // Track slowest items
    setSlowestItemsTracker((prev) =>
      [...prev, { text: line.name, timeMs: lineStats.timeMs }]
        .sort((a, b) => b.timeMs - a.timeMs)
        .slice(0, 10)
    );

    // Track mistyped items
    if (lineStats.errorsCount > 0) {
      setMistypedItemsTracker((prev) => ({
        ...prev,
        [line.name]: (prev[line.name] || 0) + lineStats.errorsCount,
      }));
    }

    // Track mistyped characters
    setMistypedCharsTracker((prev) => {
      const copy = { ...prev };
      lineStats.mistypedChars.forEach((c) => {
        copy[c.char] = (copy[c.char] || 0) + c.count;
      });
      return copy;
    });

    // Check if session should wrap up (e.g. 15 items in single mode, or continue infinitely)
    if (practiceMode === 'single' && completedItemsCount + 1 >= 15) {
      finalizeSession(15, lineStats.timeMs);
    } else {
      spawnNextLine();
    }
  };

  const handleSkipLine = () => {
    soundManager.playKeyTick();
    setTotalErrors((prev) => prev + 1);
    spawnNextLine();
  };

  // End Timed Session
  const endTimedSession = () => {
    soundManager.playSessionSuccess();
    setIsTimedActive(false);
    finalizeSession(completedItemsCount, 0);
  };

  // Finalize any session
  const finalizeSession = (itemsCount: number, _lastTimeMs: number) => {
    const duration = Math.max(1, elapsedSeconds);
    const minutes = duration / 60;
    const words = totalCharactersTyped / 5;
    const finalWpm = Math.round(words / minutes);
    const correct = Math.max(0, totalCharactersTyped - totalErrors);
    const finalAcc = totalCharactersTyped > 0 ? Math.min(100, Math.round((correct / totalCharactersTyped) * 100)) : 100;
    const ipm = Math.round((itemsCount / minutes) * 10) / 10;

    const slowest = [...slowestItemsTracker].slice(0, 5);
    const mistypedItems = Object.entries(mistypedItemsTracker)
      .map(([text, mistakes]) => ({ text, mistakes }))
      .sort((a, b) => b.mistakes - a.mistakes)
      .slice(0, 5);

    const mistypedChars = Object.entries(mistypedCharsTracker)
      .map(([char, count]) => ({ char, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const result: SessionResult = {
      id: `session_${Date.now()}`,
      timestamp: Date.now(),
      dateStr: new Date().toISOString().split('T')[0],
      mode: activeTab === 'bill' ? 'bill' : practiceMode,
      difficulty: settings.difficulty,
      durationSeconds: duration,
      wpm: finalWpm,
      accuracy: finalAcc,
      totalCharacters: totalCharactersTyped,
      totalMistakes: totalErrors,
      completedItemsCount: itemsCount,
      itemsPerMinute: ipm,
      slowestItems: slowest,
      mostMistypedItems: mistypedItems,
      mistypedCharacters: mistypedChars,
    };

    const { updatedStats, newlyUnlockedBadges: newBadges } = storage.recordSession(result);
    setStats(updatedStats);
    setNewlyUnlockedBadges(newBadges);
    setSummaryResult(result);
  };

  // Bill completed handler
  const handleBillCompleted = (
    completedLines: TargetLine[],
    billStats: {
      durationMs: number;
      totalErrors: number;
      mistypedChars: Array<{ char: string; count: number }>;
      wordMistakes: Record<string, number>;
    }
  ) => {
    soundManager.playSessionSuccess();

    const durationSec = Math.max(1, Math.round(billStats.durationMs / 1000));
    const totalChars = completedLines.reduce((acc, l) => acc + l.text.length, 0);
    const minutes = durationSec / 60;
    const wpm = Math.round((totalChars / 5) / minutes);
    const correct = Math.max(0, totalChars - billStats.totalErrors);
    const acc = Math.min(100, Math.round((correct / totalChars) * 100));
    const ipm = Math.round((completedLines.length / minutes) * 10) / 10;

    const slowest = completedLines
      .filter((l) => (l.timeSpentMs || 0) > 0)
      .map((l) => ({ text: l.name, timeMs: l.timeSpentMs || 0 }))
      .sort((a, b) => b.timeMs - a.timeMs)
      .slice(0, 5);

    const mostMistyped = Object.entries(billStats.wordMistakes)
      .map(([text, mistakes]) => ({ text, mistakes }))
      .sort((a, b) => b.mistakes - a.mistakes)
      .slice(0, 5);

    const result: SessionResult = {
      id: `bill_${Date.now()}`,
      timestamp: Date.now(),
      dateStr: new Date().toISOString().split('T')[0],
      mode: 'bill',
      difficulty: settings.difficulty,
      durationSeconds: durationSec,
      wpm,
      accuracy: acc,
      totalCharacters: totalChars,
      totalMistakes: billStats.totalErrors,
      completedItemsCount: completedLines.length,
      itemsPerMinute: ipm,
      slowestItems: slowest,
      mostMistypedItems: mostMistyped,
      mistypedCharacters: billStats.mistypedChars.slice(0, 8),
    };

    const { updatedStats, newlyUnlockedBadges: newBadges } = storage.recordSession(result);
    setStats(updatedStats);
    setNewlyUnlockedBadges(newBadges);
    setSummaryResult(result);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-24 md:pb-12">
      {/* Universal Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => {
          const next = !settings.soundEnabled;
          const updated = { ...settings, soundEnabled: next };
          setSettings(updated);
          storage.saveSettings(updated);
        }}
        darkMode={settings.darkMode}
        onToggleDarkMode={() => {
          const next = !settings.darkMode;
          const updated = { ...settings, darkMode: next };
          setSettings(updated);
          storage.saveSettings(updated);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        streakDays={stats.streakDays}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center">
        {/* Practice Drills Tab */}
        {activeTab === 'practice' && (
          <div className="w-full max-w-3xl flex flex-col gap-6">
            {/* Mode Selector Strip */}
            <div className="w-full flex items-center justify-start sm:justify-center overflow-x-auto pb-1 gap-1.5 p-1.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl">
              <button
                onClick={() => setPracticeMode('single')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors min-h-[44px] ${
                  practiceMode === 'single'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Single Line</span>
              </button>

              <button
                onClick={() => setPracticeMode('numbers')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors min-h-[44px] ${
                  practiceMode === 'numbers'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                <span>Numbers Only</span>
              </button>

              <button
                onClick={() => setPracticeMode('names')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors min-h-[44px] ${
                  practiceMode === 'names'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5 text-purple-600" />
                <span>Names Only</span>
              </button>

              <button
                onClick={() => setPracticeMode('weak_spots')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors min-h-[44px] ${
                  practiceMode === 'weak_spots'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Weak Spots</span>
              </button>

              <button
                onClick={() => setActiveTab('timed')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors min-h-[44px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Timer className="w-3.5 h-3.5 text-amber-500" />
                <span>Timed Challenge (5, 10, 15m)</span>
              </button>
            </div>

            {/* Weak Spots Context Info Bar */}
            {practiceMode === 'weak_spots' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>
                    Focusing on your most-mistyped vegetables:{' '}
                    <strong>
                      {weakSpotsAnalysis.topMistypedWords.slice(0, 3).map((w) => w.word).join(', ') ||
                        'Urulakizhangu, Cherunarangha, Inji'}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* Timed Mode Duration Control */}
            {practiceMode === 'timed' && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Sprint Duration:
                </span>
                <div className="flex items-center gap-2">
                  {([60, 180, 300] as const).map((sec) => (
                    <button
                      key={`timer-dur-${sec}`}
                      onClick={() => {
                        setTimedDuration(sec);
                        setTimeLeft(sec);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                        timedDuration === sec
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sec / 60} Min
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Metrics Header */}
            <LiveMetricsBar
              wpm={liveWpm}
              accuracy={liveAccuracy}
              mistakes={totalErrors}
              timeFormatted={timeFormatted}
              itemsPerMinute={liveItemsPerMinute}
              itemsCount={completedItemsCount}
              isTimed={practiceMode === 'timed'}
            />

            {/* Core Typing Card */}
            {currentLine ? (
              <TypingArea
                currentLine={currentLine}
                mode={practiceMode}
                settings={settings}
                onLineCompleted={handleLineCompleted}
                onSkipLine={handleSkipLine}
                onRestartSession={resetSession}
                lineIndex={completedItemsCount + 1}
                totalLines={practiceMode === 'single' ? 15 : undefined}
              />
            ) : (
              <div className="w-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={resetSession}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700"
                >
                  Start Practice Drill
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bill Mode Tab */}
        {activeTab === 'bill' && (
          <div className="w-full flex flex-col gap-6 items-center">
            <LiveMetricsBar
              wpm={liveWpm}
              accuracy={liveAccuracy}
              mistakes={totalErrors}
              timeFormatted={timeFormatted}
              itemsPerMinute={liveItemsPerMinute}
              itemsCount={completedItemsCount}
            />

            <BillReceiptView
              lines={billLines}
              settings={settings}
              onBillCompleted={handleBillCompleted}
              onRestart={resetSession}
            />
          </div>
        )}

        {/* Timed Challenge Tab */}
        {activeTab === 'timed' && (
          <TimedChallengeView
            vegetables={vegetables}
            settings={settings}
            onChallengeCompleted={(result) => {
              const { updatedStats, newlyUnlockedBadges: newBadges } = storage.recordSession(result);
              setStats(updatedStats);
              setNewlyUnlockedBadges(newBadges);
              setSummaryResult(result);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Vegetable List Manager Tab */}
        {activeTab === 'vegetables' && (
          <VegetablesManager
            vegetables={vegetables}
            onUpdateVegetables={(updated) => {
              setVegetables(updated);
              storage.saveVegetables(updated);
            }}
            onResetToDefaults={() => {
              if (confirm('Reset vegetable catalog to 63 standard Malayalam mandi items?')) {
                const defs = storage.resetVegetables();
                setVegetables(defs);
              }
            }}
          />
        )}

        {/* Progress & Badges Tab */}
        {activeTab === 'progress' && (
          <ProgressDashboard stats={stats} settings={settings} />
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Session Summary Modal */}
      {summaryResult && (
        <SessionSummaryModal
          result={summaryResult}
          newBadges={newlyUnlockedBadges}
          onPracticeAgain={() => {
            setSummaryResult(null);
            resetSession();
          }}
          onPracticeWeakSpots={() => {
            setSummaryResult(null);
            setActiveTab('practice');
            setPracticeMode('weak_spots');
          }}
          onClose={() => setSummaryResult(null)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(updated) => {
            setSettings(updated);
            storage.saveSettings(updated);
          }}
          onClose={() => setIsSettingsOpen(false)}
          onDataImported={() => {
            setVegetables(storage.loadVegetables());
            setSettings(storage.loadSettings());
            setStats(storage.loadStats());
            resetSession();
          }}
        />
      )}
    </div>
  );
}
