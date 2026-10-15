import React, { useRef, useEffect, useState, useMemo } from 'react';
import { TargetLine, TypistSettings, Vegetable, SessionResult } from '../types';
import { soundManager } from '../services/sound';
import { createTargetLine } from '../services/generator';
import {
  Timer,
  Play,
  RotateCcw,
  FastForward,
  Award,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TimedChallengeViewProps {
  vegetables: Vegetable[];
  settings: TypistSettings;
  onChallengeCompleted: (result: SessionResult) => void;
  onOpenSettings: () => void;
}

export const TimedChallengeView: React.FC<TimedChallengeViewProps> = ({
  vegetables,
  settings,
  onChallengeCompleted,
  onOpenSettings,
}) => {
  // Duration choices: 5 min (300s), 10 min (600s), 15 min (900s)
  const [selectedDuration, setSelectedDuration] = useState<number>(300); // 5 min default

  // Challenge states: 'idle' | 'running' | 'paused'
  const [challengeState, setChallengeState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(300);

  // Typing state for active line
  const [currentLine, setCurrentLine] = useState<TargetLine | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [lineStartTime, setLineStartTime] = useState<number>(Date.now());
  const [mistakesThisLine, setMistakesThisLine] = useState<number>(0);
  const [charMistakesMap, setCharMistakesMap] = useState<Record<string, number>>({});

  // Session accumulators
  const [completedItemsCount, setCompletedItemsCount] = useState<number>(0);
  const [totalCharactersTyped, setTotalCharactersTyped] = useState<number>(0);
  const [totalErrors, setTotalErrors] = useState<number>(0);
  const [slowestItemsTracker, setSlowestItemsTracker] = useState<Array<{ text: string; timeMs: number }>>([]);
  const [mistypedItemsTracker, setMistypedItemsTracker] = useState<Record<string, number>>({});
  const [allCharMistakesTracker, setAllCharMistakesTracker] = useState<Record<string, number>>({});

  const inputRef = useRef<HTMLInputElement>(null);

  // Spawn next line
  const spawnLine = () => {
    const line = createTargetLine('timed', vegetables, settings.difficulty);
    setCurrentLine(line);
    setUserInput('');
    setLineStartTime(Date.now());
    setMistakesThisLine(0);
    setCharMistakesMap({});
  };

  // Start Challenge
  const handleStartChallenge = (durationSec: number = selectedDuration) => {
    setSelectedDuration(durationSec);
    setTimeLeft(durationSec);
    setCompletedItemsCount(0);
    setTotalCharactersTyped(0);
    setTotalErrors(0);
    setSlowestItemsTracker([]);
    setMistypedItemsTracker({});
    setAllCharMistakesTracker({});
    setChallengeState('running');
    spawnLine();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Timer loop
  useEffect(() => {
    if (challengeState !== 'running') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [challengeState]);

  // Finish challenge when timer hits 0 or manual finish
  const finishChallenge = () => {
    setChallengeState('idle');
    soundManager.playSessionSuccess();

    const elapsed = Math.max(1, selectedDuration - timeLeft);
    const minutes = elapsed / 60;
    const words = totalCharactersTyped / 5;
    const finalWpm = Math.round(words / minutes);
    const correct = Math.max(0, totalCharactersTyped - totalErrors);
    const finalAcc = totalCharactersTyped > 0 ? Math.min(100, Math.round((correct / totalCharactersTyped) * 100)) : 100;
    const ipm = Math.round((completedItemsCount / minutes) * 10) / 10;

    const slowest = [...slowestItemsTracker].slice(0, 5);
    const mistypedItems = Object.entries(mistypedItemsTracker)
      .map(([text, mistakes]) => ({ text, mistakes }))
      .sort((a, b) => b.mistakes - a.mistakes)
      .slice(0, 5);

    const mistypedChars = Object.entries(allCharMistakesTracker)
      .map(([char, count]) => ({ char, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const result: SessionResult = {
      id: `timed_${Date.now()}`,
      timestamp: Date.now(),
      dateStr: new Date().toISOString().split('T')[0],
      mode: 'timed',
      difficulty: settings.difficulty,
      durationSeconds: elapsed,
      wpm: finalWpm,
      accuracy: finalAcc,
      totalCharacters: totalCharactersTyped,
      totalMistakes: totalErrors,
      completedItemsCount,
      itemsPerMinute: ipm,
      slowestItems: slowest,
      mostMistypedItems: mistypedItems,
      mistypedCharacters: mistypedChars,
    };

    onChallengeCompleted(result);
  };

  // Re-focus input whenever card clicked or line changes
  useEffect(() => {
    if (challengeState === 'running') {
      inputRef.current?.focus();
    }
  }, [currentLine?.id, challengeState]);

  // Format time countdown string: MM:SS
  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Live calculations
  const elapsed = selectedDuration - timeLeft;
  const currentLiveWpm = useMemo(() => {
    if (elapsed <= 0) return 0;
    const minutes = elapsed / 60;
    const words = totalCharactersTyped / 5;
    return Math.round(words / minutes);
  }, [elapsed, totalCharactersTyped]);

  const currentLiveAccuracy = useMemo(() => {
    if (totalCharactersTyped <= 0) return 100;
    const correct = Math.max(0, totalCharactersTyped - totalErrors);
    return Math.min(100, Math.round((correct / totalCharactersTyped) * 100));
  }, [totalCharactersTyped, totalErrors]);

  const targetText = currentLine?.text || '';

  // Character evaluation
  const characterAnalysis = useMemo(() => {
    if (!targetText) return [];
    const chars: Array<{
      targetChar: string;
      status: 'correct' | 'wrong' | 'current' | 'pending';
    }> = [];

    for (let i = 0; i < targetText.length; i++) {
      const targetChar = targetText[i];
      if (i < userInput.length) {
        const typedChar = userInput[i];
        const isMatch = settings.caseSensitive
          ? targetChar === typedChar
          : targetChar.toLowerCase() === typedChar.toLowerCase();

        chars.push({
          targetChar,
          status: isMatch ? 'correct' : 'wrong',
        });
      } else if (i === userInput.length) {
        chars.push({
          targetChar,
          status: 'current',
        });
      } else {
        chars.push({
          targetChar,
          status: 'pending',
        });
      }
    }
    return chars;
  }, [targetText, userInput, settings.caseSensitive]);

  // Handle typing in current line
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (challengeState !== 'running') return;

    const newVal = e.target.value;
    const oldVal = userInput;

    if (newVal.length > oldVal.length) {
      const addedChar = newVal[newVal.length - 1];
      const targetChar = targetText[newVal.length - 1];

      if (targetChar) {
        const isCorrect = settings.caseSensitive
          ? addedChar === targetChar
          : addedChar.toLowerCase() === targetChar.toLowerCase();

        if (isCorrect) {
          soundManager.playKeyTick();
        } else {
          soundManager.playError();
          setMistakesThisLine((prev) => prev + 1);
          setTotalErrors((prev) => prev + 1);
          setCharMistakesMap((prev) => ({
            ...prev,
            [targetChar]: (prev[targetChar] || 0) + 1,
          }));
          setAllCharMistakesTracker((prev) => ({
            ...prev,
            [targetChar]: (prev[targetChar] || 0) + 1,
          }));
          if (currentLine) {
            setMistypedItemsTracker((prev) => ({
              ...prev,
              [currentLine.name]: (prev[currentLine.name] || 0) + 1,
            }));
          }
        }
      }
    }

    setUserInput(newVal);

    // Auto complete if matched
    if (newVal.length >= targetText.length) {
      const isMatch = settings.caseSensitive
        ? newVal.trim() === targetText.trim()
        : newVal.trim().toLowerCase() === targetText.trim().toLowerCase();

      if (isMatch) {
        finishActiveLine();
      }
    }
  };

  const finishActiveLine = () => {
    if (!currentLine) return;
    soundManager.playLineComplete();
    const timeSpent = Math.max(100, Date.now() - lineStartTime);

    setTotalCharactersTyped((prev) => prev + currentLine.text.length);
    setCompletedItemsCount((prev) => prev + 1);

    setSlowestItemsTracker((prev) =>
      [...prev, { text: currentLine.name, timeMs: timeSpent }]
        .sort((a, b) => b.timeMs - a.timeMs)
        .slice(0, 10)
    );

    // Spawn next line immediately
    spawnLine();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const isMatch = settings.caseSensitive
        ? userInput.trim() === targetText.trim()
        : userInput.trim().toLowerCase() === targetText.trim().toLowerCase();

      if (isMatch) {
        finishActiveLine();
      } else {
        soundManager.playError();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleSkipLine();
    }
  };

  const handleSkipLine = () => {
    soundManager.playKeyTick();
    setTotalErrors((prev) => prev + 1);
    spawnLine();
  };

  // Time remaining percentage for progress bar
  const progressPct = Math.max(0, Math.min(100, ((selectedDuration - timeLeft) / selectedDuration) * 100));

  // Determine timer color: green -> amber -> red pulsing
  const timerColorClass =
    timeLeft <= 30
      ? 'text-rose-600 dark:text-rose-400 animate-pulse'
      : timeLeft <= 120
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-emerald-700 dark:text-emerald-400';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Card: Timed Challenge Setup or Active Timer Header */}
      {challengeState === 'idle' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Timer className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Timed Billing Challenge
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1.5">
            Test your mandi speed and billing endurance! Type as many vegetable names and decimal quantities as possible before the clock expires.
          </p>

          {/* Duration Selector: 5, 10, or 15 Minutes */}
          <div className="mt-6 mb-8">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              SELECT CHALLENGE DURATION
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {[
                { sec: 300, label: '5 Minutes', sub: 'Sprint' },
                { sec: 600, label: '10 Minutes', sub: 'Standard' },
                { sec: 900, label: '15 Minutes', sub: 'Endurance' },
              ].map((item) => (
                <button
                  key={`duration-${item.sec}`}
                  type="button"
                  onClick={() => setSelectedDuration(item.sec)}
                  className={`p-3.5 rounded-2xl border text-center transition-all min-h-[64px] flex flex-col items-center justify-center ${
                    selectedDuration === item.sec
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm sm:text-base">{item.label}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Big Start Button */}
          <button
            type="button"
            onClick={() => handleStartChallenge(selectedDuration)}
            className="w-full max-w-md py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 mx-auto min-h-[48px]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start {selectedDuration / 60}-Minute Challenge</span>
          </button>
        </div>
      ) : (
        /* Active Countdown & Live Stats Bar */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            {/* Countdown Clock */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  TIME REMAINING ({selectedDuration / 60} MIN CHALLENGE)
                </div>
                <div className={`font-mono-digits text-3xl sm:text-4xl font-extrabold tracking-tight ${timerColorClass}`}>
                  {formatCountdown(timeLeft)}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setChallengeState(challengeState === 'running' ? 'paused' : 'running')}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors min-h-[44px]"
              >
                {challengeState === 'running' ? 'Pause' : 'Resume'}
              </button>
              <button
                type="button"
                onClick={finishChallenge}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors min-h-[44px]"
              >
                Finish Now
              </button>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 30 ? 'bg-rose-500' : timeLeft <= 120 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Live Challenge Stats Strip */}
          <div className="grid grid-cols-4 gap-2 text-center pt-1">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="text-[10px] text-slate-500">Speed</div>
              <div className="font-mono-digits text-xl font-bold text-slate-900 dark:text-white">
                {currentLiveWpm} <span className="text-[10px] font-normal text-slate-400">WPM</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="text-[10px] text-slate-500">Accuracy</div>
              <div className="font-mono-digits text-xl font-bold text-slate-900 dark:text-white">
                {currentLiveAccuracy}%
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="text-[10px] text-slate-500">Items Billed</div>
              <div className="font-mono-digits text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {completedItemsCount}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="text-[10px] text-slate-500">Mistakes</div>
              <div className="font-mono-digits text-xl font-bold text-rose-600 dark:text-rose-400">
                {totalErrors}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Challenge Typing Area (when running or paused) */}
      {challengeState !== 'idle' && currentLine && (
        <div
          onClick={() => inputRef.current?.focus()}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-between min-h-[360px] cursor-text select-none relative"
        >
          {/* Pause overlay if paused */}
          {challengeState === 'paused' && (
            <div className="absolute inset-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center">
              <div className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Challenge Paused
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Timer is currently stopped. Click resume to continue typing!
              </p>
              <button
                type="button"
                onClick={() => setChallengeState('running')}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md"
              >
                Resume Challenge
              </button>
            </div>
          )}

          {/* Active Target Banner */}
          <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                Item #{completedItemsCount + 1}
              </span>
              <span aria-hidden="true">·</span>
              <span>{settings.difficulty.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span>Press Enter ↵ to advance</span>
            </div>
          </div>

          {/* Target Display with Character Highlighting */}
          <div className="w-full my-auto py-8 text-center flex flex-col items-center justify-center">
            <div className="font-mono-digits font-bold flex flex-wrap items-center justify-center gap-x-[1px] sm:gap-x-1 text-2xl sm:text-4xl">
              {characterAnalysis.map((ch, idx) => {
                if (ch.status === 'correct') {
                  return (
                    <span key={`timed-ch-${idx}`} className="text-emerald-700 dark:text-emerald-400">
                      {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                    </span>
                  );
                }
                if (ch.status === 'wrong') {
                  return (
                    <span
                      key={`timed-ch-${idx}`}
                      className="text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-0.5 rounded-xs underline decoration-2 decoration-rose-500"
                    >
                      {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                    </span>
                  );
                }
                if (ch.status === 'current') {
                  return (
                    <span
                      key={`timed-ch-${idx}`}
                      className="text-slate-900 dark:text-white border-b-3 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-0.5 animate-pulse"
                    >
                      {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                    </span>
                  );
                }
                return (
                  <span key={`timed-ch-${idx}`} className="text-slate-300 dark:text-slate-600">
                    {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                  </span>
                );
              })}
            </div>

            {/* Malayalam script reminder */}
            {settings.showMalayalam && currentLine.malayalam && (
              <div className="mt-3 font-malayalam text-lg sm:text-2xl text-emerald-800/80 dark:text-emerald-300/80 font-medium">
                {currentLine.malayalam}
              </div>
            )}

            {/* Input field */}
            <div className="mt-6 w-full max-w-md">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="Type and press Enter..."
                className="w-full text-center px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border-2 border-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-400 focus:outline-hidden text-slate-900 dark:text-white font-mono-digits text-lg sm:text-xl font-semibold shadow-inner placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Skip Line footer */}
          <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {settings.caseSensitive ? 'Case Sensitive: ON' : 'Case Sensitive: OFF'}
            </span>

            <button
              type="button"
              onClick={handleSkipLine}
              className="flex items-center gap-1.5 px-4 py-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold rounded-xl transition-colors min-h-[44px]"
            >
              <span>Skip Item</span>
              <FastForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
