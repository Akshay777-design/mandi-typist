import React, { useRef, useEffect, useState, useMemo } from 'react';
import { TargetLine, TypistSettings, PracticeMode } from '../types';
import { soundManager } from '../services/sound';
import { FastForward, RotateCcw, Volume2 } from 'lucide-react';
import { NumericKeypad } from './NumericKeypad';

interface TypingAreaProps {
  currentLine: TargetLine;
  mode: PracticeMode;
  settings: TypistSettings;
  onLineCompleted: (line: TargetLine, lineStats: { timeMs: number; errorsCount: number; mistypedChars: Array<{ char: string; count: number }> }) => void;
  onSkipLine: () => void;
  onRestartSession: () => void;
  lineIndex?: number;
  totalLines?: number;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  currentLine,
  mode,
  settings,
  onLineCompleted,
  onSkipLine,
  onRestartSession,
  lineIndex = 1,
  totalLines,
}) => {
  const [userInput, setUserInput] = useState<string>('');
  const [lineStartTime, setLineStartTime] = useState<number>(Date.now());
  const [mistakesThisLine, setMistakesThisLine] = useState<number>(0);
  const [charMistakesMap, setCharMistakesMap] = useState<Record<string, number>>({});

  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on the typing input
  useEffect(() => {
    setUserInput('');
    setLineStartTime(Date.now());
    setMistakesThisLine(0);
    setCharMistakesMap({});
    inputRef.current?.focus();
  }, [currentLine.id]);

  // Click anywhere in card refocuses
  const handleCardClick = () => {
    inputRef.current?.focus();
  };

  const targetText = currentLine.text;

  // Evaluate characters
  const characterAnalysis = useMemo(() => {
    const chars: Array<{
      targetChar: string;
      typedChar?: string;
      status: 'correct' | 'wrong' | 'current' | 'pending';
    }> = [];

    const len = targetText.length;
    for (let i = 0; i < len; i++) {
      const targetChar = targetText[i];
      if (i < userInput.length) {
        const typedChar = userInput[i];
        const isMatch = settings.caseSensitive
          ? targetChar === typedChar
          : targetChar.toLowerCase() === typedChar.toLowerCase();

        chars.push({
          targetChar,
          typedChar,
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

  // Handle key input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const oldVal = userInput;

    // Detect if user typed a character
    if (newVal.length > oldVal.length) {
      const addedChar = newVal[newVal.length - 1];
      const targetChar = targetText[newVal.length - 1];

      // Validate typed character against target
      if (targetChar) {
        const isCorrect = settings.caseSensitive
          ? addedChar === targetChar
          : addedChar.toLowerCase() === targetChar.toLowerCase();

        if (isCorrect) {
          soundManager.playKeyTick();
        } else {
          soundManager.playError();
          setMistakesThisLine((prev) => prev + 1);
          setCharMistakesMap((prev) => ({
            ...prev,
            [targetChar]: (prev[targetChar] || 0) + 1,
          }));
        }
      }
    }

    setUserInput(newVal);

    // Check if line complete
    checkCompletion(newVal);
  };

  const checkCompletion = (input: string) => {
    const isExactLength = input.length >= targetText.length;
    if (isExactLength) {
      const isMatch = settings.caseSensitive
        ? input.trim() === targetText.trim()
        : input.trim().toLowerCase() === targetText.trim().toLowerCase();

      if (isMatch) {
        finishLine();
      }
    }
  };

  const finishLine = () => {
    soundManager.playLineComplete();
    const timeSpent = Math.max(100, Date.now() - lineStartTime);
    const mistypedList = Object.entries(charMistakesMap).map(([char, count]) => ({ char, count }));

    onLineCompleted(currentLine, {
      timeMs: timeSpent,
      errorsCount: mistakesThisLine,
      mistypedChars: mistypedList,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const isMatch = settings.caseSensitive
        ? userInput.trim() === targetText.trim()
        : userInput.trim().toLowerCase() === targetText.trim().toLowerCase();

      if (isMatch) {
        finishLine();
      } else {
        soundManager.playError();
      }
    } else if (e.key === 'Escape' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      onSkipLine();
    }
  };

  // Virtual Keypad actions
  const handleVirtualKey = (char: string) => {
    const updated = userInput + char;
    setUserInput(updated);
    const targetChar = targetText[updated.length - 1];
    if (targetChar) {
      const isCorrect = settings.caseSensitive
        ? char === targetChar
        : char.toLowerCase() === targetChar.toLowerCase();
      if (isCorrect) {
        soundManager.playKeyTick();
      } else {
        soundManager.playError();
        setMistakesThisLine((prev) => prev + 1);
        setCharMistakesMap((prev) => ({
          ...prev,
          [targetChar]: (prev[targetChar] || 0) + 1,
        }));
      }
    }
    checkCompletion(updated);
    inputRef.current?.focus();
  };

  const handleVirtualBackspace = () => {
    setUserInput((prev) => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  const handleVirtualEnter = () => {
    const isMatch = settings.caseSensitive
      ? userInput.trim() === targetText.trim()
      : userInput.trim().toLowerCase() === targetText.trim().toLowerCase();

    if (isMatch) {
      finishLine();
    } else {
      soundManager.playError();
    }
    inputRef.current?.focus();
  };

  // Font size classes
  const targetFontSizeClass =
    settings.fontSize === 'xlarge'
      ? 'text-3xl sm:text-5xl tracking-wide'
      : settings.fontSize === 'large'
      ? 'text-2xl sm:text-4xl tracking-normal'
      : 'text-xl sm:text-3xl';

  const isExactDone =
    userInput.length === targetText.length &&
    (settings.caseSensitive
      ? userInput === targetText
      : userInput.toLowerCase() === targetText.toLowerCase());

  return (
    <div
      onClick={handleCardClick}
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm flex flex-col items-center justify-between min-h-[380px] sm:min-h-[420px] cursor-text relative select-none"
    >
      {/* Top line metadata info */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span>Billing Line</span>
          {totalLines ? (
            <span className="font-semibold text-slate-900 dark:text-white">
              {lineIndex} of {totalLines}
            </span>
          ) : (
            <span className="font-semibold text-slate-900 dark:text-white">
              #{lineIndex}
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span>{settings.difficulty.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-2">
          {mistakesThisLine > 0 && (
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              {mistakesThisLine} error{mistakesThisLine > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-[11px] opacity-70 hidden sm:inline">Press Enter or Space when finished</span>
        </div>
      </div>

      {/* Main Target Display Box */}
      <div className="w-full my-auto py-6 sm:py-8 flex flex-col items-center justify-center text-center">
        {/* Character-by-character live colored display */}
        <div className={`font-mono-digits font-bold flex flex-wrap items-center justify-center gap-x-[1px] sm:gap-x-1 ${targetFontSizeClass}`}>
          {characterAnalysis.map((ch, idx) => {
            if (ch.status === 'correct') {
              return (
                <span
                  key={`char-${idx}`}
                  className="text-emerald-700 dark:text-emerald-400 transition-colors"
                >
                  {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                </span>
              );
            }
            if (ch.status === 'wrong') {
              return (
                <span
                  key={`char-${idx}`}
                  className="text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/70 px-0.5 rounded-xs underline decoration-2 decoration-rose-500"
                >
                  {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                </span>
              );
            }
            if (ch.status === 'current') {
              return (
                <span
                  key={`char-${idx}`}
                  className="text-slate-900 dark:text-white border-b-3 border-emerald-600 dark:border-emerald-400 animate-pulse bg-emerald-50 dark:bg-emerald-950/40 px-0.5 rounded-xs"
                >
                  {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                </span>
              );
            }
            return (
              <span
                key={`char-${idx}`}
                className="text-slate-300 dark:text-slate-600"
              >
                {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
              </span>
            );
          })}
        </div>

        {/* Malayalam Script Reminder (Toggleable) */}
        {settings.showMalayalam && currentLine.malayalam && (
          <div className="mt-3 sm:mt-4 text-emerald-800/80 dark:text-emerald-300/80 font-malayalam text-lg sm:text-2xl font-medium tracking-wide">
            {currentLine.malayalam}
          </div>
        )}

        {/* Real hidden/visible input box */}
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
            placeholder="Type here and press Enter..."
            className="w-full text-center px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border-2 border-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-400 focus:outline-hidden text-slate-900 dark:text-white font-mono-digits text-lg sm:text-xl font-semibold shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Visual cue if finished */}
        {isExactDone && (
          <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-bounce">
            Press Enter ↵ to advance!
          </div>
        )}
      </div>

      {/* Numeric Keypad if Numbers Mode and Enabled */}
      {mode === 'numbers' && settings.showKeypadInNumbersMode && (
        <div className="w-full my-4">
          <NumericKeypad
            onKeyPress={handleVirtualKey}
            onBackspace={handleVirtualBackspace}
            onEnter={handleVirtualEnter}
          />
        </div>
      )}

      {/* Bottom control row: Skip, Restart, Instructions */}
      <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={onRestartSession}
          className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart</span>
        </button>

        <div className="text-slate-400 dark:text-slate-500 text-center hidden sm:block">
          {settings.caseSensitive ? 'Case Sensitive: ON' : 'Case Sensitive: OFF'}
        </div>

        <button
          type="button"
          onClick={onSkipLine}
          className="flex items-center gap-1.5 px-4 py-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold rounded-xl transition-colors min-h-[44px]"
        >
          <span>Skip Line</span>
          <FastForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
