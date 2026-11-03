import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

interface NumericKeypadProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress,
  onBackspace,
  onEnter,
}) => {
  const digits = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '.', 'backspace'],
  ];

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-100 dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
        Mandi Terminal Keypad
      </div>
      <div className="grid grid-cols-3 gap-2">
        {digits.map((row, rowIdx) =>
          row.map((btnKey, colIdx) => {
            if (btnKey === 'backspace') {
              return (
                <button
                  key={`numpad-bk-${rowIdx}-${colIdx}`}
                  type="button"
                  onClick={onBackspace}
                  className="flex items-center justify-center h-13 sm:h-14 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-lg active:scale-95 transition-all shadow-xs min-h-[48px]"
                  title="Backspace"
                >
                  <Delete className="w-6 h-6" />
                </button>
              );
            }

            return (
              <button
                key={`numpad-${btnKey}`}
                type="button"
                onClick={() => onKeyPress(btnKey)}
                className={`flex items-center justify-center h-13 sm:h-14 rounded-xl font-mono-digits text-2xl font-bold active:scale-95 transition-all shadow-xs min-h-[48px] ${
                  btnKey === '.'
                    ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200'
                    : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {btnKey}
              </button>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={onEnter}
        className="mt-2.5 w-full flex items-center justify-center gap-2 h-13 sm:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-md active:scale-98 transition-all min-h-[48px]"
      >
        <span>Enter</span>
        <CornerDownLeft className="w-5 h-5" />
      </button>
    </div>
  );
};
