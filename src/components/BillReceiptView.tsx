import React, { useRef, useEffect, useState, useMemo } from 'react';
import { TargetLine, TypistSettings } from '../types';
import { soundManager } from '../services/sound';
import { CheckCircle2, RotateCcw, FastForward, Receipt, CornerDownLeft } from 'lucide-react';

interface BillReceiptViewProps {
  lines: TargetLine[];
  settings: TypistSettings;
  onBillCompleted: (completedLines: TargetLine[], sessionStats: { durationMs: number; totalErrors: number; mistypedChars: Array<{ char: string; count: number }>; wordMistakes: Record<string, number> }) => void;
  onRestart: () => void;
}

export const BillReceiptView: React.FC<BillReceiptViewProps> = ({
  lines,
  settings,
  onBillCompleted,
  onRestart,
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [lineStartTime, setLineStartTime] = useState<number>(Date.now());
  const [billStartTime] = useState<number>(Date.now());
  const [completedLinesData, setCompletedLinesData] = useState<TargetLine[]>([]);
  const [totalErrors, setTotalErrors] = useState<number>(0);
  const [charMistakesMap, setCharMistakesMap] = useState<Record<string, number>>({});
  const [wordMistakesMap, setWordMistakesMap] = useState<Record<string, number>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const currentLine = lines[currentLineIndex];

  // Auto focus input
  useEffect(() => {
    setUserInput('');
    setLineStartTime(Date.now());
    inputRef.current?.focus();
  }, [currentLineIndex]);

  // Click receipt focuses input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const targetText = currentLine ? currentLine.text : '';

  // Character evaluation for active line
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

  // Handle typing in active line
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setTotalErrors((prev) => prev + 1);
          setCharMistakesMap((prev) => ({
            ...prev,
            [targetChar]: (prev[targetChar] || 0) + 1,
          }));
          if (currentLine) {
            setWordMistakesMap((prev) => ({
              ...prev,
              [currentLine.name]: (prev[currentLine.name] || 0) + 1,
            }));
          }
        }
      }
    }

    setUserInput(newVal);

    // Auto advance if completed
    if (newVal.length >= targetText.length) {
      const isMatch = settings.caseSensitive
        ? newVal.trim() === targetText.trim()
        : newVal.trim().toLowerCase() === targetText.trim().toLowerCase();

      if (isMatch) {
        finishLineAndAdvance();
      }
    }
  };

  const finishLineAndAdvance = () => {
    soundManager.playLineComplete();
    const timeSpent = Math.max(100, Date.now() - lineStartTime);

    const updatedLine: TargetLine = {
      ...currentLine,
      isCompleted: true,
      timeSpentMs: timeSpent,
    };

    const newCompleted = [...completedLinesData, updatedLine];
    setCompletedLinesData(newCompleted);

    if (currentLineIndex + 1 < lines.length) {
      setCurrentLineIndex((prev) => prev + 1);
    } else {
      // Bill complete!
      const totalDuration = Date.now() - billStartTime;
      const mistypedList = Object.entries(charMistakesMap).map(([char, count]) => ({ char, count }));
      onBillCompleted(newCompleted, {
        durationMs: totalDuration,
        totalErrors,
        mistypedChars: mistypedList,
        wordMistakes: wordMistakesMap,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const isMatch = settings.caseSensitive
        ? userInput.trim() === targetText.trim()
        : userInput.trim().toLowerCase() === targetText.trim().toLowerCase();

      if (isMatch) {
        finishLineAndAdvance();
      } else {
        soundManager.playError();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      skipCurrentLine();
    }
  };

  const skipCurrentLine = () => {
    const skippedLine: TargetLine = {
      ...currentLine,
      isCompleted: true,
      timeSpentMs: 0,
      errorsCount: 1,
    };
    const newCompleted = [...completedLinesData, skippedLine];
    setCompletedLinesData(newCompleted);

    if (currentLineIndex + 1 < lines.length) {
      setCurrentLineIndex((prev) => prev + 1);
    } else {
      const totalDuration = Date.now() - billStartTime;
      const mistypedList = Object.entries(charMistakesMap).map(([char, count]) => ({ char, count }));
      onBillCompleted(newCompleted, {
        durationMs: totalDuration,
        totalErrors: totalErrors + 1,
        mistypedChars: mistypedList,
        wordMistakes: wordMistakesMap,
      });
    }
  };

  // Calculate bill total weight
  const totalWeightKg = useMemo(() => {
    return lines
      .reduce((sum, item) => {
        const num = parseFloat(item.quantityStr) || 0;
        return sum + num;
      }, 0)
      .toFixed(2);
  }, [lines]);

  const completedWeightKg = useMemo(() => {
    return completedLinesData
      .reduce((sum, item) => {
        const num = parseFloat(item.quantityStr) || 0;
        return sum + num;
      }, 0)
      .toFixed(2);
  }, [completedLinesData]);

  return (
    <div
      onClick={handleContainerClick}
      className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden flex flex-col cursor-text select-none"
    >
      {/* Mandi Receipt Header */}
      <div className="bg-emerald-800 text-white p-4 sm:p-5 text-center relative">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Receipt className="w-5 h-5 text-emerald-300" />
          <h2 className="text-lg font-bold tracking-tight">KERALA VEGETABLE MANDI BILL</h2>
        </div>
        <div className="text-xs text-emerald-200 flex items-center justify-center gap-3">
          <span>Slip #{Math.floor(Date.now() / 1000) % 100000}</span>
          <span aria-hidden="true">·</span>
          <span>Line {currentLineIndex + 1} of {lines.length}</span>
          <span aria-hidden="true">·</span>
          <span>{totalWeightKg} kg Total</span>
        </div>
      </div>

      {/* Bill Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-7 sm:col-span-8">VEGETABLE ITEM</div>
        <div className="col-span-4 sm:col-span-3 text-right">QTY (KG)</div>
      </div>

      {/* Bill Items Scrollable List */}
      <div className="p-3 sm:p-6 space-y-2 max-h-[460px] overflow-y-auto">
        {lines.map((item, index) => {
          const isDone = index < currentLineIndex;
          const isActive = index === currentLineIndex;
          const isPending = index > currentLineIndex;

          if (isDone) {
            const completedRecord = completedLinesData[index];
            const speedSec = completedRecord?.timeSpentMs
              ? (completedRecord.timeSpentMs / 1000).toFixed(1) + 's'
              : '—';

            return (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300 text-sm font-medium border border-emerald-100 dark:border-emerald-900/30"
              >
                <div className="col-span-1 text-center text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 mx-auto" />
                </div>
                <div className="col-span-7 sm:col-span-8 flex items-baseline gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white line-through opacity-70">
                    {item.name}
                  </span>
                  {settings.showMalayalam && (
                    <span className="text-xs font-malayalam text-emerald-800 dark:text-emerald-400 opacity-60">
                      {item.malayalam}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 ml-auto hidden sm:inline">
                    {speedSec}
                  </span>
                </div>
                <div className="col-span-4 sm:col-span-3 text-right font-mono-digits font-bold text-slate-800 dark:text-slate-200">
                  {item.quantityStr}
                </div>
              </div>
            );
          }

          if (isActive) {
            return (
              <div
                key={item.id}
                className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-600 dark:border-emerald-500 shadow-md my-2"
              >
                <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400 font-semibold mb-2">
                  <span>ACTIVE LINE {index + 1} — TYPE NAME & QUANTITY</span>
                  <span className="text-[11px] text-slate-500">Press Enter ↵ to advance</span>
                </div>

                {/* Character preview */}
                <div className="font-mono-digits text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-x-[1px] py-1">
                  {characterAnalysis.map((ch, charIdx) => {
                    if (ch.status === 'correct') {
                      return (
                        <span key={`bill-ch-${charIdx}`} className="text-emerald-600 dark:text-emerald-400 transition-colors">
                          {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                        </span>
                      );
                    }
                    if (ch.status === 'wrong') {
                      return (
                        <span key={`bill-ch-${charIdx}`} className="text-white bg-rose-600 dark:bg-rose-600 px-1 rounded-sm underline decoration-2 decoration-rose-300 font-extrabold shadow-sm">
                          {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                        </span>
                      );
                    }
                    if (ch.status === 'current') {
                      return (
                        <span key={`bill-ch-${charIdx}`} className="text-slate-900 dark:text-white border-b-4 border-yellow-400 dark:border-yellow-300 bg-yellow-100 dark:bg-yellow-400/25 px-1 rounded-xs animate-pulse font-extrabold">
                          {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                        </span>
                      );
                    }
                    return (
                      <span key={`bill-ch-${charIdx}`} className="text-amber-600 dark:text-yellow-300 font-bold transition-colors">
                        {ch.targetChar === ' ' ? '\u00A0' : ch.targetChar}
                      </span>
                    );
                  })}
                </div>

                {/* Malayalam reminder */}
                {settings.showMalayalam && (
                  <div className="text-sm font-malayalam text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                    {item.malayalam}
                  </div>
                )}

                {/* Actual typing input */}
                <div className="mt-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    placeholder={`Type "${item.text}"...`}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-500/50 focus:border-emerald-600 focus:outline-hidden font-mono-digits text-base sm:text-lg font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            );
          }

          // Upcoming lines
          return (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-sm border border-transparent"
            >
              <div className="col-span-1 text-center text-xs font-mono-digits">
                {index + 1}
              </div>
              <div className="col-span-7 sm:col-span-8 flex items-baseline gap-2">
                <span>{item.name}</span>
                {settings.showMalayalam && (
                  <span className="text-xs font-malayalam opacity-60">
                    {item.malayalam}
                  </span>
                )}
              </div>
              <div className="col-span-4 sm:col-span-3 text-right font-mono-digits">
                {item.quantityStr}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Footer & Totals */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Bill</span>
        </button>

        <div className="text-right">
          <div className="text-slate-500 dark:text-slate-400">Total Billed</div>
          <div className="font-mono-digits text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {completedWeightKg} / {totalWeightKg} kg
          </div>
        </div>

        <button
          type="button"
          onClick={skipCurrentLine}
          className="flex items-center gap-1 px-3 py-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors font-medium min-h-[44px]"
        >
          <span>Skip Line</span>
          <FastForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
